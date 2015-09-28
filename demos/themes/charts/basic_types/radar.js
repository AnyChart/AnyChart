
var RadarChart_1 = function() {
  var chart = anychart.radar();
  var data1 = radarDataSet.mapAs({x: [0], value: [1]});
  var data2 = radarDataSet.mapAs({x: [0], value: [2]});
  var data3 = radarDataSet.mapAs({x: [0], value: [3]});
  chart.line(data1).name('Shaman');
  chart.line(data2).name('Warrior');
  chart.line(data3).name('Priest');
  return chart;
};

var RadarChart_2 = function() {
  var chart = anychart.radar();
  var data1 = radarDataSet.mapAs({x: [0], value: [1]});
  var data2 = radarDataSet.mapAs({x: [0], value: [2]});
  var data3 = radarDataSet.mapAs({x: [0], value: [3]});
  chart.area(data1).name('Shaman');
  chart.area(data2).name('Warrior');
  chart.area(data3).name('Priest');
  chart.title().enabled(true);
  chart.title().text('WoW base stats comparison radar chart.\nShaman vs Warrior vs Priest');
  chart.legend().enabled(true);
  return chart;
};

var RadarChart_3 = function() {
  var chart = anychart.radar();
  var data1 = radarDataSet.mapAs({x: [0], value: [1]});
  var data2 = radarDataSet.mapAs({x: [0], value: [2]});
  var data3 = radarDataSet.mapAs({x: [0], value: [3]});
  chart.marker(data1).name('Shaman');
  chart.marker(data2).name('Warrior');
  chart.marker(data3).name('Priest');
  chart.title().enabled(true);
  chart.title().text('WoW base stats comparison radar chart.\nShaman vs Warrior vs Priest');
  chart.legend().enabled(true);
  return chart;
};

var RadarChart_4 = function() {
  var chart = anychart.radar();
  var data1 = radarDataSet.mapAs({x: [0], value: [1]});
  var data2 = radarDataSet.mapAs({x: [0], value: [2]});
  var data3 = radarDataSet.mapAs({x: [0], value: [3]});
  chart.area(data1).name('Shaman');
  chart.area(data2).name('Warrior');
  chart.area(data3).name('Priest');
  chart.title().enabled(true);
  chart.title().text('WoW base stats comparison radar chart.\nShaman vs Warrior vs Priest');
  chart.legend().enabled(true);
  chart.yScale().stackMode('percent');
  return chart;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="radar_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="radar_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="radar_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="radar_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = RadarChart_1();
  chart1.container('radar_1');
  chart1.draw();
  var chart2 = RadarChart_2();
  chart2.container('radar_2');
  chart2.draw();
  var chart3 = RadarChart_3();
  chart3.container('radar_3');
  chart3.draw();
  var chart4 = RadarChart_4();
  chart4.container('radar_4');
  chart4.draw();
});
