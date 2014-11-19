var chart;
anychart.onDocumentLoad(function() {

  var data = [
    [15, 9],
    [30, 7],
    [45, 10],
    [60, 7],
    [75, 8],
    [90, 7],
    [105, 9],
    [120, 3],
    [135, 6],
    [150, 2],
    [165, 5],
    [180, 6],
    [195, 3],
    [210, 6],
    [225, 6],
    [240, 6],
    [255, 5],
    [270, 4],
    [285, 10],
    [300, 4],
    [315, 8],
    [330, 5],
    [345, 6],
    [360, 3]
  ];
  var data2 = [
    [14.29, 10.7],
    [42.96, 8.75],
    [57.64, 8.82],
    [57.7, 9.83],
    [54.94, 11.1],
    [26.39, 4.91],
    [49.62, 11.81],
    [87.82, 6.82],
    [81.56, 7.71],
    [44.62, 5.18],
    [107.54, 4.75],
    [43.88, 10.07],
    [56.48, 6.11],
    [123.22, 7.16],
    [144.81, 6.54],
    [129.37, 10.22],
    [158.61, 6.11],
    [74.77, 6.74],
    [19.45, 14.41],
    [156.2, 6.7],
    [220.43, 12.49],
    [124.03, 8.41],
    [47.04, 10.24],
    [3.5, 6.99]
  ];
  var data3 = [
    [8.589, 13.44],
    [10.59, 9.12],
    [54.26, 6.15],
    [66.81, 8.23],
    [19.95, 7.7],
    [23.21, 5.36],
    [9.49, 13.19],
    [98.62, 7.02],
    [35.13, 9.22],
    [62.21, 4.61],
    [161.42, 7.75],
    [153.18, 5.65],
    [153.08, 5.42],
    [127.81, 9.73],
    [120.58, 5.02],
    [91.01, 8.48],
    [90.15, 6.5],
    [5.8, 7.53],
    [144.32, 6.37],
    [284.68, 6.01],
    [34.43, 11.25],
    [120.56, 4.62],
    [131.05, 9.04],
    [3.5, 5.47]
  ];

  chart = anychart.polarChart()
      .container('container')
      .startAngle(90);

  chart.yScale().stackMode(anychart.enums.ScaleStackMode.VALUE);
  chart.yScale().ticks().interval(2);

  chart.xScale().maximum(360);
  chart.xScale().ticks().interval(15);
  chart.yAxis().minorTicks().enabled(false);
  chart.xAxis().labels()
      .textFormatter(function() {
        return this['value'] + '°'
      });
  chart.title(null);
  chart.background().enabled(true);

  chart.grid(1).oddFill(null).evenFill(null);
  chart.grid(0).oddFill('white');
  //chart.palette(['blue .3', 'red .3']);
  chart.markerPalette(['star5', 'rect', 'diamond']);

  chart.legend()
      .enabled(true)
      .position(anychart.enums.Orientation.RIGHT)
      .itemsLayout(anychart.enums.Layout.VERTICAL)
      .align('left');

  chart.background()
      .enabled(true)
      .stroke('2 #2466B1')
      .corners(10);
  chart.margin(20);
  chart.padding(15);

  var series1 = chart.marker(data);
  series1.size(4).hoverSize(8);
  var series2 = chart.marker(data2);
  series2.size(4).hoverSize(8);
  var series3 = chart.marker(data3);
  series3.size(4).type('diamond').hoverSize(8);

  chart.draw();
});