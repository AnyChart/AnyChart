var chart;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(400, 200, container);
  var layer = acgraph.layer();
  /////////////////////////////////////////////////////////

  * //margins
  * var margins = 20;
  * stage.rect(0, 0, stage.width(), stage.height()).fill('orange 0.1');
  * stage.text(stage.width() / 3, 0, 'margins');
  * //arrows
  * stage.path()
  *     .moveTo(stage.width() / 2, 0)
  *     .lineTo(stage.width() / 2, margins);
  * stage.triangleUp(stage.width() / 2, 3, 3);
  * stage.triangleDown(stage.width() / 2, margins - 3, 3);
  * stage.path()
  *     .moveTo(stage.width() / 2, stage.height() - margins)
  *     .lineTo(stage.width() / 2, stage.height());
  * stage.triangleUp(stage.width() / 2, stage.height() - margins + 3, 3);
  * stage.triangleDown(stage.width() / 2, stage.height() - 3, 3);
  * stage.path()
  *     .moveTo(0, stage.height() / 2)
  *     .lineTo(margins, stage.height() / 2);
  * stage.triangleUp(3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
  * stage.triangleDown(margins - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
  * stage.path()
  *     .moveTo(stage.width(), stage.height() / 2)
  *     .lineTo(stage.width() - margins, stage.height() / 2);
  * stage.triangleUp(stage.width() - margins + 3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
  * stage.triangleDown(stage.width() - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
  * //paddings
  * var paddings = 20;
  * stage.rect(margins, margins, stage.width() - 2 * margins, stage.height() - 2 * margins).fill('blue 0.1');
  * stage.text(stage.width() / 3, margins, 'paddings');
  * //arrows
  * stage.path()
  *     .moveTo(stage.width() / 2, 0 + margins)
  *     .lineTo(stage.width() / 2, paddings + margins);
  * stage.triangleUp(stage.width() / 2, 3 + margins, 3);
  * stage.triangleDown(stage.width() / 2, paddings - 3 + margins, 3);
  * stage.path()
  *     .moveTo(stage.width() / 2, stage.height() - paddings - margins)
  *     .lineTo(stage.width() / 2, stage.height() - margins);
  * stage.triangleUp(stage.width() / 2, stage.height() - paddings + 3 - margins, 3);
  * stage.triangleDown(stage.width() / 2, stage.height() - 3 - margins, 3);
  * stage.path()
  *     .moveTo(margins, stage.height() / 2)
  *     .lineTo(margins + paddings, stage.height() / 2);
  * stage.triangleUp(margins + 3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
  * stage.triangleDown(margins + paddings - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
  * stage.path()
  *     .moveTo(stage.width() - margins, stage.height() / 2)
  *     .lineTo(stage.width() - margins - paddings, stage.height() / 2);
  * stage.triangleUp(stage.width() - margins - paddings + 3, stage.height() / 2 + 5.5, 3).rotateByAnchor(-90, 'center');
  * stage.triangleDown(stage.width() - margins - 3, stage.height() / 2 + 4, 3).rotateByAnchor(-90, 'center');
  * //content area
  * stage.rect(paddings + margins, paddings + margins, stage.width() - 2 * (paddings + margins), stage.height() - 2 * (paddings + margins)).fill('white 1');
  * stage.text(stage.width() / 4, stage.height() / 2 - paddings, 'Chart Content Area').fontSize(21);

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
  //layer.parent(stage);
  //*/
}
