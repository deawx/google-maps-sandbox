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

// Sample Colours from https://color.adobe.com/Flat-design-colors-1-color-theme-3044245/
var colour_spectrum = ["#FF5335","#B29C85","#306E73","#3B424C","#1D181F"];

var map;
var google;
var i;
var geocoder;
var polys = [];
var options = [];
var count = [];

var console;

/* Google Map Styles - Can always use services like snazzymaps.com to provide more artistic styles */

var styles = [{
	featureType: "all",
	elementType: "all",
	stylers: [{
		"visibility": "off"
	}]
}, {
	featureType: "landscape",
	elementType: "all",
	stylers: [{
		"visibility": "off"
	}]
}, {
	featureType: "water",
	elementType: "all",
	stylers: [{
		"visibility": "off"
	}]
}, {
	featureType: "all",
	elementType: "labels",
	stylers: [{
		"visibility": "off"
	}]
}];
	
/**
 *	Inital setup of the google map instance, applies styles, sets up geocoder
 *  and the building of the SQL query from the Fusion Table to return the 
 *	data for the map.
 *
 *	FusionTable In Use - https://drive.google.com/open?id=18BaQWBYUXGAlWncARIpac36LvM_a8UrjXWEwoI_M
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
		backgroundColor_old: "#f2f7fb",
		backgroundColor: "#8799A7",
		disableDoubleClickZoom: true,
		clickable: true,
		maxZoom: 10,
		minZoom: 6
	};
		
	map = new google.maps.Map(document.getElementById('map'), myOptions);
		
	// map.setOptions({styles: styles});

	// Initialize JSONP request
	
	var script = document.createElement('script');
	
	var query = 'SELECT geometry, rep, name FROM ' + '1BlJA1Svax75AHjS7FNY2fS4HGflwNN9m33nV289u';

	var encodedQuery = encodeURIComponent(query);
	
	var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
		url.push('sql=');
		url.push(encodedQuery);
		url.push('&callback=drawMap');
		url.push('&key=AIzaSyC2enzPhmc4x2OjaGTLhJQ9klt9boTUmtY');
	
	script.src = url.join('');

	var body = document.getElementsByTagName('body')[0];

	body.appendChild(script);

}

/**
 *	
 * 
 */		

function addToLegend(inputText, inputColourIndex){
	
	if(inputText == ""){
		
		inputText = " - ";
		
	}
	
	var legendContainer = document.getElementById("legend");
	
	legendContainer.innerHTML = legendContainer.innerHTML + '<li class="list-group-item">' + inputText + '<span style="background:' + colour_spectrum[inputColourIndex] + ';" class="badge">&nbsp;</span></li>';
	
}

/**
 *	Creates inidivudal coordinate pairs from data passed from a KML 
 *	encoded polygon returning them as Google Maps coordinates in an
 *	array.
 *
 *	@param {Array} polygon An array of polygons from the KML data in a fusion table.
 *	@returns {Array} newCoordinates
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
 *	Cycles through the KML data from the Fusiontable and
 * 	creates a new google maps polgyon object and adds it 
 *	to an array for collision detection with the pins.
 *
 *	@callback encodeAddress()
 */		

