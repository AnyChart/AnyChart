var currentPalette, currentSeriesCount, currentTheme, currentTypes;
var chart1, chart2, chart3, chart4, stock1, stock2;
var stage1, stage2, stage3, stage4, stage5, stage6;
function disposeCharts() {
  if (chart1) chart1.dispose();
  if (chart2) chart2.dispose();
  if (chart3) chart3.dispose();
  if (chart4) chart4.dispose();
  if (stock1) stock1.dispose();
  if (stock2) stock2.dispose();
}
function createStages() {
  stage1 = acgraph.create('container-chart-1');
  stage2 = acgraph.create('container-chart-2');
  stage3 = acgraph.create('container-chart-3');
  stage4 = acgraph.create('container-chart-4');
  stage5 = acgraph.create('container-stock-1');
  stage6 = acgraph.create('container-stock-2');
}
function showStockCharts(flag) {
  if (flag) {
    $('.container-stock').show();
    $('.container-chart').hide();
  } else {
    $('.container-stock').hide();
    $('.container-chart').show();
  }
}

function updateCharts(palette, chartTypes, seriesCount) {
  showStockCharts(false);
  if (chartTypes == 'area-line-bar-column') {
    chart1 = create_bar_chart(palette).container(stage1).draw();
    chart2 = create_area_chart(palette).container(stage2).draw();
    chart3 = create_column_chart(palette).container(stage3).draw();
    chart4 = create_line_chart(palette, seriesCount).container(stage4).draw();
  }
  else if (chartTypes == 'pie-donut-funnel-pyramid') {
    chart1 = create_pie_chart(palette).container(stage1).draw();
    chart2 = create_donut_chart(palette).container(stage2).draw();
    chart3 = create_pyramid_chart(palette).container(stage3).draw();
    chart4 = create_funnel_chart(palette).container(stage4).draw();
  }
  else if (chartTypes == '3d') {
    chart1 = create_3D_pie_chart(palette).container(stage1).draw();
    chart2 = create_3D_area_chart(palette).container(stage2).draw();
    chart3 = create_3D_bar_chart(palette).container(stage3).draw();
    chart4 = create_3D_column_chart(palette).container(stage4).draw();
  }
  else if (chartTypes == 'marker-bubble-box-error') {
    chart1 = create_marker_chart(palette, seriesCount).container(stage1).draw();
    chart2 = create_bubble_chart(palette).container(stage2).draw();
    chart3 = create_box_chart(palette).container(stage3).draw();
    chart4 = create_error_chart(palette).container(stage4).draw();
  }
  else if (chartTypes == 'polar-radar') {
    chart1 = create_polar_line_chart(palette).container(stage1).draw();
    chart2 = create_polar_marker_chart(palette).container(stage2).draw();
    chart3 = create_radar_line_chart(palette).container(stage3).draw();
    chart4 = create_radar_area_chart(palette).container(stage4).draw();
  }
  else if (chartTypes == 'maps') {
    chart1 = create_choropleth_map(palette).container(stage1).draw();
    chart2 = create_choropleth_range_map(palette).container(stage2).draw();
    chart3 = create_bubble_markers_map(palette).container(stage3).draw();
    chart4 = create_connector_map(palette).container(stage4).draw();
  }
  else if (chartTypes == 'sparklines') {
    chart1 = create_sparkline_area(palette).container(stage1).draw();
    chart2 = create_sparkline_column(palette).container(stage2).draw();
    chart3 = create_sparkline_line(palette).container(stage3).draw();
    chart4 = create_sparkline_win_loss(palette).container(stage4).draw();
  }
  else if (chartTypes == 'bullet-financial') {
    chart1 = create_bullet_chart(palette).container(stage1).draw();
    chart2 = create_bullet_range_chart(palette).container(stage2).draw();
    chart3 = create_candlestick(palette).container(stage3).draw();
    chart4 = create_ohlc(palette).container(stage4).draw();
  }
  else if (chartTypes == 'tree-map-heat-map') {
    chart1 = create_tree_map(palette).container(stage1).draw();
    chart2 = create_tree_map_with_color_range(palette).container(stage2).draw();
    chart3 = create_heat_map(palette).container(stage3).draw();
    chart4 = create_heat_map_color_scaled(palette).container(stage4).draw();
  }
  else {
    showStockCharts(true);
    if (chartTypes == 'stock-line-column') {
      stock1 = create_column_stock(palette).container(stage5).draw();
      stock2 = create_line_stock(palette).container(stage6).draw();
    }
    else if (chartTypes == 'stock-ohlc-area') {
      stock1 = create_ohlc_stock(palette).container(stage5).draw();
      stock2 = create_area_stock(palette).container(stage6).draw();
    }
  }
}
function update() {
  var theme = $('#themes-select').val().split('|')[0];
  var chartTypes = $('#chart-types-select').val();
  var paletteName = $('#palettes-select').val();
  var palette = anychart.palettes[paletteName];
  var seriesCount = (paletteName == 'monochrome') ? 5 : 10;
  if (theme != currentTheme || palette != currentPalette || chartTypes != currentTypes || seriesCount != seriesCount) {
    currentPalette = palette;
    currentSeriesCount = seriesCount;
    currentTheme = theme;
    currentTypes = chartTypes;
    disposeCharts();
    anychart.theme(theme);
    updateCharts(palette, chartTypes, seriesCount);
  }
}

$(function() {
  createStages();
  update();
  $('#themes-select').on('change', function() {
    var themePalette = $('#themes-select').val().split('|')[1];
    var paletteSelect = $('#palettes-select');
    paletteSelect.val(themePalette);
    //paletteSelect.selectpicker('refresh');
    update();
  });
  $('select').on('change', function() {
    update();
  });
});

$(window).resize(function() {
  update();
});
