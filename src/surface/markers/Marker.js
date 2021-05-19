goog.provide('anychart.surfaceModule.markers.Marker');

goog.require('anychart.core.VisualBase');



/**
 * Drawable marker. Draw simple shape by passed coordinates.
 *
 * @param {anychart.surfaceModule.markers.Controller} controller
 * @param {anychart.surfaceModule.markers.droplines.Dropline} dropline
 *
 *
 * @extends {anychart.core.VisualBase}
 * @constructor
 */
anychart.surfaceModule.markers.Marker = function(controller, dropline) {
  anychart.surfaceModule.markers.Marker.base(this, 'constructor');

  /**
   * Markers controller reference.
   * @type {anychart.surfaceModule.markers.Controller}
   * @private
   */
  this.controller_ = controller;

  /**
   * Dropline reference..
   * @type {anychart.surfaceModule.markers.droplines.Dropline}
   * @private
   */
  this.dropline_ = dropline;

  /**
   * Root layer for marker and dropline drawing.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = acgraph.layer();

  /**
   * Path that used for marker drawing.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = acgraph.path();

  this.dropline_.container(this.rootLayer_);
  this.path_.parent(this.rootLayer_);

  this.initEventHandlers_();
};
goog.inherits(anychart.surfaceModule.markers.Marker, anychart.core.VisualBase);


// region --- Drawing.
/**
 * Draw marker shape.
 * @private
 */
anychart.surfaceModule.markers.Marker.prototype.drawShape_ = function() {
  var drawer = this.controller_.resolveDrawer(this);
  var size = this.controller_.resolveSize(this);

  this.path_.clear();

  drawer(this.path_,
    this.coordinates_[1],
    this.coordinates_[2],
    size,
    size
  );
};


/**
 * Apply appearance settings to the marker path.
 * @private
 */
anychart.surfaceModule.markers.Marker.prototype.applyAppearance_ = function() {
  this.path_.fill(this.controller_.resolveFill(this));
  this.path_.stroke(this.controller_.resolveStroke(this));
};


/**
 * Draw marker.
 */
anychart.surfaceModule.markers.Marker.prototype.draw = function() {
  if (this.controller_.getOption('enabled')) {
    this.rootLayer_.parent(/** @type {acgraph.vector.ILayer}*/(this.container()));

    this.dropline_.draw();

    this.drawShape_();
    this.applyAppearance_();
  } else {
    this.rootLayer_.parent(null);
  }
};


//endregion
//region --- Events
/**
 * Mouse event handler.
 *
 * @param {goog.events.Event} event
 * @private
 */
anychart.surfaceModule.markers.Marker.prototype.handleMouseEvent_ = function(event) {
  this.controller_.handleMarkerMouseEvents(this, event);
};


/**
 * Init mouse event handlers.
 *
 * @private
 */
anychart.surfaceModule.markers.Marker.prototype.initEventHandlers_ = function() {
  this.path_.listen(goog.events.EventType.MOUSEMOVE, this.handleMouseEvent_, false, this);
  this.path_.listen(goog.events.EventType.MOUSEOUT, this.handleMouseEvent_, false, this);
  this.path_.listen(goog.events.EventType.MOUSEOVER, this.handleMouseEvent_, false, this);
};


//endregion
//region --- Setters/Getters
/**
 * Return marker dropline.
 *
 * @return {anychart.surfaceModule.markers.droplines.Dropline}
 */
anychart.surfaceModule.markers.Marker.prototype.getDropline = function() {
  return this.dropline_;
};


/**
 * Marker data.
 *
 * @param {Array.<number>=} opt_data
 * @return {Array.<number>|anychart.surfaceModule.markers.Marker}
 */
anychart.surfaceModule.markers.Marker.prototype.data = function(opt_data) {
  if (opt_data) {
    this.data_ = opt_data;
    return this;
  }
  return this.data_;
};


/**
 * Getter/Setter for markers coordinates.
 *
 * @param {Array.<number>=} opt_coordinates - Array with coordinates.
 * @return {Array.<number>|anychart.surfaceModule.markers.Marker}
 */
anychart.surfaceModule.markers.Marker.prototype.coordinates = function(opt_coordinates) {
  if (opt_coordinates) {
    this.coordinates_ = opt_coordinates;
    return this;
  }
  return this.coordinates_;
};


/**
 * Marker data index.
 *
 * @param {number=} opt_index
 * @return {number|anychart.surfaceModule.markers.Marker}
 */
anychart.surfaceModule.markers.Marker.prototype.index = function(opt_index) {
  if (goog.isDef(opt_index)) {
    this.index_ = opt_index;
    return this;
  }
  return this.index_;
};


//endregion
//region --- Dispose
/**
 * Dispose created dom elements.
 */
anychart.surfaceModule.markers.Marker.prototype.disposeInternal = function() {
  goog.disposeAll(
    this.rootLayer_,
    this.path_,
    this.dropline_
  );

  this.dropline_ = null;
  this.rootLayer_ = null;
  this.path_ = null;

  anychart.surfaceModule.markers.Marker.base(this, 'disposeInternal');
};
//endregion
