  var chart, newPie, seriesData;
var ranger, input;

function startAngle(value) {
  chart.startAngle(value);
  input.value = chart.startAngle();
}

function startAngleInp(value) {
  chart.startAngle(value);
  ranger.value = chart.startAngle();
}

anychart.onDocumentLoad(function() {
  var pointData2 = [100, 50, 3];

  var seriesData2 = [
//    {x: 'All other outlets', y: 1000},

    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},

    {x: 'Department Stores', hoverLabel: {enabled: true}, y: pointData2[1], fill: {keys: ['0 red 1', '0.5 green 1', '1 blue 1']}, stroke: 'none', hoverFill: 'pink'},
    {x: 'Department Stores', label: {enabled: true}, y: pointData2[0], fill: {keys: ['0 red 1', '0.5 green 1', '1 blue 1']}, stroke: 'none', hoverFill: 'pink'},

    {x: 'All \nother \noutlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},

    {x: 'Discount Stores', y: pointData2[1]},

    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},


    {x: 'Discount Stores', y: pointData2[1]},
    {x: 'Discount Stores', y: pointData2[1]},
    {x: 'Discount Stores', y: pointData2[1]},

    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},

    {x: 'Men\'s/Women\'s Stores', y: pointData2[1]},

    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},
    {x: 'All other outlets', y: pointData2[2]},

    {x: 'Juvenile Specialty Stores', y: pointData2[1]}
  ];


  var seriesData3 = [];
  for (var i = 0; i < 450; i++) {
    seriesData3.push({x: 'All other outlets', y: pointData2[2]});
  }

  chart = anychart.pie.chart(seriesData2)
      .container('container')
      .innerRadius('33%')
      .outsideLabelsSpace('30%')
      .connectorLength('20%')
      .outsideLabelsCriticalAngle(60)
      .connectorStroke('black .3', 1.5, '4 2')
      .radius('50%')
      .startAngle(160)
      .explode(55);
  chart.labels().position('outside');

  chart.listen(anychart.enums.EventType.POINT_CLICK, function(e) {
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

  chart.labels()
      .enabled(true)
      .fontColor('black')
      .textFormatter(function() {return this.x + ' ' + this.index});
  chart.credits(false);

  chart.draw();



  ranger = document.getElementById('startAngle');
  input = document.getElementById('startAngleInp');

  ranger.value = chart.startAngle();
  input.value = chart.startAngle();
});