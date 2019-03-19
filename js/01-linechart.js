function makePlot1(data) {

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

    /**************************
    ***** REMOVE OLD DATA *****
    **************************/

    var g = svg.selectAll("*").remove()

    /*************************
    ***** DATA WRANGLING *****
    *************************/

    yObjs = {
        'Geothermal, Utility': {column: 'geothermalutility'},
        'Hydroelectric, Commercial': {column: 'hydroelectriccommercial'},
        'Hydroelectric, Utility': {column: 'hydroelectricutility'},
        'Solar, Commercial': {column: 'solarcommercial'},
        'Solar, Industrial': {column: 'solarindustrial'},
        'Solar, Residential': {column: 'solarresidential'},
        'Solar, Utility': {column: 'solarutility'},
        'Wind, Commercial': {column: 'windcommercial'},
        'Wind, Industrial': {column: 'windindustrial'},
        'Wind, Utility': {column: 'windutility'}
    }

    /***********************
    ***** X & Y SCALES *****
    ***********************/

    // create new yFuncts Array attribute to hold line generator data
    yFuncts = [];

    for (var series in yObjs) {
        yObjs[series].name = series; // e.g. "Solar, Residential"
        // call getYFn function; takes string and returns array of values
        yObjs[series].yFunct = getYFn(yObjs[series].column);
        // push appends arg to the list and returns new length
        yFuncts.push(yObjs[series].yFunct);
    }

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, plotWidth - margin.right - margin.left]);

    function max(fn) {
        return d3.max(data, fn);
    };

    const yScale = d3.scaleSymlog()
        .domain([0, d3.max(yFuncts.map(max))])
        .range([plotHeight, 0])

    // separate y scale for better ticks
    const yAxisScale = d3.scaleLog()
        .domain([0, d3.max(yFuncts.map(max))])
        .range([plotHeight, 0])

    /*********************
    ***** X & Y AXES *****
    *********************/

    const xAxis = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    const yAxis = svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .tickValues([10, 100, 1000, 10000, 100000])
        );

    svg.select(".yAxis")
        .append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-(plotWidth - margin.right - margin.left))
            .tickValues([10, 100, 1000, 10000, 100000])
            .tickFormat("")
        );

    /****************
    ***** LINES *****
    *****************/

    // each yObj is a path from data in each column
    // yObjs are supplied to function as dict of name-column specifiers
    // takes col name as argument and returns array of values in that col
    function getYFn(column) {
        return function(d) {
            return d[column];
        }
    }

    // Append g to hold lines
    const plot = svg.append("g")
        .attr("id", "plot")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Plot lines
    function getYScaleFn(yObj) {
        return function(d) {
            return yScale(yObjs[yObj].yFunct(d));
        }
    };

    // Create new line generator function for each series
    for (var y in yObjs) {
        yObjs[y].line = d3.line()
            .x(d => xScale(d.year))
            .y(getYScaleFn(y));
    }

    // Draw line for each line generator in yObjs Array
    for (var y in yObjs) {
        yObjs[y].path = plot.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("d", yObjs[y].line)
            .attr("id", y);

        // wipe-in transition adapted from Mark Vandergon
        // https://github.com/mdvandergon/monetary-policy
        var totalLength = yObjs[y].path.node().getTotalLength();

        yObjs[y].path
            .attr("opacity", 1)
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
              .duration(DURATION)
              .attr("stroke-dashoffset", 0);
    }

    /**********************
    ***** LINE LABELS *****
    **********************/

    // convert data label to human readable strings
    labelDict = {
        'geothermalutility': 'Geothermal, Utility',
        'hydroelectriccommercial': 'Hydroelectric, Commercial',
        'hydroelectricutility': 'Hydroelectric, Utility',
        'solarcommercial': 'Solar, Commercial',
        'solarindustrial': 'Solar, Industrial',
        'solarresidential': 'Solar, Residential',
        'solarutility': 'Solar, Utility',
        'windcommercial': 'Wind, Commercial',
        'windindustrial': 'Wind, Industrial',
        'windutility': 'Wind, Utility'
    }

    // convert data from most recent year to a useable representation
    // code below adapted from Andrew McNutt's CAPP 20329 Week 6 tutorial
    var labelFilter = data.filter(function(d) {return d.year === 2016})[0];
    var labelData = Object.entries(labelFilter).map(row => {
        return {label: row[0], value: row[1]};
    });

    plot.selectAll('.lineLabel')
        .data(labelData.filter(function(d) {return d.label != "year";}))
        .enter()
        .append("text")
        .attr("class", "lineLabel")
        .attr("id", function(d) {return labelDict[d.label];})
        .attr("x", function(d) {return xScale(2016.5);})
        .attr("y", function(d) {return yScale(d.value);})
        .text(function(d) {return labelDict[d.label];})
        .attr("dy", function(d) {
            if (d.label === "windutility") {
                return 5;
            } else if (d.label === "hydroelectricutility") {
                return -2;
            } else {
                return 0;
            }
        })
        .attr("fill", "#000000")
        .attr("opacity", 0)
        .transition()
        .duration(DURATION)
        .attr("opacity", 1);

    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.append("g")
        .attr("id", "header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Renewable Energy Generated by Source in 2016 (BTUs)"}])
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
