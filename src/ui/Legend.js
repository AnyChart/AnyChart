goog.provide('anychart.ui.Legend');
goog.provide('anychart.ui.LegendItem');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.ui.LegendItem');



/**
 * @constructor
 * @extends {anychart.core.ui.Legend}
 */
anychart.ui.Legend = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.Legend, anychart.core.ui.Legend);


/** @inheritDoc */
anychart.ui.Legend.prototype.createItem = function() {
  return new anychart.ui.LegendItem();
};



/**
 * @constructor
 * @extends {anychart.core.ui.LegendItem}
 */
anychart.ui.LegendItem = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.LegendItem, anychart.core.ui.LegendItem);


/**
 * Constructor function.
 * @return {!anychart.ui.Legend}
 */
anychart.ui.legend = function() {
  var res = new anychart.ui.Legend();
  res.setup(anychart.getFullTheme()['standalones']['legend']);
  return res;
};


//exports
goog.exportSymbol('anychart.ui.legend', anychart.ui.legend);
anychart.ui.Legend.prototype['draw'] = anychart.ui.Legend.prototype.draw;
anychart.ui.Legend.prototype['parentBounds'] = anychart.ui.Legend.prototype.parentBounds;
anychart.ui.Legend.prototype['container'] = anychart.ui.Legend.prototype.container;
anychart.ui.Legend.prototype['itemsSource'] = anychart.ui.Legend.prototype.itemsSource;
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
