//region --- Provide & Require
goog.provide('anychart.resourceModule.ResourceList');
goog.provide('anychart.standalones.ResourceList');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Space');
goog.require('anychart.data');
goog.require('anychart.ganttBaseModule.Overlay');
goog.require('anychart.resourceModule.resourceList.ImageSettings');
goog.require('anychart.resourceModule.resourceList.Item');
goog.require('anychart.resourceModule.resourceList.TagsSettings');
goog.require('anychart.resourceModule.resourceList.TextSettings');
goog.require('anychart.utils');
//endregion



/**
 * Resource list constructor.
 * @implements {anychart.core.IStandaloneBackend}
 * @extends {anychart.core.VisualBaseWithBounds}
 * @constructor
 */
anychart.resourceModule.ResourceList = function() {
  anychart.resourceModule.ResourceList.base(this, 'constructor');

  this.overlay_ = new anychart.ganttBaseModule.Overlay();
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
   * Resource items pool.
   * @type {Array.<anychart.resourceModule.resourceList.Item>}
   * @private
   */
  this.itemsPool_ = [];

  /**
   * Items that are used in drawing.
   * @type {Array.<anychart.resourceModule.resourceList.Item>}
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

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE],
    ['oddFill', anychart.ConsistencyState.APPEARANCE],
    ['evenFill', anychart.ConsistencyState.APPEARANCE],
    ['drawTopLine', anychart.ConsistencyState.RESOURCE_LIST_ITEMS],
    ['drawRightLine', anychart.ConsistencyState.RESOURCE_LIST_ITEMS],
    ['drawBottomLine', anychart.ConsistencyState.RESOURCE_LIST_ITEMS],
    ['drawLeftLine', anychart.ConsistencyState.RESOURCE_LIST_ITEMS]
  ]);
};
goog.inherits(anychart.resourceModule.ResourceList, anychart.core.VisualBaseWithBounds);


//region --- Infrastructure
/**
 * Supported signals.
 * @type {number}
 */
anychart.resourceModule.ResourceList.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.resourceModule.ResourceList.prototype.SUPPORTED_CONSISTENCY_STATES =
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
anychart.resourceModule.ResourceList.GET_SETTINGS = function(name, descriptors, iterator) {
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
 * Properties that should be defined in anychart.ganttBaseModule.TimeLineHeader prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.resourceModule.ResourceList.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'oddFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'evenFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawTopLine', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawRightLine', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawBottomLine', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawLeftLine', anychart.core.settings.booleanNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.resourceModule.ResourceList, anychart.resourceModule.ResourceList.DESCRIPTORS);


//endregion
//region --- IObjectWithSettings overrides
/** @inheritDoc */
anychart.resourceModule.ResourceList.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.resourceModule.ResourceList.prototype.getSignal = function(fieldName) {
  // because all descriptors invalidates with NEEDS_REDRAW signal
  return anychart.Signal.NEEDS_REDRAW;
};


//endregion
//region --- Own API
/**
 * Getter/setter for target.
 * @param {anychart.resourceModule.Chart=} opt_value target.
 * @return {anychart.resourceModule.Chart|anychart.resourceModule.ResourceList} target or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.target = function(opt_value) {
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
 * @return {anychart.core.ui.Background|anychart.resourceModule.ResourceList} background or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.background = function(opt_value) {
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
anychart.resourceModule.ResourceList.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Images settings invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.resourceModule.ResourceList.prototype.imagesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_IMAGES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide settings for resource item images.
 * As a setter accepts an object with settings for resource images.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.resourceModule.resourceList.ImageSettings|anychart.resourceModule.ResourceList} Settings or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.images = function(opt_value) {
  if (!this.imagesSettings_) {
    this.imagesSettings_ = new anychart.resourceModule.resourceList.ImageSettings();
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
anychart.resourceModule.ResourceList.prototype.namesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_NAMES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item names.
 * As a setter accepts an object with text settings for resource names.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.resourceModule.resourceList.TextSettings|anychart.resourceModule.ResourceList} Settings or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.names = function(opt_value) {
  if (!this.namesSettings_) {
    this.namesSettings_ = new anychart.resourceModule.resourceList.TextSettings();
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
anychart.resourceModule.ResourceList.prototype.typesSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_TYPES_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item types.
 * As a setter accepts an object with text settings for resource types.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.resourceModule.resourceList.TextSettings|anychart.resourceModule.ResourceList} Settings or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.types = function(opt_value) {
  if (!this.typesSettings_) {
    this.typesSettings_ = new anychart.resourceModule.resourceList.TextSettings();
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
anychart.resourceModule.ResourceList.prototype.descriptionsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DESCRIPTIONS_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item descriptions.
 * As a setter accepts an object with text settings for resource descriptions.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.resourceModule.resourceList.TextSettings|anychart.resourceModule.ResourceList} Settings or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.descriptions = function(opt_value) {
  if (!this.descriptionsSettings_) {
    this.descriptionsSettings_ = new anychart.resourceModule.resourceList.TextSettings();
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
anychart.resourceModule.ResourceList.prototype.tagsSettingsInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_TAGS_SETTINGS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * As a getter returns a class to provide text settings for resource item tags.
 * As a setter accepts an object with text settings for resource tags.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.resourceModule.resourceList.TagsSettings|anychart.resourceModule.ResourceList} Settings or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.tags = function(opt_value) {
  if (!this.tagsSettings_) {
    this.tagsSettings_ = new anychart.resourceModule.resourceList.TagsSettings();
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
 * @return {number|anychart.resourceModule.ResourceList} scrollY or self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.verticalScrollBarPosition = function(opt_value) {
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
 * @return {anychart.resourceModule.ResourceList|anychart.ganttBaseModule.Overlay}
 */
anychart.resourceModule.ResourceList.prototype.overlay = function(opt_value) {
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
anychart.resourceModule.ResourceList.prototype.overlaySignal_ = function(e) {
  this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_OVERLAY, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region --- Working with items
/**
 * Returns data iterator.
 * @return {anychart.data.Iterator}
 * @protected
 */
anychart.resourceModule.ResourceList.prototype.getIterator = function() {
  return this.target_ ? this.target_.getDataIterator() : null;
};


/**
 * Sets heights array.
 * @param {Array.<number>} value
 */
anychart.resourceModule.ResourceList.prototype.setHeightsInternal = function(value) {
  this.heights_ = value;
};


/**
 * Returns item height.
 * @param {anychart.resourceModule.resourceList.Item} item
 * @param {number} listHeight
 * @return {number}
 */
anychart.resourceModule.ResourceList.prototype.getItemHeight = function(item, listHeight) {
  return this.heights_[item.index];
};


/**
 * Returns item min height.
 * @param {anychart.resourceModule.resourceList.Item} item
 * @param {number} listHeight
 * @return {number}
 */
anychart.resourceModule.ResourceList.prototype.getMinItemHeight = function(item, listHeight) {
  return NaN;
};


/**
 * Returns item max height.
 * @param {anychart.resourceModule.resourceList.Item} item
 * @param {number} listHeight
 * @return {number}
 */
anychart.resourceModule.ResourceList.prototype.getMaxItemHeight = function(item, listHeight) {
  return NaN;
};


/**
 * @param {number} index Index of an item.
 * @return {anychart.resourceModule.resourceList.Item} Item.
 * @private
 */
anychart.resourceModule.ResourceList.prototype.allocItem_ = function(index) {
  var item;
  if (this.items_[index]) {
    return this.items_[index];
  } else {
    item = this.itemsPool_.pop();
    if (!item)
      item = new anychart.resourceModule.resourceList.Item(this);
    this.items_.push(item);
  }
  item.index = index;
  return item;
};


/**
 * Release item and returns it to the pool.
 * @param {anychart.resourceModule.resourceList.Item} item Item.
 * @return {anychart.resourceModule.ResourceList} Self for chaining.
 * @private
 */
anychart.resourceModule.ResourceList.prototype.releaseItem_ = function(item) {
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
anychart.resourceModule.ResourceList.prototype.releaseItems_ = function(opt_start) {
  opt_start = opt_start || 0;
  while (this.items_.length != opt_start) {
    this.releaseItem_(this.items_.pop());
  }
};


/**
 * Prepares item to draw.
 * @param {anychart.resourceModule.resourceList.Item} item Item.
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
anychart.resourceModule.ResourceList.prototype.prepareItem_ = function(item, iterator) {
  var imageSettings, nameSettings, typeSettings, descriptionSettings, tagSettings, enabled, tmp;

  imageSettings = anychart.resourceModule.ResourceList.GET_SETTINGS('image', anychart.resourceModule.resourceList.ImageSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('imageMargin');
  if (goog.isDef(tmp))
    imageSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('imageSettings', imageSettings);

  nameSettings = anychart.resourceModule.ResourceList.GET_SETTINGS('name', anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('nameMargin');
  if (goog.isDef(tmp))
    nameSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('nameSettings', nameSettings);

  typeSettings = anychart.resourceModule.ResourceList.GET_SETTINGS('type', anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('typeMargin');
  if (goog.isDef(tmp))
    typeSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('typeSettings', typeSettings);

  descriptionSettings = anychart.resourceModule.ResourceList.GET_SETTINGS('description', anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
  tmp = iterator.get('descriptionMargin');
  if (goog.isDef(tmp))
    descriptionSettings['margin'] = anychart.core.utils.Space.normalizeSpace(/** @type {(Object|Array|string|number)} */(tmp));
  item.setOption('descriptionSettings', descriptionSettings);

  tagSettings = anychart.resourceModule.ResourceList.GET_SETTINGS('tags', anychart.resourceModule.resourceList.TextSettings.PROPERTY_DESCRIPTORS, iterator);
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
      .setParentEventTarget(/** @type {anychart.resourceModule.resourceList.TagsSettings} */ (this.tags()));
};


/**
 * Draws an item.
 * @param {anychart.resourceModule.resourceList.Item} item Item.
 * @param {number} offsetY Y offset of an item.
 * @private
 */
anychart.resourceModule.ResourceList.prototype.drawItem_ = function(item, offsetY) {
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
anychart.resourceModule.ResourceList.prototype.setThemeSettingsForItem_ = function(name, settings) {
  for (var i = 0; i < this.items_.length; i++) {
    this.items_[i].setThemeOption(name, settings);
  }
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.resourceModule.ResourceList.prototype.remove = function() {
  if (this.rootLayer) this.rootLayer.parent(null);
};


/**
 * Draws resource list.
 * @return {anychart.resourceModule.ResourceList} Self for chaining.
 */
anychart.resourceModule.ResourceList.prototype.draw = function() {
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


  /** @type {anychart.resourceModule.resourceList.Item} */
  var item;
  var i;

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
anychart.resourceModule.ResourceList.prototype.setThemeSettings = function(config) {
  anychart.core.settings.copy(this.themeSettings, anychart.resourceModule.ResourceList.DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.resourceModule.ResourceList.prototype.serialize = function() {
  var json = anychart.resourceModule.ResourceList.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.resourceModule.ResourceList.DESCRIPTORS, json, 'Resource list');

  json['background'] = this.background().serialize();
  json['images'] = this.images().serialize();
  json['names'] = this.names().serialize();
  json['types'] = this.types().serialize();
  json['descriptions'] = this.descriptions().serialize();
  json['tags'] = this.tags().serialize();
  json['overlay'] = this.overlay().serialize();
  return json;
};


/** @inheritDoc */
anychart.resourceModule.ResourceList.prototype.setupByJSON = function(config, opt_default) {
  anychart.resourceModule.ResourceList.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.resourceModule.ResourceList.DESCRIPTORS, config, opt_default);

  this.background().setupInternal(!!opt_default, config['background']);
  this.images().setupInternal(!!opt_default, config['images']);
  this.names().setupInternal(!!opt_default, config['names']);
  this.types().setupInternal(!!opt_default, config['types']);
  this.descriptions().setupInternal(!!opt_default, config['descriptions']);
  this.tags().setupInternal(!!opt_default, config['tags']);
  this.overlay().setupInternal(!!opt_default, config['overlay']);
};


/** @inheritDoc */
anychart.resourceModule.ResourceList.prototype.disposeInternal = function() {
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

  anychart.resourceModule.ResourceList.base(this, 'disposeInternal');
};



//endregion
//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.resourceModule.ResourceList}
 */
anychart.standalones.ResourceList = function() {
  anychart.standalones.ResourceList.base(this, 'constructor');

  this.data(null);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['rowHeight', 0],
    ['minRowHeight', 0],
    ['maxRowHeight', 0]
  ]);
};
goog.inherits(anychart.standalones.ResourceList, anychart.resourceModule.ResourceList);
anychart.core.makeStandalone(anychart.standalones.ResourceList, anychart.resourceModule.ResourceList);


//region --- PROPERTIES ---
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.standalones.ResourceList.PROPERTY_DESCRIPTORS = (function() {
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'rowHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'minRowHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'maxRowHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.standalones.ResourceList, anychart.standalones.ResourceList.PROPERTY_DESCRIPTORS);


//endregion
/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.standalones.ResourceList.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.standalones.ResourceList.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.standalones.ResourceList.prototype.data_;


/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.standalones.ResourceList|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.standalones.ResourceList.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      // DATA is supported only in Bubble, so we invalidate only for it.
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.standalones.ResourceList.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.RESOURCE_LIST_DATA, anychart.Signal.NEEDS_REDRAW);
  }
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getIterator = function() {
  return this.data_ ? this.data_.getIterator() : null;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getItemHeight = function(item, listHeight) {
  var result = this.getOption('rowHeight');
  result = anychart.utils.normalizeSize(/** @type {number} */(result), listHeight);
  return result;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getMinItemHeight = function(item, listHeight) {
  var result = this.getOption('minRowHeight');
  result = anychart.utils.normalizeSize(/** @type {number} */(result), listHeight);
  return result;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.getMaxItemHeight = function(item, listHeight) {
  var result = this.getOption('maxRowHeight');
  result = anychart.utils.normalizeSize(/** @type {number} */(result), listHeight);
  return result;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.serialize = function() {
  var json = anychart.standalones.ResourceList.base(this, 'serialize');
  json['data'] = this.data_ ? this.data_.serialize() : null;
  return json;
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.setupByJSON = function(config, opt_default) {
  anychart.standalones.ResourceList.base(this, 'setupByJSON', config, opt_default);
  this.data(opt_default ? config['data'] : null);
};


/** @inheritDoc */
anychart.standalones.ResourceList.prototype.disposeInternal = function() {
  goog.dispose(this.parentViewToDispose_);
  this.parentViewToDispose_ = null;
  delete this.data_;
  this.rawData_ = null;
  anychart.standalones.ResourceList.base(this, 'disposeInternal');
};


/**
 * Constructor function.
 * @param {Array.<Object>=} opt_data Data items.
 * @return {!anychart.standalones.ResourceList}
 */
anychart.standalones.resourceList = function(opt_data) {
  var list = new anychart.standalones.ResourceList();
  list.setupByJSON(/** @type {!Object} */(anychart.getFullTheme('standalones.resourceList')), true);
  list['data'](opt_data);
  return list;
};


//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.resourceModule.ResourceList.prototype;
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

  proto = anychart.standalones.ResourceList.prototype;
  goog.exportSymbol('anychart.standalones.resourceList', anychart.standalones.resourceList);
  proto['data'] = proto.data;
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['verticalScrollBarPosition'] = proto.verticalScrollBarPosition;
})();
//endregion
