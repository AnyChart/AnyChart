goog.provide('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.core.shapeManagers.Base');



/**
 * Series paths manager.
 * @param {anychart.core.IShapeManagerUser} series
 * @param {!Array.<anychart.core.shapeManagers.ShapeConfig>} config
 * @param {boolean} interactive
 * @param {?string=} opt_shapesFieldName
 * @param {?function(anychart.core.IShapeManagerUser, Object.<string, acgraph.vector.Shape>, number)=} opt_postProcessor
 * @param {boolean=} opt_disableStrokeScaling
 * @constructor
 * @extends {anychart.core.shapeManagers.Base}
 */
anychart.core.shapeManagers.PerSeries = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling) {
  anychart.core.shapeManagers.PerSeries.base(this, 'constructor', series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling);

  /**
   * Shapes.
   * @type {?Object.<string, Object.<string, acgraph.vector.Shape>>}
   * @private
   */
  this.shapes_ = {};
};
goog.inherits(anychart.core.shapeManagers.PerSeries, anychart.core.shapeManagers.Base);


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.setupInteractivity = function(shape, nonInteractive, indexOrGlobal) {
  anychart.core.shapeManagers.PerSeries.base(this, 'setupInteractivity', shape, nonInteractive, true);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.clearShapes = function() {
  anychart.core.shapeManagers.PerSeries.base(this, 'clearShapes');
  this.shapes_ = {};
};


/**
 * Returns point color full hash.
 * @param {number} state .
 * @param {Object.<string>=} opt_only .
 * @return {string}
 */
anychart.core.shapeManagers.PerSeries.prototype.calcPointColors = function(state, opt_only) {
  var names = opt_only || this.defs;

  var iterator = this.series.getIterator();

  var fill, stroke;
  var hash = '';
  for (var name in names) {
    var descriptor = this.defs[name];
    var descFill = /** @type {acgraph.vector.Fill} */(descriptor.fill(this.series, state));
    var descStroke = /** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, state));

    if (!descriptor.isHatchFill) {
      if (descFill && anychart.color.isNotNullColor(descFill))
        fill = descFill;
      if (descStroke && anychart.color.isNotNullColor(descStroke))
        stroke = descStroke;
    }

    hash += name + anychart.color.hash(descFill) + anychart.color.hash(descStroke);
  }

  this.updateMetaColors(/** @type {acgraph.vector.Fill} */(fill), /** @type {acgraph.vector.Stroke} */(stroke), opt_only);
  iterator.meta('shapeNames', names);

  return hash;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex, opt_shape) {
  var hash = this.calcPointColors(state, opt_only);
  var iterator = this.series.getIterator();
  var index = iterator.getIndex();

  this.currentShapes = this.shapes_[hash];
  if (!this.currentShapes) {
    var shapes = anychart.core.shapeManagers.PerSeries.base(this, 'getShapesGroup', state, opt_only);
    this.currentShapes = this.shapes_[hash] = {
      shapes: [shapes],
      rows: [],
      indexes: []
    };
    if (!isNaN(index)) {
      this.currentShapes.indexes.push(index);
      this.currentShapes.rows.push(iterator.current());
    }
  }

  return this.currentShapes.shapes[this.currentShapes.shapes.length - 1];
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.addShapesGroup = function(state, opt_baseZIndex) {
  var shapes = this.getShapesGroupInternal(state, void 0, opt_baseZIndex);
  this.currentShapes.shapes.push(shapes);
  return shapes;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateZIndex = function(newBaseZIndex, opt_shapesGroup) {
  var currentRow = this.series.getIterator().current();
  var currentIndex = this.series.getIterator().getIndex();
  for (var key in this.shapes_) {
    var shapeGroup = this.shapes_[key];
    var rows = shapeGroup.rows;
    for (var i = 0, len = rows.length; i < len; i++) {
      this.series.getIterator().specialSelect(rows[i], shapeGroup.indexes[i]);
      var shapes = shapeGroup.shapes;
      for (var j = 0; j < shapes.length; j++) {
        var shape = shapes[j];
        anychart.core.shapeManagers.PerSeries.base(this, 'updateZIndex', newBaseZIndex, shape);
      }
    }
  }
  if (currentRow)
    this.series.getIterator().specialSelect(currentRow, currentIndex);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateColors = function(state, opt_shapesGroup) {
  var currentRow = this.series.getIterator().current();
  this.savedCurrentIndex = this.series.getIterator().getIndex();

  for (var key in this.shapes_) {
    var shapeGroup = this.shapes_[key];
    var rows = shapeGroup.rows;
    for (var i = 0, len = rows.length; i < len; i++) {
      this.series.getIterator().specialSelect(rows[i], shapeGroup.indexes[i]);
      var shapes = shapeGroup.shapes;
      for (var j = 0; j < shapes.length; j++) {
        var shape = shapes[j];
        anychart.core.shapeManagers.PerSeries.base(this, 'updateColors', state, shape);
      }
    }
  }

  if (currentRow)
    this.series.getIterator().specialSelect(currentRow, this.savedCurrentIndex);

  this.savedCurrentIndex = void 0;
};


/**
 * @param {number} state
 * @param {Object.<string>} shapeGroup
 */
anychart.core.shapeManagers.PerSeries.prototype.updateMarkersColors = function(state, shapeGroup) {
  var iterator = this.series.getIterator();
  var index = iterator.getIndex();
  var realIndex = goog.isDef(this.savedCurrentIndex) ? this.savedCurrentIndex : index;

  if (shapeGroup && realIndex >= 0) {
    var markerFill, markerStroke;
    for (var name in shapeGroup) {
      var descriptor = this.defs[name];
      if (descriptor && !descriptor.isHatchFill) {
        var markerDescFill = /** @type {acgraph.vector.Fill} */(descriptor.fill(this.series, state, void 0, void  0, 'fill'));
        var markerDescStroke = /** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, state, void 0, void 0, 'stroke'));

        if (markerDescFill && anychart.color.isNotNullColor(markerDescFill))
          markerFill = markerDescFill;
        if (markerDescStroke && anychart.color.isNotNullColor(markerDescStroke))
          markerStroke = markerDescStroke;
      }
    }

    iterator.meta('markerFill', markerFill);
    iterator.meta('markerStroke', markerStroke);
  }
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.disposeInternal = function() {
  this.shapes_ = null;
  anychart.core.shapeManagers.PerSeries.base(this, 'disposeInternal');
};
