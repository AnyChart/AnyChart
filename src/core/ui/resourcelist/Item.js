goog.provide('anychart.core.ui.resourceList.Item');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Label');
goog.require('anychart.opt');



/**
 * Class representing item in resource list.
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @extends {anychart.core.VisualBase}
 */
anychart.core.ui.resourceList.Item = function() {
  anychart.core.ui.resourceList.Item.base(this, 'constructor');

  /**
   * Settings storage.
   * @type {!Object}
   * @protected
   */
  this.settings = {};

  /**
   * Default settings.
   * @type {!Object}
   * @protected
   */
  this.defaultSettings = {};

  /**
   * Root layer of resource item.
   * Contains all resource elements such as background,
   * image, name, type, description and tags.
   * @type {acgraph.vector.Layer}
   */
  this.rootLayer = null;

  /**
   * Item image element.
   * @type {acgraph.vector.Image}
   */
  this.imageElement = null;

  /**
   * Item name text element.
   * @type {acgraph.vector.Text}
   */
  this.nameElement = null;

  /**
   * Item type text element.
   * @type {acgraph.vector.Text}
   */
  this.typeElement = null;

  /**
   * Item description text element.
   * @type {acgraph.vector.Text}
   */
  this.descriptionElement = null;

  /**
   * Item tag text elements.
   * @type {Array.<anychart.core.ui.Label>}
   */
  this.tagsElements = null;

  /**
   * Coordinates of an image and text elements, except tags.
   * @type {Object}
   */
  this.coords = {
    image: {
      'x': 0,
      'y': 0,
      'height': 0
    },
    name: {
      'x': 0,
      'y': 0,
      'height': 0
    },
    type: {
      'x': 0,
      'y': 0,
      'height': 0
    },
    description: {
      'x': 0,
      'y': 0,
      'height': 0
    }
  };

  this.methodsMap = {
    'fontColor': 'color',
    'fontOpacity': 'opacity',
    'fontDecoration': 'decoration',
    'textDirection': 'direction'
  };
};
goog.inherits(anychart.core.ui.resourceList.Item, anychart.core.VisualBase);


//region --- STATES/SIGNALS ---
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.resourceList.Item.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.resourceList.Item.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;
//endregion


//region --- IObjectWithSettings IMPLEMENTATION ---
/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.check = function(flags) {
  return true;
};


/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.getOption = function(name) {
  return goog.isDef(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.settings[name]);
};


/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};
//endregion


//region --- ADDITIONAL SETTINGS METHODS ---
/**
 * Sets default value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.ui.resourceList.Item.prototype.setThemeOption = function(name, value) {
  this.defaultSettings[name] = value;
};


/**
 * Gets a complex option for complex structure.
 * E.g.
 * We have an option "data" with complex object in it:
 * {
 *   str1: 'string1',
 *   obj1: {
 *     key1: 'myValue'
 *   }
 *   obj2: {
 *     key2: 'myValue'
 *   },
 *   other1: 'other1',
 *   other2: {
 *     key: 'value'
 *   }
 * }
 * So do we for a default:
 * {
 *   str1: 'defaultString1',
 *   str2: 'defaultString2',
 *   obj1: {
 *     key1: 'obj1_key1_value',
 *     key2: 'obj1_key2_value'
 *   },
 *   obj2: {
 *     key1: 'obj2_key1_value'
 *   },
 *   other1: {
 *     key: 'value'
 *   },
 *   other2: 'other2'
 * }
 * This method works same as getOption if object keys was separated into independent options.
 * Examples of usage:
 * this.getComplexOption('data', ['str1']); // 'string1'
 * this.getComplexOption('data', ['str2']); // 'defaultString2'
 * this.getComplexOption('data', ['obj1', 'key1']); // 'myValue'
 * this.getComplexOption('data', ['obj1', 'key2']); // 'obj1_key2_value' <- default returned.
 * this.getComplexOption('data', ['obj1']); // { key1: 'myValue', key2: 'obj1_key2_value' } // note that we have a merging with default here.
 * this.getComplexOption('data', ['obj2']); // { key1: 'obj2_key1_value1', key2: 'myValue'} // same merge
 * this.getComplexOption('data', ['other1']); // other1
 * this.getComplexOption('data', ['other2']); // { 'key': 'value' } <- different types can not be merged
 * this.getComplexOption('data', 'str1'); // 'strin1' <- accepts only arrays
 * this.getComplexOption('data', 'obj1', 'key1'); // { key1: 'myValue', key2: 'obj1_key2_value' } <- do not accept multiargs
 *
 * @param {string} name Name of complex option.
 * @param {Array.<string>|string} path Path to get value from.
 * @return {*} Value of an option.
 */
