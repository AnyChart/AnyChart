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
  //series.labels().position(value);
  inputMarkerPos.value = series.markers().position();
}

function markerPosInp(value) {
  series.markers().position(value);
  //series.labels().position(value);
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








  var data = [
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
      points: ['dfs', null, '60.326948', '-114.609375', '66.160511', '-44.472656'],
      selected: true,
      marker: {rotation: null, position: .1},
      hoverMarker: {rotation: null, position: .3},
      selectMarker: {rotation: null, position: 1}
    }
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
    //{
    //  'points': [4.915833, -68.730469, -26.115986, 24.082031, -25.799891, 132.890625, 66.231457, 176.386719]
    //},
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


  var data = [
    {points: [40.71262,-74.006124,38.716183,-75.075441], number: 25, to: "Rehoboth Beach, DE", marker: {fill: "#9fa8da"}},
    {points: [40.71262,-74.006124,39.941479,-74.07011], number: 24, to: "Seaside Heights, NJ", marker: {fill: "#93abe0"}},
    {points: [40.71262,-74.006124,40.089822,-74.037677], number: 23, to: "Point Pleasant Beach, NJ", marker: {fill: "#86ade6"}},
    {points: [40.71262,-74.006124,42.364363,-73.594993], number: 22, to: "Chatham, NY", marker: {fill: "#7ab0ec"}},
    {points: [40.71262,-74.006124,41.456637,-70.555377], number: 21, to: "Oak Bluffs, MA", marker: {fill: "#6eb3f1"}, label: {enabled: true, anchor: 'bottom'}},
    {points: [40.71262,-74.006124,39.27582,-74.574824], number: 20, to: "Ocean City, NJ", marker: {fill: "#61b2f5"}},
    {points: [40.71262,-74.006124,40.971872,-72.122145], number: 19, to: "Amagansett, NY", marker: {fill: "#51a5ed"}},
    {points: [40.71262,-74.006124,39.563483,-74.23509], number: 18, to: "Beach Haven, NJ", marker: {fill: "#4298e6"}},
    {points: [40.71262,-74.006124,36.17002,-115.140154], number: 17, to: "Las Vegas, NV", marker: {fill: "#328bde"}, label: {enabled: true}},
    {points: [40.71262,-74.006124,38.931883,-74.906278], number: 16, to: "Cape May, NJ", marker: {fill: "#227ed7"}},
    {points: [40.71262,-74.006124,26.105904,-80.10741], number: 15, to: "Fort Lauderdale, FL", marker: {fill: "#1b74cf"}, label: {enabled: true}},
    {points: [40.71262,-74.006124,36.83094,-75.97903], number: 14, to: "Virginia Beach, VA", marker: {fill: "#216ec8"}},
    {points: [40.71262,-74.006124,43.560453,-73.641411], number: 13, to: "Lake George, NY", marker: {fill: "#2769c2"}, label: {enabled: true}},
    {points: [40.71262,-74.006124,40.653823,-73.107648], number: 12, to: "Fire Island, NY", marker: {fill: "#2d64bb"}},
    {points: [40.71262,-74.006124,41.25058,-70.004391], number: 11, to: "Nantucket, MA", marker: {fill: "#335eb4"}},
    {points: [40.71262,-74.006124,35.556088,-75.467633], number: 10, to: "Outer Banks, NC", marker: {fill: "#3a57ab"}, label: {enabled: true, anchor: 'top'}},
    {points: [40.71262,-74.006124,38.980089,-74.820254], number: 9, to: "Wildwood, NJ", marker: {fill: "#4250a2"}},
    {points: [40.71262,-74.006124,33.698234,-78.875056], number: 8, to: "Myrtle Beach, SC", marker: {fill: "#4a4998"}, label: {enabled: true}},
    {points: [40.71262,-74.006124,39.641815,-74.187045], number: 7, to: "Long Beach Island, NJ", marker: {fill: "#52418f"}},
    {points: [40.71262,-74.006124,42.006971,-74.386233], number: 6, to: "Catskills, NY", marker: {fill: "#5a3985"}, label: {enabled: true}},
    {points: [40.71262,-74.006124,41.664336,-70.463233], number: 5, to: "Cape Cod, MA", marker: {fill: "#63317a"}},
    {points: [40.71262,-74.006124,38.39482,-75.061095], number: 4, to: "Ocean City, MD", marker: {fill: "#6d2870"}},
    {points: [40.71262,-74.006124,41.040324,-71.923127], number: 3, to: "Montauk, NY", marker: {fill: "#762065"}},
    {points: [40.71262,-74.006124,41.2478,-75.248327], number: 2, to: "The Poconos, PA", marker: {fill: "#7f175a"}, label: {enabled: true}},
    {points: [40.71262,-74.006124,40.922888,-72.3563], number: 1, to: "The Hamptons, NY", marker: {fill: "#880e4f"}}
  ];

  stage = anychart.graphics.create('container');
  chart = anychart.connector(data);

  //chart.geoData(anychart.maps.world);
  chart.geoData(anychart.maps.united_states_of_america);

  chart.title().enabled(true).text('');

  series = chart.getSeriesAt(0);

  //series
  //    .markers()
  //      //.position(.1)
  //      .enabled(true)
  //      .stroke('none')
  //      .fill('red')
  //      .size(20)
  //
  //series
  //    .hoverMarkers()
  //      .size(20);
  //
  //series
  //    .curvature(0.5)
  //    .stroke('1 gray')
  //    .fill('gray .3')
  //    .endSize(20)
  //    .startSize(20);
  //
  //series
  //    .labels().enabled(false);
  //
  //series
  //    .hatchFill(true);


  // create connector series for directions
  series
      .startSize(0)
      .endSize(0)
      //.fill('#455a64')
      //.hoverFill('#1976d2')
      .hoverStroke('#1976d2')
      .stroke('#455a64')
      .markers({position: '100%', size: 5, fill: '#1976d2', stroke: '2 #E1E1E1', type: 'circle'})
      .hoverMarkers({position: '100%', size: 5, type: 'circle'})
      .curvature(0);

  series.labels()
      .enabled(false)
      .fontSize(12)
      .anchor('center')
      .offsetY(5)
      .offsetX(5)
      .position('100%')
      .textFormatter(function () {
        return this.getDataValue('to')
      });

  series.tooltip({padding: [8, 13, 10, 13]});
  series.tooltip().title().enabled(false);
  series.tooltip().separator().enabled(false);
  series.tooltip().useHtml(true).fontSize(13).textFormatter(function() {
    return '<span style="font-size: 12px; color: #E1E1E1">Number: </span>' + this.getDataValue('number') + '<br/>'+
        '<span style="font-size: 12px; color: #E1E1E1">Destination: </span>' + this.getDataValue('to');
  });

  //series.tooltip(false).labels().enabled(true).textFormatter(function() {return this.regionProperties.name});
  //
  //series.colorScale(anychart.scales.ordinalColor([
  //  {less: -100},
  //  {from: -100, to: 100},
  //  {greater: 100}
  //]));
  //chart.colorRange().enabled(true);



  //series2 = chart.bubble(dataSet);
  //series2.tooltip(false).labels().enabled(true).textFormatter(function() {return this['size']});

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
