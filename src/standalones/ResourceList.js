goog.provide('anychart.standalones.ResourceList');
goog.require('anychart.core.resource.ResourceList');
goog.require('anychart.data');
goog.require('anychart.utils');



/**
 * @constructor
 * @extends {anychart.core.resource.ResourceList}
 */
anychart.standalones.ResourceList = function() {
  anychart.standalones.ResourceList.base(this, 'constructor');

  this.data(null);
};
goog.inherits(anychart.standalones.ResourceList, anychart.core.resource.ResourceList);
anychart.core.makeStandalone(anychart.standalones.ResourceList, anychart.core.resource.ResourceList);


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.standalones.ResourceList.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map['rowHeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'rowHeight',
      anychart.core.settings.numberOrPercentNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['minRowHeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'minRowHeight',
      anychart.core.settings.numberOrPercentNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['maxRowHeight'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxRowHeight',
      anychart.core.settings.numberOrPercentNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.standalones.ResourceList, anychart.standalones.ResourceList.PROPERTY_DESCRIPTORS);
//endregion


/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.standalones.ResourceList.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.standalones.ResourceList.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.standalones.ResourceList.prototype.data_;


/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.standalones.ResourceList|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.standalones.ResourceList.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      // DATA is supported only in Bubble, so we invalidate only for it.
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.standalones.ResourceList.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DATA, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getIterator = function() {
  return this.data_ ? this.data_.getIterator() : null;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getItemHeight = function(item, listHeight) {
  var result = this.getOption('rowHeight');
  result = anychart.utils.normalizeSize(/** @type {number} */(result), listHeight);
  return result;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getMinItemHeight = function(item, listHeight) {
  var result = this.getOption('minRowHeight');
  result = anychart.utils.normalizeSize(/** @type {number} */(result), listHeight);
  return result;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getMaxItemHeight = function(item, listHeight) {
  var result = this.getOption('maxRowHeight');
  result = anychart.utils.normalizeSize(/** @type {number} */(result), listHeight);
  return result;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.serialize = function() {
  var json = anychart.standalones.ResourceList.base(this, 'serialize');
  json['data'] = this.data_ ? this.data_.serialize() : null;
  return json;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.setupByJSON = function(config, opt_default) {
  anychart.standalones.ResourceList.base(this, 'setupByJSON', config, opt_default);
  this.data(opt_default ? config['data'] : null);
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.disposeInternal = function() {
  goog.dispose(this.parentViewToDispose_);
  this.parentViewToDispose_ = null;
  delete this.data_;
  this.rawData_ = null;
  anychart.standalones.ResourceList.base(this, 'disposeInternal');
};


/**
 * Constructor function.
 * @param {Array.<Object>=} opt_data Data items.
 * @return {!anychart.standalones.ResourceList}
 */
anychart.standalones.resourceList = function(opt_data) {
  var list = new anychart.standalones.ResourceList();
  list.setupByJSON(/** @type {!Object} */(anychart.getFullTheme('standalones.resourceList')), true);
  list['data'](opt_data);
  return list;
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.ResourceList.prototype;
  goog.exportSymbol('anychart.standalones.resourceList', anychart.standalones.resourceList);
  proto['data'] = proto.data;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['verticalScrollBarPosition'] = proto.verticalScrollBarPosition;
})();
