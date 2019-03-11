/*
SHINING A LIGHT ON US HOUSEHOLD SOLAR ENERGY GENERATION
JONATHAN TAN
MASTER JS FILE

AS OF MARCH 9, 2019

LIBRARIES LOADED IN GLOBAL:
    - d3
    - scrollama
    - intersection-observer
*/

/*
    office hours questions:
    1. redraw - div is changing size but svg is not being redrawn
        - how to select just the svg?
    2. why is my first box so far down
    3. how to alternate between in-chart changes and between-chart changes
        - switch/case?
    4. why are up-direction transitions so buggy?
*/

// scollama code heavily adapted from
//https://pudding.cool/process/introducing-scrollama/

// initial d3 selections for convenience
var container = d3.select('#scroll');
var graphic = container.select('.scroll__graphic');
var chart = graphic.selectAll('.plotArea');
var text = container.select('.scroll__text');
var step = text.selectAll('.step');

// initialize scrollama
var scroller = scrollama();

// resize function to set dimensions on load and on page resize
function handleResize() {

	// 1. update height of step elements for breathing room between steps
	var stepHeight = Math.floor(window.innerHeight * 0.75);
	step.style('height', stepHeight + 'px');

	// 2. update height of graphic element
	var bodyWidth = d3.select('body').node().offsetWidth;

	graphic
		.style('height', window.innerHeight + 'px');

	// 3. update width of chart by subtracting from text width
	var chartMargin = 10;
	var textWidth = text.node().offsetWidth;
	var chartWidth = graphic.node().offsetWidth - textWidth - chartMargin;
    var chartHeight = Math.floor(chartWidth * 0.75)

	chart
		.style('width', chartWidth + 'px')
		.style('height', chartHeight + 'px');

    // 4. update dimensions of svg element in chart div
    var svg = d3.select(".plotArea is-active").select("svg")

    svg
        .attr("width", chartWidth + "px")
        .attr("height", chartHeight + "px")

	// 5. tell scrollama to update new element dimensions
	scroller.resize();
}

// scrollama event handlers
const responseDict = [
    ToggleNewChart,
    updatePlot1,
    ToggleNewChart,
    ToggleNewChart,
    ToggleNewChart,
    ToggleNewChart,
];
function handleStepEnter(response) {
	// response = { element, direction, index }

    // switch(response.index) {
    //     case 0:
    //         ToggleNewChart(response);
    //         break;
    //     case 1:
    //         updatePlot1(response);
    //         break;
    //     case 2:
    //         ToggleNewChart(response);
    //         break;
    //     case 3:
    //         ToggleNewChart(response);
    //         break;
    //     case 4:
    //         ToggleNewChart(response);
    //         break;
    //     case 5:
    //         ToggleNewChart(response);
    //         break;
    // }
    responseDict[response.index](response)
    // redraw chart upon display
    handleResize();
}

function updatePlot1(response) {

    // for text
    step.classed('is-active', false);
    step.classed('is-active', function (d, i) {
        return i === response.index;
    });

    // update line colors - data is not loaded here
    // var lines = d3.selectAll("#plot1.line")
    //     .attr("class", function(d) {
    //          if (id === "Solar, Residential") {
    //              return 'line purple';
    //          } else {
    //              return 'line'
    //          }
    //     })
}

// switch chart when content demands it
function ToggleNewChart(response) {

    // general idea: topmost steps are active
    // when step crosses threshold,
    // 1. turn all elements inactive
    // 2. activate relevant element

    // get data-step attribute
    var dataStep = Number(response.element.dataset.step);

    // for text
    step.classed('is-active', false);
    step.classed('is-active', function (d, i) {
        return i === response.index;
    });

    // for charts
    chart.classed('is-active', false);
    chart.classed('is-active', function(d, i) {
        return i === dataStep;
    });

}

function handleContainerEnter(response) {
	// sticky the graphic
	graphic.classed('is-fixed', true);
	graphic.classed('is-bottom', false);
}

function handleContainerExit(response) {
	// un-sticky the graphic, and pin to top/bottom of container
	graphic.classed('is-fixed', false);
	graphic.classed('is-bottom', response.direction === 'down');
}

function handleContainerExit(response) {

    // maybe this will be useful

}

function setupStickyfill() {
    d3.selectAll('.sticky').each(function () {
        Stickyfill.add(this);
    });
}

// kick-off code to run once on load
function init() {
    setupStickyfill();

	// 1. call a resize on load to update width/height/position of elements
	handleResize();

	// 2. setup the scrollama instance
	// 3. bind scrollama event handlers (this can be chained like below)
	scroller
		.setup({
			container: '#scroll', // our outermost scrollytelling element
			graphic: '.scroll__graphic', // the graphic
			text: '.scroll__text', // the step container
			step: '.scroll__text .step', // the step elements
			offset: 0.5, // set the trigger to be 1/2 way down screen
			debug: true, // display the trigger offset for testing
		})
		.onStepEnter(handleStepEnter)
		.onContainerEnter(handleContainerEnter)
		.onContainerExit(handleContainerExit);

	// setup resize event
	window.addEventListener('resize', handleResize);
}

// start it up
init();


// LOAD DATA
Promise.all([
    fetch("data/processed-data/gen-by-year.json")
        .then(data => data.json())
        .then(data => {
            console.log("Dataset 1 loaded.");
            console.table(data[0]);

            // Line chart - heavily adapted from
            // http://bl.ocks.org/asielen/44ffca2877d0132572cb
            return makePlot1(data);
        }),
    fetch("data/processed-data/gen-ghi-panels-2016.json")
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
