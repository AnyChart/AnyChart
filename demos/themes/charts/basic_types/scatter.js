var ScatterChart_1 = function() {
  var chart = anychart.scatter();
  var map_training_data = best_sportsmens_training_data.mapAs(
      {x: [1], value: [2], size: [4], training: [0], data: [3]});
  var training_filter = function(fieldVal) {return fieldVal == this};

  var sportsmen1 = map_training_data.filter('training', training_filter.bind(1));

  var series = chart.bubble(sportsmen1);
  series.displayNegative(true);

  chart.minBubbleSize('10%').maxBubbleSize('35%');
  chart.rangeMarker().from(90).to(125);
  chart.lineMarker().value(140);
  chart.textMarker().value(140);
  chart.crosshair(true);
  return chart;
};

var ScatterChart_2 = function() {
  var chart = anychart.scatter();
  var map_training_data = best_sportsmens_training_data.mapAs(
      {x: [1], value: [2], size: [4], training: [0], data: [3]});
  var training_filter = function(fieldVal) {return fieldVal == this};
  var sportsmen1 = map_training_data.filter('training', training_filter.bind(1));
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Months'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  chart.bubble(sportsmen1);
  return chart;
};

var ScatterChart_3 = function() {
  var chart = anychart.scatter();
  chart.title().enabled(true);
  chart.title().text('Sales of different products in Florida and Texas');
  var map_training_data = best_sportsmens_training_data.mapAs(
      {x: [1], value: [2], size: [4], training: [0], data: [3]});
  var training_filter = function(fieldVal) {return fieldVal == this};
  var sportsmen1 = map_training_data.filter('training', training_filter.bind(1));
  var sportsmen2 = map_training_data.filter('training', training_filter.bind(2));
  var sportsmen3 = map_training_data.filter('training', training_filter.bind(3));
  var sportsmen4 = map_training_data.filter('training', training_filter.bind(4));
  chart.bubble(sportsmen1).name('Revenue');
  chart.bubble(sportsmen2).name('Internet sales');
  chart.bubble(sportsmen3).name('Internet sales');
  chart.bubble(sportsmen4).name('Internet sales');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart;
};

var ScatterChart_4 = function() {
  var chart = anychart.scatter();
  var map_training_data = best_sportsmens_training_data.mapAs(
      {x: [1], value: [2], size: [4], training: [0], data: [3]});
  var training_filter = function(fieldVal) {return fieldVal == this};
  var sportsmen1 = map_training_data.filter('training', training_filter.bind(1));
  var series = chart.bubble(sportsmen1);
  series.labels(true);
  series.markers(true);
  return chart;
};

var ScatterChart_5 = function() {
  var chart = anychart.scatter();
  var map_training_data = best_sportsmens_training_data.mapAs(
      {x: [1], value: [2], size: [4], training: [0], data: [3]});
  var training_filter = function(fieldVal) {return fieldVal == this};
  var sportsmen1 = map_training_data.filter('training', training_filter.bind(1));
  var sportsmen2 = map_training_data.filter('training', training_filter.bind(2));
  var sportsmen3 = map_training_data.filter('training', training_filter.bind(3));
  var sportsmen4 = map_training_data.filter('training', training_filter.bind(4));
  var sportsmen5 = map_training_data.filter('training', training_filter.bind(5));
  var sportsmen6 = map_training_data.filter('training', training_filter.bind(6));
  var sportsmen7 = map_training_data.filter('training', training_filter.bind(7));
  var sportsmen8 = map_training_data.filter('training', training_filter.bind(8));
  var sportsmen9 = map_training_data.filter('training', training_filter.bind(9));
  var sportsmen10 = map_training_data.filter('training', training_filter.bind(10));
  chart.marker(sportsmen1);
  chart.marker(sportsmen2);
  chart.marker(sportsmen3);
  chart.marker(sportsmen4);
  chart.marker(sportsmen5);
  chart.marker(sportsmen6);
  chart.marker(sportsmen7);
  chart.marker(sportsmen8);
  chart.marker(sportsmen9);
  chart.marker(sportsmen10);
  return chart;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="scatter_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="scatter_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="scatter_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="scatter_4"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="scatter_5"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = ScatterChart_1();
  chart1.container('scatter_1');
  chart1.draw();
  var chart2 = ScatterChart_2();
  chart2.container('scatter_2');
  chart2.draw();
  var chart3 = ScatterChart_3();
  chart3.container('scatter_3');
  chart3.draw();
  var chart4 = ScatterChart_4();
  chart4.container('scatter_4');
  chart4.draw();
  var chart5 = ScatterChart_5();
  chart5.container('scatter_5');
  chart5.draw();
});
