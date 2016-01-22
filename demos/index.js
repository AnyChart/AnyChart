anychart.onDocumentReady(function() {

// create column chart
  chart = anychart.column();

// turn on chart animation
  chart.animation(true);

// set container id for the chart
  chart.container('container');

// set chart title text settings
  chart.title('Top 10 Cosmetic Products by Revenue');

// create area series with passed data
  var series = chart.column([
    ['Rouge', '80540'],
    ['Foundation', '94190'],
    ['Mascara', '102610'],
    ['Lip gloss', '110430'],
    ['Pomade', '128000'],
    ['Nail polish', '143760'],
    ['Eyebrow pencil', '170670'],
    ['Eyeliner', '213210'],
    ['Eyeshadows', '249980']
  ]);

// set series tooltip settings
  series.tooltip().titleFormatter(function() {
    return this.x
  });
  series.tooltip().textFormatter(function() {
    return '$' + parseInt(this.value).toLocaleString()
  });
  series.tooltip().position('top').anchor('bottom').offsetX(0).offsetY(5);

// set scale minimum
  chart.yScale().minimum(0);

// set yAxis labels formatter
  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });

  chart.tooltip().positionMode('point');
  chart.interactivity().hoverMode('byX');

  chart.xAxis().title('Products by Revenue');
  chart.yAxis().title('Revenue in Dollars');

  chart.rangeMarker(0)
      .from('Rouge')
      .to('Mascara')
      .layout('vertical');

// initiate chart drawing
  chart.draw();


});

