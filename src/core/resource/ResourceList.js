//region --- Provide & Require
goog.provide('anychart.core.resource.ResourceList');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.resource.resourceList.ImageSettings');
goog.require('anychart.core.resource.resourceList.Item');
goog.require('anychart.core.resource.resourceList.TagsSettings');
goog.require('anychart.core.resource.resourceList.TextSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.Overlay');
goog.require('anychart.core.utils.Space');
//endregion



/**
 * Resource list constructor.
 * @implements {anychart.core.IStandaloneBackend}
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @extends {anychart.core.VisualBaseWithBounds}
 * @constructor
 */
anychart.core.resource.ResourceList = function() {
  anychart.core.resource.ResourceList.base(this, 'constructor');

  this.overlay_ = new anychart.core.ui.Overlay();
  this.overlay_.listenSignals(this.overlaySignal_, this);

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
   * @type {Array.<anychart.core.resource.resourceList.Item>}
   * @private
   */
  this.itemsPool_ = [];

  /**
   * Items that are used in drawing.
   * @type {Array.<anychart.core.resource.resourceList.Item>}
   * @private
   */
  this.items_ = [];

  /**
   * Ratio of scroll.
   * @type {number}
   * @private
   */
  this.yScrollPosition_ = 0;

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
      anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS |
      anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS;
};
goog.inherits(anychart.core.resource.ResourceList, anychart.core.VisualBaseWithBounds);


//region --- Infrastructure
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.resource.ResourceList.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.core.resource.ResourceList.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND |
    anychart.ConsistencyState.RESOURCE_LIST_ITEMS |
    anychart.ConsistencyState.RESOURCE_LIST_SCROLL |
    anychart.ConsistencyState.RESOURCE_LIST_DATA |
    anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS |
    anychart.ConsistencyState.RESOURCE_LIST_OVERLAY;


//endregion
//region --- Properties
/**
 * Extracts settings form json by setting name ("image", "name", "type", "description", "tags").
 * @param {string} name Name of settings.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptor>} descriptors Descriptors.
 * @param {anychart.data.Iterator} iterator Object with settings.
 * @return {Object}
 */
anychart.core.resource.ResourceList.GET_SETTINGS = function(name, descriptors, iterator) {
  var settings = {};
  var postFix;
  var settingName;
  var propName;
  var i;
  var val;

  if (name.length) {
    for (i in descriptors) {
      propName = descriptors[i].propName;
      postFix = propName.charAt(0).toUpperCase() + propName.substr(1);
      settingName = name + postFix;
      val = iterator.get(settingName);
      if (goog.isDef(val))
        settings[propName] = val;
    }
  } else {
    for (i in descriptors) {
      propName = descriptors[i].propName;
      val = iterator.get(propName);
      if (goog.isDef(val))
        settings[propName] = val;
    }
  }

  return settings;
};


//endregion
//region --- Settings
/**
 * Properties that should be defined in anychart.core.resource.TimeLine prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.resource.ResourceList.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['oddFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'oddFill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['evenFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'evenFill',
      anychart.core.settings.fillNormalizer,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['drawTopLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawTopLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  map['drawRightLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawRightLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  map['drawBottomLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawBottomLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  map['drawLeftLine'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'drawLeftLine',
      anychart.core.settings.booleanNormalizer,
      anychart.ConsistencyState.RESOURCE_LIST_ITEMS,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.core.resource.ResourceList, anychart.core.resource.ResourceList.DESCRIPTORS);


//endregion
//region --- IObjectWithSettings impl
/**
 * Returns option value if it was set directly to the object.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.ResourceList.prototype.getOwnOption = function(name) {
  return this.settings[name];
};


/**
 * Returns true if the option value was set directly to the object.
 * @param {string} name
 * @return {boolean}
 */
anychart.core.resource.ResourceList.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]);
};


/**
 * Returns option value from the theme if any.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.ResourceList.prototype.getThemeOption = function(name) {
  return this.defaultSettings[name];
};


/**
 * Returns option value by priorities.
 * @param {string} name
 * @return {*}
 */
anychart.core.resource.ResourceList.prototype.getOption = function(name) {
  return goog.isDefAndNotNull(this.settings[name]) ? this.settings[name] : this.defaultSettings[name];
};


