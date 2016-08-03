anychart.onDocumentReady(function() {
  chart1 = anychart.radar();
  chart1.title().text('Markers lefttop (with settings markers)');
  chart1.area([
    {x: 0, y: '4', marker: {fill: 'red', size: 7}},
    {x: 1, y: 10, marker: {fill: 'green', stroke: '3 red', size: 7}},
    {x: 2, y: -1, marker: {fill: 'yellow', type: 'star5', size: 7}},
    {x: 3, y: 10, marker: {fill: 'blue', offsetX: 8, size: 7}},
    {x: 4, y: 4, marker: {fill: 'gray', offsetY: -10, size: 7}}
  ])
      .markers()
      .enabled(true)
      .anchor('lefttop');
  chart1.container('container').draw();
});