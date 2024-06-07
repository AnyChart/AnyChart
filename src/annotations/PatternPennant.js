goog.provide('anychart.annotationsModule.PatternPennant');
goog.require('anychart.annotationsModule');
goog.require('anychart.annotationsModule.PatternBase');
goog.require('anychart.core.settings');
goog.require('anychart.enums');



/**
 * Pennant patterns for stock chart.
 * Pennants pattern are a type of continuation chart pattern.
 * The shape is defined by 2 lines (3 points): a long line defines the main trend and a shorter line that encloses the consolidation period.
 * The consolidation will be painted as a triangle (the pennant, triangle and wedge patterns are similar)
 * The target will be the breakout from the tip of the pennant in the trend direction.
 *
 * @param {!anychart.annotationsModule.ChartController} chartController
 * @constructor
 * @extends {anychart.annotationsModule.PatternBase}
 */
anychart.annotationsModule.PatternPennant = function(chartController) {
  anychart.annotationsModule.PatternPennant.base(this, 'constructor', chartController);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS_META);
};
goog.inherits(anychart.annotationsModule.PatternPennant, anychart.annotationsModule.PatternBase);
anychart.core.settings.populate(anychart.annotationsModule.PatternPennant, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS);
anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.PATTERNPENNANT] = anychart.annotationsModule.PatternPennant;


//region Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternPennant.prototype.type = anychart.enums.AnnotationTypes.PATTERNPENNANT;


/**
 * Supported anchors.
 * @type {anychart.annotationsModule.AnchorSupport}
 */
anychart.annotationsModule.PatternPennant.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.THREE_POINTS;


//endregion
//region Drawing
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.annotationsModule.PatternPennant.prototype.drawThreePointsShape = function(x1, y1, x2, y2, x3, y3) {
    // constraints
    x3 = Math.max(x1 + 1, x3);
    x2 = Math.max(x1 + 1, x3 + 1, x2);

    // project last point on the main line
    var py3 = y1 - (x3 - x1) / (x2 - x1) * (y1 - y2);

    // stroke
    var path = this.paths_[0];
    path.clear();
    path.moveTo(x1, y1)
        .lineTo(x2, y2)
        .lineTo(x3, y3);

    for (var i = 1; i < this.paths_.length; i++) {
        // triangle shape
        path = this.paths_[i];
        path.clear();
        path.moveTo(x3, py3)
            .lineTo(x2, y2)
            .lineTo(x3, y3)
            .close();
    }


    // calculate target
    var tx = x2 + (x2 - x3) / 2;
    var ty = y1 - (tx - x1) / (x2 - x1) * (y1 - y2);

    if (py3 > y3) {
        // bearish target
        ty -= py3 - y3;
    } else {
        // bullish target
        ty += y3 - py3;
    }

    this.drawTarget(x2, y2, tx, ty);
};


//endregion
