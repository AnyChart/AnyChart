var areaChart, data1, area;
function load() {
  var stage = acgraph.create('100%', '100%', 'container');
  data1 = [];
  var data2 = [];
  var d1 = [], d2 = [];
  var t1, t2;
  var vals = [];
  for (var i = 0; i < 20; i++) {
    if (t1 = (Math.random() > 0)) {
      d1.push(i);
      data1.push([
        i,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    if (t2 = (Math.random() > 0.2)) {
      d2.push(i);
      data2.push([
        i,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    vals.push(i);
  }
  data1 = new anychart.data.Set(data1);

  areaChart = new anychart.cartesian.Chart();
  areaChart.container(stage);
  areaChart.bounds(0, 0, 1000, 300);

  area = areaChart.area(data1);
  area.markers().enabled(true);
//  area.listen('click', function() { console.log(arguments); });
  areaChart.barsPadding(0.1);
  areaChart.xAxis();
  areaChart.yAxis();
  areaChart.draw();
}
