goog.provide('anychart.stockModule.data.TableComputer');
goog.provide('anychart.stockModule.data.TableComputer.RowProxy');

goog.require('anychart.core.reporting');
goog.require('anychart.stockModule.data.TableSelectable.RowProxy');
goog.require('goog.Disposable');



/**
 *
 * @param {!anychart.stockModule.data.TableMapping} mapping
 * @param {number} index
 * @constructor
 * @template CONTEXT
 * @extends {goog.Disposable}
 */
anychart.stockModule.data.TableComputer = function(mapping, index) {
  anychart.stockModule.data.TableComputer.base(this, 'constructor');

  /**
   * Table mapping reference.
   * @type {!anychart.stockModule.data.TableMapping}
   * @private
   */
  this.mapping_ = mapping;

  /**
   * Computer index in the table array.
   * @type {number}
   * @private
   */
  this.index_ = index;

  /**
   * Output fields mapping.
   * @type {!Object.<string, number>}
   * @private
   */
  this.outputFields_ = {};

  /**
   * Calculation functions context.
   * @type {*}
   * @private
   */
  this.context_ = anychart.window;

  /**
   * Function that is called at the start of the calculation process.
   * @type {!Function}
   * @private
   */
  this.startFunc_ = goog.nullFunction;

  /**
   * Function that is called for each row of the table storage.
   * @type {!Function}
   * @private
   */
  this.calculateFunc_ = goog.nullFunction;
};
goog.inherits(anychart.stockModule.data.TableComputer, goog.Disposable);


/**
 * Returns computer index. Internal method.
 * @return {number}
 */
anychart.stockModule.data.TableComputer.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets computer index. Internal method.
 * @param {number} index Index.
 */
anychart.stockModule.data.TableComputer.prototype.setIndex = function(index) {
  this.index_ = index;
};


/**
 * Returns table.
 * @return {!anychart.stockModule.data.Table}
 */
anychart.stockModule.data.TableComputer.prototype.getTable = function() {
  return this.mapping_.getTable();
};


/**
 * Returns computer input mapping.
 * @return {!anychart.stockModule.data.TableMapping}
 */
anychart.stockModule.data.TableComputer.prototype.getInputMapping = function() {
  return this.mapping_;
};


/**
 * Returns an array of output column indexes.
 * @return {Array.<number>}
 */
anychart.stockModule.data.TableComputer.prototype.getOutputFields = function() {
  var res = [];
  for (var i in this.outputFields_)
    res.push(this.outputFields_[i]);
  return res;
};


/**
 * Adds output field to the computer with the given name. The field will be available in the computing functions
 * by this name. Returns an index that can be used to map this field in the table. You can also pass a uid for this
 * field - in this case the field will be available for mapping by this name also.
 * @param {string} name
 * @param {string=} opt_uid
 * @return {number}
 */
anychart.stockModule.data.TableComputer.prototype.addOutputField = function(name, opt_uid) {
  if (name in this.outputFields_) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.TABLE_COMPUTER_OUTPUT_FIELD_DUPLICATE, undefined, [name]);
    return NaN;
  }
  var index = this.getTable().registerComputedField(this, opt_uid);
  if (isNaN(index))
    return NaN;
  this.outputFields_[name] = index;
  return index;
};


/**
 * Returns field index by the field name.
 * @param {string} name
 * @return {number}
 */
anychart.stockModule.data.TableComputer.prototype.getFieldIndex = function(name) {
  return name in this.outputFields_ ? this.outputFields_[name] : NaN;
};


/**
 * Sets computer context. If not set - defaults to Window.
 * @param {CONTEXT} value
 */
anychart.stockModule.data.TableComputer.prototype.setContext = function(value) {
  this.context_ = value;
};


/**
 * Sets function that will be executed on each calculation start. The context set by setContext method will be passed to
 * this function both as this and as the first parameter.
 * @param {function(this:CONTEXT,CONTEXT)} value
 */
