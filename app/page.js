'use client';

import { useState } from 'react';
import { calculateInvestmentPlan } from '../lib/invest';

export default function Home() {
  const [formData, setFormData] = useState({
    tax_on_stocks: '',
    e_annual_expense: '',
    e_sus_return: '',
    monthly_investment: '',
    e_annual_return: '',
    starting_balance: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function toNumber(value) {
    return Number(value);
  }

  function toPercent(value) {
    return Number(value) / 100;
  }

  let output = null;
  let error = null;

  const allFieldsFilled = Object.values(formData).every((value) => value !== '');

  if (allFieldsFilled) {
    try {
      output = calculateInvestmentPlan({
        taxOnStocks: toPercent(formData.tax_on_stocks),
        annualExpense: toNumber(formData.e_annual_expense),
        sustainableReturn: toPercent(formData.e_sus_return),
        monthlyInvestment: toNumber(formData.monthly_investment),
        annualReturn: toPercent(formData.e_annual_return),
        startingBalance: toNumber(formData.starting_balance),
      });
    } catch (err) {
      error = err.message;
    }
  }

  return (
    <main>
      <h1>Investment Calculator</h1>

      <form style={{ display: 'grid', gap: '12px' }}>
        
        <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        }}
        >
            <label
                htmlFor="tax_on_stocks"
                style={{ width: '180px' }}
            >
                Tax on income from stocks
            </label>
            <input
            name="tax_on_stocks"
            placeholder="for example 0 or 26"
            value={formData.tax_on_stocks}
            onChange={handleChange}
            />
        
        </div>

        <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        }}
        >
            <label
                htmlFor="tax_on_stocks"
                style={{ width: '180px' }}
            >
                Expected annual expense (after tax)
            </label>

            <input
            name="e_annual_expense"
            placeholder="for example 24000"
            value={formData.e_annual_expense}
            onChange={handleChange}
            />
        </div>

        <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        }}
        >
            <label
                htmlFor="tax_on_stocks"
                style={{ width: '180px' }}
            >
                Sustainable return % (Expected divident return)
            </label>
        <input
          name="e_sus_return"
          placeholder="for example 4"
          value={formData.e_sus_return}
          onChange={handleChange}
        />

        </div>

        <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        }}
        >
            <label
                htmlFor="tax_on_stocks"
                style={{ width: '180px' }}
            >
                Monthly investment
            </label>
            <input
            name="monthly_investment"
            placeholder="for example 1500"
            value={formData.monthly_investment}
            onChange={handleChange}
            />

        </div>

        <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        }}
        >
            <label
                htmlFor="tax_on_stocks"
                style={{ width: '180px' }}
            >
                Expected annual return of investment
            </label>
            <input
            name="e_annual_return"
            placeholder="for example 10"
            value={formData.e_annual_return}
            onChange={handleChange}
            />

        </div>

        <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        }}
        >
            <label
                htmlFor="tax_on_stocks"
                style={{ width: '180px' }}
            >
                Starting balance
            </label>
            <input
            name="starting_balance"
            placeholder="for example 0"
            value={formData.starting_balance}
            onChange={handleChange}
            />

        </div>
      </form>

      <hr style={{ margin: '30px 0' }} />

      <h2>Results</h2>

      {!allFieldsFilled && (
        <p>Please fill in all fields to see the result.</p>
      )}

      {error && (
        <p style={{ color: 'red' }}>
          Error: {error}
        </p>
      )}

      {output && (
        <div>
          <p>
            Annual expense before tax:{' '}
            <strong>
              €{output.annualExpensePreTax.toFixed(2)}
            </strong>
          </p>
        
          <p>
            Required portfolio amount:{' '}
            <strong>
              €{output.requiredAmount.toFixed(2)}
            </strong>
          </p>

          <p>
            Time required:{' '}
            <strong>
              {output.result.yearsRequired} years and{' '}
              {output.result.monthsRequired} months
            </strong>
          </p>

          <p>
            Final balance:{' '}
            <strong>
              €{output.result.finalBalance.toFixed(2)}
            </strong>
          </p>
        </div>
      )}

      {output && output.result.balanceHistory && (
        <BalanceChart data={output.result.balanceHistory} />
      )}

      <section style={{ marginTop: '30px' }}>
        <h2>Logic and Formulas</h2>

        <p>
            This calculator estimates how much money is needed to cover yearly expenses
            from an investment portfolio, and how long it may take to reach that amount.
        </p>

        <h3>1. Expense before tax</h3>
        <p>
            First, we calculate how much money is needed before tax:
        </p>
        <p>
            <strong>annualExpensePreTax = annualExpense / (1 - taxOnStocks)</strong>
        </p>

        <h3>2. Required portfolio amount</h3>
        <p>
            Then, we calculate the portfolio size needed to support that yearly expense:
        </p>
        <p>
            <strong>requiredAmount = annualExpensePreTax / sustainableReturn</strong>
        </p>

        <h3>3. Inflation-adjusted return</h3>
        <p>
            The expected annual return is adjusted for inflation, so the result is closer
            to today's money value. The inflation is taken to be 3.5% based on <a href="https://www.ing.nl/en/personal/savings/inflation-and-your-options">ING calculator</a> 
        </p>
        <p>
            <strong>realReturn = ((1 + annualReturn) / (1 + inflationRate)) - 1</strong>
        </p>

        <h3>4. Monthly return</h3>
        <p>
            The annual return is converted into a monthly return using compound interest:
        </p>
        <p>
            <strong>monthlyReturn = (1 + realReturn) ^ (1 / 12) - 1</strong>
        </p>

        <h3>5. Monthly investment growth</h3>
        <p>
            Each month, the current balance grows by the monthly return, and then the
            monthly investment is added:
        </p>
        <p>
            <strong>newBalance = oldBalance * (1 + monthlyReturn) + monthlyInvestment</strong>
        </p>

        <p>
            This process repeats month by month until the portfolio reaches the required
            amount.
        </p>
        </section>
      
    </main>
  );
}


