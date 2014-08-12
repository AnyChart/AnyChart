var label1, label2;
var radiusPixel = 0;

function load() {
    var container = 'container';
    var stage = acgraph.create(container, 400, 300);
    var layer = acgraph.layer();
    stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
    /////////////////////////////////////////////////////////

//    chart = anychart.lineChart();

    var data = [10, 1, 7, 10];
    var chart = anychart.pieChart(data);
    chart.fill(function(){
        return 'rgba(210,' + (50 * (this.index + 1) - 10) + ',100,1)';
    });
    chart.stroke('none');
    chart.container(stage).draw();



}