var t1, t2, t3, t4, tt;
function load() {
  var k = 10;
  t1 = t2 = t3 = t4 = tt = 0;
  for (var i = 0; i < k; i++) {
    a();
  }
  tt /= k;
  t1 /= k;
  t2 /= k;
  t3 /= k;
  t4 /= k;
  console.log('data arrays creation: total - ' + tt + ' push - ' + t1 + ' by index - ' + t2 + ' by index pre length - ' + t3 + ' by array constr - ' + t4);
}

function a() {
  var n = 10000, i;

  var t = +new Date();
  var time = +new Date();
  var data = [];
  for (i = 0; i < n; i++) {
    data.push(i);
  }
  time = +new Date() - time;

  var time1 = +new Date();
  var data1 = [];
  for (i = 0; i < n; i++) {
    data1[i] = i;
  }
  time1 = +new Date() - time1;

  var time2 = +new Date();
  var data2 = [];
  data2.length = n;
  for (i = 0; i < n; i++) {
    data2[i] = i;
  }
  time2 = +new Date() - time2;

  var time3 = +new Date();
  var data3 = new Array(n);
  for (i = 0; i < n; i++) {
    data3[i] = i;
  }
  time3 = +new Date() - time3;
  t = +new Date() - t;


  //var time2 = +new Date();
  ////for (i = 0; i < n; i++) {
  ////  if (!table.search(i))
  ////    console.log('not found ' + i);
  ////}
  //time2 = +new Date() - time2;

  tt += t;
  t1 += time;
  t2 += time1;
  t3 += time2;
  t4 += time3;

}
