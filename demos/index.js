// portfolios to business unit map - index is a PID - 1, value is a BUID
// used in genData
var portfolios = [1, 1, 1, 2, 2, 3, 3, 3, 3];
var BUCount = 3;
var table, chart, stage;

anychart.onDocumentReady(function() {
  // stage = anychart.graphics.create('container');
  // stage.path().stroke('red').moveTo(100, 100).lineTo(200, 100, 200, 200, 100, 200).fill('none');
  // chart = anychart.line([1, 3, 2]);
  // chart.container('container').draw();
});

anychart.onDocumentReady(function() {
  // return;
  // initializing a table with some data
  // the data in the sample is an array of objects with the following structure:
  // Array.<{
  //   Time: string, - timestamp in "MMddyyyy-HHmmss" format
  //   PNL: Array.<{
  //     PNL: number, - data value
  //     BUID: number, - Business unit id
  //     PID: number - portfolio id
  //   }>
  // }>
  // we should tell the table the datetime pattern, since it's non-standard
  table = anychart.data.table('Time', 'MMddyyyy-HHmmss');
  table.addData(genData(2000));

  // creating a mapping for the table to be used in computer
  var computerInputMapping = table.mapAs({PNL: {column: 'PNL', type: 'list'}});
  // creating a computer on the table
  var computer = table.createComputer(computerInputMapping);
  // say we count value for all units at a time, than we need distinct output fields for all units
  // we can then select a BU to show using different mappings on the calculated data
  for (var i = 0; i < BUCount; i++) {
    // the first can be accessed from the computer calc functions,
    // and the second one can be used to map the result column on the table-level
    computer.addOutputField('BU' + (i + 1), 'BU' + (i + 1));
  }
  // we do not need a context or startFunction for this computer, because it doesn't
  // need to pass any data between points calculation calls.
  // this function will be called for each point of data
  computer.setCalculationFunction(function(row) {
    var i, v, res = [];
    // preparing to calculate all BU values at once
    for (i = 0; i < BUCount; i++)
      res.push(0);
    // here we will get PNL in two variations:
    // if the data is not grouped - we will get original value - an array of objects
    // if the data is grouped - we will get a list grouping - an array of array of objects
    var PNL = row.get('PNL');
    for (i = 0; i < PNL.length; i++) {
      var val = PNL[i];
      if (val.length) { // checking if it is an array
        for (var j = 0; j < val.length; j++) {
          // v is an object with PNL, BUID and PID fields
          v = val[j];
          res[v.BUID - 1] += v.PNL;
        }
      } else {
        // val is an object with PNL, BUID and PID fields
        res[val.BUID - 1] += val.PNL;
      }
    }
    // setting calculation results to the table row
    for (i = 0; i < BUCount; i++)
      row.set('BU' + (i + 1), res[i]);
  });

  // mapping computer output fields to be able to read computer output
  var BU1Mapping = table.mapAs({
    value: computer.getFieldIndex('BU1')
  });
  var BU2Mapping = table.mapAs({
    value: computer.getFieldIndex('BU2')
  });
  var BU3Mapping = table.mapAs({
    value: computer.getFieldIndex('BU3')
  });

  // now we have three mappings with the values we want and we can plot them
  chart = anychart.stock();
  var series1 = chart.plot(0).line(BU1Mapping);
  series1.name('BU1');
  var series2 = chart.plot(0).line(BU2Mapping);
  series2.name('BU2');
  var series3 = chart.plot(0).line(BU3Mapping);
  series3.name('BU3');
  chart.plot(0).legend().useHtml(true).itemsTextFormatter('<b>{%SeriesName}</b>: {%Value}{numDecimals:2,thousandsSeparator:\\,,}');
  chart.plot(0).yAxis(0).labels().textFormatter('{%Value}{scale:true}');
  chart.container('container');
  chart.draw();

  // a label to toggle streaming
  chart.label(0)
      .text('Click to toggle streaming')
      .position('rightTop')
      .anchor('rightTop')
      .offsetX(50)
      .offsetY(50)
      .fontSize(20)
      .fontWeight('bold')
      .listen('click', toggleStreaming);
});

var interval = NaN;
function toggleStreaming() {
  if (isNaN(interval)) {
    // emulating streaming
    interval = setInterval(function() {
      table.addData(genData(1), true);
    }, 61);
  } else {
    clearInterval(interval);
    interval = NaN;
  }
}

// used to track generated data end
var now;
// a function to generate data - used to emulate streaming
function genData(count) {
  if (!now) {
    // getting current date rounded to seconds
    now = new Date(Math.round(Date.now() / 1000) * 1000);
  }
  // generating data
  var result = [];
  for (var i = 0; i < count; i++) {
    var rowData = [];
    for (var j = 0; j < portfolios.length; j++) {
      // generating portfolios data
      rowData.push({
        "PNL": (Math.random() * 3e10 + 1e10) / 100,
        "BUID": portfolios[j],
        "PID": j + 1
      })
    }
    result.push({
      "Time": anychart.format.dateTime(now, 'MMddyyyy-HHmmss'),
      "PNL": rowData
    });
    // generating next time (adding from one second to five minutes to the previous one)
    now.setTime(now.getTime() + 1000 * (Math.ceil(60 * 5 * Math.random()) || 1));
  }
  return result;
}

