goog.provide('anychart.ui.chartEditor.steps.Base');
goog.provide('anychart.ui.chartEditor.steps.Base.DataSet');
goog.provide('anychart.ui.chartEditor.steps.Base.Descriptor');
goog.provide('anychart.ui.chartEditor.steps.Base.Model');

goog.require('anychart.ui.button.Primary');
goog.require('anychart.ui.button.Secondary');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.ui.Component');

goog.forwardDeclare('anychart.data.Mapping');
goog.forwardDeclare('anychart.data.Set');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {goog.ui.Component}
 */
anychart.ui.chartEditor.steps.Base = function(opt_domHelper) {
  anychart.ui.chartEditor.steps.Base.base(this, 'constructor', opt_domHelper);

  /**
   * @type {anychart.ui.chartEditor.steps.Base.Model}
   * @private
   */
  this.sharedModel_ = null;

  /**
   * @type {string}
   * @private
   */
  this.name_ = 'step';

  /**
   * @type {string}
   * @private
   */
  this.title_ = 'Step';

  /**
   * @type {Element}
   * @private
   */
  this.asideEl_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.contentEl_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.progressEl_ = null;

  /**
   * Enabled transition to next step.
   * @type {boolean}
   * @private
   */
  this.enableNextStep_ = true;

};
goog.inherits(anychart.ui.chartEditor.steps.Base, goog.ui.Component);


/**
 * @typedef {{
 *  index: number,
 *  name: string,
 *  isLastStep: boolean,
 *  isVisited: boolean
 * }}
 */
anychart.ui.chartEditor.steps.Base.Descriptor;


/**
 * @typedef {{
 *  index: number,
 *  name: string,
 *  instance: anychart.data.Set,
 *  rawMappings: Array<anychart.ui.chartEditor.steps.Base.RawMapping>,
 *  mappings: Array<anychart.data.Mapping>
 * }}
 */
anychart.ui.chartEditor.steps.Base.DataSet;


/**
 * @typedef {Array<anychart.ui.chartEditor.steps.Base.RawMappingField>}
 */
anychart.ui.chartEditor.steps.Base.RawMapping;


/**
 * @typedef {Object<string, (string|number)>}
 */
anychart.ui.chartEditor.steps.Base.RawMappingField;


/**
 * @typedef {{
 *   category: string,
 *   caption: string,
 *   image: (string|undefined),
 *   ctor: string,
 *   constructor: string,
 *   isSeriesBased: boolean,
 *   list: Array.<{type: string, caption: string, image: string, seriesType: string}>
 * }}
 */
anychart.ui.chartEditor.steps.Base.Preset;


/**
 * @typedef {?{
 *  window: Window,
 *  anychart: Object,
 *
 *  currentStep: ?anychart.ui.chartEditor.steps.Base.Descriptor,
 *  steps: Array<anychart.ui.chartEditor.steps.Base.Descriptor>,
 *
 *  dataSets: Array<anychart.ui.chartEditor.steps.Base.DataSet>,
 *  dataMappings: Array<anychart.data.Mapping>,
 *  seriesMappings: Object<string, {type:? (string), mapping: number}>,
 *  chartMapping: number,
 *  lastSeriesId: number,
 *
 *  presets: Object<string, anychart.ui.chartEditor.steps.Base.Preset>,
 *  presetsList: Array<anychart.ui.chartEditor.steps.Base.Preset>,
 *  presetCategory: string,
 *  presetType: string,
 *  preset: Array<{key: string, value}>,
 *
 *  chart: anychart.core.Chart,
 *  isSeriesBased: boolean,
 *  chartContainer: (Element|string),
 *  chartConstructor: string,
 *  seriesType: string
 * }}
 */
anychart.ui.chartEditor.steps.Base.Model;


/**
 * CSS class name.
 * @type {string}
 */
anychart.ui.chartEditor.steps.Base.CSS_CLASS = goog.getCssName('anychart-chart-editor-step');


/**
 * Step index attribute.
 * @private
 */
anychart.ui.chartEditor.steps.Base.STEP_DATA_ATTRIBUTE_ = 'data-index';


/**
 *
 * @param {anychart.ui.chartEditor.steps.Base.Model} value
 */
anychart.ui.chartEditor.steps.Base.prototype.setSharedModel = function(value) {
  this.sharedModel_ = value;
};


/**
 *
 * @return {anychart.ui.chartEditor.steps.Base.Model}
 */
