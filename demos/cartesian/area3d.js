anychart.onDocumentReady(function() {
  var areaDataSet = anychart.data.set([
    ['2015/9/1', 10],
    ['2015/9/4', 15],
    ['2015/9/5', 20],
    ['2015/9/8', 25],
    ['2015/9/13', 40],
    ['2015/9/14', 41],
    ['2015/9/15', 45],
    ['2015/9/16', 50],
    ['2015/9/19', 50],
    ['2015/9/20', 51],
    //['2015/9/21', 65],
    ['2015/9/21', null],
    ['2015/9/22', 60],
    ['2015/9/25', 45],
    ['2015/9/26', 55],
    ['2015/9/27', 59],
    ['2015/9/28', 52],
    ['2015/9/31', 45]
  ]);

  // map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData = areaDataSet.mapAs({x: [0], value: [1]});

  // create line chart
  var chart = anychart.area3d();
  window.chart = chart;
  chart.animation(true);

  // adding dollar symbols to yAxis labels
  chart.yAxis().labels().textFormatter(function(){
    return '$' + this.value
  });

  // set container id for the chart
  chart.yAxis().title('The Share Price');
  chart.xAxis().title('Year/Month/Day');
  chart.xAxis().labels().padding([5,5,0,5]);

  // set chart title text settings
  chart.title('The cost of ACME\'s shares<br/>' +
      '<span style="color:#212121; font-size: 13px;">Statistics was collected from site N during September</span>');
  chart.title().useHtml(true).padding([0,0,20,0]);

  // create first series with mapped data
  var seriesArea = chart.area(seriesData);
  seriesArea.name("ACME Share Price").hoverMarkers().enabled(true).type('circle').size(4);
  //seriesArea.hatchFill(true);

  // set chart tooltip settings
  chart.tooltip().position('top').anchor('bottomLeft').offsetX(5).offsetY(5);
  chart.tooltip().positionMode('point');
  chart.interactivity().hoverMode('byX');


  grid3 = chart.grid(0);
  grid3.stroke({
    color: "#f0f0f0"
  });

  var grid4 = chart.grid(1);
  grid4.layout('vertical');
  grid4.stroke({
    color: "#f0f0f0"
  });

  chart.xScroller(true);

  // initiate chart drawing
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

  // map data for the first series, take x from the zero area and value from the first area of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero area and value from the second area of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the second series, take x from the zero area and value from the third area of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero area and value from the fourth area of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create bar chart
  var chart = anychart.area3d();
  window.chart2 = chart;

  // turn on chart animation
  //chart.animation(true);

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('percent');

  // set container id for the chart
  chart.container('container2');

  // turn on the crosshair
  chart.crosshair().enabled(true).yLabel().enabled(false);
  chart.crosshair().enabled(true).xLabel().enabled(false);
  chart.crosshair().yStroke(null).xStroke('#fff').zIndex(39);

  // set chart title text settings
  chart.title('Regional ratio of cosmetic products sales');
  chart.title().padding([0,0,10,0]);

  // set yAxis labels formatting, force it to add % to values
  chart.yAxis(0).labels().textFormatter(function(info) {
    return info.value + '%';
  });

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.stroke('3 #fff 1');
    //series.fill(function(){return this.sourceColor + ' 0.3'});
    series.name(name);
    series.hoverMarkers().enabled(true).type('circle').size(4).stroke('1.5 #fff');
    series.clip(false);
    series.hoverStroke('3 #fff 1');
    //series.hatchFill(true);
  };

  grid3 = chart.grid(0);
  grid3.stroke({
    color: "#f0f0f0"
  });

  var grid4 = chart.grid(1);
  grid4.layout('vertical');
  grid4.stroke({
    color: "#f0f0f0"
  });

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.area(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.area(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.area(seriesData_3);
  setupSeries(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.area(seriesData_4);
  setupSeries(series, 'Nevada');

  // set interactivity and toolitp settings
  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,25,0]);

  // initiate chart drawing
  chart.draw();
});


// ---------------------------------------------------------------------------------------------------------------------



