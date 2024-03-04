---
title: Habit Tracking 
description: Using an iOS App to track daily habits
date: 2024-03-03
tags:
  - data-analysis
layout: layouts/post.njk
---

I use an iOS habit tracker to track some daily habits/goals of mine. This will be a place where I practice manipulating the data to better understand my habits. 

My goal for 2023 into the start of 2024 was to focus time on practicing Spanish up until my trip to Mexico at the beginning of February. After that I would spend more time playing the ukulele. This graph somewhat shows that switch. More calculations to come on it later.

<div style="width: 100%;">
  <canvas id="myChart"></canvas>
</div>

<script src="/js/chart.js"></script>
<script src="/js/papaparse.min.js"></script>

<script>

const myRequest = new Request("data-sources/habits.csv");

Papa.parse('/data-sources/habits.csv', {
    download: true,
	header: true,
    complete: results => {
		habit_data = results.data
		const data = {
          labels: habit_data.map((el) => {return el.DATE}),
          datasets: [{
            label: "Spanish Practice",
            data: habit_data.map((el) => {return el["PRACTICE SPANISH"]}),
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }, {
            label: "Play Ukulele",
            data: habit_data.map((el) => {return el["PLAY UKULELE"]}),
            fill: true,
            borderColor: 'rgb(224, 49, 11)',
            tension: 0.1
          }
		  ]
		}

        const ctx = document.getElementById('myChart');

        new Chart(ctx, {
          type: 'line',
          data: data,
          options: {
      		scales: {
          		y: {
          			beginAtZero: true
          		}
      		},
			plugins: {
				legend: {
					title: {
						text: "Minutes Spent per Day",
						display: true,
						font: {
							size: "24px"
						}
					}
					// labels: 
				}
			}
          }
        });
    }
})


</script>