anychart.core.ui.resourceList.Item.prototype.getComplexOption = function(name, path) {
  var own = this.getOption(name);
  var def = this.getThemeOption(name);
  var rv;

  if (!goog.isArray(path)) path = [path];

  var i;
  for (i = 0; i < path.length; i++) {
    own = own ? own[path[i]] : void 0;
    def = def ? def[path[i]] : void 0;
  }
  // if we do not have a default (def undefined case) - we can return own value
  if (!goog.isDef(def))
    return own;

  // if we do not have own setting (own undefined ase) - we can return def value
  if (!goog.isDef(own))
    return def;

  // goog.typeOf(null) = 'null'
  // check here to avoid typeOf checking (goog.isNull more lightweight operation)
  // and checking when own = def = null in else clause below.
  if (goog.isNull(own) || (isNaN(own) && !goog.isObject(own)))
    return own;

  if (goog.typeOf(own) != goog.typeOf(def)) {
    return own;
  } else {
    // here we totally sure that own and def has same types, are defined and not null.
    if (goog.isArray(own)) {
      rv = [];
      var len = Math.max(def.length, own.length);
      for (i = 0; i < len; i++)
        if (goog.isDef(own[i]))
          rv[i] = own[i];
        else
          rv[i] = def[i];
    } else {
      rv = {};
      goog.mixin(rv, /** @type {Object} */ (def));
      goog.mixin(rv, /** @type {Object} */ (own));
    }
    return rv;
  }
};
//endregion


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.resourceList.Item.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map[anychart.opt.WIDTH] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.WIDTH,
    normalizer: anychart.core.settings.numberOrPercentNormalizer,
    consistency: 0,
    signal: 0
  };

  map[anychart.opt.IMAGE_SRC] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.IMAGE_SRC,
    normalizer: anychart.core.settings.stringNormalizer,
    consistency: 0,
    signal: 0
  };

  map[anychart.opt.NAME] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.NAME,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: 0
  };

  map[anychart.opt.TYPE] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.TYPE,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: 0
  };

  map[anychart.opt.DESCRIPTION] = {
    handler: anychart.enums.PropertyHandlerType.SINGLE_ARG,
    propName: anychart.opt.DESCRIPTION,
    normalizer: anychart.core.settings.asIsNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  map[anychart.opt.TAGS] = {
    handler: anychart.enums.PropertyHandlerType.MULTI_ARG,
    propName: anychart.opt.TAGS,
    normalizer: anychart.core.settings.arrayNormalizer,
    consistency: 0,
    signal: anychart.Signal.NEEDS_REDRAW
  };

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.resourceList.Item, anychart.core.ui.resourceList.Item.PROPERTY_DESCRIPTORS);
//endregion


//region --- OWN API ---
/**
 * Getter/setter for background.
 * @param {Object=} opt_value background.
 * @return {anychart.core.ui.Background|anychart.core.ui.resourceList.Item} background or self for chaining.
 */
anychart.core.ui.resourceList.Item.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  } else {
    return this.background_;
  }
};
//endregion


//region --- SETTINGS ---
/**
 * Applies settings to elements.
 * @param {acgraph.vector.Text|acgraph.vector.Image} element
 * @param {Object} settings Settings.
 */
anychart.core.ui.resourceList.Item.prototype.applySettings = function(element, settings) {
  var key, value;
  for (key in settings) {
    value = settings[key];
    if (key in this.methodsMap)
      key = this.methodsMap[key];
    if (element[key])
      element[key](value);
  }
};