/**
 * Sets option value to the instance.
 * @param {string} name
 * @param {*} value
 */
anychart.core.resource.ResourceList.prototype.setOption = function(name, value) {
  this.settings[name] = value;
};


/**
 * Performs checks on the instance to determine whether the state should be invalidated after option change.
 * @param {number} flags
 * @return {boolean}
 */
anychart.core.resource.ResourceList.prototype.check = function(flags) {
  return true;
};


//endregion
//region --- Own API
/**
 * Getter/setter for target.
 * @param {anychart.charts.Resource=} opt_value target.
 * @return {anychart.charts.Resource|anychart.core.resource.ResourceList} target or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.target = function(opt_value) {
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
 * @return {anychart.core.ui.Background|anychart.core.resource.ResourceList} background or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.background = function(opt_value) {
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
anychart.core.resource.ResourceList.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Images settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.resource.ResourceList.prototype.imagesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide settings for resource item images.
 * As a setter accepts an object with settings for resource images.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.resource.resourceList.ImageSettings|anychart.core.resource.ResourceList} Settings or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.images = function(opt_value) {
  if (!this.imagesSettings_) {
    this.imagesSettings_ = new anychart.core.resource.resourceList.ImageSettings();
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
anychart.core.resource.ResourceList.prototype.namesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item names.
 * As a setter accepts an object with text settings for resource names.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.resource.resourceList.TextSettings|anychart.core.resource.ResourceList} Settings or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.names = function(opt_value) {
  if (!this.namesSettings_) {
    this.namesSettings_ = new anychart.core.resource.resourceList.TextSettings();
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
anychart.core.resource.ResourceList.prototype.typesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item types.
 * As a setter accepts an object with text settings for resource types.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.resource.resourceList.TextSettings|anychart.core.resource.ResourceList} Settings or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.types = function(opt_value) {
  if (!this.typesSettings_) {
    this.typesSettings_ = new anychart.core.resource.resourceList.TextSettings();
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
anychart.core.resource.ResourceList.prototype.descriptionsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item descriptions.
 * As a setter accepts an object with text settings for resource descriptions.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.resource.resourceList.TextSettings|anychart.core.resource.ResourceList} Settings or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.descriptions = function(opt_value) {
  if (!this.descriptionsSettings_) {
    this.descriptionsSettings_ = new anychart.core.resource.resourceList.TextSettings();
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
anychart.core.resource.ResourceList.prototype.tagsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item tags.
 * As a setter accepts an object with text settings for resource tags.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.core.resource.resourceList.TagsSettings|anychart.core.resource.ResourceList} Settings or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.tags = function(opt_value) {
  if (!this.tagsSettings_) {
    this.tagsSettings_ = new anychart.core.resource.resourceList.TagsSettings();
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
 * @return {number|anychart.core.resource.ResourceList} scrollY or self for chaining.
 */
anychart.core.resource.ResourceList.prototype.verticalScrollBarPosition = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = goog.math.clamp(anychart.utils.toNumber(opt_value), 0, 1);
    if (this.yScrollPosition_ != val) {
      this.yScrollPosition_ = val;
      this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_SCROLL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.yScrollPosition_;
};


/**
 * Overlay element.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.resource.ResourceList|anychart.core.ui.Overlay}
 */
anychart.core.resource.ResourceList.prototype.overlay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.overlay_.setup(opt_value);
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_OVERLAY, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.overlay_;
};


/**
 * Overlay signals handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.resource.ResourceList.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Working with items
/**
 * Returns data iterator.
 * @return {anychart.data.Iterator}
 * @protected
 */
anychart.core.resource.ResourceList.prototype.getIterator = function() {
  return this.target_ ? this.target_.getDataIterator() : null;
};


/**
 * Sets heights array.
 * @param {Array.<number>} value
 */
anychart.core.resource.ResourceList.prototype.setHeightsInternal = function(value) {
  this.heights_ = value;
};


/**
 * Returns item height.
 * @param {anychart.core.resource.resourceList.Item} item
 * @param {number} listHeight
 * @return {number}
 */
anychart.core.resource.ResourceList.prototype.getItemHeight = function(item, listHeight) {
  return this.heights_[item.index];
};


