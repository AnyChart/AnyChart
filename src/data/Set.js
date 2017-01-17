goog.provide('anychart.data.Set');

goog.require('anychart.core.Base');
goog.require('anychart.data.IView');
goog.require('anychart.data.Mapping');
goog.require('anychart.data.csv.Parser');
//goog.require('anychart.globalLock'); should be here but commented cause of circular dependency in export.js
goog.require('goog.array');



/**
 * Linear data storage.<br/>
 * Data is stored as an array or rows where each row contains several columns (see Listing 1 below).
 * To start working with this storage you need to map columns using
 * {@link anychart.data.Set#mapAs} method (you can create as many mappings as you like).<br/>
 * Each field can be a number, a string, a function, an array or an object.
 * Data fields can of any type and they way you read them depends on mapping only:
 * {@link anychart.data.Set#mapAs}. Sample mappings are shown in code samples 3, 4 and 5.<br/>
 * <b>Note:</b> To create an instance of this class use method {@link anychart.data.set}.
 * @example <c>Sample 1. Data notion.</c><t>listingOnly</t>
 * // Col1 Col2 Col3
 *  [
 *   [110, 112, 114], // row1
 *   [210, 212, 214], // row2
 *   [310, 312, 314], // row3
 *   [410, 412, 414]  // row4
 *  ]
 * // Col1
 *  [
 *    114, // row1
 *    214, // row2
 *    314, // row3
 *    414  // row4
 *  ]
 * @example <c>Sample 2. Sample data.</c><t>listingOnly</t>
 * // An array with numbers, strings and functions:
 *  anychart.data.set([
 *    20,
 *    7,
 *    '10',
 *    function(smth){ return smth*10; }
 *    ]);
 * // An array of arrays:
 *  anychart.data.set([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 * // An array of objects.
 *  anychart.data.set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 * // A multi-typed array:
 *  anychart.data.set([
 *    {value: 10, name: 'Point 1'},
 *    {value: 7, name: 'Point 2'},
 *    [20, 'Point 3'],
 *    [14, 'Point 4'],
 *    [-14, 'Point 5', function (params) { do_smth; return smth; }],
 *    '17',
 *    22,
 *    function (params) { do_smth; return smth; }
 *  ]);
 * @example <c>Sample 3. Default data mapping. Numbers.</c><t>listingOnly</t>
 * // 'x' is an index of an element and 'value' is its value.
 *   // Raw data         Mapped as
 *   [
 *    1,                        {x: 0, value: 1}
 *    2,                        {x: 1, value: 2}
 *    '-5',                     {x: 2, value: -5}
 *    function(){ return 1;}    {x: 3, value: 1}
 *   ]
 *   // so this will not work with OHLC
 * @example <c>Sample 4. Default data mapping. Arrays.</c><t>listingOnly</t>
 * // 'x' is an element with the index of 0,
 * // 'value' is an element with the index of 1,
 * // 'size' is an element with the index of 2.
 * // All elements with the index greater than 2 are ignored.
 *   // Raw data          Mapped as
 *   [
 *      [2],                     {x: 2}
 *      [5, 13],                 {x: 5, value: 13}
 *      [7, '4', 21],            {x: 7, value: 4, size: 21}
 *      [11, 21, 34, 45]         {x: 11, value: 21, size: 34}
 *   ]
 *   // In case of OHLC
 *     // 'open' is an element with the index of 0
 *     // 'high' is an element with the index of 1
 *     // 'low' is an element with the index of 2
 *     // 'close' is an element with the index of 3
 *     //  All elements with the index greater than 3 are ignored.
 *     [
 *        [11, 21, 34, 45]         {open: 11, high: 21, low: 34, close: 45}
 *     ]
 * @example <c>Sample 5. Default data mapping. Objects.</c><t>listingOnly</t>
 * // In objects everything corresponds to the names of properties, but you can define several mappings and a priority.
 * // E.g.: 'x' can be mapped to 'x' and 'value' can be looked for
 * // in 'value', then 'y', then in 'close'.
 *   // Raw data                 Mapped as
 *   [
 *      {x: 2},                           {x: 2}
 *      {x: 5, value: 13},                {x: 5, value: 13}
 *      {x: 7, y: 4, size: 21},           {x: 7, value: 4, size: 21}
 *      {x: 11, close: 21, size: 34}      {x: 11, value: 21, size: 34}
 *   ]
 *   // In case of OHLC
 *   [
 *     {open: 11, high: 21, low: 34, close: 45}   {open: 11, high: 21, low: 34, close: 45}
 *   ]
 *     // 'open' is an element with the index of 0,
 *     // 'high' is an element with the index of 1,
 *     // 'low' is an element with the index of 2,
 *     // 'close' is an element with the index of 3.
 *     // All elements with the index greater than 3 are ignored.
 * @param {(Array|string)=} opt_data Data set raw data can be set here.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @implements {anychart.data.IView}
 * @extends {anychart.core.Base}
 */
