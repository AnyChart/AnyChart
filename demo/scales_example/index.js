var data, dataSet, mapping, view1, view2, view3, title, ticker, scale;

function load() {
//  scale = new anychart.scales.Linear();
//  scale.resetDataRange().extendDataRange(0, 1).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());
//  scale.resetDataRange().extendDataRange(0.00023, 0.00065).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());
//  scale.resetDataRange().extendDataRange(1, 10).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());
//  scale.resetDataRange().extendDataRange(0, 11).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());
//  scale.resetDataRange().extendDataRange(1, 10).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());
//  scale.resetDataRange().extendDataRange(0, 1).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());
//  scale.resetDataRange().extendDataRange(0.00023, 0.00065).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());
//  scale.resetDataRange().extendDataRange(150000000, 150000100).dispatchInvalidationEvent(anychart.utils.ConsistencyState.SCALE_SETTINGS);
//  console.log(scale.minimum(), scale.maximum(), scale.ticks().get());

  scale = new anychart.scales.Ordinal();
  scale.values(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().interval(2);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().interval(3);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([0, 3, 6, 9]);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([1, 3, 6, 9]);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([3, 3, 6, 6]);
  console.log(scale.ticks().get(), scale.ticks().names());
  scale.ticks().set([3, 3, 6, 4]);
  console.log(scale.ticks().get(), scale.ticks().names());
}

function load2() {
  title = new anychart.elements.Title();
  title.text('AAAAAAAAA!!!!').container('container').background().fill('red').corners(10);
  title.margin(0).padding(10).hAlign('center').vAlign('center');
  title.draw();
  title.listen('invalidated', function() { title.draw(); });
}

function q() {
  title.silentlyInvalidate(0xffff);
  // вместо title.silentlyInvalidate(0xffff); можно написать и title.width(300).width(null)
  title.draw();
}

function w() {
  var q = title.container_.data();
  title.container_.dispose();
  var a = acgraph.create().container('container');
  a.data(q);
}


function load1() {
  data = [
    ['a', 0],
    ['c', 1],
    [{value: 10}, 2],
    ['d', 3],
    [1, 4],
    [2, 5],
    [3, 6],
    [{value: 10}, 7],
    ['2', 8],
    ['3', 9]
  ];

  dataSet = new anychart.data.Set(data);
  mapping = dataSet.mapAs();
  view1 = mapping.preparePie('value');
  view2 = mapping.preparePie('value', function(val) { return val > 3;});
  view3 = mapping.preparePie('value', function(val) { return val > 3;}, undefined, function() { return { 'value': 0, 'fill': 'red', 'x': 100 }; });

  console.log('x1', toArray(view1, 'x'));
  console.log('y1', toArray(view1, 'value'));
  console.log('x2', toArray(view2, 'x'));
  console.log('y2', toArray(view2, 'value'));
  console.log('x3', toArray(view3, 'x'));
  console.log('y3', toArray(view3, 'value'));

  console.log('dataSet.row(3, [\'d\', 20])');
  dataSet.row(3, ['d', 20]);

  console.log(toArray(view1, 'x'));
  console.log(toArray(view1, 'value'));
  console.log(toArray(view2, 'x'));
  console.log(toArray(view2, 'value'));
  console.log(toArray(view3, 'x'));
  console.log(toArray(view3, 'value'));

  console.log('dataSet.row(3, [\'1\', 20])');
  dataSet.row(3, ['1', 20]);

  console.log(toArray(view1, 'x'));
  console.log(toArray(view1, 'value'));
  console.log(toArray(view2, 'x'));
  console.log(toArray(view2, 'value'));
  console.log(toArray(view3, 'x'));
  console.log(toArray(view3, 'value'));

  console.log('dataSet.row(3, null)');
  dataSet.row(3, null);

  console.log(toArray(view1, 'x'));
  console.log(toArray(view1, 'value'));
  console.log(toArray(view2, 'x'));
  console.log(toArray(view2, 'value'));
  console.log(toArray(view3, 'x'));
  console.log(toArray(view3, 'value'));
}

function toArray(view, opt_fieldName) {
  if (!view) return '-----';
  var res = [];
  var iter = view.getIterator();
  while (iter.advance())
    res.push(opt_fieldName ? iter.get(opt_fieldName) : view.row(iter.getIndex()));
  return res;
}
