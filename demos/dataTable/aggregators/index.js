var table, generator, data, mapping;
anychart.onDocumentReady(function() {
  data = [];
  var n = 100000;
  var k = 10;
  var i;
  for (var i = 0; i < n; i++) {
    data.push([i, Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6)]);
  }
  console.time('table initialization');
  //console.profile('table initialization');
  table = anychart.data.table(0);
  table.addData(data);
  //console.profileEnd();
  console.timeEnd('table initialization');

  mapping = table.mapAs();
  mapping.addField('open', 1, 'first');
  mapping.addField('list1', 1, 'list');
  mapping.addField('high', 2, 'max');
  mapping.addField('list2', 2, 'list');
  mapping.addField('low', 3, 'min');
  mapping.addField('list3', 3, 'list');
  mapping.addField('close', 4, 'last');
  mapping.addField('list4', 4, 'list');
  mapping.addField('sum', 5, 'sum');
  mapping.addField('list5', 5, 'list');

  console.group('First aggregation');
  test();
  console.groupEnd();

  console.group('Second aggregation');
  test();
  console.groupEnd();

  console.time('table streaming');
  table.startTransaction();
  for (i = 0; i < k; i++) {
    table.addData(
        [[i + n, Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6)]]
    );
  }
  table.removeFirst(k);
  table.commit();
  console.timeEnd('table streaming');

  console.group('Aggregation after streaming');
  test();
  console.groupEnd();
});

function print(storage) {
  storage = storage.getStorage();
  var res = [];
  for (var i = 0; i < storage.length; i++) {
    res.push(asArr([storage[i].getKey(), storage[i].get()]));
  }
  console.log('%cResult length %i %c%O', 'font-weight: bold', storage.length, 'font-weight: normal', res);
}

function asArr(arr) {
  var res = [];
  for (var i = 0; i < arr.length; i++) {
    var val = arr[i];
    if (val instanceof Array)
      res.push(asArr(val));
    else
      res.push(val);
  }
  return '[' + res.join(', ') + ']';
}

function test() {
  //print(table.storage_);
  console.time('aggregation by 1 (null)');
  //console.profile('a');
  var res = table.getAggregated(null);
  //console.profileEnd('a');
  console.timeEnd('aggregation by 1 (null)');
  print(res);

  console.time('aggregation by 1');
  //console.profile('b');
  res = table.getAggregated(new anychart.core.utils.DateTimeIntervalGenerator('ms', 1));
  //console.profileEnd('b');
  console.timeEnd('aggregation by 1');
  print(res);

  console.time('aggregation by 5');
  //console.profile('b');
  res = table.getAggregated(new anychart.core.utils.DateTimeIntervalGenerator('ms', 5));
  //console.profileEnd('b');
  console.timeEnd('aggregation by 5');
  print(res);

  console.time('aggregation by 10');
  res = table.getAggregated(new anychart.core.utils.DateTimeIntervalGenerator('ms', 10));
  console.timeEnd('aggregation by 10');
  print(res);

  console.time('aggregation by 100');
  res = table.getAggregated(new anychart.core.utils.DateTimeIntervalGenerator('ms', 100));
  console.timeEnd('aggregation by 100');
  print(res);

  console.time('aggregation by 1000');
  res = table.getAggregated(new anychart.core.utils.DateTimeIntervalGenerator('ms', 1000));
  console.timeEnd('aggregation by 1000');
  print(res);
}
