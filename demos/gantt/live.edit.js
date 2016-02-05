var projChart, resChart;
var projTree, resTree;

anychart.onDocumentReady(function() {
  createProject();
  createResources();
});


function projCheckChange() {
  var projCheck = document.getElementById('projCheck');
  projChart.editing(projCheck.checked);
}

function resCheckChange() {
  var resCheck = document.getElementById('resCheck');
  resChart.editing(resCheck.checked);
}


function createProject() {
  projChart = anychart.ganttProject();
  projTree = anychart.data.tree(getProjData(), anychart.enums.TreeFillingMethod.AS_TABLE);
  projChart.data(projTree);
  projChart.container('projectContainer');
  projChart.editing(true);
  projChart.dataGrid().column(1).width(400);
  projChart.zoomTo(Date.UTC(2010, 0, 8, 15), Date.UTC(2010, 3, 25, 20));
  projChart.draw();
}


function createResources() {
  resChart = anychart.ganttResource();
  resTree = anychart.data.tree(getResData(), anychart.enums.TreeFillingMethod.AS_TABLE);
  resChart.data(resTree);
  resChart.container('resourcesContainer');
  resChart.editing(true);
  resChart.dataGrid().column(1).width(400);
  resChart.draw();
}

function getProjData() {
  return [
    {
      'id': 'pre-planning',
      'name': 'Pre-planning',
      'actualStart': Date.UTC(2010, 0, 17, 8),
      'actualEnd': Date.UTC(2010, 1, 5, 18),
      'progressValue': '17%',
      'baselineStart': Date.UTC(2010, 0, 10, 8),
      'baselineEnd': Date.UTC(2010, 1, 4, 8),
      'rowHeight': 35
    },

    {
      'id': 'investigate',
      'name': 'Investigate the task',
      'parent': 'pre-planning',
      'actualStart': Date.UTC(2010, 0, 17, 8),
      'actualEnd': Date.UTC(2010, 0, 25, 12),
      'progressValue': '15%',
      'baselineStart': Date.UTC(2010, 0, 18, 10),
      'baselineEnd': Date.UTC(2010, 0, 23, 16),
      'rowHeight': 35,
      'connectTo': 'distribute'
    },

    {
      'id': 'distribute',
      'name': 'Distribute roles and resources',
      'parent': 'pre-planning',
      'actualStart': Date.UTC(2010, 0, 25, 12),
      'actualEnd': Date.UTC(2010, 0, 30, 16),
      'progressValue': '0%',
      'baselineStart': Date.UTC(2010, 0, 20, 8),
      'baselineEnd': Date.UTC(2010, 0, 27, 20),
      'rowHeight': 35,
      'connectTo': 'documents'
    },

    {
      'id': 'documents',
      'name': 'Gather technical documentation',
      'parent': 'pre-planning',
      'actualStart': Date.UTC(2010, 0, 27, 12),
      'actualEnd': Date.UTC(2010, 1, 6, 10),
      'progressValue': '65%',
      'baselineStart': Date.UTC(2010, 0, 23, 8),
      'baselineEnd': Date.UTC(2010, 1, 4, 20),
      'rowHeight': 35
    },

    {
      'id': 'planning-report',
      'name': 'Summary planning report',
      'parent': 'pre-planning',
      'actualStart': Date.UTC(2010, 1, 4, 8),
      'rowHeight': 35
    },

    {
      'id': 'proto-impl',
      'name': 'Prototype Implementation',
      'actualStart': Date.UTC(2010, 0, 25, 8),
      'actualEnd': Date.UTC(2010, 2, 21, 15),
      'progressValue': '42%',
      'baselineStart': Date.UTC(2010, 0, 21, 8),
      'baselineEnd': Date.UTC(2010, 2, 19, 18),
      'rowHeight': 35
    },

    {
      'id': 'evaluate-phase',
      'name': 'Evaluate development phase',
      'parent': 'proto-impl',
      'actualStart': Date.UTC(2010, 0, 27, 8),
      'actualEnd': Date.UTC(2010, 1, 1, 15),
      'progressValue': '10%',
      'baselineStart': Date.UTC(2010, 0, 21, 8),
      'baselineEnd': Date.UTC(2010, 0, 27, 16),
      'rowHeight': 35,
      'actual': {
        'label': {
          'fontColor': '#333',
          'value': 'Evaluating ~10%',
          'position': 'left',
          'anchor': 'centerRight',
          'fontWeight': 'bold'
        }
      },
      'connectTo': 'step1'
    },

    {
      'id': 'evaluate-tech',
      'name': 'Evaluate available technologies',
      'parent': 'proto-impl',
      'actualStart': Date.UTC(2010, 1, 22, 15),
      'actualEnd': Date.UTC(2010, 2, 4, 12),
      'progressValue': '30%',
      'baselineStart': Date.UTC(2010, 1, 18, 8),
      'baselineEnd': Date.UTC(2010, 2, 3, 10),
      'rowHeight': 35
    },

    {
      'id': 'dev-kit',
      'name': 'Choose development kit',
      'parent': 'proto-impl',
      'actualStart': Date.UTC(2010, 2, 10, 8),
      'actualEnd': Date.UTC(2010, 2, 21, 15),
      'progressValue': '14%',
      'baselineStart': Date.UTC(2010, 2, 9, 8),
      'baselineEnd': Date.UTC(2010, 2, 21, 15),
      'rowHeight': 35
    },

    {
      'id': 'proto-def',
      'name': 'Define the Architecture of the Prototype',
      'parent': 'proto-impl',
      'actualStart': Date.UTC(2010, 1, 2, 8),
      'actualEnd': Date.UTC(2010, 2, 12, 18),
      'progressValue': '68%',
      'baselineStart': Date.UTC(2010, 0, 30, 8),
      'baselineEnd': Date.UTC(2010, 2, 11, 18),
      'rowHeight': 35
    },

    {
      'id': 'step1',
      'name': 'Step1: Build prototype',
      'parent': 'proto-def',
      'actualStart': Date.UTC(2010, 1, 2, 8),
      'actualEnd': Date.UTC(2010, 1, 15, 16),
      'progressValue': '33%',
      'baselineStart': Date.UTC(2010, 1, 1, 10),
      'baselineEnd': Date.UTC(2010, 1, 14, 10),
      'rowHeight': 35,
      'connectTo': 'step2'
    },

    {
      'id': 'step2',
      'name': 'Step2: Collect results',
      'parent': 'proto-def',
      'actualStart': Date.UTC(2010, 1, 20, 8),
      'actualEnd': Date.UTC(2010, 1, 27, 16),
      'progressValue': '80%',
      'baselineStart': Date.UTC(2010, 1, 14, 10),
      'baselineEnd': Date.UTC(2010, 1, 25, 18),
      'rowHeight': 35,
      'connectTo': 'step3',
      'baseline': {
        'label': {
          'value': 're-evaluate'
        }
      }
    },

    {
      'id': 'step3',
      'name': 'Step3: Analyze results',
      'parent': 'proto-def',
      'actualStart': Date.UTC(2010, 2, 1, 8),
      'actualEnd': Date.UTC(2010, 2, 11, 18),
      'progressValue': '0%',
      'baselineStart': Date.UTC(2010, 2, 1, 8),
      'baselineEnd': Date.UTC(2010, 2, 11, 10),
      'rowHeight': 35,
      'connectTo': 'follow-up'
    },

    {
      'id': 'follow-up',
      'name': 'Follow up with stuff',
      'parent': 'proto-def',
      'actualStart': Date.UTC(2010, 2, 12, 8),
      'actualEnd': Date.UTC(2010, 2, 16, 18),
      'progressValue': '74%',
      'baselineStart': Date.UTC(2010, 2, 12, 10),
      'baselineEnd': Date.UTC(2010, 2, 13, 12),
      'rowHeight': 35,
      'connectTo': 'approval1'
    },

    {
      'id': 'approval1',
      'name': 'First customer approval',
      'actualStart': Date.UTC(2010, 2, 21, 18),
      'rowHeight': 35
    },

    {
      'id': 'approved-impl',
      'name': 'Approved Implementation',
      'actualStart': Date.UTC(2010, 2, 22, 8),
      'actualEnd': Date.UTC(2010, 3, 17, 18),
      'progressValue': '12%',
      'baselineStart': Date.UTC(2010, 2, 22, 8),
      'baselineEnd': Date.UTC(2010, 3, 17, 18),
      'rowHeight': 35,
      'connectTo': 'approval2'
    },

    {
      'id': 'parallel3',
      'name': 'Parallel task: Engine development',
      'parent': 'approved-impl',
      'actualStart': Date.UTC(2010, 2, 22, 8),
      'actualEnd': Date.UTC(2010, 3, 17, 18),
      'progressValue': '4%',
      'baselineStart': Date.UTC(2010, 2, 22, 8),
      'baselineEnd': Date.UTC(2010, 3, 17, 18),
      'rowHeight': 35
    },

    {
      'id': 'parallel2',
      'name': 'Parallel task: Engine debugging',
      'parent': 'approved-impl',
      'actualStart': Date.UTC(2010, 2, 22, 8),
      'actualEnd': Date.UTC(2010, 3, 17, 18),
      'progressValue': '16%',
      'baselineStart': Date.UTC(2010, 2, 22, 8),
      'baselineEnd': Date.UTC(2010, 3, 17, 18),
      'rowHeight': 35,
      'connectTo': 'parallel3',
      'connectorType': 'startStart'
    },

    {
      'id': 'parallel1',
      'name': 'Parallel task: Major features documentation',
      'parent': 'approved-impl',
      'actualStart': Date.UTC(2010, 2, 22, 8),
      'actualEnd': Date.UTC(2010, 3, 17, 18),
      'progressValue': '23%',
      'baselineStart': Date.UTC(2010, 2, 22, 8),
      'baselineEnd': Date.UTC(2010, 3, 17, 18),
      'rowHeight': 35,
      'connectTo': 'parallel2',
      'connectorType': 'startStart'
    },

    {
      'id': 'parallel0',
      'name': 'Paralleling the tasks',
      'parent': 'approved-impl',
      'actualStart': Date.UTC(2010, 2, 22, 8),
      'actualEnd': Date.UTC(2010, 3, 17, 18),
      'progressValue': '64%',
      'baselineStart': Date.UTC(2010, 2, 22, 8),
      'baselineEnd': Date.UTC(2010, 3, 17, 18),
      'rowHeight': 35,
      'connectTo': 'parallel1',
      'connectorType': 'startStart'
    },

    {
      'id': 'approval2',
      'name': 'Second customer approval',
      'actualStart': Date.UTC(2010, 3, 24, 10),
      'rowHeight': 35,
      'connectTo': 'production'
    },

    {
      'id': 'production',
      'name': 'Production Phase',
      'actualStart': Date.UTC(2010, 3, 28, 8),
      'actualEnd': Date.UTC(2010, 5, 15, 18),
      'progressValue': '12%',
      'baselineStart': Date.UTC(2010, 3, 25, 10),
      'baselineEnd': Date.UTC(2010, 5, 16, 18),
      'rowHeight': 35
    },

    {
      'id': 'assemble',
      'name': 'Assemble the production resources',
      'parent': 'production',
      'actualStart': Date.UTC(2010, 3, 28, 8),
      'actualEnd': Date.UTC(2010, 4, 3, 18),
      'progressValue': '50%',
      'baselineStart': Date.UTC(2010, 3, 26, 8),
      'baselineEnd': Date.UTC(2010, 4, 2, 12),
      'rowHeight': 35,
      'connectTo': 'risks'
    },

    {
      'id': 'risks',
      'name': 'Confirm the risks',
      'parent': 'production',
      'actualStart': Date.UTC(2010, 4, 10, 8),
      'actualEnd': Date.UTC(2010, 4, 21, 18),
      'progressValue': '22%',
      'baselineStart': Date.UTC(2010, 4, 10, 14),
      'baselineEnd': Date.UTC(2010, 4, 20, 16),
      'rowHeight': 35,
      'connectTo': 'development',
      'connectorType': 'startStart'
    },

    {
      'id': 'development',
      'name': 'Development',
      'parent': 'production',
      'actualStart': Date.UTC(2010, 4, 3, 8),
      'actualEnd': Date.UTC(2010, 6, 1, 14),
      'progressValue': '82%',
      'baselineStart': Date.UTC(2010, 4, 3, 8),
      'baselineEnd': Date.UTC(2010, 5, 14, 15),
      'rowHeight': 35
    },

    {
      'id': 'basic-testing',
      'name': 'Basic testing',
      'parent': 'production',
      'actualStart': Date.UTC(2010, 5, 1, 8),
      'actualEnd': Date.UTC(2010, 5, 24, 18),
      'progressValue': '41%',
      'baselineStart': Date.UTC(2010, 4, 29, 9),
      'baselineEnd': Date.UTC(2010, 5, 27, 18),
      'rowHeight': 35,
      'connectTo': 'final-testing'
    },

    {
      'id': 'final-testing',
      'name': 'Final testing',
      'parent': 'production',
      'actualStart': Date.UTC(2010, 5, 25, 8),
      'actualEnd': Date.UTC(2010, 6, 20, 18),
      'progressValue': '5%',
      'baselineStart': Date.UTC(2010, 5, 20, 10),
      'baselineEnd': Date.UTC(2010, 6, 17, 18),
      'rowHeight': 35,
      'connectTo': 'delivery'
    },

    {
      'id': 'perf-testing1',
      'name': 'Phase 1: Performance testing',
      'parent': 'final-testing',
      'actualStart': Date.UTC(2010, 5, 25, 8),
      'actualEnd': Date.UTC(2010, 6, 4, 18),
      'progressValue': '15%',
      'baselineStart': Date.UTC(2010, 5, 20, 10),
      'baselineEnd': Date.UTC(2010, 6, 5, 18),
      'rowHeight': 35,
      'connectTo': 'perf-testing2'
    },

    {
      'id': 'perf-testing2',
      'name': 'Phase 2: Performance testing',
      'parent': 'final-testing',
      'actualStart': Date.UTC(2010, 6, 5, 8),
      'actualEnd': Date.UTC(2010, 6, 27, 18),
      'progressValue': '35%',
      'baselineStart': Date.UTC(2010, 6, 20, 10),
      'baselineEnd': Date.UTC(2010, 7, 2, 16),
      'rowHeight': 35
    },

    {
      'id': 'delivery',
      'name': 'Product delivery',
      'actualStart': Date.UTC(2010, 5, 26, 8),
      'rowHeight': 35
    }
  ];
}

