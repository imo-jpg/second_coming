var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// initialize the scrollama
var scroller = scrollama();


// generic window resize listener event
function handleResize() {
    // 1. update height of step elements
    var stepH = Math.floor(window.innerHeight * 0.75);
    step.style("height", stepH + "px");

    var figureHeight = window.innerHeight;
    // var figureMarginTop = (window.innerHeight - figureHeight) / 2;
    var figureMarginTop = 0;



    figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");

    // 3. tell scrollama to update new element dimensions
    scroller.resize();
}


////////CIRCLE STUFF BELOW HERE////////////
var width = window.innerWidth - 50;
var height = window.innerHeight;
var margin = {
    top: 150,
    right: 10,
    bottom: 10,
    left: 10
  };


  //SVG container
  var svg = d3.select('#chart')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/4) + ")");

  //SVG filter for the gooey effect, used Nadieh Bremer's code
  //Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
  var defs = svg.append("defs");
  var filter = defs.append("filter").attr("id","gooeyCodeFilter");
  filter.append("feGaussianBlur")
    .attr("in","SourceGraphic")
    .attr("stdDeviation","10")
    .attr("color-interpolation-filters","sRGB") 
    .attr("result","blur");
  filter.append("feColorMatrix")
    .attr("in","blur")
    .attr("mode","matrix")
    .attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
    .attr("result","gooey");

    //Create scale
var xScale = d3.scale.linear()
  .domain([-1.25, 1.25])
  .range([-width/4, width/4]);

//Create a wrapper for the circles that has the Gooey effect applied to it
var circleWrapper = svg.append("g")
  .style("filter", "url(#gooeyCodeFilter)");

//Create the circles that will move out and in the center circle
var steps = 42;
var flyCircleData = [];
for (let i = 0; i < steps; i++) {
  flyCircleData.push({ 
    fixedAngle: (i/steps)*(2*Math.PI),
    fixedAngleOuter: (i/steps)*(10*Math.PI),
    speed: Math.random() * 7000 + 3000,
    r: Math.floor(Math.random() * 25 + 25),
    color: "#333333"
  })
}
console.log(flyCircleData);

//Set up the circles
var flyCircles = circleWrapper.selectAll(".flyCircle")
  .data(flyCircleData)
  .enter().append("circle")
  .attr("class", "flyCircle")
  .style("fill", function(d) { return d.color; })
  .attr("cy", 0)
  .attr("cx", 0)
  .attr("r", 0)
  .attr("cy", function(d) { return xScale(Math.sin(d.fixedAngle)); })
  .attr("cx", function(d) { return xScale(Math.cos(d.fixedAngle)); })
  .attr("r", function(d) { return d.r; });

function goRound(d) {
    d3.select(this)
      .transition().duration(function(d) { return d.speed; })
      .ease("linear")
      .attrTween("transform", function() { return d3.interpolateString("rotate(0)", "rotate(360)"); })
      .each("end", goRound);
}

function goOut(d) {
    console.log(d.speed);
    d3.select(this)
    .transition().duration(function(d) { return d.speed / 2; })
    .ease("linear")
        .attr("cy", function(d) { return xScale(Math.sin(d.fixedAngleOuter) *3); })
        .attr("cx", function(d) { return xScale(Math.cos(d.fixedAngleOuter) *3); });
}

function changeColor(d) {
    d3.select(this)
    .transition().duration(function(d) { return d.speed / 6; })
    .ease("linear")
        .style("fill", "#6B0F1A")
        .attr("r", function(d) { return 3.5 * (d.r); });
}

function goIn(d) {
    d3.select(this)
    .transition().duration(function(d) { return d.speed / 3; })
    .ease("linear")
        .attr("cy", xScale(0))
        .attr("cx", xScale(0));
}


function init() {

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();

    // 2. setup the scroller passing options
    // 		this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter((response) => {
            // response = { element, direction, index }

            // step.classed("is-active", function (d, i) {
            //     return i === response.index;
            // });

            if (response.index === 0) {
                flyCircles.each(goRound);
            } else if (response.index === 1) {
                flyCircles.each(goOut);
            } else if (response.index === 2) {
                flyCircles.each(changeColor);
            } else if (response.index === 3) {
                flyCircles.each(goIn);
            }
            // figure.select("p").text(response.index + 1);
        });
}

// kick things off
init();
