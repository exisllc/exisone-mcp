export interface Config {
  apiUrl: string;
  accessToken: string;
  tenantId: string;
  timeout: number;
}

export function loadConfig(): Config {
  const apiUrl = process.env.EXISONE_API_URL;
  const accessToken = process.env.EXISONE_ACCESS_TOKEN;
  const tenantId = process.env.EXISONE_TENANT_ID;
  const timeout = parseInt(process.env.EXISONE_TIMEOUT || "30000", 10);

  // Validate required environment variables
  if (!apiUrl) {
    throw new Error("EXISONE_API_URL environment variable is required");
  }

  if (!accessToken) {
    throw new Error("EXISONE_ACCESS_TOKEN environment variable is required");
  }

  if (!tenantId) {
    throw new Error("EXISONE_TENANT_ID environment variable is required");
  }

  // Validate HTTPS requirement
  if (!apiUrl.startsWith("https://")) {
    throw new Error("EXISONE_API_URL must use HTTPS");
  }

  // Validate token format
  if (!accessToken.startsWith("exo_at_")) {
    console.error("Warning: Access token should be in format exo_at_{publicId}_{secret}");
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ""), // Remove trailing slash
    accessToken,
    tenantId,
    timeout,
  };
}
