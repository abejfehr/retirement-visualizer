// https://flatuicolors.com/palette/in
import * as d3 from 'd3';

export default class RetirementChart {
  constructor(data, retirementAge, currentAge, endOfMoney, updateCallback) {
    this.data = this.type(data);
    this.retirementAge = retirementAge;
    this.currentAge = currentAge;
    this.endOfMoney = endOfMoney;

    this.isMouseDown = false;

    this.DURATION = 200;

    // Set the dimensions of the canvas / graph
    const margin = {
      top: 80,
      right: 0,
      bottom: 20,
      left: 0,
    };

    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    this.width = width;
    this.height = height;

    // Set the scales ranges
    this.x = d3.scaleTime().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);

    // Define the axes
    this.xAxis = d3.axisBottom().scale(this.x);
    this.yAxis = d3.axisLeft().scale(this.y);

    // create a line based on the data
    this.area = d3.area()
      .x((d) => { return this.x(d.year); })
      .y1((d) => { return this.y(d.money); });

    // Add the svg canvas
    this.svg = d3
      .select('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // set the domain range from the data
    this.x.domain(d3.extent(this.data, (d) => { return d.year; }));
    this.y.domain([
      0,
      d3.max(this.data, (d) => { return ~~(d.money); })
    ]);
    this.area.y0(this.y(0));

    // draw the area created above
    this.svg.append('path')
      .style('fill', '#9AECDB')
      .style('stroke', '#58B19F')
      .style('stroke-width', '2px')
      .attr('class', 'data line')
      .attr('d', this.area(this.data));

    // Add the X Axis
    this.svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'x axis')
      .call(this.xAxis);

    // Add the Y Axis
    // this.svg.append('g')
    //   .attr('class', 'y axis')
    //   .call(this.yAxis);

    const retirement = new Date((new Date()).getFullYear() + this.retirementAge - this.currentAge, 0, 1);
    var bisect = d3.bisector(function(d) { return d.year; }).left;
    var item = this.data[bisect(this.data, retirement)];
    this.svg.append('line')
      .attr('x1', this.x(retirement))
      .attr('y1', this.y(item.money) + 2)
      .attr('x2', this.x(retirement))
      .attr('y2', height)
      .attr('class', 'retirement line')
      .style('stroke-width', 3)
      .style('stroke-linecap', 'round')
      .style('stroke', '#FEA47F')
      .style('fill', 'none');

    this.svg.append('path')
      .attr('d', `M8 2.1c1.1 0 2.2 0.5 3 1.3 0.8 0.9 1.3 1.9 1.3 3.1s-0.5 2.5-1.3 3.3l-3 3.1-3-3.1c-0.8-0.8-1.3-2-1.3-3.3 0-1.2 0.4-2.2 1.3-3.1 0.8-0.8 1.9-1.3 3-1.3z`)
      .attr('class', 'retirement age marker')
      .style('fill', '#FEA47F')
      .attr('transform', `translate(${this.x(retirement) - 25}, ${this.y(item.money) - 38}) scale(3.1)`)

    this.svg.append('text')
      .attr('x', this.x(retirement))
      .attr('y', this.y(item.money) - 40)
      .attr('fill', '#2C3A47')
      .attr('text-anchor', 'middle')
      .attr('class', 'retirement age label')
      .text(`Retirement Age: ${this.retirementAge}`)

