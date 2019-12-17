//region --- Requiring and Providing
goog.provide('anychart.mapModule.elements.Crosshair');

goog.require('anychart.core.ui.Crosshair');
goog.require('anychart.core.ui.CrosshairLabel');
goog.require('anychart.format.Context');
//endregion



/**
 * Crosshair class.
 * @constructor
 * @extends {anychart.core.ui.Crosshair}
 */
anychart.mapModule.elements.Crosshair = function() {
  anychart.mapModule.elements.Crosshair.base(this, 'constructor');
};
goog.inherits(anychart.mapModule.elements.Crosshair, anychart.core.ui.Crosshair);


//region --- Interactivity
/**
 * @param {anychart.core.MouseEvent} event - .
 */
anychart.mapModule.elements.Crosshair.prototype.show = function(event) {
  var toShowSeriesStatus = [];
  var interactivityTarget = /** @type {anychart.mapModule.Chart} */(this.interactivityTarget());
  var seriesStatus = interactivityTarget.getSeriesStatus(event);
  if (seriesStatus) {
    goog.array.forEach(seriesStatus, function(status) {
      if (status['series'].enabled() && !goog.array.isEmpty(status['points'])) {
        toShowSeriesStatus.push(status);
      }
    }, this);

    if (!goog.array.isEmpty(toShowSeriesStatus)) {
      var nearestSeriesStatus = toShowSeriesStatus[0];

      goog.array.forEach(toShowSeriesStatus, function(status) {
        if (nearestSeriesStatus['nearestPointToCursor']['distance'] > status['nearestPointToCursor']['distance']) {
          nearestSeriesStatus = status;
        }
      });

      var xStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('xStroke'));
      var yStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('yStroke'));

      var series = nearestSeriesStatus['series'];

      var iterator = series.getIterator();
      iterator.select(nearestSeriesStatus['nearestPointToCursor']['point']['index']);
      var x = anychart.utils.toNumber(iterator.meta('x'));
      var y = anychart.utils.toNumber(iterator.meta('value'));

      if (isNaN(x) || isNaN(y)) {
        var position = series.getPositionByRegion()['value'];
        x = position['x'];
        y = position['y'];
      }

      var scale = interactivityTarget.scale();

      var coords = scale.inverseTransform(x, y);
      x = coords[0];
      y = coords[1];

      var xRatio = scale.transformX(x);
      var yRatio = scale.transformY(y);

      this.drawLabels(this.getXLabels(), true, xRatio, xStroke, x);
      this.drawLabels(this.getYLabels(), false, yRatio, yStroke, y);

    } else {
      this.hide();
    }
  }
};


/**
 * Drawing crosshair for passed coordinate.
 * @param {number=} opt_x .
 * @param {number=} opt_y .
 */
anychart.mapModule.elements.Crosshair.prototype.update = function(opt_x, opt_y) {
  if (!this.enabled()) return;

  var x, y;
  if (goog.isDef(opt_x)) {
    x = parseFloat(opt_x);
  } else {
    x = goog.isDef(this.lastX_) ? this.lastX_ : 0;
  }

  if (goog.isDef(opt_y)) {
    y = parseFloat(opt_y);
  } else {
    y = goog.isDef(this.lastY_) ? this.lastY_ : 0;
  }

  var localCord = this.interactivityTarget().globalToLocal(x, y);
  var latLong = this.interactivityTarget().inverseTransform(localCord.x, localCord.y);
  var lon = latLong['long'];
  var lat = latLong['lat'];

  var scale = this.interactivityTarget().scale();

  var xRatio = scale.transformX(latLong['x']);
  var yRatio = scale.transformY(latLong['y']);

  var xStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('xStroke'));
  var yStroke = /** @type {acgraph.vector.Stroke} */(this.getOption('yStroke'));

  if (xRatio > 0 && xRatio < 1 && yRatio > 0 && yRatio < 1) {
    this.drawLabels(this.getXLabels(), true, xRatio, xStroke, lon);
    this.drawLabels(this.getYLabels(), false, xRatio, yStroke, lat);
  } else {
    this.hide();
  }
};


/** @inheritDoc */
anychart.mapModule.elements.Crosshair.prototype.handleMouseOverAndMove = function(e) {
  this.lastX_ = e['clientX'];
  this.lastY_ = e['clientY'];
  if (this.getOption('displayMode') == anychart.enums.CrosshairDisplayMode.STICKY) {
    //TODO (A.Kudryavtsev): Has map issues. Doesn't work for a while (ticket DVF-3239).
    //this.show(e);
  } else {
    this.update(e['clientX'], e['clientY']);
  }
};


