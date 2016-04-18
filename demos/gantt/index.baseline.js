anychart.onDocumentReady(function() {
  //create data tree on our data
  var treeData = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);

  //create project gantt chart
  chart = anychart.ganttProject();

  var toolbar = anychart.ui.ganttToolbar();
  toolbar.container('container');
  toolbar.target(chart);
  toolbar.draw();

  //set container id for the chart
  chart.container('container');

  //set data for the chart
  chart.data(treeData);

  //set start splitter position settings
  chart.splitterPosition(460);

  chart.rowSelectedFill('#D4DFE8');
  chart.rowHoverFill('#EAEFF3');

  //Toolbar is rendered in the same container as chart. Toolbar displaces chart and it hides the bottom of chart.
  //Adding a bottom margin makes the bottom of chart visible again.
  chart.margin(28, 0, 0, 0);

  //get chart data grid link to set column settings
  var dataGrid = chart.dataGrid();

  //set first column settings
  var firstColumn = dataGrid.column(0);
  firstColumn.cellTextSettings().hAlign('center');

  //set second column settings
  var secondColumn = dataGrid.column(1);
  secondColumn.width(200);
  secondColumn.cellTextSettingsOverrider(labelTextSettingsFormatter);

  //set third column settings
  var thirdColumn = dataGrid.column(2);
  thirdColumn.title('Baseline Start');
  thirdColumn.width(100);
  thirdColumn.textFormatter(thirdColumnTextFormatter);
  thirdColumn.cellTextSettingsOverrider(labelTextSettingsFormatter);

  //set fourth column settings
  var fourthColumn = dataGrid.column(3);
  fourthColumn.title().text('Baseline End');
  fourthColumn.width(100);
  fourthColumn.textFormatter(fourthColumnTextFormatter);
  fourthColumn.cellTextSettingsOverrider(labelTextSettingsFormatter);

  //--------------------------------------------------
  // Setup timeline
  //--------------------------------------------------
  var moccasin_border = '#B8AA96';
  var moccasin_bottom = '#CFC0A9';
  var moccasin_middle = '#E6D5BC';
  var moccasin_top = '#E8D9C3';

  var rosybrown_border = '#9B9292';
  var rosybrown_bottom = '#AFA4A4';
  var rosybrown_middle = '#C2B6B6';
  var rosybrown_top = '#C8BDBD';

  var brown_border = '#6B5D5D';
  var brown_bottom = '#796868';
  var brown_middle = '#867474';
  var brown_top = '#928282';
  var tl = chart.getTimeline();

  tl.baseFill({
    'angle': 90,
    'keys': [
      {'color': moccasin_bottom, 'position': 0},
      {'color': moccasin_middle, 'position': 0.38},
      {'color': moccasin_top, 'position': 1}
    ]
  });

  tl.baseStroke('#000');

  tl.progressFill({
    'angle': 90,
    'keys': [
      {'color': rosybrown_bottom, 'position': 0},
      {'color': rosybrown_middle, 'position': 0.38},
      {'color': rosybrown_top, 'position': 1}
    ]
  });

  tl.progressStroke('#000');

  tl.baselineFill({
    'angle': 90,
    'keys': [
      {'color': brown_bottom, 'position': 0},
      {'color': brown_middle, 'position': 0.38},
      {'color': brown_top, 'position': 1}
    ]
  });

  tl.baselineStroke('#000');

  tl.connectorFill(brown_border);
  tl.connectorStroke(brown_border);

  tl.selectedElementFill('#f00');

  //initiate chart drawing
  chart.draw();

  //zoom chart to specified date
  chart.zoomTo(Date.UTC(2010, 0, 8, 15), Date.UTC(2010, 3, 25, 20));

  //--------------------------------------------------
  // External events
  //--------------------------------------------------
  //chart.listen(anychart.enums.EventType.ROW_CLICK, function(e) {
  //  //e.preventDefault();
  //  console.log('Clicked:', e['item'].get('name'));
  //});
  //
  //chart.listen(anychart.enums.EventType.ROW_SELECT, function(e) {
  //  console.log('Selected:', e['item'].get('name'));
  //});
  //
  //chart.listen(anychart.enums.EventType.ROW_DBL_CLICK, function(e) {
  //  //e.preventDefault();
  //  console.log('Double clicked:', e['item'].get('name'));
  //});
  //
  //chart.listen(anychart.enums.EventType.ROW_MOUSE_OVER, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse over:', e['item'].get('name'));
  //});
  //
  chart.listen(anychart.enums.EventType.ROW_MOUSE_MOVE, function(e) {
    //e.preventDefault();
    //console.log('Mouse move:', e['item'].get('name'));
    //console.log(e['itemHeightMouseRatio']);
  });
  //
  //chart.listen(anychart.enums.EventType.ROW_MOUSE_OUT, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse out:', e['item'].get('name'));
  //});
  //
  //chart.listen(anychart.enums.EventType.ROW_MOUSE_UP, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse up:', e['item'].get('name'));
  //});
  //
  //chart.listen(anychart.enums.EventType.ROW_MOUSE_DOWN, function(e) {
  //  //e.preventDefault();
  //  console.log('Mouse down:', e['item'].get('name'));
  //});
});

function getData() {
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



//add bold and italic text settings to all parent items
function labelTextSettingsFormatter(label, dataItem) {
  if (dataItem.numChildren()) {
    label.fontWeight('bold').fontStyle('italic');
  }
}

//do pretty formatting for dates in third column
function thirdColumnTextFormatter(item) {
  var field = item.get(anychart.enums.GanttDataFields.BASELINE_START);

  //format base line text
  if (field) {
    var baselineStart = new Date(field);
    return formatDate(baselineStart.getUTCMonth() + 1) + '/' +
        formatDate(baselineStart.getUTCDate()) + '/' + baselineStart.getUTCFullYear() + ' ' +
        formatDate(baselineStart.getUTCHours()) + ':' +
        formatDate(baselineStart.getUTCMinutes());
  } else {
    //format milestone text
    var actualStart = item.get(anychart.enums.GanttDataFields.ACTUAL_START);
    var actualEnd = item.get(anychart.enums.GanttDataFields.ACTUAL_END);
    if ((actualStart == actualEnd) || (actualStart && !actualEnd)) {
      var start = new Date(actualStart);
      return formatDate(start.getUTCMonth() + 1) + '/' +
          formatDate(start.getUTCDate()) + '/' + start.getUTCFullYear() + ' ' +
          formatDate(start.getUTCHours()) + ':' +
          formatDate(start.getUTCMinutes());
    }
    return '';
  }
}

//do pretty formatting for dates in fourth column
function fourthColumnTextFormatter(item) {
  var field = item.get(anychart.enums.GanttDataFields.BASELINE_END);
  if (field) {
    var baselineEnd = new Date(field);
    return formatDate((baselineEnd.getUTCMonth() + 1)) + '/' +
        formatDate(baselineEnd.getUTCDate()) + '/' + baselineEnd.getUTCFullYear() + ' ' +
        formatDate(baselineEnd.getUTCHours()) + ':' +
        formatDate(baselineEnd.getUTCMinutes());
  } else {
    return '';
  }
}

//do pretty formatting for passed date unit
function formatDate(dateUnit) {
  if (dateUnit < 10) dateUnit = '0' + dateUnit;
  return dateUnit + '';
}