anychart.ui.chartEditor.steps.Base.prototype.getSharedModel = function() {
  return this.sharedModel_;
};


/**
 * @return {string}
 */
anychart.ui.chartEditor.steps.Base.prototype.getName = function() {
  return this.name_;
};


/**
 * @param {string} value
 */
anychart.ui.chartEditor.steps.Base.prototype.setName = function(value) {
  this.name_ = value;
};


/**
 * @return {string}
 */
anychart.ui.chartEditor.steps.Base.prototype.getTitle = function() {
  return this.title_;
};


/**
 * @param {string} value
 */
anychart.ui.chartEditor.steps.Base.prototype.setTitle = function(value) {
  this.title_ = value;
};


/**
 * Enable transition to next step.
 * @param {boolean} value
 */
anychart.ui.chartEditor.steps.Base.prototype.enableNextStep = function(value) {
  this.enableNextStep_ = value;

  if (this.isInDocument()) {
    this.nextBtn_.setEnabled(this.enableNextStep_);
    this.updateProgressList_();
  }
};


/**
 * @protected
 */
anychart.ui.chartEditor.steps.Base.prototype.updateSharedDataMappings = function() {
  var sharedModel = this.getSharedModel();
  sharedModel.dataMappings.length = 0;

  // build data mappings
  var dataSet, i, count;
  for (i = 0, count = sharedModel.dataSets.length; i < count; i++) {
    dataSet = sharedModel.dataSets[i];
    if (!dataSet.rawMappings.length) continue;

    Array.prototype.push.apply(sharedModel.dataMappings, this.getDataMappings_(dataSet));
  }
};


/**
 * Get data mappings from all data sets.
 * @param {anychart.ui.chartEditor.steps.Base.DataSet} dataSet
 * @return {Array.<anychart.data.Mapping>}
 * @private
 */
anychart.ui.chartEditor.steps.Base.prototype.getDataMappings_ = function(dataSet) {
  var dataMappings = [];

  var rawMapping;
  for (var i = 0; i < dataSet.rawMappings.length; i++) {
    rawMapping = dataSet.rawMappings[i];

    // Prepare raw mappings to anychart mapping format.
    var rawMappingField;
    var formattedMapping = {};
    var isArrayMapping = true;
    for (var j = 0; j < rawMapping.length; j++) {
      rawMappingField = rawMapping[j];
      if (!goog.isDef(rawMappingField.key) || !goog.isDef(rawMappingField.value)) continue;
      if (goog.isString(rawMappingField.value)) isArrayMapping = false;

      formattedMapping[rawMappingField.key] = formattedMapping[rawMappingField.key] || [];
      goog.array.insert(formattedMapping[rawMappingField.key], rawMappingField.value);
    }

    if (!goog.object.isEmpty(formattedMapping)) {
      dataMappings.push(
          dataSet.instance['mapAs'](
              isArrayMapping ? formattedMapping : undefined,
              !isArrayMapping ? formattedMapping : undefined));
    }
  }

  return dataMappings;
};


/**
 * Gets first match chart type by selected data mappings uses mappings reference names.
 * {anychart.ui.chartEditor.steps.Base.Model.presetType} has higher priority when matching.
 * @return {string}
 */
anychart.ui.chartEditor.steps.Base.prototype.getChartType = function() {
  var chartType = '';
  goog.object.forEach(this.sharedModel_.presets, function(preset) {
    goog.array.forEach(preset.list, function(chartDescriptor) {
      if (this.isReferenceValuesPresent_(chartDescriptor.referenceNames)) {
        if (!chartType || chartDescriptor.type == this.sharedModel_.presetType) {
          chartType = chartDescriptor.type;
        }
      }
    }, this);
  }, this);

  return chartType;
};


/**
 * @param {Array<string>} values
 * @return {boolean}
 * @private
 */
anychart.ui.chartEditor.steps.Base.prototype.isReferenceValuesPresent_ = function(values) {
  var model = this.getSharedModel();
  if (!model.dataMappings.length) return false;
  var result = true;

  for (var i = 0, count = values.length; i < count; i++) {
    var name = /** @type {number|string} */(values[i]);
    for (var j = 0, m = model.dataMappings.length; j < m; j++) {
      var mapping = model.dataMappings[j];
      var presentInArrayMapping = mapping['getArrayMapping']() != window['anychart']['data']['Mapping']['DEFAULT_ARRAY_MAPPING'] &&
          mapping['getArrayMapping']()[name];
      var presentInObjectMapping = mapping['getObjectMapping']() != window['anychart']['data']['Mapping']['DEFAULT_OBJECT_MAPPING'] &&
          mapping['getObjectMapping']()[name];

      result = Boolean(result && (presentInArrayMapping || presentInObjectMapping));
    }
  }

  return result;
};


