anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Nail polish', 6814, 3054, 4376, 4229],
    ['Eyebrow pencil', 7012, 5067, 8987, 3932],
    ['Pomade', 8814, 9054, 4376, 9256]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create bar chart
  var chart = anychart.bar3d();
  window.chart = chart;

  // turn on chart animation
  chart.animation(true);

  // set container id for the chart
  chart.container('container');
  chart.padding([10,40,5,20]);

  // set chart title text settings
  chart.title('Top 3 Products with Region Sales Data');
  chart.title().padding([0,0,10,0]);

  // set scale minimum
  chart.yScale().minimum(0);

  chart.xAxis().labels().rotation(-90).padding([0,0,20,0]);

  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });

  // set titles for Y-axis
  chart.yAxis().title('Revenue in Dollars');

  // helper function to setup settings for series
  var setupSeries = function(series, name) {
    var seriesLabels = series.labels();
    series.hoverLabels().enabled(false);
    seriesLabels.enabled(true);
    seriesLabels.position('right');
    seriesLabels.textFormatter(function(){
      return '$' + this.value.toLocaleString();
    });
    seriesLabels.anchor('left');
    series.markers(true);
    //series.hatchFill(true);
    series.name(name);
    series.tooltip().titleFormatter(function () {
      return this.x;
    });
    series.tooltip().textFormatter(function () {
      return this.seriesName + ': $' + parseInt(this.value).toLocaleString();
    });
    series.tooltip().position('right').anchor('left').offsetX(5).offsetY(0);
  };

  chart.grid();
  chart.grid(1).layout('h');

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.bar(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.bar(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.bar(seriesData_3);
  setupSeries(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.bar(seriesData_4);
  setupSeries(series, 'Nevada');

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
  firstMarker.value(9500);

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
  secondMarker.value(8200);

  //----

  var textMarker = chart.textMarker();
  textMarker.scale(chart.yScale());
  textMarker.value(18000);
  textMarker.align("left");
  textMarker.anchor("rightcenter");
  textMarker.fontSize(12);
  textMarker.fontColor("#212121");
  textMarker.offsetX(0);
  textMarker.text("Historical Maximum");

  chart.zPadding(10);
  //chart.zDepth(100);
  chart.zDistribution(true);

  // initiate chart drawing
  chart.draw();
});

// -------------------------------------------------------------------------------------------------------------------

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
  var chart2 = anychart.bar3d();
  window.chart2 = chart2;

  // turn on chart animation
  //chart2.animation(true);

  // force chart to stack values by Y scale.
  chart2.yScale().stackMode('percent');

  // set container id for the chart
  chart2.container('container2');

  // set chart title text settings
  chart2.title('Regional ratio of cosmetic products sales');
  chart2.title().padding([0, 0, 5, 0]);

  // set yAxis labels formatting, force it to add % to values
  chart2.yAxis(0).labels().textFormatter(function(info) {
    return info.value + '%';
  });

  // helper function to setup label settings for all series
  var setupSeriesLabels = function(series, name) {
    series.markers(true);
    series.name(name);
    series.tooltip().valuePrefix('$');
    //series.stroke('3 #fff 1');
    //series.hoverStroke('3 #fff 1');
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart2.bar(seriesData_1);
  setupSeriesLabels(series, 'Florida');

  // create second series with mapped data
  series = chart2.bar(seriesData_2);
  setupSeriesLabels(series, 'Texas');

  // create third series with mapped data
  series = chart2.bar(seriesData_3);
  setupSeriesLabels(series, 'Arizona');

  // create fourth series with mapped data
  series = chart2.bar(seriesData_4);
  setupSeriesLabels(series, 'Nevada');

  // turn on legend
  chart2.legend().enabled(true).fontSize(14).padding([0, 0, 15, 0]);
  chart2.interactivity().hoverMode('byX');
  chart2.tooltip().displayMode('union');
  // initiate chart drawing
  chart2.draw();

});

// -------------------------------------------------------------------------------------------------------------------