/**
 * Returns item min height.
 * @param {anychart.core.resource.resourceList.Item} item
 * @param {number} listHeight
 * @return {number}
 */
anychart.core.resource.ResourceList.prototype.getMinItemHeight = function(item, listHeight) {
  return NaN;
};


/**
 * Returns item max height.
 * @param {anychart.core.resource.resourceList.Item} item
 * @param {number} listHeight
 * @return {number}
 */
anychart.core.resource.ResourceList.prototype.getMaxItemHeight = function(item, listHeight) {
  return NaN;
};


/**
 * @param {number} index Index of an item.
 * @return {anychart.core.resource.resourceList.Item} Item.
 * @private
 */
anychart.core.resource.ResourceList.prototype.allocItem_ = function(index) {
  var item;
  if (this.items_[index]) {
    return this.items_[index];
  } else {
    item = this.itemsPool_.pop();
    if (!item)
      item = new anychart.core.resource.resourceList.Item(this);
    this.items_.push(item);
  }
  item.index = index;
  return item;
};


/**
 * Release item and returns it to the pool.
 * @param {anychart.core.resource.resourceList.Item} item Item.
 * @return {anychart.core.resource.ResourceList} Self for chaining.
 * @private
 */
anychart.core.resource.ResourceList.prototype.releaseItem_ = function(item) {
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
anychart.core.resource.ResourceList.prototype.releaseItems_ = function(opt_start) {
  opt_start = opt_start || 0;
  while (this.items_.length != opt_start) {
    this.releaseItem_(this.items_.pop());
  }
};


/**
 * Prepares item to draw.
 * @param {anychart.core.resource.resourceList.Item} item Item.
 * @param {anychart.data.Iterator} iterator Item data.
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
anychart.core.resource.ResourceList.prototype.prepareItem_ = function(item, iterator) {
  var itemSettings, imageSettings, nameSettings, typeSettings, descriptionSettings, tagSettings, enabled, tmp;

  imageSettings = anychart.core.resource.ResourceList.GET_SETTINGS('image', anychart.core.resource.resourceList.ImageSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('imageMargin');
  if (goog.isDef(tmp))
    imageSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('imageSettings', imageSettings);

  nameSettings = anychart.core.resource.ResourceList.GET_SETTINGS('name', anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('nameMargin');
  if (goog.isDef(tmp))
    nameSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('nameSettings', nameSettings);

  typeSettings = anychart.core.resource.ResourceList.GET_SETTINGS('type', anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('typeMargin');
  if (goog.isDef(tmp))
    typeSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('typeSettings', typeSettings);

  descriptionSettings = anychart.core.resource.ResourceList.GET_SETTINGS('description', anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('descriptionMargin');
  if (goog.isDef(tmp))
    descriptionSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('descriptionSettings', descriptionSettings);

  tagSettings = anychart.core.resource.ResourceList.GET_SETTINGS('tags', anychart.core.resource.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('tagsMargin');
  if (goog.isDef(tmp))
    tagSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  tmp = iterator.get('tagsPadding');
  if (goog.isDef(tmp))
    tagSettings['padding'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  tmp = iterator.get('tagsBackground');
  if (goog.isDef(tmp))
    tagSettings['background'] = tmp;
  item.setOption('tagSettings', tagSettings);

  // --- DATA ---
  item.setOption('width', this.boundsCache.width);
  item.setOption('height', this.boundsCache.height);
  item.setOption('imageSrc', iterator.get('image') || '');
  item.setOption('name', iterator.get('name') || null);
  item.setOption('type', iterator.get('type') || null);
  item.setOption('description', iterator.get('description') || null);
  var tags = iterator.get('tags');
  tags = tags ? goog.isArray(tags) ? tags.slice() : [tags] : [];
  item.setOption('tags', tags);

  enabled = iterator.get('enabled');
  enabled = goog.isDef(enabled) && !isNaN(enabled) ? !!enabled : true;

  item
      .enabled(enabled)
      .setParentEventTarget(/** @type {anychart.core.resource.resourceList.TagsSettings} */ (this.tags()));
};


/**
 * Draws an item.
 * @param {anychart.core.resource.resourceList.Item} item Item.
 * @param {number} offsetY Y offset of an item.
 * @private
 */
