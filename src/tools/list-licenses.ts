import type { ExisOneApiClient } from "../api/client.js";

export const listLicensesTool = {
  name: "list_licenses",
  description:
    "List all licenses, optionally filtered by product. Returns license keys, customer emails, activation status, and expiration dates.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: {
        type: "number",
        description: "Optional product ID to filter licenses",
      },
      productName: {
        type: "string",
        description: "Optional product name to filter licenses (case-insensitive)",
      },
      activeOnly: {
        type: "boolean",
        description: "If true, only show active licenses (default: false)",
      },
    },
    required: [],
  },
};

interface ListLicensesArgs {
  productId?: number;
  productName?: string;
  activeOnly?: boolean;
}

export async function handleListLicenses(
  args: Record<string, unknown>,
  client: ExisOneApiClient
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const { productId, productName, activeOnly } = args as ListLicensesArgs;

    let licenses = await client.listLicenses();

    // Apply filters
    if (productId !== undefined) {
      licenses = licenses.filter((l) => l.productId === productId);
    }

    if (productName) {
      const lowerName = productName.toLowerCase();
      licenses = licenses.filter((l) => l.productName.toLowerCase().includes(lowerName));
    }

    if (activeOnly) {
      licenses = licenses.filter((l) => l.isActive);
    }

    if (licenses.length === 0) {
      let message = "No licenses found";
      if (productId || productName) {
        message += ` matching the specified filters`;
      }
      return {
        content: [{ type: "text", text: message + "." }],
      };
    }

    const summary = licenses.map((l) => ({
      activationKey: l.activationKey,
      email: l.email,
      productName: l.productName,
      isActive: l.isActive,
      expirationDate: l.expirationDate,
      hardwareId: l.hardwareId || "Not activated",
      isCorporate: l.isCorporate,
      seats: l.isCorporate ? `${l.currentSeats}/${l.maxSeats || "unlimited"}` : "N/A",
    }));

    return {
      content: [
        {
          type: "text",
          text: `Found ${licenses.length} license(s):\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error listing licenses: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
