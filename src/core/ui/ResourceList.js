goog.provide('anychart.charts.Resource');
goog.provide('anychart.core.ui.ResourceList');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.resourceList.ImageSettings');
goog.require('anychart.core.ui.resourceList.Item');
goog.require('anychart.core.ui.resourceList.ItemsSettings');
goog.require('anychart.core.ui.resourceList.TagsSettings');
goog.require('anychart.core.ui.resourceList.TextSettings');
goog.require('anychart.core.utils.Space');
goog.require('anychart.opt');
goog.require('anychart.utils');



/**
 * Fake chart.
 * @constructor
 */
anychart.charts.Resource = function() {
};



/**
 * Resource list constructor.
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @implements {anychart.core.IStandaloneBackend}
 * @extends {anychart.core.VisualBase}
 * @constructor
 */
anychart.core.ui.ResourceList = function() {
  anychart.core.ui.ResourceList.base(this, 'constructor');

  /**
   * Root layer of resource list.
   * Contains background and layer with items.
   * @type {acgraph.vector.Layer}
   */
  this.rootLayer = null;

  /**
   * Layer with resource items.
   * @type {acgraph.vector.Layer}
   */
  this.itemsLayer = null;

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
   * Resource items pool.
   * @type {Array.<anychart.core.ui.resourceList.Item>}
   * @private
   */
  this.itemsPool_ = [];

  /**
   * Items that are used in drawing.
   * @type {Array.<anychart.core.ui.resourceList.Item>}
   * @private
   */
  this.items_ = [];

  /**
   * Ratio of scroll.
   * @type {number}
   * @private
   */
  this.scrollY_ = 0;

  /**
   * Items height sum.
   * @type {number}
   * @private
   */
  this.sumItemsHeight_ = 0;

  /**
   * All settings state.
   * @type {number}
   * @private
   */
  this.ALL_SETTINGS_ =
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS;
};
goog.inherits(anychart.core.ui.ResourceList, anychart.core.VisualBase);


//region --- STATES/SIGNALS ---
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.ResourceList.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.ui.ResourceList.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND |
    anychart.ConsistencyState.RESOURCE_LIST_ITEMS |
    anychart.ConsistencyState.RESOURCE_LIST_SCROLL |
    anychart.ConsistencyState.RESOURCE_LIST_DATA |
    anychart.ConsistencyState.RESOURCE_LIST_ITEMS_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS;
//endregion


//region --- IObjectWithSettings IMPLEMENTATION ---
/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.check = function(flags) {
  return true;
};


/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.getOption = function(name) {
  return goog.isDef(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.settings[name]);
};


/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};
//endregion


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.ResourceList.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  map[anychart.opt.WIDTH] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.WIDTH,
      anychart.core.settings.numberOrPercentNormalizer,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.HEIGHT] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.HEIGHT,
      anychart.core.settings.numberOrPercentNormalizer,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);

  map[anychart.opt.DATA] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DATA,
      anychart.core.settings.asIsNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_DATA,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.ResourceList, anychart.core.ui.ResourceList.PROPERTY_DESCRIPTORS);


/**
 * Extracts settings form json by setting name ("image", "name", "type", "description", "tags").
 * @param {string} name Name of settings.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptor>} descriptors Descriptors.
 * @param {Object} json Object with settings.
 * @return {Object}
 */
anychart.core.ui.ResourceList.GET_SETTINGS = function(name, descriptors, json) {
  var settings = {};
  var postFix;
  var settingName;
  var propName;
  var i;

  if (name.length) {
    for (i in descriptors) {
      propName = descriptors[i].propName;
      postFix = propName.charAt(0).toUpperCase() + propName.substr(1);
      settingName = name + postFix;
      if (json.hasOwnProperty(settingName))
        settings[propName] = json[settingName];
    }
  } else {
    for (i in descriptors) {
      propName = descriptors[i].propName;
      if (json.hasOwnProperty(propName))
        settings[propName] = json[propName];
    }
  }

  return settings;
};
//endregion


