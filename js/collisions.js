/*
 * Site.js - Draw a Map Highlighting UK counties that have a marker within them.
 * 
 * @version		1
 * @package		com.fusionweb.bfst
 * @description	Google Map Interface with a FusionTable conditioanly rendering the area depending on pin locations. 			
 * @author 		James Williams (@James_RWilliams)
 * @copyright 	Copyright (c) 29/03/2016
 *
 */	

var normalColour = "#3B424C"; 		// The default colour of a region.
var highlightColour = "#FF5335"; 	// Colour a region turns if a collision is detectd

var coords = [
	["51.731977", "-0.9911895000000186"],
	["51.6870466", "-0.6236212000000023"],
	["51.8229325", "-0.8313161999999465"],
	["52.6354424", "-3.303941200000054"],
	["52.8024774", "-3.2914478000000144"],
	["51.7358644", "-3.8704980999999634"],
	["50.7514815", "-2.7474376999999776"],
	["51.71113030000001", "-2.894364600000017"],
	["51.9618335", "-3.34886640000002"],
	["51.77337559999999", "-2.8293955000000323"],
	["51.9577239", "-3.493389900000011"],
	["51.6162184", "-2.8465883999999732"],
	["51.85676720000001", "-2.98509439999998"],
	["52.42327539999999", "-2.7148976999999377"],
	["51.92927949362619", "-2.1925327777862"],
	["52.120960402979854", "-2.78158664703369"],
	["52.07911698842119", "-2.8316361904144"],
	["52.19539659117343", "-4.1228256225586"],
	["51.8577348459825", "-2.511336803436"],
	["52.268134", "-2.192471"],
	["51.61457459673886", "-2.7689838409423"],
	["51.488222", "-1.989539"],
	["52.0396096", "-4.466769200000044"],
	["51.580890819685024", "-2.82992434501646"],
	["53.28404634767989", "-3.8362731933593"],
	["50.39012161729853", "-3.9204723834991"],
	["51.05277268306769", "-1.2886778116226"],
	["50.83761612666022", "-0.7754091024398"],
	["54.349796", "-3.243339"],
];

var map;
var google;
var i;
var marker; 
var points;
var geocoder;

/* Test */

var points = [];
var temp = [];
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
	]}];
	
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
		clickable: false
	};
		
	map = new google.maps.Map(document.getElementById('map'), myOptions);
		
	map.setOptions({styles: styles});

	// Initialize JSONP request
	var script = document.createElement('script');
	var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
	
	url.push('sql=');

	var query = 'SELECT Name, geometry FROM ' + '18BaQWBYUXGAlWncARIpac36LvM_a8UrjXWEwoI_M';

	var encodedQuery = encodeURIComponent(query);
	
	url.push(encodedQuery);
	url.push('&callback=drawMap');
	url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
	script.src = url.join('');

	var body = document.getElementsByTagName('body')[0];

	body.appendChild(script);

}

/**
 *	Creates a marker at with a delay before appearing.
 *
 *	@param {number} _lat - The latitudinal coordinate for the marker
 *	@param {number} _lng - The longitudinal coordinate for the marker
 *	@param {number} timeout - The time in milliseconds between each markers animation
 * 
 */		
function addMarkerWithTimeout(_lat, _lng, timeout) {
	
	window.setTimeout(function() {
	
		marker = new google.maps.Marker({
		map: map,
		draggable: false,
		cursor: "pointer",
		clickable: false,
		animation: google.maps.Animation.DROP,
		position: {lat: _lat, lng: _lng}
	
	});
	
	google.maps.event.addListener(marker, 'click', function(event){
			
		infowindow.setContent("Test");
		infowindow.setPosition(event.latLng);
		console.log(this);
		infowindow.open(map);
		
	});  

	
	}, timeout);

	
}	

/**
 *	Cycles through the array of points adding a marker for each point at 
 *	an interval creating a staggarded load animation.
 */		
function dropPins(){
	
	for(i in points){	 
	 
	 	addMarkerWithTimeout(points[i][0], points[i][1], i * 50);
	
				 
	}
	
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
 * 	Iterates through array of polygons which and then checks if a 
 *	point is within it's bounds and changes its fill colour if it 
 *	has a collision. 
 *
 *	@callback dropPins
 */		

function checkCollision(){
		
	for(i in polys){

		var result = false;

		for(var y in points){
	
			if(google.maps.geometry.poly.containsLocation(new google.maps.LatLng(points[y][0], points[y][1]), polys[i])){ result = true; }	
	
		}

		if(result === true){ polys[i].setOptions({ fillColor: highlightColour, fillOpacity: 1 }); }	
			
	}
	
	dropPins();
	
}

/**
 *	Takes an array and adds it as a 2d array row out of scope
 * 	from the intial call. Also checks if the arrays length matches 
 * 	length,checking completion before running the callback.
 *
 *	@param {Array} _input Two item array to add to a 2D array
 *
 *	@callback checkCollision
 *  
 */		

function addToArray(_input){
		
	points.push(_input);
	
	if(points.length === coords.length){ checkCollision(); }
	
}

/**
 *	Encodes the supplied addresses from the CMS to lng/lat coordinatoes
 */		

function encodeAddress(){
	
	// Test
	var error_count = 0;
	
	for(i = 0; i < coords.length; i++){
		
		var lat = coords[i][0];
		var lng = coords[i][1];
		
		if(lat === "" && lng === ""){
			
			error_count++;
			
		}
		
		temp = [];

		temp.push(parseFloat(lat), parseFloat(lng));
		
		addToArray(temp);
		
	}
	
	console.log("Missing Data Point Count: " + error_count);
	
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
    
    for (i in rows) {
        
        var infowindow = new google.maps.InfoWindow();
	    var newCoordinates = [];
	    var geometries = rows[i][1].geometries;
	    
	    if (geometries) {
	        
	        for (var j in geometries) {
	            newCoordinates.push(constructNewCoordinates(geometries[j]));
	        }
	        
	    } else { newCoordinates = constructNewCoordinates(rows[i][1].geometry); }
    
		var country = new google.maps.Polygon({
			paths: newCoordinates,
			strokeColor: '#FFFFFF',
			strokeOpacity: 1,
			strokeWeight: 0.7,
			fillColor: normalColour,
			fillOpacity: 0.5,
			clickable: true,
			indexID: rows[i]
		
		});
		
	/* If Hover/Click effects are needed for the county boundaries. Will have to enable
	//	interaction on the map, markers, and polygon objects for this to work.
		
		google.maps.event.addListener(country, 'click', function(){});   
		google.maps.event.addListener(country, 'mouseover', function() {this.setOptions({});}); 
		google.maps.event.addListener(country, 'mouseout', function() { this.setOptions({});});
		
	
	
		google.maps.event.addListener(country, 'click', function(event){
			
			infowindow.setContent(this.indexID[0]);
			infowindow.setPosition(event.latLng);
			console.log(this);
			infowindow.open(map);
			
		});  
	// */	
		polys.push(country); // Add the polygon to an array
		
		country.setMap(map); // Draw the Map
        
	}
	
	encodeAddress();
	
}

google.maps.event.addDomListener(window, 'load', initialize);