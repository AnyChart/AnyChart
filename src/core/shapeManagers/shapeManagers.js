goog.provide('anychart.core.shapeManagers');


/**
 * Shape config.
 * @typedef {{
 *   name: string,
 *   shapeType: string,
 *   fillNames: ?Array.<string>,
 *   strokeNames: ?Array.<string>,
 *   isHatchFill: boolean,
 *   zIndex: number
 * }}
 */
anychart.core.shapeManagers.ShapeConfig;


/**
 * Recommended Z index difference between two close shapes.
 * @type {number}
 */
anychart.core.shapeManagers.ZINDEX_STEP = 1e-6;


/**
 * Z index shift for the fill shapes.
 * @const {number}
 */
anychart.core.shapeManagers.FILL_SHAPES_ZINDEX = 0;


/**
 * Z index shift for the hatch fill shapes.
 * @const {number}
 */
anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX = anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the stroke shapes.
 * @const {number}
 */
anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX = 2 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the errors.
 * @const {number}
 */
anychart.core.shapeManagers.ERROR_SHAPES_ZINDEX = 4 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the back shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.BACK_SHAPES_ZINDEX = 0;


/**
 * Z index shift for the left shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.LEFT_SHAPES_ZINDEX = anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the bottom shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.BOTTOM_SHAPES_ZINDEX = 2 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the top shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.TOP_SHAPES_ZINDEX = 3 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the right shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.RIGHT_SHAPES_ZINDEX = 4 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the front shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.FRONT_SHAPES_ZINDEX = 5 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the top shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.TOP_HATCH_SHAPES_ZINDEX = 6 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the right shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.RIGHT_HATCH_SHAPES_ZINDEX = 7 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the front shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.FRONT_HATCH_SHAPES_ZINDEX = 8 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the labels.
 * @const {number}
 */
anychart.core.shapeManagers.LABELS_ZINDEX = 9 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the outlier markers.
 * @const {number}
 */
anychart.core.shapeManagers.OUTLIERS_ZINDEX = 10 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the markers.
 * @const {number}
 */
anychart.core.shapeManagers.MARKERS_ZINDEX = 11 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFillConfig = {
  name: 'fill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fill', 'hoverFill', 'selectFill'],
  strokeNames: null,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathStrokeConfig = {
  name: 'stroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHatchConfig = {
  name: 'hatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['hatchFill', 'hoverHatchFill', 'selectHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleFillStrokeConfig = {
  name: 'circle',
  shapeType: anychart.enums.ShapeType.CIRCLE,
  fillNames: ['fill', 'hoverFill', 'selectFill'],
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleHatchConfig = {
  name: 'hatchFill',
  shapeType: anychart.enums.ShapeType.CIRCLE,
  fillNames: ['hatchFill', 'hoverHatchFill', 'selectHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleNegativeFillStrokeConfig = {
  name: 'negative',
  shapeType: anychart.enums.ShapeType.CIRCLE,
  fillNames: ['negativeFill', 'hoverNegativeFill', 'selectNegativeFill'],
  strokeNames: ['negativeStroke', 'hoverNegativeStroke', 'selectNegativeStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleNegativeHatchConfig = {
  name: 'negativeHatchFill',
  shapeType: anychart.enums.ShapeType.CIRCLE,
  fillNames: ['negativeHatchFill', 'hoverNegativeHatchFill', 'selectNegativeHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRisingFillStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['risingFill', 'hoverRisingFill', 'selectRisingFill'],
  strokeNames: ['risingStroke', 'hoverRisingStroke', 'selectRisingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRisingStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['risingStroke', 'hoverRisingStroke', 'selectRisingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRisingHatchConfig = {
  name: 'risingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['risingHatchFill', 'hoverRisingHatchFill', 'selectRisingHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFallingFillStrokeConfig = {
  name: 'falling',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fallingFill', 'hoverFallingFill', 'selectFallingFill'],
  strokeNames: ['fallingStroke', 'hoverFallingStroke', 'selectFallingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFallingStrokeConfig = {
  name: 'falling',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['fallingStroke', 'hoverFallingStroke', 'selectFallingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFallingHatchConfig = {
  name: 'fallingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fallingHatchFill', 'hoverFallingHatchFill', 'selectFallingHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHighStrokeConfig = {
  name: 'high',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['highStroke', 'hoverHighStroke', 'selectHighStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLowStrokeConfig = {
  name: 'low',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['lowStroke', 'hoverLowStroke', 'selectLowStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFillStrokeConfig = {
  name: 'path',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fill', 'hoverFill', 'selectFill'],
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathMedianStrokeConfig = {
  name: 'median',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['medianStroke', 'hoverMedianStroke', 'selectMedianStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathStemStrokeConfig = {
  name: 'stem',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stemStroke', 'hoverStemStroke', 'selectStemStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathWhiskerStrokeConfig = {
  name: 'whisker',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['whiskerStroke', 'hoverWhiskerStroke', 'selectWhiskerStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathTopArea3DConfig = {
  name: 'top',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: null,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.TOP_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathTop3DConfig = {
  name: 'top',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.TOP_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathBottom3DConfig = {
  name: 'bottom',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.BOTTOM_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLeft3DConfig = {
  name: 'left',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.LEFT_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRight3DConfig = {
  name: 'right',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.RIGHT_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathBack3DConfig = {
  name: 'back',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.BACK_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFront3DConfig = {
  name: 'front',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke', 'hoverStroke', 'selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FRONT_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFront3DHatchConfig = {
  name: 'frontHatch',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['hatchFill', 'hoverHatchFill', 'selectHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.FRONT_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRight3DHatchConfig = {
  name: 'rightHatch',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['hatchFill', 'hoverHatchFill', 'selectHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.RIGHT_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathTop3DHatchConfig = {
  name: 'topHatch',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['hatchFill', 'hoverHatchFill', 'selectHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.TOP_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFillConfig = {
  name: 'fill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fill'],
  strokeNames: null,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerStrokeConfig = {
  name: 'stroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['stroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHatchConfig = {
  name: 'hatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['hatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerRisingFillStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['risingFill'],
  strokeNames: ['risingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerRisingStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['risingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerRisingHatchConfig = {
  name: 'risingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['risingHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFallingFillStrokeConfig = {
  name: 'falling',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fallingFill'],
  strokeNames: ['fallingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFallingStrokeConfig = {
  name: 'falling',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['fallingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFallingHatchConfig = {
  name: 'fallingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fallingHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHighStrokeConfig = {
  name: 'high',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['highStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerLowStrokeConfig = {
  name: 'low',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['lowStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFillStrokeConfig = {
  name: 'path',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['fill'],
  strokeNames: ['stroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFillConfig = {
  name: 'fill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['selectFill'],
  strokeNames: null,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectStrokeConfig = {
  name: 'stroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHatchConfig = {
  name: 'hatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['selectHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingFillStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['selectRisingFill'],
  strokeNames: ['selectRisingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['selectRisingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingHatchConfig = {
  name: 'risingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['selectRisingHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFallingFillStrokeConfig = {
  name: 'falling',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['selectFallingFill'],
  strokeNames: ['selectFallingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFallingStrokeConfig = {
  name: 'falling',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['selectFallingStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFallingHatchConfig = {
  name: 'fallingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['selectFallingHatchFill'],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHighStrokeConfig = {
  name: 'high',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['selectHighStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectLowStrokeConfig = {
  name: 'low',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: null,
  strokeNames: ['selectLowStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFillStrokeConfig = {
  name: 'path',
  shapeType: anychart.enums.ShapeType.PATH,
  fillNames: ['selectFill'],
  strokeNames: ['selectStroke'],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};
