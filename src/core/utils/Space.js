//region --- Requiring and Providing
goog.provide('anychart.core.utils.Space');

goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
//endregion



/**
 * Stores space info for 4 sides. Can accept numbers and strings as side spaces.
 * For initializing values meaning see set() method.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom
 *    Space object or top or top and bottom space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.utils.Space = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  anychart.core.utils.Space.base(this, 'constructor');

  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};


  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};


  /**
   * Parent.
   * @type {anychart.core.utils.Space}
   * @private
   */
  this.parent_ = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom) || goog.isDef(opt_rightOrRightAndLeft) || goog.isDef(opt_bottom) || goog.isDef(opt_left))
    this.set.apply(this, arguments);
};
goog.inherits(anychart.core.utils.Space, anychart.core.Base);


//region --- Class properties
/**
 * @typedef {{
 *  top: (number|string|undefined),
 *  left: (number|string|undefined),
 *  bottom: (number|string|undefined),
 *  right: (number|string|undefined)
 * }}
 */
anychart.core.utils.Space.NormalizedSpace;


/**
 * Signals mask.
 * @type {number}
 */
anychart.core.utils.Space.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


//region -- Space descriptors
/**
 * Space descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.utils.Space.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['left'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'left',
      anychart.core.settings.numberOrZeroNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REAPPLICATION);

  map['top'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'top',
      anychart.core.settings.numberOrZeroNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REAPPLICATION);

  map['bottom'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'bottom',
      anychart.core.settings.numberOrZeroNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REAPPLICATION);

  map['right'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'right',
      anychart.core.settings.numberOrZeroNormalizer,
      anychart.ConsistencyState.ONLY_DISPATCHING,
      anychart.Signal.NEEDS_REAPPLICATION);

  return map;
})();
anychart.core.settings.populate(anychart.core.utils.Space, anychart.core.utils.Space.SIMPLE_PROPS_DESCRIPTORS);
//endregion


//region -- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.utils.Space.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.getOption = function(name) {
  return anychart.core.settings.getOption.call(this, name) || 0;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.check = function(flags) {
  return true;
};
//endregion


//region -- IResolvable implementation
/** @inheritDoc */
anychart.core.utils.Space.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.utils.Space.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};
//endregion


//region -- Parental relations
/**
 * Gets/sets new parent.
 * @param {anychart.core.utils.Space=} opt_value - Value to set.
 * @return {anychart.core.utils.Space} - Current value or itself for method chaining.
 */
anychart.core.utils.Space.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.core.utils.Space.prototype.parentInvalidated_ = function(e) {
  this.resolutionChainCache_ = null;
  this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};
//endregion


/**
 * Normalizes space.
 * @param {...(Object|Array|string|number)} var_args - Arguments.
 *  Can actually take the following:
 *    1) Four {string|number} values that are top, right, bottom and left respectively.
 *    2) Two {string|number} values that are top-bottom and right-left values.
 *    3) Single {string|number} value that sets top-right-bottom-left.
 *    4) Single Array.<string|number> with top, right, bottom and left values.
 *    4) Single Object.<string, {string|number}> with top, right, bottom and left values.
 * @return {anychart.core.utils.Space.NormalizedSpace}
 */
anychart.core.utils.Space.normalizeSpace = function(var_args) {
  var top, right, bottom, left;
  var argsLen;
  var spaceOrTopOrTopAndBottom = arguments[0], rightOrRightAndLeft = arguments[1],
      bottomVal = arguments[2], leftVal = arguments[3];
  if (goog.isArray(spaceOrTopOrTopAndBottom)) {
    var tmp = spaceOrTopOrTopAndBottom;
    spaceOrTopOrTopAndBottom = tmp[0];
    rightOrRightAndLeft = tmp[1];
    bottomVal = tmp[2];
    leftVal = tmp[3];
    argsLen = tmp.length;
  } else
    argsLen = arguments.length;
  // else if branches sorted a bit like by usage frequency

  if (!argsLen) {
    return {};
  } else if (goog.typeOf(spaceOrTopOrTopAndBottom) == 'object') {
    top = spaceOrTopOrTopAndBottom['top'] || 0;
    right = spaceOrTopOrTopAndBottom['right'] || 0;
    bottom = spaceOrTopOrTopAndBottom['bottom'] || 0;
    left = spaceOrTopOrTopAndBottom['left'] || 0;
  } else if (argsLen == 1) {
    left = bottom = right = top = spaceOrTopOrTopAndBottom || 0;
  } else if (argsLen == 2) {
    bottom = top = spaceOrTopOrTopAndBottom || 0;
    left = right = rightOrRightAndLeft || 0;
  } else if (argsLen == 3) {
    top = spaceOrTopOrTopAndBottom || 0;
    left = right = rightOrRightAndLeft || 0;
    bottom = bottomVal || 0;
  } else if (argsLen >= 4) {
    top = spaceOrTopOrTopAndBottom || 0;
    right = rightOrRightAndLeft || 0;
    bottom = bottomVal || 0;
    left = leftVal || 0;
  }

  return /** @type {anychart.core.utils.Space.NormalizedSpace} */ ({
    top: top,
    left: left,
    bottom: bottom,
    right: right
  });
};


