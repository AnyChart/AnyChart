goog.provide('anychart.core.reporting');
goog.require('anychart.enums');


//----------------------------------------------------------------------------------------------------------------------
//  Errors and Warnings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Last info code.
 * @type {number}
 * @private
 */
anychart.core.reporting.lastInfoCode_ = -1;


/**
 * Log en error by code.
 * @param {anychart.enums.ErrorCode} code Error internal code,. @see anychart.enums.ErrorCode.
 * @param {*=} opt_exception Exception.
 * @param {Array.<*>=} opt_descArgs Description message arguments.
 */
anychart.core.reporting.error = function(code, opt_exception, opt_descArgs) {
  anychart.core.reporting.callLog_(
      'error',
      ('Error: ' + code + '\nDescription: ' + anychart.core.reporting.getErrorDescription_(code, opt_descArgs)),
      (opt_exception || '')
  );
};


/**
 * @param {anychart.enums.ErrorCode} code Warning code.
 * @param {Array.<*>=} opt_arguments Message arguments.
 * @return {string}
 * @private
 */
anychart.core.reporting.getErrorDescription_ = function(code, opt_arguments) {
  switch (code) {
    case anychart.enums.ErrorCode.CONTAINER_NOT_SET:
      return 'Container is not set or can not be properly recognized. Use container() method to set it.';

    case anychart.enums.ErrorCode.SCALE_NOT_SET:
      return 'Scale is not set. Use scale() method to set it.';

    case anychart.enums.ErrorCode.WRONG_TABLE_CONTENTS:
      return 'Table.contents() accepts only an Array of Arrays as it\'s first argument.';

    case anychart.enums.ErrorCode.NO_FEATURE_IN_MODULE:
      return 'Feature "' + opt_arguments[0] + '" is not supported in this module. See modules list for details.';

    case anychart.enums.ErrorCode.INCORRECT_SCALE_TYPE:
      return opt_arguments[0] + ' should be only ' + opt_arguments[1] + ' type' + (opt_arguments[2] ? ' (' + opt_arguments[2] + ').' : '.');

    case anychart.enums.ErrorCode.EMPTY_CONFIG:
      return 'Empty config passed to anychart.fromJson() or anychart.fromXml() method.';

    case anychart.enums.ErrorCode.NO_LEGEND_IN_CHART:
      return 'Bullet and Sparkline charts do not support Legend. Please use anychart.ui.Legend component for a group of charts instead.';

    case anychart.enums.ErrorCode.NO_LEGEND_IN_STOCK:
      return 'Stock chart itself doesn\'t support legend - stock plots do. So use stock.plot().legend() instead.';

    case anychart.enums.ErrorCode.NO_CREDITS_IN_CHART:
      return 'Bullet and Sparkline charts do not support Credits.';

    case anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT:
      return 'Invalid GeoJSON object:';

    case anychart.enums.ErrorCode.CSV_DOUBLE_QUOTE_IN_SEPARATOR:
      return 'Double quotes in separator are not allowed.';

    case anychart.enums.ErrorCode.CSV_PARSING_FAILED:
      return 'CSV parsing failed.';

    case anychart.enums.ErrorCode.TABLE_MAPPING_DIFFERENT_TABLE:
      return 'Cannot create a computer on the table with the mapping of another table.';

    case anychart.enums.ErrorCode.TABLE_FIELD_NAME_DUPLICATE:
      return 'Cannot create computed field "' + opt_arguments[0] + '" - field name should be unique for the table';

    case anychart.enums.ErrorCode.TABLE_COMPUTER_OUTPUT_FIELD_DUPLICATE:
      return 'Cannot create output field "' + opt_arguments[0] + '" on the computer - field with this name already exists';

    case anychart.enums.ErrorCode.WRONG_SHAPES_CONFIG:
      var req = opt_arguments[2];
      var shapes = [];
      for (var i in req)
        shapes.push(i + ' (' + req[i] + ')');
      return ['Series "', opt_arguments[0], '" of type "', opt_arguments[1],
        '" cannot be drawn, because it requires ', req.length,
        ' shapes with the following names: ', shapes.join(', ')].join('');

    default:
      return 'Unknown error occurred. Please, contact support team at http://support.anychart.com/.\n' +
          'We will be very grateful for your report.';
  }
};


/**
 * Logs an info.
 * @param {anychart.enums.InfoCode|string} codeOrMsg Info internal code,. @see anychart.enums.InfoCode.
 * @param {Array.<*>=} opt_descArgs Description message arguments.
 */
