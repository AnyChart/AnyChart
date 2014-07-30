var table;
var round = function(num, opt_digitsCount) {
  var tmp = Math.pow(10, opt_digitsCount || 0);
  return Math.round(num * tmp) / tmp || 0;
};
function load() {
  var rowHeight = 25;
  var rows = 30;
  table = new anychart.elements.Table(rows + 2, 5);

  table.height(rows * rowHeight).width(600);
  var stage = acgraph.create('container', 620, rows * rowHeight + 20);
  table.container(stage);
  table.colWidth(0, 30);

  var cell = table.getCell(0, 0);
  var factory = new anychart.elements.LabelsFactory();
  factory.fontWeight('bold').container(stage).position('center').anchor('center').clear();
  cell.content(factory.add('#', null));
  cell.content().position(anychart.utils.NinePositions.RIGHT_CENTER).anchor('rightCenter');
  table.getCell(0, 1).content(factory.add('Some graph data', null));
  table.getCell(0, 2).content(factory.add('Name', null));
  table.getCell(0, 3).colSpan(2).content(factory.add('Some numbers', null));

  var names = ['North America', 'Europe', 'Asia', 'South America', 'Middle East'];

  var scale = new anychart.scales.Ordinal();
  scale.names(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10']);
  var maxRow = -1, maxVal = -Number.MAX_VALUE, sum = 0, sum2 = 0;
  for (var i = 1; i < rows + 1; i++) {
    cell = table.getCell(i, 0);
    cell.content(i);
    cell.content().position('rightCenter').anchor('rightCenter');

    cell = table.getCell(i, 1);
    var data = [];
    for (var j = 0; j < 10; j++) {
      data[j] = Math.round(Math.random() * 1000);
    }
    var series = new anychart.cartesian.series.Column(data);
    series.markers(null);
    series.xScale(scale);
    cell.padding(2);
    cell.content(series);

    cell = table.getCell(i, 2);
    var item = new anychart.elements.LegendItem();
    item.text(names[(i - 1) % 5]).x(10).y(4).iconFill('blue 1').iconStroke('blue 1').iconType('column');
    cell.content(item);

    cell = table.getCell(i, 3);
    var val = round(Math.random() * 1000000, 2);
    if (val > maxVal) {
      maxRow = i; maxVal = val;
    }
    sum += val;
    cell.content(val);

    cell = table.getCell(i, 4);
    val = round(Math.random() * 1000000, 2);
    if (val > maxVal) {
      maxRow = i; maxVal = val;
    }
    sum2 += val;
    cell.content(val);
  }

  cell = table.getCell(rows + 1, 1);
  var axis = new anychart.elements.Axis();
  axis.scale(scale).orientation(anychart.utils.Orientation.BOTTOM).title(null);
  axis.overlapMode('nooverlap');
  axis.labels().fontSize(10);
  axis.ticks().length(2);
  axis.minorTicks().length(1);
  cell.content(axis);
  cell = table.getCell(rows + 1, 3);
  cell.content(sum).border('2 black').topBorder('2 black');
  cell = table.getCell(rows + 1, 4);
  cell.content(sum).border('2 black').topBorder('2 black');

  table.cellBorder(null);
  table.cellFill(null);
  var border = {thickness: 1, color: 'blue', opacity: 0.5};
  table.getCell(0, 0).bottomBorder(border);
  table.getCell(0, 1).bottomBorder(border);
  table.getCell(0, 2).bottomBorder(border);
  table.getCell(0, 3).bottomBorder(border);

  border = {thickness: 1, color: 'red', opacity: 0.3};
  var fill = {color: 'red', opacity: 0.1};
  table.getCell(maxRow, 0).border(border).rightBorder('none').fill(fill);
  table.getCell(maxRow, 1).border(border).rightBorder('none').leftBorder('none').fill(fill);
  table.getCell(maxRow, 2).border(border).rightBorder('none').leftBorder('none').fill(fill);
  table.getCell(maxRow, 3).border(border).rightBorder('none').leftBorder('none').fill(fill);
  table.getCell(maxRow, 4).border(border).leftBorder('none').fill(fill);

  table.cellTextFactory().fontColor('red');

  table.left(10).top(10);
  var timer = +new Date();
  table.draw();
  factory.draw();
  console.log(+new Date() - timer);
}
function load1() {
  table = new anychart.elements.Table(1, 2);
  table.bounds(10, 10, 400, 200);
  table.cellBorder('3 green');
  table.cellLeftBorder('3 red');
  table.cellFill('none');
  table.getCell(0, 0).content('CELL 1').rightBorder('3 blue');
  table.getCell(0, 1).content('CELL 2').border('3 black');
  table.container(acgraph.create('container', 420, 220)).draw();
};
