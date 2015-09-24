var createSparkLineChart = function(name, range_markers, labels) {
    var data = table_data[name];
    var chart = anychart.sparkline(data['profitTrend']);
    chart.type('line');
    chart.padding(0);
    chart.margin(0, 0, 0, 0);
    chart.background('#fff');
    chart.xScale('linear');
    chart.xScale().minimumGap(0).maximumGap(0);
    chart.xScale().ticks().interval(1);
    var color = palette.colorAt(0);
    chart.fill(color + ' ' + 0.5);
    chart.stroke(line_thickness + ' ' + color);

    if (range_markers){
        chart.padding(0,25,0,25);
        chart.rangeMarker().scale(chart.yScale()).from(0).to(3.5).fill(bullet_range_palette.colorAt(3));

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
    table.getCell(0, 1).padding(0, 10, 0, 10);
    table.contents([
        ['Region', 'Actual sales to goal'],
        ['Alabama', createSparkLineChart('Alabama')],
        ['Alaska', createSparkLineChart('Alaska')],
        ['Arizona', createSparkLineChart('Arizona')],
        ['Idaho', createSparkLineChart('Idaho')],
        ['Illinois', createSparkLineChart('Illinois')],
        ['Indiana', createSparkLineChart('Indiana')],
        ['Ohio', createSparkLineChart('Ohio')],
        ['Oklahoma', createSparkLineChart('Oklahoma')],
        ['Oregon', createSparkLineChart('Oregon')],
        ['Vermont', createSparkLineChart('Vermont')],
        ['Virginia', createSparkLineChart('Virginia')],
        ['Washington', createSparkLineChart('Washington')]

    ]);
    return table
};

var drawChart_2 = function(){
    var table = anychart.ui.table(2, 9);
    applyTableSettings(table);
    table.cellPadding(0, 0, 0, 0);
    table.getCol(0).width(100).cellPadding(0, 10, 0, 10);
    table.getCell(0, 1).padding(0, 10, 0, 10);
    table.contents([
        ['Region', 'Actual sales to goal'],
        ['Alabama', createSparkLineChart('Alabama', true)],
        ['Alaska', createSparkLineChart('Alaska', true)],
        ['Arizona', createSparkLineChart('Arizona', true)],
        ['Idaho', createSparkLineChart('Idaho', true)],
        ['Illinois', createSparkLineChart('Illinois', true)],
        ['Indiana', createSparkLineChart('Indiana', true)],
        ['Ohio', createSparkLineChart('Ohio', true)],
        ['Oklahoma', createSparkLineChart('Oklahoma', true)],
        ['Oregon', createSparkLineChart('Oregon', true)],
        ['Vermont', createSparkLineChart('Vermont', true)],
        ['Virginia', createSparkLineChart('Virginia', true)],
        ['Washington', createSparkLineChart('Washington', true)]
    ]);
    return table
};

var drawChart_3 = function(){
    var table = anychart.ui.table(2, 9);
    applyTableSettings(table);
    table.cellPadding(0, 0, 0, 0);
    table.getCol(0).width(100).cellPadding(0, 10, 0, 10);
    table.getCell(0, 1).padding(0, 10, 0, 10);
    table.contents([
        ['Region', 'Actual sales to goal'],
        ['Alabama', createSparkLineChart('Alabama', false, true)],
        ['Alaska', createSparkLineChart('Alaska', false, true)],
        ['Arizona', createSparkLineChart('Arizona', false, true)],
        ['Idaho', createSparkLineChart('Idaho', false, true)],
        ['Illinois', createSparkLineChart('Illinois', false, true)],
        ['Indiana', createSparkLineChart('Indiana', false, true)],
        ['Ohio', createSparkLineChart('Ohio', false, true)],
        ['Oklahoma', createSparkLineChart('Oklahoma', false, true)],
        ['Oregon', createSparkLineChart('Oregon', false, true)],
        ['Vermont', createSparkLineChart('Vermont', false, true)],
        ['Virginia', createSparkLineChart('Virginia', false, true)],
        ['Washington', createSparkLineChart('Washington', false, true)]
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
    var chart3 = drawChart_3();
    chart3.container('chart-3');
    chart3.draw();
});
