let isDragging = false;

const currentMoneyAN = new AutoNumeric('[name=currentMoney]', 9500).northAmerican();
const returnRateAN = new AutoNumeric('[name=returnRate]', 6.5, AutoNumeric.getPredefinedOptions().percentageUS2dec);
const inflationRateAN = new AutoNumeric('[name=inflationRate]', 2, AutoNumeric.getPredefinedOptions().percentageUS2dec);
const annualDrawdownAN = new AutoNumeric('[name=annualDrawdown]', 48000).northAmerican();
const annualContributionAN = new AutoNumeric('[name=annualContribution]', 25000).northAmerican();

let currentAge = Number(document.querySelector('[name=currentAge]').value);
let retirementAge = 65;
let inflationRate = Number(inflationRateAN.getNumericString());
const deathAge = 85;
const currentYear = (new Date()).getFullYear();
let currentMoney = Number(currentMoneyAN.getNumericString());
let returnRate = Number(returnRateAN.getNumericString());
let annualDrawdown = Number(annualDrawdownAN.getNumericString());
let annualContribution = Number(annualContributionAN.getNumericString());
let pastMonies;

const getMoney = () => {
  if (retirementAge < currentAge) { return pastMonies; }
  if (retirementAge <= 0) { return pastMonies; }
  if (currentAge <= 10) { return pastMonies; }

  const realReturnRate = (returnRate - inflationRate) / 100

  const monies = [];

  let previousMoney = currentMoney;
  let previousMoneyTest;

  for (let i = 0; i <= retirementAge - currentAge; ++i) {
    monies.push({
      year: currentYear + i,
      money: previousMoney + annualContribution + (previousMoney + annualContribution) * realReturnRate,
    });

    previousMoney = previousMoney + annualContribution + (previousMoney + annualContribution) * realReturnRate;
  }

  // For finding the max monies
  previousMoneyTest = previousMoney;
  for (let i = 0; i < deathAge - retirementAge; ++i) {
    previousMoneyTest = previousMoneyTest + annualContribution + (previousMoneyTest + annualContribution) * realReturnRate;
  }
  maxMonies = previousMoneyTest;

  for (let i = 0; i < deathAge - retirementAge; ++i) {
    monies.push({
      year: currentYear + (retirementAge - currentAge) + i,
      money: previousMoney - annualDrawdown + (previousMoney - annualDrawdown) * realReturnRate,
    });

    previousMoney = previousMoney - annualDrawdown + (previousMoney - annualDrawdown) * realReturnRate;
  }

  pastMonies = monies;
  return monies;
}

const start = (e) => {
  $(document).bind({
    'mousemove.line': step,
    'mouseup.line': stop,
  });
}

var step = function (e) {
  if (!isDragging) {
    isDragging = true;
  }
}

var stop = function () {
  if (isDragging) {
    isDragging = false;
  }
  $(document).unbind('.line');
}

let chart;

const chartOptions = {
  title: {
    text: '',
  },
  chart: {
    animation: false,
    type: 'area',
    renderTo: 'container',
    events: {
      redraw: function(event) {
        console.log('Chart loaded');
      }
    },
  },
  xAxis: {
    categories: getMoney().map(t => t.year),
    plotLines: [{
      color: '#f1d3fa',
      width: 3,
      value: retirementAge - currentAge,
      zIndex: 5,
    }],
  },
  yAxis: {
    gridLineWidth: 0,
    min: 0,
    title: {
      text: '',
    },
    // max: maxMonies,
  },
  plotOptions: {
    area: {
      marker: {
        enabled: false,
      },
      color: '#fad3eb',
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
        stops: [
          [0, '#fad3d3'],
          [1, '#faebd3'],
        ]
      },

    },
  },
  series: [{
    data: getMoney().map(t => t.money),
    showInLegend: false,
  }],
  tooltip: {
    formatter() {
      let series = this.point.series.chart.series;
      let index = this.point.series.xData.indexOf(this.point.x);
      let str = '';

      if (isDragging) {
        if (this.x < currentYear) { return; }
        console.log('setting retirement age to', this.x, currentYear, currentAge);
        retirementAge = (this.x - currentYear) + currentAge;
        isDragging = false;
        chart.xAxis[0].options.plotLines[0].value = retirementAge - currentAge;
        chart.series[0].setData(getMoney().map(t => t.money), true);
        chart.xAxis[0].update();
        chart.xAxis[0].plotLinesAndBands[0].svgElem
          .css({
            cursor: 'col-resize',
          })
          .on('mousedown', start);
        chart.redraw();
      }
      str = `${str}
      Year: ${this.x}<br>
      Money: $${(~~this.y).toLocaleString({ currency: 'CAD', style: 'currency' })}<br>
      ${isDragging ? 'Retirement Age: ' + retirementAge : ''}<br>
      Your age: ${this.x - (currentYear - currentAge)}`;

      return str;
    }
  },
};

