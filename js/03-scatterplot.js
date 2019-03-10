function makePlot3(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    // dynamic dimension sizing code adapted from
    // https://github.com/d3/d3-selection/issues/128
    const bbox = d3.select("#p3").node().getBoundingClientRect()

    const width = bbox.width;
    const height = bbox.height;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#p3")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /*************************
    ***** DATA WRANGLING *****
    *************************/

    // placeholder for later work

    /***********************
    ***** X & Y SCALES *****
    ***********************/

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.sun))
        .range([margin.right, plotWidth])
        .nice();

    const yScale = d3.scaleLog()
        .domain(d3.extent(data, d => d.btu_per_10k))
        .range([plotHeight, margin.bottom])
        .nice();

    /***************************************
    ***** X AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // x axis
    const xaxis = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xScale)
            .ticks(4)
    );

    // x axis gridlines
    xaxis.append("g")
        .attr("class", "grid")
        .call(d3.axisTop(xScale)
            .ticks(4)
            .tickSize(plotHeight)
            .tickFormat(""));

    // x axis label
    svg.selectAll(".xLabel")
        .data([{"label": "Annual Average Global Horizontal Irradiance (kWh/m^2/day)"}])
        .enter()
        .append("text")
        .attr("class", "xLabel")
        .attr("transform", `translate(${margin.left}, ${plotHeight + 0.6 * margin.top})`)
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("x", (0.5 * (plotWidth + margin.left)))
        .attr("y", 0.75 * margin.top);

    /***************************************
    ***** Y AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // y axis
    const yaxis = svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .ticks(4)
            .tickFormat(d3.format("0.1r"))
    );

    // y axis gridlines
    yaxis.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .ticks(4)
            .tickSize(-plotWidth)
            .tickFormat(""));

    /*****************
    ***** POINTS *****
    ******************/

    const plot3 = svg.append("g")
        .attr("id", "plot3")
        .attr("transform", `translate(${margin.left}, ${0.5 * margin.top})`);

    plot3.selectAll(".points")
        .data(data)
        .enter()
        .append("circle")
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
        .attr("r", 3);

    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.append("g")
        .attr("id", "header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Solar Irradiance vs. Solar Energy Generated"}])
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
