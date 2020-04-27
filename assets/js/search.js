/**
* File Name: search.js
* Author: Nicholas Lin
* Date: 3/8/20
* Description: Main javascript for search.html
*/

var currentLocation = getLocation(); //Current user location as a coordinate
var resultNumber = 0; //Keeps track of the number of results yelp has generated (also used for numbering businesses)
var searchTerm;

var businesses; //List of businesses from Yelp API
var customParams; //List of parameters for Yelp API request
var offset = 20; //Yelp API offset value for requests

var gmarkers = {}; //Dictionary of Google map markers key: business ID, Value:Marker
var bounds = null; //Bounds for Google Map based on markers
var map = null; //Google Map object
var directionsService = null; //Google Direction Service for route plotting on map
var directionsRenderer = null; //Google Direction Renderer for route plotting on map
var currentInfoWindow = null; //Global Google map infowindow (to ensure only one pops up at a time)
var distanceInfo; //Google Distance Matrix information including distance in miles and duration


getData();

/**
 * name: getLocation()
 * description: This function parses the URL parameters, initializes customParams with initial search values, and returns the location in coordinates
 * precondition: url must have proper parameters with location information
 * postcondition: Initializes customParams with initial search values, and returns the location in coordinates
 */
function getLocation() {
    var queryString = decodeURIComponent(window.location.search);
    queryString = queryString.substring(1);
    var queries = queryString.split("&");
    var lat = parseFloat(queries[0]);
    var lng = parseFloat(queries[1]);
    searchTerm = queries[2];
    var currentLocation = { lat: lat, lng: lng };
    //Initial parameters for YelpAPI
    customParams = {
        headers: { 'Authorization': `Bearer 4AqxzDTp64YsnrAXrp0AiMC_39WCTXKcZT9doX3_5UwgF7E3UNjNW5bWeI7SsATBpotoOknHOOyhRIEefZTikEos9M27oprKc1N_JLmU7mVv6HBrSRsy6y8WDeVRXnYx` },
        params: {
            'latitude': lat,
            'longitude': lng,
            'term': searchTerm,
            'open_now': true
        }
    };
    searchTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    console.log(searchTerm);
    return currentLocation;
}

/**
 * name: getData()
 * description: Queries Yelp Business Search Endpoint based on customParams
 * precondition: customParams must be defined globally and intialized with proper parameters
 * postcondition: Forwards response to addToList(apiData)
 * dependencies: Axios, Yelp API
 */
function getData() {
    //Axios request to Yelp Business Search endpoint through cors-anywhere
    axios.get('https://cors-anywhere.herokuapp.com/' + 'https://api.yelp.com/v3/businesses/search',
        customParams
    )
        .then((res) => {
            addToList(res) //Function Call: addToList(apiData)
        })
        .catch((err) => {
            console.log(err)
        })
} 

/**
 * name: addToList(apiData)
 * description: This function processes API data and adds each business to the list and creates a marker of the map
 * @param {apiData} YelpAPIResponse  
 * precondition: apiData is the raw response data from Yelp Businesses Endpoint
 * postcondition: A list item and marker is created for each business
 * dependencies: JQuery
 */
function addToList(apiData) {
    businesses = apiData.data.businesses
    for (var i = 0; i < businesses.length; i++) {
        var b = businesses[i]
        businessLocation = { lat: b.coordinates.latitude, lng: b.coordinates.longitude }
        getDistance(b.id, businessLocation); //Function Call: getDistance(b.id, businessLocation)
        var data = {
            location: businessLocation,
            name: b.name,
            id: b.id,
            content: '<h6><a href=' + b.url + ' target="_blank">' + b.name + '</a>' +
                '<h6 id= "B' + b.id + '-infoWindowDuration"></h6>' +
                '</h6>'
        }

        addMarker(data); //Function Call: addMarker(props)
        createListItem(b); //Function Call: createListItem(b)
    }
    //Updates the header text to reflect the number of results
    if (resultNumber == 0) {
        $('#results-summary').text("Oops, there are 0 results. Try entering a different search term or location.");

    } else {
        var resultsSummary = document.getElementById("results-summary");
        resultsSummary.innerHTML = "Explore the <span id='result-number'>" + resultNumber + "</span> Best " + searchTerm + " Places";
        $('#results-summary').css("padding", "3px");
    }
    //Recenters map based on marker placement
    map.fitBounds(bounds);
}

