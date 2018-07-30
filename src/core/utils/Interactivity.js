goog.provide('anychart.core.utils.Interactivity');
goog.require('anychart.core.Base');



/**
 * Class is settings for interactivity (like hover, select).
 * @param {anychart.core.Chart} parent Maps should be sets as parent.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.utils.Interactivity = function(parent) {
  anychart.core.utils.Interactivity.base(this, 'constructor');

  /**
   * @type {anychart.core.Chart}
   * @private
   */
  this.parent_ = parent;

  /**
   * @type {boolean}
   * @private
   */
  this.allowMultiSeriesSelection_;

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnMouseWheel_;

  /**
   * Descriptors meta.
   * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
   */
  this.descriptorsMeta = {};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['spotRadius', 0, 0],
    ['multiSelectOnClick', 0, 0],
    ['unselectOnClickOutOfPoint', 0, 0],
    ['hoverMode', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['selectionMode', 0, 0]
  ]);
};
goog.inherits(anychart.core.utils.Interactivity, anychart.core.Base);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'spotRadius', anychart.utils.normalizeToNaturalNumber],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'multiSelectOnClick', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'unselectOnClickOutOfPoint', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'hoverMode', anychart.enums.normalizeHoverMode],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'selectionMode', anychart.enums.normalizeSelectMode]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.utils.Interactivity, anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.Interactivity.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * todo (blackart) not implemented yet, I don't remember what it should be to do.
 * @param {boolean=} opt_value Allow selects more then one series on a chart or not.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.Interactivity.prototype.allowMultiSeriesSelection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.allowMultiSeriesSelection_) {
      this.allowMultiSeriesSelection_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean}*/(this.allowMultiSeriesSelection_);
};


/**
 * Allows use mouse wheel for zooming.
 * @param {boolean=} opt_value Whether will use mouse wheel.
 * @return {anychart.core.utils.Interactivity|boolean} .
 */
anychart.core.utils.Interactivity.prototype.zoomOnMouseWheel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (opt_value != this.zoomOnMouseWheel_) {
      this.zoomOnMouseWheel_ = opt_value;
    }
    return this;
  }
  return /** @type {boolean} */(this.zoomOnMouseWheel_);
};


/**
 * @inheritDoc
 */
anychart.core.utils.Interactivity.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.utils.Interactivity.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS, config, opt_default);
  this.parent_.suspendSignalsDispatching();
  //TODO(AntonKagakin): uncomment this line when zoom will be implemented in chart
  //TODO(AntonKagakin): and remove it from map and stock interactivity class
  //this.zoomOnMouseWheel(config['zoomOnMouseWheel']);
  this.allowMultiSeriesSelection(config['allowMultiSeriesSelection']);
  this.parent_.resumeSignalsDispatching(true);
};


/**
 * Serializes element to JSON.
 * @return {!Object} Serialized JSON object.
 */
anychart.core.utils.Interactivity.prototype.serialize = function() {
  var json = {};

  anychart.core.settings.serialize(this, anychart.core.utils.Interactivity.PROPERTY_DESCRIPTORS, json);
  //TODO(AntonKagakin): uncomment this line when zoom will be implemented in chart
  //TODO(AntonKagakin): and remove it from map and stock interactivity class
  //json['zoomOnMouseWheel'] = this.zoomOnMouseWheel();
  json['allowMultiSeriesSelection'] = this.allowMultiSeriesSelection();
  return json;
};


//exports
(function() {
  var proto = anychart.core.utils.Interactivity.prototype;
  //proto['allowMultiSeriesSelection'] = proto.allowMultiSeriesSelection;
  //TODO(AntonKagakin): uncomment this line when zoom will be implemented in chart
  //TODO(AntonKagakin): also remove export from map and stock interactivity class
  //proto['zoomOnMouseWheel'] = proto.zoomOnMouseWheel;
  // auto generated
  // proto['spotRadius'] = proto.spotRadius;
  // proto['multiSelectOnClick'] = proto.multiSelectOnClick;
  // proto['unselectOnClickOutOfPoint'] = proto.unselectOnClickOutOfPoint;
  // proto['hoverMode'] = proto.hoverMode;
  // proto['selectionMode'] = proto.selectionMode;
})();
