var chart, stage;

function load() {

  // Chart initialize
  stage = acgraph.create(600, 400, 'container');
  chart = new anychart.Chart(stage);

  var seriesData = [
    ["P1", 10, 1.2],
    ["P2", 20, 1.3],
    ["P3", 30, 1.5],
    ["P4", 25, -1.6],
    ["P5", 11, 1.4],
    ["P6", 11, 1.8],
    ["P7", 5, 1.05]
  ];

  var seriesSettings = {
    fill: {
      keys: [
        "rgb(29,139,209) 0.9",
        "rgb(22,106,160) 0.9"
      ],
      angle: -90
    },
    stroke: 'rgb(19,93,140)',
    'hover.fill': {
      keys: [
        'rgb(255,255,255) .9',
        'rgb(114,114,114) .9'
      ],
      angle: -90
    },
    'hover.stroke': 'rgb(36,36,36)'
  };


//  var xScales = [
//      new anychart.scales.Linear(),
//      new anychart.scales.Linear(),
//      new anychart.scales.Linear(),
//      new anychart.scales.Linear(),
//      new anychart.scales.Linear(),
//      new anychart.scales.Linear()
//  ];
//
//  var yScales = [
//    new anychart.scales.Ordinal(),
//    new anychart.scales.Ordinal(),
//    new anychart.scales.Ordinal(),
//    new anychart.scales.Ordinal(),
//    new anychart.scales.Ordinal(),
//    new anychart.scales.Ordinal()
//  ];

  var plot1 = new anychart.cartesian.Plot().width('32%').height('50%').top('10%').left(0);
  var plot2 = new anychart.cartesian.Plot().width('32%').height('50%').top('10%').left('33%');
  var plot3 = new anychart.cartesian.Plot().width('32%').height('50%').top('10%').left('66%');

  var plot4 = new anychart.cartesian.Plot().width('32%').height('50%').top('61%').left(0);
  var plot5 = new anychart.cartesian.Plot().width('32%').height('50%').top('61%').left('36%');
  var plot6 = new anychart.cartesian.Plot().width('32%').height('50%').top('61%').left('66%');


// SERIES
  plot1.addSeries(new anychart.cartesian.series.Bar(seriesData, seriesSettings));
  plot2.addSeries(new anychart.cartesian.series.Area(seriesData, seriesSettings));
  plot3.addSeries(new anychart.cartesian.series.Bar(seriesData, seriesSettings));

  plot4.addSeries(new anychart.cartesian.series.Spline(seriesData, seriesSettings));
  plot5.addSeries(new anychart.cartesian.series.Bubble(seriesData, seriesSettings).minimumSize(5).maximumSize(10).tooltip(new anychart.elements.Tooltip().format(function(series) {
    return 'Value: ' + series.data().getDataRowProperty('size');
  })).displayNegative(true).negativeColor(function(bubble) {
        bubble.fill('yellow').stroke('5 black')
      }));
  plot6.addSeries(new anychart.cartesian.series.Area(seriesData, seriesSettings));


//-----------------
//   Setting like AnyChart defaults
//-----------------

  var xAxis1 = new anychart.cartesian.Axis()
      .orientation('bottom')
      .title('');
  var xAxis2 = new anychart.cartesian.Axis()
      .orientation('bottom')
      .title('');
  var xAxis3 = new anychart.cartesian.Axis()
      .orientation('bottom')
      .title('');
  var xAxis4 = new anychart.cartesian.Axis()
      .orientation('bottom')
      .title('');
  var xAxis5 = new anychart.cartesian.Axis()
      .orientation('bottom')
      .title('');
  var xAxis6 = new anychart.cartesian.Axis()
      .orientation('bottom')
      .title('');

//  xAxis.labels()
//      .fontSize(11)
//      .fontFamily('Tahoma');

  plot1.addXAxis(xAxis1);
  plot2.addXAxis(xAxis2);
  plot3.addXAxis(xAxis3);
  plot4.addXAxis(xAxis4);
  plot5.addXAxis(xAxis5);
  plot6.addXAxis(xAxis6);

  var yAxis1 = new anychart.cartesian.Axis()
      .orientation('left')
      .title('');

  var yAxis2 = new anychart.cartesian.Axis()
      .orientation('left')
      .title('');

  var yAxis3 = new anychart.cartesian.Axis()
      .orientation('left')
      .title('');

  var yAxis4 = new anychart.cartesian.Axis()
      .orientation('left')
      .title('');

  var yAxis5 = new anychart.cartesian.Axis()
      .orientation('left')
      .title('');

  var yAxis6 = new anychart.cartesian.Axis()
      .orientation('left')
      .title('');

//  yAxis.labels()
//      .fontSize(11)
//      .fontFamily('Tahoma');

  plot1.addYAxis(yAxis1);
  plot2.addYAxis(yAxis2);
  plot3.addYAxis(yAxis3);
  plot4.addYAxis(yAxis4);
  plot5.addYAxis(yAxis5);
  plot6.addYAxis(yAxis6);


// GRID
  var xGrid = function () {
    return new anychart.cartesian.elements.Grid()
        .direction('vertical')
        .line('1 rgb(193,193,193)')
        .drawLastLine(true);
  }

  plot1.addGrid(xGrid());
  plot2.addGrid(xGrid());
  plot3.addGrid(xGrid());
  plot4.addGrid(xGrid());
  plot5.addGrid(xGrid());
  plot6.addGrid(xGrid());

  var yGrid = function () {
    return new anychart.cartesian.elements.Grid()
        .direction('horizontal')
        .line('1 rgb(193,193,193)')
        .oddFill('rgb(245,245,245) 0.5')
        .evenFill('rgb(255,255,255) 0.5');
  }

  plot1.addGrid(yGrid());
  plot2.addGrid(yGrid());
  plot3.addGrid(yGrid());
  plot4.addGrid(yGrid());
  plot5.addGrid(yGrid());
  plot6.addGrid(yGrid());

// CHART TITLE
  chart.title()
      .height(30)
      .vAlign('middle')
      .text('Multiple Charts in Dashboard Mode')
      .fontWeight('bold')
      .fontSize(11)
      .fontFamily('Tahoma');


// PLOT MARGIN
//var plot = chart.getPlots()[0];
//plot.width('96%').left('2%').height('98%');

// BACKGROUND
  chart.background(new anychart.elements.Background()
      .stroke('2 rgb(36,102,177)')
      .corners(10)
      .fill({
        keys: [
          "rgb(255,255,255) 1",
          "rgb(243,243,243) 1",
          "rgb(255,255,255) 1"
        ],
        angle: -90
      })
  );

// ADD PLOTS
  chart.addPlot(plot1);

  chart.addPlot(plot2);

  chart.addPlot(plot3);

  chart.addPlot(plot4);

  chart.addPlot(plot5);

  chart.addPlot(plot6);

// DRAW
  chart.draw();
}
