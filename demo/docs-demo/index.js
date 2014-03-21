var chart;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(400, 100, container);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  var palette = new anychart.utils.DistinctColorPalette()
      .colors(['red', 'yellow', 'brown', 'green']);
  palette.colorAt(2, 'white')
  for (var i = 1; i < 10; i++) {
    stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
        .fill(palette.colorAt(i))
        .stroke('1px #000');
  }

//  var rect = stage.rect(50, 30, 75, 125).stroke('1 #aaa').fill('#eee');

//  // create objects for multimarkers
//  var bars = [];
//  bars.push(
//      stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
//      stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
//      stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
//      stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
//  );
//  // sets global settings
//  var MMarker = new anychart.elements.Multimarker()
//      .fill('blue')
//      .stroke('.5 blue')
//      .container(stage);
//  // sets custom positions
//  MMarker
//      .fillAt(0, 'red')
//      .fillAt(3, 'none');
//  // connecting markers and objects
//  for (i in bars) {
//    var barBounds = bars[i].getBounds();
//    var positionProvider = {
//      x: barBounds.left,
//      y: barBounds.top
//    };
//    MMarker.draw(positionProvider);
//  }

//
//  layer.circle(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius(), center.y - Math.sin(Math.PI/3)*chart.getPixelRadius(), 4).fill('red .5').stroke('red');
//  layer.text(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius()+7, center.y - Math.sin(Math.PI/3)*chart.getPixelRadius() -10, '-60\u00B0');
//
//  layer.circle(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius(), center.y + Math.sin(Math.PI/3)*chart.getPixelRadius(), 4).fill('red .5').stroke('red');
//  layer.text(center.x + Math.cos(Math.PI/3)*chart.getPixelRadius()+7, center.y + Math.sin(Math.PI/3)*chart.getPixelRadius() -6, '60\u00B0');

//
//  var chart1 = new anychart.pie.Chart(data)
//      .container(stage)
//      .bounds(0,0,'50%', '100%')
//      .draw();
//  var chart2 = new anychart.pie.Chart(data)
//      .container(stage)
//      .bounds('50%',0,'50%', '100%')
//      .draw();
//
//  chart1.innerRadius('25%');
//  chart2.innerRadius(function(outerRadius){
//    console.log(out)
//    return parseFloat(outerRadius)/2;
//  });

//  leftPie.container(stage);
//  leftPie.draw();
//  rightPie.container(stage);
//  rightPie.draw();
//
  /////////////////////////////////////////////////////////
  /*
   chart.container(stage);
   chart.draw();
   layer.parent(chart.container());

   /*/
  layer.parent(stage);
  //*/
}
