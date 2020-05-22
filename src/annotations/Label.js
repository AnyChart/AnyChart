goog.provide('anychart.annotationsModule.Label');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');



/**
 * Label annotation.
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.Base}
 */
anychart.annotationsModule.Label = function(chartController) {
  anychart.annotationsModule.Label.base(this, 'constructor', chartController);

  this.addThemes('defaultFontSettings');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS_META);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.LABEL_DESCRIPTORS_META);

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.ConsistencyState.APPEARANCE,
      anychart.Signal.NEEDS_REDRAW,
      anychart.Signal.NEEDS_REDRAW);
  delete this.descriptorsMeta['fontFamily'];
  delete this.descriptorsMeta['fontStyle'];
  delete this.descriptorsMeta['fontVariant'];
  delete this.descriptorsMeta['fontWeight'];
  delete this.descriptorsMeta['fontSize'];
  delete this.descriptorsMeta['fontColor'];
  delete this.descriptorsMeta['fontOpacity'];
};
goog.inherits(anychart.annotationsModule.Label, anychart.annotationsModule.Base);
anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.LABEL_DESCRIPTORS);
anychart.core.settings.populateAliases(anychart.annotationsModule.Label, ['fontFamily', 'fontStyle', 'fontVariant', 'fontWeight', 'fontSize', 'fontColor', 'fontOpacity', 'fontDecoration'], 'normal');
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.LABEL] = anychart.annotationsModule.Label;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Label.prototype.type = anychart.enums.AnnotationTypes.LABEL;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.Label.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.ONE_POINT;


/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.annotationsModule.Label|anychart.core.ui.Background)} Returns the background or itself for method chaining.
 */
anychart.annotationsModule.Label.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);

    this.setupCreated('background', this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.annotationsModule.Label|anychart.core.utils.Padding} .
 */
anychart.annotationsModule.Label.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);

    this.setupCreated('padding', this.padding_);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.annotationsModule.Label.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES,
        anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.annotationsModule.Label.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES,
        anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region State Settings
/** @inheritDoc */
anychart.annotationsModule.Label.prototype.getNormalDescriptorsMeta = function() {
  var base = anychart.annotationsModule.Label.base(this, 'getNormalDescriptorsMeta');
  return goog.array.concat(base, anychart.annotationsModule.LABEL_DESCRIPTORS_STATE_META);
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.setState = function(state) {
  anychart.annotationsModule.Label.base(this, 'setState', state);
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES);
};


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.annotationsModule.Label.prototype.resolveOption = function(name, state, normalizer) {
  var stateObject = state == 0 ? this.normal() : state == 1 ? this.hovered() : this.selected();

  var normalValue = this.normal().getOption(name);
  var value = !state ? normalValue : stateObject.getOption(name);
  return value || normalValue;
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.createPositionProviders = function() {
  var res = [];
  res.push(
      {
        'x': this.coords['xAnchor'],
        'y': this.coords['valueAnchor']
      },
      {
        'x': this.backgroundBounds.left,
        'y': this.backgroundBounds.top
      },
      {
        'x': this.backgroundBounds.getRight(),
        'y': this.backgroundBounds.top
      },
      {
        'x': this.backgroundBounds.getRight(),
        'y': this.backgroundBounds.getBottom()
      },
      {
        'x': this.backgroundBounds.left,
        'y': this.backgroundBounds.getBottom()
      }
  );
  return goog.array.map(res, function(item) {
    return {'value': item};
  });
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.checkVisible = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.ANNOTATIONS_SHAPES)) {
    this.applyTextSettings(this.state);
    this.calculateBounds_(0, 0);
  }
  var bounds = this.pixelBoundsCache;
  var width = Math.abs(this.backgroundBounds.width);
  var coord = this.coords['xAnchor'];
  var anchor = /** @type {anychart.enums.Anchor} */(this.getOption('anchor'));
  var left;
  var right;
  if (this.isLeftSideAnchor_(anchor)) {
    left = coord;
    right = coord + width;
  } else if (this.isCenterAnchor_(anchor)) {
    left = coord - width / 2;
    right = coord + width / 2;
  } else { // rightSideAnchor
    left = coord - width;
    right = coord;
  }
  return !((right < bounds.left) || (left > bounds.getRight()));
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.setMarkerCursor = function(marker, index) {
  if (index < 1)
    anychart.annotationsModule.Label.base(this, 'setMarkerCursor', marker, index);
  else {
    var mult = (this.backgroundBounds.width * this.backgroundBounds.height) < 0;
    var cursor1 = mult ? anychart.enums.Cursor.NESW_RESIZE : anychart.enums.Cursor.NWSE_RESIZE;
    var cursor2 = mult ? anychart.enums.Cursor.NWSE_RESIZE : anychart.enums.Cursor.NESW_RESIZE;
    marker.getDomElement().cursor(/** @type {acgraph.vector.Cursor} */((index % 2) ? cursor1 : cursor2));
  }
};


