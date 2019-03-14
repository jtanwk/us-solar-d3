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
Office hours questions 3/14:
1. Any way to pass data to scrollama handlers without using globals?
2. What can I do about line chart yscale?
2. Why is my map still loading so slowly? Any other way to minimize?
    - Should I load the topojson separately from the sun/panel data?
    - Why are the colors not what I expect them to be?
    - Why is my map moving upwards so quickly? What can I do to add a buffer below?
3. What can I do about up-scroll transitions? Do I need to do whole new constructor fns?
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
    var chartHeight = Math.floor(chartWidth * 0.66)

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

function handleStepEnter(response) {
	// response = { element, direction, index }

    // change class for current text to active
    step.classed('is-active', false);
    step.classed('is-active', function (d, i) {
        return i === response.index;
    });

    // update svgs
    switch(response.index) {
        case 0:
            makePlot1(data_1);
            break;
        case 1:
            updatePlot1(data_1);
            break;
        case 2:
            makePlot2(data_234);
            break;
        case 3:
            makePlot3(data_234);
            break;
        case 4:
            makePlot4(data_234);
            break;
        case 5:
            makePlot5(data_5);
            break;
    }

    // redraw chart upon display
    handleResize();
}

function setupStickyfill() {
    d3.selectAll('.sticky').each(function () {
        Stickyfill.add(this);
    });
}

// run initializer code once on page load
function scroll_init() {
    setupStickyfill();

	// call a resize on load to update width/height/position of elements
	handleResize();

	// setup the scrollama instance and bind scrollama event handlers
	scroller
		.setup({
			container: '#scroll', // our outermost scrollytelling element
			graphic: '.scroll__graphic', // the graphic
			text: '.scroll__text', // the step container
			step: '.scroll__text .step', // the step elements
			offset: 0.5, // set the trigger to be 1/2 way down screen
			debug: false, // display the trigger offset for testing
		})
		.onStepEnter(handleStepEnter);

	// setup resize event
	window.addEventListener('resize', handleResize);
}

// setup SVG canvas once; scroll triggers just update this
function svg_init() {
    // dynamic dimension sizing code adapted from
    // https://github.com/d3/d3-selection/issues/128
    const bbox = d3.select("#chart").node().getBoundingClientRect()

    const width = bbox.width;
    const height = bbox.height;
    const margin = {top: 100, left: 50, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", `translate(0, -25)`);

}

// LOAD DATA
Promise.all([
    d3.json("data/processed-data/gen-by-year.json"),
    d3.json("data/processed-data/gen-ghi-panels-2016.json"),
    d3.json("data/processed-data/map-data.topojson")
]).then(results => {
    // assign separate references for each dataset
    // if using globals are bad I don't yet know a way around this
    this.data_1 = results[0];
    this.data_234 = results[1];

    // topojson code adapted from
    // https://bl.ocks.org/almccon/410b4eb5cad61402c354afba67a878b8
    // and uses https://github.com/topojson/topojson
    var topology = topojson.feature(results[2], results[2].objects.foo);
    this.data_5 = topology;

    // Go!
    scroll_init();
    svg_init();

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
