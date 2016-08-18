anychart.onDocumentReady(function() {
  var data = [
    ['Department Stores', 6371664],
    {
      x: 'Discount Stores',
      value: 7216301,
      hoverLabel: {
        //text: "asdasd"
        //offsetX: 20
      },
      label: {
        background: 'red',
        padding: 20
      }
    },
    ['Men\'s/Women\'s Stores', 1486621],
    ['Juvenile Specialty Stores', 786622],
    ['All other outlets', 900000]
  ];

  // create pie chart with passed data
  chart = anychart.pie(data);

  // set container id for the chart
  chart.container('container');

  // set chart title text settings
  chart.title('ACME Corp. apparel sales through different retail channels');

  // set legend title text settings
  chart.legend(false);

  //chart.labels().position('o');

  chart.listen("pointClick",function(event){
    console.log('listened pointClick');
    // var point = event.point;
    // var index = point.getIndex();
    // chart.explodeSlices(false);
    // chart.explodeSlice(index);
  });

  //var EVENTS = goog.object.getValues(acgraph.events.EventType);

  // chart.labels_.listen('click', function(e) {
  //   console.log(e);
  // });

  // initiate chart drawing
  chart.draw();
});

// anychart.onDocumentReady(function() {
//   // create data set on our data
//   var dataSet = anychart.data.set([
//     ['Nail polish', 6814, 3054, 4376, 4229],
//     ['Eyebrow pencil', 7012, 5067, 8987, 3932],
//     ['Pomade', 8814, 9054, 4376, 9256]
//   ]);
//
//   // map data for the first series, take x from the zero column and value from the first column of data set
//   var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});
//
//   // map data for the second series, take x from the zero column and value from the second column of data set
//   var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});
//
//   // map data for the third series, take x from the zero column and value from the third column of data set
//   var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});
//
//   // map data for the fourth series, take x from the zero column and value from the fourth column of data set
//   var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});
//
//   // create column chart
//   chart = anychart.column();
//
//   // set container id for the chart
//   chart.container('container');
//
//   // set chart title text settings
//   chart.title('Top 3 Products with Region Sales Data');
//
//   chart.yAxis().labels().textFormatter(function(){
//     return this.value.toLocaleString();
//   });
//
//   // set titles for Y-axis
//   chart.yAxis().title('Revenue in Dollars');
//
//   // helper function to setup label settings for all series
//   var setupSeriesLabels = function(series, name) {
//     var seriesLabels = series.labels();
//     //series.hoverLabels().enabled(false);
//     seriesLabels.enabled(true);
//     seriesLabels.position('center');
//     seriesLabels.textFormatter(function(){
//       return '$' + this.value.toLocaleString();
//     });
//     seriesLabels.anchor('bottom');
//     seriesLabels.listen('click', function(){
//       console.log('click')
//     });
//     //series.hoverLabels().anchor('left');
//
//     series.tooltip(false);
//     series.name(name);
//   };
//
//   chart.listen('mousedown', function() {
//     chart.series_[0].xPointPosition(0.1);
//   });
//
//   //var b = true;
//   chart.listen('pointclick', function(event) {
//     var point = event.point;
//     var index = point.getIndex();
//     console.log(index);
//   });
//
//
//
//   // temp variable to store series instance
//   var series;
//
//   // create first series with mapped data
//   series = chart.column(seriesData_1);
//   setupSeriesLabels(series, 'Florida');
//
//   // create second series with mapped data
//   series = chart.column(seriesData_2);
//   setupSeriesLabels(series, 'Texas');
//
//   // create third series with mapped data
//   series = chart.column(seriesData_3);
//   setupSeriesLabels(series, 'Arizona');
//
//   // create fourth series with mapped data
//   series = chart.column(seriesData_4);
//   setupSeriesLabels(series, 'Nevada');
//
//   // turn on legend
//   chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);
//
//   chart.interactivity().hoverMode('single');
//   chart.tooltip().positionMode('point');
//
//   // initiate chart drawing
//   chart.draw();
// });
