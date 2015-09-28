
var createBulletChart = function(name, range_markers, axis_title) {
  var data = table_data[name];
  var target = eval(data['toGoal'].join('+'));
  var actual = eval(data['actualSales'].join('+'));
  var profit = eval(data['profitTrend'].join('+'));
  if (range_markers) {
    var bullet = anychart.bullet([
      {value: Math.round(actual), type: 'x'},
      {value: Math.round(profit), type: 'ellipse'},
      {value: Math.round(target), 'type': 'line'}
    ]);
    bullet.range().from(0).to(Math.round(target) * 2 / 5);
    bullet.range(1).from(Math.round(target) * 2 / 5).to(Math.round(target) * 3 / 5);
    bullet.range(2).from(Math.round(target) * 3 / 5).to(Math.round(target) * 4 / 5);
    bullet.range(3).from(Math.round(target) * 4 / 5).to(Math.round(target) + 2);
    bullet.range(4).from(Math.round(target) + 2).to(37);

  } else {
    bullet = anychart.bullet([
      {value: Math.round(actual), type: 'bar'},
      {value: Math.round(target), 'type': 'line'}
    ]);
  }
  if (axis_title) {
    bullet.title().enabled(true);
    bullet.title(name);
    bullet.axis().enabled(true);
    bullet.axis().title({text: 'Actual to target'});
  }
  bullet.scale().minimum(0);
  bullet.scale().maximum(37);
  return bullet;
};

var BulletChart_1 = function() {
  var table = anychart.ui.table();
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
  return table;
};


var BulletChart_2 = function() {
  var table = anychart.ui.table();
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

  return table;
};

var BulletChart_3 = function() {
  var table = anychart.ui.table();
  table.contents([
    [createBulletChart('Alabama', false, true)],
    [createBulletChart('Alaska', false, true)],
    [createBulletChart('Arizona', false, true)],
    [createBulletChart('Idaho', false, true)],
    [createBulletChart('Illinois', false, true)]
  ]);
  return table;
};

anychart.onDocumentReady(function() {
  var $containers = $('<div class="col-lg-4"><div class="chart-container" id="bullet_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="bullet_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="bullet_3"></div></div>');
  $('#chart-places').append($containers);
  var chart1 = BulletChart_1();
  chart1.container('bullet_1');
  chart1.draw();
  var chart2 = BulletChart_2();
  chart2.container('bullet_2');
  chart2.draw();
  var chart3 = BulletChart_3();
  chart3.container('bullet_3');
  chart3.draw();
});