anychart.core.resource.ResourceList.prototype.drawItem_ = function(item, offsetY) {
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
anychart.core.resource.ResourceList.prototype.setThemeSettingsForItem_ = function(name, settings) {
  for (var i = 0; i < this.items_.length; i++) {
    this.items_[i].setThemeOption(name, settings);
  }
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.resource.ResourceList.prototype.remove = function() {
  if (this.rootLayer) this.rootLayer.parent(null);
};


/**
 * Draws resource list.
 * @return {anychart.core.resource.ResourceList} Self for chaining.
 */
anychart.core.resource.ResourceList.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (!this.rootLayer) {
    this.rootLayer = acgraph.layer();

    this.itemsLayer = this.rootLayer.layer();
    // should be higher than background
    this.itemsLayer.zIndex(1);

    this.itemsOddPath = this.itemsLayer.path();
    this.itemsOddPath.stroke(null);
    this.itemsOddPath.zIndex(0);

    this.itemsEvenPath = this.itemsLayer.path();
    this.itemsEvenPath.stroke(null);
    this.itemsEvenPath.zIndex(0);

    this.itemsStrokePath = this.itemsLayer.path();
    this.itemsStrokePath.fill(null);
    this.itemsStrokePath.zIndex(1);
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
    this.boundsCache = this.getPixelBounds();
    this.rootLayer.clip(this.boundsCache);
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS |
        anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND |
        anychart.ConsistencyState.RESOURCE_LIST_SCROLL |
        anychart.ConsistencyState.RESOURCE_LIST_OVERLAY);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.itemsStrokePath
        .stroke(this.getOption('stroke'));
    this.itemsEvenPath
        .fill(this.getOption('evenFill'));
    this.itemsOddPath
        .fill(this.getOption('oddFill'));
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND)) {
    var background = /** @type {anychart.core.ui.Background} */(this.background());
    background.suspendSignalsDispatching();
    // should be always on the bottom
    background.zIndex(0);
    background.parentBounds(this.boundsCache.clone());
    if (this.enabled())
      background.container(this.rootLayer);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_OVERLAY)) {
    this.overlay_.target(this.container().getStage().getDomWrapper());
    this.overlay_.setBounds(this.getPixelBounds());
    this.overlay_.draw();
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_OVERLAY);
  }


  /** @type {anychart.core.resource.resourceList.Item} */
  var item;
  var i, itemsCount;

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_DATA)) {
    var iterator = this.getIterator();
    if (iterator.getRowsCount() > this.items_.length)
      this.invalidate(this.ALL_SETTINGS_);
    iterator.reset();
    while (iterator.advance()) {
      item = this.allocItem_(iterator.getIndex());
      this.prepareItem_(item, iterator);
    }
    this.releaseItems_(iterator.getRowsCount());
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_DATA);
  }

  var itemSettings, imageSettings, nameSettings, typeSettings, descriptionSettings, tagSettings;

  if (this.hasInvalidationState(this.ALL_SETTINGS_)) {
    // since we serialize them and use as settings for item we should mark them consistent
    // to have an availability to handle changes (handle dispatching signal) on this objects.
    this.tags().background().markConsistent(anychart.ConsistencyState.ALL);
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
    var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.itemsStrokePath.stroke()));

    var left = anychart.utils.applyPixelShift(0, thickness);
    var right = anychart.utils.applyPixelShift(this.boundsCache.width - thickness, thickness);
    var from, to, row;

    var offsetY = 0;
    var drawTop = !!this.getOption('drawTopLine');
    var drawRight = !!this.getOption('drawRightLine');
    var drawBottom = !!this.getOption('drawBottomLine');
    var drawLeft = !!this.getOption('drawLeftLine');

    from = anychart.utils.applyPixelShift(offsetY, thickness);
    var rowCount = this.items_.length;
    var lastRow = rowCount - 1;
    this.itemsStrokePath.clear();
    this.itemsEvenPath.clear();
    this.itemsOddPath.clear();

    for (row = 0; row < rowCount; row++) {
      var isLastRow = row == lastRow;
      item = this.items_[row];
      item.setOption('width', this.boundsCache.width);
      item.setOption('height', this.boundsCache.height);
      item.invalidate(anychart.ConsistencyState.BOUNDS);
      this.drawItem_(item, offsetY);
      var itemHeight = item.getActualHeight();

      to = anychart.utils.applyPixelShift(from + itemHeight - (row == rowCount - 1 ? thickness : 0), thickness);

      var l = drawLeft ? Math.ceil(left) : Math.floor(left);
      var r = drawRight ? Math.floor(right) : Math.ceil(right);
      var t = (drawTop && !row) ? Math.ceil(from) : Math.floor(from);
      var b = (drawBottom || !isLastRow) ? Math.floor(to) : Math.ceil(to);

      var path = !!(row & 1) ? this.itemsEvenPath : this.itemsOddPath;
      path
          .moveTo(l, t)
          .lineTo(r, t)
          .lineTo(r, b)
          .lineTo(l, b)
          .close();

      if (drawLeft)
        this.itemsStrokePath
            .moveTo(left, t)
            .lineTo(left, b);
      if (drawRight)
        this.itemsStrokePath
            .moveTo(right, t)
            .lineTo(right, b);
      if (drawTop && !row)
        this.itemsStrokePath
            .moveTo(l, from)
            .lineTo(r, from);
      if (drawBottom || !isLastRow)
        this.itemsStrokePath
            .moveTo(l, to)
            .lineTo(r, to);

      offsetY += itemHeight;
      from = to;
    }

    this.sumItemsHeight_ = offsetY;
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_ITEMS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.RESOURCE_LIST_SCROLL)) {
    this.itemsLayer.setTransformationMatrix(1, 0, 0, 1,
        this.boundsCache.left,
        Math.round(this.boundsCache.top - this.sumItemsHeight_ * this.yScrollPosition_));
    this.markConsistent(anychart.ConsistencyState.RESOURCE_LIST_SCROLL);
  }

  if (manualSuspend) stage.resume();

  return this;
};


