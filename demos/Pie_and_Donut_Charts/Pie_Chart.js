anychart.onDocumentReady(function() {

  var stage = acgraph.create('container');

  var chart1 = anychart.pieChart([
    ['Chocolate paste', 5],
    ['White honey', 2],
    ['Strawberry jam', 2],
    ['Сondensed milk', 1]
  ]);
  chart1.container(stage);
  chart1.bounds(0, 0, 400, 400);

  chart2 = anychart.pieChart([
    {x: 'Air pollutants', value: 20, name: 'custom name'},
    {x: 'Farm runoff', value: 22.5},
    {x: 'Sewage', value: 20},
    {x: 'Litter', value: 2},
    {x: 'Offshore oil', value:7},
    {x: 'Wastewater', value: 9},
    {x: 'Maritime transportation', value: 11}
  ]);


  chart2.container(stage);
  chart2.bounds(0, 400, 400, 400);

  chart1.draw();
  chart2.draw();

});