var data, dataSet, mapping, view1, view2;

function load() {
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
  view1 = mapping.prepare('x');
  view2 = mapping.prepare('x', ['a', 'd', 1, '1', '2', 2]);

  console.log(toArray(view1, 'x'));
  console.log(toArray(view1, 'value'));
  console.log(toArray(view2, 'x'));
  console.log(toArray(view2, 'value'));

  console.log('dataSet.row(3, [\'d\', 20])');
  dataSet.row(3, ['d', 20]);

  console.log(toArray(view1, 'x'));
  console.log(toArray(view1, 'value'));
  console.log(toArray(view2, 'x'));
  console.log(toArray(view2, 'value'));

  console.log('dataSet.row(3, [\'1\', 20])');
  dataSet.row(3, ['1', 20]);

  console.log(toArray(view1, 'x'));
  console.log(toArray(view1, 'value'));
  console.log(toArray(view2, 'x'));
  console.log(toArray(view2, 'value'));

  console.log('dataSet.row(3, null)');
  dataSet.row(3, null);

  console.log(toArray(view1, 'x'));
  console.log(toArray(view1, 'value'));
  console.log(toArray(view2, 'x'));
  console.log(toArray(view2, 'value'));
}

function toArray(view, opt_fieldName) {
  var res = [];
  var iter = view.getIterator();
  while (iter.advance())
    res.push(opt_fieldName ? iter.get(opt_fieldName) : view.row(iter.getIndex()));
  return res;
}