/**
 * Default tag label settings.
 * @type {Object}
 */
anychart.core.ui.resourceList.Item.DEFAULT_TAG_LABEL_SETTINGS = {
  'position': 'leftTop',
  'anchor': 'leftTop',
  'rotation': 0
};

//endregion


//region --- BOUNDS ---
/**
 * Getter/setter for offsetY.
 * @param {string=} opt_value offsetY.
 * @return {string|anychart.core.ui.resourceList.Item} offsetY or self for chaining.
 */
anychart.core.ui.resourceList.Item.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
    }
    return this;
  }
  return this.offsetY_;
};


/**
 * Gets calculated height of an item.
 * @return {number}
 */
anychart.core.ui.resourceList.Item.prototype.getActualHeight = function() {
  if (!this.enabled()) return 0;
  return this.actualHeight_;
};


/**
 * Creates path to clip image.
 * @return {acgraph.vector.Rect}
 * @private
 */
anychart.core.ui.resourceList.Item.prototype.createClipForImage_ = function() {
  var width = /** @type {number} */ (this.imageElement.width());
  if (!this.rect_)
    this.rect_ = acgraph.rect(0, 0);
  this.rect_.setWidth(width).setHeight(width);

  var leftTop = 0;
  var rightTop = 0;
  var rightBottom = 0;
  var leftBottom = 0;

  var borderRadius = this.getComplexOption('imageSettings', anychart.opt.BORDER_RADIUS);
  if (!goog.isArray(borderRadius))
    borderRadius = [borderRadius];
  if (borderRadius && borderRadius.length) {
    for (var i = 0; i < borderRadius.length; i++) {
      borderRadius[i] = Math.min(borderRadius[i], width / 2);
    }
    if (borderRadius.length == 1) {
      leftTop = borderRadius[0];
      rightTop = borderRadius[0];
      rightBottom = borderRadius[0];
      leftBottom = borderRadius[0];
    } else if (borderRadius.length == 2) {
      leftTop = borderRadius[0];
      rightTop = borderRadius[1];
      rightBottom = borderRadius[0];
      leftBottom = borderRadius[1];
    } else if (borderRadius.length == 3) {
      leftTop = borderRadius[0];
      rightTop = borderRadius[1];
      rightBottom = borderRadius[2];
      leftBottom = borderRadius[1];
    } else if (borderRadius.length == 4) {
      leftTop = borderRadius[0];
      rightTop = borderRadius[1];
      rightBottom = borderRadius[2];
      leftBottom = borderRadius[3];
    }
  }

  this.rect_.round(leftTop, rightTop, rightBottom, leftBottom);
  return this.rect_;
};


/**
 * Calculates elements coordinates for translation.
 * @param {acgraph.vector.Text} element Text element.
 * @param {Object} coords Coordinates.
 * @param {number} fullImageWidth Full image of width (width + margins).
 * @param {Object} margin Margin of element.
 * @param {number} height Height of resource item if present.
 */
anychart.core.ui.resourceList.Item.prototype.calculateCoordinates = function(element, coords, fullImageWidth, margin, height) {
  var width = /** @type {number} */ (this.getOption(anychart.opt.WIDTH));
  var marginTop = anychart.utils.normalizeSize(margin.top, height) || 0;
  var marginRight = anychart.utils.normalizeSize(margin.right, width) || 0;
  var marginBottom = anychart.utils.normalizeSize(margin.bottom, height) || 0;
  var marginLeft = anychart.utils.normalizeSize(margin.left, width) || 0;

  coords[anychart.opt.X] = fullImageWidth + marginLeft;
  coords[anychart.opt.Y] += marginTop;
  var textWidth = width - coords[anychart.opt.X] - marginRight;
  element.width(textWidth);
  coords[anychart.opt.HEIGHT] = element.getHeight() + marginBottom;
};
//endregion


//region --- EVENTS HANDLING---
/**
 * Click handler.
 * @param {Object} event
 * @return {boolean}
 * @private
 */
