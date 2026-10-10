/* Tests for the EveryCalc API worker pure functions and routing.
 * Expected values come from the worked examples in the page HTML
 * (verified against the pages' own inline scripts). Run: node test.mjs */
import {
  calcMortgagePure,
  calcRefinancePure,
  calcAffordabilityPure,
  calcLoanPure,
  calcCompoundPure,
  calcPercentagePure,
  calcTipPure,
  calcSalaryPure,
} from "./src/index.js";
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

/* Mortgage: $400k home, 10% down, 6.5% APR, 30yr, 1.1% tax, $1800 ins, 0.5% PMI. */
{
  const r = calcMortgagePure({
    homePrice: 400000,
    downPaymentPct: 10,
    annualRatePct: 6.5,
    termYears: 30,
    propertyTaxAnnual: 4400,
    homeInsuranceAnnual: 1800,
    pmiRatePct: 0.5,
    hoaMonthly: 0,
  });
  close("mortgage pi", r.monthly_principal_interest, 2275.44);
  close("mortgage tax", r.monthly_property_tax, 366.67);
  close("mortgage ins", r.monthly_insurance, 150);
  close("mortgage pmi", r.monthly_pmi, 150);
  close("mortgage total", r.monthly_total, 2942.11);
  eq("mortgage loan", r.loan_amount, 360000);
  /* 20% down kills PMI. */
  const r2 = calcMortgagePure({
    homePrice: 400000,
    downPaymentPct: 20,
    annualRatePct: 6.5,
    termYears: 30,
  });
  eq("mortgage no pmi", r2.monthly_pmi, 0);
  eq("mortgage no pmi months", r2.pmi_months, 0);
}

/* Refinance: $300k owed, 25y left at 7.5%; new 6.25% 25yr, $6k closing. */
{
  const r = calcRefinancePure({
    balance: 300000,
    currentRatePct: 7.5,
    yearsLeft: 25,
    newRatePct: 6.25,
    newTermYears: 25,
    closingCosts: 6000,
  });
  close("refi current", r.current_payment, 2216.97);
  close("refi new", r.new_payment, 1979.01);
  close("refi save", r.monthly_savings, 237.97);
  eq("refi breakeven", r.break_even_months, 26);
  /* No savings -> null break-even. */
  const r2 = calcRefinancePure({
    balance: 300000,
    currentRatePct: 6,
    yearsLeft: 25,
    newRatePct: 7,
    newTermYears: 25,
    closingCosts: 6000,
  });
  eq("refi no-save breakeven", r2.break_even_months, null);
}

/* Affordability: $120k income, $700 debts, 6.5%, 30yr. */
{
  const r = calcAffordabilityPure({
    annualIncome: 120000,
    monthlyDebts: 700,
    downPayment: 0,
    annualRatePct: 6.5,
    termYears: 30,
  });
  close("afford budget", r.monthly_housing_budget, 2800);
  close("afford front", r.front_end_cap, 2800);
  close("afford back", r.back_end_cap, 2900);
  eq("afford binding", r.binding_rule, "front-end");
  /* Crushing debts -> zero budget with warning, not an error. */
  const r2 = calcAffordabilityPure({
    annualIncome: 120000,
    monthlyDebts: 5000,
    annualRatePct: 6.5,
  });
  eq("afford zero budget", r2.monthly_housing_budget, 0);
  eq("afford warning?", r2.warning !== null, true);
}

/* Loan: $35k at 9% over 4 years. */
{
  const r = calcLoanPure({ principal: 35000, annualRatePct: 9, termYears: 4 });
  close("loan payment", r.monthly_payment, 870.98);
  close("loan interest", r.total_interest, 6806.87);
  close("loan total", r.total_cost, 41806.87);
  eq("loan payments", r.num_payments, 48);
}

