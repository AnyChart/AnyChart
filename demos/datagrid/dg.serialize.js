var dg1, dg1restored;
var dg2, dg2restored;
var tree1, tree2, tree1restored;
var ROOTS_COUNT = 10, CHILDREN_COUNT = 2;

anychart.onDocumentReady(function() {
  restoreColumns();
  restoreDataGrid();
});

function restoreColumns() {
  dg1 = anychart.ui.dataGrid();
  tree1 = generateTree();
  dg1.container('c1').data(tree1);
  dg1.titleHeight(25);

  var valueColumn = dg1.column(2);
  valueColumn.title('Value');
  valueColumn.width(200);

  valueColumn.textFormatter(function(item) {
    return (item.get('value') != null) ? item.get('value') + '' : '';
  });
  valueColumn.cellTextSettingsOverrider(labelTextSettingsOverrider);

  var uidColumn = dg1.column(15);
  uidColumn.title('UID');

  uidColumn.textFormatter(function(item) {
    return (item.get('uid') != null) ? item.get('uid') + '' : '';
  });

  uidColumn.cellTextSettingsOverrider(labelTextSettingsOverrider);

  dg1.column(0).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dg1.column(1).cellTextSettingsOverrider(labelTextSettingsOverrider);

  dg1.draw();

  dg1.listen('signal', dg1.draw, false, dg1);

  // --------- Restoring columns ------------

  dg1restored = anychart.ui.dataGrid();
  var treeConfig = tree1.serialize();
  tree1restored = anychart.data.Tree.fromJson(treeConfig);

  dg1restored.container('c1restored').data(tree1restored);
  dg1restored.titleHeight(25);

  var numberColumn = dg1restored.column(0);
  dg1restored.column(30, numberColumn); //This must actually clone the column.
  dg1restored.column(25, uidColumn); //This must actually clone the column.

  dg1restored.column(0, valueColumn); //This vill clone value column from original data grid.

  dg1restored.draw();

  dg1restored.listen('signal', dg1restored.draw, false, dg1restored);

}

function restoreDataGrid() {
  dg2 = anychart.ui.dataGrid();
  tree2 = generateTree();
  dg2.container('c2').data(tree2);
  dg2.titleHeight(25);

  dg2.horizontalOffset(10);
  dg2.verticalOffset(10);
  dg2.startIndex(20);

  var valueColumn = dg2.column(2);
  valueColumn.title('Value');
  valueColumn.width(400);

  valueColumn.textFormatter(function(item) {
    return (item.get('value') != null) ? item.get('value') + '' : '';
  });
  valueColumn.cellTextSettingsOverrider(labelTextSettingsOverrider);

  var uidColumn = dg2.column(15);
  uidColumn.title('UID');

  uidColumn.textFormatter(function(item) {
    return (item.get('uid') != null) ? item.get('uid') + '' : '';
  });

  uidColumn.cellTextSettingsOverrider(labelTextSettingsOverrider);

  dg2.column(0).cellTextSettingsOverrider(labelTextSettingsOverrider);
  dg2.column(1).cellTextSettingsOverrider(labelTextSettingsOverrider);

  dg2.draw();

  dg2.listen('signal', dg2.draw, false, dg2);

  // --------- Restoring data grid ------------

  var dg2Config = dg2.serialize(true);

  dg2restored = anychart.ui.dataGrid();
  dg2restored.setupByJSON(dg2Config);

  dg2restored.container('c2restored');

  dg2restored.draw();

  dg2restored.listen('signal', dg2restored.draw, false, dg2restored);
}


function labelTextSettingsOverrider(label, dataItem) {
  if (!dataItem.getParent()) {
    label.fontColor('#0055aa').fontWeight('bold').fontSize(13);
  } else {
    if (dataItem.numChildren()) {
      label.fontColor('#559955').fontWeight('bold');
    }
  }
}


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
        //collapsed: true,
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
