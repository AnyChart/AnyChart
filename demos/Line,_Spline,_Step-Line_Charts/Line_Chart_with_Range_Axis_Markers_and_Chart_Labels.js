anychart.onDocumentReady(function() {
  //create data set on our data, also we can pud data directly to series
  var dataSet = new anychart.data.Set([
    ['1986', '41', '36', '31'],
    ['1987', '37', '34', '29'],
    ['1988', '48', '47', '40'],
    ['1989', '53', '52', '45'],
    ['1990', '49', '49', '42'],
    ['1991', '49', '47', '40'],
    ['1992', '41', '39', '33'],
    ['1993', '39', '36', '31'],
    ['1994', '34', '31', '27'],
    ['1995', '38', '35', '30'],
    ['1996', '29', '28', '24'],
    ['1997', '33', '32', '27'],
    ['1998', '31', '33', '28'],
    ['1999', '31', '32', '28'],
    ['2000', '37', '40', '34'],
    ['2001', '35', '40', '34'],
    ['2002', '43', '48', '41'],
    ['2003', '43', '47', '40'],
    ['2004', '51', '47', '40'],
    ['2005', '56', '50', '43'],
    ['2006', '62', '56', '48']
  ]);

  //map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take x from the zero column and value from the third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create line chart
  var chart = anychart.lineChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Debt-To-Income Ratios 1986-2006');

  //set chart y scale settings
  chart.yScale().minimum(20).maximum(65);
  chart.yScale().ticks().interval(5);

  //create liner series
  chart.line(seriesData_1).markers(null);
  chart.line(seriesData_2).markers(null);
  chart.line(seriesData_3).markers(null);

  //create range axes markers
  chart.rangeMarker().from(20).to(28).fill('#D9CDFF 0.7');
  chart.rangeMarker().from(28).to(38).fill('#CBFFCF 0.7');
  chart.rangeMarker().from(38).to(48).fill('#FFFFCD 0.7');
  chart.rangeMarker().from(48).to(65).fill('#FFCCCB 0.7');

  //create text axes markers
  chart.textMarker()
      .value(24)
      .fontWeight('bold')
      .align('near')
      .anchor('leftcenter')
      .offsetX(10)
      .text('Below 28% - Buy! Buy! Buy!');

  chart.textMarker()
      .value(33)
      .fontWeight('bold')
      .align('right')
      .offsetX(-80)
      .text('28%-38%\nMarginally affordable with\nfixed-rate mortgages.');

  chart.textMarker()
      .value(44)
      .offsetX(20)
      .fontWeight('bold')
      .align('center')
      .text('38%-48%\nNot affordable with fixed.\nInterest-only becomes common.');

  chart.textMarker()
      .value(56)
      .fontWeight('bold')
      .align('center')
      .text('48% or greater\nNot affordable with fixed or interest only.\nNegative amortization only option.');

  //change yAxis title text settings
  chart.yAxis(0).title().text('Debt-To-Income Ratios');

  //initiate chart drawing
  chart.draw();
});
