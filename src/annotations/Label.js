// goog.provide('anychart.annotationsModule.Label');
// goog.require('anychart.annotationsModule');
// goog.require('anychart.annotationsModule.Base');
// goog.require('anychart.core.settings');
// goog.require('anychart.enums');
//
//
//
// /**
//  * Label annotation.
//  * @param {!anychart.annotationsModule.ChartController} chartController
//  * @constructor
//  * @extends {anychart.annotationsModule.Base}
//  */
// anychart.annotationsModule.Label = function(chartController) {
//   anychart.annotationsModule.Label.base(this, 'constructor', chartController);
//
//   /**
//    * Paths array.
//    * @type {Array.<acgraph.vector.Path>}
//    * @private
//    */
//   this.paths_ = null;
//
//   /**
//    * Stroke resolver.
//    * @param {anychart.annotationsModule.Base} annotation
//    * @param {number} state
//    * @return {acgraph.vector.Stroke}
//    * @private
//    */
//   this.strokeResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Stroke} */(
//       anychart.annotationsModule.Base.getColorResolver('stroke', anychart.enums.ColorType.STROKE, true));
//
//   /**
//    * Fill resolver.
//    * @param {anychart.annotationsModule.Base} annotation
//    * @param {number} state
//    * @return {acgraph.vector.Fill}
//    * @private
//    */
//   this.fillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.Fill} */(
//       anychart.annotationsModule.Base.getColorResolver('fill', anychart.enums.ColorType.FILL, true));
//
//   /**
//    * Hatch fill resolver.
//    * @param {anychart.annotationsModule.Base} annotation
//    * @param {number} state
//    * @return {acgraph.vector.PatternFill}
//    * @private
//    */
//   this.hatchFillResolver_ = /** @type {function(anychart.annotationsModule.Base,number):acgraph.vector.PatternFill} */(
//       anychart.annotationsModule.Base.getColorResolver('hatchFill', anychart.enums.ColorType.HATCH_FILL, true));
// };
// goog.inherits(anychart.annotationsModule.Label, anychart.annotationsModule.Base);
// anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS);
// anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS);
// anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS);
// anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS);
// anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.STROKE_DESCRIPTORS);
// anychart.core.settings.populate(anychart.annotationsModule.Label, anychart.annotationsModule.FILL_DESCRIPTORS);
// anychart.annotationsModule.AnnotationTypes[anychart.enums.AnnotationTypes.LABEL] = anychart.annotationsModule.Label;
//
//
// //region Properties
// //----------------------------------------------------------------------------------------------------------------------
// //
// //  Properties
// //
// //----------------------------------------------------------------------------------------------------------------------
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.type = anychart.enums.AnnotationTypes.LABEL;
//
//
// /**
//  * Supported anchors.
//  * @type {anychart.annotationsModule.AnchorSupport}
//  */
// anychart.annotationsModule.Label.prototype.SUPPORTED_ANCHORS = anychart.annotationsModule.AnchorSupport.THREE_POINTS;
// //endregion
//
//
// //region Drawing
// //----------------------------------------------------------------------------------------------------------------------
// //
// //  Drawing
// //
// //----------------------------------------------------------------------------------------------------------------------
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.ensureCreated = function() {
//   anychart.annotationsModule.Label.base(this, 'ensureCreated');
//
//   if (!this.paths_) {
//     // main, hatch, hover
//     this.paths_ = [this.rootLayer.path(), this.rootLayer.path(), this.rootLayer.path()];
//     this.paths_[0].zIndex(anychart.annotationsModule.Base.SHAPES_ZINDEX);
//     this.paths_[1].zIndex(anychart.annotationsModule.Base.HATCH_ZINDEX);
//     this.paths_[2].zIndex(anychart.annotationsModule.Base.HOVER_SHAPE_ZINDEX);
//   }
// };
//
//
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.drawOnePointShape = function(x, y) {
//   for (var i = 0; i < this.paths_.length; i++) {
//     var path = this.paths_[i];
//     path.clear();
//     path.moveTo(x, y).lineTo(x, y);
//   }
// };
//
//
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.drawTwoPointsShape = function(firstX, firstY, secondX, secondY) {
//   for (var i = 0; i < this.paths_.length; i++) {
//     var path = this.paths_[i];
//     path.clear();
//     path.moveTo(firstX, firstY).lineTo(secondX, secondY);
//   }
// };
//
//
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.drawThreePointsShape = function(firstX, firstY, secondX, secondY, thirdX, thirdY) {
//   for (var i = 0; i < this.paths_.length; i++) {
//     var path = this.paths_[i];
//     path.clear();
//     path.moveTo(firstX, firstY).lineTo(secondX, secondY).lineTo(thirdX, thirdY).close();
//   }
// };
//
//
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.colorize = function(state) {
//   anychart.annotationsModule.Label.base(this, 'colorize', state);
//   this.paths_[0].stroke(this.strokeResolver_(this, state));
//   this.paths_[0].fill(this.fillResolver_(this, state));
//   this.paths_[1]
//       .stroke(null)
//       .fill(this.hatchFillResolver_(this, state));
//   this.paths_[2]
//       .fill(anychart.color.TRANSPARENT_HANDLER)
//       .stroke(/** @type {acgraph.vector.SolidFill} */(anychart.color.TRANSPARENT_HANDLER), this['hoverGap']() * 2);
// };
// //endregion
//
//
// //region Serialization / Deserialization / Disposing
// //----------------------------------------------------------------------------------------------------------------------
// //
// //  Serialization / Deserialization / Disposing
// //
// //----------------------------------------------------------------------------------------------------------------------
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.serialize = function() {
//   var json = anychart.annotationsModule.Label.base(this, 'serialize');
//
//   anychart.core.settings.serialize(this, anychart.annotationsModule.FILL_DESCRIPTORS, json, 'Annotation');
//   anychart.core.settings.serialize(this, anychart.annotationsModule.STROKE_DESCRIPTORS, json, 'Annotation');
//   anychart.core.settings.serialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, json, 'Annotation');
//   anychart.core.settings.serialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, json, 'Annotation');
//   anychart.core.settings.serialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
//   anychart.core.settings.serialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, json, 'Annotation');
//
//   return json;
// };
//
//
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.setupByJSON = function(config) {
//
//   anychart.core.settings.deserialize(this, anychart.annotationsModule.FILL_DESCRIPTORS, config);
//   anychart.core.settings.deserialize(this, anychart.annotationsModule.STROKE_DESCRIPTORS, config);
//   anychart.core.settings.deserialize(this, anychart.annotationsModule.X_ANCHOR_DESCRIPTORS, config);
//   anychart.core.settings.deserialize(this, anychart.annotationsModule.VALUE_ANCHOR_DESCRIPTORS, config);
//   anychart.core.settings.deserialize(this, anychart.annotationsModule.SECOND_ANCHOR_POINT_DESCRIPTORS, config);
//   anychart.core.settings.deserialize(this, anychart.annotationsModule.THIRD_ANCHOR_POINT_DESCRIPTORS, config);
//
//   anychart.annotationsModule.Label.base(this, 'setupByJSON', config);
// };
//
//
// /** @inheritDoc */
// anychart.annotationsModule.Label.prototype.disposeInternal = function() {
//   anychart.annotationsModule.Label.base(this, 'disposeInternal');
//
//   goog.disposeAll(this.paths_);
//   delete this.strokeResolver_;
//   delete this.fillResolver_;
//   delete this.hatchFillResolver_;
// };
// //endregion
