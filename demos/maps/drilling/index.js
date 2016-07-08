var stage, map, chart, s1, s2, s3, s, axis, cs, cr;
var selectedRegions;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;
var series, series2;
var mapCache = {};
var showPreload = true;
var breadcrumbs, name;

var customMap;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var generateData = function(map, opt_min, opt_max) {
  var auChoroplethData = [];
  features = map.geoData()['features'];
  var min = opt_min !== void 0 ? opt_min : 1900;
  var max = opt_max !== void 0 ? opt_max : 2000;
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      id = feature['properties'][map.geoIdField()];
      auChoroplethData.push({'id': id, 'value': randomExt(min, max), 'size': randomExt(0, 10)});
    }
  }
  return auChoroplethData;
};


function showPreloader() {
  if (showPreload)
    $('#container').append('<div id="loader-wrapper" class="anychart-loader"><div class="rotating-cover"><div class="rotating-plane"><div class="chart-row"><span class="chart-col green"></span><span class="chart-col orange"></span><span class="chart-col red"></span></div></div></div></div>');
}

function hidePreloader() {
  $('#loader-wrapper').remove();
  showPreload = false;
}


var createMap = function(name, id, callback) {
  var dir, url, geoData;

  if (id.search(/US[.].+/g) != -1) {
    dir = 'usa_states';
  } else if (id.search(/CA[.].+/g) != -1) {
    dir = 'canada_states';
  } else {
    dir = 'countries';
    if (name == 'world') {
      dir = 'custom';
      name = 'world_source';
    }
  }
  name = name.replace('é', 'e');
  url = 'http://cdn.anychart.com/geodata/1.2.0/' + dir + '/' + name + '/' + name + '.js';
  geoData = 'anychart.maps.' + name;

  $.ajax({
    type: 'GET',
    url: url,
    beforeSend: function() {
      showPreload = true;
      setTimeout(showPreloader, 20);
    },
    success: function() {
      var map;

      map = anychart.map();
      map.crs(null);
      map.geoData(geoData);
      var series = map.choropleth(generateData(map));
      series.labels().enabled(true).textFormatter('{%incits}');
      callback.call(chart, id, map);

      hidePreloader();
    },
    error: function() {
      chart.zoomToFeature(id);
      hidePreloader();
    }
  });
};

var drilldown = function(e) {
  var pointId = e.point.get('id');
  var featureProp = e.point.getFeatureProp();

  var map = mapCache[pointId];
  if (map === void 0) {
    if (featureProp.iso_a3) {
      name = featureProp.admin.toLowerCase().replace(/\s/g, '_');
      createMap(name, pointId, function(id, map) {
        mapCache[id] = map;
        chart.drillTo(id, map);
      });
    } else {
      if (pointId.search(/US[.].+/g) != -1) {
        name = featureProp.name.toLowerCase().replace(/\s/g, '_');
        createMap(name, pointId, function(id, map) {
          mapCache[id] = map;
          chart.drillTo(id, map);
        });
      } else if (pointId.search(/CA[.].+/g) != -1) {
        name = featureProp.name.toLowerCase().replace(/\s/g, '_');
        createMap(name, pointId, function(id, map) {
          mapCache[id] = map;
          chart.drillTo(id, map);
        });
      } else {
        map = mapCache[featureProp.iso_a2];
        if (map)
          map.zoomToFeature(pointId);
      }
    }
  } else if (map == null) {
    chart.zoomToFeature(pointId);
  } else {
    chart.drillTo(pointId, map);
  }
};


$(document).ready(function() {
  breadcrumbs = $('#breadcrumbs');
  stage = anychart.graphics.create('container');

  createMap('world', 'world', function(pointId, map) {
    chart = map;

    chart.listen('pointClick', drilldown);
    chart.interactivity().selectionMode(anychart.enums.SelectionMode.DRILL_DOWN);

    // var a = $('<a>World Map</a>');
    // a.attr({'id': 'null', 'href': '#'});
    // a.bind('click', function() {chart.drillTo(this.id)});
    // breadcrumbs.append(a);
    //
    // chart.listen(anychart.enums.EventType.DRILL_CHANGE, function(e) {
    //   breadcrumbs.html('');

    //   var a = $('<a>World Map</a>');
    //   a.attr({'id': 'null', 'href': '#'});
    //   a.bind('click', function() {chart.drillTo(this.id)});
    //   breadcrumbs.append(a);
    //
    //   if (e.path.length > 1)
    //     breadcrumbs.append('<span> - </span>');
    //
    //   for (var i = 1; i < e.path.length; i++) {
    //     var label = e.path[i].getProperties().name || e.path[i].getId();
    //
    //     a = $('<a>' + label + '</a>');
    //     a.attr({'id': e.path[i].getId(), 'href': '#'});
    //     a.bind('click', function() {chart.drillTo(this.id)});
    //     breadcrumbs.append(a);
    //
    //     if (i != e.path.length - 1)
    //       breadcrumbs.append('<span> - </span>');
    //   }
    // });

    series = chart.getSeriesAt(0);

    var scale = anychart.scales.ordinalColor([
      {less: 1907},
      {from: 1907, to: 1920},
      {from: 1920, to: 1940},
      {from: 1940, to: 1950},
      {from: 1950, to: 1960},
      {from: 1960, to: 1970},
      {from: 1970, to: 1980},
      {greater: 1980}
    ]);

    scale.colors(['#42a5f5', '#64b5f6', '#90caf9', '#ffa726', '#fb8c00', '#f57c00', '#ef6c00', '#e65100']);
    series.colorScale(scale);

    chart.container(stage).draw();
  });
});
