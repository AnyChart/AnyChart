  var chart, newPie, seriesData;
var ranger, input;

function startAngle(value) {
  chart.startAngle(value);
  input.value = chart.startAngle();
}


function startAngleInp(value) {
  chart.startAngle(value);
  ranger.value = chart.startAngle();
}

anychart.onDocumentLoad(function() {
  //var stage = acgraph.create('container', 400, 300);
  //var chart5 = anychart.pie([5, 1]);
  //chart5.innerRadius(50);
  //chart5.explodeSlices(true);
  //chart5.container(stage);
  //chart5.draw();


  var dataSet = anychart.data.set([1,5,15,20]);
  var chart1 = anychart.circularGauge();
  chart1.data(dataSet);
  chart1.axis()
      .scale()
      .minimum(0)
      .maximum(20);
  chart1.cap()
      .radius(30)
      .fill(['yellow', 'green']);
  chart1.bounds(0,0,'50%', '50%');

  chart1.container('container').draw();
});