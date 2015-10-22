var parser, map, s1, s2, s3, s, axis, axis_lin, cs, cr;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var min = 0, max = 350;
var dataSet1 = anychart.data.set([
  {id: 'US-MN', 'value': randomExt(min, max)},
  {id: 'US-MT', 'value': randomExt(min, max)},
  {id: 'US-ND', 'value': randomExt(min, max)},
  {id: 'US-ID', 'value': randomExt(min, max)},
  {id: 'US-WA', 'value': randomExt(min, max)},
  {id: 'US-AZ', 'value': randomExt(min, max)},
  {id: 'US-CA', 'value': randomExt(min, max)},
  {id: 'US-CO', 'value': randomExt(min, max)},
  {id: 'US-NV', 'value': randomExt(min, max)},
  {id: 'US-NM', 'value': randomExt(min, max)},
  {id: 'US-OR', 'value': randomExt(min, max)},
  {id: 'US-UT', 'value': randomExt(min, max)},
  {id: 'US-WY', 'value': randomExt(min, max)},
  {id: 'US-AR', 'value': randomExt(min, max)}
    ]);
var dataSet2 = anychart.data.set([
  {id: 'US-IA', 'value': randomExt(min, max)},
  {id: 'US-KS', 'value': randomExt(min, max)},
  {id: 'US-MO', 'value': randomExt(min, max)},
  {id: 'US-NE', 'value': randomExt(min, max)},
  {id: 'US-OK', 'value': randomExt(min, max)},
  {id: 'US-SD', 'value': randomExt(min, max)},
  {id: 'US-LA', 'value': randomExt(min, max)},
  {id: 'US-TX', 'value': randomExt(min, max)},
  {id: 'US-CT', 'value': randomExt(min, max)},
  {id: 'US-MA', 'value': randomExt(min, max)},
  {id: 'US-NH', 'value': randomExt(min, max)},
  {id: 'US-RI', 'value': randomExt(min, max)},
  {id: 'US-VT', 'value': randomExt(min, max)},
  {id: 'US-AL', 'value': randomExt(min, max)},
  {id: 'US-FL', 'value': randomExt(min, max)},
  {id: 'US-GA', 'value': randomExt(min, max)},
  {id: 'US-MS', 'value': randomExt(min, max)}
    ]);
var dataSet3 = anychart.data.set([
  {id: 'US-SC', 'value': randomExt(min, max)},
  {id: 'US-IL', 'value': randomExt(min, max)},
  {id: 'US-IN', 'value': randomExt(min, max)},
  {id: 'US-KY', 'value': randomExt(min, max)},
  {id: 'US-NC', 'value': randomExt(min, max)},
  {id: 'US-OH', 'value': randomExt(min, max)},
  {id: 'US-TN', 'value': randomExt(min, max)},
  {id: 'US-VA', 'value': randomExt(min, max)},
  {id: 'US-WI', 'value': randomExt(min, max)},
  {id: 'US-WV', 'value': randomExt(min, max)},
  {id: 'US-DE', 'value': randomExt(min, max)},
  {id: 'US-DC', 'value': randomExt(min, max)},
  {id: 'US-MD', 'value': randomExt(min, max)},
  {id: 'US-NJ', 'value': randomExt(min, max)},
  {id: 'US-NY', 'value': randomExt(min, max)},
  {id: 'US-PA', 'value': randomExt(min, max)},
  {id: 'US-ME', 'value': randomExt(min, max)},
  {id: 'US-MI', 'value': randomExt(min, max)}
]);

anychart.onDocumentReady(function() {
  map = anychart.map();

  map.geoData(anychart.maps.usa_mainland);
  //map.geoData(anychart.maps.australia);
  //map.geoData(Highcharts.maps["countries/us/us-all"]);
  map.legend()
      .itemsLayout(anychart.enums.Layout.VERTICAL)
      .itemsSourceMode(anychart.enums.LegendItemsSourceMode.CATEGORIES)
      //.itemsSourceMode(anychart.enums.LegendItemsSourceMode.DEFAULT)
      .enabled(true)
      .position('right')
      .align('bottom')
      .margin(20);

  map.colorRange({orientation: 'right', colorLineSize: 45, length: '70%', stroke: null});
  //cr = map.colorRange();
  //cr.orientation('bottom');
  //cr.colorLineSize(45);
  //cr.padding().top(50);
  //cr.length('70%');
  //cr.stroke(null);
  //cr.ticks().stroke('rgb(216,216,216)');
  //cr.ticks().position('center').length(15);


  //cr.align('center');
  //cr.width('70%');
  //cr.marker().size(5);
  //cr.labels().offsetX(-10);
  //cr.minorTicks(false);
  //cr.minorTicks().position('inside').length(45);
  //cr.marker().offsetY(-20);

  s1 = map.choropleth(dataSet1);
  s1.geoIdField('iso_3166_2');
  s1.stroke('#000 .3');
  s1.selectFill('#5588ff');
  s1.hoverFill('#FBFF28');
  s1.hoverStroke('2 black');
  s1.markers(true);
  s1.labels(false);

  //s2 = map.choropleth(dataSet2).geoIdField('iso_3166_2').markers(true).labels(false);
  //s3 = map.choropleth(dataSet3).geoIdField('iso_3166_2').markers(true).labels(false);

  //cs = anychart.scales.linearColor();
  //cs = anychart.scales.linearColor('#4d7f17', '#4d7f17', '#6bb120', '#8ae429', '#9afe2e', '#aefe57');
  //cs = anychart.scales.linearColor('#EFEFFF', "#7cb5ec", "rgb(0,54,109)");
  //cs.ticks().count(4);
  //cs.minimum(min).maximum(max);

  var ranges = [
    {less: 50},
    {from: 50, to: 100},
    {from: 100, to: 150},
    {from: 150, to: 200},
    {from: 200, to: 250},
    {from: 250, to: 300},
    {greater: 300}
  ];
  cs = anychart.scales.ordinalColor(ranges);
  //cs.colors(anychart.color.singleHueProgression('#000', ranges.length, 0.9, 0.2));
  //cs.colors(anychart.color.bipolarHueProgression());
  //cs.colors(['#FF6363', '#FF3939', '#C50000', '#9B0000']);
  //cs.colors(anychart.color.singleHueProgression('red', cs.ranges().length, 0));
  cs.colors(anychart.color.blendedHueProgression(undefined, undefined, cs.ranges().length));
  //cs.colors([
  //  goog.color.hslArrayToHex([0, 1,.5]),
  //  goog.color.hslArrayToHex([45, 1,.5]),
  //  goog.color.hslArrayToHex([90, 1, .5]),
  //  goog.color.hslArrayToHex([135, 1, .5]),
  //  goog.color.hslArrayToHex([180, 1, .5]),
  //  goog.color.hslArrayToHex([225, 1, .5]),
  //  goog.color.hslArrayToHex([270, 1, .5])
  //]);


  s1.colorScale(cs);
  //s1.hover();


  //s1.enabled(false);

  //map.unboundRegions(true);
  //map.padding(0).margin(0);

  map.markerPalette([anychart.enums.MarkerType.STAR7, anychart.enums.MarkerType.STAR4, anychart.enums.MarkerType.CROSS]);
  map.container('container').draw();
});
