// independent series
var bubble, rangeColumn, rangeBar, rangeStepSplineArea, rangeSplineArea, rangeArea;
//series in chart
var bubbleChart, rangeColumnChart, rangeBarChart, rangeStepAreaChart, rangeSplineAreaChart, rangeAreaChart;


function load() {
  var stage = acgraph.create('container', '100%', '100%');

  var data1 = [];
  var data2 = [];
  var d1 = [], d2 = [];
  var t1, t2;
  var vals = [];
  for (var i = 0; i < 20; i++) {
    if (t1 = (Math.random() > 0)) {
      d1.push(i);
      data1.push([
        i,
        Math.round(Math.random() * 1000) + 10,
        Math.round(Math.random() * 1000) - 500,
        Math.round(Math.random() * 1000) + 1000,
        Math.round(Math.random() * 1000) - 990,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    if (t2 = (Math.random() > 0.2)) {
      d2.push(i);
      data2.push([
        i,
        Math.round(Math.random() * 1000) + 10,
        Math.round(Math.random() * 1000) + 1000,
        Math.round(Math.random() * 1000) - 990,
        Math.round(Math.random() * 1000) + 10
      ]);
    }
    vals.push(i);
  }

  //independent series
  stage.text(0, 10, 'Independent series')
      .fontSize(20)
      .fontFamily('verdana')
      .width(620)
      .hAlign('center');

  bubble = new anychart.core.cartesian.series.Bubble(data1)
      .markers(null)
      .minimumSize(1)
      .maximumSize(20)
      .displayNegative(true);
  bubble.container(stage);
  bubble.bounds(0, 30, 200, 150);
  bubble.draw();
  bubble.listen('signal', function(e) {
    e.target.draw();
  });

  rangeArea = new anychart.core.cartesian.series.RangeArea(data2);
  rangeArea.markers(null);
  rangeArea.container(stage);
  rangeArea.bounds(210, 30, 200, 150);
  rangeArea.draw();
  rangeArea.listen('signal', function(e) {
    e.target.draw();
  });

  rangeSplineArea = new anychart.core.cartesian.series.RangeSplineArea(data2);
  rangeSplineArea.markers(null);
  rangeSplineArea.container(stage);
  rangeSplineArea.bounds(420, 30, 200, 150);
  rangeSplineArea.draw();
  rangeSplineArea.listen('signal', function(e) {
    e.target.draw();
  });

  rangeStepSplineArea = new anychart.core.cartesian.series.RangeStepArea(data2);
  rangeStepSplineArea.markers(null);
  rangeStepSplineArea.container(stage);
  rangeStepSplineArea.bounds(0, 190, 200, 150);
  rangeStepSplineArea.draw();
  rangeStepSplineArea.listen('signal', function(e) {
    e.target.draw();
  });

  rangeBar = new anychart.core.cartesian.series.RangeBar(data2);
  rangeBar.markers(null);
  rangeBar.container(stage);
  rangeBar.bounds(210, 190, 200, 150);
  rangeBar.draw();
  rangeBar.listen('signal', function(e) {
    e.target.draw();
  });

  rangeColumn = new anychart.core.cartesian.series.RangeColumn(data2);
  rangeColumn.markers(null);
  rangeColumn.container(stage);
  rangeColumn.bounds(420, 190, 200, 150);
  rangeColumn.draw();
  rangeColumn.listen('signal', function(e) {
    e.target.draw();
  });

  //series in chart
  stage.text(630, 10, 'Series in chart')
      .fontSize(20)
      .fontFamily('verdana')
      .width(620)
      .hAlign('center');

  bubbleChart = new anychart.charts.Cartesian();
  bubbleChart.container(stage);
  bubbleChart.bounds(630, 30, 200, 150);
  bubbleChart.title('Bubble chart');
  bubbleChart.bubble(data1)
      .minimumSize(5)
      .maximumSize(10)
      .markers(null);
  bubbleChart.draw();

  rangeAreaChart = new anychart.charts.Cartesian();
  rangeAreaChart.container(stage);
  rangeAreaChart.bounds(840, 30, 200, 150);
  rangeAreaChart.title('Range area chart');
  rangeAreaChart.title().fontSize(14);
  rangeAreaChart.rangeArea(data2).markers(null);
  rangeAreaChart.draw();

  rangeSplineAreaChart = new anychart.charts.Cartesian();
  rangeSplineAreaChart.container(stage);
  rangeSplineAreaChart.bounds(1050, 30, 200, 150);
  rangeSplineAreaChart.title('Range spline \n area chart');
  rangeSplineAreaChart.title().fontSize(14).hAlign('center');
  rangeSplineAreaChart.rangeSplineArea(data2).markers(null);
  rangeSplineAreaChart.draw();

  rangeStepAreaChart = new anychart.charts.Cartesian();
  rangeStepAreaChart.container(stage);
  rangeStepAreaChart.bounds(630, 190, 200, 150);
  rangeStepAreaChart.title('Range step line \n area chart');
  rangeStepAreaChart.title().fontSize(14).hAlign('center');
  rangeStepAreaChart.rangeStepArea(data2).markers(null);
  rangeStepAreaChart.draw();

  rangeBarChart = new anychart.charts.Cartesian();
  rangeBarChart.container(stage);
  rangeBarChart.bounds(840, 190, 200, 150);
  rangeBarChart.title('Range bar chart');
  rangeBarChart.title().fontSize(14).hAlign('center');
  rangeBarChart.rangeBar(data2).markers(null);
  rangeBarChart.draw();

  rangeColumnChart = new anychart.charts.Cartesian();
  rangeColumnChart.container(stage);
  rangeColumnChart.bounds(1050, 190, 200, 150);
  rangeColumnChart.title('Range bar chart');
  rangeColumnChart.title().fontSize(14).hAlign('center');
  rangeColumnChart.rangeColumn(data2).markers(null);
  rangeColumnChart.draw();


  //multiple series in chart
  stage.text(0, 370, 'Multiple series in chart')
      .fontSize(20)
      .fontFamily('verdana')
      .width(620)
      .hAlign('center');

  bubbleChart = new anychart.charts.Cartesian();
  bubbleChart.container(stage);
  bubbleChart.bounds(0, 400, 200, 150);
  bubbleChart.title('Bubble chart');
  bubbleChart.bubble(data1)
      .minimumSize(5)
      .maximumSize(10)
      .markers(null);
  bubbleChart.bubble(data2)
      .minimumSize(5)
      .maximumSize(10)
      .markers(null);
  bubbleChart.draw();

  rangeAreaChart = new anychart.charts.Cartesian();
  rangeAreaChart.container(stage);
  rangeAreaChart.bounds(210, 400, 200, 150);
  rangeAreaChart.title('Range area chart');
  rangeAreaChart.title().fontSize(14);
  rangeAreaChart.rangeArea(data2).markers(null);
  rangeAreaChart.rangeArea(data1).markers(null);
  rangeAreaChart.draw();

  rangeSplineAreaChart = new anychart.charts.Cartesian();
  rangeSplineAreaChart.container(stage);
  rangeSplineAreaChart.bounds(420, 400, 200, 150);
  rangeSplineAreaChart.title('Range spline \n area chart');
  rangeSplineAreaChart.title().fontSize(14).hAlign('center');
  rangeSplineAreaChart.rangeSplineArea(data2).markers(null);
  rangeSplineAreaChart.rangeSplineArea(data1).markers(null);
  rangeSplineAreaChart.draw();

  rangeStepAreaChart = new anychart.charts.Cartesian();
  rangeStepAreaChart.container(stage);
  rangeStepAreaChart.bounds(0, 590, 200, 150);
  rangeStepAreaChart.title('Range step line \n area chart');
  rangeStepAreaChart.title().fontSize(14).hAlign('center');
  rangeStepAreaChart.rangeStepArea(data2).markers(null);
  rangeStepAreaChart.rangeStepArea(data1).markers(null);
  rangeStepAreaChart.draw();

  rangeBarChart = new anychart.charts.Cartesian();
  rangeBarChart.container(stage);
  rangeBarChart.bounds(210, 590, 200, 150);
  rangeBarChart.title('Range bar chart');
  rangeBarChart.title().fontSize(14).hAlign('center');
  rangeBarChart.rangeBar(data2).markers(null);
  rangeBarChart.rangeBar(data1).markers(null);
  rangeBarChart.draw();

  rangeColumnChart = new anychart.charts.Cartesian();
  rangeColumnChart.container(stage);
  rangeColumnChart.bounds(420, 590, 200, 150);
  rangeColumnChart.title('Range bar chart');
  rangeColumnChart.title().fontSize(14).hAlign('center');
  rangeColumnChart.rangeColumn(data2).markers(null);
  rangeColumnChart.rangeColumn(data1).markers(null);
  rangeColumnChart.draw();


  //series in chart with axes
  stage.text(630, 10, 'Series in chart')
      .fontSize(20)
      .fontFamily('verdana')
      .width(620)
      .hAlign('center');

  bubbleChart = new anychart.charts.Cartesian();
  bubbleChart.container(stage);
  bubbleChart.bounds(630, 400, 200, 150);
  bubbleChart.title('Bubble chart');
  //bubbleChart.axis(0).orientation('left');
  //bubbleChart.axis(1).orientation('bottom');
  bubbleChart.bubble(data1)
      .minimumSize(5)
      .maximumSize(10)
      .markers(null);
  bubbleChart.draw();

  rangeAreaChart = new anychart.charts.Cartesian();
  rangeAreaChart.container(stage);
  rangeAreaChart.bounds(840, 400, 200, 150);
  rangeAreaChart.title('Range area chart');
  rangeAreaChart.title().fontSize(14);
  rangeAreaChart.axis().orientation('left');
  rangeAreaChart.axis().orientation('bottom');
  rangeAreaChart.rangeArea(data2).markers(null);
  rangeAreaChart.draw();

  rangeSplineAreaChart = new anychart.charts.Cartesian();
  rangeSplineAreaChart.container(stage);
  rangeSplineAreaChart.bounds(1050, 400, 200, 150);
  rangeSplineAreaChart.title('Range spline \n area chart');
  rangeSplineAreaChart.title().fontSize(14).hAlign('center');
  rangeSplineAreaChart.axis().orientation('left');
  rangeSplineAreaChart.axis().orientation('bottom');
  rangeSplineAreaChart.rangeSplineArea(data2).markers(null);
  rangeSplineAreaChart.draw();

  rangeStepAreaChart = new anychart.charts.Cartesian();
  rangeStepAreaChart.container(stage);
  rangeStepAreaChart.bounds(630, 590, 200, 150);
  rangeStepAreaChart.title('Range step line \n area chart');
  rangeStepAreaChart.title().fontSize(14).hAlign('center');
  rangeStepAreaChart.axis().orientation('left');
  rangeStepAreaChart.axis().orientation('bottom');
  rangeStepAreaChart.rangeStepArea(data2).markers(null);
  rangeStepAreaChart.draw();

  rangeBarChart = new anychart.charts.Cartesian();
  rangeBarChart.container(stage);
  rangeBarChart.bounds(840, 590, 200, 150);
  rangeBarChart.title('Range bar chart');
  rangeBarChart.title().fontSize(14).hAlign('center');
  rangeBarChart.axis().orientation('left');
  rangeBarChart.axis().orientation('bottom');
  rangeBarChart.rangeBar(data2).markers(null);
  rangeBarChart.draw();

  rangeColumnChart = new anychart.charts.Cartesian();
  rangeColumnChart.container(stage);
  rangeColumnChart.bounds(1050, 590, 200, 150);
  rangeColumnChart.title('Range bar chart');
  rangeColumnChart.title().fontSize(14).hAlign('center');
  rangeColumnChart.axis().orientation('left');
  rangeColumnChart.axis().orientation('bottom');
  rangeColumnChart.rangeColumn(data2).markers(null);
  rangeColumnChart.draw();
}
