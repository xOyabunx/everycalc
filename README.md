# EveryCalc

Free finance, military, school and everyday calculators, exposed as a **REST API** and an **MCP server** so AI assistants can do the math for you.

**Live site:** https://everycalc.xyz
**API docs (OpenAPI):** https://everycalc.xyz/api/v1/openapi.json
**MCP endpoint:** `POST https://everycalc.xyz/mcp` (Streamable HTTP, no auth)

## What it is

EveryCalc is a collection of interactive calculators for money, military life, school, and everyday questions. This repo hosts the server code that powers two machine-friendly interfaces on top of those calculators:

1. **REST API** at `everycalc.xyz/api/v1/*`, plain GET endpoints, JSON in and out.
2. **MCP server** at `POST everycalc.xyz/mcp`, 69 calculator tools for Model Context Protocol clients (Claude, Cursor, and friends).

No API key. No signup. No local install for the hosted version.

Every tool result includes a `calculator_url` deep link to the matching interactive calculator on everycalc.xyz, so users can explore the numbers visually after the assistant does the math.

## The 69 tools

### Finance (28)

| Tool | What it computes |
|---|---|
| `calculate_401k` | Projected 401k balance with employee contributions capped at 24500 per year, plus an employer match, compounded annually |
| `calculate_affordability` | Maximum home price affordable from household income using the 28/36 rule |
| `calculate_arm_vs_fixed` | Worst case adjustable rate mortgage simulation with rate caps, compared with a fixed rate loan on total interest, payments, and the breakeven year |
| `calculate_auto_loan` | Monthly payment, amount financed, total interest, and total cost of a car for an auto loan after down payment and trade-in value are subtracted from the vehicle price |
| `calculate_biweekly_mortgage` | Interest and time saved by paying half the monthly mortgage payment every two weeks instead of monthly |
| `calculate_capital_gains_tax` | Federal tax on ordinary income plus short term gains at ordinary rates, with long term gains stacked at the 0, 15, and 20 percent thresholds for the filing status |
| `calculate_car_affordability` | Monthly loan payment plus running costs (insurance, fuel, and maintenance, given as annual amounts), total interest, and the five year cost of a car |
| `calculate_compound_interest` | Future value of an investment with monthly contributions and monthly compounding |
| `calculate_credit_card_payoff` | Months and interest to clear a credit card balance with a fixed monthly payment, compared with adding an extra monthly payment |
| `calculate_debt_payoff` | Simulates paying off a list of debts month by month with minimum payments plus an extra monthly payment, comparing the avalanche method (highest APR first) with the snowball method (smallest balance first), and reports months to payoff |
| `calculate_emergency_fund` | Target emergency fund for a chosen number of months of essential expenses, the remaining gap, percent funded, and months to fill it at a monthly savings rate |
| `calculate_income_tax_estimator` | Federal income tax after pretax deductions and the standard deduction for the filing status, with AGI, taxable income, marginal rate, and effective rate |
| `calculate_inflation` | What an amount in today's dollars will buy after a number of years at a given annual inflation rate, what today's basket will cost then, the cumulative price increase percent, and the purchasing power lost |
| `calculate_lease_vs_buy` | Lease outlay over the lease term versus buy outlay net of equity in the car at the same point, with the winning option and the net cost difference |
| `calculate_loan` | Monthly payment, total interest, and optional amortization schedule for an amortizing loan |
| `calculate_mortgage` | Monthly mortgage payment breakdown: principal and interest via the amortization formula, plus property tax, homeowner insurance, PMI, and HOA |
| `calculate_net_worth` | Net worth, total assets, and total liabilities from comma separated asset and liability values, with optional matching names for the largest asset and liability |
| `calculate_paycheck` | Per paycheck net pay after federal income tax, FICA (Social Security capped at 184500 of wages, Medicare, and the additional Medicare tax), a flat state tax rate, and pretax deductions |
| `calculate_property_tax_estimator` | Annual and monthly property tax from the home value minus any exemption, at the given tax rate, with assessed value and effective rate |
| `calculate_raise_vs_inflation` | Whether a raise beats inflation: nominal new salary, inflation adjusted real salary, the real percent change, and a real raise, real pay cut, or flat verdict |
| `calculate_refinance` | Refinance break-even month and lifetime savings of refinancing a loan |
| `calculate_rent_vs_buy` | Compares the net cost of buying a home (down payment, mortgage payments, tax, insurance, and maintenance, minus principal repaid and appreciation gain) with the total rent paid over the years you plan to stay |
| `calculate_retirement_savings_planner` | Projected retirement balance from current savings plus monthly contributions with monthly compounding, total contributions, growth, and a 4 percent rule withdrawal figure |
| `calculate_roth_conversion` | Value of converting to a Roth now, with the tax paid out of the converted amount, versus leaving the money in a traditional account taxed at the retirement rate, after growth |
| `calculate_roth_vs_traditional` | Compares a Roth and a traditional retirement account at the same pre-tax annual contribution: the Roth invests what is left after tax today and is tax free at withdrawal |
| `calculate_salary` | Convert between hourly, daily, weekly, biweekly, monthly, and annual pay |
| `calculate_sba_loan` | Monthly payment for an SBA loan with the guarantee fee percent financed into the loan, plus the amount financed, total interest, and total cost |
| `calculate_social_security_estimator` | Primary insurance amount from the bend point formula (1286 and 7749) applied to average indexed monthly earnings, with monthly benefits at ages 62, 67, and 70 |

