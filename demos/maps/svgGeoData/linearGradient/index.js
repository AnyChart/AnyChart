var stage, chart;

$(document).ready(function() {
  stage = anychart.graphics.create('container');


  // stage.rect(30, 30, 10, 10).fill({keys: ['red', 'green'], angle: 180});

  // stage.rect(10, 30, 10, 10).fill({keys: ['red', 'green'], angle: 0});
  // stage.rect(10, 50, 10, 10).fill({keys: ['red', 'green'], angle: 45});
  // stage.rect(30, 50, 10, 10).fill({keys: ['red', 'green'], angle: 90});
  // stage.rect(50, 50, 10, 10).fill({keys: ['red', 'green'], angle: 135});
  // stage.rect(50, 30, 10, 10).fill({keys: ['red', 'green'], angle: 180});
  // stage.rect(50, 10, 10, 10).fill({keys: ['red', 'green'], angle: 225});
  // stage.rect(30, 10, 10, 10).fill({keys: ['red', 'green'], angle: 270});
  // stage.rect(10, 10, 10, 10).fill({keys: ['red', 'green'], angle: 315});

  stage.rect(10, 30, 10, 10).fill({keys: ['red', 'green'], angle: 0, mode: anychart.math.rect(10, 30, 10, 10)});
  stage.rect(10, 50, 10, 10).fill({keys: ['red', 'green'], angle: 45, mode: anychart.math.rect(10, 50, 10, 10)});
  stage.rect(30, 50, 10, 10).fill({keys: ['red', 'green'], angle: 90, mode: anychart.math.rect(30, 50, 10, 10)});
  stage.rect(50, 50, 10, 10).fill({keys: ['red', 'green'], angle: 135, mode: anychart.math.rect(50, 50, 10, 10)});
  stage.rect(50, 30, 10, 10).fill({keys: ['red', 'green'], angle: 180, mode: anychart.math.rect(50, 30, 10, 10)});
  stage.rect(50, 10, 10, 10).fill({keys: ['red', 'green'], angle: 225, mode: anychart.math.rect(50, 10, 10, 10)});
  stage.rect(30, 10, 10, 10).fill({keys: ['red', 'green'], angle: 270, mode: anychart.math.rect(30, 10, 10, 10)});
  stage.rect(10, 10, 10, 10).fill({keys: ['red', 'green'], angle: 315, mode: anychart.math.rect(10, 10, 10, 10)});


  var data = stage.toSvg();
  // var data = '' +
  //     '<svg xmlns="http://www.w3.org/2000/svg">' +
  //     '<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="93" y1="169.5" x2="348" y2="169.5">' +
  //     '<stop offset="0" style="stop-color:#FFFFFF;"/>' +
  //     '<stop offset="1" style="stop-color:#000000;"/>' +
  //     '</linearGradient>' +
  //     '<rect x="93" y="108" fill="url(#SVGID_1_)" stroke="#000000" stroke-miterlimit="10" width="255" height="123"/>' +
  //     '</svg>';

  chart = anychart.map();
  chart.geoData(data);
  chart.interactivity().zoomOnMouseWheel(true);
  chart.unboundRegions('asis');

  chart.container(stage).draw();
});