anychart.core.reporting.info = function(codeOrMsg, opt_descArgs) {
  if (anychart.DEVELOP) {
    if (goog.isNumber(codeOrMsg)) {
      if (anychart.core.reporting.lastInfoCode_ != codeOrMsg) {
        anychart.core.reporting.lastInfoCode_ = /** @type {number} */ (codeOrMsg);
        anychart.core.reporting.callLog_(
            'info',
            ('Info: ' + codeOrMsg + '\nDescription: ' + anychart.core.reporting.getInfoDescription_(codeOrMsg, opt_descArgs)),
            ''
        );
      }
    } else {
      anychart.core.reporting.callLog_('info', codeOrMsg, '');
    }
  }
};


/**
 * @param {anychart.enums.InfoCode} code Warning code.
 * @param {Array.<*>=} opt_arguments Message arguments.
 * @return {string}
 * @private
 */
anychart.core.reporting.getInfoDescription_ = function(code, opt_arguments) {
  switch (code) {
    case anychart.enums.InfoCode.BULLET_TOO_MUCH_RANGES:
      return 'It is not recommended to use more than 5 ranges in Bullet Chart. Currently there are \'' + opt_arguments[0] + '\' ranges.\nExpert opinion at http://cdn.anychart.com/warning/1.html';

    case anychart.enums.InfoCode.BULLET_TOO_MUCH_MEASURES:
      return 'It is not recommended to use more than 2 markers in Bullet Chart. Currently there are \'' + opt_arguments[0] + '\' markers.\nExpert opinion at http://cdn.anychart.com/warning/2.html';

    case anychart.enums.InfoCode.PIE_TOO_MUCH_POINTS:
      return 'It is not recommended to use more then 5 - 7 points in Pie Chart. Currently there are \'' + opt_arguments[0] + '\' points.\nExpert opinion at http://cdn.anychart.com/warning/3.html';

    default:
      return 'We think we can help you improve your data visualization, please contact us at http://support.anychart.com/.';
  }
};


/**
 * Log en warning by code.
 * @param {anychart.enums.WarningCode} code Warning internal code,. @see anychart.enums.WarningCode.
 * @param {*=} opt_exception Exception.
 * @param {Array.<*>=} opt_descArgs Description message arguments.
 * @param {boolean=} opt_forceProd
 */
anychart.core.reporting.warning = function(code, opt_exception, opt_descArgs, opt_forceProd) {
  if (anychart.DEVELOP || opt_forceProd) {
    anychart.core.reporting.callLog_(
        'warn',
        ('Warning: ' + code + '\nDescription: ' + anychart.core.reporting.getWarningDescription_(code, opt_descArgs)),
        (opt_exception || '')
    );
  }
};


/**
 * @param {anychart.enums.WarningCode} code Warning code.
 * @param {Array.<*>=} opt_arguments Message arguments.
 * @return {string}
 * @private
 */
