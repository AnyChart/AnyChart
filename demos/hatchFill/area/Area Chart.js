var series, series2, chart;

anychart.onDocumentReady(function() {
  //create area chart
  chart = anychart.area();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Area Chart');

  //create area series with passed data
  series = chart.column([
    ['P1' , '262', '362', '62', '162'],
    ['P2' , '234', '334', '34', '134'],
    ['P3' , '216', '316', '16', '116'],
    ['P4' , '222', '322', '22', '122'],
    ['P5' , '278', '378', '78', '178'],
    ['P6' , '200', '300', '00', '100'],
    ['P7' , '225', '325', '25', '125'],
    ['P8' , '276', '376', '76', '176'],
    ['P9' , '211', '311', '11', '111'],
    ['P10', '234', '334', '34', '134'],
    ['P11', '235', '335', '35', '135'],
    ['P12', '276', '376', '76', '176'],
    ['P13', '267', '367', '67', '167'],
    ['P14', '242', '342', '42', '142'],
    ['P15', '217', '317', '17', '117'],
    ['P16', '213', '313', '13', '113'],
    ['P17', '232', '332', '32', '132'],
    ['P18', '246', '346', '46', '146'],
    ['P19', '269', '369', '69', '169'],
    ['P20', '284', '384', '84', '184']
  ]);

  series.tooltip().enabled(false);

  /*var labels = series.labels()
      .enabled(false)
      .rotation(135)
      .background().enabled(true);
  var hoverLabels = series.hoverLabels()
      .enabled(false)
      .fontSize(25)
      .fontOpacity(0.3)
      .rotation(45)
      .background().enabled(true).fill('green 0.2');
*/


//  series.displayNegative(true);

  /*series = chart.bubble([
    ['P1' , '162'],
    ['P2' , '134'],
    ['P3' , '116'],
    ['P4' , '122'],
    ['P5' , '178'],
    ['P6' , '144'],
    ['P7' , '125'],
    ['P8' , '176'],
    ['P9' , null],
    ['P10', null],
    ['P11', '135'],
    ['P12', '176'],
    ['P13', '167'],
    ['P14', '142'],
    ['P15', '117'],
    ['P16', '113'],
    ['P17', '132'],
    ['P18', '146'],
    ['P19', '169'],
    ['P20', '184']
  ]);*/

/* series = chart.bar([
    { low: 182, high: 1122},
    { low: 284, high: 1152},
    { low: 255, high: 1139},
    { low: 412, high: 1142},
    { low: 376, high: 1112},
    { low: 482, high: 1122},
    { low: 384, high: 1152},
    { low: 500, high: 1139},
    { low: 382, high: 1142},
    { low: 488, high: 1112},
    { low: 482, high: 1122},
    { low: 440, high: 1152},
    { low: 299, high: 1139},
    { low: 382, high: 1142},
    { low: 488, high: 1112}
  ]);*/

  /*series.hatchFill(function() {
    return this.index % 2 ?
        acgraph.vector.HatchFill.HatchFillType.CONFETTI :
        4;
  });*/

  series.setAutoHatchFill(acgraph.vector.HatchFill.HatchFillType.CONFETTI);
  series.hatchFill(acgraph.vector.HatchFill.HatchFillType.CONFETTI);
  series.hoverHatchFill(acgraph.vector.HatchFill.HatchFillType.PERCENT_50);
//  series.risingHatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);
//  series.fallingHatchFill(acgraph.vector.HatchFill.HatchFillType.DASHED_VERTICAL);
//  series.hoverRisingHatchFill(acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK);
//  series.hoverFallingHatchFill(acgraph.vector.HatchFill.HatchFillType.GRID);

//  series.negativeHatchFill(18);
//  series2.hatchFill(23);

  //initiate chart drawing
  chart.draw();
});
