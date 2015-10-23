var chart;

anychart.onDocumentReady(function() {
  var treeData = anychart.data.tree(data, anychart.enums.TreeFillingMethod.AS_TABLE);
  chart = anychart.ganttProject();
  chart.container('container');
  chart.data(treeData);

  var dg = chart.dataGrid();
  var nameColumn = dg.column(1);
  nameColumn.width(500);

  chart.draw();
  chart.zoomTo(Date.UTC(2014, 2, 1), Date.UTC(2014, 5, 1));

  //chart.fitAll();
});


var data = [
  {
    'id': 1,
    'name': 'Item 0',
    'rowHeight': 40,
    'progressValue': '14%',
    'actualStart': Date.UTC(2014, 2, 1),
    'actualEnd': Date.UTC(2014, 3, 5)
  },
  {
    'id': 2,
    //'name': 'Old connector',
    'name': 'Item 1',
    'rowHeight': 40,
    'progressValue': '25%',
    'actualStart': Date.UTC(2014, 3, 1),
    'actualEnd': Date.UTC(2014, 4, 10),
    'connectTo': 1,
    'connectorType': 'StartStart',
    'connector': {
      'stroke': 'red',
      'fill': 'blue'
    }
  },
  {
    'id': 3,
    'name': 'Item 2',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 4, 15),
    'actualEnd': Date.UTC(2014, 5, 20)
  },
  {
    'id': 4,
    'rowHeight': 40,
    'name': 'Item 3',
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 6, 1),
    'actualEnd': Date.UTC(2014, 6, 25),
    'connector': [
      {
        'connectTo': 2,
        'connectorType': 'FinishFinish',
        'fill': 'red',
        'stroke': '#fa0'
      },
      {
        'connectTo': 7,
        'connectorType': 'StartStart',
        'fill': 'red',
        'stroke': '#3a0'
      },
      {
        'connectTo': 6,
        'stroke': '#35d',
        'connectorType': 'FinishFinish'
      },
      {
        'connectTo': 5,
        'stroke': {
          'color': '#55e',
          'thickness': 3,
          'opacity': .9
        },
        'connectorType': 'StartFinish'
      }
    ]
  },
  {
    'id': 5,
    'name': 'Item 4',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 6, 15),
    'actualEnd': Date.UTC(2014, 7, 6),
    'actual': {
      'label': {
        'value': 'Bang!',
        'fontColor': '#fff',
        'anchor': 'center',
        'position': 'center'
      }
    }
  },
  {
    'id': 6,
    'name': 'Item 5',
    'rowHeight': 40,
    'progressValue': '27%',
    'actualStart': Date.UTC(2014, 7, 1),
    'actualEnd': Date.UTC(2014, 8, 12)
  },
  {
    'id': 7,
    'name': 'Item 6',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 8, 1),
    'actualEnd': Date.UTC(2014, 8, 20)
  },
  {
    'id': 8,
    'name': 'Item 7',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 9, 5),
    'actualEnd': Date.UTC(2014, 9, 20)
  },
  {
    'id': 9,
    'name': 'Item 8',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 9, 25),
    'actualEnd': Date.UTC(2014, 10, 15)
  },
  {
    'id': 10,
    'name': 'Item 9',
    'rowHeight': 40,
    'progressValue': '80%',
    'actualStart': Date.UTC(2014, 10, 22),
    'actualEnd': Date.UTC(2014, 11, 29)
  },
  {
    'id': 11,
    'name': 'Item 10',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2015, 0, 2),
    'actualEnd': Date.UTC(2015, 2, 1)
  }
];
