var table, generator, data, mapping, storage, xScale, yScale, stage, paths, d, controller, accessor;
anychart.onDocumentReady(function() {
  d = [];
  var n = 1000000;
  document.getElementById('startKey').max = n;
  document.getElementById('endKey').max = n;
  document.getElementById('endKey').value = n;
  var i;
  for (i = 0; i < n; i++) {
    d.push([
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      i]);
  }
  console.log('Drawing 5 series of %i points each. Total %i unique X*Y combinations, %i unique X values', n, n * 5, n);
  console.time('total');
  console.time('initialization');
  //console.profile('table initialization');
  table = anychart.data.table(5);
  table.addData(d);
  mapping = table.mapAs();
  mapping.addField('val0', 0, 'close');
  //mapping.addField('list0', 5, 'list');
  mapping.addField('val1', 1, 'close');
  //mapping.addField('list1', 1, 'list');
  mapping.addField('val2', 2, 'close');
  //mapping.addField('list2', 2, 'list');
  mapping.addField('val3', 3, 'close');
  //mapping.addField('list3', 3, 'list');
  mapping.addField('val4', 4, 'close');
  //mapping.addField('list4', 4, 'list');

  controller = anychart.core.stock.controller([
    new anychart.core.utils.DateTimeIntervalGenerator('ms', 1),
    new anychart.core.utils.DateTimeIntervalGenerator('ms', 5),
    new anychart.core.utils.DateTimeIntervalGenerator('ms', 10),
    new anychart.core.utils.DateTimeIntervalGenerator('ms', 100),
    new anychart.core.utils.DateTimeIntervalGenerator('ms', 500),
    new anychart.core.utils.DateTimeIntervalGenerator('ms', 1000)
  ], true);
  accessor = controller.registerMapping(mapping);
  //console.profileEnd();
  console.timeEnd('initialization');

  stage = anychart.graphics.create('container');
  paths = [
    stage.path().stroke('red 1'),
    stage.path().stroke('green 1'),
    stage.path().stroke('blue 1'),
    stage.path().stroke('orange 1'),
    stage.path().stroke('black 1')
  ];

  xScale = anychart.scales.linear();
  xScale.minimumGap(0);
  xScale.maximumGap(0);
  xScale.ticks([]);
  xScale.minorTicks([]);
  yScale = anychart.scales.linear();
  draw();
  console.timeEnd('total');

  acgraph.events.listen(stage, 'stageresize', tryDraw);

  //var axis = anychart.axes.linear();
  //axis.container(stage);
  //axis.scale(yScale);
  //axis.orientation('right');
  ////axis.width(50);
  //axis.title(null);
  //axis.draw();

  //var d = [];
  //curr = storage[0];
  //i = 0;
  //while (curr) {
  //  arr = curr.get();
  //  var row = [i++, arr[0], arr[1], arr[2], arr[3], arr[4]];
  //  d.push(row);
  //  curr = curr.next;
  //}

  //console.log('Drawing with anychart');
  //var args = anychart.data.mapAsTable(d);
  //console.time('anychart');
  //var chart = anychart.scatter().container('container');
  //for (i = 0; i < 5; i++)
  //  chart.line(args[i]).markers(null);
  //chart.draw();
  //console.timeEnd('anychart');
});

var blocked = false;
var failed = false;
var idd = NaN;
function tryDraw() {
  if (!isNaN(idd)) {
    clearTimeout(idd);
  }
  idd = setTimeout(draw, 50);
}

function draw() {
  console.group('Drawing');
  var start = Math.min(document.getElementById('startKey').value, document.getElementById('endKey').value);
  var end = Math.max(document.getElementById('startKey').value, document.getElementById('endKey').value);
  console.time('selecting data');
  controller.select(start, end);
  console.timeEnd('selecting data');

  console.time('scales');
  //xScale.startAutoCalc();
  xScale.minimum(accessor.getFirstVisibleKey());
  xScale.maximum(accessor.getLastVisibleKey());
  //xScale.finishAutoCalc();
  //console.log(xScale.minimum(), xScale.maximum());

  yScale.startAutoCalc();
  for (i = 0; i < 5; i++) {
    yScale.extendDataRange(accessor.getMin(i));
    yScale.extendDataRange(accessor.getMax(i));
  }
  yScale.finishAutoCalc();
  console.timeEnd('scales');

  stage.suspend();
  console.time('drawing total');
  //console.time('creating paths');
  var iterator = accessor.getIterator();
  if (iterator.advance()) {
    var w = stage.width();
    var h = stage.height();
    var x = xScale.transform(iterator.getKey()) * w;
    var i;
    for (i = 0; i < paths.length; i++) {
      paths[i].clear();
      if (!isNaN(x))
        paths[i].moveTo(x, h - yScale.transform(iterator.getColumn(i)) * h);
    }
    while (iterator.advance()) {
      x = xScale.transform(iterator.getKey()) * w;
      for (i = 0; i < paths.length; i++) {
        paths[i].lineTo(x, h - yScale.transform(iterator.getColumn(i)) * h);
      }
    }
  } else {
    for (i = 0; i < paths.length; i++) {
      paths[i].clear();
    }
  }
  //console.timeEnd('creating paths');
  //console.time('creating DOM');
  stage.resume();
  //console.timeEnd('creating DOM');
  console.timeEnd('drawing total');
  idd = NaN;
  console.groupEnd('Drawing');
}
