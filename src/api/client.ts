import type { Config } from "../config.js";
import type {
  Product,
  License,
  GenerateKeyRequest,
  GenerateKeyResponse,
  LicenseHistory,
} from "./types.js";

export class ExisOneApiClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.apiUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `ExisOneApi ${this.config.accessToken}`,
      "X-Tenant": this.config.tenantId,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = `API error ${response.status}`;
        try {
          const errorJson = JSON.parse(text);
          errorMessage = errorJson.message || errorJson.error || text;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }
      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async listProducts(): Promise<Product[]> {
    return this.request<Product[]>("GET", "/api/product/");
  }

  async listLicenses(): Promise<License[]> {
    return this.request<License[]>("GET", "/api/license/");
  }

  async generateLicense(params: GenerateKeyRequest): Promise<GenerateKeyResponse> {
    return this.request<GenerateKeyResponse>("POST", "/api/activationkey/generate", params as unknown as Record<string, unknown>);
  }

  async getLicenseHistory(activationKey: string): Promise<LicenseHistory[]> {
    return this.request<LicenseHistory[]>(
      "GET",
      `/api/license/${encodeURIComponent(activationKey)}/history`
    );
  }
}