function BalanceChart({ data }) {
  if (!data || data.length < 2) {
    return null;
  }

  const width = 700;
  const height = 320;

  const paddingLeft = 80;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 55;

  const maxMonth = Math.max(...data.map((point) => point.month));
  const maxBalance = Math.max(...data.map((point) => point.balance));

  const safeMaxMonth = maxMonth > 0 ? maxMonth : 1;
  const safeMaxBalance = maxBalance > 0 ? maxBalance : 1;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  function getX(month) {
    return paddingLeft + (month / safeMaxMonth) * chartWidth;
  }

  function getY(balance) {
    return paddingTop + chartHeight - (balance / safeMaxBalance) * chartHeight;
  }

  function formatEuro(value) {
    return `€${Math.round(value).toLocaleString()}`;
  }

  const xTicks = Array.from({ length: 6 }, (_, index) => {
    return Math.round((safeMaxMonth / 5) * index);
  });

  const yTicks = Array.from({ length: 6 }, (_, index) => {
    return (safeMaxBalance / 5) * index;
  });

  const linePoints = data
    .map((point) => `${getX(point.month)},${getY(point.balance)}`)
    .join(' ');

  const lastPoint = data[data.length - 1];

  return (
    <section>
      <h2>Balance Over Time</h2>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="balance-chart"
      >
        {yTicks.map((tick) => {
          const y = getY(tick);

          return (
            <g key={`y-${tick}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                className="chart-grid-line"
              />

              <text
                x={paddingLeft - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="chart-label"
              >
                {formatEuro(tick)}
              </text>
            </g>
          );
        })}

        {xTicks.map((tick) => {
          const x = getX(tick);

          return (
            <g key={`x-${tick}`}>
              <line
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={height - paddingBottom}
                className="chart-grid-line"
              />

              <text
                x={x}
                y={height - paddingBottom + 25}
                textAnchor="middle"
                className="chart-label"
              >
                {Math.round(tick / 12)}y
              </text>
            </g>
          );
        })}

        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          className="chart-axis"
        />

        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          className="chart-axis"
        />

        <polyline
          points={linePoints}
          fill="none"
          className="chart-line"
        />

        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="chart-label"
        >
          Years
        </text>

        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          className="chart-label"
          transform={`rotate(-90, 20, ${height / 2})`}
        >
          Balance
        </text>
      </svg>

      <p>
        After {lastPoint.month} months, the projected balance is{' '}
        <strong>€{lastPoint.balance.toFixed(2)}</strong>.
      </p>
    </section>
  );
}