/* Compound: $10k + $500/mo at 7% for 30 years, monthly compounding. */
{
  const r = calcCompoundPure({
    principal: 10000,
    monthlyContribution: 500,
    annualRatePct: 7,
    years: 30,
  });
  close("compound fv", r.future_value, 691150, 2);
  close("compound contrib", r.total_contributed, 190000, 0.5);
  close("compound growth", r.total_growth, 501150, 2);
  /* Zero rate is valid: result equals contributions. */
  const r2 = calcCompoundPure({ principal: 1000, monthlyContribution: 100, annualRatePct: 0, years: 1 });
  close("compound zero rate", r2.future_value, 2200, 0.5);
}

/* Percentage: the three modes. */
{
  eq("pct of", calcPercentagePure({ mode: "percent_of", x: 15, y: 200 }).result, 30);
  eq("what pct", calcPercentagePure({ mode: "what_percent", x: 45, y: 180 }).result, 25);
  const up = calcPercentagePure({ mode: "percent_change", old: 80, new: 100 });
  eq("pct change up", up.result, 25);
  eq("pct change dir", up.direction, "increase");
  const down = calcPercentagePure({ mode: "percent_change", old: 100, new: 80 });
  eq("pct change down", down.result, 20);
  eq("pct change down dir", down.direction, "decrease");
}

/* Tip: $184.50 bill, 20%, 4 people. */
{
  const r = calcTipPure({ bill: 184.5, tipPct: 20, people: 4 });
  eq("tip amount", r.tip, 36.9);
  eq("tip total", r.total, 221.4);
  eq("tip each", r.per_person, 55.35);
  eq("tip tip-each", r.tip_per_person, 9.23);
}

/* Salary: $25/hr, 40 hrs/week. */
{
  const r = calcSalaryPure({ mode: "hourly", hourly: 25, hoursPerWeek: 40 });
  eq("salary annual", r.annual, 52000);
  eq("salary biweekly", r.biweekly, 2000);
  close("salary monthly", r.monthly, 4333.33);
  eq("salary weekly", r.weekly, 1000);
  /* Annual mode inverts. */
  const r2 = calcSalaryPure({ mode: "annual", annual: 52000, hoursPerWeek: 40 });
  eq("salary hourly back", r2.hourly, 25);
}

/* Routing: health, 404, 400, CORS, static passthrough. */
{
  const env = {
    ASSETS: {
      fetch: async (req) => new Response("static:" + new URL(req.url).pathname),
    },
  };
  const get = (path) =>
    worker.fetch(new Request("https://everycalc.xyz" + path), env);

  const h = await get("/api/v1/health");
  const hb = await h.json();
  eq("health status", h.status, 200);
  eq("health body", hb.status, "ok");
  eq("health cors", h.headers.get("Access-Control-Allow-Origin"), "*");

  const m = await get(
    "/api/v1/calculate/mortgage?home_price=400000&down_payment_pct=10&annual_rate_pct=6.5&term_years=30&property_tax_annual=4400&home_insurance_annual=1800"
  );
  const mb = await m.json();
  eq("api mortgage ok", mb.ok, true);
  close("api mortgage total", mb.results.monthly_total, 2942.11);
  eq("api mortgage url", mb.calculator_url, "https://everycalc.xyz/mortgage-calculator/");

  const bad = await get("/api/v1/calculate/mortgage?annual_rate_pct=6.5");
  const badb = await bad.json();
  eq("api 400 status", bad.status, 400);
  eq("api 400 code", badb.error.code, "INVALID_INPUT");

  const nf = await get("/api/v1/nope");
  eq("api 404", nf.status, 404);

  const s = await get("/mortgage-calculator/");
  eq("static passthrough", await s.text(), "static:/mortgage-calculator/");

  const pre = await worker.fetch(
    new Request("https://everycalc.xyz/api/v1/health", { method: "OPTIONS" }),
    env
  );
  eq("preflight", pre.status, 204);

  const oa = await get("/api/v1/openapi.json");
  const oab = await oa.json();
  eq("openapi version", oab.openapi, "3.1.0");
  eq("openapi has mortgage", "/api/v1/calculate/mortgage" in oab.paths, true);
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
