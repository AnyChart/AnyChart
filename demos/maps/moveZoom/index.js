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



  //chart.bounds('50%', '50%', '50%', '50%');
  chart.geoData(anychart.maps.france);

  var dataSet = anychart.data.set([]);

  ////
  //series.colorScale(anychart.scales.ordinalColor([
  //  {less: -100},
  //  {from: -100, to: 100},
  //  {greater: 100}
  //]));
  //chart.colorRange().enabled(true);



  //series2 = chart.bubble(dataSet);
  //series2.tooltip(false).labels().enabled(true).textFormatter(function() {return this['size']});



  chart.container(stage).draw();

  var data = [
  //  {"id": "AU.NT", "value": 136, "size": 185, selected: true},
  //  {"id": "AU.WA", "value": -146, "size": 471},
  //  {"id": "AU.CT", "value": -242, "size": 339},
  //  {"id": "AU.NS", "value": 30, "size": 137},
  //  {"id": "AU.SA", "value": 69, "size": 525},
  //  {"id": "AU.VI", "value": 110, "size": 178},
  //  {"id": "AU.QL", "value": -53, "size": 621, 'lat': -25.6, 'lon': 141.6},
  //  {"id": "AU.TS", "value": 168, "size": 359, 'lat': -27.1, 'lon': 123.6}
    {"value": 168, "size": 359, 'lat': 16.2489, 'lon': -61.5811}
  ];

  dataSet.data(data);


  //chart.interactivity().selectionMode('none');
  //chart.interactivity().hoverMode('none');



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
  point.getFeatureBounds();

  chart.listen(anychart.enums.EventType.POINTS_SELECT, function(e) {
    selectedRegions = e.seriesStatus[0].points;
    //var iterator = this.series.getIterator().select(this.index);

    console.log(selectedRegions);
      //var prop = e.point.getFeatureProp();
      //var featureName = prop[chart.geoIdField()];
  });



  $('#container').bind('mousemove drag', function(e) {
    var localCoords = chart.globalToLocal(e.clientX, e.clientY);

    var latLon = chart.inverseTransform(localCoords.x, localCoords.y);
    var pix = chart.transform(latLon.long, latLon.lat);

    var clacClientCoords = chart.localToGlobal(pix.x, pix.y);

    $('#tooltip').css({'left': e.clientX + 15, 'top': e.clientY + 15})
        .show()
        .html(
          'Client coords: ' + e.clientX + ' , ' + e.clientY + '<br>' +
          'Relative data bounds_2: ' + pix.x + ' , ' + pix.y + '<br>' +
          'Relative data bounds: ' + localCoords.x + ' , ' + localCoords.y + '<br>' +
          //'Scaled: ' + scaled[0] + ' , ' + scaled[1] + '<br>' +
          'Lat: ' + latLon.lat.toFixed(4) + ' , ' + 'Lon: ' + latLon.long.toFixed(4) + '<br>' +
          'CalcClientCoords: ' + clacClientCoords.x + ' , ' + clacClientCoords.y
        );
  });

  $(document).bind('mouseout dragend', function(e) {
    $('#tooltip').html('').hide();
  });
});
