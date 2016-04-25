/**
 * @fileoverview This is an optimization file to avoid massive strings usage.
 */

goog.provide('anychart.opt');


/**
 * Constant replacer for "fill" string.
 * @const {string}
 */
anychart.opt.FILL = 'fill';


/**
 * Constant replacer for "hoverFill" string.
 * @const {string}
 */
anychart.opt.HOVER_FILL = 'hoverFill';


/**
 * Constant replacer for "selectFill" string.
 * @const {string}
 */
anychart.opt.SELECT_FILL = 'selectFill';


/**
 * Constant replacer for "selectedFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_FILL = 'selectedFill';


/**
 * Constant replacer for "hatchFill" string.
 * @const {string}
 */
anychart.opt.HATCH_FILL = 'hatchFill';


/**
 * Constant replacer for "hoverHatchFill" string.
 * @const {string}
 */
anychart.opt.HOVER_HATCH_FILL = 'hoverHatchFill';


/**
 * Constant replacer for "selectHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECT_HATCH_FILL = 'selectHatchFill';


/**
 * Constant replacer for "selectedHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_HATCH_FILL = 'selectedHatchFill';


/**
 * Constant replacer for "stroke" string.
 * @const {string}
 */
anychart.opt.STROKE = 'stroke';


/**
 * Constant replacer for "hoverStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_STROKE = 'hoverStroke';


/**
 * Constant replacer for "selectStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_STROKE = 'selectStroke';


/**
 * Constant replacer for "selectedStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_STROKE = 'selectedStroke';


/**
 * Constant replacer for "risingFill" string.
 * @const {string}
 */
anychart.opt.RISING_FILL = 'risingFill';


/**
 * Constant replacer for "hoverRisingFill" string.
 * @const {string}
 */
anychart.opt.HOVER_RISING_FILL = 'hoverRisingFill';


/**
 * Constant replacer for "selectRisingFill" string.
 * @const {string}
 */
anychart.opt.SELECT_RISING_FILL = 'selectRisingFill';


/**
 * Constant replacer for "selectedRisingFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_RISING_FILL = 'selectedRisingFill';


/**
 * Constant replacer for "risingHatchFill" string.
 * @const {string}
 */
anychart.opt.RISING_HATCH_FILL = 'risingHatchFill';


/**
 * Constant replacer for "hoverRisingHatchFill" string.
 * @const {string}
 */
anychart.opt.HOVER_RISING_HATCH_FILL = 'hoverRisingHatchFill';


/**
 * Constant replacer for "selectRisingHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECT_RISING_HATCH_FILL = 'selectRisingHatchFill';


/**
 * Constant replacer for "selectedRisingHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_RISING_HATCH_FILL = 'selectedRisingHatchFill';


/**
 * Constant replacer for "risingStroke" string.
 * @const {string}
 */
anychart.opt.RISING_STROKE = 'risingStroke';


/**
 * Constant replacer for "hoverRisingStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_RISING_STROKE = 'hoverRisingStroke';


/**
 * Constant replacer for "selectRisingStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_RISING_STROKE = 'selectRisingStroke';


/**
 * Constant replacer for "selectedRisingStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_RISING_STROKE = 'selectedRisingStroke';


/**
 * Constant replacer for "fallingFill" string.
 * @const {string}
 */
anychart.opt.FALLING_FILL = 'fallingFill';


/**
 * Constant replacer for "hoverFallingFill" string.
 * @const {string}
 */
anychart.opt.HOVER_FALLING_FILL = 'hoverFallingFill';


/**
 * Constant replacer for "selectFallingFill" string.
 * @const {string}
 */
anychart.opt.SELECT_FALLING_FILL = 'selectFallingFill';


/**
 * Constant replacer for "selectedFallingFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_FALLING_FILL = 'selectedFallingFill';


/**
 * Constant replacer for "fallingHatchFill" string.
 * @const {string}
 */
anychart.opt.FALLING_HATCH_FILL = 'fallingHatchFill';


/**
 * Constant replacer for "hoverFallingHatchFill" string.
 * @const {string}
 */
anychart.opt.HOVER_FALLING_HATCH_FILL = 'hoverFallingHatchFill';


