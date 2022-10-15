
import random
import json
import urllib3
from tqdm import tqdm, trange
from io import BytesIO
import time
import base64
import os
from torchvision import transforms
from tensorflow.python.client import device_lib
import sys
import re

import inspect
import warnings
from typing import List, Optional, Union

import torch
from torch import autocast
from tqdm.auto import tqdm

from diffusers import (
    AutoencoderKL,
    DDIMScheduler,
    DiffusionPipeline,
    PNDMScheduler,
    UNet2DConditionModel,
)

from diffusers import StableDiffusionPipeline
from diffusers.pipelines.stable_diffusion import StableDiffusionSafetyChecker
from transformers import CLIPFeatureExtractor, CLIPTextModel, CLIPTokenizer

from PIL import Image
import numpy as np
import torch


import discord

# DO THESE STEPS TO INSTALL LIBRARIES
# !pip install diffusers==0.3.0
# !pip install transformers scipy ftfy
# !pip install gradio datasets tqdm
# !pip3 install Cython
# !mkdir /root/.huggingface
# !echo -n "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" > /root/.huggingface/token


class StableDiffusionImg2ImgPipeline(DiffusionPipeline):
    def __init__(
        self,
        vae: AutoencoderKL,
        text_encoder: CLIPTextModel,
        tokenizer: CLIPTokenizer,
        unet: UNet2DConditionModel,
        scheduler: Union[DDIMScheduler, PNDMScheduler],
        feature_extractor: CLIPFeatureExtractor,
    ):
        super().__init__()
        scheduler = scheduler.set_format("pt")
        self.register_modules(
            vae=vae,
            text_encoder=text_encoder,
            tokenizer=tokenizer,
            unet=unet,
            scheduler=scheduler,
            feature_extractor=feature_extractor,
        )

    def enable_attention_slicing(self, slice_size: Optional[Union[str, int]] = "auto"):
        r"""
        Enable sliced attention computation.
        When this option is enabled, the attention module will split the input tensor in slices, to compute attention
        in several steps. This is useful to save some memory in exchange for a small speed decrease.
        Args:
            slice_size (`str` or `int`, *optional*, defaults to `"auto"`):
                When `"auto"`, halves the input to the attention heads, so attention will be computed in two steps. If
                a number is provided, uses as many slices as `attention_head_dim // slice_size`. In this case,
                `attention_head_dim` must be a multiple of `slice_size`.
        """
        if slice_size == "auto":
            # half the attention head size is usually a good trade-off between
            # speed and memory
            slice_size = self.unet.config.attention_head_dim // 2
        self.unet.set_attention_slice(slice_size)

    def disable_attention_slicing(self):
        r"""
        Disable sliced attention computation. If `enable_attention_slicing` was previously invoked, this method will go
        back to computing attention in one step.
        """
        # set slice_size = `None` to disable `attention slicing`
        self.enable_attention_slicing(None)

    @torch.no_grad()
    def __call__(
        self,
        prompt: Union[str, List[str]],
        init_image: Optional[torch.FloatTensor] = None,
        strength: float = 0.8,
        num_inference_steps: Optional[int] = 50,
        guidance_scale: Optional[float] = 7.5,
        eta: Optional[float] = 0.0,
        generator: List[str] = [],
        output_type: Optional[str] = "pil",
        height: Optional[int] = 512,
        width: Optional[int] = 512,
    ):

        if isinstance(prompt, str):
            batch_size = 1
        elif isinstance(prompt, list):
            batch_size = len(prompt)
        else:
            raise ValueError(
                f"`prompt` has to be of type `str` or `list` but is {type(prompt)}")

        if strength < 0 or strength > 1:
            raise ValueError(
                f'The value of strength should in [0.0, 1.0] but is {strength}')

        if height % 8 != 0 or width % 8 != 0:
            raise ValueError(
                f"`height` and `width` have to be divisible by 8 but are {height} and {width}.")
        # get prompt text embeddings
        text_input = self.tokenizer(
            prompt,
            padding="max_length",
            max_length=self.tokenizer.model_max_length,
            truncation=True,
            return_tensors="pt",
        )
        text_embeddings = self.text_encoder(
            text_input.input_ids.to(self.device))[0]

        # set timesteps
        accepts_offset = "offset" in set(inspect.signature(
            self.scheduler.set_timesteps).parameters.keys())
        extra_set_kwargs = {}
        offset = 0
        if accepts_offset:
            offset = 1
            extra_set_kwargs["offset"] = 1

        if (init_image is not None):
            self.scheduler.set_timesteps(
                num_inference_steps, **extra_set_kwargs)
            # encode the init image into latents and scale the latents
            init_latents = self.vae.encode(
                init_image.to(self.device)).latent_dist.sample()
            init_latents = 0.18215 * init_latents

            # prepare init_latents noise to latents
            init_latents = torch.cat([init_latents] * batch_size)

            # get the original timestep using init_timestep
            init_timestep = int(num_inference_steps * strength) + offset
            init_timestep = min(init_timestep, num_inference_steps)
            timesteps = self.scheduler.timesteps[-init_timestep]
            timesteps = torch.tensor(
                [timesteps] * batch_size, dtype=torch.long, device=self.device)

            # add noise to latents using the timesteps
            noise = torch.randn(init_latents.shape, generator=torch.Generator(
                "cuda").manual_seed(int(generator[0])), device=self.device)
            init_latents = self.scheduler.add_noise(
                init_latents, noise, timesteps)
            latents = init_latents
        else:
            init_timestep = 0
            latents = []
            for seedt in generator:
                gen = torch.Generator("cuda").manual_seed(int(seedt))
                latents = latents + [torch.randn(
                    (1, self.unet.in_channels, height // 8, width // 8),
                    generator=gen,
                    device=self.device)]
            latents = torch.cat(latents, dim=0)
            # set timesteps
            accepts_offset = "offset" in set(inspect.signature(
                self.scheduler.set_timesteps).parameters.keys())
            extra_set_kwargs = {}
            if accepts_offset:
                extra_set_kwargs["offset"] = 1

            self.scheduler.set_timesteps(
                num_inference_steps, **extra_set_kwargs)

        # here `guidance_scale` is defined analog to the guidance weight `w` of equation (2)
        # of the Imagen paper: https://arxiv.org/pdf/2205.11487.pdf . `guidance_scale = 1`
        # corresponds to doing no classifier free guidance.
        do_classifier_free_guidance = guidance_scale > 1.0
        # get unconditional embeddings for classifier free guidance
        if do_classifier_free_guidance:
            max_length = text_input.input_ids.shape[-1]
            uncond_input = self.tokenizer(
                [""] * batch_size, padding="max_length", max_length=max_length, return_tensors="pt"
            )
            uncond_embeddings = self.text_encoder(
                uncond_input.input_ids.to(self.device))[0]

            # For classifier free guidance, we need to do two forward passes.
            # Here we concatenate the unconditional and text embeddings into a single batch
            # to avoid doing two forward passes
            text_embeddings = torch.cat([uncond_embeddings, text_embeddings])

        # prepare extra kwargs for the scheduler step, since not all schedulers have the same signature
        # eta (η) is only used with the DDIMScheduler, it will be ignored for other schedulers.
        # eta corresponds to η in DDIM paper: https://arxiv.org/abs/2010.02502
        # and should be between [0, 1]
        accepts_eta = "eta" in set(inspect.signature(
            self.scheduler.step).parameters.keys())
        extra_step_kwargs = {}
        if accepts_eta:
            extra_step_kwargs["eta"] = eta

        t_start = max(num_inference_steps - init_timestep +
                      offset, 0) if init_image is not None else 0
        for i, t in tqdm(enumerate(self.scheduler.timesteps[t_start:])):
            # expand the latents if we are doing classifier free guidance
            latent_model_input = torch.cat(
                [latents] * 2) if do_classifier_free_guidance else latents

            # predict the noise residual
            noise_pred = self.unet(
                latent_model_input, t, encoder_hidden_states=text_embeddings)["sample"]

            # perform guidance
            if do_classifier_free_guidance:
                noise_pred_uncond, noise_pred_text = noise_pred.chunk(2)
                noise_pred = noise_pred_uncond + guidance_scale * \
                    (noise_pred_text - noise_pred_uncond)

            # compute the previous noisy sample x_t -> x_t-1
            latents = self.scheduler.step(
                noise_pred, t, latents, **extra_step_kwargs)["prev_sample"]

        # scale and decode the image latents with vae
        latents = 1 / 0.18215 * latents
        image = self.vae.decode(latents).sample

        image = (image / 2 + 0.5).clamp(0, 1)
        image = image.cpu().permute(0, 2, 3, 1).numpy()

        if output_type == "pil":
            image = self.numpy_to_pil(image)

        return {"sample": image}


device = "cuda"
model_path = os.environ.get("MODEL_PATH", "CompVis/stable-diffusion-v1-4")

# Using DDIMScheduler as anexample,this also works with PNDMScheduler
# uncomment this line if you want to use it.

# scheduler = PNDMScheduler.from_config(model_path, subfolder="scheduler", use_auth_token=True)

scheduler = DDIMScheduler(beta_start=0.00085, beta_end=0.012,
                          beta_schedule="scaled_linear", clip_sample=False, set_alpha_to_one=False)
if (model_path == "CompVis/stable-diffusion-v1-4"):
    img2imgpipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_path,
        scheduler=scheduler,
        revision="fp16",
        torch_dtype=torch.float16,
        use_auth_token=True
    ).to(device)
