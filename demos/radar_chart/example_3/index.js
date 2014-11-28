anychart.onDocumentLoad(function() {
  //create data set on our data
  var dataSet = anychart.data.set([
        ['Strength',  136, 199, 43],
        ['Agility',   79,  125, 56],
        ['Stamina',   149, 173, 101],
        ['Intellect', 135, 33,  202],
        ['Spirit',    158, 64,  196]
      ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var data1 = dataSet.mapAs({x: [0], value: [1]});
  //map data for the second series, take x from the zero column and value from the second column of data set
  var data2 = dataSet.mapAs({x: [0], value: [2]});
  //map data for the third series, take x from the zero column and value from the third column of data set
  var data3 = dataSet.mapAs({x: [0], value: [3]});

  //create radar chart
  chart = anychart.radar();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('WoW base stats comparison radar chart: Shaman vs Warrior vs Priest');

  //set chart yScale settings
  chart.yScale()
      .minimum(0)
      .maximumGap(0)
      .ticks().interval(50);

  //set xAxis labels settings
  chart.xAxis().labels().fontWeight('bold').padding(5);

  //set chart legend settings
  chart.legend()
      .align(anychart.enums.Align.TOP)
      .position(anychart.enums.Orientation.RIGHT)
      .itemsLayout(anychart.enums.Layout.VERTICAL)
      .enabled(true);

  //set chart grinds settings
  chart.grid(0).oddFill('white').evenFill('white').stroke('rgb(221,221,221)');
  chart.grid(1).oddFill(null).evenFill(null).stroke('rgb(192,192,192)');

  //create point data labels formation function
  var labelFormattingFunction = function() {
    return this.x + ': ' + this.value.toFixed(2)
  };

  //create first series with mapped data
  var series1 = chart.line(data1).name('Shaman');
  series1.markers().size(3);
  series1.tooltip().contentFormatter(labelFormattingFunction);
  //create first series with mapped data
  var series2 = chart.line(data2).name('Warrior');
  series2.markers().size(2);
  series2.tooltip().contentFormatter(labelFormattingFunction);
  //create first series with mapped data
  var series3 = chart.line(data3).name('Priest');
  series3.markers().size(3);
  series3.tooltip().contentFormatter(labelFormattingFunction);

  chart.draw();
});