goog.provide('anychart.cartesian.series.StepArea');

goog.require('anychart.cartesian.series.AreaBase');



/**
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.cartesian.series.AreaBase}
 */
anychart.cartesian.series.StepArea = function(data, opt_csvSettings) {
  goog.base(this, data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;
};
goog.inherits(anychart.cartesian.series.StepArea, anychart.cartesian.series.AreaBase);


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.StepArea.prototype.prevX_;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.StepArea.prototype.prevY_;


/** @inheritDoc */
anychart.cartesian.series.StepArea.prototype.drawFirstPoint = function() {
  var zeroMissing = this.yScale().isStackValMissing();
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    this.finalizeSegment();

    this.path
        .moveTo(x, zero)
        .lineTo(x, y);
    this.strokePath
        .moveTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;

    if (this.yScale().stackMode() == anychart.scales.StackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack = [x, zero, zeroMissing];

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.StepArea.prototype.drawSubsequentPoint = function() {
  var zeroMissing = this.yScale().isStackValMissing();
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    var midX = (x + this.prevX_) / 2;
    this.path
        .lineTo(midX, this.prevY_)
        .lineTo(midX, y)
        .lineTo(x, y);
    this.strokePath
        .lineTo(midX, this.prevY_)
        .lineTo(midX, y)
        .lineTo(x, y);

    this.prevX_ = x;
    this.prevY_ = y;

    if (this.yScale().stackMode() == anychart.scales.StackMode.NONE)
      this.lastDrawnX = x;
    else
      this.zeroesStack.push(x, zero, zeroMissing);

    this.getIterator().meta('x', x).meta('zero', zero).meta('y', y);
  }

  return true;
};


/** @inheritDoc */
anychart.cartesian.series.StepArea.prototype.finalizeSegment = function() {
  if (!isNaN(this.lastDrawnX)) {
    this.path
        .lineTo(this.lastDrawnX, this.zeroY)
        .close();
  } else if (this.zeroesStack) {
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i - 0]);
      if (isMissing && !prevWasMissing && !isNaN(prevX))
        this.path.lineTo(prevX, y);
      else if (prevWasMissing && !isNaN(prevY))
        this.path.lineTo(x, prevY);
      else if (!isNaN(prevY)) {
        var midX = (x + prevX) / 2;
        this.path
            .lineTo(midX, prevY)
            .lineTo(midX, y);
      }
      this.path.lineTo(x, y);
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.path.close();
    this.zeroesStack = null;
  }
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.StepArea.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['seriesType'] = 'steparea';
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.StepArea.prototype.deserialize = function(config) {
  return goog.base(this, 'deserialize', config);
};
