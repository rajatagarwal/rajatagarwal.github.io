//http://bl.ocks.org/atmccann/8966400
var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 1300 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .innerTickSize(15)
    .outerTickSize(0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .tickFormat(function(d) { return d;})
    .ticks(15)
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d.price); });

var svg = d3.select("#svg_line")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("nobelprizeyearly.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

  data.forEach(function(d) {
    d.Year = parseDate(d.Year);
  });

  var companies = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {Year: d.Year, price: +d[name]};
      })
    };
  });


  x.domain(d3.extent(data, function(d) { return d.Year; }));

  y.domain([
    d3.min(companies, function(c) { return d3.min(c.values, function(v) { return v.price; }); }),
    d3.max(companies, function(c) { return d3.max(c.values, function(v) { return v.price; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);


  svg.append("line")
        .attr(
        {
            "class":"horizontalGrid",
            "x1" : 0,
            "x2" : width,
            "y1" : y(0),
            "y2" : y(0),
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "black",
            "stroke-width" : "1px",
            "stroke-dasharray": ("3, 3")
        });


  var company = svg.selectAll(".company")
      .data(companies)
    .enter().append("g")
      .attr("class", "company");



  var path = svg.selectAll(".company").append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { if (d.name == "Physics") 
                                        {return "#e41a1c"}
                                      else if(d.name == "Chemistry")
                                      	{return "#377eb8"}
                                      else if(d.name == "Physiology_or_Medicine")
                                      	{return "#4daf4a"}
                                      else if(d.name == "Literature")
                                      	{return "#984ea3"}
                                      else if(d.name == "Peace")
                                      	{return "#ff7f00"}
                                      else if(d.name == "Economics")
                                      	{return "#ffff33"}
                                      else{return "#a65628";}
                                         });

  //var totalLength = path.node().getTotalLength();
/*
console.log(path);
console.log(path.node());
console.log(path[0][0]);
console.log(path[0][1]);
*/
var totalLength = [path[0][0].getTotalLength(), 
					path[0][1].getTotalLength(),
					path[0][2].getTotalLength(),
					path[0][3].getTotalLength(),
					path[0][4].getTotalLength(),
					path[0][5].getTotalLength(),
					path[0][6].getTotalLength()];

   d3.select(path[0][0])
      .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0] ) 
      .attr("stroke-dashoffset", totalLength[0])
      .transition()
        .duration(12000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

   // setTimeout(function(){
   	d3.select(path[0][1])
      .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1] )
      .attr("stroke-dashoffset", totalLength[1])
      .transition()
        .duration(12000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
   // }, 12000);

   
   
   d3.select(path[0][2])
      .attr("stroke-dasharray", totalLength[2] + " " + totalLength[2] ) 
      .attr("stroke-dashoffset", totalLength[2])
      .transition()
        .duration(12000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

   d3.select(path[0][3])
      .attr("stroke-dasharray", totalLength[3] + " " + totalLength[3] )
      .attr("stroke-dashoffset", totalLength[3])
      .transition()
        .duration(12000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

   d3.select(path[0][4])
      .attr("stroke-dasharray", totalLength[4] + " " + totalLength[4] ) 
      .attr("stroke-dashoffset", totalLength[4])
      .transition()
        .duration(12000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

   d3.select(path[0][5])
      .attr("stroke-dasharray", totalLength[5] + " " + totalLength[5] )
      .attr("stroke-dashoffset", totalLength[5])
      .transition()
        .duration(12000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

   	d3.select(path[0][6])
      .attr("stroke-dasharray", totalLength[6] + " " + totalLength[6] )
      .attr("stroke-dashoffset", totalLength[6])
      .transition()
        .duration(12000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

   // Customized Legend
   svg.append("text")
    	.attr("x","25")
    	.attr("y","15")
    	.attr("text-anchor", "start")
		.style("fill", "#e41a1c")
    	.text("Physics")
   svg.append("text")
    	.attr("x","25")
    	.attr("y","40")
    	.attr("text-anchor", "start")
		.style("fill", "#377eb8")
    	.text("Chemistry")
   svg.append("text")
    	.attr("x","25")
    	.attr("y","65")
    	.attr("text-anchor", "start")
		.style("fill", "#4daf4a")
    	.text("Physiology or Medicine")
   svg.append("text")
    	.attr("x","25")
    	.attr("y","90")
    	.attr("text-anchor", "start")
		.style("fill", "#984ea3")
    	.text("Literature")
   svg.append("text")
    	.attr("x","25")
    	.attr("y","115")
    	.attr("text-anchor", "start")
		.style("fill", "#ff7f00")
    	.text("Peace")
   svg.append("text")
    	.attr("x","25")
    	.attr("y","140")
    	.attr("text-anchor", "start")
		.style("fill", "#ffff33")
    	.text("Economics")
   svg.append("text")
    	.attr("x","25")
    	.attr("y","165")
    	.attr("text-anchor", "start")
		.style("fill", "#a65628")
    	.text("Total")

});