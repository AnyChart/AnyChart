var chart;

anychart.onDocumentReady(function() {
  var treeData = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);
  chart = anychart.ganttProject();
  chart.container('container');
  chart.bounds(0, 0, '100%', '100%');
  chart.data(treeData);

  var dataGrid = chart.dataGrid();
  dataGrid.column(0).title().text('#');
  dataGrid.column(1).width(200);
  dataGrid.column(2).width(70).textFormatter(function(item) {
    var actStart = item.get('actualStart') || item.meta('autoStart');
    var date = new Date(actStart);
    return date.getUTCFullYear() + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCDate();
  }).title().text('Start Time');

  dataGrid.column(3).width(70).textFormatter(function(item) {
    var actEnd = item.get('actualEnd') || item.meta('autoEnd');
    if (actEnd) {
      var date = new Date(actEnd);
      return date.getUTCFullYear() + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCDate();
    } else {
      return '';
    }
  }).title().text('End Time');

  chart.draw();

  chart.fitAll();

});


function getData() {
  return [
    {'id': '1', name: 'Phase 1 - Strategic Plan'},
    {'id': '2', 'name': 'Self-Assessment', 'parent': '1', 'progressValue': '100%'},
    {
      'id': '3',
      'name': 'Define business vision',
      'parent': '2',
      'progressValue': '30%',
      'actualStart': Date.UTC(2015, 3, 3),
      'actualEnd': Date.UTC(2015, 3, 4),
      'connectTo': '4',
      'connectorType': 'FinishStart'
    },
    {
      'id': '4',
      'name': 'Identify available skills, information and support',
      'parent': '2',
      'progressValue': '30%',
      'actualStart': Date.UTC(2015, 3, 5),
      'actualEnd': Date.UTC(2015, 3, 6),
      'connectTo': '5',
      'connectorType': 'FinishStart'
    },
    {
      'id': '5',
      'name': 'Decide whether to proceed',
      'parent': '2',
      'progressValue': '30%',
      'actualStart': Date.UTC(2015, 3, 7),
      'actualEnd': Date.UTC(2015, 3, 8),
      'baselineStart': Date.UTC(2015, 3, 7),
      'baselineEnd': Date.UTC(2015, 3, 9),
      'connectTo': '7',
      'connectorType': 'FinishStart'
    },

    {'id': '6', 'name': 'Define the Opportunity', 'parent': '1'},
    {
      'id': '7',
      'name': 'Research the market and competition',
      'parent': '6',
      'progressValue': '100%',
      'actualStart': Date.UTC(2015, 3, 6),
      'actualEnd': Date.UTC(2015, 3, 7),
      'connectTo': '8',
      'connectorType': 'FinishStart'
    },
    {
      'id': '8',
      'name': 'Interview owners of similar businesses',
      'parent': '6',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 8),
      'actualEnd': Date.UTC(2015, 3, 9),
      'connectTo': '9',
      'connectorType': 'FinishStart'
    },
    {
      'id': '9',
      'name': 'Identify needed resources',
      'parent': '6',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 10),
      'actualEnd': Date.UTC(2015, 3, 11),
      'connectTo': '10',
      'connectorType': 'FinishStart'
    },
    {
      'id': '10',
      'name': 'Identify operating cost elements',
      'parent': '6',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 12),
      'actualEnd': Date.UTC(2015, 3, 13),
      'connectTo': '12',
      'connectorType': 'FinishStart'
    },

    {'id': '11', 'name': 'Evaluate Business Approach', 'parent': '1'},
    {
      'id': '12',
      'name': 'Define new entity requirements',
      'parent': '11',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 12),
      'actualEnd': Date.UTC(2015, 3, 15)
    },
    {
      'id': '13',
      'name': 'Identify on-going business purchase opportunities',
      'parent': '11',
      'progressValue': '50%',
      'actualStart': Date.UTC(2015, 3, 13),
      'actualEnd': Date.UTC(2015, 3, 14),
      'connectTo': '14',
      'connectorType': 'FinishStart'
    },
    {
      'id': '14',
      'name': 'Research franchise possibilities',
      'parent': '11',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 15),
      'actualEnd': Date.UTC(2015, 3, 16),
      'connectTo': '15',
      'connectorType': 'FinishStart'
    },
    {'id': '15', 'name': 'Summarize business approach', 'parent': '11', 'actualStart': Date.UTC(2015, 3, 17)},

    {
      'id': '26',
      'name': 'Phase 2 - Define the Business Opportunity',
      'baselineStart': Date.UTC(2015, 3, 13),
      'baselineEnd': Date.UTC(2015, 3, 20)
    },
    {'id': '27', 'name': 'Define the Market', 'parent': '26'},
    {
      'id': '28',
      'name': 'Access available information',
      'parent': '27',
      'progressValue': '30%',
      'actualStart': Date.UTC(2015, 3, 14),
      'actualEnd': Date.UTC(2015, 3, 16),
      'connectTo': '29',
      'connectorType': 'StartStart'
    },
    {
      'id': '29',
      'name': 'Create market analysis plan',
      'parent': '27',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 15),
      'actualEnd': Date.UTC(2015, 3, 18),
      'connectTo': '30'
    },
    {'id': '30', 'name': 'Summarize the market', 'parent': '27', 'actualStart': Date.UTC(2015, 3, 18)},

    {'id': '34', 'name': 'Identify Needed Materials and Supplies', 'parent': '26'},
    {
      'id': '35',
      'name': 'Select a business approach (from \'Evaluate Business Approach\' above)',
      'parent': '34',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 18),
      'actualEnd': Date.UTC(2015, 3, 19),
      'connectTo': '36',
      'connectorType': 'FinishStart'
    },
    {
      'id': '36',
      'name': 'Identify management staff resources',
      'parent': '34',
      'progressValue': '100%',
      'actualStart': Date.UTC(2015, 3, 18),
      'actualEnd': Date.UTC(2015, 3, 20),
      'connectTo': '37',
      'connectorType': 'FinishStart'
    },
    {
      'id': '37',
      'name': 'Identify staffing requirements',
      'parent': '34',
      'progressValue': '0%',
      'actualStart': Date.UTC(2015, 3, 19),
      'actualEnd': Date.UTC(2015, 3, 20),
      'connectTo': '40',
      'connectorType': 'FinishStart'
    },
    {
      'id': '40',
      'name': 'Evaluate Potential Risks and Rewards',
      'parent': '34',
      'progressValue': '100%',
      'actualStart': Date.UTC(2015, 3, 19),
      'actualEnd': Date.UTC(2015, 3, 22),
      'baselineStart': Date.UTC(2015, 3, 21),
      'baselineEnd': Date.UTC(2015, 3, 25),
      'connectTo': '41',
      'connectorType': 'FinishStart'
    },
    {
      'id': '41',
      'name': 'Summarize financial projections',
      'parent': '34',
      'actualStart': Date.UTC(2015, 3, 20),
      'actualEnd': Date.UTC(2015, 3, 20)
    }
  ];
}
