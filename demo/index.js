anychart.onDocumentLoad(function(){
  stage = acgraph.create('100%', '100%', 'container');

  var dataSet = [
    ['672-A-11', 107101, 120712, 140712],
    ['672-B-12', 114212, 125311, 145311],
    ['673-A-11', 105321, 210012, 140012],
    ['673-B-14', 118421, 170127, 140127],
    ['694-C-10', 187613, 132739, 142739],
    ['694-D-21', 190261, 125219, 145219],
    ['694-F-34', 103812, 115214, 145214]
  ];

  var palette = ['red .8', 'orange .6', 'yellow .7'];

  var pieCharts = {};
  for( var item in dataSet){
    var sl = dataSet[item].shift();
    pointsSumm = 0;
    for (var point in dataSet[item])
      pointsSumm += dataSet[item][point];
    pieCharts[sl] = new anychart.pie.Chart(dataSet[item]);
    pieCharts[sl]
        .palette(palette)
        .legend(null)
        .bounds(0, 0, 150, 150)
        .padding(10)
        .startAngle(0)
        .labels().textFormatter(function(formatProvider, index){
          return (100*formatProvider(index, 'value')/pointsSumm).toFixed(1) + '%';
        });
    dataSet[item].unshift(sl);
  }

  dataSet = new anychart.data.Set(dataSet);

  chart = new anychart.cartesian.Chart();
  chart
      .palette(palette)
      .barGroupsPadding(0.2)
      .title()
      .text('Effects of experimental drugs per day')
        .fontSize(16);

  chart.xAxis()
      .title('Drug label')
      .orientation('left');

  chart.yScale().stackMode('percent');

  var yAxis = chart.yAxis().orientation('bottom');
  yAxis.title(null);
  yAxis.labels().textFormatter(function(obj) {
    return obj.value + '%';
  });

  chart.grid().scale(chart.yScale())
      .oddFill('none')
      .evenFill('none')
      .stroke('grey .9')
      .direction('vertical');
  chart.minorGrid()
      .scale(chart.xScale())
      .oddFill('none')
      .evenFill('none')
      .stroke('grey .1');
  chart.grid()
      .scale(chart.yScale())
      .direction('vertical')
      .oddFill('none')
      .evenFill('none')
      .stroke('grey .3');

  var series1 = chart.bar(dataSet.mapAs({'value': [1], 'x': [0]}))
      .name('Aggressiveness')
      .markers(null)
      .hoverMarkers(null);
  series1.tooltip()
      .textFormatter(function(){
        pieCharts[this.x].container(series1.tooltip().content().container());
        pieCharts[this.x].background().stroke(series1.color());
        pieCharts[this.x].title().text(series1.name());
        pieCharts[this.x]
            .explodeSlice(0, true)
            .explodeSlice(1, false)
            .explodeSlice(2, false)
            .draw();
        return '';
      })
      .title(null)
      .background()
      .stroke(series1.color());


  var series2 = chart.bar(dataSet.mapAs({'value': [2], 'x': [0]}))
      .name('Drowsiness')
      .markers(null)
      .hoverMarkers(null);
  series2.tooltip()
      .textFormatter(function(){
        pieCharts[this.x].container(series2.tooltip().content().container());
        pieCharts[this.x].background().stroke(series2.color());
        pieCharts[this.x].title().text(series2.name());
        pieCharts[this.x]
            .explodeSlice(0, false)
            .explodeSlice(1, true)
            .explodeSlice(2, false)
            .draw();
        return '';
      })
      .title(null)
      .background()
      .stroke(series2.color());

  var series3 = chart.bar(dataSet.mapAs({'value': [3], 'x': [0]}))
      .name('Calmness')
      .markers(null)
      .hoverMarkers(null);
  series3.tooltip()
      .textFormatter(function(){
        pieCharts[this.x].container(series3.tooltip().content().container());
        pieCharts[this.x].background().stroke(series3.color());
        pieCharts[this.x].title().text(series3.name());
        pieCharts[this.x]
            .explodeSlice(0, false)
            .explodeSlice(1, false)
            .explodeSlice(2, true)
            .draw();
        return '';
      })
      .title(null)
      .background()
      .stroke(series3.color());
  //legend
  var legend = chart.legend();
  legend.position('right')
      .align('left')
      .enabled(true)
      .padding(10);
  legend.title()
      .text('Animal\'s behaviour')
      .enabled(true);
  legend.titleSeparator()
      .margin(7, 0)
      .enabled(true);
  //background
  chart
      .margin(5)
      .background()
      .corners(20);
  //draw chart
  chart
      .container(stage)
      .draw();
  // watermark
  var watermark = new anychart.elements.Label();
  watermark.text('AnyChart Trial Version')
      .fontOpacity(.05)
      .adjustFontSize(true, false)
      .width('100%')
      .height('100%')
      .vAlign('center')
      .hAlign('center')
      .parentBounds(stage.getBounds())
      .padding(20)
      .hoverable(false)
      .container(stage)
      .draw();

  new anychart.elements.Label()
      .text('<b>Note:</b><br/>This example only <br/>for experiment with<br/>tooltip magic.<br/>Don\'t try repeat that.')
      .width(120)
      .height(110)
      .offsetX(15,25)
      .fontSize(12)
      .useHtml(true)
      .position('rightBottom')
      .anchor('rightBottom')
      .parentBounds(stage.getBounds())
      .container(stage)
      .draw();
});