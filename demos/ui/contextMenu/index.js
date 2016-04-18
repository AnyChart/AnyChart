var contextMenu, chart;

//anychart.theme('v6');

anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    ['Nail polish', 6814, 3054, 4376, 4229],
    ['Eyebrow pencil', 7012, 5067, 8987, 3932],
    ['Pomade', 8814, 9054, 4376, 9256]
  ]);

  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  chart = anychart.bar();

  chart.container('container');
  chart.padding([10,40,5,20]);

  chart.title('Top 3 Products with Region Sales Data');
  chart.title().padding([0,0,10,0]);

  chart.yScale().minimum(0);
  chart.xAxis().labels().rotation(-90).padding([0,0,20,0]);
  chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
  });
  chart.yAxis().title('Revenue in Dollars');

  var setupSeries = function(series, name) {
    var seriesLabels = series.labels();
    series.hoverLabels().enabled(false);
    seriesLabels.enabled(true);
    seriesLabels.position('right');
    seriesLabels.textFormatter(function(){
      return '$' + this.value.toLocaleString();
    });
    series.name(name);
    seriesLabels.anchor('left');
    series.tooltip().titleFormatter(function () {
      return this.x;
    });
    series.tooltip().textFormatter(function () {
      return this.seriesName + ': $' + parseInt(this.value).toLocaleString();
    });
    series.tooltip().position('right').anchor('left').offsetX(5).offsetY(0);
  };

  var series;

  series = chart.bar(seriesData_1);
  setupSeries(series, 'Florida');

  series = chart.bar(seriesData_2);
  setupSeries(series, 'Texas');

  series = chart.bar(seriesData_3);
  setupSeries(series, 'Arizona');

  series = chart.bar(seriesData_4);
  setupSeries(series, 'Nevada');

  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);

  chart.interactivity().hoverMode('single');
  chart.tooltip().positionMode('point');

  chart.draw();


  contextMenu = anychart.ui.contextMenu();
  //contextMenu = new anychart.ui.ContextMenu();
  //contextMenu.attach(chart);
  contextMenu.addClassName('my-context-menu');
  //contextMenu.removeClassName('my-context-menu');
  //contextMenu.attach(document.body, true);
  contextMenu.itemsProvider(function(context){
    console.log(context);
    return [{
      text: 'menu item'
    }]
  });

  //chart.contextMenu(false);
  //chart.contextMenu().enabled(false);

  var linkToHelpItem = {
    text: 'Need help? Go to stackoverflow!',
    href: 'http://stackoverflow.com/questions/tagged/anychart',
    iconClass: 'fa fa-stack-overflow',
    classNames: 'link-to-stack-overflow'
  };

  chart.contextMenu().itemsFormatter(function(items){
    items.push(null); // add separator
    items.push(linkToHelpItem);

    return items;
  });

  //chart.listen('contextmenu', function(e) {
  //  console.log(e);
  //});
});
