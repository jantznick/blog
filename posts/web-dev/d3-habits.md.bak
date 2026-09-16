---
title: Putting d3JS Charts in Eleventy Blogs
description: Putting d3JS Charts in Eleventy Blogs
date: 2024-03-04
tags: web-dev
layout: layouts/post.njk
---

Sample of getting [d3JS](https://d3js.org/) working with a static blog.

<!-- Load d3.js -->
<script src="https://d3js.org/d3.v4.js"></script>

<!-- Create a div where the graph will take place -->
<div id="habit-graph"></div>

<script>

	// set the dimensions and margins of the graph
	var padding = 30;
	var width = document.getElementById('post-content').offsetWidth - padding * 2;
	var height = 600 - padding * 2;

	// append the svg object to the body of the page
	var svg = d3.select("#habit-graph")
		.append("svg")
			.attr("width", width + padding * 2)
			.attr("height", height + padding * 2)
		.append("g")
			.attr("transform",
				"translate(" + padding + "," + padding + ")")

	//Read the data
	d3.csv("/data-sources/habits.csv",

		// When reading the csv, I must format variables:
		(d) => {
			return {
				date: d3.timeParse("%Y-%m-%d")(d.DATE),
				ukulele : parseInt(d['PLAY UKULELE']),
				spanish: parseInt(d['PRACTICE SPANISH'])
			}
		},

		// Now I can use this dataset:
		(data) => {

			// Add X axis --> it is a date format
			var x = d3.scaleTime()
				.domain(d3.extent(data, (d) => d.date))
				.range([ 0, width ]);
			svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));

			// Add Y axis
			var y = d3.scaleLinear()
				.domain([0, d3.max(data, (d) => d.ukulele < d.spanish ? d.spanish : d.ukulele)])
				.range([ height, 0 ]);
			svg.append("g")
				.call(d3.axisLeft(y));

			// Add the line
			svg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-width", 2)
				.attr("d", d3.line()
				.x((d) => x(d.date))
				.y((d) => y(d.ukulele))
			)

			svg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "red")
				.attr("stroke-width", 2)
				.attr("d", d3.line()
				.x((d) => x(d.date))
				.y((d) => y(d.spanish))
			)
		}
	)

</script>