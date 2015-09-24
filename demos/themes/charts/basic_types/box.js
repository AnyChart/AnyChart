var box_data = [
  {x: 'East Europe', low: 1, q1: 5, median: 8, q3: 12, high: 16},
  {x: 'West Europe', low: 1, q1: 7, median: 10, q3: 17, high: 22},
  {x: 'Australia', low: 1, q1: 8, median: 12, q3: 19, high: 26},
  {x: 'South America', low: 2, q1: 8, median: 12, q3: 21, high: 28},
  {x: 'North America', low: 3, q1: 10, median: 17, q3: 28, high: 30},
  {x: 'Oceania', low: 1, q1: 9, median: 16, q3: 22, high: 24},
  {x: 'North Africa', low: 1, q1: 8, median: 14, q3: 18, high: 24},
  {x: 'West Africa', low: 1, q1: 6, median: 8, q3: 13, high: 16},
  {x: 'Central Africa', low: 2, q1: 4, median: 9, q3: 12, high: 15},
  {x: 'Southern Africa', low: 1, q1: 4, median: 8, q3: 11, high: 14}
];

var box_data_with_outliers = [
  {x: 'Registered Nurse', low: 20000, q1: 26000, median: 27000, q3: 32000, high: 38000, outliers: [50000, 52000]},
  {x: 'Dental Hygienist', low: 24000, q1: 28000, median: 32000, q3: 38000, high: 42000, outliers: [48000]},
  {
    x: 'Computer Systems Analyst',
    low: 40000,
    q1: 49000,
    median: 62000,
    q3: 73000,
    high: 88000,
    outliers: [32000, 29000, 106000]
  },
  {x: 'Physical Therapist', low: 52000, q1: 59000, median: 65000, q3: 74000, high: 83000, outliers: [91000]},
  {x: 'Software Developer', low: 45000, q1: 54000, median: 66000, q3: 81000, high: 97000, outliers: [120000]},
  {
    x: 'Information Security Analyst',
    low: 47000,
    q1: 56000,
    median: 69000,
    q3: 85000,
    high: 100000,
    outliers: [110000, 115000, 32000]
  },
  {x: 'Nurse Practitioner', low: 64000, q1: 74000, median: 83000, q3: 93000, high: 100000, outliers: [110000]},
  {x: 'Physician Assistant', low: 67000, q1: 72000, median: 84000, q3: 95000, high: 110000, outliers: [57000, 54000]},
  {x: 'Dentist', low: 75000, q1: 99000, median: 123000, q3: 160000, high: 210000, outliers: [220000, 70000]},
  {x: 'Physician', low: 58000, q1: 96000, median: 130000, q3: 170000, high: 200000, outliers: [42000, 210000, 215000]}
];

var BoxChart_1 = function() {
  var chart = anychart.box();
  chart.box(box_data);
  return chart;
};

var BoxChart_2 = function() {
  var chart = anychart.box();
  chart.title('Oceanic Airlines Delays December, 2014');
  chart.xAxis().staggerMode(true);
  chart.box(box_data);
  return chart;
};

var BoxChart_3 = function() {
  var chart = anychart.box();
  chart.title('Oceanic Airlines Delays December, 2014');
  var series = chart.box(box_data_with_outliers);
  series.whiskerWidth('20%');
  series.hoverWhiskerWidth('20%');
  chart.legend().enabled(true);
  return chart;
};


anychart.onDocumentReady(function() {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="box_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="box_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="box_3"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = BoxChart_1();
  chart1.container('box_1');
  chart1.draw();
  var chart2 = BoxChart_2();
  chart2.container('box_2');
  chart2.draw();
  var chart3 = BoxChart_3();
  chart3.container('box_3');
  chart3.draw();
});