//region --- OWN API ---
/**
 * Getter/setter for target.
 * @param {anychart.charts.Resource=} opt_value target.
 * @return {anychart.charts.Resource|anychart.core.ui.ResourceList} target or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.target = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.target_ != opt_value) {
      this.target_ = opt_value;
      this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.target_;
};


/**
 * Getter/setter for background.
 * @param {Object=} opt_value background.
 * @return {anychart.core.ui.Background|anychart.core.ui.ResourceList} background or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  } else {
    return this.background_;
  }
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} event Event.
 * @private
 */
anychart.core.ui.ResourceList.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Items settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.ResourceList.prototype.itemsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide settings for resource items.
 * As a setter accepts an object with settings for resource items.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.ui.resourceList.ItemsSettings|anychart.core.ui.ResourceList} Settings or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.items = function(opt_value) {
  if (!this.itemsSettings_) {
    this.itemsSettings_ = new anychart.core.ui.resourceList.ItemsSettings();
    this.itemsSettings_.listenSignals(this.itemsSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.itemsSettings_.setup(opt_value);
    return this;
  }
  return this.itemsSettings_;
};


/**
 * Images settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.ResourceList.prototype.imagesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide settings for resource item images.
 * As a setter accepts an object with settings for resource images.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.ui.resourceList.ImageSettings|anychart.core.ui.ResourceList} Settings or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.images = function(opt_value) {
  if (!this.imagesSettings_) {
    this.imagesSettings_ = new anychart.core.ui.resourceList.ImageSettings();
    this.imagesSettings_.listenSignals(this.imagesSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.imagesSettings_.setup(opt_value);
    return this;
  }
  return this.imagesSettings_;
};


/**
 * Names settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.ResourceList.prototype.namesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item names.
 * As a setter accepts an object with text settings for resource names.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.ui.resourceList.TextSettings|anychart.core.ui.ResourceList} Settings or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.names = function(opt_value) {
  if (!this.namesSettings_) {
    this.namesSettings_ = new anychart.core.ui.resourceList.TextSettings();
    this.namesSettings_.listenSignals(this.namesSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.namesSettings_.setup(opt_value);
    return this;
  }
  return this.namesSettings_;
};


/**
 * Types settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.ResourceList.prototype.typesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item types.
 * As a setter accepts an object with text settings for resource types.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.ui.resourceList.TextSettings|anychart.core.ui.ResourceList} Settings or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.types = function(opt_value) {
  if (!this.typesSettings_) {
    this.typesSettings_ = new anychart.core.ui.resourceList.TextSettings();
    this.typesSettings_.listenSignals(this.typesSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.typesSettings_.setup(opt_value);
    return this;
  }
  return this.typesSettings_;
};


/**
 * Descriptions settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.ResourceList.prototype.descriptionsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item descriptions.
 * As a setter accepts an object with text settings for resource descriptions.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.ui.resourceList.TextSettings|anychart.core.ui.ResourceList} Settings or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.descriptions = function(opt_value) {
  if (!this.descriptionsSettings_) {
    this.descriptionsSettings_ = new anychart.core.ui.resourceList.TextSettings();
    this.descriptionsSettings_.listenSignals(this.descriptionsSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.descriptionsSettings_.setup(opt_value);
    return this;
  }
  return this.descriptionsSettings_;
};


/**
 * Tags settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.ResourceList.prototype.tagsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item tags.
 * As a setter accepts an object with text settings for resource tags.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.ui.resourceList.TagsSettings|anychart.core.ui.ResourceList} Settings or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.tags = function(opt_value) {
  if (!this.tagsSettings_) {
    this.tagsSettings_ = new anychart.core.ui.resourceList.TagsSettings();
    this.tagsSettings_.listenSignals(this.tagsSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.tagsSettings_.setup(opt_value);
    return this;
  }
  return this.tagsSettings_;
};


/**
 * Getter/setter for scrollY.
 * @param {number=} opt_value scrollY.
 * @return {number|anychart.core.ui.ResourceList} scrollY or self for chaining.
 */
anychart.core.ui.ResourceList.prototype.scrollY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scrollY_ != opt_value) {
      this.scrollY_ = opt_value;
      this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_SCROLL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.scrollY_;
};
//endregion


