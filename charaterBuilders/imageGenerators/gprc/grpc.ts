import * as jspb from "google-protobuf";

import {
  DashboardService,
  DashboardServiceClient,
} from "../proto/dashboard/dashboard_pb_service";

import { GenerationServiceClient } from "../proto/generation/generation_pb_service";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import dashboard from "../proto/dashboard/dashboard_pb";
import generation from "../proto/generation/generation_pb";

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

const dashboardClient = new DashboardServiceClient(
  "https://grpc.stability.ai/",
  { transport: NodeHttpTransport() }
);
const generationClient = new GenerationServiceClient(
  "https://grpc.stability.ai/",
  { transport: NodeHttpTransport() }
);

export { unaryPromise, dashboardClient, generationClient };

//dashboardClient.getMe(generation["metrics"], {}, console.log);
console.log(Object.keys(generation["metrics"]));
console.log(Object.keys(dashboard));