anychart.core.reporting.getWarningDescription_ = function(code, opt_arguments) {
  switch (code) {
    case anychart.enums.WarningCode.DUPLICATED_DATA_ITEM:
      return 'Data item with ID=\'' + opt_arguments[0] + '\' already exists in the tree and will be used as the parent for all related data items.';

    case anychart.enums.WarningCode.REFERENCE_IS_NOT_UNIQUE:
      return 'Data item with ID=\'' + opt_arguments[0] + '\' is not unique. First met object will be used.';

    case anychart.enums.WarningCode.MISSING_PARENT_ID:
      return 'One of the data items was looking for the parent with ID=\'' + opt_arguments[0] + '\', but did not find it. Please check the data.' +
          '\nPLEASE NOTE: this data item will be added as the root to avoid loss of information.';

    case anychart.enums.WarningCode.CYCLE_REFERENCE:
      return 'Data item {ID=\'' + opt_arguments[0] + '\', PARENT=\'' + opt_arguments[1] + '\'} belongs to a cycle and will not be added to the tree.';

    case anychart.enums.WarningCode.NOT_MAPPED_FIELD:
      return 'Can not set value for the \'' + opt_arguments[0] + '\' field to an array row if it is not mapped.';

    case anychart.enums.WarningCode.COMPLEX_VALUE_TO_DEFAULT_FIELD:
      return 'Setting complex value to the default \'' + opt_arguments[0] + '\' field changes row behaviour.';

    case anychart.enums.WarningCode.NOT_OBJECT_OR_ARRAY:
      return 'Can not set value for the \'' + opt_arguments[0] + '\' field to a row that is not an object or an array.';

    case anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION:
      return 'We can not serialize \'' + opt_arguments[0] + '\' function, please reset it manually.';

    case anychart.enums.WarningCode.DG_INCORRECT_METHOD_USAGE:
      return 'Data grid incorrect method \'' + opt_arguments[0] + '()\' usage: You use not standalone data grid. Perform all operations ' +
          'on data grid using the controller, but not directly. In current case, use \'' + opt_arguments[1] + '()\' instead. ' +
          opt_arguments[2];

    case anychart.enums.WarningCode.NOT_FOUND:
      //TODO (A.Kudryavtsev): Make another suggestion what to do.
      return opt_arguments[0] + ' with id=\'' + opt_arguments[1] + '\' is not found in data tree. Please check what you are looking for.';

    case anychart.enums.WarningCode.GANTT_FIT_TO_TASK:
      return 'Can not fit gantt chart timeline to task with id \'' + opt_arguments[0] + '\' because both fields \'' +
          anychart.enums.GanttDataFields.ACTUAL_START + '\' and \'' + anychart.enums.GanttDataFields.ACTUAL_END +
          '\' must be correctly specified in data item.';

    case anychart.enums.WarningCode.SERIES_DOESNT_SUPPORT_ERROR:
      return 'Series type "' + opt_arguments[0] + '" does not support error settings - ' +
          'only Area, Bar, Column, Line, Marker, Spline, SplineArea, StepLine and StepLineArea do.';

    case anychart.enums.WarningCode.TOOLBAR_CONTAINER:
      return 'Toolbar container is not specified. Please set a container using toolbar.container() method.';

    case anychart.enums.WarningCode.TOOLBAR_METHOD_IS_NOT_DEFINED:
      return 'Target chart has not method ' + opt_arguments[0] + '(). PLease make sure that you use correct instance of chart.';

    case anychart.enums.WarningCode.TOOLBAR_CHART_IS_NOT_SET:
      return 'No chart is assigned for toolbar. Please set a target chart using toolbar.target() method.';

    case anychart.enums.WarningCode.DEPRECATED:
      return (opt_arguments[3] || 'Method') + ' ' + opt_arguments[0] + ' is deprecated. Use ' + opt_arguments[1] + ' instead' +
          (opt_arguments[2] ? (opt_arguments[2] + '.') : '.');

    case anychart.enums.WarningCode.MISSING_PROJ4:
      return 'The projection that used cannot work correctly without Proj4. Please include Proj4 binary (https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15/proj4.js) into your page, or use another projection';

    case anychart.enums.WarningCode.DATA_ITEM_SET_PATH:
      return 'Incorrect arguments passed to treeDataItem.set() method. You try to set a value by path in complex structure, ' +
          'but path contains errors (It can be not string and not numeric values, or invalid path in existing structure, ' +
          'or incorrect number of path\'s elements etc). Please, see the documentation for treeDataItem.set() method and ' +
          'carefully check your data.';

    case anychart.enums.WarningCode.TABLE_ALREADY_IN_TRANSACTION:
      return 'Table is already in transaction mode. Calling startTransaction() multiple times does nothing.';

    case anychart.enums.WarningCode.STOCK_WRONG_MAPPING:
      return 'Wrong mapping passed to ' + opt_arguments[0] + ' series - required "' + opt_arguments[1] + "' field is missing.";

    case anychart.enums.WarningCode.SCALE_TYPE_NOT_SUPPORTED:
      return 'Scale type "' + opt_arguments[0] + '" is not supported - only ' + opt_arguments[1] + ' is.';

    case anychart.enums.WarningCode.PARSE_DATETIME:
      return 'Could not parse date time value "' + opt_arguments[0] + '".' + (!!opt_arguments[1] ?
              ('Symbols parsed: ' + opt_arguments[1]) : '');

    case anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE:
      return 'Scale is immutable for this type of axis marker and scale will not be set.';

    case anychart.enums.WarningCode.IMMUTABLE_MARKER_LAYOUT:
      return 'Layout is immutable for this type of axis marker and layout will not be set.';

    case anychart.enums.WarningCode.TREEMAP_MANY_ROOTS:
      return 'There should be only one root in tree map data. First node has been taken as root.';

    case anychart.enums.WarningCode.FEATURE_ID_NOT_FOUND:
      return 'Feature with id "' + opt_arguments[0] + '" not found';

    case anychart.enums.WarningCode.TOO_MANY_TICKS:
      var interval = /** @type {number} */(opt_arguments[1]);
      var count = /** @type {number} */(opt_arguments[0]) / interval;
      return 'Current scale ticks settings resulted in too many ticks: trying to generate about ' + count + ' ticks with interval ' + interval;

    default:
      return 'Unknown error. Please, contact support team at http://support.anychart.com/.\n' +
          'We will be very grateful for your report!';
  }
};


/**
 * @param {string} name Log function name.
 * @param {string} message Message text.
 * @param {*=} opt_exception Exception.
 * @private
 */
anychart.core.reporting.callLog_ = function(name, message, opt_exception) {
  var console = goog.global['console'];
  if (console) {
    var log = console[name] || console['log'];
    if (typeof log != 'object') {
      log.call(console, message, opt_exception);
    }
  }
};
