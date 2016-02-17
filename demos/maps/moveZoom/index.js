var stage, map, chart, s1, s2, s3, s, axis, cs, cr;
var selectedRegions;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;
var series, series2;

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

  $('body').append('<div id="tooltip"></div>');
  $('#tooltip')
      .css({
        'position': 'absolute',
        'z-index': 1000,
        'pointerEvents': 'none',
        'font-size': '14px'
      });



  stage = anychart.graphics.create('container');
  chart = anychart.map();
  chart.geoData(anychart.maps.france);

  //series.colorScale(anychart.scales.ordinalColor([
  //  {less: -100},
  //  {from: -100, to: 100},
  //  {greater: 100}
  //]));
  //chart.colorRange().enabled(true);

  chart.container(stage).draw();


  chart.interactivity().selectionMode('none');
  chart.interactivity().hoverMode('none');

  var choroplethData = [];
  var features = chart.geoData()['features'];
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      var id = feature['properties'][chart.geoIdField()];
      choroplethData.push({'id': id, 'value': randomExt(-300, 300), 'size': randomExt(0, 1000)});
    }
  }

  series = chart.choropleth(choroplethData);
  series.tooltip(false).labels().enabled(false);


  var point = series.getPoint(10);
  point.middleX();
  point.middleY();
  var pointBounds = point.getFeatureBounds();

  var x = pointBounds.left + pointBounds.width * point.middleX();
  var y = pointBounds.top + pointBounds.height * point.middleY();

  var latlon = chart.inverseTransform(x, y);

  var data = [
    {"value": 168, "size": 359, 'lat': latlon.lat, 'lon': latlon.long}
  ];

  series2 = chart.bubble(data);



  $('#container').bind('mousemove drag', function(e) {
    var localCoords = chart.globalToLocal(e.clientX, e.clientY);
    var latLon = chart.inverseTransform(localCoords.x, localCoords.y);
    var pix = chart.transform(latLon.long, latLon.lat);
    var calcClientCoords = chart.localToGlobal(pix.x, pix.y);

    $('#tooltip').css({'left': e.clientX + 15, 'top': e.clientY + 15})
        .show()
        .html(
          'Global: ' + e.clientX + ' , ' + e.clientY + ' (source)<br>' +
          'Global: ' + calcClientCoords.x.toFixed(3) + ' , ' + calcClientCoords.y.toFixed(3) + ' (source -> globalToLocal -> invTrans - > trans -> localToGlobal)<br>' +
          'Local: ' + pix.x.toFixed(3) + ' , ' + pix.y.toFixed(3) + ' (source -> globalToLocal -> invTrans - > trans)<br>' +
          'Local: ' + localCoords.x.toFixed(3) + ' , ' + localCoords.y.toFixed(3) + ' (source -> globalToLocal)<br>' +
          'Lat: ' + latLon.lat.toFixed(3) + ' , ' + 'Lon: ' + latLon.long.toFixed(3) + ' (source -> globalToLocal -> invTrans)<br>'
        );
  });

  $(document).bind('mouseout dragend', function(e) {
    $('#tooltip').html('').hide();
  });
});