anychart.data.Set = function(opt_data, opt_csvSettings) {
  anychart.data.Set.base(this, 'constructor');
  this.data(opt_data || null, opt_csvSettings);
};
goog.inherits(anychart.data.Set, anychart.core.Base);


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.data.Set.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED;


/**
 * Internal data set storage.
 * @type {!Array}
 */
anychart.data.Set.prototype.storage_;


/**
 * The largest array seen as a row.
 * @type {number}
 * @private
 */
anychart.data.Set.prototype.largestSeenRowLength_ = 0;


/**
 * If null - now row objects seen, if object - contains all seen field names.
 * @type {Object.<string, boolean>}
 * @private
 */
anychart.data.Set.prototype.objectFieldsSeen_ = null;


/**
 * If non-array and non-object rows were seen.
 * @type {boolean}
 * @private
 */
anychart.data.Set.prototype.simpleValuesSeen_ = false;


/**
 * Getter/setter for data.
 * @param {(Array|string)=} opt_value .
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!(anychart.data.Set|Array)} .
 */
anychart.data.Set.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    anychart.globalLock.lock();
    if (goog.isString(opt_value)) {
      try {
        var parser = new anychart.data.csv.Parser();
        if (goog.isObject(opt_csvSettings)) {
          parser.rowsSeparator(/** @type {string|undefined} */(opt_csvSettings['rowsSeparator'])); // if it is undefined, it will not be set.
          parser.columnsSeparator(/** @type {string|undefined} */(opt_csvSettings['columnsSeparator'])); // if it is undefined, it will not be set.
          parser.ignoreTrailingSpaces(/** @type {boolean|undefined} */(opt_csvSettings['ignoreTrailingSpaces'])); // if it is undefined, it will not be set.
          parser.ignoreFirstRow(/** @type {boolean|undefined} */(opt_csvSettings['ignoreFirstRow'])); // if it is undefined, it will not be set.
        }
        opt_value = parser.parse(opt_value);
      } catch (e) {
        if (e instanceof Error) {
          try {
            goog.global['console']['log'](e.message);
          } catch (ignored) {
          }
        }
        opt_value = null;
      }
    }
    if (goog.isArrayLike(opt_value)) {
      var data = [];
      for (var i = 0; i < opt_value.length; i++) {
        var row = opt_value[i];
        var dataRow;
        if (goog.isArray(row)) {
          var valuesLength = row.length;
          if (this.largestSeenRowLength_ < valuesLength) {
            // if (this.objectFieldsSeen_) {
            //   // if we have seen objects, than we have converted the largestSeenRowLength_ representation to the fields
            //   // map already and now we should add fields to that representation
            //   for (i = this.largestSeenRowLength_; i < valuesLength; i++) {
            //     this.objectFieldsSeen_[i] = true;
            //   }
            // }
            this.largestSeenRowLength_ = valuesLength;
          }
          dataRow = goog.array.slice(row, 0);
        } else if (goog.isObject(row)) { // we are sure that this is object in this case so we can avoid double checking
          if (!this.objectFieldsSeen_) {
            this.objectFieldsSeen_ = {};
            // for (i = 0; i < this.largestSeenRowLength_; i++) {
            //   this.objectFieldsSeen_[i] = true;
            // }
          }
          dataRow = {};
          for (var j in row) {
            dataRow[j] = row[j];
            this.objectFieldsSeen_[j] = true;
          }
        } else {
          this.simpleValuesSeen_ = true;
          dataRow = row;
        }
        data.push(dataRow);
      }
      this.storage_ = data;
      this.dispatchSignal(anychart.Signal.DATA_CHANGED);
    } else {
      if (this.storage_ && this.storage_.length > 0) {
        this.storage_.length = 0;
        this.dispatchSignal(anychart.Signal.DATA_CHANGED);
      } else {
        this.storage_ = [];
      }
    }
    anychart.globalLock.unlock();
    return this;
  }
  return this.storage_;
};


