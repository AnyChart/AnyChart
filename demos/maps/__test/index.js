var stage, parser, map, chart, s1, s2, s3, s, axis, cs, cr, series;
var selectedRegionBounds, selectedRegions = [];
var mapTx;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var crs = [
  {"value": "default", "text": "+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=2.337229166666667 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs"},
  {"value": "reunion", "text": "+proj=utm +zone=40 +south +datum=WGS84 +units=m +no_defs"},
  {"value": "mayotte", "text": "+proj=utm +zone=38 +south +datum=WGS84 +units=m +no_defs"},
  {"value": "guyana", "text": "+proj=utm +zone=22 +datum=WGS84 +units=m +no_defs"},
  {"value": "martinique", "text": "+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs"},
  {"value": "guadeloupe", "text": "+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs"}
];

$(document).ready(function() {
  $(crs).each(function() {
    $('#select_crs').append($("<option>").attr('value', this.text).text(this.text));
  });

  stage = anychart.graphics.create('container');

  chart = anychart.map();
  chart.geoData(anychart.maps.france);

  var dataSet = anychart.data.set([]);

  var series = chart.choropleth(dataSet);
  series
      .labels(true)
      .tooltip(false);

  chart.container(stage).draw();

  var data = [];
  var gdom = chart.getInternalGeoData();
  for (var i = 0, len = gdom.length; i < len; i++) {
    var region = gdom[i];
    var id = region.properties[chart.geoIdField()];
    data.push({'id': id, 'title': region.properties.nom_cl, 'value': randomExt(100, 1000)});
  }
  dataSet.data(data);

  chart.listen(anychart.enums.EventType.POINTS_SELECT, function(e) {
    selectedRegions = e.seriesStatus[0].points;
    if (!selectedRegions.length) {
      $('#scale').val(1);
      $('#scaleInp').val(1);
      $('#select_crs').val(mapTx.default.crs);
    }
  });

  chart.listen(anychart.enums.EventType.CHART_DRAW, function() {
    var dx = 0, dy = 0;
    var startCoords, endCoords;

    var gdom = chart.getInternalGeoData();
    mapTx = chart.mapTX;

    for (var i = 0, len = gdom.length; i < len; i++) {
      var region = gdom[i];
      var domElement = region.domElement;

      domElement.drag(true).cursor('hand');

      domElement.listen('click', function() {
        selectedRegions[0] = this;
        selectedRegionBounds = this.domElement.getBounds();

        var uid = goog.getUid(this.domElement);
        var tx_ = mapTx[uid] || (mapTx[uid] = {'crs': mapTx.default.crs});

        var default_scale = mapTx.default.scale;
        var scale = (tx_['scale'] ? tx_['scale'] / default_scale : 1);

        $('#scale').val(scale);
        $('#scaleInp').val(scale);
        $('#select_crs').val(tx_.crs);
      }, false, region);

      domElement.listen('start', function(e) {
        startCoords = chart.scale().pxToScale(e.clientX, e.clientY);
      }, false, region);

      domElement.listen('drag', function(e) {
        //boundingRect.setBounds(this.domElement.getBounds());
      }, false, region);

      domElement.listen('end', function(e) {
        endCoords = chart.scale().pxToScale(e.clientX, e.clientY);

        dx = endCoords[0] - startCoords[0];
        dy = endCoords[1] - startCoords[1];

        var uid = goog.getUid(this.domElement);
        if (dx || dy) {
          for (var i = 0, len = this.polygones.length; i < len; i++) {
            var polygon = this.polygones[i];
            var outerPath = polygon.outerPath;
            for (var j = 0; j < outerPath.length - 1; j += 2) {
              outerPath[j] += dx;
              outerPath[j + 1] += dy;
            }

            var holes = polygon.holes;
            for (j = 0; j < holes.length - 1; j += 2) {
              holes[j] += dx;
              holes[j + 1] += dy;
            }
          }

          var tx_ = mapTx[uid] || (mapTx[uid] = {});
          tx_['xoffset'] = tx_['xoffset'] ? tx_['xoffset'] + dx : dx;
          tx_['yoffset'] = tx_['yoffset'] ? tx_['yoffset'] + dy : dy;

          var bounds = this.domElement.getBounds();
          var leftTop = chart.scale().pxToScale(bounds.left, bounds.top);
          var widthHeight = chart.scale().pxToScale(bounds.left + bounds.width, bounds.top + bounds.height);
          tx_['heatZone'] = (new anychart.math.Rect(
              leftTop[0], leftTop[1], Math.abs(widthHeight[0] - leftTop[0]), Math.abs(widthHeight[1] - leftTop[1]))).serialize();


          console.log(goog.getUid('drag end ' + selectedRegions[0].domElement));

          $('#save').click();
        }
      }, false, region);
    }
  });





  parser = chart.getParser();

  $('body').append('<div id="tooltip"></div>');

  $(document).mousemove(function(e) {
    var scaledCoords = chart.scale().pxToScale(e.clientX, e.clientY);
    var latLon = chart.scale().inverseTransform(e.clientX, e.clientY);

    $('#tooltip')
        .show()
        .css({
          'left': e.clientX + 15,
          'top': e.clientY + 15,
          'position': 'absolute',
          'z-index': 100,
          'pointerEvents': 'none',
          'font-size': '14px'
        })
        .html(
          'Client coords: ' + e.clientX + ' , ' + e.clientY + '<br>' +
          'Scaled coords: ' + Math.round(scaledCoords[0]) + ' , ' + Math.round(scaledCoords[1]) + '<br>' +
          'Lat: ' + latLon[1].toFixed(4) + ' , ' + 'Lon: ' + latLon[0].toFixed(4)
        );
  });

  $(document).mouseout(function(e) {
    $('#tooltip').html('').hide();
  });

  $('#save').click(function(e) {
    var selectedUid;
    console.log(selectedUid = goog.getUid('drag end ' + selectedRegions[0].domElement));
    console.log(selectedUid);

    //var selectedUid = goog.getUid(selectedRegions[0].domElement) + '';

    var gdom = chart.getInternalGeoData();
    for (var i = 0, len = gdom.length; i < len; i++) {
      var region = gdom[i];
      if (region.polygones_) {
        region.polygones = region.polygones_;
      }
    }

    var json = parser.exportToGeoJSON(gdom, mapTx);

    chart.geoData(json).draw();

    gdom = chart.getInternalGeoData();
    for (i = 0, len = gdom.length; i < len; i++) {
      region = gdom[i];
      if (selectedUid == goog.getUid(region.domElement))
        selectedRegions[0] = region;
    }
  });

  $('#select_crs').change(function(e) {
    for (var k = 0; k < selectedRegions.length; k++) {
      var region = selectedRegions[k];

      var x, y, scaledCoord, x_, y_;
      var scale = chart.scale();
      var projected;

      region.domElement.clear();

      var uid = goog.getUid(region.domElement);
      var tx_ = mapTx[uid] || (mapTx[uid] = {'crs': mapTx.default.crs});
      var old_crs = tx_.crs;
      var new_crs = $('#select_crs option:selected').text();
      var xoffset = tx_.xoffset || 0;
      var yoffset = tx_.yoffset || 0;

      region.polygones_ = [];
      for (var i = 0, len = region.polygones.length; i < len; i++) {
        var polygon = region.polygones[i];
        var polygon_ = {};
        region.polygones_.push(polygon_);
        var outerPath = polygon.outerPath;
        var outerPath_ = polygon_.outerPath = [];
        for (var j = 0; j < outerPath.length - 1; j += 2) {
          x_ = ((outerPath[j] - xoffset) / tx_.scale);
          y_ = ((outerPath[j + 1] - yoffset) / tx_.scale);

          projected = window['proj4'](old_crs, new_crs).forward([x_, y_]);

          x_ = projected[0] * tx_.scale + xoffset;
          y_ = projected[1] * tx_.scale + yoffset;

          outerPath_.push(x_, y_);
          scaledCoord = scale.scaleToPx(x_, y_);

          x = scaledCoord[0];
          y = scaledCoord[1];

          if (j == 0)
            region.domElement.moveTo(x, y);
          else
            region.domElement.lineTo(x, y);
        }
        var holes = polygon.holes;
        var holes_ = polygon_.holes = [];
        for (j = 0; j < holes.length - 1; j += 2) {
          x_ = ((holes[j] - xoffset) / tx_.scale);
          y_ = ((holes[j + 1] - yoffset) / tx_.scale);

          projected = window['proj4'](old_crs, new_crs).forward([x_, y_]);

          x_ = projected[0] * tx_.scale + xoffset;
          y_ = projected[1] * tx_.scale + yoffset;

          holes_.push(x_, y_);
          scaledCoord = scale.scaleToPx(x_, y_);

          x = scaledCoord[0];
          y = scaledCoord[1];

          if (j == 0)
            region.domElement.moveTo(x, y);
          else
            region.domElement.lineTo(x, y);
        }
      }



      var bounds_ = region.domElement.getBoundsWithoutTransform();
      var startCoords = scale.pxToScale(bounds_.left + bounds_.width / 2, bounds_.top + bounds_.height / 2);
      var endCoords = scale.pxToScale(selectedRegionBounds.left + selectedRegionBounds.width / 2, selectedRegionBounds.top + selectedRegionBounds.height / 2);

      var dx = endCoords[0] - startCoords[0];
      var dy = endCoords[1] - startCoords[1];

      for (i = 0, len = region.polygones_.length; i < len; i++) {
        polygon = region.polygones_[i];
        outerPath = polygon.outerPath;
        for (j = 0; j < outerPath.length - 1; j += 2) {
          outerPath[j] += dx;
          outerPath[j + 1] += dy;
        }

        holes = polygon.holes;
        for (j = 0; j < holes.length - 1; j += 2) {
          holes[j] += dx;
          holes[j + 1] += dy;
        }
      }

      tx_['xoffset'] = tx_['xoffset'] ? tx_['xoffset'] + dx : dx;
      tx_['yoffset'] = tx_['yoffset'] ? tx_['yoffset'] + dy : dy;

      region.domElement.setPosition(selectedRegionBounds.left + selectedRegionBounds.width / 2 - bounds_.width / 2, selectedRegionBounds.top + selectedRegionBounds.height / 2 - bounds_.height / 2);

      tx_.crs = new_crs;
    }

    $('#save').click();
  });

  $('#exportToGeoJSON').click(function(e) {
    console.log(chart.toGeoJSON());
  });

  var applyScale = function(value) {
    for (var k = 0; k < selectedRegions.length; k++) {
      var region = selectedRegions[k];

      var x, y, scaledCoord, x_, y_;
      var scale = chart.scale();

      region.domElement.clear();

      var uid = goog.getUid(region.domElement);
      var tx_ = mapTx[uid] || (mapTx[uid] = {'crs': mapTx.default.crs});
      var xoffset = tx_['xoffset'] || 0;
      var yoffset = tx_['yoffset'] || 0;

      var default_scale = mapTx.default.scale;
      var scale_ = (tx_['scale'] ? tx_['scale'] / default_scale : 1);

      region.polygones_ = [];
      for (var i = 0, len = region.polygones.length; i < len; i++) {
        var polygon = region.polygones[i];
        var polygon_ = {};
        region.polygones_.push(polygon_);
        var outerPath = polygon.outerPath;
        var outerPath_ = polygon_.outerPath = [];
        for (var j = 0; j < outerPath.length - 1; j += 2) {
          x_ = ((outerPath[j] - xoffset) / scale_ * value) + xoffset;
          y_ = ((outerPath[j + 1] - yoffset) / scale_ * value) + yoffset;

          outerPath_.push(x_, y_);
          scaledCoord = scale.scaleToPx(x_, y_);

          x = scaledCoord[0];
          y = scaledCoord[1];

          if (j == 0)
            region.domElement.moveTo(x, y);
          else
            region.domElement.lineTo(x, y);
        }
        var holes = polygon.holes;
        var holes_ = polygon_.holes = [];
        for (j = 0; j < holes.length - 1; j += 2) {
          x_ = ((holes[j] - xoffset) / scale_ * value) + xoffset;
          y_ = ((holes[j + 1] - yoffset) / scale_ * value) + yoffset;

          holes_.push(x_, y_);
          scaledCoord = scale.scaleToPx(x_, y_);

          x = scaledCoord[0];
          y = scaledCoord[1];

          if (j == 0)
            region.domElement.moveTo(x, y);
          else
            region.domElement.lineTo(x, y);
        }
      }



      var bounds_ = region.domElement.getBoundsWithoutTransform();
      var endCoords = scale.pxToScale(selectedRegionBounds.left + selectedRegionBounds.width / 2, selectedRegionBounds.top + selectedRegionBounds.height / 2);
      var startCoords = scale.pxToScale(bounds_.left + bounds_.width / 2, bounds_.top + bounds_.height / 2);

      var dx = endCoords[0] - startCoords[0];
      var dy = endCoords[1] - startCoords[1];

      for (i = 0, len = region.polygones_.length; i < len; i++) {
        polygon = region.polygones_[i];
        outerPath = polygon.outerPath;
        for (j = 0; j < outerPath.length - 1; j += 2) {
          outerPath[j] += dx;
          outerPath[j + 1] += dy;
        }

        holes = polygon.holes;
        for (j = 0; j < holes.length - 1; j += 2) {
          holes[j] += dx;
          holes[j + 1] += dy;
        }
      }

      tx_['xoffset_temp'] = tx_['xoffset'] ? tx_['xoffset'] + dx : dx;
      tx_['yoffset_temp'] = tx_['yoffset'] ? tx_['yoffset'] + dy : dy;

      region.domElement.setPosition(selectedRegionBounds.left + selectedRegionBounds.width / 2 - bounds_.width / 2, selectedRegionBounds.top + selectedRegionBounds.height / 2 - bounds_.height / 2);
    }
  };

  scale = function(value) {
    $('#scaleInp').val(value);

    applyScale(value);
  };

  scaleEnd = function(value) {
    $('#scale').val(value);

    applyScale(value);

    for (var k = 0; k < selectedRegions.length; k++) {
      var region = selectedRegions[k];

      var bounds_ = region.domElement.getBounds();

      var uid = goog.getUid(region.domElement);
      var tx_ = mapTx[uid] || (mapTx[uid] = {'crs': mapTx.default.crs});
      tx_['scale'] = mapTx.default.scale * value;
      tx_['xoffset'] = tx_['xoffset_temp'];
      tx_['yoffset'] = tx_['yoffset_temp'];

      var leftTop = chart.scale().pxToScale(bounds_.left, bounds_.top);
      var widthHeight = chart.scale().pxToScale(bounds_.left + bounds_.width, bounds_.top + bounds_.height);
      tx_['heatZone'] = (new anychart.math.Rect(
          leftTop[0], leftTop[1], Math.abs(widthHeight[0] - leftTop[0]), Math.abs(widthHeight[1] - leftTop[1]))).serialize();
    }

    $('#save').click();
  };

  scaleInp = function(value) {
    $('#scale').val(value);

    scaleEnd(value);
  };
});
