anychart.onDocumentReady(function() {
  // Contents of the sample:
  // 1) Lines 123 to 345: Data description - all data for the entire dashboard is located here.
  // 2) Lines 347 to 638: Utility functions - some utility functions to make routine operations easy.
  // 3) Lines 640 to 1945: Functions, that form reports for the dashboard. Each function form its own report and
  //    returns an object consisting of a layer that contains the full report with title and contents positioned and a
  //    anychart.math.rect() describing report bounds.
  // 4) Lines 1947 to 2070: A bunch of code that forms the report itself, using everything above.

  // We set global fontFamily here to make it default
  anychart.fontFamily = 'trebuchet, helvetica, arial, sans-serif';

  // region Data description
  // All the data imitates the manner as if we get it from a database.
  // System Availability raw data. Columns are: ['System', 'Month', 'Availability']
  var SARawData = [
    ['Network', Date.UTC(2013, 10), 98.6],
    ['Network', Date.UTC(2013, 11), 98.5],
    ['Network', Date.UTC(2014, 0), 98.5],
    ['Network', Date.UTC(2014, 1), 99.0],
    ['Network', Date.UTC(2014, 2), 99.2],
    ['Network', Date.UTC(2014, 3), 99.0],
    ['Network', Date.UTC(2014, 4), 99.3],
    ['Network', Date.UTC(2014, 5), 99.1],
    ['Network', Date.UTC(2014, 6), 99.0],
    ['Network', Date.UTC(2014, 7), 99.3],
    ['Network', Date.UTC(2014, 8), 99.5],
    ['Network', Date.UTC(2014, 9), 99.7],
    ['ERP', Date.UTC(2013, 10), 98.6],
    ['ERP', Date.UTC(2013, 11), 98.9],
    ['ERP', Date.UTC(2014, 0), 98.8],
    ['ERP', Date.UTC(2014, 1), 98.3],
    ['ERP', Date.UTC(2014, 2), 98.6],
    ['ERP', Date.UTC(2014, 3), 98.7],
    ['ERP', Date.UTC(2014, 4), 98.9],
    ['ERP', Date.UTC(2014, 5), 98.3],
    ['ERP', Date.UTC(2014, 6), 98.1],
    ['ERP', Date.UTC(2014, 7), 99.0],
    ['ERP', Date.UTC(2014, 8), 98.9],
    ['ERP', Date.UTC(2014, 9), 99.3],
    ['Data Warehouse', Date.UTC(2013, 10), 95.3],
    ['Data Warehouse', Date.UTC(2013, 11), 95.9],
    ['Data Warehouse', Date.UTC(2014, 0), 96.7],
    ['Data Warehouse', Date.UTC(2014, 1), 95.6],
    ['Data Warehouse', Date.UTC(2014, 2), 96.8],
    ['Data Warehouse', Date.UTC(2014, 3), 95.8],
    ['Data Warehouse', Date.UTC(2014, 4), 96.3],
    ['Data Warehouse', Date.UTC(2014, 5), 95.6],
    ['Data Warehouse', Date.UTC(2014, 6), 95.4],
    ['Data Warehouse', Date.UTC(2014, 7), 95.5],
    ['Data Warehouse', Date.UTC(2014, 8), 96.7],
    ['Data Warehouse', Date.UTC(2014, 9), 96.9],
    ['Web Site', Date.UTC(2013, 10), 97.9],
    ['Web Site', Date.UTC(2013, 11), 98.4],
    ['Web Site', Date.UTC(2014, 0), 98.5],
    ['Web Site', Date.UTC(2014, 1), 98.8],
    ['Web Site', Date.UTC(2014, 2), 99.0],
    ['Web Site', Date.UTC(2014, 3), 99.3],
    ['Web Site', Date.UTC(2014, 4), 99.2],
    ['Web Site', Date.UTC(2014, 5), 99.4],
    ['Web Site', Date.UTC(2014, 6), 99.4],
    ['Web Site', Date.UTC(2014, 7), 99.5],
    ['Web Site', Date.UTC(2014, 8), 99.6],
    ['Web Site', Date.UTC(2014, 9), 99.7],
    ['Email', Date.UTC(2013, 10), 99.0],
    ['Email', Date.UTC(2013, 11), 98.4],
    ['Email', Date.UTC(2014, 0), 99.1],
    ['Email', Date.UTC(2014, 1), 98.2],
    ['Email', Date.UTC(2014, 2), 98.2],
    ['Email', Date.UTC(2014, 3), 97.9],
    ['Email', Date.UTC(2014, 4), 98.6],
    ['Email', Date.UTC(2014, 5), 99.1],
    ['Email', Date.UTC(2014, 6), 98.4],
    ['Email', Date.UTC(2014, 7), 99.2],
    ['Email', Date.UTC(2014, 8), 99.2],
    ['Email', Date.UTC(2014, 9), 99.3],
    ['HR', Date.UTC(2013, 10), 97.0],
    ['HR', Date.UTC(2013, 11), 97.9],
    ['HR', Date.UTC(2014, 0), 98.2],
    ['HR', Date.UTC(2014, 1), 98.9],
    ['HR', Date.UTC(2014, 2), 98.2],
    ['HR', Date.UTC(2014, 3), 98.7],
    ['HR', Date.UTC(2014, 4), 98.4],
    ['HR', Date.UTC(2014, 5), 98.5],
    ['HR', Date.UTC(2014, 6), 98.6],
    ['HR', Date.UTC(2014, 7), 98.5],
    ['HR', Date.UTC(2014, 8), 98.7],
    ['HR', Date.UTC(2014, 9), 98.8],
    ['Problem Tracking', Date.UTC(2013, 10), 96.1],
    ['Problem Tracking', Date.UTC(2013, 11), 96.1],
    ['Problem Tracking', Date.UTC(2014, 0), 96.0],
    ['Problem Tracking', Date.UTC(2014, 1), 95.9],
    ['Problem Tracking', Date.UTC(2014, 2), 95.7],
    ['Problem Tracking', Date.UTC(2014, 3), 95.5],
    ['Problem Tracking', Date.UTC(2014, 4), 95.0],
    ['Problem Tracking', Date.UTC(2014, 5), 94.9],
    ['Problem Tracking', Date.UTC(2014, 6), 94.8],
    ['Problem Tracking', Date.UTC(2014, 7), 95.0],
    ['Problem Tracking', Date.UTC(2014, 8), 94.8],
    ['Problem Tracking', Date.UTC(2014, 9), 94.4]
  ];
  // System Availability accepted values. Columns are: ['System', 'Accepted Availability']
  var SAAcceptedAvailability = [
    ['Network', 99],
    ['ERP', 98],
    ['Data Warehouse', 98],
    ['Web Site', 98],
    ['Email', 98],
    ['HR', 96],
    ['Problem Tracking', 93]
  ];
  // CPU Capacity % for today. Columns are: ['DateTime', 'Capacity']
  var HCCPUData = [
    [Date.UTC(2014, 9, 15, 0), 94.4],
    [Date.UTC(2014, 9, 15, 1), 92.0],
    [Date.UTC(2014, 9, 15, 2), 89.6],
    [Date.UTC(2014, 9, 15, 3), 87.7],
    [Date.UTC(2014, 9, 15, 4), 89.6],
    [Date.UTC(2014, 9, 15, 5), 87.0],
    [Date.UTC(2014, 9, 15, 6), 84.0],
    [Date.UTC(2014, 9, 15, 7), 73.4],
    [Date.UTC(2014, 9, 15, 8), 73.2],
    [Date.UTC(2014, 9, 15, 9), 72.5],
    [Date.UTC(2014, 9, 15, 10), 74.2],
    [Date.UTC(2014, 9, 15, 11), 70.8],
    [Date.UTC(2014, 9, 15, 12), 71.4],
    [Date.UTC(2014, 9, 15, 13), 74.9],
    [Date.UTC(2014, 9, 15, 14), 74.5],
    [Date.UTC(2014, 9, 15, 15), 70.6],
    [Date.UTC(2014, 9, 15, 16), 68.4],
    [Date.UTC(2014, 9, 15, 17), 70.3],
    [Date.UTC(2014, 9, 15, 18), 74.0],
    [Date.UTC(2014, 9, 15, 19), 75.5],
    [Date.UTC(2014, 9, 15, 20), 74.7],
    [Date.UTC(2014, 9, 15, 21), 78.1],
    [Date.UTC(2014, 9, 15, 22), 78.8],
    [Date.UTC(2014, 9, 15, 23), 81.6]
  ];
  // Storage Capacity % for last 12 month. Columns are: ['Month', 'Capacity']
  var HCStorage = [
    [Date.UTC(2013, 10), 61.2],
    [Date.UTC(2013, 11), 64.1],
    [Date.UTC(2014, 0), 65.8],
    [Date.UTC(2014, 1), 67.5],
    [Date.UTC(2014, 2), 69.0],
    [Date.UTC(2014, 3), 70.3],
    [Date.UTC(2014, 4), 71.6],
    [Date.UTC(2014, 5), 71.4],
    [Date.UTC(2014, 6), 73.0],
    [Date.UTC(2014, 7), 73.2],
    [Date.UTC(2014, 8), 73.8],
    [Date.UTC(2014, 9), 74.6]
  ];
  // Network Capacity % for last 12 month. Columns are: ['Month', 'Capacity']
  var HCNetwork = [
    [Date.UTC(2013, 10), 68.8],
    [Date.UTC(2013, 11), 72.5],
    [Date.UTC(2014, 0), 74.1],
    [Date.UTC(2014, 1), 77.7],
    [Date.UTC(2014, 2), 85.1],
    [Date.UTC(2014, 3), 83.0],
    [Date.UTC(2014, 4), 83.9],
    [Date.UTC(2014, 5), 79.3],
    [Date.UTC(2014, 6), 81.7],
    [Date.UTC(2014, 7), 75.9],
    [Date.UTC(2014, 8), 79.8],
    [Date.UTC(2014, 9), 82.8]
  ];
  // Values to form hardware capacity bullet ranges. They are supposed to be just known for each case.
  // These values represent range borders:
  // from 0 to 80 - good case,
  // from 80 to 90 - excessive case,
  // from 90 to 100 - critical case.
  var HCCPURanges = [0, 80, 90, 100];
  // from 0 to 60 - good case,
  // from 60 to 80 - excessive case,
  // from 80 to 100 - critical case.
  var HCStorageRanges = [0, 60, 80, 100];
  // from 0 to 60 - good case,
  // from 60 to 80 - excessive case,
  // from 80 to 100 - critical case.
  var HCNetworkRanges = [0, 60, 80, 100];
  // Daily Network Traffic for different periods of time. Columns are ['Hour', 'Average Traffic'].
  // These data are supposed to be pre-calculated by a server or something else.
  // DNT for last six month.
  var DNT6MonthAvgData = [
    [0, 171320],
    [1, 140377],
    [2, 119245],
    [3, 58867],
    [4, 46037],
    [5, 15094],
    [6, 25660],
    [7, 135094],
    [8, 188679],
    [9, 186415],
    [10, 166037],
    [11, 160754],
    [12, 135849],
    [13, 166792],
    [14, 175849],
    [15, 175094],
    [16, 144905],
    [17, 166037],
    [18, 129056],
    [19, 66415],
    [20, 54339],
    [21, 35471],
    [22, 39245],
    [23, 160754]
  ];
  // DNT for last week.
  var DNTWeekAvgData = [
    [0, 179622],
    [1, 147924],
    [2, 125283],
    [3, 65660],
    [4, 39245],
    [5, 3773],
    [6, 12075],
    [7, 142641],
    [8, 193962],
    [9, 193962],
    [10, 176603],
    [11, 156226],
    [12, 140377],
    [13, 179622],
    [14, 169056],
    [15, 169811],
    [16, 149433],
    [17, 178867],
    [18, 121509],
    [19, 58113],
    [20, 44528],
    [21, 40754],
    [22, 45283],
    [23, 170566]
  ];
  // DNT for yesterday.
  var DNTYesterdayData = [
    [0, 193207],
    [1, 156226],
    [2, 132075],
    [3, 42264],
    [4, 23396],
    [5, 9056],
    [6, 15849],
    [7, 151698],
    [8, 189433],
    [9, 190188],
    [10, 182641],
    [11, 159245],
    [12, 152452],
    [13, 174339],
    [14, 174339],
    [15, 180377],
    [16, 153962],
    [17, 172830],
    [18, 107924],
    [19, 63396],
    [20, 57358],
    [21, 66415],
    [22, 81509],
    [23, 181886]
  ];
  // Key Non-System Metrics report data:
  // Summary expenses YTD. Columns are ['Month', 'Value'].
  var KNSMExpensesData = [
    [Date.UTC(2014, 0), 100000],
    [Date.UTC(2014, 1), 97000],
    [Date.UTC(2014, 2), 98000],
    [Date.UTC(2014, 3), 98000],
    [Date.UTC(2014, 4), 99000],
    [Date.UTC(2014, 5), 100000],
    [Date.UTC(2014, 6), 99000],
    [Date.UTC(2014, 7), 98000],
    [Date.UTC(2014, 8), 98000],
    [Date.UTC(2014, 9), 97000]
  ];
  // Customers satisfaction level YTD. Columns are ['Month', 'Satisfaction level'].
  var KNSMSatisfactionData = [
    [Date.UTC(2014, 0), 90],
    [Date.UTC(2014, 1), 97],
    [Date.UTC(2014, 2), 98],
    [Date.UTC(2014, 3), 98],
    [Date.UTC(2014, 4), 99],
    [Date.UTC(2014, 5), 100],
    [Date.UTC(2014, 6), 99],
    [Date.UTC(2014, 7), 98],
    [Date.UTC(2014, 8), 98],
    [Date.UTC(2014, 9), 97]
  ];
  // Level 1 Problems numbers YTD. Columns are ['Month', 'Number of Problems'].
  var KNSMProblemsData = [
    [Date.UTC(2014, 0), 45],
    [Date.UTC(2014, 1), 97],
    [Date.UTC(2014, 2), 95],
    [Date.UTC(2014, 3), 87],
    [Date.UTC(2014, 4), 99],
    [Date.UTC(2014, 5), 78],
    [Date.UTC(2014, 6), 99],
    [Date.UTC(2014, 7), 86],
    [Date.UTC(2014, 8), 98],
    [Date.UTC(2014, 9), 97]
  ];
  // Values to form KNSM report. They are supposed to be just known for each case.
  // Target budget value. Reads like "target is to spend no more than 1175000 per year".
  var KNSMBudgetTarget = 1175000;
  // Target Level 1 Problems count. Reads like "target is to get no more than 100 level 1 problems per month".
  var KNSMProblemsTarget = 100;
  // These values represent range borders in percent of the target budget per month:
  // from 0 to 90 - good case,
  // from 90 to 110 - excessive case,
  // from 110 to 150 - critical case.
  var KNSMExpensesRanges = [0, 90, 110, 150];
  // These values represent range borders in customers satisfaction level per month:
  // from 150 to 100 - good case,
  // from 100 to 80 - excessive case,
  // from 80 to 0 - critical case.
  var KNSMSatisfactionRanges = [150, 100, 80, 0];
  // These values represent range borders in level 1 problems count per month:
  // from 0 to 90 - good case,
  // from 90 to 110 - excessive case,
  // from 110 to 150 - critical case.
  var KNSMProblemsRanges = [0, 90, 110, 150];
  // Some Major Project Milestones for MPM report. Columns are ['Project', 'Milestone', 'Due date']
  var MPMData = [
    ['ERP Upgrade', 'Full system test', Date.UTC(2014, 9, 24)],
    ['Add services data to DW', 'ETL coding', Date.UTC(2014, 9, 10)],
    ['Upgrade mainframe OS', 'Prepare plan', Date.UTC(2014, 9, 17)],
    ['Disaster recovery site', 'Install hardware', Date.UTC(2014, 9, 20)],
    ['Budgeting system', 'Hire team', Date.UTC(2014, 9, 2)],
    ['Web site face-lift', 'Move into production', Date.UTC(2014, 9, 22)]
  ];
  // Some Projects for TPQ report. Columns are ['Project', 'Status', 'Funding approved', 'Schedule start']
  var TPQData = [
    ['Professional service module', 'Pending available staff', true, Date.UTC(2014, 9, 22)],
    ['Upgrade MS Office', 'Cost-benefit analysis', false, Date.UTC(2014, 11, 1)],
    ['Failover for ERP', 'Preparing proposal', false, Date.UTC(2015, 0, 30)],
    ['Upgrade data warehouse HW', 'Evaluating options', true, Date.UTC(2015, 1, 13)],
    ['Executive dashboard', 'Vendor assessment', false, Date.UTC(2015, 4, 2)]
  ];
  // Dashboard "today" date. It is set here like this to make the dashboard look "up to date" with these static data.
  var Today = new Date(Date.UTC(2014, 9, 15));
  // endregion

  // region Utility functions
  /**
   * Utility function to setup property to a whole row. Samples of usage:
   * 1) setupRowProp(table, 0, ['content', 'padding', 'left'], 10);
   *    Sets left padding of cell content in row 0 to 10 if there is a content, where left padding can be set in cells.
   *    So its equivalent to call cell.content().padding().left(10) for all cells in 0 row.
   * 2) setupRowProp(table, 1, 'padding', [0, 1, 2, 3]);
   *    Sets padding of all cells in the 1 row to (0, 1, 2, 3).
   *    Its equivalent to call cell.padding(0, 1, 2, 3) for all cells in row 1.
   * This two ways of usage can be combined, for example:
   *    setupRowProp(table, 0, ['content', 'padding'], [1, 2, 3, 4]);
   *    It is equivalent to calling cell.content().padding(1, 2, 3, 4) for all cells in row 0.
   * This method fails if the property chain is incorrect (for example there is no such property you ask).
   * @param {anychart.core.ui.Table} table Table to setup row for.
   * @param {number} rowIndex Row index.
   * @param {!Array.<string>|string} propNameOrChain Property name to access, like 'border' or chain of property names
   *    to access, e.g. ['content', 'fontSize']. Note: no checking on valid results is done, so it's up to you to
   *    ensure property existence.
   * @param {*|Array.<*>} propValueOrArray Value or array of values to set.
   */
  function setupRowProp(table, rowIndex, propNameOrChain, propValueOrArray) {
    // if passed row index is out of passed table - exit
    if (rowIndex >= table.rowsCount()) return;
    // normalize propNameOrChain to an array handle in one way
    if (typeof propNameOrChain == 'string') propNameOrChain = [propNameOrChain];
    // cache last chain index
    var chainLastIndex = propNameOrChain.length - 1;
    // for all column indexes in the table
    for (var i = 0; i < table.colsCount(); i++) {
      // get the cell
      var prop = table.getCell(rowIndex, i);
      // pass over the cell to the last but one property
      for (var j = 0; j < chainLastIndex; j++) {
        var name = propNameOrChain[j];
        if (name in prop)
          prop = prop[name]();
        else
          prop = null;
        if (!prop) break;
      }
      var lastName = propNameOrChain[chainLastIndex];
      // if property getter returns null, or there is no such property to call, we skip the cell
      if (!prop || !(lastName in prop)) continue;
      // a way to check if propValueOrArray is an array - if it is, we call apply to pass all array elements to a setter
      if (propValueOrArray != null && typeof propValueOrArray != 'string' && typeof propValueOrArray.length == 'number')
        prop[lastName].apply(prop, propValueOrArray);
      // or just call the setter with one parameter
      else
        prop[lastName](propValueOrArray);
    }
  }

  /**
   * Utility function to setup property to a whole column. Samples of usage:
   * 1) setupColProp(table, 0, ['content', 'padding', 'left'], 10);
   *    Sets left padding of cell content in column 0 to 10 if there is a content, where left padding can be set in cells.
   *    So its equivalent to call cell.content().padding().left(10) for all cells in column 0.
   * 2) setupColProp(table, 1, 'padding', [0, 1, 2, 3]);
   *    Sets padding of all cells in the 1 row to (0, 1, 2, 3).
   *    Its equivalent to call cell.padding(0, 1, 2, 3) for all cells in column 1.
   * This two ways of usage can be combined, for example:
   *    setupRowProp(table, 0, ['content', 'padding'], [1, 2, 3, 4]);
   *    It is equivalent to calling cell.content().padding(1, 2, 3, 4) for all cells in column 0.
   * If the last parameter is set to true, than the first row (that can be a header row) will be skipped.
   * This method fails if the property chain is incorrect (for example there is no such property you ask).
   * @param {anychart.core.ui.Table} table Table to setup row for.
   * @param {number} colIndex Row index.
   * @param {!Array.<string>|string} propNameOrChain Property name to access, like 'border' or chain of property names
   *    to access, e.g. ['content', 'fontSize']. Note: no checking on valid results is done, so it's up to you to
   *    ensure property existence.
   * @param {*|Array.<*>} propValueOrArray Value or array of values to set.
   * @param {boolean=} opt_skipFirstRow Set true to skip first row.
   */
  function setupColProp(table, colIndex, propNameOrChain, propValueOrArray, opt_skipFirstRow) {
    // if passed column index is out of passed table - exit
    if (colIndex >= table.colsCount()) return;
    // normalize propNameOrChain to an array handle in one way
    if (typeof propNameOrChain == 'string') propNameOrChain = [propNameOrChain];
    // cache last chain index
    var chainLastIndex = propNameOrChain.length - 1;
    // for all rows in the table (except first, if opt_skipFirstRow is true
    for (var i = opt_skipFirstRow ? 1 : 0; i < table.rowsCount(); i++) {
      // get the cell
      var prop = table.getCell(i, colIndex);
      // pass over the cell to the last but one property
      for (var j = 0; j < chainLastIndex; j++) {
        var name = propNameOrChain[j];
        if (name in prop)
          prop = prop[name]();
        else
          prop = null;
        if (!prop) break;
      }
      var lastName = propNameOrChain[chainLastIndex];
      // if property getter returns null, or there is no such property to call, we skip the cell
      if (!prop || !(lastName in prop)) continue;
      // a way to check if propValueOrArray is an array - if it is, we call apply to pass all array elements to a setter
      if (propValueOrArray != null && typeof propValueOrArray != 'string' && typeof propValueOrArray.length == 'number')
        prop[lastName].apply(prop, propValueOrArray);
      // or just call the setter with one parameter
      else
        prop[lastName](propValueOrArray);
    }
  }

  /**
   * Utility function to calculate the sum of field values over a view.
   * @param {anychart.data.View} view
   * @param {string} fieldName
   * @return {number}
   */
  function calcSum(view, fieldName) {
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
    // we use calcSum() function to get a sum over the field and then divide by the number of rows in the view.
    return calcSum(view, fieldName) / view.getIterator().getRowsCount();
  }

  /**
   * Utility function to get the value of the field in last row in the view.
   * @param {anychart.data.View} view
   * @param {string} fieldName
   * @return {*}
   */
  function getLastFieldValue(view, fieldName) {
    var iterator = view.getIterator();
    if (iterator.select(iterator.getRowsCount() - 1))
      return iterator.get(fieldName);
    else
      return undefined;
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
   * Formats the number to the US currency format.
   * @param {number} value
   * @param {number=} opt_decimalDigits
   * @return {string}
   */
  function formatNumber(value, opt_decimalDigits) {
    // Short way to add thousand separators to the number.
    return value.toFixed(opt_decimalDigits || 2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  /**
   * Formats the date in manner we need it to be formatted in the sample.
   * @param {Date} value
   * @return {string}
   */
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
    /**
     * Returns if a year is a leap year.
     * @param {number} year
     * @return {boolean}
     */
    function isLeapYear(year) {
      // Leap year logic; the 4-100-400 rule
      return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    }

    /**
     * Returns the number of days in a month. Also needs year to handle leap years.
     * @param {number} year
     * @param {number} month
     * @return {number}
     */
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

    /**
     * Returns the number of days in a year.
     * @param {number} year
     * @return {number}
     */
    function getNumberOfDaysInYear(year) {
      return isLeapYear(year) ? 366 : 365;
    }

    // the sign of the difference
    var sign = 1;
    // we swap dates if the difference is "negative" to shorten the calculations and remember the sign
    if (date1.getTime() > date2.getTime()) {
      var tmp = date1;
      date1 = date2;
      date2 = tmp;
      sign = -1;
    }
    // getting some info from the dates.
    var y1 = date1.getUTCFullYear();
    var y2 = date2.getUTCFullYear();
    var m1 = date1.getUTCMonth();
    var m2 = date2.getUTCMonth();
    var d1 = date1.getUTCDate();
    var d2 = date2.getUTCDate();
    var result = 0, i;
    // if the dates are from different years
    if (y1 < y2) {
      // than we should add all full years to the result
      for (i = y1 + 1; i < y2; i++)
        result += getNumberOfDaysInYear(i);
      // all full months from the rest of the first year of the range
      for (i = m1 + 1; i < 12; i++)
        result += getNumberOfDaysInMonth(y1, i);
      // and all full month from the beginning of the last year of the range
      for (i = 0; i < m2; i++)
        result += getNumberOfDaysInMonth(y2, i);
      // and all days from the rest of the month of the first date
      result += getNumberOfDaysInMonth(y1, m1) - d1;
      // and all days from the beginning of the month of the second date
      result += d2;
    } else if (m1 < m2) {
      // else, if the year is the same but month are different
      // than we should add all full months in the range between the two dates
      for (i = m1 + 1; i < m2; i++)
        result += getNumberOfDaysInMonth(y1, i);
      // and all days from the rest of the month of the first date
      result += getNumberOfDaysInMonth(y1, m1) - d1;
      // and all days from the beginning of the month of the second date
      result += d2;
    } else {
      // else we can just substract one date from another and get the result
      result += d2 - d1;
    }
    // and in the end we should take into account the sign of the difference.
    return result * sign;
  }

  /**
   * Creates filtering functions to filter out rows from a view that are not equal to the fieldValue.
   * It is used in this sample to filter the SARawData by the system.
   * @param {string} fieldValue
   * @return {Function}
   */
  function filterBySystem(fieldValue) {
    return function(value) {
      return fieldValue == value;
    }
  }

  // endregion

  // region Reports
  /**
   * Forms System Availability report using passed data.
   * @param {Array.<Array>} rawData Raw system availability data. See SARawData variable for sample.
   * @param {Array.<Array>} acceptedAvailabilities Data to form "acceptation ranges". Also responsible for systems order
   *    in the report. See SAAcceptedAvailability variable for sample.
   * @return {{report: anychart.graphics.vector.Layer, bounds: anychart.math.Rect}} Report object.
   */
  function formSAReport(rawData, acceptedAvailabilities) {
    // we are not going to need different mapping on the raw data, so we map it at the same time
    // we use 'System' and 'Availability' fields in our calculations and 'x' and 'value' fields are used by line charts.
    var rawView = anychart.data.set(rawData).mapAs({'System': [0], 'Availability': [2], 'x': [1], 'value': [2]});

    // we use common scales for charts in columns to make them comparable
    var bulletScale = anychart.scales.linear();
    // settings manual minimum and maximum to show the range we need.
    bulletScale
        .minimum(85)
        .maximum(100);

    // we use common scale for lines also
    var lineScale = createTightDTScale();

    // we create a markers factory to draw some markers and configure it here
    var markers = anychart.ui.markersFactory();
    markers
        .anchor('center')
        .position('center')
        .type('circle')
        .fill('#c00')
        .stroke('2 #900')
        .size(5);
    // to use markers in a table we don't need call markers.draw() at all - we just need to add a marker obtained by
    // markers.add(null) call to cell contents, the table will do the rest

    // Preparing report data.
    // We will build a table using table.contents() method, so we need to build table contents first
    // Here we make a header row contents. There will be 5 columns in the table
    var contents = [['Last 12 Month', null, 'System', 'Availability %', null]];
    // Now we will form row contents for each system listed in acceptedAvailabilities
    for (var i = 0; i < acceptedAvailabilities.length; i++) {
      // system name stored in first column
      var system = acceptedAvailabilities[i][0];
      // accepted availability value - in second
      var availability = acceptedAvailabilities[i][1];

      // preparing data for the row
      // we filter the main data set by the system name and get the view that contain rows only for the current system.
      var systemData = rawView.filter('System', filterBySystem(system));
      // and calculate average availability for that filtered view.
      var avgAvailability = calcAvg(systemData, 'Availability');

      // we will need one line chart per system
      // we don't need any other chart elements besides the chart line, so we can use line series directly here.
      var line = anychart.core.cartesian.series.line(systemData);
      // we set come line properties to make it look better and also we set the common x scale
      line
          .stroke('2 #000')
          .xScale(lineScale);
      // we don't want a tooltip on these lines
      line.tooltip().enabled(false);
      // we do not call .draw() method here, because the table will do it for us

      // if average availability is less than accepted for the system, we will place a marker in the row
      var marker;
      if (avgAvailability < availability)
        marker = markers.add(null);
      else
        marker = null;
      // we do not call .draw() method here and we won't call markers.draw(), because the table will do it for us

      // we will also need one bullet chart per system to show current situation. We create it and setup.
      var bullet = anychart.bullet([{'value': avgAvailability, 'type': 'line', 'gap': 0.4}]);
      bullet
          .scale(bulletScale)
          .padding(0)
          .margin(0);
      bullet.range(0)
          .from(availability)
          .to(100)
          .fill('#ccc');
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background()
          .enabled(true)
          .stroke('#ccc')
          .fill('#fff');
      // we do not call .draw() method here, because the table will do it for us

      // and finally we form and push next row to table contents array.
      contents.push([line, marker, system, bullet, avgAvailability.toFixed(1) + '%']);
    }

    // we wil also need an axis to show bullet scale, because they are usless without it
    // so we create and set it up here
    var axis = anychart.axes.linear();
    axis
        .scale(bulletScale)
        .orientation('bottom')
        .staggerMode(false)
        .stroke('#ccc');
    axis.ticks().stroke('#ccc');
    axis.minorTicks().enabled(false);
    axis.title().enabled(false);
    axis.labels()
        .fontSize('9px')
        .textFormatter(function(value) {
          return value['tickValue'] + '%';
        });
    // and form a row that will contain our axis
    contents.push([null, null, null, axis, null]);

    // now, as we have our table contents prepared, we can form a layer that will contain the report
    // we create a layer
    var container = anychart.graphics.layer();
    // we create some variables to handle report bounds information
    var titleHeight = 20;
    var tableHeight = (contents.length - 1) * 24 + 20;
    var reportBounds = anychart.math.rect(0, 0, 357, tableHeight + titleHeight);

    // we create report title, set it up and draw it to the layer
    var title = anychart.ui.title();
    title
        .container(container)
        .parentBounds(reportBounds)
        .fontWeight('normal')
        .text('<span style="color:#ED8C2B; font-size: 15px;">System Availability</span> <span style="color: #666666; font-size: 10px; font-weight: normal;">(last 30 days)</span>')
        .orientation('top')
        .align('left')
        .vAlign('bottom')
        .margin(0)
        .padding(0)
        .height(titleHeight)
        .useHtml(true)
        .draw();

    // we also create a legend for our bullet charts and place it into the title
    var legendParentBounds = anychart.math.rect(reportBounds.left, reportBounds.top, reportBounds.width, titleHeight);
    var legend = anychart.ui.legend();
    // we use custom legend items and custom icon drawers here
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
    legend
        .fontSize('9px')
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .itemsLayout('horizontal')
        .iconTextSpacing(0)
        .container(container)
        .align('right')
        .position('bottom')
        .padding(0)
        .margin(0)
        .itemsSpacing(0)
        .parentBounds(legendParentBounds);
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.background().enabled(false);
    legend.draw();

    // we finally create, setup and draw the table to the layer
    var table = anychart.ui.table();
    table
        .container(container)
        .top(title.getRemainingBounds().getTop())
        .height(tableHeight)
        .width(reportBounds.width)
        .contents(contents)
        .rowHeight(0, 20)
        .colWidth(0, 93)
        .colWidth(1, 20)
        .colWidth(2, 106)
        .colWidth(3, 95)
        .colWidth(4, 43)
        .cellBorder(null);
    table.cellTextFactory()
        .padding(0)
        .vAlign('center')
        .hAlign('left');
    table.getCell(table.rowsCount() - 1, 3).padding(0, 2, 5);
    table.getCell(0, 3)
        .colSpan(2)
        .content()
        .hAlign('right');
    // we use our utility method here to setup some properties for entire rows and columns
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'fontFamily'], 'verdana, helvetica, arial, sans-serif');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 3, 'padding', [5, 2, 4], true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    // and draw the table
    table.draw();

    // we return an object with both report layer and desired bounds
    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  /**
   * Forms Hardware Capacity report using passed data.
   * @param {Array.<Array>} CPUData Raw CPU Capacity data.
   * @param {Array.<Array>} StorageData Raw Storage Capacity data.
   * @param {Array.<Array>} NetworkData Raw Network Capacity data.
   * @param {Array} CPURanges Data used to make "acceptation ranges" for CPU capacity levels.
   * @param {Array} StorageRanges Data used to make "acceptation ranges" for Storage capacity levels.
   * @param {Array} NetworkRanges Data used to make "acceptation ranges" for Storage capacity levels.
   * @return {{report: anychart.graphics.vector.Layer, bounds: anychart.math.Rect}} Report object.
   */
  function formHCReport(CPUData, StorageData, NetworkData, CPURanges, StorageRanges, NetworkRanges) {
    // we declare some variables to collect content elements for the report table
    var lines = [], bullets = [], averages = [];

    // we use a common bullet scale like in the previous report to make them comparable
    var bulletScale = anychart.scales.linear();
    // we setup minimum and maximum because we know what range we want to show
    bulletScale
        .minimum(0)
        .maximum(100);
    // also we setup ticks count to make our tiny axis that will use this scale look better
    bulletScale.ticks()
        .count(3);
    bulletScale.minorTicks()
        .count(3);

    // we make almost the same manipulation for all three metrics that we want to show in this report
    // (CPU, storage, network), so we can make them in a "for", collecting results to arrays declared before
    for (var i = 0; i < 3; i++) {
      // we create a data set and map in a default way, because it suites us well in this case (we have an array of
      // arrays in our incomming data, where in the first column there is 'x' and in the second column there is 'value')
      var data = anychart.data.set(arguments[i]).mapAs();

      // we calculate average value of capacity to show it in the table
      var avg = calcAvg(data, 'value');

      // we will need one line chart per hardware system
      // we don't need any other chart elements besides the chart line, so we can use line series directly here.
      var line = anychart.core.cartesian.series.line(data);
      // we set come line properties to make it look better and also we set the common x scale
      line
          .stroke('2 #000')
          .xScale(createTightDTScale());
      // we don't want a tooltip on these lines
      line
          .tooltip()
          .enabled(false);
      // we do not call .draw() method here, because the table will do it for us

      // we cache ranges array corresponding to current hardware system
      var ranges = arguments[3 + i];
      // we will also need one bullet chart per system
      var bullet = anychart.bullet([{'value': avg, 'type': 'bar', gap: 0.6}]);
      // we create some ranges using passed ranges array to show what levels of used capacity are good and what are not
      bullet.range(0)
          .from(ranges[0])
          .to(ranges[1])
          .fill('#ccc');
      bullet.range(1)
          .from(ranges[1])
          .to(ranges[2])
          .fill('#aaa');
      bullet.range(2)
          .from(ranges[2])
          .to(ranges[3])
          .fill('#666');
      // we also setup some apparance settings of the bullet chart to make it look better
      bullet
          .scale(bulletScale)
          .padding(0)
          .margin(0);
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background().enabled(false);
      // we do not call .draw() method here, because the table will do it for us

      // we push elements we made to proper arrays
      lines.push(line);
      bullets.push(bullet);
      averages.push(avg.toFixed() + '%');
    }

    // we will need an axis to show scale values for bullet charts, so we create it and set it up
    var axis = anychart.axes.linear();
    axis
        .scale(bulletScale)
        .orientation('bottom')
        .stroke('#ccc');
    axis.title().enabled(false);
    axis.ticks().stroke('#ccc');
    axis.minorTicks()
        .enabled(true)
        .stroke('#ccc');
    axis.labels()
        .fontSize('9px')
        .textFormatter(function(value) {
          return value['tickValue'] + '%';
        });

    // now we have all we need to prepare table contents array - the shortest way to create a table
    var contents = [
      ['CPU', 'Today', lines[0], 'Overall', bullets[0], averages[0]],
      ['Storage', 'Last 12 Mo.', lines[1], 'Today', bullets[1], averages[1]],
      ['Network', 'Last 12 Mo.', lines[2], 'Today', bullets[2], averages[2]],
      [null, null, null, null, axis, null]
    ];

    // now we create a report layer and declare some info about report bounds
    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableHeight = (contents.length - 1) * 18 + 24;
    var reportBounds = anychart.math.rect(0, 0, 357, tableHeight + titleHeight);

    // we create, setup and draw report title to the layer
    var title = anychart.ui.title();
    title
        .container(container)
        .parentBounds(reportBounds)
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .fontWeight('normal')
        .fontSize('15px')
        .fontColor('#ED8C2B')
        .text('Hardware % of Capacity')
        .orientation('top')
        .align('left')
        .vAlign('bottom')
        .margin(0)
        .padding(0, 0, 2, 0)
        .height(titleHeight)
        .useHtml(false)
        .draw();

    // then we create, setup and draw a custom legend for bullet charts to make them more useful
    var legend = anychart.ui.legend();
    // we setup legend items first using custom icon drawers
    legend.itemsProvider([
      {
        'index': 0,
        'text': 'Actual',
        'iconType': function(path, size) {
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var width = size * 0.6;
          path
              .clear()
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
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path
              .clear()
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
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path
              .clear()
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
          var x = Math.round(size / 2);
          var y = Math.round(size / 2);
          var height = size * 0.8;
          path
              .clear()
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
    // then we setup some legend appearance setting to position it and make it look nice
    legend
        .fontSize('9px')
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .itemsLayout('horizontal')
        .iconTextSpacing(0)
        .container(container)
        .align('right')
        .position('bottom')
        .padding(0, 0, 2, 0)
        .margin(0)
        .itemsSpacing(0)
        .parentBounds(anychart.math.rect(reportBounds.left, reportBounds.top, reportBounds.width, titleHeight));
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.background().enabled(false);
    legend.draw();

    // and finally we create, setup and draw the report body - the table
    var table = anychart.ui.table();
    table
        .container(container)
        .top(title.getRemainingBounds().top + 2)
        .height(tableHeight)
        .width(reportBounds.width)
        .contents(contents)
        .rowHeight(table.rowsCount() - 1, 24)
        .colWidth(0, 60)
        .colWidth(1, 60)
        .colWidth(2, 77)
        .colWidth(3, 50)
        .colWidth(4, 80)
        .colWidth(5, 30)
        .cellBorder(null);
    table.cellTextFactory()
        .padding(0)
        .vAlign('center')
        .hAlign('left')
        .fontSize('10px');
    // we use our utility method to setup some properties to entier rows and columns
    setupRowProp(table, 0, 'topBorder', '2 #ccc');
    setupColProp(table, 0, ['content', 'fontSize'], '12px', false);
    setupColProp(table, 2, 'padding', [3, 3], false);
    setupColProp(table, 3, 'padding', [0, 0, 0, 8], false);
    setupColProp(table, 4, 'padding', [5, 2, 4], false);
    setupColProp(table, 5, ['content', 'hAlign'], 'right', false);
    setupColProp(table, 5, ['content', 'fontSize'], '11px', false);
    table.draw();

    // we return an object with both report layer and desired bounds
    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  /**
   * Forms Daily Network Traffic report using passed data.
   * @param {Array.<Array>} sixMonthsData Average daily traffic for last 6 months.
   * @param {Array.<Array>} weekData Average daily traffic for last week.
   * @param {Array.<Array>} yesterdayData Average daily traffic for last day.
   * @return {{report: anychart.graphics.vector.Layer, bounds: anychart.math.Rect}} Report object.
   */
  function formDNTReport(sixMonthsData, weekData, yesterdayData) {
    // we create a report layer and declare some info about report bounds
    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var chartHeight = 140;
    var reportBounds = anychart.math.rect(0, 0, 357, chartHeight + titleHeight);

    // now we create, setup and draw report title
    var title = anychart.ui.title();
    title
        .container(container)
        .parentBounds(reportBounds)
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .fontWeight('normal')
        .text('<span style="color:#ED8C2B; font-size: 15px;">Daily Network Traffic</span> <span style="color: #666666; font-size: 10px; font-weight: normal;">(kilobytes)</span>')
        .orientation('top')
        .align('left')
        .vAlign('bottom')
        .margin(0)
        .padding(0, 0, 2, 0)
        .height(titleHeight)
        .useHtml(true)
        .draw();

    // we cannot use table borders to draw this grey line, so we draw it using native graphics path
    container.path()
        .moveTo(0, titleHeight)
        .lineTo(reportBounds.width, titleHeight)
        .stroke('2 #ccc');

    // Now we will create the main object of this report - the chart
    // We want to do a rather complex thing here - we want the plotting area where series are drawn to have a top border.
    // We can't use background here, because plotting area itself has no background. So we are forced to use top axis,
    // but we don't want any ticks or labels on it, so we will turn off all that staff.
    // Also we want to show 24 points with 25 labels on the bottom axis - to place each data point between two ticks.
    // The only way to do it - to make different scales for data and for the bottom axis.
    // Also we want custom label formats for the axis and only 3 lines of the grid (it means 5 ticks on our 25-ticks
    // scale, or 6 hours tick interval). Let's see how we can do all that staff.

    // let's create our custom scale for bottom axis and x-grid first:
    // we make a date-time scale and set fixed minimum and maximum for it
    var xAxisScale = anychart.scales.dateTime();
    // it doesn't matter what date we set - only the time matters, so let's make it from 01/01/1900 to 01/02/1900
    xAxisScale.minimum(Date.UTC(0, 0, 1, 0));
    xAxisScale.maximum(Date.UTC(0, 0, 2, 0));
    // we set major and minor tick intervals to 6 and 1 hours respectively
    xAxisScale.ticks().interval(0, 0, 0, 6);
    xAxisScale.minorTicks().interval(0, 0, 0, 1);

    // now we create the chart and setup it's bounds.
    var chart = anychart.cartesian();
    chart
        .container(container)
        .left(0)
        .top(titleHeight)
        .width(reportBounds.width)
        .height(chartHeight);

    // first we will create series we need
    // we will use palette to setup series colors:
    chart.palette(['#aaa', '#666', '#000']);
    var line1 = chart.line(sixMonthsData);
    line1.name('Daily mean for last 6 month');
    line1.markers().enabled(false);
    line1.tooltip().enabled(false);
    var line2 = chart.line(weekData);
    line2.name('Daily mean for last 7 days');
    line2.markers().enabled(false);
    line2.tooltip().enabled(false);
    var line3 = chart.line(yesterdayData);
    line3.name('Yesterday');
    line3.markers().enabled(false);
    line3.tooltip().enabled(false);

    // then we will setup the bottom axis:
    // we create it, as it doesn't exist yet
    var bottomAxis = chart.xAxis(0);
    // we setup our custom scale for the axis and make some appearance improvements
    bottomAxis
        .scale(xAxisScale)
        .staggerMode(false)
        .overlapMode('allowOverlap')
        .stroke('#ccc');
    // we switch off axis title and all ticks, as we don't need them
    bottomAxis.title().enabled(false);
    bottomAxis.ticks().enabled(false);
    bottomAxis.minorTicks().enabled(false);
    // now we will setup minor axis labels - we want them to show just hours in 12-hours system and nothing more
    bottomAxis.minorLabels()
        .enabled(true)
        .textFormatter(function(value) {
          var date = new Date(value['tickValue']);
          var h = date.getUTCHours() % 12;
          return h || 12;
        });
    // now we will setup major axis labels - we know, that our custom scale has 5 ticks:
    // 12AM, 6AM, 12PM, 6PM and 12AM again
    // we want major labels to look like minor, but to show AM and PM strings below on first 12AM and 12PM ticks,
    // so we do that using custom textFormatter:
    bottomAxis.labels()
        .enabled(true)
        .textFormatter(function(value) {
          var date = new Date(value['tickValue']);
          var hour = date.getUTCHours();
          var h = (hour % 12) || 12;
          if (hour == 0 && date.getUTCDay() == 1)
            return h + '\nAM';
          else if (hour == 12)
            return h + '\nPM';
          else
            return h;
        });

    // now we can setup a grid
    // we use our custom scale in it to fit axis labels and grid lines
    chart.grid()
        .scale(xAxisScale)
        .oddFill(null)
        .evenFill(null)
        .stroke('#ccc')
        .layout('vertical');

    // then we will setup our top "border" - the top axis
    // we create it and turn off all it's elements except the axis line
    var topAxis = chart.xAxis(1);
    topAxis
        .stroke('#ccc')
        .orientation('top');
    topAxis.ticks().enabled(false);
    topAxis.minorTicks().enabled(false);
    topAxis.title().enabled(false);
    topAxis.labels().enabled(false);
    topAxis.minorLabels().enabled(false);

    // now we will setup Y scale and axis:
    chart.yScale()
        .maximumGap(0)
        .minimumGap(0);
    var leftAxis = chart.yAxis();
    leftAxis.stroke('#ccc');
    leftAxis.title().enabled(false);
    leftAxis.ticks().stroke('#ccc');
    leftAxis.minorTicks().enabled(false);
    // we want custom formatting on Y axis labels, because it needs less space
    leftAxis.labels().textFormatter(function(value) {
      return (value['tickValue'] / 1000).toFixed(0) + 'K';
    });

    // the last thing we need to setup for this chart is the legend
    var legend = chart.legend();
    legend
        .enabled(true)
        .fontSize('9px')
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .itemsLayout('horizontal')
        .iconTextSpacing(3)
        .itemsSpacing(4)
        .align('right')
        .position('top')
        .padding(0, 0, 2, 0)
        .margin(3, 0);
    // we disable other legend elements, as we don't need them
    legend.background().enabled(false);
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.tooltip().enabled(false);

    // finally we draw the chart to the layer
    chart.draw();

    // we return an object with both report layer and desired bounds
    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  /**
   * Forms Key Non-System Metrics report using passed data.
   * @param {Array.<Array>} expensesData Raw expenses data.
   * @param {Array.<Array>} satisfactionData Raw customers satisfaction data.
   * @param {Array.<Array>} problemsData Raw level 1 problems data.
   * @param {Array} expensesRanges Data used to make "acceptation ranges" for company expenses levels.
   * @param {Array} satisfactionRanges Data used to make "acceptation ranges" for customer satisfaction levels.
   * @param {Array} problemsRanges Data used to make "acceptation ranges" for level 1 problems levels.
   * @param {number} budget Year budget value.
   * @param {number} problemsTarget Problems planned level.
   * @return {{report: anychart.graphics.vector.Layer, bounds: anychart.math.Rect}} Report object.
   */
  function formKNSMReport(expensesData, satisfactionData, problemsData, expensesRanges, satisfactionRanges,
      problemsRanges, budget, problemsTarget) {
    // as the first step we should map passed raw data arrays to be able to work with them
    var views = [
      anychart.data.set(expensesData).mapAs(),
      anychart.data.set(satisfactionData).mapAs(),
      anychart.data.set(problemsData).mapAs()
    ];
    // then we prepare some data we want to show in the report using our utility methods we declared above
    var actualExpenses = calcSum(views[0], 'value');
    var actualSatisfaction = getLastFieldValue(views[1], 'value');
    var actualProblems = calcAvg(views[2], 'value');
    // we will use these values to determing metrics health
    var actualValues = [
      actualExpenses / (budget / expensesData.length * 12) * 100,
      actualSatisfaction,
      actualProblems
    ];
    // these texts will be shown in the last column
    var actualTexts = [
      '$' + formatNumber(actualExpenses / 1000, 1) + 'K',
      actualSatisfaction + '/100',
      actualProblems.toFixed(0)
    ];
    // these values will be used to setup range markers for line charts in the first column
    var rangesForLines = [
      [0, budget / 12],
      [satisfactionRanges[0], satisfactionRanges[1]],
      [problemsRanges[0] / 100 * problemsTarget, problemsRanges[2] / 100 * problemsTarget]
    ];
    // these strings will be shown in the third column
    var metrics = [
      'Expenses YTD',
      'Customer Satisfaction',
      'Level 1 Problems'
    ];

    // we use common scales for charts in columns to make them comparable
    var bulletScale = anychart.scales.linear();
    // we set manual minimum and maximum to show the range we need.
    bulletScale
        .minimum(0)
        .maximum(150);

    // we create a markers factory to draw some markers and configure it here
    var markers = anychart.ui.markersFactory();
    markers
        .anchor('center')
        .position('center')
        .type('circle')
        .fill('#c00')
        .stroke('2 #900')
        .size(5);

    // preparing report table contents
    var contents = [['Year-to-Date', null, 'Metric', '% of Target', 'Actual']];
    // forming a row for each system
    for (var i = 0; i < 3; i++) {
      // preparing data for the row
      var ranges = arguments[i + 3];

      // we want to show a range marker for each metric, so we can't use just standalone series - we need charts
      // so we create and empty cartesian chart
      var chart = anychart.cartesian();
      // setup X scale
      chart.xScale(createTightDTScale());
      // create and setup a line on it
      var line = chart.line(views[i]);
      line.stroke('2 #000');
      line.markers().enabled(false);
      line.tooltip().enabled(false);
      // and create and setup a range marker on it (it has horizontal layout by default)
      chart.rangeMarker(0)
          .from(rangesForLines[i][0])
          .to(rangesForLines[i][1]);
      // and also we enable chart background to show chart borders
      chart.background()
          .enabled(true)
          .stroke('#ccc')
          .fill('none');

      // now we deside whether to show a marker for the row or not using our data ranges
      var marker;
      if (actualValues[i] > Math.max(ranges[0], ranges[1]) || actualValues[i] < Math.min(ranges[0], ranges[1]))
        marker = markers.add(null);
      else
        marker = null;

      // we will also need one bullet chart per system
      // so we crete it
      var bullet = anychart.bullet([{'value': actualValues[i], 'type': 'bar', 'gap': 0.6}]);
      // setup the scale and some appearance settings
      bullet
          .scale(bulletScale)
          .padding(0)
          .margin(0);
      // create three ranges that we need to show and configure them
      bullet.range(0)
          .from(ranges[0])
          .to(ranges[1])
          .fill('#ccc');
      bullet.range(1)
          .from(ranges[1])
          .to(ranges[2])
          .fill('#aaa');
      bullet.range(2)
          .from(ranges[2])
          .to(ranges[3])
          .fill('#666');
      // and disable chart elements we don't need
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background().enabled(false);

      // and add the row we just made contents for to an array
      contents.push([chart, marker, metrics[i], bullet, actualTexts[i]]);
    }

    // also we need an axis to show common bullet scale ticks so we create it and set it up here
    var axis = anychart.axes.linear();
    axis
        .scale(bulletScale)
        .orientation('bottom')
        .staggerMode(false)
        .overlapMode('allowOverlap')
        .stroke('#ccc');
    axis.title().enabled(false);
    axis.ticks().stroke('#ccc');
    axis.minorTicks().enabled(false);
    axis.labels()
        .fontSize('9px')
        .textFormatter(function(value) {
          return value['tickValue'] + '%';
        });

    // and add it to table contents array
    contents.push([null, null, null, axis, null]);

    // now we declare some variables to create report layer and store some info about report bounds
    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableHeight = (contents.length - 1) * 24 + 20;
    var reportBounds = anychart.math.rect(0, 0, 380, tableHeight + titleHeight);

    // we will need a title for the report, so we create, setup and draw it to the report layer
    var title = anychart.ui.title();
    title
        .container(container)
        .parentBounds(reportBounds)
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .fontWeight('normal')
        .fontSize('15px')
        .fontColor('#ED8C2B')
        .text('Key Non-System Metrics')
        .orientation('top')
        .align('left')
        .vAlign('bottom')
        .margin(0)
        .padding(0, 0, 2, 0)
        .height(titleHeight)
        .useHtml(false)
        .draw();

    // also we will need a legend for bullet charts, so we create, setup and draw it to the report layer
    // this legend has custom drawers for legend item icons, as you can see below
    var legendParentBounds = anychart.math.rect(reportBounds.left, reportBounds.top, reportBounds.width, titleHeight);
    var legend = anychart.ui.legend();
    legend
        .container(container)
        .parentBounds(legendParentBounds)
        .itemsLayout('horizontal')
        .iconTextSpacing(0)
        .itemsSpacing(0)
        .align('right')
        .position('bottom')
        .padding(0, 0, 2, 0)
        .margin(0)
        .fontSize('9px')
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .itemsProvider([
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
    legend.background().enabled(false);
    legend.title().enabled(false);
    legend.titleSeparator().enabled(false);
    legend.paginator().enabled(false);
    legend.draw();

    // finally we can create the main report object - the table
    var table = anychart.ui.table();
    // we setup some nessessary properties of the table to tell it how and where to be drawn
    table
        .container(container)
        .top(title.getRemainingBounds().getTop())
        .height(tableHeight)
        .width(reportBounds.width)
        .contents(contents)
        .rowHeight(0, 20)
        .colWidth(0, 92)
        .colWidth(1, 20)
        .colWidth(2, 130)
        .colWidth(3, 82)
        .colWidth(4, 56)
        .cellBorder(null);
    table.cellTextFactory()
        .padding(0)
        .vAlign('center')
        .hAlign('left');
    table.getCell(table.rowsCount() - 1, 3).padding(0, 2, 5);
    table.getCell(0, 4).content().hAlign('right');
    // we use our utility methods to make setting up whole rows and columns easier
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'fontFamily'], 'verdana, helvetica, arial, sans-serif');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 0, 'padding', [2, 0], true);
    setupColProp(table, 3, 'padding', [6, 2, 5], true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    // and finally we draw the table to the report layer
    table.draw();

    // but there is one more thing we want to draw on this report - a thin vertical line over all bullet charts,
    // showing the 100% mark
    // to do that we should determine exact X position of the 100% mark, using the common bullet scale and axis position
    // so we get the upper cell we want to draw the line at to determine both X and top Y coordinates
    var cell = table.getCell(1, 3);
    // determine its bounds
    var bounds = cell.getBounds();
    // take cell padding into consideration
    var padding = cell.padding();
    bounds.left += padding.left();
    bounds.width -= padding.left() + padding.right();
    // transform the value "100" using the scale of the axis
    // the scale.transform() method returns a ratio of the value passed between minimum and maximum of the scale
    // this ration is usually between 0 and 1, if the passed value is between minimum and maximum of the scale
    // so to get pixel coords we need to use proportions:
    var x = bulletScale.transform(100) * bounds.width + bounds.left;
    // lets make an offset of two pixels from the top of the cell
    var top = bounds.top + 2;
    // to determine the bottom line position let's use a handy axis method getRemainingBounds, using which we can
    // get axis line Y coordinate in this situation and axis major tick lengths to make the line we want to draw
    // look good
    var bottom = axis.getRemainingBounds().getBottom() + axis.ticks().length();
    // now we have all coordinates we need to draw the line we want
    container.path()
        .stroke('#000')
        .fill('none')
        .moveTo(x, top)
        .lineTo(x, bottom);

    // we return an object with both report layer and desired bounds
    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  /**
   * Forms Major Project Milestones report using passed data.
   * @param {Array.<Array>} data Raw Major Project Milestones data.
   * @param {Date} today Today's date.
   * @return {{report: anychart.graphics.vector.Layer, bounds: anychart.math.Rect}} Report object.
   */
  function formMPMReport(data, today) {
    // for this report we will need a common bullet scale with the range we want to show
    var bulletScale = anychart.scales.linear();
    bulletScale
        .minimum(-20)
        .maximum(20);

    // and a markers factory to place some markers in rows we want to draw attention to
    var markers = anychart.ui.markersFactory();
    markers
        .anchor('center')
        .position('center')
        .type('circle')
        .fill('#c00')
        .stroke('2 #900')
        .size(5);

    // now we will start forming report table contents
    // we place headings to the first row of the table
    var contents = [[null, 'Project', 'Milestone', 'Days Until/\nPast Due', 'Due\nDate']];

    // than we aggregate passed data to a data set and map it to make iterating over it easier
    var view = anychart.data.set(data).mapAs({'Project': [0], 'Milestone': [1], 'Due': [2]});

    // now we get an iterator over the mapped data
    var iterator = view.getIterator();
    // and iterate it
    while (iterator.advance()) {
      // we determine milestone due using our iterator
      var dueDate = new Date(iterator.get('Due'));
      // and count the difference in days between today and the due date
      var diff = getDiffInDays(today, dueDate);

      // we will also need one bullet chart per system
      // we fill bullet bars with different color depending if the milestone is past or before due
      var bullet = anychart.bullet([{
        'value': diff,
        'type': 'bar',
        'gap': 0.4,
        'fill': ((diff >= 0) ? '#999' : '#000')
      }]);
      // we setup some bullet appearance properties and bullet scale here
      bullet
          .scale(bulletScale)
          .padding(0)
          .margin(0);
      bullet.title().enabled(false);
      bullet.axis().enabled(false);
      bullet.background().enabled(false);

      // now we determine if we need a marker in this row (if milestone due is more than 10 days before today)
      var marker;
      if (diff <= -10)
        marker = markers.add(null);
      else
        marker = null;

      // and finally add the formed row to contents array using some utility functions and iterator
      contents.push([
        marker,
        iterator.get('Project'),
        iterator.get('Milestone'),
        bullet,
        formatDate(dueDate)
      ]);
    }

    // to make bullets more clear and comparable we use common axis for them
    // here we create and set it up
    var axis = anychart.axes.linear();
    axis
        .scale(bulletScale)
        .orientation('bottom')
        .staggerMode(false)
        .overlapMode('allowOverlap')
        .stroke('#ccc');
    axis.title().enabled(false);
    axis.labels().fontSize('9px');
    axis.ticks().stroke('#ccc');
    axis.minorTicks().enabled(false);

    // and add the axis to the table contents array
    contents.push([null, null, null, axis, null]);

    // now we are ready to create report layer and define some variables to store report bounds data
    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableTop = titleHeight - 20;
    var tableHeight = (contents.length - 1) * 24 + 40;
    var reportBounds = anychart.math.rect(0, 0, 380, tableHeight + tableTop);

    // we create, setup and draw a title for the report
    var title = anychart.ui.title();
    title
        .container(container)
        .parentBounds(reportBounds)
        .height(titleHeight)
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .fontWeight('normal')
        .text('<span style="color:#ED8C2B; font-size: 15px;">Major Project Milestones</span> <span style="color: #666666; font-size: 10px; font-weight: normal;">(by priority)</span>')
        .orientation('top')
        .align('left')
        .vAlign('bottom')
        .margin(0)
        .padding(0)
        .useHtml(true)
        .draw();

    // then we create the report main object - the table
    var table = anychart.ui.table();
    // we set it up and draw it to the report layer
    table
        .container(container)
        .top(tableTop)
        .height(tableHeight)
        .width(reportBounds.width)
        .contents(contents)
        .rowHeight(0, 40)
        .colWidth(0, 20)
        .colWidth(1, 129)
        .colWidth(2, 108)
        .colWidth(3, 75)
        .colWidth(4, 48)
        .cellBorder(null);
    table.cellTextFactory()
        .padding(0)
        .vAlign('center')
        .hAlign('left')
        .fontSize('11px');
    // here we use our utility methods described above to make rows and columns setting up easier
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['content', 'fontSize'], '11px');
    setupRowProp(table, 0, ['content', 'fontFamily'], 'verdana, helvetica, arial, sans-serif');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 0, 'padding', [2, 0], true);
    setupColProp(table, 3, 'padding', [6, 2, 5], true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    table.getCell(table.rowsCount() - 1, 3).padding(0, 2, 5, 1);
    table.getCell(0, 3).content().hAlign('center');
    table.getCell(0, 4).content().hAlign('right');
    // and finally we can draw the table
    table.draw();

    // but there is one more thing we want to draw on this report - a thin vertical line over all bullet charts,
    // showing the zero mark
    // to do that we should determine exact X position of the 0 mark, using the common bullet scale and axis position
    // so we get the upper cell we want to draw the line at to determine both X and top Y coordinates
    var cell = table.getCell(1, 3);
    // determine its bounds
    var bounds = cell.getBounds();
    // take cell padding into consideration
    var padding = cell.padding();
    bounds.left += padding.left();
    bounds.width -= padding.left() + padding.right();
    // transform the value "100" using the scale of the axis
    // the scale.transform() method returns a ratio of the value passed between minimum and maximum of the scale
    // this ration is usually between 0 and 1, if the passed value is between minimum and maximum of the scale
    // so to get pixel coords we need to use proportions:
    var x = bulletScale.transform(0) * bounds.width + bounds.left;
    // lets make an offset of two pixels from the top of the cell
    var top = bounds.top + 2;
    // to determine the bottom line position let's use a handy axis method getRemainingBounds, using which we can
    // get axis line Y coordinate in this situation and axis major tick lengths to make the line we want to draw
    // look good
    var bottom = axis.getRemainingBounds().getBottom() + axis.ticks().length();
    // now we have all coordinates we need to draw the line we want
    container.path()
        .stroke('#ccc')
        .fill('none')
        .moveTo(x, top)
        .lineTo(x, bottom);

    // we return an object with both report layer and desired bounds
    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  /**
   * Forms Top Projects in Queue report using passed data.
   * @param {Array.<Array>} data Raw Top Projects in Queue data.
   * @return {{report: anychart.graphics.vector.Layer, bounds: anychart.math.Rect}} Report object.
   */
  function formTPQReport(data) {
    // this tiny report contains just of a table and a title, so all we need to prepare is a contents array for the table
    // so we start from making an array with table column headings
    var contents = [[null, 'Project', 'Status', 'Funding\nApproved', 'Sched.\nStart']];

    // then we aggregate and map the data to make data iterating and retrieving easier
    var view = anychart.data.set(data).mapAs({'Project': [0], 'Status': [1], 'Approved': [2], 'Start': [3]});

    // then we get data iterator and use it to pass over the data and form the array with content
    var iterator = view.getIterator();
    for (var i = 0; iterator.advance(); i++) {
      // we use iterator.get() method to retrieve data values
      contents.push([
        ++i,
        iterator.get('Project'),
        iterator.get('Status'),
        iterator.get('Approved') ? 'X' : null,
        formatDate(new Date(iterator.get('Start')))
      ]);
    }

    // now we are ready to create content layer and declare some variables to store info about the report bounds
    var container = anychart.graphics.layer();
    var titleHeight = 20;
    var tableTop = titleHeight - 20;
    var tableHeight = (contents.length - 1) * 24 + 40;
    var reportBounds = anychart.math.rect(0, 0, 380, tableHeight + tableTop);

    // we create, setup and draw the report title
    var title = anychart.ui.title();
    title
        .container(container)
        .parentBounds(reportBounds)
        .fontFamily('trebuchet, helvetica, arial, sans-serif')
        .fontWeight('normal')
        .fontSize('15px')
        .fontColor('#ED8C2B')
        .text('Top Projects in the Queue')
        .orientation('top')
        .align('left')
        .vAlign('bottom')
        .margin(0)
        .padding(0, 0, 2, 0)
        .height(titleHeight)
        .useHtml(false)
        .draw();

    // and then we create, setup and draw the report table
    var table = anychart.ui.table();
    table
        .container(container)
        .top(tableTop)
        .height(tableHeight)
        .width(reportBounds.width)
        .contents(contents)
        .rowHeight(0, 40)
        .colWidth(0, 20)
        .colWidth(1, 150)
        .colWidth(2, 110)
        .colWidth(3, 52)
        .colWidth(4, 48)
        .cellBorder(null);
    table.cellTextFactory()
        .padding(0)
        .vAlign('center')
        .hAlign('left')
        .fontSize('11px');
    // we use our utility methods to setup common properties for the whole rows and columns
    setupRowProp(table, 0, 'bottomBorder', '2 #ccc');
    setupRowProp(table, 0, ['content', 'vAlign'], 'bottom');
    setupRowProp(table, 0, ['padding', 'bottom'], 2);
    setupColProp(table, 0, 'padding', [2, 0], true);
    setupColProp(table, 3, ['content', 'hAlign'], 'center', true);
    setupColProp(table, 4, ['content', 'hAlign'], 'right', true);
    table.getCell(0, 3).content().hAlign('center');
    table.getCell(0, 4).content().hAlign('center');
    // and then we tell the table to draw to its container
    table.draw();

    // we return an object with both report layer and desired bounds
    return {
      'report': container,
      'bounds': reportBounds
    };
  }

  // endregion

  // region Dashboard assemblage
  // to draw the dashboard we need to create a stage first, so we do it, settings stage container id and its size
  var stage = anychart.graphics.create('container', 772, 580);
  // then we suspend stage redrawing because we know that now we are going to draw a lot on this stage and do want it
  // to render all its content only in the end, when everything will be ready
  stage.suspend();

  // the height of the all dashboard titles
  // we use three titles in this dashboard, because they all are positioned differently and contain different info
  var titleHeight = 50;
  // also we want one of the titles to contain "today's" date, so we format it properly here
  var formattedToday = (new Date(Today)).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

  // the first title is a disclaimer and is positioned at the top of everything, aligning to the left, with some padding
  anychart.ui.title()
      .container(stage)
      .parentBounds(anychart.math.rect(0, 0, stage.width(), stage.height()))
      .fontFamily('trebuchet, helvetica, arial, sans-serif')
      .fontWeight('normal')
      .fontSize('10px')
      .fontColor('#666')
      .text('This sample is based on the dashboard sample in "Information Dashboard Design: Displaying Data for At-a-Glance Monitoring" by Stephen Few')
      .orientation('top')
      .align('left')
      .vAlign('bottom')
      .margin(0)
      .padding(3, 0, 0, 10)
      .useHtml(true)
      .draw();

  // the second title is a "CIO Dashboard" label, also aligned to the left.
  // but we also use vAlign and height properties combined to make that positioning you see
  anychart.ui.title()
      .container(stage)
      .parentBounds(anychart.math.rect(0, 0, stage.width(), stage.height()))
      .fontFamily('trebuchet, helvetica, arial, sans-serif')
      .fontWeight('normal')
      .fontSize('20px')
      .fontColor('#ED8C2B')
      .text('CIO Dashboard')
      .orientation('top')
      .align('left')
      .vAlign('bottom')
      .margin(0)
      .padding(0, 10, 4, 10)
      .height(titleHeight)
      .useHtml(true)
      .draw();

  // the third title is a today's date label aligned to the right.
  // it also has vAlign and height properties set in combination to make that positioning you see
  anychart.ui.title()
      .container(stage)
      .parentBounds(anychart.math.rect(0, 0, stage.width(), stage.height()))
      .fontFamily('trebuchet, helvetica, arial, sans-serif')
      .fontWeight('normal')
      .fontSize('12px')
      .fontColor('#666')
      .text('(As of ' + formattedToday + ')')
      .orientation('top')
      .align('right')
      .vAlign('bottom')
      .margin(0)
      .padding(0, 10, 4, 10)
      .height(titleHeight)
      .useHtml(true)
      .draw();

  // then we draw the thick grey line, separating the titles from the content
  stage.path()
      .moveTo(10, titleHeight)
      .lineTo(stage.width() - 10, titleHeight)
      .stroke('4 #ccc');

  // then we create to arrays to handle report objects for left and right columns of the dashboard
  var leftColumnReports = [
    formSAReport(SARawData, SAAcceptedAvailability),
    formHCReport(HCCPUData, HCStorage, HCNetwork, HCCPURanges, HCNetworkRanges, HCStorageRanges),
    formDNTReport(DNT6MonthAvgData, DNTWeekAvgData, DNTYesterdayData)
  ];
  var rightColumnReports = [
    formKNSMReport(KNSMExpensesData, KNSMSatisfactionData, KNSMProblemsData, KNSMExpensesRanges, KNSMSatisfactionRanges,
        KNSMProblemsRanges, KNSMBudgetTarget, KNSMProblemsTarget),
    formMPMReport(MPMData, Today),
    formTPQReport(TPQData)
  ];

  // and now we are ready to start to position the reports from the top with some margins
  // down to the bottom, left column first
  var top = titleHeight + 15;
  var left = 10;
  var width = 0;
  var layer, bounds, i;
  // for all left-column reports
  for (i = 0; i < leftColumnReports.length; i++) {
    layer = leftColumnReports[i]['report'];
    bounds = leftColumnReports[i]['bounds'];
    // we add the report layer to the stage
    stage.addChild(layer);
    // and translate it to spread report among the stage
    layer.translate(left, top);
    top += bounds.height + 5;
    width = Math.max(width, bounds.width);
  }

  top = titleHeight + 15;
  left += width + 15;
  width = 0;
  // for all left-column reports
  for (i = 0; i < rightColumnReports.length; i++) {
    layer = rightColumnReports[i]['report'];
    bounds = rightColumnReports[i]['bounds'];
    // we add the report layer to the stage
    stage.addChild(layer);
    // and translate it to spread report among the stage
    layer.translate(left, top);
    top += bounds.height;
    width = Math.max(width, bounds.width);
  }

  // and finally we resume stage redrawing to make it render all the staff we placed on it
  stage.resume();

  // endregion
});
