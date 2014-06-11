anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 128.14, 90.54, 43.76, 122.56],
    ['P2', 112.61, 104.19, 61.34, 187.12],
    ['P3', 163.21, 150.67, 34.17, 54.32],
    ['P4', 229.98, 120.43, 45.72, 33.08]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create column chart
  var chart = anychart.columnChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Multi-Series Bar Chart');

  var legend = chart.legend()
      .enabled(true)
      .position('right')
      .itemsLayout('vertical');
  var legendTooltip = legend.tooltip();
  legendTooltip.enabled(true);
  legendTooltip.title().enabled(true).margin(5, 5, 0, 5);
  legendTooltip.title().enabled(true).padding(0);
  legendTooltip.content().hAlign('left');
  legendTooltip.textFormatter(function() {
    return '<span style="text-align: left;">' + this.meta.info + '<br>' + this.meta.otherInfo + '</span>';
  });

  //temp variable to store series instance
  var series;

  //create first series with mapped data
  series = chart.column(seriesData_1);
  series.name('Series One');
  series.meta({'info': 'First series meta meta info.', 'otherInfo': 'First series other meta info.'});

  //create second series with mapped data
  series = chart.column(seriesData_2);
  series.name('Series Two');
  series.meta({'info': 'Second series meta info.', 'otherInfo': 'Second series other meta info.'});

  //create third series with mapped data
  series = chart.column(seriesData_3);
  series.name('Series Three');
  series.meta({'info': 'Third series meta info.', 'otherInfo': 'Third series other meta info.'});

  //create fourth series with mapped data
  series = chart.column(seriesData_4);
  series.name('Series Four');
  series.meta({'info': 'Fourth series meta info.', 'otherInfo': 'Fourth series other meta info.'});

  //initiate chart drawing
  chart.draw();
});
