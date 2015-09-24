var chart, series, charts = [], stage, interactivity;
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

anychart.onDocumentReady(function() {
  interactivity = {
    'selectionMode': anychart.enums.SelectionMode.MULTI_SELECT,
    'hoverMode': anychart.enums.HoverMode.BY_SPOT,
    'spotRadius': 30
  };
  var hoverElem = document.getElementById((String(interactivity.hoverMode)).toLowerCase());
  if (hoverElem) hoverElem.checked = true;
  var selectElem = document.getElementById((String(interactivity.selectionMode)).toLowerCase());
  if (selectElem) selectElem.checked = true;

  var applyToSeries = function(s, opt_markerSeries) {
    if (opt_markerSeries) {
      s.hoverFill('yellow');
      s.selectSize(s.hoverSize() + 2).selectType('star10').selectFill('red');
    } else {
      s.markers(true);
      //s.hoverMarkers().size(20).type('star5');
      s.hoverMarkers().fill('yellow');
      s.selectMarkers().size(s.hoverMarkers().size() + 2).type('star10').fill('red');
      //s.hoverStroke('4 red');
      //s.selectStroke('10 yellow');

      //s.listen('mouseMove', function(e) {console.log(e.type, e)});
      //s.listen('mouseOut', function(e) {console.log(e.type, e)});
      //s.listen('pointMouseMove', function(e) {console.log(e.type, e)});
      //s.markers().listen('mouseMove', function(e) {console.log(e.type, e)});
      //s.markers().listen('mouseOut', function(e) {console.log(e.type, e)});
    }
  };
  /**
   * @param {anychart.core.Chart} chart
   */
  var applyToChart = function(chart) {
    chart.margin(0);
    chart.padding(0);

    if (chart.getType() != 'map') {
      // turn on grids
      chart.grid().enabled(true);
      chart.grid(1).enabled(true).layout('vertical');
      //chart.minorGrid().enabled(true);
      //chart.minorGrid(1).enabled(true).layout('vertical');

      // set chart axes settings
      //var scale = anychart.scales.linear();
      //chart.xScale(scale);
      //chart.xAxis().minorTicks(true);
      //chart.yAxis().minorTicks(true);

      chart.xAxis().enabled(true);
      chart.yAxis().enabled(true);
    }

    //set chart legend settings
    chart.background(false);
    chart.legend(true);

    chart.listen('mouseMove', function(event) {
      if (event['target'].paginator)
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
          angle += this.startAngle();

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

    chart.listen('pointsHover', function(e) {
      console.log(e.seriesStatus);
    });

    //chart.listen('pointsselect', function(e) {console.log(e.type, e.seriesStatus, e.seriesStatus[0] ? e.seriesStatus[0].lastPoint : e.seriesStatus)});

    chart.interactivity(interactivity);
    chart.container(stage).draw();

    charts.push(chart);
  };

  var seriesCount = 5;
  var pointsCount = 10;
  var dataForDataSet = [];
  var i, j;
  for (i = 0; i < pointsCount; i++) {
    var data = [];
    data.push(i);
    for (j = 0; j < seriesCount; j++) {
      data.push(randomExt(-100, 100));
    }
    dataForDataSet.push(data);
  }
  var dataSet = anychart.data.set(dataForDataSet);
  var s;

  var stage = acgraph.create('container');


  //--------------------------------------------------------------------------------------------------------------------

  chart = anychart.cartesian();
  chart.bounds(0, 0, '25%', '30%');

  var dataForCartesian = dataForDataSet.slice();
  for (i = 0; i < dataForCartesian.length; i++) {
    dataForCartesian[i][0] = 'a' + i;
    if (i == 2) dataForCartesian[i][1] = NaN;
  }
  var dataSetCartesian = anychart.data.set(dataForCartesian);

  s = chart.column(dataSetCartesian.mapAs({x: [0], value: [1]}));
  applyToSeries(s);
  s = chart.column(dataSetCartesian.mapAs({x: [0], value: [2]}));
  applyToSeries(s);
  s = chart.spline(dataSetCartesian.mapAs({x: [0], value: [3]}));
  applyToSeries(s);
  s = chart.area(dataSetCartesian.mapAs({x: [0], value: [4]}));
  applyToSeries(s);
  s = chart.marker(dataSetCartesian.mapAs({x: [0], value: [5]}));
  applyToSeries(s, true);
  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------

  chart = anychart.polar();
  chart.bounds('25%', 0, '25%', '30%');

  s = chart.line([
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, NaN],
    [0, 6],
    [1, 7],
    [2, 8],
    [3, NaN],
    [4, 10],
    [0, 11],
    [1, 12],
    [2, NaN],
    [3, 14],
    {x: 4, value: 15, selected: true},
    [0, 16],
    [1, NaN],
    [2, 18],
    [3, 19],
    [4, 20]
  ]);
  applyToSeries(s);
  s.labels().enabled(true);

  s = chart.marker([
    [0.5, 1],
    [1.5, 2],
    [2.5, 3],
    [3.5, 4],
    [4.5, NaN],
    [0.5, 6],
    {x: 1.5, value: 7, selected: true},
    [2.5, 8],
    [3.5, NaN],
    [4.5, 10],
    [0.5, 11],
    [1.5, 12],
    [2.5, NaN],
    [3.5, 14],
    [4.5, 15],
    [0.5, 16],
    [1.5, NaN],
    [2.5, 18],
    [3.5, 19],
    [4.5, 20]
  ]);
  applyToSeries(s, true);
  s.labels().enabled(true);

  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------

  chart = anychart.radar();
  chart.bounds('50%', 0, '25%', '30%');

  s = chart.line([
    [1, NaN],
    [2, 18],
    [3, 19],
    [4, NaN],
    [5, 25],
    [6, 15],
    [7, 14]
  ]);

  applyToSeries(s);

  s = chart.marker([
    [1, 20],
    [2, 24],
    [3, 29],
    [4, NaN],
    [5, 20],
    [6, 21],
    [7, 19]
  ]);

  applyToSeries(s, true);

  s = chart.area([
    [1, NaN],
    [2, 7],
    [3, 12],
    [4, NaN],
    [5, 9],
    [6, 10],
    [7, 11]
  ]);
  applyToSeries(s);

  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------

  chart = anychart.scatter();
  chart.bounds('75%', 0, '25%', '30%');

  s = chart.line([[0, 5],[1, 6],[2, 3],[3, 9],[2, 10],[1, 8],[2, 5],[3, 2],[4, 5],[5, 6],[6, 9]]);
  applyToSeries(s);
  s = chart.marker([[0, 1],[1, 3],[2, 6],[3, 10],[4, 6],[5, 1],[4, 9],[5, 8],[6, 3],[7, 4],[8, 8]]);
  applyToSeries(s, true);
  s = chart.bubble([[0, -1, 2],[1, -3, 5],[2, -6, 7],[3, -10, 4],[4, -6, 5],[5, -1, 4],[4, -9, 7],[5, -8, 3],[6, -3],[7, -4, 4],[8, -8, 6]]);
  applyToSeries(s);
  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------

  chart = anychart.cartesian();
  chart.bounds(0, '30%', '25%', '30%');

  var scale = anychart.scales.linear();
  chart.xScale(scale);
  chart.xAxis().minorTicks(true);
  chart.minorGrid(1).enabled(true).layout('vertical');

  s = chart.column(dataSet.mapAs({x: [0], value: [1]}));
  applyToSeries(s);
  s = chart.column(dataSet.mapAs({x: [0], value: [2]}));
  applyToSeries(s);
  s = chart.spline(dataSet.mapAs({x: [0], value: [3]}));
  applyToSeries(s);
  s = chart.area(dataSet.mapAs({x: [0], value: [4]}));
  applyToSeries(s);
  s = chart.marker(dataSet.mapAs({x: [0], value: [5]}));
  applyToSeries(s, true);

  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------
  chart = anychart.box();
  chart.bounds('25%', '30%', '25%', '30%');
  chart.xAxis().staggerMode(true);

  var dataForBox = [
    {x: 'Registered Nurse', low: 20000, q1: 26000, median: 27000, q3: 32000, high: 38000, outliers: [50000, 52000]},
    {x: 'Dental Hygienist', low: NaN, q1: 28000, median: 32000, q3: 38000, high: 42000, outliers: [48000]},
    {x: 'Computer Systems Analyst', low: 40000, q1: 49000, median: 62000, q3: 73000, high: 88000, outliers: [32000, 29000, 106000]},
    {x: 'Physical Therapist', low: 52000, q1: 59000, median: 65000, q3: 74000, high: 83000, outliers: [91000]},
    {x: 'Software Developer', low: 45000, q1: 54000, median: 66000, q3: 81000, high: 97000, outliers: [120000]},
    {x: 'Information Security Analyst', low: 47000, q1: 56000, median: 69000, q3: 85000, high: 100000, outliers: [110000, 115000, 32000]},
    {x: 'Nurse Practitioner', low: 64000, q1: 74000, median: 83000, q3: 93000, high: 100000, outliers: [110000]},
    {x: 'Physician Assistant', low: 67000, q1: 72000, median: 84000, q3: 95000, high: 110000, outliers: [57000, 54000]},
    {x: 'Dentist', low: 75000, q1: 99000, median: 123000, q3: 160000, high: 210000, outliers: [220000, 70000]},
    {x: 'Physician', low: 58000, q1: 96000, median: 130000, q3: 170000, high: 200000, outliers: [42000, 210000, 215000]}
  ];

  s = chart.box(dataForBox);
  s.whiskerWidth('20%');

  applyToSeries(s);

  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------

  chart = anychart.cartesian();
  chart.bounds('50%', '30%', '25%', '30%');

  s = chart.candlestick([
    {x: 0, open: 4, high: 7, low: 3, close: 5},
    {x: 1, open: 5, high: 8, low: 4, close: 6},
    {x: 2, open: 6, high: 15, low: 5, close: 10},
    {x: 3, open: 10, high: 11, low: 4, close: 6},
    {x: 4, open: 6, high: 9, low: 2, close: 4},
    {x: 5, open: 4, high: 5, low: -1, close: 0},
    {x: 6, open: 0, high: 5, low: -5, close: -3},
    {x: 7, open: -3, high: 0, low: -10, close: -8}
  ]);

  applyToSeries(s);

  s = chart.ohlc([
    {x: 7, open: 4, high: 7, low: 3, close: 5},
    {x: 6, open: 5, high: 8, low: 4, close: 6},
    {x: 5, open: 6, high: 15, low: 5, close: 10},
    {x: 4, open: 10, high: 11, low: 4, close: 6},
    {x: 3, open: 6, high: 9, low: 2, close: 4},
    {x: 2, open: 4, high: 5, low: -1, close: 0},
    {x: 1, open: 0, high: 5, low: -5, close: -3},
    {x: 0, open: -3, high: 0, low: -10, close: -8}
  ]);

  applyToSeries(s);
  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------

  chart = anychart.cartesian();
  chart.bounds('75%', '30%', '25%', '30%');


  var sets = [];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (j = 0; j < 4; j++) {
    var set_ = [];
    for (i = 0; i < 12; i++) {
      var low, high;
      if (j == 0) {
        low = randomExt(100, 600);
        high = randomExt(low, low + 200);
      } else {
        low = sets[j - 1][i].high + 100;
        high = randomExt(low, low + 200);
      }
      set_.push({low: low, high: high, month: months[i]});
    }
    sets.push(set_);
  }

  var dataForRange1 = anychart.data.set(sets[0]).mapAs(null, {x: ['month']});
  var dataForRange2 = anychart.data.set(sets[1]).mapAs(null, {x: ['month']});
  var dataForRange3 = anychart.data.set(sets[2]).mapAs(null, {x: ['month']});
  var dataForRange4 = anychart.data.set(sets[3]).mapAs(null, {x: ['month']});

  s = chart.rangeStepArea(dataForRange1);
  applyToSeries(s);
  s = chart.rangeSplineArea(dataForRange2);
  applyToSeries(s);
  s = chart.rangeColumn(dataForRange3);
  applyToSeries(s);
  s = chart.rangeStepArea(dataForRange4);
  applyToSeries(s);


  applyToChart(chart);

  //--------------------------------------------------------------------------------------------------------------------

  var dataSetForMap = anychart.data.set([
    {id: 'US-MN', name: "Minnesota", 'value': 8.4},
    {id: 'US-MT', name: "Montana", 'value': 8.5},
    {id: 'US-ND', name: "North Dakota", 'value': 5.1},
    {id: 'US-ID', name: "Idaho", 'value': 8.0},
    {id: 'US-WA', name: "Washington", 'value': 13.1},
    {id: 'US-AZ', name: "Arizona", 'value': 9.7},
    {id: 'US-CA', name: "California", 'value': 14.0},
    {id: 'US-CO', name: "Colorado", 'value': 8.7},
    {id: 'US-NV', name: "Nevada", 'value': 14.7},
    {id: 'US-NM', name: "New Mexico", 'value': 6.9},
    {id: 'US-OR', name: "Oregon", 'value': 12.2},
    {id: 'US-UT', name: "Utah", 'value': 3.2},
    {id: 'US-WY', name: "Wyoming", 'value': 5.2},
    {id: 'US-AR', name: "Arkansas", 'value': 4.2},
    {id: 'US-IA', name: "Iowa", 'value': 4.7},
    {id: 'US-KS', name: "Kansas", 'value': 3.2},
    {id: 'US-MO', name: "Missouri", 'value': 7.2},
    {id: 'US-NE', name: "Nebraska", 'value': 5.0},
    {id: 'US-OK', name: "Oklahoma", 'value': 4.5},
    {id: 'US-SD', name: "South Dakota", 'value': 5.0},
    {id: 'US-LA', name: "Louisiana", 'value': 5.7},
    {id: 'US-TX', name: "Texas", 'value': 5.0},
    {id: 'US-CT', name: "Connecticut", 'value': 14.4, labels: false},
    {id: 'US-MA', name: "Massachusetts", 'value': 16.9, labels: false},
    {id: 'US-NH', name: "New Hampshire", 'value': 19.6},
    {id: 'US-RI', name: "Rhode Island", 'value': 14.0, labels: false},
    {id: 'US-VT', name: "Vermont", 'value': 17.5},
    {id: 'US-AL', name: "Alabama", 'value': 6.0},
    {id: 'US-FL', name: "Florida", 'value': 12.4},
    {id: 'US-GA', name: "Georgia", 'value': 5.9},
    {id: 'US-MS', name: "Mississippi", 'value': 2.8},
    {id: 'US-SC', name: "South Carolina", 'value': 6.1},
    {id: 'US-IL', name: "Illinois", 'value': 10.2},
    {id: 'US-IN', name: "Indiana", 'value': 6.1},
    {id: 'US-KY', name: "Kentucky", 'value': 3.9},
    {id: 'US-NC', name: "North Carolina", 'value': 6.6},
    {id: 'US-OH', name: "Ohio", 'value': 7.2},
    {id: 'US-TN', name: "Tennessee", 'value': 5.4},
    {id: 'US-VA', name: "Virginia", 'value': 10.7},
    {id: 'US-WI', name: "Wisconsin", 'value': 9.1},
    {id: 'US-WY', name: "Wyoming", 'value': 5.2, labels: false},
    {id: 'US-WV', name: "West Virginia", 'value': 2.4},
    {id: 'US-DE', name: "Delaware", 'value': 13.5, labels: false},
    {id: 'US-DC', name: "District of Columbia", 'value': 25.7, labels: false},
    {id: 'US-MD', name: "Maryland", 'value': 8.9, labels: false},
    {id: 'US-NJ', name: "New Jersey", 'value': 14.9, labels: false},
    {id: 'US-NY', name: "New York", 'value': 11.9},
    {id: 'US-PA', name: "Pennsylvania", 'value': 5.6},
    {id: 'US-ME', name: "Maine", 'value': 10.4},
    {id: 'US-MI', name: "Michigan", 'value': 7.6}
  ]);

  var map = anychart.map();
  map.bounds('0', '60%', '50%', '40%');

  //set map Geo data
  map.geoData(anychart.maps.usa_mainland);

  var colorRange = map.colorRange();
  colorRange.enabled(true);
  colorRange.labels().padding(3);
  colorRange.stroke('#B9B9B9');
  colorRange.ticks().stroke('#B9B9B9').position('outside').length(10).enabled(true);
  colorRange.minorTicks().stroke('#B9B9B9').position('outside').length(5).enabled(true);
  colorRange.marker().fill('#545f69').offsetY(0);

  series = map.choropleth(dataSetForMap);
  series.labels(false);
  series.geoIdField('iso_3166_2');
  series.colorScale(anychart.scales.linearColor('#c2e9fb', '#81d4fa', '#01579b', '#002746'));

  applyToSeries(series);
  applyToChart(map);

  //--------------------------------------------------------------------------------------------------------------------

  map = anychart.map();
  map.bounds('50%', '60%', '50%', '40%');

  //set map Geo data
  map.geoData(anychart.maps.usa_mainland);

  colorRange = map.colorRange();
  colorRange.enabled(true);
  colorRange.labels().padding(3);
  colorRange.stroke('#B9B9B9');
  colorRange.ticks().stroke('#B9B9B9').position('outside').length(10).enabled(true);
  colorRange.minorTicks().stroke('#B9B9B9').position('outside').length(5).enabled(true);
  colorRange.marker().fill('#545f69').offsetY(0);

  series = map.choropleth(dataSetForMap);
  series.labels(false);
  series.geoIdField('iso_3166_2');
  series.markers().fill('red');

  scale = anychart.scales.ordinalColor();
  scale.ranges([{less: 3}, {from: 3, to: 5}, {from: 5, to: 9}, {from: 9, to: 15}, {greater: 15}]);
  scale.colors(anychart.color.singleHueProgression('green', 5));

  series.colorScale(scale);

  applyToSeries(series);
  applyToChart(map);

  //map.legend().enabled(true).itemsSourceMode(anychart.enums.LegendItemsSourceMode.DEFAULT);
  map.legend().enabled(true).itemsSourceMode(anychart.enums.LegendItemsSourceMode.CATEGORIES);

  //map.listen('pointshover', function(e) {console.log(e.type, e.seriesStatus[0], e.seriesStatus[0].lastPoint.index)});
  //map.listen('pointsselect', function(e) {console.log(e.type,e.seriesStatus[0], e.seriesStatus[0] ? e.seriesStatus[0].lastPoint.index : e.seriesStatus)});

  //--------------------------------------------------------------------------------------------------------------------
});