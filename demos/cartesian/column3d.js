// super demo (z distr)
//anychart.onDocumentReady(function() {
//  var dataSet = anychart.data.set([
//    [18],
//    [15],
//    [16],
//    [21]
//  ]);
//  seriesData = dataSet.mapAs({'value': [0]});
//
//  chart = anychart.cartesian3d();
//  chart.area([4, 4, 9, 7]);
//  chart.legend(true);
//  chart.container('container').draw();
//  chart.addSeries(seriesData, [10, 20, 4]);
//});

anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Nail polish',    22, 23, 25, 63],
    ['Eyebrow pencil', 34, 45, 56, 29],
    ['Pomade',         16, 46, 67, 56],
    ['P1',             32, 86, 32, 49],
    ['P2',             68, 45, 27, 97]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create column chart
  var chart = anychart.column3d();
  window.chart = chart;

  // turn on chart animation
  //chart.animation(true);

  // set chart title text settings
  chart.title('Top 3 Products with Region Sales Data');

  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });

  // set titles for Y-axis
  chart.yAxis().title('Revenue in Dollars');
  //chart.yScale().stackMode('value');

  // helper function to setup label settings for all series
  var setupSeriesLabels = function(series, name) {
    var seriesLabels = series.labels();
    series.hoverLabels().enabled(false);
    seriesLabels.enabled(true);
    seriesLabels.position('top');
    seriesLabels.textFormatter(function(){
     return '$' + this.value.toLocaleString();
    });
    seriesLabels.anchor('bottom');
    series.markers(true);
    //series.hatchFill(true);
    series.name(name);
    series.tooltip().titleFormatter(function () {
      return this.x;
    });
    series.tooltip().textFormatter(function () {
      return this.seriesName + ': $' + parseInt(this.value).toLocaleString();
    });
    series.tooltip().position('top').anchor('bottom').offsetX(0).offsetY(5);
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeriesLabels(series, 'Florida');

  // create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeriesLabels(series, 'Texas');

  // create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeriesLabels(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeriesLabels(series, 'Nevada');
  // add second yScale
  //var yAxis2 = chart.yAxis(1);
  //yAxis2.orientation("right");
  //yAxis2.title("First additional axis");
  //var extraYScale = anychart.scales.linear();
  //extraYScale.minimum(0);
  //extraYScale.maximum(10000);
  //yAxis2.scale(extraYScale);
  //series.yScale(extraYScale);

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);

  chart.interactivity().hoverMode('single');
  chart.tooltip().positionMode('point');

  // create line marker
  firstMarker = chart.lineMarker(0);
  // set line color
  firstMarker.stroke("#090");
  // bind marker to scale
  firstMarker.scale(chart.yScale());
  // set markers position on plot
  firstMarker.value(70);

  // create second marker
  secondMarker = chart.lineMarker(1);
  // line visual settings
  secondMarker.stroke({
    // set line color
    color: "#dd2c00",
    // set dashes
    dash: 7,
    // set stroke opacity
    opacity: 1});
  // bind marker to scale
  secondMarker.scale(chart.yScale());
  // set markers position
  secondMarker.value(40);


  //chart.xScroller(true);
  //chart.zAspect(10);
  chart.zAspect('50%');
  //chart.zPadding(10);
  chart.zDistribution(true);
  //chart.zDepth(100);

  chart.container('container').draw();
});



// ---------------------------------------------------------------------------------------------------------------------


anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Nail polish', 12814, 3054, 4376, 4229],
    ['Eyebrow pencil', 13012, 5067, 3987, 3932],
    ['Rouge', 11624, 7004, 3574, 5221],
    ['Pomade', 8814, 9054, 4376, 9256],
    ['Eyeshadows', 12998, 12043, 4572, 3308],
    ['Eyeliner', 12321, 15067, 3417, 5432],
    ['Foundation', 10342, 10119, 5231, 13701],
    ['Lip gloss', 22998, 12043, 4572, 4008],
    ['Mascara', 11261, 10419, 6134, 18712]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the second series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create bar chart
  var chart = anychart.column3d();
  window.chart2 = chart;

  // turn on chart animation
  //chart.animation(true);

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('percent');

  // set container id for the chart
  chart.container('container2');

  // set chart title text settings
  chart.title('Regional ratio of cosmetic products sales');
  chart.title().padding([0,0,10,0]);

  // set yAxis labels formatting, force it to add % to values
  chart.yAxis(0).labels().textFormatter(function(info) {
    return info.value + '%';
  });

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.markers(true);
    //series.stroke('2 #fff 1');
    series.name(name);
    //series.hoverStroke('2 #fff 1');
    series.tooltip().titleFormatter(function(){
      return this.x
    });
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeries(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeries(series, 'Nevada');

  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,25,0]);

  // initiate chart drawing
  chart.draw();
});


