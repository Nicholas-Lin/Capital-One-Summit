// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
const google_maps_api_key = config.GOOGLE_MAPS_API_KEY;
script.src = 'https://maps.googleapis.com/maps/api/js?key='+ google_maps_api_key +'&callback=initMap';
script.defer = true;
script.async = true;
// Append the 'script' element to 'head'
document.head.appendChild(script);