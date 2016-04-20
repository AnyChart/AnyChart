var stage, map, chart, s1, s2, s3, s, axis, cs, cr;
var selectedRegions;
var scale, scaleInp, scaleEnd;
var min = 0, max = 350;
var startX, startY;
var series, series2;
var ranger, input, rangerMarkerPos, inputMarkerPos;

function curvature(value) {
  series.curvature(value);
  input.value = series.curvature();
}

function curvatureInp(value) {
  series.curvature(value);
  ranger.value = series.curvature();
}


function markerPos(value) {
  series.markers().position(value);
  series.labels().position(value);
  inputMarkerPos.value = series.markers().position();
}

function markerPosInp(value) {
  series.markers().position(value);
  series.labels().position(value);
  rangerMarkerPos.value = series.markers().position();
}


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
  //
  //$('body').append('<div id="tooltip"></div>');
  //$('#tooltip')
  //    .css({
  //      'position': 'absolute',
  //      'z-index': 1000,
  //      'pointerEvents': 'none',
  //      'font-size': '14px'
  //    });


  stage = anychart.graphics.create('container');
  chart = anychart.map();
  chart.title().enabled(true).text('');
  chart.geoData(anychart.maps.world);





  var data = [];
  var features = chart.geoData()['features'];
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      var id = feature['properties'][chart.geoIdField()];
      data.push({'id': id, 'value': randomExt(-300, 300), 'size': randomExt(0, 1000)});
    }
  }
  //
  series2 = chart.choropleth(data);
  series2
      .hatchFill(true);
  series2.labels().enabled(true);
  series2.markers()
      .fill('red')
      .size(20)
      .enabled(true);







  data = [
    //null,
    //'',
    //1,
    //"2",
    //[],
    //{},
    //undefined,
    //{'points': '45'},
    //{'points': ['sdfsf', null, 's60.326948', 'sdf-114.609375', 'ss66.160511', 'sf-44.472656']},
    {
      points: ['dfs', null, '66.160511', '-44.472656', '60.326948', '-114.609375'],
      selected: false,
      //label: {anchor: 'top'},
      // marker: {rotation: null, position: .1},
      hoverMarker: {rotation: null, position: .3},
      selectMarker: {rotation: null, position: 1}
    },
    //{
    //  'points': [52.2895, 104.2616, 59.9302, 30.3167, 36.162270, -115.175171],
    //  'curvature': .2,
    //  'fill': 'blue 0.2',
    //  'stroke': 'none'
    //},
    //{
    //  'points': [52.2895, 104.2616, 59.9302, 30.3167, 36.162270, -115.175171],
    //  'curvature': -.5,
    //  'startSize': 1,
    //  'endSize': 20,
    //  'fill': 'red 0.2',
    //  'stroke': 'none'
    //},
    // {
    //   'points': [4.915833, -68.730469, -26.115986, 24.082031, -25.799891, 132.890625, 66.231457, 176.386719]
    // },
    //{
    //  'points': [4.915833, -68.730469, 16.299051, -129.902344]
    //},
    //{
    //  'points': [4.915833, -68.730469, -27.215556, -126.035156]
    //},
    //{
    //  'points': [4.915833, -68.730469, 34.452218, -37.265625]
    //},
    //{
    //  'points': [60.326948, -114.609375, 'dfs', null, 66.160511, -44.472656, 77.579959, 15.996094],
    //  'curvature': 0.35,
    //  'startSize': 1,
    //  'endSize': 1,
    //  'fill': 'none',
    //  'stroke': '.7 red',
    //  'marker': {'type': 'star5', fill: 'yellow', stroke: '3 orange'}
    //}
    //{'points': [104.2616, 52.2895, 87.4511, 43.7710]},
    //{'points': [104.2616, 52.2895, 131.9, 43.13]},
    //{'points': [104.2616, 52.2895, 129.7, 66.5]},
    //
    //
    //
    //{'points': [51.5360, -0.12, 64.5673, -20.2807]},
    //{'points': [52.5763, 13.3374, 65.275, -15.666]}
  ];

  series = chart.connector(data);

  series
      .markers()
      // .position(.1)
      .enabled(true)
      .stroke('none')
      .fill('red')
      .size(20);
      //.anchor('right');

  series
      .hoverMarkers()
        .size(20);

  series
      .curvature(0.5)
      .stroke('1 gray')
      .fill('gray .3')
      .endSize(10)
      .startSize(10);

  series
      .labels().enabled(true).anchor(null);

  series
      .hatchFill(true);

  //series.tooltip(false).labels().enabled(true).textFormatter(function() {return this.regionProperties.name});
  //
  //series.colorScale(anychart.scales.ordinalColor([
  //  {less: -100},
  //  {from: -100, to: 100},
  //  {greater: 100}
  //]));
  //chart.colorRange().enabled(true);



  // chart.connector([
  //   {
  //    'points': [4.915833, -68.730469, 34.452218, -37.265625]
  //   }
  // ]);

  chart.container(stage).draw();

  //var data = [
  //  {"id": "AU.NT", "value": 136, "size": 185, selected: true},
  //  {"id": "AU.WA", "value": -146, "size": 471},
  //  {"id": "AU.CT", "value": -242, "size": 339},
  //  {"id": "AU.NS", "value": 30, "size": 137},
  //  {"id": "AU.SA", "value": 69, "size": 525},
  //  {"id": "AU.VI", "value": 110, "size": 178},
  //  {"id": "AU.QL", "value": -53, "size": 621, 'lat': -25.6, 'lon': 141.6},
  //  {"id": "AU.TS", "value": 168, "size": 359, 'lat': -27.1, 'lon': 123.6}
  //];

  //var data = [];
  //var features = chart.geoData()['features'];
  //for (var i = 0, len = features.length; i < len; i++) {
  //  var feature = features[i];
  //  if (feature['properties']) {
  //    var id = feature['properties'][chart.geoIdField()];
  //    data.push({'id': id, 'value': randomExt(-300, 300), 'size': randomExt(0, 1000)});
  //  }
  //}




  //chart.interactivity().selectionMode('none');
  //chart.interactivity().hoverMode('none');






  //$('#container').bind('mousemove drag', function(e) {
  //  var container = $('#container');
  //  var containerOffset = container.offset();
  //  var scrollLeft = $(document).scrollLeft();
  //  var scrollTop = $(document).scrollTop();
  //
  //  var x = e.clientX - (containerOffset.left - scrollLeft);
  //  var y = e.clientY - (containerOffset.top - scrollTop);
  //
  //  var latLon = chart.scale().inverseTransform(x, y);
  //  var pxpy = chart.scale().transform(latLon[0], latLon[1]);
  //
  //  $('#tooltip').css({'left': e.clientX + 15, 'top': e.clientY + 15})
  //      .show()
  //      .html(
  //        'Client coords: ' + e.clientX + ' , ' + e.clientY + '<br>' +
  //        'Client coords_: ' + pxpy[0] + ' , ' + pxpy[1] + '<br>' +
  //        'Relative cont coords: ' + x + ' , ' + y + '<br>' +
  //        //'Scaled: ' + scaled[0] + ' , ' + scaled[1] + '<br>' +
  //        'Lat: ' + latLon[1].toFixed(4) + ' , ' + 'Lon: ' + latLon[0].toFixed(4)
  //      );
  //});
  //
  //$(document).bind('mouseout dragend', function(e) {
  //  $('#tooltip').html('').hide();
  //});

  ranger = document.getElementById('curvature');
  input = document.getElementById('curvatureInp');
  rangerMarkerPos = document.getElementById('markerPos');
  inputMarkerPos = document.getElementById('markerPosInp');

  ranger.value = series.curvature();
  input.value = series.curvature();
  rangerMarkerPos.value = series.markers().position();
  inputMarkerPos.value = series.markers().position();
});
