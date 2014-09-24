anychart.onDocumentReady(function() {

  var series = anychart.cartesian.series.line([
    ['P1' , '125', '51'],
    ['P2' , '132', '91'],
    ['P3' , '141', '34'],
    ['P4' , '158', '47'],
    ['P5' , '133', '63'],
    ['P6' , '143', '58'],
    ['P7' , '176', '36'],
    ['P8' , '194', '77'],
    ['P9' , '115', '99'],
    ['P10', '134', '106'],
    ['P11', '110', '88'],
    ['P12', '91', '56']
  ]);
  series.container('container');
  series.draw();

});