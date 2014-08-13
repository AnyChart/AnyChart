goog.provide('anychart.elements.MarkersFactory');
goog.provide('anychart.elements.MarkersFactory.BrowserEvent');
goog.provide('anychart.elements.MarkersFactory.Marker');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.elements.Marker.Type');
goog.require('anychart.utils');
goog.require('goog.events.BrowserEvent');



/**
 * Multiple markers class.<br/>
 * Multiple markers are the set of markers with a common settings, such as type (predefined or
 * custom), size, fill and position:
 * <ul>
 *   <li>{@link anychart.elements.MarkersFactory#anchor}</li>
 *   <li>{@link anychart.elements.MarkersFactory#position}</li>
 *   <li>{@link anychart.elements.MarkersFactory#offsetX} and {@link anychart.elements.MarkersFactory#offsetY}</li>
 *   <li>{@link anychart.elements.MarkersFactory#parentBounds}</li>
 * </ul>
 * Also you can access any marker from the set and change it:
 * @example <t>simple-h100</t>
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star5')
 *     .size(27)
 *     .fill('blue')
 *     .anchor('leftTop')
 *     .stroke('1px #000')
 *     .container(stage);
 *  MMarker.draw({x: 100, y: 30});
 *  MMarker.draw({x: 200, y: 50});
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.MarkersFactory = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  /**
   * Elements pool.
   * @type {Array.<anychart.elements.MarkersFactory.Marker>}
   * @private
   */
  this.freeToUseMarkersPool_;

  /**
   * Element for measurement.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.measureMarkerElement_;

  /**
   * Markers layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Type of marker.
   * @type {(string|anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
   * @private
   */
  this.type_;

  /**
   * Marker size.
   * @type {number}
   * @private
   */
  this.size_;

  /**
   * Marker fill settings.
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Marker stroke settings.
   * @type {string|acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Marker anchor settings.
   * @type {anychart.utils.NinePositions|string}
   * @private
   */
  this.anchor_;

  /**
   * Marker position settings.
   * @type {anychart.utils.NinePositions|string}
   * @private
   */
  this.position_;

  /**
   * Offset by X coordinate from Marker position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from Marker position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Enabled state.
   * @type {?boolean}
   * @private
   */
  this.enabledState_ = null;

  /**
   * Marker position formatter function.
   * @type {Function}
   * @private
   */
  this.positionFormatter_ = null;

  /**
   * Handlers to attach on next end().
   * @type {number}
   * @private
   */
  this.attachedEvents_ = 0;

  /**
   * One-off handlers to attach on next end().
   * @type {number}
   * @private
   */
  this.attachedOnceEvents_ = 0;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_;

  /**
   * Markers array.
   * @type {Array.<anychart.elements.MarkersFactory.Marker>}
   * @private
   */
  this.markers_;

  /**
   * Changed settings.
   * @type {Object}
   */
  this.changedSettings = {};

  this.positionFormatter_ = anychart.utils.DEFAULT_FORMATTER;

  this.zIndex(70);
  this.size(10);
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.offsetX(0);
  this.offsetY(0);

  this.changedSettings = {};

  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(true);
};
goog.inherits(anychart.elements.MarkersFactory, anychart.VisualBase);


/**
 * Supported signals.
 * @type {number}
 */
anychart.elements.MarkersFactory.prototype.SUPPORTED_SIGNALS = anychart.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.MarkersFactory.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.HANDLERS;


/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.elements.MarkersFactory.HANDLED_EVENT_TYPES_ = {
  /** Click */
  'click': 0x01,

  /** Double click */
  'dblclick': 0x02,

  /** Mouse down */
  'mousedown': 0x04,

  /** Mouse up */
  'mouseup': 0x08,

  /** Mouse over */
  'mouseover': 0x10,

  /** Moise out */
  'mouseout': 0x20,

  /** Mouse move */
  'mousemove': 0x40,

  /** Fires on touch start */
  'touchstart': 0x80,

  /** Fires on touch move */
  'touchmove': 0x100,

  /** Fires on touch end */
  'touchend': 0x200,

  /** Fires on touch cancel.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  'touchcancel': 0x400

  //  /** Fires on tap (fast touchstart-touchend) */
  //  'tap': 0x800
};


/**
 * MAGIC NUMBERS!!! MAGIC NUMBERS!!!111
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code! Tada!
 * @type {number}
 * @private
 */
anychart.elements.MarkersFactory.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


/**
 * Getter for the current element state.
 *
 * Былина о трех состояних - true, false и null.
 *
 * true и false по-старинке парвда и лож.
 * А вот если установлено null, то элемент включен, но если он зависит
 * от других сущностей (например, в случае markers() и hoverMarkers() в сериях), то null будет значить, что
 * состояние маркер фактори работает в auto режиме и завит от других обстоятельсв. (Например, если у серии
 * включены обычные маркеры, а хавер маркурам выставлено состояние null, то при хавере настройка enabled возьмется из
 * обычных маркеров и хавер маркеры будут работать. А если обычные маркеры выключить, то и хавер маркеры не будут работать)
 * @return {?boolean} The current element state.
 *//**
 * Setter for the element enabled state.
 * @example <t>listingOnly</t>
 * if (!element.enabled())
 *    element.enabled(true);
 * @param {(null|boolean)=} opt_value Value to set.
 * @return {anychart.MarkersFactory} An instance of {@link anychart.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(null|boolean)=} opt_value Value to set.
 * @return {anychart.elements.MarkersFactory|boolean|null} .
 */
