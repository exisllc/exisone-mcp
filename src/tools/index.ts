import type { ExisOneApiClient } from "../api/client.js";
import { listProductsTool, handleListProducts } from "./list-products.js";
import { listLicensesTool, handleListLicenses } from "./list-licenses.js";
import { generateLicenseTool, handleGenerateLicense } from "./generate-license.js";
import { getLicenseTool, handleGetLicense } from "./get-license.js";

export const toolDefinitions = [
  listProductsTool,
  listLicensesTool,
  generateLicenseTool,
  getLicenseTool,
];

export async function handleToolCall(
  name: string,
  args: Record<string, unknown> | undefined,
  client: ExisOneApiClient
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const safeArgs = args || {};

  switch (name) {
    case "list_products":
      return handleListProducts(safeArgs, client);

    case "list_licenses":
      return handleListLicenses(safeArgs, client);

    case "generate_license":
      return handleGenerateLicense(safeArgs, client);

    case "get_license":
      return handleGetLicense(safeArgs, client);

    default:
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
      };
  }
}