//endregion
//region Dragging
/** @inheritDoc */
anychart.annotationsModule.Label.prototype.secureCurrentPosition = function() {
  anychart.annotationsModule.Label.base(this, 'secureCurrentPosition');
  this.securedBounds = this.backgroundBounds.clone();
};


/**
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 * @private
 */
anychart.annotationsModule.Label.prototype.isLeftSideAnchor_ = function(anchor) {
  return (anchor == anychart.enums.Anchor.LEFT_TOP || anchor == anychart.enums.Anchor.LEFT_CENTER || anchor == anychart.enums.Anchor.LEFT_BOTTOM);
};


/**
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 * @private
 */
anychart.annotationsModule.Label.prototype.isRightSideAnchor_ = function(anchor) {
  return (anchor == anychart.enums.Anchor.RIGHT_TOP || anchor == anychart.enums.Anchor.RIGHT_CENTER || anchor == anychart.enums.Anchor.RIGHT_BOTTOM);
};


/**
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 * @private
 */
anychart.annotationsModule.Label.prototype.isTopSideAnchor_ = function(anchor) {
  return (anchor == anychart.enums.Anchor.LEFT_TOP || anchor == anychart.enums.Anchor.CENTER_TOP || anchor == anychart.enums.Anchor.RIGHT_TOP);
};


/**
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 * @private
 */
anychart.annotationsModule.Label.prototype.isBottomSideAnchor_ = function(anchor) {
  return (anchor == anychart.enums.Anchor.LEFT_BOTTOM || anchor == anychart.enums.Anchor.CENTER_BOTTOM || anchor == anychart.enums.Anchor.RIGHT_BOTTOM);
};


/**
 * @param {anychart.enums.Anchor} anchor
 * @return {boolean}
 * @private
 */
anychart.annotationsModule.Label.prototype.isCenterAnchor_ = function(anchor) {
  return (anchor == anychart.enums.Anchor.CENTER_TOP || anchor == anychart.enums.Anchor.CENTER || anchor == anychart.enums.Anchor.CENTER_BOTTOM);
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.moveAnchor = function(anchorId, dx, dy) {
  if (anchorId < 1)
    return anychart.annotationsModule.Label.base(this, 'moveAnchor', anchorId, dx, dy);
  else {
    var anchor = /** @type {anychart.enums.Anchor} */(this.getOption('anchor'));
    switch (anchorId) {
      // left-top anchor
      case 1:
        this.ownSettings['width'] = this.securedBounds.width - dx;
        this.ownSettings['height'] = this.securedBounds.height - dy;
        if (this.isLeftSideAnchor_(anchor)) {
          this.coords['xAnchor'] = this.securedCoords['xAnchor'] + dx;
        }
        if (this.isTopSideAnchor_(anchor)) {
          this.coords['valueAnchor'] = this.securedCoords['valueAnchor'] + dy;
        }
        break;
      // right-top anchor
      case 2:
        this.ownSettings['width'] = this.securedBounds.width + dx;
        this.ownSettings['height'] = this.securedBounds.height - dy;
        if (this.isRightSideAnchor_(anchor)) {
          this.coords['xAnchor'] = this.securedCoords['xAnchor'] + dx;
        }
        if (this.isTopSideAnchor_(anchor)) {
          this.coords['valueAnchor'] = this.securedCoords['valueAnchor'] + dy;
        }
        break;
      // right-bottom anchor
      case 3:
        this.ownSettings['width'] = this.securedBounds.width + dx;
        this.ownSettings['height'] = this.securedBounds.height + dy;
        if (this.isRightSideAnchor_(anchor)) {
          this.coords['xAnchor'] = this.securedCoords['xAnchor'] + dx;
        }
        if (this.isBottomSideAnchor_(anchor)) {
          this.coords['valueAnchor'] = this.securedCoords['valueAnchor'] + dy;
        }
        break;
      // left-bottom anchor
      case 4:
        this.ownSettings['width'] = this.securedBounds.width - dx;
        this.ownSettings['height'] = this.securedBounds.height + dy;
        if (this.isLeftSideAnchor_(anchor)) {
          this.coords['xAnchor'] = this.securedCoords['xAnchor'] + dx;
        }
        if (this.isBottomSideAnchor_(anchor)) {
          this.coords['valueAnchor'] = this.securedCoords['valueAnchor'] + dy;
        }
        break;
    }
    this.ownSettings['xAnchor'] = this.xScale().inverseTransform(
        (this.coords['xAnchor'] - this.pixelBoundsCache.left) / this.pixelBoundsCache.width);
    this.ownSettings['valueAnchor'] = this.yScale().inverseTransform(
        (this.pixelBoundsCache.getBottom() - this.coords['valueAnchor']) / this.pixelBoundsCache.height);
  }
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_SHAPES | anychart.ConsistencyState.ANNOTATIONS_MARKERS);
  this.draw();
  return this;
};


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {number} state
 */
