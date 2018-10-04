goog.provide('anychart.pertModule.Tasks');

goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.pertModule.VisualElements');



/**
 * Pert milestones settings collector.
 * @constructor
 * @extends {anychart.pertModule.VisualElements}
 */
anychart.pertModule.Tasks = function() {
  anychart.pertModule.Tasks.base(this, 'constructor');

  this.addThemes('tasks');

  this.normal_.addMeta([
    ['dummyFill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['dummyStroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['lowerLabels', 0, 0],
    ['upperLabels', 0, 0]
  ]);

  this.normal_.setOption(anychart.core.StateSettings.LOWER_LABELS_AFTER_INIT_CALLBACK, this.labelsAfterInitCallback);
  this.hovered_.setOption(anychart.core.StateSettings.LOWER_LABELS_AFTER_INIT_CALLBACK, this.labelsAfterInitCallback);
  this.selected_.setOption(anychart.core.StateSettings.LOWER_LABELS_AFTER_INIT_CALLBACK, this.labelsAfterInitCallback);
};
goog.inherits(anychart.pertModule.Tasks, anychart.pertModule.VisualElements);
anychart.core.settings.populateAliases(anychart.pertModule.Tasks, ['dummyFill', 'dummyStroke', 'lowerLabels', 'upperLabels'], 'normal');


/**
 * Supported signals mask.
 * @type {number}
 */
anychart.pertModule.Tasks.prototype.SUPPORTED_SIGNALS =
    anychart.pertModule.VisualElements.prototype.SUPPORTED_SIGNALS;


/**
 * Gets final dummy fill.
 * @param {anychart.format.Context} provider - Context provider.
 * @return {!acgraph.vector.Fill} - Final ummy fill.
 */
anychart.pertModule.Tasks.prototype.getFinalDummyFill = function(provider) {
  return /** @type {!acgraph.vector.Fill} */ (this.resolveColor('dummyFill', 0, provider));
};


/**
 * Gets final dummy stroke.
 * @param {anychart.format.Context} provider - Context provider.
 * @return {!acgraph.vector.Stroke} - Final dummy stroke.
 */
anychart.pertModule.Tasks.prototype.getFinalDummyStroke = function(provider) {
  return /** @type {!acgraph.vector.Stroke} */ (this.resolveColor('dummyStroke', 0, provider));
};


/**
 * @inheritDoc
 */
anychart.pertModule.Tasks.prototype.labelsContainer = function(opt_value) {
  //this sets container for upper labels.
  anychart.pertModule.Tasks.base(this, 'labelsContainer', opt_value);
  var container = anychart.pertModule.Tasks.base(this, 'labelsContainer');
  if (container) this.normal_.lowerLabels().container(/** @type {acgraph.vector.ILayer} */ (container));
  return container;
};


/** @inheritDoc */
anychart.pertModule.Tasks.prototype.drawLabels = function() {
  this.normal_.lowerLabels().draw();

  //This will draw upper labels.
  return anychart.pertModule.Tasks.base(this, 'drawLabels');
};


/** @inheritDoc */
anychart.pertModule.Tasks.prototype.setLabelsParentEventTarget = function(parentEventTarget) {
  this.normal_.lowerLabels().setParentEventTarget(parentEventTarget);

  //This will draw upper labels.
  return anychart.pertModule.Tasks.base(this, 'setLabelsParentEventTarget', parentEventTarget);
};


/**
 * @inheritDoc
 */
anychart.pertModule.Tasks.prototype.clearLabels = function() {
  this.normal_.lowerLabels().clear();
  return anychart.pertModule.Tasks.base(this, 'clearLabels');
};


//exports
//(function() {
//  var proto = anychart.pertModule.Tasks.prototype;
//  proto['dummyFill'] = proto.dummyFill;
//  proto['dummyStroke'] = proto.dummyStroke;
//})();