//region --- WORKING WITH ITEMS ---
/**
 * @param {number} index Index of an item.
 * @return {anychart.core.ui.resourceList.Item} Item.
 * @private
 */
anychart.core.ui.ResourceList.prototype.allocItem_ = function(index) {
  var item;
  if (this.items_[index]) {
    return this.items_[index];
  } else {
    item = this.itemsPool_.pop();
    if (!item)
      item = new anychart.core.ui.resourceList.Item();
    this.items_.push(item);
  }
  return item;
};


/**
 * Release item and returns it to the pool.
 * @param {anychart.core.ui.resourceList.Item} item Item.
 * @return {anychart.core.ui.ResourceList} Self for chaining.
 * @private
 */
anychart.core.ui.ResourceList.prototype.releaseItem_ = function(item) {
  item
      .suspendSignalsDispatching()
      .enabled(false)
      .resumeSignalsDispatching(false)
      .draw();
  this.itemsPool_.push(item);
  return this;
};


/**
 * Release items.
 * @param {number=} opt_start [0] From which index start to deinit.
 * @private
 */
anychart.core.ui.ResourceList.prototype.releaseItems_ = function(opt_start) {
  opt_start = opt_start || 0;
  while (this.items_.length != opt_start) {
    this.releaseItem_(this.items_.pop());
  }
};


/**
 * Prepares item to draw.
 * @param {anychart.core.ui.resourceList.Item} item Item.
 * @param {Object} itemData Item data.
 * @private
 * Item data. Json object with text, image, height, background settings for a resource item.
 * Also can contain enabled property.
 * E.g.
 * {
 *   image: "https://avatars0.githubusercontent.com/u/301098?v=3&s=460"
 *   name: 'Anton Kagakin',
 *   type: 'Software Developer',
 *   description: 'An unique and brilliant man, savior of mankind',
 *   tags: ['dev', 'js', 'clojure', 'python', 'ts']
 *
 *   imageWidth: "30%",
 *   imageBorderRadius: [10, 20],
 *   imageMargin: {},
 *
 *   nameFontColor: "red",
 *   typeFontStyle: "italic",
 *   descriptionFontSize: 6,
 *   tagsTextDecoration: "underline",
 *
 *   imagesMargin: {},
 *   nameMargin: {},
 *   typeMargin: {},
 *   descriptionMargin: {},
 *   tagsMargin: {},
 *   tagsPadding: {},
 *   tagsBackground: {
 *     fill: 'pink',
 *     stroke: 'none'
 *   },
 *
 *   enabled: true,
 *   height: null,
 *   minHeight: "20%",
 *   maxHeight: "50%",
 *   background: {
 *     fill: "red"
 *   }
 * }
 */
