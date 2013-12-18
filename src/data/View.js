goog.provide('anychart.data.View');

goog.require('anychart.data.Iterator');
goog.require('anychart.utils.Invalidatable');



/**
 * A "view" - like a db select from a data set.
 * @param {!anychart.data.View} parentView Parent view. The last view is a mapping.
 * @constructor
 * @implements {anychart.data.IView}
 * @extends {anychart.utils.Invalidatable}
 */
anychart.data.View = function(parentView) {
  goog.base(this);

  this.initView(parentView);
};
goog.inherits(anychart.data.View, anychart.utils.Invalidatable);


/**
 * Redirection mask for a view. Each value in this array means a number of the parentView row to fetch,
 * when that index is asked from the current view.
 * @type {Array.<number>}
 * @protected
 */
anychart.data.View.prototype.mask;


/**
 * Internal function to initialize view. Mapping doesn't need this code to initialize, but needs base constructor
 * because of EventTarget initialization. So that's we it is done so dirty:(
 * @param {!anychart.data.View} parentView Parent view. The last view is a mapping.
 * @protected
 */
anychart.data.View.prototype.initView = function(parentView) {
  /**
   * Mapping applied to the views sequence.
   * @type {!anychart.data.Mapping}
   * @private
   */
  this.mapping_ = parentView.getMapping();

  /**
   * The parent view to ask for data from.
   * @type {!anychart.data.IView}
   * @protected
   */
  this.parentView = parentView;

  parentView.listen(anychart.utils.Invalidatable.INVALIDATED, this.parentViewChangedHandler, false, this);
};


/**
 * Creates prepared derivative view. Internal method. Should not be published!
 * @param {string} fieldName The name of the field to look at.
 * @param {Array=} opt_categories Categories set to use in case of ordinal scale.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.prepare = function(fieldName, opt_categories) {
  var result = opt_categories ?
      new anychart.data.OrdinalView(this, fieldName, /** @type {!Array} */(opt_categories)) :
      new anychart.data.ScatterView(this, fieldName);
  this.registerDisposable(result);
  return result;
};


/**
 * Creates a derivative view, containing only row that passed the filter.
 * @param {string} fieldName A field which value will be passed to a filter function.
 * @param {function(*):boolean} func Filter function that should accept a field value and return true if the row
 *    should be included into the resulting view and false otherwise.
 * @return {!anychart.data.View} The new derived view.
 */
anychart.data.View.prototype.filter = function(fieldName, func) {
  var result = new anychart.data.FilterView(this, fieldName, func);
  this.registerDisposable(result);
  return result;
};


/**
 * Gets or sets the full row of the set by its index. If there is no any row for the index - returns undefined.
 * If used as a setter - returns the previous value of the row (don't think it saves the previous state of objects
 * stored by reference - it doesn't).
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * NOTE: If current view doesn't contain a row with passed index it does nothing and returns undefined.
 *
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value If passed, the method is treated as a setter.
 * @return {*} The full row current or previous value. May be anything including undefined.
 */
anychart.data.View.prototype.row = function(rowIndex, opt_value) {
  rowIndex = this.mask[rowIndex];
  if (goog.isDef(rowIndex)) {
    if (arguments.length > 1)
      return this.parentView.row(rowIndex, opt_value);
    else
      return this.parentView.row(rowIndex);
  }
  return undefined;
};


/**
 * Returns the number of rows in a view.
 * @return {number} Number of rows in the set.
 */
anychart.data.View.prototype.getRowsCount = function() {
  return this.mask.length;
};


/**
 * Returns view mapping.
 * @return {!anychart.data.Mapping} Current view mapping.
 */
anychart.data.View.prototype.getMapping = function() {
  return this.mapping_;
};


/**
 * Returns new iterator for the view.
 * @return {anychart.data.Iterator} New iterator.
 */
anychart.data.View.prototype.getIterator = function() {
  return new anychart.data.Iterator(this);
};


/**
 * Builds redirection mask.
 * @return {!Array.<number>} The mask.
 * @protected
 */
anychart.data.View.prototype.buildMask = goog.abstractMethod;


/**
 * Handles changes in parent view.
 * @param {anychart.utils.InvalidatedStatesEvent} event Event object.
 * @protected
 */
anychart.data.View.prototype.parentViewChangedHandler = function(event) {
  if (!!(event.invalidatedStates & anychart.utils.ConsistencyState.DATA)) {
    var newMask = this.buildMask();
    var changed = false;
    if (newMask.length == this.mask.length) {
      for (var i = 0; i < newMask.length; i++)
        if (newMask[i] != this.mask[i]) {
          changed = true;
          break;
        }
    } else {
      changed = true;
    }
    if (changed) {
      this.mask = newMask;
      this.dispatchEvent(new anychart.utils.InvalidatedStatesEvent(this, anychart.utils.ConsistencyState.DATA));
    }
  }
};
