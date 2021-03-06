// 
// Main Directory/
// └── Assets/
// │    ├── css/
// │    │   ├── data/
// │    │   │   ├── js/
// │    │   │   │   ├── app.js Functions:
// │    │   │   │   ├── xScale(rawData, chosenXAxis)
// │    │   │   │   ├── renderAxes(newXScale, xAxis)
// │    │   │   │   ├── renderAxes(newXScale, xAxis)
// │    │   │   │   ├── renderCircles(circlesGroup, newXScale, chosenXAxis)
// │    │   │   │   ├── updateToolTip(chosenXAxis, circlesGroup)
// │    │   │   │   ├── 
// │    │   │   │   ├── 
// │    │   │   │   ├── 
// │    │   │   │   ├── 
// │    │   │   │   ├── 
// │    │   │   │   ├── 
// │    │   │   │   └── 
// │    │   │   ├── app.js
// │    │   │   └── eslintrc.json
// │    │   │    
// │    │   └── data.csv
// │    ├── style.css      
// │    └── d3Style.css
// │    
// └── index.html


var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";

// function used for updating x-scale var upon click on axis label
function xScale(rawData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(rawData, d => d[chosenXAxis]) * 0.8,
      d3.max(rawData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1500)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1500)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
// Update the label displayed on the tool tip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "smokes") {
    var label = "Smokers Percentage:";
  }
  else {
    var label = "Obesity Percentage:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>Age: ${d.age}`);               // Tool tip label
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(rawData) {
  rawData.forEach(function(d){
      d.smokes = +d.smokes;
      d.obesity = +d.obesity;
      d.age = +d.age;
      console.log(d);
  });
       
  // xLinearScale function above csv import
  var xLinearScale = xScale(rawData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.age)])          // Y Scale - get back to this - currently set for single value set to age
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(rawData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.age))          
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");


//   LABEL BUTTONS
  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var smokesLabel = labelsGroup.append("text")      
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes") 
    .classed("active", true)
    .text("Smokers Percentage");

  var obesityLabel = labelsGroup.append("text")         
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity Percentage");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Average Age");                         

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(rawData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text                              
        if (chosenXAxis === "obesity") {         // change this to obesity
            obesityLabel
            .classed("active", true)
            .classed("inactive", false);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
