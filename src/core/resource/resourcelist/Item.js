goog.provide('anychart.core.resource.resourceList.Item');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Label');



/**
 * Class representing item in resource list.
 * @param {anychart.core.resource.ResourceList} resourceList
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @extends {anychart.core.VisualBase}
 */
anychart.core.resource.resourceList.Item = function(resourceList) {
  anychart.core.resource.resourceList.Item.base(this, 'constructor');

  /**
   * Resource list reference
   * @type {anychart.core.resource.ResourceList}
   * @private
   */
  this.resourceList_ = resourceList;

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
   * Contains all resource elements such as
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

  /**
   * Index.
   * @type {number}
   */
  this.index = NaN;
};
goog.inherits(anychart.core.resource.resourceList.Item, anychart.core.VisualBase);


//region --- STATES/SIGNALS ---
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.resourceList.Item.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.resource.resourceList.Item.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES;
//endregion


//region --- IObjectWithSettings IMPLEMENTATION ---
/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.check = function(flags) {
  return true;
};


/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.getOption = function(name) {
  return goog.isDef(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.settings[name]);
};


/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};
//endregion


//region --- ADDITIONAL SETTINGS METHODS ---
/**
 * Sets default value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.resource.resourceList.Item.prototype.setThemeOption = function(name, value) {
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
anychart.core.resource.resourceList.Item.prototype.getComplexOption = function(name, path) {
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
anychart.core.resource.resourceList.Item.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map['width'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'width',
      anychart.core.settings.numberOrPercentNormalizer,
      0,
      0);

  map['imageSrc'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'imageSrc',
      anychart.core.settings.stringNormalizer,
      0,
      0);

  map['name'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'name',
      anychart.core.settings.asIsNormalizer,
      0,
      0);

  map['type'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'type',
      anychart.core.settings.asIsNormalizer,
      0,
      0);

  map['description'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'description',
      anychart.core.settings.asIsNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  map['tags'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'tags',
      anychart.core.settings.arrayNormalizer,
      0,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.resource.resourceList.Item, anychart.core.resource.resourceList.Item.PROPERTY_DESCRIPTORS);
//endregion


//region --- SETTINGS ---
/**
 * Applies settings to elements.
 * @param {acgraph.vector.Text|acgraph.vector.Image} element
 * @param {Object} settings Settings.
 */
