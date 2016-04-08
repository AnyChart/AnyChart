var stage, map, chart, s1, s2, s3, s, axis, cs, cr;
var selectedRegions;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;
var series, series2;
var mapCache = {};
var showPreload = true;
var breadcrumbs;

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
    url = dir + '/' + name + '/' + name + '.js';
    geoData = 'anychart.maps.' + name;
  } else {
    dir = 'countries';
    if (name == 'world')
      dir = 'custom';
    url = 'http://cdn.anychart.com/geodata/1.1.0/' + dir + '/' + name + '/' + name + '.js';
    geoData = 'anychart.maps.' + name;
  }

  $.ajax({
    type: "GET",
    url: url,
    beforeSend: function() {
      showPreload = true;
      setTimeout(showPreloader, 20);
    },
    success: function() {
      var map;
      if (id == 'KZ') {
        map = anychart.map();
        map.geoData(geoData);
        var series = map.choropleth(generateData(map, 20, 100));
        series.colorScale(anychart.scales.linearColor('red', 'white'));
        callback.call(chart, id, map);
      } else if (id == 'AU') {
        map = anychart.map();
        // map.listen(anychart.enums.EventType.ANIMATION_START, function(e) {
        //   console.log('AU ' + e.type);
        // });
        //
        // map.listen(anychart.enums.EventType.ANIMATION_END, function(e) {
        //   console.log('AU ' + e.type);
        // });
        map.geoData(au);
        map.choropleth(generateData(map));
        map.colorRange().enabled(true);
        var scale = anychart.scales.linearColor(anychart.color.blendedHueProgression('red', 'green', 10));
        map.getSeriesAt(0).colorScale(scale);
        callback.call(chart, id, map);
      } else if (id == 'FR') {
        $.ajax({
          url: 'franceMap.js',
          dataType: "script",
          beforeSend: function() {
            showPreload = true;
            setTimeout(showPreloader(), 20);
          },
          success: function() {
            map = france;
            callback.call(chart, id, map);
            hidePreloader();
          }
        });
      } else {
        map = anychart.map();
        map.geoData(geoData);
        map.choropleth(generateData(map));
        //map.title(id);
        //map.getSeriesAt(0).labels(false);
        callback.call(chart, id, map);
      }
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
      var name = featureProp.admin.toLowerCase().replace(/\s/g, '_');
      createMap(name, pointId, function(id, map) {
        mapCache[id] = map;
        chart.drillTo(id, map);
      });
    } else {
      if (pointId.search(/US[.].+/g) != -1) {
        console.log(featureProp);
        var name = featureProp.name.toLowerCase().replace(/\s/g, '_');
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

  // var drillDownMap = {};
  // createMap('australia', 'KZ', function(pointId, map) {
  //   drillDownMap[pointId] = map;
  // });
  // createMap('australia', 'AU', function(pointId, map) {
  //   drillDownMap[pointId] = map.toJson();
  // });
  // createMap('france', 'FR', function(pointId, map) {
  //   drillDownMap[pointId] = map;
  // });
  // createMap('china', 'CN', function(pointId, map) {
  //   drillDownMap[pointId] = map.toJson();
  // });
  // createMap('united_states_of_america', 'US', function(pointId, map) {
  //   drillDownMap[pointId] = map;
  //   map.drillDownMap({'US.NV': drillDownMap['AU']})
  // });

  createMap('world', 'world', function(pointId, map) {
    chart = map;

    chart.listen('pointClick', drilldown);

    // chart.listen('pointClick', function(e) {
    //   var pointId = e.point.get('id');
    //   var featureProp = e.point.getFeatureProp();
    //   var name = featureProp.admin.toLowerCase().replace(/\s/g, '_');
    //
    //   console.log(name, pointId);
    // });

    chart.interactivity().selectionMode(anychart.enums.SelectionMode.DRILL_DOWN);
    // chart.drillDownMap(drillDownMap);

    // chart.listen(anychart.enums.EventType.ANIMATION_START, function(e) {
    //   console.log(e);
    // });
    //
    // chart.listen(anychart.enums.EventType.ANIMATION_END, function(e) {
    //   console.log(e);
    // });

    var a = $('<a>World Map</a>');
    a.attr({'id': 'null', 'href': '#'});
    a.bind('click', function() {chart.drillTo(this.id)});
    breadcrumbs.append(a);

    chart.listen(anychart.enums.EventType.DRILL_CHANGE, function(e) {
      //var mapPoint = e.path[e.path.length - 1];
      breadcrumbs.html('');

      var a = $('<a>World Map</a>');
      a.attr({'id': 'null', 'href': '#'});
      a.bind('click', function() {chart.drillTo(this.id)});
      breadcrumbs.append(a);

      if (e.path.length)
        breadcrumbs.append('<span> - </span>');

      for (var i = 0; i < e.path.length; i++) {
        var label = e.path[i].getProperties().name || e.path[i].getId();
        
        // if (i != e.path.length - 1)
        a = $('<a>' + label + '</a>');
        a.attr({'id': e.path[i].getId(), 'href': '#'});
        a.bind('click', function() {chart.drillTo(this.id)});
        breadcrumbs.append(a);

        if (i != e.path.length - 1)
          breadcrumbs.append('<span> - </span>');
      }
    });

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

    var colorRange = map.colorRange();
    colorRange.enabled(true).padding([20, 0, 0, 0]);
    colorRange.colorLineSize(5);
    colorRange.ticks().stroke('3 #ffffff').position('center').length(20).enabled(true);
    colorRange.marker().size(7);
    colorRange.labels().fontSize(10).padding(0, 0, 0, 5).textFormatter(function() {
      var range = this.colorRange;
      if (!range)
        return;

      var name;
      if (isFinite(range.start + range.end)) {
        name = range.start + ' - ' + range.end;
      } else if (isFinite(range.start)) {
        name = 'After ' + range.start;
      } else {
        name = 'Before ' + range.end;
      }
      return name
    });




    chart.legend()
        .itemsSourceMode(anychart.enums.LegendItemsSourceMode.CATEGORIES)
        .enabled(true);

    // chart.interactivity().selectionMode('none');

    chart.container(stage).draw()
  });
});
