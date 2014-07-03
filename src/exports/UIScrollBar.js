goog.provide('anychart.exports.UIScrollBar');
goog.require('anychart.ui.ScrollBar');

goog.exportSymbol('anychart.ui.ScrollBar', anychart.ui.ScrollBar);
goog.exportSymbol('anychart.ui.ScrollBar.SCROLL_PIXEL_STEP', anychart.ui.ScrollBar.SCROLL_PIXEL_STEP);
goog.exportSymbol('anychart.ui.ScrollBar.SCROLL_RATIO_STEP', anychart.ui.ScrollBar.SCROLL_RATIO_STEP);
anychart.ui.ScrollBar.prototype['layout'] = anychart.ui.ScrollBar.prototype.layout;
anychart.ui.ScrollBar.prototype['backgroundStroke'] = anychart.ui.ScrollBar.prototype.backgroundStroke;
anychart.ui.ScrollBar.prototype['backgroundFill'] = anychart.ui.ScrollBar.prototype.backgroundFill;
anychart.ui.ScrollBar.prototype['sliderStroke'] = anychart.ui.ScrollBar.prototype.sliderStroke;
anychart.ui.ScrollBar.prototype['sliderFill'] = anychart.ui.ScrollBar.prototype.sliderFill;
anychart.ui.ScrollBar.prototype['contentBounds'] = anychart.ui.ScrollBar.prototype.contentBounds;
anychart.ui.ScrollBar.prototype['visibleBounds'] = anychart.ui.ScrollBar.prototype.visibleBounds;
anychart.ui.ScrollBar.prototype['startRatio'] = anychart.ui.ScrollBar.prototype.startRatio;
anychart.ui.ScrollBar.prototype['endRatio'] = anychart.ui.ScrollBar.prototype.endRatio;
anychart.ui.ScrollBar.prototype['setRatio'] = anychart.ui.ScrollBar.prototype.setRatio;

anychart.ui.ScrollBar.prototype['scrollPixelStartTo'] = anychart.ui.ScrollBar.prototype.scrollPixelStartTo;
anychart.ui.ScrollBar.prototype['scrollStartTo'] = anychart.ui.ScrollBar.prototype.scrollStartTo;

anychart.ui.ScrollBar.prototype['scrollPixelEndTo'] = anychart.ui.ScrollBar.prototype.scrollPixelEndTo;
anychart.ui.ScrollBar.prototype['scrollEndTo'] = anychart.ui.ScrollBar.prototype.scrollEndTo;

anychart.ui.ScrollBar.prototype['scrollPixel'] = anychart.ui.ScrollBar.prototype.scrollPixel;
anychart.ui.ScrollBar.prototype['scroll'] = anychart.ui.ScrollBar.prototype.scroll;

anychart.ui.ScrollBar.prototype['buttonsVisible'] = anychart.ui.ScrollBar.prototype.buttonsVisible;
anychart.ui.ScrollBar.prototype['draw'] = anychart.ui.ScrollBar.prototype.draw;