// ---------------------------------------------------------------------------------------------------------------------


anychart.onDocumentReady(function() {

  // create column chart
  var chart = anychart.column3d();
  window.chart3 = chart;

  // turn on chart animation
  //chart.animation(true);

  // set container id for the chart
  chart.container('container3');

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

  series.markers(true);

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

  // initiate chart drawing
  chart.draw();


});


// ---------------------------------------------------------------------------------------------------------------------


anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Lip gloss', 22998, 12043],
    ['Eyeliner', 12321, 15067],
    ['Eyeshadows', 12998, 12043],
    ['Powder', 10261, 14419],
    ['Mascara', 11261, 10419],
    ['Foundation', 10342, 10119],
    ['Rouge', 11624, 7004],
    ['Pomade', 8814, 9054],
    ['Eyebrow pencil', 11012, 5067],
    ['Nail polish', 9814, 3054]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // create column chart
  var chart = anychart.column3d();

  // turn on chart animation
  //chart.animation(true);

  // set container id for the chart
  chart.container('container4');
  window.chart4 = chart;

  // set chart title text settings
  chart.title('Top 10 Products by Revenue in two Regions');
  chart.title().padding([0,0,10,0]);

  // temp variable to store series instance
  var series;

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.markers(true);
    series.name(name);
    series.tooltip().valuePrefix('$');
    series.selectFill('#f48fb1 0.8').selectStroke('1.5 #c2185b');
  };

  // create first series with mapped data
  series = chart.column(seriesData_1);
  series.xPointPosition(0.25);
  setupSeries(series, 'Florida');


  // create second series with mapped data
  series = chart.column(seriesData_2);
  series.xPointPosition(0.45);
  setupSeries(series, 'Texas');

  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });

  // set titles for Y-axis
  chart.yAxis().title('Revenue in Dollars');

  // set chart title text settings
  chart.barGroupsPadding(0.3);
  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);

  chart.interactivity().hoverMode('single');

  // initiate chart drawing
  chart.draw();
});


// ---------------------------------------------------------------------------------------------------------------------


anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['2001', 128.14, -90.54, -43.76, -122.56],
    ['2002', 112.61, 104.19, 61.34, -87.12],
    ['2003', -123.21, 135.12, -34.17, 54.32]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create column chart
  var chart = anychart.column3d();
  window.chart5 = chart;

  // turn on chart animation
  //chart.animation(true);

  // set container id for the chart
  chart.container('container5');

  // set chart title text settings
  chart.title('Company Profit Dynamic in Regions by Year');
  chart.title().padding([0,0,5,0]);
  chart.interactivity().hoverMode('single');

  chart.xAxis(1).orientation('top');
  chart.yAxis().title('Profit in Dollars');
  chart.yAxis().labels().textFormatter(function(){
    if (this.value == 0) return this.value;
    return this.value + 'k.'
  });

  var zeroMarker = chart.lineMarker(0);
  zeroMarker.stroke("#ddd");
  zeroMarker.scale(chart.yScale());
  zeroMarker.value(0);

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.markers(true);
    series.name(name);
    series.labels().enabled(true);
    series.tooltip().titleFormatter(function(){return this.x});
    series.tooltip().textFormatter(function () {
      return this.seriesName + ': ' + parseInt(this.value).toLocaleString() + 'k.';
    });
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeries(series, 'Nevada');

  // create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeries(series, 'Arizona');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);

  var grid = chart.grid();
  grid.enabled(true).stroke("#ddd");
  //grid.drawLastLine(false);
  grid.layout("horizontal");

  chart.barsPadding(0.1);
  chart.barGroupsPadding(0.9);
  // initiate chart drawing
  chart.draw();
});


// ---------------------------------------------------------------------------------------------------------------------


anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Nail polish', 12814, 3054, 4376, 4229],
    ['Eyebrow pencil', 13012, 5067, 3987, 3932],
    ['Rouge', 11624, 7004, 3574, 5221],
    ['Pomade', 8814, 9054, 4376, 9256],
    ['Eyeshadows', 12998, 12043, 4572, 3308],
    ['Eyeliner', 12321, 15067, 3417, 5432],
    ['Foundation', 10342, 10119, 5231, 13701],
    ['Lip gloss', 22998, 12043, 4572, 4008],
    ['Mascara', 11261, 10419, 6134, 18712],
    ['Powder', 10261, 14419, 5134, 25712]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the second series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create bar chart
  var chart = anychart.column3d();

  // turn on chart animation
  //chart.animation(true);

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  // set container id for the chart
  chart.container('container6');
  window.chart6 = chart;

  // set chart title text settings
  chart.title('Top 10 Cosmetic Products by Revenue');
  chart.title().padding([0,0,5,0]);

  // helper function to setup label settings for all series
  var setupSeriesLabels = function(series, name) {
    series.markers(true);
    series.name(name);
    series.stroke('3 #fff 1');
    series.hoverStroke('3 #fff 1');
    series.tooltip().valuePrefix('$')
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeriesLabels(series, 'Florida');

  // create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeriesLabels(series, 'Texas');

  // create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeriesLabels(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeriesLabels(series, 'Nevada');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);
  // set yAxis labels formatter
  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });

  // set titles for axises
  chart.xAxis().title('Products by Revenue');
  chart.yAxis().title('Revenue in Dollars');
  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');

  // initiate chart drawing
  chart.draw();
});


// ---------------------------------------------------------------------------------------------------------------------



anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Powder', 11861, 10919, -8034, 18012],
    ['Mascara', 11261, 10419, -6134, 18712],
    ['Lip gloss', 22998, 12043, 4572, -4008],
    ['Foundation', 10342, 10119, -5231, 13701],
    ['Eyeliner', 12321, 15067, 3417, -5432],
    ['Eyeshadows', 12998, 12043, -4572, -3308],
    ['Pomade', 8814, 9054, 4376, -9256],
    ['Rouge', 11624, -7004, -3574, 5221],
    ['Eyebrow pencil', 13012, -5067, -3987, -3932],
    ['Nail polish', 12814, -3054, -4376, -4229]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create column chart
  var chart = anychart.column3d();

  // turn on chart animation
  //chart.animation(true);

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  // set container id for the chart
  chart.container('container7');
  chart.padding([10,20,5,20]);

  window.chart7 = chart;

  // set chart title text settings
  chart.title('Top 10 Products by Profit');
  chart.title().padding([0,0,5,0]);

  chart.xAxis(1).orientation('top');
  chart.yAxis().title('Profit in Dollars');
  chart.yAxis().labels().textFormatter(function(){
    return parseInt(this.value).toLocaleString()
  });
  chart.xAxis().title('Products by Profit');

  var zeroMarker = chart.lineMarker(0);
  zeroMarker.stroke("#ddd");
  zeroMarker.scale(chart.yScale());
  zeroMarker.value(0);

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.markers(true);
    series.name(name);
    series.stroke(null);
    series.hoverStroke(null);
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.column(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.column(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.column(seriesData_3);
  setupSeries(series, 'Nevada');

  // create fourth series with mapped data
  series = chart.column(seriesData_4);
  setupSeries(series, 'Arizona');

  var grid = chart.grid();
  grid.enabled(true).stroke("#ddd");
  //grid.drawLastLine(false);
  grid.layout("vertical");

  chart.grid(1).layout('h');

  chart.barsPadding(0.1);
  chart.barGroupsPadding(0.9);

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);
  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');

  // create first range marker
  var marker1 = chart.rangeMarker(0);
  // bind marker to the scale
  marker1.scale(chart.yScale());
  // set start value for range
  marker1.from(20000);
  // set end point for range
  marker1.to(50000);
  // set range color
  marker1.fill("#d7fcda");

  // create second marker
  var marker2 = chart.rangeMarker(1);
  // bind marker to scale
  marker2.scale(chart.yScale());
  // set start point of the marker
  marker2.from(0);
  // set end point of the marker
  marker2.to(20000);
  // set marker's inner color
  marker2.fill("#ffffdc");

  // create third marker
  var marker3 = chart.rangeMarker(2);
  // bind marker to the chart scale
  marker3.scale(chart.yScale());
  // set start point of the marker
  marker3.from(-25000);
  // set end point of the marker
  marker3.to(0);
  // set marker inner color
  marker3.fill("#fcd8d7");

  // initiate chart drawing
  chart.draw();
});


// ---------------------------------------------------------------------------------------------------------------------
