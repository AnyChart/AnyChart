var rawData = [
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