/**
 * name: getDistance(bid,businessLocation)
 * description: Uses Google Maps Distance Matrix Service to calculate the distance in miles and duration from currentLocation to businessLocation
 * @param {bid} Yelp Business ID
 * @param {businessLocation} Yelp Business coordinate
 * precondition: currentLocation must be initialized
 * postcondition: distance_text and duration_text are intialized for each business
 * dependencies: Google Maps API, Jquery
 */
function getDistance(bid, businessLocation) {
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
        origins: [currentLocation],
        destinations: [businessLocation],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
    }, function (response, status) {
        if (status !== 'OK') {
            alert('Error was: ' + status);
        } else {
            distanceInfo = response.rows[0].elements[0];
            //Set the distance information for each business in HTML
            $("#B" + bid + " #distance_text").text(distanceInfo.distance.text);
            $("#B" + bid + " #duration_text").text(distanceInfo.duration.text);
        }
    });

}

/**
 * name: addMarker(props)
 * description: This function creates a marker on Google Maps with appropriate properties
 * @param {props} properties  
 * precondition: props contains properties for each mark including location, name, id, and content information
 * postcondition: A Google Maps marker is created
 */
function addMarker(props) {
    var marker = new google.maps.Marker({
        position: props.location,
        map: map,
        animation: google.maps.Animation.DROP,
    });
    gmarkers[props.id] = marker;
    //Extend the bounds to include each marker's position
    bounds.extend(marker.position);
    marker.addListener('click', toggleBounce);
    //Adds a bounce animation to markers
    function toggleBounce() {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            //Sets bounce for certain amount of time
            setTimeout(function () {
                marker.setAnimation(null)
            }, 2100);
        }
    }
    // Check for customicon
    if (props.iconImage) {
        // Set icon image
        marker.setIcon(props.iconImage);
    }

    // Check content and creates infowindow for marker
    if (props.content) {
        var infoWindow = new google.maps.InfoWindow({
            content: props.content
        });
        //Info pop up only allow one at a time
        marker.addListener('click', function () {
            //If none is open then open, else close the current infoWindow and set current to this one
            if (currentInfoWindow != null) {
                currentInfoWindow.close();
            }
            currentInfoWindow = infoWindow;
            currentInfoWindow.open(map, marker);
        });
    }
}

/**
 * name: createListItem(b)
 * description: creates a list item for a business, b
 * @param {b}  YelpBusiness
 * precondition: b is a business based on Yelp Business Search Endpoint. resultNumber must be global. ul with ID of "main-list" must be available.
 * postcondition: A list item is created which contains business information. Each list item is appended #main-list.
 * dependencies: JQuery
 */
function createListItem(b) {
    resultNumber++;
    //HTML to be inserted in the ul
    var html = [
        '<li id=B'+b.id+' class="list-group-item" onmousedown="selectBusiness(' + "'"+ b.id + "'" + ')">',
            '<div class="media">',
                '<img src=' + b.image_url +' class="mr-3" style="width:60px">',
                '<div class="media-body">',
                    '<div class="container">',
                        '<div class="row">',
                            '<div class="col-md">',
                                '<div class="row">',
                                    '<h5>'+ '<a href=' + b.url + ' target="_blank">' + resultNumber + ". " +b.name +  '</a></h5>',
                                '</div>',
                                '<div class="row">',
                                    b.categories[0].title,
                                '</div>',
                                '<div class="row">',
                                        '<div class="stars-outer">',
                                            '<div class="stars-inner"></div>',
                                        '</div>',
                                    '<span class="number-rating">' + " " +b.review_count+' Reviews </span>',
                                '</div>',
                            '</div>',
                            '<div class="col-sm">',
                                '<div class="row justify-content-md-end">',
                                    '<small>'+ b.location.address1 + '</small>',
                                '</div>',
                                '<div class="row justify-content-md-end">',
                                    '<small>'+ b.display_phone + '</small>',
                                '</div>',
                                '<div class="row justify-content-md-end font-weight-bold">',
                                    b.price,
                                '</div>',
                                '<div class="row justify-content-md-end">',
                                    '<small id="distance_text"></small>',
                                '</div>',
                                '<div class="row justify-content-md-end">',
                                    '<img src="./assets/img/car.png" width="20">',
                                    '<small id="duration_text"></small>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
              '</div>',                                  
        '</li>'
    ].join("\n");
    $('#main-list').append(html);
    //Add ratings to each list item
    getRatings(b.id, b.rating);
}

