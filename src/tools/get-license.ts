import type { ExisOneApiClient } from "../api/client.js";

export const getLicenseTool = {
  name: "get_license",
  description:
    "Get detailed information about a specific license by its activation key, including activation history.",
  inputSchema: {
    type: "object" as const,
    properties: {
      activationKey: {
        type: "string",
        description: "The activation key to look up (format: XXXX-XXXX-XXXX-XXXX)",
      },
    },
    required: ["activationKey"],
  },
};

interface GetLicenseArgs {
  activationKey: string;
}

export async function handleGetLicense(
  args: Record<string, unknown>,
  client: ExisOneApiClient
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const { activationKey } = args as unknown as GetLicenseArgs;

    if (!activationKey || typeof activationKey !== "string") {
      return {
        isError: true,
        content: [{ type: "text", text: "Error: activationKey is required" }],
      };
    }

    // Get all licenses and find the matching one
    const licenses = await client.listLicenses();
    const license = licenses.find(
      (l) => l.activationKey.toLowerCase() === activationKey.toLowerCase()
    );

    if (!license) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `License not found: ${activationKey}. Make sure the activation key is correct.`,
          },
        ],
      };
    }

    // Try to get history
    let history: Array<{ action: string; timestamp: string; hardwareId?: string }> = [];
    try {
      history = await client.getLicenseHistory(activationKey);
    } catch {
      // History might not be available, continue without it
    }

    let response = `License Details:\n\n`;
    response += `Activation Key: ${license.activationKey}\n`;
    response += `Email: ${license.email}\n`;
    response += `Product: ${license.productName} (ID: ${license.productId})\n`;
    response += `Status: ${license.isActive ? "Active" : "Inactive"}\n`;
    response += `Created: ${license.createdAt}\n`;
    response += `Expiration: ${license.expirationDate}\n`;

    if (license.hardwareId) {
      response += `Hardware ID: ${license.hardwareId}\n`;
      response += `Activated: ${license.activationDate || "Unknown"}\n`;
    } else {
      response += `Hardware ID: Not activated yet\n`;
    }

    if (license.isCorporate) {
      response += `\nCorporate License:\n`;
      response += `  Company: ${license.corporateName || "Not specified"}\n`;
      response += `  Seats: ${license.currentSeats}/${license.maxSeats || "unlimited"}\n`;
    }

    if (license.isOffline) {
      response += `\nOffline Mode: Enabled\n`;
    }

    if (license.note) {
      response += `\nNote: ${license.note}\n`;
    }

    if (history.length > 0) {
      response += `\nRecent History (last 5):\n`;
      history.slice(0, 5).forEach((h) => {
        response += `  - ${h.action} at ${h.timestamp}`;
        if (h.hardwareId) {
          response += ` (${h.hardwareId})`;
        }
        response += `\n`;
      });
    }

    return {
      content: [{ type: "text", text: response }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error getting license: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
