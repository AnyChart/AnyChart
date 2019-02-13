goog.provide('anychart.core.utils.GlobalTooltipContainer');

goog.require('anychart.core.utils.LocalTooltipContainer');
goog.require('goog.dom.BufferedViewportSizeMonitor');
goog.require('goog.dom.ViewportSizeMonitor');



/**
 * Global tooltip container.
 * NOTE: Is a singleton!
 * @constructor
 * @extends {anychart.core.utils.LocalTooltipContainer}
 */
anychart.core.utils.GlobalTooltipContainer = function() {
  anychart.core.utils.GlobalTooltipContainer.base(this, 'constructor');

  this.vsm_ = new goog.dom.ViewportSizeMonitor();

  this.bufferedVsm_ = new goog.dom.BufferedViewportSizeMonitor(this.vsm_);

  goog.events.listen(this.bufferedVsm_, goog.events.EventType.RESIZE, this.updateStageSize, false, this);
};
goog.inherits(anychart.core.utils.GlobalTooltipContainer, anychart.core.utils.LocalTooltipContainer);
goog.addSingletonGetter(anychart.core.utils.GlobalTooltipContainer);


/**
 * Global container style.
 * @type {Object}
 * @const
 */
anychart.core.utils.GlobalTooltipContainer.GLOBAL_CONTAINER_STYLE = {
  'position': 'absolute',
  'z-index': 9999,
  'left': '-10000px',
  'top': '-10000px'
};


/**
 * Global container style for IE6.
 * @type {Object}
 * @const
 */
anychart.core.utils.GlobalTooltipContainer.GLOBAL_CONTAINER_STYLE_IE6 = {
  'position': 'absolute',
  'z-index': 9999,
  'left': 0,
  'top': 0
};


/**
 * Global stage.domElement() style.
 * @type {Object}
 * @const
 */
anychart.core.utils.GlobalTooltipContainer.GLOBAL_STAGE_DOM_ELEMENT_STYLE = {
  'position': 'fixed',
  'left': 0,
  'top': 0,
  'opacity': 1,
  'pointer-events': 'none'
};


/**
 * Global stage.getDomWrapper() style.
 * @type {Object}
 * @const
 */
anychart.core.utils.GlobalTooltipContainer.LOCAL_STAGE_WRAPPER_STYLE_VML = {
  'position': 'fixed',
  'left': 0,
  'top': 0,
  'opacity': 1,
  'width': '1px',
  'height': '1px'
};


/**
 * Global stage.domElement() style.
 * @type {Object}
 * @const
 */
anychart.core.utils.GlobalTooltipContainer.GLOBAL_STAGE_DOM_ELEMENT_STYLE_VML = {
  'position': 'fixed',
  'left': 0,
  'top': 0,
  'opacity': 1,
  'pointer-events': 'none',
  'overflow': '',
  'display': '',
  'width': '',
  'height': ''
};


/**
 * @inheritDoc
 */
anychart.core.utils.GlobalTooltipContainer.prototype.applyStyle = function() {
  var document = goog.dom.getDocument();
  if (goog.userAgent.IE && (!goog.userAgent.isVersionOrHigher('7') || document.documentMode && document.documentMode <= 6)) {
    goog.style.setStyle(this.getRoot(), anychart.core.utils.GlobalTooltipContainer.GLOBAL_CONTAINER_STYLE_IE6);
  } else {
    goog.style.setStyle(this.getRoot(), anychart.core.utils.GlobalTooltipContainer.GLOBAL_CONTAINER_STYLE);
  }
  if (acgraph.type() == acgraph.StageType.SVG) {
    goog.style.setStyle(this.getStage().getDomWrapper(), anychart.core.utils.LocalTooltipContainer.LOCAL_STAGE_WRAPPER_STYLE);
    goog.style.setStyle(this.getStage().domElement(), anychart.core.utils.GlobalTooltipContainer.GLOBAL_STAGE_DOM_ELEMENT_STYLE);
  } else {
    goog.style.setStyle(this.getStage().getDomWrapper(), anychart.core.utils.GlobalTooltipContainer.LOCAL_STAGE_WRAPPER_STYLE_VML);
    goog.style.setStyle(this.getStage().domElement(), anychart.core.utils.GlobalTooltipContainer.GLOBAL_STAGE_DOM_ELEMENT_STYLE_VML);
  }
  this.updateStageSize();
};


/**
 * Updates stage size.
 */
anychart.core.utils.GlobalTooltipContainer.prototype.updateStageSize = function() {
  if (acgraph.type() == acgraph.StageType.SVG) {
    var newSize = this.bufferedVsm_.getSize();
    this.getStage().resize(newSize.width, newSize.height);
  }
};


/**
 * @inheritDoc
 */
anychart.core.utils.GlobalTooltipContainer.prototype.isLocal = function() {
  return false;
};


/** @inheritDoc */
anychart.core.utils.GlobalTooltipContainer.prototype.disposeInternal = function() {
  goog.disposeAll(this.vsm_, this.bufferedVsm_);
  this.vsm_ = null;
  this.bufferedVsm_ = null;
  anychart.core.utils.GlobalTooltipContainer.base(this, 'disposeInternal');
};
