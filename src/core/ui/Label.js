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
  goog.base(this);
};
goog.inherits(anychart.core.ui.Label, anychart.core.ui.LabelBase);


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.Label.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (goog.isDef(this.position()))
    json['position'] = this.position();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Label.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.position(config['position']);
};


/** @inheritDoc */
anychart.core.ui.Label.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.ui.Label.prototype['position'] = anychart.core.ui.Label.prototype.position;
anychart.core.ui.Label.prototype['background'] = anychart.core.ui.Label.prototype.background;
anychart.core.ui.Label.prototype['padding'] = anychart.core.ui.Label.prototype.padding;
anychart.core.ui.Label.prototype['width'] = anychart.core.ui.Label.prototype.width;
anychart.core.ui.Label.prototype['height'] = anychart.core.ui.Label.prototype.height;
anychart.core.ui.Label.prototype['anchor'] = anychart.core.ui.Label.prototype.anchor;
anychart.core.ui.Label.prototype['offsetX'] = anychart.core.ui.Label.prototype.offsetX;
anychart.core.ui.Label.prototype['offsetY'] = anychart.core.ui.Label.prototype.offsetY;
anychart.core.ui.Label.prototype['text'] = anychart.core.ui.Label.prototype.text;
anychart.core.ui.Label.prototype['minFontSize'] = anychart.core.ui.Label.prototype.minFontSize;
anychart.core.ui.Label.prototype['maxFontSize'] = anychart.core.ui.Label.prototype.maxFontSize;
anychart.core.ui.Label.prototype['adjustFontSize'] = anychart.core.ui.Label.prototype.adjustFontSize;
anychart.core.ui.Label.prototype['rotation'] = anychart.core.ui.Label.prototype.rotation;
