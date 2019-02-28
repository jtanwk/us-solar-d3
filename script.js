/*
SHINING A LIGHT ON US HOUSEHOLD SOLAR ENERGY GENERATION
JONATHAN TAN
MASTER JS FILE

FEB 27, 2019
*/

// LOAD DATA
// Promise.all([
//     fetch("./data/gen-by-year.csv")
//         .then(d => {
//             return d.json()
//         })
//         .then(data => {
//             console.log(data);
//         }),
//     // fetch("data/gen-ghi-panels-2016.csv"),
//     new Promise((resolve, reject) => {
//         resolve('Data correctly loaded.');
//     })
// ]).then(results => {
//     console.log(results);
// }).catch(error => {
//     printError();
// });

const DATA_PATH = "data/gen-by-year.csv"

// LOAD DATA
d3.csv(DATA_PATH)
    .then(d => {
        d.forEach(d => {
            d.year = Number(d.year);
            d.total_btu = Number(d.total_btu) + 1;
            d.source = d.full_source;
        });
        console.log(d[0]);
        makePlot1(d);
    })
    // .catch(error => {
    //     printError();
    // });

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

function makePlot1(data) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    const height = 700;
    const width = 700;
    const margin = {top: 50, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#p1")   // div with class "plotArea" in html
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /***********************
    ***** X & Y SCALES *****
    ***********************/

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([margin.right, plotWidth])
        .nice();

    const y = d3.scaleLog()
        .domain(d3.extent(data, d => d.total_btu))
        .range([plotHeight, margin.bottom])
        .nice();

    /*****************
    ***** LINE   *****
    ******************/

    const plot1 = svg.append("g")
        .attr("id", "plot1");

    plot1.selectAll(".points")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "points")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.total_btu))
        .attr("r", 3);

    var line = d3.line()
        .x(function(d, i) {return x(d.year);})
        .y(function(d) {return y(d.total_btu);});

    plot1.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);


}














//
