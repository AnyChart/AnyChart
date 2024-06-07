goog.provide('anychart.annotationsModule.PatternTriangle');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.PatternBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Triangle patterns for stock chart (ascending, descending or symmetrical)
 * The shape is defined by a price wave (4 points), with the tip to the right.
 * The pattern will calculate automatically which type of triangle it is when showing the target:
 * - an ascending triangle (a bullish pattern) when the tip is in the higher region of its height (20% region).
 * - a decending triangle (a bearish pattern) when the tip is in the lower region of its height (20% region).
 * - a symmetrical triangle otherwise. There will be two targets disaplayed, for both bullish and bearish breakouts.
 *
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.PatternBase}
 */
anychart.annotationsModule.PatternTriangle = function(chartController) {
  anychart.annotationsModule.PatternTriangle.base(this, 'constructor', chartController);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.PatternTriangle, anychart.annotationsModule.PatternBase);
anychart.core.settings.populate(anychart.annotationsModule.PatternTriangle, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.PATTERNTRIANGLE] = anychart.annotationsModule.PatternTriangle;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternTriangle.prototype.type = anychart.enums.AnnotationTypes.PATTERNTRIANGLE;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.PatternTriangle.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.FOUR_POINTS;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternTriangle.prototype.drawFourPointsShape = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    // constraints
    x2 = Math.max(x1 + 1, x2);
    x3 = Math.max(x2 + 1, x3);
    x4 = Math.max(x3 + 1, x4);

    // triangle tip point
    var px = null, py = null;
    var point = anychart.math.intersectInfiniteLineLine(x1, y1, x3, y3, x2, y2, x4, y4);
    if (point) {
        px = point.x;
        py = point.y;
    }

    // triangle second point
    var p2 = anychart.math.intersectInfiniteLineLine(x1, y1, x1, y2, x2, y2, px, py);

    // stroke
    var path = this.paths_[0];
    path.clear();
    path.moveTo(x1, y1)
        .lineTo(x2, y2)
        .lineTo(x3, y3)
        .lineTo(x4, y4);

    for (var i = 1; i < this.paths_.length; i++) {
        // triangle shape
        path = this.paths_[i];
        path.clear();
        path.moveTo(x1, y1)
            .lineTo(px, py)
            .lineTo(p2 ? p2.x : x2, p2 ? p2.y : y2)
            .close();
    }

    // can calculate target(s)
    if (px > x4) {

        var height = Math.abs((p2 ? p2.y : y2) - y1),
            lowest = Math.min(y1, p2 ? p2.y : y2);

        // ascending triangle: tip is in the top 20% region of the triangle height
        if (py && py > (lowest + height * 0.80)) {
            // calculate target
            var tx = px + Math.abs(x2 - x1), ty = py + Math.abs(y2 - y1);
            this.drawTarget(px, py, tx, ty);
        }
        // descending triangle: tip is in the lower 20% region of the triangle height
        else if (py && py < (lowest + height * 0.20)) {
            // calculate target
            var tx = px + Math.abs(x2 - x1), ty = py - Math.abs(y2 - y1);
            this.drawTarget(px, py, tx, ty);
        }
        // symmetrical or undiceded, show two targets
        else {
            // calculate target
            var tx = px + Math.abs(x2 - x1), ty = py + Math.abs(y2 - y1);
            this.drawTarget(px, py, tx, ty);

            ty = py - Math.abs(y2 - y1);
            this.drawTarget(px, py, tx, ty);
        }
    }
};


//endregion