anychart.elements.MarkersFactory.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.enabledState_ = opt_value;
    if (!goog.isNull(opt_value)) {
      goog.base(this, 'enabled', /** @type {boolean} */(opt_value));
    } else {
      goog.base(this, 'enabled', true);
    }
    return this;
  }
  return this.enabledState_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current position formatter function of all markers.
 * @return {Function} Marker position formatter function.
 *//**
 * Setter for position formatter function of all markers.<br/>
 * <b>Note:</b> you can pass anything to positionProvider using
 * {@link anychart.elements.MarkersFactory#draw}, this extends positioning options
 * @param {function(*,number):anychart.math.CoordinateObject=} opt_value [function(positionProvider, index) {
 *  return {x: 80 * index, y: 0};
 * }] Function to position marker depending on index and context, it should look like this:
 * <code>function(positionProvider, index) {
 *    ... //do something
 *    return {x: smth, y: smth};
 * }</code>
 * Parameters:<br/>
 * <b>positionProvider</b> - object with information about current (by index) marker position,
 *  this object must contain <b>x</b> and <b>y</b> field (with no offsets taken in account).<br/>
 * <b>index</b> - current marker index.
 * @example
 * var marker = anychart.elements.markersFactory()
 *     .container(stage)
 *     .size(25)
 *     .positionFormatter(function(positionProvider, index) {
 *       return {x: 60 * (1 + index), y: 100 * Math.random() + 60};
 *     })
 *     .anchor('center');
 * for (var i = 0; i < 5; i++)
 *   marker.draw();
 * @return {anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {Function=} opt_value .
 * @return {Function|anychart.elements.MarkersFactory} .
 */
anychart.elements.MarkersFactory.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.positionFormatter_ = opt_value;
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    this.changedSettings['positionFormatter'] = true;
    return this;
  } else {
    return this.positionFormatter_;
  }
};


/**
 * Getter for current position settings of all markers.
 * @return {string} Markers position settings.
 *//**
 * Setter for position settings of all markers.
 * @example
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 10, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 50, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star4')
 *     .position('center')
 *     .container(stage);
 * // sets custom positions
 * MMarker
 *     .positionAt(0, 'leftTop')
 *     .positionAt(3, 'rightbottom');
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   // calculate position
 *   switch (MMarker.positionAt(i) || MMarker.position()) {
 *     case 'center':
 *       positionProvider.x += barBounds.width / 2;
 *       positionProvider.y += barBounds.height / 2;
 *       break;
 *     case 'rightbottom':
 *       positionProvider.x += barBounds.width;
 *       positionProvider.y += barBounds.height;
 *       break;
 *   }
 *   MMarker.draw(positionProvider);
 * }
 * @param {string=} opt_value [{@link anychart.utils.NinePositions}.CENTER] Value to set.
 * @return {anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.NinePositions|string)=} opt_value Markers position settings.
 * @return {anychart.elements.MarkersFactory|anychart.utils.NinePositions|string} Markers position settings or itself for method chaining.
 */
anychart.elements.MarkersFactory.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['position'] = true;
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Getter for anchor settings of all markers.
 * @return {anychart.utils.NinePositions} Current marker anchor settings.
 *//**
 * Setter for anchor settings of all markers.
 * @example <t>simple-h100</t>
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star4')
 *     .fill('blue')
 *     .anchor(anychart.utils.NinePositions.RIGHT_BOTTOM)
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .anchorAt(0, anychart.utils.NinePositions.LEFT_TOP)
 *     .anchorAt(3, anychart.utils.NinePositions.RIGHT_TOP);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   // mark label position with red
 *   stage.circle(positionProvider.x, positionProvider.y, 2).stroke('3 red');
 *   MMarker.draw(positionProvider);
 * }
 * @param {(anychart.utils.NinePositions|string)=} opt_value [{@link anychart.utils.NinePositions}.CENTER] Value to set.
 * @return {!anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.utils.NinePositions|string)=} opt_value .
 * @return {!(anychart.elements.MarkersFactory|anychart.utils.NinePositions|string)} .
 */
anychart.elements.MarkersFactory.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['anchor'] = true;
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Getter for current type settings of all markers.
 * @return {anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path}
 *  Markers type settings.
 *//**
 * Setter for type settings of all markers.
 * @example <t>simple-h100</t>
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star4')
 *     .container(stage);
 * // sets custom positions
 * MMarker
 *     .typeAt(0, 'circle')
 *     .typeAt(3, function(path, x, y, size) {
 *       var point1 = {x: x + 1.7 * size, y: y + 0.6 * size};
 *       var point2 = {x: x, y: y + size / 2};
 *       path.moveTo(point1.x, point1.y)
 *           .arcToByEndPoint(point2.x, point2.y, size, size, true, true)
 *           .arcToByEndPoint(point1.x, point1.y, size / 3, size / 3, false, false)
 *           .moveTo(point1.x, point1.y)
 *           .close();
 *       path.rotate(16);
 *       path.setPosition(x, y).translate(-size, -size);
 *       return path;
 *     });
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {(anychart.elements.Marker.Type|
 *  function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value
 *  [{@link anychart.elements.Marker.Type}.DIAGONAL_CROSS] Type or custom drawer. Function for a custom marker
 *  must look like this: <code>function(path, x, y, size){
 *    // path - acgraph.vector.Path
 *    // x, y - current marker position
 *    // size - marker size
 *    ... //do something
 *    return path;
 *  }</code>.
 * @return {!anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.elements.MarkersFactory|anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path|string} .
 */
anychart.elements.MarkersFactory.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['type'] = true;
    return this;
  } else {
    return this.type_ || this.autoType_ || anychart.elements.Marker.Type.DIAGONAL_CROSS;
  }
};


/**
 * Sets markers type that parent series have set for it.
 * @param {anychart.elements.Marker.Type} value Auto marker type distributed by the series.
 */
anychart.elements.MarkersFactory.prototype.setAutoType = function(value) {
  this.autoType_ = value;
};


/**
 * Getter for current size settings of all markers.
 * @return {number} Markeres size settings.
 *//**
 * Setter for size settings of all markers.
 * @example
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .size(15)
 *     .container(stage);
 * // sets custom positions
 * MMarker
 *     .sizeAt(0, 5)
 *     .sizeAt(3, 10);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {number=} opt_value [10] Value to set.
 * @return {anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {anychart.elements.MarkersFactory|number} .
 */
