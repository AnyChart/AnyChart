goog.provide('anychart.elements.Marker');



/**
 * @constructor
 * @extends {anychart.elements.Base}
 */
anychart.elements.Marker = function() {
  goog.base(this);

  /**
   * Type of marker.
   * @type {(anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
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
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Marker stroke settings.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Marker anchor settings.
   * @type {anychart.utils.NinePositions}
   * @private
   */
  this.anchor_;

  /**
   * Marker position
   * @type {anychart.math.Coordinate}
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
   * @type {acgraph.vector.Path}
   * @private
   */
  this.markerElement_;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_;
  this.restoreDefaults();
  this.silentlyInvalidate(anychart.utils.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Marker, anychart.elements.Base);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Marker.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.DISPATCHED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.POSITION |
    anychart.utils.ConsistencyState.APPEARANCE |
    anychart.utils.ConsistencyState.DATA;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Marker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.utils.ConsistencyState.POSITION |
    anychart.utils.ConsistencyState.APPEARANCE |
    anychart.utils.ConsistencyState.DATA;


/**
 * Markers type.
 * @enum {string}
 */
anychart.elements.Marker.Type = {
  STAR4: 'star4',
  STAR5: 'star5',
  STAR6: 'star6',
  STAR7: 'star7',
  STAR10: 'star10',
  TRIANGLE_UP: 'triangleup',
  TRIANGLE_DOWN: 'triangledown',
  CROSS: 'cross',
  DIAMOND: 'diamond',
  DIAGONAL_CROSS: 'diagonalcross',
  CIRCLE: 'circle',
  SQUARE: 'square'
};


/**
 * Method to get marker drawer.
 * @param {anychart.elements.Marker.Type} type Marker type.
 * @return {function(acgraph.vector.Path, number, number, number):acgraph.vector.Path} Marker drawer.
 */
anychart.elements.Marker.getMarkerDrawer = function(type) {
  // default drawer
  var drawer = acgraph.vector.primitives.star5;
  switch (type) {
    case 'star4':
      drawer = acgraph.vector.primitives.star4;
      break;
    case 'star6':
      drawer = acgraph.vector.primitives.star6;
      break;
    case 'star7':
      drawer = acgraph.vector.primitives.star7;
      break;
    case 'star10':
      drawer = acgraph.vector.primitives.star10;
      break;
    case 'diamond':
      drawer = acgraph.vector.primitives.diamond;
      break;
    case 'triangleup':
      drawer = acgraph.vector.primitives.triangleUp;
      break;
    case 'triangledown':
      drawer = acgraph.vector.primitives.triangleDown;
      break;
    case 'cross':
      drawer = acgraph.vector.primitives.cross;
      break;
    case 'diagonalcross':
      drawer = acgraph.vector.primitives.diagonalCross;
      break;
    case 'circle':
      drawer = function(path, x, y, radius) {
        return acgraph.vector.primitives.pie(path, x, y, radius, 0, 360);
      };
      break;
    case 'square':
      drawer = function(path, x, y, size) {
        var left = x - size;
        var top = y - size;
        var right = left + size * 2;
        var bottom = top + size * 2;

        path
            .moveTo(left, top)
            .lineTo(right, top)
            .lineTo(right, bottom)
            .lineTo(left, bottom)
            .lineTo(left, top)
            .close();

        return path;
      };
      break;
  }
  return drawer;
};


/**
 * Gets or sets marker position settings.
 * @param {anychart.math.Coordinate=} opt_value Markers position settings.
 * @return {anychart.elements.Marker|anychart.math.Coordinate} Marker position settings or itself for chaining call.
 */
anychart.elements.Marker.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Gets or sets marker anchor settings.
 * @param {(anychart.utils.NinePositions|string)=} opt_value Markers anchor settings.
 * @return {anychart.elements.Marker|anychart.utils.NinePositions} Markers anchor settings or itself for chaining call.
 */
anychart.elements.Marker.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeNinePositions(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Gets or sets marker type settings.
 * @param {(anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value
 * Type or custom drawer.
 * @return {anychart.elements.Marker.Type|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path|
 * anychart.elements.Marker} Markers type settings or itself
 * for chaining call.
 */
anychart.elements.Marker.prototype.type = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.type_ != opt_value) {
      this.type_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.DATA | anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.type_;
  }
};


/**
 * Gets or sets marker size settings.
 * @param {number=} opt_value Marker size.
 * @return {number|anychart.elements.Marker} Markers size settings or itself for chaining call.
 */
anychart.elements.Marker.prototype.size = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.size_ != opt_value) {
      this.size_ = opt_value;
      this.invalidate(
          anychart.utils.ConsistencyState.POSITION | anychart.utils.ConsistencyState.DATA
      );
    }
    return this;
  } else {
    return this.size_;
  }
};


/**
 * Gets or sets marker fill settings.
 * @param {acgraph.vector.Fill=} opt_value Marker fill.
 * @return {acgraph.vector.Fill|anychart.elements.Marker} Markers fill settings or itself for chaining call.
 */
