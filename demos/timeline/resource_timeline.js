var timeline;

anychart.onDocumentReady(function() {
  timeline = anychart.ui.resourceTimeline();
  timeline.container('container');

  var tree = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);
  timeline.data(tree);

  timeline.draw();
  timeline.listen('signal', timeline.draw, false, timeline);
});


function getData() {
  return [
    {
      'id': '1',
      'name': 'Game Server',
      'offline': '11%',
      'maintenance': '20%',
      'online': '69%',
      'rowHeight': 22,
      'collapsed': false,
      'periods': [
        {
          'id': '1_1',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 2, 6, 44)
        },
        {
          'id': '1_2',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 2, 6, 44),
          'end': Date.UTC(2008, 1, 3, 0, 6)
        },
        {
          'id': '1_3',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 3, 0, 6),
          'end': Date.UTC(2008, 1, 6, 13, 28)
        },
        {
          'id': '1_4',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 6, 13, 28),
          'end': Date.UTC(2008, 1, 7, 0, 47)
        },
        {
          'id': '1_5',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 0, 47),
          'end': Date.UTC(2008, 1, 8, 14, 18)
        },
        {
          'id': '1_6',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 8, 14, 18),
          'end': Date.UTC(2008, 1, 9, 12, 36)
        },
        {
          'id': '1_7',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 9, 12, 36),
          'end': Date.UTC(2008, 1, 10, 7, 58)
        },
        {
          'id': '1_8',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 10, 7, 58),
          'end': Date.UTC(2008, 1, 11, 3, 26)
        },
        {
          'id': '1_9',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 11, 3, 26),
          'end': Date.UTC(2008, 1, 11, 19, 20)
        },
        {
          'id': '1_10',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 11, 19, 20),
          'end': Date.UTC(2008, 1, 14, 20, 36)
        },
        {
          'id': '1_11',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 14, 20, 36),
          'end': Date.UTC(2008, 1, 15, 7, 3)
        },
        {
          'id': '1_12',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 15, 7, 3),
          'end': Date.UTC(2008, 1, 15, 22, 14)
        },
        {
          'id': '1_13',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 15, 22, 14),
          'end': Date.UTC(2008, 1, 16, 20, 18)
        },
        {
          'id': '1_14',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 16, 20, 18),
          'end': Date.UTC(2008, 1, 17, 19, 55)
        },
        {
          'id': '1_15',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 17, 19, 55),
          'end': Date.UTC(2008, 1, 18, 17, 45)
        },
        {
          'id': '1_16',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 18, 17, 45),
          'end': Date.UTC(2008, 1, 21, 17, 42)
        },
        {
          'id': '1_17',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 21, 17, 42),
          'end': Date.UTC(2008, 1, 22, 15, 23)
        },
        {
          'id': '1_18',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 22, 15, 23),
          'end': Date.UTC(2008, 1, 25, 10, 32)
        },
        {
          'id': '1_19',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 25, 10, 32),
          'end': Date.UTC(2008, 1, 26, 23, 54)
        },
        {
          'id': '1_20',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 26, 23, 54),
          'end': Date.UTC(2008, 2, 6, 22, 31)
        },
        {
          'id': '1_21',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 6, 22, 31),
          'end': Date.UTC(2008, 2, 7, 20, 4)
        },
        {
          'id': '1_22',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 7, 20, 4),
          'end': Date.UTC(2008, 2, 11, 0, 12)
        },
        {
          'id': '1_23',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 11, 0, 12),
          'end': Date.UTC(2008, 2, 11, 15, 18)
        },
        {
          'id': '1_24',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 11, 15, 18),
          'end': Date.UTC(2008, 2, 18, 4, 29)
        },
        {
          'id': '1_25',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 18, 4, 29),
          'end': Date.UTC(2008, 2, 19, 13, 46)
        },
        {
          'id': '1_26',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 19, 13, 46),
          'end': Date.UTC(2008, 2, 20, 9, 8)
        },
        {
          'id': '1_27',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 20, 9, 8),
          'end': Date.UTC(2008, 2, 21, 9, 5)
        },
        {
          'id': '1_28',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 21, 9, 5),
          'end': Date.UTC(2008, 2, 22, 19, 11)
        },
        {
          'id': '1_29',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 22, 19, 11),
          'end': Date.UTC(2008, 2, 24, 23, 15)
        },
        {
          'id': '1_30',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 24, 23, 15),
          'end': Date.UTC(2008, 2, 26, 15, 26)
        },
        {
          'id': '1_31',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 26, 15, 26),
          'end': Date.UTC(2008, 2, 27, 19, 8)
        },
        {
          'id': '1_32',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 27, 19, 8),
          'end': Date.UTC(2008, 2, 28, 13, 14)
        },
        {
          'id': '1_33',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 28, 13, 14),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '1online',
      'name': 'Online',
      'online': '69%',
      'parent': '1',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '1_1online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 2, 6, 44),
          'connectTo': '1_2maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_3online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 3, 0, 6),
          'end': Date.UTC(2008, 1, 6, 13, 28),
          'connectTo': '1_4maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_5online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 0, 47),
          'end': Date.UTC(2008, 1, 8, 14, 18),
          'connectTo': '1_6maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_7online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 9, 12, 36),
          'end': Date.UTC(2008, 1, 10, 7, 58),
          'connectTo': '1_8offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '1_9online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 11, 3, 26),
          'end': Date.UTC(2008, 1, 11, 19, 20),
          'connectTo': '1_10maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_11online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 14, 20, 36),
          'end': Date.UTC(2008, 1, 15, 7, 3),
          'connectTo': '1_12maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_13online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 15, 22, 14),
          'end': Date.UTC(2008, 1, 16, 20, 18),
          'connectTo': '1_14maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_16online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 18, 17, 45),
          'end': Date.UTC(2008, 1, 21, 17, 42),
          'connectTo': '1_17offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '1_18online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 22, 15, 23),
          'end': Date.UTC(2008, 1, 25, 10, 32),
          'connectTo': '1_19offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '1_20online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 26, 23, 54),
          'end': Date.UTC(2008, 2, 6, 22, 31),
          'connectTo': '1_21offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '1_22online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 7, 20, 4),
          'end': Date.UTC(2008, 2, 11, 0, 12),
          'connectTo': '1_23maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_24online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 11, 15, 18),
          'end': Date.UTC(2008, 2, 18, 4, 29),
          'connectTo': '1_25offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '1_27online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 20, 9, 8),
          'end': Date.UTC(2008, 2, 21, 9, 5),
          'connectTo': '1_28maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_29online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 22, 19, 11),
          'end': Date.UTC(2008, 2, 24, 23, 15),
          'connectTo': '1_30maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_31online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 26, 15, 26),
          'end': Date.UTC(2008, 2, 27, 19, 8),
          'connectTo': '1_32maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '1_33online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 28, 13, 14),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '1maintenance',
      'name': 'Maintenance',
      'maintenance': '20%',
      'parent': '1',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '1_2maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 2, 6, 44),
          'end': Date.UTC(2008, 1, 3, 0, 6),
          'connectTo': '1_3online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_4maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 6, 13, 28),
          'end': Date.UTC(2008, 1, 7, 0, 47),
          'connectTo': '1_5online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_6maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 8, 14, 18),
          'end': Date.UTC(2008, 1, 9, 12, 36),
          'connectTo': '1_7online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_10maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 11, 19, 20),
          'end': Date.UTC(2008, 1, 14, 20, 36),
          'connectTo': '1_11online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_12maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 15, 7, 3),
          'end': Date.UTC(2008, 1, 15, 22, 14),
          'connectTo': '1_13online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_14maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 16, 20, 18),
          'end': Date.UTC(2008, 1, 17, 19, 55),
          'connectTo': '1_15offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '1_23maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 11, 0, 12),
          'end': Date.UTC(2008, 2, 11, 15, 18),
          'connectTo': '1_24online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_26maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 19, 13, 46),
          'end': Date.UTC(2008, 2, 20, 9, 8),
          'connectTo': '1_27online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_28maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 21, 9, 5),
          'end': Date.UTC(2008, 2, 22, 19, 11),
          'connectTo': '1_29online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_30maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 24, 23, 15),
          'end': Date.UTC(2008, 2, 26, 15, 26),
          'connectTo': '1_31online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_32maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 27, 19, 8),
          'end': Date.UTC(2008, 2, 28, 13, 14),
          'connectTo': '1_33online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '1offline',
      'name': 'Offline',
      'offline': '11%',
      'parent': '1',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '1_8offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 10, 7, 58),
          'end': Date.UTC(2008, 1, 11, 3, 26),
          'connectTo': '1_9online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_15offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 17, 19, 55),
          'end': Date.UTC(2008, 1, 18, 17, 45),
          'connectTo': '1_16online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_17offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 21, 17, 42),
          'end': Date.UTC(2008, 1, 22, 15, 23),
          'connectTo': '1_18online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_19offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 25, 10, 32),
          'end': Date.UTC(2008, 1, 26, 23, 54),
          'connectTo': '1_20online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_21offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 6, 22, 31),
          'end': Date.UTC(2008, 2, 7, 20, 4),
          'connectTo': '1_22online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '1_25offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 18, 4, 29),
          'end': Date.UTC(2008, 2, 19, 13, 46),
          'connectTo': '1_26maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        }
      ]
    },
    {
      'id': '2',
      'name': 'API Server',
      'offline': '9%',
      'maintenance': '25%',
      'online': '66%',
      'rowHeight': 22,
      'collapsed': true,
      'periods': [
        {
          'id': '2_1',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 9, 48)
        },
        {
          'id': '2_2',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 1, 9, 48),
          'end': Date.UTC(2008, 1, 1, 23, 26)
        },
        {
          'id': '2_3',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 1, 23, 26),
          'end': Date.UTC(2008, 1, 2, 17, 42)
        },
        {
          'id': '2_4',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 2, 17, 42),
          'end': Date.UTC(2008, 1, 3, 8, 54)
        },
        {
          'id': '2_5',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 3, 8, 54),
          'end': Date.UTC(2008, 1, 5, 11, 20)
        },
        {
          'id': '2_6',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 5, 11, 20),
          'end': Date.UTC(2008, 1, 7, 12, 47)
        },
        {
          'id': '2_7',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 12, 47),
          'end': Date.UTC(2008, 1, 9, 7, 19)
        },
        {
          'id': '2_8',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 9, 7, 19),
          'end': Date.UTC(2008, 1, 10, 7, 8)
        },
        {
          'id': '2_9',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 10, 7, 8),
          'end': Date.UTC(2008, 1, 12, 8, 39)
        },
        {
          'id': '2_10',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 12, 8, 39),
          'end': Date.UTC(2008, 1, 13, 16, 43)
        },
        {
          'id': '2_11',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 13, 16, 43),
          'end': Date.UTC(2008, 1, 14, 11, 30)
        },
        {
          'id': '2_12',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 14, 11, 30),
          'end': Date.UTC(2008, 1, 15, 5, 25)
        },
        {
          'id': '2_13',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 15, 5, 25),
          'end': Date.UTC(2008, 1, 15, 16, 1)
        },
        {
          'id': '2_14',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 15, 16, 1),
          'end': Date.UTC(2008, 1, 16, 13, 10)
        },
        {
          'id': '2_15',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 16, 13, 10),
          'end': Date.UTC(2008, 1, 17, 18, 19)
        },
        {
          'id': '2_16',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 17, 18, 19),
          'end': Date.UTC(2008, 1, 21, 23, 12)
        },
        {
          'id': '2_17',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 21, 23, 12),
          'end': Date.UTC(2008, 1, 22, 15, 20)
        },
        {
          'id': '2_18',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 22, 15, 20),
          'end': Date.UTC(2008, 1, 26, 9, 56)
        },
        {
          'id': '2_19',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 26, 9, 56),
          'end': Date.UTC(2008, 1, 27, 7, 45)
        },
        {
          'id': '2_20',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 27, 7, 45),
          'end': Date.UTC(2008, 1, 27, 20, 11)
        },
        {
          'id': '2_21',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 27, 20, 11),
          'end': Date.UTC(2008, 1, 29, 2, 21)
        },
        {
          'id': '2_22',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 29, 2, 21),
          'end': Date.UTC(2008, 2, 1, 0, 30)
        },
        {
          'id': '2_23',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 1, 0, 30),
          'end': Date.UTC(2008, 2, 1, 15, 24)
        },
        {
          'id': '2_24',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 1, 15, 24),
          'end': Date.UTC(2008, 2, 2, 14, 54)
        },
        {
          'id': '2_25',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 2, 14, 54),
          'end': Date.UTC(2008, 2, 5, 7, 46)
        },
        {
          'id': '2_26',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 5, 7, 46),
          'end': Date.UTC(2008, 2, 6, 3, 21)
        },
        {
          'id': '2_27',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 6, 3, 21),
          'end': Date.UTC(2008, 2, 9, 1, 28)
        },
        {
          'id': '2_28',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 9, 1, 28),
          'end': Date.UTC(2008, 2, 9, 20, 48)
        },
        {
          'id': '2_29',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 9, 20, 48),
          'end': Date.UTC(2008, 2, 12, 17, 29)
        },
        {
          'id': '2_30',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 12, 17, 29),
          'end': Date.UTC(2008, 2, 13, 16, 46)
        },
        {
          'id': '2_31',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 13, 16, 46),
          'end': Date.UTC(2008, 2, 14, 10, 55)
        },
        {
          'id': '2_32',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 14, 10, 55),
          'end': Date.UTC(2008, 2, 15, 9, 9)
        },
        {
          'id': '2_33',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 15, 9, 9),
          'end': Date.UTC(2008, 2, 16, 8, 31)
        },
        {
          'id': '2_34',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 16, 8, 31),
          'end': Date.UTC(2008, 2, 17, 19, 41)
        },
        {
          'id': '2_35',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 17, 19, 41),
          'end': Date.UTC(2008, 2, 19, 19, 57)
        },
        {
          'id': '2_36',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 19, 19, 57),
          'end': Date.UTC(2008, 2, 20, 12, 59)
        },
        {
          'id': '2_37',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 20, 12, 59),
          'end': Date.UTC(2008, 2, 25, 1, 24)
        },
        {
          'id': '2_38',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 25, 1, 24),
          'end': Date.UTC(2008, 2, 25, 11, 44)
        },
        {
          'id': '2_39',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 25, 11, 44),
          'end': Date.UTC(2008, 2, 26, 1, 18)
        },
        {
          'id': '2_40',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 26, 1, 18),
          'end': Date.UTC(2008, 2, 27, 0, 9)
        },
        {
          'id': '2_41',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 27, 0, 9),
          'end': Date.UTC(2008, 2, 27, 18, 46)
        },
        {
          'id': '2_42',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 27, 18, 46),
          'end': Date.UTC(2008, 2, 28, 8, 6)
        },
        {
          'id': '2_43',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 28, 8, 6),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '2online',
      'name': 'Online',
      'online': '66%',
      'parent': '2',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '2_1online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 9, 48),
          'connectTo': '2_2offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '2_3online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 1, 23, 26),
          'end': Date.UTC(2008, 1, 2, 17, 42),
          'connectTo': '2_4maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_5online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 3, 8, 54),
          'end': Date.UTC(2008, 1, 5, 11, 20),
          'connectTo': '2_6maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_7online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 12, 47),
          'end': Date.UTC(2008, 1, 9, 7, 19),
          'connectTo': '2_8maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_9online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 10, 7, 8),
          'end': Date.UTC(2008, 1, 12, 8, 39),
          'connectTo': '2_10maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_11online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 13, 16, 43),
          'end': Date.UTC(2008, 1, 14, 11, 30),
          'connectTo': '2_12offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '2_13online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 15, 5, 25),
          'end': Date.UTC(2008, 1, 15, 16, 1),
          'connectTo': '2_14maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_16online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 17, 18, 19),
          'end': Date.UTC(2008, 1, 21, 23, 12),
          'connectTo': '2_17offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '2_18online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 22, 15, 20),
          'end': Date.UTC(2008, 1, 26, 9, 56),
          'connectTo': '2_19maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_21online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 27, 20, 11),
          'end': Date.UTC(2008, 1, 29, 2, 21),
          'connectTo': '2_22maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_23online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 1, 0, 30),
          'end': Date.UTC(2008, 2, 1, 15, 24),
          'connectTo': '2_24maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_25online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 2, 14, 54),
          'end': Date.UTC(2008, 2, 5, 7, 46),
          'connectTo': '2_26maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_27online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 6, 3, 21),
          'end': Date.UTC(2008, 2, 9, 1, 28),
          'connectTo': '2_28maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_29online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 9, 20, 48),
          'end': Date.UTC(2008, 2, 12, 17, 29),
          'connectTo': '2_30maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_31online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 13, 16, 46),
          'end': Date.UTC(2008, 2, 14, 10, 55),
          'connectTo': '2_32maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_33online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 15, 9, 9),
          'end': Date.UTC(2008, 2, 16, 8, 31),
          'connectTo': '2_34maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_35online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 17, 19, 41),
          'end': Date.UTC(2008, 2, 19, 19, 57),
          'connectTo': '2_36maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_37online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 20, 12, 59),
          'end': Date.UTC(2008, 2, 25, 1, 24),
          'connectTo': '2_38offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '2_39online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 25, 11, 44),
          'end': Date.UTC(2008, 2, 26, 1, 18),
          'connectTo': '2_40offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '2_41online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 27, 0, 9),
          'end': Date.UTC(2008, 2, 27, 18, 46),
          'connectTo': '2_42maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '2_43online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 28, 8, 6),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '2maintenance',
      'name': 'Maintenance',
      'maintenance': '25%',
      'parent': '2',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '2_4maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 2, 17, 42),
          'end': Date.UTC(2008, 1, 3, 8, 54),
          'connectTo': '2_5online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_6maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 5, 11, 20),
          'end': Date.UTC(2008, 1, 7, 12, 47),
          'connectTo': '2_7online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_8maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 9, 7, 19),
          'end': Date.UTC(2008, 1, 10, 7, 8),
          'connectTo': '2_9online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_10maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 12, 8, 39),
          'end': Date.UTC(2008, 1, 13, 16, 43),
          'connectTo': '2_11online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_14maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 15, 16, 1),
          'end': Date.UTC(2008, 1, 16, 13, 10),
          'connectTo': '2_15offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '2_19maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 26, 9, 56),
          'end': Date.UTC(2008, 1, 27, 7, 45),
          'connectTo': '2_20offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '2_22maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 29, 2, 21),
          'end': Date.UTC(2008, 2, 1, 0, 30),
          'connectTo': '2_23online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_24maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 1, 15, 24),
          'end': Date.UTC(2008, 2, 2, 14, 54),
          'connectTo': '2_25online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_26maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 5, 7, 46),
          'end': Date.UTC(2008, 2, 6, 3, 21),
          'connectTo': '2_27online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_28maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 9, 1, 28),
          'end': Date.UTC(2008, 2, 9, 20, 48),
          'connectTo': '2_29online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_30maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 12, 17, 29),
          'end': Date.UTC(2008, 2, 13, 16, 46),
          'connectTo': '2_31online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_32maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 14, 10, 55),
          'end': Date.UTC(2008, 2, 15, 9, 9),
          'connectTo': '2_33online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_34maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 16, 8, 31),
          'end': Date.UTC(2008, 2, 17, 19, 41),
          'connectTo': '2_35online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_36maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 19, 19, 57),
          'end': Date.UTC(2008, 2, 20, 12, 59),
          'connectTo': '2_37online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_42maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 27, 18, 46),
          'end': Date.UTC(2008, 2, 28, 8, 6),
          'connectTo': '2_43online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '2offline',
      'name': 'Offline',
      'offline': '9%',
      'parent': '2',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '2_2offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 1, 9, 48),
          'end': Date.UTC(2008, 1, 1, 23, 26),
          'connectTo': '2_3online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_12offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 14, 11, 30),
          'end': Date.UTC(2008, 1, 15, 5, 25),
          'connectTo': '2_13online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_15offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 16, 13, 10),
          'end': Date.UTC(2008, 1, 17, 18, 19),
          'connectTo': '2_16online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_17offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 21, 23, 12),
          'end': Date.UTC(2008, 1, 22, 15, 20),
          'connectTo': '2_18online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_20offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 27, 7, 45),
          'end': Date.UTC(2008, 1, 27, 20, 11),
          'connectTo': '2_21online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_38offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 25, 1, 24),
          'end': Date.UTC(2008, 2, 25, 11, 44),
          'connectTo': '2_39online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '2_40offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 26, 1, 18),
          'end': Date.UTC(2008, 2, 27, 0, 9),
          'connectTo': '2_41online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '3',
      'name': 'Login Server',
      'offline': '12%',
      'maintenance': '16%',
      'online': '72%',
      'rowHeight': 22,
      'collapsed': true,
      'periods': [
        {
          'id': '3_1',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 15, 57)
        },
        {
          'id': '3_2',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 1, 15, 57),
          'end': Date.UTC(2008, 1, 2, 14, 59)
        },
        {
          'id': '3_3',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 2, 14, 59),
          'end': Date.UTC(2008, 1, 3, 5, 41)
        },
        {
          'id': '3_4',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 3, 5, 41),
          'end': Date.UTC(2008, 1, 16, 15, 12)
        },
        {
          'id': '3_5',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 16, 15, 12),
          'end': Date.UTC(2008, 1, 18, 23, 43)
        },
        {
          'id': '3_6',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 18, 23, 43),
          'end': Date.UTC(2008, 1, 21, 17, 59)
        },
        {
          'id': '3_7',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 21, 17, 59),
          'end': Date.UTC(2008, 1, 22, 4, 17)
        },
        {
          'id': '3_8',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 22, 4, 17),
          'end': Date.UTC(2008, 1, 23, 7, 5)
        },
        {
          'id': '3_9',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 23, 7, 5),
          'end': Date.UTC(2008, 1, 24, 0, 46)
        },
        {
          'id': '3_10',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 24, 0, 46),
          'end': Date.UTC(2008, 1, 24, 18, 17)
        },
        {
          'id': '3_11',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 24, 18, 17),
          'end': Date.UTC(2008, 1, 25, 10, 21)
        },
        {
          'id': '3_12',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 25, 10, 21),
          'end': Date.UTC(2008, 1, 26, 7, 14)
        },
        {
          'id': '3_13',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 26, 7, 14),
          'end': Date.UTC(2008, 1, 27, 2, 38)
        },
        {
          'id': '3_14',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 27, 2, 38),
          'end': Date.UTC(2008, 1, 29, 20, 29)
        },
        {
          'id': '3_15',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 29, 20, 29),
          'end': Date.UTC(2008, 2, 1, 12, 12)
        },
        {
          'id': '3_16',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 1, 12, 12),
          'end': Date.UTC(2008, 2, 2, 6, 32)
        },
        {
          'id': '3_17',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 2, 6, 32),
          'end': Date.UTC(2008, 2, 3, 9, 21)
        },
        {
          'id': '3_18',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 3, 9, 21),
          'end': Date.UTC(2008, 2, 4, 7, 58)
        },
        {
          'id': '3_19',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 4, 7, 58),
          'end': Date.UTC(2008, 2, 7, 2, 4)
        },
        {
          'id': '3_20',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 7, 2, 4),
          'end': Date.UTC(2008, 2, 7, 12, 47)
        },
        {
          'id': '3_21',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 7, 12, 47),
          'end': Date.UTC(2008, 2, 11, 16, 33)
        },
        {
          'id': '3_22',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 11, 16, 33),
          'end': Date.UTC(2008, 2, 12, 13, 33)
        },
        {
          'id': '3_23',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 12, 13, 33),
          'end': Date.UTC(2008, 2, 13, 12, 38)
        },
        {
          'id': '3_24',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 13, 12, 38),
          'end': Date.UTC(2008, 2, 15, 3, 18)
        },
        {
          'id': '3_25',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 15, 3, 18),
          'end': Date.UTC(2008, 2, 16, 17, 6)
        },
        {
          'id': '3_26',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 16, 17, 6),
          'end': Date.UTC(2008, 2, 17, 5, 23)
        },
        {
          'id': '3_27',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 17, 5, 23),
          'end': Date.UTC(2008, 2, 19, 21, 37)
        },
        {
          'id': '3_28',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 19, 21, 37),
          'end': Date.UTC(2008, 2, 20, 9, 3)
        },
        {
          'id': '3_29',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 20, 9, 3),
          'end': Date.UTC(2008, 2, 27, 4, 49)
        },
        {
          'id': '3_30',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 27, 4, 49),
          'end': Date.UTC(2008, 2, 27, 16, 23)
        },
        {
          'id': '3_31',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 27, 16, 23),
          'end': Date.UTC(2008, 2, 28, 20, 10)
        },
        {
          'id': '3_32',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 28, 20, 10),
          'end': Date.UTC(2008, 2, 29, 9, 29)
        },
        {
          'id': '3_33',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 29, 9, 29),
          'end': Date.UTC(2008, 2, 30, 8, 14)
        },
        {
          'id': '3_34',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 30, 8, 14),
          'end': Date.UTC(2008, 2, 30, 22, 5)
        },
        {
          'id': '3_35',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 30, 22, 5),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '3online',
      'name': 'Online',
      'online': '72%',
      'parent': '3',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '3_4online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 3, 5, 41),
          'end': Date.UTC(2008, 1, 16, 15, 12),
          'connectTo': '3_5maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_6online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 18, 23, 43),
          'end': Date.UTC(2008, 1, 21, 17, 59),
          'connectTo': '3_7maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_8online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 22, 4, 17),
          'end': Date.UTC(2008, 1, 23, 7, 5),
          'connectTo': '3_9maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_10online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 24, 0, 46),
          'end': Date.UTC(2008, 1, 24, 18, 17),
          'connectTo': '3_11offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_12online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 25, 10, 21),
          'end': Date.UTC(2008, 1, 26, 7, 14),
          'connectTo': '3_13maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_14online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 27, 2, 38),
          'end': Date.UTC(2008, 1, 29, 20, 29),
          'connectTo': '3_15maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_17online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 2, 6, 32),
          'end': Date.UTC(2008, 2, 3, 9, 21),
          'connectTo': '3_18maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_19online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 4, 7, 58),
          'end': Date.UTC(2008, 2, 7, 2, 4),
          'connectTo': '3_20offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_21online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 7, 12, 47),
          'end': Date.UTC(2008, 2, 11, 16, 33),
          'connectTo': '3_22maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_23online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 12, 13, 33),
          'end': Date.UTC(2008, 2, 13, 12, 38),
          'connectTo': '3_24offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_25online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 15, 3, 18),
          'end': Date.UTC(2008, 2, 16, 17, 6),
          'connectTo': '3_26maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_27online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 17, 5, 23),
          'end': Date.UTC(2008, 2, 19, 21, 37),
          'connectTo': '3_28offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_29online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 20, 9, 3),
          'end': Date.UTC(2008, 2, 27, 4, 49),
          'connectTo': '3_30offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_31online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 27, 16, 23),
          'end': Date.UTC(2008, 2, 28, 20, 10),
          'connectTo': '3_32maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_35online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 30, 22, 5),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '3maintenance',
      'name': 'Maintenance',
      'maintenance': '16%',
      'parent': '3',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '3_2maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 1, 15, 57),
          'end': Date.UTC(2008, 1, 2, 14, 59),
          'connectTo': '3_3offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_5maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 16, 15, 12),
          'end': Date.UTC(2008, 1, 18, 23, 43),
          'connectTo': '3_6online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_7maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 21, 17, 59),
          'end': Date.UTC(2008, 1, 22, 4, 17),
          'connectTo': '3_8online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_9maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 23, 7, 5),
          'end': Date.UTC(2008, 1, 24, 0, 46),
          'connectTo': '3_10online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_13maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 26, 7, 14),
          'end': Date.UTC(2008, 1, 27, 2, 38),
          'connectTo': '3_14online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_15maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 29, 20, 29),
          'end': Date.UTC(2008, 2, 1, 12, 12),
          'connectTo': '3_16offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_18maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 3, 9, 21),
          'end': Date.UTC(2008, 2, 4, 7, 58),
          'connectTo': '3_19online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_22maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 11, 16, 33),
          'end': Date.UTC(2008, 2, 12, 13, 33),
          'connectTo': '3_23online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_26maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 16, 17, 6),
          'end': Date.UTC(2008, 2, 17, 5, 23),
          'connectTo': '3_27online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_32maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 28, 20, 10),
          'end': Date.UTC(2008, 2, 29, 9, 29),
          'connectTo': '3_33offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '3_34maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 30, 8, 14),
          'end': Date.UTC(2008, 2, 30, 22, 5),
          'connectTo': '3_35online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '3offline',
      'name': 'Offline',
      'offline': '12%',
      'parent': '3',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '3_1offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 15, 57),
          'connectTo': '3_2maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '3_3offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 2, 14, 59),
          'end': Date.UTC(2008, 1, 3, 5, 41),
          'connectTo': '3_4online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_11offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 24, 18, 17),
          'end': Date.UTC(2008, 1, 25, 10, 21),
          'connectTo': '3_12online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_16offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 1, 12, 12),
          'end': Date.UTC(2008, 2, 2, 6, 32),
          'connectTo': '3_17online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_20offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 7, 2, 4),
          'end': Date.UTC(2008, 2, 7, 12, 47),
          'connectTo': '3_21online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_24offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 13, 12, 38),
          'end': Date.UTC(2008, 2, 15, 3, 18),
          'connectTo': '3_25online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_28offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 19, 21, 37),
          'end': Date.UTC(2008, 2, 20, 9, 3),
          'connectTo': '3_29online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_30offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 27, 4, 49),
          'end': Date.UTC(2008, 2, 27, 16, 23),
          'connectTo': '3_31online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '3_33offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 29, 9, 29),
          'end': Date.UTC(2008, 2, 30, 8, 14),
          'connectTo': '3_34maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        }
      ]
    },
    {
      'id': '4',
      'name': 'NPC Server',
      'offline': '7%',
      'maintenance': '15%',
      'online': '78%',
      'rowHeight': 22,
      'collapsed': false,
      'periods': [
        {
          'id': '4_1',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 15, 36)
        },
        {
          'id': '4_2',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 1, 15, 36),
          'end': Date.UTC(2008, 1, 2, 12, 27)
        },
        {
          'id': '4_3',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 2, 12, 27),
          'end': Date.UTC(2008, 1, 5, 5, 21)
        },
        {
          'id': '4_4',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 5, 5, 21),
          'end': Date.UTC(2008, 1, 7, 15, 41)
        },
        {
          'id': '4_5',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 15, 41),
          'end': Date.UTC(2008, 1, 8, 15, 24)
        },
        {
          'id': '4_6',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 8, 15, 24),
          'end': Date.UTC(2008, 1, 9, 14, 12)
        },
        {
          'id': '4_7',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 9, 14, 12),
          'end': Date.UTC(2008, 1, 12, 9, 12)
        },
        {
          'id': '4_8',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 12, 9, 12),
          'end': Date.UTC(2008, 1, 13, 2, 53)
        },
        {
          'id': '4_9',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 13, 2, 53),
          'end': Date.UTC(2008, 1, 13, 19, 40)
        },
        {
          'id': '4_10',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 13, 19, 40),
          'end': Date.UTC(2008, 1, 14, 6, 17)
        },
        {
          'id': '4_11',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 14, 6, 17),
          'end': Date.UTC(2008, 1, 18, 4, 33)
        },
        {
          'id': '4_12',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 18, 4, 33),
          'end': Date.UTC(2008, 1, 18, 17, 44)
        },
        {
          'id': '4_13',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 18, 17, 44),
          'end': Date.UTC(2008, 1, 24, 5, 51)
        },
        {
          'id': '4_14',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 24, 5, 51),
          'end': Date.UTC(2008, 1, 24, 20, 49)
        },
        {
          'id': '4_15',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 24, 20, 49),
          'end': Date.UTC(2008, 1, 29, 3, 34)
        },
        {
          'id': '4_16',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 29, 3, 34),
          'end': Date.UTC(2008, 1, 29, 16, 50)
        },
        {
          'id': '4_17',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 29, 16, 50),
          'end': Date.UTC(2008, 2, 4, 18, 24)
        },
        {
          'id': '4_18',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 4, 18, 24),
          'end': Date.UTC(2008, 2, 7, 5, 12)
        },
        {
          'id': '4_19',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 7, 5, 12),
          'end': Date.UTC(2008, 2, 8, 2, 46)
        },
        {
          'id': '4_20',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 8, 2, 46),
          'end': Date.UTC(2008, 2, 8, 13, 42)
        },
        {
          'id': '4_21',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 8, 13, 42),
          'end': Date.UTC(2008, 2, 9, 19, 13)
        },
        {
          'id': '4_22',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 9, 19, 13),
          'end': Date.UTC(2008, 2, 10, 7, 8)
        },
        {
          'id': '4_23',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 10, 7, 8),
          'end': Date.UTC(2008, 2, 16, 9, 46)
        },
        {
          'id': '4_24',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 16, 9, 46),
          'end': Date.UTC(2008, 2, 16, 21, 45)
        },
        {
          'id': '4_25',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 16, 21, 45),
          'end': Date.UTC(2008, 2, 20, 1, 20)
        },
        {
          'id': '4_26',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 20, 1, 20),
          'end': Date.UTC(2008, 2, 20, 23, 10)
        },
        {
          'id': '4_27',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 20, 23, 10),
          'end': Date.UTC(2008, 2, 24, 12, 9)
        },
        {
          'id': '4_28',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 24, 12, 9),
          'end': Date.UTC(2008, 2, 25, 0, 26)
        },
        {
          'id': '4_29',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 25, 0, 26),
          'end': Date.UTC(2008, 2, 26, 9, 54)
        },
        {
          'id': '4_30',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 26, 9, 54),
          'end': Date.UTC(2008, 2, 26, 23, 2)
        },
        {
          'id': '4_31',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 26, 23, 2),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '4online',
      'name': 'Online',
      'online': '78%',
      'parent': '4',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '4_1online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 15, 36),
          'connectTo': '4_2maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_3online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 2, 12, 27),
          'end': Date.UTC(2008, 1, 5, 5, 21),
          'connectTo': '4_4maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_5online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 15, 41),
          'end': Date.UTC(2008, 1, 8, 15, 24),
          'connectTo': '4_6offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '4_7online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 9, 14, 12),
          'end': Date.UTC(2008, 1, 12, 9, 12),
          'connectTo': '4_8maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_9online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 13, 2, 53),
          'end': Date.UTC(2008, 1, 13, 19, 40),
          'connectTo': '4_10offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '4_11online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 14, 6, 17),
          'end': Date.UTC(2008, 1, 18, 4, 33),
          'connectTo': '4_12maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_13online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 18, 17, 44),
          'end': Date.UTC(2008, 1, 24, 5, 51),
          'connectTo': '4_14offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '4_15online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 24, 20, 49),
          'end': Date.UTC(2008, 1, 29, 3, 34),
          'connectTo': '4_16offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '4_17online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 29, 16, 50),
          'end': Date.UTC(2008, 2, 4, 18, 24),
          'connectTo': '4_18maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_19online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 7, 5, 12),
          'end': Date.UTC(2008, 2, 8, 2, 46),
          'connectTo': '4_20maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_21online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 8, 13, 42),
          'end': Date.UTC(2008, 2, 9, 19, 13),
          'connectTo': '4_22maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_23online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 10, 7, 8),
          'end': Date.UTC(2008, 2, 16, 9, 46),
          'connectTo': '4_24maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_25online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 16, 21, 45),
          'end': Date.UTC(2008, 2, 20, 1, 20),
          'connectTo': '4_26offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '4_27online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 20, 23, 10),
          'end': Date.UTC(2008, 2, 24, 12, 9),
          'connectTo': '4_28maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '4_29online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 25, 0, 26),
          'end': Date.UTC(2008, 2, 26, 9, 54),
          'connectTo': '4_30offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '4_31online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 26, 23, 2),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '4maintenance',
      'name': 'Maintenance',
      'maintenance': '15%',
      'parent': '4',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '4_2maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 1, 15, 36),
          'end': Date.UTC(2008, 1, 2, 12, 27),
          'connectTo': '4_3online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_4maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 5, 5, 21),
          'end': Date.UTC(2008, 1, 7, 15, 41),
          'connectTo': '4_5online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_8maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 12, 9, 12),
          'end': Date.UTC(2008, 1, 13, 2, 53),
          'connectTo': '4_9online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_12maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 18, 4, 33),
          'end': Date.UTC(2008, 1, 18, 17, 44),
          'connectTo': '4_13online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_18maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 4, 18, 24),
          'end': Date.UTC(2008, 2, 7, 5, 12),
          'connectTo': '4_19online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_20maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 8, 2, 46),
          'end': Date.UTC(2008, 2, 8, 13, 42),
          'connectTo': '4_21online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_22maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 9, 19, 13),
          'end': Date.UTC(2008, 2, 10, 7, 8),
          'connectTo': '4_23online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_24maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 16, 9, 46),
          'end': Date.UTC(2008, 2, 16, 21, 45),
          'connectTo': '4_25online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_28maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 24, 12, 9),
          'end': Date.UTC(2008, 2, 25, 0, 26),
          'connectTo': '4_29online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '4offline',
      'name': 'Offline',
      'offline': '7%',
      'parent': '4',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '4_6offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 8, 15, 24),
          'end': Date.UTC(2008, 1, 9, 14, 12),
          'connectTo': '4_7online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_10offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 13, 19, 40),
          'end': Date.UTC(2008, 1, 14, 6, 17),
          'connectTo': '4_11online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_14offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 24, 5, 51),
          'end': Date.UTC(2008, 1, 24, 20, 49),
          'connectTo': '4_15online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_16offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 29, 3, 34),
          'end': Date.UTC(2008, 1, 29, 16, 50),
          'connectTo': '4_17online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_26offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 20, 1, 20),
          'end': Date.UTC(2008, 2, 20, 23, 10),
          'connectTo': '4_27online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '4_30offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 26, 9, 54),
          'end': Date.UTC(2008, 2, 26, 23, 2),
          'connectTo': '4_31online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '5',
      'name': 'Data Server',
      'offline': '6%',
      'maintenance': '26%',
      'online': '68%',
      'rowHeight': 22,
      'collapsed': true,
      'periods': [
        {
          'id': '5_1',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 8, 47)
        },
        {
          'id': '5_2',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 1, 8, 47),
          'end': Date.UTC(2008, 1, 2, 3, 37)
        },
        {
          'id': '5_3',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 2, 3, 37),
          'end': Date.UTC(2008, 1, 6, 11, 46)
        },
        {
          'id': '5_4',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 6, 11, 46),
          'end': Date.UTC(2008, 1, 7, 3, 3)
        },
        {
          'id': '5_5',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 3, 3),
          'end': Date.UTC(2008, 1, 9, 16, 56)
        },
        {
          'id': '5_6',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 9, 16, 56),
          'end': Date.UTC(2008, 1, 10, 7, 1)
        },
        {
          'id': '5_7',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 10, 7, 1),
          'end': Date.UTC(2008, 1, 20, 3, 30)
        },
        {
          'id': '5_8',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 20, 3, 30),
          'end': Date.UTC(2008, 1, 20, 23, 21)
        },
        {
          'id': '5_9',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 20, 23, 21),
          'end': Date.UTC(2008, 1, 21, 13, 13)
        },
        {
          'id': '5_10',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 21, 13, 13),
          'end': Date.UTC(2008, 1, 22, 2, 45)
        },
        {
          'id': '5_11',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 22, 2, 45),
          'end': Date.UTC(2008, 1, 24, 10, 58)
        },
        {
          'id': '5_12',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 24, 10, 58),
          'end': Date.UTC(2008, 1, 26, 10, 4)
        },
        {
          'id': '5_13',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 26, 10, 4),
          'end': Date.UTC(2008, 1, 28, 11, 59)
        },
        {
          'id': '5_14',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 28, 11, 59),
          'end': Date.UTC(2008, 1, 29, 1, 3)
        },
        {
          'id': '5_15',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 29, 1, 3),
          'end': Date.UTC(2008, 2, 3, 20, 54)
        },
        {
          'id': '5_16',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 3, 20, 54),
          'end': Date.UTC(2008, 2, 4, 15, 26)
        },
        {
          'id': '5_17',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 4, 15, 26),
          'end': Date.UTC(2008, 2, 5, 10, 15)
        },
        {
          'id': '5_18',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 5, 10, 15),
          'end': Date.UTC(2008, 2, 6, 15, 41)
        },
        {
          'id': '5_19',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 6, 15, 41),
          'end': Date.UTC(2008, 2, 8, 18, 59)
        },
        {
          'id': '5_20',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 8, 18, 59),
          'end': Date.UTC(2008, 2, 10, 0, 10)
        },
        {
          'id': '5_21',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 10, 0, 10),
          'end': Date.UTC(2008, 2, 10, 13, 6)
        },
        {
          'id': '5_22',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 10, 13, 6),
          'end': Date.UTC(2008, 2, 11, 3, 8)
        },
        {
          'id': '5_23',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 11, 3, 8),
          'end': Date.UTC(2008, 2, 13, 0, 13)
        },
        {
          'id': '5_24',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 13, 0, 13),
          'end': Date.UTC(2008, 2, 13, 13, 39)
        },
        {
          'id': '5_25',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 13, 13, 39),
          'end': Date.UTC(2008, 2, 14, 22, 21)
        },
        {
          'id': '5_26',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 14, 22, 21),
          'end': Date.UTC(2008, 2, 15, 8, 35)
        },
        {
          'id': '5_27',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 15, 8, 35),
          'end': Date.UTC(2008, 2, 17, 20, 35)
        },
        {
          'id': '5_28',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 17, 20, 35),
          'end': Date.UTC(2008, 2, 19, 23, 59)
        },
        {
          'id': '5_29',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 19, 23, 59),
          'end': Date.UTC(2008, 2, 20, 11, 47)
        },
        {
          'id': '5_30',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 20, 11, 47),
          'end': Date.UTC(2008, 2, 21, 19, 23)
        },
        {
          'id': '5_31',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 21, 19, 23),
          'end': Date.UTC(2008, 2, 22, 11, 44)
        },
        {
          'id': '5_32',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 22, 11, 44),
          'end': Date.UTC(2008, 2, 23, 9, 50)
        },
        {
          'id': '5_33',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 23, 9, 50),
          'end': Date.UTC(2008, 2, 24, 2, 44)
        },
        {
          'id': '5_34',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 24, 2, 44),
          'end': Date.UTC(2008, 2, 24, 22, 2)
        },
        {
          'id': '5_35',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 24, 22, 2),
          'end': Date.UTC(2008, 2, 26, 9, 54)
        },
        {
          'id': '5_36',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 26, 9, 54),
          'end': Date.UTC(2008, 2, 29, 7, 23)
        },
        {
          'id': '5_37',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 29, 7, 23),
          'end': Date.UTC(2008, 2, 31, 2, 28)
        },
        {
          'id': '5_38',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 31, 2, 28),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '5online',
      'name': 'Online',
      'online': '68%',
      'parent': '5',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '5_1online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 8, 47),
          'connectTo': '5_2offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '5_3online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 2, 3, 37),
          'end': Date.UTC(2008, 1, 6, 11, 46),
          'connectTo': '5_4maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_5online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 3, 3),
          'end': Date.UTC(2008, 1, 9, 16, 56),
          'connectTo': '5_6offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '5_7online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 10, 7, 1),
          'end': Date.UTC(2008, 1, 20, 3, 30),
          'connectTo': '5_8maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_9online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 20, 23, 21),
          'end': Date.UTC(2008, 1, 21, 13, 13),
          'connectTo': '5_10maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_11online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 22, 2, 45),
          'end': Date.UTC(2008, 1, 24, 10, 58),
          'connectTo': '5_12maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_13online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 26, 10, 4),
          'end': Date.UTC(2008, 1, 28, 11, 59),
          'connectTo': '5_14maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_15online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 29, 1, 3),
          'end': Date.UTC(2008, 2, 3, 20, 54),
          'connectTo': '5_16maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_17online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 4, 15, 26),
          'end': Date.UTC(2008, 2, 5, 10, 15),
          'connectTo': '5_18maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_19online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 6, 15, 41),
          'end': Date.UTC(2008, 2, 8, 18, 59),
          'connectTo': '5_20maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_21online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 10, 0, 10),
          'end': Date.UTC(2008, 2, 10, 13, 6),
          'connectTo': '5_22offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '5_23online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 11, 3, 8),
          'end': Date.UTC(2008, 2, 13, 0, 13),
          'connectTo': '5_24offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '5_25online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 13, 13, 39),
          'end': Date.UTC(2008, 2, 14, 22, 21),
          'connectTo': '5_26offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '5_27online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 15, 8, 35),
          'end': Date.UTC(2008, 2, 17, 20, 35),
          'connectTo': '5_28maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_29online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 19, 23, 59),
          'end': Date.UTC(2008, 2, 20, 11, 47),
          'connectTo': '5_30maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_31online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 21, 19, 23),
          'end': Date.UTC(2008, 2, 22, 11, 44),
          'connectTo': '5_32maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_33online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 23, 9, 50),
          'end': Date.UTC(2008, 2, 24, 2, 44),
          'connectTo': '5_34offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '5_36online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 26, 9, 54),
          'end': Date.UTC(2008, 2, 29, 7, 23),
          'connectTo': '5_37maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '5_38online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 31, 2, 28),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '5maintenance',
      'name': 'Maintenance',
      'maintenance': '26%',
      'parent': '5',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '5_4maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 6, 11, 46),
          'end': Date.UTC(2008, 1, 7, 3, 3),
          'connectTo': '5_5online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_8maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 20, 3, 30),
          'end': Date.UTC(2008, 1, 20, 23, 21),
          'connectTo': '5_9online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_10maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 21, 13, 13),
          'end': Date.UTC(2008, 1, 22, 2, 45),
          'connectTo': '5_11online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_12maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 24, 10, 58),
          'end': Date.UTC(2008, 1, 26, 10, 4),
          'connectTo': '5_13online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_14maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 28, 11, 59),
          'end': Date.UTC(2008, 1, 29, 1, 3),
          'connectTo': '5_15online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_16maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 3, 20, 54),
          'end': Date.UTC(2008, 2, 4, 15, 26),
          'connectTo': '5_17online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_18maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 5, 10, 15),
          'end': Date.UTC(2008, 2, 6, 15, 41),
          'connectTo': '5_19online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_20maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 8, 18, 59),
          'end': Date.UTC(2008, 2, 10, 0, 10),
          'connectTo': '5_21online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_28maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 17, 20, 35),
          'end': Date.UTC(2008, 2, 19, 23, 59),
          'connectTo': '5_29online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_30maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 20, 11, 47),
          'end': Date.UTC(2008, 2, 21, 19, 23),
          'connectTo': '5_31online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_32maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 22, 11, 44),
          'end': Date.UTC(2008, 2, 23, 9, 50),
          'connectTo': '5_33online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_35maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 24, 22, 2),
          'end': Date.UTC(2008, 2, 26, 9, 54),
          'connectTo': '5_36online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_37maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 29, 7, 23),
          'end': Date.UTC(2008, 2, 31, 2, 28),
          'connectTo': '5_38online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '5offline',
      'name': 'Offline',
      'offline': '6%',
      'parent': '5',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '5_2offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 1, 8, 47),
          'end': Date.UTC(2008, 1, 2, 3, 37),
          'connectTo': '5_3online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_6offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 9, 16, 56),
          'end': Date.UTC(2008, 1, 10, 7, 1),
          'connectTo': '5_7online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_22offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 10, 13, 6),
          'end': Date.UTC(2008, 2, 11, 3, 8),
          'connectTo': '5_23online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_24offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 13, 0, 13),
          'end': Date.UTC(2008, 2, 13, 13, 39),
          'connectTo': '5_25online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_26offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 14, 22, 21),
          'end': Date.UTC(2008, 2, 15, 8, 35),
          'connectTo': '5_27online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '5_34offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 24, 2, 44),
          'end': Date.UTC(2008, 2, 24, 22, 2),
          'connectTo': '5_35maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        }
      ]
    },
    {
      'id': '6',
      'name': 'RA Server',
      'offline': '10%',
      'maintenance': '16%',
      'online': '74%',
      'rowHeight': 22,
      'collapsed': true,
      'periods': [
        {
          'id': '6_1',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 21, 42)
        },
        {
          'id': '6_2',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 1, 21, 42),
          'end': Date.UTC(2008, 1, 2, 15, 21)
        },
        {
          'id': '6_3',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 2, 15, 21),
          'end': Date.UTC(2008, 1, 4, 21, 56)
        },
        {
          'id': '6_4',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 4, 21, 56),
          'end': Date.UTC(2008, 1, 7, 6, 5)
        },
        {
          'id': '6_5',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 6, 5),
          'end': Date.UTC(2008, 1, 8, 5, 34)
        },
        {
          'id': '6_6',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 8, 5, 34),
          'end': Date.UTC(2008, 1, 8, 22, 57)
        },
        {
          'id': '6_7',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 8, 22, 57),
          'end': Date.UTC(2008, 1, 10, 6, 11)
        },
        {
          'id': '6_8',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 10, 6, 11),
          'end': Date.UTC(2008, 1, 10, 17, 53)
        },
        {
          'id': '6_9',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 10, 17, 53),
          'end': Date.UTC(2008, 1, 11, 17, 52)
        },
        {
          'id': '6_10',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 11, 17, 52),
          'end': Date.UTC(2008, 1, 12, 14, 9)
        },
        {
          'id': '6_11',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 12, 14, 9),
          'end': Date.UTC(2008, 1, 17, 7, 50)
        },
        {
          'id': '6_12',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 17, 7, 50),
          'end': Date.UTC(2008, 1, 18, 7, 15)
        },
        {
          'id': '6_13',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 18, 7, 15),
          'end': Date.UTC(2008, 1, 19, 3, 5)
        },
        {
          'id': '6_14',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 19, 3, 5),
          'end': Date.UTC(2008, 1, 20, 16, 18)
        },
        {
          'id': '6_15',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 20, 16, 18),
          'end': Date.UTC(2008, 1, 21, 3, 2)
        },
        {
          'id': '6_16',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 21, 3, 2),
          'end': Date.UTC(2008, 1, 24, 22, 28)
        },
        {
          'id': '6_17',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 24, 22, 28),
          'end': Date.UTC(2008, 1, 25, 13, 51)
        },
        {
          'id': '6_18',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 25, 13, 51),
          'end': Date.UTC(2008, 1, 26, 23, 4)
        },
        {
          'id': '6_19',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 26, 23, 4),
          'end': Date.UTC(2008, 1, 27, 19, 5)
        },
        {
          'id': '6_20',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 27, 19, 5),
          'end': Date.UTC(2008, 1, 28, 15, 37)
        },
        {
          'id': '6_21',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 28, 15, 37),
          'end': Date.UTC(2008, 2, 6, 3, 49)
        },
        {
          'id': '6_22',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 6, 3, 49),
          'end': Date.UTC(2008, 2, 6, 22, 6)
        },
        {
          'id': '6_23',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 6, 22, 6),
          'end': Date.UTC(2008, 2, 7, 20, 13)
        },
        {
          'id': '6_24',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 7, 20, 13),
          'end': Date.UTC(2008, 2, 8, 15, 52)
        },
        {
          'id': '6_25',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 8, 15, 52),
          'end': Date.UTC(2008, 2, 11, 23, 16)
        },
        {
          'id': '6_26',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 11, 23, 16),
          'end': Date.UTC(2008, 2, 12, 17, 30)
        },
        {
          'id': '6_27',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 12, 17, 30),
          'end': Date.UTC(2008, 2, 21, 7, 38)
        },
        {
          'id': '6_28',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 21, 7, 38),
          'end': Date.UTC(2008, 2, 22, 5, 44)
        },
        {
          'id': '6_29',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 22, 5, 44),
          'end': Date.UTC(2008, 2, 22, 23, 48)
        },
        {
          'id': '6_30',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 22, 23, 48),
          'end': Date.UTC(2008, 2, 24, 11, 30)
        },
        {
          'id': '6_31',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 24, 11, 30),
          'end': Date.UTC(2008, 2, 25, 5, 32)
        },
        {
          'id': '6_32',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 25, 5, 32),
          'end': Date.UTC(2008, 2, 25, 17, 13)
        },
        {
          'id': '6_33',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 25, 17, 13),
          'end': Date.UTC(2008, 2, 26, 9, 4)
        },
        {
          'id': '6_34',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 26, 9, 4),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '6online',
      'name': 'Online',
      'online': '74%',
      'parent': '6',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '6_1online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 21, 42),
          'connectTo': '6_2offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '6_3online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 2, 15, 21),
          'end': Date.UTC(2008, 1, 4, 21, 56),
          'connectTo': '6_4maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_5online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 6, 5),
          'end': Date.UTC(2008, 1, 8, 5, 34),
          'connectTo': '6_6maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_7online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 8, 22, 57),
          'end': Date.UTC(2008, 1, 10, 6, 11),
          'connectTo': '6_8maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_9online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 10, 17, 53),
          'end': Date.UTC(2008, 1, 11, 17, 52),
          'connectTo': '6_10maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_11online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 12, 14, 9),
          'end': Date.UTC(2008, 1, 17, 7, 50),
          'connectTo': '6_12offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '6_14online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 19, 3, 5),
          'end': Date.UTC(2008, 1, 20, 16, 18),
          'connectTo': '6_15maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_16online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 21, 3, 2),
          'end': Date.UTC(2008, 1, 24, 22, 28),
          'connectTo': '6_17offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '6_18online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 25, 13, 51),
          'end': Date.UTC(2008, 1, 26, 23, 4),
          'connectTo': '6_19maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_21online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 28, 15, 37),
          'end': Date.UTC(2008, 2, 6, 3, 49),
          'connectTo': '6_22offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '6_23online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 6, 22, 6),
          'end': Date.UTC(2008, 2, 7, 20, 13),
          'connectTo': '6_24maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_25online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 8, 15, 52),
          'end': Date.UTC(2008, 2, 11, 23, 16),
          'connectTo': '6_26maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_27online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 12, 17, 30),
          'end': Date.UTC(2008, 2, 21, 7, 38),
          'connectTo': '6_28maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_29online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 22, 5, 44),
          'end': Date.UTC(2008, 2, 22, 23, 48),
          'connectTo': '6_30offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '6_32online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 25, 5, 32),
          'end': Date.UTC(2008, 2, 25, 17, 13),
          'connectTo': '6_33offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '6_34online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 26, 9, 4),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '6maintenance',
      'name': 'Maintenance',
      'maintenance': '16%',
      'parent': '6',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '6_4maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 4, 21, 56),
          'end': Date.UTC(2008, 1, 7, 6, 5),
          'connectTo': '6_5online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_6maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 8, 5, 34),
          'end': Date.UTC(2008, 1, 8, 22, 57),
          'connectTo': '6_7online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_8maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 10, 6, 11),
          'end': Date.UTC(2008, 1, 10, 17, 53),
          'connectTo': '6_9online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_10maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 11, 17, 52),
          'end': Date.UTC(2008, 1, 12, 14, 9),
          'connectTo': '6_11online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_13maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 18, 7, 15),
          'end': Date.UTC(2008, 1, 19, 3, 5),
          'connectTo': '6_14online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_15maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 20, 16, 18),
          'end': Date.UTC(2008, 1, 21, 3, 2),
          'connectTo': '6_16online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_19maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 26, 23, 4),
          'end': Date.UTC(2008, 1, 27, 19, 5),
          'connectTo': '6_20offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '6_24maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 7, 20, 13),
          'end': Date.UTC(2008, 2, 8, 15, 52),
          'connectTo': '6_25online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_26maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 11, 23, 16),
          'end': Date.UTC(2008, 2, 12, 17, 30),
          'connectTo': '6_27online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_28maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 21, 7, 38),
          'end': Date.UTC(2008, 2, 22, 5, 44),
          'connectTo': '6_29online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_31maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 24, 11, 30),
          'end': Date.UTC(2008, 2, 25, 5, 32),
          'connectTo': '6_32online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '6offline',
      'name': 'Offline',
      'offline': '10%',
      'parent': '6',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '6_2offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 1, 21, 42),
          'end': Date.UTC(2008, 1, 2, 15, 21),
          'connectTo': '6_3online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_12offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 17, 7, 50),
          'end': Date.UTC(2008, 1, 18, 7, 15),
          'connectTo': '6_13maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_17offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 24, 22, 28),
          'end': Date.UTC(2008, 1, 25, 13, 51),
          'connectTo': '6_18online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_20offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 27, 19, 5),
          'end': Date.UTC(2008, 1, 28, 15, 37),
          'connectTo': '6_21online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_22offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 6, 3, 49),
          'end': Date.UTC(2008, 2, 6, 22, 6),
          'connectTo': '6_23online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '6_30offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 22, 23, 48),
          'end': Date.UTC(2008, 2, 24, 11, 30),
          'connectTo': '6_31maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '6_33offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 25, 17, 13),
          'end': Date.UTC(2008, 2, 26, 9, 4),
          'connectTo': '6_34online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '7',
      'name': 'Backup Server',
      'offline': '9%',
      'maintenance': '13%',
      'online': '78%',
      'rowHeight': 22,
      'collapsed': true,
      'periods': [
        {
          'id': '7_1',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 10, 19)
        },
        {
          'id': '7_2',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 1, 10, 19),
          'end': Date.UTC(2008, 1, 2, 8, 40)
        },
        {
          'id': '7_3',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 2, 8, 40),
          'end': Date.UTC(2008, 1, 3, 18, 11)
        },
        {
          'id': '7_4',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 3, 18, 11),
          'end': Date.UTC(2008, 1, 4, 13, 56)
        },
        {
          'id': '7_5',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 4, 13, 56),
          'end': Date.UTC(2008, 1, 5, 9, 17)
        },
        {
          'id': '7_6',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 5, 9, 17),
          'end': Date.UTC(2008, 1, 6, 23, 38)
        },
        {
          'id': '7_7',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 6, 23, 38),
          'end': Date.UTC(2008, 1, 9, 9, 43)
        },
        {
          'id': '7_8',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 9, 9, 43),
          'end': Date.UTC(2008, 1, 9, 21, 56)
        },
        {
          'id': '7_9',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 9, 21, 56),
          'end': Date.UTC(2008, 1, 12, 10, 47)
        },
        {
          'id': '7_10',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 12, 10, 47),
          'end': Date.UTC(2008, 1, 13, 10, 32)
        },
        {
          'id': '7_11',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 13, 10, 32),
          'end': Date.UTC(2008, 1, 14, 2, 41)
        },
        {
          'id': '7_12',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 14, 2, 41),
          'end': Date.UTC(2008, 1, 15, 4, 53)
        },
        {
          'id': '7_13',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 15, 4, 53),
          'end': Date.UTC(2008, 1, 19, 19, 22)
        },
        {
          'id': '7_14',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 19, 19, 22),
          'end': Date.UTC(2008, 1, 20, 10, 45)
        },
        {
          'id': '7_15',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 20, 10, 45),
          'end': Date.UTC(2008, 1, 23, 22, 30)
        },
        {
          'id': '7_16',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 23, 22, 30),
          'end': Date.UTC(2008, 1, 24, 9, 22)
        },
        {
          'id': '7_17',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 24, 9, 22),
          'end': Date.UTC(2008, 1, 25, 8, 21)
        },
        {
          'id': '7_18',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 25, 8, 21),
          'end': Date.UTC(2008, 1, 26, 3, 23)
        },
        {
          'id': '7_19',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 26, 3, 23),
          'end': Date.UTC(2008, 1, 26, 21, 55)
        },
        {
          'id': '7_20',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 26, 21, 55),
          'end': Date.UTC(2008, 1, 27, 7, 58)
        },
        {
          'id': '7_21',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 27, 7, 58),
          'end': Date.UTC(2008, 1, 28, 1, 22)
        },
        {
          'id': '7_22',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 28, 1, 22),
          'end': Date.UTC(2008, 2, 18, 15, 28)
        },
        {
          'id': '7_23',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 18, 15, 28),
          'end': Date.UTC(2008, 2, 19, 13, 19)
        },
        {
          'id': '7_24',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 19, 13, 19),
          'end': Date.UTC(2008, 2, 20, 7, 45)
        },
        {
          'id': '7_25',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 20, 7, 45),
          'end': Date.UTC(2008, 2, 25, 2, 38)
        },
        {
          'id': '7_26',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 25, 2, 38),
          'end': Date.UTC(2008, 2, 26, 1, 43)
        },
        {
          'id': '7_27',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 26, 1, 43),
          'end': Date.UTC(2008, 2, 28, 8, 26)
        },
        {
          'id': '7_28',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 28, 8, 26),
          'end': Date.UTC(2008, 2, 28, 19, 15)
        },
        {
          'id': '7_29',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 28, 19, 15),
          'end': Date.UTC(2008, 2, 29, 9, 39)
        },
        {
          'id': '7_30',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 29, 9, 39),
          'end': Date.UTC(2008, 2, 30, 1, 14)
        },
        {
          'id': '7_31',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 30, 1, 14),
          'end': Date.UTC(2008, 2, 31, 0, 17)
        },
        {
          'id': '7_32',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 31, 0, 17),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '7online',
      'name': 'Online',
      'online': '78%',
      'parent': '7',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '7_1online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 10, 19),
          'connectTo': '7_2maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_3online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 2, 8, 40),
          'end': Date.UTC(2008, 1, 3, 18, 11),
          'connectTo': '7_4offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '7_5online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 4, 13, 56),
          'end': Date.UTC(2008, 1, 5, 9, 17),
          'connectTo': '7_6offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '7_7online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 6, 23, 38),
          'end': Date.UTC(2008, 1, 9, 9, 43),
          'connectTo': '7_8offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '7_9online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 9, 21, 56),
          'end': Date.UTC(2008, 1, 12, 10, 47),
          'connectTo': '7_10maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_11online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 13, 10, 32),
          'end': Date.UTC(2008, 1, 14, 2, 41),
          'connectTo': '7_12maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_13online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 15, 4, 53),
          'end': Date.UTC(2008, 1, 19, 19, 22),
          'connectTo': '7_14offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '7_15online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 20, 10, 45),
          'end': Date.UTC(2008, 1, 23, 22, 30),
          'connectTo': '7_16maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_17online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 24, 9, 22),
          'end': Date.UTC(2008, 1, 25, 8, 21),
          'connectTo': '7_18maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_19online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 26, 3, 23),
          'end': Date.UTC(2008, 1, 26, 21, 55),
          'connectTo': '7_20offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '7_22online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 28, 1, 22),
          'end': Date.UTC(2008, 2, 18, 15, 28),
          'connectTo': '7_23maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_25online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 20, 7, 45),
          'end': Date.UTC(2008, 2, 25, 2, 38),
          'connectTo': '7_26maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_27online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 26, 1, 43),
          'end': Date.UTC(2008, 2, 28, 8, 26),
          'connectTo': '7_28maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_29online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 28, 19, 15),
          'end': Date.UTC(2008, 2, 29, 9, 39),
          'connectTo': '7_30maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_31online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 30, 1, 14),
          'end': Date.UTC(2008, 2, 31, 0, 17),
          'connectTo': '7_32offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        }
      ]
    },
    {
      'id': '7maintenance',
      'name': 'Maintenance',
      'maintenance': '13%',
      'parent': '7',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '7_2maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 1, 10, 19),
          'end': Date.UTC(2008, 1, 2, 8, 40),
          'connectTo': '7_3online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_10maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 12, 10, 47),
          'end': Date.UTC(2008, 1, 13, 10, 32),
          'connectTo': '7_11online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_12maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 14, 2, 41),
          'end': Date.UTC(2008, 1, 15, 4, 53),
          'connectTo': '7_13online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_16maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 23, 22, 30),
          'end': Date.UTC(2008, 1, 24, 9, 22),
          'connectTo': '7_17online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_18maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 25, 8, 21),
          'end': Date.UTC(2008, 1, 26, 3, 23),
          'connectTo': '7_19online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_21maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 27, 7, 58),
          'end': Date.UTC(2008, 1, 28, 1, 22),
          'connectTo': '7_22online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_23maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 18, 15, 28),
          'end': Date.UTC(2008, 2, 19, 13, 19),
          'connectTo': '7_24offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '7_26maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 25, 2, 38),
          'end': Date.UTC(2008, 2, 26, 1, 43),
          'connectTo': '7_27online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_28maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 28, 8, 26),
          'end': Date.UTC(2008, 2, 28, 19, 15),
          'connectTo': '7_29online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_30maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 29, 9, 39),
          'end': Date.UTC(2008, 2, 30, 1, 14),
          'connectTo': '7_31online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '7offline',
      'name': 'Offline',
      'offline': '9%',
      'parent': '7',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '7_4offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 3, 18, 11),
          'end': Date.UTC(2008, 1, 4, 13, 56),
          'connectTo': '7_5online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_6offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 5, 9, 17),
          'end': Date.UTC(2008, 1, 6, 23, 38),
          'connectTo': '7_7online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_8offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 9, 9, 43),
          'end': Date.UTC(2008, 1, 9, 21, 56),
          'connectTo': '7_9online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_14offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 19, 19, 22),
          'end': Date.UTC(2008, 1, 20, 10, 45),
          'connectTo': '7_15online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_20offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 26, 21, 55),
          'end': Date.UTC(2008, 1, 27, 7, 58),
          'connectTo': '7_21maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '7_24offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 19, 13, 19),
          'end': Date.UTC(2008, 2, 20, 7, 45),
          'connectTo': '7_25online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '7_32offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 31, 0, 17),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '8',
      'name': 'Cloud Server',
      'offline': '14%',
      'maintenance': '13%',
      'online': '73%',
      'rowHeight': 22,
      'collapsed': false,
      'periods': [
        {
          'id': '8_1',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 12, 42)
        },
        {
          'id': '8_2',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 1, 12, 42),
          'end': Date.UTC(2008, 1, 2, 19, 7)
        },
        {
          'id': '8_3',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 2, 19, 7),
          'end': Date.UTC(2008, 1, 4, 21, 49)
        },
        {
          'id': '8_4',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 4, 21, 49),
          'end': Date.UTC(2008, 1, 5, 12, 58)
        },
        {
          'id': '8_5',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 5, 12, 58),
          'end': Date.UTC(2008, 1, 6, 9, 24)
        },
        {
          'id': '8_6',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 6, 9, 24),
          'end': Date.UTC(2008, 1, 7, 1, 14)
        },
        {
          'id': '8_7',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 7, 1, 14),
          'end': Date.UTC(2008, 1, 7, 15, 37)
        },
        {
          'id': '8_8',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 15, 37),
          'end': Date.UTC(2008, 1, 8, 3, 52)
        },
        {
          'id': '8_9',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 8, 3, 52),
          'end': Date.UTC(2008, 1, 11, 9, 0)
        },
        {
          'id': '8_10',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 11, 9, 0),
          'end': Date.UTC(2008, 1, 25, 0, 7)
        },
        {
          'id': '8_11',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 25, 0, 7),
          'end': Date.UTC(2008, 1, 25, 23, 47)
        },
        {
          'id': '8_12',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 25, 23, 47),
          'end': Date.UTC(2008, 1, 26, 11, 29)
        },
        {
          'id': '8_13',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 26, 11, 29),
          'end': Date.UTC(2008, 1, 27, 4, 53)
        },
        {
          'id': '8_14',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 27, 4, 53),
          'end': Date.UTC(2008, 1, 28, 16, 37)
        },
        {
          'id': '8_15',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 28, 16, 37),
          'end': Date.UTC(2008, 1, 29, 6, 33)
        },
        {
          'id': '8_16',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 29, 6, 33),
          'end': Date.UTC(2008, 2, 4, 23, 6)
        },
        {
          'id': '8_17',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 4, 23, 6),
          'end': Date.UTC(2008, 2, 5, 18, 12)
        },
        {
          'id': '8_18',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 5, 18, 12),
          'end': Date.UTC(2008, 2, 7, 5, 7)
        },
        {
          'id': '8_19',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 7, 5, 7),
          'end': Date.UTC(2008, 2, 8, 3, 8)
        },
        {
          'id': '8_20',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 8, 3, 8),
          'end': Date.UTC(2008, 2, 9, 17, 32)
        },
        {
          'id': '8_21',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 9, 17, 32),
          'end': Date.UTC(2008, 2, 10, 15, 14)
        },
        {
          'id': '8_22',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 10, 15, 14),
          'end': Date.UTC(2008, 2, 11, 10, 0)
        },
        {
          'id': '8_23',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 11, 10, 0),
          'end': Date.UTC(2008, 2, 13, 17, 0)
        },
        {
          'id': '8_24',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 13, 17, 0),
          'end': Date.UTC(2008, 2, 14, 10, 41)
        },
        {
          'id': '8_25',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 14, 10, 41),
          'end': Date.UTC(2008, 2, 14, 21, 26)
        },
        {
          'id': '8_26',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 14, 21, 26),
          'end': Date.UTC(2008, 2, 19, 19, 11)
        },
        {
          'id': '8_27',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 19, 19, 11),
          'end': Date.UTC(2008, 2, 20, 7, 54)
        },
        {
          'id': '8_28',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 20, 7, 54),
          'end': Date.UTC(2008, 2, 22, 14, 21)
        },
        {
          'id': '8_29',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 22, 14, 21),
          'end': Date.UTC(2008, 2, 23, 2, 21)
        },
        {
          'id': '8_30',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 23, 2, 21),
          'end': Date.UTC(2008, 2, 25, 11, 7)
        },
        {
          'id': '8_31',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 25, 11, 7),
          'end': Date.UTC(2008, 2, 26, 7, 57)
        },
        {
          'id': '8_32',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 26, 7, 57),
          'end': Date.UTC(2008, 2, 27, 7, 51)
        },
        {
          'id': '8_33',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 27, 7, 51),
          'end': Date.UTC(2008, 2, 27, 22, 43)
        },
        {
          'id': '8_34',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 27, 22, 43),
          'end': Date.UTC(2008, 2, 31, 8, 33)
        },
        {
          'id': '8_35',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 31, 8, 33),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '8online',
      'name': 'Online',
      'online': '73%',
      'parent': '8',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '8_1online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 12, 42),
          'connectTo': '8_2offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_3online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 2, 19, 7),
          'end': Date.UTC(2008, 1, 4, 21, 49),
          'connectTo': '8_4offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_6online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 6, 9, 24),
          'end': Date.UTC(2008, 1, 7, 1, 14),
          'connectTo': '8_7offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_8online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 15, 37),
          'end': Date.UTC(2008, 1, 8, 3, 52),
          'connectTo': '8_9offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_10online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 11, 9, 0),
          'end': Date.UTC(2008, 1, 25, 0, 7),
          'connectTo': '8_11maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_12online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 25, 23, 47),
          'end': Date.UTC(2008, 1, 26, 11, 29),
          'connectTo': '8_13maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_14online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 27, 4, 53),
          'end': Date.UTC(2008, 1, 28, 16, 37),
          'connectTo': '8_15maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_16online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 29, 6, 33),
          'end': Date.UTC(2008, 2, 4, 23, 6),
          'connectTo': '8_17maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_18online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 5, 18, 12),
          'end': Date.UTC(2008, 2, 7, 5, 7),
          'connectTo': '8_19offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_20online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 8, 3, 8),
          'end': Date.UTC(2008, 2, 9, 17, 32),
          'connectTo': '8_21offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_23online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 11, 10, 0),
          'end': Date.UTC(2008, 2, 13, 17, 0),
          'connectTo': '8_24maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_26online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 14, 21, 26),
          'end': Date.UTC(2008, 2, 19, 19, 11),
          'connectTo': '8_27offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_28online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 20, 7, 54),
          'end': Date.UTC(2008, 2, 22, 14, 21),
          'connectTo': '8_29maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_30online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 23, 2, 21),
          'end': Date.UTC(2008, 2, 25, 11, 7),
          'connectTo': '8_31maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_32online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 26, 7, 57),
          'end': Date.UTC(2008, 2, 27, 7, 51),
          'connectTo': '8_33maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_34online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 27, 22, 43),
          'end': Date.UTC(2008, 2, 31, 8, 33),
          'connectTo': '8_35maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        }
      ]
    },
    {
      'id': '8maintenance',
      'name': 'Maintenance',
      'maintenance': '13%',
      'parent': '8',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '8_5maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 5, 12, 58),
          'end': Date.UTC(2008, 1, 6, 9, 24),
          'connectTo': '8_6online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_11maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 25, 0, 7),
          'end': Date.UTC(2008, 1, 25, 23, 47),
          'connectTo': '8_12online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_13maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 26, 11, 29),
          'end': Date.UTC(2008, 1, 27, 4, 53),
          'connectTo': '8_14online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_15maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 28, 16, 37),
          'end': Date.UTC(2008, 1, 29, 6, 33),
          'connectTo': '8_16online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_17maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 4, 23, 6),
          'end': Date.UTC(2008, 2, 5, 18, 12),
          'connectTo': '8_18online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_22maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 10, 15, 14),
          'end': Date.UTC(2008, 2, 11, 10, 0),
          'connectTo': '8_23online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_24maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 13, 17, 0),
          'end': Date.UTC(2008, 2, 14, 10, 41),
          'connectTo': '8_25offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '8_29maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 22, 14, 21),
          'end': Date.UTC(2008, 2, 23, 2, 21),
          'connectTo': '8_30online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_31maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 25, 11, 7),
          'end': Date.UTC(2008, 2, 26, 7, 57),
          'connectTo': '8_32online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_33maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 27, 7, 51),
          'end': Date.UTC(2008, 2, 27, 22, 43),
          'connectTo': '8_34online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_35maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 31, 8, 33),
          'end': Date.UTC(2008, 2, 31, 14, 59)
        }
      ]
    },
    {
      'id': '8offline',
      'name': 'Offline',
      'offline': '14%',
      'parent': '8',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '8_2offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 1, 12, 42),
          'end': Date.UTC(2008, 1, 2, 19, 7),
          'connectTo': '8_3online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_4offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 4, 21, 49),
          'end': Date.UTC(2008, 1, 5, 12, 58),
          'connectTo': '8_5maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_7offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 7, 1, 14),
          'end': Date.UTC(2008, 1, 7, 15, 37),
          'connectTo': '8_8online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_9offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 8, 3, 52),
          'end': Date.UTC(2008, 1, 11, 9, 0),
          'connectTo': '8_10online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_19offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 7, 5, 7),
          'end': Date.UTC(2008, 2, 8, 3, 8),
          'connectTo': '8_20online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_21offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 9, 17, 32),
          'end': Date.UTC(2008, 2, 10, 15, 14),
          'connectTo': '8_22maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '8_25offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 14, 10, 41),
          'end': Date.UTC(2008, 2, 14, 21, 26),
          'connectTo': '8_26online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '8_27offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 19, 19, 11),
          'end': Date.UTC(2008, 2, 20, 7, 54),
          'connectTo': '8_28online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '9',
      'name': 'Build Server',
      'offline': '10%',
      'maintenance': '23%',
      'online': '67%',
      'rowHeight': 22,
      'collapsed': true,
      'periods': [
        {
          'id': '9_1',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 5, 47)
        },
        {
          'id': '9_2',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 1, 5, 47),
          'end': Date.UTC(2008, 1, 1, 18, 48)
        },
        {
          'id': '9_3',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 1, 18, 48),
          'end': Date.UTC(2008, 1, 2, 5, 39)
        },
        {
          'id': '9_4',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 2, 5, 39),
          'end': Date.UTC(2008, 1, 2, 16, 17)
        },
        {
          'id': '9_5',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 2, 16, 17),
          'end': Date.UTC(2008, 1, 3, 23, 11)
        },
        {
          'id': '9_6',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 3, 23, 11),
          'end': Date.UTC(2008, 1, 5, 9, 15)
        },
        {
          'id': '9_7',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 5, 9, 15),
          'end': Date.UTC(2008, 1, 6, 5, 31)
        },
        {
          'id': '9_8',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 6, 5, 31),
          'end': Date.UTC(2008, 1, 7, 0, 14)
        },
        {
          'id': '9_9',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 7, 0, 14),
          'end': Date.UTC(2008, 1, 7, 16, 2)
        },
        {
          'id': '9_10',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 16, 2),
          'end': Date.UTC(2008, 1, 8, 10, 50)
        },
        {
          'id': '9_11',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 8, 10, 50),
          'end': Date.UTC(2008, 1, 9, 5, 6)
        },
        {
          'id': '9_12',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 9, 5, 6),
          'end': Date.UTC(2008, 1, 10, 4, 7)
        },
        {
          'id': '9_13',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 10, 4, 7),
          'end': Date.UTC(2008, 1, 10, 20, 13)
        },
        {
          'id': '9_14',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 10, 20, 13),
          'end': Date.UTC(2008, 1, 13, 4, 20)
        },
        {
          'id': '9_15',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 13, 4, 20),
          'end': Date.UTC(2008, 1, 14, 13, 3)
        },
        {
          'id': '9_16',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 14, 13, 3),
          'end': Date.UTC(2008, 1, 19, 4, 48)
        },
        {
          'id': '9_17',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 19, 4, 48),
          'end': Date.UTC(2008, 1, 19, 22, 37)
        },
        {
          'id': '9_18',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 19, 22, 37),
          'end': Date.UTC(2008, 1, 20, 18, 45)
        },
        {
          'id': '9_19',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 20, 18, 45),
          'end': Date.UTC(2008, 1, 22, 2, 7)
        },
        {
          'id': '9_20',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 22, 2, 7),
          'end': Date.UTC(2008, 1, 22, 21, 40)
        },
        {
          'id': '9_21',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 22, 21, 40),
          'end': Date.UTC(2008, 1, 26, 16, 14)
        },
        {
          'id': '9_22',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 26, 16, 14),
          'end': Date.UTC(2008, 1, 27, 13, 22)
        },
        {
          'id': '9_23',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 27, 13, 22),
          'end': Date.UTC(2008, 2, 3, 15, 37)
        },
        {
          'id': '9_24',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 3, 15, 37),
          'end': Date.UTC(2008, 2, 4, 15, 10)
        },
        {
          'id': '9_25',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 4, 15, 10),
          'end': Date.UTC(2008, 2, 5, 8, 25)
        },
        {
          'id': '9_26',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 5, 8, 25),
          'end': Date.UTC(2008, 2, 7, 1, 50)
        },
        {
          'id': '9_27',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 7, 1, 50),
          'end': Date.UTC(2008, 2, 7, 16, 25)
        },
        {
          'id': '9_28',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 7, 16, 25),
          'end': Date.UTC(2008, 2, 10, 2, 3)
        },
        {
          'id': '9_29',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 10, 2, 3),
          'end': Date.UTC(2008, 2, 11, 13, 48)
        },
        {
          'id': '9_30',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 11, 13, 48),
          'end': Date.UTC(2008, 2, 13, 12, 8)
        },
        {
          'id': '9_31',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 13, 12, 8),
          'end': Date.UTC(2008, 2, 14, 7, 45)
        },
        {
          'id': '9_32',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 14, 7, 45),
          'end': Date.UTC(2008, 2, 16, 9, 34)
        },
        {
          'id': '9_33',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 16, 9, 34),
          'end': Date.UTC(2008, 2, 16, 22, 23)
        },
        {
          'id': '9_34',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 16, 22, 23),
          'end': Date.UTC(2008, 2, 18, 8, 2)
        },
        {
          'id': '9_35',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 18, 8, 2),
          'end': Date.UTC(2008, 2, 18, 19, 35)
        },
        {
          'id': '9_36',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 18, 19, 35),
          'end': Date.UTC(2008, 2, 19, 19, 16)
        },
        {
          'id': '9_37',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 19, 19, 16),
          'end': Date.UTC(2008, 2, 20, 7, 18)
        },
        {
          'id': '9_38',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 20, 7, 18),
          'end': Date.UTC(2008, 2, 21, 8, 3)
        },
        {
          'id': '9_39',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 21, 8, 3),
          'end': Date.UTC(2008, 2, 23, 21, 19)
        },
        {
          'id': '9_40',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 23, 21, 19),
          'end': Date.UTC(2008, 2, 24, 10, 49)
        },
        {
          'id': '9_41',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 24, 10, 49),
          'end': Date.UTC(2008, 2, 27, 4, 43)
        },
        {
          'id': '9_42',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 27, 4, 43),
          'end': Date.UTC(2008, 2, 27, 19, 23)
        },
        {
          'id': '9_43',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 27, 19, 23),
          'end': Date.UTC(2008, 2, 28, 14, 41)
        },
        {
          'id': '9_44',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 28, 14, 41),
          'end': Date.UTC(2008, 2, 29, 8, 5)
        },
        {
          'id': '9_45',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 29, 8, 5),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '9online',
      'name': 'Online',
      'online': '67%',
      'parent': '9',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '9_2online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 1, 5, 47),
          'end': Date.UTC(2008, 1, 1, 18, 48),
          'connectTo': '9_3maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_4online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 2, 5, 39),
          'end': Date.UTC(2008, 1, 2, 16, 17),
          'connectTo': '9_5maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_6online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 3, 23, 11),
          'end': Date.UTC(2008, 1, 5, 9, 15),
          'connectTo': '9_7offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '9_10online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 16, 2),
          'end': Date.UTC(2008, 1, 8, 10, 50),
          'connectTo': '9_11offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '9_12online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 9, 5, 6),
          'end': Date.UTC(2008, 1, 10, 4, 7),
          'connectTo': '9_13maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_14online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 10, 20, 13),
          'end': Date.UTC(2008, 1, 13, 4, 20),
          'connectTo': '9_15offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '9_16online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 14, 13, 3),
          'end': Date.UTC(2008, 1, 19, 4, 48),
          'connectTo': '9_17maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_19online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 20, 18, 45),
          'end': Date.UTC(2008, 1, 22, 2, 7),
          'connectTo': '9_20maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_21online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 22, 21, 40),
          'end': Date.UTC(2008, 1, 26, 16, 14),
          'connectTo': '9_22maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_23online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 27, 13, 22),
          'end': Date.UTC(2008, 2, 3, 15, 37),
          'connectTo': '9_24maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_26online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 5, 8, 25),
          'end': Date.UTC(2008, 2, 7, 1, 50),
          'connectTo': '9_27maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_28online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 7, 16, 25),
          'end': Date.UTC(2008, 2, 10, 2, 3),
          'connectTo': '9_29maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_30online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 11, 13, 48),
          'end': Date.UTC(2008, 2, 13, 12, 8),
          'connectTo': '9_31maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_32online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 14, 7, 45),
          'end': Date.UTC(2008, 2, 16, 9, 34),
          'connectTo': '9_33maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_34online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 16, 22, 23),
          'end': Date.UTC(2008, 2, 18, 8, 2),
          'connectTo': '9_35offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '9_37online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 19, 19, 16),
          'end': Date.UTC(2008, 2, 20, 7, 18),
          'connectTo': '9_38maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_39online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 21, 8, 3),
          'end': Date.UTC(2008, 2, 23, 21, 19),
          'connectTo': '9_40maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_41online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 24, 10, 49),
          'end': Date.UTC(2008, 2, 27, 4, 43),
          'connectTo': '9_42maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_43online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 27, 19, 23),
          'end': Date.UTC(2008, 2, 28, 14, 41),
          'connectTo': '9_44maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_45online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 29, 8, 5),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '9maintenance',
      'name': 'Maintenance',
      'maintenance': '23%',
      'parent': '9',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '9_3maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 1, 18, 48),
          'end': Date.UTC(2008, 1, 2, 5, 39),
          'connectTo': '9_4online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_5maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 2, 16, 17),
          'end': Date.UTC(2008, 1, 3, 23, 11),
          'connectTo': '9_6online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_8maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 6, 5, 31),
          'end': Date.UTC(2008, 1, 7, 0, 14),
          'connectTo': '9_9offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '9_13maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 10, 4, 7),
          'end': Date.UTC(2008, 1, 10, 20, 13),
          'connectTo': '9_14online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_17maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 19, 4, 48),
          'end': Date.UTC(2008, 1, 19, 22, 37),
          'connectTo': '9_18offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '9_20maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 22, 2, 7),
          'end': Date.UTC(2008, 1, 22, 21, 40),
          'connectTo': '9_21online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_22maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 26, 16, 14),
          'end': Date.UTC(2008, 1, 27, 13, 22),
          'connectTo': '9_23online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_24maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 3, 15, 37),
          'end': Date.UTC(2008, 2, 4, 15, 10),
          'connectTo': '9_25offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '9_27maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 7, 1, 50),
          'end': Date.UTC(2008, 2, 7, 16, 25),
          'connectTo': '9_28online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_29maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 10, 2, 3),
          'end': Date.UTC(2008, 2, 11, 13, 48),
          'connectTo': '9_30online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_31maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 13, 12, 8),
          'end': Date.UTC(2008, 2, 14, 7, 45),
          'connectTo': '9_32online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_33maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 16, 9, 34),
          'end': Date.UTC(2008, 2, 16, 22, 23),
          'connectTo': '9_34online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_36maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 18, 19, 35),
          'end': Date.UTC(2008, 2, 19, 19, 16),
          'connectTo': '9_37online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_38maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 20, 7, 18),
          'end': Date.UTC(2008, 2, 21, 8, 3),
          'connectTo': '9_39online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_40maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 23, 21, 19),
          'end': Date.UTC(2008, 2, 24, 10, 49),
          'connectTo': '9_41online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_42maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 27, 4, 43),
          'end': Date.UTC(2008, 2, 27, 19, 23),
          'connectTo': '9_43online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_44maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 28, 14, 41),
          'end': Date.UTC(2008, 2, 29, 8, 5),
          'connectTo': '9_45online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '9offline',
      'name': 'Offline',
      'offline': '10%',
      'parent': '9',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '9_1offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 5, 47),
          'connectTo': '9_2online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_7offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 5, 9, 15),
          'end': Date.UTC(2008, 1, 6, 5, 31),
          'connectTo': '9_8maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '9_9offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 7, 0, 14),
          'end': Date.UTC(2008, 1, 7, 16, 2),
          'connectTo': '9_10online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_11offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 8, 10, 50),
          'end': Date.UTC(2008, 1, 9, 5, 6),
          'connectTo': '9_12online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_15offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 13, 4, 20),
          'end': Date.UTC(2008, 1, 14, 13, 3),
          'connectTo': '9_16online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_18offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 19, 22, 37),
          'end': Date.UTC(2008, 1, 20, 18, 45),
          'connectTo': '9_19online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_25offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 4, 15, 10),
          'end': Date.UTC(2008, 2, 5, 8, 25),
          'connectTo': '9_26online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '9_35offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 18, 8, 2),
          'end': Date.UTC(2008, 2, 18, 19, 35),
          'connectTo': '9_36maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        }
      ]
    },
    {
      'id': '10',
      'name': 'Cache Server',
      'offline': '15%',
      'maintenance': '19%',
      'online': '66%',
      'rowHeight': 22,
      'collapsed': true,
      'periods': [
        {
          'id': '10_1',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 9, 31)
        },
        {
          'id': '10_2',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 1, 9, 31),
          'end': Date.UTC(2008, 1, 4, 4, 37)
        },
        {
          'id': '10_3',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 4, 4, 37),
          'end': Date.UTC(2008, 1, 5, 4, 23)
        },
        {
          'id': '10_4',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 5, 4, 23),
          'end': Date.UTC(2008, 1, 5, 14, 48)
        },
        {
          'id': '10_5',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 5, 14, 48),
          'end': Date.UTC(2008, 1, 6, 6, 50)
        },
        {
          'id': '10_6',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 6, 6, 50),
          'end': Date.UTC(2008, 1, 7, 0, 19)
        },
        {
          'id': '10_7',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 7, 0, 19),
          'end': Date.UTC(2008, 1, 8, 18, 54)
        },
        {
          'id': '10_8',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 8, 18, 54),
          'end': Date.UTC(2008, 1, 9, 13, 42)
        },
        {
          'id': '10_9',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 9, 13, 42),
          'end': Date.UTC(2008, 1, 10, 6, 44)
        },
        {
          'id': '10_10',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 10, 6, 44),
          'end': Date.UTC(2008, 1, 10, 18, 18)
        },
        {
          'id': '10_11',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 10, 18, 18),
          'end': Date.UTC(2008, 1, 11, 9, 45)
        },
        {
          'id': '10_12',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 11, 9, 45),
          'end': Date.UTC(2008, 1, 12, 1, 52)
        },
        {
          'id': '10_13',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 12, 1, 52),
          'end': Date.UTC(2008, 1, 12, 19, 39)
        },
        {
          'id': '10_14',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 12, 19, 39),
          'end': Date.UTC(2008, 1, 13, 9, 28)
        },
        {
          'id': '10_15',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 13, 9, 28),
          'end': Date.UTC(2008, 1, 14, 5, 21)
        },
        {
          'id': '10_16',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 14, 5, 21),
          'end': Date.UTC(2008, 1, 15, 4, 53)
        },
        {
          'id': '10_17',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 15, 4, 53),
          'end': Date.UTC(2008, 1, 15, 19, 34)
        },
        {
          'id': '10_18',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 15, 19, 34),
          'end': Date.UTC(2008, 1, 16, 16, 7)
        },
        {
          'id': '10_19',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 16, 16, 7),
          'end': Date.UTC(2008, 1, 17, 3, 29)
        },
        {
          'id': '10_20',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 17, 3, 29),
          'end': Date.UTC(2008, 1, 17, 16, 14)
        },
        {
          'id': '10_21',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 17, 16, 14),
          'end': Date.UTC(2008, 1, 18, 2, 45)
        },
        {
          'id': '10_22',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 18, 2, 45),
          'end': Date.UTC(2008, 1, 20, 17, 22)
        },
        {
          'id': '10_23',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 20, 17, 22),
          'end': Date.UTC(2008, 1, 21, 5, 53)
        },
        {
          'id': '10_24',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 21, 5, 53),
          'end': Date.UTC(2008, 1, 23, 19, 19)
        },
        {
          'id': '10_25',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 1, 23, 19, 19),
          'end': Date.UTC(2008, 1, 24, 12, 20)
        },
        {
          'id': '10_26',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 24, 12, 20),
          'end': Date.UTC(2008, 1, 29, 0, 18)
        },
        {
          'id': '10_27',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 1, 29, 0, 18),
          'end': Date.UTC(2008, 1, 29, 19, 27)
        },
        {
          'id': '10_28',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 1, 29, 19, 27),
          'end': Date.UTC(2008, 2, 2, 3, 13)
        },
        {
          'id': '10_29',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 2, 3, 13),
          'end': Date.UTC(2008, 2, 3, 15, 11)
        },
        {
          'id': '10_30',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 3, 15, 11),
          'end': Date.UTC(2008, 2, 4, 4, 19)
        },
        {
          'id': '10_31',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 4, 4, 19),
          'end': Date.UTC(2008, 2, 4, 16, 56)
        },
        {
          'id': '10_32',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 4, 16, 56),
          'end': Date.UTC(2008, 2, 8, 17, 28)
        },
        {
          'id': '10_33',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 8, 17, 28),
          'end': Date.UTC(2008, 2, 9, 6, 12)
        },
        {
          'id': '10_34',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 9, 6, 12),
          'end': Date.UTC(2008, 2, 10, 19, 47)
        },
        {
          'id': '10_35',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 10, 19, 47),
          'end': Date.UTC(2008, 2, 11, 11, 37)
        },
        {
          'id': '10_36',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 11, 11, 37),
          'end': Date.UTC(2008, 2, 13, 18, 40)
        },
        {
          'id': '10_37',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 13, 18, 40),
          'end': Date.UTC(2008, 2, 14, 5, 24)
        },
        {
          'id': '10_38',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 14, 5, 24),
          'end': Date.UTC(2008, 2, 15, 17, 50)
        },
        {
          'id': '10_39',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 15, 17, 50),
          'end': Date.UTC(2008, 2, 16, 5, 47)
        },
        {
          'id': '10_40',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 16, 5, 47),
          'end': Date.UTC(2008, 2, 17, 1, 23)
        },
        {
          'id': '10_41',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 17, 1, 23),
          'end': Date.UTC(2008, 2, 17, 13, 29)
        },
        {
          'id': '10_42',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 17, 13, 29),
          'end': Date.UTC(2008, 2, 18, 11, 52)
        },
        {
          'id': '10_43',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 18, 11, 52),
          'end': Date.UTC(2008, 2, 19, 2, 38)
        },
        {
          'id': '10_44',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 19, 2, 38),
          'end': Date.UTC(2008, 2, 19, 12, 48)
        },
        {
          'id': '10_45',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 19, 12, 48),
          'end': Date.UTC(2008, 2, 20, 19, 22)
        },
        {
          'id': '10_46',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 20, 19, 22),
          'end': Date.UTC(2008, 2, 24, 12, 58)
        },
        {
          'id': '10_47',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 24, 12, 58),
          'end': Date.UTC(2008, 2, 25, 12, 10)
        },
        {
          'id': '10_48',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 25, 12, 10),
          'end': Date.UTC(2008, 2, 26, 6, 24)
        },
        {
          'id': '10_49',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 26, 6, 24),
          'end': Date.UTC(2008, 2, 26, 21, 45)
        },
        {
          'id': '10_50',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 26, 21, 45),
          'end': Date.UTC(2008, 2, 27, 15, 0)
        },
        {
          'id': '10_51',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 27, 15, 0),
          'end': Date.UTC(2008, 2, 28, 21, 0)
        },
        {
          'id': '10_52',
          'stroke': 'none',
          'fill': 'red',
          'start': Date.UTC(2008, 2, 28, 21, 0),
          'end': Date.UTC(2008, 2, 29, 17, 16)
        },
        {
          'id': '10_53',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 29, 17, 16),
          'end': Date.UTC(2008, 2, 30, 23, 28)
        },
        {
          'id': '10_54',
          'stroke': 'none',
          'fill': 'orange',
          'start': Date.UTC(2008, 2, 30, 23, 28),
          'end': Date.UTC(2008, 2, 31, 9, 48)
        },
        {
          'id': '10_55',
          'stroke': 'none',
          'fill': 'green',
          'start': Date.UTC(2008, 2, 31, 9, 48),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '10online',
      'name': 'Online',
      'online': '66%',
      'parent': '10',
      'type': 'online',
      'rowHeight': 30,
      'periods': [
        {
          'id': '10_2online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 1, 9, 31),
          'end': Date.UTC(2008, 1, 4, 4, 37),
          'connectTo': '10_3offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_4online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 5, 4, 23),
          'end': Date.UTC(2008, 1, 5, 14, 48),
          'connectTo': '10_5maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_7online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 7, 0, 19),
          'end': Date.UTC(2008, 1, 8, 18, 54),
          'connectTo': '10_8offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_9online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 9, 13, 42),
          'end': Date.UTC(2008, 1, 10, 6, 44),
          'connectTo': '10_10maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_11online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 10, 18, 18),
          'end': Date.UTC(2008, 1, 11, 9, 45),
          'connectTo': '10_12maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_14online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 12, 19, 39),
          'end': Date.UTC(2008, 1, 13, 9, 28),
          'connectTo': '10_15offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_16online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 14, 5, 21),
          'end': Date.UTC(2008, 1, 15, 4, 53),
          'connectTo': '10_17offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_18online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 15, 19, 34),
          'end': Date.UTC(2008, 1, 16, 16, 7),
          'connectTo': '10_19maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_20online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 17, 3, 29),
          'end': Date.UTC(2008, 1, 17, 16, 14),
          'connectTo': '10_21maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_22online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 18, 2, 45),
          'end': Date.UTC(2008, 1, 20, 17, 22),
          'connectTo': '10_23offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_24online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 21, 5, 53),
          'end': Date.UTC(2008, 1, 23, 19, 19),
          'connectTo': '10_25maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_26online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 24, 12, 20),
          'end': Date.UTC(2008, 1, 29, 0, 18),
          'connectTo': '10_27offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_28online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 1, 29, 19, 27),
          'end': Date.UTC(2008, 2, 2, 3, 13),
          'connectTo': '10_29maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_30online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 3, 15, 11),
          'end': Date.UTC(2008, 2, 4, 4, 19),
          'connectTo': '10_31offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_32online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 4, 16, 56),
          'end': Date.UTC(2008, 2, 8, 17, 28),
          'connectTo': '10_33maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_34online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 9, 6, 12),
          'end': Date.UTC(2008, 2, 10, 19, 47),
          'connectTo': '10_35maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_36online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 11, 11, 37),
          'end': Date.UTC(2008, 2, 13, 18, 40),
          'connectTo': '10_37maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_38online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 14, 5, 24),
          'end': Date.UTC(2008, 2, 15, 17, 50),
          'connectTo': '10_39maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_40online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 16, 5, 47),
          'end': Date.UTC(2008, 2, 17, 1, 23),
          'connectTo': '10_41maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_42online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 17, 13, 29),
          'end': Date.UTC(2008, 2, 18, 11, 52),
          'connectTo': '10_43maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_44online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 19, 2, 38),
          'end': Date.UTC(2008, 2, 19, 12, 48),
          'connectTo': '10_45maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_46online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 20, 19, 22),
          'end': Date.UTC(2008, 2, 24, 12, 58),
          'connectTo': '10_47offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_49online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 26, 6, 24),
          'end': Date.UTC(2008, 2, 26, 21, 45),
          'connectTo': '10_50offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_51online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 27, 15, 0),
          'end': Date.UTC(2008, 2, 28, 21, 0),
          'connectTo': '10_52offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_53online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 29, 17, 16),
          'end': Date.UTC(2008, 2, 30, 23, 28),
          'connectTo': '10_54maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_55online',
          'stroke': 'none',
          'fill': 'green .4',
          'start': Date.UTC(2008, 2, 31, 9, 48),
          'end': Date.UTC(2008, 2, 31, 15, 0)
        }
      ]
    },
    {
      'id': '10maintenance',
      'name': 'Maintenance',
      'maintenance': '19%',
      'parent': '10',
      'type': 'maintenance',
      'rowHeight': 30,
      'periods': [
        {
          'id': '10_1maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 0, 31, 16, 0),
          'end': Date.UTC(2008, 1, 1, 9, 31),
          'connectTo': '10_2online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_5maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 5, 14, 48),
          'end': Date.UTC(2008, 1, 6, 6, 50),
          'connectTo': '10_6offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_10maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 10, 6, 44),
          'end': Date.UTC(2008, 1, 10, 18, 18),
          'connectTo': '10_11online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_12maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 11, 9, 45),
          'end': Date.UTC(2008, 1, 12, 1, 52),
          'connectTo': '10_13offline',
          'connector': {'stroke': {'color': 'red', 'dash': '2 2'}, 'fill': 'red'}
        },
        {
          'id': '10_19maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 16, 16, 7),
          'end': Date.UTC(2008, 1, 17, 3, 29),
          'connectTo': '10_20online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_21maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 17, 16, 14),
          'end': Date.UTC(2008, 1, 18, 2, 45),
          'connectTo': '10_22online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_25maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 1, 23, 19, 19),
          'end': Date.UTC(2008, 1, 24, 12, 20),
          'connectTo': '10_26online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_29maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 2, 3, 13),
          'end': Date.UTC(2008, 2, 3, 15, 11),
          'connectTo': '10_30online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_33maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 8, 17, 28),
          'end': Date.UTC(2008, 2, 9, 6, 12),
          'connectTo': '10_34online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_35maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 10, 19, 47),
          'end': Date.UTC(2008, 2, 11, 11, 37),
          'connectTo': '10_36online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_37maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 13, 18, 40),
          'end': Date.UTC(2008, 2, 14, 5, 24),
          'connectTo': '10_38online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_39maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 15, 17, 50),
          'end': Date.UTC(2008, 2, 16, 5, 47),
          'connectTo': '10_40online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_41maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 17, 1, 23),
          'end': Date.UTC(2008, 2, 17, 13, 29),
          'connectTo': '10_42online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_43maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 18, 11, 52),
          'end': Date.UTC(2008, 2, 19, 2, 38),
          'connectTo': '10_44online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_45maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 19, 12, 48),
          'end': Date.UTC(2008, 2, 20, 19, 22),
          'connectTo': '10_46online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_48maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 25, 12, 10),
          'end': Date.UTC(2008, 2, 26, 6, 24),
          'connectTo': '10_49online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_54maintenance',
          'stroke': 'none',
          'fill': 'orange .4',
          'start': Date.UTC(2008, 2, 30, 23, 28),
          'end': Date.UTC(2008, 2, 31, 9, 48),
          'connectTo': '10_55online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    },
    {
      'id': '10offline',
      'name': 'Offline',
      'offline': '15%',
      'parent': '10',
      'type': 'offline',
      'rowHeight': 30,
      'periods': [
        {
          'id': '10_3offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 4, 4, 37),
          'end': Date.UTC(2008, 1, 5, 4, 23),
          'connectTo': '10_4online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_6offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 6, 6, 50),
          'end': Date.UTC(2008, 1, 7, 0, 19),
          'connectTo': '10_7online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_8offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 8, 18, 54),
          'end': Date.UTC(2008, 1, 9, 13, 42),
          'connectTo': '10_9online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_13offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 12, 1, 52),
          'end': Date.UTC(2008, 1, 12, 19, 39),
          'connectTo': '10_14online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_15offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 13, 9, 28),
          'end': Date.UTC(2008, 1, 14, 5, 21),
          'connectTo': '10_16online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_17offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 15, 4, 53),
          'end': Date.UTC(2008, 1, 15, 19, 34),
          'connectTo': '10_18online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_23offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 20, 17, 22),
          'end': Date.UTC(2008, 1, 21, 5, 53),
          'connectTo': '10_24online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_27offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 1, 29, 0, 18),
          'end': Date.UTC(2008, 1, 29, 19, 27),
          'connectTo': '10_28online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_31offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 4, 4, 19),
          'end': Date.UTC(2008, 2, 4, 16, 56),
          'connectTo': '10_32online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_47offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 24, 12, 58),
          'end': Date.UTC(2008, 2, 25, 12, 10),
          'connectTo': '10_48maintenance',
          'connector': {'stroke': {'color': 'orange', 'dash': '2 2'}, 'fill': 'orange'}
        },
        {
          'id': '10_50offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 26, 21, 45),
          'end': Date.UTC(2008, 2, 27, 15, 0),
          'connectTo': '10_51online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        },
        {
          'id': '10_52offline',
          'stroke': 'none',
          'fill': 'red .4',
          'start': Date.UTC(2008, 2, 28, 21, 0),
          'end': Date.UTC(2008, 2, 29, 17, 16),
          'connectTo': '10_53online',
          'connector': {'stroke': {'color': 'green', 'dash': '2 2'}, 'fill': 'green'}
        }
      ]
    }

  ];
}