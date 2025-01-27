---
layout: layouts/page.njk
title: Triathlon
templateClass: tmpl-page
key: triathlon
eleventyNavigation:
  key: Triathlon
  order: 4
---

I am a person that does triathlons.

<table id="myTable" class="display" style="width:100%">
	<thead>
		<tr>
			<th>Race Name</th>
			<th>Location</th>
			<th>Date</th>
			<th>Time</th>
			<th>Result</th>
			<th>Notes</th>
			<th>Blog Post</th>
			<th>Distance</th>
		</tr>
	</thead>
</table>

<!-- jQuery for datatables -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

<!-- Date Parsing for Datatables -->
<script src="https://cdn.datatables.net/plug-ins/2.2.1/sorting/datetime-moment.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js"></script>

<!-- Datatables CDN -->
<link rel="stylesheet" href="https://cdn.datatables.net/2.2.1/css/dataTables.dataTables.css" />
  
<script src="https://cdn.datatables.net/2.2.1/js/dataTables.js"></script>

<script>
	// $.fn.dataTable.moment = function ( format, locale ) {
	// 	var types = $.fn.dataTable.ext.type;
	
	// 	// Add type detection
	// 	types.detect.unshift( function ( d ) {
	// 		return moment( d, format, locale, true ).isValid() ?
	// 			'moment-'+format :
	// 			null;
	// 	} );
	
	// 	// Add sorting method - use an integer for the sorting
	// 	types.order[ 'moment-'+format+'-pre' ] = function ( d ) {
	// 		return moment( d, format, locale, true ).unix();
	// 	};
	// };

	let table = new DataTable('#myTable', {
		// drawCallback: function () {
		// 	$.fn.dataTable.moment( 'M D YYYY' );
		// },
		ajax: 'http://localhost:8080/data-sources/race_history.json',
		columns: [
			{data: "race_name"},
			{data: "location"},
			{data: "date"},
			{data: "time"},
			{data: "result"},
			{data: "notes"},
			{data: "blog_post"},
			{data: "distance"},
		],
		pageLength: 50,
		searching: false,
		paging: false,
		order: [[2, 'desc']]
	});
</script>
