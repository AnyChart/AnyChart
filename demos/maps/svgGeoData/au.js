window['anychart'] = window['anychart'] || {};
window['anychart']['maps'] = window['anychart']['maps'] || {};
window['anychart']['maps']['world_source'] = {
  'type': 'FeatureCollection',
  'features': [
    {
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
          ]
        ]
      },
      'type': 'Feature',
      'properties': {
        'id': 'A'
      }
    },
    {
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [0, 20],
            [10, 20],
            [10, 30],
            [0, 30],
            [0, 20]
          ]
        ]
      },
      'type': 'Feature',
      'properties': {
        'id': 'B'
      }
    },
    {
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [20, 0],
            [30, 0],
            [30, 30],
            [20, 30],
            [20, 0]
          ]
        ]
      },
      'type': 'Feature',
      'properties': {
        'id': 'C'
      }
    }
  ]
};
