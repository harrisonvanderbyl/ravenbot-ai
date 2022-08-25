import * as jspb from "google-protobuf";

import {
  GenerationServiceClient,
  GenerationServiceService,
} from "../proto/js/raw_grpc_pb";

import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import generation_grpc from "../proto/js/raw_pb";
import grpc from "grpc";

type Message = jspb.Message;

type UnaryCallFun<R extends Message> = (
  callback: (e: any | null, r: R | null) => void
) => any;
const unaryPromise = <R extends jspb.Message>(
  func: UnaryCallFun<R>
): Promise<NonNullable<R>> => {
  return new Promise((resolve, reject) => {
    func.call(undefined, (error, responseMessage) => {
      if (error) return reject(error);
      if (!responseMessage) return reject("Unextected null response");
      return resolve(responseMessage as NonNullable<R>);
    });
  });
};

// const generationClient = new GenerationServiceClient(
//   "https://grpc.stability.ai/",
//   { compose: [] },
//   { transport: NodeHttpTransport() }
// );

// export { unaryPromise, generationClient };

// export const client = (
//         self,
//         host: string = "grpc.stability.ai:443",
//         key: string = "",
//         engine: string = "stable-diffusion-v1",
//         verbose=false,
//         wait_for_ready: boolean = true,
//     )=>{
//         // :param host: Host to connect to.
//         // :param key: Key to use for authentication.
//         // :param engine: Engine to use.
//         // :param verbose: Whether to print debug messages.
//         // :param wait_for_ready: Whether to wait for the server to be ready, or
//         //     to fail immediately.
//         // """
//         self.verbose = verbose
//         self.engine = engine

//         self.grpc_args = {"wait_for_ready": wait_for_ready}

//         // if verbose:
//         //     logger.info(f"Opening channel to {host}")

//         const call_credentials:string[] = []

//         if (host.includes("443")){
//             if(key){
//                 call_credentials.push(
//                     grpc(key))
//                 }
//             else{
//                 throw new Error("No key provided")
//             }
//             const channel_credentials = grpc.composite_channel_credentials(
//                 grpc.ssl_channel_credentials(), *call_credentials
//             )
//             const channel = grpc.secure_channel(host, channel_credentials)
//         }
//         else{
//             if(key){
//                console.log(
//                     "Not using authentication token due to non-secure transport"
//                 )
//             }
//             const channel = grpc.insecure_channel(host)

//         self.stub = generation_grpc.GenerationServiceStub(channel)
//         return self
//                 }

//                 }
//dashboardClient.getMe(generation["metrics"], {}, console.log);\
