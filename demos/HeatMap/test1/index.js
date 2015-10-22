var chart, dataSet, colorScale, chart1;

var randomExt = function (a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

function heatmapThickness(value) {
  chart.stroke(value + ' black');
}

function hGridThickness(value) {
  chart.grid(0).stroke(value + ' black');
}

function vGridThickness(value) {
  chart.grid(1).stroke(value + ' black');
}

function getThickness(stroke) {
  var res = stroke['thickness'];
  return stroke == 'none' ? 0 : (isNaN(res) || res == null ? 1 : res);
}

function labelsDisplayMode(value) {
  chart.labelsDisplayMode(value);
}

var min = 1000, max = 3000;
var columns = 15, rows = 10;

anychart.onDocumentReady(function () {
  var data = [];

  for (var i = 0; i < columns; i++) {
    for (var j = 0; j < rows; j++) {
      data.push([i, j, randomExt(min, max)]);
    }
  }

  dataSet = anychart.data.set(data);
  var heatMapData = dataSet.mapAs({x: [0], y: [1], heat: [2]});

  //heatMapData = [
  //  {row: "r0", column: "c0", value: "30"},
  //  {row: "r0", column: "c1", value: "28"},
  //  {row: "r0", column: "c2", value: "28"},
  //  {row: "r0", column: "c3", value: "30"},
  //  {row: "r0", column: "c4", value: "30"},
  //  {row: "r0", column: "c5", value: "29"},
  //  {row: "r0", column: "c6", value: "28"},
  //  {row: "r0", column: "c7", value: "26"},
  //  {row: "r0", column: "c8", value: "24"},
  //  {row: "r0", column: "c9", value: "23"},
  //  {row: "r0", column: "c10", value: "21"},
  //  {row: "r0", column: "c11", value: "20"},
  //  {row: "r0", column: "c12", value: "22"},
  //  {row: "r0", column: "c13", value: "22"},
  //  {row: "r0", column: "c14", value: "23"},
  //  {row: "r1", column: "c0", value: "22"},
  //  {row: "r1", column: "c1", value: "21"},
  //  {row: "r1", column: "c2", value: "22"},
  //  {row: "r1", column: "c3", value: "23"},
  //  {row: "r1", column: "c4", value: "22"},
  //  {row: "r1", column: "c5", value: "20"},
  //  {row: "r1", column: "c6", value: "18"},
  //  {row: "r1", column: "c7", value: "18"},
  //  {row: "r1", column: "c8", value: "20"},
  //  {row: "r1", column: "c9", value: "21"},
  //  {row: "r1", column: "c10", value: "22"},
  //  {row: "r1", column: "c11", value: "24"},
  //  {row: "r1", column: "c12", value: "26"},
  //  {row: "r1", column: "c13", value: "27"},
  //  {row: "r1", column: "c14", value: "29"},
  //  {row: "r2", column: "c0", value: "30"},
  //  {row: "r2", column: "c1", value: "28"},
  //  {row: "r2", column: "c2", value: "27"},
  //  {row: "r2", column: "c3", value: "27"},
  //  {row: "r2", column: "c4", value: "25"},
  //  {row: "r2", column: "c5", value: "23"},
  //  {row: "r2", column: "c6", value: "20"},
  //  {row: "r2", column: "c7", value: "18"},
  //  {row: "r2", column: "c8", value: "18"},
  //  {row: "r2", column: "c9", value: "20"},
  //  {row: "r2", column: "c10", value: "20"},
  //  {row: "r2", column: "c11", value: "18"},
  //  {row: "r2", column: "c12", value: "17"},
  //  {row: "r2", column: "c13", value: "18"},
  //  {row: "r2", column: "c14", value: "19"},
  //  {row: "r3", column: "c0", value: "20"},
  //  {row: "r3", column: "c1", value: "22"},
  //  {row: "r3", column: "c2", value: "20"},
  //  {row: "r3", column: "c3", value: "20"},
  //  {row: "r3", column: "c4", value: "19"},
  //  {row: "r3", column: "c5", value: "20"},
  //  {row: "r3", column: "c6", value: "22"},
  //  {row: "r3", column: "c7", value: "23"},
  //  {row: "r3", column: "c8", value: "24"},
  //  {row: "r3", column: "c9", value: "26"},
  //  {row: "r3", column: "c10", value: "24"},
  //  {row: "r3", column: "c11", value: "23"},
  //  {row: "r3", column: "c12", value: "20"},
  //  {row: "r3", column: "c13", value: "19"},
  //  {row: "r3", column: "c14", value: "16"},
  //  {row: "r4", column: "c0", value: "17"},
  //  {row: "r4", column: "c1", value: "15"},
  //  {row: "r4", column: "c2", value: "14"},
  //  {row: "r4", column: "c3", value: "13"},
  //  {row: "r4", column: "c4", value: "11"},
  //  {row: "r4", column: "c5", value: "9"},
  //  {row: "r4", column: "c6", value: "7"},
  //  {row: "r4", column: "c7", value: "8"},
  //  {row: "r4", column: "c8", value: "8"},
  //  {row: "r4", column: "c9", value: "7"},
  //  {row: "r4", column: "c10", value: "4"},
  //  {row: "r4", column: "c11", value: "6"},
  //  {row: "r4", column: "c12", value: "5"},
  //  {row: "r4", column: "c13", value: "6"},
  //  {row: "r4", column: "c14", value: "7"},
  //  {row: "r5", column: "c0", value: "6"},
  //  {row: "r5", column: "c1", value: "6"},
  //  {row: "r5", column: "c2", value: "4"},
  //  {row: "r5", column: "c3", value: "6"},
  //  {row: "r5", column: "c4", value: "6"},
  //  {row: "r5", column: "c5", value: "7"},
  //  {row: "r5", column: "c6", value: "10"},
  //  {row: "r5", column: "c7", value: "12"},
  //  {row: "r5", column: "c8", value: "12"},
  //  {row: "r5", column: "c9", value: "12"},
  //  {row: "r5", column: "c10", value: "10"},
  //  {row: "r5", column: "c11", value: "10"},
  //  {row: "r5", column: "c12", value: "13"},
  //  {row: "r5", column: "c13", value: "15"},
  //  {row: "r5", column: "c14", value: "16"},
  //  {row: "r6", column: "c0", value: "14"},
  //  {row: "r6", column: "c1", value: "12"},
  //  {row: "r6", column: "c2", value: "12"},
  //  {row: "r6", column: "c3", value: "9"},
  //  {row: "r6", column: "c4", value: "9"},
  //  {row: "r6", column: "c5", value: "8"},
  //  {row: "r6", column: "c6", value: "6"},
  //  {row: "r6", column: "c7", value: "4"},
  //  {row: "r6", column: "c8", value: "5"},
  //  {row: "r6", column: "c9", value: "6"},
  //  {row: "r6", column: "c10", value: "4"},
  //  {row: "r6", column: "c11", value: "3"},
  //  {row: "r6", column: "c12", value: "3"},
  //  {row: "r6", column: "c13", value: "3"},
  //  {row: "r6", column: "c14", value: "5"},
  //  {row: "r7", column: "c0", value: "3"},
  //  {row: "r7", column: "c1", value: "3"},
  //  {row: "r7", column: "c2", value: "1"},
  //  {row: "r7", column: "c3", value: "1"},
  //  {row: "r7", column: "c4", value: "2"},
  //  {row: "r7", column: "c5", value: "4"},
  //  {row: "r7", column: "c6", value: "5"},
  //  {row: "r7", column: "c7", value: "7"},
  //  {row: "r7", column: "c8", value: "8"},
  //  {row: "r7", column: "c9", value: "10"},
  //  {row: "r7", column: "c10", value: "12"},
  //  {row: "r7", column: "c11", value: "14"},
  //  {row: "r7", column: "c12", value: "15"},
  //  {row: "r7", column: "c13", value: "16"},
  //  {row: "r7", column: "c14", value: "19"},
  //  {row: "r8", column: "c0", value: "19"},
  //  {row: "r8", column: "c1", value: "20"},
  //  {row: "r8", column: "c2", value: "19"},
  //  {row: "r8", column: "c3", value: "18"},
  //  {row: "r8", column: "c4", value: "18"},
  //  {row: "r8", column: "c5", value: "17"},
  //  {row: "r8", column: "c6", value: "14"},
  //  {row: "r8", column: "c7", value: "12"},
  //  {row: "r8", column: "c8", value: "14"},
  //  {row: "r8", column: "c9", value: "15"},
  //  {row: "r8", column: "c10", value: "17"},
  //  {row: "r8", column: "c11", value: "19"},
  //  {row: "r8", column: "c12", value: "20"},
  //  {row: "r8", column: "c13", value: "19"},
  //  {row: "r8", column: "c14", value: "19"},
  //  {row: "r9", column: "c0", value: "19"},
  //  {row: "r9", column: "c1", value: "20"},
  //  {row: "r9", column: "c2", value: "20"},
  //  {row: "r9", column: "c3", value: "19"},
  //  {row: "r9", column: "c4", value: "20"},
  //  {row: "r9", column: "c5", value: "19"},
  //  {row: "r9", column: "c6", value: "20"},
  //  {row: "r9", column: "c7", value: "20"},
  //  {row: "r9", column: "c8", value: "20"},
  //  {row: "r9", column: "c9", value: "18"},
  //  {row: "r9", column: "c10", value: "17"},
  //  {row: "r9", column: "c11", value: "19"},
  //  {row: "r9", column: "c12", value: "18"},
  //  {row: "r9", column: "c13", value: "15"},
  //  {row: "r9", column: "c14", value: "15"}
  //];
  //chart = anychart.heatMap([
  //  {x: 0, y: 0, heat: -11},
  //  {x: 1, y: 1, heat: 11},
  //  {x: 2, y: 2, heat: 22},
  //  {x: 3, y: 3, heat: 33},
  //  {x: 4, y: 4, heat: 44},
  //  {x: 5, y: 5, heat: 55},
  //  {x: 6, y: 6, heat: 66},
  //  {x: 7, y: 7, heat: 77},
  //  {x: 8, y: 8, heat: 88},
  //  {x: 9, y: 9, heat: 99}
  //]);
  //chart = anychart.heatMap([
  //  {x: 0, y: 0, heat: NaN},
  //  {x: 0, y: 1, heat: 987654321},
  //  {x: 1, y: 1, heat: 123456789}
  //]);
  //chart.bounds(0,0,500,400);
  chart = anychart.heatMap([
    {y: 0, fill: 'green'},
    {y: 0, x: 7, fill: 'blue', heat: 453423},
    [1, 9],
    [1, 4, 23423],
    [7, 11, 'sdfsdf'],
    {column: 5, row: 7, value: 1234},
    {x: 3, y: 9, heat: 1111111111111111},
    {column: 1, row: 7, fill: 'red'}
  ]);
  //chart = anychart.heatMap(heatMapData);

  //colorScale = anychart.scales.linearColor();
  //colorScale.ranges([
  //  {less: 1500},
  //  {from: 1500, to: 2000},
  //  {greater: 2000}
  //]);
  //colorScale.colors(anychart.color.blendedHueProgression('yellow', 'green', 10));


  //chart.colorScale(colorScale);
  //chart.stroke('0 black');
  //chart.fill('#eee');
  //chart.hoverStr  oke('0 black');
  //chart.hoverStroke('14 yellow');


  //chart.hatchFill('confetti');

  //chart.grid(0).stroke('10 green');
  //chart.grid(1).stroke('2 black');
  //chart.grid(2).layout('v').stroke('20 pink .9');
  //chart.grid(3).layout('v').stroke('2 black');

  chart.grid(0).stroke('0 black');
  chart.grid(1).layout('v').stroke('0 black');

  //chart.xAxis(null);
  //chart.yAxis(null);

  chart.title('Server fans monitoring');
  //chart.title().enabled(false);
  //chart.fill(null);

  //chart.markers({type: 'circle'});
  //chart.hoverMarkers({fill: 'red'});

  chart.labels()
    //.anchor('top')
    //  .adjustFontSize(false)
    //  .fontSize(50)
    //  .maxFontSize(55)
    //  .minFontSize(7)
      .enabled(true);

  //chart.hoverLabels()
  //    .maxFontSize(55)
  //    .minFontSize(7)
  //    .enabled(true);

  chart.labelsDisplayMode('drop');

  chart.legend()
  //    .itemsSourceMode('categories')
      .align('top')
      .position('right')
      .itemsLayout('v')
      .enabled(true);

  //chart.markers().type('star8').size(10).enabled(true);
  //chart.hoverMarkers().type('triangleUp').size(20);
  //chart.selectMarkers().type('triangleDown').size(20);

  chart.yAxis()
      .title('Server name')
      .enabled(true);
  chart.yAxis().labels().textFormatter(function () {
    return 'Server ' + this['tickValue'];
  });

  chart.xAxis()
      .title('Fan speed (rpm)')
      .enabled(true);
  chart.xAxis().labels().textFormatter(function () {
    return 'Fan ' + this['tickValue'];
  });

  //chart.xScale().values([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
  //chart.yScale().values([0,1,2,3,4,5,6,7,8,9]);

  //chart.interactivity().hoverMode('byX').spotRadius(130);

  //chart.xScroller(true);
  //chart.xZoom().setToPointsCount(8);
  //chart.yScroller(true);
  //chart.yZoom().setToPointsCount(4);

  chart.container('container').draw();

  var select1 = document.getElementById('labelsDisplayMode');
  select1.value = chart.labelsDisplayMode();

  var range1 = document.getElementById('heatmapThickness');
  range1.value = getThickness(chart.stroke());

  var range2 = document.getElementById('hGridThickness');
  range2.value = getThickness(chart.grid(0).stroke());

  var range3 = document.getElementById('vGridThickness');
  range3.value = getThickness(chart.grid(1).stroke());

  //chart.labels().listen('mouseout', function(e) {
  //  console.log('%c>>>> labels mouseout', "color: red; font-size: 14px");
  //});

  //setInterval(function () {
  //  var data = [];
  //
  //  for (var i = 0; i < columns; i++) {
  //    for (var j = 0; j < rows; j++) {
  //      data.push([i, j, randomExt(min, max)]);
  //    }
  //  }
  //
  //  dataSet.data(data);
  //}, 2000);

  //chart.serialize();


  //var json  = chart.toJson();
  //chart1 = anychart.fromJson(json).container('container').draw();
});
