#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { loadConfig } from "./config.js";

async function main() {
  try {
    // Load and validate configuration
    const config = loadConfig();

    // Create MCP server
    const server = createServer(config);

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    console.error("ExisOne MCP Server started successfully");
    console.error(`API URL: ${config.apiUrl}`);
    console.error(`Tenant ID: ${config.tenantId}`);
  } catch (error) {
    console.error("Failed to start ExisOne MCP Server:", error);
    process.exit(1);
  }
}

main();
