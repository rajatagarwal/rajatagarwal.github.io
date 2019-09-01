// Measurement
var w = 1300, h = 550;
var padding = [ 20, 10, 20, 15 ];  //Top, right, bottom, left

// Scaling
var xScale = d3.scaleBand()
				.rangeRound([ padding[3], w - padding[1] ], 0.2);
var yScale = d3.scaleLinear()
				.range([ h - padding[2], h/1.45 ]);

// Axis
var xAxis = d3.axisBottom()
				.scale(xScale)
				.tickSize(0);

var yAxis = d3.axisLeft()
				.scale(yScale)
				.ticks(5)
				.tickSizeInner(-(w))
				.tickSizeOuter(0);

// SVG Container
var svg_choropleth = d3.select("#svganchor")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

// Tooltip
var tt_choropleth = d3.select("#svganchor").append("div")	
		    .attr("class", "tooltip_choropleth")				
		    .style("opacity", 0);

var away = 1200, enter = 1200;

var slice = [0, 30];

//var colorgrad = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'];
var colorgrad = ['#eff3ff', '#bdd7e7', '#6baed6', '#2171b5']

var color = d3.scaleQuantize()
						.range(colorgrad);

var projection = d3.geoEquirectangular()
						.center([ -25, 35 ])
						.translate([ w/2, h/4 ])
						.scale([ w/6.5 ]);

var path = d3.geoPath()
				.projection(projection);

var nobelprize = "Total";

var defaultOptionName = "Total";

var dropdownValues = [{"nobelPrizeName": "Total", "nobelPrizeValue": "Total"},
						{"nobelPrizeName": "Physics", "nobelPrizeValue": "Physics"},
						{"nobelPrizeName": "Chemistry", "nobelPrizeValue": "Chemistry"},
						{"nobelPrizeName": "Physiology or Medicine", "nobelPrizeValue": "Physiology_or_Medicine"},
						{"nobelPrizeName": "Literature", "nobelPrizeValue": "Literature"},
						{"nobelPrizeName": "Peace", "nobelPrizeValue": "Peace"},
						{"nobelPrizeName": "Economics", "nobelPrizeValue": "Economics"}
					];

var dropdown = d3.select("#opt")
	.append("div")
	.attr("class","dropdown")
	.append("select");

dropdown.selectAll("option")
	.data(dropdownValues)
	.enter()
	.append("option")
	.attr("value", function(d){ return d.nobelPrizeValue })
	.property("selected", function(d){ return d.nobelPrizeName == defaultOptionName; })
	.text(function(d) {
		return d.nobelPrizeName;
	});

