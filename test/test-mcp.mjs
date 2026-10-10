/* Tests for the EveryCalc MCP endpoint (POST /mcp, Streamable HTTP).
 * Verifies protocol negotiation, tools/list, tools/call numbers against
 * known fixtures, error handling, and that REST + static passthrough
 * still work. Run: node test-mcp.mjs */
import worker from "./src/index.js";

let pass = 0;
let fail = 0;
function eq(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass++;
  } else {
    fail++;
    console.log("FAIL " + name + ": got " + a + ", want " + e);
  }
}
function close(name, actual, expected, tol) {
  tol = tol || 0.02;
  if (Math.abs(actual - expected) <= tol) {
    pass++;
  } else {
    fail++;
    console.log("FAIL " + name + ": got " + actual + ", want " + expected);
  }
}

const env = {
  ASSETS: {
    fetch: async (req) => new Response("static:" + new URL(req.url).pathname),
  },
};

function mcpPost(body, version) {
  const headers = { "Content-Type": "application/json" };
  if (version) headers["MCP-Protocol-Version"] = version;
  return worker.fetch(
    new Request("https://everycalc.xyz/mcp", {
      method: "POST",
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    env
  );
}
const rpc = (method, params, id) => ({ jsonrpc: "2.0", id: id == null ? 1 : id, method, params });

/* initialize: version negotiation. */
{
  const r = await mcpPost(rpc("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "1" } }), "2025-03-26");
  const b = await r.json();
  eq("init 2025 status", r.status, 200);
  eq("init 2025 version", b.result.protocolVersion, "2025-03-26");
  eq("init header", r.headers.get("MCP-Protocol-Version"), "2025-03-26");
  eq("init server name", b.result.serverInfo.name, "everycalc");
  eq("init tools cap", "tools" in b.result.capabilities, true);

  const r2 = await mcpPost(rpc("initialize", {}), "2024-11-05");
  const b2 = await r2.json();
  eq("init 2024 version", b2.result.protocolVersion, "2024-11-05");
  eq("init 2024 header", r2.headers.get("MCP-Protocol-Version"), "2024-11-05");

  const r3 = await mcpPost(rpc("initialize", {}));
  const b3 = await r3.json();
  eq("init default version", b3.result.protocolVersion, "2025-03-26");
  eq("init cors", r3.headers.get("Access-Control-Allow-Origin"), "*");

  const n = await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" }, "2025-03-26");
  eq("initialized notif", n.status, 202);
}

/* tools/list: 8 tools with valid schemas. */
{
  const r = await mcpPost(rpc("tools/list", {}), "2025-03-26");
  const b = await r.json();
  eq("list count", b.result.tools.length, 8);
  const names = b.result.tools.map((t) => t.name).sort();
  eq(
    "list names",
    names,
    [
      "calculate_affordability",
      "calculate_compound_interest",
      "calculate_loan",
      "calculate_mortgage",
      "calculate_percentage",
      "calculate_refinance",
      "calculate_salary",
      "calculate_tip",
    ]
  );
  for (const t of b.result.tools) {
    eq("tool " + t.name + " schema type", t.inputSchema.type, "object");
    eq("tool " + t.name + " has props", typeof t.inputSchema.properties, "object");
    eq("tool " + t.name + " mentions deep link", t.description.includes("calculator_url"), true);
  }
}

/* tools/call: mortgage fixture $400k/10%/6.5%/30yr -> P&I $2,275.44. */
{
  const r = await mcpPost(
    rpc("tools/call", {
      name: "calculate_mortgage",
      arguments: { home_price: 400000, down_payment_pct: 10, annual_rate_pct: 6.5, term_years: 30 },
    }),
    "2025-03-26"
  );
  const b = await r.json();
  eq("mortgage no error", b.result.isError, undefined);
  const payload = JSON.parse(b.result.content[0].text);
  eq("mortgage ok", payload.ok, true);
  eq("mortgage tool", payload.tool, "calculate_mortgage");
  close("mortgage pi", payload.results.monthly_principal_interest, 2275.44);
  eq("mortgage url", payload.calculator_url, "https://everycalc.xyz/mortgage-calculator/");
  eq("mortgage text type", b.result.content[0].type, "text");
}

/* tools/call: loan fixture $35k/9%/4yr -> $870.98/mo. */
{
  const r = await mcpPost(
    rpc("tools/call", {
      name: "calculate_loan",
      arguments: { principal: 35000, annual_rate_pct: 9, term_years: 4 },
    }),
    "2024-11-05"
  );
  const b = await r.json();
  const payload = JSON.parse(b.result.content[0].text);
  close("loan payment", payload.results.monthly_payment, 870.98);
  eq("loan url", payload.calculator_url, "https://everycalc.xyz/loan-calculator/");
}

/* tools/call: a couple more calculators for coverage. */
{
  const r = await mcpPost(
    rpc("tools/call", { name: "calculate_tip", arguments: { bill: 100, tip_pct: 20, people: 2 } }),
    "2025-03-26"
  );
  const payload = JSON.parse((await r.json()).result.content[0].text);
  eq("tip total", payload.results.total, 120);
  eq("tip each", payload.results.per_person, 60);

  const r2 = await mcpPost(
    rpc("tools/call", { name: "calculate_percentage", arguments: { mode: "percent_of", x: 15, y: 200 } }),
    "2025-03-26"
  );
  const p2 = JSON.parse((await r2.json()).result.content[0].text);
  eq("pct of", p2.results.result, 30);
}

/* tools/call: error paths. */
{
  const r = await mcpPost(rpc("tools/call", { name: "calculate_nope", arguments: {} }), "2025-03-26");
  const b = await r.json();
  eq("unknown tool isError", b.result.isError, true);

  const r2 = await mcpPost(
    rpc("tools/call", { name: "calculate_mortgage", arguments: { annual_rate_pct: 6.5 } }),
    "2025-03-26"
  );
  const b2 = await r2.json();
  eq("missing arg isError", b2.result.isError, true);
  eq("missing arg mentions field", b2.result.content[0].text.includes("home_price"), true);

  const r3 = await mcpPost(
    rpc("tools/call", { name: "calculate_percentage", arguments: { mode: "bogus", x: 1, y: 2 } }),
    "2025-03-26"
  );
  eq("bad mode isError", (await r3.json()).result.isError, true);
}

/* JSON-RPC protocol errors. */
{
  const r = await mcpPost(rpc("bogus/method", {}), "2025-03-26");
  const b = await r.json();
  eq("method not found code", b.error.code, -32601);

  const r2 = await mcpPost({ method: "tools/list" }, "2025-03-26");
  eq("invalid request code", (await r2.json()).error.code, -32600);

  const r3 = await mcpPost("this is not json", "2025-03-26");
  eq("parse error code", (await r3.json()).error.code, -32700);

  const g = await worker.fetch(new Request("https://everycalc.xyz/mcp"), env);
  eq("GET 405", g.status, 405);

  const pre = await worker.fetch(
    new Request("https://everycalc.xyz/mcp", { method: "OPTIONS" }),
    env
  );
  eq("mcp preflight", pre.status, 204);
}

/* REST API and static passthrough still work. */
{
  const h = await worker.fetch(new Request("https://everycalc.xyz/api/v1/health"), env);
  eq("rest health", (await h.json()).status, "ok");

  const m = await worker.fetch(
    new Request("https://everycalc.xyz/api/v1/calculate/loan?principal=35000&annual_rate_pct=9&term_years=4"),
    env
  );
  const mb = await m.json();
  close("rest loan payment", mb.results.monthly_payment, 870.98);

  const s = await worker.fetch(new Request("https://everycalc.xyz/mortgage-calculator/"), env);
  eq("static passthrough", await s.text(), "static:/mortgage-calculator/");

  const oa = await worker.fetch(new Request("https://everycalc.xyz/api/v1/openapi.json"), env);
  eq("openapi still", (await oa.json()).openapi, "3.1.0");
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
