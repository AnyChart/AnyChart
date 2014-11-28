anychart.onDocumentLoad(function() {
  //create data set on our data
  var dataSet = anychart.data.set([
        ['January',   8.1,  2.3],
        ['February',  8.4,  2.1],
        ['March',     11.4, 3.9],
        ['April',     14.2, 5.5],
        ['May',       17.9, 8.7],
        ['June',      21.1, 11.7],
        ['July',      23.5, 13.9],
        ['August',    23.2, 13.7],
        ['September', 19.9, 11.4],
        ['October',   15.6, 8.4],
        ['November',  11.2, 4.9],
        ['December',  8.3,  2.7]
      ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var data1 = dataSet.mapAs({x: [0], value: [1]});
  //map data for the second series, take x from the zero column and value from the second column of data set
  var data2 = dataSet.mapAs({x: [0], value: [2]});

  //create radar chart
  chart = anychart.radar();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Average temperature in London');

  //set chart yScale settings
  chart.yScale()
      .minimum(0)
      .maximumGap(0)
      .ticks().interval(5);

  //set axes labels settings
  chart.yAxis().labels().fontWeight('bold');
  chart.xAxis().labels().padding(5);

  //set chart legend settings
  chart.legend()
      .align(anychart.enums.Align.TOP)
      .position(anychart.enums.Orientation.RIGHT)
      .itemsLayout(anychart.enums.Layout.VERTICAL)
      .enabled(true);

  //set chart margin settings
  chart.margin().bottom(40);

  //set chart
  var background = chart.background().enabled(true);
  background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)'], 90);

  //create point data labels formation function
  var labelFormattingFunction = function() {
    return this.x + ': ' + this.value.toFixed(2)
  };

  //create first series with mapped data
  var series1 = chart.area(data1).name('Day (max)');
  //set fill and stroke settings
  series1.fill('rgb(38, 123, 182) .5').stroke('2 rgb(26, 85, 127)');
  //set data markers settings
  series1.markers().fill('rgb(110, 178, 224)').size(3).enabled(true);
  //set hatch fill settings
  series1.hatchFill(acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL, '#fff .5', 2, 5);
  //set tooltip formatting settings
  series1.tooltip().contentFormatter(labelFormattingFunction);

  var series2 = chart.area(data2).name('Night (min)');
  //set fill and stroke settings
  series2.fill('rgb(119, 145, 34) .5').stroke('2 rgb(89, 109, 25)');
  //set data markers settings
  series2.markers().fill('rgb(194, 220, 108)').size(2).enabled(true);
  //set hatch fill settings
  series2.hatchFill(acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL, '#fff .5', 2, 5);
  //set tooltip formatting settings
  series2.tooltip().contentFormatter(labelFormattingFunction);

  //initiate chart drawing
  chart.draw();
});