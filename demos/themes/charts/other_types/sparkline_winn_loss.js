var createWinLoss = function(data, range_markers, labels) {
    var chart = anychart.sparkline(data);
    chart.type('winLoss');
    chart.padding(0);
    chart.margin(2, 0, 2, 0);
    chart.background('#fff');
    var color = palette.colorAt(0);
    chart.fill(color + ' ' + 0.7);
    chart.stroke(line_thickness + ' ' + color);
    chart.negativeFill(palette.colorAt(2) + ' ' + 0.7);

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
    table.border(null);
    table.cellBorder(null);
    table.contents([
        [null, 'Team', 'W', 'L', 'History', 'Percent'],
        ['1.', 'Liverpool', getWins(t1), getLoses(t1), createWinLoss(t1), getPercent(t1)],
        ['2.', 'Fulham', getWins(t2), getLoses(t2), createWinLoss(t2), getPercent(t2)],
        ['3.', 'Chelsea', getWins(t3), getLoses(t3), createWinLoss(t3), getPercent(t3)],
        ['4.', 'Man United', getWins(t4), getLoses(t4), createWinLoss(t4), getPercent(t4)],
        ['5.', 'Bolton', getWins(t5), getLoses(t5), createWinLoss(t5), getPercent(t5)],
        ['6.', 'Blackburn', getWins(t6), getLoses(t6), createWinLoss(t6), getPercent(t6)],
        ['7.', 'Wigan Athletic', getWins(t7), getLoses(t7), createWinLoss(t7), getPercent(t7)],
        ['8.', 'West Ham United', getWins(t8), getLoses(t8), createWinLoss(t8), getPercent(t8)],
        ['9.', 'Charlton', getWins(t9), getLoses(t9), createWinLoss(t9), getPercent(t9)],
        ['10.', 'Arsenal', getWins(t10), getLoses(t10), createWinLoss(t10), getPercent(t10)],
        ['11.', 'Sunderland', getWins(t11), getLoses(t11), createWinLoss(t11), getPercent(t11)],
        ['12.', 'Aston Villa', getWins(t12), getLoses(t12), createWinLoss(t12), getPercent(t12)],
        ['13.', 'Tottenham', getWins(t13), getLoses(t13), createWinLoss(t13), getPercent(t13)],
        ['14.', 'Everton', getWins(t14), getLoses(t14), createWinLoss(t14), getPercent(t14)],
        ['15.', 'West Bromwich', getWins(t15), getLoses(t15), createWinLoss(t15), getPercent(t15)],
        ['16.', 'Portsmouth', getWins(t16), getLoses(t16), createWinLoss(t16), getPercent(t16)],
        ['17.', 'Middlesbrough', getWins(t17), getLoses(t17), createWinLoss(t17), getPercent(t17)],
        ['18.', 'Newcastle', getWins(t18), getLoses(t18), createWinLoss(t18), getPercent(t18)],
        ['19.', 'Birmingham City', getWins(t19), getLoses(t19), createWinLoss(t19), getPercent(t19)],
        ['20.', 'Manchester City', getWins(t20), getLoses(t20), createWinLoss(t20), getPercent(t20)]
    ]);
    table.getCol(0).width(30);
    table.getCol(1).width(120);
    table.getCol(2).width(40).hAlign('center');
    table.getCol(3).width(40).hAlign('center');
    table.getCol(5).width(70).hAlign('center');
    return table
};


anychart.onDocumentReady(function() {
    var chart1 = defaultChart();
    chart1.container('chart-1');
    chart1.draw();
    //var chart2 = drawChart_2();
    //chart2.container('chart-2');
    //chart2.draw();
    //var chart3 = drawChart_3();
    //chart3.container('chart-3');
    //chart3.draw();
});
