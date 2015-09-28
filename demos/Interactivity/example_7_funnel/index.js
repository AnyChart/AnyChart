var chart, stage;


anychart.onDocumentReady(function() {
  // prepare data for the chart
  var data = [
    {name:"Fantasy", value:402676},
    {name:"Fantastic", value:762124},
    {name:"Detective", value:435321},
    {name:"Classic", value:314982},
    {name:"TextBooks", value:220187}
  ];

  // create funnel chart
  chart = anychart.funnel(data);

  chart.selectFill('red');
  chart.legend().enabled(true);

  chart.interactivity('single');

  // set chart margin
  chart.margin(10, '20%', 10, '20%');

  // set container id for the chart
  chart.container("container");

  // set chart title
  chart.title(null);

  // set chart base width settings
  chart.baseWidth("70%");

  // set chart labels settings
  var labels = chart.labels();
  labels.position("right");
  labels.textFormatter(function() {
    return this.name + " - " + this.value;
  });

  //chart.listen('pointMouseOver', function(e) {
  //  console.log(e.type);
  //});
  //
  //chart.listen('pointMouseOut', function(e) {
  //  console.log(e.type);
  //});
  //
  //chart.listen('pointsHover', function(e) {
  //  console.log(e.type);
  //});

  // initiate chart drawing
  chart.draw();
});