anychart.core.ui.resourceList.Item.prototype.handleMouseClick_ = function(event) {
  var newEvent = {};
  if (event) {
    var label = /** @type {anychart.core.ui.Label} */ (event.target);
    var index = goog.array.indexOf(this.tagsElements, label);
    newEvent['type'] = event['type'];
    newEvent['target'] = label;
    newEvent['index'] = index;
    newEvent['text'] = label.text();
    return this.dispatchEvent(newEvent);
  } else
    return false;
};
//endregion


//region --- DRAWING ---
/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.remove = function() {
  if (this.rootLayer) this.rootLayer.parent(null);
};


/**
 * Draws resource item.
 * @return {anychart.core.ui.resourceList.Item} Self for chaining.
 */
anychart.core.ui.resourceList.Item.prototype.draw = function() {
  if (!this.checkDrawingNeeded() && this.background().isConsistent())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
  }

  if (!this.imageElement) {
    this.imageElement = this.rootLayer.image();
    this.imageElement.zIndex(1);
  }
  if (!this.nameElement) {
    this.nameElement = this.rootLayer.text();
    this.nameElement.zIndex(1);
  }
  if (!this.typeElement) {
    this.typeElement = this.rootLayer.text();
    this.typeElement.zIndex(1);
  }
  if (!this.descriptionElement) {
    this.descriptionElement = this.rootLayer.text();
    this.descriptionElement.zIndex(1);
  }
  if (!this.tagsElements) {
    this.tagsElements = [];
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  var imageSrc = /** @type {string} */ (this.getOption(anychart.opt.IMAGE_SRC));
  this.imageElement.src(imageSrc);

  this.applySettings(this.imageElement, /** @type {Object} */ (this.getComplexOption('imageSettings', [])));

  var name = /** @type {string} */ (this.getOption(anychart.opt.NAME));
  if (!!this.getComplexOption('nameSettings', anychart.opt.USE_HTML))
    this.nameElement.htmlText(name);
  else
    this.nameElement.text(name);
  this.applySettings(this.nameElement, /** @type {Object} */ (this.getComplexOption('nameSettings', [])));

  var type = /** @type {string} */ (this.getOption(anychart.opt.TYPE));
  if (!!this.getComplexOption('typeSettings', anychart.opt.USE_HTML))
    this.typeElement.htmlText(type);
  else
    this.typeElement.text(type);
  this.applySettings(this.typeElement, /** @type {Object} */ (this.getComplexOption('typeSettings', [])));

  var description = /** @type {string} */ (this.getOption(anychart.opt.DESCRIPTION));
  if (!!this.getComplexOption('descriptionSettings', anychart.opt.USE_HTML))
    this.descriptionElement.htmlText(description);
  else
    this.descriptionElement.text(description);
  this.applySettings(this.descriptionElement, /** @type {Object} */ (this.getComplexOption('descriptionSettings', [])));

  var tags = /** @type {Array} */ (this.getOption(anychart.opt.TAGS));
  var tag, i;
  if (this.tagsElements.length) {
    for (i = 0; i < this.tagsElements.length; i++) {
      tag = this.tagsElements[i];
      this.eventsHandler.unlisten(tag, acgraph.events.EventType.CLICK, this.handleMouseClick_);
      goog.dispose(tag);
    }
    this.tagsElements = [];
  }

  var tagSettings = /** @type {Object} */ (this.getComplexOption('tagSettings', []));
  tagSettings['background'] = /** @type {Object} */ (this.getComplexOption('tagSettings', 'background'));
  tagSettings['padding'] = /** @type {Object} */ (this.getComplexOption('tagSettings', 'padding'));
  for (i = 0; i < tags.length; i++) {
    tag = new anychart.core.ui.Label();
    this.eventsHandler.listen(tag, acgraph.events.EventType.CLICK, this.handleMouseClick_);
    tag.setup(tagSettings);
    tag.getRootLayer().cursor(acgraph.vector.Cursor.POINTER);
    tag.container(this.rootLayer);
    tag.zIndex(1);
    tag.text(tags[i]);
    this.tagsElements.push(tag);
  }

  var background = /** @type {anychart.core.ui.Background} */(this.background());

  /**
   * @type {Object}
   */
  var margin;
  var marginRight, marginLeft, marginBottom, marginTop;
  var width;
  var itemHeight, itemMinHeight, itemMaxHeight;
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var listHeight = /** @type {number} */ (this.getOption(anychart.opt.HEIGHT));
    itemHeight = /** @type {number|string} */ (this.getComplexOption('itemSettings', anychart.opt.HEIGHT));
    itemHeight = anychart.utils.normalizeSize(itemHeight, listHeight);

    itemMinHeight = /** @type {number|string} */ (this.getComplexOption('itemSettings', anychart.opt.MIN_HEIGHT));
    itemMinHeight = anychart.utils.normalizeSize(itemMinHeight, listHeight);

    itemMaxHeight = /** @type {number|string} */ (this.getComplexOption('itemSettings', anychart.opt.MAX_HEIGHT));
    itemMaxHeight = anychart.utils.normalizeSize(itemMaxHeight, listHeight);

    width = /** @type {number} */ (this.getOption(anychart.opt.WIDTH));
    var height = Math.max(itemMinHeight, itemHeight);
    margin = /** @type {Object} */ (this.getComplexOption('imageSettings', anychart.opt.MARGIN));
    this.coords.image[anychart.opt.X] = anychart.utils.normalizeSize(margin.left, width) || 0;
    marginRight = anychart.utils.normalizeSize(margin.right, width) || 0;
    this.coords.image[anychart.opt.Y] = anychart.utils.normalizeSize(margin.top, height) || 0;

    var imageWidth = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getComplexOption('imageSettings', anychart.opt.SIZE)), width) || 0;
    this.imageElement.width(imageWidth);
    this.imageElement.height(imageWidth);
    var fullImageWidth = 0;
    var fullImageHeight = 0;
    if (imageSrc != '') {
      this.imageElement.clip(this.createClipForImage_());
      fullImageWidth = this.coords.image[anychart.opt.X] + imageWidth + marginRight;
      fullImageHeight = this.coords.image[anychart.opt.Y] + imageWidth + anychart.utils.normalizeSize(margin.bottom, height) || 0;
    }

    this.coords.name[anychart.opt.X] = 0;
    this.coords.name[anychart.opt.Y] = 0;
    this.coords.name[anychart.opt.HEIGHT] = 0;
    if (goog.isDefAndNotNull(this.getOption(anychart.opt.NAME))) {
      margin = /** @type {Object} */ (this.getComplexOption('nameSettings', anychart.opt.MARGIN));
      this.calculateCoordinates(this.nameElement, this.coords.name, fullImageWidth, margin, height);
    }

    this.coords.type[anychart.opt.Y] = this.coords.name[anychart.opt.Y] + this.coords.name[anychart.opt.HEIGHT];
    if (goog.isDefAndNotNull(this.getOption(anychart.opt.TYPE))) {
      margin = /** @type {Object} */ (this.getComplexOption('typeSettings', anychart.opt.MARGIN));
      this.calculateCoordinates(this.typeElement, this.coords.type, fullImageWidth, margin, height);
    }

    this.coords.description[anychart.opt.Y] = this.coords.type[anychart.opt.Y] + this.coords.type[anychart.opt.HEIGHT];
    if (goog.isDefAndNotNull(this.getOption(anychart.opt.DESCRIPTION))) {
      margin = /** @type {Object} */ (this.getComplexOption('descriptionSettings', anychart.opt.MARGIN));
      this.calculateCoordinates(this.descriptionElement, this.coords.description, fullImageWidth, margin, height);
    }

    var availableWidth = width - fullImageWidth;
    var offsetX = 0;
    var offsetY = this.coords.description[anychart.opt.Y] + this.coords.description[anychart.opt.HEIGHT];
    var tagsHeight = offsetY;
    if (this.tagsElements.length) {
      margin = /** @type {Object} */ (this.getComplexOption('tagSettings', anychart.opt.MARGIN));
      marginLeft = anychart.utils.normalizeSize(margin.left, width);
      marginRight = anychart.utils.normalizeSize(margin.right, width);
      marginBottom = anychart.utils.normalizeSize(margin.bottom, height) || 0;
      marginTop = anychart.utils.normalizeSize(margin.top, height) || 0;
      offsetX = fullImageWidth + marginLeft;
      offsetY += marginTop;

      var tagBounds;
      var atLeastOneInARow = false;
      for (i = 0; i < this.tagsElements.length; i++) {
        tag = /** @type {anychart.core.ui.Label} */ (this.tagsElements[i]);
        tagBounds = tag.getContentBounds();
        // offsetX - tagBounds.width + marginRight = right coord of current tag
        // fullImageWidth = right coord of image
        if (atLeastOneInARow && (offsetX + tagBounds.width + marginRight - fullImageWidth > availableWidth)) {
          offsetX = fullImageWidth + marginLeft;
          offsetY = offsetY + tagBounds.height + marginBottom + marginTop;
          atLeastOneInARow = false;
        }
        tag.offsetX(offsetX);
        tag.offsetY(offsetY);
        tag.draw();
        atLeastOneInARow = true;
        offsetX += tagBounds.width + marginRight + marginLeft;
      }
      tagsHeight = offsetY + tagBounds.height + marginBottom;
    }

    this.actualHeight_ = Math.max(fullImageHeight, tagsHeight);
    if (itemHeight) {
      this.actualHeight_ = Math.max(this.actualHeight_, itemHeight);
    }

    if (itemMinHeight && (this.actualHeight_ < itemMinHeight))
      this.actualHeight_ = itemMinHeight;

    if (itemMaxHeight && (this.actualHeight_ > itemMaxHeight))
      this.actualHeight_ = itemMaxHeight;

    this.bounds_ = anychart.math.rect(0, 0, width, this.actualHeight_);

    this.imageElement.setTransformationMatrix(1, 0, 0, 1, this.coords.image[anychart.opt.X], this.coords.image[anychart.opt.Y]);
    this.nameElement.setTransformationMatrix(1, 0, 0, 1, this.coords.name[anychart.opt.X], this.coords.name[anychart.opt.Y]);
    this.typeElement.setTransformationMatrix(1, 0, 0, 1, this.coords.type[anychart.opt.X], this.coords.type[anychart.opt.Y]);
    this.descriptionElement.setTransformationMatrix(1, 0, 0, 1, this.coords.description[anychart.opt.X], this.coords.description[anychart.opt.Y]);

    this.rootLayer.clip(this.bounds_);

    background.parentBounds(this.bounds_.clone());

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (!background.isConsistent()) {
    background.zIndex(0);
    if (this.enabled())
      background.container(this.rootLayer);
    background.draw();
  }

  this.rootLayer.setTransformationMatrix(1, 0, 0, 1, 0, this.offsetY_);

  if (manualSuspend) stage.resume();
  return this;
};
//endregion


//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.serialize = function() {
  var json = anychart.core.ui.resourceList.Item.base(this, 'serialize');
  json['background'] = this.background().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.setupByJSON = function(json) {
  anychart.core.ui.resourceList.Item.base(this, 'setupByJSON', json);
  this.background(json['background']);
};


/** @inheritDoc */
anychart.core.ui.resourceList.Item.prototype.disposeInternal = function() {
  // dispose all tags elements.
  goog.disposeAll(this.tagsElements);
  this.tagsElements = null;

  // dispose description
  goog.dispose(this.descriptionElement);
  this.descriptionElement = null;

  // dispose type
  goog.dispose(this.typeElement);
  this.typeElement = null;

  // dispose name
  goog.dispose(this.nameElement);
  this.nameElement = null;

  // dispose image
  goog.dispose(this.imageElement);
  this.imageElement = null;

  // dispose background
  goog.dispose(this.background_);
  this.background_ = null;

  // dispose root layer
  goog.dispose(this.rootLayer);
  this.rootLayer = null;

  anychart.core.ui.resourceList.Item.base(this, 'disposeInternal');
};
//endregion
