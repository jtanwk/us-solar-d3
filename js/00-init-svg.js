// setup SVG canvas once; scroll triggers just update this
// removes need to worry about removing and appending g containers in subsequent
//  functions; just transition content in and out.

function svg_init() {

    /*************************
    ***** SET DIMENSIONS *****
    *************************/

    // dynamic dimension sizing code adapted from
    // https://github.com/d3/d3-selection/issues/128
    const bbox = d3.select("#chart").node().getBoundingClientRect()

    const width = bbox.width;
    const height = bbox.height;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;


    /**********************
    ***** APPEND DIVS *****
    **********************/

    d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.select("#mapPlot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const svg = d3.select("#chart").select("svg");


    /*****************************
    ***** APPEND AXES & GRID *****
    *****************************/

    // x-axis
    svg.append("g")
        .attr("class", "xAxis")

    // y-axis
    svg.append("g")
        .attr("class", "yAxis")

    // gridlines (basically just an axis with invisible ticks and labels)
    svg.append("g")
        .attr("class", "xGrid")

    svg.append("g")
        .attr("class", "yGrid")


    /*****************************
    ***** APPEND AXIS LABELS *****
    *****************************/

    // empty placeholder to transition in correct text for each graph
    svg.selectAll(".xLabel")
        .data([{"label": ""}])
        .enter()
        .append("text")
        .attr("class", "xLabel")
        .attr("transform", `translate(0, ${plotHeight + margin.bottom + 10})`)
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("x", (0.5 * (plotWidth + margin.left)))
        .attr("y", margin.top - 25);

    /**************************************
    ***** APPEND PLOT, HEADER, FOOTER *****
    **************************************/

    // for main chart elements (paths, circles, rects, etc.)
    svg.append("g")
        .attr("id", "plot")

    // header for titles
    svg.append("g")
        .attr("id", "header");

    // footer for source information and other notes
    svg.append("g")
        .attr("id", "footer");

}
