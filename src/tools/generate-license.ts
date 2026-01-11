import type { ExisOneApiClient } from "../api/client.js";

export const generateLicenseTool = {
  name: "generate_license",
  description:
    "Generate a new activation key for a product. The license key will be created and can be sent to the customer.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productName: {
        type: "string",
        description: "Name of the product to generate the license for (must match exactly)",
      },
      email: {
        type: "string",
        description: "Customer email address",
      },
      validityDays: {
        type: "number",
        description:
          "Number of days the license is valid. If not specified, uses product default. Use 0 for perpetual.",
      },
      planId: {
        type: "number",
        description: "Optional plan ID to determine validity period and features",
      },
    },
    required: ["productName", "email"],
  },
};

interface GenerateLicenseArgs {
  productName: string;
  email: string;
  validityDays?: number;
  planId?: number;
}

export async function handleGenerateLicense(
  args: Record<string, unknown>,
  client: ExisOneApiClient
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const { productName, email, validityDays, planId } = args as unknown as GenerateLicenseArgs;

    // Validate required fields
    if (!productName || typeof productName !== "string") {
      return {
        isError: true,
        content: [{ type: "text", text: "Error: productName is required and must be a string" }],
      };
    }

    if (!email || typeof email !== "string") {
      return {
        isError: true,
        content: [{ type: "text", text: "Error: email is required and must be a string" }],
      };
    }

    // Basic email validation
    if (!email.includes("@")) {
      return {
        isError: true,
        content: [{ type: "text", text: "Error: email must be a valid email address" }],
      };
    }

    const result = await client.generateLicense({
      productName,
      email,
      validityDays,
      planId,
    });

    let response = `License generated successfully!\n\n`;
    response += `Activation Key: ${result.activationKey}\n`;
    response += `Email: ${email}\n`;
    response += `Product: ${productName}\n`;

    if (result.isCorporate) {
      response += `Type: Corporate (${result.maxSeats || "unlimited"} seats)\n`;
    } else {
      response += `Type: Standard (single device)\n`;
    }

    if (result.isOffline) {
      response += `Mode: Offline-capable\n`;
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
          text: `Error generating license: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
