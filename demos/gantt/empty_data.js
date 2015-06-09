var chart1, chart2, chart3, chart4, chart5, chart6, chart7;

anychart.onDocumentReady(function() {
  var treeData = anychart.data.tree([]);
  chart1 = anychart.ganttProject();
  chart1.container('c1');
  chart1.bounds(0, 0, '100%', '100%');
  chart1.data(treeData);

  var dataGrid = chart1.dataGrid();
  dataGrid.column(0).title().text('#');
  dataGrid.column(1).width(400);
  dataGrid.column(2).width(70).textFormatter(function(item) {
    var date = new Date(item.get('actualStart'));
    return date.getFullYear() + '.' + date.getMonth() + '.' + date.getDay();
  }).title().text('Start Time');

  dataGrid.column(3).width(70).textFormatter(function(item) {
    var date = new Date(item.get('actualEnd'));
    return date.getFullYear() + '.' + date.getMonth() + '.' + date.getDay();
  }).title().text('End Time');

  chart1.draw();

  //----------------

  chart2 = anychart.ganttResource();
  chart2.container('c2');
  chart2.draw();

  //----------------

  chart3 = anychart.ganttProject();
  var treeData3 = anychart.data.tree([
    {'id': 'milestone', 'name': 'Single milestone', 'actualStart': Date.UTC(2015, 3, 14)}
  ]);
  chart3.data(treeData3);
  chart3.container('c3');
  chart3.draw();
  chart3.fitAll();

  //----------------

  chart4 = anychart.ganttProject();
  var treeData4 = anychart.data.tree([
    {'id': '1', 'name': 'Incorrect actual start'}
  ]);
  chart4.data(treeData4);
  chart4.container('c4');
  chart4.draw();

  //----------------

  chart5 = anychart.ganttProject();
  var treeData5 = anychart.data.tree([
    {
      'id': '1',
      'name': 'Correct actual start',
      'actualStart': Date.UTC(2015, 3, 14),
      'actualEnd': Date.UTC(2015, 3, 16)
    },
    {
      'id': '2',
      'name': 'Incorrect actual start'
    },
    {
      'id': '3',
      'name': 'One more correct',
      'actualStart': Date.UTC(2015, 3, 15),
      'actualEnd': Date.UTC(2015, 3, 17)
    }
  ]);
  chart5.data(treeData5);
  chart5.container('c5');
  chart5.draw();
  chart5.fitAll();

  //----------------

  chart6 = anychart.ganttProject();
  var treeData6 = anychart.data.tree([
    {
      'id': '1',
      'name': 'Correct actual start',
      'actualStart': Date.UTC(2015, 3, 14),
      'actualEnd': Date.UTC(2015, 3, 16),
      'connectTo': '2'
    },
    {
      'id': '2',
      'name': 'Incorrect actual start',
      'connectTo': '3'
    },
    {
      'id': '3',
      'name': 'One more correct',
      'actualStart': Date.UTC(2015, 3, 15),
      'actualEnd': Date.UTC(2015, 3, 17),
      'connectTo': '1',
      'connectorType': 'StartFinish'
    }
  ]);
  chart6.data(treeData6);
  chart6.container('c6');
  chart6.draw();
  chart6.fitAll();

  //----------------

  chart7 = anychart.ganttResource();
  var treeData7 = anychart.data.tree([
    {
      'id': '1',
      'name': 'Correct and incorrect periods',
      'periods': [
        {
          'id': '1',
          'start': Date.UTC(2015, 5, 2),
          'end': Date.UTC(2015, 5, 3),
          'connectTo': '2'
        },
        {
          'id': '2',
          'connectTo': '3'
        },
        {
          'id': '3',
          'start': Date.UTC(2015, 5, 6),
          'end': Date.UTC(2015, 5, 7),
          'connectTo': '4'
        },
        {
          'id': '4',
          'connectTo': '5'
        },
        {
          'id': '5',
          'start': Date.UTC(2015, 5, 10),
          'end': Date.UTC(2015, 5, 11),
          'connectTo': '6'
        },
        {
          'id': '6',
          'start': Date.UTC(2015, 5, 12),
          'end': Date.UTC(2015, 5, 13)
        }
      ]
    }
  ]);
  chart7.data(treeData7);
  chart7.container('c7');
  chart7.draw();
  chart7.fitAll();

});