anychart.onDocumentReady(function() {
  // create data set on our data
  //var dataSet = anychart.data.set([
  //  ['1996', 162 , 242, 322],
  //  ['1997', 90  , 254, 324],
  //  ['1998', 50  , 226, 329],
  //  ['1999', 77  , 232, 342],
  //  ['2000', 35  , 268, 348],
  //  ['2001', -45 , 254, 334],
  //  ['2002', -88 , 235, 325],
  //  ['2003', -120, 266, 316],
  //  ['2004', -156, 288, 318],
  //  ['2005', -123, 220, 330],
  //  ['2006', -88 , 215, 355],
  //  ['2007', -66 , 236, 366],
  //  ['2008', -45 , 247, 337],
  //  ['2009', -29 , 172, 352],
  //  ['2010', -45 , 37,  377],
  //  ['2011', -88 , 23,  383],
  //  ['2012', -132, 34,  344],
  //  ['2013', -146, 46,  366],
  //  ['2014', -169, 59,  389],
  //  ['2015', -184, 44,  334]
  //]);

  var dataSet = anychart.data.set([
    ['1996', 300, 162, 242],
    ['1997', 300, 90 , 254],
    ['1998', 330, 50 , 226],
    ['1999', 342, 77 , 232],
    ['2000', 348, 35 , 268],
    ['2001', 334, 45 , 254],
    ['2002', 325, 88 , 235],
    ['2003', 316, 120, 266],
    ['2004', 318, 156, 288],
    ['2005', 330, 123, 220],
    ['2006', 355, 88 , 215],
    ['2007', 366, 66 , 236],
    ['2008', 337, 45 , 247],
    ['2009', 352, 29 , 172],
    ['2010', 377, 45 , 37 ],
    ['2011', 383, 88 , 23 ],
    ['2012', 344, 132, 34 ],
    ['2013', 366, 146, 46 ],
    ['2014', 389, 169, 59 ],
    ['2015', 334, 184, 44 ]
  ]);

  // map data for the first series, take x from the zero area and value from the first area of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero area and value from the second area of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the third series, take x from the zero area and value from the third area of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // create area chart
  var chart = anychart.area3d();
  window.chart3 = chart;

  // turn on chart animation
  //chart.animation(true);

  // set container id for the chart
  chart.container('container3');

  // turn on the crosshair
  chart.crosshair().enabled(true).yLabel().enabled(false);
  chart.crosshair().yStroke(null).xStroke('#fff');

  // set chart title text settings
  chart.title('Company Profit Dynamic in Regions by Year');
  chart.title().padding([0,0,5,0]);

  // set interactivity and tooltips settings
  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');

  //chart.xAxis().stroke(null);
  chart.yAxis().title('Profit in Dollars');
  chart.yAxis().labels().textFormatter(function(){
    if (this.value == 0) return this.value;
    return this.value + 'k.';
  });

  // create additional xAxis
  chart.xAxis(1).orientation('top');

  // create zero line
  var zeroLine = chart.lineMarker(0);
  zeroLine.stroke("#ddd");
  zeroLine.scale(chart.yScale());
  zeroLine.value(0);

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.name(name);
    //series.hatchFill(true);
    //series.markers().zIndex(100);
    series.hoverMarkers().enabled(true).type('circle').size(4).stroke('1.5 #fff');
    //series.fill(function(){return this.sourceColor + ' .5'});
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.area(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.area(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.area(seriesData_3);
  setupSeries(series, 'Nevada');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);

  var grid = chart.grid();
  grid.enabled(true).stroke("#ddd");

  var grid2 = chart.grid(1);
  grid2.layout('vertical');
  grid2.stroke({
    color: "#f0f0f0"
  });

  //chart.zDepth(50);

  // initiate chart drawing
  chart.draw();
});


// ---------------------------------------------------------------------------------------------------------------------



anychart.onDocumentReady(function() {
  // create area chart
  var chart = anychart.area3d();
  window.chart4 = chart;

  // turn on chart animation
  //chart.animation(true);

  // set container for the chart
  chart.container('container4');

  // set chart title text settings
  chart.title('Site Visits During 2014 Year<br/>' +
      '<span style="color:#212121; font-size: 13px;">Considered to be the total amount of visits, including repeatable</span>');
  chart.title().useHtml(true);

  chart.yAxis().title('Number of Visits');

  // create logarithmic scale
  var logScale = anychart.scales.log();
  logScale.minimum(1);       // set scale minimum value
  logScale.ticks().count(6); // set fixed major ticks count
  logScale.minorTicks().mode('logariphmic'); // set minor ticks to use logarithmic distribution
  logScale.maximumGap(0.2);  // increase scale maximum gap

  // set scale for the chart
  // it force to use passed scale in all scale dependent entries such axes, grids, crosshairs etc
  chart.yScale(logScale);

  // create area series on passed data
  var series = chart.area([
    ['Jan.', '112'],
    ['Feb.', '163'],
    ['Mar.', '229'],
    ['Apr.', '990'],
    ['May', '4104'],
    ['June', '3250'],
    ['July', '5720'],
    ['Aug.', '43'],
    ['Sep.', '61'],
    ['Oct.', '34'],
    ['Nov.', '45'],
    ['Dec.', '122']
  ]);

  // set series data labels settings
  series.labels().enabled(true).fontColor('#212121');      // enable data labels settings which is disabled by default
  // set series data markers settings
  series.markers(true);
  series.fill(function(){return this.sourceColor + ' .5'});
  series.name('Number of Visits');
  series.tooltip().position('center').anchor('topLeft').offsetX(5).offsetY(5);
  chart.tooltip().positionMode('point');
  chart.interactivity().hoverMode('byX');
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

  // map data for the first series, take x from the zero area and value from the first area of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero area and value from the second area of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  // map data for the second series, take x from the zero area and value from the third area of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the fourth series, take x from the zero area and value from the fourth area of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  // create bar chart
  var chart = anychart.area3d();
  window.chart5 = chart;

  // turn on chart animation
  //chart.animation(true);

  // turn on the crosshair
  chart.crosshair().enabled(true).yLabel().enabled(false);
  chart.crosshair().yStroke(null).xStroke('#fff').zIndex(39);

  // force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  // set container id for the chart
  chart.container('container5');

  // set chart title text settings
  chart.title('Top 10 Products by Revenue from Different Regions');
  chart.title().padding([0,0,5,0]);

  // helper function to setup label settings for all series
  var setupSeriesLabels = function(series, name) {
    series.stroke('3 #fff 1');
    //series.fill(function(){return this.sourceColor + ' 0.8'});
    series.name(name);
    //series.hatchFill(true);
    series.hoverMarkers().enabled(true).type('circle').size(4).stroke('1.5 #fff');
    series.clip(false);
    series.hoverStroke('3 #fff 1');
    series.tooltip().valuePrefix('$')

  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.area(seriesData_1);
  setupSeriesLabels(series, 'Florida');

  // create second series with mapped data
  series = chart.area(seriesData_2);
  setupSeriesLabels(series, 'Texas');

  // create third series with mapped data
  series = chart.area(seriesData_3);
  setupSeriesLabels(series, 'Arizona');

  // create fourth series with mapped data
  series = chart.area(seriesData_4);
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


// ----------------------------------------------------------------------------
