anychart.licenseKey('test-key-32db1f79-cc9312c4');

var data1 = [
  {name: 'Product A', value: '4132'},
  {name: 'Product B', value: '2431'},
  {name: 'Product C', value: '3213'},
  {name: 'Product D', value: '5243'},
  {name: 'Product E', value: '6813'},
  {name: 'Product F', value: '5321'},
  {name: 'Product G', value: '1567'},
  {name: 'Product H', value: '3876'},
  {name: 'Product I', value: '2187'}
];

var data2 = [
  ['Nail polish', 6814, 3054, 4229],
  ['Eyebrow pencil', 7012, 3954, 8987, 3932],
  ['Pomade', 8814, 9054, 4376, 9256]
];

var chartEditor = anychart.ui.chartEditorDialog();
chartEditor.data(data1, data2);
chartEditor.render();
chartEditor.data(data1, data2);

chartEditor.listen('complete', function() {
  createFromJson();
  createFromXml();
  createFromCode();
});

var jsonChart;
function createFromJson() {
  if (jsonChart) jsonChart.dispose();
  var json = chartEditor.getResultJson();
  jsonChart = anychart.fromJson(json);
  jsonChart.container('container-1');
  jsonChart.draw();
}

var xmlChart;
function createFromXml() {
  if (xmlChart) xmlChart.dispose();
  var xml = chartEditor.getResultXml();
  xmlChart = anychart.fromXml(xml);
  xmlChart.container('container-2');
  xmlChart.draw();
}

var codeChart;
function createFromCode() {
  if (codeChart) codeChart.dispose();
  var code = chartEditor.getResultCode();
  var constructorFunc = eval(code);
  codeChart = constructorFunc(data1, data2);
  codeChart.container('container-3');
  codeChart.draw();
}

/*
var chartEditor = anychart.ui.chartEditorDialog();
chartEditor.data(
    [
      ['Nail polish', 6814, 3054, 4229],
      ['Eyebrow pencil', 7012, null, 8987, 3932],
      ['Pomade', 8814, 9054, 4376, 9256]
    ],
    rawData,
    rawData2,
    [1, 2, 3, 4, 5]);
chartEditor.render();
chartEditor.setVisible(true);


var btn = document.getElementById('button');
btn.addEventListener('click', showPopup);

function showPopup() {
  // chartEditor.setVisible(false);
  // chartEditor.setPinnedCorner(menuCorner);
  // chartEditor.setMargin(margin);
  // chartEditor.setPosition(new goog.positioning.AnchoredViewportPosition(btn,
  //     buttonCorner));
  chartEditor.setVisible(true);
}

chartEditor.listen('close', function() {
  console.log('ChartsEditor: Closed');
});

//popup.setHideOnEscape(true);

// goog.events.listen(window, goog.events.EventType.RESIZE, onResize);
// function onResize(e) {
//   if (chartEditor && chartEditor.isVisible()) {
//     chartEditor.reposition();
//   }
// }

//chartEditor.data();
//chartEditor.visible(true);

//chartEditor.update();*/
