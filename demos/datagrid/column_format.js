var dataGrid;

anychart.onDocumentReady(function() {

  var stage = acgraph.create('container');
  stage.suspend();

  var treeData = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);

  dataGrid = anychart.ui.dataGrid();
  dataGrid.container(stage);
  dataGrid.data(treeData);

  var commonLogColumn = dataGrid.column(2);
  commonLogColumn.title('Common Log');
  commonLogColumn.setColumnFormat('commonLog', anychart.enums.ColumnFormats.DATE_COMMON_LOG);

  var iso8601Column = dataGrid.column(3);
  iso8601Column.title('iso8601');
  iso8601Column.setColumnFormat('iso8601', anychart.enums.ColumnFormats.DATE_ISO_8601);

  var usShortColumn = dataGrid.column(4);
  usShortColumn.title('US Short');
  usShortColumn.setColumnFormat('usShort', anychart.enums.ColumnFormats.DATE_US_SHORT);

  var dmyColumn = dataGrid.column(5);
  dmyColumn.title('DMY dots');
  dmyColumn.setColumnFormat('dmy', anychart.enums.ColumnFormats.DATE_DMY_DOTS);

  var percentColumn = dataGrid.column(6);
  percentColumn.title('%');
  percentColumn.setColumnFormat('percent', anychart.enums.ColumnFormats.PERCENT);

  var financialColumn = dataGrid.column(7);
  financialColumn.title('Spent, $');
  financialColumn.setColumnFormat('financial', anychart.enums.ColumnFormats.FINANCIAL);

  var customColumn = dataGrid.column(8);
  customColumn.title('Custom');
  customColumn.setColumnFormat('custom', {
    'formatter': function(val) {
      if (typeof val == 'number') {
        return val < 100 ? ('Small custom text for ' + val) : ('Big data, big text for ' + val);
      } else if (typeof val == 'boolean') {
        return 'Boolean is ' + val;
      } else {
        return 'Boring text is ' + val;
      }
    },
    'textStyle': {
      'fontDecoration': 'underline',
      'fontWeight': 'bold',
      'fontColor': 'green',
      'hAlign': 'center'
    },
    'width': 250
  });

  dataGrid.draw();
  dataGrid.listen('signal', dataGrid.draw, false, dataGrid);

  stage.resume();
});


function getData() {
  return [
    {
      id: '1',
      name: 'Lorem ipsum dolor sit amet',
      commonLog: Date.UTC(2014, 3, 14),
      iso8601: Date.UTC(2015, 9, 11),
      usShort: Date.UTC(2013, 4, 25),
      dmy: Date.UTC(2013, 5, 21),
      percent: 0.1245,
      financial: 13509.4,
      custom: 50
    },
    {
      id: '2',
      name: 'Integer placerat ligula nunc, vitae maximus nisi convallis vitae',
      commonLog: Date.UTC(2015, 2, 11),
      iso8601: Date.UTC(2014, 0, 3),
      usShort: Date.UTC(2015, 2, 17),
      dmy: Date.UTC(2014, 2, 4),
      percent: 0.901,
      financial: 4501400,
      custom: false
    },
    {
      id: '3',
      name: 'Donec condimentum pharetra tincidunt',
      commonLog: Date.UTC(2013, 10, 10),
      iso8601: Date.UTC(2014, 7, 15),
      usShort: Date.UTC(2012, 3, 13),
      dmy: Date.UTC(2015, 4, 14),
      percent: 0.1231,
      financial: 310,
      custom: 'Just a text'
    },
    {
      id: '4',
      name: 'Fusce lobortis vehicula ante',
      commonLog: Date.UTC(2011, 0, 25),
      iso8601: Date.UTC(2012, 2, 20),
      usShort: Date.UTC(2012, 6, 1),
      dmy: Date.UTC(2014, 2, 4),
      percent: 1,
      financial: 1050040.12,
      custom: true
    },
    {
      id: '5',
      name: 'Class aptent taciti sociosqu ad litora torquent',
      commonLog: Date.UTC(2013, 10, 1),
      iso8601: Date.UTC(2014, 2, 20),
      usShort: Date.UTC(2009, 7, 11),
      dmy: Date.UTC(2011, 10, 14),
      percent: '25%',
      financial: 24261000.5,
      custom: 'Hello world'
    },
    {
      id: '6',
      name: 'Nulla facilisi',
      commonLog: Date.UTC(2015, 0, 13),
      iso8601: Date.UTC(2012, 1, 13),
      usShort: Date.UTC(2013, 3, 3),
      dmy: Date.UTC(2012, 5, 24),
      percent: '13.43',
      financial: 100,
      custom: 21700
    },
    {
      id: '7',
      name: 'Aliquam erat volutpat',
      commonLog: Date.UTC(2014, 10, 25),
      iso8601: Date.UTC(2011, 3, 23),
      usShort: Date.UTC(2015, 6, 20),
      dmy: Date.UTC(2015, 2, 4),
      percent: 0.5790,
      financial: 14000,
      custom: 'No faith'
    }
    ,
    {
      id: '8',
      name: 'Phasellus in iaculis felis',
      commonLog: Date.UTC(2015, 11, 2),
      iso8601: Date.UTC(2014, 10, 13),
      usShort: Date.UTC(2016, 2, 14),
      dmy: Date.UTC(2012, 4, 11),
      percent: 0.6,
      financial: 25000,
      custom: 100
    }

  ];
}

