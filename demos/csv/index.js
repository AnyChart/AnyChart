var chart, parser;
function load() {
  chart = new anychart.core.cartesian.series.RangeArea(data2(), {'rowsSeparator': '\r\n\naa', columnsSeparator: ';aaa', ignoreFirstRow: true});
  chart.container('container');
  chart.draw();

  chart.listen('signal', function() {
    chart.draw();
  });
//  console.log(new anychart.data.csv.Parser().parse(data()));
//  console.log(new anychart.data.csv.Parser().ignoreFirstRow(true).ignoreTrailingSpaces(true).columnsSeparator(';aaa').rowsSeparator('\r\n\naa').parse(data2()));
}

function data3() {
  return '1\n' +
      '2\n' +
      '3\n' +
      '4\n' +
      '5\n' +
      '6\n' +
      '7\n' +
      '8\n' +
      '9\n' +
      '10\n';
};

function data() {
  return '2009-02-05,6764.81,16922.59\n' +
      '2009-02-07,7056.48,17056.48\n' +
      '2009-02-18,7180.97,17244.61\n' +
      '2009-02-26,7269.06,17451.13\n' +
      '2009-02-25,7349.58,17442.13\n' +
      '2009-02-24,7115.34,17396.34\n' +
      '2009-02-23,7365.99,17477.10\n' +
      '2009-02-20,7461.49,17500.44\n' +
      '2009-02-19,7555.23,17679.01';
}


function data2() {
  return 'Date;aaaOpen;aaaHigh;aaaLow;aaaClose;aaaVolume;aaaAdj Close\r\n\naa' +
      '2009-02-05;aaa6764.81;aaa6922.59;aaa6661.74;aaa6726.02;aaa7583230400;aaa6726.02\r\n\naa' +
      '2009-02-07;aaa7056.48;aaa7056.48;aaa6736.69;aaa6763.29;aaa7868289600;aaa6763.29\r\n\naa' +
      '2009-02-18;aaa7180.97;aaa7244.61;aaa6952.06;aaa7062.93;aaa8926480000;aaa7062.93\r\n\naa' +
      '2009-02-26;aaa7269.06;aaa7451.13;aaa7135.25;aaa7182.08;aaa7599969600;aaa7182.08\r\n\naa' +
      '2009-02-25;aaa7349.58;aaa7442.13;aaa7123.94;aaa7270.89;aaa7483640000;aaa7270.89\r\n\naa' +
      '2009-02-24;aaa7115.34;aaa7396.34;aaa7077.35;aaa7350.94;aaa7234489600;aaa7350.94\r\n\naa' +
      '2009-02-23;aaa7365.99;aaa7477.10;aaa7092.64;aaa7114.78;aaa6509300000;aaa7114.78\r\n\naa' +
      '2009-02-20;aaa7461.49;aaa7500.44;aaa7226.29;aaa7365.67;aaa8210590400;aaa7365.67\r\n\naa' +
      '2009-02-19;aaa7555.23;aaa7679.01;aaa7420.63;aaa7465.95;aaa5746940000;aaa7465.95';
}
