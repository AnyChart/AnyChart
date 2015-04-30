anychart.onDocumentReady(function() {
  var chart = anychart.line();
  chart.line([50,25,43]);
  chart.marker([21,10,60]);
  chart.legend(true);
  chart.listen('legenditemmousedown', function(){
    chart.title('Mouse down on legendItem');
  });
  chart.listen('legenditemmouseup', function(){
    chart.title('Chart Title');
  });
  chart.listen('pointmousedown', function(){
    chart.title('Mouse down on legendItem');
  });
  chart.listen('pointmouseup', function(){
    chart.title('Chart Title');
  });
  chart.container('container').draw();
});