goog.provide('anychart.annotationsModule.PatternFlag');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.PatternBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Flag pattern for stock charts.
 * The pattern looks like a flag on a flagpole, and is defined by 4 points.
 * The first 2 points define the pole and the direction of the pattern (bullish/bearish).
 * The flag area is defined with points 2 and 3 (upper/lower margin) and the 4th point defines the other parallel margin.
 * The target will be the breakout from the flag area, with the same direction and size as the flag pole.
 *
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.PatternBase}
 */
anychart.annotationsModule.PatternFlag = function(chartController) {
  anychart.annotationsModule.PatternFlag.base(this, 'constructor', chartController);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.PatternFlag, anychart.annotationsModule.PatternBase);
anychart.core.settings.populate(anychart.annotationsModule.PatternFlag, anychart.annotationsModule.FOURTH_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.PATTERNFLAG] = anychart.annotationsModule.PatternFlag;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternFlag.prototype.type = anychart.enums.AnnotationTypes.PATTERNFLAG;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.PatternFlag.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.FOUR_POINTS;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------

/** @inheritDoc */
anychart.annotationsModule.PatternFlag.prototype.drawFourPointsShape = function(x1, y1, x2, y2, x3, y3, x4, y4) {

    var points = [x1, y1, x4, y4];
    anychart.math.projectToLine(points, x3 - x2, y3 - y2, x2, y2);

    // projected points
    var px1 = points[0], py1 = points[1];
    var px4 = points[2], py4 = points[3];

    // delta point for the projected fourth point, parallel with the flag pole (on the top flag line)
    var dx = (x2 - x1) * (px4 - x4) / (px1 - x1) + x4;
    var dy = (y2 - y1) * (py4 - y4) / (py1 - y1) + y4;

    // calculate flag corners
    var fx1 = x2, fy1 = y2;
    var fx2 = x3, fy2 = y3;
    var fx3 = x3 + x4 - dx, fy3 = y3 + y4 - dy;
    var fx4 = x2 + x4 - dx, fy4 = y2 + y4 - dy;

    for (var i = 0; i < this.paths_.length; i++) {
        var path = this.paths_[i];
        path.clear();
        // flag pole
        path.moveTo(x1, y1).lineTo(fx4, fy4);
        // flag
        path.moveTo(fx1, fy1).lineTo(fx2, fy2).lineTo(fx3, fy3).lineTo(fx4, fy4).close();
    }

    // calculate target
    var tx = x3 + fx4 - x1, ty = y3 + fy4 - y1;

    this.drawTarget(x3, y3, tx, ty);
};

//endregion