anychart.core.ui.ResourceList.prototype.prepareItem_ = function(item, itemData) {
  var itemSettings, imageSettings, nameSettings, typeSettings, descriptionSettings, tagSettings, enabled;

  itemSettings = anychart.core.ui.ResourceList.GET_SETTINGS('', anychart.core.ui.resourceList.ItemsSettings.PROPERTY_DESCRIPTORS, itemData);
  if (goog.isDef(itemData['background']))
    itemSettings['background'] = itemData['background'];
  item.setOption('itemSettings', itemSettings);

  imageSettings = anychart.core.ui.ResourceList.GET_SETTINGS(anychart.opt.IMAGE, anychart.core.ui.resourceList.ImageSettings.PROPERTY_DESCRIPTORS, itemData);
  if (goog.isDef(itemData['imageMargin']))
    imageSettings['margin'] = anychart.core.utils.Space.normalizeSpace(itemData['imageMargin']);
  item.setOption('imageSettings', imageSettings);

  nameSettings = anychart.core.ui.ResourceList.GET_SETTINGS(anychart.opt.NAME, anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS, itemData);
  if (goog.isDef(itemData['nameMargin']))
    nameSettings['margin'] = anychart.core.utils.Space.normalizeSpace(itemData['nameMargin']);
  item.setOption('nameSettings', nameSettings);

  typeSettings = anychart.core.ui.ResourceList.GET_SETTINGS(anychart.opt.TYPE, anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS, itemData);
  if (goog.isDef(itemData['typeMargin']))
    typeSettings['margin'] = anychart.core.utils.Space.normalizeSpace(itemData['typeMargin']);
  item.setOption('typeSettings', typeSettings);

  descriptionSettings = anychart.core.ui.ResourceList.GET_SETTINGS(anychart.opt.DESCRIPTION, anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS, itemData);
  if (goog.isDef(itemData['descriptionMargin']))
    descriptionSettings['margin'] = anychart.core.utils.Space.normalizeSpace(itemData['descriptionMargin']);
  item.setOption('descriptionSettings', descriptionSettings);

  tagSettings = anychart.core.ui.ResourceList.GET_SETTINGS(anychart.opt.TAGS, anychart.core.ui.resourceList.TextSettings.PROPERTY_DESCRIPTORS, itemData);
  if (goog.isDef(itemData['tagsMargin']))
    tagSettings['margin'] = anychart.core.utils.Space.normalizeSpace(itemData['tagsMargin']);
  if (goog.isDef(itemData['tagsPadding']))
    tagSettings['padding'] = anychart.core.utils.Space.normalizeSpace(itemData['tagsPadding']);
  if (goog.isDef(itemData['tagsBackground']))
    tagSettings['background'] = itemData['tagsBackground'];
  item.setOption('tagSettings', tagSettings);

  // --- DATA ---
  item.setOption(anychart.opt.WIDTH, this.width_);
  item.setOption(anychart.opt.HEIGHT, this.height_);
  item.setOption(anychart.opt.IMAGE_SRC, itemData['image'] || '');
  item.setOption(anychart.opt.NAME, itemData['name'] || null);
  item.setOption(anychart.opt.TYPE, itemData['type'] || null);
  item.setOption(anychart.opt.DESCRIPTION, itemData['description'] || null);
  var tags = itemData['tags'];
  tags = tags ? goog.isArray(tags) ? tags.slice() : [tags] : [];
  item.setOption(anychart.opt.TAGS, tags);

  enabled = itemData['enabled'];
  enabled = goog.isDef(enabled) && !isNaN(enabled) ? !!enabled : true;

  item
      .enabled(enabled)
      .setParentEventTarget(/** @type {anychart.core.ui.resourceList.TagsSettings} */ (this.tags()));
};


/**
 * Draws an item.
 * @param {anychart.core.ui.resourceList.Item} item Item.
 * @param {number} offsetY Y offset of an item.
 * @private
 */
anychart.core.ui.ResourceList.prototype.drawItem_ = function(item, offsetY) {
  item
      .suspendSignalsDispatching()
      .container(this.itemsLayer)
      .offsetY(offsetY)
      .resumeSignalsDispatching(false)
      .draw();
};


/**
 * Sets theme settings for an item.
 * @param {string} name Settings name.
 * @param {Object} settings Settings.
 * @private
 */
anychart.core.ui.ResourceList.prototype.setThemeSettingsForItem_ = function(name, settings) {
  for (var i = 0; i < this.items_.length; i++) {
    this.items_[i].setThemeOption(name, settings);
  }
};
//endregion


//region --- DRAWING ---
/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.remove = function() {
  if (this.rootLayer) this.rootLayer.parent(null);
};


/**
 * Draws resource list.
 * @return {anychart.core.ui.ResourceList} Self for chaining.
 */