anychart.onDocumentReady(function() {
  var chart = anychart.bar3d();
  window.chart3 = chart;

  // set chart title text settings
  chart.title('Top 10 Cosmetic Products by Revenue');

  // create area series with passed data
  var series = chart.bar([
    ['Eyeshadows', '249980'],
    ['Eyeliner', '213210'],
    ['Eyebrow pencil', '170670'],
    ['Nail polish', '143760'],
    ['Pomade', '128000'],
    ['Lip gloss', '110430'],
    ['Mascara', '102610'],
    ['Foundation', '94190'],
    ['Rouge', '80540'],
    ['Powder', '53540']
  ]);
  // set tooltip formatter
  series.tooltip().titleFormatter(function() {
    return this.x
  });
  series.tooltip().textFormatter(function() {
    return '$' + parseInt(this.value).toLocaleString();
  });
  series.tooltip().position('right').anchor('left').offsetX(5).offsetY(0);

  series.markers(true);

  // set yAxis labels formatter
  chart.yAxis().labels().textFormatter(function() {
    return this.value.toLocaleString();
  });

  // set titles for axises
  chart.xAxis().title('Products by Revenue');
  chart.yAxis().title('Revenue in Dollars');
  chart.interactivity().hoverMode('byX');
  chart.tooltip().positionMode('point');
  // set scale minimum
  chart.yScale().minimum(0);

  var grid = chart.grid(0);
  grid.stroke({
    color: "#f0f0f0"
  });

  var grid2 = chart.grid(1);
  grid2.layout('horizontal');
  grid2.stroke({
    color: "#f0f0f0"
  });

  // create first range marker
  var marker1 = chart.rangeMarker(0);
  // bind marker to the scale
  marker1.scale(chart.yScale());
  // set start value for range
  marker1.from(140000);
  // set end point for range
  marker1.to(280000);
  // set range color
  marker1.fill("#d7fcda");
  marker1.layout('vertical');

  // create second marker
  var marker2 = chart.rangeMarker(1);
  // bind marker to scale
  marker2.scale(chart.yScale());
  // set start point of the marker
  marker2.from(70000);
  // set end point of the marker
  marker2.to(140000);
  // set marker's inner color
  marker2.fill("#ffffdc");

  // create third marker
  var marker3 = chart.rangeMarker(2);
  // bind marker to the chart scale
  marker3.scale(chart.yScale());
  // set start point of the marker
  marker3.from(0);
  // set end point of the marker
  marker3.to(70000);
  // set marker inner color
  marker3.fill("#fcd8d7");


  chart.xScroller(true);

  //chart.crosshair().enabled(true);
  chart.container('container3').draw();
});


// -------------------------------------------------------------------------------------------------------------------



anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Powder', 11861, 10919, 8034, 18012],
    ['Mascara', 11261, 10419, 6134, 18712],
    ['Lip gloss', 22998, 12043, 4572, 4008],
    ['Foundation', 10342, 10119, 5231, 13701],
    ['Eyeliner', 12321, 15067, 3417, 5432],
    ['Eyeshadows', 12998, 12043, 4572, 3308],
    ['Pomade', 8814, 9054, 4376, 9256],
    ['Rouge', 11624, 7004, 3574, 5221],
    ['Eyebrow pencil', 13012, 5067, 3987, 3932],
    ['Nail polish', 12814, 3054, 4376, 4229]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero column and value from the fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create bar chart
  var chart = anychart.bar3d();
  window.chart4 = chart;

  // turn on chart animation
  //chart.animation(true);

  // set container id for the chart
  chart.container('container4');
  chart.padding([10,40,5,20]);

  // set chart title text settings
  chart.title('Top 10 Products by Revenue');
  chart.title().padding([0,0,5,0]);

  // set scale minimum
  chart.yScale().minimum(0);

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });

  // set titles for axises
  chart.xAxis().title('Products by Revenue');
  chart.yAxis().title('Revenue in Dollars');

  // helper function to setup label settings for all series
  var setupSeriesLabels = function(series, name) {
    series.markers(true);
    series.name(name);
    series.tooltip().valuePrefix('$');
    series.fill(function() {
      return window['anychart']['color']['setOpacity'](this['sourceColor'], 0.75, true);
    });
    //series.stroke(function() {
    //  return anychart.color.darken(this['sourceColor']);
    //});
    series.stroke('1 #fff 1');
    //series.hoverStroke('3 #fff 1');
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.bar(seriesData_1);
  setupSeriesLabels(series, 'Florida');

  // create second series with mapped data
  series = chart.bar(seriesData_2);
  setupSeriesLabels(series, 'Texas');

  // create third series with mapped data
  series = chart.bar(seriesData_3);
  setupSeriesLabels(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.bar(seriesData_4);
  setupSeriesLabels(series, 'Nevada');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);
  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');
  // initiate chart drawing
  chart.draw();
});


// -------------------------------------------------------------------------------------------------------------------




