var chart;

anychart.onDocumentReady(function() {
  //create data set on our data,also we can pud data directly to series
  var dataSet = anychart.data.set([
    ['Jan', 22, 43, 75],
    ['Feb', 34, 45, 56],
    ['Mar', 16, 26, 67],
    ['Apr', 12, 86, 42],
    ['May', 38, 35, 17],
    ['Jun', 47, 31, 12],
    ['Jul', 39, 27, 9],
    ['Aug', 28, 16, 23],
    ['Sep', 21, 27, 47],
    ['Oct', 18, 31, 58],
    ['Nov', 24, 42, 69],
    ['Dec', 29, 39, 71]
  ]);

  //map data for the first series,take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series,take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create line chart
  chart = anychart.line();
  chart.grid(0).enabled(false);

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Line Chart with Dashed Style');

  //we can edit series stroke by function in which context available:
  //defaultSeries stroke settings - this.sourceColor
  //series index                  - this.index
  //function should return acgraph.vector.Stroke type (string/Object)
  var seriesStrokeFunction = function() {
    return {
      color: this.sourceColor,
      dash: '5 3 2'
    };
  };

  //temp variable to store series instance
  var series;

  //we can use local variables to change series settings
  series = chart.line(seriesData_1);
  series.stroke(seriesStrokeFunction);

  //or just use chaining calls
  series = chart.line(seriesData_2);
  series.stroke(seriesStrokeFunction);

  //or access series by index from chart
  series = chart.line(seriesData_3);
  series.stroke(seriesStrokeFunction);

  //initiate chart drawing
  chart.draw();
});
