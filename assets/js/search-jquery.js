/**
* File Name: search-jquery.js
* Author: Nicholas Lin
* Date: 3/8/20
* Description: Initializes JQUERY selections for HTML elements
*/

//Description: Initializes tool tips for buttons
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({
         trigger : 'hover',
         container: 'body'
   });

   //Make tool tip appear for results list when page loads then dissapear later
   $('#results-col').tooltip({
       container: 'body',
       trigger : 'manual'
   });
   $('#results-col').tooltip('show');
   setTimeout(function () { $('#results-col').tooltip('hide'); }, 15000);
   $('#results-col').tooltip('disable');
});

//Description: When open now button is selected, modify open_now parameter, clear data, and get new data from Yelp
$('#open-checkbox').change(function () {     
   var open_now = this.checked;
   $('#results-summary').css("padding", "25px");
   customParams.params['open_now'] = open_now;
   customParams.params['offset'] = 0;
   customParams.params['limit'] = 20;
   clearData();
   getData();
});

//Description: When sort button is selected, modify sort by parameter, clear data, and get new data from Yelp
$('#sortby .btn').on('click', function (event) {
   customParams.params['sort_by'] = $(this).find('input').attr('id');
   $('#results-summary').css("padding", "25px");
   customParams.params['offset'] = 0;
   customParams.params['limit'] = 20;
   clearData();
   getData();
});

//Description: When more results button is selected, load more results
$('#more-results .btn').on('click', function (event) {
   offset += 5;
   customParams.params['offset'] = offset;
   customParams.params['limit'] = 5;
   getData();
});