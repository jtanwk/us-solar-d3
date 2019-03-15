function updatePlot1(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    // dynamic dimension sizing code adapted from
    // https://github.com/d3/d3-selection/issues/128
    const bbox = d3.select("#chart").node().getBoundingClientRect()

    const width = bbox.width;
    const height = bbox.height;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#chart").select("svg");

    const DURATION = 1000;

    /**************************
    ***** REMOVE OLD DATA *****
    **************************/

    // var g = svg.selectAll("*").remove()

    /*************************
    ***** DATA WRANGLING *****
    *************************/


    /****************
    ***** LINES *****
    *****************/

    var plot = svg.select("#plot");

    var solarLabels = [
        "Solar, Utility",
        "Solar, Commercial",
        "Solar, Industrial"
    ];

    // define colors
    const THEME_PURPLE = "#5D2BF0";
    const THEME_ORANGE = "#FF810F";
    const THEME_GREY = "#DDDDDD";

    plot.selectAll("path")
        .merge(plot)
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
        })

    /**********************
    ***** LINE LABELS *****
    **********************/

    plot.selectAll(".lineLabel")
        .transition()
        .duration(DURATION)
        .attr("fill", function(d) {
            const id = this.getAttribute('id');
            if (solarLabels.includes(id)) {
                return THEME_ORANGE;
            } else if (id === "Solar, Residential") {
                return THEME_PURPLE;
            } else {
                return THEME_GREY;
            }
        })


}
