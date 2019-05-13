

(function() {

    let data = ""; // keep data in global scope
    let svgContainer = ""; // keep SVG reference in global scope
  
    // load data and make scatter plot after window loads
    window.onload = function() {
      // TODO: use d3 select, append, and attr to append a 500x500 SVG to body
      svgContainer = d3.select('body').select('div').append('svg')
        .attr('width', 800)
        .attr('height', 500)
        .attr('class', 'svg');
  
    //   svgContainer.append('text')
    //     .attr('x', 90)
    //     .attr('y', 11)
    //     .text('Week 3, Lecture 2: GRE Score vs Chance of Admit');
  
      // TODO: use d3.csv to load in Admission Predict data and then call the
      // makeScatterPlot function and pass it the data
      // d3.csv is basically fetch but it can be be passed a csv file as a parameter
      // https://www.tutorialsteacher.com/d3js/loading-data-from-file-in-d3js
      d3.csv('data/Seasons.csv')
        .then((data) => makeBarChart(data));
    }
  
    // make scatter plot with trend line
    function makeBarChart(csvData) {
  
      data = csvData;
      console.log(data);
      // get an array of gre scores and an array of chance of admit
      let year = data.map((row) => parseInt(row["Year"]));
      let avgViewers = data.map((row) => parseFloat(row["Avg. Viewers (mil)"]));
  
      // TODO: go to findMinMax and fill it out below
      let axesLimits = findMinMax(year, avgViewers);
      console.log(axesLimits);
  
      // TODO: go to drawTicks and fill it out below
      let mapFunctions = drawTicks(axesLimits);
      console.log(mapFunctions);
      // TODO: go to plotData function and fill it out
      plotData(mapFunctions);

      makeFilter();
  
      // plot the trend line using gre scores, admit rates, axes limits, and
      // scaling + mapping functions
    //   plotTrendLine(year, avgViewers, axesLimits, mapFunctions);
  
    }
  
    // plot all the data points on the SVG
    function plotData(map) {
        let xMap = map.x;
        let yMap = map.y;

        let barWidth = 22

        // make tooltip
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let seasonHeader = div.append("h3")
          .attr('class', 'header')

        let divFields = div.append("div")
            .attr('class', 'tooltip-fields')

        let divValues = div.append("div")
            .attr('class', 'tooltip-vals')
  
        // append data to SVG and plot as points
        // Use the selectAll, data, enter, append, and attr functions to plot all
        // the data points. selectAll should be passed a parameter '.dot'
        // data should be passed the global data variable as a parameter
        // The points should have attributes:
        // 'cx' -> xMap
        // 'cy' -> yMap
        // 'r' -> 3
        // 'fill' -> #4286f4
        // See here for more details:
        // https://www.tutorialsteacher.com/d3js/data-binding-in-d3js
        svgContainer.selectAll('.dot')
          .data(data)
          .enter()
          .append('text')
            .attr('x', (d) => xMap(d) - barWidth/2)
            .attr('y', (d) => yMap(d) - 3)
            .attr('font-size', 12)
            .attr('class', (d) => { 
              if (d.Data == "Estimated") {
                return 'Estimated'
              } else {
                return 'Actual'
              }
            })
            .text((d) => d["Avg. Viewers (mil)"]);

        svgContainer.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
                .attr('class', 'bar')
                .attr('x', (d) => xMap(d) - barWidth/2)
                .attr('y', yMap)
                .attr('width', barWidth)
                .attr('stroke', '#A9A9A9')
                .attr('stroke-width', 1.7)
                .attr('height', (d) => 450 - yMap(d))
                .attr('fill', (d) => { 
                    if (d.Data == "Estimated") {
                      return '#adadad'
                    } else {
                      return '#70B8EB'
                    }
                  })
                .on("mouseover", (d) => {
                    div.transition()
                      .duration(200)
                      .style("opacity", .9);
                    
                    seasonHeader.text("Season #" + d.Year)
                    
                    divFields.html("Year: " + "<br/>" + "Episodes: " + "<br/>" + "Avg. Viewers (mil): "+ "<br/>" + "<br/>" + "Most Watched Episode: " + "<br/>" + "Viewers (mil): ")
                    divValues.html(d.Year + "<br/>" + d.Episodes + "<br/>" + d["Avg. Viewers (mil)"] + "<br/>" + "<br/>" + d["Most watched episode"] + "<br/>" + d["Viewers (mil)"])
            
                    div
                      .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
            
                  })
                  .on("mouseout", (d) => {
                    div.transition()
                      .duration(500)
                      .style("opacity", 0);
                  });
  
    }

    function makeFilter() {
      svgContainer.append('rect')
        .attr('x', 585)
        .attr('y', 70)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', '#70B8EB');


      svgContainer.append('rect')
        .attr('x', 585)
        .attr('y', 90)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', '#adadad');

      // filterDiv = svgContainer.append("div")
      actual = svgContainer.append('text')
        .attr('class', 'data-type')
        .attr('x', 600)
        .attr('y', 80)
        .text('Actual');
      
      estimated = svgContainer.append('text')
        .attr('class', 'data-type')
        .attr('x', 600)
        .attr('y', 100)
        .text('Estimated');

      let lastClick = "";
      svgContainer.selectAll(".data-type").on("click", function() {

        let dataType = this.textContent;
        console.log(dataType)

        if (lastClick == dataType) {
          lastClick = "";
          svgContainer.selectAll(".bar")
            .filter(function(d) {return dataType != d.Data;})
            .style("opacity", 1.0);

            svgContainer.selectAll("." + dataType)
              .style("opacity", 1.0)
        } else {
          lastClick = dataType
          svgContainer.selectAll(".bar")
            .filter(function(d) {return dataType != d.Data;})
            .style("opacity", 0.2);
      
          svgContainer.selectAll(".bar")
            .filter(function(d) {return dataType == d.Data;})
            .style("opacity", 1.0);

          svgContainer.selectAll("." + dataType)
            .style("opacity", 0.2)
        }
      });
    }
  
  
    // draw the axes and ticks
    function drawTicks(limits) {
      // return gre score from a row of data
      let xValue = function(d) { return +d["Year"]; }
  
      // TODO: Use d3 scaleLinear, domain, and range to make a scaling function. Assign
      // the function to variable xScale. Use a range of [50, 450] and a domain of
      // [limits.greMin - 5, limits.greMax]
      // See here for more details:
      // https://www.tutorialsteacher.com/d3js/scales-in-d3
      let xScale = d3.scaleLinear()
        .domain([limits.yearMin, limits.yearMax])
        .range([70, 750]);
  
      // xMap returns a scaled x value from a row of data
      let xMap = function(d) { return xScale(xValue(d)); };
  
      // TODO: Use d3 axisBottom and scale to make the x-axis and assign it to xAxis
      // xAxis will be a function
      // See here for more details:
      // https://www.tutorialsteacher.com/d3js/axes-in-d3
      let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(18)
        .tickFormat(d3.format("d"))
        .tickSize(0);
  
      // TODO: use d3 append, attr, and call to append a "g" element to the svgContainer
      // variable and assign it a 'transform' attribute of 'translate(0, 450)' then
      // call the xAxis function
      // .attr('transform', 'translate(15, 300)rotate(-90)')
      svgContainer.append('g')
        .attr('transform', 'translate(-20, 450)')
        .call(xAxis)
        .selectAll("text")	
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "2em")
          .attr("transform", "rotate(-90)");

      // svgContainer.append('text')
      //   .attr('x', 400)
      //   .attr('y', 500)
      //   .text('Year');
  
      // return Avg. Viewers from a row of data
      let yValue = function(d) { return +d["Avg. Viewers (mil)"];}
  
      // TODO: make a linear scale for y. Use a domain of [limits.admitMax, limits.admitMin - 0.05]
      // Use a range of [50, 450]
  
      let yScale = d3.scaleLinear()
        .domain([limits.viewMax + 2, 0])
        .range([50, 450]);
  
      // yMap returns a scaled y value from a row of data
      let yMap = function (d) { return yScale(yValue(d)); };
  
      // TODO: use axisLeft and scale to make the y-axis and assign it to yAxis
      let yAxis = d3.axisLeft().scale(yScale)
        .tickSize(0)
        .tickValues([0, 5, 10, 15, 20, 25, 30]);
      // yAxis.tickValues(_.range(0, 30))
      // yAxis.tickValues([0, 5, 10, 15, 20, 25, 30])
  
      // TODO: append a g element to the svgContainer
      // assign it a transform attribute of 'translate(50, 0)'
      // lastly, call the yAxis function on it
      svgContainer.append('g')
        .attr('transform', 'translate(50, 0)')
        .call(yAxis);
  
      svgContainer.append('text')
        .attr('transform', 'translate(15, 300)rotate(-90)')
        .text('Viewers (mil)');
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
  
      // TODO: Use d3.min and d3.max to find the min/max of the greScores array
      let yearMin = d3.min(greScores);
      let yearMax = d3.max(greScores);
  
      console.log(yearMin, yearMax);
  
      // TODO: Use d3.min and d3.max to find the min/max of the  admissionRates array
  
      let viewMin = d3.min(admissionRates);
      let viewMax = d3.max(admissionRates);

      console.log(viewMin, viewMax)

      // return formatted min/max data as an object
      return {
        yearMin : yearMin,
        yearMax : yearMax,
        viewMin : viewMin,
        viewMax : viewMax
      }
    }
 
  })();
  