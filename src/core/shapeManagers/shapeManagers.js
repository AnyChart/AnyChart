goog.provide('anychart.core.shapeManagers');
goog.require('anychart.opt');


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
  name: anychart.opt.FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FILL, anychart.opt.HOVER_FILL, anychart.opt.SELECT_FILL],
  strokeNames: null,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathStrokeConfig = {
  name: anychart.opt.STROKE,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHatchConfig = {
  name: anychart.opt.HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.HATCH_FILL, anychart.opt.HOVER_HATCH_FILL, anychart.opt.SELECT_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleFillStrokeConfig = {
  name: anychart.opt.CIRCLE,
  shapeType: anychart.opt.CIRCLE,
  fillNames: [anychart.opt.FILL, anychart.opt.HOVER_FILL, anychart.opt.SELECT_FILL],
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleHatchConfig = {
  name: anychart.opt.HATCH_FILL,
  shapeType: anychart.opt.CIRCLE,
  fillNames: [anychart.opt.HATCH_FILL, anychart.opt.HOVER_HATCH_FILL, anychart.opt.SELECT_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleNegativeFillStrokeConfig = {
  name: anychart.opt.NEGATIVE,
  shapeType: anychart.opt.CIRCLE,
  fillNames: [anychart.opt.NEGATIVE_FILL, anychart.opt.HOVER_NEGATIVE_FILL, anychart.opt.SELECT_NEGATIVE_FILL],
  strokeNames: [anychart.opt.NEGATIVE_STROKE, anychart.opt.HOVER_NEGATIVE_STROKE, anychart.opt.SELECT_NEGATIVE_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleNegativeHatchConfig = {
  name: anychart.opt.NEGATIVE_HATCH_FILL,
  shapeType: anychart.opt.CIRCLE,
  fillNames: [anychart.opt.NEGATIVE_HATCH_FILL, anychart.opt.HOVER_NEGATIVE_HATCH_FILL, anychart.opt.SELECT_NEGATIVE_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRisingFillStrokeConfig = {
  name: anychart.opt.RISING,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.RISING_FILL, anychart.opt.HOVER_RISING_FILL, anychart.opt.SELECT_RISING_FILL],
  strokeNames: [anychart.opt.RISING_STROKE, anychart.opt.HOVER_RISING_STROKE, anychart.opt.SELECT_RISING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRisingStrokeConfig = {
  name: anychart.opt.RISING,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.RISING_STROKE, anychart.opt.HOVER_RISING_STROKE, anychart.opt.SELECT_RISING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRisingHatchConfig = {
  name: anychart.opt.RISING_HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.RISING_HATCH_FILL, anychart.opt.HOVER_RISING_HATCH_FILL, anychart.opt.SELECT_RISING_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFallingFillStrokeConfig = {
  name: anychart.opt.FALLING,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FALLING_FILL, anychart.opt.HOVER_FALLING_FILL, anychart.opt.SELECT_FALLING_FILL],
  strokeNames: [anychart.opt.FALLING_STROKE, anychart.opt.HOVER_FALLING_STROKE, anychart.opt.SELECT_FALLING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFallingStrokeConfig = {
  name: anychart.opt.FALLING,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.FALLING_STROKE, anychart.opt.HOVER_FALLING_STROKE, anychart.opt.SELECT_FALLING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFallingHatchConfig = {
  name: anychart.opt.FALLING_HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FALLING_HATCH_FILL, anychart.opt.HOVER_FALLING_HATCH_FILL, anychart.opt.SELECT_FALLING_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHighStrokeConfig = {
  name: anychart.opt.HIGH,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.HIGH_STROKE, anychart.opt.HOVER_HIGH_STROKE, anychart.opt.SELECT_HIGH_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLowStrokeConfig = {
  name: anychart.opt.LOW,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.LOW_STROKE, anychart.opt.HOVER_LOW_STROKE, anychart.opt.SELECT_LOW_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFillStrokeConfig = {
  name: anychart.opt.PATH,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FILL, anychart.opt.HOVER_FILL, anychart.opt.SELECT_FILL],
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathMedianStrokeConfig = {
  name: anychart.opt.MEDIAN,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.MEDIAN_STROKE, anychart.opt.HOVER_MEDIAN_STROKE, anychart.opt.SELECT_MEDIAN_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathStemStrokeConfig = {
  name: anychart.opt.STEM,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STEM_STROKE, anychart.opt.HOVER_STEM_STROKE, anychart.opt.SELECT_STEM_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathWhiskerStrokeConfig = {
  name: anychart.opt.WHISKER,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.WHISKER_STROKE, anychart.opt.HOVER_WHISKER_STROKE, anychart.opt.SELECT_WHISKER_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathTopArea3DConfig = {
  name: anychart.opt.TOP,
  shapeType: anychart.opt.PATH,
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
  name: anychart.opt.TOP,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.TOP_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathBottom3DConfig = {
  name: anychart.opt.BOTTOM,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.BOTTOM_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLeft3DConfig = {
  name: anychart.opt.LEFT,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.LEFT_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRight3DConfig = {
  name: anychart.opt.RIGHT,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.RIGHT_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathBack3DConfig = {
  name: anychart.opt.BACK,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.BACK_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFront3DConfig = {
  name: anychart.opt.FRONT,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE, anychart.opt.HOVER_STROKE, anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FRONT_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFront3DHatchConfig = {
  name: anychart.opt.FRONT_HATCH,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.HATCH_FILL, anychart.opt.HOVER_HATCH_FILL, anychart.opt.SELECT_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.FRONT_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathRight3DHatchConfig = {
  name: anychart.opt.RIGHT_HATCH,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.HATCH_FILL, anychart.opt.HOVER_HATCH_FILL, anychart.opt.SELECT_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.RIGHT_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathTop3DHatchConfig = {
  name: anychart.opt.TOP_HATCH,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.HATCH_FILL, anychart.opt.HOVER_HATCH_FILL, anychart.opt.SELECT_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.TOP_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFillConfig = {
  name: anychart.opt.FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FILL],
  strokeNames: null,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerStrokeConfig = {
  name: anychart.opt.STROKE,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHatchConfig = {
  name: anychart.opt.HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerRisingFillStrokeConfig = {
  name: anychart.opt.RISING,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.RISING_FILL],
  strokeNames: [anychart.opt.RISING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerRisingStrokeConfig = {
  name: anychart.opt.RISING,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.RISING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerRisingHatchConfig = {
  name: anychart.opt.RISING_HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.RISING_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFallingFillStrokeConfig = {
  name: anychart.opt.FALLING,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FALLING_FILL],
  strokeNames: [anychart.opt.FALLING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFallingStrokeConfig = {
  name: anychart.opt.FALLING,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.FALLING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFallingHatchConfig = {
  name: anychart.opt.FALLING_HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FALLING_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHighStrokeConfig = {
  name: anychart.opt.HIGH,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.HIGH_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerLowStrokeConfig = {
  name: anychart.opt.LOW,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.LOW_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFillStrokeConfig = {
  name: anychart.opt.PATH,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.FILL],
  strokeNames: [anychart.opt.STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFillConfig = {
  name: anychart.opt.FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.SELECT_FILL],
  strokeNames: null,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectStrokeConfig = {
  name: anychart.opt.STROKE,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHatchConfig = {
  name: anychart.opt.HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.SELECT_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingFillStrokeConfig = {
  name: anychart.opt.RISING,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.SELECT_RISING_FILL],
  strokeNames: [anychart.opt.SELECT_RISING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingStrokeConfig = {
  name: anychart.opt.RISING,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.SELECT_RISING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingHatchConfig = {
  name: anychart.opt.RISING_HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.SELECT_RISING_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFallingFillStrokeConfig = {
  name: anychart.opt.FALLING,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.SELECT_FALLING_FILL],
  strokeNames: [anychart.opt.SELECT_FALLING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFallingStrokeConfig = {
  name: anychart.opt.FALLING,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.SELECT_FALLING_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFallingHatchConfig = {
  name: anychart.opt.FALLING_HATCH_FILL,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.SELECT_FALLING_HATCH_FILL],
  strokeNames: null,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHighStrokeConfig = {
  name: anychart.opt.HIGH,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.SELECT_HIGH_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectLowStrokeConfig = {
  name: anychart.opt.LOW,
  shapeType: anychart.opt.PATH,
  fillNames: null,
  strokeNames: [anychart.opt.SELECT_LOW_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFillStrokeConfig = {
  name: anychart.opt.PATH,
  shapeType: anychart.opt.PATH,
  fillNames: [anychart.opt.SELECT_FILL],
  strokeNames: [anychart.opt.SELECT_STROKE],
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};
