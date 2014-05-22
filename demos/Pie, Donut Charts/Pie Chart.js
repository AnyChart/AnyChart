anychart.onDocumentReady(function() {

  //create pie chart with passed data
  var chart = anychart.pieChart([
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

  //enable legend title and title separator
  chart.legend().title().enabled(true);
  chart.legend().titleSeparator().enabled(true);

  //set legend title text settings
  chart.legend().title().text('Products Sales');

  //set legend position and items layout
  chart.legend().position('bottom');
  chart.legend().itemsLayout('horizontal');
  chart.legend().align('center');

  //initiate chart drawing
  chart.draw();
});
