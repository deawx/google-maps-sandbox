/*
 * Site.js - Draw a Map Highlighting UK counties that have a marker within them.
 * 
 * @version		1
 * @package		com.fusionweb.maps
 * @description	Google Map Interface using a FusionTable to display sections of the UK and their associated reps. 			
 * @author 		James Williams (@James_RWilliams)
 * @copyright 	Copyright (c) 04/07/2016
 *
 */	

var defaultColour = "#333333"; // The default colour of a region.

var map;
var google;
var i;
var geocoder;

/* Test */

var polys = [];

var styles = [{
    
    featureType: "all",
	elementType: "all",
	stylers: [
		{ "visibility":"off" }]},

		{
	    featureType: "landscape",
	    elementType: "all",
	    stylers: [
	        {
	            "visibility":"off"
	        }
    ]},
	{
	    featureType: "water",
	    elementType: "all",
	    stylers: [
	        {
	            "visibility":"off"
	        }
	    ]
	},
	{
		featureType: "all",
		elementType: "labels",
		stylers: [
			{ 	
				"visibility": "off" 
				
			}
		]
	}];
	
/**
 *	Inital setup of the google map instance, applies styles, sets up geocoder
 *  and the building of the SQL query from the Fusion Table to return the 
 *	data for the map.
 *
 *	Fusion Table In Use - https://drive.google.com/open?id=18BaQWBYUXGAlWncARIpac36LvM_a8UrjXWEwoI_M
 */		
 
function initialize() {
	
	geocoder = new google.maps.Geocoder();

	var myOptions = {
		zoom: 6, 
		center: new google.maps.LatLng(54.897321, -2.933645),
		mapTypeId: google.maps.MapTypeId.ROAD,
		disableDefaultUI: true,
		draggable: true,
		scrollwheel: true,
		backgroundColor: "#f2f7fb",
		disableDoubleClickZoom: true,
		clickable: true
	};
		
	map = new google.maps.Map(document.getElementById('map'), myOptions);
		
	map.setOptions({styles: styles});

	// Initialize JSONP request
	var script = document.createElement('script');
	var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
	
	url.push('sql=');

	var query = 'SELECT geometry, rep, name FROM ' + '1BlJA1Svax75AHjS7FNY2fS4HGflwNN9m33nV289u';

	var encodedQuery = encodeURIComponent(query);
	
	url.push(encodedQuery);
	url.push('&callback=drawMap');
	url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
	script.src = url.join('');

	var body = document.getElementsByTagName('body')[0];

	body.appendChild(script);

}

/**
 *	Creates inidivudal coordinate pairs from data passed from a KML 
 *	encoded polygon returning them as Google Maps coordinates in an
 *	array.
 *
 *	@param {Array} polygon An array of polygons from the KML data in a fusion table.
 *	@returns newCoordinates
 * 
 */		

function constructNewCoordinates(polygon) {
	
	var newCoordinates = [];
	var coordinates = polygon.coordinates[0];

	for (var i in coordinates) {
	
		newCoordinates.push(new google.maps.LatLng(coordinates[i][1],
		coordinates[i][0]));
	}
    
    return newCoordinates;

}

/**
 *	Cycles through the KML data from the fusion table and
 * 	creates a new google maps polgyon object and adds it 
 *	to an arry for collision detection with the pins.
 *
 *	@callback encodeAddress()
 */		

function drawMap(data) {
	
    var rows = data.rows;
    
    var warnings = [];
    
    for (i in rows) {
           
	    var newCoordinates = [];
	    var geometries = rows[i][0].geometries;    
	    var rep_highlight_lee = "#6BB8C5";
		var rep_highlight_claire = "#90C34A";
		var rep_highlight_mark = "#ED7547";
		var county;
	    		
		var infowindow = new google.maps.InfoWindow();
		
		if (geometries) {
	        
	        for (var j in geometries) {
	        
	        	newCoordinates.push(constructNewCoordinates(geometries[j]));

	        }
	        
	    } else { 
		
			newCoordinates = constructNewCoordinates(rows[i][0].geometry);
			
		}
		
		if(rows[i][1] === "Mark"){
			
			county = new google.maps.Polygon({
				paths: newCoordinates,
				strokeColor: '#FFFFFF',
				strokeOpacity: 1,
				strokeWeight: 0.7,
				fillColor: rep_highlight_mark,
				fillOpacity: 0.5,
				clickable: true,
				indexID: rows[i]
			
			});
			
		}else if(rows[i][1] === "Lee"){
			
			county = new google.maps.Polygon({
				paths: newCoordinates,
				strokeColor: '#FFFFFF',
				strokeOpacity: 1,
				strokeWeight: 0.7,
				fillColor: rep_highlight_lee,
				fillOpacity: 0.5,
				clickable: true,
				indexID: rows[i]
			
			});
			
		}else if(rows[i][1] === "Clare"){
			
			county = new google.maps.Polygon({
				paths: newCoordinates,
				strokeColor: '#FFFFFF',
				strokeOpacity: 1,
				strokeWeight: 0.7,
				fillColor: rep_highlight_claire,
				fillOpacity: 0.5,
				clickable: true,
				indexID: rows[i]
			
			});
			
		}else{
			
			county = new google.maps.Polygon({
				paths: newCoordinates,
				strokeColor: '#FFFFFF',
				strokeOpacity: 1,
				strokeWeight: 0.7,
				fillColor: defaultColour,
				fillOpacity: 0.5,
				clickable: true,
				indexID: rows[i]
				
			});
			
			warnings.push(rows[i]);
			
		}
		
		google.maps.event.addListener(county, 'click', function(event){
			
			infowindow.setContent(this.indexID[2] + " - " + this.indexID[1]);
			infowindow.setPosition(event.latLng);
			infowindow.open(map);
			
		}); 
		
		polys.push(county); // Add the polygon to an array
		
		county.setMap(map); // Draw the Map

	} // End iteration loop of all polygon sets
	
	console.log(warnings.length + " issues in total. These are missing info:");
	
	for(i in warnings){
		
		console.log(warnings[i][2]);
		
	}
	
}

google.maps.event.addDomListener(window, 'load', initialize);