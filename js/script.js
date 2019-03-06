/*
SHINING A LIGHT ON US HOUSEHOLD SOLAR ENERGY GENERATION
JONATHAN TAN
MASTER JS FILE

AS OF MARCH 5, 2019
*/

// using d3 for convenience, and storing a selected elements
var container = d3.select('#scroll');
var graphic = container.select('.scroll__graphic');
var chart = graphic.selectAll('.plotArea');
var text = container.select('.scroll__text');
var step = text.selectAll('.step');

// initialize the scrollama
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
	var chartMargin = 32;
	var textWidth = text.node().offsetWidth;
	var chartWidth = graphic.node().offsetWidth - textWidth - chartMargin;
	// make the height 1/2 of viewport
	var chartHeight = Math.floor(window.innerHeight / 2);

	chart
		.style('width', chartWidth + 'px')
		.style('height', chartHeight + 'px');

	// 4. tell scrollama to update new element dimensions
	scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
	// response = { element, direction, index }

	// fade in current step
	step.classed('is-active', function (d, i) {
		return i === response.index;
	});

	// update graphic based on step here
	var stepData = step.attr('data-step');

    // console.log(step.attr('data-step'));
    // console.log(chart._groups[0]);

    /* TODO:
    1. get data-step attribute of incoming step
    2. update corresponding chart's "z-index" attribute to 1
    3. change all other charts' "z-index" to -1

    OTHER PROBLEM:
    SVG windows bigger than .plotArea divs.
    Need to replace constant width, height settings in plots
        with dynamically obtained dimensions from elsewhere
    */
}

function handleContainerEnter(response) {
	// response = { direction }

	// sticky the graphic
	graphic.classed('is-fixed', true);
	graphic.classed('is-bottom', false);
}

function handleContainerExit(response) {
	// response = { direction }

	// un-sticky the graphic, and pin to top/bottom of container
	graphic.classed('is-fixed', false);
	graphic.classed('is-bottom', response.direction === 'down');
}

function handleContainerExit(response) { }

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