anychart.onDocumentReady(function() {
  // create data set on our data
  var dataSet = anychart.data.set([
    ['Nail polish' ,  5376, -4229],
    ['Eyebrow pencil' , 10987, -3932],
    ['Rouge' , 7624, -5221],
    ['Pomade' , 8814, -9256],
    ['Eyeshadows' , 8998,  -13308],
    ['Eyeliner' , 9321, -10432],
    ['Foundation' , 8342,  -13701],
    ['Lip gloss' , 6998, -9008],
    ['Mascara' , 9261, -8712],
    ['Shampoo' ,  5376, -9229],
    ['Hair conditioner' , 10987, -13932],
    ['Body lotion' , 7624, -10221],
    ['Shower gel' , 8814, -12256],
    ['Soap' , 8998,  -5308],
    ['Eye fresher' , 9321, -9432],
    ['Deodorant' , 8342,  -11701],
    ['Hand cream' , 7598, -5808],
    ['Foot cream' , 6098, -3987],
    ['Night cream' , 6998, -8847],
    ['Day cream' , 5304, -4008],
    ['Vanila cream' , 9261, -8712]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // create bar chart
  var chart = anychart.bar3d();
  window.chart5 = chart;

  // turn on chart animation
  //chart.animation(true);
  chart.padding([10,20,5,20]);

  chart.yAxis().labels().textFormatter(function(){
    return Math.abs(this.value).toLocaleString();
  });

  // set titles for Y-axis
  chart.yAxis().title('Revenue in Dollars');

  // turn on exstra axis for simmetry
  chart.xAxis(1).enabled(true);
  chart.xAxis(1).orientation('right');
  //chart.xAxis(1).stroke('none');
  //chart.xAxis(0).stroke('none');

  chart.grid();
  chart.grid(1).layout('h');

  //chart.grid().oddFill("#555 0.5");
  //chart.grid().evenFill("#000 0.5");
  //
  //chart.grid(1).oddFill("green 0.5");
  //chart.grid(1).evenFill("red 0.5");


  // set container id for the chart
  chart.container('container5');

  // set chart title text settings
  chart.title('Cosmetic Sales by Buyer\'s Gender');

  // helper function to setup label settings for all series
  var setupSeriesLabels = function(series, name) {
    series.markers(true);
    series.name(name);
    series.tooltip().titleFormatter(function () {
      return this.x;
    });
    series.tooltip().title(false);
    series.tooltip().separator(false);
    series.tooltip().useHtml(true).fontSize(12);
    series.tooltip().textFormatter(function () {
      return '<span style="color: #D9D9D9">$</span>' + Math.abs(this.value).toLocaleString();
    });
  };

  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('separated');
  chart.tooltip().positionMode('point');

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.bar(seriesData_1);
  series.tooltip().position('right').anchor('left').offsetX(5).offsetY(0);
  setupSeriesLabels(series, 'Female');

  // create second series with mapped data
  series = chart.bar(seriesData_2);
  series.tooltip().position('left').anchor('right').offsetX(5).offsetY(0);
  setupSeriesLabels(series, 'Male');

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  // turn on legend
  chart.legend().enabled(true).inverted(true).fontSize(13).padding([0,0,20,0]);

  // initiate chart drawing
  chart.draw();
});



//--------------------------------------------------------------------------------------------------------------------



anychart.onDocumentReady(function() {

  // data
  var data = anychart.data.set([
    ["Department Stores", 637166, 737166],
    ["Discount Stores", 721630, 537166],
    ["Men's/Women's Specialty Stores", 148662, 188662],
    ["Juvenile Specialty Stores", 78662, 178662],
    ["All other outlets", 90000, 89000]
  ]);

  // map data for the each series
  var Sales2003 = data.mapAs({x: [0], value: [1]});
  var Sales2004 = data.mapAs({x: [0], value: [2]});

  // chart type
  var chart = anychart.bar3d();
  window.chart6 = chart;

  // chart title
  chart.title("Paddings");

  // set axes titles
  var xAxis = chart.xAxis();
  xAxis.title("Retail Channel");
  var yAxis = chart.yAxis();
  yAxis.title("Sales");

  // set series data and adjust series position
  var shiftedSeries = chart.bar(Sales2003);
  shiftedSeries.xPointPosition(0.5);
  shiftedSeries.markers(true);

  // second series data
  var secondSeries = chart.bar(Sales2004);
  secondSeries.markers(true);

  // draw
  chart.container("container6");
  chart.draw();
});

