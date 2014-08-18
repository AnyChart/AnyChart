anychart.onDocumentReady(function() {

  chart = anychart.pieChart([
    ['Chocolate paste', 5],
    ['White honey', 2],
    ['Strawberry jam', 2],
    ['Сondensed milk', 1]
  ]);
  chart.title().text('The kind of pancakes preferred at the Sochi 2014 Olympic Games');
  chart.container('container');
  chart.draw();

});