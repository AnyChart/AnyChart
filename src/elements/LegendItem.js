goog.provide('anychart.elements.LegendItem');
goog.require('anychart.elements.Marker');
goog.require('anychart.elements.Text');
goog.require('anychart.events.EventType');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('goog.events.BrowserEvent');



/**
 * Inner class for representing legend item.
 * @extends {anychart.elements.Text}
 * @constructor
 */
anychart.elements.LegendItem = function() {
  goog.base(this);

  /**
   * LegendItem element.
   * @type {!acgraph.vector.Layer}
   * @private
   */
  this.layer_ = acgraph.layer();
  this.registerDisposable(this.layer_);

  /**
   * Legend icon text element.
   * @type {!acgraph.vector.Text}
   * @private
   */
  this.textElement_ = this.layer_.text();
  this.registerDisposable(this.textElement_);

  acgraph.events.listen(this.layer_, acgraph.events.EventType.MOUSEOVER, this.mouseOverHandler_, false, this);
  acgraph.events.listen(this.layer_, acgraph.events.EventType.CLICK, this.mouseClickHandler_, false, this);
  acgraph.events.listen(this.layer_, acgraph.events.EventType.DBLCLICK, this.mouseDoubleClickHandler_, false, this);

  /**
   * @type {(anychart.elements.LegendItem.IconType|string|function(acgraph.vector.Path, number))}
   */
  this.iconType_;
  this.x(0);
  this.y(0);
  this.iconType(anychart.elements.LegendItem.IconType.SQUARE);
  this.iconFill('black');
  this.iconStroke('none');
  this.iconMarker(null);
  this.iconTextSpacing(5);
  this.text('Legend Item');
  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.LegendItem, anychart.elements.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.LegendItem.prototype.SUPPORTED_SIGNALS = anychart.elements.Text.prototype.SUPPORTED_SIGNALS | // NEEDS_REDRAW BOUNDS_CHANGED
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.LegendItem.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Text.prototype.SUPPORTED_CONSISTENCY_STATES; //ENABLED CONTAINER Z_INDEX APPEARANCE BOUNDS


/**
 * Predefined icons type.
 * @enum {string}
 */
anychart.elements.LegendItem.IconType = {
  AREA: 'area',
  BAR: 'bar',
  BUBBLE: 'bubble',
  CANDLESTICK: 'candlestick',
  COLUMN: 'column',
  LINE: 'line',
  MARKER: 'marker',
  OHLC: 'ohlc',
  RANGE_AREA: 'rangearea',
  RANGE_BAR: 'rangebar',
  RANGE_COLUMN: 'rangecolumn',
  RANGE_SPLINE_AREA: 'rangesplinearea',
  RANGE_STEP_AREA: 'rangesteparea',
  SPLINE: 'spline',
  SPLINE_AREA: 'splinearea',
  STEP_LINE: 'stepline',
  STEP_AREA: 'steparea',
  CIRCLE: 'circle',
  SQUARE: 'square'
};


/**
 * Method to get icon drawer
 * @this {anychart.elements.LegendItem}
 * @param {(anychart.elements.LegendItem.IconType|string)=} opt_iconType Type of an icon.
 * @return {function(acgraph.vector.Path, number)} Drawer function.
 */
anychart.elements.LegendItem.getIconDrawer = function(opt_iconType) {
  var drawer;
  var ths = this;
  switch (opt_iconType) {
    case anychart.elements.LegendItem.IconType.STEP_AREA:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, size * 0.6)
            .lineTo(size * 0.5, size * 0.6)
            .lineTo(size * 0.5, size * 0.1)
            .lineTo(size, size * 0.1)
            .lineTo(size, size)
            .lineTo(0, size)
            .lineTo(0, size * 0.6)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.AREA:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, size * 0.7)
            .lineTo(size * 0.35, size * 0.3)
            .lineTo(size * 0.5, size * 0.5)
            .lineTo(size, 0)
            .lineTo(size, size)
            .lineTo(0, size)
            .lineTo(0, size * 0.7)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.RANGE_STEP_AREA:
    case anychart.elements.LegendItem.IconType.RANGE_SPLINE_AREA:
    case anychart.elements.LegendItem.IconType.RANGE_AREA:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, size * 0.2)
            .lineTo(size * 0.5, size * 0.4)
            .lineTo(size, size * 0.2)
            .lineTo(size, size * 0.8)
            .lineTo(size * 0.5, size * 0.6)
            .lineTo(0, size * 0.8)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.SPLINE_AREA:
      drawer = function(path, size) {
        path.clear();
        var r = size / 2;
        path.moveTo(size, 0.6 * r)
            .lineTo(size, size)
            .lineTo(0, size)
            .lineTo(0, 1.3 * r)
            .circularArc(0, r, r, r * 0.3, 90, -90)
            .circularArc(size, r, r, r * 0.4, 180, 90)
            .moveTo(0, 0)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.RANGE_BAR:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(size * 0.35, 0)
            .lineTo(size * 0.65, 0)
            .lineTo(size * 0.65, size * 0.15)
            .lineTo(size * 0.35, size * 0.15)
            .close()
            .moveTo(size * 0.1, size * 0.4)
            .lineTo(size * 0.9, size * 0.4)
            .lineTo(size * 0.9, size * 0.55)
            .lineTo(size * 0.1, size * 0.55)
            .close()
            .moveTo(size * 0.25, size * 0.8)
            .lineTo(size * 0.75, size * 0.8)
            .lineTo(size * 0.75, size * 0.95)
            .lineTo(size * 0.25, size * 0.95)
            .close();
      };
      break;
    case anychart.elements.LegendItem.IconType.RANGE_COLUMN:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, size * 0.6)
            .lineTo(0, size * 0.4)
            .lineTo(size * 0.15, size * 0.4)
            .lineTo(size * 0.15, size * 0.6)
            .lineTo(0, size * 0.6)
            .close()
            .moveTo(size * 0.4, size * 0.9)
            .lineTo(size * 0.4, size * 0.1)
            .lineTo(size * 0.55, size * 0.1)
            .lineTo(size * 0.55, size * 0.9)
            .lineTo(size * 0.4, size * 0.9)
            .close()
            .moveTo(size * 0.8, size * 0.7)
            .lineTo(size * 0.8, size * 0.3)
            .lineTo(size * 0.95, size * 0.3)
            .lineTo(size * 0.95, size * 0.7)
            .lineTo(size * 0.8, size * 0.7)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.BAR:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, 0)
            .lineTo(size * 0.6, 0)
            .lineTo(size * 0.6, size * 0.15)
            .lineTo(0, size * 0.15)
            .close()
            .moveTo(0, size * 0.4)
            .lineTo(size, size * 0.4)
            .lineTo(size, size * 0.55)
            .lineTo(0, size * 0.55)
            .close()
            .moveTo(0, size * 0.8)
            .lineTo(size * 0.8, size * 0.8)
            .lineTo(size * 0.8, size * 0.95)
            .lineTo(0, size * 0.95)
            .close();
      };
      break;
    case anychart.elements.LegendItem.IconType.COLUMN:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, size)
            .lineTo(0, size * 0.4)
            .lineTo(size * 0.15, size * 0.4)
            .lineTo(size * 0.15, size)
            .close()
            .moveTo(size * 0.4, size)
            .lineTo(size * 0.4, 0)
            .lineTo(size * 0.55, 0)
            .lineTo(size * 0.55, size)
            .close()
            .moveTo(size * 0.8, size)
            .lineTo(size * 0.8, size * 0.2)
            .lineTo(size * 0.95, size * 0.2)
            .lineTo(size * 0.95, size)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.STEP_LINE:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, size * 0.8)
            .lineTo(size * 0.5, size * 0.8)
            .lineTo(size * 0.5, size * 0.2)
            .lineTo(size, size * 0.2)
            .moveTo(0, 0)
            .close();

        if (ths.iconMarker_) {
          if (!ths.marker_) {
            ths.marker_ = path.parent().path();
            ths.registerDisposable(ths.marker_);
          } else ths.marker_.clear();
          ths.marker_.fill(ths.iconFill_);
          ths.marker_.stroke(ths.iconStroke_);
          var markerDrawer = anychart.elements.Marker.getMarkerDrawer((/** @type {anychart.elements.LegendItem} */(ths)).iconMarker_);
          markerDrawer.call(ths, ths.marker_, size / 2, size / 2, size / 6);
        }
      };
      break;

    case anychart.elements.LegendItem.IconType.LINE:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, 0.5 * size)
            .lineTo(size, 0.5 * size)
            .close();

        if (ths.iconMarker_) {
          if (!ths.marker_) {
            ths.marker_ = path.parent().path();
            ths.registerDisposable(ths.marker_);
          } else ths.marker_.clear();
          ths.marker_.fill(ths.iconFill_);
          ths.marker_.stroke(ths.iconStroke_);
          var markerDrawer = anychart.elements.Marker.getMarkerDrawer((/** @type {anychart.elements.LegendItem} */(ths)).iconMarker_);
          markerDrawer.call(ths, ths.marker_, size / 2, size / 2, size / 6);
        }
      };
      break;

    case anychart.elements.LegendItem.IconType.SPLINE:
      drawer = function(path, size) {
        path.clear();
        var r = size / 2;
        path.circularArc(0, r, r, r * 0.8, 90, -90)
            .circularArc(size, r, r, r * 0.6, 180, 90)
            .moveTo(0, 0)
            .close();

        if (ths.iconMarker_) {
          if (!ths.marker_) {
            ths.marker_ = path.parent().path();
            ths.registerDisposable(ths.marker_);
          } else ths.marker_.clear();
          ths.marker_.fill(ths.iconFill_);
          ths.marker_.stroke(ths.iconStroke_);
          var markerDrawer = anychart.elements.Marker.getMarkerDrawer((/** @type {anychart.elements.LegendItem} */(ths)).iconMarker_);
          markerDrawer.call(ths, ths.marker_, size / 2, size / 2, size / 6);
        }
      };
      break;

    case anychart.elements.LegendItem.IconType.MARKER:
    case anychart.elements.LegendItem.IconType.BUBBLE:
    case anychart.elements.LegendItem.IconType.CIRCLE:
      drawer = function(path, size) {
        path.clear();
        var r = size / 2;
        path.circularArc(r, r, r, r, 0, 360)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.CANDLESTICK:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(size * 0.5, 0)
            .lineTo(size * 0.5, size)
            .moveTo(0, size * 0.3)
            .lineTo(size, size * 0.3)
            .lineTo(size, size * 0.7)
            .lineTo(0, size * 0.7)
            .lineTo(0, size * 0.3)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.OHLC:
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, size * 0.2)
            .lineTo(size * 0.5, size * 0.2)
            .moveTo(size * 0.5, 0)
            .lineTo(size * 0.5, size)
            .moveTo(size * 0.5, size * 0.8)
            .lineTo(size, size * 0.8)
            .close();
      };
      break;

    case anychart.elements.LegendItem.IconType.SQUARE:
    default:
      //default drawer is a square
      drawer = function(path, size) {
        path.clear();

        path.moveTo(0, 0)
            .lineTo(size, 0)
            .lineTo(size, size)
            .lineTo(0, size)
            .close();
      };
  }

  return drawer;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  LegendItem API.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for parentBounds.
 * @param {anychart.math.Rect=} opt_value Value to set.
 * @return {(anychart.math.Rect|anychart.elements.LegendItem)} Parent bounds or self for method chaining.
 */
