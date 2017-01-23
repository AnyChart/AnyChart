//region --- Requiring and Providing
goog.provide('anychart.core.ui.Overlay');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
//endregion



/**
 * Overlay element class.
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @extends {anychart.core.Base}
 */
anychart.core.ui.Overlay = function() {
  anychart.core.ui.Overlay.base(this, 'constructor');

  /**
   * Settings holder.
   * @type {!Object}
   */
  this.settings = {};

  /**
   * Default settings holder.
   * @type {!Object}
   */
  this.defaultSettings = {};

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.core.ui.Overlay, anychart.core.Base);


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
anychart.core.ui.Overlay.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.ENABLED |
    anychart.ConsistencyState.CONTAINER |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.BOUNDS;


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Overlay.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REDRAW;


//endregion
//region --- Settings
/**
 * Properties that should be defined in anychart.core.resource.TimeLine prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Overlay.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map['id'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'id',
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['className'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'className',
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Overlay, anychart.core.ui.Overlay.DESCRIPTORS);


/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.ui.Overlay|boolean|null} .
 */
anychart.core.ui.Overlay.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settings['enabled'] != opt_value) {
      var enabled = this.settings['enabled'] = opt_value;
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
 * @return {Element|anychart.core.ui.Overlay}
 */
anychart.core.ui.Overlay.prototype.target = function(opt_value) {
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
anychart.core.ui.Overlay.prototype.getElement = function() {
  return this.domElement_;
};


/**
 * Setter for bounds.
 * @param {anychart.math.Rect} value .
 */
anychart.core.ui.Overlay.prototype.setBounds = function(value) {
  this.bounds_ = value;
  this.invalidate(anychart.ConsistencyState.BOUNDS);
};


//endregion
//region --- IObjectWithSettings impl
/**
 * Returns option value if it was set directly to the object.
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Overlay.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.ui.Overlay.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Overlay.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Overlay.prototype.getOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.ui.Overlay.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.ui.Overlay.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- Drawing
/**
 * Checks if drawing continuation is needed. Also resolves enabled state.
 * @return {boolean} True - if we should continue drawing, false otherwise.
 */
anychart.core.ui.Overlay.prototype.checkDrawingNeeded = function() {
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
 * @return {anychart.core.ui.Overlay}
 */
anychart.core.ui.Overlay.prototype.draw = function() {
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
anychart.core.ui.Overlay.prototype.remove = function() {
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
anychart.core.ui.Overlay.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isBoolean(value) || goog.isNull(value)) {
    if (opt_default) {
      this.defaultSettings['enabled'] = !!value;
    } else {
      this.enabled(!!value);
    }
    return true;
  }
  return anychart.core.Base.prototype.specialSetupByVal.apply(this, arguments);
};


/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.ui.Overlay.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.defaultSettings, anychart.core.ui.Overlay.DESCRIPTORS, config);
  if ('enabled' in config)
    this.defaultSettings['enabled'] = config['enabled'];
};


/** @inheritDoc */
anychart.core.ui.Overlay.prototype.serialize = function() {
  var json = anychart.core.ui.Overlay.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.Overlay.DESCRIPTORS, json, 'Overlay ui element');

  var enabled;
  if (this.hasOwnOption('enabled')) {
    enabled = this.getOwnOption('enabled');
  }
  if (!goog.isDef(enabled)) {
    enabled = this.getThemeOption('enabled');
  }
  json['enabled'] = goog.isDef(enabled) ? enabled : null;

  return json;
};


/** @inheritDoc */
anychart.core.ui.Overlay.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Overlay.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.ui.Overlay.DESCRIPTORS, config);
    this.enabled(config['enabled']);
  }
};


/** @inheritDoc */
anychart.core.ui.Overlay.prototype.disposeInternal = function() {
  anychart.core.ui.Overlay.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.ui.Overlay.prototype;
  // proto['id'] = proto.id;
  // proto['className'] = proto.className;
  proto['getElement'] = proto.getElement;
  proto['enabled'] = proto.enabled;
})();


//endregion
