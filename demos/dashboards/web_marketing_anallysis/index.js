var stage;
anychart.onDocumentReady(function() {
  var rowsCount, i;

  //------------------------------------------------------------------
  // Graphics stage for all dashboard elements
  //------------------------------------------------------------------
  //stage for all dashboard elements
  stage = anychart.graphics.create('container');
  //100% of container size by default
  var stageSize = stage.getSize();

  //------------------------------------------------------------------
  // Dashboard header
  //------------------------------------------------------------------
  //create label instance
  var header = anychart.ui.label();
  //set layout bounds
  header.parentBounds(new anychart.math.Rect(0, 0, stageSize.width, stageSize.height));
  //set label position
  header.position('LeftTop');
  header.anchor('LeftTop');
  //set label text
  header.text('Sales Dashboard');
  header.padding(8);
  //set label text settings
  header.fontSize(18);
  header.fontWeight('normal');
  //set label render on stage
  header.container(stage);
  //initiate label drawing
  header.draw();

  //------------------------------------------------------------------
  // Current data
  //------------------------------------------------------------------
  //create label instance
  var curDate = anychart.ui.label();
  //set layout bounds
  curDate.parentBounds(new anychart.math.Rect(0, 0, stageSize.width, stageSize.height));
  //set label position
  curDate.position('CenterTop');
  curDate.anchor('CenterTop');
  //set label text
  curDate.text('Data as of December 19, 2014');
  curDate.padding(8);
  //set label text settings
  curDate.fontSize(14);
  curDate.fontWeight('normal');
  //set label render on stage
  curDate.container(stage);
  //initiate label drawing
  curDate.draw();

  //------------------------------------------------------------------
  // Separator line
  //------------------------------------------------------------------
  var headerHeight = header.getContentBounds().height;
  stage.path()
      .moveTo(0, headerHeight)
      .lineTo(stageSize.width, headerHeight)
      .stroke('2 black');

  //------------------------------------------------------------------
  // Key Metrics YTD
  //------------------------------------------------------------------
  var keyMetricsYTDSize = new anychart.math.Rect(
      5,
      headerHeight + 2 + 5, //header height + separator line stroke + margin
      anychart.utils.normalizeSize('60%', stageSize.width),
      anychart.utils.normalizeSize('30%', stageSize.height)
  );

  var keyMetricsYTDLegendLabel = anychart.ui.label();
  keyMetricsYTDLegendLabel.container(stage);
  keyMetricsYTDLegendLabel.text('Key Metrics YTD');
  keyMetricsYTDLegendLabel.padding().top(8).left(5);
  keyMetricsYTDLegendLabel.fontSize(14);
  keyMetricsYTDLegendLabel.position('lefttop');
  keyMetricsYTDLegendLabel.anchor('lefttop');
  keyMetricsYTDLegendLabel.parentBounds(keyMetricsYTDSize);
  keyMetricsYTDLegendLabel.draw();


  var keyMetricsYTDLegend = createLegend([
    {text: 'Poor', iconFill: '#828282'},
    {text: 'Satisfactory', iconFill: '#a8a8a8'},
    {text: 'Good', iconFill: '#c2c2c2'}
  ], keyMetricsYTDSize);
  keyMetricsYTDLegend.align('right');
  keyMetricsYTDLegend.draw();

  var lineChartsData = anychart.data.mapAsTable([
    ['m-1',  10, 10, 10, 10, 10, 10, 10],
    ['m-2',  30, 30, 30, 30, 30, 30, 30],
    ['m-3',  20, 20, 20, 20, 20, 20, 20],
    ['m-4',   5,  5,  5,  5,  5,  5,  5],
    ['m-5',  15, 15, 15, 15, 15, 15, 15],
    ['m-6',  25, 25, 25, 25, 25, 25, 25],
    ['m-7',  35, 35, 35, 35, 35, 35, 35],
    ['m-8',  30, 30, 30, 30, 30, 30, 30],
    ['m-9',  25, 25, 25, 25, 25, 25, 25],
    ['m-10', 30, 30, 30, 30, 30, 30, 30],
    ['m-11', 35, 35, 35, 35, 35, 35, 35],
    ['m-12', 40, 40, 40, 40, 40, 40, 40]
  ]);

  var keyMetricsYTDSizeWithoutLegend = keyMetricsYTDLegend.getRemainingBounds();
  var keyMetricsYTDTable = anychart.ui.table();
  keyMetricsYTDTable.container(stage);
  keyMetricsYTDTable.contents([
      ['Past 12 Months',                                  'Metric',            '% of Target',                    'Actual'],
      [anychart.core.cartesian.series.line(lineChartsData[0]), 'Revenue',           createBulletChart([{value: 10}]), '$121,21'],
      [anychart.core.cartesian.series.line(lineChartsData[1]), 'Profit',            createBulletChart([{value: 10}]), '$18,62'],
      [anychart.core.cartesian.series.line(lineChartsData[2]), 'Avg Order Size',    createBulletChart([{value: 10}]), '$420'],
      [anychart.core.cartesian.series.line(lineChartsData[3]), 'On Time Delivery ', createBulletChart([{value: 10}]), '89%'],
      [anychart.core.cartesian.series.line(lineChartsData[4]), 'New Customers',     createBulletChart([{value: 10}]), '117'],
      [anychart.core.cartesian.series.line(lineChartsData[5]), 'Cust Satisfaction', createBulletChart([{value: 10}]), '4.82/5'],
      [anychart.core.cartesian.series.line(lineChartsData[6]), 'Market Share',      createBulletChart([{value: 10}]), '23%']
  ]);
  keyMetricsYTDTable.bounds(keyMetricsYTDSizeWithoutLegend);

  //tmp dirty hack
  rowsCount = keyMetricsYTDTable.rowsCount();
  for (i = 0; i < rowsCount; i++) {
    var metricCell = keyMetricsYTDTable.getCell(i, 1);
    metricCell.content().hAlign('left');

    var actualCell= keyMetricsYTDTable.getCell(i, 1);
    actualCell.content().hAlign('right');
  }

  keyMetricsYTDTable.draw();

  //------------------------------------------------------------------
  // Top 8 Customers This Quarter
  //------------------------------------------------------------------
  var top8CustomersSize = new anychart.math.Rect(
      anychart.utils.normalizeSize('62%', stageSize.width),
      headerHeight + 2 + 5, //header height + separator line stroke + margin
      anychart.utils.normalizeSize('37%', stageSize.width),
      anychart.utils.normalizeSize('30%', stageSize.height)
  );

  var top8CustomersLabel = anychart.ui.label();
  top8CustomersLabel.container(stage);
  top8CustomersLabel.text('Top 8 Customers This Quarter');
  top8CustomersLabel.padding().top(8).left(5);
  top8CustomersLabel.fontSize(14);
  top8CustomersLabel.position('lefttop');
  top8CustomersLabel.anchor('lefttop');
  top8CustomersLabel.parentBounds(top8CustomersSize);
  top8CustomersLabel.draw();

  var top8CustomersLegend = createLegend([
    {text: 'Pipeline', iconFill: '#828282'}
  ], top8CustomersSize);
  top8CustomersLegend.align('right');
  top8CustomersLegend.draw();


  var top8CustomersSizeWithoutLegend =  top8CustomersLegend.getRemainingBounds();
  var top8CustomersTable = anychart.ui.table();
  top8CustomersTable.container(stage);
  top8CustomersTable.contents([
      ['#', 'Customer',                 createBulletChart([{value: 10}])],
      ['1', 'The Big Wine Store',       createBulletChart([{value: 10}])],
      ['2', 'Wines \'R Us',             createBulletChart([{value: 10}])],
      ['3', 'Fruit of the Vine Inc.',   createBulletChart([{value: 10}])],
      ['4', 'Spirits of the Age',       createBulletChart([{value: 10}])],
      ['5', 'The Beverage Company',     createBulletChart([{value: 10}])],
      ['6', 'Sips and Bites',           createBulletChart([{value: 10}])],
      ['7', 'American Vinter\'s Beast', createBulletChart([{value: 10}])],
      ['8', 'Barrel and Keg',           createBulletChart([{value: 10}])]
  ]);

  top8CustomersTable.colWidth(0, 20);
  top8CustomersTable.bounds(top8CustomersSizeWithoutLegend);

  //tmp dirty hack
  rowsCount = top8CustomersTable.rowsCount();
  for (i = 0; i < rowsCount; i++) {
    var customerCell = top8CustomersTable.getCell(i, 1);
    customerCell.content().hAlign('left');
  }

  top8CustomersTable.draw();


  //------------------------------------------------------------------
  // Revenue QTD
  //------------------------------------------------------------------
  var revenueQTDSize = new anychart.math.Rect(
      5,
      anychart.utils.normalizeSize('35%', stageSize.height),
      anychart.utils.normalizeSize('50%', stageSize.width),
      anychart.utils.normalizeSize('30%', stageSize.height)
  );

  var revenueQTDLabel = anychart.ui.label();
  revenueQTDLabel.container(stage);
  revenueQTDLabel.text('Revenue QTD');
  revenueQTDLabel.padding().top(8).left(5);
  revenueQTDLabel.fontSize(14);
  revenueQTDLabel.position('lefttop');
  revenueQTDLabel.anchor('lefttop');
  revenueQTDLabel.parentBounds(revenueQTDSize);
  revenueQTDLabel.draw();

  var revenueQTDLegend = createLegend([
    {text: '90%', iconFill: '#828282'},
    {text: '75%', iconFill: '#a8a8a8'}
  ], revenueQTDSize);
  revenueQTDLegend.title().text('Pipeline: ').enabled(true).orientation('left').rotation(0).margin().top(-4);
  revenueQTDLegend.titleSeparator().enabled(true).width(0).orientation('left').height(0);
  revenueQTDLegend.align('right');
  revenueQTDLegend.draw();


  var revenueQTDSizeWithoutLegend =  revenueQTDLegend.getRemainingBounds();
  revenueQTDSizeWithoutLegend.top -=45;//todo: something wrong with legend getRemainingBounds with title orientation left
  var revenueQTDSizeTable = anychart.ui.table();
  revenueQTDSizeTable.container(stage);
  revenueQTDSizeTable.contents([
    ['Region',        createBulletChart([{value: 10}]), 'Actual'],
    ['North America', createBulletChart([{value: 10}]), '47,273'],
    ['Europe',        createBulletChart([{value: 10}]), '44,936'],
    ['Asia',          createBulletChart([{value: 10}]), '39,254'],
    ['South America', createBulletChart([{value: 10}]), '32,734'],
    ['Middle East',   createBulletChart([{value: 10}]), '20,973']
  ]);

  revenueQTDSizeTable.bounds(revenueQTDSizeWithoutLegend);
  revenueQTDSizeTable.draw();

  //------------------------------------------------------------------
  // Revenue YTD
  //------------------------------------------------------------------
  var revenueYTDSize = new anychart.math.Rect(
      anychart.utils.normalizeSize('52%', stageSize.width),
      anychart.utils.normalizeSize('35%', stageSize.height),
      anychart.utils.normalizeSize('47%', stageSize.width),
      anychart.utils.normalizeSize('30%', stageSize.height)
  );

  var revenueYTDLabel = anychart.ui.label();
  revenueYTDLabel.container(stage);
  revenueYTDLabel.text('Revenue YDT');
  revenueYTDLabel.padding().top(8).left(5);
  revenueYTDLabel.fontSize(14);
  revenueYTDLabel.position('lefttop');
  revenueYTDLabel.anchor('lefttop');
  revenueYTDLabel.parentBounds(revenueYTDSize);
  revenueYTDLabel.draw();


  var revenueYTDSizeWithoutLabel =  revenueYTDSize.clone();
  revenueYTDSizeWithoutLabel.top = revenueQTDSizeWithoutLegend.top;
  revenueYTDSizeWithoutLabel.height = revenueQTDSizeWithoutLegend.height;

  var revenueYTDSizeTable = anychart.ui.table();
  revenueYTDSizeTable.container(stage);
  revenueYTDSizeTable.contents([
    ['Past 12 Months',                                  'Region',        'Actual vs Target',               'Actual'],
    [anychart.core.cartesian.series.line(lineChartsData[0]), 'North America', createBulletChart([{value: 10}]), '243,585'],
    [anychart.core.cartesian.series.line(lineChartsData[1]), 'Europe',        createBulletChart([{value: 10}]), '201.865'],
    [anychart.core.cartesian.series.line(lineChartsData[2]), 'Asia',          createBulletChart([{value: 10}]), '195,766'],
    [anychart.core.cartesian.series.line(lineChartsData[3]), 'South America', createBulletChart([{value: 10}]), '119,394'],
    [anychart.core.cartesian.series.line(lineChartsData[4]), 'Middle East',   createBulletChart([{value: 10}]), '101.624']
  ]);

  revenueYTDSizeTable.bounds(revenueYTDSizeWithoutLabel);
  revenueYTDSizeTable.draw();

  //------------------------------------------------------------------
  // Product Sales YTD
  //------------------------------------------------------------------
  var productSalesYTDSize = new anychart.math.Rect(
      5,
      anychart.utils.normalizeSize('61%', stageSize.height),
      anychart.utils.normalizeSize('70%', stageSize.width),
      anychart.utils.normalizeSize('30%', stageSize.height)
  );

  var productSalesYTDLabel = anychart.ui.label();
  productSalesYTDLabel.container(stage);
  productSalesYTDLabel.text('Product Sales YDT');
  productSalesYTDLabel.padding().top(8).left(5);
  productSalesYTDLabel.fontSize(14);
  productSalesYTDLabel.position('lefttop');
  productSalesYTDLabel.anchor('lefttop');
  productSalesYTDLabel.parentBounds(productSalesYTDSize);
  productSalesYTDLabel.draw();


  var productSalesYTDSizeWithoutLabel =  productSalesYTDSize.clone();
  productSalesYTDSizeWithoutLabel.top += productSalesYTDLabel.getContentBounds().height;
  productSalesYTDSizeWithoutLabel.height -= productSalesYTDLabel.getContentBounds().height;

  var productSalesYTDSizeTable = anychart.ui.table();
  productSalesYTDSizeTable.container(stage);
  productSalesYTDSizeTable.contents([
    ['Past 12 Months',                                  'Product',         'Actual vs Target',               'Revenue vs Target'             , 'Actual'],
    [anychart.core.cartesian.series.line(lineChartsData[0]), 'Cabernet',        createBulletChart([{value: 10}]), createBulletChart([{value: 10}]), '243,585'],
    [anychart.core.cartesian.series.line(lineChartsData[1]), 'Zinfandel',       createBulletChart([{value: 10}]), createBulletChart([{value: 10}]), '201.865'],
    [anychart.core.cartesian.series.line(lineChartsData[2]), 'Chardonnay',      createBulletChart([{value: 10}]), createBulletChart([{value: 10}]), '195,766'],
    [anychart.core.cartesian.series.line(lineChartsData[3]), 'Sauvignan Blanc', createBulletChart([{value: 10}]), createBulletChart([{value: 10}]), '119,394'],
    [anychart.core.cartesian.series.line(lineChartsData[4]), 'Merlot',          createBulletChart([{value: 10}]), createBulletChart([{value: 10}]), '101.624']
  ]);

  productSalesYTDSizeTable.bounds(productSalesYTDSizeWithoutLabel);
  productSalesYTDSizeTable.draw();


  //------------------------------------------------------------------
  // Marker Share
  //------------------------------------------------------------------
  var marketShareSize = new anychart.math.Rect(
      anychart.utils.normalizeSize('72%', stageSize.width),
      anychart.utils.normalizeSize('61%', stageSize.height),
      anychart.utils.normalizeSize('26%', stageSize.width),
      anychart.utils.normalizeSize('30%', stageSize.height)
  );

  var markerSizeLabel = anychart.ui.label();
  markerSizeLabel.container(stage);
  markerSizeLabel.text('Market Share');
  markerSizeLabel.padding().top(8).left(5);
  markerSizeLabel.fontSize(14);
  markerSizeLabel.position('lefttop');
  markerSizeLabel.anchor('lefttop');
  markerSizeLabel.parentBounds(marketShareSize);
  markerSizeLabel.draw();


  var marketShareSizeWithoutLabel =  marketShareSize.clone();
  marketShareSizeWithoutLabel.top += markerSizeLabel.getContentBounds().height;
  marketShareSizeWithoutLabel.height -= markerSizeLabel.getContentBounds().height;

  var marketShareSizeTable = anychart.ui.table();
  marketShareSizeTable.container(stage);
  marketShareSizeTable.contents([
    ['Company',         '% of Total Market'],
    ['Eno Beverages',        createBulletChart([{value: 10}])],
    ['Elysuab Sprits',       createBulletChart([{value: 10}])],
    ['Our Company',      createBulletChart([{value: 10}])],
    ['Ventner\'s Beast', createBulletChart([{value: 10}])],
    ['Golden Vines',          createBulletChart([{value: 10}])],
    ['Harvest Delight',          createBulletChart([{value: 10}])],
    ['All Others',          createBulletChart([{value: 10}])]
  ]);

  marketShareSizeTable.bounds(marketShareSizeWithoutLabel);
  marketShareSizeTable.draw();

});

function createBulletChart(data) {
  var chart = anychart.bullet(data);
  chart.title().enabled(false);
  chart.padding(0);
  chart.margin(7, 0, 2, 0);
  chart.axis().enabled(false);
  chart.range().from(0).to(5);
  chart.range(1).from(5).to(10);
  chart.range(2).from(10).to(15);
  return chart;
}


function createLegend(data, bounds) {
  var legend = anychart.ui.legend();
  legend.itemsLayout('horizontal');
  legend.parentBounds(bounds);
  legend.container(stage);
  legend.itemsProvider(data);
  legend.title().enabled(false);
  legend.background().enabled(false);
  legend.titleSeparator().enabled(false);
  legend.position('top');
  return legend;
}