anychart.elements.LegendItem.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Getter/setter for X coordinate of legend item.
 * @param {(number|string)=} opt_value New x coordinate.
 * @return {(number|string|anychart.elements.LegendItem)} X coordinate or self for method chaining.
 */
anychart.elements.LegendItem.prototype.x = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.x_ != opt_value) {
      this.x_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.x_;
};


/**
 * Getter/setter for Y coordinate of legend item.
 * @param {(number|string)=} opt_value New y coordinate.
 * @return {(number|string|anychart.elements.LegendItem)} Y coordinate or self for method chaining.
 */
anychart.elements.LegendItem.prototype.y = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.y_ != opt_value) {
      this.y_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.y_;
};


/**
 * Return legend item content bounds.
 * @return {anychart.math.Rect} Content bounds.
 */
anychart.elements.LegendItem.prototype.getContentBounds = function() {
  if (!this.enabled())
    return new anychart.math.Rect(0, 0, 0, 0);
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();
  return this.pixelBounds_;
};


/**
 * Getter/setter for icon type.
 * @param {(string|function(acgraph.vector.Path, number))=} opt_value Icon type or custom drawer function.
 * @return {(string|function(acgraph.vector.Path, number)|anychart.elements.LegendItem)} icon type or drawer function or self for method chaining.
 */
