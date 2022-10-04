/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface GenerationInput {
  /** The prompt which will be sent to Stable Diffusion to generate an image */
  prompt?: string;
  params?: ModelGenerationInputStable;

  /** Set to true if this request is NSFW. This will skip workers which censor images. */
  nsfw?: boolean;

  /** If the request is SFW, and the worker accidentaly generates NSFW, it will send back a censored image. */
  censor_nsfw?: boolean;
  workers?: string[];
}

export type ModelGenerationInputStable = ModelPayloadRootStable & {
  steps?: number;
  n?: number;
};

export interface ModelPayloadRootStable {
  /** @example k_lms */
  sampler_name?:
    | "k_lms"
    | "k_heun"
    | "k_euler"
    | "k_euler_a"
    | "k_dpm_2"
    | "k_dpm_2_a"
    | "DDIM"
    | "PLMS";

  /**
   * Special Toggles used in the SD Webui. To be documented.
   * @example [1,4]
   */
  toggles?: number[];
  realesrgan_model_name?: string;
  ddim_eta?: number;

  /** @example 1 */
  batch_size?: number;

  /** @example 5 */
  cfg_scale?: number;

  /** The seed to use to generete this request */
  seed?: string;

  /**
   * The height of the image to generate
   * @example 512
   */
  height?: number;

  /**
   * The width of the image to generate
   * @example 512
   */
  width?: number;

  /** @example 512 */
  fp?: number;
  variant_amount?: number;
  variant_seed?: number;
}

export interface RequestError {
  /** The error message for this status code. */
  message?: string;
}

export type RequestStatusStable = RequestStatusCheck & {
  generations?: GenerationStable[];
};

export interface RequestStatusCheck {
  /** The amount of finished images in this request */
  finished?: number;

  /** The amount of still processing images in this request */
  processing?: number;

  /** The amount of images waiting to be picked up by a worker */
  waiting?: number;

  /** True when all images in this request are done. Else False. */
  done?: boolean;

  /** The expected amount to wait (in seconds) to generate all images in this request */
  wait_time?: number;

  /** The position in the requests queue. This position is determined by relative Kudos amounts. */
  queue_position?: number;
}

export type GenerationStable = Generation & { img?: string; seed?: string };

export interface Generation {
  /**
   * Worker ID
   * The UUID of the worker which generated this image
   */
  worker_id?: string;

  /**
   * Worker Name
   * The name of the worker which generated this image
   */
  worker_name?: string;
}

export interface RequestAsync {
  /** The UUID of the request. Use this to retrieve the request status in the future */
  id?: string;

  /** Any extra information from the horde about this request */
  message?: string;
}

export interface GenerationPayload {
  payload?: ModelPayloadStable;

  /** The UUID for this image generation */
  id?: string;
  skipped?: NoValidRequestFoundStable;
}

export type ModelPayloadStable = ModelPayloadRootStable & {
  prompt?: string;
  ddim_steps?: number;
  n_iter?: number;
};

export type NoValidRequestFoundStable = NoValidRequestFound & {
  max_pixels?: number;
};

export interface NoValidRequestFound {
  /** How many waiting requests were skipped because they demanded a specific worker */
  worker_id?: number;

  /** How many waiting requests were skipped because they demanded a nsfw generation which this worker does not provide. */
  nsfw?: number;
}

export interface GenerationSubmitted {
  /**
   * The amount of kudos gained for submitting this request
   * @example 10
   */
  reward?: number;
}

export interface UserDetails {
  /** The user's unique Username. It is a combination of their chosen alias plus their ID. */
  username?: string;

  /** The user unique ID. It is always an integer. */
  id?: number;

  /** The amount of Kudos this user has. Can be negative. The amount of Kudos determines the priority when requesting image generations. */
  kudos?: number;
  kudos_details?: UserKudosDetails;
  usage?: UsageDetailsStable;
  contributions?: ContributionsDetailsStable;

  /** How many concurrent image generations this user may request. */
  concurrency?: number;
}

export interface UserKudosDetails {
  /** The ammount of Kudos accumulated or used for generating images. */
  accumulated?: number;

  /** The amount of Kudos this user has given to other users */
  gifted?: number;

  /** The amount of Kudos this user has been given by the Horde admins */
  admin?: number;