/**
 * name: getRatings(BID, rating)
 * description: This function generates the stars for the rating of a business
 * @param {BID} Yelp Business ID
 * @param {rating} Yelp Business rating
 * postcondition: Stars representing the rating for businesses will be placed in .stars-inner
 */
function getRatings(BID, rating) {
    const starsTotal = 5; // Total Stars
    const starPercentage = (rating / starsTotal) * 100;
    const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`; // Round to nearest 10
    document.querySelector('#B' + BID.toString() + ` .stars-inner`).style.width = starPercentageRounded; // Set width of stars-inner to percentage
}

/**
 * name: initMap()
 * description: Initializes google map
 * postcondition: Google Map will be created with a marker for current location
 * dependencies: Google Maps API
 */
function initMap() {
    // The map, centered at currentLocation
    map = new google.maps.Map(
        document.getElementById('map'), { zoom: 15, center: currentLocation });
    bounds = new google.maps.LatLngBounds();

    //Initialize these for route plotting
    directionsService = new google.maps.DirectionsService;
    directionsRenderer = new google.maps.DirectionsRenderer(
        {
            suppressMarkers: true //Suppress markers that are automatically generated by renderer
        });

    //Scale custom marker icon
    var icon = {
        url: "./assets/img/bluePin.png", // url
        scaledSize: new google.maps.Size(35, 56.4), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(17.5, 56.4) // anchor
    };
    addMarker({
        location: currentLocation,
        content: '<h5>You are here!</h5>',
        id: 0,
        iconImage: icon
    });
    var marker = gmarkers[0];
    google.maps.event.trigger(marker, 'click');
}

/**
 * name: selectBusiness(BID)
 * description: Recenters the map and selects appropriate marker based on the business selected
 * @param {BID}  YelpBusinessID
 * precondition: BID is the Yelp Business ID for the business that is selected, google direction renderer, map, and bounds must be global
 * postcondition: A route is mapped to business, the appropriate Google Maps marker is selected, map is reoriented appropriately
 * dependencies: Google Maps API
 */
function selectBusiness(BID) {
    var currentMarker = gmarkers[0]; //current location
    var businessMarker = gmarkers[BID];
    //Extend bounds appropriately to view the business on the map
    bounds = new google.maps.LatLngBounds();
    bounds.extend(currentMarker.position);
    bounds.extend(businessMarker.position);
    google.maps.event.trigger(businessMarker, 'click');
    map.fitBounds(bounds);
    directionsRenderer.setMap(map);
    calculateAndDisplayRoute(currentMarker.position, businessMarker.position); //Plot route
    //Set zoom out to add "padding" to bounds
    if (map.getZoom() > 16) {
        map.setZoom(map.getZoom() * 0.5);
    } else {
        map.setZoom(map.getZoom() * 0.9);
    }
}

/**
 * name: calculateAndDisplayRoute(directionsService, directionsRenderer, currentPosition, businessPosition)
 * description: Plots a route on the map from the current location to business location
 * @param {currentPosition}  Google Marker Postition
 * @param {businessPosition}  Google Marker Postition
 * precondition: currentPosition is a marker position that denotes the current position.
 *               businessPosition is a marker position that denotes the business position.
 *               directionsService and directionsRenderer must be globally defined.
 * postcondition: A route is mapped to from the currentPosition to the businessPosition
 * dependencies: Google Maps API
 */
function calculateAndDisplayRoute(currentPosition, businessPosition) {
    directionsService.route({
        origin: currentPosition,
        destination: businessPosition,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

/**
* name: clearData()
* description: This function clears/resets map data and appropriate data of current search data
* postcondition: Resets bounds, businesses, resultNumber, gmarkers, and sets header appropriately
* dependencies: Google Maps API, JQuery
*/
function clearData() {

    bounds = new google.maps.LatLngBounds(); //reset bounds
    businesses = null; //clear businsses
    for (var key in gmarkers) {
        if (key != 0) {
            gmarkers[key].setMap(null); //clear all gmarkers except for current location
        }
    }
    resultNumber = 0; // Reset result number
    directionsRenderer.setMap(null); //Clear routes
    directionsRenderer = new google.maps.DirectionsRenderer(
        {
            suppressMarkers: true //Suppress markers that are automatically generated by renderer
        });
    $('#results-summary').text("Finding Your Next Favorite Spot..."); //Set header text
    $('#main-list').empty() //Empty list
}