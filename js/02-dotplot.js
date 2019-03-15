function makePlot2(data) {

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

    // var g = svg.selectAll("*").remove()
    svg.select("#header").remove();
    svg.select("#footer").remove();

    svg.selectAll("path")
        // .attr("transform", `translate(${0}, ${0})`)
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
        .delay(2 * DURATION)
        .attr("opacity", 0);

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
        .range([margin.right, plotWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, (d, i) => i))
        .range([plotHeight, margin.bottom])
        .nice();

    /***************************************
    ***** X AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // x axis
    const xaxis = svg.select(".xAxis")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xScale)
            .ticks(4)
            .tickFormat(d => d + "x")
    );

    // x axis gridlines
    svg.select(".xAxis")
        .append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(xScale)
            .ticks(4)
            .tickSize(-(plotHeight))
            .tickFormat(""));

    // x axis label
    svg.selectAll(".xLabel")
        .data([{"label": "Solar Energy per capita Generated (BTUs)"}])
        .enter()
        .append("text")
        .attr("class", "xLabel")
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.bottom + 10})`)
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("x", (0.5 * (plotWidth + margin.left)))
        .attr("y", margin.top - 25);

    // y axis
    const yaxis = svg.select(".yAxis")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisLeft(yScale).ticks(0))
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    /*****************
    ***** POINTS *****
    ******************/

    const plot = svg.select("#plot")
        .attr("transform", `translate(${margin.left}, ${margin.bottom})`);

    plot.selectAll(".points")
        .data(data, key)
        .enter()
        .append("circle")
        .attr("id", d => d.state)
        .attr("cy", yScale(40.5))
        .attr("cx", xScale(30))
        .attr("r", 4)
        .attr("class", "points purple")
        .transition()
        .duration(2 * DURATION)
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

    /***********************
    ***** POINT LABELS *****
    ***********************/

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
        .duration(2 * DURATION)
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


    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.append("g")
        .attr("id", "header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Solar Energy per capita generated by State, relative to US Median"}])
        .enter()
        .append("text")
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", margin.top - 10)
        .attr("text-anchor", "start")
        .attr("class", "chartTitle")

    // Create footer grouping
    const footer = svg.append("g")
        .attr("id", "footer");

    // Caption with data source
    footer.selectAll(".captionText")
        .data([{"label": "Data source: SEDS (US Energy Information Administration)"}])
        .enter()
        .append("text")
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", height - 15)
        .attr("text-anchor", "start")
        .attr("class", "captionText")

}
