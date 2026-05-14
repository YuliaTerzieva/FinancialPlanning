from typing import Optional, Literal
from pprint import pp

def annual_to_monthly_return(annual_return) -> float:
    """
    If we simpy divide by 12, that doesn't account for the compound interest
    """
    return (1 + annual_return) ** (1 / 12) - 1

def interest_accounted_for_inflation(interest: float, inflation = 0.0235) -> float:
    """
    The Fisher equation : 
    (1 + i) = (1+r)(1+pi)
    the same as
    r = ((1 + i) / (1 + pi)) - 1
    where :
        i = nominal interest
        r = real intrest
        pi = inflation
    """
    return ((1 + interest) / (1 + inflation)) - 1

def investment(
    monthly_investment: float,
    annual_return: Optional[float] = None,
    monthly_return: Optional[float] = None, 
    years: Optional[float] = None,
    target_amount: Optional[float] = None,
    starting_balance: float = 0.0,
    annual_inflation_rate: float = 0.0235,
    contribution_timing: Literal["end", "beginning"] = "end",
    max_years: int = 100,
) -> dict: # type: ignore
    """
    Monthly investing calculator for a World Index ETF.

    Use either:
    - annual_return: transformed to monthly using compound formula
    - monthly_return: used directly
    
    Use either:
    - years: calculate final portfolio value
    - target_amount: calculate time required to reach target

    inflation_rate:
        Expected annual inflation rate.

    return_type:
        "nominal":
            Uses annual_return directly.
            Final balance is in future euros.

        "real":
            Converts annual_return into inflation-adjusted return.
            Final balance is in today's euros.

    contribution_timing:
        "end": contribution is invested at the end of each month.
        "beginning": contribution is invested at the beginning of each month.
    """

    assert monthly_investment > 0, ValueError("monthly_investment must be non-negative.")
    assert (annual_return is not None or monthly_return is not None), ValueError("Provide either annual_return or monthly_return, but not both.")
    assert (years is not None or target_amount is not None), ValueError("Provide either years or target_amount, but not both.")
    assert annual_inflation_rate > -1, ValueError("annual_inflation_rate must be greater than -100%.")
    assert starting_balance >= 0, ValueError("starting_balance must be non-negative.")
    assert contribution_timing in ["end", "beginning"], ValueError("contribution_timing must be either 'end' or 'beginning'.")
    
    if annual_return is not None:
        annual_adjusted = interest_accounted_for_inflation(annual_return, annual_inflation_rate)
        monthly_return = annual_to_monthly_return(annual_adjusted)
    
    def apply_one_month(balance: float) -> float:
        if contribution_timing == "beginning":
            balance += monthly_investment
            balance *= 1 + monthly_return # type: ignore
        else:
            balance *= 1 + monthly_return # type: ignore
            balance += monthly_investment

        return balance

    if years is not None:
        months = round(years * 12)
        balance = starting_balance

        for _ in range(months):
            balance = apply_one_month(balance)

        return {
            "mode": "years_to_final_value",
            "monthly_investment": monthly_investment,
            "annual_return_input": annual_return,
            "annual_inflation_rate": annual_inflation_rate,
            "effective_annual_return_used": annual_adjusted,
            "monthly_return_used": monthly_return,
            "years_invested": months // 12,
            "extra_months_invested": months % 12,
            "total_months_invested": months,
            "starting_balance": starting_balance,
            "final_balance": balance,
        }

    if target_amount is not None:
        if target_amount <= starting_balance:
            return {
                "mode": "target_already_reached",
                "target_amount": target_amount,
                "starting_balance": starting_balance,
                "years_required": 0,
                "months_required": 0,
                "total_months_required": 0,
                "final_balance": starting_balance,
            }

        balance = starting_balance
        max_months = max_years * 12

        for month in range(1, max_months + 1):
            balance = apply_one_month(balance)

            if balance >= target_amount:
                return {
                    "mode": "target_amount",
                    "monthly_investment": monthly_investment,
                    "annual_return_input": annual_return,
                    "annual_inflation_rate": annual_inflation_rate,
                    "monthly_return_used": monthly_return,
                    "target_amount": target_amount,
                    "starting_balance": starting_balance,
                    "years_required": month // 12,
                    "months_required": month % 12,
                    "total_months_required": month,
                    "final_balance": balance,
                }

        return {
            "mode": "target_not_reached",
            "monthly_investment": monthly_investment,
            "annual_return_input": annual_return,
            "annual_inflation_rate": annual_inflation_rate,
            "monthly_return_used": monthly_return,
            "target_amount": target_amount,
            "starting_balance": starting_balance,
            "max_years": max_years,
            "final_balance": balance,
        }


tax_on_stocks = 0
annual_expence = 24_000
annual_expence_pre_tax = annual_expence / (1-tax_on_stocks)
print(f"Annual expence pre tax amount is {annual_expence_pre_tax}")
percentage = 0.04
required = annual_expence_pre_tax / percentage

print(f"Required amount is {required}")

result = investment(
    monthly_investment=200,
    annual_return=0.05, 
    starting_balance = 0,
    target_amount=required,
)

print(
    f"Time required: {result['years_required']} years "
    f"and {result['months_required']} months"
)

pp(f"All results {result}")