var parser, map, series;

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var min = 0, max = 350;

anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    {lat: 268.48507462686564, long: -464.94925373134333, size: 15},
    {lat: 147.0253731343284, long: -488.8865671641791, size: 18},
    {lat: 155.00447761194033, long: -281.4298507462687, size: 20}
  ]);


  map = anychart.map();
  map.geoData(anychart.maps.australia);
  map.maxBubbleSize('10%');
  map.minBubbleSize('3%');

  series = map.bubble(dataSet);
  series.color(map.palette().itemAt(2));
  series
      .labels(true)
      .geoIdField("code_hasc");

  series.labels().fontColor('black');

  series
      .hatchFill('diagonal')
      .hoverHatchFill('confetti')
      .selectHatchFill('percent60');

  map.container('container').draw();
});