/**
 * Constant replacer for "selectFallingHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECT_FALLING_HATCH_FILL = 'selectFallingHatchFill';


/**
 * Constant replacer for "selectedFallingHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_FALLING_HATCH_FILL = 'selectedFallingHatchFill';


/**
 * Constant replacer for "fallingStroke" string.
 * @const {string}
 */
anychart.opt.FALLING_STROKE = 'fallingStroke';


/**
 * Constant replacer for "hoverFallingStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_FALLING_STROKE = 'hoverFallingStroke';


/**
 * Constant replacer for "selectFallingStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_FALLING_STROKE = 'selectFallingStroke';


/**
 * Constant replacer for "selectedFallingStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_FALLING_STROKE = 'selectedFallingStroke';


/**
 * Constant replacer for "medianStroke" string.
 * @const {string}
 */
anychart.opt.MEDIAN_STROKE = 'medianStroke';


/**
 * Constant replacer for "hoverMedianStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_MEDIAN_STROKE = 'hoverMedianStroke';


/**
 * Constant replacer for "selectMedianStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_MEDIAN_STROKE = 'selectMedianStroke';


/**
 * Constant replacer for "selectedMedianStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_MEDIAN_STROKE = 'selectedMedianStroke';


/**
 * Constant replacer for "stemStroke" string.
 * @const {string}
 */
anychart.opt.STEM_STROKE = 'stemStroke';


/**
 * Constant replacer for "hoverStemStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_STEM_STROKE = 'hoverStemStroke';


/**
 * Constant replacer for "selectStemStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_STEM_STROKE = 'selectStemStroke';


/**
 * Constant replacer for "selectedStemStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_STEM_STROKE = 'selectedStemStroke';


/**
 * Constant replacer for "whiskerStroke" string.
 * @const {string}
 */
anychart.opt.WHISKER_STROKE = 'whiskerStroke';


/**
 * Constant replacer for "hoverWhiskerStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_WHISKER_STROKE = 'hoverWhiskerStroke';


/**
 * Constant replacer for "selectWhiskerStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_WHISKER_STROKE = 'selectWhiskerStroke';


/**
 * Constant replacer for "selectedWhiskerStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_WHISKER_STROKE = 'selectedWhiskerStroke';


/**
 * Constant replacer for "rising" string.
 * @const {string}
 */
anychart.opt.RISING = 'rising';


/**
 * Constant replacer for "falling" string.
 * @const {string}
 */
anychart.opt.FALLING = 'falling';


/**
 * Constant replacer for "path" string.
 * @const {string}
 */
anychart.opt.PATH = 'path';


/**
 * Constant replacer for "rect" string.
 * @const {string}
 */
anychart.opt.RECT = 'rect';


/**
 * Constant replacer for "circle" string.
 * @const {string}
 */
anychart.opt.CIRCLE = 'circle';


/**
 * Constant replacer for "x" string.
 * @const {string}
 */
anychart.opt.X = 'x';


/**
 * Constant replacer for "y" string.
 * @const {string}
 */
anychart.opt.Y = 'y';


/**
 * Constant replacer for "zero" string.
 * @const {string}
 */
anychart.opt.ZERO = 'zero';


/**
 * Constant replacer for "zeroMissing" string.
 * @const {string}
 */
anychart.opt.ZERO_MISSING = 'zeroMissing';


/**
 * Constant replacer for "stackedValue" string.
 * @const {string}
 */
anychart.opt.STACKED_VALUE = 'stackedValue';


/**
 * Constant replacer for "stackedZero" string.
 * @const {string}
 */
anychart.opt.STACKED_ZERO = 'stackedZero';


/**
 * Constant replacer for "stackedMissing" string.
 * @const {string}
 */
anychart.opt.STACKED_MISSING = 'stackedMissing';


/**
 * Constant replacer for "value" string.
 * @const {string}
 */
anychart.opt.VALUE = 'value';


/**
 * Constant replacer for "open" string.
 * @const {string}
 */
anychart.opt.OPEN = 'open';


/**
 * Constant replacer for "high" string.
 * @const {string}
 */
anychart.opt.HIGH = 'high';


