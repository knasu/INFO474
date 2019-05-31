'use strict';

(function() {

  let data = "no data";
  let svgContainer = "";
  let svgScatterPlot = "";
  let width = 1200;
  let height = 500;
  // let svgContainerDim = 500;
  // let svgContainerWidth = 
  let svgContainerMargin = 50;
  // let svgScatterMargin = 40;
  // let svgScatterDim = 260;

  // load data and make scatter plot after window loads
  window.onload = function() {
    d3.select('body').append('text')
      .attr('class', 'title')
      .text("Travel Times from UW to SeaTac Airport Leading up to Holidays");

    svgContainer = d3.select('body')
      .append('svg')
        .attr('class', 'container')
        .attr('width', width)
        .attr('height', height);
      
    d3.csv("./data/Averages.csv")
      .then((result) => {
        data = result
        makeLineGraph("2016")
      });
  }

  function makeLineGraph(year) {
    // get arrays of fertility rate data and life Expectancy data
    let travelTime_data = data.map((row) => parseFloat(row["Daily Mean Travel Time (Seconds)"]));
    let holiday_data = data.map((row) => row["Holiday"]);

    console.log(holiday_data)

    // find data limits
    let axesLimits = findMinMax(holiday_data, travelTime_data);
    console.log(axesLimits)

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Holiday", "Daily Mean Travel Time (Seconds)", {min: svgContainerMargin, max: height-svgContainerMargin}, {min: svgContainerMargin, max: height-svgContainerMargin});

    /*
    let countryArray = d3.map(data, function(d){return d.location;}).keys().sort()

    // plot data as points and add tooltip functionality
    plotData(mapFunctions, countryArray);
    makeDropdown(countryArray);

    svgContainer.selectAll("path.line")
      .attr("display", "none");

    svgContainer.select("path." + year)
      .attr("display", "inline");

    // draw title and axes labels
    makeLabels(svgContainer, 'axis-container', 'Time (years)', 'Population (millions)', svgContainerDim, svgContainerDim);

    d3.select('svg').append('text')
      .attr('class', 'year')
      .attr('font-weight', 'bold')
      .attr('x', 75)
      .attr('y', 420)
      .attr('fill', '#737373')
      .style('font-size', '24pt')
      .text(year)
    */
  }

  function makeDropdown(countries) {    
    let dropDownDiv = d3.select("body").append("div")
      .attr("class", "dropdown-div")

    dropDownDiv.append("p")
      .text("Select a year")
    
    dropDownDiv.append("select")
      .attr("name", "dropdown");

    var options = dropDownDiv.select("select").selectAll("options")
      .data(countries)
      .enter()
      .append("option");
    
    options.text(function (d) { return d; })
      .attr("value", function (d) { return d; });

    dropDownDiv.select("select").on("change", function() {
      var selected = this.value;

      svgContainer.selectAll("path.line")
        .attr("display", "none");

      svgContainer.selectAll("." + selected)
        .attr("display", "inline");

      svgContainer.select("text.year")
        .text(selected)
    });
  }
  

  // make title and axes labels
  function makeLabels(svg, className, xLabel, yLabel, x, y) {
    let xScaled = x*0.4
    let yScaled = y*0.6

    svg.append('text')
      .attr('class', className)
      .attr('x', xScaled)
      .attr('y', y-(yScaled*0.04))
      .text(xLabel);

    svg.append('text')
      .attr('class', className)
      .attr('transform', 'translate(15, ' + yScaled + ')rotate(-90)')
      .text(yLabel);
  }

  function plotData(map, countries) {
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svgScatterPlot = div.append('svg')
      .attr('width', svgScatterDim)
      .attr('height', svgScatterDim);

    let line = d3.line()
      .x((d) => xMap(d))
      .y((d) => yMap(d));

    for (let i = 0; i < countries.length; i++) {
      let countryData = allYearsData.filter((row) => row["location"] == countries[i]);

      svgContainer.append('path')
        .datum(countryData)
        .attr('class', countries[i] + " line")
        .attr("fill", "none")
        .attr("stroke", "#4e79a7")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4)
        .attr("d", line)
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", 1)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

          makeScatterPlot();
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
    }
  }

  function makeScatterPlot() {
    svgScatterPlot.html("")
      .attr('class', 'scatter');

    svgScatterPlot.append('text')
      .attr('y', svgScatterMargin/2)
      .attr('x', svgScatterDim/2 - 2*svgScatterMargin)
      .attr('font-size', '8pt')
      .text("Fertility Rate vs. Life Expectancy");

    let fertility_rate_data = allYearsData.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = allYearsData.map((row) => parseFloat(row["life_expectancy"]));

    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy", svgScatterPlot, {min: svgScatterMargin, max: svgScatterDim-svgScatterMargin}, {min: svgScatterMargin, max: svgScatterDim-svgScatterMargin});
    let xMap = mapFunctions.x;
    let yMap = mapFunctions.y;

    makeLabels(svgScatterPlot, 'axis-scatter', 'Fertility Rate', 'Life Expectancy', svgScatterDim, svgScatterDim);

    svgScatterPlot.selectAll('.dot')
      .data(allYearsData)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 1)
        .attr('opacity', '0.8')
        .attr('fill', "#4e79a7");
  }

  // draw the axes and ticks
  // function drawAxes(limits, x, y, svg, rangeX, rangeY) {
  function drawAxes(limits, x, y, rangeX, rangeY) {
    let xMin = rangeX.min
    let xMax = rangeX.max
    let yMin = rangeY.min
    let yMax = rangeY.max

    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // if (svg.attr('class') == 'scatter') {
    //   xMin = 40;
    // }

    // function to scale x value
    var xScale = d3.scaleBand()
      .domain(limits.xArray)
      .rangeRound([xMin, width-svgContainerMargin]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);

    // if (svg.attr('class') == 'scatter') {
    //   xAxis.ticks(5)
    // }

    //svg.append
    svgContainer.append("g")
      .attr('class', 'axis')
      .attr('transform', 'translate(0, ' + xMax + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin]) // give domain buffer
      .range([yMin, yMax]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);

    // if (svg.attr('class') == 'scatter') {
    //   yAxis.ticks(10)
    // }

    //svg.append
    svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + rangeY.min + ', 0)')
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
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xArray : x,
      yMin : yMin,
      yMax : yMax
    }
  }
})();