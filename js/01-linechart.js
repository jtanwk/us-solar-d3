function makePlot1(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    const width = 700;
    const height = 700;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    svg = d3.select("#p1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /*************************
    ***** DATA WRANGLING *****
    *************************/

    yObjs = {
        'Geothermal, Utlity': {column: 'geothermalutility'},
        'Hydroelectric, Commercial': {column: 'hydroelectriccommercial'},
        'Hydroelectric, Utility': {column: 'hydroelectricutility'},
        'Solar, Commercial': {column: 'solarcommercial'},
        'Solar. Industrial': {column: 'solarindustrial'},
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
        .range([0, plotWidth]);

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
        .call(d3.axisBottom(xScale));

    const yAxis = svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale));

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
    const plot1 = svg.append("g")
        .attr("id", "plot1")
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
        yObjs[y].path = plot1.append("path")
            .datum(data)
            .attr("class", "line")
            .style("fill", "none")
            .style("stroke", "black")
            .attr("d", yObjs[y].line)
            .attr("id", y);

        // wipe-in transition adapted from Mark Vandergon
        // https://github.com/mdvandergon/monetary-policy
        var totalLength = yObjs[y].path.node().getTotalLength();

        yObjs[y].path
            .style("opacity", 1)
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
              .duration(2000)
              .attr("stroke-dashoffset", 0);
    }
}
