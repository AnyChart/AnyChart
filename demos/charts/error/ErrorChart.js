anychart.onDocumentReady(function() {
  //chart data
  var data = [
    {x: '1', low: 1, q1: 2, median: 5, q3: 8, high: 20},
    {x: '2', low: 1, q1: 3, median: 6, q3: 10, high: 26},
    {x: '3', low: 1, q1: 3, median: 6, q3: 12, high: 30},
    {x: '4', low: 2, q1: 3, median: 7, q3: 12, high: 32},
    {x: '5', low: 3, q1: 5, median: 12, q3: 18, high: 38},
    {x: '6', low: 1, q1: 2, median: 7, q3: 11, high: 28},
    {x: '7', low: 1, q1: 3, median: 5, q3: 10, high: 28},
    {x: '8', low: 1, q1: 2, median: 3, q3: 8, high: 20},
    {x: '9', low: 2, q1: 3, median: 6, q3: 9, high: 19},
    {x: '10', low: 1, q1: 4, median: 8, q3: 12, high: 18}
  ];

  //create box chart
  chart = anychart.box();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Oceanic Airlines Delays\nDecember, 2014');
  chart.title().hAlign('center');

  //set axes titles settings
  chart.xAxis().title(false);
  chart.yAxis().title('Delay in minutes');

  //set chart yScale settings
  chart.yScale().maximumGap(0);

  //create box chart series with our data
  var series = chart.box(data);

  //hide whisker
  series.whiskerWidth(0);
  series.hoverWhiskerWidth(0);

  //initiate chart drawing
  chart.draw();
});