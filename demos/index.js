anychart.onDocumentLoad(function() {
  data = [
    ['Product A', 70],
    ['Product B', 40],
    ['Product C', 120],
    ['Product D', 40],
    ['Product E', 50],
    ['Product F', 70]
  ];


  chart = anychart.pyramid(data);
  chart.legend(true);
  chart.baseWidth('80%');

  chart.container('container').draw();
});