else:
    img2imgpipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_path,
        scheduler=scheduler,
        local_files_only=True,
        revision="fp16",
        torch_dtype=torch.float16,
    ).to(device)
pipe = img2imgpipe
pipe.enable_attention_slicing()
# bot.py
version = "1.6"
batch = 4
http = urllib3.PoolManager()
DEFAULT_HEADERS = {'content-type': 'text/plain'}
REQUEST_FAILED = "Request failed"


def my_preprocess(image, mask):
    # find a way to make it work with 512-1024 dimensions, problem arises with the mask tensor
    image = image.resize((512, 512))

    w, h = image.size
    # resize to integer multiple of 32
    w, h = map(lambda x: x - x % 32, (w, h))
    image = image.resize((w, h), resample=PIL.Image.LANCZOS)
    image = np.array(image).astype(np.float32) / 255.0
    image = image[None].transpose(0, 3, 1, 2)
    image = torch.from_numpy(image)
    return 2.0 * image - 1.0


def my_preprocess_mask(mask):
    mask = mask.convert("L")
    mask = mask.resize((64, 64), resample=PIL.Image.LANCZOS)
    mask = np.array(mask).astype(np.float32) / 255.0
    mask = np.tile(mask, (4, 1, 1))
    mask = mask[None].transpose(0, 1, 2, 3)  # what does this step do?
    mask = torch.from_numpy(mask)
    return mask


