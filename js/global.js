/*
 * 
 * 
 * @version		0.1
 * @package		com.jamesrwilliams.google-maps-sandbox
 * @description				
 * @author 		James Williams (@James_RWilliams)
 * @copyright 	Copyright (c) 06/07/2016
 *
 */

var CONFIG;

function loadConfig(inital){
	
	$.getJSON( "config.json").done(function( config ) {
		
		/* Config File Loaded */
		
		if(config.googleMapsAPIKey != "EnterYourKey"){
			
			$.getScript( 'https://maps.google.com/maps/api/js?false&libraries=geometry&key=' + config.googleMapsAPIKey )
			
			.done(function( script, textStatus ) {
				
				if(inital == true){
		
					// initialize();
		
				}
				
				/* Sucessfully Loaded Google Maps */
				
			})
			
			.fail(function( jqxhr, settings, exception ) {
				
				/* Failed to Load Google Maps */
				console.log( "Triggered ajaxError handler." );
			
			});
			
		}else{
			
			/* Gracefully Feedback incorrect config */
			
			console.log("Enter your API key in the Config File");
			
		}
	})
	.fail(function( jqxhr, textStatus, error ) {
		
		/* Config Not Found / Failed */
		
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
	
	return CONFIG;
	
}

$(document).ready(function(){
	
	loadConfig(true);
	
});