  /** The amount of Kudos this user has been given by other users */
  received?: number;
}

export type UsageDetailsStable = UsageDetails & { megapixelsteps?: number };

export interface UsageDetails {
  /** How many images this user has requested */
  requests?: number;
}

export type ContributionsDetailsStable = ContributionsDetails & {
  megapixelsteps?: number;
};

export interface ContributionsDetails {
  /** How many images this user has generated */
  fulfillments?: number;
}

export interface ModifyUser {
  /** The new total Kudos this user has after this request */
  new_kudos?: number;

  /**
   * The request concurrency this user has after this request
   * @example 30
   */
  concurrency?: number;

  /**
   * Multiplies the amount of kudos lost when generating images.
   * @example 1
   */
  usage_multiplier?: number;
}

export type WorkerDetailsStable = WorkerDetails & {
  max_pixels?: number;
  megapixelsteps_generated?: number;
};

export interface WorkerDetails {
  /** The Name given to this worker. */
  name?: string;

  /** The UUID of this worker. */
  id?: string;

  /** How many images this worker has generated. */
  requests_fulfilled?: number;

  /** How many Kudos this worker has been rewarded in total. */
  kudos_rewards?: number;
  kudos_details?: WorkerKudosDetails;

  /** The average performance of this worker in human readable form. */
  performance?: string;

  /** The amount of seconds this worker has been online for this Horde. */
  uptime?: number;

  /**
   * When True, this worker will not pick up any new requests
   * @example false
   */
  maintenance_mode?: boolean;

  /**
   * When True, this worker not be given any new requests.
   * @example false
   */
  paused?: boolean;

  /**
   * Extra information or comments about this worker provided by its owner.
   * @example https://dbzer0.com
   */
  info?: string;

  /**
   * Whether this server can generate NSFW requests or not.
   * @example https://dbzer0.com
   */
  nsfw?: string;
}

export interface WorkerKudosDetails {
  /** How much Kudos this worker has received for generating images */
  generated?: number;

  /** How much Kudos this worker has received for staying online longer */
  uptime?: number;
}

export interface ModifyWorker {
  /** The new state of the 'maintenance' var for this worker. When True, this worker will not pick up any new requests. */
  maintenance?: boolean;

  /** The new state of the 'paused' var for this worker. When True, this worker will not be given any new requests. */
  paused?: boolean;

  /** The new state of the 'info' var for this worker. */
  info?: string;
}

export interface KudosTransferred {
  /**
   * The amount of Kudos tranferred
   * @example 100
   */
  transferred?: number;
}

export type HordePerformanceStable = HordePerformance & {
  queued_requests?: number;
  queued_megapixelsteps?: number;
  past_minute_megapixelsteps?: number;
  worker_count?: number;
};

export interface HordePerformance {
  /** The amount of waiting and processing requests currently in this Horde */
  queued_requests?: number;

  /** How many workers are actively processing image generations in this Horde in the past 5 minutes */
  worker_count?: number;
}

export interface HordeMaintenanceMode {
  /** When True, this Horde will not accept new requests for image generation, but will finish processing the ones currently in the queue. */
  maintenance_mode?: boolean;
}

export interface MaintenanceModeSet {
  /**
   * The current state of maintenance_mode
   * @example true
   */
  maintenance_mode?: boolean;
}

export interface GenerationStableV1 {
  img?: string;
  seed?: string;
  server_id?: string;
  server_name?: string;

  /** The position in the requests queue. This position is determined by relative Kudos amounts. */
  queue_position?: number;
}

export type RequestStatusStableV1 = RequestStatusCheckStableV1 & {
  generations?: GenerationStableV1[];
};

export interface RequestStatusCheckStableV1 {
  finished?: number;
  processing?: number;
  waiting?: number;
  done?: boolean;
  wait_time?: number;

  /** The position in the requests queue. This position is determined by relative Kudos amounts. */
  queue_position?: number;
}

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  baseUrl = "https://stablehorde.net/api/";
  apikey = "0000000000";
  constructor(apikey = "0000000000") {
    this.apikey = apikey;
  }

  public request = async <T = any, _E = any>({
    method,
    path,
    body,
  }: {
    method: AxiosRequestConfig["method"];
    path: string;
    body?: any;
  }): Promise<T> =>
    axios
      .request({
        method,
        data: body,
        url: this.baseUrl + path,
        headers: {
          apikey: this.apikey,
        },
      })
      .then((response) => response.data);
}
/**
 * @title Stable Horde
 * @version 1.0
 * @baseUrl /api
 *
 * The API documentation for the Stable Horde
 */