anychart.elements.MarkersFactory.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['size'] = true;
    return this;
  } else {
    return this.size_;
  }
};


/**
 * Getter for current offsetX settings of all markers.
 * @return {number|string} Marker offsetX settings.
 *//**
 * Setter for offsetX settings of all markers.
 * @example <t>simple-h100</t>
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star4')
 *     .fill('blue')
 *     .offsetX(15)
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .offsetXAt(0, -5);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   // mark marker position with red
 *   stage.circle(positionProvider.x, positionProvider.y, 2).stroke('3 red');
 *   MMarker.draw(positionProvider);
 * }
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.MarkersFactory} .
 */
anychart.elements.MarkersFactory.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['offsetX'] = true;
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Getter for current offsetY settings of all markers.
 * @return {number|string} Markers offsetY settings.
 *//**
 * Setter for offsetY settings of all markers.
 * @example <t>simple-h100</t>
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star4')
 *     .fill('blue')
 *     .offsetY(15)
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .offsetYAt(0, -5);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   // mark position point with red
 *   stage.circle(positionProvider.x, positionProvider.y, 2).stroke('3 red');
 *   MMarker.draw(positionProvider);
 * }
 * @param {(number|string)=} opt_value [0] Value to set.
 * @return {!anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.MarkersFactory} .
 */
anychart.elements.MarkersFactory.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['offsetY'] = true;
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter for current fill settings of all markers.
 * @return {acgraph.vector.Fill|string} Markeres fill settings.
 *//**
 * Setter for fill settings of all markers.<br/>
 * <b>Note:</b> fill is described at
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star4')
 *     .fill('green')
 *     .size('14')
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .fillAt(0, ['red', 'orange']);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {(acgraph.vector.Fill|string)=} opt_value ['black'] Value to set.
 * @return {!anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|string|anychart.elements.MarkersFactory} .
 */
anychart.elements.MarkersFactory.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.fill_ != color) {
      this.fill_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    this.changedSettings['fill'] = true;
    return this;
  } else {
    return this.fill_ || this.autoFill_ || 'black';
  }
};


/**
 * Sets markers fill that parent series have set for it.
 * @param {acgraph.vector.Fill} value Auto fill distributed by the series.
 */
anychart.elements.MarkersFactory.prototype.setAutoFill = function(value) {
  this.autoFill_ = value;
};


/**
 * Getter for current stroke settings of all markers.
 * @return {acgraph.vector.Stroke|string} Markers fill settings.
 *//**
 * Setter for stroke settings of all markers.<br/>
 * <b>Note:</b> stroke is described at
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}
 * @example <t>simple-h100</t>
 * // create objects for markers factory
 * var bars = [];
 * bars.push(
 *     stage.rect(10, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(110, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(210, 30, 75, 125).stroke('1 #aaa').fill('#eee'),
 *     stage.rect(310, 30, 75, 125).stroke('1 #aaa').fill('#eee')
 * );
 * // sets global settings
 * var MMarker = anychart.elements.markersFactory()
 *     .type('star4')
 *     .fill('none')
 *     .stroke('4px green .5')
 *     .size('14')
 *     .container(stage);
 * // sets custom anchor
 * MMarker
 *     .strokeAt(0, ['red', 'orange']);
 * // connecting markers and objects
 * for (i in bars) {
 *   var barBounds = bars[i].getBounds();
 *   var positionProvider = {
 *     x: barBounds.left+barBounds.width/2,
 *     y: barBounds.top
 *   };
 *   MMarker.draw(positionProvider);
 * }
 * @param {(acgraph.vector.Stroke|string)=} opt_value ['black'] Value to set.
 * @return {!anychart.elements.MarkersFactory} {@link anychart.elements.MarkersFactory} for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. If empty - set to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|string|anychart.elements.MarkersFactory} .
 */
anychart.elements.MarkersFactory.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.stroke_ != color) {
      this.stroke_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    this.changedSettings['stroke'] = true;
    return this;
  } else {
    return this.stroke_ || this.autoStroke_ || 'none';
  }
};


/**
 * Sets markers stroke that parent series have set for it.
 * @param {acgraph.vector.Stroke} value Auto stroke distributed by the series.
 */
anychart.elements.MarkersFactory.prototype.setAutoStroke = function(value) {
  this.autoStroke_ = value;
};


/**
 * Specifies under what circumstances a given graphics element can be the target element for a pointer event.
 * @param {boolean=} opt_value Pointer events property value.
 * @return {anychart.elements.MarkersFactory|boolean} If opt_value defined then returns Element object for chaining else
 * pointer events property value.
 */
anychart.elements.MarkersFactory.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.disablePointerEvents_ = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.disablePointerEvents_;
};


/**
 * Возвращает баунды отностительно которых идут рассчеты позиционирования элемента.
 * @return {anychart.math.Rect} Current parent bounds.
 *//**
 * Устанавливает баунды отностительно которых идут рассчеты offsets, если они заданы в процентах.
 * @param {anychart.math.Rect=} opt_value [null] Value to set.
 * @return {!anychart.elements.MarkersFactory} Экземпляр класса {@link anychart.elements.MarkersFactory} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.MarkersFactory|anychart.math.Rect} .
 */
anychart.elements.MarkersFactory.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * MarkersFactory serialization.
 * @return {Object} Serialized data.
 */
anychart.elements.MarkersFactory.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');

  data['position'] = this.position();
  data['anchor'] = this.anchor();
  data['type'] = this.type();
  data['size'] = this.size();
  data['offsetX'] = this.offsetX();
  data['offsetY'] = this.offsetY();
  data['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  data['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));

  return data;
};


/**
 * @inheritDoc
 */