/** @inheritDoc */
anychart.mapModule.elements.Crosshair.prototype.handleMouseOut = function(e) {
  if (!anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(this.interactivityTarget()), e['relatedTarget'])) {
    this.lastX_ = e['clientX'];
    this.lastY_ = e['clientY'];

    var localCord = this.interactivityTarget().globalToLocal(e['clientX'], e['clientY']);
    var latLong = this.interactivityTarget().inverseTransform(localCord.x, localCord.y);

    var scale = this.interactivityTarget().scale();

    var xRatio = scale.transformX(latLong['x']);
    var yRatio = scale.transformY(latLong['y']);

    if (xRatio < 0 || xRatio > 1 || yRatio < 0 || yRatio > 1) {
      this.hide();
    }
  }
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.mapModule.elements.Crosshair.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.rootLayer_) {
    this.rootLayer_ = acgraph.layer();

    this.xLine.parent(this.rootLayer_);
    this.yLine.parent(this.rootLayer_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.xLine.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('xStroke')));
    this.yLine.stroke(/** @type {acgraph.vector.Stroke} */(this.getOption('yStroke')));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  var labels = goog.array.concat(this.getXLabels(), this.getYLabels());
  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.rootLayer_.parent(container);

    this.setLabelsContainer(labels, this.rootLayer_);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.rootLayer_.zIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var bounds = /** @type {anychart.math.Rect} */(this.parentBounds());
    this.setParentBounds(labels, bounds);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


/**
 * Line drawing.
 * @param {anychart.mapModule.elements.Axis} axis .
 * @param {acgraph.vector.Path} line .
 * @param {number} value .
 */
anychart.mapModule.elements.Crosshair.prototype.drawLine = function(axis, line, value) {
  var scale = this.interactivityTarget().scale();

  var xy;
  var precision;

  var shiftX = this.xLine.strokeThickness() % 2 == 0 ? 0 : -.5;
  var shiftY = this.yLine.strokeThickness() % 2 == 0 ? 0 : -.5;

  line.clear();

  if (axis.isHorizontal()) {
    precision = scale.precision()[1];
    var currLat = scale.minimumY();
    while (currLat < scale.maximumY()) {
      xy = scale.transform(value, currLat, null);
      if (currLat == scale.minimumY()) {
        line.moveTo(xy[0] - shiftX, xy[1]);
      } else {
        line.lineTo(xy[0] - shiftX, xy[1]);
      }
      currLat += precision;
    }
    xy = scale.transform(value, scale.maximumY(), null);
    line.lineTo(xy[0] - shiftX, xy[1]);
  } else {
    precision = scale.precision()[0];
    var currLong = scale.minimumX();
    while (currLong < scale.maximumX()) {
      xy = scale.transform(currLong, value, null);
      if (currLong == scale.minimumX()) {
        line.moveTo(xy[0], xy[1] - shiftY);
      } else {
        line.lineTo(xy[0], xy[1] - shiftY);
      }
      currLong += precision;
    }
    xy = scale.transform(scale.maximumX(), value, null);
    line.lineTo(xy[0], xy[1] - shiftY);
  }
};


/**
 * Label drawing.
 * @param {anychart.mapModule.elements.Axis} axis .
 * @param {anychart.core.ui.CrosshairLabel} label .
 * @param {number} value .
 */
anychart.mapModule.elements.Crosshair.prototype.drawLabel = function(axis, label, value) {
  var labelFormatProvider = this.getLabelsFormatProvider(axis, value);
  var labelFormat = label['format']() || anychart.utils.DEFAULT_FORMATTER;
  label['text'](labelFormat.call(labelFormatProvider, labelFormatProvider));
  label.autoAnchor(this.getAnchorByAxis(axis));

  var positionCoords = axis.ticks().calcTick(value);

  label.x(/** @type {number} */(positionCoords[0])).y(/** @type {number} */(positionCoords[1]));
  label['rotation'](this.getLabelRotation_(axis, positionCoords[4]));
  label.container(this.rootLayer_).draw();
};


//endregion
//region --- Labels
/**
 * Returns label rotation angle.
 * @param {anychart.mapModule.elements.Axis} axis .
 * @param {number} tickAngle .
 * @return {number} .
 * @private
 */
