function create_pie_chart(palette) {
  var chart = anychart.pie(data_set_1);
  if (palette) chart.palette(palette);
  chart.labels().position('outside');
  return chart;
}
function create_donut_chart(palette) {
  var chart = anychart.pie(data_set_1);
  chart.innerRadius('30%');
  chart.title('Distribution of Fruit by Profitability');
  if (palette) chart.palette(palette);
  chart.labels().position('inside');
  return chart;
}
function create_pyramid_chart(palette) {
  var chart = anychart.pyramid(data_set_1);
  if (palette) chart.palette(palette);
  chart.labels().position('inside');
  return chart;
}
function create_funnel_chart(palette) {
  var chart = anychart.funnel(data_set_1);
  if (palette) chart.palette(palette);
  chart.labels().position('outside');
  return chart;
}
function create_bar_chart(palette) {
  var chart = anychart.bar();
  if (palette) chart.palette(palette);
  chart.bar(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');
  return chart;
}
function create_area_chart(palette) {
  var chart = anychart.area();
  chart.yScale().stackMode('percent');
  if (palette) chart.palette(palette);
  chart.area(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');
  chart.area(data_set_2.mapAs({x: [0], value: [2]})).name('Pears');
  chart.area(data_set_2.mapAs({x: [0], value: [3]})).name('Peaches');
  return chart;
}
function create_column_chart(palette) {
  var chart = anychart.column();
  chart.title('Fruit Sales');
  chart.legend().enabled(true);
  if (palette) chart.palette(palette);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true).layout('v');
  chart.minorGrid().enabled(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.column(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');
  chart.column(data_set_2.mapAs({x: [0], value: [2]})).name('Pears');
  return chart;
}
function create_line_chart(palette, seriesCount) {
  var chart = anychart.line();
  chart.legend().enabled(true);
  if (palette) chart.palette(palette);
  if (!seriesCount) seriesCount = 10;
  for (var i = 0; i < seriesCount; i++) {
    chart.line(data_set_2.mapAs({x: [0], value: [i + 1]})).name(seriesNames[i]);
  }
  return chart;
}
function create_3D_pie_chart(palette) {
  var chart = anychart.pie3d(data_set_1);
  chart.innerRadius('30%');
  if (palette) chart.palette(palette);
  chart.labels().position('outside');
  return chart;
}
function create_3D_bar_chart(palette) {
  var chart = anychart.bar3d();
  if (palette) chart.palette(palette);
  chart.bar(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');

  return chart;
}
function create_3D_area_chart(palette) {
  var chart = anychart.area3d();
  if (palette) chart.palette(palette);
  chart.area(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');
  return chart;
}
function create_3D_column_chart(palette) {
  var chart = anychart.column3d();
  chart.title('Fruit Sales');
  chart.legend().enabled(true);
  if (palette) chart.palette(palette);
  chart.column(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');
  chart.column(data_set_2.mapAs({x: [0], value: [2]})).name('Pears');

  return chart;
}
function create_marker_chart(palette, seriesCount) {
  var chart = anychart.scatter();
  if (palette) chart.palette(palette);
  if (!seriesCount) seriesCount = 10;
  chart.title('April Fruit Sales');
  chart.xAxis().title('Price per kg, $');
  chart.yAxis().title('Amount of sold kgs');
  for (var i = 0; i < seriesCount; i++) {
    chart.marker(data_set_2.mapAs({x: [i + 1], value: [11]})).name(seriesNames[i]);
  }
  return chart;
}
function create_bubble_chart(palette) {
  var chart = anychart.scatter();
  if (palette) chart.palette(palette);
  chart.bubble(data_set_2.mapAs({x: [1], value: [11], size: [12]})).name('Apples');
  chart.bubble(data_set_2.mapAs({x: [2], value: [11], size: [12]})).name('Pears');
  return chart;
}
function create_box_chart(palette) {
  var chart = anychart.box();
  chart.title('April Fruits Sales');
  if (palette) chart.palette(palette);
  chart.box(data_set_3).name('April Sales');
  return chart;
}
function create_error_chart(palette) {
  var chart = anychart.marker();
  if (palette) chart.palette(palette);
  chart.marker(data_set_4.mapAs({
    name: [0],
    x: [2],
    value: [1],
    xLowerError: [3],
    xUpperError: [4],
    valueLowerError: [5],
    valueUpperError: [6]
  })).name('April Sales');
  return chart;
}
function create_polar_line_chart(palette) {
  var chart = anychart.polar();
  if (palette) chart.palette(palette);
  chart.line([[0, 0], [10, 1], [20, 2], [30, 3], [40, 4], [50, 5], [60, 6], [70, 7], [80, 8], [90, 9], [100, 10]])
      .closed(false).name('April Sales').markers().enabled(true);
  return chart;
}
function create_polar_marker_chart(palette) {
  var chart = anychart.polar();
  if (palette) chart.palette(palette);
  chart.marker(data_set_2.mapAs({x: [11], value: [1]})).name('Apples');
  chart.marker(data_set_2.mapAs({x: [11], value: [2]})).name('Oranges');
  chart.marker(data_set_2.mapAs({x: [11], value: [3]})).name('Peaches');
  return chart;
}
function create_radar_line_chart(palette) {
  var chart = anychart.radar();
  if (palette) chart.palette(palette);
  chart.line(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');
  chart.line(data_set_2.mapAs({x: [0], value: [2]})).name('Oranges');
  chart.line(data_set_2.mapAs({x: [0], value: [3]})).name('Peaches');
  return chart;
}
function create_radar_area_chart(palette) {
  var chart = anychart.radar();
  if (palette) chart.palette(palette);
  chart.area(data_set_2.mapAs({x: [0], value: [1]})).name('Apples');
  chart.area(data_set_2.mapAs({x: [0], value: [2]})).name('Oranges');
  chart.area(data_set_2.mapAs({x: [0], value: [3]})).name('Peaches');
  chart.yScale().stackMode('percent');
  return chart;
}
function create_choropleth_map(palette) {
  var filterConstructor = function(target) {
    return function(val) {
      return val == target;
    }
  };
  var chart = anychart.map();
  chart.geoData(anychart.maps['austria']);
  if (palette) chart.palette(palette);
  chart.choropleth(dataSet_austria_map_1.filter('series', filterConstructor('1'))).name('First');
  chart.choropleth(dataSet_austria_map_1.filter('series', filterConstructor('2'))).name('Second');
  chart.choropleth(dataSet_austria_map_1.filter('series', filterConstructor('3'))).name('Third');
  chart.choropleth(dataSet_austria_map_1.filter('series', filterConstructor('4'))).name('Forth');
  chart.legend().enabled(true);
  return chart;
}
function create_choropleth_range_map(palette) {
  var chart = anychart.map();
  chart.geoData(anychart.maps['austria']);
  if (palette) chart.palette(palette);
  var series = chart.choropleth(dataSet_austria_map_1);
  series.colorScale(anychart.scales.linearColor());
  var colorRange = chart.colorRange();
  colorRange.enabled(true);
  return chart;
}
function create_bubble_markers_map(palette) {
  var chart = anychart.map();
  if (palette) chart.palette(palette);
  chart.title('Bubble & Marker Series');
  chart.geoData(anychart.maps['austria']);
  chart.minBubbleSize(7);
  chart.maxBubbleSize(20);
  chart.bubble(dataSet_austria_map_2);
  return chart;
}
function create_connector_map(palette) {
  var chart = anychart.connector();
  chart.geoData(anychart.maps['austria']);
  if (palette) chart.palette(palette);
  chart.marker(dataSet_austria_map_3);
  chart.connector(dataSet_austria_map_4)
    //todo: remove this line after Sergey M fix the issue
      .hoverMarkers().enabled(true).size(15);
  return chart;
}
function create_sparkline(data, type, palette) {
  var chart_data = data['profitTrend'];
  if (chart_data) var chart = anychart.sparkline(chart_data);
  else chart = anychart.sparkline(data);
  chart.type(type);
  return chart;
}
function create_bullet(data, palette) {
  var target = eval(data['toGoal'].join('+'));
  var actual = eval(data['actualSales'].join('+'));
  return anychart.bullet([
    {value: Math.round(actual), type: 'bar'},
    {value: Math.round(target), 'type': 'line'}
  ]);
}
function create_bullet_range(data, palette) {
  var target = eval(data['toGoal'].join('+'));
  var actual = eval(data['actualSales'].join('+'));
  var bullet = anychart.bullet([
    {value: Math.round(actual), 'type': 'x'},
    {value: Math.round(target), 'type': 'ellipse'}
  ]);
  bullet.range().from(0).to(Math.round(target) * 2 / 5);
  bullet.range(1).from(Math.round(target) * 2 / 5).to(Math.round(target) * 3 / 5);
  bullet.range(2).from(Math.round(target) * 3 / 5).to(Math.round(target) * 4 / 5);
  bullet.range(3).from(Math.round(target) * 4 / 5).to(Math.round(target) + 2);
  bullet.range(4).from(Math.round(target) + 2).to(37);
  return bullet;
}
function create_sparkline_area(palette) {
  var table = anychart.ui.table();
  table.cellPadding(0).cellBorder(anychart.theme().defaultBackground.fill);
  table.contents([
    [create_sparkline(table_data['Alabama'], 'area', palette)],
    [create_sparkline(table_data['Alaska'], 'area', palette)],
    [create_sparkline(table_data['Arizona'], 'area', palette)],
    [create_sparkline(table_data['Idaho'], 'area', palette)],
    [create_sparkline(table_data['Illinois'], 'area', palette)],
    [create_sparkline(table_data['Indiana'], 'area', palette)],
    [create_sparkline(table_data['Ohio'], 'area', palette)],
    [create_sparkline(table_data['Oklahoma'], 'area', palette)],
    [create_sparkline(table_data['Oregon'], 'area', palette)],
    [create_sparkline(table_data['Vermont'], 'area', palette)],
    [create_sparkline(table_data['Virginia'], 'area', palette)],
    [create_sparkline(table_data['Washington'], 'area', palette)]
  ]);
  return table;
}
function create_sparkline_column(palette) {
  var table = anychart.ui.table();
  table.cellPadding(0).cellBorder(anychart.theme().defaultBackground.fill);
  table.contents([
    [create_sparkline(table_data['Alabama'], 'column', palette), create_sparkline(table_data['Ohio'], 'column', palette)],
    [create_sparkline(table_data['Alaska'], 'column', palette), create_sparkline(table_data['Oklahoma'], 'column', palette)],
    [create_sparkline(table_data['Arizona'], 'column', palette), create_sparkline(table_data['Oregon'], 'column', palette)],
    [create_sparkline(table_data['Idaho'], 'column', palette), create_sparkline(table_data['Vermont'], 'column', palette)],
    [create_sparkline(table_data['Illinois'], 'column', palette), create_sparkline(table_data['Virginia'], 'column', palette)],
    [create_sparkline(table_data['Indiana'], 'column', palette), create_sparkline(table_data['Washington'], 'column', palette)]
  ]);
  return table;
}
function create_sparkline_line(palette) {
  var table = anychart.ui.table();
  table.cellPadding(0).cellBorder(anychart.theme().defaultBackground.fill);
  table.contents([
    [create_sparkline(table_data['Alabama'], 'line', palette)],
    [create_sparkline(table_data['Alaska'], 'line', palette)],
    [create_sparkline(table_data['Arizona'], 'line', palette)],
    [create_sparkline(table_data['Idaho'], 'line', palette)],
    [create_sparkline(table_data['Illinois'], 'line', palette)],
    [create_sparkline(table_data['Indiana'], 'line', palette)],
    [create_sparkline(table_data['Ohio'], 'line', palette)],
    [create_sparkline(table_data['Oklahoma'], 'line', palette)],
    [create_sparkline(table_data['Oregon'], 'line', palette)],
    [create_sparkline(table_data['Vermont'], 'line', palette)],
    [create_sparkline(table_data['Virginia'], 'line', palette)],
    [create_sparkline(table_data['Washington'], 'line', palette)]
  ]);
  return table;
}
function create_sparkline_win_loss(palette) {
  var table = anychart.ui.table();
  table.cellPadding(0).cellBorder(anychart.theme().defaultBackground.fill);
  table.contents([
    [create_sparkline(t1, 'winLoss', palette)],
    [create_sparkline(t2, 'winLoss', palette)],
    [create_sparkline(t3, 'winLoss', palette)],
    [create_sparkline(t4, 'winLoss', palette)],
    [create_sparkline(t5, 'winLoss', palette)],
    [create_sparkline(t6, 'winLoss', palette)],
    [create_sparkline(t7, 'winLoss', palette)],
    [create_sparkline(t8, 'winLoss', palette)],
    [create_sparkline(t9, 'winLoss', palette)],
    [create_sparkline(t10, 'winLoss', palette)],
    [create_sparkline(t11, 'winLoss', palette)],
    [create_sparkline(t12, 'winLoss', palette)]
  ]);
  return table;
}
function create_bullet_chart(palette) {
  var table = anychart.ui.table();
  table.cellPadding(0).cellBorder(anychart.theme().defaultBackground.fill);
  table.contents([
    [create_bullet(table_data['Alabama'], palette)],
    [create_bullet(table_data['Alaska'], palette)],
    [create_bullet(table_data['Arizona'], palette)],
    [create_bullet(table_data['Idaho'], palette)],
    [create_bullet(table_data['Illinois'], palette)]
  ]);
  return table;
}
function create_bullet_range_chart(palette) {
  var table = anychart.ui.table();
  table.cellPadding(0).cellBorder(anychart.theme().defaultBackground.fill);
  table.contents([
    [create_bullet_range(table_data['Alabama'], palette)],
    [create_bullet_range(table_data['Alaska'], palette)],
    [create_bullet_range(table_data['Arizona'], palette)],
    [create_bullet_range(table_data['Idaho'], palette)],
    [create_bullet_range(table_data['Illinois'], palette)]
  ]);
  return table;
}
function create_ohlc(palette) {
  var chart = anychart.financial();
  chart.ohlc([
    {x: Date.UTC(2007, 7, 28), open: 511.53, high: 514.98, low: 505.79, close: 506.40},
    {x: Date.UTC(2007, 7, 29), open: 507.84, high: 513.30, low: 507.23, close: 512.88},
    {x: Date.UTC(2007, 7, 30), open: 512.36, high: 515.40, low: 510.58, close: 511.40},
    {x: Date.UTC(2007, 7, 31), open: 513.10, high: 516.50, low: 511.47, close: 515.25},
    {x: Date.UTC(2007, 8, 4), open: 515.02, high: 528.00, low: 514.62, close: 525.15}
  ]);
  return chart;
}
function create_candlestick(palette) {
  var chart = anychart.financial();
  chart.candlestick([
    {x: Date.UTC(2007, 7, 28), open: 511.53, high: 514.98, low: 505.79, close: 506.40},
    {x: Date.UTC(2007, 7, 29), open: 507.84, high: 513.30, low: 507.23, close: 512.88},
    {x: Date.UTC(2007, 7, 30), open: 512.36, high: 515.40, low: 510.58, close: 511.40},
    {x: Date.UTC(2007, 7, 31), open: 513.10, high: 516.50, low: 511.47, close: 515.25},
    {x: Date.UTC(2007, 8, 4), open: 515.02, high: 528.00, low: 514.62, close: 525.15}
  ]);
  return chart;
}
function create_heat_map_color_scaled(palette) {
  var chart = anychart.heatMap([
    {x: 'Rare', y: 'Insignificant', heat: 0},
    {x: 'Rare', y: 'Minor', heat: 0},
    {x: 'Rare', y: 'Moderate', heat: 0},
    {x: 'Rare', y: 'Major', heat: 0},
    {x: 'Rare', y: 'Extreme', heat: 0},
    {x: 'Unlikely', y: 'Insignificant', heat: 0},
    {x: 'Unlikely', y: 'Minor', heat: 0},
    {x: 'Unlikely', y: 'Moderate', heat: 0},
    {x: 'Unlikely', y: 'Major', heat: 1},
    {x: 'Unlikely', y: 'Extreme', heat: 1},
    {x: 'Possible', y: 'Insignificant', heat: 0},
    {x: 'Possible', y: 'Minor', heat: 0},
    {x: 'Possible', y: 'Moderate', heat: 1},
    {x: 'Possible', y: 'Major', heat: 1},
    {x: 'Possible', y: 'Extreme', heat: 1},
    {x: 'Likely', y: 'Insignificant', heat: 0},
    {x: 'Likely', y: 'Minor', heat: 1},
    {x: 'Likely', y: 'Moderate', heat: 1},
    {x: 'Likely', y: 'Major', heat: 2},
    {x: 'Likely', y: 'Extreme', heat: 2},
    {x: 'Almost\nCertain', y: 'Insignificant', heat: 0},
    {x: 'Almost\nCertain', y: 'Minor', heat: 1},
    {x: 'Almost\nCertain', y: 'Moderate', heat: 1},
    {x: 'Almost\nCertain', y: 'Major', heat: 2},
    {x: 'Almost\nCertain', y: 'Extreme', heat: 3}
  ]);
  var scale = anychart.scales.linearColor();
  chart.colorScale(scale);
  // todo: make it possible:
  //var colorRange = chart.colorRange();
  //colorRange.enabled(true);
  return chart;
}
function create_heat_map(palette) {
  var chart = anychart.heatMap(anychart.data.set(data_for_heat_map).mapAs({y: [0], x: [1], value: [2], heat: [3]}));
  var colorScale = chart.colorScale();
  colorScale.ranges([
    {equal: 0, name: 'Lean'},
    {equal: 1, name: 'Ideal'},
    {equal: 2, name: 'Average'},
    {equal: 3, name: 'Above average'}
  ]);
  chart.colorScale(colorScale);

  chart.xScroller().enabled(true);
  chart.yScroller().enabled(true);
  chart.xZoom().setToPointsCount(8);
  chart.yZoom().setToPointsCount(6);

  chart.legend().enabled(true);
  return chart;
}
function create_tree_map(palette) {
  var data = anychart.data.tree([
    {id: 'Cosmetics', parent: null},
      {id: 'Decorative Cosmetics', parent: 'Cosmetics'},
        {id: 'Powder', parent: 'Decorative Cosmetics', value: 20},
        {id: 'Foundation', parent: 'Decorative Cosmetics', value: 30},
        {id: 'Rouge', parent: 'Decorative Cosmetics', value: 15},
        {id: 'Pomade', parent: 'Decorative Cosmetics', value: 55},
        {id: 'Lip gloss', parent: 'Decorative Cosmetics', value: 45},
        {id: 'Lip pencil', parent: 'Decorative Cosmetics', value: 50},
        {id: 'Mascara', parent: 'Decorative Cosmetics', value: 35},
        {id: 'Eyeliner', parent: 'Decorative Cosmetics', value: 70},
        {id: 'Eye shadow', parent: 'Decorative Cosmetics', value: 105},

      {id: 'Face-care Cosmetics', parent: 'Cosmetics'},
        {id: 'Balm Cream', parent: 'Face-care Cosmetics'},
        {id: 'Creams', parent: 'Face-care Cosmetics', value: 40},
        {id: 'Day-care Cream', parent: 'Face-care Cosmetics', value: 30},
        {id: 'Night-care Cream', parent: 'Face-care Cosmetics', value: 40},

      {id: 'Body-care Cosmetics', parent: 'Cosmetics'},
        {id: 'Shampoo', parent: 'Body-care Cosmetics', value: 30},
        {id: 'Hair Balm', parent: 'Body-care Cosmetics', value: 40},
        {id: 'Moisturizer', parent: 'Body-care Cosmetics', value: 10}

  ], anychart.enums.TreeFillingMethod.AS_TABLE);
  var chart = anychart.treeMap(data);
  chart.hintDepth(0);
  chart.maxDepth(2);
  chart.container('container');
  chart.legend().enabled(true);
  return chart;
}
function create_tree_map_with_color_range(palette) {
  var data = anychart.data.tree([
    {id: 'Cosmetics', parent: null},
      {id: 'Decorative Cosmetics', parent: 'Cosmetics'},
        {id: 'Masking Cosmetics', parent: 'Decorative Cosmetics'},
          {id: 'Powder', parent: 'Masking Cosmetics', value: 20},
          {id: 'Foundation', parent: 'Masking Cosmetics', value: 30},
          {id: 'Rouge', parent: 'Masking Cosmetics', value: 15},
        {id: 'Lips Cosmetics', parent: 'Decorative Cosmetics'},
          {id: 'Pomade', parent: 'Lips Cosmetics', value: 55},
          {id: 'Lip gloss', parent: 'Lips Cosmetics', value: 45},
          {id: 'Lip pencil', parent: 'Lips Cosmetics', value: 50},
        {id: 'Eye Cosmetics', parent: 'Decorative Cosmetics'},
          {id: 'Mascara', parent: 'Eye Cosmetics', value: 35},
          {id: 'Eyeliner', parent: 'Eye Cosmetics', value: 70},
          {id: 'Eye shadow', parent: 'Eye Cosmetics', value: 105},

      {id: 'Face-care Cosmetics', parent: 'Cosmetics'},
        {id: 'Balm Cream', parent: 'Face-care Cosmetics'},

      {id: 'Creams', parent: 'Face-care Cosmetics', value: 400},
        {id: 'Day-care Cream', parent: 'Face-care Cosmetics', value: 300},
        {id: 'Night-care Cream', parent: 'Face-care Cosmetics', value: 400},

      {id: 'Body-care Cosmetics', parent: 'Cosmetics'},
        {id: 'Skin-care', parent: 'Body-care Cosmetics', value: 400},
        {id: 'Hair-care', parent: 'Body-care Cosmetics'},
          {id: 'Shampoo', parent: 'Hair-care', value: 300},
          {id: 'Hair Balm', parent: 'Hair-care', value: 400},
          {id: 'Moisturizer', parent: 'Skin-care', value: 100}
  ], anychart.enums.TreeFillingMethod.AS_TABLE);
  var chart = anychart.treeMap(data);
  chart.container('container');
  var colorRange = chart.colorRange();
  colorRange.enabled(true);

  chart.title('Profit from Cosmetics Sales. ACME corp.').enabled(true);
  return chart;
}
