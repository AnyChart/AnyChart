var pyramid_data = [
  {
    name: 'Physiological',
    value: 20
  },
  {
    name: 'Safety',
    value: 20
  },
  {
    name: 'Love and belonging',
    value: 20
  },
  {
    name: 'Knowledge',
    value: 20
  },
  {
    name: 'Self Esteem',
    value: 20
  },
  {
    name: 'Self Actualisation',
    value: 20
  }
];


var PyramidChart_1 = function() {
  return anychart.pyramid(pyramid_data);

};

var PyramidChart_2 = function() {
  var chart = anychart.pyramid(pyramid_data);
  chart.title().enabled(true);
  chart.title().text('Maslow pyramid');
  chart.legend().enabled(true);
  return chart;
};

var PyramidChart_3 = function() {
  var chart = anychart.pyramid(pyramid_data);
  chart.title().enabled(true);
  chart.title().text('Maslow pyramid');
  chart.labels().position('inside');
  return chart;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="pyramid_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="pyramid_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="pyramid_3"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = PyramidChart_1();
  chart1.container('pyramid_1');
  chart1.draw();
  var chart2 = PyramidChart_2();
  chart2.container('pyramid_2');
  chart2.draw();
  var chart3 = PyramidChart_3();
  chart3.container('pyramid_3');
  chart3.draw();

});
