anychart.onDocumentReady(function() {
  //create data set on our data
  var dataSet = new anychart.data.Set([
    ['P1', 162, 142, 122],
    ['P2', 134, 154, 144],
    ['P3', 116, 126, 116],
    ['P4', 122, 132, 162],
    ['P5', 178, 168, 148],
    ['P6', 144, 154, 194],
    ['P7', 125, 135, 145],
    ['P8', 176, 166, 136],
    ['P9', 156, 188, 118],
    ['P10', 195, 120, 130],
    ['P11', 215, 115, 155],
    ['P12', 176, 136, 166],
    ['P13', 167, 147, 137],
    ['P14', 142, 172, 152],
    ['P15', 117, 137, 177],
    ['P16', 113, 123, 183],
    ['P17', 132, 134, 144],
    ['P18', 146, 146, 166],
    ['P19', 169, 159, 189],
    ['P20', 184, 144, 134]
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the second series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create area chart
  var chart = anychart.areaChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('100% Stacked Area Chart');

  //set chart Y scale settings
  chart.yScale()
      .stackMode('percent') //force chart to stack series values in percentage
      .maximum(100)         //set maximum scale value
      .ticks()              //access to scale ticks settings , note that chaining sequence now continue from ticks object
      .interval(10);        //set scale ticks interval


  //set yAxis labels formatting, force it to add % to values
  chart.yAxis(0).labels().textFormatter(function(info) {
    return info.value + '%';
  });

  //using fill function we can create a pretty gradient for the series
  //note that we using series sourceColor here, which can be configured separately for each series by 'color' method
  var fillFunction = function() {
    return {keys: [
      {offset: 0, color: this.sourceColor},
      {offset: 1, color: anychart.color.darken(this.sourceColor)}
    ], angle: -90, opacity: 1};
  };

  //create first area series on mapped data and specify series fill function
  chart.area(seriesData_1).fill(fillFunction);

  //create second area series on mapped data and specify series fill function
  chart.area(seriesData_2).fill(fillFunction);

  //create third area series on mapped data, specify series fill function and color
  chart.area(seriesData_3).color('#EEEE25').fill(fillFunction);

  //initiate chart drawing
  chart.draw();
});
