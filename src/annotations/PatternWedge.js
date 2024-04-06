goog.provide('anychart.annotationsModule.PatternWedge');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.PatternBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('anychart.math.Point2D');



/**
 * Wedge pattern for stock charts
 * The wedge is a price pattern marked by converging trend lines on a price chart.
 * The direction of the trend is marked with the first 2 points (similar to the flag pattern).
 * The other 2 points will complete the shape that will be drawn as a triangle.
 * The target will be the breakout from the tip of the wedge in the same direction as the pole.
 *
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.PatternBase}
 */
anychart.annotationsModule.PatternWedge = function(chartController) {
  anychart.annotationsModule.PatternWedge.base(this, 'constructor', chartController);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.PatternWedge, anychart.annotationsModule.PatternBase);
anychart.core.settings.populate(anychart.annotationsModule.PatternWedge, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.PATTERNWEDGE] = anychart.annotationsModule.PatternWedge;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternWedge.prototype.type = anychart.enums.AnnotationTypes.PATTERNWEDGE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.PatternWedge.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.FOUR_POINTS;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------

/** @inheritDoc */
anychart.annotationsModule.PatternWedge.prototype.drawFourPointsShape = function(x1, y1, x2, y2, x3, y3, x4, y4) {

    // calculate final point (on the pole)
    var fx = null, fy = null;
    var intersect = anychart.math.intersectInfiniteLineLine(x1, y1, x2, y2, x3, y3, x4, y4);
    if (intersect) {
        fx = intersect.x;
        fy = intersect.y;
    }

    for (var i = 0; i < this.paths_.length; i++) {
        var path = this.paths_[i];
        path.clear();

        if (fx && fy) {
            // flag pole
            path.moveTo(x1, y1).lineTo(fx, fy);
            // flag
            path.moveTo(fx, fy).lineTo(x2, y2).lineTo(x3, y3).close();
        } else {
            // cannot draw
            path.moveTo(x1, y1).lineTo(x2, y2).lineTo(x3, y3);
        }
    }

    // calculate target
    var tx = x3 + x2 - fx, ty = y3 + y2 - fy;

    this.drawTarget(x3, y3, tx, ty);
};

//endregion
