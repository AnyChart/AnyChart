anychart.onDocumentReady(function() {
  var best_sportsmen_training_data = anychart.data.set([
    [5, 162, 125, '12/18/2014', 34],
    [8, 178, 145, '06/21/2014', 43],
    [8, 184, 129, '03/03/2015', 52],
    [3, 145, 141, '09/15/2014', 25],
    [7, 175, 137, '06/29/2014', 65],
    [7, 178, 98, '04/05/2015', 98],
    [8, 142, 69, '11/20/2014', 45],
    [8, 153, 139, '05/19/2014', 46],
    [3, 174, 144, '10/28/2014', 50],
    [7, 162, 129, '10/27/2014', 50],
    [8, 175, 123, '04/24/2015', 51],
    [5, 157, 132, '01/12/2015', 53],
    [5, 151, 119, '06/13/2014', 25],
    [10, 182, 87, '01/11/2015', 90],
    [1, 184, 113, '10/13/2014', 120],
    [2, 165, 145, '10/22/2014', 95],
    [10, 168, 128, '11/08/2014', 93],
    [5, 169, 74, '11/13/2014', 70],
    [7, 180, 113, '11/13/2014', 65],
    [1, 180, 94, '03/25/2015', 45],
    [3, 180, 94, '03/03/2015', 50],
    [2, 147, 71, '07/25/2014', 53],
    [5, 175, 119, '09/13/2014', 46],
    [8, 136, 84, '09/18/2014', 54],
    [10, 190, 128, '11/15/2014', 121],
    [9, 160, 131, '12/14/2014', 111],
    [1, 145, 137, '11/23/2014', 123],
    [7, 185, 78, '10/30/2014', 125],
    [2, 157, 138, '08/18/2014', 115],
    [10, 156, 96, '12/20/2014', 116],
    [9, 136, 65, '12/22/2014', 103],
    [8, 164, 81, '01/05/2015', 105],
    [9, 136, 108, '02/24/2015', 98],
    [2, 179, 107, '07/05/2014', 91],
    [1, 136, 89, '02/02/2015', 89],
    [5, 177, 106, '09/04/2014', 45],
    [8, 180, 97, '12/03/2014', 50],
    [9, 189, 147, '06/15/2014', 45],
    [5, 183, 98, '02/01/2015', 34],
    [6, 157, 79, '05/14/2014', 96],
    [10, 172, 129, '07/05/2014', 65],
    [3, 170, 142, '10/29/2014', 63],
    [9, 149, 67, '11/23/2014', 62],
    [4, 169, 84, '05/16/2014', 46],
    [4, 176, 123, '01/10/2015', 43],
    [9, 187, 83, '05/25/2014', 90],
    [8, 170, 114, '02/24/2015', 92],
    [3, 146, 120, '02/28/2015', 98],
    [8, 180, 119, '03/04/2015', 115],
    [1, 180, 96, '12/24/2014', 118],
    [6, 157, 121, '11/30/2014', 111],
    [7, 169, 93, '06/29/2014', 112],
    [4, 163, 106, '08/06/2014', 105],
    [10, 179, 71, '09/29/2014', 110],
    [6, 183, 68, '06/29/2014', 102],
    [9, 164, 75, '09/17/2014', 100],
    [4, 167, 96, '09/01/2014', 90],
    [7, 135, 77, '12/16/2014', 92],
    [1, 149, 113, '11/20/2014', 60],
    [2, 183, 110, '08/13/2014', 65],
    [7, 170, 103, '10/07/2014', 45],
    [9, 153, 112, '09/07/2014', 68],
    [9, 166, 148, '09/11/2014', 68],
    [1, 161, 94, '04/10/2015', 87],
    [2, 187, 65, '06/21/2014', 90],
    [4, 162, 131, '05/24/2014', 91],
    [10, 190, 82, '04/04/2015', 93],
    [10, 186, 100, '05/28/2014', 93],
    [3, 164, 66, '06/24/2014', 67],
    [8, 166, 143, '10/24/2014', 65],
    [1, 168, 141, '02/03/2015', 45],
    [7, 144, 111, '11/04/2014', 67],
    [6, 156, 66, '08/06/2014', 63],
    [7, 187, 148, '06/17/2014', 64],
    [6, 149, 133, '10/23/2014', 65],
    [8, 152, 92, '11/07/2014', 91],
    [7, 163, 105, '10/21/2014', 92],
    [2, 142, 139, '11/05/2014', 94],
    [10, 155, 94, '07/28/2014', 114],
    [3, 166, 137, '03/24/2015', 120],
    [4, 142, 124, '12/24/2014', 112],
    [2, 136, 90, '06/22/2014', 90],
    [10, 182, 79, '01/01/2015', 130],
    [10, 135, 90, '04/03/2015', 135],
    [6, 174, 120, '11/01/2014', 104],
    [10, 163, 146, '04/05/2015', 95],
    [7, 147, 104, '04/16/2015', 45],
    [4, 142, 70, '01/16/2015', 56],
    [7, 158, 77, '04/18/2015', 55],
    [2, 166, 70, '09/18/2014', 54],
    [6, 154, 150, '04/30/2015', 50],
    [7, 176, 83, '06/03/2014', 45],
    [4, 174, 89, '02/09/2015', 90],
    [2, 161, 131, '01/07/2015', 121],
    [5, 148, 127, '10/20/2014', 112],
    [6, 151, 112, '06/06/2014', 100],
    [6, 154, 97, '11/23/2014', 93],
    [3, 181, 121, '06/02/2014', 96],
    [5, 167, 92, '10/18/2014', 56],
    [1, 173, 127, '01/14/2015', 89]
  ]);

  var map_training_data = best_sportsmen_training_data.mapAs({x: [1], value: [2], size: [4], training: [0], data: [3]});

  var sportsmen1 = map_training_data.filter('training', training_filter_constructor(1));
  var sportsmen2 = map_training_data.filter('training', training_filter_constructor(2));
  var sportsmen3 = map_training_data.filter('training', training_filter_constructor(3));
  var sportsmen4 = map_training_data.filter('training', training_filter_constructor(4));

  // create scatter chart
  chart = anychart.scatter();

  // turn on chart animation
  chart.animation(true);

  // set container id for the chart
  chart.container('container');

  // set chart title text settings
  var title = chart.title();
  title.enabled(true);
  title.text(
      'Best sportsmen training data ' +
      '<br/><span  style="color:#929292; font-size: 12px;">(bubble size means duration, each bubble represents one training)</span>'
  ).padding([0, 0, 10, 0]).useHtml(true);

  // set chart margin settings
  chart.padding(20, 20, 10, 20);

  // turn on grids
  chart.grid().enabled(true);
  chart.grid(1).enabled(true).layout('vertical');
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true).layout('vertical');
  chart.minBubbleSize(5);
  chart.maxBubbleSize(40);

  // set chart axes settings
  chart.xAxis().title('Average pulse during training');
  chart.xAxis().minorTicks(true);
  chart.yAxis().title('Average power');
  chart.yAxis().minorTicks(true);



  //set chart legend settings
  chart.legend().enabled(true).padding().bottom(10);
  var tooltipFormatter = function(data) {
    return data.getDataValue('data') + '<br/>' +
        'Power: <span style="color: #d2d2d2; font-size: 12px">' + data.getDataValue('value') + '</span></strong><br/>' +
        'Pulse: <span style="color: #d2d2d2; font-size: 12px">' + data.getDataValue('x') + '</span></strong><br/>' +
        'Duration: <span style="color: #d2d2d2; font-size: 12px">' + data.getDataValue('size') + ' min.</span></strong>';
  };
  // create first series with mapped data
  chart.bubble(sportsmen1).name('Christopher Sanchez').tooltip().useHtml(true).fontColor('#fff').textFormatter(tooltipFormatter);
  // create second series with mapped data
  chart.bubble(sportsmen2).name('Judy Evans').tooltip().useHtml(true).fontColor('#fff').textFormatter(tooltipFormatter);
  // create third series with mapped data
  chart.bubble(sportsmen3).name('Walter Burke').tooltip().useHtml(true).fontColor('#fff').textFormatter(tooltipFormatter);
  // create forth series with mapped data
  chart.bubble(sportsmen4).name('Daniel Williamson').tooltip().useHtml(true).fontColor('#fff').textFormatter(tooltipFormatter);

  chart.draw();
});
/**
 * Helper function to bind data field to the local var.
 * @param val
 * @return {Function}
 */
function training_filter_constructor(val) {
  return function(fieldVal) {
    return fieldVal == val;
  }
}


function log(name, value) {
  var log = document.getElementById('log');
  log.innerHTML += name + ': <b>' + value + '</b><br/><br/>';
}


function round(num, opt_digitsCount) {
  var tmp = Math.pow(10, opt_digitsCount || 0);
  return Math.round(num * tmp) / tmp || 0;
}
