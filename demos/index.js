         anychart.onDocumentReady(function() {
  // chart data
  var data = [
    {x: 'Registered Nurse', low: 20000, q1: 26000, median: 27000, q3: 32000, high: 38000, outliers: [50000, 52000]},
    {x: 'Dental Hygienist', low: 24000, q1: 28000, median: 32000, q3: 38000, high: 42000, outliers: [48000]},
    {x: 'Computer Systems Analyst', low: 40000, q1: 49000, median: 62000, q3: 73000, high: 88000, outliers: [32000, 29000, 106000]},
    {x: 'Physical Therapist', low: 52000, q1: 59000, median: 65000, q3: 74000, high: 83000, outliers: [91000]},
    {x: 'Software Developer', low: 45000, q1: 54000, median: 66000, q3: 81000, high: 97000, outliers: [120000]},
    {x: 'Information Security Analyst', low: 47000, q1: 56000, median: 69000, q3: 85000, high: 100000, outliers: [110000, 115000, 32000]},
    {x: 'Nurse Practitioner', low: 64000, q1: 74000, median: 83000, q3: 93000, high: 100000, outliers: [110000]},
    {x: 'Physician Assistant', low: 67000, q1: 72000, median: 84000, q3: 95000, high: 110000, outliers: [57000, 54000]},
    {x: 'Dentist', low: 75000, q1: 99000, median: 123000, q3: 160000, high: 210000, outliers: [220000, 70000]},
    {x: 'Physician', low: 58000, q1: 96000, median: 130000, q3: 170000, high: 200000, outliers: [42000, 210000, 215000]}
  ];

  // create box chart
  var chart = anychart.box();

  // turn on chart animation
  chart.animation(true);

  // disable chart background
  chart.background(null);

  // set container id for the chart
  chart.container('container');

  // set chart title text settings
  var colorTitle = '#929292';
  var colorAxis = '#bebebe';
  chart.title().text('Top 10 Jobs Salaries Grades Per Year Calisota, USA');
  chart.title().hAlign('center').fontWeight('normal').fontColor(colorTitle).fontFamily('Verdana').fontSize('16px');

  // set axes settings
  chart.xAxis().stroke(colorAxis);
  chart.xAxis().ticks().stroke(colorAxis);
  chart.xAxis().title('Salary Grades');
  chart.xAxis().title().fontWeight('normal').fontFamily('Verdana').fontSize('14px');
  chart.xAxis().staggerMode(true);
  chart.xAxis().title().fontColor(colorAxis);

  chart.yAxis().title(null);
  chart.yAxis().title().fontWeight('normal').fontFamily('Verdana').fontSize('14px');
  chart.yAxis().labels().fontColor(colorAxis).textFormatter(function(){return this['tickValue'] + ' $';});
  chart.yAxis().stroke(colorAxis);
  chart.yAxis().ticks().stroke(colorAxis);
  chart.yAxis().minorTicks().stroke(colorAxis);
  chart.yAxis().labels().fontColor(colorTitle);
  chart.xAxis().labels().fontColor(colorTitle);
  chart.yAxis().title().fontColor(colorAxis);

  chart.grid().stroke('#DEDEDE').oddFill(null).evenFill(null).zIndex(10.1);
  chart.minorGrid().stroke('#ECECEC').zIndex(10);

  // create box chart series with our data
  var series = chart.box(data);
  series.fill('#82BECA');
  series.stroke(null);
  series.stemStroke('#474747');
  series.whiskerStroke('#474747');
  series.medianStroke('1 #474747');
  series.outlierMarkers().stroke(null);
  series.outlierMarkers().fill('#474747');

  // initiate chart drawing
  chart.draw();
});