### Military (11)

| Tool | What it computes |
|---|---|
| `calculate_aft` | Scores all five AFT events (deadlift, hand-release push-ups, sprint-drag-carry, plank, 2-mile run) from 0 to 100 each using the 17-21 anchor tables, for a 500-point total |
| `calculate_bah` | Monthly Basic Allowance for Housing from the 2026 RC/Transient baseline rate table by pay grade, with or without dependents, plus the annualized amount |
| `calculate_brs_vs_high3` | Pension-only comparison of the legacy High-3 system (2.5 percent per year of service) against the Blended Retirement System (2.0 percent per year) on the same high-3 average basic pay: monthly, annual, and 30-year lifetime differences |
| `calculate_gi_bill` | Months of the 36-month Post-9/11 GI Bill entitlement remaining, tuition coverage percent, maximum annual books stipend, and Monthly Housing Allowance treatment for the given benefit tier and enrollment level |
| `calculate_les_decoder` | Net pay from a Leave and Earnings Statement: sums the entitlement lines (base pay, BAH, BAS, other) and deduction lines (federal tax, FICA, state tax, SGLI, TSP, other), and returns net pay plus deductions as a percent of entitlements |
| `calculate_military_pay` | Monthly basic pay from the 2026 pay table for a pay grade and years of service, plus the annualized amount |
| `calculate_military_retirement_pension` | Monthly retired pay estimate: years of service times the system multiplier (2.0 percent per year for BRS, 2.5 percent per year for High-3) times the high-3 average monthly basic pay, before taxes, plus annual and 20-year lifetime amounts |
| `calculate_pcs_move` | Estimated PCS move money: Dislocation Allowance (DLA) plus Temporary Lodging Expense (TLE, days capped at 21) plus the gross Personally Procured Move (PPM) reimbursement, with the PPM profit after moving costs |
| `calculate_sgli_vs_private_insurance` | Cost comparison of SGLI (0.06 USD per 1,000 USD of coverage per month plus a 1 USD monthly fee) against a private term premium over the given number of years: monthly and total SGLI cost, total private cost, and which is cheaper |
| `calculate_tsp` | Projected TSP balance with annual employee contributions (capped at the 24,500 USD elective deferral limit used by the page) plus, when matching is on |
| `calculate_va_disability` | Monthly VA disability compensation from the 2026 rates (2.8 percent COLA, effective Dec 1, 2025) for a combined rating from 10 to 100 percent and a dependent status, plus the annualized amount |

### School (23)