/**
 * Constant replacer for "low" string.
 * @const {string}
 */
anychart.opt.LOW = 'low';


/**
 * Constant replacer for "close" string.
 * @const {string}
 */
anychart.opt.CLOSE = 'close';


/**
 * Constant replacer for "lowest" string.
 * @const {string}
 */
anychart.opt.LOWEST = 'lowest';


/**
 * Constant replacer for "q1" string.
 * @const {string}
 */
anychart.opt.Q1 = 'q1';


/**
 * Constant replacer for "median" string.
 * @const {string}
 */
anychart.opt.MEDIAN = 'median';


/**
 * Constant replacer for "q3" string.
 * @const {string}
 */
anychart.opt.Q3 = 'q3';


/**
 * Constant replacer for "highest" string.
 * @const {string}
 */
anychart.opt.HIGHEST = 'highest';


/**
 * Constant replacer for "outliers" string.
 * @const {string}
 */
anychart.opt.OUTLIERS = 'outliers';


/**
 * Constant replacer for "stem" string.
 * @const {string}
 */
anychart.opt.STEM = 'stem';


/**
 * Constant replacer for "whisker" string.
 * @const {string}
 */
anychart.opt.WHISKER = 'whisker';


/**
 * Constant replacer for "size" string.
 * @const {string}
 */
anychart.opt.SIZE = 'size';


/**
 * Constant replacer for "whiskerWidth" string.
 * @const {string}
 */
anychart.opt.WHISKER_WIDTH = 'whiskerWidth';


/**
 * Constant replacer for "hoverWhiskerWidth" string.
 * @const {string}
 */
anychart.opt.HOVER_WHISKER_WIDTH = 'hoverWhiskerWidth';


/**
 * Constant replacer for "selectWhiskerWidth" string.
 * @const {string}
 */
anychart.opt.SELECT_WHISKER_WIDTH = 'selectWhiskerWidth';


/**
 * Constant replacer for "pointWidth" string.
 * @const {string}
 */
anychart.opt.POINT_WIDTH = 'pointWidth';


/**
 * Constant replacer for "connectMissingPoints" string.
 * @const {string}
 */
anychart.opt.CONNECT_MISSING_POINTS = 'connectMissingPoints';


/**
 * Constant replacer for "displayNegative" string.
 * @const {string}
 */
anychart.opt.DISPLAY_NEGATIVE = 'displayNegative';


/**
 * Constant replacer for "shapes" string.
 * @const {string}
 */
anychart.opt.SHAPES = 'shapes';


/**
 * Constant replacer for "secondaryShapes" string.
 * @const {string}
 */
anychart.opt.SECONDARY_SHAPES = 'secondaryShapes';


/**
 * Constant replacer for "missing" string.
 * @const {string}
 */
anychart.opt.MISSING = 'missing';


/**
 * Constant replacer for "artificial" string.
 * @const {string}
 */
anychart.opt.ARTIFICIAL = 'artificial';


/**
 * Constant replacer for "front" string.
 * @const {string}
 */
anychart.opt.FRONT = 'front';


/**
 * Constant replacer for "back" string.
 * @const {string}
 */
anychart.opt.BACK = 'back';


/**
 * Constant replacer for "left" string.
 * @const {string}
 */
anychart.opt.LEFT = 'left';


/**
 * Constant replacer for "right" string.
 * @const {string}
 */
anychart.opt.RIGHT = 'right';


/**
 * Constant replacer for "bottom" string.
 * @const {string}
 */
anychart.opt.BOTTOM = 'bottom';


/**
 * Constant replacer for "top" string.
 * @const {string}
 */
anychart.opt.TOP = 'top';


/**
 * Constant replacer for "negative" string.
 * @const {string}
 */
anychart.opt.NEGATIVE = 'negative';


/**
 * Constant replacer for "negativeFill" string.
 * @const {string}
 */
anychart.opt.NEGATIVE_FILL = 'negativeFill';


/**
 * Constant replacer for "hoverNegativeFill" string.
 * @const {string}
 */
anychart.opt.HOVER_NEGATIVE_FILL = 'hoverNegativeFill';


/**
 * Constant replacer for "selectNegativeFill" string.
 * @const {string}
 */