anychart.elements.LegendItem.prototype.iconType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value)) opt_value = opt_value.toLowerCase();
    if (this.iconType_ != opt_value) {
      this.iconType_ = opt_value;
      this.redrawIcon_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconType_;
};


/**
 * Getter/setter for icon fill setting.
 * @param {(acgraph.vector.Fill)=} opt_value Icon fill setting.
 * @return {(acgraph.vector.Fill|anychart.elements.LegendItem)} Icon fill setting or self for method chaining.
 */
anychart.elements.LegendItem.prototype.iconFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.iconFill_ != opt_value) {
      this.iconFill_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconFill_;
};


/**
 * Getter/setter for icon stroke setting.
 * @param {(acgraph.vector.Stroke)=} opt_value Icon stroke setting.
 * @return {(acgraph.vector.Stroke|anychart.elements.LegendItem)} Icon stroke setting or self for method chaining.
 */
anychart.elements.LegendItem.prototype.iconStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.iconStroke_ != opt_value) {
      this.iconStroke_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconStroke_;
};


/**
 * Getter/setter for marker type.
 * Usable with line, spline, step line icon types.
 * @param {?string=} opt_value Marker type.
 * @return {(string|anychart.elements.LegendItem)} IconMarker or self for method chaining.
 */
anychart.elements.LegendItem.prototype.iconMarker = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.iconMarker_ != opt_value) {
      this.iconMarker_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconMarker_;
};


