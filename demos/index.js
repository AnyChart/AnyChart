var chart;
anychart.onDocumentReady(function() {
  chart = anychart.line([
    {x: 'p1', value: 123},
    {x: 'p2', value: 512},
    {x: 'p3', value: 345},
    {x: 'p4', value: 645},
    {x: 'p5', value: 145},
    {x: 'p6', value: 245}
  ]);
  chart.container('container').draw();
  chart.xScale().values(['p1', 'p2', 'p3']);
  chart.xScale().names(['p10', 'p20', 'p30']);

  //chart = anychart.radar([
  //  {x: 'p1', value: 123},
  //  {x: 'p2', value: 512},
  //  {x: 'p3', value: 345},
  //  {x: 'p4', value: 645},
  //  {x: 'p5', value: 145},
  //  {x: 'p6', value: 245}
  //]);
  //chart.container('container').draw();
  //chart.xScale().values(['p1', 'p2', 'p3']);
  //chart.xScale().names(['p10', 'p20', 'p30']);

});