var stage;
var splitter;
var dataGrid;

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


function dataGridRedraw(event) {
  dataGrid.draw();
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
      .verticalOffset(0)
      .titleHeight(25);

  var valueColumn = dataGrid.column(10);
  valueColumn.title().text('Value');
  valueColumn.width(200);
  valueColumn.collapseExpandButtons(true);
  valueColumn.depthPaddingMultiplier(2);
  valueColumn.textFormatter(function(item) {
    return (item.get('value') != null) ? item.get('value') + '' : '';
  });

  var uidColumn = dataGrid.column(15);
  uidColumn.title().text('UID');
  uidColumn.collapseExpandButtons(true);
  uidColumn.depthPaddingMultiplier(15);
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

});