| Tool | What it computes |
|---|---|
| `calculate_act_score` | Composite, STEM, and ELA scores from the four ACT section scores, each clamped to 1 to 36 exactly as the page does |
| `calculate_ap_exam_score` | Predicted AP score from 1 to 5 using the page bands on the weighted composite percent: multiple choice and free response contributions are weighted by the exam split, then banded at 70, 55, 40, and 25 percent |
| `calculate_college_acceptance` | Rough acceptance chance: a selectivity tier base rate (92, 80, 50, 20, or 5 percent) adjusted by GPA and test score bands, clamped to 1 to 99 percent and labeled Safety, Target, Reach, or High reach |
| `calculate_college_major_roi` | Payback years, lifetime earnings minus degree cost, and salary to cost ratio for a major, using the page table of approximate median early career salaries by major |
| `calculate_college_roi` | Earnings premium of a degree salary over a no degree baseline salary, both growing at the same annual raise rate, plus the net gain after degree cost, the break-even year, and the return multiple on cost |
| `calculate_dorm_vs_apartment` | Compares the annual dorm cost with an apartment: monthly rent over the number of months, plus annual utilities, extra food cost, and commuting cost |
| `calculate_fafsa_sai_estimator` | Simplified Student Aid Index estimate using the page formula: parent income at 22 percent plus parent assets at 12 percent, student income above the 11770 income protection allowance at 50 percent plus student assets at 20 percent |
| `calculate_final_exam` | Score needed on the final exam to reach a desired course grade, with the best and worst possible course grades |
| `calculate_gpa` | Credit weighted GPA on the 4.0 scale using the page grade points: A+ and A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7, C+ 2.3, C 2.0, C- 1.7, D+ 1.3, D 1.0, F 0.0 |
| `calculate_gpa_planner` | Term GPA required over the planned credits to reach a target cumulative GPA, the maximum reachable cumulative GPA with straight As, and the grade mix the required GPA implies, using the page thresholds |
| `calculate_graduate_school_roi` | Annual salary premium after a graduate degree, break-even years on the total cost, and lifetime net over the career years, using the page formulas |
| `calculate_gre_score_estimator` | Estimated GRE verbal and quant scores on the 130 to 170 scale: 130 plus the fraction of questions correct times 40, per section, plus the total |
| `calculate_high_school_course_planner` | Credits still needed per subject against the page requirement table for the selected state (Texas, California, New York, Florida, or Illinois) |
| `calculate_lsat_score_estimator` | Estimated LSAT scaled score on the 120 to 180 scale: 120 plus the overall fraction correct across the three sections times 60, with accuracy and the page score band |
| `calculate_mcat_score_estimator` | Estimated MCAT section scores on the 118 to 132 scale: 118 plus the fraction correct times 14, per section, plus the total on the 472 to 528 scale |
| `calculate_premed_course_planner` | Progress across the 13 premed prerequisites on the page, in page order: General Chemistry I and II, Organic Chemistry I and II, Biology I and II, Physics I and II, Biochemistry, Psychology, Sociology, Statistics or Calculus |
| `calculate_psat_score` | Estimated PSAT section scores: 160 plus the fraction correct times 600, using the page fixed totals of 48 questions per section, plus the total and the page percentile band |
| `calculate_sat_score` | Estimated SAT section scores: 200 plus the fraction correct times 600, using the page fixed totals of 54 reading and writing questions and 44 math questions, plus the total and the page competitiveness band |
| `calculate_scholarship_roi_tracker` | Expected value of a scholarship application (award times win probability, clamped to 0 to 100 percent) and its expected value per hour of work, with the page verdict comparing that rate with an hourly wage |
| `calculate_student_budget` | Monthly budget from job, parent, and aid income against rent, food, books, transport, and fun spending |
| `calculate_student_loan_payoff` | Months to pay off a student loan and the total interest, computed month by month exactly as the page does |
| `calculate_textbook_cost` | Net cost of buying new, buying used, renting, and digital for a textbook |
| `calculate_transfer_credit_planner` | Credits remaining, terms remaining at the credits taken per term, years remaining at the terms per year, and credits per year |

### Everyday (7)

| Tool | What it computes |
|---|---|
| `calculate_age` | Exact age from a birth date to a target date, broken into years, months, and days, plus total days lived, total hours lived, the weekday of birth, and days until the next birthday |
| `calculate_bmi_tdee` | Body mass index and category, Mifflin-St Jeor basal metabolic rate, total daily energy expenditure, and cut and bulk calorie targets |
| `calculate_date_duration` | Inclusive number of days between two dates, plus business days after optionally excluding weekends and 2026 US federal holidays, calendar weeks, weekend days, and holidays in the range |
| `calculate_percentage` | Percentage calculations in three modes: percent_of (x percent of y), what_percent (x is what percent of y), percent_change (change from old to new) |
| `calculate_tip` | Tip amount, bill total, and per-person split |
| `calculate_unit_converter` | Converts a value between units in one category: length, weight, temperature, volume, or speed |
| `calculate_word_counter` | Counts words, characters, characters excluding whitespace, sentences, and paragraphs in a block of text, plus estimated reading time at 200 words per minute and speaking time at 130 words per minute |

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

