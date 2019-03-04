/*
SHINING A LIGHT ON US HOUSEHOLD SOLAR ENERGY GENERATION
JONATHAN TAN
MASTER JS FILE

AS OF MARCH 1, 2019
*/

// LOAD DATA
Promise.all([
    fetch("data/gen-by-year3.json")
        .then(data => data.json())
        .then(data => {
            console.log("Dataset 1 loaded.");
            console.table(data[0]);

            // Line chart - almost taken ad verbatim from
            // http://bl.ocks.org/asielen/44ffca2877d0132572cb
            var chart = makeLineChart(data, 'year', {
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
            }, {xAxis: 'year', yAxis: 'total_btu'})

            // return makePlot1(data);
        }),
    fetch("data/gen-ghi-panels-2016.json")
        .then(data => data.json())
        .then(data => {
            console.log("Dataset 2 loaded.");
            console.log(data[0]);
            return makePlot2(data), makePlot3(data), makePlot4(data);
        }),
    new Promise((resolve, reject) => {
        resolve('Data correctly loaded.');
    })
]).then(results => {
    console.log(results);
}).catch(error => {
    console.log(error);
    printError();
});


function makeLineChart(dataset, xName, yObjs, axisLabels) {

    // create a chart object to hold all data and return
    var chartObj = {};
    chartObj.xAxisLabel = axisLabels.xAxis;
    chartObj.yAxisLabel = axisLabels.yAxis;

    chartObj.data = dataset;
    chartObj.margin = {top: 100, left: 50, right: 50, bottom: 50};
    chartObj.width = 700 - chartObj.margin.left - chartObj.margin.right;
    chartObj.height = 700 - chartObj.margin.top - chartObj.margin.bottom;

    // makes it easier to swap in x variables
    chartObj.xFunct = function(d) {return d[xName];}

    // each YObj is a path from data in each column
    // YObjs are supplied to function as dict of name-column specifiers
    // takes col name as argument and returns array of values in that col
    function getYFn(column) {
        return function(d) {
            return d[column];
        }
    }

    // create new Array attribute to hold values
    chartObj.yFuncts = [];
    for (var y in yObjs) {
        yObjs[y].name = y; // e.g. "Solar, Residential"
        // call getYFn function; takes string and returns array of values
        yObjs[y].yFunct = getYFn(yObjs[y].column);
        // push appends arg to the list and returns new length
        chartObj.yFuncts.push(yObjs[y].yFunct);
    }

    // Create scales

    chartObj.xScale = d3.scaleLinear()
        .domain(d3.extent(chartObj.data, chartObj.xFunct))
        .range([0, chartObj.width]);

    chartObj.max = function(fn) {
        return d3.max(chartObj.data, fn);
    };

    chartObj.yScale = d3.scaleLinear()
        .domain([0, d3.max(chartObj.yFuncts.map(chartObj.max))])
        .range([chartObj.height, 0])

    // Create axes

    const xaxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xScale));

    // y axis
    const yaxis = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale));

}


function makePlot1(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    const height = 700;
    const width = 700;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#p1")
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

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([margin.right, plotWidth])
        .nice();

    const yScale = d3.scaleLog()
        .domain(d3.extent(data, d => d.total_btu))
        .range([plotHeight, margin.bottom])
        .nice();

    /***************************************
    ***** X AXIS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // x axis
    const xaxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
        .call(d3.axisBottom(xScale));

    // y axis
    const yaxis = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale));

    /****************
    ***** LINES *****
    *****************/

    const plot1 = svg.append("g")
        .attr("id", "plot1")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var valueLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.total_btu));

    plot1.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", valueLine)

}

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

function makePlot3(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    const height = 700;
    const width = 700;
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
        .data([{"label": "Northeast states generate more solar energy from less sunlight"}])
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
        .attr("y", height)
        .attr("text-anchor", "start")
        .attr("class", "captionText")
}

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
//        .attr("transform", `rotate(90, ${xBandScale(d.state)}, ${yScale(d.panels_per_10k)})`)

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







































// DEFINE ERROR MESSAGE
function printError() {
    const message = `
    | ￣￣￣￣￣ | <br />
    | &nbsp; ERROR &nbsp; &nbsp; &nbsp; | <br />
    | &nbsp; LOADING &nbsp;| <br />
    | &nbsp; DATA &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| <br />
    | ＿＿＿＿＿ | <br />
    (\\__/) || <br />
    (•ㅅ• ) || <br />
    / 　 づ`

    document.getElementById("errMsg").innerHTML = message;
}

//
