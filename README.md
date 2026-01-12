# ExisOne MCP Server

An MCP (Model Context Protocol) server that enables AI assistants like Claude to manage software licenses through natural language commands.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

## What is This?

This MCP server connects [Claude Desktop](https://claude.ai/download) to the [ExisOne](https://www.exisone.com) software licensing platform. Once configured, you can manage licenses using natural language:

- **"List all my products"** - View your product catalog
- **"Show me all licenses"** - List all license keys
- **"Generate a license for customer@email.com for MyProduct"** - Create new keys
- **"Get details for license XXXX-XXXX-XXXX-XXXX"** - View specific license info

No more clicking through dashboards - just ask Claude.

## Quick Start

### 1. Clone and Build

```bash
git clone https://github.com/exisllc/exisone-mcp.git
cd exisone-mcp
npm install
npm run build
```

### 2. Get Your Access Token

1. Log in to [ExisOne](https://www.exisone.com)
2. Go to **Access Tokens** in the sidebar
3. Click **Create Token**
4. Name it "MCP Server" and select permissions: `generate`, `verify`
5. Copy the token (format: `exo_at_xxx_yyy`) - shown only once!

### 3. Configure Claude Desktop

Edit your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows example:**
```json
{
  "mcpServers": {
    "exisone": {
      "command": "node",
      "args": ["C:\\Users\\YOURNAME\\exisone-mcp\\dist\\index.js"],
      "env": {
        "EXISONE_API_URL": "https://www.exisone.com",
        "EXISONE_ACCESS_TOKEN": "exo_at_YOUR_PUBLIC_ID_YOUR_SECRET",
        "EXISONE_TENANT_ID": "1"
      }
    }
  }
}
```

**macOS/Linux example:**
```json
{
  "mcpServers": {
    "exisone": {
      "command": "node",
      "args": ["/Users/yourname/exisone-mcp/dist/index.js"],
      "env": {
        "EXISONE_API_URL": "https://www.exisone.com",
        "EXISONE_ACCESS_TOKEN": "exo_at_YOUR_PUBLIC_ID_YOUR_SECRET",
        "EXISONE_TENANT_ID": "1"
      }
    }
  }
}
```

Replace:
- The path with the actual path where you cloned the repo (use `\\` for Windows, `/` for macOS/Linux)
- `EXISONE_ACCESS_TOKEN` with your actual token
- `EXISONE_TENANT_ID` with your tenant ID (visible in dashboard settings)

### 4. Restart Claude Desktop

**Important:** You must **fully quit** Claude Desktop - closing the window is not enough as it continues running in the background.

- **Windows:** Right-click the Claude icon in the system tray → Quit, or use Task Manager to end the "Claude" process
- **macOS:** Right-click the dock icon → Quit, or use Cmd+Q

Reopen Claude Desktop and go to **Settings → Developer** to verify the ExisOne server appears in the list.

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_products` | List all products for your tenant | None |
| `list_licenses` | List licenses with optional filters | `productId`, `productName`, `activeOnly` |
| `generate_license` | Generate a new activation key | `productName` (required), `email` (required), `validityDays`, `planId` |
| `get_license` | Get detailed license information | `activationKey` (required) |

## Example Conversations

**List products:**
> "What products do I have in ExisOne?"

**Generate a license:**
> "Create a 30-day license for john@example.com for MyApp Pro"

**Check a license:**
> "Show me the details for license ABCD-1234-EFGH-5678"

**Filter licenses:**
> "List all active licenses for MyApp"

## Configuration Options

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `EXISONE_API_URL` | Yes | API URL (must be HTTPS). Default: `https://www.exisone.com` |
| `EXISONE_ACCESS_TOKEN` | Yes | Your API token in format `exo_at_{publicId}_{secret}` |
| `EXISONE_TENANT_ID` | Yes | Your tenant identifier |
| `EXISONE_TIMEOUT` | No | Request timeout in ms (default: 30000) |

## Security Notes

- **Token Security:** Store your access token securely. Never commit it to version control.
- **HTTPS Required:** The MCP server validates that the API URL uses HTTPS.
- **Permission Scope:** The server inherits permissions from your access token. Only grant needed permissions.
- **Tenant Isolation:** Each token is scoped to a specific tenant.

## Troubleshooting

### Config changes not taking effect (Most Common Issue!)

Claude Desktop runs in the background even after closing the window. You must fully quit it:

- **Windows:** Open Task Manager (Ctrl+Shift+Esc), find "Claude" and click "End Task"
- **Alternative:** Right-click the Claude icon in the system tray (bottom-right corner) → Quit
- Then reopen Claude Desktop

### Claude doesn't show ExisOne tools

1. Go to **Settings → Developer** to check if the server is listed
2. Verify your config file path is correct for your OS
3. Check that the path to `dist/index.js` is absolute and correct
4. Make sure Claude Desktop is fully quit (not running in background) before restarting
5. Check Claude Desktop logs for error messages

### "EXISONE_API_URL environment variable is required"

Make sure all three environment variables are set in your Claude config:
- `EXISONE_API_URL`
- `EXISONE_ACCESS_TOKEN`
- `EXISONE_TENANT_ID`

### "API error 401" or "API error 403"

1. Verify your access token is correct and not expired
2. Check that the token has the required permissions (`generate`, `verify`)
3. Ensure the tenant ID matches your account

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run dev

# Type check without building
npm run typecheck
```

## Project Structure

```
exisone-mcp/
├── src/
│   ├── index.ts          # Entry point with stdio transport
│   ├── server.ts         # MCP server setup
│   ├── config.ts         # Environment configuration
│   ├── api/
│   │   ├── client.ts     # HTTP client for ExisOne API
│   │   └── types.ts      # TypeScript interfaces
│   └── tools/
│       ├── index.ts      # Tool registry
│       ├── list-products.ts
│       ├── list-licenses.ts
│       ├── generate-license.ts
│       └── get-license.ts
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Adding New Tools

1. Create a new file in `src/tools/` (e.g., `deactivate-license.ts`)
2. Define the tool schema with name, description, and inputSchema
3. Implement the handler function
4. Register in `src/tools/index.ts`

Example:

```typescript
export const myTool = {
  name: "my_tool",
  description: "What the tool does",
  inputSchema: {
    type: "object" as const,
    properties: {
      param1: { type: "string", description: "..." }
    },
    required: ["param1"]
  }
};

export async function handleMyTool(args, client) {
  // Implementation
  return { content: [{ type: "text", text: "Result" }] };
}
```

## Links

- [ExisOne Platform](https://www.exisone.com)
- [MCP Documentation](https://www.exisone.com/docs-ai-mcp.html)
- [REST API Documentation](https://www.exisone.com/docs.html)
- [.NET SDK](https://www.exisone.com/docs-sdk.html)
- [Python SDK](https://www.exisone.com/docs-sdk-python.html)
- [Node.js SDK](https://www.exisone.com/docs-sdk-node.html)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/exisllc/exisone-mcp/issues)
- [Contact ExisOne](https://www.exisone.com/contact.html)