anychart.opt.SELECT_NEGATIVE_FILL = 'selectNegativeFill';


/**
 * Constant replacer for "selectedNegativeFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_NEGATIVE_FILL = 'selectedNegativeFill';


/**
 * Constant replacer for "negativeStroke" string.
 * @const {string}
 */
anychart.opt.NEGATIVE_STROKE = 'negativeStroke';


/**
 * Constant replacer for "hoverNegativeStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_NEGATIVE_STROKE = 'hoverNegativeStroke';


/**
 * Constant replacer for "selectNegativeStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_NEGATIVE_STROKE = 'selectNegativeStroke';


/**
 * Constant replacer for "selectedNegativeStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_NEGATIVE_STROKE = 'selectedNegativeStroke';


/**
 * Constant replacer for "negativeHatchFill" string.
 * @const {string}
 */
anychart.opt.NEGATIVE_HATCH_FILL = 'negativeHatchFill';


/**
 * Constant replacer for "hoverNegativeHatchFill" string.
 * @const {string}
 */
anychart.opt.HOVER_NEGATIVE_HATCH_FILL = 'hoverNegativeHatchFill';


/**
 * Constant replacer for "selectNegativeHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECT_NEGATIVE_HATCH_FILL = 'selectNegativeHatchFill';


/**
 * Constant replacer for "selectedNegativeHatchFill" string.
 * @const {string}
 */
anychart.opt.SELECTED_NEGATIVE_HATCH_FILL = 'selectedNegativeHatchFill';


/**
 * Constant replacer for "highStroke" string.
 * @const {string}
 */
anychart.opt.HIGH_STROKE = 'highStroke';


/**
 * Constant replacer for "hoverHighStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_HIGH_STROKE = 'hoverHighStroke';


/**
 * Constant replacer for "selectHighStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_HIGH_STROKE = 'selectHighStroke';


/**
 * Constant replacer for "selectedHighStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_HIGH_STROKE = 'selectedHighStroke';


/**
 * Constant replacer for "lowStroke" string.
 * @const {string}
 */
anychart.opt.LOW_STROKE = 'lowStroke';


/**
 * Constant replacer for "hoverLowStroke" string.
 * @const {string}
 */
anychart.opt.HOVER_LOW_STROKE = 'hoverLowStroke';


/**
 * Constant replacer for "selectLowStroke" string.
 * @const {string}
 */
anychart.opt.SELECT_LOW_STROKE = 'selectLowStroke';


/**
 * Constant replacer for "selectedLowStroke" string.
 * @const {string}
 */
anychart.opt.SELECTED_LOW_STROKE = 'selectedLowStroke';


/**
 * Constant replacer for "color" string.
 * @const {string}
 */
anychart.opt.COLOR = 'color';


/**
 * Constant replacer for "xPointPosition" string.
 * @const {string}
 */
anychart.opt.X_POINT_POSITION = 'xPointPosition';


/**
 * Constant replacer for "none" string.
 * @const {string}
 */
anychart.opt.NONE = 'none';


/**
 * Constant replacer for "enabled" string.
 * @const {string}
 */
anychart.opt.ENABLED = 'enabled';


/**
 * Constant replacer for "marker" string.
 * @const {string}
 */
anychart.opt.MARKER = 'marker';


/**
 * Constant replacer for "hoverMarker" string.
 * @const {string}
 */
anychart.opt.HOVER_MARKER = 'hoverMarker';


/**
 * Constant replacer for "selectMarker" string.
 * @const {string}
 */
anychart.opt.SELECT_MARKER = 'selectMarker';


/**
 * Constant replacer for "label" string.
 * @const {string}
 */
anychart.opt.LABEL = 'label';


/**
 * Constant replacer for "hoverLabel" string.
 * @const {string}
 */
anychart.opt.HOVER_LABEL = 'hoverLabel';


/**
 * Constant replacer for "selectLabel" string.
 * @const {string}
 */
anychart.opt.SELECT_LABEL = 'selectLabel';


/**
 * Constant replacer for "outlierMarker" string.
 * @const {string}
 */
anychart.opt.OUTLIER_MARKER = 'outlierMarker';


