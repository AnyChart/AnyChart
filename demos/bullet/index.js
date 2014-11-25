anychart.onDocumentReady(function() {
  stage = anychart.graphics.create('container');

  var chart_1 = anychart.bullet([{value: '6'}]);
  chart_1.container(stage);
  chart_1.bounds(0, 0, '100%', 150);
  chart_1.layout('horizontal');
  chart_1.range().from(0).to(5);
  chart_1.range(1).from(5).to(10);
  chart_1.range(2).from(10).to(15);
  chart_1.container(stage);
  chart_1.draw();




//  var chart_2 = anychart.bullet([{value: '12'}]);
//  chart_2.container(stage);
//  chart_2.bounds(160, 0, 150, '100%');
//  chart_2.layout('vertical');
//  chart_2.range().from(0).to(5).fill('#828282');
//  chart_2.range(1).from(5).to(10).fill('#a8a8a8');
//  chart_2.range(2).from(10).to(15).fill('#c2c2c2');
//  chart_2.container(stage);
//  chart_2.draw();
//
//  var chart_3 = anychart.bullet([{value: '8'}]);
//  chart_3.container(stage);
//  chart_3.bounds(320, 0, 150, '100%');
//  chart_3.layout('vertical');
//  chart_3.range().from(0).to(5).fill('#828282');
//  chart_3.range(1).from(5).to(10).fill('#a8a8a8');
//  chart_3.range(2).from(10).to(15).fill('#c2c2c2');
//  chart_3.container(stage);
//  chart_3.draw();
});