    if (this.endOfMoney) {
      const eom = new Date(this.endOfMoney, 0, 1);
      var bisect = d3.bisector(function(d) { return d.year; }).left;
      var eomItem = this.data[bisect(this.data, eom)];
      console.log('ddd', eom, eomItem);

      this.svg.append('path')
        .attr('d', `M8 2.1c1.1 0 2.2 0.5 3 1.3 0.8 0.9 1.3 1.9 1.3 3.1s-0.5 2.5-1.3 3.3l-3 3.1-3-3.1c-0.8-0.8-1.3-2-1.3-3.3 0-1.2 0.4-2.2 1.3-3.1 0.8-0.8 1.9-1.3 3-1.3z`)
        .attr('class', 'eom age marker')
        .style('fill', '#FEA47F')
        .attr('transform', `translate(${this.x(eom) - 25}, ${this.height - 38}) scale(3.1)`)

      this.svg.append('text')
        .attr('x', this.x(eom))
        .attr('y', this.height - 40)
        .attr('fill', '#2C3A47')
        .attr('text-anchor', 'middle')
        .attr('class', 'eom age label')
        .text(`Money runs out: ${this.endOfMoney}`)
    } else {
      this.svg.append('path')
        .attr('d', `M8 2.1c1.1 0 2.2 0.5 3 1.3 0.8 0.9 1.3 1.9 1.3 3.1s-0.5 2.5-1.3 3.3l-3 3.1-3-3.1c-0.8-0.8-1.3-2-1.3-3.3 0-1.2 0.4-2.2 1.3-3.1 0.8-0.8 1.9-1.3 3-1.3z`)
        .attr('class', 'eom age marker')
        .style('fill', '#FEA47F')
        .attr('transform', `translate(${10000}, ${this.height - 38}) scale(3.1)`)

      this.svg.append('text')
        .attr('x', 10000)
        .attr('y', this.height)
        .attr('fill', '#2C3A47')
        .attr('text-anchor', 'middle')
        .attr('class', 'eom age label')
        .text(`End of money: ${10000}`)
    }

    // handlers
    const klaz = this;
    this.svg
      .on('mousemove', function () {
        d3.event.preventDefault();
        if (klaz.isMouseDown) {
          updateCallback(d3.mouse(this)[0] / width);
        }
      })

    d3.select('body')
      .on('mousedown', () => {
        this.isMouseDown = true;
      })
      .on('mouseup', () => {
        this.isMouseDown = false;
      });
  }

  update(data, retirementAge, currentAge, endOfMoney) {
    this.data = this.type(data);
    this.retirementAge = retirementAge;
    this.currentAge = currentAge;
    this.endOfMoney = endOfMoney;

    this.x.domain(d3.extent(this.data, (d) => { return d.year; }));
    this.y.domain([
      0,
      d3.max(this.data, (d) => { return ~~(d.money); })
    ]);
    this.area.y0(this.y(0));

    var svg = d3.select('body').transition();
      svg.select('.data.line')
        .duration(0)
        .attr('d', this.area(this.data))
      svg.select('.x.axis')
        .duration(this.DURATION)
        .call(this.xAxis)
      svg.select('.y.axis')
        .duration(this.DURATION)
        .call(this.yAxis);
      const retirement = new Date((new Date()).getFullYear() + this.retirementAge - this.currentAge, 0, 1);
      var bisect = d3.bisector(function(d) { return d.year; }).left;
      var item = this.data[bisect(this.data, retirement)];
      svg.select('.retirement.line')
        .duration(0)
        .attr('x1', this.x(retirement))
        .attr('y1', this.y(item.money) + 2)
        .attr('x2', this.x(retirement))
        svg.select('.retirement.age.marker')
        .duration(0)
        .attr('transform', `translate(${this.x(retirement) - 25}, ${this.y(item.money) - 38}) scale(3.1)`)
      svg.select('.retirement.age.label')
        .duration(0)
        .attr('x', this.x(retirement))
        .attr('y', this.y(item.money) - 40)
        .text(`Retirement Age: ${this.retirementAge}`)

      if (this.endOfMoney) {
        const eom = new Date(this.endOfMoney, 0, 1);
        var bisect = d3.bisector(function(d) { return d.year; }).left;
        var eomItem = this.data[bisect(this.data, eom)];
        console.log('eom', eom, this.endOfMoney);
        svg.select('.eom.age.marker')
          .duration(0)
          .attr('transform', `translate(${this.x(eom) - 25}, ${this.height - 38}) scale(3.1)`)
        svg.select('.eom.age.label')
          .duration(0)
          .attr('x', this.x(eom))
          .attr('y', this.height - 40)
          .text(`Money runs out: ${this.endOfMoney}`)
        } else {
          svg.select('.eom.age.marker')
          .duration(0)
          .attr('transform', `translate(${10000}, ${this.height - 38}) scale(3.1)`)
        svg.select('.eom.age.label')
          .duration(0)
          .attr('x', 10000)
          .attr('y', this.height - 40)
          .text(`End of money: ${this.endOfMoney}`)
        }
      }

  parseDate (...args) {
    return d3.timeParse('%Y')(...args);
  }

  type(dataArray) {
    dataArray.forEach((d) => {
      d.year = this.parseDate(d.year);
      d.retention = +d.money;
    });
    return dataArray;
  }
}
