goog.provide('anychart.standalones.Legend');
goog.provide('anychart.standalones.LegendItem');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.ui.LegendItem');



/**
 * @constructor
 * @extends {anychart.core.ui.Legend}
 */
anychart.standalones.Legend = function() {
  anychart.standalones.Legend.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Legend, anychart.core.ui.Legend);
anychart.core.makeStandalone(anychart.standalones.Legend, anychart.core.ui.Legend);


//region --- STANDALONE ---
/**
 * Define, is one of the bounds settings set in percent.
 * @return {boolean} Is one of the bounds settings set in percent.
 */
anychart.standalones.Legend.prototype.dependsOnContainerSize = function() {
  //TODO(AntonKagakin): should be reworked to getOption
  var width = this.width();
  var height = this.height();
  return anychart.utils.isPercent(width) || anychart.utils.isPercent(height) || goog.isNull(width) || goog.isNull(height);
};
//endregion


/** @inheritDoc */
anychart.standalones.Legend.prototype.createItem = function() {
  return new anychart.standalones.LegendItem();
};



/**
 * @constructor
 * @extends {anychart.core.ui.LegendItem}
 */
anychart.standalones.LegendItem = function() {
  anychart.standalones.LegendItem.base(this, 'constructor');
};
goog.inherits(anychart.standalones.LegendItem, anychart.core.ui.LegendItem);


/**
 * Constructor function.
 * @return {!anychart.standalones.Legend}
 */
anychart.standalones.legend = function() {
  var legend = new anychart.standalones.Legend();
  legend.setup(anychart.getFullTheme()['standalones']['legend']);
  return legend;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.Legend}
 * @deprecated Since 7.12.0. Use anychart.standalones.legend instead.
 */
anychart.ui.legend = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ui.legend', 'anychart.standalones.legend'], true);
  return anychart.standalones.legend();
};


//exports
goog.exportSymbol('anychart.ui.legend', anychart.ui.legend);
goog.exportSymbol('anychart.standalones.legend', anychart.standalones.legend);
anychart.standalones.Legend.prototype['draw'] = anychart.standalones.Legend.prototype.draw;
anychart.standalones.Legend.prototype['parentBounds'] = anychart.standalones.Legend.prototype.parentBounds;
anychart.standalones.Legend.prototype['container'] = anychart.standalones.Legend.prototype.container;
anychart.standalones.Legend.prototype['itemsSource'] = anychart.standalones.Legend.prototype.itemsSource;
anychart.core.ui.LegendItem.prototype['x'] = anychart.core.ui.LegendItem.prototype.x;
anychart.core.ui.LegendItem.prototype['y'] = anychart.core.ui.LegendItem.prototype.y;
anychart.core.ui.LegendItem.prototype['iconType'] = anychart.core.ui.LegendItem.prototype.iconType;
anychart.core.ui.LegendItem.prototype['iconFill'] = anychart.core.ui.LegendItem.prototype.iconFill;
anychart.core.ui.LegendItem.prototype['iconStroke'] = anychart.core.ui.LegendItem.prototype.iconStroke;
anychart.core.ui.LegendItem.prototype['iconHatchFill'] = anychart.core.ui.LegendItem.prototype.iconHatchFill;
anychart.core.ui.LegendItem.prototype['iconTextSpacing'] = anychart.core.ui.LegendItem.prototype.iconTextSpacing;
anychart.core.ui.LegendItem.prototype['maxWidth'] = anychart.core.ui.LegendItem.prototype.maxWidth;
anychart.core.ui.LegendItem.prototype['maxHeight'] = anychart.core.ui.LegendItem.prototype.maxHeight;
anychart.core.ui.LegendItem.prototype['text'] = anychart.core.ui.LegendItem.prototype.text;
anychart.core.ui.LegendItem.prototype['getTextElement'] = anychart.core.ui.LegendItem.prototype.getTextElement;
anychart.core.ui.LegendItem.prototype['getContentBounds'] = anychart.core.ui.LegendItem.prototype.getContentBounds;
anychart.core.ui.LegendItem.prototype['getWidth'] = anychart.core.ui.LegendItem.prototype.getWidth;
anychart.core.ui.LegendItem.prototype['getHeight'] = anychart.core.ui.LegendItem.prototype.getHeight;
anychart.core.ui.LegendItem.prototype['draw'] = anychart.core.ui.LegendItem.prototype.draw;
