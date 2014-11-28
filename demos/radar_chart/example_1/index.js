anychart.onDocumentLoad(function() {
  //create data set on our data
  var dataSet = anychart.data.set([
        ['GDP',                    1,                   0.11982978723404256,  0.6180425531914894],
        ['GDP Real Growth Rate',   0.3666666666666667,  0.5583333333333333,   0.7583333333333333],
        ['Infant Mortality',       0.06578947368421052, 0.15576923076923077,  0.24473684210526317],
        ['Life Expectancy',        0.9576093653727663,  0.8268638324091188,   0.8905730129390017],
        ['Population',             0.22638827767366515, 0.10979008847837246,  1],
        ['Area',                   0.5390698290165805,  1,                    0.5487479259581779],
        ['Density',                0.02995156531259858, 0.00783120233080335,  0.1299664111937944],
        ['Population Growth Rate', 0.3087248322147651,  -0.12416107382550336, 0.19463087248322147]
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
  chart.title().text('Comparison Chart');

  //set chart yScale settings
  chart.yScale()
      .minimum(-.2)
      .maximum(1)
      .ticks().interval(.2);

  //set chart legend settings
  chart.legend()
      .enabled(true)
      .margin().top(20);

  //set chart grinds settings
  chart.grid(0)
      .oddFill('white')
      .evenFill('white')
      .stroke('rgb(221,221,221)');
  chart.grid(1)
      .oddFill(null)
      .evenFill(null)
      .stroke('rgb(192,192,192)');



  //set chart margin settings
  chart.margin().bottom(40);

  //create chart label with description
  var label = chart.label();
  label.text("This chart compares countries by using specific indicators.\n" +
  "For each indicator, the value 1 is assigned to the country that has the highest value.\n" +
  "Other countries have their value computed as a proportion of the country with the highest value.");
  label.anchor(acgraph.vector.Anchor.CENTER_BOTTOM);
  label.position(acgraph.vector.Anchor.CENTER_BOTTOM);
  label.fontWeight('normal');
  label.fontSize(11);
  label.fontFamily('tahoma');
  label.fontColor('rgb(35,35,35)');
  label.offsetY(15);

  //create point data labels formation function
  var labelFormattingFunction = function() {
    return this.x + ': ' + this.value.toFixed(2)
  };

  //create first series with mapped data
  chart.line(data1)
      .name('USA')
      .tooltip().contentFormatter(labelFormattingFunction);
  //create second series with mapped data
  chart.line(data2)
      .name('Russia').tooltip()
      .contentFormatter(labelFormattingFunction);
  //create third series with mapped data
  chart.line(data3)
      .name('China')
      .tooltip().contentFormatter(labelFormattingFunction);

  //initiate chart drawing
  chart.draw();
});