/**
 * Constant replacer for "hoverOutlierMarker" string.
 * @const {string}
 */
anychart.opt.HOVER_OUTLIER_MARKER = 'hoverOutlierMarker';


/**
 * Constant replacer for "selectOutlierMarker" string.
 * @const {string}
 */
anychart.opt.SELECT_OUTLIER_MARKER = 'selectOutlierMarker';


/**
 * Constant replacer for "position" string.
 * @const {string}
 */
anychart.opt.POSITION = 'position';


/**
 * Constant replacer for "data" string.
 * @const {string}
 */
anychart.opt.DATA = 'data';


/**
 * Constant replacer for "meta" string.
 * @const {string}
 */
anychart.opt.META = 'meta';


/**
 * Constant replacer for "rawIndex" string.
 * @const {string}
 */
anychart.opt.RAW_INDEX = 'rawIndex';


/**
 * Constant replacer for "type" string.
 * @const {string}
 */
anychart.opt.TYPE = 'type';


/**
 * Constant replacer for "hoverType" string.
 * @const {string}
 */
anychart.opt.HOVER_TYPE = 'hoverType';


/**
 * Constant replacer for "selectType" string.
 * @const {string}
 */
anychart.opt.SELECT_TYPE = 'selectType';


/**
 * Constant replacer for "selectedType" string.
 * @const {string}
 */
anychart.opt.SELECTED_TYPE = 'selectedType';


/**
 * Constant replacer for "markerSize" string.
 * @const {string}
 */
anychart.opt.MARKER_SIZE = 'markerSize';


/**
 * Constant replacer for "hoverMarkerSize" string.
 * @const {string}
 */
anychart.opt.HOVER_MARKER_SIZE = 'hoverMarkerSize';


/**
 * Constant replacer for "selectMarkerSize" string.
 * @const {string}
 */
anychart.opt.SELECT_MARKER_SIZE = 'selectMarkerSize';


/**
 * Constant replacer for "selectedMarkerSize" string.
 * @const {string}
 */
anychart.opt.SELECTED_MARKER_SIZE = 'selectedMarkerSize';


/**
 * Constant replacer for "hoverSize" string.
 * @const {string}
 */
anychart.opt.HOVER_SIZE = 'hoverSize';


/**
 * Constant replacer for "selectSize" string.
 * @const {string}
 */
anychart.opt.SELECT_SIZE = 'selectSize';


/**
 * Constant replacer for "selectedSize" string.
 * @const {string}
 */
anychart.opt.SELECTED_SIZE = 'selectedSize';


/**
 * Constant replacer for "error" string.
 * @const {string}
 */
anychart.opt.ERROR = 'error';


/**
 * Constant replacer for "xError" string.
 * @const {string}
 */
anychart.opt.X_ERROR = 'xError';


/**
 * Constant replacer for "xLowerError" string.
 * @const {string}
 */
anychart.opt.X_LOWER_ERROR = 'xLowerError';


/**
 * Constant replacer for "xUpperError" string.
 * @const {string}
 */
anychart.opt.X_UPPER_ERROR = 'xUpperError';


/**
 * Constant replacer for "valueError" string.
 * @const {string}
 */
anychart.opt.VALUE_ERROR = 'valueError';


/**
 * Constant replacer for "valueLowerError" string.
 * @const {string}
 */
anychart.opt.VALUE_LOWER_ERROR = 'valueLowerError';


/**
 * Constant replacer for "valueUpperError" string.
 * @const {string}
 */
anychart.opt.VALUE_UPPER_ERROR = 'valueUpperError';


/**
 * Constant replacer for "text" string.
 * @const {string}
 */
anychart.opt.TEXT = 'text';


/**
 * Constant replacer for "iconEnabled" string.
 * @const {string}
 */
anychart.opt.ICON_ENABLED = 'iconEnabled';


/**
 * Constant replacer for "iconType" string.
 * @const {string}
 */
anychart.opt.ICON_TYPE = 'iconType';


/**
 * Constant replacer for "iconStroke" string.
 * @const {string}
 */
anychart.opt.ICON_STROKE = 'iconStroke';


/**
 * Constant replacer for "iconFill" string.
 * @const {string}
 */