anychart.elements.MarkersFactory.prototype.deserialize = function(data) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', data);

  this.position(data['position']);
  this.anchor(data['anchor']);
  this.type(data['type']);
  this.size(data['size']);
  this.offsetX(data['offsetX']);
  this.offsetY(data['offsetY']);
  this.fill(data['fill']);
  this.stroke(data['stroke']);

  this.resumeSignalsDispatching(true);

  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Measure.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculates bounds for the current marker, they can be used, for example, to check overlap.
 * @param {*} positionProvider Object with information about marker with current index,
 *  it must contain <b>x</b> and <b>y</b> fields (with no offsets taken in account).
 *  You can add any custom information of needed.
 * @return {anychart.math.Rect} Markers bounds.
 */
anychart.elements.MarkersFactory.prototype.measure = function(positionProvider) {
  var parentWidth, parentHeight, drawer;

  if (!this.measureMarkerElement_) this.measureMarkerElement_ = acgraph.path();

  //define parent bounds
  if (this.parentBounds_) {
    parentWidth = this.parentBounds_.width;
    parentHeight = this.parentBounds_.height;
  }

  var type = this.type();
  var size = /** @type {number} */(this.size());
  var anchor = /** @type {anychart.utils.NinePositions} */(this.anchor());
  var offsetX = /** @type {number} */(this.offsetX());
  var offsetY = /** @type {number} */(this.offsetY());

  drawer = goog.isString(type) ?
      anychart.elements.Marker.getMarkerDrawer(/** @type {anychart.elements.Marker.Type}*/(type)) :
      type;

  this.measureMarkerElement_.clear();
  drawer.call(this, this.measureMarkerElement_, 0, 0, size);

  var markerBounds = /** @type {anychart.math.Rect} */(this.measureMarkerElement_.getBounds());
  var formattedPosition = goog.object.clone(this.positionFormatter_.call(positionProvider, positionProvider));
  var position = new acgraph.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new acgraph.math.Rect(0, 0, markerBounds.width, markerBounds.height),
      anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetXNorm = goog.isDef(this.offsetX_) ? anychart.utils.normalize(offsetX, parentWidth) : 0;
  var offsetYNorm = goog.isDef(this.offsetY_) ? anychart.utils.normalize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNorm, offsetYNorm);

  markerBounds.left = position.x;
  markerBounds.top = position.y;

  return markerBounds;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Очищает массив созданных маркеров.
 * @return {anychart.elements.MarkersFactory} Returns itself for chaining.
 */
anychart.elements.MarkersFactory.prototype.clear = function() {
  if (!this.freeToUseMarkersPool_)
    this.freeToUseMarkersPool_ = [];

  if (this.markers_) {
    goog.array.forEach(this.markers_, function(marker) {
      marker.clear();
      this.freeToUseMarkersPool_.push(marker);
    }, this);
  }

  this.markers_ = [];
  return this;
};


/**
 * Возвращает маркер по его индексу, если он существует.
 * @param {number} index Marker index.
 * @return {anychart.elements.MarkersFactory.Marker|undefined} Already existing label.
 */
anychart.elements.MarkersFactory.prototype.getMarker = function(index) {
  index = +index;
  return this.markers_ && this.markers_[index] ? this.markers_[index] : null;
};


/**
 * Возвращает объект с состояниями изменений настроек.
 * @return {Object}
 */
anychart.elements.MarkersFactory.prototype.getSettingsChangedStatesObj = function() {
  return this.changedSettings;
};


/**
 * Return DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.elements.MarkersFactory.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Добавляет новый маркер и добавляет в последовательность с учетом positionProvider.<br/>
 * @param {*} positionProvider Объект, содержащий информацию о позиционировании маркера с текщим индеком, который в
 *  обязательном порядке содержит поля <b>x</b> и <b>y</b>, не учитывающие настройки позиционирования offsets. Также
 *  может содержать любую иную информацию, которую Вы сами можете обрабатывать.
 * @param {number=} opt_index Marker index.
 * @return {!anychart.elements.MarkersFactory.Marker} Возвращает добавленный маркер.
 */
anychart.elements.MarkersFactory.prototype.add = function(positionProvider, opt_index) {
  var marker, index;
  if (!goog.isDef(this.markers_)) this.markers_ = [];

  if (goog.isDef(opt_index)) {
    index = +opt_index;
    marker = this.markers_[index];
  }

  if (marker) {
    marker.clear();
  } else {
    marker = this.freeToUseMarkersPool_ && this.freeToUseMarkersPool_.length > 0 ?
        this.freeToUseMarkersPool_.pop() :
        new anychart.elements.MarkersFactory.Marker();

    if (goog.isDef(index)) {
      this.markers_[index] = marker;
      marker.setIndex(index);
    } else {
      this.markers_.push(marker);
      marker.setIndex(this.markers_.length - 1);
    }
  }

  marker.positionProvider(positionProvider);
  marker.parentMarkersFactory(this);

  return marker;
};


/**
 * Markers drawing.
 * @return {anychart.elements.MarkersFactory} Returns itself for chaining.
 */
