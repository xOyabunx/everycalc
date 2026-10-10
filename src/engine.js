/* EveryCalc calculation engine.
 *
 * Pure calculation functions (no DOM, no browser globals) shared by the
 * REST API handlers and the MCP tool handlers in src/index.js. The math
 * mirrors the inline scripts on the calculator pages, so API, MCP, and
 * page numbers match for the same inputs.
 *
 * No em dashes are used anywhere in this file, per project rule.
 */

"use strict";

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Pure calculation functions (no DOM, no browser globals).            */
/* ------------------------------------------------------------------ */

/* Mortgage: fixed-rate payment breakdown with tax, insurance, PMI, HOA.
 * Mirrors mortgage-calculator/index.html calcMortgage(). */
export function calcMortgagePure(o) {
  var homePrice = o.homePrice;
  var annualRatePct = o.annualRatePct;
  var termYears = o.termYears || 30;
  var propertyTaxAnnual = o.propertyTaxAnnual || 0;
  var homeInsuranceAnnual = o.homeInsuranceAnnual || 0;
  var pmiRatePct = o.pmiRatePct != null ? o.pmiRatePct : 0.5;
  var hoaMonthly = o.hoaMonthly || 0;
  var includeSchedule = !!o.includeSchedule;

  var downPaymentUsd, downPct;
  if (o.downPaymentUsd != null) {
    downPaymentUsd = o.downPaymentUsd;
    downPct = homePrice > 0 ? (downPaymentUsd / homePrice) * 100 : 0;
  } else {
    downPct = o.downPaymentPct != null ? o.downPaymentPct : 20;
    downPaymentUsd = (homePrice * downPct) / 100;
  }

  var loan = Math.max(0, homePrice - downPaymentUsd);
  var r = annualRatePct / 100 / 12;
  var n = termYears * 12;
  var pi = 0;
  if (loan > 0) {
    if (r > 0) {
      var f = Math.pow(1 + r, n);
      pi = (loan * r * f) / (f - 1);
    } else {
      pi = loan / n;
    }
  }
  var taxMo = propertyTaxAnnual / 12;
  var insMo = homeInsuranceAnnual / 12;
  var pmiMo = downPct < 20 && loan > 0 ? (loan * (pmiRatePct / 100)) / 12 : 0;
  var monthlyTotal = pi + taxMo + insMo + pmiMo + hoaMonthly;

  /* Amortization with PMI dropping once balance hits 80% of home value. */
  var bal = loan;
  var totalInterest = 0;
  var pmiMonths = 0;
  var pmiTotal = 0;
  var schedule = [];
  var yrInt = 0;
  var yrPrin = 0;
  for (var m = 1; m <= n && bal > 0.005; m++) {
    var interest = bal * r;
    var prin = Math.min(pi - interest, bal);
    if (prin < 0) prin = 0;
    var curPmi =
      bal > 0.8 * homePrice && loan > 0 && downPct < 20
        ? (loan * (pmiRatePct / 100)) / 12
        : 0;
    if (curPmi > 0) {
      pmiMonths++;
      pmiTotal += curPmi;
    }
    bal -= prin;
    totalInterest += interest;
    yrInt += interest;
    yrPrin += prin;
    if (m % 12 === 0 || m === n || bal <= 0.005) {
      schedule.push({
        year: Math.ceil(m / 12),
        interest_paid: round2(yrInt),
        principal_paid: round2(yrPrin),
        balance: round2(Math.max(0, bal)),
      });
      yrInt = 0;
      yrPrin = 0;
    }
  }
  var totalCost =
    homePrice +
    totalInterest +
    propertyTaxAnnual * termYears +
    homeInsuranceAnnual * termYears +
    pmiTotal +
    hoaMonthly * n;

  var out = {
    loan_amount: round2(loan),
    down_payment_usd: round2(downPaymentUsd),
    down_payment_pct: round2(downPct),
    ltv_pct: round2(homePrice > 0 ? (loan / homePrice) * 100 : 0),
    monthly_principal_interest: round2(pi),
    monthly_property_tax: round2(taxMo),
    monthly_insurance: round2(insMo),
    monthly_pmi: round2(pmiMo),
    monthly_hoa: round2(hoaMonthly),
    monthly_total: round2(monthlyTotal),
    total_interest: round2(totalInterest),
    total_cost: round2(totalCost),
    pmi_months: pmiMonths,
    pmi_total: round2(pmiTotal),
  };
  if (includeSchedule) out.schedule = schedule;
  return out;
}

