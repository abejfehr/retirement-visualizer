import RetireBot from './RetireBot';
import RetirementChart from './RetirementChart';

const currentMoneyAN = new AutoNumeric(
	'[name=currentMoney]',
	9500,
).northAmerican();
const returnRateAN = new AutoNumeric(
	'[name=returnRate]',
	6.5,
	AutoNumeric.getPredefinedOptions().percentageUS2dec,
);
const inflationRateAN = new AutoNumeric(
	'[name=inflationRate]',
	2,
	AutoNumeric.getPredefinedOptions().percentageUS2dec,
);
const annualDrawdownAN = new AutoNumeric(
	'[name=annualDrawdown]',
	48000,
).northAmerican();
const annualContributionAN = new AutoNumeric(
	'[name=annualContribution]',
	25000,
).northAmerican();

let chart;

let currentAge = Number(document.querySelector('[name=currentAge]').value);
let retirementAge = Number(document.querySelector('[name=retirementAge]').value);
let inflationRate = Number(inflationRateAN.getNumericString());
let currentMoney = Number(currentMoneyAN.getNumericString());
let returnRate = Number(returnRateAN.getNumericString());
let annualDrawdown = Number(annualDrawdownAN.getNumericString());
let annualContribution = Number(annualContributionAN.getNumericString());

const redrawChart = () => {
  // This data needs to be totally dynamic based on user interaction
  let { data, endOfMoney } = RetireBot.getFiguresFor({
    currentAge,
    retirementAge,
    inflationRate: inflationRate / 100,
    currentMoney,
    returnRate: returnRate / 100,
    annualDrawdown,
    annualContribution,
  });

  // TODO: This data needs to be updated by user input

  // draw the chart
  chart.update(data, retirementAge, currentAge, endOfMoney);
}

let { data, endOfMoney } = RetireBot.getFiguresFor({
  currentAge,
  retirementAge,
  inflationRate: inflationRate / 100,
  currentMoney,
  returnRate: returnRate / 100,
  annualDrawdown,
  annualContribution,
});

chart = new RetirementChart(data, retirementAge, currentAge, endOfMoney, (ratio) => {
	retirementAge = currentAge + ~~((95 - currentAge) * ratio);

	document.querySelector('[name=retirementAge]').value = retirementAge;

  let { data, endOfMoney } = RetireBot.getFiguresFor({
		currentAge,
		retirementAge,
		inflationRate: inflationRate / 100,
		currentMoney,
		returnRate: returnRate / 100,
		annualDrawdown,
		annualContribution,
	});
	chart.update(data, retirementAge, currentAge, endOfMoney);
});

document.querySelector('[name=currentAge]').addEventListener('input', e => {
	currentAge = Number(e.target.value);
	if (currentAge <= 10 || currentAge > retirementAge) {
		return;
	}
	document.querySelector('[name=retirementAge]').setAttribute('min', currentAge);
	document.querySelector('[name=currentAge]').setAttribute('max', retirementAge);
	redrawChart();
});

document.querySelector('[name=retirementAge]').addEventListener('input', e => {
	retirementAge = Number(e.target.value);
	document.querySelector('[name=retirementAge]').setAttribute('min', currentAge);
	document.querySelector('[name=currentAge]').setAttribute('max', retirementAge);
	redrawChart();
});

document.querySelector('[name=currentMoney]').addEventListener('input', e => {
	currentMoney = Number(currentMoneyAN.getNumericString());
	redrawChart();
});

document.querySelector('[name=returnRate]').addEventListener('input', e => {
	returnRate = Number(returnRateAN.getNumericString());
	redrawChart();
});

document
	.querySelector('[name=annualContribution]')
	.addEventListener('input', e => {
		annualContribution = Number(annualContributionAN.getNumericString());
		redrawChart();
	});

document.querySelector('[name=annualDrawdown]').addEventListener('input', e => {
	annualDrawdown = Number(annualDrawdownAN.getNumericString());
	redrawChart();
});

document.querySelector('[name=inflationRate]').addEventListener('input', e => {
	inflationRate = Number(inflationRateAN.getNumericString());
	redrawChart();
});
