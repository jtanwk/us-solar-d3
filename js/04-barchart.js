
function makePlot4(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    const height = 700;
    const width = 700;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#p4")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

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
        .range([plotHeight, margin.bottom])
        .nice();

    /***************************************
    ***** Y AXiS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // y axis
    const yaxis = svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d3.format("0.1r"))
    )

    // y axis gridlines
    yaxis.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .ticks(4)
            .tickSize(-plotWidth)
            .tickFormat(""));

    /***************
    ***** BARS *****
    ***************/

    const plot3 = svg.append("g")
        .attr("id", "plot3")
        .attr("transform", `translate(0, ${margin.top})`);

    plot3.selectAll(".rects")
        .data(data)
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
        .duration(2000)
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

    /*********************
    ***** BAR LABELS *****
    *********************/

    plot3.selectAll(".barLabels")
        .data(data)
        .enter()
        .append("text")
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
        });

    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.append("g")
        .attr("id", "header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Northeast states are surprisingly well-represented in solar panel counts"}])
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
        .data([{"label": "Data source: NREL (U.S. Dept of Energy), National Cancer Institute"}])
        .enter()
        .append("text")
        .text(function(d) {return d.label;})
        .attr("x", margin.left)
        .attr("y", height)
        .attr("text-anchor", "start")
        .attr("class", "captionText")
}