That is the whole setup. The server is remote (Streamable HTTP), so there is nothing to install. Ask your assistant a money, military, school, or everyday math question and it can call the matching tool, then follow the `calculator_url` in the result to open the full interactive calculator.

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
- `GET /api/v1/openapi.json`
- `GET /api/v1/calculate/401k`
- `GET /api/v1/calculate/affordability`
- `GET /api/v1/calculate/arm-vs-fixed`
- `GET /api/v1/calculate/auto-loan`
- `GET /api/v1/calculate/biweekly-mortgage`
- `GET /api/v1/calculate/capital-gains-tax`
- `GET /api/v1/calculate/car-affordability`
- `GET /api/v1/calculate/compound-interest`
- `GET /api/v1/calculate/credit-card-payoff`
- `GET /api/v1/calculate/debt-payoff`
- `GET /api/v1/calculate/emergency-fund`
- `GET /api/v1/calculate/income-tax-estimator`
- `GET /api/v1/calculate/inflation`
- `GET /api/v1/calculate/lease-vs-buy`
- `GET /api/v1/calculate/loan`
- `GET /api/v1/calculate/mortgage`
- `GET /api/v1/calculate/net-worth`
- `GET /api/v1/calculate/paycheck`
- `GET /api/v1/calculate/property-tax-estimator`
- `GET /api/v1/calculate/raise-vs-inflation`
- `GET /api/v1/calculate/refinance`
- `GET /api/v1/calculate/rent-vs-buy`
- `GET /api/v1/calculate/retirement-savings-planner`
- `GET /api/v1/calculate/roth-conversion`
- `GET /api/v1/calculate/roth-vs-traditional`
- `GET /api/v1/calculate/salary`
- `GET /api/v1/calculate/sba-loan`
- `GET /api/v1/calculate/social-security-estimator`
- `GET /api/v1/calculate/aft`
- `GET /api/v1/calculate/bah`
- `GET /api/v1/calculate/brs-vs-high3`
- `GET /api/v1/calculate/gi-bill`
- `GET /api/v1/calculate/les-decoder`
- `GET /api/v1/calculate/military-pay`
- `GET /api/v1/calculate/military-retirement-pension-estimator`
- `GET /api/v1/calculate/pcs-move`
- `GET /api/v1/calculate/sgli-vs-private-insurance`
- `GET /api/v1/calculate/tsp`
- `GET /api/v1/calculate/va-disability`
- `GET /api/v1/calculate/act-score`
- `GET /api/v1/calculate/ap-exam-score`
- `GET /api/v1/calculate/college-acceptance`
- `GET /api/v1/calculate/college-major-roi`
- `GET /api/v1/calculate/college-roi`
- `GET /api/v1/calculate/dorm-vs-apartment`
- `GET /api/v1/calculate/fafsa-sai-estimator`
- `GET /api/v1/calculate/final-exam`
- `GET /api/v1/calculate/gpa`
- `GET /api/v1/calculate/gpa-planner`
- `GET /api/v1/calculate/graduate-school-roi`
- `GET /api/v1/calculate/gre-score-estimator`
- `GET /api/v1/calculate/high-school-course-planner`
- `GET /api/v1/calculate/lsat-score-estimator`
- `GET /api/v1/calculate/mcat-score-estimator`
- `GET /api/v1/calculate/premed-course-planner`
- `GET /api/v1/calculate/psat-score`
- `GET /api/v1/calculate/sat-score`
- `GET /api/v1/calculate/scholarship-roi-tracker`
- `GET /api/v1/calculate/student-budget`
- `GET /api/v1/calculate/student-loan-payoff`
- `GET /api/v1/calculate/textbook-cost`
- `GET /api/v1/calculate/transfer-credit-planner`
- `GET /api/v1/calculate/age`
- `GET /api/v1/calculate/bmi-tdee`
- `GET /api/v1/calculate/date-duration`
- `GET /api/v1/calculate/percentage`
- `GET /api/v1/calculate/tip`
- `GET /api/v1/calculate/unit-converter`
- `GET /api/v1/calculate/word-counter`

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

`test/test.mjs` exercises the REST endpoints against the pure math functions; `test/test-mcp.mjs` exercises the MCP tool handlers.

## MCP registry

This repo includes [`server.json`](server.json), the manifest for the [official MCP registry](https://registry.modelcontextprotocol.io), published as `xyz.everycalc/every-calc`.

## License

MIT. See [LICENSE](LICENSE).
