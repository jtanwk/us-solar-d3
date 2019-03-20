function makePlot4(data, response) {

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

    // remove fitted line
    svg.select(".regressionLine")
        .transition()
        .duration(0.5 * DURATION)
        .attr("opacity", 0)
        .remove();

    /*************************
    ***** DATA WRANGLING *****
    *************************/

    // sort by panels_per_10k in descending order
    data.sort(function(a, b) {
        return b.panels_per_10k - a.panels_per_10k;
    });

    // get unique list of states to use in barchart
    const stateList = [...new Set(data.map(d => d.state))];

    /***********************
    ***** X & Y SCALES *****
    ***********************/

    const xBandScale = d3.scaleBand()
        .domain(stateList)
        .range([margin.left, plotWidth])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    const yScale = d3.scaleLog()
        .domain(d3.extent(data, d => d.panels_per_10k))
        .range([plotHeight, margin.bottom]);

    /***************************************
    ***** Y AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // update y axis
    svg.select(".yAxis")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${margin.bottom})`)
        .call(d3.axisLeft(yScale)
            .ticks(4)
            .tickFormat(d3.format("0.1r"))
    );

    // y axis gridlines
    svg.select(".yGrid")
        .transition()
        .duration(DURATION)
        .call(d3.axisLeft(yScale)
            .ticks(4)
            .tickSize(-(plotWidth + margin.right))
            .tickFormat("")
        );

    /***************************************
    ***** X AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // x axis
    svg.select(".xAxis")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xBandScale)
            .tickValues([])
        );

    // x axis gridline
    svg.select(".xGrid")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xBandScale)
            .tickValues([])
        );

    // x axis label
    svg.selectAll(".xLabel")
        .data([{"label": ""}])
        .transition()
        .duration(DURATION)
        .text(d => d.label);

    /***************
    ***** BARS *****
    ***************/

    const plot = svg.select("#plot");

    plot
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    if (response.direction === "down") {
        // transition out points
        plot.selectAll(".points")
            .data(data, key)
            .transition()
            .duration(DURATION)
            .attr("cx", d => xBandScale(d.state) + (0.5 * xBandScale.bandwidth()))
            .attr("cy", d => {
                if (d.panels_per_10k > 1) {
                    return yScale(d.panels_per_10k);
                } else {
                    return yScale(d.panels_per_10k);
                }
            })
            .transition()
            .duration(0.5 * DURATION)
            .attr("r", 0);

        // transition in rects
        plot.selectAll(".rects")
            .data(data, key)
            .enter()
            .append("rect")
            .attr("class", d => {
                if (d.region == "Northeast") {
                    return "rects purple";
                } else {
                    return "rects grey";
                }
            })
            .attr("id", d => d.state)
            .attr("x", d => xBandScale(d.state))
            .attr("y", d => {
                if (d.panels_per_10k > 1) {
                    return yScale(d.panels_per_10k);
                } else {
                    return yScale(d.panels_per_10k);
                }
            })
            .attr("width", xBandScale.bandwidth())
            .attr("height", d => {
                if (d.panels_per_10k > 1) {
                    return 0;
                } else {
                    return 0;
                }
            })
            .transition()
            .delay(DURATION)
            .duration(DURATION)
            .attr("y", d => {
                if (d.panels_per_10k > 1) {
                    return yScale(d.panels_per_10k);
                } else {
                    return yScale(1);
                }
            })
            .attr("height", d => {
                if (d.panels_per_10k > 1) {
                    return yScale(1) - yScale(d.panels_per_10k);
                } else {
                    return yScale(d.panels_per_10k) - yScale(1);
                }
            });
    } else {

        plot.selectAll(".rects").remove();

        // transition in bars only
        plot.selectAll(".rects")
            .data(data, key)
            .enter()
            .append("rect")
            .attr("class", d => {
                if (d.region == "Northeast") {
                    return "rects purple";
                } else {
                    return "rects grey";
                }
            })
            .attr("id", d => d.state)
            .attr("x", d => xBandScale(d.state))
            .attr("y", d => {
                if (d.panels_per_10k > 1) {
                    return yScale(d.panels_per_10k);
                } else {
                    return yScale(d.panels_per_10k);
                }
            })
            .attr("width", xBandScale.bandwidth())
            .attr("height", d => {
                if (d.panels_per_10k > 1) {
                    return 0;
                } else {
                    return 0;
                }
            })
            .transition()
            .duration(DURATION)
            .attr("y", d => {
                if (d.panels_per_10k > 1) {
                    return yScale(d.panels_per_10k);
                } else {
                    return yScale(1);
                }
            })
            .attr("height", d => {
                if (d.panels_per_10k > 1) {
                    return yScale(1) - yScale(d.panels_per_10k);
                } else {
                    return yScale(d.panels_per_10k) - yScale(1);
                }
            });
    }


    /*********************
    ***** BAR LABELS *****
    *********************/

    if (response.direction === "down") {

        // transition out horizontal labels
        plot.selectAll(".pointLabel")
            .data(data, key)
            .transition()
            .duration(DURATION)
            .attr("x", d => xBandScale(d.state))
            .attr("y", d => yScale(d.panels_per_10k))
            .attr("text-anchor", "start")
            .transition()
            .delay(0.5 * DURATION)
            .duration(0.5 * DURATION)
            .attr("opacity", 0);

        // transition in vertical labels
        plot.selectAll(".barLabels")
            .data(data)
            .enter()
            .append("text")
            .transition()
            .delay(DURATION)
            .attr("class", d => {
                if (d.region == "Northeast") {
                    return "barLabels purple";
                } else {
                    return "barLabels grey";
                }
            })
            .text(d => d.state)
            .attr("x", d => xBandScale(d.state))
            .attr("y", d => yScale(d.panels_per_10k))
            .attr("dx", d => {
                if (d.panels_per_10k > 1) {
                    return 5;
                } else {
                    return -20;
                }
            })
            .attr("dy", "0.7em")
            .attr("text-anchor", "start")
            .attr("transform", d => {
                return `rotate(-90, ${xBandScale(d.state)}, ${yScale(d.panels_per_10k)})`;
            })
            .attr("opacity", 0)
            .transition()
            .duration(DURATION)
            .attr("opacity", 1);
    } else {
        plot.selectAll(".barLabels")
            .transition()
            .duration(DURATION)
            .attr("opacity", 1)
    }



    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.select("#header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Solar panels per capita (as of 2016)"}])
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
        .data([{"label": "Data source: NREL (U.S. Dept of Energy), National Cancer Institute"}])
        .transition()
        .duration(DURATION)
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", height - 15)
        .attr("text-anchor", "start");
}
