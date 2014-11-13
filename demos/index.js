var chart
anychart.onDocumentReady(function() {

  //data
  var data = anychart.data.set([
    {x: 'January', y: 10000},
    {x: 'February', y: 12000},
    {x: 'March', y: 18000},
    {x: 'April', y: 11000},
    {x: 'May', y: 9000}
  ]);

  //chart type
  chart = anychart.areaChart();

  //chart title
  chart.title().text('Image fill');

  //set axes titles
  chart.xAxis().title().text('Retail Channel');
  chart.yAxis().title().text('Sales');

  //adjust chart fill mode and set picture instead of color
  chart.area(data).fill({
    src: 'http://bm.img.com.ua/berlin/storage/orig/d/0a/c6b96679df0f6b09766f96c9ce7150ad.jpg',
    mode: acgraph.vector.ImageFillMode.TILE
  });

  //draw chart
  chart.container('container').draw();
});