/**
 * Resets all offsets using values passed.
 * Can accept other Space object or from 0 to 4 values (numbers or percent strings).
 * Space values are applied just as in CSS:
 * 1) set(25, 50, 75, 100):
 *    top space is 25
 *    right space is 50
 *    bottom space is 75
 *    left space is 100
 * 2) set(25, 50, 75):
 *    top space is 25
 *    right and left spaces are 50
 *    bottom space is 75
 * 3) set(25, 50):
 *    top and bottom spaces are 25
 *    right and left spaces are 50
 * 4) set(25):
 *    all four spaces are 25
 * Also can accept arrays (applied, like it is an apply) and objects with 'left', 'top', 'right' and 'bottom' fields.
 *
 * NOTE: set():
 *    all four spaces are 0
 *
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!anychart.core.utils.Space} Returns itself for chaining.
 */
anychart.core.utils.Space.prototype.set = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  var normalizedSpace = /** @type {anychart.core.utils.Space.NormalizedSpace} */ (anychart.core.utils.Space.normalizeSpace.apply(this, arguments));
  if ((this.getOption('top') !== normalizedSpace.top) ||
      (this.getOption('right') !== normalizedSpace.right) ||
      (this.getOption('bottom') !== normalizedSpace.bottom) ||
      (this.getOption('left') !== normalizedSpace.left)) {
    this.setOption('top', normalizedSpace.top);
    this.setOption('right', normalizedSpace.right);
    this.setOption('bottom', normalizedSpace.bottom);
    this.setOption('left', normalizedSpace.left);
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this;
};


/**
 * Applies margin settings to a rect, creating a new tighten rectangle.
 * @param {!anychart.math.Rect} boundsRect Rectangle to apply margins to.
 * @return {!anychart.math.Rect} New rectangle with applied margin.
 */
anychart.core.utils.Space.prototype.tightenBounds = function(boundsRect) {
  var left = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('left')), boundsRect.width);
  var right = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('right')), boundsRect.width);
  var top = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('top')), boundsRect.height);
  var bottom = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('bottom')), boundsRect.height);
  return new anychart.math.Rect(
      boundsRect.left + left,
      boundsRect.top + top,
      boundsRect.width - left - right,
      boundsRect.height - top - bottom
  );
};


/**
 * Applies margin settings to the width. The resulting width is less than the initial.
 * @param {number} initialWidth Width to apply margin to.
 * @return {number} New width.
 */
anychart.core.utils.Space.prototype.tightenWidth = function(initialWidth) {
  var left = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('left')), initialWidth);
  var right = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('right')), initialWidth);
  return initialWidth - left - right;
};


/**
 * Applies margin settings to a height. The resulting height is less than the initial.
 * @param {number} initialHeight Height to apply margin to.
 * @return {number} New height.
 */
anychart.core.utils.Space.prototype.tightenHeight = function(initialHeight) {
  var top = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('top')), initialHeight);
  var bottom = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('bottom')), initialHeight);
  return initialHeight - top - bottom;
};


/**
 * Applies padding settings to a rectangle, creating a new widen rectangle.
 * @param {!anychart.math.Rect} boundsRect Rectangle to apply margin to.
 * @return {!anychart.math.Rect} New rectangle.
 */
anychart.core.utils.Space.prototype.widenBounds = function(boundsRect) {
  var left = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('left')), boundsRect.width);
  var right = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('right')), boundsRect.width);
  var top = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('top')), boundsRect.height);
  var bottom = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('bottom')), boundsRect.height);
  return new anychart.math.Rect(
      boundsRect.left - left,
      boundsRect.top - top,
      boundsRect.width + left + right,
      boundsRect.height + top + bottom
  );
};


/**
 * Applies margin settings to a width. The resulting width is bigger than the initial.
 * @param {number} initialWidth Width to apply margin to.
 * @return {number} New width.
 */
anychart.core.utils.Space.prototype.widenWidth = function(initialWidth) {
  var left = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('left')), initialWidth);
  var right = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('right')), initialWidth);
  return initialWidth + left + right;
};


/**
 * Applies margin settings to a height. The resulting height is bigger than the initial.
 * @param {number} initialHeight Height to apply margin to.
 * @return {number} New height.
 */
anychart.core.utils.Space.prototype.widenHeight = function(initialHeight) {
  var top = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('top')), initialHeight);
  var bottom = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('bottom')), initialHeight);
  return initialHeight + top + bottom;
};


//endregion
//region --- Serialization
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.utils.Space.prototype.setThemeSettings = function(config) {
  for (var name in anychart.core.utils.Space.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.serialize = function() {
  var json = anychart.core.utils.Space.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.utils.Space.SIMPLE_PROPS_DESCRIPTORS, json, 'Space');
  return json;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.setupSpecial = function(var_args) {
  if (goog.isDef(arguments[0])) {
    this.set.apply(this, arguments);
    return false;
  }
  return anychart.core.utils.Space.base(this, 'setupSpecial', arguments);
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.specialSetupByVal = function(value, opt_default) {
  if (goog.isArray(value) || goog.isString(value) || goog.isNumber(value)) {
    if (opt_default) {
      this.setThemeSettings(anychart.core.utils.Space.normalizeSpace(value));
    } else {
      this.set(value);
    }
    return true;
  }
  return false;
};


/** @inheritDoc */
anychart.core.utils.Space.prototype.setupByJSON = function(config, opt_default) {
  this.suspendSignalsDispatching();

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.utils.Space.SIMPLE_PROPS_DESCRIPTORS, config);
  }

  this.resumeSignalsDispatching(true);
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.utils.Space.prototype;
  // proto['top'] = proto.top;
  // proto['right'] = proto.right;
  // proto['bottom'] = proto.bottom;
  // proto['left'] = proto.left;
  proto['set'] = proto.set;
})();
//endregion
