goog.provide('anychart.core.shapeManagers');


/**
 * Shape config.
 * @typedef {{
 *   name: string,
 *   shapeType: string,
 *   fillName: (string|boolean|null),
 *   strokeName: (string|boolean|null),
 *   canBeHoveredSelected: boolean,
 *   scrollerSelected: (boolean|undefined),
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
 * Z index shift for the cap shapes of 3D area series.
 * @const {number}
 */
anychart.core.shapeManagers.AREA_CAP_SHAPES_ZINDEX = 3.5 * anychart.core.shapeManagers.ZINDEX_STEP;


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
 * Z index shift for the front shapes of 3D series.
 * @const {number}
 */
anychart.core.shapeManagers.BEFORE_FRONT_HATCH_SHAPES_ZINDEX = 9 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the labels.
 * @const {number}
 */
anychart.core.shapeManagers.LABELS_ZINDEX = 10 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the outlier markers.
 * @const {number}
 */
anychart.core.shapeManagers.OUTLIERS_ZINDEX = 11 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the markers.
 * @const {number}
 */
anychart.core.shapeManagers.MARKERS_ZINDEX = 12 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Z index shift for the map labels.
 * @const {number}
 */
anychart.core.shapeManagers.LABELS_OVER_MARKERS_ZINDEX = 13 * anychart.core.shapeManagers.ZINDEX_STEP;


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathFillConfig = {
  name: 'fill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'fill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathNegativeStrokeConfig = {
  name: 'negative',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'negativeStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathStrokeTopZIndexConfig = {
  name: 'stroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.BEFORE_FRONT_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHatchConfig = {
  name: 'hatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLowHatchConfig = {
  name: 'lowHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowHatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHighHatchConfig = {
  name: 'highHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highHatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.rectFillStrokeConfig = {
  name: 'rect',
  shapeType: anychart.enums.ShapeType.RECT,
  fillName: 'fill',
  strokeName: 'stroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.rectHatchConfig = {
  name: 'hatchRect',
  shapeType: anychart.enums.ShapeType.RECT,
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: 'fill',
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathContiniousNegativeFillConfig = {
  name: 'negativeFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'negativeFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig = {
  name: 'negativeStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'negativeStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.circleNegativeFillStrokeConfig = {
  name: 'negative',
  shapeType: anychart.enums.ShapeType.CIRCLE,
  fillName: 'negativeFill',
  strokeName: 'negativeStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathNegativeFillStrokeConfig = {
  name: 'negative',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'negativeFill',
  strokeName: 'negativeStroke',
  canBeHoveredSelected: true,
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
  fillName: 'negativeHatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: 'risingFill',
  strokeName: 'risingStroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'risingStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathContiniousRisingStrokeConfig = {
  name: 'risingStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'risingStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathContiniousRisingFillConfig = {
  name: 'risingFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'risingFill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: 'risingHatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: 'fallingFill',
  strokeName: 'fallingStroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'fallingStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathContiniousFallingStrokeConfig = {
  name: 'fallingStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'fallingStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathContiniousFallingFillConfig = {
  name: 'fallingFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'fallingFill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: 'fallingHatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathNegativeHatchConfig = {
  name: 'negativeHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'negativeHatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHighFillConfig = {
  name: 'highFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHighStrokeConfig = {
  name: 'highStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'highStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathHighFillStrokeConfig = {
  name: 'high',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highFill',
  strokeName: 'highStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLowFillStrokeConfig = {
  name: 'low',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowFill',
  strokeName: 'lowStroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLowFillConfig = {
  name: 'lowFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLowStrokeConfig = {
  name: 'lowStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'lowStroke',
  canBeHoveredSelected: true,
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
  fillName: 'fill',
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'medianStroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'stemStroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'whiskerStroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.TOP_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathCapArea3DConfig = {
  name: 'cap',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.AREA_CAP_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathTop3DConfig = {
  name: 'top',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: true,
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
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
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
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.TOP_HATCH_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathLine3DConfig = {
  name: 'path',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerFillConfig = {
  name: 'fill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'fill',
  strokeName: null,
  canBeHoveredSelected: false,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: false,
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
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerNegativeHatchConfig = {
  name: 'negativeHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'negativeHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerNegativeFillStrokeConfig = {
  name: 'negative',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'negativeFill',
  strokeName: 'negativeStroke',
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerRisingFillStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'risingFill',
  strokeName: 'risingStroke',
  canBeHoveredSelected: false,
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
  fillName: null,
  strokeName: 'risingStroke',
  canBeHoveredSelected: false,
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
  fillName: 'risingHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
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
  fillName: 'fallingFill',
  strokeName: 'fallingStroke',
  canBeHoveredSelected: false,
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
  fillName: null,
  strokeName: 'fallingStroke',
  canBeHoveredSelected: false,
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
  fillName: 'fallingHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHighFillConfig = {
  name: 'highFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerLowFillConfig = {
  name: 'lowFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHighFillConfig = {
  name: 'highFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectLowFillConfig = {
  name: 'lowFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowFill',
  strokeName: null,
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHighFillStrokeConfig = {
  name: 'high',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highFill',
  strokeName: 'highStroke',
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerLowFillStrokeConfig = {
  name: 'low',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowFill',
  strokeName: 'lowStroke',
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHighFillStrokeConfig = {
  name: 'high',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highFill',
  strokeName: 'highStroke',
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectLowFillStrokeConfig = {
  name: 'low',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowFill',
  strokeName: 'lowStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHighHatchConfig = {
  name: 'highHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerLowHatchConfig = {
  name: 'lowHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHighHatchConfig = {
  name: 'highHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'highHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectLowHatchConfig = {
  name: 'lowHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'lowHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerHighStrokeConfig = {
  name: 'highStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'highStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerLowStrokeConfig = {
  name: 'lowStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'lowStroke',
  canBeHoveredSelected: false,
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
  fillName: 'fill',
  strokeName: 'stroke',
  canBeHoveredSelected: false,
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
  fillName: 'fill',
  strokeName: null,
  canBeHoveredSelected: false,
  scrollerSelected: true,
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
  fillName: null,
  strokeName: 'stroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
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
  fillName: 'hatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectNegativeHatchConfig = {
  name: 'negativeHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'negativeHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectNegativeFillStrokeConfig = {
  name: 'negative',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'negativeFill',
  strokeName: 'negativeStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingFillStrokeConfig = {
  name: 'rising',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'risingFill',
  strokeName: 'risingStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
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
  fillName: null,
  strokeName: 'risingStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectNegativeStrokeConfig = {
  name: 'negative',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'negativeStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectRisingHatchConfig = {
  name: 'risingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'risingHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  scrollerSelected: true,
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
  fillName: 'fallingFill',
  strokeName: 'fallingStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
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
  fillName: null,
  strokeName: 'fallingStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectFallingHatchConfig = {
  name: 'fallingHatchFill',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'fallingHatchFill',
  strokeName: null,
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: true,
  zIndex: anychart.core.shapeManagers.HATCH_FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectHighStrokeConfig = {
  name: 'highStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'highStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathScrollerSelectLowStrokeConfig = {
  name: 'lowStroke',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: null,
  strokeName: 'lowStroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
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
  fillName: 'fill',
  strokeName: 'stroke',
  canBeHoveredSelected: false,
  scrollerSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathMapConnectorEventHandlerConfig = {
  name: 'eventHandler',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: true,
  strokeName: null,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.foreignPathFillConfig = {
  name: 'foreignFill',
  shapeType: anychart.enums.ShapeType.NONE,
  fillName: 'fill',
  strokeName: 'stroke',
  canBeHoveredSelected: true,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.FILL_SHAPES_ZINDEX
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.core.shapeManagers.ShapeConfig}
 */
anychart.core.shapeManagers.pathEventMarkerHandlerConfig = {
  name: 'overlay',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: true,
  strokeName: true,
  canBeHoveredSelected: false,
  isHatchFill: false,
  zIndex: anychart.core.shapeManagers.STROKE_SHAPES_ZINDEX
};
