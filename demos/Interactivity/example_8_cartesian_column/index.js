var chart, stage, series, series1, interactivity, charts = [];

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
    'hoverMode': anychart.enums.HoverMode.SINGLE,
    'spotRadius': 160
  };
  var hoverElem = document.getElementById((String(interactivity.hoverMode)).toLowerCase());
  if (hoverElem) hoverElem.checked = true;
  var selectElem = document.getElementById((String(interactivity.selectionMode)).toLowerCase());
  if (selectElem) selectElem.checked = true;
  chart.listen('mouseMove', function(event) {
    if (event['target'] instanceof anychart.core.ui.Legend)
      return;

    var interactivity = this.interactivity();

    if (interactivity.hoverMode() != 'bySpot')
      return;

    var spotRadius = interactivity.spotRadius();

    var clientX = event['clientX'];
    var clientY = event['clientY'];

    var container = $(this.container().getStage().container());
    var containerOffset = container.position();
    var scrollLeft = $(document).scrollLeft();
    var scrollTop = $(document).scrollTop();

    var x = clientX - (containerOffset.left - scrollLeft);
    var y = clientY - (containerOffset.top - scrollTop);

    if (this.getType() == 'polar' || this.getType() == 'radar') {
      var dataBounds = this.xAxis().getRemainingBounds();
      var radius = Math.min(dataBounds.width, dataBounds.height) / 2;
      var cx = Math.round(dataBounds.left + dataBounds.width / 2);
      var cy = Math.round(dataBounds.top + dataBounds.height / 2);

      var clientRadius = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2));

      if (clientRadius > radius) {
        if (this.spotCircle)
          this.spotCircle.parent(null);
        if (this.centerLine) this.centerLine.clear();
        if (this.leftLine) this.leftLine.clear();
        if (this.rightLine) this.rightLine.clear();
        return null;
      }

      if (!this.spotCircle)
        this.spotCircle = anychart.graphics.circle()
            .radius(spotRadius)
            .zIndex(1000)
            .stroke('black .5');

      if (!this.spotCircle.hasParent())
        this.spotCircle.parent(this.container());

      this.spotCircle.centerX(x).centerY(y);

      if (!this.centerLine)
        this.centerLine = this.container().path().zIndex(1000).stroke('black .2').disablePointerEvents(true);
      this.centerLine.clear().moveTo(cx, cy).lineTo(x, y);

      var dx, dy, angle;
      var leftSideRatio, rightSideRatio;
      if (clientRadius - spotRadius >= 0) {
        dx = cx - x;
        dy = cy - y;

        angle = Math.atan(dx / dy);
        if (angle <= 0)
          angle += Math.PI;
        if (dx < 0 || (angle == Math.PI && dy > 0))
          angle += Math.PI;
        angle += this.startAngle_;

        var dAngle = Math.asin(spotRadius / clientRadius);
        var leftSideAngle = angle + dAngle;
        var rightSideAngle = angle - dAngle;

        leftSideRatio = 1 - (leftSideAngle / (Math.PI * 2));
        rightSideRatio = 1 - (rightSideAngle / (Math.PI * 2));

        var leftA = (this.startAngle() - 90 + 360 * leftSideRatio) * Math.PI / 180;
        var rightA = (this.startAngle() - 90 + 360 * rightSideRatio) * Math.PI / 180;

        if (!this.leftLine) this.leftLine = this.container().path().zIndex(1000).stroke('black .2');
        this.leftLine.clear().moveTo(cx, cy).lineTo(cx + radius * Math.cos(leftA), cy + radius * Math.sin(leftA));

        if (!this.rightLine) this.rightLine = this.container().path().zIndex(1000).stroke('black .2');
        this.rightLine.clear().moveTo(cx, cy).lineTo(cx + radius * Math.cos(rightA), cy + radius * Math.sin(rightA));
      } else {
        if (this.leftLine) this.leftLine.clear();
        if (this.rightLine) this.rightLine.clear();
      }
    } else {
      var bounds = this.getPixelBounds();
      if (!bounds.contains({x: x, y: y})) {
        if (this.spotCircle)
          this.spotCircle.parent(null);
        return null;
      }

      if (!this.spotCircle)
        this.spotCircle = anychart.graphics.circle()
            .radius(spotRadius)
            .zIndex(1000)
            .stroke('black .5');

      if (!this.spotCircle.parent())
        this.spotCircle.parent(this.container());

      this.spotCircle.centerX(x).centerY(y);
    }
  });
  chart.listen('mouseOut', function(e) {
    if (!(this.getType() == 'polar' || this.getType() ==  'radar')) {
      if (this.spotCircle)
        this.spotCircle.parent(null);
    }
  });

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

  //dataForCartesian.push({x: 'a' + i, 'value': 200, 'selected': true});
  var dataSetCartesian = anychart.data.set(dataForCartesian);

  var title = chart.title();
  title.enabled(true);
  title.text(
      'Best sportsmen training data ' +
      '<br/><span  style="color:#929292; font-size: 12px;">(bubble size means duration, each bubble represents one training)</span>'
  ).padding([0, 0, 10, 0]).useHtml(true);

  chart.padding(20, 20, 10, 20);

  chart.grid().enabled(true);
  chart.grid(1).enabled(true).layout('vertical');
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true).layout('vertical');
  chart.minBubbleSize('1%');
  chart.maxBubbleSize('15%');

  chart.xAxis().title('Average pulse during training');
  chart.xAxis().minorTicks(true);
  chart.yAxis().title('Average power');
  chart.yAxis().minorTicks(true);

  chart.legend().enabled(true).padding().bottom(30);


  //series = chart.column([
  //  {value: 4, high: 3, low: 6, label: {fontSize: 20}},
  //  {value: 4, high: 7, low: 1, label: {fontColor: 'orange', fontSize: 20}},
  //  {value: 4, high: 4, low: 2, label: {fontDecoration: 'overline', fontSize: 20}},
  //  {value: 4, high: 8, low: 4, label: {fontStyle: 'italic', fontSize: 20, fontColor: 'red'}},
  //  {value: 4, high: 3, low: 8}
  //]);

  series = chart.rangeSplineArea([
    {high: 3, low: 6, label: {fontSize: 20}},
    {high: 5, low: 1, label: {fontColor: 'orange', fontSize: 20}},
    {high: 4, low: 7, label: {fontDecoration: 'overline', fontSize: 20}},
    {high: 8, low: 4, label: {fontStyle: 'italic', fontSize: 20, fontColor: 'red'}},
    {high: 3, low: 8}
  ]);

  series.labels()
      .enabled(true)
      .position('lefttop')
      .textFormatter(function(point) {
        return point.low;
      });

  //series = chart.line(dataSetCartesian.mapAs({x: [0], value: [2]}));
  //series
  //    .name('Christopher Sanchez')
  //    .hoverStroke('red')
  //    .selectStroke('green');
  //
  //series.markers()
  //    .enabled(true)
  //    .size(30)
  //    .position('top');
  //
  //series.hoverMarkers()
  //    .enabled(true)
  //    .size(30)
  //    .fill('red')
  //    .position('top');
  //
  //series.selectMarkers()
  //    .enabled(true)
  //    .size(30)
  //    .fill('green')
  //    .position('top');
  //
  //
  //series = chart.rangeArea(dataSetCartesian.mapAs({x: [0], high: [3], low: [4]}));
  //series
  //    .name('Christopher Sanchez')
  //    .hoverFill('red')
  //    .selectFill('green');
  //    //.hatchFill(true)
  //    //.hoverHatchFill('confetti')
  //    //.selectHatchFill('percent10');
  //series.selectHatchFill("zigZag", "#E0E0E0", 1, 20);
  //
  //series.select();
  //
  //series.markers()
  //    .enabled(true)
  //    .size(30)
  //    .position('top');
  //
  //series.hoverMarkers()
  //    .enabled(true)
  //    .size(30)
  //    .fill('red')
  //    .position('top');
  //
  //series.selectMarkers()
  //    .enabled(true)
  //    .size(30)
  //    .fill('green')
  //    .position('top');
  //
  chart.container('container').draw();


  //chart = anychart.cartesian();
  //
  //var line = chart.line([50, 25, 43]);
  //line
  //    .markers(true)
  //    .hoverMarkers('star5')
  //    .selectMarkers('star9')
  //    .hoverStroke('red')
  //    .selectStroke('green');
  //var area = chart.area([21, 10, 60]);
  //area
  //    .markers(true)
  //    .hoverMarkers('star5')
  //    .selectMarkers('star9')
  //    .hoverStroke('red')
  //    .selectStroke('green');
  //chart.legend(true);
  //chart.title(true);
  //var MyLegend = chart.legend();
  //MyLegend.listen('legenditemmousemove', function() {
  //  chart.title('You move mouse to legendItem');
  //});
  //chart.container('container').draw();


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
  //chart.listen('pointsselect', function(e) {console.log(e.seriesStatus);});
});
