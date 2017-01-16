goog.provide('anychart.core.ui.Label');
goog.require('anychart.core.ui.LabelBase');



/**
 * Label element class.<br/>
 * Label can be a part of another element (such as chart, legend, axis, etc) or it can
 * be used independently.<br/>
 * Label has a background and a large number of positioning options:
 * <ul>
 *   <li>{@link anychart.core.ui.Label#anchor}</li>
 *   <li>{@link anychart.core.ui.Label#position}</li>
 *   <li>{@link anychart.core.ui.Label#offsetX} and {@link anychart.core.ui.Label#offsetY}</li>
 *   <li>{@link anychart.core.ui.Label#parentBounds}</li>
 * </ul>
 * @example <c>Creating an autonomous label.</c><t>simple-h100</t>
 * anychart.ui.label()
 *     .text('My custom Label')
 *     .fontSize(27)
 *     .background(null)
 *     .container(stage)
 *     .draw();
 * @constructor
 * @extends {anychart.core.ui.LabelBase}
 */
anychart.core.ui.Label = function() {
  anychart.core.ui.Label.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.Label, anychart.core.ui.LabelBase);


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.Label.prototype.serialize = function() {
  var json = anychart.core.ui.Label.base(this, 'serialize');
  if (goog.isDef(this.position()))
    json['position'] = this.position();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Label.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Label.base(this, 'setupByJSON', config, opt_default);
  this.position(config['position']);
};


/** @inheritDoc */
anychart.core.ui.Label.prototype.disposeInternal = function() {
  anychart.core.ui.Label.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = anychart.core.ui.Label.prototype;
  proto['position'] = proto.position;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['width'] = proto.width;
  proto['height'] = proto.height;
  proto['anchor'] = proto.anchor;
  proto['offsetX'] = proto.offsetX;
  proto['offsetY'] = proto.offsetY;
  proto['text'] = proto.text;
  proto['minFontSize'] = proto.minFontSize;
  proto['maxFontSize'] = proto.maxFontSize;
  proto['adjustFontSize'] = proto.adjustFontSize;
  proto['rotation'] = proto.rotation;
})();
