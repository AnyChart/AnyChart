var table, generator, data, mapping, storage, xScale, yScale, stage, paths, d, controller, accessor, n = 1000, curr;
var s1, s2, s3;
anychart.onDocumentReady(function() {
  d = [];

  s1 = document.getElementById('startKey');
  s2 = document.getElementById('endKey');
  s3 = document.getElementById('stream');

  s1.max = n - 1;
  s2.max = n - 1;
  s2.value = n - 2;
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
  curr = n;
  console.timeEnd('total');

  acgraph.events.listen(stage, 'stageresize', doDraw);
});

function doDraw() {
  requestAnimationFrame(draw);
}

function draw() {
  if (upd) return;
  //console.group('Drawing');
  var start = Math.min(document.getElementById('startKey').value, document.getElementById('endKey').value);
  var end = Math.max(document.getElementById('startKey').value, document.getElementById('endKey').value);
  //console.time('selecting data');
  controller.select(start, end);
  //console.timeEnd('selecting data');

  //console.time('scales');
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
  //console.timeEnd('scales');

  stage.suspend();
  //console.time('drawing total');
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
  //console.timeEnd('drawing total');
  idd = NaN;
  //console.groupEnd('Drawing');

  if (!isNaN(streamId))
    requestAnimationFrame(draw);
}

var streamId, upd;
function toggleStream() {
  if (isNaN(streamId)) {
    s3.value = 'Stop Stream';
    streamId = setInterval(stream, 50);
    doDraw();
  } else {
    s3.value = 'Start Stream';
    clearInterval(streamId);
    streamId = NaN;
  }
}

function stream() {
  var data = [];
  var count = 3;
  for (var i = 0; i < count; i++) {
    data.push([
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      Math.round(Math.random() * 1e6),
      ++curr]);
  }
  upd = true;
  s1.max = +s1.max + count;
  s1.min = +s1.min + count;
  s2.max = +s2.max + count;
  s2.min = +s2.min + count;
  s1.value = +s1.value + count;
  s2.value = +s2.value + count;
  upd = false;
  table.addData(data, null, true);
}