anychart.elements.MarkersFactory.prototype.draw = function() {
  if (!this.layer_) this.layer_ = acgraph.layer();
  this.layer_.disablePointerEvents(/** @type {boolean} */(this.disablePointerEvents()));

  var stage = this.layer_.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.markers_) {
    goog.array.forEach(this.markers_, function(marker, index) {
      if (marker) {
        marker.container(this.layer_);
        marker.draw();

        if (this.hasInvalidationState(anychart.ConsistencyState.HANDLERS)) {
          for (var type in anychart.elements.MarkersFactory.HANDLED_EVENT_TYPES_) {

            var element = marker.getDomElement();
            if (element) {
              element['__tagIndex'] = index;
              var code = anychart.elements.MarkersFactory.HANDLED_EVENT_TYPES_[type];
              if (!!(this.attachedEvents_ & code))
                element.listen(type, this.handleBrowserEvent_, false, this);
              else if (!!(this.attachedOnceEvents_ & code))
                element.listenOnce(type, this.handleBrowserEvent_, false, this);
              else
                element.unlisten(type, this.handleBrowserEvent_, false, this);

              code = code << acgraph.vector.Element.HANDLED_EVENT_TYPES_CAPTURE_SHIFT;
              if (!!(this.attachedEvents_ & code))
                element.listen(type, this.handleBrowserEvent_, true, this);
              else if (!!(this.attachedOnceEvents_ & code))
                element.listenOnce(type, this.handleBrowserEvent_, true, this);
              else
                element.unlisten(type, this.handleBrowserEvent_, true, this);
            }
          }
          this.attachedOnceEvents_ = 0x00;
        }
      }
    }, this);

  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.markConsistent(anychart.ConsistencyState.ALL);

  if (manualSuspend) stage.resume();
  return this;
};


/**
 * Disposing.
 */
anychart.elements.MarkersFactory.prototype.disposeInternal = function() {
  if (this.layer_) this.layer_.dispose();
  this.layer_ = null;
  this.positionFormatter_ = null;
  this.measureMarkerElement_ = null;

  goog.base(this, 'disposeInternal');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.MarkersFactory.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'listen', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, true, false);
  return res;
};


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.MarkersFactory.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'listenOnce', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, true, true);
  return res;
};


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
anychart.elements.MarkersFactory.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'unlisten', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, false, false);
  return res;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
anychart.elements.MarkersFactory.prototype.unlistenByKey = function(key) {
  var res = goog.base(this, 'unlistenByKey', key);
  if (res)
    this.ensureHandler_(key.type, key.capture, false, false);
  return res;
};


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
anychart.elements.MarkersFactory.prototype.removeAllListeners = function(opt_type) {
  var res = goog.base(this, 'removeAllListeners', opt_type);
  if (res) {
    if (opt_type) {
      this.ensureHandler_(/** @type {string} */(opt_type), false, false, false);
      this.ensureHandler_(/** @type {string} */(opt_type), true, false, false);
    } else {
      this.removeAllHandlers_();
    }
  }
  return res;
};


/**
 * Synchronizes Element and DOM handlers. Should be called after all handler operations on the Element are finished.
 * @param {string} type Event type string.
 * @param {boolean} capture If event should be listened on capture.
 * @param {boolean} armed If this handler should be armed or not.
 * @param {boolean=} opt_once Use listenOnce.
 * @private
 */
anychart.elements.MarkersFactory.prototype.ensureHandler_ = function(type, capture, armed, opt_once) {
  opt_once = !!opt_once && armed;
  /** @type {number} */
  var eventTypeCode = acgraph.vector.Element.HANDLED_EVENT_TYPES[type] || 0;
  if (capture)
    eventTypeCode = eventTypeCode << acgraph.vector.Element.HANDLED_EVENT_TYPES_CAPTURE_SHIFT;
  if (eventTypeCode) {
    var changed = false;
    /** @type {boolean} */
    var eventAttached = !!(this.attachedEvents_ & eventTypeCode);
    if (opt_once) {
      eventAttached = !!(this.attachedOnceEvents_ & eventTypeCode);
      if (armed && !eventAttached) {
        this.attachedOnceEvents_ |= eventTypeCode;
        changed = true;
      }
    } else {
      if (armed && !eventAttached) {
        this.attachedEvents_ |= eventTypeCode;
        changed = true;
      } else if (!armed && eventAttached) {
        this.attachedEvents_ &= ~eventTypeCode;
        this.attachedOnceEvents_ &= ~eventTypeCode;
        changed = true;
      }
    }
    if (changed)
      this.invalidate(anychart.ConsistencyState.HANDLERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Synchronizes Element and DOM handlers. Should be called after all handler operations on the Element are finished.
 * @private
 */
anychart.elements.MarkersFactory.prototype.removeAllHandlers_ = function() {
  var changed = !!(this.attachedEvents_ | this.attachedOnceEvents_);
  this.attachedEvents_ = 0;
  this.attachedOnceEvents_ = 0;
  if (changed)
    this.invalidate(anychart.ConsistencyState.HANDLERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles most of browser events happened with underlying DOM element redirecting them to
 * Element event listeners. Event.target property value is replaced by this method.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
anychart.elements.MarkersFactory.prototype.handleBrowserEvent_ = function(e) {
  if (e instanceof goog.events.BrowserEvent) {
    e.stopPropagation();
    var target = this.getMarker(e.target && e.target['__tagIndex']);
    if (target)
      this.dispatchEvent(new anychart.elements.MarkersFactory.BrowserEvent(e, target));
  }
};



/**
 * Encapsulates browser event for acgraph.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.elements.MarkersFactory.BrowserEvent = function(opt_e, opt_target) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, opt_target);
};
goog.inherits(anychart.elements.MarkersFactory.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.elements.MarkersFactory.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.elements.MarkersFactory.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  this.type = e.type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this['markerIndex'] = e.target && e.target['__tagIndex'];
  if (isNaN(this['markerIndex']))
    this['markerIndex'] = -1;

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



/**
 *
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.MarkersFactory.Marker = function() {
  goog.base(this);

  /**
   * Label index.
   * @type {number}
   * @private
   */
  this.index_;

  /**
   * @type {acgraph.vector.Element}
   * @private
   */
  this.markerElement_;

  /**
   *
   * @type {Object.<string, boolean>}
   */
  this.settingsObj = {};

  this.resetSettings();
};
goog.inherits(anychart.elements.MarkersFactory.Marker, anychart.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.MarkersFactory.Marker.prototype.SUPPORTED_SIGNALS = anychart.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.MarkersFactory.Marker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


/**
 * Возвращает DOM элемент маркера.
 * @return {acgraph.vector.Element}
 */
anychart.elements.MarkersFactory.Marker.prototype.getDomElement = function() {
  return this.markerElement_;
};


/**
 * Устанавливает/возвращает родительскую фабрику для марукра.
 * @param {!anychart.elements.MarkersFactory=} opt_value Markers factory.
 * @return {anychart.elements.MarkersFactory|anychart.elements.MarkersFactory.Marker} Возвращает фабрику маркеров или
 * себя для цеПочечных вызовов.
 */
anychart.elements.MarkersFactory.Marker.prototype.parentMarkersFactory = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.parentMarkersFactory_ != opt_value) {
      this.parentMarkersFactory_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.parentMarkersFactory_;
  }
};


/**
 * Устанавливает/возвращает текущую фабрику для маркера, из которой должны быть взяты настройки.
 * @param {anychart.elements.MarkersFactory=} opt_value Markes factory.
 * @return {anychart.elements.MarkersFactory|anychart.elements.MarkersFactory.Marker} Возвращает фабрику маркеров или
 * себя для цеПочечных вызовов.
 */
anychart.elements.MarkersFactory.Marker.prototype.currentMarkersFactory = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.currentMarkersFactory_ != opt_value) {
      this.currentMarkersFactory_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.currentMarkersFactory_;
  }
};


/**
 * Returns markers index.
 * @return {number}
 */
anychart.elements.MarkersFactory.Marker.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets markers index.
 * @param {number} index Index to set.
 * @return {anychart.elements.MarkersFactory.Marker}
 */
anychart.elements.MarkersFactory.Marker.prototype.setIndex = function(index) {
  this.index_ = +index;
  return this;
};


/**
 * Gets/Sets position formatter.
 * @param {*=} opt_value Position formatter.
 * @return {*} Position formatter or itself for chaining.
 */
anychart.elements.MarkersFactory.Marker.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.positionFormatter_ != opt_value) {
      this.settingsObj.positionFormatter_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.settingsObj.positionFormatter_;
  }
};