// Data
d3.csv("nobelprize.csv", function(data){
	color.domain([
		d3.min(data, function(d) { return +d[nobelprize]; }), 
		d3.max(data, function(d) { return +d[nobelprize]; })
	]);

	yScale.domain([0, d3.max(data, function(d) {
		return +d[nobelprize];
	})]);

	var top = data.sort(function(a, b) {
		return d3.descending(+a[nobelprize], +b[nobelprize]);
	}).slice( slice[0], slice[1]);

	xScale.domain(top.map(function(d) { return d.iso; } ));

	svg_choropleth.append("text")
		.attr("y", h/1.5 - 40)
		.attr("font-family", "Roboto")
		.attr("font-size", 16)
		.attr("font-weight", 100)
		.attr("fill", "#08306b")
		.attr("x", padding[3])
		.text("NOBEL PRIZE (TOP 30 COUNTRIES):");

	var nobelPrizeTitle = svg_choropleth.append("text")
		.attr("y", h/1.5 - 20)
		.attr("font-family", "Roboto")
		.attr("font-size", 16)
		.attr("font-weight", 100)
		.attr("fill", "#08306b")
		.attr("x", padding[3])
		.text(defaultOptionName);

	var bars_ch = svg_choropleth.selectAll("rect")
		.data(top, function(d) { return d.iso})
		.enter()
		.append("rect")

	bars_ch.attr("y", h - padding[2])
		.attr("x", function(d) {
			return xScale(d.iso);
		})
		.attr("height", 0)
		.attr("width", xScale.bandwidth()/1.2)
		.attr("class", "bar_ch")
		.attr("fill", colorgrad[3])
		.attr("opacity", 1);

	var labelbot = svg_choropleth.selectAll(".label")
		.data(top, function(d) { return d.iso; })
		.enter()
		.append("text")

	labelbot.attr("class", "label")
		.attr("y", h - padding[2] + 4)
		.attr("x", function(d) {
			return xScale(d.iso) ;
		})
		.attr("dominant-baseline", "hanging")
		.attr("font-family", "PT Sans")
		.attr("font-size", 12)
		.text(function(d){return d.iso});

	bars_ch.transition()
		.delay(function(d, i) {
			return i * 30;
		})
		.duration(500)
		.attr("y", function(d) {
			return yScale(d[nobelprize]);
		})
		.attr("height", function(d) {
			return (h - padding[0]) - yScale(d[nobelprize]);
		});
	d3.selectAll(".bar_ch").on("mousemove", function(d) {
		tt_choropleth.transition()
         .duration(200)
         .style("opacity", .9);
		tt_choropleth.html("<strong>" + d.Country + "</strong> <br>"+ $("#opt :selected").text() + " count: <strong>" + d[nobelprize] + "</strong>")
                  .style('top', d3.event.pageY - 12 + 'px')
                  .style('left', d3.event.pageX + 25 + 'px')
                  .style("opacity", 0.9);
	})
	.on("mouseout", function(d) {
		tt_choropleth.style("opacity", 0);
	});
	svg_choropleth.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + padding[2] + ",0)")
		.call(yAxis);

	svg_choropleth.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (h - padding[2]) +")")
		.call(xAxis);

	d3.selectAll(".tick")
	    .filter(function (d) { return d === 0;  })
	    .remove();

	d3.json("mapshaper_output.json", function(json){
		for (var i = 0; i < data.length; i++) {
			var dataCountryCode = data[i].iso;
				
			var dataNobelPrize = +data[i].Total;
			var dataPhysics = +data[i].Physics;
			var dataChemistry = +data[i].Chemistry;
			var dataPhysiology_or_Medicine = +data[i].Physiology_or_Medicine;
			var dataLiterature = +data[i].Literature;
			var dataPeace = +data[i].Peace;
			var dataEconomics = +data[i].Economics;
			for (var j = 0; j < json.features.length; j++) {
				var jsonCountryCode = json.features[j].properties.iso_a3;

				if (dataCountryCode == jsonCountryCode) {
					json.features[j].properties.Total = dataNobelPrize;
					json.features[j].properties.Physics = dataPhysics;
					json.features[j].properties.Chemistry = dataChemistry;
					json.features[j].properties.Physiology_or_Medicine = dataPhysiology_or_Medicine;
					json.features[j].properties.Literature = dataLiterature;
					json.features[j].properties.Peace = dataPeace;
					json.features[j].properties.Economics = dataEconomics;
					break;
				}
			}
		}

		var countries = svg_choropleth.selectAll(".countries")
		   .data(json.features)
		   .enter()
		   .append("path");

		countries.attr("d", path)
		   .attr("stroke", "gray")
		   .attr("fill", function(d) {
				var value = d.properties[nobelprize];
				if (value) {
					return color(value);
				} else {
					return "#aaa";
				}
			});

		countries.on("mousemove", function(d) {
			if (d.properties[nobelprize]) {
				return tt_choropleth.style("opacity", .9)	
            	.html("&nbspCountry: <strong>" + d.properties.name + "</strong>&nbsp<br>" + $("#opt :selected").text() + " count: <strong>" + d.properties[nobelprize] + "</strong>")	
                .style("left", (d3.event.pageX + 10) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");
			}	else	{
            tt_choropleth.style("opacity", .9)	
            	.html("&nbspCountry: <strong>" + d.properties.name + "&nbsp<br></strong>" + $("#opt :selected").text() + ": No data.")	
                .style("left", (d3.event.pageX + 10) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            }
            })					
	        .on("mouseout", function(d) {		
	            tt_choropleth.style("opacity", 0);	
	        });

	        dropdown.on("change", change);

	        function change(){
	        	nobelprize = this.value;

				var result = dropdownValues.filter(function(d){
					return d.nobelPrizeValue == nobelprize;
				});

				defaultOptionName = result[0].nobelPrizeName;

				nobelPrizeTitle.transition().duration(1000).text(defaultOptionName);

				color.domain([
					d3.min(data, function(d) { return +d[nobelprize]; }), 
					d3.max(data, function(d) { return +d[nobelprize]; })
				]);

				yScale.domain([0, d3.max(data, function(d) {
					return +d[nobelprize];
				})]);

				var top = data.sort(function(a, b) {
					return d3.descending(+a[nobelprize], +b[nobelprize]);
				}).slice( slice[0], slice[1]);

				xScale.domain(top.map(function(d) { return d.iso; } ));

				countries.transition()
					.duration(1000)
					.attr("fill", function(d) {

						var value = d.properties[nobelprize];

						if (value) {
							return color(value);
						} else {
							return "#aaa";
						}
					});

				//enter
				var barenter = svg_choropleth.selectAll("rect")
					.data(top, function(d) { return d.iso})
					.enter()
					.insert("g", ".y.axis")
					.append("rect")
					.attr("class", "bar_ch");

				barenter.attr("y", h - padding[2])
					.attr("width", xScale.bandwidth()/1.2)
					.attr("height", 0)
					.attr("x", enter)
					.attr("fill", colorgrad[3]);

				var textenter = svg_choropleth.selectAll(".label")
					.data(top, function(d) { return d.iso})
					.enter()
					.append("text")
					.attr("class", "label");

				textenter.attr("y", h - padding[2] + 4)
					.attr("x", enter)
					.attr("dominant-baseline", "hanging")
					.attr("font-family", "PT Sans")
					.attr("font-size", 12)
					.text(function(d){return d.iso});

				//update
				var barupdate = svg_choropleth.selectAll("rect")
					.data(top, function(d) { return d.iso});

				barupdate.attr("class", "bar_ch")
					.transition()
					.duration(2000)
					.attr("y", h - padding[2])
					.attr("x", function(d) {
						return xScale(d.iso);
					})
					.attr("width", xScale.bandwidth()/1.2)
					.attr("y", function(d) {
							return yScale(d[nobelprize]);
						})
					.attr("height", function(d) {
							return (h - padding[0]) - yScale(d[nobelprize]);
						});		

				var textupdate = svg_choropleth.selectAll(".label")
					.data(top, function(d) { return d.iso});

				textupdate.attr("class", "label")
					.transition()
					.duration(2000)
					.attr("x", function(d) {
					return xScale(d.iso) ;
				});
				//exit
				var barexit = svg_choropleth.selectAll("rect")
					.data(top, function(d) { return d.iso})
					.exit();

				barexit.transition()
			        .duration(2000)
			        .attr("x", away)
			        .attr("y", h - padding[2])
			        .attr("height", 0)
					.remove();

				var textexit = svg_choropleth.selectAll(".label")
					.data(top, function(d) { return d.iso})
					.exit();

				textexit.transition()
			        .duration(2000)
			        .attr("x", away)
					.remove();

				d3.selectAll(".bar_ch").on("mousemove", function(d) {
					tt_choropleth.html("<strong>" + d.Country + "</strong> <br>"+ $("#opt :selected").text() + " count: <strong>" + d[nobelprize] + "</strong>")
			                  .style('top', d3.event.pageY - 12 + 'px')
			                  .style('left', d3.event.pageX + 25 + 'px')
			                  .style("opacity", 0.9);
				})
				.on("mouseout", function(d) {
					tt_choropleth.style("opacity", 0);
				});

				d3.transition(svg_choropleth).select(".y.axis").transition().duration(2000)
  					.call(yAxis);

  				d3.selectAll(".tick")
			    .filter(function (d) { return d === 0;  })
			    .remove();

	        };
	}); // JSON END
}); // CSV END