function drawMap(data) {
	
    var rows = data.rows;
    
    for (i in rows) {
	    
	    var newCoordinates = [];
	    var geometries = rows[i][0].geometries;    
		var county, options_index;
		
		var infowindow = new google.maps.InfoWindow();
	    
	    if (geometries) {
	        
	        for (var j in geometries) {
	        
	        	newCoordinates.push(constructNewCoordinates(geometries[j]));

	        }
	        
	    } else { 
		
			newCoordinates = constructNewCoordinates(rows[i][0].geometry);
			
		}
		
		/*
		
			Initalise a polygon	object for this iteration. 
			Note the fill is missing, we will conditioanlly 
			add this at the next step.
			
		*/
			    
	    county = new google.maps.Polygon({
			paths: newCoordinates,
			strokeColor: '#333',
			strokeOpacity: 0,
			strokeWeight: 0.7,
			fillOpacity: 0.4,
			clickable: true,
			indexID: rows[i],
			zIndex: 0
			
		});
	    
	    options_index = options.indexOf(rows[i][1]); // See if the "Name" value is within our options list

	    if(options_index === -1){ 
			
			/* 
				If it isn't we will add it to our options array and then use the 
				arrays length as its colour variable. (If it is the first option 
				the colour index will be zero 				
			*/		
			
			options.push(rows[i][1]);
			
			county.setOptions({fillColor: colour_spectrum[options.length-1], colourID: options.length-1});
			
			count[options.length-1] = 1; 				/* Add a new value to the count array and increment it */
			
			addToLegend(rows[i][1], options.length-1);	/* Register new option to the legend */
				
		}else{ // Found
			
			/* If it is found use its position as the colour marker */
			count[options_index]++;
			county.setOptions({fillColor: colour_spectrum[options_index], colourID: options_index});

		}
		
		/* Add event listener to display custom data on the polgon. In this case all its data */
		
		google.maps.event.addListener(county, 'click', function(event){
			
			if(this.indexID[1] != "None"){
				
				infowindow.setContent("<strong>(" + this.indexID[2] + ")</strong> Your Rep is " + this.indexID[1]);
				infowindow.setPosition(event.latLng);
				infowindow.open(map);
				
			}
			
		});
		
		polys.push(county); // Add the polygon to an array
		
		county.setMap(map); // Draw the Map

	} // End iteration loop of all polygon sets
	
	/* Add Rich Marker Support - These are the large rep names */
	
	var marker1 = new RichMarker({
          map: map,
          position: new google.maps.LatLng(55.516937, -3.259087),
          draggable: false,
          flat: true,
          anchor: RichMarkerPosition.MIDDLE,
          content: "<div id='custom-marker'><h2>Clare</h2></div>"
    });
    
    var marker2 = new RichMarker({
          map: map,
          position: new google.maps.LatLng(53.030392, -1.412525),
          draggable: false,
          flat: true,
          anchor: RichMarkerPosition.MIDDLE,
          content: "<div id='custom-marker'><h2>Mark</h2></div>"
    });


	var marker3 = new RichMarker({
          map: map,
          position: new google.maps.LatLng(50.837260, -2.358618),
          draggable: false,
          flat: true,
          anchor: RichMarkerPosition.BOTTOM,
          content: "<div id='custom-marker'><h2>Lee</h2></div>"
    });
	
	/* Check the zoom level and hide/show the general text markers accordingly */
	
	google.maps.event.addListener(map, 'zoom_changed', function() {
	    
	    var zoom = map.getZoom();
	
		console.log("Zoom Level: " + zoom);
	
	    if (zoom <= 4 || zoom >= 9) {
	        
	        marker1.setMap(null);
	        marker2.setMap(null);
	        marker3.setMap(null);
	        
	    } else {
	        
	        marker1.setMap(map);
	        marker2.setMap(map);
	        marker3.setMap(map);
	        	        
	    }
	
	});
	
	// END Rich Marker Support
	
	/* Enable Legend View - Now its finished Loading */
	
	document.getElementById("SHOW_LEGEND").removeAttribute("disabled"); 
	document.getElementById("legend_panel").removeAttribute("style");
	
	/* Display a summary of activity in the console window (using nested console groups) */
	
	console.group("Summary - " + options.length + " dimensions, " + rows.length + " items in total.");
		
		if(options.length > colour_spectrum.length){ console.warn("More options than colours! Be careful here")}
		
		console.groupCollapsed("Dimensions");
		
			for(i in options){console.log(i + ". '"+ options[i] + "' (" + count[i] + ")")}
		
		console.groupEnd();
	
	console.groupEnd();
	
}

google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function(){
	
	$("#SHOW_LEGEND").click(function(){
		
		$(".right-flyout").toggleClass("slideInRight");
		$(".right-flyout").toggleClass("slideOutRight");
		$(this).parent().toggleClass("active");
		
	});
	
});