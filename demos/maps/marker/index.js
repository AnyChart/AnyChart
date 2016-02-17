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
  //$(crs).each(function() {
  //  $('#select_crs').append($("<option>").attr('value', this.text).text(this.text));
  //});

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
  chart.container(stage).draw();


  //chart.bounds('50%', '50%', '50%', '50%');
  chart.geoData(anychart.maps.france);
  var dataSet = anychart.data.set([]);

  //series = chart.choropleth(dataSet);
  //series.tooltip(false).labels().enabled(true).textFormatter(function() {return this.regionProperties.name});
  //
  //series.colorScale(anychart.scales.ordinalColor([
  //  {less: -100},
  //  {from: -100, to: 100},
  //  {greater: 100}
  //]));
  //chart.colorRange().enabled(true);



  series2 = chart.marker(dataSet);
  series2.tooltip(false).labels().enabled(true);





  var data = [
    //{"id": "AU.NT", "value": 136, "size": 185, selected: true},
    //{"id": "AU.WA", "value": -146, "size": 471},
    //{"id": "AU.CT", "value": -242, "size": 339},
    //{"id": "AU.NS", "value": 30, "size": 137},
    //{"id": "AU.SA", "value": 69, "size": 525},
    //{"id": "AU.VI", "value": 110, "size": 178},
    //{"id": "AU.QL", "value": -53, "size": 621, 'lat': -25.6, 'lon': 141.6},
    //{"id": "AU.TS", "value": 168, "size": 359, 'lat': -27.1, 'lon': 123.6}
    {'lat': 42.12, 'lon': 9.17},
    {'lat': 16.3, 'lon': -61.5}
  ];

  //var data = [];
  //var features = chart.geoData()['features'];
  //for (var i = 0, len = features.length; i < len; i++) {
  //  var feature = features[i];
  //  if (feature['properties']) {
  //    var id = feature['properties'][chart.geoIdField()];
  //    data.push({'id': id, 'value': randomExt(-300, 300), 'size': randomExt(0, 1000)});
  //  }
  //}

  dataSet.data(data);


  //chart.interactivity().selectionMode('none');
  //chart.interactivity().hoverMode('none');






  $('#container').bind('mousemove drag', function(e) {
    var container = $('#container');
    var containerOffset = container.offset();
    var scrollLeft = $(document).scrollLeft();
    var scrollTop = $(document).scrollTop();

    var x = e.clientX - (containerOffset.left - scrollLeft);
    var y = e.clientY - (containerOffset.top - scrollTop);

    var latLon = chart.scale().inverseTransform(x, y);
    var tx = chart.scale().pickTx(latLon[0], latLon[1]);
    var pxpy = chart.scale().transform(latLon[0], latLon[1]);

    $('#tooltip').css({'left': e.clientX + 15, 'top': e.clientY + 15})
        .show()
        .html(
            tx.crs + '<br>' +
          //'Client coords: ' + e.clientX + ' , ' + e.clientY + '<br>' +
          'Client coords_: ' + pxpy[0] + ' , ' + pxpy[1] + '<br>' +
          'Relative cont coords: ' + x + ' , ' + y + '<br>' +
          //'Scaled: ' + scaled[0] + ' , ' + scaled[1] + '<br>' +
          'Lat: ' + latLon[1].toFixed(4) + ' , ' + 'Lon: ' + latLon[0].toFixed(4)
        );
  });

  $(document).bind('mouseout dragend', function(e) {
    $('#tooltip').html('').hide();
  });
});
