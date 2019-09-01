
		//Accessors
		function region(d) { return d.Region; }
		function key(d) { return d.Country; }

		//Chart dimensions
		var margin = {top: 20, right: 20, bottom: 20, left: 40},
			width = 1180 - margin.right -margin.left,
			height = 600 - margin.top - margin.bottom;
			
		//Scales
		var xScale = d3.scale.log().domain([300, 1.3e5]).range([0, width]),
			yScale = d3.scale.linear().domain([10, 85]).range([height, 0]),
			radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]),
			colorScale = d3.scale.category10().domain(["Africa","Asia", "Australia", "Central America","Europe", "North America", "Oceania", "South America"]).range([
				'#00d5e9', '#ff5872', '#000080' , '#8A2BE2', '#FFC700', '#7feb00', '#ff00ff', '#8c510a']),
			opacityScale = d3.scale.linear().domain([1000,10000]).range([.5,1]),
			regionScale = d3.scale.ordinal().domain(["Africa","Asia", "Australia", "Central America","Europe", "North America", "Oceania", "South America"]).range(["Africa","Asia", "Australia", "Central America","Europe", "North America", "Oceania", "South America"]);

		//The x & y axis
		var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(", d")),
			yAxis = d3.svg.axis().orient("left").scale(yScale);

		//SVG Container setup
		var svg = d3.select("#chart").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top +")");

		//Add x-axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		//Add y-axis
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		//Add an x-axis label
		svg.append("text")
			.attr("class", "x label")
			.attr("id", "x_label")
			.attr("text-anchor", "end")
			.attr("x", width)
			.attr("y", height - 6)
			.text("INCOME PER PERSON in US Dollars (GDP/capita, PPP$ inflation adjusted, log scale)");

		//Add a y-axis label
		svg.append("text")
			.attr("class", "y label")
			.attr("id", "y_label")
			.attr("text-anchor", "end")
			.attr("y", 6)
			.attr("dy", "0.75em")
			.attr("transform", "rotate(-90)")
			.text("LIFE EXPECTANCY in years");

		//Year label
		var label = svg.append("text")
			.attr("id", "year_label")
			.attr("class", "year label")
			.attr("text-anchor", "end")
			.attr("y", height - 24)
			.attr("x", width)
			.text(1900);
	
		//Load data
		d3.csv("mean.csv",function(nations) {
  			// Add a dot per nation. Initialize the data at 1900, and set the colors.
  			var dot = svg.append("g")
      			.attr("class", "dots")
    			.selectAll(".dot")
      			.data(interpolateData(1900))
    			.enter().append("circle")
    			// Add additional class with region name of currently added circle. 
      			.attr("class", function(d) { return "dot " + regionScale(d.Region); })
      			.style("fill",function(d) {return colorScale(d.Region);})
      			.call(position)
      			.sort(order)
      			.on("mouseover", fadeChart);			


        	//Start a transition that interpolates the data based on year
			svg.transition()
				.duration(40000)		//Total time to finish the transition.
				.ease("linear")
				.tween("year", tweenYear)
				.each("end", enableInteraction);

			//Mouseover actions on Circles
			function fadeChart(){
				dot
					.on("mouseover", mouseover)
        			.on("mouseout", mouseout)
        			.on("click", clicked)

        		function clicked(){
        			d3.selectAll(".dot").style("opacity",function(d){return 0.1;});
        			d3.select("dots").style("opacity",function(d){return 0.1;});
        			//To fetch second class name which is RegionScale
        			d3.selectAll("."+this.getAttribute('class').split(' ')[1]).style("opacity",function(d){return 1;});
        		}
        		function mouseover() {
        			d3.selectAll(".dot").style("opacity",function(d){return 0.1;});
	        		d3.select("dots").style("opacity",function(d){return 0.1;});
	       			d3.select(this).style("opacity",function(d){return 1;});
	       			d3.select(this).style("z-index",function(d){return 20;});
        		}

    			function mouseout() {
    				d3.select("svg").style("opacity",function(d){return 1;})
					dot.style("opacity",function(d) {return 1;})
    			}
			}

        	//enable transaction
			function enableInteraction(){
				var yearScale = d3.scale.linear()
        		.domain([1900, 2015])
        		.clamp(true);
  			}

  			//Replay
  			$("#replay_button_id").on("click", function(){
  				svg.transition()
					.duration(40000)		//Timer
					.ease("linear")
					.tween("year", tweenYear)
  			});

  			//Pause
  			$("#pause_button_id").on("click", function(){
  				svg.transition()
					.duration(0)		//Timer
  			});

  			//Resume 
  			$("#resume_button_id").on("click", function(){
  				// Get current year and set time according to that
  				var halt_year_val = $('#slider-vertical').slider("option", "value");
  				var time_required_to_finish_animaiton = 0;
  				// Total animation time 40000
  				// Total Years 115 years
  				// We need to make constant time
  				// Time required to finsih animation = (40000/115) * (2015-current selected year)
  				time_required_to_finish_animaiton = (40000/115) * (2015 - halt_year_val);
  				// Cancel the current transition, if any.
    			svg.transition().duration(0);
				svg.transition()
					.duration(time_required_to_finish_animaiton)		//Timer
					.ease("linear")
					.tween("year", tweenYear_Resume);
  			});

  			//Tween Year Resume
  			function tweenYear_Resume(year){
  				var halt_year_val = $('#slider-vertical').slider("option", "value");
				var year = d3.interpolateNumber(halt_year_val,2015);
				return function(t) { displayYear(year(t)); };
  			}

  			//Slider
			var year_slider_value = 1900;
			$("#slider-vertical").on("slidestop", function(event, ui) {
				year_slider_value = ui.value;
				// Cancel the current transition, if any.
    			svg.transition().duration(0);
				slider_function(year_slider_value);
			});

			//Makes it moving while dragging button on the slider
			$("#slider-vertical").on("slide", function(event, ui) {
				year_slider_value = ui.value;
				// Cancel the current transition, if any.
    			svg.transition().duration(0);
				slider_function(year_slider_value);
			});

			function slider_function(year_slider_value){
				displayYear(year_slider_value);
			}

  			//Tweens the entire chart by first tweening the year and then the data
			function tweenYear(){
				var year = d3.interpolateNumber(1900,2015);
				return function(t) { displayYear(year(t)); };
			}

			//Display Year
			function displayYear(year){
				rounded_year = Math.round(year);
  				label.text(rounded_year);
  				$( "#slider-vertical" ).slider( "value", year );
  				dot.text(function(d) {return d.Country +"\nGDP: " +d.GDP+ "\nLifeExp: " +d.LifeExp; });
  				dot.data(interpolateData(rounded_year), key).call(position).sort(order);
			}

      		// Positions the dots based on data.
  			function position(dot) {
    			dot .attr("cx",function(d) {return xScale(+d.GDP);})
    			.attr("cy",function(d) {return yScale(+d.LifeExp);})
    			.attr("r", function(d){return radiusScale(+d.Population);})
    			.append("title")
    			.text(function(d) {return d.Country +"\nGDP: " +d.GDP+ "\nLifeExp: " +d.LifeExp; });
  			}

  			// Defines a sort order so that the smallest dots are drawn on top.
  			function order(a, b) {
    			return b.Population - a.Population;
  			}

      		//Interpolated data
			function interpolateData(year){
				return nations.filter(function(a) {return a.Year == year});
			}
			
			// draw legend
			var legend = svg.selectAll(".legend")
				.data(colorScale.domain())
			    .enter().append("g")
			    .attr("class", "legend")
			    .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });

			// draw legend colored rectangles
			legend.append("rect")
			    .attr("x", 40)
			    .attr("width", 18)
			    .attr("height", 18)
			    .style("fill", colorScale);

			// draw legend text
			legend.append("text")
			    .attr("x", 65)
			    .attr("y", 9)
			    .attr("dy", ".35em")
			    .attr("class", "legend label")
			    .style("text-anchor", "start")
			    .text(function(d) { return d;});
	
		});

		// D3 Bar Chart
		d3.csv("pop.csv",function(top_nations) {
			//Chart dimensions
			var margin_bar = {top: 20, right: 20, bottom: 150, left: 40},
				width_bar = 1180 - margin_bar.right,
				height_bar = 600 - margin_bar.top - margin_bar.bottom;

			// X and Y Scale
			var xScale_bar = d3.scale.ordinal().rangeRoundBands([0, width_bar], .1);
    		var yScale_bar = d3.scale.linear().range([height_bar, 0]);
					
			// X and Y axis
			var xAxis_bar = d3.svg.axis().scale(xScale_bar).orient("bottom"),
				yAxis_bar = d3.svg.axis().scale(yScale_bar).orient("left").ticks(10);
			
			//SVG Container setup
			var svg_bar = d3.select("#bar_chart").append("svg")
				.attr("width", width_bar + margin_bar.left + margin_bar.right)
				.attr("height", height_bar + margin_bar.top + margin_bar.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top +")");

			// Tooltip
			var tt = d3.select("#bar_chart").append("div")	
				.attr("class", "tooltip")				
			    .style("opacity", 0);

			// Make Bar Chart
			function make_bar_chart(top_nations){

				//Cancel Existing Transition
				svg_bar.selectAll("*").remove();

				xScale_bar.domain(top_nations.map(function(d) { return d.Country; }));
				yScale_bar.domain([0, d3.max(top_nations, function(d) { return +d.Score; })]);

				// No Data
				if(top_nations.length == 0){
					alert("No data found!!!");
				}

				//Add x-axis
				svg_bar.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height_bar + ")")
					.call(xAxis_bar)
					.selectAll("text")  
            			.style("text-anchor", "end")
            			.attr("dx", "-.8em")
            			.attr("dy", ".15em")
            			.attr("transform", "rotate(-65)" );

				//Add y-axis
				svg_bar.append("g")
					.attr("class", "y axis")
					.call(yAxis_bar);
				
				// Bars
				var bars = svg_bar.selectAll(".bars")
				.data(top_nations)
				.enter()
				.append("rect")
				.attr("class", "bars");
				
				// Transition of bars
				bars.transition()
					.delay(function(d, i) { 
						return i * 30
					})
					.duration(1000)
					.attr("y", function(d){
			   			return yScale_bar(+d.Score);
			   		})
			   		.attr("height", function(d) { return height_bar - yScale_bar(+d.Score); });

				// X axis attribute
				bars.attr("x", function(d) {
			   			return xScale_bar(d.Country);
			   		})
					.style("fill",function(d) {return colorScale(d.Region);});

				// Y axis attribute
			   	bars.attr("y", function(d){
			   			return yScale_bar(+d.Score);
			   		})
			   		.attr("height", function(d) { return height_bar - yScale_bar(+d.Score); })
      				.attr("width", xScale_bar.rangeBand());

      			
      			// Tooltip on bars
      			bars.on("mousemove", function(d) {
					tt.html("&nbspIn " + d.Year + ", " + d.Country+" has scored <br><strong>&nbsp" + d.Score + "</strong> points.&nbsp")
						.style('top', d3.event.pageY - 12 + 'px')
		                .style('left', d3.event.pageX + 25 + 'px')
				        .style("opacity", 0.95);
					});

				bars.on("mouseout", function() {
					tt.style("opacity", 0)
				});
			}

			// Interpolated data for table
			function interpolateDataTable(year){
				// Change text for the table
				document.getElementById("top_30_text").innerHTML = "Top 30 countries based on GDP, LifeExp & Population("+year+")";
				// Filter based on the year.
				that_year_data = top_nations.filter(function(a) {return a.Year == year});
				top_n_data_for_that_year = get_top_n(that_year_data);
				return top_n_data_for_that_year;
			}

			// Get top n data
			function get_top_n(that_year_data){
				that_year_data.sort(function(a,b){
					return parseFloat(b.Score) - parseFloat(a.Score);
				});
				return that_year_data.slice(0,30);
			}

			var year_val_slider = 1900;
			// For the first time
			make_bar_chart(interpolateDataTable(year_val_slider));	
			// On slider change, change data
			$("#slider-vertical2").on("slidestop", function(event, ui) {
				year_val_slider = ui.value;
				make_bar_chart(interpolateDataTable(year_val_slider));	
			});
		});