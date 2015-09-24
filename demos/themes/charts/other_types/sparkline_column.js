var createSparkLineChart = function(name, trend, range_markers, labels) {
    var data = table_data[name];
    var chart = anychart.sparkline(data[trend]);
    chart.type('column');
    chart.padding(0);
    chart.margin(0, 0, 0, 0);
    chart.background('#fff');
    chart.xScale().ticks().interval(1);
    var color = palette.colorAt(0);
    chart.fill(color + ' ' + 0.7);
    chart.stroke(line_thickness + ' ' + color);
    chart.negativeFill(palette.colorAt(2) + ' ' + 0.7);

    if (range_markers){
        chart.padding(0,25,0,25);
        chart.rangeMarker().scale(chart.yScale()).from(-1).to(1.5).fill(bullet_range_palette.colorAt(3));
        applySparklineMarkersSettings(chart.firstMarkers(), color);
        applySparklineMarkersSettings(chart.lastMarkers(), color);
        applySparklineMarkersSettings(chart.maxMarkers(), palette.colorAt(6));
        applySparklineMarkersSettings(chart.minMarkers(), palette.colorAt(4));
        applySparklineMarkersSettings(chart.negativeMarkers(), palette.colorAt(2));
    }
    if (labels){
        chart.padding(0,25,0,25);
        applySparklineMarkersSettings(chart.maxMarkers(), palette.colorAt(6));
        applySparklineMarkersSettings(chart.minMarkers(), palette.colorAt(4));
        applySparklineLabelSettings(chart.maxLabels(), palette.colorAt(6), 'top', 'topCenter');
        applySparklineLabelSettings(chart.minLabels(), palette.colorAt(4), 'bottom', 'bottomCenter');
    }
    return chart
};

var defaultChart = function(){
    var table = anychart.ui.table();
    applyTableSettings(table);
    table.cellPadding(0, 0, 0, 0);
    table.getCol(0).width(100).cellPadding(0, 10, 0, 10);
    table.getCol(2).width(100).cellPadding(0, 10, 0, 10);
    table.getCol(2).width(80).hAlign('center');
    table.getCell(0, 1).padding(0, 10, 0, 10);
    table.getCell(0, 3).padding(0, 10, 0, 10);
    table.contents([
        ['Region', 'Profit trend', 'Current','Actual sales'],
        ['Alabama', createSparkLineChart('Alabama', 'profitTrend'), Math.round(eval(table_data['Alabama']['profitTrend'].join('+'))),  createSparkLineChart('Alabama', 'profitTrend')],
        ['Alaska', createSparkLineChart('Alaska','profitTrend'), Math.round(eval(table_data['Alaska']['profitTrend'].join('+'))), createSparkLineChart('Alaska','profitTrend')],
        ['Arizona', createSparkLineChart('Arizona', 'profitTrend'), Math.round(eval(table_data['Arizona']['profitTrend'].join('+'))), createSparkLineChart('Arizona', 'profitTrend')],
        ['Idaho', createSparkLineChart('Idaho', 'profitTrend'), Math.round(eval(table_data['Idaho']['profitTrend'].join('+'))), createSparkLineChart('Idaho', 'profitTrend')],
        ['Illinois', createSparkLineChart('Illinois','profitTrend'), Math.round(eval(table_data['Illinois']['profitTrend'].join('+'))), createSparkLineChart('Illinois','profitTrend')],
        ['Virginia', createSparkLineChart('Virginia', 'profitTrend'), Math.round(eval(table_data['Virginia']['profitTrend'].join('+'))), createSparkLineChart('Virginia', 'profitTrend')],
        ['Washington', createSparkLineChart('Washington', 'profitTrend'), Math.round(eval(table_data['Washington']['profitTrend'].join('+'))), createSparkLineChart('Washington', 'profitTrend')]
    ]);
    return table
};

var drawChart_2 = function(){
    var table = anychart.ui.table(2, 9);
    applyTableSettings(table);
    table.cellPadding(0, 0, 0, 0);
    table.getCol(0).width(100).cellPadding(0, 10, 0, 10);
    table.getCol(2).width(100).cellPadding(0, 10, 0, 10);
    table.getCol(2).width(80).hAlign('center');
    table.getCell(0, 1).padding(0, 10, 0, 10);
    table.getCell(0, 3).padding(0, 10, 0, 10);
    table.contents([
        ['Region', 'Profit trend', 'Current','Actual sales'],
        ['Alabama', createSparkLineChart('Alabama', 'profitTrend', true), Math.round(eval(table_data['Alabama']['profitTrend'].join('+'))),  createSparkLineChart('Alabama', 'profitTrend', false, true)],
        ['Alaska', createSparkLineChart('Alaska','profitTrend', true), Math.round(eval(table_data['Alaska']['profitTrend'].join('+'))), createSparkLineChart('Alaska','profitTrend', false, true)],
        ['Arizona', createSparkLineChart('Arizona', 'profitTrend', true), Math.round(eval(table_data['Arizona']['profitTrend'].join('+'))), createSparkLineChart('Arizona', 'profitTrend', false, true)],
        ['Idaho', createSparkLineChart('Idaho', 'profitTrend', true), Math.round(eval(table_data['Idaho']['profitTrend'].join('+'))), createSparkLineChart('Idaho', 'profitTrend', false, true)],
        ['Illinois', createSparkLineChart('Illinois','profitTrend', true), Math.round(eval(table_data['Illinois']['profitTrend'].join('+'))), createSparkLineChart('Illinois','profitTrend', false, true)],
        ['Virginia', createSparkLineChart('Virginia', 'profitTrend', true), Math.round(eval(table_data['Virginia']['profitTrend'].join('+'))), createSparkLineChart('Virginia', 'profitTrend', false, true)],
        ['Washington', createSparkLineChart('Washington', 'profitTrend', true), Math.round(eval(table_data['Washington']['profitTrend'].join('+'))), createSparkLineChart('Washington', 'profitTrend', false, true)]
    ]);
    return table
};


anychart.onDocumentReady(function() {
    var chart1 = defaultChart();
    chart1.container('chart-1');
    chart1.draw();
    var chart2 = drawChart_2();
    chart2.container('chart-2');
    chart2.draw();
});
