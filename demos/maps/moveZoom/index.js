var stage, map, chart, s1, s2, s3, s, axis, cs, cr, series;
var selectedRegions;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;

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



  //chart.bounds('50%', '50%', '50%', '50%');
  chart.geoData(anychart.maps.france);

  var dataSet = anychart.data.set([]);

  var series = chart.choropleth(dataSet);
  series.labels().textFormatter(function() {
    return this.getDataValue('title');
  });
  series.tooltip(false);
  //series.stroke('10 red');
  series.colorScale(anychart.scales.ordinalColor([
    {less: -100},
    {from: -100, to: 100},
    {greater: 100}
  ]));
  chart.colorRange().enabled(true);

  chart.container(stage).draw();

  var data = [];
  var features = chart.geoData()['features'];
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      var id = feature['properties'][chart.geoIdField()];
      data.push({'id': id, 'title': feature['properties']['nom_cl'], 'value': randomExt(-300, 300)});
    }
  }
  dataSet.data(data);

  chart.interactivity().selectionMode('none');
  chart.interactivity().hoverMode('none');






  $('#container').mousemove(function(e) {
    var container = $('#container');
    var containerOffset = container.offset();
    var scrollLeft = $(document).scrollLeft();
    var scrollTop = $(document).scrollTop();

    var x = e.clientX - (containerOffset.left - scrollLeft);
    var y = e.clientY - (containerOffset.top - scrollTop);

    var latLon = chart.scale().inverseTransform(x, y);

    $('#tooltip').css({'left': e.clientX + 15, 'top': e.clientY + 15})
        .show()
        .html(
          'Client coords: ' + e.clientX + ' , ' + e.clientY + '<br>' +
          'Relative cont coords: ' + x + ' , ' + y + '<br>' +
          //'Scaled: ' + scaled[0] + ' , ' + scaled[1] + '<br>' +
          'Lat: ' + latLon[1].toFixed(4) + ' , ' + 'Lon: ' + latLon[0].toFixed(4)
        );
  });

  $(document).mouseout(function(e) {
    $('#tooltip').html('').hide();
  });
});
