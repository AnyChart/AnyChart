goog.provide('anychart.annotationsModule.PatternCupHandle');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.PatternBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Cup & Handle pattern for stock charts
 * The price makes a 'u' drop, than a smaller drop and then a bullish breakout, or inverse for bearish moves.
 * The first 3 points define the large drop (the cup - half of an ellipse) and the direction of the pattern (bullish/bearish).
 * The 4th point defines the size of the handle (the smaller ellipse).
 * The target will be the breakout from the handle, opposite to the drop of the cup.
 *
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.PatternBase}
 */
anychart.annotationsModule.PatternCupHandle = function(chartController) {
  anychart.annotationsModule.PatternCupHandle.base(this, 'constructor', chartController);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.PatternCupHandle, anychart.annotationsModule.PatternBase);
anychart.core.settings.populate(anychart.annotationsModule.PatternCupHandle, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.PATTERNCUPHANDLE] = anychart.annotationsModule.PatternCupHandle;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternCupHandle.prototype.type = anychart.enums.AnnotationTypes.PATTERNCUPHANDLE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.PatternCupHandle.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.FOUR_POINTS;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------

//
// Ellipse equation for a point:
// x² / rx² + y² / ry² = 1
//
/** @inheritDoc */
anychart.annotationsModule.PatternCupHandle.prototype.drawFourPointsShape = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    // limit ellipse
    if (x3 <= x1) x3 = x1 + 10;
    if (x2 <= x1) x2 = x1 + 1;
    if (x2 >= x3) x2 = x3 - 1;
    if (x4 <= x3) x4 = x3 + 1;

    // middle point (origin)
    var mx = (x1 + x3) / 2;
    var my = y1;

    // point on the ellipse
    var px = mx - x2;
    var py = my - y2;

    // radius for cup
    var rx = (x3 - x1) / 2;
    var ry = Math.sqrt (py * py * rx * rx / (rx * rx - px * px));

    // radius for handle
    var rhx = rx / ((x3 - x1) / (x4 - x3));
    var rhy = ry / ((x3 - x1) / (x4 - x3));

    for (var i = 0; i < this.paths_.length; i++) {
        var path = this.paths_[i];
        path.clear();
        // cup
        path.moveTo(x3, y1).arcTo(rx, ry, 0, y2 > y1 ? 180 : -180);
        // handle
        path.moveTo(x4, y1).arcTo(rhx, rhy, 0, y2 > y1 ? 180 : -180);
    }

    // calculate target
    var tx = x4 + (x4 - x3) * 0.25, ty = y1 + (y1 - y2);

    this.drawTarget(x4, y1, tx, ty);
};

//endregion
