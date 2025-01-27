---
layout: layouts/page.njk
title: Triathlon
templateClass: tmpl-page
key: triathlon
eleventyNavigation:
  key: Triathlon
  order: 4
---

I am a person that does triathlons and other endurance sports. Blog posts and/or clarification for many of these coming soon.

<table id="myTable" class="display" style="width:100%">
	<thead>
		<tr>
			<th>Race Name</th>
			<th>Location</th>
			<th>Date</th>
			<th>Time</th>
			<th>Overall Place</th>
			<th>Notes</th>
			<th>Blog Post</th>
			<th>Distance</th>
		</tr>
	</thead>
</table>

<link href="https://cdn.datatables.net/v/dt/jq-3.7.0/moment-2.29.4/dt-2.2.1/rg-1.5.1/datatables.min.css" rel="stylesheet">
 
<script src="https://cdn.datatables.net/v/dt/jq-3.7.0/moment-2.29.4/dt-2.2.1/rg-1.5.1/datatables.min.js"></script>

<script>
	let table = new DataTable('#myTable', {
		ajax: '/data-sources/race_history.json',
		columns: [
			{
				data: "race_name",
				sortable: false
			},
			{
				data: "location",
				sortable: false
			},
			{
				data: "date",
				render: function(data, type) {
					return type === 'sort' ? moment(new Date(data)).format('YYYY-MM-DD') : moment(new Date(data)).format('MMM Do');
				}
			},
			{
				data: "time",
				sortable: false
			},
			{
				data: "result",
				render: function(data, type) {
					return type === 'sort' ? eval(data) :  data + " (Top " + Math.round(eval(data) * 100) + "%)"
				},
				sortable: false
			},
			{
				data: "notes",
				sortable: false
			},
			{
				data: "blog_post",
				sortable: false
			},
			{
				data: "distance",
				sortable: false
			},
		],
		pageLength: 50,
		searching: false,
		paging: false,
		order: [[2, 'desc']],
		responsive: true,
		info: false,
		rowGroup: {
			dataSrc: (row) => {
				return moment(new Date(row.date)).format('YYYY')
			}
		}
	});
	// table.columns.adjust().draw();
</script>