/**
 * Getter/setter for iconTextSpacing setting.
 * @param {number=} opt_value Value of spacing between icon and text.
 * @return {(anychart.elements.LegendItem|number)} Spacing between icon and text or self for method chaining.
 */
anychart.elements.LegendItem.prototype.iconTextSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !isNaN(parseFloat(opt_value)) ? +opt_value : 5;
    if (this.iconTextSpacing_ != opt_value) {
      this.iconTextSpacing_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.iconTextSpacing_;
};


/**
 * Getter/setter for max width of legend item.
 * @param {(number)=} opt_value Max width setting.
 * @return {(number|anychart.elements.LegendItem)} Max width or self for method chaining.
 */
anychart.elements.LegendItem.prototype.maxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxWidth_ != opt_value) {
      this.maxWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.maxWidth_;
};


/**
 * Getter/setter for max height of legend item.
 * @param {(number)=} opt_value Max height setting.
 * @return {(number|anychart.elements.LegendItem)} Max height or self for method chaining.
 */
anychart.elements.LegendItem.prototype.maxHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.maxHeight_ != opt_value) {
      this.maxHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.maxHeight_;
};


/**
 * Getter/setter for legend item text.
 * @param {string=} opt_value Legend item text.
 * @return {(string|anychart.elements.LegendItem)} Legend item text or self for method chaining.
 */
anychart.elements.LegendItem.prototype.text = function(opt_value) {
  return /** @type {!anychart.elements.LegendItem|string} */(this.textSettings('text', opt_value));
};


/** @inheritDoc */
anychart.elements.LegendItem.prototype.applyTextSettings = function(textElement, isInitial) {
  if (isInitial || 'text' in this.changedSettings || 'useHtml' in this.changedSettings) {
    if (!!this.settingsObj['useHtml'])
      textElement.htmlText(this.settingsObj['text']);
    else
      textElement.text(this.settingsObj['text']);
  }
  goog.base(this, 'applyTextSettings', textElement, isInitial);
  this.changedSettings = {};
};


/**
 * Legend item text element.
 * @return {!acgraph.vector.Text} Text element.
 */
anychart.elements.LegendItem.prototype.getTextElement = function() {
  return this.textElement_;
};


/**
 * Calculating actual width of legend item independently of enabled state.
 * @return {number} Width.
 */
anychart.elements.LegendItem.prototype.getWidth = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();
  return this.iconSize_ + this.iconTextSpacing_ + this.textElement_.getBounds().width;
};


/**
 * Calculating actual height of legend item independently of enabled state.
 * @return {number} Height.
 */
anychart.elements.LegendItem.prototype.getHeight = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateBounds_();
  return this.textElement_.getBounds().height;
};


/**
 * Calculate bounds of legend item
 * @private
 * @return {anychart.math.Rect} pixelBounds of legend item.
 */
