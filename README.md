# EveryCalc

Free finance calculators for every part of life, exposed as a **REST API** and an **MCP server** so AI assistants can do the math for you.

**Live site:** https://everycalc.xyz
**API docs (OpenAPI):** https://everycalc.xyz/api/v1/openapi.json
**MCP endpoint:** `POST https://everycalc.xyz/mcp` (Streamable HTTP, no auth)

## What it is

EveryCalc is a collection of interactive personal-finance calculators. This repo hosts the server code that powers two machine-friendly interfaces on top of those calculators:

1. **REST API** at `everycalc.xyz/api/v1/*` — plain GET endpoints, JSON in and out.
2. **MCP server** at `POST everycalc.xyz/mcp` — eight calculator tools for Model Context Protocol clients (Claude, Cursor, and friends).

No API key. No signup. No local install for the hosted version.

Every tool result includes a `calculator_url` deep link to the matching interactive calculator on everycalc.xyz, so users can explore the numbers visually after the assistant does the math.

## The 8 tools

| Tool | What it computes |
|---|---|
| `calculate_mortgage` | Monthly payment breakdown: principal and interest via the amortization formula, plus property tax, homeowner insurance, PMI, and HOA |
| `calculate_refinance` | Refinance break-even month and lifetime savings |
| `calculate_affordability` | Home affordability via the 28/36 rule |
| `calculate_loan` | Amortizing loan payments |
| `calculate_compound_interest` | Compound interest projections with monthly contributions |
| `calculate_percentage` | Percentage calculations |
| `calculate_tip` | Tip and bill splitting |
| `calculate_salary` | Salary conversions between hourly, weekly, biweekly, monthly, and annual pay |

## Use the hosted MCP server

Add this to your MCP client config:

```json
{
  "mcpServers": {
    "everycalc": {
      "url": "https://everycalc.xyz/mcp"
    }
  }
}
```

That is the whole setup. The server is remote (Streamable HTTP), so there is nothing to install.

## Use the REST API

All endpoints are `GET` with query parameters. Example:

```
GET https://everycalc.xyz/api/v1/calculate/mortgage?home_price=400000&down_payment_pct=20&annual_rate_pct=6.5&term_years=30
```

Response:

```json
{
  "ok": true,
  "tool": "calculate_mortgage",
  "inputs": { "homePrice": 400000, "annualRatePct": 6.5, "termYears": 30, "...": "..." },
  "results": {
    "loan_amount": 320000,
    "down_payment_usd": 80000,
    "monthly_principal_interest": 2022.62,
    "monthly_total": 2022.62,
    "total_interest": 408142.36,
    "total_cost": 808142.36
  },
  "calculator_url": "https://everycalc.xyz/mortgage-calculator/"
}
```

Available endpoints (full spec in [`openapi.json`](openapi.json)):

- `GET /api/v1/health`
- `GET /api/v1/calculate/mortgage`
- `GET /api/v1/calculate/refinance`
- `GET /api/v1/calculate/affordability`
- `GET /api/v1/calculate/loan`
- `GET /api/v1/calculate/compound-interest`
- `GET /api/v1/calculate/percentage`
- `GET /api/v1/calculate/tip`
- `GET /api/v1/calculate/salary`
- `GET /api/v1/openapi.json`

Errors return `{"ok": false, "error": {"code": "...", "message": "...", "field": "..."}}` with an appropriate HTTP status.

## Run it yourself

The server is a [Cloudflare Worker](https://workers.dev). The calculation math lives in `src/engine.js` as pure functions (no I/O), shared by the REST handlers and the MCP handlers in `src/index.js`.

Prerequisites: Node 18+, [wrangler](https://developers.cloudflare.com/workers/wrangler/).

```bash
npm install -g wrangler
wrangler login
# point [assets] directory at your static-site build, then:
wrangler deploy
```

The OpenAPI document is generated from the same handlers, so API docs never drift from behavior.

### Tests

```bash
npm test
```

`test/test.mjs` exercises the REST endpoints against the pure math functions; `test/test-mcp.mjs` exercises the MCP tool handlers. All green as of the last deploy.

## MCP registry

This repo includes [`server.json`](server.json), the manifest for the [official MCP registry](https://registry.modelcontextprotocol.io).

## License

MIT. See [LICENSE](LICENSE).