/**
 * Gets/Sets position provider.
 * @param {*=} opt_value Position provider.
 * @return {*} Position provider or itself for chaining.
 */
anychart.elements.MarkersFactory.Marker.prototype.positionProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.positionProvider_ != opt_value) {
      this.positionProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.positionProvider_;
  }
};


/**
 * Getter for current position settings of all markers.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Markers position settings.
 * @return {anychart.elements.MarkersFactory.Marker|anychart.utils.NinePositions|string} Markers position settings or itself for chaining call.
 */
anychart.elements.MarkersFactory.Marker.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.settingsObj.position_ != opt_value) {
      this.settingsObj.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.position_;
  }
};


/**
 * Getter for anchor settings of all markers.
 * @param {(anychart.utils.NinePositions|string)=} opt_value .
 * @return {!(anychart.elements.MarkersFactory.Marker|anychart.utils.NinePositions|string)} .
 */
anychart.elements.MarkersFactory.Marker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizePosition(opt_value);
    if (this.settingsObj.anchor_ != opt_value) {
      this.settingsObj.anchor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.anchor_;
  }
};


/**
 * Getter for current type settings of all markers.
 * @param {(anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.elements.MarkersFactory.Marker|anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path|string} .
 */
anychart.elements.MarkersFactory.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.type_ != opt_value) {
      this.settingsObj.type_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.type_;
  }
};


/**
 * Getter for current size settings of all markers.
 * @param {number=} opt_value .
 * @return {anychart.elements.MarkersFactory.Marker|number} .
 */
anychart.elements.MarkersFactory.Marker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.size_ != opt_value) {
      this.settingsObj.size_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.size_;
  }
};


/**
 * Getter for current offsetX settings of all markers.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.MarkersFactory.Marker} .
 */
anychart.elements.MarkersFactory.Marker.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.offsetX_ != opt_value) {
      this.settingsObj.offsetX_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.offsetX_;
  }
};


/**
 * Getter for current offsetY settings of all markers.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.elements.MarkersFactory.Marker} .
 */
anychart.elements.MarkersFactory.Marker.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.offsetY_ != opt_value) {
      this.settingsObj.offsetY_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.offsetY_;
  }
};


/**
 * Getter for current fill settings of all markers.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|string|anychart.elements.MarkersFactory.Marker} .
 */
anychart.elements.MarkersFactory.Marker.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.settingsObj.fill_ != color) {
      this.settingsObj.fill_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.fill_;
  }
};


/**
 * Getter for current stroke settings of all markers.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|string|anychart.elements.MarkersFactory.Marker} .
 */
anychart.elements.MarkersFactory.Marker.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.settingsObj.stroke_ != color) {
      this.settingsObj.stroke_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.stroke_ || (this.fill() && anychart.color.darken(/** @type {acgraph.vector.Fill} */(this.fill())));
  }
};


/** @inheritDoc */
anychart.elements.MarkersFactory.Marker.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.enabledLabel_ != opt_value) {
      this.settingsObj.enabledLabel_ = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.enabledLabel_;
  }
};


/**
 * Приводит маркер в исходное состояние, но оставляет созданные DOM эелемнты, только очищает у них родителя.
 */
anychart.elements.MarkersFactory.Marker.prototype.clear = function() {
  this.resetSettings();
  if (this.markerElement_) this.markerElement_.parent(null);
  this.invalidate(anychart.ConsistencyState.CONTAINER);
};


/**
 * Reset settings.
 */
anychart.elements.MarkersFactory.Marker.prototype.resetSettings = function() {
  this.settingsObj = {};
  this.superSettingsObj = {};
};


/**
 * Sets settings.
 * @param {Object=} opt_settings1 Settings1.
 * @param {Object=} opt_settings2 Settings2.
 * @return {anychart.elements.MarkersFactory.Marker} Returns self for chaining.
 */
