var table, table1, table2;
anychart.onDocumentReady(function() {
  for (var i = 0; i < 10; i++) {
    a();
  }
});

function a() {
  var n = 100000, i;

  var t = +new Date();
  var data = [];
  for (i = 0; i < n; i++) {
    data.push([i, Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6)]);
  }

  var data1 = [];
  for (i = 0; i < n; i++) {
    data1.push([n - i, Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6)]);
  }

  var data2 = [];
  for (i = 0; i < n; i++) {
    data2.push([Math.round(Math.random() * n), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6), Math.round(Math.random() * 1e6)]);
  }
  t = +new Date() - t;

  var time = +new Date();
  table = anychart.data.table(0);
  table.addData(data);
  time = +new Date() - time;

  var time1 = +new Date();
  table1 = anychart.data.table(0);
  table1.addData(data1);
  time1 = +new Date() - time1;

  var time2 = +new Date();
  table2 = anychart.data.table(0);
  table2.addData(data2);
  time2 = +new Date() - time2;


  //var time2 = +new Date();
  ////for (i = 0; i < n; i++) {
  ////  if (!table.search(i))
  ////    console.log('not found ' + i);
  ////}
  //time2 = +new Date() - time2;

  console.log('data arrays creation: ' + t + ' table creation sorted: ' + time + ' reversed: ' + time1 + ' random: ' + time2);

}
