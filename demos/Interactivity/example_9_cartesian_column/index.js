var chart, stage, series, series1, series2, series3, interactivity, charts = [];

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var changeHoverMode = function(value) {
  for (var i = 0; i < charts.length; i++) {
    charts[i].interactivity(value);
  }
  interactivity.hoverMode = value;
};

var changeSelectionMode = function(value) {
  interactivity.selectionMode = value;
  for (var i = 0; i < charts.length; i++) {
    charts[i].interactivity(interactivity);
  }
  interactivity.selectionMode = value;
};

anychart.onDocumentReady(function () {
  chart = anychart.column();
  charts.push(chart);

  interactivity = {
    'selectionMode': anychart.enums.SelectionMode.MULTI_SELECT,
    'hoverMode': anychart.enums.HoverMode.BY_X,
    'spotRadius': 160
  };

  var hoverElem = document.getElementById((String(interactivity.hoverMode)).toLowerCase());
  if (hoverElem) hoverElem.checked = true;
  var selectElem = document.getElementById((String(interactivity.selectionMode)).toLowerCase());
  if (selectElem) selectElem.checked = true;

  chart.interactivity(interactivity);

  var seriesCount = 5;
  var pointsCount = 10;
  var dataForDataSet = [];
  var i, j;
  for (i = 0; i < pointsCount; i++) {
    var data = [];
    data.push(i);
    for (j = 0; j < seriesCount; j++) {
      data.push(randomExt(50, 100));
    }
    dataForDataSet.push(data);
  }

  var dataForCartesian = dataForDataSet.slice();
  for (i = 0; i < dataForCartesian.length; i++) {
    dataForCartesian[i][0] = 'a' + i;
  }

  series = chart.area([4, 6, 7, 3, 1, -8, -9]);
  series.select();
  series1 = chart.line([-4, -6, -7, -3, -1, 8, 9]);
  series2 = chart.column([7, 3, 5, -5, -6, 2, 4]).markers(true).selectMarkers({type: 'star5', size: 10});
  series3 = chart.column([7, 3, 5, -5, -6, 2, 4]).markers(true).selectMarkers({type: 'star5', size: 10});
  series3.select();

  chart.container('container').draw();

  //chart.listen('pointMouseOver', function(e) {console.log('%c' + e.type, "color:blue;");});
  //
  //chart.listen('pointMouseOut', function(e) {console.log('%c' + e.type, "color:blue; background: #eee; font-size: 13px;");});
  //
  //chart.listen('pointMouseMove', function(e) {console.log('%c' + e.type, "color:#ccc;");});
  //
  //chart.listen('pointMouseDown', function(e) {console.log('%c' + e.type, "color:orange;");});
  //
  //chart.listen('pointMouseUp', function(e) {console.log('%c' + e.type, "color:orange; background: #eee;");});
  //
  //chart.listen('pointclick', function(e) {console.log('%c' + e.type, "color:red;");});
  //
  //chart.listen('pointdblclick', function(e) {console.log('%c' + e.type, "color:red; background: #eee;");});
  //
  //chart.listen('pointsselect', function(e) {console.log(e.currentPoint, e.seriesStatus);});
  //
  //chart.listen('pointshover', function(e) {console.log(e.currentPoint, e.seriesStatus);});
});
