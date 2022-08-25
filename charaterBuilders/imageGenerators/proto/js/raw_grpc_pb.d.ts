// GENERATED CODE -- DO NOT EDIT!

// package: gooseai
// file: raw.proto

import * as raw_pb from "./raw_pb";
import * as grpc from "grpc";

interface IGenerationServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  generate: grpc.MethodDefinition<raw_pb.Request, raw_pb.Answer>;
}

export const GenerationServiceService: IGenerationServiceService;

export interface IGenerationServiceServer extends grpc.UntypedServiceImplementation {
  generate: grpc.handleServerStreamingCall<raw_pb.Request, raw_pb.Answer>;
}

export class GenerationServiceClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  generate(argument: raw_pb.Request, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<raw_pb.Answer>;
  generate(argument: raw_pb.Request, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<raw_pb.Answer>;
}
