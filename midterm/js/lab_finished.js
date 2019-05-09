'use strict';

(function() {

  let data = ""; // keep data in global scope
  let svgContainer = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("../data/Admission_Predict.csv")
      .then((csvData) => makeScatterPlot(csvData));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData;

    // get an array of gre scores and an array of chance of admit
    let greScores = data.map((row) => parseInt(row["GRE Score"]));
    let admissionRates = data.map((row) => parseFloat(row["Admit"]));

    let axesLimits = findMinMax(greScores, admissionRates);

    // draw axes with ticks and return mapping and scaling functions
    let mapFunctions = drawTicks(axesLimits);

    // plot the data using the mapping and scaling functions
    plotData(mapFunctions);

    // plot the trend line using gre scores, admit rates, axes limits, and
    // scaling + mapping functions
    plotTrendLine(greScores, admissionRates, axesLimits, mapFunctions);
  }

  // plot all the data points on the SVG
  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 3)
        .attr('fill', "#4286f4");
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    // return gre score from a row of data
    let xValue = function(d) { return +d["GRE Score"]; }

    // function to scale gre score
    let xScale = d3.scaleLinear()
      .domain([limits.greMin - 5, limits.greMax]) // give domain buffer room
      .range([50, 450]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return Chance of Admit from a row of data
    let yValue = function(d) { return +d.Admit}

    // function to scale Chance of Admit
    let yScale = d3.scaleLinear()
      .domain([limits.admitMax, limits.admitMin - 0.05]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for GRE Scores and Chance of Admit
  function findMinMax(greScores, admissionRates) {

    // get min/max gre scores
    let greMin = d3.min(greScores);
    let greMax = d3.max(greScores);

    // round x-axis limits
    greMax = Math.round(greMax*10)/10;
    greMin = Math.round(greMin*10)/10;

    // get min/max admit chance
    let admitMin = d3.min(admissionRates);
    let admitMax = d3.max(admissionRates);

    // round y-axis limits to nearest 0.05
    admitMax = Number((Math.ceil(admitMax*20)/20).toFixed(2));
    admitMin = Number((Math.ceil(admitMin*20)/20).toFixed(2));

    // return formatted min/max data as an object
    return {
      greMin : greMin,
      greMax : greMax,
      admitMin : admitMin,
      admitMax : admitMax
    }
  }

  // plot trend a line on SVG
  // greScores -> array of greScores
  // admitRates -> array of Chance of Admit
  // limits -> min/max data for GRE Scores and Chance of Admit
  // scale -> scaling functions for x and y
  function plotTrendLine(greScores, admitRates, limits, scale) {

    // use linear regression code from previous lab to get coefficients
    let leastSquareCoefficients = linearRegression(greScores, admitRates);
    let a = leastSquareCoefficients.a;
    let b = leastSquareCoefficients.b;

    // find and initial and end points for the trend line
    let x1 = limits.greMin;
    let y1 = a*x1 + b;
    let x2 = limits.greMax;
    let y2 = a*x2 + b;
    let trendData = [[x1,y1,x2,y2]];

    // append trend line to SVG and assign attributes
    let xScale = scale.xScale;
    let yScale = scale.yScale;
    let trendLine = svgContainer.selectAll('.trendLine')
      .data(trendData)
      .enter()
      .append('line')
      .attr('x1', function(d) { return  xScale(d[0]); })
      .attr("y1", function(d) { return yScale(d[1]); })
			.attr("x2", function(d) { return xScale(d[2]); })
			.attr("y2", function(d) { return yScale(d[3]); })
      .attr('stroke', 'black')
      .attr('stroke-width', 2);
  }

  /*********************************************************
                      Regression Functions
*********************************************************/

function linearRegression(independent, dependent)
  {
      let lr = {};

      let independent_mean = arithmeticMean(independent);
      let dependent_mean = arithmeticMean(dependent);
      let products_mean = meanOfProducts(independent, dependent);
      let independent_variance = variance(independent);

      lr.a = (products_mean - (independent_mean * dependent_mean) ) / independent_variance;

      lr.b = dependent_mean - (lr.a * independent_mean);

      return lr;
  }


  function arithmeticMean(data)
  {
      let total = 0;

      // note that incrementing total is done within the for loop
      for(let i = 0, l = data.length; i < l; total += data[i], i++);

      return total / data.length;
  }


  function meanOfProducts(data1, data2)
  {
      let total = 0;

      // note that incrementing total is done within the for loop
      for(let i = 0, l = data1.length; i < l; total += (data1[i] * data2[i]), i++);

      return total / data1.length;
  }


  function variance(data)
  {
      let squares = [];

      for(let i = 0, l = data.length; i < l; i++)
      {
          squares[i] = Math.pow(data[i], 2);
      }

      let mean_of_squares = arithmeticMean(squares);
      let mean = arithmeticMean(data);
      let square_of_mean = Math.pow(mean, 2);
      let variance = mean_of_squares - square_of_mean;

      return variance;
  }

})();
