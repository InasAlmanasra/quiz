
// load a map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
		
// load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',{
maxZoom:18,
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
id: 'mapbox.streets'
}).addTo(mymap);

//Define the following as global variables: 
var maxdistance; //This is the alert distance, or the maximum distance between user and points to start the quiz.
var geoJSONData; //geoJSONData variable
var allProperties; //This is a variable where geoJSON data will be stored as different properties "features"
var POIdata; //POIdata variable	
// create a variable that will hold the XMLHttpRequest() 
//This is defined outside the function (global) so that all the following functions can use the same variable
var client;
//Variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on
var POIlayer;
	
// create the code to get the POIs data using an XMLHttpRequest
// Based on UCL web&mobile practical from week2
function getPOI() {
	client = new XMLHttpRequest();

client.open('GET','http://developer.cege.ucl.ac.uk:30303/getPOI'); //where getPOI is a get function that contains database table information for all points.

	client.onreadystatechange = POIResponse; // note don't use POIResponse() withbrackets as that doesn't work
	client.send();
}
// create the code to wait for the response from the data server, and process the response once it is received
function POIResponse() {
// this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4) {
		// once the data is ready, process the data
		POIdata = client.responseText;
		//geoJSONData = client.responseText;
		loadPOIlayer(POIdata);
	}
	
	var getJSON = JSON.parse(POIdata);
	
	//Code to access the coordinates, questions options and correct answer, 
	//then store them in the following variables
	//Note this code is inside the POIResponse Function
	//The following code is adapted and changed from StackOverFlow
	//using JSON viewr found in http://jsonviewer.stack.hu/ one can know how to access the required features
	//URL: https://stackoverflow.com/questions/24144782/example-of-using-feature-foreachproperty-in-google-maps-javascript-v3
	
	allProperties = getJSON[0]["features"].map(function(feature) { //accessing the geoJSON data of points data
	var coordinatesFeature = feature["geometry"]["coordinates"]; //Store points coordinates in the coordinatesFeature list
	var questionsFeature = feature["properties"]["question"]; //Store points questions in the questionsFeature list
	var featureOptionA = feature["properties"]["opta"]; //Store the first option in featureOptionA list
	var featureOptionB = feature["properties"]["optb"]; //Store the second option in featureOptionB list
	var featureOptionC = feature["properties"]["optc"]; //Store the third option in featureOptionC list
	var featureOptionD = feature["properties"]["optd"]; //Store the forth option in featureOptionD list
	var answerFeature = feature["properties"]["answer"]; //Store the correct answers in the answerFeature list
	var longitudeFeature = coordinatesFeature[0]; //Access the longitude of each point from coordinatesFeature list
	var latitudeFeature = coordinatesFeature[1]; //Access the latitude of each point from coordinatesFeature list
	return { //here the new variables returned so one may use them in other functions.
		longitudeF: longitudeFeature, //longitude
		latitudeF: latitudeFeature, //latitude
		questionF: questionsFeature, //questions
		optaF: featureOptionA, //First option
		optbF: featureOptionB, //Second option
		optcF: featureOptionC, //Thirs option
		optdF: featureOptionD, //Fourth option
		answerF: answerFeature, //the correct answer
		
	}
	
});	
}
	//console.log(allProperties); //in case one wants to print in the console window for check.

//Convert the received data - which is text - to JSON format and add it to the map
function loadPOIlayer(POIdata) {
		
	// convert the text to JSON
	var POIjson = JSON.parse(POIdata);
		
	// add the JSON layer onto the map -it will apper using the default icons
	POIlayer = L.geoJson(POIjson).addTo(mymap);
			
	//change the map zoom so that all the data is shown
	mymap.fitBounds(POIlayer.getBounds());
}

	
// code to track the user location
var position_marker //Global variable 
			
function trackLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showPosition);
		navigator.geolocation.getCurrentPosition(pointsDistance);
		} else {
			document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";
		}
}
//Function to track the users location		
function showPosition(position) {
	if (position_marker){
		mymap.removeLayer(position_marker); //This is to remove previous position_marker if there is one 
	}
	position_marker = L.circleMarker([position.coords.latitude, position.coords.longitude], {radius: 4}).addTo(mymap); //Draw a circle around user location to point them
	mymap.setView([position.coords.latitude, position.coords.longitude], 25);
}
		

// get distance function between user location and the points coordinates
	

function pointsDistance(position){  
	
	var maxDistance = 0.2; //set radius distance
    var minDistance = null; //define a null min distance
	var j = null; //define new variable
	for(var i = 0; i < allProperties.length; i++) { //itirate between points
		var distance = calculateDistance(position.coords.latitude, position.coords.longitude, allProperties[i].latitudeF,allProperties[i].longitudeF, 'K'); //calculates distance
		document.getElementById('showDistance').innerHTML = "Distance: " + distance;
		if (distance<= maxDistance&&(minDistance==null||distance<minDistance)){ //if user is not far from points and not closer than previous points
			minDistance=distance; //the new closest point distabce
			j=i; //defines j as the point number closest to user
		}
	}

//The following code creates a proximity alert,
//Then if the person is close enough, they could play the game. 
	if (j!= null) { //if there is indeed a close point
		alert("Alright lets play ..... Scroll down!"); //alerts user that game is about to start
		//Sending the question and options to the html file so that user can see it
		document.getElementById('requiredQuestion').innerHTML = allProperties[j].questionF; //closest point question
		document.getElementById('optiona').innerHTML = allProperties[j].optaF; //closest point option 1
		document.getElementById('optionb').innerHTML = allProperties[j].optbF; //closest point option 2
		document.getElementById('optionc').innerHTML = allProperties[j].optcF; //closest point option 3
		document.getElementById('optiond').innerHTML = allProperties[j].optdF; //closest point option 4
		document.getElementById('corrAnswer').innerHTML = allProperties[j].answerF; //closest point corrct answer

	} else if (j== null) { //else if there is no close points
		alert("But you are far from our game; press show points and get closer !!"); //warns user they are far from points
	}	
}

// The distance calculator function
// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	subAngle = Math.acos(subAngle);
	subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
	dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
                                             // where radius of the earth is 3956 miles
	if (unit=="K") { dist = dist * 1.609344 ;}  // convert miles to km
	if (unit=="N") { dist = dist * 0.8684 ;}    // convert miles to nautical miles
	return dist;
}

	
	var xhr; // define the global variable to process the AJAX request
	function callDivChange() {
		xhr = new XMLHttpRequest();
		var filename = document.getElementById("filename").value;
		xhr.open("GET", filename, true);
		xhr.onreadystatechange = processDivChange;
		try {
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		}
		catch (e) {
			// this only works in internet explorer
		}
		xhr.send();
	}

	function processDivChange() {
		if (xhr.readyState < 4) // while waiting response from server
			document.getElementById('ajaxtest').innerHTML = "Loading...";
		else if (xhr.readyState === 4) { // 4 = Response from server has been completely loaded.
			if (xhr.status == 200 && xhr.status < 300)// http status between 200 to 299 are all successful
				document.getElementById('ajaxtest').innerHTML = xhr.responseText;
		}
	}
	

	