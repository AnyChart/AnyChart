anychart.onDocumentReady(function(){
  var tree = anychart.data.tree([
    {'name': 'January', 'id': '1', 'year 2004': '12000', 'year 2005': '18000'},
    {'name': 'Parent Node', 'id': '2', 'year 2004': '15000', 'year 2005': '10000'},
    {'name': 'Child Node 1', 'parent': '2', 'id': '3', 'year 2004': '16000', 'year 2005': '18000'},
    {'name': 'Child Node 2', 'parent': '2', 'id': '4', meta: 'MyMeta', 'year 2004': '15000', 'year 2005': '11000'},
    {'name': 'Node 2', 'id': '5', 'year 2004': '14000', 'year 2005': '9000'}
  ], anychart.enums.TreeFillingMethod.AS_TABLE);

  treeDataGrid = anychart.standalones.dataGrid();
  treeDataGrid.data(tree).titleHeight(20);
  rightTreeDataGrid = anychart.standalones.dataGrid();
  rightTreeDataGrid.data(tree).titleHeight(20);
  treeDataGrid.top(37).width('50%');
  rightTreeDataGrid.top(37).left('50%').width('50%');
  rightTreeDataGrid.tooltip(null);
  treeDataGrid.container('container').draw();



});