anychart.stockModule.data.TableComputer.prototype.setStartFunction = function(value) {
  this.startFunc_ = goog.isFunction(value) ? value : goog.nullFunction;
};


/**
 * Sets function that will be executed for each row of the table storage. The context set by setContext method will be
 * passed to this function both as this and as the second parameter.
 * @param {function(this:CONTEXT,anychart.stockModule.data.TableComputer.RowProxy,CONTEXT)} value
 */
anychart.stockModule.data.TableComputer.prototype.setCalculationFunction = function(value) {
  this.calculateFunc_ = goog.isFunction(value) ? value : goog.nullFunction;
};


/**
 * Invokes start function.
 */
anychart.stockModule.data.TableComputer.prototype.invokeStart = function() {
  this.startFunc_.call(this.context_, this.context_);
};


/**
 * Invokes calculation function on the passed row. It also should know if the row is from aggregated storage.
 * @param {!anychart.stockModule.data.TableRow} row
 * @param {boolean} aggregated
 * @param {number} index
 */
anychart.stockModule.data.TableComputer.prototype.invokeCalculation = function(row, aggregated, index) {
  this.calculateFunc_.call(
      this.context_,
      new anychart.stockModule.data.TableComputer.RowProxy(row, this, aggregated, index),
      this.context_);
};


/** @inheritDoc */
anychart.stockModule.data.TableComputer.prototype.disposeInternal = function() {
  this.getTable().deregisterComputer(this);
  if (goog.isObject(this.context_) && goog.isFunction(this.context_['dispose']))
    this.context_['dispose']();
  delete this.context_;
  delete this.calculateFunc_;
  delete this.startFunc_;
  delete this.mapping_;
  delete this.outputFields_;
  anychart.stockModule.data.TableComputer.base(this, 'disposeInternal');
};



/**
 * Row proxy for computational functions - allows to write to the row by the computer output mapping in addition to the
 * TableSelectable.RowProxy reading possibilities.
 * @param {!anychart.stockModule.data.TableRow} row
 * @param {!anychart.stockModule.data.TableComputer} computer
 * @param {boolean} aggregated
 * @param {number} index
 * @constructor
 * @extends {anychart.stockModule.data.TableSelectable.RowProxy}
 */
anychart.stockModule.data.TableComputer.RowProxy = function(row, computer, aggregated, index) {
  anychart.stockModule.data.TableComputer.RowProxy.base(this, 'constructor', row, computer.getInputMapping(), aggregated, index, {});

  /**
   * Computer reference.
   * @type {!anychart.stockModule.data.TableComputer}
   * @private
   */
  this.computer_ = computer;
};
goog.inherits(anychart.stockModule.data.TableComputer.RowProxy, anychart.stockModule.data.TableSelectable.RowProxy);


/**
 * Sets field value by field name.
 * @param {string} name
 * @param {*} value
 * @return {boolean} If the set action succeeded.
 */
anychart.stockModule.data.TableComputer.RowProxy.prototype.set = function(name, value) {
  return this.setColumn(this.computer_.getFieldIndex(name), value);
};


/**
 *
 * @param {number} index
 * @param {*} value
 * @return {boolean} If the set action succeeded.
 */
anychart.stockModule.data.TableComputer.RowProxy.prototype.setColumn = function(index, value) {
  var result = !isNaN(index);
  if (result)
    this.row.computedValues[~index] = value;
  return result;
};


//exports
(function() {
  var proto = anychart.stockModule.data.TableComputer.prototype;
  proto['addOutputField'] = proto.addOutputField;
  proto['getFieldIndex'] = proto.getFieldIndex;
  proto['setContext'] = proto.setContext;
  proto['setStartFunction'] = proto.setStartFunction;
  proto['setCalculationFunction'] = proto.setCalculationFunction;
  proto['dispose'] = proto.dispose;

  proto = anychart.stockModule.data.TableComputer.RowProxy.prototype;
  proto['set'] = proto.set;
  proto['setColumn'] = proto.setColumn;
})();
