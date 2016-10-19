goog.provide('anychart.standalones.ResourceList');
goog.require('anychart.core.ui.ResourceList');
goog.require('anychart.opt');



/**
 * @constructor
 * @extends {anychart.core.ui.ResourceList}
 */
anychart.standalones.ResourceList = function() {
  anychart.standalones.ResourceList.base(this, 'constructor');
};
goog.inherits(anychart.standalones.ResourceList, anychart.core.ui.ResourceList);
anychart.core.makeStandalone(anychart.standalones.ResourceList, anychart.core.ui.ResourceList);


//region --- STANDALONE ---
/**
 * Whether resource list depends on container size.
 * @return {boolean} Depends or not.
 */
anychart.standalones.ResourceList.prototype.dependsOnContainerSize = function() {
  var width = this.getOption(anychart.opt.WIDTH);
  var height = this.getOption(anychart.opt.HEIGHT);
  return anychart.utils.isPercent(width) || anychart.utils.isPercent(height);
};
//endregion


/**
 * Constructor function.
 * @param {Array.<Object>=} opt_data Data items.
 * @return {!anychart.standalones.ResourceList}
 */
anychart.standalones.resourceList = function(opt_data) {
  var list = new anychart.standalones.ResourceList();
  list.setupByJSON(anychart.getFullTheme()['standalones']['resourceList'], true);
  list['data'](opt_data);
  return list;
};


//exports
goog.exportSymbol('anychart.standalones.resourceList', anychart.standalones.resourceList);
anychart.standalones.ResourceList.prototype['draw'] = anychart.standalones.ResourceList.prototype.draw;
anychart.standalones.ResourceList.prototype['parentBounds'] = anychart.standalones.ResourceList.prototype.parentBounds;
anychart.standalones.ResourceList.prototype['container'] = anychart.standalones.ResourceList.prototype.container;
