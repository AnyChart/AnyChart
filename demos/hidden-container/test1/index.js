anychart.onDocumentReady(function() {
  //document.getElementById('container').style.display = 'none';
  document.getElementById('container1').style.display = 'none';
  var chart = anychart.radar();
  chart.xAxis().enabled(false);
  chart.line(['5', 5, 10, 5, 5]);
  chart.line([10, 10, 15, 10, 10]);
  chart.line([15, 15, 20, 15, 15]);
  chart.line([20, 20, 25, 20, 20]);
  chart.line([25, 25, 30, 25, 25]);
  chart.title().text('xAxis - enabled(false)');

  var chart1 = anychart.radar();
  chart1.xAxis().enabled(false);
  chart1.line(['5', 5, 10, 5, 5]);
  chart1.line([10, 10, 15, 10, 10]);
  chart1.line([15, 15, 20, 15, 15]);
  chart1.line([20, 20, 25, 20, 20]);
  chart1.line([25, 25, 30, 25, 25]);
  chart1.title().text('xAxis - enabled(false)');


  chart.container('container').draw();
  //document.getElementById('container').style.display = 'block';
  //document.getElementById('container').style.display = 'none';
  //document.getElementById('container').style.display = 'block';
  document.getElementById('container1').style.display = 'block';
  chart1.container('container1').draw();
});