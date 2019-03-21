/*
SHINING A LIGHT ON US HOUSEHOLD SOLAR ENERGY GENERATION
JONATHAN TAN
MASTER JS FILE

AS OF MARCH 20, 2019

LIBRARIES LOADED IN GLOBAL:
    - d3
    - scrollama
    - intersection-observer
*/

/*
TODO:
- add annotations to dotplot
- add legend to scatterplot
- fix colors for map
- mouseover text highlights elements in chart
- finish writing outro text
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
            makePlot1(data_1, response);
            break;
        case 1:
            updatePlot1(data_1, response);
            break;
        case 2:
            makePlot2(data_234, response);
            break;
        case 3:
            makePlot3(data_234, response);
            break;
        case 4:
            toggleChart(response);
            makePlot4(data_234, response);
            break;
        case 5:
            toggleChart(response);
            enterPlot5(data_5);
            break;
    }

    // redraw chart upon display
    handleResize();
}

function toggleChart(response) {

    // toggle z-index
    var dataStep = Number(response.element.dataset.step);
    chart.classed('is-active', false);

    // if moving down to step 5, switch divs
    if (response.index === 5 && response.direction === "down") {
        chart.classed('is-active', function(d, i) {
            return i === 1;
        });
    } else {
        chart.classed('is-active', function(d, i) {
            return i === 0;
        });

        // reset circles
        d3.select("#mapPlot").select("svg").select("#plot")
            .selectAll(".centroid")
            .attr("opacity", 0);
    };

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
			offset: 0.67, // set the trigger to be 2/3 way down screen
			debug: false, // display the trigger offset for testing
		})
		.onStepEnter(handleStepEnter);

	// setup resize event
	window.addEventListener('resize', handleResize);
}

// LOAD DATA
Promise.all([
    d3.json("data/processed-data/gen-by-year.json"),
    d3.json("data/processed-data/gen-ghi-panels-2016.json"),
    d3.json("data/processed-data/map-data.topojson")
]).then(results => {

    // assign separate references for each dataset
    this.data_1 = results[0];
    this.data_234 = results[1];

    // topojson code adapted from
    // https://bl.ocks.org/almccon/410b4eb5cad61402c354afba67a878b8
    // and uses https://github.com/topojson/topojson
    var topology = topojson.feature(results[2], results[2].objects.foo);
    this.data_5 = topology;

    // Go!
    scroll_init();  // initialize scrollama
    svg_init(); // initialize svg divs, g containers common to all plots
    makePlot5(data_5); // pre-draw map with invisible circles

}).catch(error => {
    console.log(error);
    document.getElementById("errMsg").innerHTML = error;
});

//
