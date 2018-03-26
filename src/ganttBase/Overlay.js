//region --- Requiring and Providing
goog.provide('anychart.ganttBaseModule.Overlay');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
//endregion



/**
 * Overlay element class.
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.ganttBaseModule.Overlay = function() {
  anychart.ganttBaseModule.Overlay.base(this, 'constructor');

  this.invalidate(anychart.ConsistencyState.ALL);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['id'],
    ['className']
  ]);
};
goog.inherits(anychart.ganttBaseModule.Overlay, anychart.core.Base);


//region --- Infrastructure
//------------------------------------------------------------------------------
//
//  Infrastructure
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttBaseModule.Overlay.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.ENABLED |
    anychart.ConsistencyState.CONTAINER |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.BOUNDS;


/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttBaseModule.Overlay.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- Settings
/**
 * Properties that should be defined in anychart.ganttBaseModule.TimeLineHeader prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttBaseModule.Overlay.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'id',
      anychart.core.settings.stringNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'className',
      anychart.core.settings.stringNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.ganttBaseModule.Overlay, anychart.ganttBaseModule.Overlay.DESCRIPTORS);


/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.ganttBaseModule.Overlay|boolean|null} .
 */
anychart.ganttBaseModule.Overlay.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.ownSettings['enabled'] != opt_value) {
      var enabled = this.ownSettings['enabled'] = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, anychart.Signal.NEEDS_REDRAW);
      if (enabled) {
        this.doubleSuspension = false;
        this.resumeSignalsDispatching(true);
      } else {
        if (isNaN(this.suspendedDispatching)) {
          this.suspendSignalsDispatching();
        } else {
          this.doubleSuspension = true;
        }
      }
    }
    return this;
  } else {
    return /** @type {boolean} */(this.getOption('enabled'));
  }
};


/**
 * Overlay target.
 * @param {Element=} opt_value .
 * @return {Element|anychart.ganttBaseModule.Overlay}
 */
anychart.ganttBaseModule.Overlay.prototype.target = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.target_ != opt_value) {
      this.target_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTAINER);
    }
    return this;
  }
  return this.target_;
};


/**
 * Getter for overlay DOM element.
 * @return {Element}
 */
anychart.ganttBaseModule.Overlay.prototype.getElement = function() {
  return this.domElement_;
};


/**
 * Setter for bounds.
 * @param {anychart.math.Rect} value .
 */
anychart.ganttBaseModule.Overlay.prototype.setBounds = function(value) {
  this.bounds_ = value;
  this.invalidate(anychart.ConsistencyState.BOUNDS);
};


//endregion
//region --- IObjectWithSettings impl
/** @inheritDoc */
anychart.ganttBaseModule.Overlay.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.ganttBaseModule.Overlay.prototype.getConsistencyState = function(fieldName) {
  // all properties invalidates APPEARANCE
  return anychart.ConsistencyState.APPEARANCE;
};


/** @inheritDoc */
anychart.ganttBaseModule.Overlay.prototype.getSignal = function(fieldName) {
  // all properties invalidates with NEEDS_REDRAW
  return anychart.Signal.NEEDS_REDRAW;
};


//endregion
//region --- Drawing
/**
 * Checks if drawing continuation is needed. Also resolves enabled state.
 * @return {boolean} True - if we should continue drawing, false otherwise.
 */
anychart.ganttBaseModule.Overlay.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent() || this.isDisposed())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      this.markConsistent(anychart.ConsistencyState.ENABLED);
      this.invalidate(anychart.ConsistencyState.CONTAINER);
    }
    return false;
  } else if (!this.target()) {
    this.remove(); // It should be removed if it was drawn.
    this.invalidate(anychart.ConsistencyState.CONTAINER);
    anychart.core.reporting.error(anychart.enums.ErrorCode.CONTAINER_NOT_SET);
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};


/**
 * Drawing.
 * @return {anychart.ganttBaseModule.Overlay}
 */
anychart.ganttBaseModule.Overlay.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.domElement_) {
    this.domElement_ = goog.dom.createDom(goog.dom.TagName.DIV);
    goog.style.setStyle(this.domElement_, {
      'position': 'absolute',
      'pointer-events': 'none'
    });
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    goog.dom.appendChild(this.target_, this.domElement_);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var id = this.getOption('id');
    if (goog.isDef(id))
      this.domElement_.setAttribute('id', id);

    var className = this.getOption('className');
    if (goog.isDef(className))
      goog.dom.classlist.set(this.domElement_, /** @type {string} */(className));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    goog.style.setPosition(this.domElement_, this.bounds_.left, this.bounds_.top);
    goog.style.setSize(this.domElement_, this.bounds_.width, this.bounds_.height);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


/**
 * Removing element from DOM.
 */
anychart.ganttBaseModule.Overlay.prototype.remove = function() {
  if (this.domElement_) goog.dom.removeNode(this.domElement_);
};


//endregion
//region --- Serialization / Deserialization / Disposing
//------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//------------------------------------------------------------------------------
/** @inheritDoc */
anychart.ganttBaseModule.Overlay.prototype.setupSpecial = function(isDefault, var_args) {
  var arg0 = arguments[1];
  if (goog.isBoolean(arg0) || goog.isNull(arg0)) {
    if (isDefault)
      this.themeSettings['enabled'] = !!arg0;
    else
      this.enabled(!!arg0);
    return true;
  }
  return false;
};


/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.ganttBaseModule.Overlay.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, anychart.ganttBaseModule.Overlay.DESCRIPTORS, config);
  if ('enabled' in config)
    this.themeSettings['enabled'] = config['enabled'];
};


/** @inheritDoc */
anychart.ganttBaseModule.Overlay.prototype.serialize = function() {
  var json = anychart.ganttBaseModule.Overlay.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttBaseModule.Overlay.DESCRIPTORS, json, 'Overlay ui element');

  var enabled = anychart.core.Base.prototype.getOption.call(this, 'enabled');
  json['enabled'] = goog.isDef(enabled) ? enabled : null;

  return json;
};


/** @inheritDoc */
anychart.ganttBaseModule.Overlay.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttBaseModule.Overlay.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, anychart.ganttBaseModule.Overlay.DESCRIPTORS, config);
    this.enabled(config['enabled']);
  }
};


/** @inheritDoc */
anychart.ganttBaseModule.Overlay.prototype.disposeInternal = function() {
  anychart.ganttBaseModule.Overlay.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.ganttBaseModule.Overlay.prototype;
  // proto['id'] = proto.id;
  // proto['className'] = proto.className;
  proto['getElement'] = proto.getElement;
  proto['enabled'] = proto.enabled;
})();


//endregion
