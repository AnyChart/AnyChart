var table, mapping, xScale, yScale, stage, controller, chart;
anychart.onDocumentReady(function() {
  table = anychart.data.table('date');
  table.addData(date_string());
  var mapping = table.mapAs({value:'close'});

  var c = table.createComputer(mapping);
  c.addOutputField('asdf', 'qwer');
  c.addOutputField('asdf1', 'qwerq');
  c.setContext({a: 1000});
  c.setCalculationFunction(function(row) {
    row.set('asdf', row.get('value') + this.a);
  });

  var c2 = table.createComputer(mapping);
  c2.addOutputField('asdf', 'qwer2');
  c2.setContext({a: 200});
  c2.setCalculationFunction(function(row) {
    row.set('asdf', row.get('value') + this.a);
  });

  c.dispose();

  var c3 = table.createComputer(mapping);
  console.log(c3.addOutputField('asdf', 'qwer'));
  c3.setContext({a: 100});
  c3.setCalculationFunction(function(row) {
    row.set('asdf', row.get('value') + this.a);
  });

  chart = anychart.stock();
  chart.padding(10,10,10,50);
  chart.plot().line(mapping);
  chart.plot().line(table, {value:'qwer2'});
  chart.plot().line(table, {value:'qwer'});
  chart.container('container').draw();
});