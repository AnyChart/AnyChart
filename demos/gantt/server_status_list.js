anychart.onDocumentReady(function() {
  //create data tree on our data
  var treeData = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);

  //create project gantt chart
  chart = anychart.ganttResource();

  //set container id for the chart
  chart.container('container');

  //set data for the chart
  chart.data(treeData);

  //set start splitter position settings
  chart.splitterPosition(320);

  //get chart data grid link to set column settings
  var dataGrid = chart.dataGrid();

  //set first column settings
  var firstColumn = dataGrid.column(0);
  firstColumn.title('Server');
  firstColumn.width(90);
  firstColumn.cellTextSettings().hAlign('left');
  firstColumn.textFormatter(function(item) {
    return item.get('name');
  });

  //set first column settings
  var secondColumn = dataGrid.column(1);
  secondColumn.title('Working');
  secondColumn.width(70);
  secondColumn.cellTextSettings().hAlign('right');
  secondColumn.textFormatter(function(item) {
    return item.get('working');
  });

  //set first column settings
  var thirdColumn = dataGrid.column(2);
  thirdColumn.title('Maintance');
  thirdColumn.width(70);
  thirdColumn.cellTextSettings().hAlign('right');
  thirdColumn.textFormatter(function(item) {
    return item.get('maintance');
  });

  //set first column settings
  var fourthColumn = dataGrid.column(3);
  fourthColumn.title('Broken');
  fourthColumn.width(70);
  fourthColumn.cellTextSettings().hAlign('right');
  fourthColumn.textFormatter(function(item) {
    return item.get('broken');
  });

  //initiate chart drawing
  chart.draw();

  chart.listen(anychart.enums.EventType.ROW_CLICK, function(e) {
    console.log(e);
  });

  //zoom chart to specified date
  chart.fitAll();
});

