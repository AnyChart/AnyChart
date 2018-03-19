goog.provide('anychart.ganttModule.rendering.shapes');


//region -- Type definitions.
/**
 * Shape config.
 * @typedef {{
 *   name: string,
 *   shapeType: anychart.enums.ShapeType,
 *   fillName: ?string,
 *   strokeName: ?string,
 *   zIndex: number,
 *   disablePointerEvents: boolean
 * }}
 */
anychart.ganttModule.rendering.shapes.ShapeConfig;


//endregion
/**
 * Template shape config for easy reusage.
 * @const {anychart.ganttModule.rendering.shapes.ShapeConfig}
 */
anychart.ganttModule.rendering.shapes.barConfig = {
  name: 'bar',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'fill',
  strokeName: 'stroke',
  zIndex: 0,
  disablePointerEvents: false
};


/**
 * Template shape config for easy reusage.
 * @const {anychart.ganttModule.rendering.shapes.ShapeConfig}
 */
anychart.ganttModule.rendering.shapes.progressConfig = {
  name: 'bar',
  shapeType: anychart.enums.ShapeType.PATH,
  fillName: 'fill',
  strokeName: 'stroke',
  zIndex: 1,
  disablePointerEvents: true
};