anychart.elements.LegendItem.prototype.calculateBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */ (this.container());
  var stage = container ? container.getStage() : null;
  var parentBounds;

  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else if (stage) {
    parentBounds = stage.getBounds();
  } else {
    parentBounds = null;
  }

  var parentWidth, parentHeight;

  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  } else {
    parentWidth = parentHeight = undefined;
  }

  /** @type {acgraph.math.Rect} */
  var textBounds = this.textElement_.getBounds();
  this.iconSize_ = textBounds.height;
  var width = this.iconSize_ + this.iconTextSpacing_ + textBounds.width;
  var height = textBounds.height;
  var x = parentWidth ? anychart.utils.normalize(this.x_, parentWidth) : 0;
  var y = parentHeight ? anychart.utils.normalize(this.y_, parentHeight) : 0;

  var textWidth = anychart.utils.normalize(this.maxWidth_, parentWidth) - this.iconSize_ - this.iconTextSpacing_;
  var textHeight = anychart.utils.normalize(this.maxHeight_, parentWidth);

  this.textElement_.width(textWidth);
  this.textElement_.height(textHeight);
  if (parentBounds) {
    this.pixelBounds_ = new anychart.math.Rect(
        parentBounds.getLeft() + x,
        parentBounds.getTop() + y,
        width, height);
  } else {
    this.pixelBounds_ = new anychart.math.Rect(x, y, width, height);
  }
  return this.pixelBounds_;
};


/**
 * @inheritDoc
 */
anychart.elements.LegendItem.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Mouse over handler.
 * @param {acgraph.events.Event} event Event.
 * @private
 */
anychart.elements.LegendItem.prototype.mouseOverHandler_ = function(event) {
  if (this.dispatchEvent(new anychart.elements.LegendItem.BrowserEvent(this, event))) {
    acgraph.events.listen(event.target, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
    acgraph.events.listen(goog.dom.getDocument(), acgraph.events.EventType.MOUSEMOVE, this.mouseMoveHandler_, false, this);
  }
};


/**
 * Mouse out handler.
 * @param {acgraph.events.Event} event Event.
 * @private
 */
anychart.elements.LegendItem.prototype.mouseOutHandler_ = function(event) {
  this.dispatchEvent(new anychart.elements.LegendItem.BrowserEvent(this, event));
  acgraph.events.unlisten(event.target, acgraph.events.EventType.MOUSEOUT, this.mouseOutHandler_, false, this);
  acgraph.events.unlisten(goog.dom.getDocument(), acgraph.events.EventType.MOUSEMOVE, this.mouseMoveHandler_, false, this);
};


/**
 * Mouse move handler.
 * @param {acgraph.events.Event} event Event.
 * @private
 */
anychart.elements.LegendItem.prototype.mouseMoveHandler_ = function(event) {
  this.dispatchEvent(new anychart.elements.LegendItem.BrowserEvent(this, event));
};


/**
 * Mouse click handler.
 * @param {acgraph.events.Event} event Event.
 * @private
 */
anychart.elements.LegendItem.prototype.mouseClickHandler_ = function(event) {
  this.dispatchEvent(new anychart.elements.LegendItem.BrowserEvent(this, event));
};


/**
 * Mouse double click handler.
 * @param {acgraph.events.Event} event Event.
 * @private
 */
anychart.elements.LegendItem.prototype.mouseDoubleClickHandler_ = function(event) {
  this.dispatchEvent(new anychart.elements.LegendItem.BrowserEvent(this, event));
};


/**
 * Draws legend item.
 */
anychart.elements.LegendItem.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return;

  var isInitial;
  if (isInitial = !this.icon_) {
    /**
     * Legend icon path.
     * @type {acgraph.vector.Path}
     * @private
     */
    this.icon_ = this.layer_.path();
    this.registerDisposable(this.icon_);
    this.icon_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.icon_.translate(0, 0);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    this.layer_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.layer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
  var drawer = goog.isString(this.iconType_) ?
      anychart.elements.LegendItem.getIconDrawer.call(this, this.iconType_) :
      this.iconType_;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyTextSettings(this.textElement_, isInitial);
    if (this.redrawIcon_ && !isInitial) {
      drawer.call(this, this.icon_, this.iconSize_);
      this.redrawIcon_ = false;
    }
    this.icon_.fill(this.iconFill_);
    this.icon_.stroke(this.iconStroke_);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateBounds_();
    drawer.call(this, this.icon_, this.iconSize_);
    this.redrawIcon_ = false;
    this.textElement_.x(/** @type {number} */(this.iconSize_ + this.iconTextSpacing_));
    this.textElement_.y(0);
    this.layer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.layer_.translate(/** @type {number} */(this.pixelBounds_.left), /** @type {number} */(this.pixelBounds_.top));
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
};


/**
 * @inheritDoc
 */
anychart.elements.LegendItem.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['x'] = this.x();
  json['y'] = this.y();
  if (goog.isFunction(this.iconType_)) {
    if (window.console) {
      window.console.log('Warning: We cant serialize iconType function, you should reset it manually.');
    }
  } else json['iconType'] = this.iconType();

  json['iconFill'] = this.iconFill();
  json['iconStroke'] = this.iconStroke();
  json['iconMarker'] = this.iconMarker();
  json['iconTextSpacing'] = this.iconTextSpacing();
  json['maxWidth'] = this.maxWidth();
  json['maxHeight'] = this.maxHeight();
  json['text'] = this.text();

  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.LegendItem.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.x(config['x']);
  this.y(config['y']);
  this.iconType(config['iconType']);
  this.iconFill(config['iconFill']);
  this.iconStroke(config['iconStroke']);
  this.iconMarker(config['iconMarker']);
  this.iconTextSpacing(config['iconTextSpacing']);
  this.maxWidth(config['maxWidth']);
  this.maxHeight(config['maxHeight']);

  this.textSettings(config);

  this.resumeSignalsDispatching(true);
  return this;
};



