function updatePlot1(data, response) {

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

    /**************************
    ***** REMOVE OLD DATA *****
    **************************/

    d3.select(".annotationBox")
        .transition()
        .duration(0.5 * DURATION)
        .attr("opacity", 0)
        .remove();

    /*************************
    ***** DATA WRANGLING *****
    *************************/


    /****************
    ***** LINES *****
    *****************/

    var plot = svg.select("#plot")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var solarLabels = [
        "Solar, Utility",
        "Solar, Commercial",
        "Solar, Industrial"
    ];

    if (response.direction === "down") {

        // update selected line colors
        plot.selectAll("path")
            .transition()
            .duration(0.5 * DURATION)
            .attr("stroke", function(d) {
                const id = this.getAttribute('id');
                if (solarLabels.includes(id)) {
                    return THEME_ORANGE;
                } else if (id === "Solar, Residential") {
                    return THEME_PURPLE;
                } else {
                    return THEME_GREY;
                }
            });

    } else {

        // transition out points
        plot.selectAll(".points")
            .transition()
            .duration(DURATION)
            .attr("r", 0)
            .remove();

        // transition out point labels
        plot.selectAll(".pointLabel")
            .transition()
            .duration(DURATION)
            .attr("opacity", 0)
            .remove();

        makePlot1(data, response);

        // update selected line colors
        plot.selectAll("path")
            .transition()
            .duration(DURATION)
            .attr("stroke", function(d) {
                const id = this.getAttribute('id');
                if (solarLabels.includes(id)) {
                    return THEME_ORANGE;
                } else if (id === "Solar, Residential") {
                    return THEME_PURPLE;
                } else {
                    return THEME_GREY;
                }
            });

    }

    /**********************
    ***** LINE LABELS *****
    **********************/

    // update line label colors
    plot.selectAll(".lineLabel")
        .transition()
        .duration(0.5 * DURATION)
        .attr("fill", function(d) {
            const id = this.getAttribute('id');
            if (solarLabels.includes(id)) {
                return THEME_ORANGE;
            } else if (id === "Solar, Residential") {
                return THEME_PURPLE;
            } else {
                return THEME_GREY;
            }
        });



}
