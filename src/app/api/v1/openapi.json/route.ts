import { NextResponse } from "next/server";
import { getApiDiscoveryDocument } from "@/lib/external-api";

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const discovery = getApiDiscoveryDocument(baseUrl);

  const openapi = {
    openapi: "3.0.3",
    info: {
      title: discovery.name,
      version: discovery.version,
      description: discovery.description,
    },
    servers: [{ url: discovery.baseUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/": {
        get: {
          summary: "API discovery",
          security: [],
          responses: { "200": { description: "Discovery document" } },
        },
      },
      "/models": {
        get: {
          summary: "List Ollama models",
          responses: { "200": { description: "Model list" } },
        },
      },
      "/chat": {
        post: {
          summary: "Chat completion",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    messages: { type: "array" },
                    stream: { type: "boolean" },
                    model: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Chat response" } },
        },
      },
      "/generate": {
        post: {
          summary: "Text generation",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    prompt: { type: "string" },
                    stream: { type: "boolean" },
                    model: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Generate response" } },
        },
      },
    },
  };

  return NextResponse.json(openapi);
}
