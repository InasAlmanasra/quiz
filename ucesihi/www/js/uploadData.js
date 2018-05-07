function savingAnswer() { //Function to save the answers of the user to database table.
	alert ("Your answer is successfully uploaded !!"); 

	var requiredquestion = document.getElementById("requiredQuestion").innerHTML; //The innerHTML property sets or returns the HTML content (inner HTML) of an element.
	var answer = document.getElementById("corrAnswer").innerHTML; //Calling this function to show it to user and store it
	// var phoneid = device.uuid; //based on http://docs.phonegap.com/en/3.0.0/cordova_device_device.md.html#device.uuid --> error: the device is not defined
	alert ("The correct answer is" + " " + answer); // Shows the correct answer to the user of the code.
    
	//create a name/value pair string as parameters for the URL to send values to the server
	var postString = "requiredquestion=" + requiredquestion + "&answer=" + answer;

	// Store the checkes answer(user answer) in the PostString
	
	if (document.getElementById("optionaInput").checked) { //if the first option is chosen
 		 postString = postString + "&useranswer=opt1"; //store in useranswer column as opt1
	}
	if (document.getElementById("optionbInput").checked) { //if the second option is chosen
 		 postString = postString + "&useranswer=opt2"; //store in useranswer column as opt2
	}
	if (document.getElementById("optioncInput").checked) { //if the third option is chosen
 		 postString = postString + "&useranswer=opt3"; //store in useranswer column as opt3
	}
	if (document.getElementById("optiondInput").checked) { //if the forth option is chosen
 		 postString = postString +"&useranswer=opt4"; //store in useranswer column as opt4
	}
    
	processData(postString); 
	
	
}

//Adding an AJAX call and response method
var client;

function processData(postString) {
   client = new XMLHttpRequest();
   client.open('POST','http://developer.cege.ucl.ac.uk:30303/uploadData',true);    
   client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   client.onreadystatechange = saved;  
   client.send(postString);
}
// create the code to wait for the response from the data server, and process the response once it is received
function saved() {
  // this function listens out for the server to say that the data is ready - i.e. has state 4
  if (client.readyState == 4) {
    document.getElementById("useranswer").innerHTML = client.responseText; 
    }
}