anychart.core.resource.resourceList.Item.prototype.applySettings = function(element, settings) {
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
anychart.core.resource.resourceList.Item.DEFAULT_TAG_LABEL_SETTINGS = {
  'position': 'leftTop',
  'anchor': 'leftTop',
  'rotation': 0
};

//endregion


//region --- BOUNDS ---
/**
 * Getter/setter for offsetY.
 * @param {string=} opt_value offsetY.
 * @return {string|anychart.core.resource.resourceList.Item} offsetY or self for chaining.
 */
anychart.core.resource.resourceList.Item.prototype.offsetY = function(opt_value) {
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
anychart.core.resource.resourceList.Item.prototype.getActualHeight = function() {
  if (!this.enabled()) return 0;
  return this.actualHeight_;
};


/**
 * Creates path to clip image.
 * @return {acgraph.vector.Rect}
 * @private
 */
anychart.core.resource.resourceList.Item.prototype.createClipForImage_ = function() {
  var width = /** @type {number} */ (this.imageElement.width());
  if (!this.rect_)
    this.rect_ = acgraph.rect(0, 0);
  this.rect_.setWidth(width).setHeight(width);

  var leftTop = 0;
  var rightTop = 0;
  var rightBottom = 0;
  var leftBottom = 0;

  var borderRadius = this.getComplexOption('imageSettings', 'borderRadius');
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
anychart.core.resource.resourceList.Item.prototype.calculateCoordinates = function(element, coords, fullImageWidth, margin, height) {
  var width = /** @type {number} */ (this.getOption('width'));
  var marginTop = anychart.utils.normalizeSize(margin.top, height) || 0;
  var marginRight = anychart.utils.normalizeSize(margin.right, width) || 0;
  var marginBottom = anychart.utils.normalizeSize(margin.bottom, height) || 0;
  var marginLeft = anychart.utils.normalizeSize(margin.left, width) || 0;

  coords['x'] = fullImageWidth + marginLeft;
  coords['y'] += marginTop;
  var textWidth = width - coords['x'] - marginRight;
  element.width(textWidth);
  coords['height'] = element.getHeight() + marginBottom;
};
//endregion


//region --- EVENTS HANDLING---
/**
 * Click handler.
 * @param {Object} event
 * @return {boolean}
 * @private
 */
anychart.core.resource.resourceList.Item.prototype.handleMouseClick_ = function(event) {
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
anychart.core.resource.resourceList.Item.prototype.remove = function() {
  if (this.rootLayer) this.rootLayer.parent(null);
};


/**
 * Draws resource item.
 * @return {anychart.core.resource.resourceList.Item} Self for chaining.
 */
anychart.core.resource.resourceList.Item.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
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

  var imageSrc = /** @type {string} */ (this.getOption('imageSrc'));
  this.imageElement.src(imageSrc);

  this.applySettings(this.imageElement, /** @type {Object} */ (this.getComplexOption('imageSettings', [])));

  var name = /** @type {string} */ (this.getOption('name'));
  if (!!this.getComplexOption('nameSettings', 'useHtml'))
    this.nameElement.htmlText(name);
  else
    this.nameElement.text(name);
  this.applySettings(this.nameElement, /** @type {Object} */ (this.getComplexOption('nameSettings', [])));

  var type = /** @type {string} */ (this.getOption('type'));
  if (!!this.getComplexOption('typeSettings', 'useHtml'))
    this.typeElement.htmlText(type);
  else
    this.typeElement.text(type);
  this.applySettings(this.typeElement, /** @type {Object} */ (this.getComplexOption('typeSettings', [])));

  var description = /** @type {string} */ (this.getOption('description'));
  if (!!this.getComplexOption('descriptionSettings', 'useHtml'))
    this.descriptionElement.htmlText(description);
  else
    this.descriptionElement.text(description);
  this.applySettings(this.descriptionElement, /** @type {Object} */ (this.getComplexOption('descriptionSettings', [])));

  var tags = /** @type {Array} */ (this.getOption('tags'));
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

  /**
   * @type {Object}
   */
  var margin;
  var marginRight, marginLeft, marginBottom, marginTop;
  var width;
  var itemHeight, itemMinHeight, itemMaxHeight;
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var listHeight = /** @type {number} */ (this.getOption('height'));
    itemHeight = this.resourceList_.getItemHeight(this, listHeight);

    itemMinHeight = this.resourceList_.getMinItemHeight(this, listHeight);
    itemMaxHeight = this.resourceList_.getMaxItemHeight(this, listHeight);

    width = /** @type {number} */ (this.getOption('width'));
    if (!isNaN(itemHeight)) {
      if (!isNaN(itemMaxHeight))
        itemHeight = Math.min(itemHeight, itemMaxHeight);
      if (!isNaN(itemMinHeight))
        itemHeight = Math.max(itemHeight, itemMinHeight);
    }
    margin = /** @type {Object} */ (this.getComplexOption('imageSettings', 'margin'));
    this.coords.image['x'] = anychart.utils.normalizeSize(margin.left, width) || 0;
    marginRight = anychart.utils.normalizeSize(margin.right, width) || 0;
    this.coords.image['y'] = anychart.utils.normalizeSize(margin.top, itemHeight) || 0;

    var imageWidth = anychart.utils.normalizeSize(/** @type {number|string} */ (this.getComplexOption('imageSettings', 'size')), width) || 0;
    this.imageElement.width(imageWidth);
    this.imageElement.height(imageWidth);
    var fullImageWidth = 0;
    var fullImageHeight = 0;
    if (imageSrc != '') {
      this.imageElement.clip(this.createClipForImage_());
      fullImageWidth = this.coords.image['x'] + imageWidth + marginRight;
      fullImageHeight = this.coords.image['y'] + imageWidth + anychart.utils.normalizeSize(margin.bottom, itemHeight) || 0;
    }

    this.coords.name['x'] = 0;
    this.coords.name['y'] = 0;
    this.coords.name['height'] = 0;
    if (goog.isDefAndNotNull(this.getOption('name'))) {
      margin = /** @type {Object} */ (this.getComplexOption('nameSettings', 'margin'));
      this.calculateCoordinates(this.nameElement, this.coords.name, fullImageWidth, margin, itemHeight);
    }

    this.coords.type['y'] = this.coords.name['y'] + this.coords.name['height'];
    if (goog.isDefAndNotNull(this.getOption('type'))) {
      margin = /** @type {Object} */ (this.getComplexOption('typeSettings', 'margin'));
      this.calculateCoordinates(this.typeElement, this.coords.type, fullImageWidth, margin, itemHeight);
    }

    this.coords.description['y'] = this.coords.type['y'] + this.coords.type['height'];
    if (goog.isDefAndNotNull(this.getOption('description'))) {
      margin = /** @type {Object} */ (this.getComplexOption('descriptionSettings', 'margin'));
      this.calculateCoordinates(this.descriptionElement, this.coords.description, fullImageWidth, margin, itemHeight);
    }

    var availableWidth = width - fullImageWidth;
    var offsetX = 0;
    var offsetY = this.coords.description['y'] + this.coords.description['height'];
    var tagsHeight = offsetY;
    if (this.tagsElements.length) {
      margin = /** @type {Object} */ (this.getComplexOption('tagSettings', 'margin'));
      marginLeft = anychart.utils.normalizeSize(margin.left, width);
      marginRight = anychart.utils.normalizeSize(margin.right, width);
      marginBottom = anychart.utils.normalizeSize(margin.bottom, itemHeight) || 0;
      marginTop = anychart.utils.normalizeSize(margin.top, itemHeight) || 0;
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

    if (isNaN(itemHeight)) {
      this.actualHeight_ = Math.max(fullImageHeight, tagsHeight);
      if (!isNaN(itemMaxHeight))
        this.actualHeight_ = Math.min(this.actualHeight_, itemMaxHeight);
      if (!isNaN(itemMinHeight))
        this.actualHeight_ = Math.max(this.actualHeight_, itemMinHeight);
    } else {
      this.actualHeight_ = itemHeight;
    }

    this.bounds_ = anychart.math.rect(0, 0, width, this.actualHeight_);

    this.imageElement.setTransformationMatrix(1, 0, 0, 1, this.coords.image['x'], this.coords.image['y']);
    this.nameElement.setTransformationMatrix(1, 0, 0, 1, this.coords.name['x'], this.coords.name['y']);
    this.typeElement.setTransformationMatrix(1, 0, 0, 1, this.coords.type['x'], this.coords.type['y']);
    this.descriptionElement.setTransformationMatrix(1, 0, 0, 1, this.coords.description['x'], this.coords.description['y']);

    this.rootLayer.clip(this.bounds_);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  this.rootLayer.setTransformationMatrix(1, 0, 0, 1, 0, this.offsetY_);

  if (manualSuspend) stage.resume();
  return this;
};
//endregion


//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.serialize = function() {
  return anychart.core.resource.resourceList.Item.base(this, 'serialize');
};


/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.setupByJSON = function(json, opt_default) {
  anychart.core.resource.resourceList.Item.base(this, 'setupByJSON', json, opt_default);
};


/** @inheritDoc */
anychart.core.resource.resourceList.Item.prototype.disposeInternal = function() {
  this.resourceList_ = null;

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

  // dispose root layer
  goog.dispose(this.rootLayer);
  this.rootLayer = null;

  anychart.core.resource.resourceList.Item.base(this, 'disposeInternal');
};
//endregion
