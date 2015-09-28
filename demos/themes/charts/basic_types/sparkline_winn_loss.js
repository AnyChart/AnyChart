
var createWinLoss = function(data) {
  var chart = anychart.sparkline(data);
  chart.type('winLoss');
  return chart;
};

var SparklineWinnLossChart_1 = function() {
  var table = anychart.ui.table(2, 9);
  table.getCol(0).width(100);
  table.contents([
    ['1.', 'Liverpool', createWinLoss(t1)],
    ['2.', 'Fulham', createWinLoss(t2)],
    ['3.', 'Chelsea', createWinLoss(t3)],
    ['4.', 'Man United', createWinLoss(t4)],
    ['5.', 'Bolton', createWinLoss(t5)],
    ['6.', 'Blackburn', createWinLoss(t6)],
    ['7.', 'Wigan Athletic', createWinLoss(t7)],
    ['8.', 'West Ham United', createWinLoss(t8)],
    ['9.', 'Charlton', createWinLoss(t9)],
    ['10.', 'Arsenal', createWinLoss(t10)],
    ['11.', 'Sunderland', createWinLoss(t11)],
    ['12.', 'Aston Villa', createWinLoss(t12)],
    ['13.', 'Tottenham', createWinLoss(t13)],
    ['14.', 'Everton', createWinLoss(t14)],
    ['15.', 'West Bromwich', createWinLoss(t15)],
    ['16.', 'Portsmouth', createWinLoss(t16)],
    ['17.', 'Middlesbrough', createWinLoss(t17)],
    ['18.', 'Newcastle', createWinLoss(t18)],
    ['19.', 'Birmingham City', createWinLoss(t19)],
    ['20.', 'Manchester City', createWinLoss(t20)]
  ]);
  table.getCol(0).width(30);
  table.getCol(1).width(120);
  return table;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="sparkline_winn_loss_1"></div></div>');
  $('#chart-places').append($containers);
  var chart1 = SparklineWinnLossChart_1();
  chart1.container('sparkline_winn_loss_1');
  chart1.draw();
});