/**
 * Defines data mapping.<br/>
 * You can define mappings for the different types of data (see samples).
 * Default mapping is shown in {@link anychart.data.Set} constructor samples.
 * @example <c>Custom data mapping.</c><t>listingOnly</t>
 * // Simple mapping
 *  dataSet.mapAs({
 *    'value': [0],
 *    'x': [1],
 *    'fill': [2]
 *  });
 *   // Raw data          Mapped as
 *   [
 *    [11, 1, 'red 0.5'],       {x: 1, value: 11, fill: 'red 0.5'}
 *    [21, 2, 'green 0.5'],     {x: 2, value: 21, fill: 'green 0.5'}
 *    [14, 3, 'blue 0.5'],      {x: 3, value: 14, fill: 'blue 0.5'}
 *    [11, 4, 'yellow 0.5']     {x: 4, value: 11, fill: 'yellow 0.5'}
 *   ]
 * // Combined mapping
 *  dataSet.mapAs({
 *    'value': [0],
 *    'x': [1],
 *    'fill': [2]
 *   },{
 *    'value': ['close', 'customY'],
 *    'fill': ['fill', 'color']
 *   }, null, ['close']
 *  );
 *  // Raw data          Mapped as
 *   [
 *    [11, 1, 'red 0.5'],       {x: 1, value: 11, fill: 'red 0.5'}
 *    [21, 2, 'green 0.5'],     {x: 2, value: 21, fill: 'green 0.5'}
 *    {
 *      value: 14,
 *      x: 3,                   {x: 3, value: 14, fill: 'blue 0.5'}
 *      fill: 'blue 0.5'
 *    },{
 *      customY: '71',
 *      x: 3,                   {x: 3, value: 71, fill: 'blue 0.5', size 14}
 *      color: 'blue 0.5',
 *      size: 14
 *    },
 *    11,                       {close: 4, value: 11}
 *    function(){ return 99;}   {close: 5, value: 99}
 *   ]
 * @example
 * var dataSet = anychart.data.set([
 *      [11, 18, 1, 'red 0.5', 'orange'],
 *      [21, 15, 2, 'green 0.5', 'blue'],
 *      [14, 16, 3, 'white', 'black'],
 *      {value: 17, x: 4, fill: 'yellow'}
 * ]);
 * var chart = anychart.bar();
 * chart.column(
 *      dataSet.mapAs({'value': [0], 'x': [2], 'fill': [3]})
 * );
 * chart.column(
 *      dataSet.mapAs({'value': [1], 'x': [2], 'fill': [4]})
 * );
 * chart.yScale().minimum(0);
 * chart.container(stage).draw();
 * @param {!(Object.<Array.<number>>)=} opt_arrayMapping [{
 *   'x': &#91;0&#93;,
 *   'value': &#91;1, 0&#93;,
 *   'size': &#91;2&#93;,
 *   'open': &#91;1&#93;,
 *   'high': &#91;2&#93;,
 *   'low': &#91;3, 1&#93;,
 *   'close': &#91;4&#93;
 * }] Column mapping for the rows which are arrays.
 * @param {!(Object.<Array.<string>>)=} opt_objectMapping [{'value': &#91;'value', 'y', 'close'&#93;}] Column mapping for the rows
 *  which are objects.
 * @param {!(Array.<string>)=} opt_defaultProps [&#91;'value', 'close'&#93;] The names of the fields to map to
 *  if a row is a string, number or a function. Does not work in cases when a row is an object.
 * @param {!(Array.<string>)=} opt_indexProps [&#91;'x'&#93;] The names of the fields to be mapped to the current index
 *  if other options failed.
 * @return {!anychart.data.Mapping} The instance of {@link anychart.data.Mapping} class for method chaining.
 */
anychart.data.Set.prototype.mapAs = function(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  var res = new anychart.data.Mapping(this, opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps);
  this.registerDisposable(res);
  return res;
};


/**
 * Getter/setter for row.
 * @param {number} rowIndex The index of the row to fetch.
 * @param {*=} opt_value If set, the method is treated as a setter.
 * @return {*} Current or previous value of the row. Can be anything, including undefined.
 */
anychart.data.Set.prototype.row = function(rowIndex, opt_value) {
  /** @type {*} */
  var value = this.storage_[rowIndex];
  if (arguments.length > 1) {
    anychart.globalLock.lock();
    this.storage_[rowIndex] = opt_value;
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
    anychart.globalLock.unlock();
  }
  return value;
};


/**
 * Appends new rows to the set. Each argument is a row that will be appended to the Set.
 * @example
 * var chart = anychart.column();
 * var data = anychart.data.set([
 *     ['A1', 8],
 *     ['A2', 11],
 *     ['A3', 12],
 *     ['A4', 9]
 * ]);
 * chart.column(data);
 * chart.container(stage).draw();
 * // You can use differnet data formats.
 * data.append(
 *   {x: 'B1', value: 14},
 *   ['B2', 16]
 * );
 * @param {...*} var_args Rows to append.
 * @return {!anychart.data.Set} {@link anychart.data.Set} instance for method chaining.
 */
