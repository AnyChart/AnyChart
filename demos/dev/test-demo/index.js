var chart;

function load() {
  var container = 'container';
  var stage = acgraph.create(600, 400, container);
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

//    var chart;
    var layer = acgraph.layer();
    var chart = anychart.lineChart();
    chart.listenOnce(anychart.events.EventType.CHART_DRAW, function() {
        document.getElementById('status').innerHTML = 'chart draw';
        console.log('chart draw');
    });
    var graph = chart.bubble([
        ['A1', 5, -7],
        ['A2', 3, 5 ],
        ['A3', -1, -7.2 ],
        ['A4', 6, 2 ],
        ['A5', 3, -3 ],
        ['A6', '4.5', -4],
        ['A7', 1, 2]
    ]);
    graph.displayNegative(true);
    graph.negativeStroke('3 red .6');
   // graph.hoverNegativeFill('darkgreen');
    chart.container('container');
    chart.draw();
}
