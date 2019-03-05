function makePlot2(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    const height = 700;
    const width = 700;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#p2")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

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
    const xaxis = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisTop(xScale)
            .ticks(4)
            .tickFormat(d => d + "x")
    );

    // x axis gridlines
    xaxis.append("g")
        .attr("class", "grid")
        .call(d3.axisTop(xScale)
            .ticks(4)
            .tickSize(-plotHeight)
            .tickFormat(""));

    // x axis label
    svg.selectAll(".xLabel")
        .data([{"label": "Solar Energy per Capita Generated, Relative to U.S. Median"}])
        .enter()
        .append("text")
        .attr("class", "xLabel")
        .attr("transform", `translate(${margin.left}, 0)`)
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("x", (0.5 * (plotWidth + margin.left)))
        .attr("y", 0.75 * margin.top);

    /*****************
    ***** POINTS *****
    ******************/

    const plot2 = svg.append("g")
        .attr("id", "plot2")
        .attr("transform", `translate(${margin.left}, ${0.5 * margin.top})`);

    plot2.selectAll(".points")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", d => {
            if (d.dev_fr_median > 1) {
                return "points orange";
            } else {
                return "points purple";
            }
        })
        .attr("id", d => d.state)
        .attr("cy", (d, i) => yScale(i))
        .attr("r", 3)
        .attr("cx", xScale(1))
        .transition()
        .duration(2000)
        .attr("cx", d => xScale(d.dev_fr_median));

    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.append("g")
        .attr("id", "header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Hawaii generates over 50x more solar energy per capita than the national median"}])
        .enter()
        .append("text")
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", 15)
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
        .attr("y", height - margin.bottom)
        .attr("text-anchor", "start")
        .attr("class", "captionText")

}
