var parser, map, choropleth, chart;
anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    {'id': 'au-ct', 'title': 'Австралийская столичная территория', 'label': {enabled: false}, 'density': 151.49, 'area': 2358, 'population': 357222, 'earth': 2280, 'water': 776},
    {'id': 'au-vi', 'title': 'Виктория', 'density': 23.54, 'area': 227416, 'population': 5354042, 'earth': 227416, 'water': 10213},
    {'id': 'au-wa', 'title': 'Западная Австралия', 'density': 0.89, 'area': 2529875, 'population': 2239170, 'earth': 2529875, 'water': 115740},
    {'id': 'au-ql', 'title': 'Квинсленд', 'density': 2.5, 'area': 1.730648, 'population': 4332739, 'earth': 1730620, 'water': 121994},
    {'id': 'au-ns', 'title': 'Новый Южный Уэльс', 'density': 8.64, 'area': 800642, 'population': 6917658, 'earth': 800642, 'water': 8802},
    {'id': 'au-nt', 'title': 'Северная территория', 'density': 0.16, 'area': 1349129, 'population': 211945, 'earth': 1349129, 'water': 71839},
    {'id': 'au-ts', 'title': 'Тасмания', 'density': 7.24, 'area': 68401, 'population': 495354, 'earth': 68401, 'water': 22357},
    {'id': 'au-sa', 'title': 'Южная Австралия', 'density': 1.62, 'area': 983482, 'population': 1596572, 'earth': 983.482, 'water': 60.032}
  ]);

  var ds = anychart.data.set([
    {'id': 'au-ct', '2009': 440641.5369, '2010': 447550.225, '2011': 457219, '2012': 461610.5552, '2013': 469878.8509},
    {'id': 'au-vi', '2009': 5256291.992, '2010': 5338703.836, '2011': 5454040, '2012': 5506425.657, '2013': 5605055.888},
    {'id': 'au-wa', '2009': 2254358.336, '2010': 2289703.752, '2011': 2339170, '2012': 2361637.557, '2013': 2403938.838},
    {'id': 'au-ql', '2009': 4272018.539, '2010': 4338998.252, '2011': 4432737, '2012': 4475313.116, '2013': 4555474.221},
    {'id': 'au-ns', '2009': 6859591.925, '2010': 6967141.435, '2011': 7117658, '2012': 7186022.586, '2013': 7314737.494},
    {'id': 'au-nt', '2009': 300633.7961, '2010': 305347.3443, '2011': 311944, '2012': 314940.1994, '2013':  320581.3588},
    {'id': 'au-ts', '2009': 573764.299, '2010': 582760.1794, '2011': 595350, '2012': 601068.2933, '2013': 611834.5342},
    {'id': 'au-sa', '2009': 1731431.472, '2010': 1758578.073, '2011': 1796570, '2012': 1813825.924, '2013': 1846314.889}
  ]);

  var dataSet4 = dataSet.mapAs({id: 'id', value: 'density'});

  var stage = anychart.graphics.create('container');



  var pie = anychart.pie([]);
  pie.minWidth(200).minHeight(200);
  pie.background(null);
  pie.container(stage);
  pie.startAngle(450);
  pie.palette(['#b07539', '#1976d2']);
  pie.bounds('60%', '5%', '35%', '40%');
  pie.legend().position('right').itemsLayout('vertical');
  pie.labels().position('o');
  pie.draw();


  chart = anychart.line();
  chart.minWidth(300).minHeight(200);
  chart.title(null);
  chart.minorGrid(0).enabled(false);
  chart.minorGrid(1).enabled(false);
  chart.grid(0).oddFill(null).evenFill(null);
  chart.grid(1).oddFill(null).evenFill(null);
  chart.background(null);
  chart.xAxis().title('Year');
  chart.yAxis().title('Population');
  chart.line([]);


  var table = anychart.ui.table();
  table.bounds('60%', '45%', '35%', '50%');
  table.cellBorder(null);
  table.getCol(1)
      .width(150)
      .fontSize(15)
      .cellPadding().top(20);

  table.contents([
    [chart, ''],
    [null, ''],
    [null, '']
  ]);

  table.getCell(0,0).rowSpan(3);
  table.container(stage).draw();

  map = anychart.map();
  map.minWidth(500).minHeight(500);
  map.title('Australia');
  map.background(null);
  map.bounds('5%', 0, '55%', '100%');
  map.geoData(Highcharts.maps["countries/au/au-all"]);
  map.allRegions(true);

  choropleth = map.choropleth(dataSet4);
  choropleth.fill('#64b5f6 0.6').stroke('#64b5f6');
  choropleth.geoIdField('hc-key');
  choropleth.labels().adjustFontSize(false, true).height('3%');
  choropleth.labels().fontColor(anychart.color.darken(choropleth.fill())).enabled(true);
  choropleth.hoverLabels().fontColor(anychart.color.darken(choropleth.labels().fontColor())).enabled(true);
  choropleth.selectLabels().fontColor('#fff').enabled(true);

  map.container(stage).draw();

  function select(series, point) {
    var data = series.data();
    var index = point.index;

    var density = data.get(index, 'density');
    var area = data.get(index, 'area');
    var population = data.get(index, 'population');

    var earth = data.get(index, 'earth');
    var water = data.get(index, 'water');

    var row = ds.row(index);

    var lineData = [['2009', row['2009']], ['2010', row['2010']], ['2011', row['2011']], ['2012', row['2012']], ['2013', row['2013']]];
    chart.getSeries(0).data(lineData);

    table.getCell(0, 1).content('density: ' + density + '/km²');
    table.getCell(1, 1).content('population: ' + population);
    table.getCell(2, 1).content('area: ' + area + ' km²');

    pie.title(point.properties.name);
    pie.data([{x: 'Earth', value: earth}, {x: 'Water', value: water}]);
  }


  map.listen(anychart.enums.EventType.POINT_SELECT, function(e) {
    var series = e.series;
    var selectedPoint = e.selectedPoint;

    if (selectedPoint) {
      select(series, selectedPoint);
    }
  });

  choropleth.select(1);
});
