goog.provide('anychart.ui.chartEditor.DataMappings');

goog.require('anychart.ui.button.Base');
goog.require('anychart.ui.chartEditor.DataMapping');
goog.require('goog.ui.Component');



/**
 * @param {anychart.ui.chartEditor.steps.Base.DataSet} dataSet
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.chartEditor.DataMappings = function(dataSet) {
  anychart.ui.chartEditor.DataMappings.base(this, 'constructor');

  /**
   * The DOM element for the children.
   * @private {Element}
   */
  this.content_ = null;

  /**
   * Data set from data step.
   * @type {anychart.ui.chartEditor.steps.Base.DataSet}
   * @private
   */
  this.dataSet_ = dataSet;

  /**
   * Values array for mapping.
   * @type {Array.<string|number>}
   * @private
   */
  this.mappingFieldValues_ = [];

  var rawData = /** @type {Array} */(this.dataSet_.instance.data());

  // Get mapping fields from data
  if (goog.isArrayLike(rawData[0])) {
    var maxIndex = goog.array.reduce(rawData, function(r, v) {
      return goog.isArrayLike(v) ? Math.max(r, v.length) : r;
    }, 0);

    this.mappingFieldValues_ = goog.array.range(maxIndex);

  } else {
    // isObject
    goog.array.reduce(rawData, function(r, v) {
      for (var key in v) {
        if (!v.hasOwnProperty(key)) continue;
        goog.array.insert(r, key);
      }
      return r;
    }, this.mappingFieldValues_);
  }
};
goog.inherits(anychart.ui.chartEditor.DataMappings, goog.ui.Component);


/** @type {string} */
anychart.ui.chartEditor.DataMappings.CSS_CLASS = goog.getCssName('anychart-chart-editor-data-mappings');


/**
 * @enum {string}
 */
anychart.ui.chartEditor.DataMappings.EventType = {
  /** Dispatched on the data mappings changed. */
  CHANGE_MAPPINGS: 'changeMappings'
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappings.prototype.getContentElement = function() {
  return this.content_;
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappings.prototype.createDom = function() {
  anychart.ui.chartEditor.DataMappings.base(this, 'createDom');

  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();

  var className = anychart.ui.chartEditor.DataMappings.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  this.titleEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'title'),
      'Data Mappings');
  element.appendChild(this.titleEl_);

  this.addDataMappingBtn_ = new anychart.ui.button.Base('Add mapping');
  this.addDataMappingBtn_.addClassName(goog.getCssName('anychart-chart-editor-add-data-mapping'));
  this.addDataMappingBtn_.setTooltip('Add a new data mapping');
  this.addDataMappingBtn_.render(this.titleEl_);

  this.content_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'content'));
  element.appendChild(this.content_);

  this.updateMappings_();
};


/**
 * Render mappings controls.
 * @private
 */
anychart.ui.chartEditor.DataMappings.prototype.renderMappings_ = function() {
  var rawMappings = this.dataSet_.rawMappings;
  for (var i = 0; i < rawMappings.length; i++) {
    this.addChild(new anychart.ui.chartEditor.DataMapping(rawMappings[i], this.mappingFieldValues_), true);
  }
};


/**
 * Update mappings controls.
 * todo: rename to `update`
 * @private
 */
anychart.ui.chartEditor.DataMappings.prototype.updateMappings_ = function() {
  this.removeChildren(true);

  if (!this.dataSet_.rawMappings.length) {
    this.addMapping_();
  }

  this.renderMappings_();
};


/**
 * Add mapping to raw mappings.
 * @private
 */
anychart.ui.chartEditor.DataMappings.prototype.addMapping_ = function() {
  this.dataSet_.rawMappings.push([]);
};


/**
 * Remove mapping from raw mappings.
 * @param {anychart.ui.chartEditor.steps.Base.RawMapping} rawMapping
 * @private
 */
anychart.ui.chartEditor.DataMappings.prototype.removeMapping_ = function(rawMapping) {
  goog.array.remove(this.dataSet_.rawMappings, rawMapping);
};


/**
 * Click handler for appMapping button.
 * @param {!goog.events.Event} e
 * @private
 */
anychart.ui.chartEditor.DataMappings.prototype.addMappingBtnClickHandler_ = function(e) {
  this.addMapping_();
  this.updateMappings_();

  this.content_.scrollTop = this.content_.scrollHeight;
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappings.prototype.enterDocument = function() {
  anychart.ui.chartEditor.DataMappings.base(this, 'enterDocument');

  this.getHandler().listen(this.content_, goog.events.EventType.WHEEL, this.handleWheel_);
  this.getHandler().listen(this.addDataMappingBtn_, goog.ui.Component.EventType.ACTION, this.addMappingBtnClickHandler_);
};


/**
 * Wheel event, which is stopped.
 * @param {goog.events.BrowserEvent} e
 * @private
 */
anychart.ui.chartEditor.DataMappings.prototype.handleWheel_ = function(e) {
  var element = e.currentTarget;
  var originalEvent = e.getBrowserEvent();
  var delta = originalEvent.deltaY || originalEvent.detail || originalEvent.wheelDelta;

  if (delta < 0 && !element.scrollTop) {
    e.preventDefault();
  }

  if (delta > 0 && element.scrollHeight - element.clientHeight - element.scrollTop <= 1) {
    e.preventDefault();
  }
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappings.prototype.exitDocument = function() {
  anychart.ui.chartEditor.DataMappings.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.ui.chartEditor.DataMappings.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.DataMappings.base(this, 'disposeInternal');
};
