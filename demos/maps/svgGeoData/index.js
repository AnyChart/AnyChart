var stage, map, chart, s1, s2, s3, s, axis, cs, cr;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;
var series, series2;
var showPreload = true;

function showPreloader() {
  if (showPreload)
    $('#container').append('<div id="loader-wrapper" class="anychart-loader"><div class="rotating-cover"><div class="rotating-plane"><div class="chart-row"><span class="chart-col green"></span><span class="chart-col orange"></span><span class="chart-col red"></span></div></div></div></div>');
}

function hidePreloader() {
  $('#loader-wrapper').remove();
  showPreload = false;
}

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var generateData = function() {
  var auChoroplethData = [];

  for (var i = 1, len = 9; i < len; i++) {
    auChoroplethData.push({'id': 'b' + i, 'value': 5000, 'size': randomExt(0, 10)});
  }

  for (var i = 1, len = 8; i < len; i++) {
    auChoroplethData.push({'id': 'ep' + i, 'value': 2000, 'size': randomExt(0, 10)});
  }

  for (var i = 1, len = 115; i < len; i++) {
    auChoroplethData.push({'id': 'e' + i, 'value': 1000, 'size': randomExt(0, 10)});
  }
  return auChoroplethData;
};

var dataSet = [
  ['Nail polish', 6814, 3054, 4376, 4229],
  ['Eyebrow pencil', 7012, 5067, 8987, 3932],
  ['Pomade', 8814, 9054, 4376, 9256]
];

var d = {
  'f': {state: 'Florida', number: 1},
  't': {state: 'Texas', number: 2},
  'a': {state: 'Arizona', number: 3},
  'n': {state: 'Nevada', number: 4}
};


var generateData2 = function(id) {
  var auChoroplethData = [];

  for (var i = 1, len = 4; i < len; i++) {
    var row = dataSet[i - 1];
    var category = row[0];
    var info = d[id];
    var value = row[info.number];
    var state = info.state;
    auChoroplethData.push({'id': id + i, 'value': value, 'category': category, 'state': state});
  }
  return auChoroplethData;
};

var drilldown = function(e) {
  var pointId = e.point.get('id');
  chart.zoomToFeature(pointId);
};

var createMap = function(name, id, callback) {
  // var dir = 'countries';
  // if (name == 'world')
  //   dir = 'custom';
  //
  // var url = 'http://cdn.anychart.com/geodata/1.1.0/' + dir + '/' + name + '/' + name + '.js';
  // var geoData = 'anychart.maps.' + name;

  $.ajax({
    type: 'GET',
    // url: 'test.svg',
    // url: 'chart.svg',
    // url: 'column.svg',
    url: 'pie.svg',
    // url: 'Boeing-737-300.svg',
    // url: 'Airbus-A380.svg',
    // dataType: 'text',
    beforeSend: function() {
      showPreload = true;
      setTimeout(showPreloader, 20);
    },
    success: function(data) {
      chart = anychart.map();
      chart.geoData(data);
      // chart.geoData('anychart.maps.australia');
      // chart.geoData('anychart.maps.world_source');
      chart.interactivity().zoomOnMouseWheel(true);
      chart.unboundRegions('asis');
      // chart.legend()
      //     .enabled(true)
      //     .position('right')
      //     .align('center')
      //     .itemsSourceMode('categories')
      //     .itemsLayout('vertical');

      // series = chart.choropleth(generateData(chart));

      var series1 = chart.choropleth(generateData2('f'));
      var series2 = chart.choropleth(generateData2('t'));
      var series3 = chart.choropleth(generateData2('a'));
      var series4 = chart.choropleth(generateData2('n'));


      var tooltipTextFormatter = function() {
        return this.getDataValue('state') + ': $' + this.value;
      };

      var tooltipTitleFormatter = function() {
        return this.getDataValue('category');
      };

      series1.tooltip().textFormatter(tooltipTextFormatter);
      series2.tooltip().textFormatter(tooltipTextFormatter);
      series3.tooltip().textFormatter(tooltipTextFormatter);
      series4.tooltip().textFormatter(tooltipTextFormatter);

      series1.tooltip().titleFormatter(tooltipTitleFormatter);
      series2.tooltip().titleFormatter(tooltipTitleFormatter);
      series3.tooltip().titleFormatter(tooltipTitleFormatter);
      series4.tooltip().titleFormatter(tooltipTitleFormatter);


      // series.tooltip().title(false);
      // series.tooltip().separator(false);
      // series.tooltip().textFormatter(function() {
      //   var class_ = 'Class: ';
      //   var r = /^[a-z]+/gi;
      //   switch (r.exec(this.id)[0]) {
      //     case 'b':
      //       class_ += 'First';
      //       break;
      //     case 'e':
      //       class_ += 'Economy';
      //       break;
      //     case 'ep':
      //       class_ += 'Economy plus';
      //       break;
      //   }
      //
      //   r = /\d+/gi;
      //   var number_ = 'Number: ' + r.exec(this.id)[0];
      //   var cost_ = 'Cost: ' + this.value + '$';
      //
      //   return number_ + '\n' + class_ + '\n' + cost_;
      // });

      // var scale = anychart.scales.ordinalColor();
      // scale.ranges([
      //   {'equal': 1000, 'color': '#64b5f6', 'name': 'Economy'},
      //   {'equal': 2000, 'color': '#1976d2', 'name': 'Economy Plus'},
      //   {'equal': 5000, 'color': '#455a64', 'name': 'First'}
      // ]);
      // series.colorScale(scale);
      chart.scale().gap(.005);
      chart.container(stage).draw();



      // var svg = document.getElementsByTagName('svg')[0];
      // console.log(svg);

      // chart1 = anychart.map();
      // chart1.geoData(svg);
      // chart1.unboundRegions('asis');
      // chart1.container(stage).draw();

      callback.call(chart, id, chart);
      hidePreloader();
    },
    error: function() {
      chart.zoomToFeature(id);
      hidePreloader();
    }
  });
};

$(document).ready(function() {
  var theme = anychart.theme();
  theme['map']['defaultSeriesSettings']['base']['fill'] = theme['chart']['defaultSeriesSettings']['barLike']['fill'];
  theme['map']['defaultSeriesSettings']['base']['hoverFill'] = theme['chart']['defaultSeriesSettings']['barLike']['hoverFill'];
  theme['map']['defaultSeriesSettings']['base']['selectFill'] = theme['chart']['defaultSeriesSettings']['base']['selectFill'];
  theme['map']['defaultSeriesSettings']['base']['stroke'] = theme['chart']['defaultSeriesSettings']['base']['stroke'];
  theme['map']['defaultSeriesSettings']['base']['hoverStroke'] = theme['chart']['defaultSeriesSettings']['base']['hoverStroke'];
  theme['map']['defaultSeriesSettings']['base']['selectStroke'] = theme['chart']['defaultSeriesSettings']['base']['selectStroke'];
  anychart.theme(theme);

  stage = anychart.graphics.create('container');

  createMap('name', 'id', function(id, map) {

  });
});