def load_img_pil(base64text):
    temp = BytesIO()

    temp.write(base64.b64decode(base64text))

    return Image.open(temp, "r").convert("RGB")


def load_img(base64text, h0, w0):
    temp = BytesIO()

    temp.write(base64.b64decode(base64text))

    image = Image.open(temp, "r").convert("RGB")
    w, h = image.size

    if (h0 is not None and w0 is not None):
        h, w = h0, w0

    # resize to integer multiple of 32
    w, h = map(lambda x: x - x % 32, (w0, h0))

    print(f"New image size ({w}, {h})")
    image = image.resize((w, h), resample=Image.LANCZOS)
    image = np.array(image).astype(np.float32) / 255.0
    image = image[None].transpose(0, 3, 1, 2)
    image = torch.from_numpy(image)
    return 2.*image - 1.


def makeHttpRequest(type, url, body=None):
    try:
        if type == "GET":
            return http.request("GET", url)
        elif type == "POST":
            return http.request("POST", url, body=body, headers=DEFAULT_HEADERS)
    except Exception as e:
        return REQUEST_FAILED


def image_grid(imgs, rows, cols):
    assert len(imgs) == rows*cols

    w, h = imgs[0].size
    grid = Image.new('RGB', size=(cols*w, rows*h))
    grid_w, grid_h = grid.size

    for i, img in enumerate(imgs):
        grid.paste(img, box=(i % cols*w, i//cols*h))
    return grid


def image_grid_rec(imgs):
    newimgs = []
    while len(imgs) > 0:
        newimgs = newimgs + [image_grid(imgs[:9], 3, 3)]
        imgs = imgs[9:]
    return image_grid(newimgs, 3, 3)


client = discord.Client(
    intents=discord.Intents.all())


@client.event
async def on_ready():
    print(f'{client.user} has connected to Discord!')


@client.event
async def on_message(message):
    global model_tokens, currstate
    # print(
    #     f"message received({message.guild.name}:{message.channel.name}):", message.content)

    if message.author.bot:
        return

    msg: str = message.content.strip()

    if msg.startswith("+imagine "):
        # extract peramaters following --

        # get width and height
        w = 512
        h = 512

        if "--w" in msg:
            w = int(msg.split("--w")[1].split(" ")[0])
        if "--h" in msg:
            h = int(msg.split("--h")[1].split(" ")[0])

        # get number of images
        n = 1
        if "--n" in msg:
            n = int(msg.split("--n")[1].split(" ")[0])

        # get number of steps
        steps = 50
        if "--steps" in msg:
            steps = int(msg.split("--steps")[1].split(" ")[0])

        # get cfg
        cfg = 7.5
        if "--cfg" in msg:
            cfg = float(msg.split("--cfg")[1].split(" ")[0])

        # get seed
        seed = random.randint(0, 1000000)
        if "--seed" in msg:
            seed = int(msg.split("--seed")[1].split(" ")[0])

        prompt = [msg.split("+imagine ")[1].split("--")[0].strip()]
        with autocast("cuda"):
            img = pipe(prompt, num_inference_steps=min(max(steps, 10), 150), generator=[
                seed], height=h, guidance_scale=cfg, width=w)["sample"][0]

            img.save("./temp.png")
            await message.reply(file=discord.File("./temp.png"))


client.run(os.environ["TOKEN"])