anychart.elements.MarkersFactory.Marker.prototype.setSettings = function(opt_settings1, opt_settings2) {
  if (goog.isDef(opt_settings1)) {
    this.deserialize(opt_settings1);
  }
  if (goog.isDef(opt_settings2)) this.superSettingsObj = opt_settings2;

  this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
      anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Мержинг настроек лейбла.
 * @param {*} pointSettings Кастомная настройка из точки.
 * @param {*} pointSuperSettings Кастомная настройка из точки (Обычно это насройка для хавер лейблов).
 * @param {*} factorySettings Настройка из родительской фабрики.
 * @param {*} factorySuperSettings Настройка из текущей фабрики.
 * @param {boolean} isFactorySettingsChanged
 * @return {*} Возвращает финальную настройку.
 * @private
 */
anychart.elements.MarkersFactory.Marker.prototype.getFinalSettings_ = function(pointSettings, pointSuperSettings,
                                                                               factorySettings,
                                                                               factorySuperSettings,
                                                                               isFactorySettingsChanged) {
  var notSelfSettings = this.currentMarkersFactory() && this.parentMarkersFactory() != this.currentMarkersFactory();

  return notSelfSettings ?
      goog.isDef(pointSuperSettings) ?
          pointSuperSettings :
          isFactorySettingsChanged ?
              factorySuperSettings :
              goog.isDef(pointSettings) ?
                  pointSettings :
                  factorySettings :
      goog.isDef(pointSettings) ?
          pointSettings :
          factorySettings;
};


/**
 * Marker drawing.
 * @return {anychart.elements.MarkersFactory.Marker}
 */
anychart.elements.MarkersFactory.Marker.prototype.draw = function() {
  var parentMarkersFactory = this.parentMarkersFactory();
  var currentMarkersFactory = this.currentMarkersFactory() ? this.currentMarkersFactory() : parentMarkersFactory;
  var settingsChangedStates;
  var notSelfSettings = currentMarkersFactory != parentMarkersFactory;
  if (notSelfSettings)
    settingsChangedStates = currentMarkersFactory.getSettingsChangedStatesObj();
  if (!this.markerElement_) this.markerElement_ = acgraph.path();

  var enabled = this.getFinalSettings_(
      this.enabled(),
      this.superSettingsObj['enabled'],
      parentMarkersFactory.enabled(),
      currentMarkersFactory.enabled(),
      currentMarkersFactory.enabled());

  if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
    if (!enabled) {
      this.markerElement_.parent(null);
      this.markConsistent(anychart.ConsistencyState.ALL);
      return this;
    } else {
      if (this.container())
        this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (enabled) {
      if (parentMarkersFactory.getDomElement()) {
        if (!this.container()) this.container(/** @type {acgraph.vector.ILayer} */(parentMarkersFactory.getDomElement()));
        if (!this.container().parent()) {
          this.container().parent(/** @type {acgraph.vector.ILayer} */(parentMarkersFactory.container()));
        }
      }
      if (this.container())
        this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    }
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    if (this.container()) this.container().zIndex(/** @type {number} */(parentMarkersFactory.zIndex()));
    this.markerElement_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var anchor = this.getFinalSettings_(
        this.anchor(),
        this.superSettingsObj['anchor'],
        parentMarkersFactory.anchor(),
        currentMarkersFactory.anchor(),
        !!(settingsChangedStates && settingsChangedStates['anchor']));

    var type = this.getFinalSettings_(
        this.type(),
        this.superSettingsObj['type'],
        parentMarkersFactory.type(),
        currentMarkersFactory.type(),
        !!(settingsChangedStates && settingsChangedStates['type']));

    var size = this.getFinalSettings_(
        this.size(),
        this.superSettingsObj['size'],
        parentMarkersFactory.size(),
        currentMarkersFactory.size(),
        !!(settingsChangedStates && settingsChangedStates['size']));

    var offsetY = this.getFinalSettings_(
        this.offsetY(),
        this.superSettingsObj['offsetY'],
        parentMarkersFactory.offsetY(),
        currentMarkersFactory.offsetY(),
        !!(settingsChangedStates && settingsChangedStates['offsetY']));

    var offsetX = this.getFinalSettings_(
        this.offsetX(),
        this.superSettingsObj['offsetX'],
        parentMarkersFactory.offsetX(),
        currentMarkersFactory.offsetX(),
        !!(settingsChangedStates && settingsChangedStates['offsetX']));

    var fill = this.getFinalSettings_(
        this.fill(),
        this.superSettingsObj['fill'],
        parentMarkersFactory.fill(),
        currentMarkersFactory.fill(),
        !!(settingsChangedStates && settingsChangedStates['fill']));

    var stroke = this.getFinalSettings_(
        this.stroke(),
        this.superSettingsObj['stroke'],
        parentMarkersFactory.stroke(),
        currentMarkersFactory.stroke(),
        !!(settingsChangedStates && settingsChangedStates['stroke']));

    var positionFormatter = this.getFinalSettings_(
        this.positionFormatter(),
        this.superSettingsObj['positionFormatter'],
        parentMarkersFactory.positionFormatter(),
        currentMarkersFactory.positionFormatter(),
        !!(settingsChangedStates && settingsChangedStates['positionFormatter']));

    var drawer = goog.isString(type) ?
        anychart.elements.Marker.getMarkerDrawer(/** @type {anychart.elements.Marker.Type} */(type)) :
        type;

    //define parent bounds
    var parentWidth, parentHeight;
    if (this.parentBounds_) {
      parentWidth = this.parentBounds_.width;
      parentHeight = this.parentBounds_.height;
    }

    this.markerElement_.clear();
    this.markerElement_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

    drawer.call(this, this.markerElement_, 0, 0, size);
    var markerBounds = this.markerElement_.getBounds();

    var positionProvider = this.positionProvider();
    var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
    var position = new acgraph.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, markerBounds.width, markerBounds.height),
        /** @type {anychart.utils.NinePositions} */(anchor));

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetXNorm = goog.isDef(offsetX) ? anychart.utils.normalize(/** @type {string|number} */(offsetX), parentWidth) : 0;
    var offsetYNorm = goog.isDef(offsetY) ? anychart.utils.normalize(/** @type {string|number} */(offsetY), parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, /** @type {anychart.utils.NinePositions} */(anchor), offsetXNorm, offsetYNorm);

    markerBounds.left = position.x + markerBounds.width / 2;
    markerBounds.top = position.y + markerBounds.height / 2;

    this.markerElement_.clear();
    drawer.call(this, this.markerElement_, markerBounds.left, markerBounds.top, size);

    this.markerElement_.fill(fill);
    this.markerElement_.stroke(stroke);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  return this;
};


