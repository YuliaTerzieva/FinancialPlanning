export function annualToMonthlyReturn(annualReturn) {
  return (1 + annualReturn) ** (1 / 12) - 1;
}

export function interestAccountedForInflation(interest, inflation = 0.035) {
  return (1 + interest) / (1 + inflation) - 1;
}

export function investment({
  monthlyInvestment,
  annualReturn = null,
  monthlyReturn = null,
  targetAmount = null,
  startingBalance = 0,
  annualInflationRate = 0.035,
  maxYears = 100,
  contributionTiming = 'end',
}) {
  if (monthlyInvestment <= 0) {
    throw new Error('monthlyInvestment must be greater than 0.');
  }

  if (annualReturn === null && monthlyReturn === null) {
    throw new Error('Provide either annualReturn or monthlyReturn.');
  }

  if (targetAmount === null) {
    throw new Error('Provide targetAmount.');
  }

  if (annualInflationRate <= -1) {
    throw new Error('annualInflationRate must be greater than -100%.');
  }

  if (startingBalance < 0) {
    throw new Error('startingBalance must be non-negative.');
  }

  if (!['end', 'beginning'].includes(contributionTiming)) {
    throw new Error("contributionTiming must be either 'end' or 'beginning'.");
  }

  let effectiveAnnualReturnUsed = annualReturn;
  let monthlyReturnUsed = monthlyReturn;
  const balanceHistory = [
    {
        month: 0,
        balance: startingBalance,
    },
   ];

  if (annualReturn !== null) {
    effectiveAnnualReturnUsed = interestAccountedForInflation(
      annualReturn,
      annualInflationRate
    );

    monthlyReturnUsed = annualToMonthlyReturn(effectiveAnnualReturnUsed);
  }

  function applyOneMonth(balance) {
    if (contributionTiming === 'beginning') {
      balance += monthlyInvestment;
      balance *= 1 + monthlyReturnUsed;
    } else {
      balance *= 1 + monthlyReturnUsed;
      balance += monthlyInvestment;
    }

    return balance;
  }

  if (targetAmount !== null) {
    if (targetAmount <= startingBalance) {
      return {
        mode: 'target_already_reached',
        targetAmount,
        startingBalance,
        yearsRequired: 0,
        monthsRequired: 0,
        totalMonthsRequired: 0,
        finalBalance: startingBalance,
        balanceHistory,
      };
    }

    let balance = startingBalance;
    const maxMonths = maxYears * 12;


    for (let month = 1; month <= maxMonths; month++) {
      balance = applyOneMonth(balance);
      balanceHistory.push({
        month: month + 1,
        balance,
      });

      if (balance >= targetAmount) {
        return {
          mode: 'target_amount',
          monthlyInvestment,
          annualReturnInput: annualReturn,
          annualInflationRate,
          monthlyReturnUsed,
          targetAmount,
          startingBalance,
          yearsRequired: Math.floor(month / 12),
          monthsRequired: month % 12,
          totalMonthsRequired: month,
          finalBalance: balance,
          balanceHistory,
        };
      }
    }

    return {
      mode: 'target_not_reached',
      monthlyInvestment,
      annualReturnInput: annualReturn,
      annualInflationRate,
      monthlyReturnUsed,
      targetAmount,
      startingBalance,
      maxYears,
      finalBalance: balance,
      balanceHistory,
    };
  }
}

export function calculateInvestmentPlan({
  taxOnStocks,
  annualExpense,
  sustainableReturn,
  monthlyInvestment,
  annualReturn,
  startingBalance,
}) {
  const annualExpensePreTax = annualExpense / (1 - taxOnStocks);
  const requiredAmount = annualExpensePreTax / sustainableReturn;

  const result = investment({
    monthlyInvestment,
    annualReturn,
    startingBalance,
    targetAmount: requiredAmount,
  });

  return {
    annualExpensePreTax,
    requiredAmount,
    result,
  };
}