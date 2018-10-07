// http://www.moneychimp.com/articles/finworks/fmbasinv.htm

export default class RetireBot {

  static compoundInterest({
    P,
    r,
    n,
    t,
    c,
  }) {
    // Assumes contribution is at the end of each year
    // return P * (1 + r) ** t + c * (((1 + r) ** t + 1 - (1 + r)) / r );
    // return P * (1 + (r / n)) ** (n * t)
    return P * (1 + (r / n)) ** (n * t) + c * ( ((1 + (r / n)) ** (n * t) - 1) / r );
  }

  static getFiguresFor({
    currentAge,
    retirementAge,
    inflationRate,
    currentMoney,
    returnRate,
    annualDrawdown,
    annualContribution,
  }) {
    const MAX_AGE= 95;

    const data = [];
    const today = new Date();
    const thisYear = today.getFullYear();

    let money;

    for (let i = currentAge; i <= retirementAge; ++i) {
      money = this.compoundInterest({
        P: currentMoney,
        r: (returnRate - inflationRate),
        n: 365,
        t: i - currentAge,
        c: annualContribution,
      });
      data.push({
        year: thisYear + i - currentAge,
        money,
      });
    }

    const retirementMoney = money;

    let endOfMoney;

    for (let i = retirementAge; i < MAX_AGE; ++i) {
      money = this.compoundInterest({
        P: retirementMoney,
        r: (returnRate - inflationRate),
        n: 365,
        t: i - retirementAge,
        c: -annualDrawdown,
      });
      if (money < 0 && !endOfMoney) {
        endOfMoney = thisYear + i - currentAge - 1;
      }
      data.push({
        year: thisYear + i - currentAge,
        money,
      });
    }

    return { data, endOfMoney };
  }
}
