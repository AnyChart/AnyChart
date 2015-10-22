var chart;

anychart.onDocumentReady(function() {

// create column chart
  chart = anychart.column();

// turn on chart animation
  chart.animation(true);

// set container id for the chart
  chart.container('container');

// set chart title text settings
  chart.title('Top 10 Cosmetic Products by Revenue');
  chart.title().enabled(false);

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
    ['Eyeshadows', '249980'],
    ['Eyeshadows1', '249980'],
    ['Eyeshadows2', '249980'],
    ['Eyeshadows3', '249980'],
    ['Eyeshadows4', '249980'],
    ['Eyeshadows5', '249980'],
    ['Eyeshadows6', '249980'],
    ['Eyeshadows7', '249980'],
    ['Eyeshadows8', '249980'],
    ['Eyeshadows9', '249980'],
    ['Eyeshadows10', '249980'],
    ['Eyeshadows11', '249980'],
    ['Eyeshadows12', '249980'],
    ['Eyeshadows13', '249980'],
    ['Eyeshadows14', '249980'],
    ['Eyeshadows15', '249980'],
    ['Eyeshadows16', '24998'],
    ['Eyeshadows17', '24998'],
    ['Eyeshadows18', '60000']
  ]);

// set series tooltip settings
  series.tooltip().titleFormatter(function() {
    return this.x
  });
  series.tooltip().textFormatter(function() {
    return '$' + parseInt(this.value).toLocaleString()
  });
  series.tooltip().position('top').anchor('bottom').offsetX(0).offsetY(5);

  series.labels().enabled(true).fontSize(100);
  series.hoverLabels().fontColor('red').enabled(true);

// set scale minimum
  chart.yScale().minimum(0);

// set yAxis labels formatter
  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });

// chart.tooltip().positionMode('point');
  chart.interactivity().hoverMode('single');

  chart.xAxis().enabled(false).title('Products by Revenue');
  chart.yAxis().enabled(false).title('Revenue in Dollars');

  series.labels().adjustFontSize(true).minFontSize(100).maxFontSize(80).width(100).height(50);

// initiate chart drawing
  chart.draw();
});


    