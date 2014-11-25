var areaChart, data1, area;
function load() {
  var stage = acgraph.create('container', '100%', '100%');
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
    vals.push(i);
  }
  data1 = new anychart.data.Set(data1);

  areaChart = new anychart.charts.Cartesian();
  areaChart.xScale(new anychart.scales.Linear());
  areaChart.container(stage);
  areaChart.bounds(0, 0, 1000, 300);

  area = areaChart.line(data1);
  area.labels().anchor('bottom').position('top').enabled(true);
  area.labels().background().enabled(true).fill('blue');

  area.hoverLabels().fontColor('green');
  area.hoverLabels().background().enabled(true).fill('red');

//  area.listen('click', function() { console.log(arguments); });
  areaChart.barsPadding(0.1);
  areaChart.xAxis();
  areaChart.yAxis();
  areaChart.draw();
}
