function makePlot3(data, response) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    // dynamic dimension sizing code adapted from
    // https://github.com/d3/d3-selection/issues/128
    const bbox = d3.select("#chart").node().getBoundingClientRect()

    const width = bbox.width;
    const height = bbox.height;
    const margin = {top: 50, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#chart").select("svg");

    const DURATION = 1000;

    // define colors
    const THEME_PURPLE = "#5D2BF0";
    const THEME_ORANGE = "#FF810F";
    const THEME_GREY = "#DDDDDD";

    var key = function(d) {
        return d.state;
    }


    /**************************
    ***** REMOVE OLD DATA *****
    **************************/


    /*************************
    ***** DATA WRANGLING *****
    *************************/

    /***********************
    ***** X & Y SCALES *****
    ***********************/

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.sun))
        .range([margin.right, plotWidth])
        .nice();

    const yScale = d3.scaleLog()
        .domain(d3.extent(data, d => d.btu_per_10k))
        .range([plotHeight, margin.bottom]);

    /***************************************
    ***** X AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // update x axis
    svg.select(".xAxis")
        .transition()
        .duration(DURATION)
        .call(d3.axisBottom(xScale)
            .ticks(5)
        );

    // x axis gridlines
    svg.select(".xGrid")
        .transition()
        .duration(DURATION)
        .call(d3.axisBottom(xScale)
            .ticks(5)
            .tickSize(-plotHeight)
            .tickFormat("")
        );

    // x axis label
    if (response.direction === "down") {
        svg.selectAll(".xLabel")
            .data([{"label": "Annual Average Global Horizontal Irradiance (kWh/m^2/day)"}])
            .transition()
            .duration(DURATION)
            .attr("class", "xLabel")
            .attr("transform", `translate(0, ${plotHeight + margin.bottom + 10})`)
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .attr("x", (0.5 * (plotWidth + margin.left)))
            .attr("y", margin.top - 25);
    } else {
        svg.selectAll(".xLabel")
            .data([{"label": "Annual Average Global Horizontal Irradiance (kWh/m^2/day)"}])
            .transition()
            .duration(DURATION)
            .attr("class", "xLabel")
            .attr("transform", `translate(0, ${plotHeight + margin.bottom + 10})`)
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .attr("x", (0.5 * (plotWidth + margin.left)))
            .attr("y", margin.top - 25);
    }

    /***************************************
    ***** Y AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // update y axis
    svg.select(".yAxis")
        .transition()
        .duration(DURATION)
        .call(d3.axisLeft(yScale)
            .tickValues([0.001, 0.01, 0.1, 1])
            .tickFormat(d3.format("0.1r"))
    );

    // y axis gridlines
    svg.select(".yGrid")
        .transition()
        .duration(DURATION)
        .call(d3.axisLeft(yScale)
            .tickValues([0.001, 0.01, 0.1, 1])
            .tickSize(-plotWidth)
            .tickFormat("")
        );

    /*****************
    ***** POINTS *****
    ******************/

    const plot = svg.select("#plot");

    // update points
    if (response.direction === "down") {
        plot.selectAll(".points")
            .data(data, key)
            .transition()
            .duration(DURATION)
            .attr("class", d => {
                if (d.region == "Northeast") {
                    return "points purple";
                } else {
                    return "points grey";
                }
            })
            .attr("id", d => d.state)
            .attr("cx", d => xScale(d.sun))
            .attr("cy", (d, i) => yScale(d.btu_per_10k))
            .attr("r", 4);
    } else {

        plot.selectAll(".rects").remove();

        plot.selectAll(".points")
            .data(data, key)
            .transition()
            .duration(DURATION)
            .attr("class", d => {
                if (d.region == "Northeast") {
                    return "points purple";
                } else {
                    return "points grey";
                }
            })
            .attr("id", d => d.state)
            .attr("cx", d => xScale(d.sun))
            .attr("cy", (d, i) => yScale(d.btu_per_10k))
            .attr("r", 4);

    }


    /***********************
    ***** POINT LABELS *****
    ***********************/

    if (response.direction === "up") {
        plot.selectAll(".barLabels").remove();
    };

    plot.selectAll(".pointLabel")
        .data(data, key)
        .transition()
        .duration(DURATION)
        .attr("class", d => {
            if (d.region == "Northeast") {
                return "pointLabel purple";
            } else {
                return "pointLabel grey";
            }
        })
        .attr("dominant-baseline", "auto")
        .attr("x", d => xScale(d.sun))
        .attr("y", (d, i) => yScale(d.btu_per_10k))
        .attr("dx", 7)
        .attr("dy", -7)
        .attr("opacity", 1);


    /**********************
    ***** FITTED LINE *****
    **********************/

    // OLS estimated in R: log(btu_per_10k) = -2.6330 + 0.3649(avg_sun)
    // just need a straight line with x, y following this formula
    function fitY(x) {
        return Math.pow(10, (-2.633 + (0.3649 * x)));
    };

    // code for appending line adapted from
    // https://stackoverflow.com/questions/25418333/how-to-draw-straight-line-in-d3-js-horizontally-and-vertically
    const xMin = d3.extent(data, d => d.sun)[0];
    const xMax = d3.extent(data, d => d.sun)[1];

    plot.append("line")
        .attr("class", "regressionLine")
        .attr("x1", xScale(xMin))
        .attr("y1", yScale(fitY(xMin)))
        .attr("x2", xScale(xMax))
        .attr("y2", yScale(fitY(xMax)))
        .attr("stroke", "#000000")
        .attr("stroke-dasharray", 4)
        .attr("opacity", 0)
        .transition()
        .duration(DURATION)
        .attr("opacity", 1);

    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.select("#header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Solar energy generated per capita in 2016 (BTUs)"}])
        .transition()
        .duration(DURATION)
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", margin.top - 10)
        .attr("text-anchor", "start");

    // Create footer grouping
    const footer = svg.select("#footer");

    // Caption with data source
    footer.selectAll(".captionText")
        .data([{"label": "Data source: SEDS (US Energy Information Administration)"}])
        .transition()
        .duration(DURATION)
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", height - 15)
        .attr("text-anchor", "start");

    /******************
    ***** LEGEND  *****
    ******************/

    // code below adapted from examples at https://d3-legend.susielu.com/

    var colorScale = d3.scaleOrdinal()
        .domain(["Northeast", "North Central, South & West"])
        .range(["rgb(93,43,240)", "rgb(221,221,221)"]);

    if (response.direction === "down") {
        // create new color legend
        svg.append("g")
            .attr("class", "colorLegend")
            .attr("transform", `translate(${margin.left}, ${1.5 * margin.top})`);

        var legend = d3.legendColor()
            .title("Region")
            .scale(colorScale);

        svg.select(".colorLegend")
            .call(legend)
            .attr("opacity", 0)
            .transition()
            .duration(DURATION)
            .attr("opacity", 1);
    } else {
        // move color legend back to original position
        svg.select(".colorLegend")
            .transition()
            .duration(DURATION)
            .attr("transform", `translate(${margin.left}, ${1.5 * margin.top})`);
    }



}