chart = new Highcharts.Chart(chartOptions, chart => {
  chart.xAxis[0].plotLinesAndBands[0].svgElem
    .css({
      cursor: 'col-resize',
    })
    .translate(0, 0)
    .on('mousedown', start);
});



document.querySelector('[name=currentAge]').addEventListener('input', e => {
  currentAge = e.target.value;
  if (currentAge <= 10 || currentAge > retirementAge) { return; }
  chart.series[0].setData(getMoney().map(t => t.money), true);
  chart.xAxis[0].setCategories(getMoney().map(t => t.year), true);
  chart.xAxis[0].options.plotLines[0].value = retirementAge - currentAge;
  chart.xAxis[0].update();
  chart.xAxis[0].plotLinesAndBands[0].svgElem
    .css({
      cursor: 'col-resize',
    })
    .on('mousedown', start);
  chart.redraw();
});

document.querySelector('[name=currentMoney]').addEventListener('input', e => {
  currentMoney = Number.parseFloat(e.target.value);
  chart.series[0].setData(getMoney().map(t => t.money), true);
  chart.xAxis[0].setCategories(getMoney().map(t => t.year), true);
  chart.xAxis[0].options.plotLines[0].value = retirementAge - currentAge;
  chart.xAxis[0].update();
  chart.xAxis[0].plotLinesAndBands[0].svgElem
    .css({
      cursor: 'col-resize',
    })
    .on('mousedown', start);
  chart.redraw();

});

document.querySelector('[name=returnRate]').addEventListener('input', e => {
  returnRate = Number.parseFloat(e.target.value);
  chart.series[0].setData(getMoney().map(t => t.money), true);
  chart.xAxis[0].setCategories(getMoney().map(t => t.year), true);
  chart.xAxis[0].options.plotLines[0].value = retirementAge - currentAge;
  chart.xAxis[0].update();
  chart.xAxis[0].plotLinesAndBands[0].svgElem
    .css({
      cursor: 'col-resize',
    })
    .on('mousedown', start);
  chart.redraw();

});

document.querySelector('[name=annualContribution]').addEventListener('input', e => {
  annualContribution = Number.parseFloat(e.target.value);
  chart.series[0].setData(getMoney().map(t => t.money), true);
  chart.xAxis[0].setCategories(getMoney().map(t => t.year), true);
  chart.xAxis[0].options.plotLines[0].value = retirementAge - currentAge;
  chart.xAxis[0].update();
  chart.xAxis[0].plotLinesAndBands[0].svgElem
    .css({
      cursor: 'col-resize',
    })
    .on('mousedown', start);
  chart.redraw();

});

document.querySelector('[name=annualDrawdown]').addEventListener('input', e => {
  annualDrawdown = Number.parseFloat(e.target.value);
  chart.series[0].setData(getMoney().map(t => t.money), true);
  chart.xAxis[0].setCategories(getMoney().map(t => t.year), true);
  chart.xAxis[0].options.plotLines[0].value = retirementAge - currentAge;
  chart.xAxis[0].update();
  chart.xAxis[0].plotLinesAndBands[0].svgElem
    .css({
      cursor: 'col-resize',
    })
    .on('mousedown', start);
  chart.redraw();
});