anychart.core.ui.ResourceList.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();
  }

  if (!this.itemsLayer) {
    this.itemsLayer = this.rootLayer.layer();
    // should be higher than background
    this.itemsLayer.zIndex(1);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootLayer.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.rootLayer.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var parentBounds = this.parentBounds();
    var width = /** @type {number|string} */ (this.getOption(anychart.opt.WIDTH));
    var height = /** @type {number|string} */ (this.getOption(anychart.opt.HEIGHT));
    if (parentBounds) {
      this.width_ = anychart.utils.normalizeSize(width, parentBounds.width);
      this.height_ = anychart.utils.normalizeSize(height, parentBounds.height);
    } else {
      this.width_ = goog.isNull(width) ? 0 : anychart.utils.isPercent(width) ? 0 : width;
      this.height_ = goog.isNull(height) ? 0 : anychart.utils.isPercent(height) ? 0 : height;
    }
    this.bounds_ = anychart.math.rect(0, 0, /** @type {number} */ (this.width_), /** @type {number} */ (this.height_));

    this.rootLayer.clip(this.bounds_);

    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS | anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND)) {
    var background = /** @type {anychart.core.ui.Background} */(this.background());
    background.suspendSignalsDispatching();
    // should be always on the bottom
    background.zIndex(0);
    background.parentBounds(this.bounds_.clone());
    if (this.enabled())
      background.container(this.rootLayer);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND);
  }

  /** @type {anychart.core.ui.resourceList.Item} */
  var item;
  /** @type {Object} */
  var itemData;
  /** @type {Array.<Object>} */
  var items;
  var i;

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_DATA)) {
    items = /** @type {Array.<Object>} */ (this.getOption(anychart.opt.DATA));
    if (items && items.length) {
      if (items.length > this.items_.length)
        this.invalidate(this.ALL_SETTINGS_);
      for (i = 0; i < items.length; i++) {
        itemData = items[i];
        item = this.allocItem_(i);
        this.prepareItem_(item, itemData);
      }
      this.releaseItems_(items.length);
    }
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_DATA);
  }

  var itemSettings, imageSettings, nameSettings, typeSettings, descriptionSettings, tagSettings;

  if (this.hasInvalidationState(this.ALL_SETTINGS_)) {
    // since we serialize them and use as settings for item we should mark them consistent
    // to have an availability to handle changes (handle dispatching signal) on this objects.
    this.tags().background().markConsistent(anychart.ConsistencyState.ALL);
    this.items().background().markConsistent(anychart.ConsistencyState.ALL);
    itemSettings = this.items().serialize();
    imageSettings = this.images().serialize();
    nameSettings = this.names().serialize();
    typeSettings = this.types().serialize();
    descriptionSettings = this.descriptions().serialize();
    tagSettings = this.tags().serialize();

    for (i = 0; i < this.items_.length; i++) {
      item = this.items_[i];
      item.setThemeOption('itemSettings', itemSettings);
      item.setThemeOption('imageSettings', imageSettings);
      item.setThemeOption('nameSettings', nameSettings);
      item.setThemeOption('typeSettings', typeSettings);
      item.setThemeOption('descriptionSettings', descriptionSettings);
      item.setThemeOption('tagSettings', tagSettings);
    }
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(this.ALL_SETTINGS_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_ITEMS_SETTINGS)) {
    // since we serialize them and use as settings for item we should mark them consistent
    // to have an availability to handle changes (handle dispatching signal) on this objects.
    this.items().background().markConsistent(anychart.ConsistencyState.ALL);
    this.setThemeSettingsForItem_('itemSettings', this.items().serialize());
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_ITEMS_SETTINGS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS)) {
    this.setThemeSettingsForItem_('imageSettings', this.images().serialize());
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS)) {
    this.setThemeSettingsForItem_('nameSettings', this.names().serialize());
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS)) {
    this.setThemeSettingsForItem_('typeSettings', this.types().serialize());
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS)) {
    this.setThemeSettingsForItem_('descriptionSettings', this.descriptions().serialize());
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS)) {
    // since we serialize them and use as settings for item we should mark them consistent
    // to have an availability to handle changes (handle dispatching signal) on this objects.
    this.tags().background().markConsistent(anychart.ConsistencyState.ALL);
    this.setThemeSettingsForItem_('tagSettings', this.tags().serialize());
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_ITEMS)) {
    var offsetY = 0;
    for (i = 0; i < this.items_.length; i++) {
      item = this.items_[i];
      item.background(/** @type {Object} */ (item.getComplexOption('itemSettings', 'background')));
      item.setOption(anychart.opt.WIDTH, this.width_);
      item.setOption(anychart.opt.HEIGHT, this.height_);
      item.invalidate(anychart.ConsistencyState.BOUNDS);
      this.drawItem_(item, offsetY);
      offsetY += item.getActualHeight();
    }
    this.sumItemsHeight_ = offsetY;
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_SCROLL)) {
    var y = goog.math.clamp(/** @type {number} */ (this.scrollY()), 0, 1);
    var dh = Math.max(this.sumItemsHeight_ - this.height_, 0);
    this.itemsLayer.setTransformationMatrix(1, 0, 0, 1, 0, -(dh * y));
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_SCROLL);
  }

  if (manualSuspend) stage.resume();

  return this;
};
//endregion