/**
 * Returns the aside element.
 * @return {Element}
 */
anychart.ui.chartEditor.steps.Base.prototype.getAsideElement = function() {
  return this.asideEl_;
};


/**
 * Returns the content element.
 * @return {Element}
 */
anychart.ui.chartEditor.steps.Base.prototype.getContentElement = function() {
  return this.contentEl_;
};


/**
 * Returns the progress element.
 * @return {Element}
 */
anychart.ui.chartEditor.steps.Base.prototype.getProgressElement = function() {
  return this.progressEl_;
};


/** @override */
anychart.ui.chartEditor.steps.Base.prototype.createDom = function() {
  anychart.ui.chartEditor.steps.Base.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  var dom = this.getDomHelper();

  var className = anychart.ui.chartEditor.steps.Base.CSS_CLASS;
  goog.dom.classlist.add(element, className);

  var nextBtnClass = goog.getCssName(className, 'next-button');
  var previousBtnClass = goog.getCssName(className, 'previous-button');
  var progressItemListClass = goog.getCssName(className, 'progress-item-list');

  this.asideEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'aside'));

  this.progressEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'progress'),
      this.progressListEl_ = dom.createDom(
          goog.dom.TagName.DIV,
          progressItemListClass));
  goog.a11y.aria.setRole(this.progressListEl_, goog.a11y.aria.Role.LIST);

  this.nextBtn_ = new anychart.ui.button.Primary();
  this.nextBtn_.addClassName(nextBtnClass);
  if (this.sharedModel_.currentStep.isLastStep) {
    this.nextBtn_.setCaption('Complete');
  } else {
    this.nextBtn_.setCaption('Next');
  }
  this.nextBtn_.render(this.progressEl_);

  this.prevBtn_ = new anychart.ui.button.Secondary();
  this.prevBtn_.addClassName(previousBtnClass);
  this.prevBtn_.setCaption('Previous');
  if (!this.sharedModel_.currentStep.index) {
    this.prevBtn_.setState(goog.ui.Component.State.DISABLED, true);
  }
  this.prevBtn_.render(this.progressEl_);

  this.contentWrapperEl_ = dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(className, 'content-wrapper'),
      this.contentEl_ = dom.createDom(
          goog.dom.TagName.DIV, goog.getCssName(className, 'content')),
      this.progressEl_);

  element.appendChild(this.asideEl_);
  element.appendChild(this.contentWrapperEl_);
};


/**
 * Render progress list.
 * @private
 */
anychart.ui.chartEditor.steps.Base.prototype.updateProgressList_ = function() {
  var dom = this.getDomHelper();
  var className = anychart.ui.chartEditor.steps.Base.CSS_CLASS;

  var arrowClass = goog.getCssName(className, 'progress-item-arrow');
  var contentClass = goog.getCssName(className, 'progress-item-content');
  var itemClass = goog.getCssName(className, 'progress-item');

  dom.removeChildren(this.progressListEl_);

  var step;
  for (var i = 0; i < this.sharedModel_.steps.length; i++) {
    step = this.sharedModel_.steps[i];

    var progressArrowEl = dom.createDom(
        goog.dom.TagName.DIV, arrowClass);
    progressArrowEl.innerHTML = '&rarr;';

    var progressContentEl = dom.createDom(
        goog.dom.TagName.DIV, contentClass, step.name);
    goog.dom.setFocusableTabIndex(progressContentEl, true);
    goog.a11y.aria.setRole(progressContentEl, goog.a11y.aria.Role.LINK);
    goog.a11y.aria.setLabel(progressContentEl, step.name);
    progressContentEl.setAttribute(anychart.ui.chartEditor.steps.Base.STEP_DATA_ATTRIBUTE_, String(step.index));

    var itemEl = dom.createDom(
        goog.dom.TagName.DIV,
        itemClass,
        progressContentEl,
        !step.isLastStep ? progressArrowEl : null);
    goog.a11y.aria.setRole(itemEl, goog.a11y.aria.Role.LISTITEM);
    // Set state class.
    if (step.index == this.sharedModel_.currentStep.index) {
      goog.dom.classlist.add(itemEl, goog.getCssName('anychart-active'));

    } else if (step.index < this.sharedModel_.currentStep.index) {
      goog.dom.classlist.add(itemEl, goog.getCssName(itemClass, 'passed'));

    } else if (step.index > this.sharedModel_.currentStep.index + 1 && !step.isVisited) {
      goog.dom.classlist.add(itemEl, goog.getCssName('anychart-disabled'));
    }

    if (!this.enableNextStep_ && step.index == this.sharedModel_.currentStep.index + 1) {
      goog.dom.classlist.enable(itemEl, goog.getCssName('anychart-disabled'), !this.enableNextStep_);
    }

    this.progressListEl_.appendChild(itemEl);
  }
};


