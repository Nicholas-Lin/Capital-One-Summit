getLocation();

//This function gets the current location of the user
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(autoFillLocation);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

//This function uses Geocode to autofill the location input from user coordinates
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