function getResData() {
  return [{
    'id': '1',
    'name': 'Alex Exler',
    'periods': [
      {'id': '1_1', 'start': Date.UTC(2007, 1, 14, 16), 'end': Date.UTC(2007, 1, 20, 16)},
      {'id': '1_2', 'start': Date.UTC(2007, 2, 26, 15), 'end': Date.UTC(2007, 3, 3, 15)},
      {'id': '1_3', 'start': Date.UTC(2007, 3, 26, 15), 'end': Date.UTC(2007, 4, 7, 15)},
      {'id': '1_4', 'start': Date.UTC(2007, 5, 17, 15), 'end': Date.UTC(2007, 5, 24, 15)},
      {'id': '1_5', 'start': Date.UTC(2007, 6, 5, 15), 'end': Date.UTC(2007, 6, 8, 15)},
      {'id': '1_6', 'start': Date.UTC(2007, 7, 6, 15), 'end': Date.UTC(2007, 7, 21, 15)},
      {'id': '1_7', 'start': Date.UTC(2007, 8, 24, 15), 'end': Date.UTC(2007, 9, 2, 15)},
      {'id': '1_8', 'start': Date.UTC(2007, 9, 30, 16), 'end': Date.UTC(2007, 10, 4, 16)},
      {'id': '1_9', 'start': Date.UTC(2007, 11, 5, 16), 'end': Date.UTC(2007, 11, 10, 16)},
      {'id': '1_10', 'start': Date.UTC(2008, 0, 22, 16), 'end': Date.UTC(2008, 0, 27, 16)},
      {'id': '1_11', 'start': Date.UTC(2008, 3, 2, 15), 'end': Date.UTC(2008, 3, 8, 15)},
      {'id': '1_12', 'start': Date.UTC(2008, 4, 4, 15), 'end': Date.UTC(2008, 4, 11, 15)},
      {'id': '1_13', 'start': Date.UTC(2008, 5, 15, 15), 'end': Date.UTC(2008, 5, 18, 15)},
      {'id': '1_14', 'start': Date.UTC(2008, 5, 30, 15), 'end': Date.UTC(2008, 6, 6, 15)},
      {'id': '1_15', 'start': Date.UTC(2008, 6, 20, 15), 'end': Date.UTC(2008, 6, 24, 15)},
      {'id': '1_16', 'start': Date.UTC(2008, 7, 10, 15), 'end': Date.UTC(2008, 7, 21, 15)},
      {'id': '1_17', 'start': Date.UTC(2008, 8, 23, 15), 'end': Date.UTC(2008, 8, 28, 15)},
      {'id': '1_18', 'start': Date.UTC(2008, 10, 3, 16), 'end': Date.UTC(2008, 10, 16, 16)},
      {'id': '1_19', 'start': Date.UTC(2008, 11, 15, 16), 'end': Date.UTC(2008, 11, 22, 16)}
    ]
  }, {
    'id': '2',
    'name': 'Philip Kineyko',
    'periods': [
      {'id': '2_1', 'start': Date.UTC(2007, 2, 4, 16), 'end': Date.UTC(2007, 2, 12, 16)},
      {'id': '2_2', 'start': Date.UTC(2007, 2, 14, 16), 'end': Date.UTC(2007, 2, 20, 16)},
      {'id': '2_3', 'start': Date.UTC(2007, 3, 19, 15), 'end': Date.UTC(2007, 3, 30, 15)},
      {'id': '2_4', 'start': Date.UTC(2007, 4, 28, 15), 'end': Date.UTC(2007, 5, 3, 15)},
      {'id': '2_5', 'start': Date.UTC(2007, 5, 27, 15), 'end': Date.UTC(2007, 6, 5, 15)}
    ]
  }, {
    'id': '3',
    'name': 'Luke Liakos',
    'periods': [
      {'id': '3_1', 'start': Date.UTC(2007, 0, 25, 16), 'end': Date.UTC(2007, 0, 30, 16)},
      {'id': '3_2', 'start': Date.UTC(2007, 1, 20, 16), 'end': Date.UTC(2007, 1, 26, 16)},
      {'id': '3_3', 'start': Date.UTC(2007, 3, 1, 15), 'end': Date.UTC(2007, 3, 10, 15)},
      {'id': '3_4', 'start': Date.UTC(2007, 3, 18, 15), 'end': Date.UTC(2007, 4, 6, 15)},
      {'id': '3_5', 'start': Date.UTC(2007, 4, 28, 15), 'end': Date.UTC(2007, 4, 30, 15)},
      {'id': '3_6', 'start': Date.UTC(2007, 6, 17, 15), 'end': Date.UTC(2007, 6, 29, 15)},
      {'id': '3_7', 'start': Date.UTC(2007, 7, 19, 15), 'end': Date.UTC(2007, 7, 27, 15)},
      {'id': '3_8', 'start': Date.UTC(2007, 8, 9, 15), 'end': Date.UTC(2007, 8, 17, 15)},
      {'id': '3_9', 'start': Date.UTC(2007, 8, 23, 15), 'end': Date.UTC(2007, 9, 1, 15)},
      {'id': '3_10', 'start': Date.UTC(2007, 9, 22, 15), 'end': Date.UTC(2007, 9, 31, 16)},
      {'id': '3_11', 'start': Date.UTC(2007, 11, 13, 16), 'end': Date.UTC(2007, 11, 17, 16)},
      {'id': '3_12', 'start': Date.UTC(2008, 0, 3, 16), 'end': Date.UTC(2008, 0, 13, 16)},
      {'id': '3_13', 'start': Date.UTC(2008, 1, 4, 16), 'end': Date.UTC(2008, 1, 11, 16)},
      {'id': '3_14', 'start': Date.UTC(2008, 3, 7, 15), 'end': Date.UTC(2008, 3, 13, 15)},
      {'id': '3_15', 'start': Date.UTC(2008, 4, 27, 15), 'end': Date.UTC(2008, 5, 2, 15)},
      {'id': '3_16', 'start': Date.UTC(2008, 6, 10, 15), 'end': Date.UTC(2008, 6, 13, 15)},
      {'id': '3_17', 'start': Date.UTC(2008, 7, 17, 15), 'end': Date.UTC(2008, 7, 19, 15)}
    ]
  }, {
    'id': '4',
    'name': 'Judy Penfold',
    'periods': [
      {'id': '4_1', 'start': Date.UTC(2007, 1, 18, 16), 'end': Date.UTC(2007, 1, 25, 16)},
      {'id': '4_2', 'start': Date.UTC(2007, 2, 11, 16), 'end': Date.UTC(2007, 2, 19, 16)},
      {'id': '4_3', 'start': Date.UTC(2007, 3, 30, 15), 'end': Date.UTC(2007, 4, 6, 15)},
      {'id': '4_4', 'start': Date.UTC(2007, 5, 7, 15), 'end': Date.UTC(2007, 5, 14, 15)},
      {'id': '4_5', 'start': Date.UTC(2007, 6, 30, 15), 'end': Date.UTC(2007, 7, 5, 15)},
      {'id': '4_6', 'start': Date.UTC(2007, 8, 19, 15), 'end': Date.UTC(2007, 8, 26, 15)}
    ]
  }, {
    'id': '5',
    'name': 'Patricia Darmon',
    'periods': [
      {'id': '5_1', 'start': Date.UTC(2007, 1, 12, 16), 'end': Date.UTC(2007, 1, 13, 16)},
      {'id': '5_2', 'start': Date.UTC(2007, 2, 18, 16), 'end': Date.UTC(2007, 2, 22, 16)},
      {'id': '5_3', 'start': Date.UTC(2007, 3, 11, 15), 'end': Date.UTC(2007, 3, 17, 15)},
      {'id': '5_4', 'start': Date.UTC(2007, 3, 29, 15), 'end': Date.UTC(2007, 4, 1, 15)},
      {'id': '5_5', 'start': Date.UTC(2007, 5, 11, 15), 'end': Date.UTC(2007, 5, 19, 15)},
      {'id': '5_6', 'start': Date.UTC(2007, 6, 26, 15), 'end': Date.UTC(2007, 7, 2, 15)},
      {'id': '5_7', 'start': Date.UTC(2007, 8, 18, 15), 'end': Date.UTC(2007, 8, 27, 15)},
      {'id': '5_8', 'start': Date.UTC(2007, 10, 5, 16), 'end': Date.UTC(2007, 10, 15, 16)},
      {'id': '5_9', 'start': Date.UTC(2007, 10, 28, 16), 'end': Date.UTC(2007, 11, 2, 16)},
      {'id': '5_10', 'start': Date.UTC(2007, 11, 11, 16), 'end': Date.UTC(2007, 11, 13, 16)},
      {'id': '5_11', 'start': Date.UTC(2008, 0, 20, 16), 'end': Date.UTC(2008, 0, 22, 16)},
      {'id': '5_12', 'start': Date.UTC(2008, 1, 6, 16), 'end': Date.UTC(2008, 1, 14, 16)},
      {'id': '5_13', 'start': Date.UTC(2008, 2, 11, 16), 'end': Date.UTC(2008, 2, 17, 16)},
      {'id': '5_14', 'start': Date.UTC(2008, 3, 6, 15), 'end': Date.UTC(2008, 3, 14, 15)},
      {'id': '5_15', 'start': Date.UTC(2008, 5, 5, 15), 'end': Date.UTC(2008, 5, 12, 15)},
      {'id': '5_16', 'start': Date.UTC(2008, 6, 7, 15), 'end': Date.UTC(2008, 6, 16, 15)},
      {'id': '5_17', 'start': Date.UTC(2008, 6, 20, 15), 'end': Date.UTC(2008, 6, 27, 15)},
      {'id': '5_18', 'start': Date.UTC(2008, 8, 7, 15), 'end': Date.UTC(2008, 8, 14, 15)},
      {'id': '5_19', 'start': Date.UTC(2008, 9, 12, 15), 'end': Date.UTC(2008, 9, 14, 15)},
      {'id': '5_20', 'start': Date.UTC(2008, 10, 27, 16), 'end': Date.UTC(2008, 11, 8, 16)}
    ]
  }, {
    'id': '6',
    'name': 'Jong Park',
    'periods': [
      {'id': '6_1', 'start': Date.UTC(2007, 1, 18, 16), 'end': Date.UTC(2007, 1, 26, 16)},
      {'id': '6_2', 'start': Date.UTC(2007, 2, 11, 16), 'end': Date.UTC(2007, 2, 18, 16)},
      {'id': '6_3', 'start': Date.UTC(2007, 4, 8, 15), 'end': Date.UTC(2007, 4, 14, 15)},
      {'id': '6_4', 'start': Date.UTC(2007, 4, 30, 15), 'end': Date.UTC(2007, 5, 3, 15)},
      {'id': '6_5', 'start': Date.UTC(2007, 6, 9, 15), 'end': Date.UTC(2007, 6, 18, 15)},
      {'id': '6_6', 'start': Date.UTC(2007, 8, 20, 15), 'end': Date.UTC(2007, 8, 30, 15)},
      {'id': '6_7', 'start': Date.UTC(2007, 9, 29, 16), 'end': Date.UTC(2007, 9, 31, 16)},
      {'id': '6_8', 'start': Date.UTC(2007, 10, 27, 16), 'end': Date.UTC(2007, 11, 10, 16)},
      {'id': '6_9', 'start': Date.UTC(2007, 11, 13, 16), 'end': Date.UTC(2007, 11, 20, 16)},
      {'id': '6_10', 'start': Date.UTC(2008, 0, 7, 16), 'end': Date.UTC(2008, 0, 9, 16)},
      {'id': '6_11', 'start': Date.UTC(2008, 0, 21, 16), 'end': Date.UTC(2008, 0, 24, 16)},
      {'id': '6_12', 'start': Date.UTC(2008, 1, 4, 16), 'end': Date.UTC(2008, 1, 21, 16)},
      {'id': '6_13', 'start': Date.UTC(2008, 1, 26, 16), 'end': Date.UTC(2008, 2, 4, 16)},
      {'id': '6_14', 'start': Date.UTC(2008, 2, 12, 16), 'end': Date.UTC(2008, 2, 25, 16)},
      {'id': '6_15', 'start': Date.UTC(2008, 3, 27, 15), 'end': Date.UTC(2008, 4, 1, 15)},
      {'id': '6_16', 'start': Date.UTC(2008, 4, 12, 15), 'end': Date.UTC(2008, 4, 15, 15)},
      {'id': '6_17', 'start': Date.UTC(2008, 5, 5, 15), 'end': Date.UTC(2008, 5, 26, 15)},
      {'id': '6_18', 'start': Date.UTC(2008, 6, 8, 15), 'end': Date.UTC(2008, 6, 10, 15)}
    ]
  }, {
    'id': '7',
    'name': 'Trevor Moore',
    'periods': [
      {'id': '7_1', 'start': Date.UTC(2007, 1, 5, 16), 'end': Date.UTC(2007, 1, 6, 16)},
      {'id': '7_2', 'start': Date.UTC(2007, 2, 5, 16), 'end': Date.UTC(2007, 2, 18, 16)},
      {'id': '7_3', 'start': Date.UTC(2007, 4, 8, 15), 'end': Date.UTC(2007, 4, 16, 15)},
      {'id': '7_4', 'start': Date.UTC(2007, 5, 4, 15), 'end': Date.UTC(2007, 5, 12, 15)},
      {'id': '7_5', 'start': Date.UTC(2007, 6, 29, 15), 'end': Date.UTC(2007, 7, 6, 15)},
      {'id': '7_6', 'start': Date.UTC(2007, 8, 16, 15), 'end': Date.UTC(2007, 8, 23, 15)},
      {'id': '7_7', 'start': Date.UTC(2007, 9, 7, 15), 'end': Date.UTC(2007, 9, 15, 15)},
      {'id': '7_8', 'start': Date.UTC(2007, 10, 27, 16), 'end': Date.UTC(2007, 11, 4, 16)},
      {'id': '7_9', 'start': Date.UTC(2008, 0, 9, 16), 'end': Date.UTC(2008, 0, 13, 16)},
      {'id': '7_10', 'start': Date.UTC(2008, 0, 23, 16), 'end': Date.UTC(2008, 0, 28, 16)},
      {'id': '7_11', 'start': Date.UTC(2008, 2, 24, 16), 'end': Date.UTC(2008, 2, 31, 15)},
      {'id': '7_12', 'start': Date.UTC(2008, 3, 28, 15), 'end': Date.UTC(2008, 3, 29, 15)},
      {'id': '7_13', 'start': Date.UTC(2008, 4, 13, 15), 'end': Date.UTC(2008, 4, 20, 15)},
      {'id': '7_14', 'start': Date.UTC(2008, 5, 19, 15), 'end': Date.UTC(2008, 5, 23, 15)},
      {'id': '7_15', 'start': Date.UTC(2008, 6, 29, 15), 'end': Date.UTC(2008, 7, 14, 15)},
      {'id': '7_16', 'start': Date.UTC(2008, 8, 1, 15), 'end': Date.UTC(2008, 8, 8, 15)}
    ]
  }, {
    'id': '8',
    'name': 'Eddie Bridges',
    'periods': [
      {'id': '8_1', 'start': Date.UTC(2007, 1, 4, 16), 'end': Date.UTC(2007, 1, 11, 16)},
      {'id': '8_2', 'start': Date.UTC(2007, 2, 7, 16), 'end': Date.UTC(2007, 2, 18, 16)},
      {'id': '8_3', 'start': Date.UTC(2007, 3, 29, 15), 'end': Date.UTC(2007, 4, 3, 15)},
      {'id': '8_4', 'start': Date.UTC(2007, 5, 10, 15), 'end': Date.UTC(2007, 6, 1, 15)},
      {'id': '8_5', 'start': Date.UTC(2007, 7, 13, 15), 'end': Date.UTC(2007, 7, 19, 15)},
      {'id': '8_6', 'start': Date.UTC(2007, 8, 18, 15), 'end': Date.UTC(2007, 8, 24, 15)},
      {'id': '8_7', 'start': Date.UTC(2007, 9, 3, 15), 'end': Date.UTC(2007, 9, 14, 15)},
      {'id': '8_8', 'start': Date.UTC(2007, 9, 23, 15), 'end': Date.UTC(2007, 9, 30, 16)},
      {'id': '8_9', 'start': Date.UTC(2007, 10, 12, 16), 'end': Date.UTC(2007, 10, 29, 16)},
      {'id': '8_10', 'start': Date.UTC(2008, 0, 20, 16), 'end': Date.UTC(2008, 0, 27, 16)},
      {'id': '8_11', 'start': Date.UTC(2008, 1, 28, 16), 'end': Date.UTC(2008, 2, 2, 16)}
    ]
  }, {
    'id': '9',
    'name': 'Douglas Gunder',
    'periods': [
      {'id': '9_1', 'start': Date.UTC(2007, 1, 7, 16), 'end': Date.UTC(2007, 1, 14, 16)},
      {'id': '9_2', 'start': Date.UTC(2007, 1, 26, 16), 'end': Date.UTC(2007, 2, 8, 16)},
      {'id': '9_3', 'start': Date.UTC(2007, 3, 15, 15), 'end': Date.UTC(2007, 3, 18, 15)},
      {'id': '9_4', 'start': Date.UTC(2007, 4, 2, 15), 'end': Date.UTC(2007, 4, 7, 15)},
      {'id': '9_5', 'start': Date.UTC(2007, 4, 14, 15), 'end': Date.UTC(2007, 4, 16, 15)},
      {'id': '9_6', 'start': Date.UTC(2007, 5, 19, 15), 'end': Date.UTC(2007, 6, 4, 15)},
      {'id': '9_7', 'start': Date.UTC(2007, 7, 2, 15), 'end': Date.UTC(2007, 7, 8, 15)},
      {'id': '9_8', 'start': Date.UTC(2007, 9, 8, 15), 'end': Date.UTC(2007, 9, 22, 15)},
      {'id': '9_9', 'start': Date.UTC(2007, 9, 28, 16), 'end': Date.UTC(2007, 10, 6, 16)},
      {'id': '9_10', 'start': Date.UTC(2007, 11, 13, 16), 'end': Date.UTC(2007, 11, 20, 16)},
      {'id': '9_11', 'start': Date.UTC(2008, 0, 14, 16), 'end': Date.UTC(2008, 0, 21, 16)},
      {'id': '9_12', 'start': Date.UTC(2008, 2, 9, 16), 'end': Date.UTC(2008, 2, 16, 16)},
      {'id': '9_13', 'start': Date.UTC(2008, 3, 10, 15), 'end': Date.UTC(2008, 3, 20, 15)},
      {'id': '9_14', 'start': Date.UTC(2008, 5, 9, 15), 'end': Date.UTC(2008, 5, 16, 15)},
      {'id': '9_15', 'start': Date.UTC(2008, 6, 28, 15), 'end': Date.UTC(2008, 7, 6, 15)}
    ]
  }, {
    'id': '10',
    'name': 'Joseph Marshall',
    'periods': [
      {'id': '10_1', 'start': Date.UTC(2007, 1, 15, 16), 'end': Date.UTC(2007, 1, 18, 16)},
      {'id': '10_2', 'start': Date.UTC(2007, 3, 30, 15), 'end': Date.UTC(2007, 4, 21, 15)},
      {'id': '10_3', 'start': Date.UTC(2007, 5, 10, 15), 'end': Date.UTC(2007, 5, 18, 15)},
      {'id': '10_4', 'start': Date.UTC(2007, 6, 10, 15), 'end': Date.UTC(2007, 6, 18, 15)},
      {'id': '10_5', 'start': Date.UTC(2007, 7, 13, 15), 'end': Date.UTC(2007, 7, 19, 15)},
      {'id': '10_6', 'start': Date.UTC(2007, 8, 16, 15), 'end': Date.UTC(2007, 8, 23, 15)},
      {'id': '10_7', 'start': Date.UTC(2007, 9, 4, 15), 'end': Date.UTC(2007, 9, 7, 15)},
      {'id': '10_8', 'start': Date.UTC(2007, 10, 18, 16), 'end': Date.UTC(2007, 10, 27, 16)},
      {'id': '10_9', 'start': Date.UTC(2007, 11, 5, 16), 'end': Date.UTC(2007, 11, 10, 16)},
      {'id': '10_10', 'start': Date.UTC(2008, 0, 27, 16), 'end': Date.UTC(2008, 1, 4, 16)},
      {'id': '10_11', 'start': Date.UTC(2008, 2, 9, 16), 'end': Date.UTC(2008, 2, 16, 16)},
      {'id': '10_12', 'start': Date.UTC(2008, 3, 9, 15), 'end': Date.UTC(2008, 3, 14, 15)},
      {'id': '10_13', 'start': Date.UTC(2008, 4, 8, 15), 'end': Date.UTC(2008, 4, 11, 15)}
    ]
  }, {
    'id': '11',
    'name': 'Harry Joiner',
    'periods': [
      {'id': '11_1', 'start': Date.UTC(2007, 1, 15, 16), 'end': Date.UTC(2007, 1, 22, 16)},
      {'id': '11_2', 'start': Date.UTC(2007, 3, 9, 15), 'end': Date.UTC(2007, 3, 10, 15)},
      {'id': '11_3', 'start': Date.UTC(2007, 4, 14, 15), 'end': Date.UTC(2007, 4, 20, 15)},
      {'id': '11_4', 'start': Date.UTC(2007, 6, 2, 15), 'end': Date.UTC(2007, 6, 11, 15)},
      {'id': '11_5', 'start': Date.UTC(2007, 7, 8, 15), 'end': Date.UTC(2007, 7, 15, 15)},
      {'id': '11_6', 'start': Date.UTC(2007, 8, 20, 15), 'end': Date.UTC(2007, 8, 27, 15)},
      {'id': '11_7', 'start': Date.UTC(2007, 9, 17, 15), 'end': Date.UTC(2007, 9, 24, 15)},
      {'id': '11_8', 'start': Date.UTC(2007, 11, 10, 16), 'end': Date.UTC(2007, 11, 30, 16)},
      {'id': '11_9', 'start': Date.UTC(2008, 0, 21, 16), 'end': Date.UTC(2008, 0, 24, 16)}
    ]
  }, {
    'id': '12',
    'name': 'Dorothy Michael',
    'periods': [
      {'id': '12_1', 'start': Date.UTC(2007, 1, 20, 16), 'end': Date.UTC(2007, 1, 28, 16)},
      {'id': '12_2', 'start': Date.UTC(2007, 3, 17, 15), 'end': Date.UTC(2007, 3, 23, 15)},
      {'id': '12_3', 'start': Date.UTC(2007, 5, 14, 15), 'end': Date.UTC(2007, 5, 21, 15)},
      {'id': '12_4', 'start': Date.UTC(2007, 6, 12, 15), 'end': Date.UTC(2007, 6, 19, 15)},
      {'id': '12_5', 'start': Date.UTC(2007, 7, 19, 15), 'end': Date.UTC(2007, 7, 27, 15)},
      {'id': '12_6', 'start': Date.UTC(2007, 8, 23, 15), 'end': Date.UTC(2007, 8, 26, 15)},
      {'id': '12_7', 'start': Date.UTC(2007, 11, 6, 16), 'end': Date.UTC(2007, 11, 11, 16)}
    ]
  }, {
    'id': '13',
    'name': 'Kevyn Ford',
    'periods': [
      {'id': '13_1', 'start': Date.UTC(2007, 1, 5, 16), 'end': Date.UTC(2007, 1, 12, 16)},
      {'id': '13_2', 'start': Date.UTC(2007, 1, 26, 16), 'end': Date.UTC(2007, 2, 5, 16)},
      {'id': '13_3', 'start': Date.UTC(2007, 4, 28, 15), 'end': Date.UTC(2007, 4, 31, 15)},
      {'id': '13_4', 'start': Date.UTC(2007, 5, 21, 15), 'end': Date.UTC(2007, 5, 25, 15)},
      {'id': '13_5', 'start': Date.UTC(2007, 6, 4, 15), 'end': Date.UTC(2007, 6, 8, 15)},
      {'id': '13_6', 'start': Date.UTC(2007, 7, 2, 15), 'end': Date.UTC(2007, 7, 12, 15)},
      {'id': '13_7', 'start': Date.UTC(2007, 7, 26, 15), 'end': Date.UTC(2007, 7, 28, 15)},
      {'id': '13_8', 'start': Date.UTC(2007, 9, 2, 15), 'end': Date.UTC(2007, 9, 8, 15)},
      {'id': '13_9', 'start': Date.UTC(2007, 10, 25, 16), 'end': Date.UTC(2007, 10, 28, 16)},
      {'id': '13_10', 'start': Date.UTC(2008, 0, 17, 16), 'end': Date.UTC(2008, 0, 27, 16)},
      {'id': '13_11', 'start': Date.UTC(2008, 1, 24, 16), 'end': Date.UTC(2008, 2, 2, 16)},
      {'id': '13_12', 'start': Date.UTC(2008, 2, 30, 15), 'end': Date.UTC(2008, 3, 6, 15)},
      {'id': '13_13', 'start': Date.UTC(2008, 3, 10, 15), 'end': Date.UTC(2008, 3, 14, 15)},
      {'id': '13_14', 'start': Date.UTC(2008, 3, 21, 15), 'end': Date.UTC(2008, 3, 30, 15)},
      {'id': '13_15', 'start': Date.UTC(2008, 4, 25, 15), 'end': Date.UTC(2008, 4, 27, 15)},
      {'id': '13_16', 'start': Date.UTC(2008, 5, 16, 15), 'end': Date.UTC(2008, 5, 18, 15)},
      {'id': '13_17', 'start': Date.UTC(2008, 6, 8, 15), 'end': Date.UTC(2008, 6, 13, 15)},
      {'id': '13_18', 'start': Date.UTC(2008, 7, 21, 15), 'end': Date.UTC(2008, 7, 24, 15)},
      {'id': '13_19', 'start': Date.UTC(2008, 8, 30, 15), 'end': Date.UTC(2008, 9, 2, 15)},
      {'id': '13_20', 'start': Date.UTC(2008, 10, 6, 16), 'end': Date.UTC(2008, 10, 13, 16)}
    ]
  }, {
    'id': '14',
    'name': 'Rene Kaufmann',
    'periods': [
      {'id': '14_1', 'start': Date.UTC(2007, 0, 18, 16), 'end': Date.UTC(2007, 0, 21, 16)},
      {'id': '14_2', 'start': Date.UTC(2007, 2, 19, 16), 'end': Date.UTC(2007, 2, 25, 15)},
      {'id': '14_3', 'start': Date.UTC(2007, 3, 23, 15), 'end': Date.UTC(2007, 3, 26, 15)},
      {'id': '14_4', 'start': Date.UTC(2007, 4, 29, 15), 'end': Date.UTC(2007, 5, 6, 15)},
      {'id': '14_5', 'start': Date.UTC(2007, 6, 22, 15), 'end': Date.UTC(2007, 6, 29, 15)},
      {'id': '14_6', 'start': Date.UTC(2007, 8, 13, 15), 'end': Date.UTC(2007, 8, 23, 15)},
      {'id': '14_7', 'start': Date.UTC(2007, 9, 29, 16), 'end': Date.UTC(2007, 10, 7, 16)},
      {'id': '14_8', 'start': Date.UTC(2008, 0, 6, 16), 'end': Date.UTC(2008, 0, 8, 16)},
      {'id': '14_9', 'start': Date.UTC(2008, 0, 27, 16), 'end': Date.UTC(2008, 1, 4, 16)},
      {'id': '14_10', 'start': Date.UTC(2008, 1, 24, 16), 'end': Date.UTC(2008, 1, 26, 16)},
      {'id': '14_11', 'start': Date.UTC(2008, 2, 31, 15), 'end': Date.UTC(2008, 3, 8, 15)},
      {'id': '14_12', 'start': Date.UTC(2008, 5, 8, 15), 'end': Date.UTC(2008, 5, 17, 15)},
      {'id': '14_13', 'start': Date.UTC(2008, 5, 22, 15), 'end': Date.UTC(2008, 5, 30, 15)},
      {'id': '14_14', 'start': Date.UTC(2008, 7, 7, 15), 'end': Date.UTC(2008, 7, 18, 15)},
      {'id': '14_15', 'start': Date.UTC(2008, 8, 18, 15), 'end': Date.UTC(2008, 8, 28, 15)},
      {'id': '14_16', 'start': Date.UTC(2008, 9, 13, 15), 'end': Date.UTC(2008, 9, 22, 15)},
      {'id': '14_17', 'start': Date.UTC(2008, 11, 21, 16), 'end': Date.UTC(2008, 11, 30, 16)}
    ]
  }, {
    'id': '15',
    'name': 'John Miller',
    'periods': [
      {'id': '15_1', 'start': Date.UTC(2007, 1, 5, 16), 'end': Date.UTC(2007, 1, 14, 16)},
      {'id': '15_2', 'start': Date.UTC(2007, 2, 26, 15), 'end': Date.UTC(2007, 2, 28, 15)},
      {'id': '15_3', 'start': Date.UTC(2007, 4, 6, 15), 'end': Date.UTC(2007, 4, 14, 15)},
      {'id': '15_4', 'start': Date.UTC(2007, 4, 21, 15), 'end': Date.UTC(2007, 4, 30, 15)},
      {'id': '15_5', 'start': Date.UTC(2007, 5, 25, 15), 'end': Date.UTC(2007, 6, 1, 15)},
      {'id': '15_6', 'start': Date.UTC(2007, 6, 30, 15), 'end': Date.UTC(2007, 7, 5, 15)},
      {'id': '15_7', 'start': Date.UTC(2007, 7, 22, 15), 'end': Date.UTC(2007, 7, 29, 15)},
      {'id': '15_8', 'start': Date.UTC(2007, 9, 8, 15), 'end': Date.UTC(2007, 9, 15, 15)},
      {'id': '15_9', 'start': Date.UTC(2007, 11, 30, 16), 'end': Date.UTC(2008, 0, 6, 16)},
      {'id': '15_10', 'start': Date.UTC(2008, 0, 27, 16), 'end': Date.UTC(2008, 1, 6, 16)},
      {'id': '15_11', 'start': Date.UTC(2008, 1, 24, 16), 'end': Date.UTC(2008, 2, 5, 16)},
      {'id': '15_12', 'start': Date.UTC(2008, 4, 8, 15), 'end': Date.UTC(2008, 4, 15, 15)}
    ]
  }, {
    'id': '16',
    'name': 'Scott Lynch',
    'periods': [
      {'id': '16_1', 'start': Date.UTC(2007, 0, 24, 16), 'end': Date.UTC(2007, 0, 30, 16)},
      {'id': '16_2', 'start': Date.UTC(2007, 1, 18, 16), 'end': Date.UTC(2007, 1, 27, 16)},
      {'id': '16_3', 'start': Date.UTC(2007, 2, 13, 16), 'end': Date.UTC(2007, 2, 28, 15)},
      {'id': '16_4', 'start': Date.UTC(2007, 4, 6, 15), 'end': Date.UTC(2007, 4, 10, 15)},
      {'id': '16_5', 'start': Date.UTC(2007, 4, 21, 15), 'end': Date.UTC(2007, 4, 31, 15)},
      {'id': '16_6', 'start': Date.UTC(2007, 7, 5, 15), 'end': Date.UTC(2007, 7, 12, 15)},
      {'id': '16_7', 'start': Date.UTC(2007, 7, 21, 15), 'end': Date.UTC(2007, 7, 27, 15)},
      {'id': '16_8', 'start': Date.UTC(2007, 8, 2, 15), 'end': Date.UTC(2007, 8, 17, 15)},
      {'id': '16_9', 'start': Date.UTC(2007, 10, 5, 16), 'end': Date.UTC(2007, 10, 14, 16)},
      {'id': '16_10', 'start': Date.UTC(2007, 11, 23, 16), 'end': Date.UTC(2008, 0, 7, 16)},
      {'id': '16_11', 'start': Date.UTC(2008, 0, 27, 16), 'end': Date.UTC(2008, 1, 5, 16)},
      {'id': '16_12', 'start': Date.UTC(2008, 2, 24, 16), 'end': Date.UTC(2008, 3, 2, 15)},
      {'id': '16_13', 'start': Date.UTC(2008, 3, 21, 15), 'end': Date.UTC(2008, 3, 22, 15)},
      {'id': '16_14', 'start': Date.UTC(2008, 4, 11, 15), 'end': Date.UTC(2008, 4, 13, 15)},
      {'id': '16_15', 'start': Date.UTC(2008, 5, 1, 15), 'end': Date.UTC(2008, 5, 8, 15)},
      {'id': '16_16', 'start': Date.UTC(2008, 5, 23, 15), 'end': Date.UTC(2008, 6, 3, 15)},
      {'id': '16_17', 'start': Date.UTC(2008, 6, 20, 15), 'end': Date.UTC(2008, 6, 23, 15)},
      {'id': '16_18', 'start': Date.UTC(2008, 7, 4, 15), 'end': Date.UTC(2008, 7, 6, 15)},
      {'id': '16_19', 'start': Date.UTC(2008, 7, 10, 15), 'end': Date.UTC(2008, 7, 18, 15)},
      {'id': '16_20', 'start': Date.UTC(2008, 8, 17, 15), 'end': Date.UTC(2008, 8, 22, 15)},
      {'id': '16_21', 'start': Date.UTC(2008, 11, 7, 16), 'end': Date.UTC(2008, 11, 16, 16)}
    ]
  }, {
    'id': '17',
    'name': 'Victor Zamalin',
    'periods': [
      {'id': '17_1', 'start': Date.UTC(2007, 0, 15, 16), 'end': Date.UTC(2007, 0, 23, 16)},
      {'id': '17_2', 'start': Date.UTC(2007, 0, 28, 16), 'end': Date.UTC(2007, 1, 5, 16)},
      {'id': '17_3', 'start': Date.UTC(2007, 1, 28, 16), 'end': Date.UTC(2007, 2, 5, 16)},
      {'id': '17_4', 'start': Date.UTC(2007, 2, 22, 16), 'end': Date.UTC(2007, 2, 25, 15)},
      {'id': '17_5', 'start': Date.UTC(2007, 2, 28, 15), 'end': Date.UTC(2007, 3, 2, 15)},
      {'id': '17_6', 'start': Date.UTC(2007, 4, 21, 15), 'end': Date.UTC(2007, 4, 24, 15)},
      {'id': '17_7', 'start': Date.UTC(2007, 5, 18, 15), 'end': Date.UTC(2007, 5, 27, 15)},
      {'id': '17_8', 'start': Date.UTC(2007, 7, 9, 15), 'end': Date.UTC(2007, 7, 13, 15)},
      {'id': '17_9', 'start': Date.UTC(2007, 8, 11, 15), 'end': Date.UTC(2007, 8, 12, 15)},
      {'id': '17_10', 'start': Date.UTC(2007, 8, 27, 15), 'end': Date.UTC(2007, 9, 4, 15)},
      {'id': '17_11', 'start': Date.UTC(2007, 9, 22, 15), 'end': Date.UTC(2007, 10, 5, 16)},
      {'id': '17_12', 'start': Date.UTC(2007, 10, 22, 16), 'end': Date.UTC(2007, 11, 3, 16)},
      {'id': '17_13', 'start': Date.UTC(2007, 11, 30, 16), 'end': Date.UTC(2008, 0, 6, 16)},
      {'id': '17_14', 'start': Date.UTC(2008, 1, 10, 16), 'end': Date.UTC(2008, 1, 20, 16)},
      {'id': '17_15', 'start': Date.UTC(2008, 2, 27, 16), 'end': Date.UTC(2008, 3, 7, 15)}
    ]
  }, {
    'id': '18',
    'name': 'James Sherwood',
    'periods': [
      {'id': '18_1', 'start': Date.UTC(2007, 0, 17, 16), 'end': Date.UTC(2007, 0, 22, 16)},
      {'id': '18_2', 'start': Date.UTC(2007, 1, 4, 16), 'end': Date.UTC(2007, 1, 6, 16)},
      {'id': '18_3', 'start': Date.UTC(2007, 2, 26, 15), 'end': Date.UTC(2007, 3, 2, 15)},
      {'id': '18_4', 'start': Date.UTC(2007, 3, 15, 15), 'end': Date.UTC(2007, 3, 23, 15)},
      {'id': '18_5', 'start': Date.UTC(2007, 4, 7, 15), 'end': Date.UTC(2007, 4, 21, 15)},
      {'id': '18_6', 'start': Date.UTC(2007, 6, 8, 15), 'end': Date.UTC(2007, 6, 10, 15)},
      {'id': '18_7', 'start': Date.UTC(2007, 7, 26, 15), 'end': Date.UTC(2007, 8, 3, 15)},
      {'id': '18_8', 'start': Date.UTC(2007, 9, 1, 15), 'end': Date.UTC(2007, 9, 7, 15)},
      {'id': '18_9', 'start': Date.UTC(2007, 10, 12, 16), 'end': Date.UTC(2007, 10, 13, 16)}
    ]
  }, {
    'id': '19',
    'name': 'Mark Green',
    'periods': [{'id': '19_1', 'start': Date.UTC(2007, 1, 27, 16), 'end': Date.UTC(2007, 1, 28, 16)},
      {'id': '19_2', 'start': Date.UTC(2007, 3, 2, 15), 'end': Date.UTC(2007, 3, 8, 15)},
      {'id': '19_3', 'start': Date.UTC(2007, 3, 23, 15), 'end': Date.UTC(2007, 4, 1, 15)},
      {'id': '19_4', 'start': Date.UTC(2007, 4, 20, 15), 'end': Date.UTC(2007, 4, 28, 15)},
      {'id': '19_5', 'start': Date.UTC(2007, 5, 6, 15), 'end': Date.UTC(2007, 5, 10, 15)},
      {'id': '19_6', 'start': Date.UTC(2007, 5, 17, 15), 'end': Date.UTC(2007, 5, 27, 15)},
      {'id': '19_7', 'start': Date.UTC(2007, 6, 30, 15), 'end': Date.UTC(2007, 7, 2, 15)},
      {'id': '19_8', 'start': Date.UTC(2007, 7, 19, 15), 'end': Date.UTC(2007, 8, 2, 15)},
      {'id': '19_9', 'start': Date.UTC(2007, 9, 10, 15), 'end': Date.UTC(2007, 9, 21, 15)},
      {'id': '19_10', 'start': Date.UTC(2007, 10, 25, 16), 'end': Date.UTC(2007, 11, 9, 16)}
    ]
  }, {
    'id': '20',
    'name': 'Victor Melecio',
    'periods': [
      {'id': '20_1', 'start': Date.UTC(2007, 0, 17, 16), 'end': Date.UTC(2007, 0, 29, 16)},
      {'id': '20_2', 'start': Date.UTC(2007, 1, 14, 16), 'end': Date.UTC(2007, 1, 20, 16)},
      {'id': '20_3', 'start': Date.UTC(2007, 2, 14, 16), 'end': Date.UTC(2007, 2, 26, 15)},
      {'id': '20_4', 'start': Date.UTC(2007, 3, 5, 15), 'end': Date.UTC(2007, 3, 12, 15)},
      {'id': '20_5', 'start': Date.UTC(2007, 3, 30, 15), 'end': Date.UTC(2007, 4, 10, 15)},
      {'id': '20_6', 'start': Date.UTC(2007, 4, 24, 15), 'end': Date.UTC(2007, 4, 29, 15)},
      {'id': '20_7', 'start': Date.UTC(2007, 5, 24, 15), 'end': Date.UTC(2007, 6, 1, 15)},
      {'id': '20_8', 'start': Date.UTC(2007, 6, 11, 15), 'end': Date.UTC(2007, 6, 31, 15)},
      {'id': '20_9', 'start': Date.UTC(2007, 8, 17, 15), 'end': Date.UTC(2007, 8, 23, 15)},
      {'id': '20_10', 'start': Date.UTC(2007, 9, 30, 16), 'end': Date.UTC(2007, 10, 18, 16)},
      {'id': '20_11', 'start': Date.UTC(2007, 10, 20, 16), 'end': Date.UTC(2007, 11, 2, 16)},
      {'id': '20_12', 'start': Date.UTC(2007, 11, 16, 16), 'end': Date.UTC(2007, 11, 31, 16)},
      {'id': '20_13', 'start': Date.UTC(2008, 0, 28, 16), 'end': Date.UTC(2008, 1, 6, 16)},
      {'id': '20_14', 'start': Date.UTC(2008, 2, 3, 16), 'end': Date.UTC(2008, 2, 10, 16)},
      {'id': '20_15', 'start': Date.UTC(2008, 3, 20, 15), 'end': Date.UTC(2008, 3, 28, 15)},
      {'id': '20_16', 'start': Date.UTC(2008, 4, 25, 15), 'end': Date.UTC(2008, 4, 27, 15)},
      {'id': '20_17', 'start': Date.UTC(2008, 5, 30, 15), 'end': Date.UTC(2008, 6, 3, 15)}
    ]
  }];
}
