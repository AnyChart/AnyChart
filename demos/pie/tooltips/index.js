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

  var seriesData = [
    {name: 'Air pollutants', value: 20},
    {name: 'Farm runoff', value: 22.5},
    {name: 'Sewage', value: 20},
    {name: 'Litter', value: 2},
    {name: 'Offshore oil', value:7},
    {name: 'Wastewater', value: 9},
    {name: 'Maritime transportation', value: 11}
  ];

  var seriesData = [1,2,3,4,5,6,6,7];

  chart = anychart.pie(seriesData)
      .container('container')
//      .innerRadius('33%')
//      .labelsPosition('outside')
//      .outsideLabelsSpace('30%')
//      .outsideLabelsMargin('30%')
//      .outsideLabelsCriticalAngle(60)
//      .connectorStroke('black .3', 1.5, '4 2')
      .radius('50%')
      .startAngle(160)
      .explode(55);

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
//      .textFormatter(function() {return this.x + ' ' + this.index});
  chart.credits(false);

  chart.draw();



  ranger = document.getElementById('startAngle');
  input = document.getElementById('startAngleInp');

  ranger.value = chart.startAngle();
  input.value = chart.startAngle();
});