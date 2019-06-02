'use strict';

(function() {

  let data = "no data";

  let svgContainer = {
    svg: "",
    width: 900,
    height: 500,
    margin: 50
  }

  let svgTooltip = {
    svg: "",
    height: 270,
    width: 270,
    margin: 30
  }

  // load data and make scatter plot after window loads
  window.onload = function() {
    d3.select('body').append('text')
      .attr('class', 'title')
      .text("Travel Times from UW to SeaTac Airport Leading up to Holidays");

    svgContainer.svg = d3.select('body')
      .append('svg')
        .attr('class', 'container')
        .attr('width', svgContainer.width)
        .attr('height', svgContainer.height);
      
    d3.csv("./data/Averages.csv")
      .then((result) => {
        data = result
        makeBarGraph('2016')
      });
  }

  function makeBarGraph(year) {
    // get arrays of fertility rate data and life Expectancy data
    let travelTime_data = data.map((row) => parseFloat(row["Daily Mean Travel Time (Minutes)"]));
    // let holiday_data = data.map((row) => row["Holiday"]);
    let holiday_data = d3.map(data, function(d){return d.Holiday;}).keys()

    // find data limits
    let axesLimits = findMinMax(holiday_data, travelTime_data);
    console.log(axesLimits)

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Daily Mean Travel Time (Minutes)", svgContainer, {min: svgContainer.margin, max: svgContainer.height-svgContainer.margin}, {min: svgContainer.margin, max: svgContainer.height-svgContainer.margin});

    
    let years = d3.map(data, function(d){return d.Year;}).keys().sort()
    // console.log(yearArray)

    // plot data as points and add tooltip functionality
    plotBarData(mapFunctions, years);
    
    makeDropdown(years);
    
    svgContainer.svg.selectAll('rect')
      .attr('display', function(d) {
        if (year == d.Year) {
          return 'inline'
        } else {
          return 'none'
        }
      });

    svgContainer.svg.selectAll('text.year')
    .attr('display', function(d) {
      if (year == d.Year) {
        return 'inline'
      } else {
        return 'none'
      }
    });
    
    // draw title and axes labels
    makeLabels(svgContainer.svg, 'axis-container', 'Holiday', 'Travel Time (minutes)', svgContainer.width, svgContainer.height);   
  }

  function makeDropdown(years) {    
    let dropDownDiv = d3.select("body").append("div")
      .attr("class", "dropdown-div")
      .style('font-size', '15px');

    dropDownDiv.append("p")
      .text("Select a year");
    
    dropDownDiv.append("select")
      .attr("name", "dropdown")
      .style('font-size', '15px');

    var options = dropDownDiv.select("select").selectAll("options")
      .data(years)
      .enter()
      .append("option");
    
    options.text(function (d) { return d; })
      .attr("value", function (d) { return d; });

    dropDownDiv.select("select").on("change", function() {
      var selected = this.value;

      svgContainer.svg.selectAll('rect')
      .attr('display', function(d) {
        if (+selected == d.Year) {
          return 'inline'
        } else {
          return 'none'
        }
      });

      svgContainer.svg.selectAll('text.year')
        .attr('display', function(d) {
          if (+selected == d.Year) {
            return 'inline'
          } else {
            return 'none'
          }
        });
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

  function plotBarData(map, years) {
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    let barWidth = 30;

    // make tooltip
    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svgTooltip.svg = div.append('svg')
      .attr('width', svgTooltip.width)
      .attr('height', svgTooltip.height);

    for (let i = 0; i < years.length; i++) {
      let yearData = data.filter((row) => row["Year"] == years[i]);
      console.log(yearData)

      svgContainer.svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('text')
            .attr('x', (d) => +xMap(d.Holiday)+28)
            .attr('y', (d) => yMap(d) - 3)
            .attr('font-size', 12)
            .attr('class', (d) => { 
              if (d.Year == '2016') {
                return '2016 year'
              } else {
                return '2017 year'
              }
            })
            .text((d) => d["Daily Mean Travel Time (Minutes)"]);
      
      svgContainer.svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
          .attr('x', (d) => +xMap(d.Holiday)+28)
          .attr('y', yMap)
          .attr('class', 'bar ' + years[i])
          .attr('width', barWidth)
          // .attr('stroke', '#A9A9A9')
          .attr('stroke-width', 1.9)
          .attr('height', (d) => 450 - yMap(d))
          .attr('display', 'inline')
          .attr('fill', '#1B7CEB')
          .on('mouseover', (d) => {
            div.transition()
              .duration(200)
              .style('opacity', 1)
              .style('left', (d3.event.pageX) + 'px')
              .style('top', (d3.event.pageY - 28) + 'px');
            makeTooltipPlot(d);
          })
          .on('mouseout', (d) => {
            div.transition()
              .duration(500)
              .style('opacity', 0);
          });
    }
  }

  function makeTooltipPlot(d) {

    let tooltipData = {
      key : d.Holiday,
      values : [d.AM, d.Midday, d.PM, d.Evening, d['Early Morning']]
    }

    console.log(tooltipData)

    svgTooltip.svg.html("")

    // svgTooltip.append('text')
    //   .attr('y', svgTooltipMargin)
    //   .attr('x', svgTooltipDim/2 - 2*svgTooltipMargin)
    //   .attr('font-size', '8pt')
    //   .text("Average Travel Times by Period for " + tooltipData.holiday + " " + tooltipData.year);

    let xLabels = ['AM', 'Midday', 'PM', 'Evening', 'Early Morning']

    let axesLimits = findMinMax(xLabels, tooltipData.values)
    console.log(axesLimits)

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "life_expectancy", svgTooltip, {min: svgTooltip.margin, max: svgTooltip.width-svgTooltip.margin}, {min: svgTooltip.margin, max: svgTooltip.height-svgTooltip.margin});
    let xMap = d3.scaleBand().domain(xLabels).rangeRound([svgTooltip.margin, svgTooltip.width]).padding(0.3);
    let yMap = d3.scaleLinear().domain([0, d3.max(tooltipData.values)]).rangeRound([svgTooltip.height-svgTooltip.margin, svgTooltip.margin]);
    // let xMap = mapFunctions.x
    // let yMap = mapFunctions.y

    makeLabels(svgTooltip.svg, 'line-graph', 'Time of Day', 'Average Travel Time (Minutes)', svgTooltip.width, svgTooltip.height);

    let line = d3.line()
      .x(function(d,i) {return xMap(xLabels[i])})
      .y(function(d) {return yMap(d)});

    // var color = d3.scale.category10();

    var g = svgTooltip.svg.selectAll(".lineGroup")
      .data(data)
      .enter().append("g")
      .attr("class", "lineGroup " + tooltipData.key);

    g.append("path")
      .attr("class", "line")
      .attr("stroke", "#4e79a7")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 4)
      .attr("d", line(tooltipData.values))
      // .style("stroke", function(d,i) {
      //   return color(i);
      // })
      .attr("fill","none");
  }

  // draw the axes and ticks
  // function drawAxes(limits, x, y, svg, rangeX, rangeY) {
  function drawAxes(limits, y, svgElement, rangeX, rangeY) {
    let xMin = rangeX.min
    let xMax = rangeX.max
    let yMin = rangeY.min
    let yMax = rangeY.max

    // if (svg.attr('class') == 'scatter') {
    //   xMin = 40;
    // }

    // function to scale x value
    var xScale = d3.scaleBand()
      .domain(limits.xArray)
      .range([xMin, svgElement.width-svgElement.margin]);

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);

    // if (svg.attr('class') == 'scatter') {
    //   xAxis.ticks(5)
    // }

    //svg.append
    svgElement.svg.append("g")
      .attr('class', 'axis')
      .attr('transform', 'translate(0, ' + xMax + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, 0]) // give domain buffer
      .range([yMin, yMax]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);

    // if (svg.attr('class') == 'scatter') {
    //   yAxis.ticks(10)
    // }

    //svg.append
    svgElement.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + rangeY.min + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xScale,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    return {
      xArray : x,
      yMin : yMin,
      yMax : yMax
    }
  }
})();
