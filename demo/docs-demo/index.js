var chart;
var radiusPixel=0;

function load() {
  var container = 'container';
  var stage = acgraph.create(400, 200, container);
  var layer = acgraph.layer();
  /////////////////////////////////////////////////////////

  new anychart.elements.Background('cut', '10 5 15 7')
     .bounds( new anychart.math.Rect(10, 10, stage.width()-20, stage.height() - 20) )
     .stroke('#000 2').fill({src: 'styles/images/rainbow.png'}).container(stage).draw();


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
