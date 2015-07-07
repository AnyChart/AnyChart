var chart;
function load() {
  var data = [
    {name: "Product B", value: "100"},
    {name: "Product A", value: "20"},
  ];


  chart = anychart.pie(data);
  chart.legend().enabled(false);
  chart.title().enabled(false);
  chart.labels().position('inside');
  chart.labels().fontColor('black');
  chart.labels().fontSize("18pt");
  chart.labels().fontFamily('OpenSans');
  chart.labels().textFormatter(function() {return 'Long long test'});
  chart.palette(['#32c9b0', '#acc4c0', '#336699']);
  chart.container('container');
  chart.draw();

}
