var chart, newPie, seriesData;

function load() {
  var pointData = [6371664, 7216301, 1486621, 786622, 900000];

  seriesData = [
    {x: '(Department Stores)', y: pointData[0], fill: {
      keys: ['0 red 1', '0.5 green 1', '1 blue 1']
    }, stroke: 'none', hoverFill: 'pink'},
    {x: 'Discount Stores', y: pointData[1], fill: 'rgb(241,104,60)'},
    {x: 'Men\'s/Women\'s Stores', y: pointData[2], fill: 'rgb(42,214,42)'},
    {x: 'Juvenile Specialty Stores', y: pointData[3], fill: 'rgb(219,220,37)'},
    {x: 'All other outlets', y: pointData[4], fill: 'rgb(143,188,143)'}
  ];

  chart = new anychart.charts.Pie(seriesData)
      .container('container')
      .innerRadius('33%')
      .startAngle(0)
      .explode(15);

  chart.title()
      .height(30)
      .vAlign('middle')
      .text('ACME Corp. apparel sales through different retail channels')
      .fontWeight('bold')
      .fontSize(11)
      .fontFamily('Tahoma');

  chart.margin('1%', '2%');
  chart.labels()
      .fontSize(11)
      .fontColor('white');

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

}

var foo = function() {
  chart.setOtherPoint('group', function(val) {
    return val > 1500000
  });
  chart.sort('asc');
  document.getElementById('bar')['disabled'] = false;
};

var bar = function() {
  chart.container().removeChildren();
  var json = chart.serialize();
  console.log(json);
  newPie = anychart.json(json);
  newPie.container(chart.container());
  newPie.draw();
};
