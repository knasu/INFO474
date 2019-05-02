(function() {
  let data = "no data";
  let svgContainer = "";

  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
        .attr('width', 500)
        .attr('height', 500);

    d3.csv('./data/data.csv')
      .then((data) => makeScatterPlot(data));
  }

  function makeScatterPlot(csvData) {
    data = csvData;

    // get new array
    // csv treats data as strings, so use parseFloat to get float #
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility_rate"]))
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]))
    // console.log(fertility_rate_data)
    // console.log(life_expectancy_data)

    let minMaxData = findMinMax(fertility_rate_data, life_expectancy_data)
    console.log(minMaxData)

    let scaleAndMapFuncs = drawAxes(minMaxData, "fertility_rate", "life_expectancy")
    plotData(scaleAndMapFuncs)

  }

  // find min and max for arrays of x and y (arrays)
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

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    // takes in row of initial dataset and only returns fertility
    // x (string) is fertility rate. return the fertility rate data for that object
    // + means that want it as number
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    // scaleLInear make axes
    // returns function that translates points into point on svg
    let xScale = d3.scaleLinear()
    // buffer: 0.5 smaller than actually is (buffer on axes)
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([50, 450]); // plot has x margin of 50 on left and right

    // xMap returns a scaled x value from a row of data
    // takes row from data from csv file, pulls out x value using x value function,
    // sclaes it to point on svg using xscale function
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
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

  function plotData(mapFunctions) {
    let popData = data.map((row) => +row["pop_mlns"])
    let popMinMax = d3.extent(popData) // calls min and max 
    let pop_map_func = d3.scaleLinear()
      .domain([popMinMax[0], popMinMax[1]])
      .range([3, 30])

    let xMap = mapFunctions.x
    let yMap = mapFunctions.y

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap) // being called on each row of data so it returns appropriate svg value
        .attr('cy', yMap)
        .attr('r', (d) => pop_map_func(d["pop_mlns"]))
        .attr('fill', 'steelblue')
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(d.location + "<br/>" + numberWithCommas(d["pop_mlns"]*1000000))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
