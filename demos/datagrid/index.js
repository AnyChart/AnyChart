var stage, splitter, dataGrid, scroller, controller;

var ROOTS_COUNT = 5, CHILDREN_COUNT = 3;


var labelTextSettingsOverrider = function(label, dataItem) {
  if (!dataItem.getParent()) {
    label.fontColor('#0055aa').fontWeight('bold').fontSize(13);
  } else {
    if (dataItem.numChildren()) {
      label.fontColor('#559955').fontWeight('bold');
    }
  }
};


function generateTree() {
  var rawData = [];

  for (var i = 0; i < ROOTS_COUNT; i++) {
    var root = {
      id: 'root' + i,
      name: 'Root #' + i + ' element of tree',
      value: 'Current random value ' + ((Math.random() * 1e9) >>> 0),
      uid: ((Math.random() * 1e9) >>> 0),
      rowHeight: 40,
      children: []
    };

    for (var j = 0; j < CHILDREN_COUNT; j++) {
      var son = {
        id: 'son' + j,
        name: 'Son #' + j + ' of Root #' + i,
        value: 'Some random value of son ' + ((Math.random() * 1e9) >>> 0),
        uid: ((Math.random() * 1e9) >>> 0),
        rowHeight: 30,
        children: []
      };

      for (var k = 0; k < CHILDREN_COUNT; k++) {
        var grandson = {
          id: 'grandson' + k,
          name: 'Grandson #' + k + ' of Son #' + j + ' of Root # ' + i,
          value: 'More random ' + ((Math.random() * 1e9) >>> 0),
          rowHeight: 20,
          uid: ((Math.random() * 1e9) >>> 0)
        };
        son.children.push(grandson);
      }
      root.children.push(son);
    }
    rawData.push(root);
  }
  return anychart.data.tree(rawData);
}


function doController() {
  var itemHeight = controller.getHeightByIndexes_(controller.startIndex_, controller.startIndex_);
  var height = controller.heightCache_[controller.startIndex_] - itemHeight;

  var start = height + controller.verticalOffset_; //(actually, start = height)
  var end = start + controller.availableHeight_;

  var totalEnd = controller.heightCache_[controller.heightCache_.length - 1];

  var contentBoundsSimulation = new acgraph.math.Rect(0, 0, 0, totalEnd);

  var startRatio = anychart.math.round(start / totalEnd, 4);
  var endRatio = anychart.math.round(end / totalEnd, 4);

  scroller.suspendSignalsDispatching();
  scroller
      .contentBounds(contentBoundsSimulation)
      .setRatio(startRatio, endRatio);
  scroller.resumeSignalsDispatching(true);
}


function dataGridRedraw(event) {
  dataGrid.draw();
  if (!controller.isConsistent()) doController();
}


anychart.onDocumentReady(function() {
  var tree = generateTree();

  stage = acgraph.create('container', '100%', '100%');
  dataGrid = anychart.ui.dataGrid();

  dataGrid.container(stage);

  splitter = new anychart.core.ui.Splitter();

  splitter
      .bounds(10, 10, '90%', '90%')
      .container(stage)
      .leftLimitSize(15)
      .rightLimitSize(15)
      .stroke('#000')
      .splitterWidth(5)
      .fill('#555')
      .dragPreviewFill('#777 0.3')
      .position(0.7);


  dataGrid.bounds().set(splitter.getLeftBounds());

  dataGrid
      .data(tree)
      .cellBorder({thickness: 2, color: '#999'})
      .startIndex(0)
//      .verticalOffset(39)
      .titleHeight(25);

  var valueColumn = dataGrid.column(10);
  valueColumn.title().text('Value');
  valueColumn.width(200);
  valueColumn.textFormatter(function(item) {
    return (item.get('value') != null) ? item.get('value') + '' : '';
  });

  var uidColumn = dataGrid.column(15);
  uidColumn.title().text('UID');
  uidColumn.textFormatter(function(item) {
    return (item.get('uid') != null) ? item.get('uid') + '' : '';
  });

  dataGrid.column(0).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(1).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(10).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dataGrid.column(15).cellTextSettingsOverrider(labelTextSettingsOverrider);

  dataGrid.draw();
  splitter.draw();

  dataGrid.listen('signal', dataGridRedraw, false, dataGrid);
  splitter.listen('signal', splitter.draw, false, splitter);

  splitter.listen(anychart.enums.EventType.SPLITTER_CHANGE, function() {
    dataGrid.bounds(splitter.getLeftBounds());
  });

  controller = dataGrid.controller();
  controller.listen('signal', doController, false, controller);

  //-------------
  // SCROLLER
  //-------------

  scroller = anychart.ui.scrollBar();
  var dgBounds = dataGrid.pixelBounds();

  scroller
      .container(stage)
      .bounds(790, dgBounds.top, 15, dgBounds.height)
      .layout('vertical');

  scroller.draw();
  scroller.listen('signal', scroller.draw, false, scroller);

  doController();

  scroller.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
    var startRatio = e.startRatio;

    var startHeight = Math.round(startRatio * controller.heightCache_[controller.heightCache_.length - 1]);

    var startIndex = controller.getIndexByHeight_(startHeight);

    var rowHeight = controller.getHeightByIndexes_(startIndex, startIndex);
    var verticalOffset = rowHeight - (controller.heightCache_[startIndex] - startHeight);

    controller.suspendSignalsDispatching();
    controller
        .verticalOffset(verticalOffset)
        .startIndex(startIndex);
    controller.resumeSignalsDispatching(false);
    controller.run();

//    console.log('startHeight', startHeight);
//    console.log('index', startIndex);
//    console.log('endIndex', controller.endIndex_);
//    console.log('verticalOffset', verticalOffset);
//    console.log('');

  });


});











