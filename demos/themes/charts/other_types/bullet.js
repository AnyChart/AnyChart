var createBulletChart = function(name, range_markers, axis_title){
    var data = table_data[name];
    var target = eval(data['toGoal'].join('+'));
    var actual = eval(data['actualSales'].join('+'));
    var profit = eval(data['profitTrend'].join('+'));
    if (range_markers){
        var bullet = anychart.bullet([
            {value: Math.round(actual), type: 'x', gap: 0.2, fill: fontColor, stroke: {thickness:1, color: fontColor}},
            {value: Math.round(profit), type: 'ellipse', gap: 0.2, fill: null , stroke: {thickness:2, color: fontColor}},
            {value: Math.round(target), 'type': 'line', 'gap': 0.2, fill: fontColor,
                stroke: {thickness:2, color: fontColor}
            }
        ]);
        bullet.background().enabled(true).fill('white').stroke('1 ' +  colorAxisFont);
        bullet.margin(5, 0);

        bullet.range().from(0).to(Math.round(target)*2/5);
        bullet.range(1).from(Math.round(target)*2/5).to(Math.round(target)*3/5);
        bullet.range(2).from(Math.round(target)*3/5).to(Math.round(target)*4/5);
        bullet.range(3).from(Math.round(target)*4/5).to(Math.round(target) + 2);
        bullet.range(4).from(Math.round(target) + 2).to(37);
    } else {
        bullet = anychart.bullet([
            {value: Math.round(actual), type: 'bar', gap: 0.7, fill: fontColor, stroke: null},
            {value: Math.round(target), 'type': 'line', 'gap': 0.2, fill: fontColor,
                stroke: {thickness:2, color: fontColor}
            }
        ]);
        bullet.margin(0);
    }
    bullet.axis(null);
    bullet.title(titleSettings);
    bullet.title().text(name).vAlign('middle');
    bullet.title().padding([0, 20, 0, 10]).fontSize(14).margin(0);
    if (!axis_title) bullet.title().enabled(false);
    else{
        bullet.margin(15, 0);
        bullet.axis().enabled(true);
        bullet.axis().stroke(colorAxisLines);
        bullet.axis().labels().textWrap('byLetter').hAlign('center')
                .textSettings(textLabelSettings)
                .fontColor(colorAxisFont).padding([0, 0, 0, 0]);
        bullet.axis().ticks().stroke(colorAxisLines).length(6);
        bullet.axis().minorTicks().stroke(colorAxisLines).length(4);
        bullet.axis().minorTicks().enabled(false);

        bullet.axis().title(axisTitleSettings);
        bullet.axis().title({text:'Actual to target', fontSize:12, padding:[0,0,0,0]});

        // по умолчанию title у оси по-прежнему отключен
        bullet.axis().enabled(true);
    }
    bullet.padding(0, -1);
    bullet.rangePalette(bullet_range_palette);
    bullet.scale().minimum(0);
    bullet.scale().maximum(37);
    bullet.layout('horizontal');
    return bullet;
};

var createBulletProgress = function(name){
    var data = table_data[name];
    var target = eval(data['toGoal'].join('+'));
    var actual = eval(data['actualSales'].join('+'));
    var value = Math.round(Math.round(actual) * 100 / Math.round(target)) - 34;
    var bullet = anychart.bullet([
            {value: value,
                type: 'bar', gap: 0, fill: palette.colorAt(0), stroke: null}
        ]);
    bullet.background().enabled(true).fill('white').stroke('1 #e5e4e4');
    bullet.range(5).from(0).to(100);
    bullet.margin(5, 55, 5, 0);
    bullet.axis(null);
    bullet.title().enabled(false);
    bullet.padding(0, -1);
    bullet.rangePalette(bullet_range_palette);
    bullet.scale().minimum(0);
    bullet.scale().maximum(100);
    bullet.layout('horizontal');

    bullet.label()
        .position('right')
        .anchor('rightCenter')
        .padding(0,0,0,5)
        .text('$' + Math.round(target) + ',000')
        .textSettings(textLabelSettings);

    return bullet;
};


var defaultChart = function(){
    var table = anychart.ui.table();
    applyTableSettings(table);
    table.getCol(0).width(100);
    table.contents([
        ['Region', 'Actual sales to goal'],
        ['Alabama', createBulletChart('Alabama')],
        ['Alaska', createBulletChart('Alaska')],
        ['Arizona', createBulletChart('Arizona')],
        ['Idaho', createBulletChart('Idaho')],
        ['Illinois', createBulletChart('Illinois')],
        ['Indiana', createBulletChart('Indiana')],
        ['Ohio', createBulletChart('Ohio')],
        ['Oklahoma', createBulletChart('Oklahoma')],
        ['Oregon', createBulletChart('Oregon')],
        ['Vermont', createBulletChart('Vermont')],
        ['Virginia', createBulletChart('Virginia')],
        ['Washington', createBulletChart('Washington')]
        ]);
    return table
};


var drawChart_2 = function(){
    var table = anychart.ui.table();
    applyTableSettings(table);
    table.getCol(0).width(100);
    table.contents([
        ['Region', 'Actual sales to goal'],
        ['Alabama', createBulletChart('Alabama', true, false)],
        ['Alaska', createBulletChart('Alaska', true, false)],
        ['Arizona', createBulletChart('Arizona', true, false)],
        ['Idaho', createBulletChart('Idaho', true, false)],
        ['Illinois', createBulletChart('Illinois', true, false)],
        ['Indiana', createBulletChart('Indiana', true, false)],
        ['Ohio', createBulletChart('Ohio', true, false)],
        ['Oklahoma', createBulletChart('Oklahoma', true, false)],
        ['Oregon', createBulletChart('Oregon', true, false)],
        ['Vermont', createBulletChart('Vermont', true, false)],
        ['Virginia', createBulletChart('Virginia', true, false)],
        ['Washington', createBulletChart('Washington', true, false)]
    ]);

    return table
};

var drawChart_3 = function(){
    var table = anychart.ui.table();
    applyTableSettings(table);
    table.border(null);
    table.cellBorder(null);
    table.contents([
        [createBulletChart('Alabama', false, true)],
        [createBulletChart('Alaska', false, true)],
        [createBulletChart('Arizona', false, true)],
        [createBulletChart('Idaho', false, true)],
        [createBulletChart('Illinois', false, true)]
    ]);
    return table
};

var drawChart_4 = function(){
    var table = anychart.ui.table();
    applyTableSettings(table);
    table.border(null);
    table.cellBorder(null);
    table.contents([
        ['Region', 'Percent of actual sales to goal'],
        ['Alabama', createBulletProgress('Alabama')],
        ['Alaska', createBulletProgress('Alaska')],
        ['Arizona', createBulletProgress('Arizona')],
        ['Idaho', createBulletProgress('Idaho')],
        ['Illinois', createBulletProgress('Illinois')],
        ['Indiana', createBulletProgress('Indiana')],
        ['Ohio', createBulletProgress('Ohio')],
        ['Oklahoma', createBulletProgress('Oklahoma')],
        ['Oregon', createBulletProgress('Oregon')],
        ['Vermont', createBulletProgress('Vermont')],
        ['Virginia', createBulletProgress('Virginia')],
        ['Washington', createBulletProgress('Washington')]
    ]);
    table.getCol(0).width(100);
    table.getCol(1).cellPadding(5, 10, 5, 10);
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
    var chart4 = drawChart_4();
    chart4.container('chart-4');
    chart4.draw();
});