anychart.elements.Marker.prototype.fill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.fill_ != opt_value) {
      this.fill_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.fill_;
  }
};


/**
 * Gets or sets marker stroke settings.
 * @param {acgraph.vector.Stroke=} opt_value Marker stroke.
 * @return {acgraph.vector.Stroke|anychart.elements.Marker} Markers stroke settings or itself for chaining call.
 */
anychart.elements.Marker.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.stroke_ != opt_value) {
      this.stroke_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.APPEARANCE);
    }
    return this;
  } else {
    return this.stroke_;
  }
};


/**
 * Gets or sets marker offsetX settings.
 * @param {(number|string)=} opt_value Marker offsetX settings to set.
 * @return {number|string|anychart.elements.Marker} Marker offsetX value or itself for chaining call.
 */
anychart.elements.Marker.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Gets or sets marker offsetY settings.
 * @param {(number|string)=} opt_value Marker offsetY settings to set.
 * @return {number|string|anychart.elements.Marker} Marker offsetY value or itself for chaining call.
 */
anychart.elements.Marker.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Getter and setter for parent element bounds. Used to calculate offsets passed in percents.
 * @param {anychart.math.Rect=} opt_value Parent bounds to set.
 * @return {!anychart.elements.Marker|anychart.math.Rect} Marker or parent bounds.
 */
anychart.elements.Marker.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.POSITION);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Draw marker with specified setting.
 * @return {anychart.elements.Marker} Returns itself for chaining call.
 */
anychart.elements.Marker.prototype.draw = function() {
  if (this.isConsistent()) return this;

  if (!this.markerElement_) {
    this.markerElement_ = acgraph.path();
    this.registerDisposable(this.markerElement_);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.POSITION) ||
      this.hasInvalidationState(anychart.utils.ConsistencyState.DATA)) {
    var drawer = goog.isString(this.type_) ? anychart.elements.Marker.getMarkerDrawer(this.type_) : this.type_;

    var parentWidth, parentHeight;
    //define parent bounds
    if (this.parentBounds_) {
      parentWidth = this.parentBounds_.width;
      parentHeight = this.parentBounds_.height;
    }

    var position = anychart.utils.normalizeMathPosition(this.position_);
    position.x = anychart.utils.normalize(position.x, parentWidth);
    position.y = anychart.utils.normalize(position.y, parentHeight);

    this.markerElement_.clear();
    drawer.call(this, this.markerElement_, position.x, position.y, this.size_);

    var markerBounds = this.markerElement_.getBounds();

    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, markerBounds.width, markerBounds.height),
        this.anchor_);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetX = goog.isDef(this.offsetX_) ? anychart.utils.normalize(this.offsetX_, parentWidth) : 0;
    var offsetY = goog.isDef(this.offsetY_) ? anychart.utils.normalize(this.offsetY_, parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, this.anchor_, offsetX, offsetY);

    markerBounds.left = position.x;
    markerBounds.top = position.y;

    this.markerElement_.clear();
    drawer.call(this, this.markerElement_, markerBounds.left + markerBounds.width / 2, markerBounds.top + markerBounds.height / 2, this.size_);

    this.markConsistent(anychart.utils.ConsistencyState.POSITION);
    this.markConsistent(anychart.utils.ConsistencyState.DATA);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.APPEARANCE)) {
    this.markerElement_.fill(this.fill_).stroke(this.stroke_);
    this.markConsistent(anychart.utils.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.markerElement_.zIndex(zIndex);
    this.markConsistent(anychart.utils.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.utils.ConsistencyState.CONTAINER)) {
    this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.utils.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Restore marker default settings.
 */
anychart.elements.Marker.prototype.restoreDefaults = function() {
  this.type(anychart.elements.Marker.Type.DIAGONAL_CROSS);
  this.size(10);
  this.fill('black');
  this.stroke('none');
  this.anchor(anychart.utils.NinePositions.CENTER);
  this.position({x: 0, y: 0});
  this.offsetX(0);
  this.offsetY(0);
};


/**
 * Copies marker settings from the passed marker instance to itself.
 * @param {anychart.elements.Marker} marker Marker to copy settings from.
 * @return {!anychart.elements.Marker} Returns itself for chaining.
 */
anychart.elements.Marker.prototype.cloneFrom = function(marker) {
  if (goog.isDefAndNotNull(marker)) {
    this.type(marker.type_);
    this.size(marker.size_);
    this.fill(marker.fill_);
    this.stroke(marker.stroke_);
    this.anchor(marker.anchor_);
    this.position(marker.position_);
    this.offsetX(marker.offsetX_);
    this.offsetY(marker.offsetY_);
    this.parentBounds(marker.parentBounds_);
  } else {
    this.restoreDefaults();
  }
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.elements.Marker.prototype.disposeInternal = function() {
  delete this.type_;
  delete this.fill_;
  delete this.stroke_;
  goog.base(this, 'disposeInternal');
};
