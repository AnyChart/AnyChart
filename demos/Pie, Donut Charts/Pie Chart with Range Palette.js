var chart;

anychart.onDocumentReady(function() {

  //create pie chart with passed data
  chart = anychart.pieChart([
    ['Product A', 1222],
    ['Product B', 2431],
    ['Product C', 3624],
    ['Product D', 5243],
    ['Product E', 8813]
  ]);

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Pie Chart');

  //create range color palette with color ranged between light blue and dark blue
  var palette = new anychart.utils.RangeColorPalette();
  palette.colors([
    {color: anychart.color.lighten('blue')},
    {color: anychart.color.darken('blue')}
  ]);

  //set palette to the chart
  chart.palette(palette);

  //initiate chart drawing
  chart.draw();
});
