var chart;

anychart.onDocumentReady(function() {
  var treeData = anychart.data.tree(data, anychart.enums.TreeFillingMethod.AS_TABLE);
  chart = anychart.ganttProject();
  chart.container('container');
  chart.data(treeData);
  chart.splitterPosition(150);
  chart.draw();
  chart.fitAll();
});


var data = [
  {
    'id': 1,
    'name': 'Item 0',
    'rowHeight': 40,
    'markers': [
      {
        //'value': Date.UTC(2014, 3, 27),
        'value': '2014.04.27',
        'type': 'triangleDown',
        'fill': '#f00',
        'stroke': 'black'
      },
      {
        'value': Date.UTC(2014, 5, 15),
        'type': 'triangleUp',
        'fill': '#0f0',
        'stroke': 'black'
      },
      {
        'value': Date.UTC(2014, 6, 13),
        'type': 'triangleUp',
        'fill': '#ff0',
        'stroke': 'black',
        'offsetY': 5
      },
      {
        'value': Date.UTC(2014, 7, 7),
        'type': 'triangleUp',
        'fill': '#f00',
        'stroke': 'black',
        'offsetY': 10
      }

    ]
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
    },
    'parent': 1
  },
  {
    'id': 3,
    'name': 'Item 2',
    'rowHeight': 40,
    'parent': 1,
    'markers': [
      {
        'value': Date.UTC(2014, 3, 20)
      },
      {
        'value': Date.UTC(2014, 4, 15),
        'stroke': '2 green',
        'fill': '#4f4'
      },
      {
        'value': Date.UTC(2014, 5, 28),
        'stroke': '2 blue',
        'fill': '#99f',
        'size': 18
      },
      {
        'value': Date.UTC(2014, 9, 5),
        'stroke': '4 red',
        'fill': '#fff'
      }
    ]

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
    ],
    'parent': 1
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
    },
    'parent': 1
  },
  {
    'id': 6,
    'name': 'Item 5',
    'rowHeight': 40,
    'progressValue': '27%',
    'actualStart': Date.UTC(2014, 7, 1),
    'actualEnd': Date.UTC(2014, 8, 12),
    'parent': 1,
    'markers': [
      {
        'value': Date.UTC(2014, 7, 8),
        'type': 'triangleUp',
        'fill': '#fb6',
        'stroke': '1 blue'
      },
      {
        'value': Date.UTC(2014, 6, 15),
        'type': 'diamond',
        'fill': '#fb6',
        'stroke': '1 blue'
      },
      {
        'value': Date.UTC(2014, 9, 15),
        'type': 'triangleDown',
        'fill': '#fb6',
        'stroke': '1 blue'
      }
    ]
  },
  {
    'id': 7,
    'name': 'Item 6',
    'rowHeight': 40,
    'markers': [
      {
        'value': Date.UTC(2014, 7, 1),
        'size': 7,
        'fill': '#0f0',
        'stroke': '#000'
      },
      {
        'value': Date.UTC(2014, 7, 27),
        'size': 7,
        'fill': '#ff0',
        'stroke': '#000',
        'type': 'diagonalCross',
        'offsetY': 5
      },
      {
        'value': Date.UTC(2014, 8, 15),
        'size': 7,
        'fill': '#f00',
        'stroke': '#000',
        'type': 'diamond',
        'offsetY': 10
      },
      {
        'value': Date.UTC(2014, 9, 5),
        'size': 7,
        'fill': '#c00',
        'stroke': '#000',
        'type': 'cross',
        'offsetY': 14.5
      },
      {
        'value': Date.UTC(2014, 10, 7),
        'size': 7,
        'fill': '#0f0',
        'stroke': '#000',
        'type': 'square',
        'offsetY': -3.5
      },
      {
        'value': Date.UTC(2014, 11, 7),
        'size': 7,
        'stroke': '#000',
        'type': 'circle'
      }
    ]
  },
  {
    'id': 8,
    'name': 'Item 7',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 6, 5),
    'actualEnd': Date.UTC(2014, 9, 20),
    'parent': 7
  },
  {
    'id': 9,
    'name': 'Item 8',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2014, 9, 25),
    'actualEnd': Date.UTC(2014, 10, 15),
    'parent': 7
  },
  {
    'id': 10,
    'name': 'Item 9',
    'rowHeight': 40,
    'progressValue': '80%',
    'actualStart': Date.UTC(2014, 10, 22),
    'actualEnd': Date.UTC(2014, 11, 29),
    'parent': 7
  },
  {
    'id': 11,
    'name': 'Item 10',
    'rowHeight': 40,
    'progressValue': '0%',
    'actualStart': Date.UTC(2015, 0, 2),
    'actualEnd': Date.UTC(2015, 2, 1),
    'parent': 7
  }
];