/** @inheritDoc */
anychart.elements.MarkersFactory.Marker.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['type'] = this.type();
  json['size'] = this.size();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill|string} */(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke|string} */(this.stroke()));

  return json;
};


/** @inheritDoc */
anychart.elements.MarkersFactory.Marker.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  this.position(config['position']);
  this.anchor(config['anchor']);
  this.type(config['type']);
  this.size(config['size']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);

  this.resumeSignalsDispatching(true);
  return goog.base(this, 'deserialize', config);
};


/**
 * Constructor function.
 * @return {!anychart.elements.MarkersFactory}
 */
anychart.elements.markersFactory = function() {
  return new anychart.elements.MarkersFactory();
};


//exports
goog.exportSymbol('anychart.elements.markersFactory', anychart.elements.markersFactory);
anychart.elements.MarkersFactory.prototype['positionFormatter'] = anychart.elements.MarkersFactory.prototype.positionFormatter;
anychart.elements.MarkersFactory.prototype['position'] = anychart.elements.MarkersFactory.prototype.position;
anychart.elements.MarkersFactory.prototype['anchor'] = anychart.elements.MarkersFactory.prototype.anchor;
anychart.elements.MarkersFactory.prototype['offsetX'] = anychart.elements.MarkersFactory.prototype.offsetX;
anychart.elements.MarkersFactory.prototype['offsetY'] = anychart.elements.MarkersFactory.prototype.offsetY;
anychart.elements.MarkersFactory.prototype['type'] = anychart.elements.MarkersFactory.prototype.type;
anychart.elements.MarkersFactory.prototype['size'] = anychart.elements.MarkersFactory.prototype.size;
anychart.elements.MarkersFactory.prototype['fill'] = anychart.elements.MarkersFactory.prototype.fill;
anychart.elements.MarkersFactory.prototype['stroke'] = anychart.elements.MarkersFactory.prototype.stroke;
anychart.elements.MarkersFactory.prototype['disablePointerEvents'] = anychart.elements.MarkersFactory.prototype.disablePointerEvents;
anychart.elements.MarkersFactory.prototype['serialize'] = anychart.elements.MarkersFactory.prototype.serialize;
anychart.elements.MarkersFactory.prototype['deserialize'] = anychart.elements.MarkersFactory.prototype.deserialize;
anychart.elements.MarkersFactory.prototype['add'] = anychart.elements.MarkersFactory.prototype.add;
anychart.elements.MarkersFactory.prototype['draw'] = anychart.elements.MarkersFactory.prototype.draw;
anychart.elements.MarkersFactory.prototype['clear'] = anychart.elements.MarkersFactory.prototype.clear;
anychart.elements.MarkersFactory.prototype['measure'] = anychart.elements.MarkersFactory.prototype.measure;
anychart.elements.MarkersFactory.prototype['enabled'] = anychart.elements.MarkersFactory.prototype.enabled;
anychart.elements.MarkersFactory.Marker.prototype['positionFormatter'] = anychart.elements.MarkersFactory.Marker.prototype.positionFormatter;
anychart.elements.MarkersFactory.Marker.prototype['position'] = anychart.elements.MarkersFactory.Marker.prototype.position;
anychart.elements.MarkersFactory.Marker.prototype['anchor'] = anychart.elements.MarkersFactory.Marker.prototype.anchor;
anychart.elements.MarkersFactory.Marker.prototype['offsetX'] = anychart.elements.MarkersFactory.Marker.prototype.offsetX;
anychart.elements.MarkersFactory.Marker.prototype['offsetY'] = anychart.elements.MarkersFactory.Marker.prototype.offsetY;
anychart.elements.MarkersFactory.Marker.prototype['type'] = anychart.elements.MarkersFactory.Marker.prototype.type;
anychart.elements.MarkersFactory.Marker.prototype['size'] = anychart.elements.MarkersFactory.Marker.prototype.size;
anychart.elements.MarkersFactory.Marker.prototype['fill'] = anychart.elements.MarkersFactory.Marker.prototype.fill;
anychart.elements.MarkersFactory.Marker.prototype['stroke'] = anychart.elements.MarkersFactory.Marker.prototype.stroke;
anychart.elements.MarkersFactory.Marker.prototype['enabled'] = anychart.elements.MarkersFactory.Marker.prototype.enabled;
anychart.elements.MarkersFactory.Marker.prototype['serialize'] = anychart.elements.MarkersFactory.Marker.prototype.serialize;
anychart.elements.MarkersFactory.Marker.prototype['deserialize'] = anychart.elements.MarkersFactory.Marker.prototype.deserialize;
anychart.elements.MarkersFactory.Marker.prototype['draw'] = anychart.elements.MarkersFactory.Marker.prototype.draw;
anychart.elements.MarkersFactory.Marker.prototype['clear'] = anychart.elements.MarkersFactory.Marker.prototype.clear;
anychart.elements.MarkersFactory.Marker.prototype['getIndex'] = anychart.elements.MarkersFactory.Marker.prototype.getIndex;
