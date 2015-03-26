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

  var dataWithMissing = [
    {name: 'point - 0', value: 10},
    {name: 'point - 1', value: 8},
    {name: 'point - 2', value: 20, hoverLabel: {fontSize: 24}},
    {name: 'point - 3', value: 14, label: {fontSize: 24}, hoverLabel: {fontSize: 34}},
    {name: 'point - 4', value: 7},
    {name: 'missing point', value: -10},
    {value: 5},
    '17',
    5
  ];

  var data = [
    {name: "Product A", value: "1432"},
    {name: "Product B", value: "2431"},
    {name: "Product C", value: "3624"},
    {name: "Product D", value: "5243"},
    {name: "Product E", value: "8813"}
  ];


  chart = anychart.pie(data)
      .container('container')
      //.innerRadius('33%')
      .insideLabelsOffset('60%')
      .startAngle(0);
      //.explode(15);
  //chart.hatchFill('vertical');
  //chart.hoverHatchFill('horizontal');
  //chart.listen(anychart.enums.EventType.POINT_CLICK, function(e) {
  //  console.log(e);
  //  return true;
  //});

  //chart.explodeSlices(true);

  //chart.fill('aquaStyle');
  chart.fill(['blue .2', 'gray'], 0.6, 0.7, null, 1, .5, .3);

  chart.title()
      .text('ACME Corp. apparel sales through different retail channels');

  chart.labels()
      .enabled(true)
      .position('intside');

  chart.hoverLabels()
      .enabled(true);
  //chart.labels().textFormatter(function() {
    //if (this.index == 8) return 'sdfsdf';
    //else return '0';
    //return this.value;
  //});
  //chart.hoverLabels().fontColor('pink').fontSize(25);
  chart.draw();
}