function pmtPure(principal, annualRatePct, years) {
  var r = annualRatePct / 100 / 12;
  var n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  if (r <= 0) return principal / n;
  var f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

/* Refinance: break-even month and lifetime savings.
 * Mirrors refinance-calculator/index.html calcRefi(). */
export function calcRefinancePure(o) {
  var balance = o.balance;
  var yearsLeft = o.yearsLeft;
  var newTermYears = o.newTermYears;
  var closingCosts = o.closingCosts || 0;

  var curPay = pmtPure(balance, o.currentRatePct, yearsLeft);
  var newPay = pmtPure(balance, o.newRatePct, newTermYears);
  var monthlySavings = curPay - newPay;

  var curTotal = curPay * Math.round(yearsLeft * 12);
  var newTotal = newPay * (newTermYears * 12) + closingCosts;
  var lifetimeSavings = curTotal - newTotal;

  return {
    current_payment: round2(curPay),
    new_payment: round2(newPay),
    monthly_savings: round2(monthlySavings),
    current_total_cost: round2(curTotal),
    new_total_cost: round2(newTotal),
    lifetime_savings: round2(lifetimeSavings),
    break_even_months: monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : null,
  };
}

/* Home affordability: 28/36 rule. Mirrors
 * home-affordability-calculator/index.html calcAfford(). */
export function calcAffordabilityPure(o) {
  var frontRatioPct = o.frontRatioPct != null ? o.frontRatioPct : 28;
  var backRatioPct = o.backRatioPct != null ? o.backRatioPct : 36;
  var monthlyDebts = o.monthlyDebts || 0;
  var downPayment = o.downPayment || 0;
  var termYears = o.termYears || 30;

  var monthlyIncome = o.annualIncome / 12;
  var frontCap = (monthlyIncome * frontRatioPct) / 100;
  var backCap = (monthlyIncome * backRatioPct) / 100 - monthlyDebts;
  var housing = Math.max(0, Math.min(frontCap, backCap));

  var r = o.annualRatePct / 100 / 12;
  var n = termYears * 12;
  var loan = 0;
  if (housing > 0) {
    if (r > 0) {
      var f = Math.pow(1 + r, n);
      loan = (housing * (f - 1)) / (r * f);
    } else {
      loan = housing * n;
    }
  }
  var price = loan + downPayment;

  return {
    max_home_price: round2(price),
    max_loan: round2(loan),
    monthly_housing_budget: round2(housing),
    front_end_cap: round2(Math.max(0, frontCap)),
    back_end_cap: round2(Math.max(0, backCap)),
    binding_rule: frontCap <= backCap ? "front-end" : "back-end",
    down_payment_usd: round2(downPayment),
    warning:
      backCap <= 0
        ? "Monthly debts exceed the back-end allowance; affordable budget is 0 until debts fall."
        : null,
  };
}

/* Loan: amortizing loan payment and schedule.
 * Mirrors loan-calculator/index.html calcLoan(). */
export function calcLoanPure(o) {
  var principal = o.principal;
  var annualRatePct = o.annualRatePct;
  var termYears = o.termYears;
  var includeSchedule = !!o.includeSchedule;

  var r = annualRatePct / 100 / 12;
  var n = Math.max(1, Math.round(termYears * 12));
  var pay = 0;
  if (principal > 0) {
    if (r > 0) {
      var f = Math.pow(1 + r, n);
      pay = (principal * r * f) / (f - 1);
    } else {
      pay = principal / n;
    }
  }
  var bal = principal;
  var totalInterest = 0;
  var schedule = [];
  var yrInt = 0;
  var yrPrin = 0;
  for (var m = 1; m <= n && bal > 0.005; m++) {
    var interest = bal * r;
    var prin = Math.min(pay - interest, bal);
    if (prin < 0) prin = 0;
    bal -= prin;
    totalInterest += interest;
    yrInt += interest;
    yrPrin += prin;
    if (m % 12 === 0 || m === n || bal <= 0.005) {
      schedule.push({
        year: Math.ceil(m / 12),
        interest_paid: round2(yrInt),
        principal_paid: round2(yrPrin),
        balance: round2(Math.max(0, bal)),
      });
      yrInt = 0;
      yrPrin = 0;
    }
  }
  var out = {
    monthly_payment: round2(pay),
    num_payments: n,
    total_interest: round2(totalInterest),
    total_cost: round2(principal + totalInterest),
  };
  if (includeSchedule) out.schedule = schedule;
  return out;
}

/* Compound interest: monthly contributions, monthly compounding.
 * Mirrors compound-interest-calculator/index.html calcCompound(). */
export function calcCompoundPure(o) {
  var principal = o.principal || 0;
  var monthlyContribution = o.monthlyContribution || 0;
  var annualRatePct = o.annualRatePct;
  var years = Math.max(1, Math.min(100, Math.round(o.years) || 30));
  var includeSchedule = !!o.includeSchedule;

  var r = annualRatePct / 100 / 12;
  var bal = principal;
  var totalContrib = principal;
  var schedule = [];
  var cumInt = 0;
  var prevBal = principal;
  var prevContrib = principal;
  for (var y = 1; y <= years; y++) {
    for (var m = 0; m < 12; m++) {
      bal = bal * (1 + r) + monthlyContribution;
      totalContrib += monthlyContribution;
    }
    var yrContrib = totalContrib - prevContrib;
    var yrInt = bal - prevBal - yrContrib;
    cumInt += yrInt;
    schedule.push({
      year: y,
      contributed_cumulative: round2(totalContrib),
      growth_cumulative: round2(cumInt),
      balance: round2(bal),
    });
    prevBal = bal;
    prevContrib = totalContrib;
  }
  var out = {
    future_value: round2(bal),
    total_contributed: round2(totalContrib),
    total_growth: round2(bal - totalContrib),
    years: years,
  };
  if (includeSchedule) out.schedule = schedule;
  return out;
}

/* Percentage: three modes. Mirrors percentage-calculator/index.html. */
export function calcPercentagePure(o) {
  var mode = o.mode;
  if (mode === "percent_of") {
    return { result: round2((o.y * o.x) / 100) };
  }
  if (mode === "what_percent") {
    if (o.y === 0) throw inputError("y must not be zero for what_percent.", "y");
    return { result: round2((o.x / o.y) * 100) };
  }
  if (mode === "percent_change") {
    if (o.old === 0) throw inputError("old must not be zero for percent_change.", "old");
    var ch = ((o.new - o.old) / Math.abs(o.old)) * 100;
    return {
      result: round2(Math.abs(ch)),
      direction: ch > 0 ? "increase" : ch < 0 ? "decrease" : "no change",
    };
  }
  throw inputError("mode must be one of: percent_of, what_percent, percent_change.", "mode");
}

/* Tip: bill split. Mirrors tip-calculator/index.html calcTip(). */
export function calcTipPure(o) {
  var bill = Math.max(0, o.bill || 0);
  var tipPct = Math.max(0, o.tipPct || 0);
  var people = Math.max(1, Math.round(o.people) || 1);
  var tip = (bill * tipPct) / 100;
  var total = bill + tip;
  return {
    tip: round2(tip),
    total: round2(total),
    tip_per_person: round2(tip / people),
    per_person: round2(total / people),
    people: people,
  };
}

/* Salary: pay-frequency conversions. Mirrors salary-calculator/index.html. */
export function calcSalaryPure(o) {
  var hours = o.hoursPerWeek || 0;
  var hourly, annual;
  if (o.mode === "annual") {
    annual = Math.max(0, o.annual || 0);
    hourly = hours > 0 ? annual / (hours * 52) : 0;
  } else {
    hourly = Math.max(0, o.hourly || 0);
    annual = hourly * hours * 52;
  }
  var weekly = hourly * hours;
  return {
    hourly: round2(hourly),
    daily: round2(hourly * 8),
    weekly: round2(weekly),
    biweekly: round2(weekly * 2),
    monthly: round2(annual / 12),
    annual: round2(annual),
  };
}


export function inputError(message, field) {
  var e = new Error(message);
  e.isInputError = true;
  e.field = field || null;
  return e;
}