/**
 * Update step view.
 */
anychart.ui.chartEditor.steps.Base.prototype.update = function() {};


/**
 * Change step.
 * @param {!goog.events.Event} e
 * @private
 */
anychart.ui.chartEditor.steps.Base.prototype.stepListClickHandler_ = function(e) {
  var className = anychart.ui.chartEditor.steps.Base.CSS_CLASS;
  var contentClass = goog.getCssName(className, 'progress-item-content');
  var element = /** @type {Element} */(e.target);
  var parentElement = goog.dom.getParentElement(element);

  if (goog.dom.classlist.contains(element, contentClass)) {
    if (goog.dom.classlist.contains(parentElement, goog.getCssName('anychart-disabled'))) return;

    var newStepIndex = Number(element.getAttribute(anychart.ui.chartEditor.steps.Base.STEP_DATA_ATTRIBUTE_));
    var newStepDescriptor = this.sharedModel_.steps[newStepIndex];
    var currentStepIndex = this.sharedModel_.currentStep.index;

    if (newStepIndex < currentStepIndex ||
        newStepIndex == currentStepIndex + 1 ||
        newStepDescriptor.isVisited) {

      // If we transition from first step to third step (through one).
      if (newStepDescriptor.isVisited && newStepIndex == currentStepIndex + 2) {
        this.updateSharedDataMappings();
        if (!this.sharedModel_.dataMappings.length) return;
      }

      this.dispatchEvent({
        type: anychart.ui.chartEditor.events.EventType.CHANGE_STEP,
        stepIndex: newStepIndex
      });
    }
  }
};


/** @override */
anychart.ui.chartEditor.steps.Base.prototype.enterDocument = function() {
  anychart.ui.chartEditor.steps.Base.base(this, 'enterDocument');

  this.getHandler().listen(this.asideEl_, goog.events.EventType.WHEEL, this.handleWheel);

  this.nextBtn_.setEnabled(this.enableNextStep_);
  this.updateProgressList_();

  this.getHandler().listen(this.progressListEl_, goog.events.EventType.CLICK, this.stepListClickHandler_);
  this.getHandler().listen(this.nextBtn_,
      goog.ui.Component.EventType.ACTION,
      function() {
        if (this.sharedModel_.currentStep.isLastStep) {
          this.dispatchEvent(anychart.enums.EventType.COMPLETE);
        } else {
          this.dispatchEvent({
            type: anychart.ui.chartEditor.events.EventType.CHANGE_STEP,
            stepIndex: this.sharedModel_.currentStep.index + 1
          });
        }
      });
  this.getHandler().listen(this.prevBtn_, goog.ui.Component.EventType.ACTION, function() {
    if (this.sharedModel_.currentStep.index > 0) {
      this.dispatchEvent({
        type: anychart.ui.chartEditor.events.EventType.CHANGE_STEP,
        stepIndex: this.sharedModel_.currentStep.index - 1
      });
    }
  });
};


/** @override */
anychart.ui.chartEditor.steps.Base.prototype.exitDocument = function() {
  anychart.ui.chartEditor.steps.Base.base(this, 'exitDocument');
};


/** @override */
anychart.ui.chartEditor.steps.Base.prototype.disposeInternal = function() {
  anychart.ui.chartEditor.steps.Base.base(this, 'disposeInternal');
};


/**
 * Wheel event, which is stopped.
 * @param {goog.events.BrowserEvent} e
 * @protected
 */
anychart.ui.chartEditor.steps.Base.prototype.handleWheel = function(e) {
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
