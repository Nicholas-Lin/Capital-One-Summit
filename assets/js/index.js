
//This script resolves a location in the location input to coordinates and passes these coordinates in as URL parameters

// Get location form
var locationForm = document.getElementById('main-form');

// Listen for submit
locationForm.addEventListener('submit', geocode);

function geocode(e) {
    // Prevent actual submit
    e.preventDefault();

    var location = document.getElementById('location').value;

    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
            address: location,
            key: 'AIzaSyCZov1f1Cpq5p5HyPpgz9aoGIqWYr4ZJU0'
        }
    })
        .then(function (response) {
            // Formatted Address
            var formattedAddress = response.data.results[0].formatted_address;

            // Geometry
            var lat = response.data.results[0].geometry.location.lat;
            var lng = response.data.results[0].geometry.location.lng;
            redirect(lat, lng);
        })
        .catch(function (error) {
            console.log(error);
        });
}

//This function redirects the user to the main search results page and passes location parameters in the URL
function redirect(lat, lng) {
    var queryString = "?" + lat + "&" + lng + "&" + document.getElementById('searchterm').value;
    window.location.href = "./search.html" + queryString;
}