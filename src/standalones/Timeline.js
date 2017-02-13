goog.provide('anychart.standalones.ProjectTimeline');
goog.provide('anychart.standalones.ResourceTimeline');
goog.require('anychart.core.ui.Timeline');



/**
 * @constructor
 * @extends {anychart.core.ui.Timeline}
 */
anychart.standalones.ProjectTimeline = function() {
  anychart.standalones.ProjectTimeline.base(this, 'constructor');
};
goog.inherits(anychart.standalones.ProjectTimeline, anychart.core.ui.Timeline);
anychart.core.makeStandalone(anychart.standalones.ProjectTimeline, anychart.core.ui.Timeline);



/**
 * @constructor
 * @extends {anychart.core.ui.Timeline}
 */
anychart.standalones.ResourceTimeline = function() {
  anychart.standalones.ResourceTimeline.base(this, 'constructor', void 0, true);
};
goog.inherits(anychart.standalones.ResourceTimeline, anychart.core.ui.Timeline);
anychart.core.makeStandalone(anychart.standalones.ResourceTimeline, anychart.core.ui.Timeline);


/**
 * Constructor function.
 * @return {!anychart.standalones.ProjectTimeline}
 */
anychart.standalones.projectTimeline = function() {
  var timeline = new anychart.standalones.ProjectTimeline();
  timeline.setup(anychart.getFullTheme('standalones.projectTimeline'));
  return timeline;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ResourceTimeline}
 */
anychart.standalones.resourceTimeline = function() {
  var timeline = new anychart.standalones.ResourceTimeline();
  timeline.setup(anychart.getFullTheme('standalones.resourceTimeline'));
  return timeline;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ProjectTimeline}
 * @deprecated Since 7.12.0. Use anychart.standalones.projectTimeline instead.
 */
anychart.ui.projectTimeline = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.projectTimeline()', 'anychart.standalones.projectTimeline()', null, 'Constructor'], true);
  return anychart.standalones.projectTimeline();
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ResourceTimeline}
 * @deprecated Since 7.12.0. Use anychart.standalones.resourceTimeline instead.
 */
anychart.ui.resourceTimeline = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.resourceTimeline()', 'anychart.standalones.resourceTimeline()', null, 'Constructor'], true);
  return anychart.standalones.resourceTimeline();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.standalones.ProjectTimeline.prototype;
  goog.exportSymbol('anychart.ui.projectTimeline', anychart.ui.projectTimeline);
  goog.exportSymbol('anychart.ui.resourceTimeline', anychart.ui.resourceTimeline);
  goog.exportSymbol('anychart.standalones.projectTimeline', anychart.standalones.projectTimeline);
  goog.exportSymbol('anychart.standalones.resourceTimeline', anychart.standalones.resourceTimeline);
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['rowStroke'] = proto.rowStroke;
  proto['backgroundFill'] = proto.backgroundFill;
  proto['headerHeight'] = proto.headerHeight;
  proto['defaultRowHeight'] = proto.defaultRowHeight;

  proto = anychart.standalones.ResourceTimeline.prototype;
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['rowStroke'] = proto.rowStroke;
  proto['backgroundFill'] = proto.backgroundFill;
  proto['headerHeight'] = proto.headerHeight;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
})();