/**
 * Encapsulates browser event for acgraph.
 * @param {anychart.elements.LegendItem} target EventTarget to be set as a target of the event.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.elements.LegendItem.BrowserEvent = function(target, opt_e) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, target);
};
goog.inherits(anychart.elements.LegendItem.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.elements.LegendItem.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.elements.LegendItem.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  var type = e.type;
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.events.EventType.LEGEND_ITEM_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.events.EventType.LEGEND_ITEM_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.events.EventType.LEGEND_ITEM_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.events.EventType.LEGEND_ITEM_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.events.EventType.LEGEND_ITEM_DOUBLE_CLICK;
      break;
  }
  this.type = type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this.offsetX = e.offsetX;
  this.offsetY = e.offsetY;

  this.clientX = e.clientX;
  this.clientY = e.clientY;

  this.screenX = e.screenX;
  this.screenY = e.screenY;

  this.button = e.button;

  this.keyCode = e.keyCode;
  this.charCode = e.charCode;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = e.platformModifierKey;
  this.state = e.state;

  this.event_ = e;
  delete this.propagationStopped_;
};


//exports
goog.exportSymbol('anychart.elements.LegendItem', anychart.elements.LegendItem);
anychart.elements.LegendItem.prototype['parentBounds'] = anychart.elements.LegendItem.prototype.parentBounds;
anychart.elements.LegendItem.prototype['x'] = anychart.elements.LegendItem.prototype.x;
anychart.elements.LegendItem.prototype['y'] = anychart.elements.LegendItem.prototype.y;
anychart.elements.LegendItem.prototype['iconType'] = anychart.elements.LegendItem.prototype.iconType;
anychart.elements.LegendItem.prototype['iconFill'] = anychart.elements.LegendItem.prototype.iconFill;
anychart.elements.LegendItem.prototype['iconStroke'] = anychart.elements.LegendItem.prototype.iconStroke;
anychart.elements.LegendItem.prototype['iconTextSpacing'] = anychart.elements.LegendItem.prototype.iconTextSpacing;
anychart.elements.LegendItem.prototype['maxWidth'] = anychart.elements.LegendItem.prototype.maxWidth;
anychart.elements.LegendItem.prototype['maxHeight'] = anychart.elements.LegendItem.prototype.maxHeight;
anychart.elements.LegendItem.prototype['text'] = anychart.elements.LegendItem.prototype.text;
anychart.elements.LegendItem.prototype['getTextElement'] = anychart.elements.LegendItem.prototype.getTextElement;
anychart.elements.LegendItem.prototype['getContentBounds'] = anychart.elements.LegendItem.prototype.getContentBounds;
anychart.elements.LegendItem.prototype['getWidth'] = anychart.elements.LegendItem.prototype.getWidth;
anychart.elements.LegendItem.prototype['getHeight'] = anychart.elements.LegendItem.prototype.getHeight;
anychart.elements.LegendItem.prototype['draw'] = anychart.elements.LegendItem.prototype.draw;