anychart.annotationsModule.Label.prototype.applyTextSettings = function(state) {
  var text = this.getOption('text');
  var useHtml = this.getOption('useHtml');

  if (goog.isDef(text)) {
    if (useHtml) {
      this.textElement_.htmlText(text);
    } else {
      this.textElement_.text(text);
    }
  }

  this.textElement_.fontFamily(/** @type {string} */ (this.resolveOption('fontFamily', state, null)));
  this.textElement_.fontStyle(/** @type {string} */ (this.resolveOption('fontStyle', state, null)));
  this.textElement_.fontVariant(/** @type {string} */ (this.resolveOption('fontVariant', state, null)));
  this.textElement_.fontWeight(/** @type {number|string} */ (this.resolveOption('fontWeight', state, null)));
  this.textElement_.fontSize(/** @type {number|string} */ (this.resolveOption('fontSize', state, null)));
  this.textElement_.decoration(/** @type {string} */ (this.resolveOption('fontDecoration', state, null)));

  this.textElement_.direction(/** @type {string} */ (this.getOption('textDirection')));
  this.textElement_.wordBreak(/** @type {string} */ (this.getOption('wordBreak')));
  this.textElement_.wordWrap(/** @type {string} */ (this.getOption('wordWrap')));
  this.textElement_.letterSpacing(/** @type {number|string} */ (this.getOption('letterSpacing')));
  this.textElement_.lineHeight(/** @type {number|string} */ (this.getOption('lineHeight')));
  this.textElement_.textIndent(/** @type {number} */ (this.getOption('textIndent')));
  this.textElement_.textShadow(/** @type {string} */ (this.getOption('textShadow')));
  this.textElement_.vAlign(/** @type {string} */ (this.getOption('vAlign')));
  this.textElement_.hAlign(/** @type {string} */ (this.getOption('hAlign')));
  this.textElement_.textOverflow(/** @type {string} */ (this.getOption('textOverflow')));
  this.textElement_.selectable(/** @type {boolean} */ (this.getOption('selectable')));
  this.textElement_.disablePointerEvents(/** @type {boolean} */ (this.getOption('disablePointerEvents')));
  //this.textElement_.width(/** @type {boolean} */ (this.getOption('width')));
  //this.textElement_.height(/** @type {boolean} */ (this.getOption('height')));
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.ensureCreated = function() {
  anychart.annotationsModule.Label.base(this, 'ensureCreated');
  if (!this.textElement_) {
    this.textElement_ = /** @type {acgraph.vector.Text} */(this.rootLayer.text());
    this.textElement_.zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX - 1);
  }
  if (!this.hoverRect_) {
    this.hoverRect_ = this.rootLayer.rect();
    this.hoverRect_
        .fill(anychart.color.TRANSPARENT_HANDLER)
        .zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
  }
  this.background().container(this.rootLayer).zIndex(0);
};


/**
 *  Calculate background bounds, text bounds.
 *  @param {number} x
 *  @param {number} y
 *  @private
 */
