anychart.onDocumentLoad(function() {
  var data = new anychart.data.Set([
    ['January', 10000],
    ['February', 12000],
    ['March', 18000],
    ['April', 11000],
    ['May', 9000]
  ]);
  chart = anychart.areaChart(data);
  var series= chart.area(data);
  series.labels().enabled(true).rotation(90).offsetX(20).textFormatter(function(point){
    return point.x;
  });
  series.tooltip().enabled(true).title().enabled(true).text('Your Tooltip Title');
  chart.container('container').draw();

})