//endregion
//region --- Serialization / Deserialization / Disposing
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.core.resource.ResourceList.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.defaultSettings, anychart.core.resource.ResourceList.DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.resource.ResourceList.prototype.serialize = function() {
  var json = anychart.core.resource.ResourceList.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.core.resource.ResourceList.DESCRIPTORS, json, 'Resource list');

  json['background'] = this.background().serialize();
  json['images'] = this.images().serialize();
  json['names'] = this.names().serialize();
  json['types'] = this.types().serialize();
  json['descriptions'] = this.descriptions().serialize();
  json['tags'] = this.tags().serialize();
  json['overlay'] = this.overlay_.serialize();
  return json;
};


/** @inheritDoc */
anychart.core.resource.ResourceList.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.resource.ResourceList.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.resource.ResourceList.DESCRIPTORS, config);
  }

  if ('background' in config)
    this.background(config['background']);

  this.images().setupByJSON(config['images'], opt_default);
  this.names().setupByJSON(config['names'], opt_default);
  this.types().setupByJSON(config['types'], opt_default);
  this.descriptions().setupByJSON(config['descriptions'], opt_default);
  this.tags().setupByJSON(config['tags'], opt_default);
  this.overlay().setupByVal(config['overlay'], opt_default);
};


/** @inheritDoc */
anychart.core.resource.ResourceList.prototype.disposeInternal = function() {
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

  // disposing overlay element
  goog.dispose(this.overlay_);
  this.overlay_ = null;

  anychart.core.resource.ResourceList.base(this, 'disposeInternal');
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.resource.ResourceList.prototype;
  proto['target'] = proto.target;
  proto['background'] = proto.background;
  proto['images'] = proto.images;
  proto['names'] = proto.names;
  proto['types'] = proto.types;
  proto['descriptions'] = proto.descriptions;
  proto['tags'] = proto.tags;
  proto['overlay'] = proto.overlay;
  // descriptors
  // proto['stroke'] = proto.stroke;
  // proto['evenFill'] = proto.evenFill;
  // proto['oddFill'] = proto.oddFill;
  // proto['drawTopLine'] = proto.drawTopLine;
  // proto['drawRightLine'] = proto.drawRightLine;
  // proto['drawBottomLine'] = proto.drawBottomLine;
  // proto['drawLeftLine'] = proto.drawLeftLine;
})();
//endregion