anychart.opt.ICON_FILL = 'iconFill';


/**
 * Constant replacer for "iconHatchFill" string.
 * @const {string}
 */
anychart.opt.ICON_HATCH_FILL = 'iconHatchFill';


/**
 * Constant replacer for "disabled" string.
 * @const {string}
 */
anychart.opt.DISABLED = 'disabled';


/**
 * Constant replacer for "iconMarkerType" string.
 * @const {string}
 */
anychart.opt.ICON_MARKER_TYPE = 'iconMarkerType';


/**
 * Constant replacer for "iconMarkerStroke" string.
 * @const {string}
 */
anychart.opt.ICON_MARKER_STROKE = 'iconMarkerStroke';


/**
 * Constant replacer for "iconMarkerFill" string.
 * @const {string}
 */
anychart.opt.ICON_MARKER_FILL = 'iconMarkerFill';


/**
 * Constant replacer for "topHatch" string.
 * @const {string}
 */
anychart.opt.TOP_HATCH = 'topHatch';


/**
 * Constant replacer for "frontHatch" string.
 * @const {string}
 */
anychart.opt.FRONT_HATCH = 'frontHatch';


/**
 * Constant replacer for "rightHatch" string.
 * @const {string}
 */
anychart.opt.RIGHT_HATCH = 'rightHatch';


/**
 * Constant replacer for "zIndex" string.
 * @const {string}
 */
anychart.opt.Z_INDEX = 'zIndex';


/**
 * Constant replacer for "legendItem" string.
 * @const {string}
 */
anychart.opt.LEGEND_ITEM = 'legendItem';


/**
 * Constant replacer for "tooltip" string.
 * @const {string}
 */
anychart.opt.TOOLTIP = 'tooltip';


/**
 * Constant replacer for "clip" string.
 * @const {string}
 */
anychart.opt.CLIP = 'clip';


/**
 * Constant replacer for "unit" string.
 * @const {string}
 */
anychart.opt.UNIT = 'unit';


/**
 * Constant replacer for "count" string.
 * @const {string}
 */
anychart.opt.COUNT = 'count';


/**
 * Constant replacer for "levels" string.
 * @const {string}
 */
anychart.opt.LEVELS = 'levels';


/**
 * Constant replacer for "maxVisiblePoints" string.
 * @const {string}
 */
anychart.opt.MAX_VISIBLE_POINTS = 'maxVisiblePoints';


/**
 * Constant replacer for "minPixPerPoint" string.
 * @const {string}
 */
anychart.opt.MIN_PIX_PER_POINT = 'minPixPerPoint';


/**
 * Constant replacer for "xMode" string.
 * @const {string}
 */
anychart.opt.X_MODE = 'xMode';


/**
 * Constant replacer for "forced" string.
 * @const {string}
 */
anychart.opt.FORCED = 'forced';


/**
 * Constant replacer for "reset" string.
 * @const {string}
 */
anychart.opt.RESET = 'reset';


/**
 * Constant replacer for "considerItem" string.
 * @const {string}
 */
anychart.opt.CONSIDER_ITEM = 'considerItem';


/**
 * Constant replacer for "getResult" string.
 * @const {string}
 */
anychart.opt.GET_RESULT = 'getResult';


/**
 * Constant replacer for "COLUMN" string.
 * @const {string}
 */
anychart.opt.COLUMN = 'COLUMN';


/**
 * Constant replacer for "weights" string.
 * @const {string}
 */
anychart.opt.WEIGHTS = 'weights';


/**
 * Constant replacer for "excluded" string.
 * @const {string}
 */
anychart.opt.EXCLUDED = 'excluded';


/**
 * Constant replacer for "hasPointMarker" string.
 * @const {string}
 */
anychart.opt.HAS_POINT_MARKER = 'hasPointMarker';


/**
 * Constant replacer for "hasPointLabel" string.
 * @const {string}
 */
anychart.opt.HAS_POINT_LABEL = 'hasPointLabel';


/**
 * Constant replacer for "hasPointOutlier" string.
 * @const {string}
 */
anychart.opt.HAS_POINT_OUTLIER = 'hasPointOutlier';
