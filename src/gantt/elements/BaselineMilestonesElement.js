goog.provide('anychart.ganttModule.elements.BaselineMilestonesElement');
goog.provide('anychart.ganttModule.elements.BaselineMilestonesElement.Preview');

//region -- Requirements.
goog.require('anychart.core.settings');
goog.require('anychart.ganttModule.elements.TimelineElement');



//endregion
//region -- Constructor.
/**
 * Base element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.elements.BaselineMilestonesElement = function(timeline) {
  anychart.ganttModule.elements.BaselineMilestonesElement.base(this, 'constructor', timeline);

  /**
   * Preview element.
   * @type {anychart.ganttModule.elements.BaselineMilestonesElement.Preview}
   * @private
   */
  this.preview_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['markerType', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.ganttModule.elements.BaselineMilestonesElement, anychart.ganttModule.elements.TimelineElement);


//endregion
//region -- Optimized props descriptors
/**
 * Simple descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.BaselineMilestonesElement.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'markerType', anychart.enums.normalizeMarkerType]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.BaselineMilestonesElement, anychart.ganttModule.elements.BaselineMilestonesElement.DESCRIPTORS);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.BASELINE_MILESTONES;
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.getPaletteNormalFill = function() {
  return this.getPalette().itemAt(8);
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.getPaletteNormalStroke = function() {
  return anychart.color.darken(this.getPalette().itemAt(8));
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.getPointSettingsResolutionOrder = function() {
  return this.pointSettingsResolution || (this.pointSettingsResolution = [this.getType()]);
};


//endregion
//region -- Preview element.
/**
 *
 * @param {Object=} opt_value - Config object.
 * @return {anychart.ganttModule.elements.BaselineMilestonesElement|anychart.ganttModule.elements.BaselineMilestonesElement.Preview} - .
 */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.preview = function(opt_value) {
  if (this.getType() == anychart.enums.TLElementTypes.BASELINE_MILESTONES_PREVIEW)
    return null;
  if (!this.preview_) {
    this.preview_ = new anychart.ganttModule.elements.BaselineMilestonesElement.Preview(this.getTimeline());
    this.setupCreated('preview', this.preview_);
    this.preview_.setupStateSettings();
    this.preview_.parent(this);
  }

  if (goog.isDef(opt_value)) {
    this.preview_.setup(opt_value);
    return this;
  }
  return this.preview_;
};


//endregion
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.BaselineMilestonesElement.base(this, 'serialize');
  if (this.getType() == anychart.enums.TLElementTypes.BASELINE_MILESTONES)
    json['preview'] = this.preview().serialize();
  return json;
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.BaselineMilestonesElement.base(this, 'setupByJSON', config, opt_default);
  if (this.getType() == anychart.enums.TLElementTypes.BASELINE_MILESTONES) {
    this.preview().setupInternal(!!opt_default, config['preview']);
  }
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.ganttModule.elements.BaselineMilestonesElement.prototype.disposeInternal = function() {
  goog.disposeAll(this.preview_);
  anychart.ganttModule.elements.BaselineMilestonesElement.base(this, 'disposeInternal');
};



//endregion
//region -- BaselineMilestonesElement.Preview Constructor.
/**
 * Milestone preview element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @extends {anychart.ganttModule.elements.BaselineMilestonesElement}
 */
anychart.ganttModule.elements.BaselineMilestonesElement.Preview = function(timeline) {
  anychart.ganttModule.elements.BaselineMilestonesElement.Preview.base(this, 'constructor', timeline);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['depth', 0, anychart.Signal.NEEDS_REDRAW],
    ['drawOnCollapsedOnly', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.ganttModule.elements.BaselineMilestonesElement.Preview, anychart.ganttModule.elements.BaselineMilestonesElement);


//endregion
//region -- Optimized props descriptors
/**
 * Simple descriptors.
 * @type {!Object.<anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.BaselineMilestonesElement.Preview.DESCRIPTORS = (function() {
  /** @type {!Object.<anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'depth', anychart.core.settings.numberOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'drawOnCollapsedOnly', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.BaselineMilestonesElement.Preview, anychart.ganttModule.elements.BaselineMilestonesElement.Preview.DESCRIPTORS);


//endregion
//region -- Inherited API.
/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.Preview.prototype.getType = function() {
  return anychart.enums.TLElementTypes.BASELINE_MILESTONES_PREVIEW;
};


/** @inheritDoc */
anychart.ganttModule.elements.BaselineMilestonesElement.Preview.prototype.getPointSettingsResolutionOrder = function() {
  if (!this.pointSettingsResolution) {
    this.pointSettingsResolution = [this.getType()];
    this.pointSettingsResolution.push.apply(this.pointSettingsResolution, this.parent().getPointSettingsResolutionOrder());
  }
  return this.pointSettingsResolution;
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.elements.BaselineMilestonesElement.Preview.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.BaselineMilestonesElement.Preview.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.elements.BaselineMilestonesElement.Preview.DESCRIPTORS, config, opt_default);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.BaselineMilestonesElement.Preview.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.BaselineMilestonesElement.Preview.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.elements.BaselineMilestonesElement.Preview.DESCRIPTORS, json, void 0, void 0, true);
  return json;
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.elements.BaselineMilestonesElement.prototype;
  proto['preview'] = proto.preview;

  //real juking.
  proto = anychart.ganttModule.elements.BaselineMilestonesElement.Preview.prototype;
  proto['preview'] = undefined;
})();


//endregion

