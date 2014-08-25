anychart.onDocumentReady(function() {
  var data = [
    ['28-Aug-07', 511.53, 514.98, 505.79, 506.40],
    ['29-Aug-07', 507.84, 513.30, 507.23, 512.88],
    ['30-Aug-07', 512.36, 515.40, 510.58, 511.40],
    ['31-Aug-07', 513.10, 516.50, 511.47, 515.25],
    ['4-Sep-07', 515.02, 528.00, 514.62, 525.15]
  ];
  chart = anychart.financialChart();
  chart.xScale(anychart.scales.ordinal());
  chart.ohlc(data).labels().enabled(true);
  chart.container('container');
  chart.draw();
});