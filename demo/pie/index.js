var chart;
var summPointsValues = 0;
function load() {
  var data = [
    {value: '1', exploded: false},
    {value: '2', exploded: false},
    {value: '3', exploded: false},
    {value: '4', exploded: true},
    {value: '5', exploded: false},
    {value: '6', exploded: false}
  ];

  var pointData = [6371664, 7216301, 1486621, 786622, 900000];

  var seriesData = [
    {x: "Department Stores", y: pointData[0], fill: "rgb(29,139,209)", stroke: 'none'},
    {x: "Discount Stores", y: pointData[1], fill: "rgb(241,104,60)", stroke: 'none'},
    {x: "Men's/Women's Stores", y: pointData[2], fill: "rgb(42,214,42)", stroke: 'none'},
    {x: "Juvenile Specialty Stores", y: pointData[3], fill: "rgb(219,220,37)", stroke: 'none'},
    {x: "All other outlets", y: pointData[4], fill: "rgb(143,188,143)", stroke: 'none'}
  ];

  chart = new anychart.pie.Chart(seriesData)
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

  for (var i = 0; i < pointData.length; i++) {
    summPointsValues += pointData[i];
  }

//  chart.margin('1%', '2%');
  chart.labels()
     /* .textFormatter(function(formatProvider, index) {
        var value = parseFloat(formatProvider(index, 'value'));

        return Math.ceil(1000 * value / summPointsValues) / 10 + '%';
      })*/
      .fontSize(11)
      .fontColor('white');

  chart.background()
      .stroke('2 rgb(36,102,177)')
      .corners(10)
      .fill({
        keys: [
          "rgb(255,255,255) 1",
          "rgb(243,243,243) 1",
          "rgb(255,255,255) 1"
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