anychart.data.Set.prototype.append = function(var_args) {
  anychart.globalLock.lock();
  this.storage_.push.apply(this.storage_, arguments);
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  anychart.globalLock.unlock();
  return this;
};


/**
 * Inserts the row to the set at the specified position.
 * @example
 * var data = anychart.data.set([
 *     ['A1', 8],
 *     ['A2', 11],
 *     ['A3', 12],
 *     ['A4', 9]
 * ]);
 * chart = anychart.column(data);
 * chart.container(stage).draw();
 * data.insert({x: 'B1', value: 14, fill: 'grey'}, 2);
 * @param {*} row Row to insert.
 * @param {number=} opt_index [0] The index at which to insert the object. A negative index is counted from the end of an array.
 * @return {!anychart.data.Set} {@link anychart.data.Set} instance for method chaining.
 */
anychart.data.Set.prototype.insert = function(row, opt_index) {
  anychart.globalLock.lock();
  goog.array.insertAt(this.storage_, row, opt_index);
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  anychart.globalLock.unlock();
  return this;
};


/**
 * Removes the row by index.
 * @example
 * var chart = anychart.columnChart();
 * var data = anychart.data.set([
 *     ['A1', 8],
 *     ['A2', 11],
 *     ['A3', 12],
 *     ['A4', 9]
 * ]);
 * chart.column(data);
 * chart.container(stage).draw();
 * data.remove(2); // remove 'A3' point.
 * @param {number} index Index of the row to remove.
 * @return {!anychart.data.Set} {@link anychart.data.Set} instance for method chaining.
 */
anychart.data.Set.prototype.remove = function(index) {
  anychart.globalLock.lock();
  goog.array.removeAt(this.storage_, index);
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  anychart.globalLock.unlock();
  return this;
};


/**
 * Returns the number of the rows in the current data set.
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * chart.title().text("rows count: " + data.getRowsCount());
 * chart.line(data)
 * @return {number} The number of the rows in the set.
 */
anychart.data.Set.prototype.getRowsCount = function() {
  return this.storage_.length;
};


/**
 * Returns the mapping for the row. This method is not implemented for the Set. Use mapAs() instead.
 * @param {number} rowIndex The index of the row.
 */
anychart.data.Set.prototype.getRowMapping = function(rowIndex) {
  throw new Error('Wrong usage of the data Set');
};


/**
 * Returns all mappings that are related to the view.
 * @return {Array.<anychart.data.Mapping>}
 */
anychart.data.Set.prototype.getMappings = function() {
  throw new Error('Wrong usage of the data Set');
};


/**
 * Checks if there exists at least one row in the view, that returns defined value for that name.
 * @param {string|number} nameOrColumn
 * @return {boolean}
 */
anychart.data.Set.prototype.checkFieldExist = function(nameOrColumn) {
  if (goog.isNumber(nameOrColumn))
    return this.largestSeenRowLength_ > nameOrColumn;
  return !!(this.objectFieldsSeen_ && this.objectFieldsSeen_[nameOrColumn]);
};


/**
 * Checks whether the view has non-object and non-array rows.
 * @return {boolean}
 */
anychart.data.Set.prototype.hasSimpleRows = function() {
  return this.simpleValuesSeen_;
};


/**
 * Getter/setter for meta.
 * @param {number} rowIndex .
 * @param {string} name .
 * @param {*=} opt_value .
 * @return {anychart.data.View|*|undefined} .
 */
anychart.data.Set.prototype.meta = function(rowIndex, name, opt_value) {
  throw new Error('Wrong usage of the data Set');
};


/**
 * Returns self.
 * @return {Array.<anychart.data.Set>}
 */
anychart.data.Set.prototype.getDataSets = function() {
  return [this];
};


/**
 * Return instance of class {@link anychart.data.Set}.
 * @example <t>lineChart</t>
 * var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * chart.line(data);
 * @param {(Array|string)=} opt_data Data set raw data can be set here.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.data.Set} The instance of {@link anychart.data.Set} class for method chaining.
 */
anychart.data.set = function(opt_data, opt_csvSettings) {
  return new anychart.data.Set(opt_data, opt_csvSettings);
};


//exports
(function() {
  var proto = anychart.data.Set.prototype;
  goog.exportSymbol('anychart.data.set', anychart.data.set);//doc|ex
  proto['data'] = proto.data;//doc|ex
  proto['mapAs'] = proto.mapAs;//doc|ex
  proto['row'] = proto.row;//doc|ex
  proto['append'] = proto.append;//doc|ex
  proto['insert'] = proto.insert;//doc|ex
  proto['remove'] = proto.remove;//doc|ex
  proto['getRowsCount'] = proto.getRowsCount;//doc|ex
})();