function getData() {
  return [
    {
      'id': '1',
      'name': 'Server 1',
      'broken': '11%',
      'maintance': '20%',
      'working': '69%',
      'rowHeight': 30,
      'periods': [
        {'id': '1_1', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201934691000},
        {'id': '1_2', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201934691000, 'end': 1201997175000},
        {'id': '1_3', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201997175000, 'end': 1202304539000},
        {'id': '1_4', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202304539000, 'end': 1202345265000},
        {'id': '1_5', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202345265000, 'end': 1202480293000},
        {'id': '1_6', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202480293000, 'end': 1202560585000},
        {'id': '1_7', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202560585000, 'end': 1202630317000},
        {'id': '1_8', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202630317000, 'end': 1202700387000},
        {'id': '1_9', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202700387000, 'end': 1202757603000},
        {'id': '1_10', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202757603000, 'end': 1203021404000},
        {'id': '1_11', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203021404000, 'end': 1203059008000},
        {'id': '1_12', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203059008000, 'end': 1203113673000},
        {'id': '1_13', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203113673000, 'end': 1203193112000},
        {'id': '1_14', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203193112000, 'end': 1203278113000},
        {'id': '1_15', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203278113000, 'end': 1203356717000},
        {'id': '1_16', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203356717000, 'end': 1203615745000},
        {'id': '1_17', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203615745000, 'end': 1203693801000},
        {'id': '1_18', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203693801000, 'end': 1203935522000},
        {'id': '1_19', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203935522000, 'end': 1204070098000},
        {'id': '1_20', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204070098000, 'end': 1204842709000},
        {'id': '1_21', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204842709000, 'end': 1204920250000},
        {'id': '1_22', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204920250000, 'end': 1205194353000},
        {'id': '1_23', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205194353000, 'end': 1205248687000},
        {'id': '1_24', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205248687000, 'end': 1205814575000},
        {'id': '1_25', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205814575000, 'end': 1205934388000},
        {'id': '1_26', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205934388000, 'end': 1206004125000},
        {'id': '1_27', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206004125000, 'end': 1206090333000},
        {'id': '1_28', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206090333000, 'end': 1206213063000},
        {'id': '1_29', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206213063000, 'end': 1206400531000},
        {'id': '1_30', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206400531000, 'end': 1206545169000},
        {'id': '1_31', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206545169000, 'end': 1206644909000},
        {'id': '1_32', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206644909000, 'end': 1206710091000},
        {'id': '1_33', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206710091000, 'end': 1206975600000}
      ]
    },
    {
      'id': '2',
      'name': 'Server 2',
      'broken': '9%',
      'maintance': '25%',
      'working': '66%',
      'rowHeight': 30,
      'periods': [
        {'id': '2_1', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201859302000},
        {'id': '2_2', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1201859302000, 'end': 1201908412000},
        {'id': '2_3', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201908412000, 'end': 1201974133000},
        {'id': '2_4', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201974133000, 'end': 1202028840000},
        {'id': '2_5', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202028840000, 'end': 1202210414000},
        {'id': '2_6', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202210414000, 'end': 1202388469000},
        {'id': '2_7', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202388469000, 'end': 1202541565000},
        {'id': '2_8', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202541565000, 'end': 1202627301000},
        {'id': '2_9', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202627301000, 'end': 1202805594000},
        {'id': '2_10', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202805594000, 'end': 1202921039000},
        {'id': '2_11', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202921039000, 'end': 1202988636000},
        {'id': '2_12', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202988636000, 'end': 1203053106000},
        {'id': '2_13', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203053106000, 'end': 1203091266000},
        {'id': '2_14', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203091266000, 'end': 1203167431000},
        {'id': '2_15', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203167431000, 'end': 1203272341000},
        {'id': '2_16', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203272341000, 'end': 1203635565000},
        {'id': '2_17', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203635565000, 'end': 1203693647000},
        {'id': '2_18', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203693647000, 'end': 1204019780000},
        {'id': '2_19', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204019780000, 'end': 1204098338000},
        {'id': '2_20', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204098338000, 'end': 1204143075000},
        {'id': '2_21', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204143075000, 'end': 1204251661000},
        {'id': '2_22', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204251661000, 'end': 1204331445000},
        {'id': '2_23', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204331445000, 'end': 1204385091000},
        {'id': '2_24', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204385091000, 'end': 1204469651000},
        {'id': '2_25', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204469651000, 'end': 1204703164000},
        {'id': '2_26', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204703164000, 'end': 1204773674000},
        {'id': '2_27', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204773674000, 'end': 1205026114000},
        {'id': '2_28', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205026114000, 'end': 1205095682000},
        {'id': '2_29', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205095682000, 'end': 1205342961000},
        {'id': '2_30', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205342961000, 'end': 1205426767000},
        {'id': '2_31', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205426767000, 'end': 1205492144000},
        {'id': '2_32', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205492144000, 'end': 1205572162000},
        {'id': '2_33', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205572162000, 'end': 1205656265000},
        {'id': '2_34', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205656265000, 'end': 1205782881000},
        {'id': '2_35', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205782881000, 'end': 1205956654000},
        {'id': '2_36', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205956654000, 'end': 1206017955000},
        {'id': '2_37', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206017955000, 'end': 1206408299000},
        {'id': '2_38', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206408299000, 'end': 1206445472000},
        {'id': '2_39', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206445472000, 'end': 1206494305000},
        {'id': '2_40', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206494305000, 'end': 1206576575000},
        {'id': '2_41', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206576575000, 'end': 1206643564000},
        {'id': '2_42', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206643564000, 'end': 1206691584000},
        {'id': '2_43', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206691584000, 'end': 1206975600000}
      ]
    },
    {
      'id': '3',
      'name': 'Server 3',
      'broken': '12%',
      'maintance': '16%',
      'working': '72%',
      'rowHeight': 30,
      'periods': [
        {'id': '3_1', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201881438000},
        {'id': '3_2', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201881438000, 'end': 1201964388000},
        {'id': '3_3', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1201964388000, 'end': 1202017292000},
        {'id': '3_4', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202017292000, 'end': 1203174747000},
        {'id': '3_5', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203174747000, 'end': 1203378190000},
        {'id': '3_6', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203378190000, 'end': 1203616777000},
        {'id': '3_7', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203616777000, 'end': 1203653844000},
        {'id': '3_8', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203653844000, 'end': 1203750305000},
        {'id': '3_9', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203750305000, 'end': 1203813962000},
        {'id': '3_10', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203813962000, 'end': 1203877035000},
        {'id': '3_11', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203877035000, 'end': 1203934907000},
        {'id': '3_12', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203934907000, 'end': 1204010051000},
        {'id': '3_13', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204010051000, 'end': 1204079921000},
        {'id': '3_14', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204079921000, 'end': 1204316983000},
        {'id': '3_15', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204316983000, 'end': 1204373564000},
        {'id': '3_16', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204373564000, 'end': 1204439522000},
        {'id': '3_17', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204439522000, 'end': 1204536070000},
        {'id': '3_18', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204536070000, 'end': 1204617517000},
        {'id': '3_19', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204617517000, 'end': 1204855458000},
        {'id': '3_20', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204855458000, 'end': 1204894077000},
        {'id': '3_21', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204894077000, 'end': 1205253208000},
        {'id': '3_22', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205253208000, 'end': 1205328811000},
        {'id': '3_23', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205328811000, 'end': 1205411901000},
        {'id': '3_24', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205411901000, 'end': 1205551082000},
        {'id': '3_25', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205551082000, 'end': 1205687212000},
        {'id': '3_26', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205687212000, 'end': 1205731393000},
        {'id': '3_27', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205731393000, 'end': 1205962647000},
        {'id': '3_28', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205962647000, 'end': 1206003837000},
        {'id': '3_29', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206003837000, 'end': 1206593372000},
        {'id': '3_30', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206593372000, 'end': 1206634985000},
        {'id': '3_31', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206634985000, 'end': 1206735053000},
        {'id': '3_32', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206735053000, 'end': 1206782960000},
        {'id': '3_33', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206782960000, 'end': 1206864892000},
        {'id': '3_34', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206864892000, 'end': 1206914742000},
        {'id': '3_35', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206914742000, 'end': 1206975599000}
      ]
    },
    {
      'id': '4',
      'name': 'Server 4',
      'broken': '7%',
      'maintance': '15%',
      'working': '78%',
      'rowHeight': 30,
      'periods': [
        {'id': '4_1', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201880196000},
        {'id': '4_2', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201880196000, 'end': 1201955260000},
        {'id': '4_3', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201955260000, 'end': 1202188894000},
        {'id': '4_4', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202188894000, 'end': 1202398871000},
        {'id': '4_5', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202398871000, 'end': 1202484260000},
        {'id': '4_6', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202484260000, 'end': 1202566330000},
        {'id': '4_7', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202566330000, 'end': 1202807531000},
        {'id': '4_8', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202807531000, 'end': 1202871231000},
        {'id': '4_9', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202871231000, 'end': 1202931609000},
        {'id': '4_10', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202931609000, 'end': 1202969841000},
        {'id': '4_11', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202969841000, 'end': 1203309221000},
        {'id': '4_12', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203309221000, 'end': 1203356656000},
        {'id': '4_13', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203356656000, 'end': 1203832301000},
        {'id': '4_14', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203832301000, 'end': 1203886167000},
        {'id': '4_15', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203886167000, 'end': 1204256066000},
        {'id': '4_16', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204256066000, 'end': 1204303848000},
        {'id': '4_17', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204303848000, 'end': 1204655094000},
        {'id': '4_18', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204655094000, 'end': 1204866756000},
        {'id': '4_19', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204866756000, 'end': 1204944377000},
        {'id': '4_20', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204944377000, 'end': 1204983726000},
        {'id': '4_21', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204983726000, 'end': 1205090004000},
        {'id': '4_22', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205090004000, 'end': 1205132919000},
        {'id': '4_23', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205132919000, 'end': 1205660789000},
        {'id': '4_24', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205660789000, 'end': 1205703922000},
        {'id': '4_25', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205703922000, 'end': 1205976003000},
        {'id': '4_26', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205976003000, 'end': 1206054625000},
        {'id': '4_27', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206054625000, 'end': 1206360577000},
        {'id': '4_28', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206360577000, 'end': 1206404793000},
        {'id': '4_29', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206404793000, 'end': 1206525253000},
        {'id': '4_30', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206525253000, 'end': 1206572547000},
        {'id': '4_31', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206572547000, 'end': 1206975600000}
      ]
    },
    {
      'id': '5',
      'name': 'Server 5',
      'broken': '6%',
      'maintance': '26%',
      'working': '68%',
      'rowHeight': 30,
      'periods': [
        {'id': '5_1', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201855651000},
        {'id': '5_2', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1201855651000, 'end': 1201923431000},
        {'id': '5_3', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201923431000, 'end': 1202298365000},
        {'id': '5_4', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202298365000, 'end': 1202353430000},
        {'id': '5_5', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202353430000, 'end': 1202576212000},
        {'id': '5_6', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202576212000, 'end': 1202626888000},
        {'id': '5_7', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202626888000, 'end': 1203478226000},
        {'id': '5_8', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203478226000, 'end': 1203549678000},
        {'id': '5_9', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203549678000, 'end': 1203599581000},
        {'id': '5_10', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203599581000, 'end': 1203648304000},
        {'id': '5_11', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203648304000, 'end': 1203850735000},
        {'id': '5_12', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203850735000, 'end': 1204020244000},
        {'id': '5_13', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204020244000, 'end': 1204199970000},
        {'id': '5_14', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204199970000, 'end': 1204246987000},
        {'id': '5_15', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204246987000, 'end': 1204577640000},
        {'id': '5_16', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204577640000, 'end': 1204644413000},
        {'id': '5_17', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204644413000, 'end': 1204712104000},
        {'id': '5_18', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204712104000, 'end': 1204818080000},
        {'id': '5_19', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204818080000, 'end': 1205002752000},
        {'id': '5_20', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205002752000, 'end': 1205107818000},
        {'id': '5_21', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205107818000, 'end': 1205154384000},
        {'id': '5_22', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205154384000, 'end': 1205204900000},
        {'id': '5_23', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205204900000, 'end': 1205367225000},
        {'id': '5_24', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205367225000, 'end': 1205415586000},
        {'id': '5_25', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205415586000, 'end': 1205533315000},
        {'id': '5_26', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205533315000, 'end': 1205570107000},
        {'id': '5_27', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205570107000, 'end': 1205786137000},
        {'id': '5_28', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205786137000, 'end': 1205971192000},
        {'id': '5_29', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205971192000, 'end': 1206013658000},
        {'id': '5_30', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206013658000, 'end': 1206127422000},
        {'id': '5_31', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206127422000, 'end': 1206186254000},
        {'id': '5_32', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206186254000, 'end': 1206265806000},
        {'id': '5_33', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206265806000, 'end': 1206326693000},
        {'id': '5_34', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206326693000, 'end': 1206396169000},
        {'id': '5_35', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206396169000, 'end': 1206525272000},
        {'id': '5_36', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206525272000, 'end': 1206775406000},
        {'id': '5_37', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206775406000, 'end': 1206930499000},
        {'id': '5_38', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206930499000, 'end': 1206975600000}
      ]
    },
    {
      'id': '6',
      'name': 'Server 6',
      'broken': '10%',
      'maintance': '16%',
      'working': '74%',
      'rowHeight': 30,
      'periods': [
        {'id': '6_1', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201902126000},
        {'id': '6_2', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1201902126000, 'end': 1201965693000},
        {'id': '6_3', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201965693000, 'end': 1202162185000},
        {'id': '6_4', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202162185000, 'end': 1202364347000},
        {'id': '6_5', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202364347000, 'end': 1202448873000},
        {'id': '6_6', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202448873000, 'end': 1202511427000},
        {'id': '6_7', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202511427000, 'end': 1202623883000},
        {'id': '6_8', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202623883000, 'end': 1202666022000},
        {'id': '6_9', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202666022000, 'end': 1202752374000},
        {'id': '6_10', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202752374000, 'end': 1202825384000},
        {'id': '6_11', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202825384000, 'end': 1203234646000},
        {'id': '6_12', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203234646000, 'end': 1203318928000},
        {'id': '6_13', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203318928000, 'end': 1203390359000},
        {'id': '6_14', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203390359000, 'end': 1203524307000},
        {'id': '6_15', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203524307000, 'end': 1203562965000},
        {'id': '6_16', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203562965000, 'end': 1203892139000},
        {'id': '6_17', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203892139000, 'end': 1203947502000},
        {'id': '6_18', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203947502000, 'end': 1204067064000},
        {'id': '6_19', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204067064000, 'end': 1204139141000},
        {'id': '6_20', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204139141000, 'end': 1204213049000},
        {'id': '6_21', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204213049000, 'end': 1204775373000},
        {'id': '6_22', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204775373000, 'end': 1204841213000},
        {'id': '6_23', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204841213000, 'end': 1204920826000},
        {'id': '6_24', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204920826000, 'end': 1204991543000},
        {'id': '6_25', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204991543000, 'end': 1205277419000},
        {'id': '6_26', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205277419000, 'end': 1205343018000},
        {'id': '6_27', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205343018000, 'end': 1206085135000},
        {'id': '6_28', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206085135000, 'end': 1206164684000},
        {'id': '6_29', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206164684000, 'end': 1206229730000},
        {'id': '6_30', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206229730000, 'end': 1206358259000},
        {'id': '6_31', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206358259000, 'end': 1206423132000},
        {'id': '6_32', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206423132000, 'end': 1206465183000},
        {'id': '6_33', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206465183000, 'end': 1206522285000},
        {'id': '6_34', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206522285000, 'end': 1206975599000}
      ]
    },
    {
      'id': '7',
      'name': 'Server 7',
      'broken': '9%',
      'maintance': '13%',
      'working': '78%',
      'rowHeight': 30,
      'periods': [
        {'id': '7_1', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201861157000},
        {'id': '7_2', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201861157000, 'end': 1201941651000},
        {'id': '7_3', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201941651000, 'end': 1202062284000},
        {'id': '7_4', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202062284000, 'end': 1202133402000},
        {'id': '7_5', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202133402000, 'end': 1202203037000},
        {'id': '7_6', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202203037000, 'end': 1202341107000},
        {'id': '7_7', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202341107000, 'end': 1202550231000},
        {'id': '7_8', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202550231000, 'end': 1202594192000},
        {'id': '7_9', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202594192000, 'end': 1202813223000},
        {'id': '7_10', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202813223000, 'end': 1202898757000},
        {'id': '7_11', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202898757000, 'end': 1202956862000},
        {'id': '7_12', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202956862000, 'end': 1203051226000},
        {'id': '7_13', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203051226000, 'end': 1203448952000},
        {'id': '7_14', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203448952000, 'end': 1203504319000},
        {'id': '7_15', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203504319000, 'end': 1203805843000},
        {'id': '7_16', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203805843000, 'end': 1203844927000},
        {'id': '7_17', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203844927000, 'end': 1203927703000},
        {'id': '7_18', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203927703000, 'end': 1203996190000},
        {'id': '7_19', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203996190000, 'end': 1204062915000},
        {'id': '7_20', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204062915000, 'end': 1204099113000},
        {'id': '7_21', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204099113000, 'end': 1204161759000},
        {'id': '7_22', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204161759000, 'end': 1205854106000},
        {'id': '7_23', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205854106000, 'end': 1205932744000},
        {'id': '7_24', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205932744000, 'end': 1205999114000},
        {'id': '7_25', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205999114000, 'end': 1206412721000},
        {'id': '7_26', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206412721000, 'end': 1206495807000},
        {'id': '7_27', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206495807000, 'end': 1206692807000},
        {'id': '7_28', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206692807000, 'end': 1206731719000},
        {'id': '7_29', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206731719000, 'end': 1206783577000},
        {'id': '7_30', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206783577000, 'end': 1206839640000},
        {'id': '7_31', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206839640000, 'end': 1206922654000},
        {'id': '7_32', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206922654000, 'end': 1206975599000}
      ]
    },
    {
      'id': '8',
      'name': 'Server 8',
      'broken': '14%',
      'maintance': '13%',
      'working': '73%',
      'rowHeight': 30,
      'periods': [
        {'id': '8_1', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201869726000},
        {'id': '8_2', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1201869726000, 'end': 1201979267000},
        {'id': '8_3', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201979267000, 'end': 1202161750000},
        {'id': '8_4', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202161750000, 'end': 1202216328000},
        {'id': '8_5', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202216328000, 'end': 1202289889000},
        {'id': '8_6', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202289889000, 'end': 1202346870000},
        {'id': '8_7', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202346870000, 'end': 1202398664000},
        {'id': '8_8', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202398664000, 'end': 1202442734000},
        {'id': '8_9', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202442734000, 'end': 1202720457000},
        {'id': '8_10', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202720457000, 'end': 1203898067000},
        {'id': '8_11', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203898067000, 'end': 1203983231000},
        {'id': '8_12', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203983231000, 'end': 1204025366000},
        {'id': '8_13', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204025366000, 'end': 1204088021000},
        {'id': '8_14', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204088021000, 'end': 1204216635000},
        {'id': '8_15', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204216635000, 'end': 1204266810000},
        {'id': '8_16', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204266810000, 'end': 1204671998000},
        {'id': '8_17', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204671998000, 'end': 1204740764000},
        {'id': '8_18', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204740764000, 'end': 1204866470000},
        {'id': '8_19', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204866470000, 'end': 1204945719000},
        {'id': '8_20', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204945719000, 'end': 1205083964000},
        {'id': '8_21', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205083964000, 'end': 1205162098000},
        {'id': '8_22', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205162098000, 'end': 1205229628000},
        {'id': '8_23', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205229628000, 'end': 1205427627000},
        {'id': '8_24', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205427627000, 'end': 1205491303000},
        {'id': '8_25', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205491303000, 'end': 1205529985000},
        {'id': '8_26', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205529985000, 'end': 1205953873000},
        {'id': '8_27', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205953873000, 'end': 1205999679000},
        {'id': '8_28', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205999679000, 'end': 1206195689000},
        {'id': '8_29', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206195689000, 'end': 1206238919000},
        {'id': '8_30', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206238919000, 'end': 1206443265000},
        {'id': '8_31', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206443265000, 'end': 1206518222000},
        {'id': '8_32', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206518222000, 'end': 1206604315000},
        {'id': '8_33', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206604315000, 'end': 1206657803000},
        {'id': '8_34', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206657803000, 'end': 1206952423000},
        {'id': '8_35', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206952423000, 'end': 1206975599000}
      ]
    },
    {
      'id': '9',
      'name': 'Server 9',
      'broken': '10%',
      'maintance': '23%',
      'working': '67%',
      'rowHeight': 30,
      'periods': [
        {'id': '9_1', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201844829000},
        {'id': '9_2', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201844829000, 'end': 1201891700000},
        {'id': '9_3', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201891700000, 'end': 1201930770000},
        {'id': '9_4', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201930770000, 'end': 1201969034000},
        {'id': '9_5', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201969034000, 'end': 1202080287000},
        {'id': '9_6', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202080287000, 'end': 1202202912000},
        {'id': '9_7', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202202912000, 'end': 1202275868000},
        {'id': '9_8', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202275868000, 'end': 1202343246000},
        {'id': '9_9', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202343246000, 'end': 1202400166000},
        {'id': '9_10', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202400166000, 'end': 1202467827000},
        {'id': '9_11', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202467827000, 'end': 1202533616000},
        {'id': '9_12', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202533616000, 'end': 1202616452000},
        {'id': '9_13', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202616452000, 'end': 1202674427000},
        {'id': '9_14', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202674427000, 'end': 1202876453000},
        {'id': '9_15', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202876453000, 'end': 1202994196000},
        {'id': '9_16', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202994196000, 'end': 1203396522000},
        {'id': '9_17', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203396522000, 'end': 1203460653000},
        {'id': '9_18', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203460653000, 'end': 1203533128000},
        {'id': '9_19', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203533128000, 'end': 1203646043000},
        {'id': '9_20', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203646043000, 'end': 1203716454000},
        {'id': '9_21', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203716454000, 'end': 1204042464000},
        {'id': '9_22', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204042464000, 'end': 1204118526000},
        {'id': '9_23', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204118526000, 'end': 1204558675000},
        {'id': '9_24', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204558675000, 'end': 1204643440000},
        {'id': '9_25', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204643440000, 'end': 1204705528000},
        {'id': '9_26', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204705528000, 'end': 1204854649000},
        {'id': '9_27', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204854649000, 'end': 1204907133000},
        {'id': '9_28', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204907133000, 'end': 1205114626000},
        {'id': '9_29', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205114626000, 'end': 1205243309000},
        {'id': '9_30', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205243309000, 'end': 1205410114000},
        {'id': '9_31', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205410114000, 'end': 1205480715000},
        {'id': '9_32', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205480715000, 'end': 1205660047000},
        {'id': '9_33', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205660047000, 'end': 1205706214000},
        {'id': '9_34', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205706214000, 'end': 1205827358000},
        {'id': '9_35', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1205827358000, 'end': 1205868925000},
        {'id': '9_36', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205868925000, 'end': 1205954172000},
        {'id': '9_37', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205954172000, 'end': 1205997504000},
        {'id': '9_38', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205997504000, 'end': 1206086622000},
        {'id': '9_39', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206086622000, 'end': 1206307196000},
        {'id': '9_40', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206307196000, 'end': 1206355774000},
        {'id': '9_41', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206355774000, 'end': 1206593032000},
        {'id': '9_42', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206593032000, 'end': 1206645790000},
        {'id': '9_43', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206645790000, 'end': 1206715271000},
        {'id': '9_44', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206715271000, 'end': 1206777912000},
        {'id': '9_45', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206777912000, 'end': 1206975600000}
      ]
    },
    {
      'id': '10',
      'name': 'Server 10',
      'broken': '15%',
      'maintance': '19%',
      'working': '66%',
      'rowHeight': 30,
      'periods': [
        {'id': '10_1', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1201795200000, 'end': 1201858283000},
        {'id': '10_2', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1201858283000, 'end': 1202099870000},
        {'id': '10_3', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202099870000, 'end': 1202185432000},
        {'id': '10_4', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202185432000, 'end': 1202222936000},
        {'id': '10_5', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202222936000, 'end': 1202280605000},
        {'id': '10_6', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202280605000, 'end': 1202343543000},
        {'id': '10_7', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202343543000, 'end': 1202496854000},
        {'id': '10_8', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202496854000, 'end': 1202564571000},
        {'id': '10_9', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202564571000, 'end': 1202625867000},
        {'id': '10_10', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202625867000, 'end': 1202667525000},
        {'id': '10_11', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202667525000, 'end': 1202723135000},
        {'id': '10_12', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1202723135000, 'end': 1202781146000},
        {'id': '10_13', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202781146000, 'end': 1202845162000},
        {'id': '10_14', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202845162000, 'end': 1202894922000},
        {'id': '10_15', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1202894922000, 'end': 1202966484000},
        {'id': '10_16', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1202966484000, 'end': 1203051220000},
        {'id': '10_17', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203051220000, 'end': 1203104068000},
        {'id': '10_18', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203104068000, 'end': 1203178056000},
        {'id': '10_19', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203178056000, 'end': 1203218970000},
        {'id': '10_20', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203218970000, 'end': 1203264884000},
        {'id': '10_21', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203264884000, 'end': 1203302709000},
        {'id': '10_22', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203302709000, 'end': 1203528158000},
        {'id': '10_23', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1203528158000, 'end': 1203573188000},
        {'id': '10_24', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203573188000, 'end': 1203794351000},
        {'id': '10_25', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1203794351000, 'end': 1203855641000},
        {'id': '10_26', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1203855641000, 'end': 1204244323000},
        {'id': '10_27', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204244323000, 'end': 1204313249000},
        {'id': '10_28', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204313249000, 'end': 1204427612000},
        {'id': '10_29', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204427612000, 'end': 1204557101000},
        {'id': '10_30', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204557101000, 'end': 1204604378000},
        {'id': '10_31', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1204604378000, 'end': 1204649777000},
        {'id': '10_32', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1204649777000, 'end': 1204997333000},
        {'id': '10_33', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1204997333000, 'end': 1205043179000},
        {'id': '10_34', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205043179000, 'end': 1205178475000},
        {'id': '10_35', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205178475000, 'end': 1205235442000},
        {'id': '10_36', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205235442000, 'end': 1205433606000},
        {'id': '10_37', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205433606000, 'end': 1205472290000},
        {'id': '10_38', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205472290000, 'end': 1205603415000},
        {'id': '10_39', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205603415000, 'end': 1205646447000},
        {'id': '10_40', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205646447000, 'end': 1205717002000},
        {'id': '10_41', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205717002000, 'end': 1205760596000},
        {'id': '10_42', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205760596000, 'end': 1205841156000},
        {'id': '10_43', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205841156000, 'end': 1205894298000},
        {'id': '10_44', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1205894298000, 'end': 1205930897000},
        {'id': '10_45', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1205930897000, 'end': 1206040929000},
        {'id': '10_46', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206040929000, 'end': 1206363486000},
        {'id': '10_47', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206363486000, 'end': 1206447027000},
        {'id': '10_48', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206447027000, 'end': 1206512690000},
        {'id': '10_49', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206512690000, 'end': 1206567949000},
        {'id': '10_50', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206567949000, 'end': 1206630014000},
        {'id': '10_51', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206630014000, 'end': 1206738027000},
        {'id': '10_52', 'style': 'working', 'fill': 'red 0.7', 'stroke': 'none', 'hoverFill': 'red', 'hoverStroke': 'cyan', 'start': 1206738027000, 'end': 1206811019000},
        {'id': '10_53', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206811019000, 'end': 1206919721000},
        {'id': '10_54', 'style': 'maintance', 'fill': '#FFFF00 0.7', 'stroke': 'none', 'hoverFill': 'yellow', 'hoverStroke': 'cyan', 'start': 1206919721000, 'end': 1206956898000},
        {'id': '10_55', 'style': 'working', 'fill': 'green 0.7', 'stroke': 'none', 'hoverFill': 'green', 'hoverStroke': 'cyan', 'start': 1206956898000, 'end': 1206975600000}
      ]
    }
  ];
}