//region --- SETUP / DISPOSE ---
/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.serialize = function() {
  var json = anychart.core.ui.ResourceList.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.ResourceList.PROPERTY_DESCRIPTORS, json);
  json['background'] = this.background().serialize();
  json['items'] = this.items().serialize();
  json['images'] = this.images().serialize();
  json['names'] = this.names().serialize();
  json['types'] = this.types().serialize();
  json['descriptions'] = this.descriptions().serialize();
  json['tags'] = this.tags().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.ResourceList.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.ui.ResourceList.PROPERTY_DESCRIPTORS, config);
  this.background().setupByJSON(config['background'], opt_default);
  this.items().setupByJSON(config['items'], opt_default);
  this.images().setupByJSON(config['images'], opt_default);
  this.names().setupByJSON(config['names'], opt_default);
  this.types().setupByJSON(config['types'], opt_default);
  this.descriptions().setupByJSON(config['descriptions'], opt_default);
  this.tags().setupByJSON(config['tags'], opt_default);
};


/** @inheritDoc */
anychart.core.ui.ResourceList.prototype.disposeInternal = function() {
  // disposing items pool
  goog.disposeAll(this.itemsPool_);

  // disposing items
  goog.disposeAll(this.items_);

  // disposing layer with items.
  goog.dispose(this.itemsLayer);
  this.itemsLayer = null;

  // disposing background of resource list
  goog.dispose(this.background_);
  this.background_ = null;

  // disposing root layer of the resource list
  goog.dispose(this.rootLayer);
  this.rootLayer = null;

  //disposing items background settings
  goog.dispose(this.itemsBackground_);
  this.itemsBackground_ = null;

  // disposing images settings
  goog.dispose(this.imagesSettings_);
  this.imagesSettings_ = null;

  // disposing names text settings
  goog.dispose(this.namesSettings_);
  this.namesSettings_ = null;

  // disposing types text settings
  goog.dispose(this.typesSettings_);
  this.typesSettings_ = null;

  // disposing descriptions text settings
  goog.dispose(this.descriptionsSettings_);
  this.descriptionsSettings_ = null;

  // disposing tags text settings
  goog.dispose(this.tagsSettings_);
  this.tagsSettings_ = null;

  anychart.core.ui.ResourceList.base(this, 'disposeInternal');
};
//endregion


//region --- EXPORTS ---
//exports
//anychart.core.ui.ResourceList.prototype['width'] = anychart.core.ui.ResourceList.prototype.width;
//anychart.core.ui.ResourceList.prototype['height'] = anychart.core.ui.ResourceList.prototype.height;
//anychart.core.ui.ResourceList.prototype['data'] = anychart.core.ui.ResourceList.prototype.data;
anychart.core.ui.ResourceList.prototype['target'] = anychart.core.ui.ResourceList.prototype.target;
anychart.core.ui.ResourceList.prototype['background'] = anychart.core.ui.ResourceList.prototype.background;
anychart.core.ui.ResourceList.prototype['items'] = anychart.core.ui.ResourceList.prototype.items;
anychart.core.ui.ResourceList.prototype['images'] = anychart.core.ui.ResourceList.prototype.images;
anychart.core.ui.ResourceList.prototype['names'] = anychart.core.ui.ResourceList.prototype.names;
anychart.core.ui.ResourceList.prototype['types'] = anychart.core.ui.ResourceList.prototype.types;
anychart.core.ui.ResourceList.prototype['descriptions'] = anychart.core.ui.ResourceList.prototype.descriptions;
anychart.core.ui.ResourceList.prototype['tags'] = anychart.core.ui.ResourceList.prototype.tags;
anychart.core.ui.ResourceList.prototype['scrollY'] = anychart.core.ui.ResourceList.prototype.scrollY;
//endregion
