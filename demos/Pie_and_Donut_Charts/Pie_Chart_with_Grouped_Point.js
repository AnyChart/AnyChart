anychart.onDocumentReady(function() {

  //create pie chart with passed data
  var chart = anychart.pieChart([
    ['Product A', 1222],
    ['Product B', 2431],
    ['Product C', 3624],
    ['Product D', 5243],
    ['Product E', 8813],
    ['Product F', 450],
    ['Product G', 360],
    ['Product H', 240],
    ['Product I', 420]
  ]);

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Pie Chart');

  chart.group(function(value) {
    return (value >= 1000);
  });

  //initiate chart drawing
  chart.draw();
});