anychart.mapModule.elements.Crosshair.prototype.getLabelRotation_ = function(axis, tickAngle) {
  var angle;
  switch (axis.orientation()) {
    case anychart.enums.Orientation.TOP:
      angle = goog.math.toDegrees(tickAngle) + 90;
      break;
    case anychart.enums.Orientation.RIGHT:
      angle = goog.math.toDegrees(tickAngle);
      break;
    case anychart.enums.Orientation.BOTTOM:
      angle = goog.math.toDegrees(tickAngle) - 90;
      break;
    case anychart.enums.Orientation.LEFT:
      angle = goog.math.toDegrees(tickAngle) - 180;
      break;
  }

  return /** @type {number} */(angle);
};


/** @inheritDoc */
anychart.mapModule.elements.Crosshair.prototype.getLabelsFormatProvider = function(axis, value) {
  var labelText, sideOfTheWorld;
  value = parseFloat(value);

  var grad, minutes, seconds;
  var decimal = Math.abs(value) % 1;

  grad = Math.floor(Math.abs(value));
  minutes = Math.floor(60 * decimal);
  seconds = Math.floor(60 * ((60 * decimal) % 1));

  labelText = grad + '\u00B0';
  if (seconds || minutes) {
    if (minutes < 10)
      minutes = '0' + minutes;
    labelText += minutes + '\'';
  }

  if (axis.isHorizontal()) {
    sideOfTheWorld = value > 0 ? 'E' : 'W';
  } else {
    sideOfTheWorld = value > 0 ? 'N' : 'S';
  }

  labelText += sideOfTheWorld;
  var scale = axis.scale();

  var values = {
    'axis': {value: axis, type: anychart.enums.TokenType.UNKNOWN},
    'scale': {value: scale, type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: NaN, type: anychart.enums.TokenType.NUMBER},
    'value': {value: labelText, type: anychart.enums.TokenType.STRING},
    'tickValue': {value: value, type: anychart.enums.TokenType.NUMBER},
    'max': {value: goog.isDef(scale.max) ? scale.max : null, type: anychart.enums.TokenType.NUMBER},
    'min': {value: goog.isDef(scale.min) ? scale.min : null, type: anychart.enums.TokenType.NUMBER}
  };

  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.AXIS_SCALE_MAX] = 'max';
  tokenAliases[anychart.enums.StringToken.AXIS_SCALE_MIN] = 'min';

  var tokenCustomValues = {};
  tokenCustomValues[anychart.enums.StringToken.AXIS_NAME] = {value: axis.title().text(), type: anychart.enums.TokenType.STRING};

  var context = new anychart.format.Context(values);
  context
      .tokenAliases(tokenAliases)
      .tokenCustomValues(tokenCustomValues);

  return context.propagate();
};


/**
 * Labels drawing.
 * @param {Array.<anychart.core.ui.CrosshairLabel>} labels
 * @param {boolean} isX
 * @param {number} ratio
 * @param {acgraph.vector.Stroke} stroke
 * @param {number} coord
 */
anychart.mapModule.elements.Crosshair.prototype.drawLabels = function(labels, isX, ratio, stroke, coord) {
  var axisProvider = /** @type {anychart.mapModule.Chart} */(this.interactivityTarget());
  var i, label, axisIndex, axis;
  var lineDrawed = false;
  var getAxisByIndex = isX ? axisProvider.getXAxisByIndex : axisProvider.getYAxisByIndex;
  var hide = isX ? this.hideX : this.hideY;
  var line = isX ? this.xLine : this.yLine;
  var hasStroke = stroke && stroke != 'none';
  for (i = 0; i < labels.length; i++) {
    label = /** @type {anychart.core.ui.CrosshairLabel} */(labels[i]);
    if (label) {
      axisIndex = /** @type {number} */(label.getOption('axisIndex'));
      axis = /** @type {anychart.mapModule.elements.Axis} */(getAxisByIndex.call(axisProvider, axisIndex));
      if (axis && this.canDrawForAxis(axis) && ratio > 0 && ratio < 1) {
        if (!lineDrawed && hasStroke) {
          this.drawLine(axis, line, coord);
          lineDrawed = true;
        }

        if (label.enabled()) {
          this.drawLabel(axis, label, coord);
        }
      } else {
        hide.call(this, label);
      }
    }
  }
};
//endregion
