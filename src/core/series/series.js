goog.provide('anychart.core.series');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.enums');


/**
 * Series configuration enum. Values can be combined. STARTS ON anychart.core.drawers.Capabilities last flag number.
 * @enum {number}
 */
anychart.core.series.Capabilities = {
  ALLOW_INTERACTIVITY: 1 << 15,
  ALLOW_POINT_SETTINGS: 1 << 16,
  ALLOW_ERROR: 1 << 17,
  SUPPORTS_MARKERS: 1 << 18,
  SUPPORTS_LABELS: 1 << 19,
  /**
   * Combination of all states.
   */
  ANY: 0xFFFFFFFF
};


/**
 * Series type config.
 * @typedef {{
 *   drawerType: anychart.enums.SeriesDrawerTypes,
 *   shapeManagerType: anychart.enums.ShapeManagerTypes,
 *   shapesConfig: !Array.<anychart.core.shapeManagers.ShapeConfig>,
 *   secondaryShapesConfig: (undefined|Array.<anychart.core.shapeManagers.ShapeConfig>),
 *   postProcessor: (undefined|function(anychart.core.series.Base, Object.<string, acgraph.vector.Shape>)),
 *   capabilities: (anychart.core.series.Capabilities|number),
 *   anchoredPositionTop: string,
 *   anchoredPositionBottom: string
 * }}
 */
anychart.core.series.TypeConfig;


/**
 * Series property descriptor.
 * @typedef {{
 *    handler: number,
 *    propName: string,
 *    normalizer: Function,
 *    capabilityCheck: (anychart.core.series.Capabilities|number),
 *    consistency: (anychart.ConsistencyState|number),
 *    signal: number
 * }}
 */
anychart.core.series.PropertyDescriptor;

