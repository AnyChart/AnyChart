var funnel_data = [
  {
    name: 'Preparation of survey',
    value: 30
  },
  {
    name: 'Marketing survey',
    value: 20
  },
  {
    name: 'Processing of questionnaires',
    value: 40
  },
  {
    name: 'Data analysis and report',
    value: 40
  },
  {
    name: 'Planing recommendations from the report',
    value: 20
  },
  {
    name: 'Making changes by recommendations',
    value: 50
  }
];

var FunnelChart_1 = function() {
  return anychart.funnel(funnel_data);

};

var FunnelChart_2 = function() {
  var chart = anychart.funnel(funnel_data);
  chart.title().enabled(true);
  chart.title().text('Business plan');
  chart.legend().enabled(true);
  return chart;
};

var FunnelChart_3 = function() {
  var chart = anychart.funnel(funnel_data);
  chart.title().enabled(true);
  chart.title().text('Business plan');
  chart.labels().position('inside');
  return chart;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="funnel_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="funnel_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="funnel_3"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = FunnelChart_1();
  chart1.container('funnel_1');
  chart1.draw();
  var chart2 = FunnelChart_2();
  chart2.container('funnel_2');
  chart2.draw();
  var chart3 = FunnelChart_3();
  chart3.container('funnel_3');
  chart3.draw();

});

