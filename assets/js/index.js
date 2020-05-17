/**
 * File Name: index.js
 * Author: Nicholas Lin
 * Date: 3/8/20
 * Description: Main javascript for index.html
 */

// Adds listener to main-form submit button
 document.getElementById('main-form').addEventListener('submit', geocode);

// Initiate geolocation when user loads the page
getLocation();
/**
 * name: getLocation()
 * description: Uses HTML geolocation to get the coordinates of the user
 * precondition: User should hit "Allow" for use of geolocation, but this is not required.
 * postcondition: The coordinates of the user will be passed to autoFillLocation(position) to fill location input
 */
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(autoFillLocation);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

/**
 * name: autoFillLocation(position)
 * @param {position} position from geolocation
 * description: This function uses reverse geocoding to autofill the location input based on the user's current location
 * precondition: "position" must be an object with the property coords that has "latitude" and "longitude" properties.
 * postcondition: Any address/location will be properly translated to coordinates and passed to redirect
 * dependencies: Google Maps API
 */
function autoFillLocation(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    var latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                document.getElementById("location").defaultValue = results[0].formatted_address;
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

/**
 * name: geocode(e)
 * @param {e} event
 * description: This function translates the address to coordinates and passes these parameters to redirect(lat, lng)
 * precondition: Axios must be imported. HTML DOM with ID "location" should have a location value (note that this can be any term, not necessarily an address or coordinates).
 * postcondition: Any address/location will be properly translated to coordinates and passed to redirect
 * dependencies: Google Maps API, axios
 */
function geocode(e) {
    e.preventDefault(); // Prevent actual submit
    var location = document.getElementById('location').value; //assigns the location value to location 
    const google_maps_api_key = config.GOOGLE_MAPS_API_KEY;
    // Google Maps API call
    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
            address: location, 
            key: google_maps_api_key //Google Maps API Key
        }
    })
        .then(function (response) {
            // Geometry
            var lat = response.data.results[0].geometry.location.lat;
            var lng = response.data.results[0].geometry.location.lng;
            // Function call to redirect
            redirect(lat, lng);
        })
        .catch(function (error) {
            console.log(error);
        });
}

/**
 * name: redirect(lat, lng)
 * @param {lat} latitude
 * @param {lng} longitude
 * description: This function redirects the user to the main search results page and passes location parameters in the URL
 * precondition: lat and lng are latitude and longitude values respectively
 * postcondition: Redirects to ./search.html with the following extension: "?[lat]&[lng]&[searchterm]"
 */
function redirect(lat, lng) {
    var queryString = "?" + lat + "&" + lng + "&" + document.getElementById('searchterm').value;
    window.location.href = "./search.html" + queryString;
}

 /**
 * name: replyClick(clicked_id)
 * description: click on suprise button fills search term
 */
function replyClick(clicked_id)
{
   word = getRandomWord();
   document.getElementById('searchterm').value = word;
}

/**
* name: getLocation()
* description: Returns random word for search
*/
function getRandomWord(){
   var array = ["Chinese", "Italian", "Indian", "Turkish", "Mexican", 
               "Thai", "Korean", "Greek", "French", "Steak", "Burgers", "Mediterranian", "Healthy",
               "Bars", "Soul Food", "Smoothie", "Ice Cream", "Ramen", "BBQ", "Cheap Eats",
               "Sushi", "Pho", "Vietnamese", "Fast Food"];
   randInt = Math.floor(Math.random() * (array.length));
   var item = array[randInt];
   return item;
}