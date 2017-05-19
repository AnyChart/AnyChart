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


/** @return {anychart.ui.chartEditor.steps.Base.DataSet} */
anychart.ui.chartEditor.DataMappings.prototype.getDataSet = function() {
  return this.dataSet_;
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
    var dataMapping = new anychart.ui.chartEditor.DataMapping(rawMappings[i], this.mappingFieldValues_);
    this.addChild(dataMapping, true);
    rawMappings[i]['title'] = dataMapping.getTitle();
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
    this.addMapping_(false); // todo: 'true' only for debug mode! For Part 4
  }

  this.renderMappings_();
};


/**
 * Add mapping to raw mappings.
 * @param {boolean=} opt_setDefault
 * @private
 */
anychart.ui.chartEditor.DataMappings.prototype.addMapping_ = function(opt_setDefault) {
  var values = [];
  if (opt_setDefault) {
    // x
    // console.log(this.mappingFieldValues_);
    var field1 = {key: void 0, value: void 0};
    field1['key'] = 'x';
    field1['value'] =
        goog.array.contains(this.mappingFieldValues_, 'x') ? 'x' :
            goog.array.contains(this.mappingFieldValues_, 'name') ? 'name' : 0;
    values.push(field1);

    if (this.mappingFieldValues_.length > 4) {
      // o
      var field3 = {key: void 0, value: void 0};
      field3['key'] = 'open';
      field3['value'] =
          goog.array.contains(this.mappingFieldValues_, 'open') ? 'open' : 1;
      values.push(field3);

      // h
      var field4 = {key: void 0, value: void 0};
      field4['key'] = 'high';
      field4['value'] =
          goog.array.contains(this.mappingFieldValues_, 'high') ? 'high' : 2;
      values.push(field4);

      // l
      var field5 = {key: void 0, value: void 0};
      field5['key'] = 'low';
      field5['value'] =
          goog.array.contains(this.mappingFieldValues_, 'low') ? 'low' : 3;
      values.push(field5);

      // c
      var field6 = {key: void 0, value: void 0};
      field6['key'] = 'close';
      field6['value'] =
          goog.array.contains(this.mappingFieldValues_, 'close') ? 'close' : 4;
      values.push(field6);


      // console.log(values);
    } else {
      // y
      var field2 = {key: void 0, value: void 0};
      field2['key'] = 'value';
      field2['value'] =
          goog.array.contains(this.mappingFieldValues_, 'value') ? 'value' :
              goog.array.contains(this.mappingFieldValues_, 'value1') ? 'value1' :
                  goog.array.contains(this.mappingFieldValues_, 'y') ? 'y' : 1;
      values.push(field2);
    }
  }
  this.dataSet_.rawMappings.push(values);
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
