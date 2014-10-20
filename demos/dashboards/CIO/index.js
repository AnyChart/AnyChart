anychart.onDocumentReady(function() {
  // region data
  // columns are: ['System', 'Month', 'Availability']
  var SARawData = [
    ['Network', '2014/10', 100],
    ['Network', '2014/09', 97],
    ['Network', '2014/08', 98],
    ['Network', '2014/07', 98],
    ['Network', '2014/06', 99],
    ['Network', '2014/05', 100],
    ['Network', '2014/04', 99],
    ['Network', '2014/03', 98],
    ['Network', '2014/02', 98],
    ['Network', '2014/01', 97],
    ['Network', '2013/12', 99],
    ['Network', '2013/11', 100],
    ['ERP', '2014/10', 100],
    ['ERP', '2014/09', 97],
    ['ERP', '2014/08', 98],
    ['ERP', '2014/07', 98],
    ['ERP', '2014/06', 99],
    ['ERP', '2014/05', 100],
    ['ERP', '2014/04', 99],
    ['ERP', '2014/03', 98],
    ['ERP', '2014/02', 98],
    ['ERP', '2014/01', 97],
    ['ERP', '2013/12', 99],
    ['ERP', '2013/11', 100],
    ['Data Warehouse', '2014/10', 100],
    ['Data Warehouse', '2014/09', 97],
    ['Data Warehouse', '2014/08', 70],
    ['Data Warehouse', '2014/07', 98],
    ['Data Warehouse', '2014/06', 99],
    ['Data Warehouse', '2014/05', 100],
    ['Data Warehouse', '2014/04', 99],
    ['Data Warehouse', '2014/03', 98],
    ['Data Warehouse', '2014/02', 98],
    ['Data Warehouse', '2014/01', 97],
    ['Data Warehouse', '2013/12', 99],
    ['Data Warehouse', '2013/11', 100],
    ['Web Site', '2014/10', 100],
    ['Web Site', '2014/09', 97],
    ['Web Site', '2014/08', 98],
    ['Web Site', '2014/07', 98],
    ['Web Site', '2014/06', 99],
    ['Web Site', '2014/05', 100],
    ['Web Site', '2014/04', 99],
    ['Web Site', '2014/03', 98],
    ['Web Site', '2014/02', 98],
    ['Web Site', '2014/01', 97],
    ['Web Site', '2013/12', 99],
    ['Web Site', '2013/11', 100],
    ['Email', '2014/10', 100],
    ['Email', '2014/09', 97],
    ['Email', '2014/08', 98],
    ['Email', '2014/07', 98],
    ['Email', '2014/06', 99],
    ['Email', '2014/05', 100],
    ['Email', '2014/04', 99],
    ['Email', '2014/03', 98],
    ['Email', '2014/02', 98],
    ['Email', '2014/01', 97],
    ['Email', '2013/12', 99],
    ['Email', '2013/11', 100],
    ['HR', '2014/10', 100],
    ['HR', '2014/09', 97],
    ['HR', '2014/08', 98],
    ['HR', '2014/07', 98],
    ['HR', '2014/06', 99],
    ['HR', '2014/05', 100],
    ['HR', '2014/04', 99],
    ['HR', '2014/03', 98],
    ['HR', '2014/02', 98],
    ['HR', '2014/01', 97],
    ['HR', '2013/12', 99],
    ['HR', '2013/11', 100],
    ['Problem Tracking', '2014/10', 100],
    ['Problem Tracking', '2014/09', 97],
    ['Problem Tracking', '2014/08', 98],
    ['Problem Tracking', '2014/07', 98],
    ['Problem Tracking', '2014/06', 99],
    ['Problem Tracking', '2014/05', 100],
    ['Problem Tracking', '2014/04', 99],
    ['Problem Tracking', '2014/03', 98],
    ['Problem Tracking', '2014/02', 98],
    ['Problem Tracking', '2014/01', 97],
    ['Problem Tracking', '2013/12', 99],
    ['Problem Tracking', '2013/11', 100]
  ];
  var SAAcceptedAvailability = {
    'Network': 99,
    'ERP': 98,
    'Data Warehouse': 98,
    'Web Site': 98,
    'Email': 98,
    'HR': 96,
    'Problem Tracking': 93
  };
  var HCCPUData = [
    ['2014/10/15 00:00', 98],
    ['2014/10/15 01:00', 99],
    ['2014/10/15 02:00', 95],
    ['2014/10/15 03:00', 93],
    ['2014/10/15 04:00', 92],
    ['2014/10/15 05:00', 90],
    ['2014/10/15 06:00', 85],
    ['2014/10/15 07:00', 84],
    ['2014/10/15 08:00', 87],
    ['2014/10/15 09:00', 90],
    ['2014/10/15 10:00', 86],
    ['2014/10/15 11:00', 84],
    ['2014/10/15 12:00', 80],
    ['2014/10/15 13:00', 76],
    ['2014/10/15 14:00', 78],
    ['2014/10/15 15:00', 80],
    ['2014/10/15 16:00', 85],
    ['2014/10/15 17:00', 86],
    ['2014/10/15 18:00', 90],
    ['2014/10/15 19:00', 94],
    ['2014/10/15 20:00', 97],
    ['2014/10/15 21:00', 97],
    ['2014/10/15 22:00', 98],
    ['2014/10/15 23:00', 97]
  ];
  var HCCPURanges = [0, 80, 90, 100];
  var HCStorage = [
    ['2014/10', 100],
    ['2014/09', 97],
    ['2014/08', 98],
    ['2014/07', 98],
    ['2014/06', 99],
    ['2014/05', 100],
    ['2014/04', 99],
    ['2014/03', 98],
    ['2014/02', 98],
    ['2014/01', 97],
    ['2013/12', 99],
    ['2013/11', 100]
  ];
  var HCStorageRanges = [0, 60, 80, 100];
  var HCNetwork = [
    ['2014/10', 100],
    ['2014/09', 97],
    ['2014/08', 98],
    ['2014/07', 98],
    ['2014/06', 99],
    ['2014/05', 100],
    ['2014/04', 99],
    ['2014/03', 98],
    ['2014/02', 98],
    ['2014/01', 97],
    ['2013/12', 99],
    ['2013/11', 100]
  ];
  var HCNetworkRanges = [0, 60, 80, 100];
  var DNT6MonthAvgData = [
    [0, 153324],
    [1, 145225],
    [2, 104978],
    [3, 43465],
    [4, 12647],
    [5, 38766],
    [6, 67343],
    [7, 158097],
    [8, 198630],
    [9, 196786],
    [10, 187905],
    [11, 149784],
    [12, 127896],
    [13, 147225],
    [14, 136120],
    [15, 126890],
    [16, 106456],
    [17, 136804],
    [18, 67845],
    [19, 46587],
    [20, 22678],
    [21, 13479],
    [22, 46789],
    [23, 176098]
  ];
  var DNTWeekAvgData = [
    [0, 164324],
    [1, 145225],
    [2, 104978],
    [3, 43465],
    [4, 12647],
    [5, 38766],
    [6, 67343],
    [7, 158097],
    [8, 198630],
    [9, 196786],
    [10, 187905],
    [11, 149784],
    [12, 127896],
    [13, 147225],
    [14, 136120],
    [15, 126890],
    [16, 106456],
    [17, 136804],
    [18, 67845],
    [19, 46587],
    [20, 22678],
    [21, 13479],
    [22, 46789],
    [23, 176098]
  ];
  var DNTYesterdayData = [
    [0, 176456],
    [1, 157951],
    [2, 114978],
    [3, 44645],
    [4, 14636],
    [5, 39123],
    [6, 68234],
    [7, 162234],
    [8, 199630],
    [9, 197146],
    [10, 187905],
    [11, 149784],
    [12, 127896],
    [13, 147225],
    [14, 136120],
    [15, 126890],
    [16, 106456],
    [17, 136804],
    [18, 67845],
    [19, 46587],
    [20, 22678],
    [21, 13479],
    [22, 46789],
    [23, 176098]
  ];
  var KNSMExpensesData = [
    ['2014/10', 100000],
    ['2014/09', 97000],
    ['2014/08', 98000],
    ['2014/07', 98000],
    ['2014/06', 99000],
    ['2014/05', 100000],
    ['2014/04', 99000],
    ['2014/03', 98000],
    ['2014/02', 98000],
    ['2014/01', 97000]
  ];
  var KNSMExpensesRanges = [0, 90, 110, 150];
  var KNSMSatisfactionData = [
    ['2014/10', 90],
    ['2014/09', 97],
    ['2014/08', 98],
    ['2014/07', 98],
    ['2014/06', 99],
    ['2014/05', 100],
    ['2014/04', 99],
    ['2014/03', 98],
    ['2014/02', 98],
    ['2014/01', 97]
  ];
  var KNSMSatisfactionRanges = [150, 100, 80, 0];
  var KNSMProblemsData = [
    ['2014/10', 45],
    ['2014/09', 97],
    ['2014/08', 95],
    ['2014/07', 87],
    ['2014/06', 99],
    ['2014/05', 78],
    ['2014/04', 99],
    ['2014/03', 86],
    ['2014/02', 98],
    ['2014/01', 97]
  ];
  var KNSMProblemsRanges = [0, 90, 110, 150];
  var MPMData = [
    ['ERP Upgrade', 'Full system test', '2014/10/24'],
    ['Add services data to DW', 'ETL coding', '2014/10/10'],
    ['Upgrade mainframe OS', 'Prepare plan', '2014/10/17'],
    ['Disaster recovery site', 'Install hardware', '2014/10/20'],
    ['Budgeting system', 'Hire team', '2014/10/02'],
    ['Web site face-lift', 'Move into production', '2014/10/22']
  ];
  var TPQData = [
    ['Professional service module', 'Pending available staff', true, '2014/10/22'],
    ['Upgrade MS Office', 'Cost-benefit analysis', false, '2014/12/01'],
    ['Failover for ERP', 'Preparing proposal', false, '2015/01/30'],
    ['Upgrade data warehouse HW', 'Evaluating options', true, '2015/02/13'],
    ['Executive dashboard', 'Vendor assessment', false, '2015/05/02']
  ];
  var Today = '2014/10/15';
  // endregion

  // region utility methods to ease up some routines
  /**
   * Utility function to setup property to a whole row.
   * @param {anychart.elements.Table} table Table to setup row for.
   * @param {number} rowIndex Row index.
   * @param {!Array.<string>|string} propNameOrChain Property name to access, like 'border' or chain of property names
   *    to access, e.g. ['content', 'fontSize']. Note: no checking on valid results is done, so it's up to you to
   *    ensure property existence.
   * @param {*|Array.<*>} propValueOrArray Value to set.
   */
  function setupRowProp(table, rowIndex, propNameOrChain, propValueOrArray) {
    if (rowIndex >= table.rowsCount()) return;
    if (typeof propNameOrChain == 'string') propNameOrChain = [propNameOrChain];
    var chainLastIndex = propNameOrChain.length - 1;
    for (var i = 0; i < table.colsCount(); i++) {
      var prop = table.getCell(rowIndex, i);
      for (var j = 0; j < chainLastIndex; j++) {
        prop = prop[propNameOrChain[j]]();
        if (!prop) break;
      }
      if (!prop) continue;
      if (typeof propValueOrArray != 'string' && typeof propValueOrArray.length == 'number')
        prop[propNameOrChain[chainLastIndex]].apply(prop, propValueOrArray);
      else
        prop[propNameOrChain[chainLastIndex]](propValueOrArray);
    }
  }

  /**
   * Utility function to setup property to a whole column.
   * @param {anychart.elements.Table} table Table to setup row for.
   * @param {number} colIndex Row index.
   * @param {!Array.<string>|string} propNameOrChain Property name to access, like 'border' or chain of property names
   *    to access, e.g. ['content', 'fontSize']. Note: no checking on valid results is done, so it's up to you to
   *    ensure property existence.
   * @param {*|Array.<*>} propValueOrArray Value to set.
   * @param {boolean=} opt_skipFirstRow Set true to skip first row.
   */
  function setupColProp(table, colIndex, propNameOrChain, propValueOrArray, opt_skipFirstRow) {
    if (colIndex >= table.colsCount()) return;
    if (typeof propNameOrChain == 'string') propNameOrChain = [propNameOrChain];
    var chainLastIndex = propNameOrChain.length - 1;
    for (var i = opt_skipFirstRow ? 1 : 0; i < table.rowsCount(); i++) {
      var prop = table.getCell(i, colIndex);
      for (var j = 0; j < chainLastIndex; j++) {
        prop = prop[propNameOrChain[j]]();
        if (!prop) break;
      }
      if (!prop) continue;
      if (typeof propValueOrArray != 'string' && typeof propValueOrArray.length == 'number')
        prop[propNameOrChain[chainLastIndex]].apply(prop, propValueOrArray);
      else
        prop[propNameOrChain[chainLastIndex]](propValueOrArray);
    }
  }

  /**
   * Utility function to calculate the sum of field values over a view.
   * @param {anychart.data.View} view
   * @param {string} fieldName
   * @return {number}
   */
  function calcSum(view, fieldName) {
    // calculating average
    var sum = 0;
    var count = 0;
    // we iterate over the view and sum up the field value
    var iter = view.getIterator();
    while (iter.advance()) {
      count++;
      sum += iter.get(fieldName);
    }
    return sum;
  }

  /**
   * Utility function to calculate the average value of the field over a view.
   * @param {anychart.data.View} view
   * @param {string} fieldName
   * @return {number}
   */
  function calcAvg(view, fieldName) {
    return calcSum(view, fieldName) / view.getIterator().getRowsCount();
  }

  /**
   * Creates a small tight date time scale (no gaps at all outside of the range).
   * @return {anychart.scales.DateTime}
   */
  function createTightDTScale() {
    // removing gaps and ticks to make the line fill the horizontal space of the cell
    return anychart.scales.dateTime()
        .minimumGap(0)
        .maximumGap(0)
        .ticks([]);
  }

  /**
   * Short way to add thousand separators to the number.
   * @param {number} value
   * @param {number=} opt_decimalDigits
   * @return {string}
   */
  function formatNumber(value, opt_decimalDigits) {
    return value.toFixed(opt_decimalDigits || 2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  function formatDate(value) {
    var m = value.getMonth() + 1;
    if (m < 10) m = '0' + m;
    var d = value.getDate();
    if (d < 10) d = '0' + d;
    var y = value.getFullYear() - 2000;
    return m + '/' + d + '/' + y;
  }

  /**
   * Returns difference between two dates in days. Result is positive, if date2 is later than date1.
   * @param {Date} date1
   * @param {Date} date2
   * @return {number}
   */
  function getDiffInDays(date1, date2) {
    function isLeapYear(year) {
      // Leap year logic; the 4-100-400 rule
      return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    }
    function getNumberOfDaysInMonth(year, month) {
      switch (month) {
        case 1:
          return isLeapYear(year) ? 29 : 28;
        case 3:
        case 5:
        case 8:
        case 10:
          return 30;
      }
      return 31;
    }
    function getNumberOfDaysInYear(year) {
      return isLeapYear(year) ? 366 : 365;
    }
    var sign = 1;
    if (date1.getTime() > date2.getTime()) {
      var tmp = date1;
      date1 = date2;
      date2 = tmp;
      sign = -1;
    }
    var y1 = date1.getUTCFullYear();
    var y2 = date2.getUTCFullYear();
    var m1 = date1.getUTCMonth();
    var m2 = date2.getUTCMonth();
    var d1 = date1.getUTCDate();
    var d2 = date2.getUTCDate();
    var res = 0, i;
    if (y1 < y2) {
      for (i = y1 + 1; i < y2; i++)
        res += getNumberOfDaysInYear(i);
      for (i = m1 + 1; i < 12; i++)
        res += getNumberOfDaysInMonth(y1, i);
      for (i = 0; i < m2; i++)
        res += getNumberOfDaysInMonth(y2, i);
      res += getNumberOfDaysInMonth(y1, m1) - d1;
      res += d2;
    } else if (m1 < m2) {
      for (i = m1 + 1; i < m2; i++)
        res += getNumberOfDaysInMonth(y1, i);
      res += getNumberOfDaysInMonth(y1, m1) - d1;
      res += d2;
    } else {
      res += d2 - d1;
    }
    return res * sign;
  }
  // endregion

  anychart.fontFamily = 'verdana, helvetica, arial, sans-serif';

  function formSAReport(rawData, acceptedAvail) {
    // we are not going to need different mapping on the raw data, so we map it at the same time
    // we use 'System' and 'Availability' fields in our calculations and 'x' and 'value' fields are used by the charts.
    var rawView = anychart.data.set(rawData).mapAs({'System': [0], 'Availability': [2], 'x': [1], 'value': [2]});

    // we need this to create filtering functions
    function filterBySystem(system) {
      return function(value) {
        return system == value;
      }
    }

    // we use common scales for charts in columns to make them comparable
    var bulletScale = anychart.scales.linear();
    // settings manual minimum and maximum to show the range we need.
    bulletScale.minimum(85).maximum(100);

    var lineScale = createTightDTScale();

    var markers = anychart.elements.markersFactory();

    // preparing report data
    var contents = [['Last 12 Month', null, 'System', 'Availability %', null]];
    // forming a row for each system
    for (var system in acceptedAvail) {
      var row = [];

      // preparing data for the row
      var systemData = rawView.filter('System', filterBySystem(system));
      var avgAvail = calcAvg(systemData, 'Availability');

      // we will need one line chart per system
      // we don't need any other chart elements besides the chart line, so we can use line series directly here.
      var line = anychart.cartesian.series.line(systemData);
      // we set come line properties to make it look better and also we set the common x scale
      line.stroke('2 #000');
      line.xScale(lineScale);

      var marker;
      if (avgAvail < acceptedAvail[system])
        marker = markers.add(null);
      else
        marker = null;

      // we will also need one bullet chart per system
      var bullet = anychart.bullet.chart([{'value': avgAvail, 'type': 'line', gap: 0.4}]);
      bullet.range(0).from(acceptedAvail[system]).to(100).fill('#ccc');
      bullet.scale(bulletScale);
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background().enabled(true).stroke('#ccc').fill('#fff');
      bullet.padding(0);
      bullet.margin(0);

      row[0] = line;
      row[1] = marker;
      row[2] = system;
      row[3] = bullet;
      row[4] = avgAvail.toFixed(1) + '%';
      contents.push(row);
    }
    var axis = anychart.elements.axis();
    axis.scale(bulletScale);
    axis.orientation('bottom');
    axis.staggerMode(false);
    axis.minorTicks().enabled(false);
    axis.title().enabled(false);
    axis.labels()
        .fontSize('9px')
        .textFormatter(function(value) {
          return value['tickValue'] + '%';
        });
    axis.ticks().stroke('#ccc');
    axis.stroke('#ccc');

    contents.push([null, null, null, axis, null]);

    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableHeight = (contents.length - 1) * 24 + 20;
    var reportBounds = anychart.math.rect(0, 0, 435, tableHeight + titleHeight);

    markers.anchor('center');
    markers.position('center');
    markers.type('circle');
    markers.fill('#c00');
    markers.stroke('2 #900');
    markers.size(5);

    var title = anychart.elements.title();
    title.container(container);
    title.parentBounds(reportBounds);
    title.fontFamily('verdana, helvetica, arial, sans-serif');
    title.fontWeight('normal');
    title.text('<span style="color:#86cf38; font-size: 15px;">System Availability</span> <span style="color: #666666; font-size: 10px; font-weight: normal;">(last 30 days)</span>');
    title.orientation('top');
    title.align('left');
    title.vAlign('bottom');
    title.margin(0);
    title.padding(0);
    title.height(titleHeight);
    title.useHtml(true);
    title.draw();

    var legendParentBounds = anychart.math.rect(reportBounds.left, reportBounds.top, reportBounds.width, titleHeight);
    var legend = anychart.elements.legend();
    legend.fontSize('9px');
    legend.itemsLayout('horizontal');
    legend.itemsProvider([
      {
        'index': 0,
        'text': 'Actual',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.6;
          path.clear()
              .moveTo(x, y - height / 2)
              .lineTo(x, y + height / 2)
              .lineTo(x + 2, y + height / 2)
              .lineTo(x + 2, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#000'
      },
      {
        'index': 1,
        'text': 'Acceptable',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path.clear()
              .moveTo(x - 2, y - height / 2)
              .lineTo(x - 2, y + height / 2)
              .lineTo(x + 3, y + height / 2)
              .lineTo(x + 3, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#ccc'
      }
    ]);
    legend.iconTextSpacing(0);
    legend.container(container);
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.align('right');
    legend.position('bottom');
    legend.padding(0);
    legend.margin(0);
    legend.background().enabled(false);
    legend.itemsSpacing(0);
    legend.parentBounds(legendParentBounds);
    legend.draw();

    var table = anychart.elements.table().contents(contents);
    table.top(title.getRemainingBounds().getTop());
    table.height(tableHeight);
    table.width(reportBounds.width);
    table.rowHeight(0, 20);
    table.colWidth(0, 130);
    table.colWidth(1, 20);
    table.colWidth(2, 115);
    table.colWidth(3, 130);
    table.colWidth(4, 40);
    table.cellBorder(null);
    table.cellTextFactory().padding(0).vAlign('center').hAlign('left');
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 3, 'padding', [5, 2, 4], true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    table.getCell(table.rowsCount() - 1, 3).padding(0, 2, 5);
    table.getCell(0, 3).colSpan(2).content().hAlign('right');
    table.container(container);
    table.draw();

    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  function formHCReport(CPUData, StorageData, NetworkData, CPURanges, StorageRanges, NetworkRanges) {
    var lines = [], bullets = [], avgs = [];
    var bulletScale = anychart.scales.linear();
    bulletScale.minimum(0).maximum(100);
    bulletScale.ticks().count(3);
    bulletScale.minorTicks().count(3);

    for (var i = 0; i < 3; i++) {
      var data = anychart.data.set(arguments[i]).mapAs();

      var avg = calcAvg(data, 'value');

      // we will need one line chart per system
      // we don't need any other chart elements besides the chart line, so we can use line series directly here.
      var line = anychart.cartesian.series.line(data);
      // we set come line properties to make it look better and also we set the common x scale
      line.stroke('2 #000');
      line.xScale(createTightDTScale());

      // we will also need one bullet chart per system
      var bullet = anychart.bullet.chart([{'value': avg, 'type': 'bar', gap: 0.6}]);
      bullet.range(0).from(arguments[3 + i][0]).to(arguments[3 + i][1]).fill('#ccc');
      bullet.range(1).from(arguments[3 + i][1]).to(arguments[3 + i][2]).fill('#aaa');
      bullet.range(2).from(arguments[3 + i][2]).to(arguments[3 + i][3]).fill('#666');
      bullet.scale(bulletScale);
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background().enabled(false);
      bullet.padding(0);
      bullet.margin(0);

      lines.push(line);
      bullets.push(bullet);
      avgs.push(avg.toFixed() + '%');
    }

    var axis = anychart.elements.axis();
    axis.scale(bulletScale);
    axis.orientation('bottom');
    axis.staggerMode(false);
    axis.minorTicks().enabled(true);
    axis.title().enabled(false);
    axis.labels()
        .fontSize('9px')
        .textFormatter(function(value) {
          return value['tickValue'] + '%';
        });
    axis.ticks().stroke('#ccc');
    axis.minorTicks().stroke('#ccc');
    axis.stroke('#ccc');

    var contents = [
      ['CPU', 'Today', lines[0], 'Overall', bullets[0], avgs[0]],
      ['Storage', 'Last 12 Mo.', lines[1], 'Today', bullets[1], avgs[1]],
      ['Network', 'Last 12 Mo.', lines[2], 'Today', bullets[2], avgs[2]],
      [null, null, null, null, axis, null]
    ];

    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableHeight = (contents.length - 1) * 18 + 24;
    var reportBounds = anychart.math.rect(0, 0, 435, tableHeight + titleHeight);

    var title = anychart.elements.title();
    title.container(container);
    title.parentBounds(reportBounds);
    title.fontFamily('verdana, helvetica, arial, sans-serif');
    title.fontWeight('normal');
    title.fontSize('15px');
    title.fontColor('#86cf38');
    title.text('Hardware % of Capacity');
    title.orientation('top');
    title.align('left');
    title.vAlign('bottom');
    title.margin(0);
    title.padding(0, 0, 2, 0);
    title.height(titleHeight);
    title.useHtml(false);
    title.draw();

    var legendParentBounds = anychart.math.rect(reportBounds.left, reportBounds.top, reportBounds.width, titleHeight);
    var legend = anychart.elements.legend();
    legend.fontSize('9px');
    legend.itemsLayout('horizontal');
    legend.itemsProvider([
      {
        'index': 0,
        'text': 'Actual',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var width = size * 0.6;
          path.clear()
              .moveTo(x - width / 2, y - 2)
              .lineTo(x + width / 2, y - 2)
              .lineTo(x + width / 2, y + 1)
              .lineTo(x - width / 2, y + 1)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#000'
      },
      {
        'index': 1,
        'text': 'Good',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path.clear()
              .moveTo(x - 2, y - height / 2)
              .lineTo(x - 2, y + height / 2)
              .lineTo(x + 3, y + height / 2)
              .lineTo(x + 3, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#ccc'
      },
      {
        'index': 2,
        'text': 'Excessive',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path.clear()
              .moveTo(x - 2, y - height / 2)
              .lineTo(x - 2, y + height / 2)
              .lineTo(x + 3, y + height / 2)
              .lineTo(x + 3, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#aaa'
      },
      {
        'index': 3,
        'text': 'Critical',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path.clear()
              .moveTo(x - 2, y - height / 2)
              .lineTo(x - 2, y + height / 2)
              .lineTo(x + 3, y + height / 2)
              .lineTo(x + 3, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#666'
      }
    ]);
    legend.iconTextSpacing(0);
    legend.container(container);
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.align('right');
    legend.position('bottom');
    legend.padding(0, 0, 2, 0);
    legend.margin(0);
    legend.background().enabled(false);
    legend.itemsSpacing(0);
    legend.parentBounds(legendParentBounds);
    legend.draw();

    var table = anychart.elements.table().contents(contents);
    table.top(title.getRemainingBounds().getTop() + 2);
    table.height(tableHeight);
    table.width(reportBounds.width);
    table.rowHeight(table.rowsCount() - 1, 24);
    table.colWidth(0, 80);
    table.colWidth(1, 60);
    table.colWidth(2, 105);
    table.colWidth(3, 60);
    table.colWidth(4, 100);
    table.colWidth(5, 30);
    table.cellBorder(null);
    table.cellTextFactory().padding(0).vAlign('center').hAlign('left').fontSize('10px');
    setupRowProp(table, 0, 'topBorder', '2 #ccc');
    setupColProp(table, 0, ['content', 'fontSize'], '12px', false);
    setupColProp(table, 2, 'padding', [3, 3], false);
    setupColProp(table, 3, 'padding', [0, 0, 0, 20], false);
    setupColProp(table, 4, 'padding', [5, 2, 4], false);
    setupColProp(table, 5, ['content', 'hAlign'], 'right', false);
    setupColProp(table, 5, ['content', 'fontSize'], '11px', false);
    table.container(container);
    table.draw();

    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  function formDNTReport(sixMonthsData, weekData, yesterdayData) {
    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var chartHeight = 150;
    var reportBounds = anychart.math.rect(0, 0, 435, chartHeight + titleHeight);

    var title = anychart.elements.title();
    title.container(container);
    title.parentBounds(reportBounds);
    title.fontFamily('verdana, helvetica, arial, sans-serif');
    title.fontWeight('normal');
    title.text('<span style="color:#86cf38; font-size: 15px;">Daily Network Traffic</span> <span style="color: #666666; font-size: 10px; font-weight: normal;">(kilobytes)</span>');
    title.orientation('top');
    title.align('left');
    title.vAlign('bottom');
    title.margin(0);
    title.padding(0, 0, 2, 0);
    title.height(titleHeight);
    title.useHtml(true);
    title.draw();

    container.path().moveTo(0, titleHeight).lineTo(reportBounds.width, titleHeight).stroke('2 #ccc');

    var chart = anychart.cartesianChart();

    var xAxisScale = anychart.scales.dateTime();
    xAxisScale.minimum(Date.UTC(0, 0, 0, 0));
    xAxisScale.maximum(Date.UTC(0, 0, 1, 0));
    xAxisScale.ticks().count(5);
    xAxisScale.minorTicks().interval(0, 0, 0, 1);
    chart.xAxis().title().enabled(false);
    chart.xAxis().staggerMode(false).overlapMode('allow');
    chart.xAxis().labels().enabled(true).textFormatter(function(value) {
      var date = new Date(value['tickValue']);
      var h = (date.getUTCHours() % 12) || 12;
      if (date.getUTCHours() == 0 && date.getUTCDay() == 0)
        return h + '\nAM';
      else if (date.getUTCHours() == 12)
        return h + '\nPM';
      else
        return h;
    });
    chart.xAxis().minorLabels().enabled(true).textFormatter(function(value) {
      var date = new Date(value['tickValue']);
      var h = date.getUTCHours() % 12;
      return h || 12;
    });
    chart.xAxis().minorTicks().length(0);
    chart.xAxis().ticks().length(0).stroke('#ccc');
    chart.xAxis().stroke('#ccc');
    chart.xAxis().scale(xAxisScale);
    chart.xAxis(1).stroke('#ccc');
    chart.xAxis(1).ticks().enabled(false);
    chart.xAxis(1).minorTicks().enabled(false);
    chart.xAxis(1).title().enabled(false);
    chart.xAxis(1).labels().enabled(false);
    chart.xAxis(1).minorLabels().enabled(false);
    chart.xAxis(1).orientation('top');
    chart.yScale().maximumGap(0).minimumGap(0);
    chart.yAxis().title().enabled(false);
    chart.yAxis().minorTicks().enabled(false);
    chart.yAxis().labels().textFormatter(function(value) {
      return (value['tickValue'] / 1000).toFixed(0) + 'K';
    });
    chart.yAxis().stroke('#ccc');
    chart.yAxis().ticks().stroke('#ccc');
    chart.grid().layout('vertical').scale(xAxisScale).oddFill(null).evenFill(null);
    chart.container(container);
    chart.left(0);
    chart.top(titleHeight);
    chart.width(reportBounds.width);
    chart.height(chartHeight);
    chart.palette(['#aaa', '#666', '#000']);
    var line1 = chart.line(sixMonthsData);
    line1.name('Daily mean for last 6 month');
    line1.markers().enabled(false);
    var line2 = chart.line(weekData);
    line2.name('Daily mean for last 7 days');
    line2.markers().enabled(false);
    var line3 = chart.line(yesterdayData);
    line3.name('Yesterday');
    line3.markers().enabled(false);
    var legend = chart.legend();
    legend.enabled(true);
    legend.fontSize('10px');
    legend.itemsLayout('horizontal');
    legend.iconTextSpacing(3);
    legend.container(container);
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.align('center');
    legend.position('top');
    legend.padding(0, 0, 2, 0);
    legend.margin(3);
    legend.background().enabled(false);
    legend.itemsSpacing(4);
    chart.draw();

    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  function formKNSMReport(expensesData, satisfactionData, problemsData, expensesRanges, satisfactionRanges, problemsRanges, budget, problemsTarget) {
    var views = [
      anychart.data.set(expensesData).mapAs(),
      anychart.data.set(satisfactionData).mapAs(),
      anychart.data.set(problemsData).mapAs()
    ];
    var actualExpenses = calcSum(views[0], 'value');
    var tmp = views[1].getIterator();
    tmp.select(0);
    var actualSatisfaction = tmp.get('value');
    var actualProblems = calcAvg(views[2], 'value');
    var actualValues = [
      actualExpenses / (budget / expensesData.length * 12) * 100,
      actualSatisfaction,
      actualProblems
    ];
    var actualTexts = [
      '$' + formatNumber(actualExpenses / 1000, 1) + 'K',
      actualSatisfaction + ' of 100',
      actualProblems.toFixed(0)
    ];
    var rangesForLine = [
      [0, budget / 12],
      [satisfactionRanges[0], satisfactionRanges[1]],
      [problemsRanges[0] / 100 * problemsTarget, problemsRanges[2] / 100 * problemsTarget]
    ];
    var metrics = [
      'Expenses YTD',
      'Customer Satisfaction',
      'Level 1 Problems'
    ];

    // we use common scales for charts in columns to make them comparable
    var bulletScale = anychart.scales.linear();
    // settings manual minimum and maximum to show the range we need.
    bulletScale.minimum(0).maximum(150);

    var markers = anychart.elements.markersFactory();

    // preparing report data
    var contents = [['Year-to-Date', null, 'Metric', '% of Target', 'Actual']];
    // forming a row for each system
    for (var i = 0; i < 3; i++) {
      var row = [];

      // preparing data for the row
      var ranges = arguments[i + 3];

      var chart = anychart.cartesianChart();
      chart.xScale(createTightDTScale());
      chart.rangeMarker(0).from(rangesForLine[i][0]).to(rangesForLine[i][1]);
      chart.background().enabled(true).stroke('#ccc').fill('none');
      var line = chart.line(views[i]);
      line.stroke('2 #000');
      line.markers().enabled(false);

      var marker;
      if (actualValues[i] > Math.max(ranges[0], ranges[1]) || actualValues[i] < Math.min(ranges[0], ranges[1]))
        marker = markers.add(null);
      else
        marker = null;

      // we will also need one bullet chart per system
      var bullet = anychart.bullet.chart([{'value': actualValues[i], 'type': 'bar', gap: 0.6}]);
      bullet.range(0).from(ranges[0]).to(ranges[1]).fill('#ccc');
      bullet.range(1).from(ranges[1]).to(ranges[2]).fill('#aaa');
      bullet.range(2).from(ranges[2]).to(ranges[3]).fill('#666');
      bullet.scale(bulletScale);
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background().enabled(false);
      bullet.padding(0);
      bullet.margin(0);

      row[0] = chart;
      row[1] = marker;
      row[2] = metrics[i];
      row[3] = bullet;
      row[4] = actualTexts[i];
      contents.push(row);
    }
    var axis = anychart.elements.axis();
    axis.scale(bulletScale);
    axis.orientation('bottom');
    axis.staggerMode(false);
    axis.minorTicks().enabled(false);
    axis.title().enabled(false);
    axis.labels()
        .fontSize('9px')
        .textFormatter(function(value) {
          return value['tickValue'] + '%';
        });
    axis.ticks().stroke('#ccc');
    axis.stroke('#ccc');

    contents.push([null, null, null, axis, null]);

    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableHeight = (contents.length - 1) * 24 + 20;
    var reportBounds = anychart.math.rect(0, 0, 450, tableHeight + titleHeight);

    markers.anchor('center');
    markers.position('center');
    markers.type('circle');
    markers.fill('#c00');
    markers.stroke('2 #900');
    markers.size(5);

    var title = anychart.elements.title();
    title.container(container);
    title.parentBounds(reportBounds);
    title.fontFamily('verdana, helvetica, arial, sans-serif');
    title.fontWeight('normal');
    title.fontSize('15px');
    title.fontColor('#86cf38');
    title.text('Key Non-System Metrics');
    title.orientation('top');
    title.align('left');
    title.vAlign('bottom');
    title.margin(0);
    title.padding(0, 0, 2, 0);
    title.height(titleHeight);
    title.useHtml(false);
    title.draw();

    var legendParentBounds = anychart.math.rect(reportBounds.left, reportBounds.top, reportBounds.width, titleHeight);
    var legend = anychart.elements.legend();
    legend.fontSize('9px');
    legend.itemsLayout('horizontal');
    legend.itemsProvider([
      {
        'index': 0,
        'text': 'Actual',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var width = size * 0.6;
          path.clear()
              .moveTo(x - width / 2, y - 2)
              .lineTo(x + width / 2, y - 2)
              .lineTo(x + width / 2, y + 1)
              .lineTo(x - width / 2, y + 1)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#000'
      },
      {
        'index': 1,
        'text': 'Good',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path.clear()
              .moveTo(x - 2, y - height / 2)
              .lineTo(x - 2, y + height / 2)
              .lineTo(x + 3, y + height / 2)
              .lineTo(x + 3, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#ccc'
      },
      {
        'index': 2,
        'text': 'Excessive',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path.clear()
              .moveTo(x - 2, y - height / 2)
              .lineTo(x - 2, y + height / 2)
              .lineTo(x + 3, y + height / 2)
              .lineTo(x + 3, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#aaa'
      },
      {
        'index': 3,
        'text': 'Critical',
        'iconType': function(path, size) {
          path.clear();
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path.clear()
              .moveTo(x - 2, y - height / 2)
              .lineTo(x - 2, y + height / 2)
              .lineTo(x + 3, y + height / 2)
              .lineTo(x + 3, y - height / 2)
              .close();
        },
        'iconStroke': 'none',
        'iconFill': '#666'
      }
    ]);
    legend.iconTextSpacing(0);
    legend.container(container);
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.align('right');
    legend.position('bottom');
    legend.padding(0, 0, 2, 0);
    legend.margin(0);
    legend.background().enabled(false);
    legend.itemsSpacing(0);
    legend.parentBounds(legendParentBounds);
    legend.draw();

    var table = anychart.elements.table().contents(contents);
    table.top(title.getRemainingBounds().getTop());
    table.height(tableHeight);
    table.width(reportBounds.width);
    table.rowHeight(0, 20);
    table.colWidth(0, 130);
    table.colWidth(1, 20);
    //table.colWidth(2, 130);
    table.colWidth(3, 110);
    table.colWidth(4, 60);
    table.cellBorder(null);
    table.cellTextFactory().padding(0).vAlign('center').hAlign('left');
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 0, 'padding', [2, 0], true);
    setupColProp(table, 3, 'padding', [6, 2, 5], true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    table.getCell(table.rowsCount() - 1, 3).padding(0, 2, 5);
    table.getCell(0, 4).content().hAlign('right');
    table.container(container);
    table.draw();

    var cell = table.getCell(1, 3);
    var bounds = cell.getBounds();
    bounds.left += cell.padding().left();
    bounds.width -= cell.padding().left() + cell.padding().right();
    var x = bulletScale.transform(100) * bounds.width + bounds.left;
    var top = bounds.top + 2;
    var bottom = axis.getRemainingBounds().getBottom() + axis.ticks().length();
    container.path().stroke('#000').fill('none').moveTo(x, top).lineTo(x, bottom);

    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  function formMPMReport(data, today) {
    today = new Date(today);
    var contents = [[null, 'Project', 'Milestone', 'Days Until/\nPast Due', 'Due Date']];

    var bulletScale = anychart.scales.linear();
    bulletScale.minimum(-20).maximum(20);

    var markers = anychart.elements.markersFactory();

    var view = anychart.data.set(data).mapAs({'Project': [0], 'Milestone': [1], 'Due': [2]});

    var iter = view.getIterator();
    while (iter.advance()) {
      var dueDate = new Date(iter.get('Due'));
      var diff = getDiffInDays(today, dueDate);
      // we will also need one bullet chart per system
      var bullet = anychart.bullet.chart([{'value': diff, 'type': 'bar', 'gap': 0.4, 'fill': ((diff >= 0) ? '#999' : '#000')}]);
      bullet.scale(bulletScale);
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background().enabled(false);
      bullet.padding(0);
      bullet.margin(0);

      var marker;
      if (diff <= -10)
        marker = markers.add(null);
      else
        marker = null;

      contents.push([
        marker,
        iter.get('Project'),
        iter.get('Milestone'),
        bullet,
        formatDate(dueDate)
      ]);
    }

    var axis = anychart.elements.axis();
    axis.scale(bulletScale);
    axis.orientation('bottom');
    axis.staggerMode(false);
    axis.minorTicks().enabled(false);
    axis.title().enabled(false);
    axis.labels().fontSize('9px');
    axis.ticks().stroke('#ccc');
    axis.stroke('#ccc');

    contents.push([null, null, null, axis, null]);

    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableTop = titleHeight - 20;
    var tableHeight = (contents.length - 1) * 24 + 40;
    var reportBounds = anychart.math.rect(0, 0, 450, tableHeight + tableTop);

    markers.anchor('center');
    markers.position('center');
    markers.type('circle');
    markers.fill('#c00');
    markers.stroke('2 #900');
    markers.size(5);

    var title = anychart.elements.title();
    title.container(container);
    title.parentBounds(reportBounds);
    title.fontFamily('verdana, helvetica, arial, sans-serif');
    title.fontWeight('normal');
    title.text('<span style="color:#86cf38; font-size: 15px;">Major Project Milestones</span> <span style="color: #666666; font-size: 10px; font-weight: normal;">(by priority)</span>');
    title.orientation('top');
    title.align('left');
    title.vAlign('bottom');
    title.margin(0);
    title.padding(0);
    title.height(titleHeight);
    title.useHtml(true);
    title.draw();

    var table = anychart.elements.table().contents(contents);
    table.top(tableTop);
    table.height(tableHeight);
    table.width(reportBounds.width);
    table.rowHeight(0, 40);
    table.colWidth(0, 20);
    //table.colWidth(1, 150);
    table.colWidth(2, 130);
    table.colWidth(3, 95);
    table.colWidth(4, 55);
    table.cellBorder(null);
    table.cellTextFactory().padding(0).vAlign('center').hAlign('left').fontSize('11px');
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 0, 'padding', [2, 0], true);
    setupColProp(table, 3, 'padding', [6, 2, 5], true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    table.getCell(table.rowsCount() - 1, 3).padding(0, 2, 5, 1);
    table.getCell(0, 3).content().hAlign('center');
    table.getCell(0, 4).content().hAlign('right');
    table.container(container);
    table.draw();

    var cell = table.getCell(1, 3);
    var bounds = cell.getBounds();
    bounds.left += cell.padding().left();
    bounds.width -= cell.padding().left() + cell.padding().right();
    var x = bulletScale.transform(0) * bounds.width + bounds.left;
    var top = bounds.top + 2;
    var bottom = axis.getRemainingBounds().getBottom() + axis.ticks().length();
    container.path().stroke('#ccc').fill('none').moveTo(x, top).lineTo(x, bottom);

    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  function formTPQReport(data) {
    var contents = [[null, 'Project', 'Status', 'Funding\nApproved', 'Sched.\nStart']];

    var view = anychart.data.set(data).mapAs({'Project': [0], 'Status': [1], 'Approved': [2], 'Start': [3]});

    var iter = view.getIterator();
    var i = 0;
    while (iter.advance()) {
      contents.push([
        ++i,
        iter.get('Project'),
        iter.get('Status'),
        iter.get('Approved') ? 'X' : null,
        formatDate(new Date(iter.get('Start')))
      ]);
    }

    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableTop = titleHeight - 20;
    var tableHeight = (contents.length - 1) * 24 + 40;
    var reportBounds = anychart.math.rect(0, 0, 450, tableHeight + tableTop);

    var title = anychart.elements.title();
    title.container(container);
    title.parentBounds(reportBounds);
    title.fontFamily('verdana, helvetica, arial, sans-serif');
    title.fontWeight('normal');
    title.fontSize('15px');
    title.fontColor('#86cf38');
    title.text('Top Projects in the Queue');
    title.orientation('top');
    title.align('left');
    title.vAlign('bottom');
    title.margin(0);
    title.padding(0, 0, 2, 0);
    title.height(titleHeight);
    title.useHtml(false);
    title.draw();

    var table = anychart.elements.table().contents(contents);
    table.top(tableTop);
    table.height(tableHeight);
    table.width(reportBounds.width);
    table.rowHeight(0, 40);
    table.colWidth(0, 20);
    //table.colWidth(1, 150);
    table.colWidth(2, 130);
    table.colWidth(3, 70);
    table.colWidth(4, 55);
    table.cellBorder(null);
    table.cellTextFactory().padding(0).vAlign('center').hAlign('left').fontSize('11px');
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 0, 'padding', [2, 0], true);
    setupColProp(table, 3, ['content', 'hAlign'], 'center', true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    table.getCell(0, 3).content().hAlign('center');
    table.getCell(0, 4).content().hAlign('center');
    table.container(container);
    table.draw();

    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  var stage = anychart.graphics.create('container', 930, 570);
  stage.suspend();
  stage.rect(0, 0, stage.width(), stage.height()).stroke('2 #ccc').fill('#fff8d6');

  var titleHeight = 40;

  var title1 = anychart.elements.title();
  title1.container(stage);
  title1.parentBounds(anychart.math.rect(0, 0, stage.width(), stage.height()));
  title1.fontFamily('verdana, helvetica, arial, sans-serif');
  title1.fontWeight('normal');
  title1.fontSize('20px');
  title1.fontColor('#86cf38');
  title1.text('CIO Dashboard');
  title1.orientation('top');
  title1.align('left');
  title1.vAlign('bottom');
  title1.margin(0);
  title1.padding(0, 10, 4, 10);
  title1.height(titleHeight);
  title1.useHtml(true);
  title1.draw();

  var formattedToday = (new Date(Today)).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
  var title2 = anychart.elements.title();
  title2.container(stage);
  title2.parentBounds(anychart.math.rect(0, 0, stage.width(), stage.height()));
  title2.fontFamily('verdana, helvetica, arial, sans-serif');
  title2.fontWeight('normal');
  title2.fontSize('12px');
  title2.fontColor('#666');
  title2.text('(As of ' + formattedToday + ')');
  title2.orientation('top');
  title2.align('right');
  title2.vAlign('bottom');
  title2.margin(0);
  title2.padding(0, 10, 4, 10);
  title2.height(titleHeight);
  title2.useHtml(true);
  title2.draw();

  stage.path().moveTo(10, titleHeight).lineTo(stage.width() - 10, titleHeight).stroke('4 #ccc');

  var leftColumnReports = [
    formSAReport(SARawData, SAAcceptedAvailability),
    formHCReport(HCCPUData, HCStorage, HCNetwork, HCCPURanges, HCNetworkRanges, HCStorageRanges),
    formDNTReport(DNT6MonthAvgData, DNTWeekAvgData, DNTYesterdayData)
  ];

  var top = titleHeight + 10;
  var left = 10;
  var width = 0;
  var report, bounds, i;
  for (i = 0; i < leftColumnReports.length; i++) {
    report = leftColumnReports[i]['report'];
    bounds = leftColumnReports[i]['bounds'];
    //stage.rect(left, top, bounds.width, bounds.height);
    report.parent(stage);
    report.translate(left, top);
    top += bounds.height;
    width = Math.max(width, bounds.width);
  }

  var rightColumnReports = [
    formKNSMReport(KNSMExpensesData, KNSMSatisfactionData, KNSMProblemsData, KNSMExpensesRanges, KNSMSatisfactionRanges, KNSMProblemsRanges, 1175000, 100),
    formMPMReport(MPMData, Today),
    formTPQReport(TPQData)
  ];

  top = titleHeight + 10;
  left += width + 25;
  width = 0;
  for (i = 0; i < rightColumnReports.length; i++) {
    report = rightColumnReports[i]['report'];
    bounds = rightColumnReports[i]['bounds'];
    //stage.rect(left, top, bounds.width, bounds.height);
    report.parent(stage);
    report.translate(left, top);
    top += bounds.height;
    width = Math.max(width, bounds.width);
  }

  stage.resume();
});