anychart.annotationsModule.Label.prototype.calculateBounds_ = function(x, y) {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  /** @type {number} */
  var parentWidth;
  /** @type {number} */
  var parentHeight;
  var width;
  var height;
  var autoWidth;
  var autoHeight;

  var w = /** @type {number|string} */(this.getOption('width'));
  var h = /** @type {number|string} */(this.getOption('height'));
  var textWidth = 0;
  var textHeight = 0;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
    if (goog.isDefAndNotNull(w)) {
      this.backgroundWidth = width = anychart.utils.normalizeSize(w, parentWidth);
      textWidth = Math.abs(width);
      autoWidth = false;
    } else {
      width = 0;
      autoWidth = true;
    }
    if (goog.isDefAndNotNull(h)) {
      this.backgroundHeight = height = anychart.utils.normalizeSize(h, parentHeight);
      textHeight = Math.abs(height);
      autoHeight = false;
    } else {
      height = 0;
      autoHeight = true;
    }
  } else {
    if (!anychart.utils.isNaN(w)) {
      autoWidth = false;
      this.backgroundWidth = width = anychart.utils.toNumber(w);
      textWidth = Math.abs(width);
    } else {
      autoWidth = true;
      width = 0;
    }
    if (!anychart.utils.isNaN(h)) {
      autoHeight = false;
      this.backgroundHeight = height = anychart.utils.toNumber(h);
      textHeight = Math.abs(height);
    } else {
      autoHeight = true;
      height = 0;
    }
  }

  var padding = this.padding();

  this.textElement_.width(null);
  this.textElement_.height(null);

  if (autoWidth) {
    width += this.textElement_.getBounds().width;
    this.textWidth = width;
    this.backgroundWidth = padding.widenWidth(width);
  } else {
    this.textWidth = padding.tightenWidth(textWidth);
  }

  this.textElement_.width(this.textWidth);

  if (autoHeight) {
    height += this.textElement_.getBounds().height;
    this.textHeight = height;
    this.backgroundHeight = padding.widenHeight(height);
  } else {
    this.textHeight = padding.tightenHeight(textHeight);
  }

  this.textElement_.height(this.textHeight);
  this.textX = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('left')), this.backgroundWidth);
  this.textY = anychart.utils.normalizeSize(/** @type {number|string} */(padding.getOption('top')), this.backgroundHeight);

  var anchor = /** @type {anychart.enums.Anchor} */(this.getOption('anchor'));
  var position = {x: x, y: y};
  var diff = anychart.utils.getCoordinateByAnchor(anychart.math.rect(0, 0, this.backgroundWidth, this.backgroundHeight), anchor);
  position.x -= diff.x;
  position.y -= diff.y;

  anychart.utils.applyOffsetByAnchor(position, anchor,
      /** @type {number} */(this.getOption('offsetX') || 0),
      /** @type {number} */(this.getOption('offsetY') || 0));

  this.textX += position.x - (this.backgroundWidth < 0 ? textWidth : 0);
  this.textY += position.y - (this.backgroundHeight < 0 ? textHeight : 0);

  this.backgroundBounds = new anychart.math.Rect(position.x, position.y, this.backgroundWidth, this.backgroundHeight);
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.drawOnePointShape = function(x, y) {
  this.applyTextSettings(this.state);
  this.calculateBounds_(x, y);

  this.textElement_.x(this.textX);
  this.textElement_.y(this.textY);
  this.textElement_.clip(this.backgroundBounds);

  this.hoverRect_
      .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2)
      .setBounds(this.backgroundBounds);

  this.background()
      .suspendSignalsDispatching()
      .parentBounds(this.backgroundBounds)
      .draw()
      .resumeSignalsDispatching(false);
  this.invalidate(anychart.ConsistencyState.ANNOTATIONS_MARKERS);
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.colorize = function(state) {
  anychart.annotationsModule.Label.base(this, 'colorize', state);
  this.textElement_.color(this.resolveOption('fontColor', state, null));
  this.textElement_.opacity(this.resolveOption('fontOpacity', state, null));
};


//endregion
//region Serialization / Deserialization / Disposing
//----------------------------------------------------------------------------------------------------------------------
//
//  Serialization / Deserialization / Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.Label.prototype.serialize = function() {
  var json = anychart.annotationsModule.Label.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.annotationsModule.LABEL_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
  anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();

  return json;
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.setDefaultSettings = function(value) {
  anychart.annotationsModule.Label.base(this, 'setDefaultSettings', value);
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.setupByJSON = function(config, opt_default) {
  anychart.annotationsModule.Label.base(this, 'setupByJSON', config, opt_default);
  this.background().setupInternal(!!opt_default, config['background']);
  this.padding().setupInternal(!!opt_default, config['padding']);

  if (opt_default)
    anychart.core.settings.copy(this.themeSettings, anychart.annotationsModule.LABEL_DESCRIPTORS, config);
  else
    anychart.core.settings.deserialize(this, anychart.annotationsModule.LABEL_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.annotationsModule.Label.prototype.disposeInternal = function() {
  goog.disposeAll(this.textElement_, this.hoverRect_, this.background_, this.padding_);
  anychart.annotationsModule.Label.base(this, 'disposeInternal');
};
//endregion
