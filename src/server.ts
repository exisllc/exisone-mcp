import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions, handleToolCall } from "./tools/index.js";
import { ExisOneApiClient } from "./api/client.js";
import type { Config } from "./config.js";

export function createServer(config: Config): Server {
  const apiClient = new ExisOneApiClient(config);

  const server = new Server(
    {
      name: "exisone-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions,
  }));

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return handleToolCall(name, args as Record<string, unknown> | undefined, apiClient);
  });

  // Error handling
  server.onerror = (error) => {
    console.error("[MCP Error]", error);
  };

  return server;
}
