var hoverOpacity = 0.8;
var data = [
  {
    name: 'Department Stores',
    value: 6371664
  },
  {
    name: 'Discount Stores',
    value: 7216301
  },
  {
    name: 'Men\'s/Women\'s Stores',
    value: 1486621
  },
  {
    name: 'Juvenile Specialty Stores',
    value: 786622
  },
  {
    name: 'All other outlets',
    value: 900000
  }
];

var PieChart_1 = function() {
  return anychart.pie(data);
};

var PieChart_2 = function() {
  var chart = anychart.pie(data);
  chart.innerRadius('30%');
  chart.title().enabled(true);
  chart.title().text('ACME Corp. apparel sales through different retail channels');
  return chart;
};

var PieChart_3 = function() {
  var chart = anychart.pie(data);
  chart.title().enabled(true);
  chart.title().text('ACME Corp. apparel sales through different retail channels');
  chart.labels().position('inside');
  return chart;
};

var PieChart_4 = function() {
  var chart = anychart.pie(data);
  chart.innerRadius('30%');
  chart.title().enabled(true);
  chart.fill('aquaStyle');
  chart.title().text('ACME Corp. apparel sales through different retail channels');
  chart.labels().position('outside');
  return chart;
};

var PieChart_5 = function() {
  var chart = anychart.pie3d(data);
  chart.innerRadius('30%');
  chart.title().enabled(true);
  chart.title().text('ACME Corp. apparel sales through different retail channels');
  return chart;
};

anychart.onDocumentReady(function () {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="pie_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="pie_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="pie_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="pie_4"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="pie_5"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = PieChart_1();
  chart1.container('pie_1');
  chart1.draw();
  var chart2 = PieChart_2();
  chart2.container('pie_2');
  chart2.draw();
  var chart3 = PieChart_3();
  chart3.container('pie_3');
  chart3.draw();
  var chart4 = PieChart_4();
  chart4.container('pie_4');
  chart4.draw();
  var chart5 = PieChart_5();
  chart5.container('pie_5');
  chart5.draw();
});
