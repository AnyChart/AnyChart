var chart, newPie, seriesData;
function resetAsXML() {
  var a = anychart.utils.json2xml(chart.serialize());
  document.getElementById('container').innerHTML = '';
  var q = anychart.xml(a);
  q.container('container').draw();
}
function load() {
  var pointData = [6371664, 7216301, 1486621, 786622, 900000];

  seriesData = [
    {x: 'Department Stores', y: pointData[0], fill: {
      keys: ['0 red 1', '0.5 green 1', '1 blue 1']
    }, stroke: 'none', hoverFill: 'pink'},
    {x: 'Discount Stores', y: pointData[1], fill: 'rgb(241,104,60)'},
    {x: 'Men\'s/Women\'s Stores', y: pointData[2], fill: 'rgb(42,214,42)'},
    {x: 'Juvenile Specialty Stores', y: pointData[3], fill: 'rgb(219,220,37)'},
    {x: 'All other outlets', y: pointData[4], fill: 'rgb(143,188,143)'}
  ];

  chart = new anychart.pie.Chart(seriesData)
      .container('container')
      .innerRadius('33%')
      .startAngle(0)
      .explode(15);

  chart.listen(anychart.events.EventType.POINT_CLICK, function(e) {
    console.log(e);
    return true;
  });

  chart.title()
      .text('ACME Corp. apparel sales through different retail channels');


  chart.background()
      .stroke('2 rgb(36,102,177)')
      .corners(10)
      .fill({
        keys: [
          'rgb(255,255,255) 1',
          'rgb(243,243,243) 1',
          'rgb(255,255,255) 1'
        ],
        angle: -90
      });

  chart.draw();
  var stage = chart.container();
  var trialText = stage.text(0, 0, 'AnyChart Trial Version', {
    opacity: 0.15,
    fontSize: chart.pixelBounds().height / 9
  });

  trialText.x(chart.pixelBounds().left + (chart.pixelBounds().width - trialText.getBounds().width) / 2)
      .y(chart.pixelBounds().top + (chart.pixelBounds().height - trialText.getBounds().height) / 2)
      .pointerEvents('none');
}

var foo = function() {
  chart.group(function(val) {
    return val > 1500000;
  });
  chart.sort('asc');
  var iterator = chart.data().getIterator();
  while (iterator.advance()) {
    if (iterator.meta('groupedPoint')) {
      console.log(iterator.meta('names'));
      console.log(iterator.meta('values'))
    }
  }
};

var bar = function() {
  chart.container().removeChildren();
  var json = chart.serialize();
  newPie = anychart.json(json);
  newPie.container(chart.container());
  newPie.draw();
};
