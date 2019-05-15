'use strict';

/*
1. Load in the dataEveryYear.csv file instead of the data.csv file.
2. Change the code so that the scatter plot only plots data for the year 2000
3. Make another 500 by 500 SVG and append it to the body tag
4. Add a function to the onmouseover in plotData that fills out the second SVG
5. This function should plot a line graph of time (x-axis) vs life expectancy (y-axis) for the country which the user is hovering over
   Hint: there are already functions defined to make a scatter plot of fertility rate vs life expectancy. You can rewrite some of these functions to be more generalized so that you can reuse them to plot the line graph

*/

(function() {

  let data = "no data";
  let allYearsData = "";
  let svgContainer = ""; // keep SVG reference in global scope
  let svgLineGraph = "";

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

    // svgLineGraph = d3.select('body')
    //   .append('svg')
    //   .attr('width', 500)
    //   .attr('height', 500);

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/dataEveryYear.csv")
      .then((csvData) => {
        allYearsData = csvData;
        data = csvData;
        makeScatterPlot(2000);
      });
  }

  // make scatter plot with trend line
  function makeScatterPlot(year) {
    // data = csvData // assign data as global variable
    // return all rows where time == 2000
    data = allYearsData.filter((row) => (row["time"] == year))

    // get arrays of fertility rate data and life Expectancy data
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));

    // find data limits
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy", svgContainer, {min: 50, max: 450}, {min: 50, max: 450});
    // let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy", svgContainer);

    let select = d3.select('body').append('select');

    select.append('option')
      .attr('value', 1999)
      .html("1999");
    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Countries by Life Expectancy and Fertility Rate");

    svgContainer.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Fertility Rates (Avg Children per Woman)');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Life Expectancy (years)');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    let pop_data = data.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svgLineGraph = div.append('svg')
      .attr('width', 150)
      .attr('height', 150);

    let divInfo = div.append('div')

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', (d) => pop_map_func(d["pop_mlns"]))
        .attr('fill', "#4286f4")
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          makeLineGraph(d["location"]);
          divInfo.html(d.location + "<br/>" + numberWithCommas(d["pop_mlns"]*1000000) + "<br/>")

          // div.html(d.location + "<br/>" + numberWithCommas(d["pop_mlns"]*1000000) + "<br/>")
          //   .style("left", (d3.event.pageX) + "px")
          //   .style("top", (d3.event.pageY - 28) + "px");
          div
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          // fills out 2nd svg
          
          // svgLineGraph.html(d.location)
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }


  function makeLineGraph(location) {
    // "" empty all html in the svg
    svgLineGraph.html("")

    let locationData = allYearsData.filter((row) => row["location"] == location)
    let yearData = locationData.map((row) => +row["time"])
    let lifeExpectancyData = locationData.map((row) => +row["life_expectancy"])
    // console.log(yearData, lifeExpectancyData)

    let minMaxData = findMinMax(yearData, lifeExpectancyData)
    // minMaxData.xMin = 10
    // minMaxData.xMax = 100
    let funcs = drawAxes(minMaxData, "time", "life_expectancy", svgLineGraph)
    plotLineGraph(funcs, locationData)
  }

  function plotLineGraph(funcs, data) {
    let line = d3.line()
      .x((d) => funcs.x(d))
      .y((d) => funcs.y(d))

    // what id data vs. datum? use datum for paths
    // line returns function that produces the path
    svgLineGraph.append("path")
      .datum(data)
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svg.append("g")
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {
    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
