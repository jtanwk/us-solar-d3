function makePlot2(data, response) {

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

    var key = function(d) {
        return d.state;
    }

    /**************************
    ***** REMOVE OLD DATA *****
    **************************/

    if (response.direction === "down") {

        svg.selectAll("path")
            .transition()
            .duration(DURATION)
            .attr("opacity", 0)
            .remove();

        // remove all other labels
        svg.select("#plot")
            .selectAll(".lineLabel")
            .filter(function(d) {
                const id = this.getAttribute('id');
                return id != "Solar, Residential"
            })
            .remove();

        // let Solar Residential label persist a little longer
        svg.select("#plot")
            .selectAll(".lineLabel")
            .filter(function(d) {
                const id = this.getAttribute('id');
                return id === "Solar, Residential"
            })
            .transition()
            .delay(DURATION)
            .attr("opacity", 0);

    }

    /*************************
    ***** DATA WRANGLING *****
    *************************/

    // should have done this in R but... here we r
    // sort data by dev_fr_median
    data.sort(function(a, b) {
        return a.dev_fr_median - b.dev_fr_median;
    });

    /***********************
    ***** X & Y SCALES *****
    ***********************/

    const xScale = d3.scaleLog()
        .domain(d3.extent(data, d => d.dev_fr_median))
        .range([margin.left, plotWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, (d, i) => i))
        .range([plotHeight, margin.bottom])
        .nice();

    /***************************************
    ***** X AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // x axis
    svg.select(".xAxis")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(0, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xScale)
            .ticks(4)
            .tickFormat(d => d + "x")
    );

    // x axis gridlines
    svg.select(".xGrid")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(0, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xScale)
            .ticks(4)
            .tickSize(-(plotHeight))
            .tickFormat(""));

    // x axis label
    svg.selectAll(".xLabel")
        .data([{"label": "Solar Energy per capita Generated (BTUs)"}])
        .transition()
        .duration(DURATION)
        .text(d => d.label);

    /***************************************
    ***** Y AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // y axis
    svg.select(".yAxis")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .tickValues([])
        );

    // y axis gridlines
    svg.select(".yGrid")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisBottom(xScale)
            .tickValues([])
        );

    /*****************
    ***** POINTS *****
    ******************/

    const plot = svg.select("#plot");

    if (response.direction === "down") {
        plot
            .transition()
            .duration(DURATION)
            .attr("transform", `translate(0, ${margin.top})`);

        plot.selectAll(".points")
            .data(data, key)
            .enter()
            .append("circle")
            .attr("id", d => d.state)
            .attr("cy", yScale(40.5))
            .attr("cx", xScale(30))
            .attr("r", 0)
            .attr("class", "points purple")
            .transition()
            .duration(DURATION)
            .attr("r", 3)
            .transition()
            .duration(DURATION)
            .attr("class", d => {
                if (d.dev_fr_median > 1) {
                    return "points orange";
                } else {
                    return "points purple";
                }
            })
            .attr("cy", (d, i) => yScale(i))
            .attr("cx", d => xScale(d.dev_fr_median));
    } else {
        plot.selectAll(".points")
            .data(data, key)
            .transition()
            .duration(DURATION)
            .attr("class", d => {
                if (d.dev_fr_median > 1) {
                    return "points orange";
                } else {
                    return "points purple";
                }
            })
            .attr("cy", (d, i) => yScale(i))
            .attr("cx", d => xScale(d.dev_fr_median));
    }


    /***********************
    ***** POINT LABELS *****
    ***********************/

    // if entering from line chart, append new text labels for each point
    // else, if entering from scatterplot, transition existing text labels
    //      to appropriate color and position

    if (response.direction === "down") {
        plot.selectAll(".pointLabel")
            .data(data, key)
            .enter()
            .append("text")
            .attr("class", d => {
                if (d.dev_fr_median > 1) {
                    return "pointLabel orange";
                } else {
                    return "pointLabel purple";
                }
            })
            .attr("y", yScale(40.5))
            .attr("x", xScale(30))
            .text(d => d.state)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("opacity", 0)
            .transition()
            .duration(DURATION)
            .attr("opacity", 0)
            .transition()
            .duration(DURATION)
            .attr("opacity", 1)
            .attr("y", (d, i) => yScale(i))
            .attr("x", d => {
                if (d.dev_fr_median > 1) {
                    return xScale(d.dev_fr_median * 1.15);
                } else {
                    return xScale(d.dev_fr_median * 0.75);
                }
            });
    } else {
        plot.selectAll(".pointLabel")
            .data(data, key)
            .transition()
            .duration(DURATION)
            .attr("class", d => {
                if (d.dev_fr_median > 1) {
                    return "pointLabel orange";
                } else {
                    return "pointLabel purple";
                }
            })
            .attr("y", (d, i) => yScale(i))
            .attr("x", d => {
                if (d.dev_fr_median > 1) {
                    return xScale(d.dev_fr_median * 1.15);
                } else {
                    return xScale(d.dev_fr_median * 0.75);
                }
            })
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("dominant-baseline", "middle");
    }


    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // chart title
    const header = svg.select("#header");

    header.selectAll(".chartTitle")
        .data([{"label": "Solar Energy per capita generated by State, relative to US Median"}])
        .transition()
        .duration(DURATION)
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", margin.top - 10)
        .attr("text-anchor", "start");

    // Caption with data source
    const footer = svg.select("#footer");

    footer.selectAll(".captionText")
        .data([{"label": "Data source: SEDS (US Energy Information Administration)"}])
        .transition()
        .duration(DURATION)
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", height - 15)
        .attr("text-anchor", "start");

}
