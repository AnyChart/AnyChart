var stage;
var dataGrid;

var ROOTS_COUNT = 3, CHILDREN_COUNT = 3;

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
          name: 'Gr #' + k + ' of Son #' + j + ' of Root # ' + i,
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

  stage = acgraph.create('container');
  dataGrid = anychart.ui.dataGrid();

  dataGrid.container(stage);

  //dataGrid.bounds(10, 10, 450, 300);

  dataGrid
      .data(tree)
      .startIndex(0)
      .verticalOffset(0);

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

  dataGrid.listen('signal', dataGridRedraw, false, dataGrid);

  dataGrid.listen(anychart.enums.EventType.ROW_CLICK, function(e) {
    //e.preventDefault();
    console.log('Clicked:', e['item'].get('name'));
    console.log(e);
  });
  //
  //dataGrid.listen(anychart.enums.EventType.ROW_SELECT, function(e) {
  //  console.log('Selected:', e['item'].get('name'));
  //});
  //
  //dataGrid.listen(anychart.enums.EventType.ROW_DBL_CLICK, function(e) {
  //  //e.preventDefault();
  //  console.log('Double clicked:', e['item'].get('name'));
  //});
  //
  //dataGrid.listen(anychart.enums.EventType.ROW_MOUSE_OVER, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse over:', e['item'].get('name'));
  //});
  //
  //dataGrid.listen(anychart.enums.EventType.ROW_MOUSE_MOVE, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse move:', e['item'].get('name'));
  //});
  //
  //dataGrid.listen(anychart.enums.EventType.ROW_MOUSE_OUT, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse out:', e['item'].get('name'));
  //});
  //
  //dataGrid.listen(anychart.enums.EventType.ROW_MOUSE_UP, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse up:', e['item'].get('name'));
  //});
  //
  //dataGrid.listen(anychart.enums.EventType.ROW_MOUSE_DOWN, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse down:', e['item'].get('name'));
  //});

});


