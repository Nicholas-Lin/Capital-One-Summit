//Activate tooltips (hover)
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({
         trigger : 'hover',
         container: 'body'
   });

   //Make tool tip appear when page loads then dissapear
   $('#results-col').tooltip({
       container: 'body',
       trigger : 'manual'
   });
   $('#results-col').tooltip('show');
   setTimeout(function () { $('#results-col').tooltip('hide'); }, 15000);
   $('#results-col').tooltip('disable');
});

$('#open-checkbox').change(function () {     
   var open_now = this.checked;
   $('#results-summary').css("padding", "25px");
   customParams.params['open_now'] = open_now;
   clearData();
   getData();
});


$('#sortby .btn').on('click', function (event) {
   customParams.params['sort_by'] = $(this).find('input').attr('id');
   $('#results-summary').css("padding", "25px");
   clearData();
   getData();
});

$('#more-results .btn').on('click', function (event) {
   offset += 20;
   customParams.params['offset'] = offset;
   getData();
});