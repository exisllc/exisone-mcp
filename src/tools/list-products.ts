import type { ExisOneApiClient } from "../api/client.js";

export const listProductsTool = {
  name: "list_products",
  description:
    "List all products for the current tenant. Returns product details including name, price, trial days, and license duration.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

export async function handleListProducts(
  _args: Record<string, unknown>,
  client: ExisOneApiClient
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const products = await client.listProducts();

    if (products.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No products found. Create a product in the ExisOne dashboard first.",
          },
        ],
      };
    }

    const summary = products.map((p) => ({
      id: p.id,
      name: p.name,
      version: p.version,
      price: p.price,
      trialDays: p.trialDays,
      defaultLicenseDays: p.defaultLicenseDays === 0 ? "Perpetual" : `${p.defaultLicenseDays} days`,
      isActive: p.isActive,
    }));

    return {
      content: [
        {
          type: "text",
          text: `Found ${products.length} product(s):\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error listing products: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