export class Api<
  SecurityDataType extends unknown
> extends HttpClient<SecurityDataType> {
  v2 = {
    /**
     * @description This endpoint will immediately return with the UUID of the request for generation. This endpoint will always be accepted, even if there are no workers available currently to fulfill this request. Perhaps some will appear in the next 10 minutes. Asynchronous requests live for 10 minutes before being considered stale and being deleted.
     *
     * @tags v2
     * @name PostAsyncGenerate
     * @summary Initiate an Asynchronous request to generate images
     * @request POST:/v2/generate/async
     */
    postAsyncGenerate: (payload: GenerationInput) =>
      this.request<RequestAsync, RequestError>({
        path: `/v2/generate/async`,
        method: "POST",
        body: payload,
      }),

    /**
     * @description Use this request to check the status of a currently running asynchronous request without consuming bandwidth.
     *
     * @tags v2
     * @name GetAsyncCheck
     * @summary Retrieve the status of an Asynchronous generation request without images
     * @request GET:/v2/generate/check/{id}
     */
    getAsyncCheck: (id: string) =>
      this.request<RequestStatusCheck, RequestError>({
        path: `/v2/generate/check/${id}`,
        method: "GET",
      }),

    /**
     * @description This endpoint is used by registered workers only
     *
     * @tags v2
     * @name PostJobPop
     * @summary Check if there are generation requests queued for fulfillment
     * @request POST:/v2/generate/pop
     */
    postJobPop: (payload: {
      name?: string;
      priority_usernames?: any[];
      nsfw?: boolean;
      max_pixels?: number;
    }) =>
      this.request<GenerationPayload, RequestError>({
        path: `/v2/generate/pop`,
        method: "POST",
        body: payload,
      }),

    /**
     * @description This request will include all already generated images in base64 encoded .webp files. As such, you are requested to not retrieve this endpoint often. Instead use the /check/ endpoint first This endpoint is limited to 1 request per minute
     *
     * @tags v2
     * @name GetAsyncStatus
     * @summary Retrieve the full status of an Asynchronous generation request
     * @request GET:/v2/generate/status/{id}
     */
    getAsyncStatus: (id: string) =>
      this.request<RequestStatusStable, RequestError>({
        path: `/v2/generate/status/${id}`,
        method: "GET",
      }),

    /**
     * @description This request will include all already generated images in base64 encoded .webp files.
     *
     * @tags v2
     * @name DeleteAsyncStatus
     * @summary Cancel an unfinished request
     * @request DELETE:/v2/generate/status/{id}
     */
    deleteAsyncStatus: (id: string) =>
      this.request<RequestStatusStable, RequestError>({
        path: `/v2/generate/status/${id}`,
        method: "DELETE",
      }),

    /**
     * @description This endpoint is used by registered workers only
     *
     * @tags v2
     * @name PostJobSubmit
     * @summary Submit a generated image
     * @request POST:/v2/generate/submit
     */
    postJobSubmit: (payload: {
      id?: string;
      generation?: string;
      seed?: string;
    }) =>
      this.request<GenerationSubmitted, RequestError>({
        path: `/v2/generate/submit`,
        method: "POST",
        body: payload,
      }),

    /**
     * @description This connection will only terminate when the images have been generated, or an error occured. If you connection is interrupted, you will not have the request UUID, so you cannot retrieve the images asynchronously.
     *
     * @tags v2
     * @name PostSyncGenerate
     * @summary Initiate a Synchronous request to generate images
     * @request POST:/v2/generate/sync
     */
    postSyncGenerate: (payload: GenerationInput) =>
      this.request<RequestStatusStable, RequestError>({
        path: `/v2/generate/sync`,
        method: "POST",
        body: payload,
      }),

    /**
     * No description
     *
     * @tags v2
     * @name PostTransferKudos
     * @summary Transfer Kudos to another registed user
     * @request POST:/v2/kudos/transfer
     */
    postTransferKudos: (payload: { username?: string; amount?: number }) =>
      this.request<KudosTransferred, RequestError>({
        path: `/v2/kudos/transfer`,
        method: "POST",
        body: payload,
      }),

    /**
     * @description Use this endpoint to quicky determine if this horde is in maintenance.
     *
     * @tags v2
     * @name GetHordeMaintenance
     * @summary Horde Maintenance Mode Status
     * @request GET:/v2/status/maintenance
     */
    getHordeMaintenance: () =>
      this.request<HordeMaintenanceMode, any>({
        path: `/v2/status/maintenance`,
        method: "GET",
      }),

    /**
     * @description Endpoint for admins to (un)set the horde into maintenance. When in maintenance no new requests for generation will be accepted but requests currently in the queue will be completed.
     *
     * @tags v2
     * @name PutHordeMaintenance
     * @summary Change Horde Maintenance Mode
     * @request PUT:/v2/status/maintenance
     */
    putHordeMaintenance: (payload: { active?: boolean }) =>
      this.request<MaintenanceModeSet, RequestError>({
        path: `/v2/status/maintenance`,
        method: "PUT",
        body: payload,
      }),

    /**
     * No description
     *
     * @tags v2
     * @name GetHordeLoad
     * @summary Details about the current performance of this Horde
     * @request GET:/v2/status/performance
     */
    getHordeLoad: () =>
      this.request<HordePerformanceStable, any>({
        path: `/v2/status/performance`,
        method: "GET",
      }),

    /**
     * No description
     *
     * @tags v2
     * @name GetUsers
     * @summary A List with the details and statistic of all registered users
     * @request GET:/v2/users
     */
    getUsers: () =>
      this.request<UserDetails, any>({
        path: `/v2/users`,
        method: "GET",
      }),

    /**
     * No description
     *
     * @tags v2
     * @name GetUserSingle
     * @summary Details and statistics about a specific user
     * @request GET:/v2/users/{user_id}
     */
    getUserSingle: (userId: string) =>
      this.request<UserDetails, RequestError>({
        path: `/v2/users/${userId}`,
        method: "GET",
      }),

    /**
     * No description
     *
     * @tags v2
     * @name PutUserSingle
     * @summary Endpoint for horde admins to perform operations on users
     * @request PUT:/v2/users/{user_id}
     */
    putUserSingle: (
      userId: string,
      payload: {
        kudos?: number;
        concurrency?: number;
        usage_multiplier?: number;
      }
    ) =>
      this.request<ModifyUser, RequestError>({
        path: `/v2/users/${userId}`,
        method: "PUT",
        body: payload,
      }),

    /**
     * No description
     *
     * @tags v2
     * @name GetWorkers
     * @summary A List with the details of all registered and active workers
     * @request GET:/v2/workers
     */
    getWorkers: () =>
      this.request<WorkerDetailsStable[], any>({
        path: `/v2/workers`,
        method: "GET",
      }),

    /**
     * @description Can retrieve the details of a worker even if inactive (A worker is considered inactive if it has not checked in for 5 minutes)
     *
     * @tags v2
     * @name GetWorkerSingle
     * @summary Details of a registered worker
     * @request GET:/v2/workers/{worker_id}
     */
    getWorkerSingle: (workerId: string) =>
      this.request<WorkerDetailsStable, RequestError>({
        path: `/v2/workers/${workerId}`,
        method: "GET",
      }),

    /**
     * @description Maintenance can be set by the owner of the serve or an admin. When in maintenance, the worker will receive a 503 request when trying to retrieve new requests. Use this to avoid disconnecting your worker in the middle of a generation Paused can be set only by the admins of this Horde. When in paused mode, the worker will not be given any requests to generate.
     *
     * @tags v2
     * @name PutWorkerSingle
     * @summary Put the worker into maintenance or pause mode
     * @request PUT:/v2/workers/{worker_id}
     */
    putWorkerSingle: (
      workerId: string,
      payload: { maintenance?: boolean; paused?: boolean; info?: string }
    ) =>
      this.request<ModifyWorker, RequestError>({
        path: `/v2/workers/${workerId}`,
        method: "PUT",
        body: payload,
      }),
  };
}
