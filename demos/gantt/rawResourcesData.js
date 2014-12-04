var rawData = [
  {
    'id': '1',
    'name': 'Res 1',
    'also': 'also 1',
    'periods': [
      {
        'id': 'p11',
        'start': Date.UTC(2014, 1, 15, 0, 0, 0, 0),
        'end': Date.UTC(2014, 1, 18, 12, 30, 0, 0),
        'fill': {
          'keys': ['0 #fafbfc', '0.5 #cecece', '1 #9e9e9e'],
          'angle': -90
        },
        'label': {
          'value': 'P11 label',
          'fontColor': '#fff',
          'anchor': 'leftCenter',
          'position': 'leftCenter'
        },
        'startMarker': {
          'type': 'triangleDown',
          'fill': 'yellow',
          'stroke': 'green'
        },
        'endMarker': {
          'type': 'star5',
          'fill': 'red',
          'stroke': 'blue'
        },
        'connectTo': 'p12'
      },
      {
        'id': 'p12',
        'start': Date.UTC(2014, 1, 26, 0, 0, 0, 0),
        'end': Date.UTC(2014, 1, 27, 12, 0, 0, 0),
        'fill': {
          'keys': ['0 #fafbfc', '0.5 #b6cee2', '1 #63a6de'],
          'angle': -90
        },
        'label': {
          'value': 'P12 label',
          'fontColor': '#020277',
          'fontWeight': 'bold'
        },
        'startMarker': {
          'type': 'triangleDown',
          'fill': 'yellow',
          'stroke': 'green'
        },
        'endMarker': {
          'type': 'star5',
          'fill': 'red',
          'stroke': 'blue'
        },
        'connectTo': 'p21'
      }
    ]
  },

  {
    'id': '2',
    'name': 'Res 2',
    'also': 'also 2',
    'periods': [
      {
        'id': 'p21',
        'start': Date.UTC(2014, 2, 1, 0, 0, 0, 0),
        'end': Date.UTC(2014, 2, 7, 10, 30, 0, 0),
        'label': {
          'value': 'P21 label',
          'fill': 'red'
        },
        'startMarker': {
          'type': 'triangleDown',
          'stroke': 'green'
        },
        'endMarker': {
          'type': 'star5',
          'stroke': 'red'
        },
        'connectTo': 'p3',
        'connectorType': 'startStart'
      }
    ]
  },

  {
    'id': '3',
    'name': 'Res 3',
    'also': 'also 3',
    'periods': [
      {
        'id': 'p3',
        'start': Date.UTC(2014, 7, 15, 0, 0, 0, 0),
        'end': Date.UTC(2014, 9, 1, 23, 59, 59, 0),
        'label': {
          'value': 'P31 label',
          'fill': 'red'
        },
        'startMarker': {
          'type': 'triangleDown',
          'stroke': 'green'
        },
        'endMarker': {
          'type': 'star5',
          'stroke': 'red'
        }
      }
    ]
  }
];
