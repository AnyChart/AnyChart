
var PolarChart_1 = function() {
  var chart = anychart.polar();
  chart.area(polar_data);
  return chart;
};

var PolarChart_2 = function() {
  var chart = anychart.polar();
  chart.line(polar_data).name('Line');
  return chart;
};

var PolarChart_3 = function() {
  var chart = anychart.polar();
  chart.title().enabled(true);
  chart.startAngle(-90);
  chart.title().text('F(x) = (1 + sin(9x))(1 + sin(x))\n(1 + 0.03sin(45x))(1 + 0.04sin(297x)) ').padding([0, 0, 5, 0]);
  chart.xScale().minimum(0).maximum(2 * Math.PI);
  var make_polar_points = function(minX, maxX, step, func) {
    var points = [];
    var current = minX;
    while (current <= maxX) {
      points.push([current, func(current)]);
      current = current + step;
    }
    tt = points;
    return anychart.data.set(points);
  };
  var polar_data = make_polar_points(0, 2 * Math.PI, 0.01, function(x) {
    return (1 + Math.sin(9 * x)) * (1 + Math.sin(x)) * (1 + 0.03 * Math.sin(45 * x)) * (1 + 0.04 * Math.sin(297 * x));
  });
  var data = polar_data.mapAs({x: [0], value: [1]});
  chart.area(data);
  chart.yAxis().enabled(false);
  return chart;
};

var PolarChart_4 = function() {
  var dataSet = anychart.data.set([
    [15, 9, 14.29, 10.7, 8.589, 13.44],
    [30, 7, 42.96, 8.75, 10.59, 9.12],
    [45, 10, 57.64, 8.82, 54.26, 6.15],
    [60, 7, 57.7, 9.83, 66.81, 8.23],
    [75, 8, 54.94, 11.1, 19.95, 7.7],
    [90, 7, 26.39, 4.91, 23.21, 5.36],
    [105, 9, 49.62, 11.81, 9.49, 13.19],
    [120, 3, 87.82, 6.82, 98.62, 7.02],
    [135, 6, 81.56, 7.71, 35.13, 9.22],
    [150, 2, 44.62, 5.18, 62.21, 4.61],
    [165, 5, 107.54, 4.75, 161.42, 7.75],
    [180, 6, 43.88, 10.07, 153.18, 5.65],
    [195, 3, 56.48, 6.11, 153.08, 5.42],
    [210, 6, 123.22, 7.16, 127.81, 9.73],
    [225, 6, 144.81, 6.54, 120.58, 5.02],
    [240, 6, 129.37, 10.22, 91.01, 8.48],
    [255, 5, 158.61, 6.11, 90.15, 6.5],
    [270, 4, 74.77, 6.74, 5.8, 7.53],
    [285, 10, 19.45, 14.41, 144.32, 6.37],
    [300, 4, 156.2, 6.7, 284.68, 6.01],
    [315, 8, 220.43, 12.49, 34.43, 11.25],
    [330, 5, 124.03, 8.41, 120.56, 4.62],
    [345, 6, 47.04, 10.24, 131.05, 9.04],
    [360, 3, 3.5, 6.99, 3.5, 5.47]
  ]);
  var chart = anychart.polar();
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});
  var seriesData_2 = dataSet.mapAs({x: [2], value: [3]});
  var seriesData_3 = dataSet.mapAs({x: [4], value: [5]});
  chart.legend().enabled(true);

  var series1 = chart.marker(seriesData_1);
  series1.name('Papilionidae');

  var series2 = chart.marker(seriesData_2);
  series2.name('Pieridae');

  var series3 = chart.marker(seriesData_3);
  series3.name('Nymphalidae');
  return chart;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="polar_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="polar_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="polar_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="polar_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = PolarChart_1();
  chart1.container('polar_1');
  chart1.draw();
  var chart2 = PolarChart_2();
  chart2.container('polar_2');
  chart2.draw();
  var chart3 = PolarChart_3();
  chart3.container('polar_3');
  chart3.draw();
  var chart4 = PolarChart_4();
  chart4.container('polar_4');
  chart4.draw();
});
