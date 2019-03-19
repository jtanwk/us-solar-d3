function enterPlot5(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    // dynamic dimension sizing code adapted from
    // https://github.com/d3/d3-selection/issues/128
    const bbox = d3.select("#mapPlot").node().getBoundingClientRect()

    const width = bbox.width;
    const height = bbox.height;
    const margin = {top: 50, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    // define constants
    const DURATION = 1000;
    const THEME_PURPLE = "#5D2BF0";
    const THEME_ORANGE = "#FF810F";
    const MAX_CIRCLE_SIZE = 10;

    const svg = d3.select("#mapPlot").select("svg");

    /*************************
    ***** COUNTY CIRCLES *****
    *************************/

    const plot = svg.select("#plot");

    plot
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(0, ${margin.top})`);

    plot.selectAll(".centroid")
        .transition()
        .duration(DURATION)
        .attr("opacity", 0.7);

}
