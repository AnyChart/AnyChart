var chart;
anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = anychart.data.set([
    ['Traffic', 56, 0],
    ['Child Care', 44.8, 35],
    ['Transp.', 27.2, 61],
    ['Weather', 19.6, 77],
    ['Overslept', 11.4, 89],
    ['Emergency', 6.6, 100]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //create column chart
  chart = anychart.column();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Pareto Chart of Late Arrivals by Reported Cause');

  //create second series with mapped data
  chart.column(seriesData_1);

  //setup scale settings
  var yScale = chart.yScale();
  yScale.minimum(0);                    //set scale minimum value
  yScale.maximum(184.8);                //set scale maximum value
  yScale.ticks().interval(16.8);        //set scale ticks interval value
  yScale.minorTicks().interval(8.4);   //set scale minor ticks interval value

  //create additional scale for line series and extraYAxis
  //it force line series to not stuck with over series
  var additionalYScale = anychart.scales.linear();
  additionalYScale.minimum(0);
  additionalYScale.maximum(110);
  additionalYScale.ticks().interval(10);

  //create line series and set scale for it
  var lineSeries = chart.line(seriesData_2);
  lineSeries.yScale(additionalYScale);

  //create extra axis on the right side of chart
  var extraYAxis = chart.yAxis(1);
  extraYAxis.orientation('right');
  extraYAxis.scale(additionalYScale);

  //setup axis to append '%' symbol to label values
  extraYAxis.labels().textFormatter(function(info) {
    return info.value + '%';
  });

  //initiate chart drawing
  chart.draw();
});