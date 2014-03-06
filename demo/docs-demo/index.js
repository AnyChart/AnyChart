var chart;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(400, 300, container);
  var layer = acgraph.layer();
  /////////////////////////////////////////////////////////


  var orange = '1 orange 1';
  var star = stage.star5(stage.width() / 2, stage.height() / 3, stage.height() / 4).fill('none').stroke('none');
  var pathBounds = star.getBounds();
  stage.path().fill('none').stroke('1 grey .2')
      .moveTo(pathBounds.left, pathBounds.top)
      .lineTo(pathBounds.left + pathBounds.width, pathBounds.top)
      .lineTo(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height)
      .lineTo(pathBounds.left, pathBounds.top + pathBounds.height)
      .close();
  stage.text(pathBounds.left - 55, pathBounds.top - 15, 'LEFT_TOP');
  stage.circle(pathBounds.left, pathBounds.top, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
      .lineTo(pathBounds.left, pathBounds.top);
  stage.text(pathBounds.left - 78, pathBounds.top + pathBounds.height / 2 - 8, 'LEFT_CENTER');
  stage.circle(pathBounds.left, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + pathBounds.height / 2 + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + pathBounds.height / 2 + 15)
      .lineTo(pathBounds.left, pathBounds.top + pathBounds.height / 2);
  stage.text(pathBounds.left - 80, pathBounds.top + pathBounds.height, 'LEFT_BOTTOM');
  stage.circle(pathBounds.left, pathBounds.top + pathBounds.height, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + pathBounds.height- 15, 5)
      .rotateByAnchor(35, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + pathBounds.height- 15)
      .lineTo(pathBounds.left, pathBounds.top+ pathBounds.height);
  stage.text(pathBounds.left + pathBounds.width / 2 - 10, pathBounds.top - 18, 'TOP');
  stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top, 3).fill('blue');
  stage.triangleUp(pathBounds.left + pathBounds.width / 2+ 15, pathBounds.top + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left+ pathBounds.width / 2 + 15, pathBounds.top + 15)
      .lineTo(pathBounds.left+ pathBounds.width / 2, pathBounds.top);
  stage.text(pathBounds.left + pathBounds.width / 2 - 20, pathBounds.top + pathBounds.height / 2 - 15, 'CENTER');
  stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
      .lineTo(pathBounds.left, pathBounds.top);
  stage.text(pathBounds.left + pathBounds.width / 2 - 23, pathBounds.top + pathBounds.height + 2, 'BOTTOM');
  stage.circle(pathBounds.left + pathBounds.width / 2, pathBounds.top + pathBounds.height, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
      .lineTo(pathBounds.left, pathBounds.top);
  stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top - 15, 'RIGHT_TOP');
  stage.circle(pathBounds.left + pathBounds.width, pathBounds.top, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
      .lineTo(pathBounds.left, pathBounds.top);
  stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height / 2 - 8, 'RIGHT_CENTER');
  stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height / 2, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
      .lineTo(pathBounds.left, pathBounds.top);
  stage.text(pathBounds.left + pathBounds.width + 5, pathBounds.top + pathBounds.height, 'RIGHT_BOTTOM');
  stage.circle(pathBounds.left + pathBounds.width, pathBounds.top + pathBounds.height, 3).fill('blue');
  stage.triangleUp(pathBounds.left + 15, pathBounds.top + 15, 5)
      .rotateByAnchor(25, acgraph.vector.Anchor.CENTER).fill('green');
  stage.path().moveTo(pathBounds.left + 15, pathBounds.top + 15)
      .lineTo(pathBounds.left, pathBounds.top);

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
