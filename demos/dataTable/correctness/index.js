var table, data1, data2;
anychart.onDocumentReady(function() {
  data1 = [
    [0, 1, 2, 3],
    [1, 1, 2, 3],
    [2, 1, 2, 3],
    [3, 1, 2, 3],
    [4, 1, 2, 3],
    [5, 1, 2, 3]
  ];
  data2 = [
    [4, 2, 2, 3],
    [5, 1, 3, 3],
    [6, 1, 2, 3],
    [7, 1, 2, 3],
    [8, 1, 2, 3],
    [9, 1, 2, 3]
  ];
  table = anychart.data.table(0);
  table.startTransaction();
  table.addData(data1);
  table.addData(data2, null, 2);
  table.remove(3, 5);
  table.commit();
  var first = table.search(2);
  var storage = table.getStorage();
  for (var i = 0; i < storage.length; i++) {
    var item = storage[i];
    if (item != first)
      console.log('wrong', i, item, first);
    first = first.next;
  }
  if (first)
    console.log('wrong last.next');
  console.log('all good');
});
