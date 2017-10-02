goog.provide('anychart.chartEditorModule.settings.Axes');

goog.require('anychart.chartEditorModule.settings.Axis');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.chartEditorModule.settings.Axes = function() {
  anychart.chartEditorModule.settings.Axes.base(this, 'constructor');

  this.enabled_ = true;
};
goog.inherits(anychart.chartEditorModule.settings.Axes, goog.ui.Component);


/** @enum {string} */
anychart.chartEditorModule.settings.Axes.CssClass = {};


/**
 * Container for enabled button.
 * @type {Element}
 * @private
 */
anychart.chartEditorModule.settings.Axes.prototype.enabledButtonContainer_ = null;


/**
 * Set container for enabled button.
 * @param {Element} enabledButtonContainer
 */
anychart.chartEditorModule.settings.Axes.prototype.setEnabledButtonContainer = function(enabledButtonContainer) {
  this.enabledButtonContainer_ = enabledButtonContainer;
};


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.Axes.prototype.name_ = 'Axis';


/** @param {string} value */
anychart.chartEditorModule.settings.Axes.prototype.setName = function(value) {
  this.name_ = value;
};


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.settings.Axes.prototype.showName_ = true;


/** @param {boolean} value */
anychart.chartEditorModule.settings.Axes.prototype.showName = function(value) {
  this.showName_ = value;
};


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.Axes.prototype.key_ = 'axis';


/** @param {string} value */
anychart.chartEditorModule.settings.Axes.prototype.setKey = function(value) {
  if (value != this.key_) {
    this.key_ = value;
  }
};


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.Axes.prototype.countKey_ = 'chart.getAxisCount()';


/** @param {string} value */
anychart.chartEditorModule.settings.Axes.prototype.setCountKey = function(value) {
  this.countKey_ = value;
};


/**
 * Enables/Disables the Axes settings.
 * @param {boolean} enabled Whether to enable (true) or disable (false) the
 *     Axes settings.
 */
anychart.chartEditorModule.settings.Axes.prototype.setEnabled = function(enabled) {
  if (enabled) {
    this.enabled_ = enabled;
  }

  this.forEachChild(function(child) {
    child.setEnabled(enabled);
  });

  if (!enabled) {
    this.enabled_ = enabled;
  }
};


/**
 * @return {boolean} Whether the Axes settings is enabled.
 */
anychart.chartEditorModule.settings.Axes.prototype.isEnabled = function() {
  return this.enabled_;
};


/** @override */
anychart.chartEditorModule.settings.Axes.prototype.disposeInternal = function() {
  anychart.chartEditorModule.settings.Axes.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.settings.Axes.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Axes.base(this, 'createDom');
};


/**
 * Update controls.
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 */
anychart.chartEditorModule.settings.Axes.prototype.update = function(model) {
  var axesCount = anychart.chartEditorModule.Controller.getset(model, this.countKey_);
  var count = Math.max(this.getChildCount(), Number(axesCount));

  for (var i = 0; i < count; i++) {
    var child = this.getChildAt(i);
    if (i < axesCount) {
      if (!child) {
        child = new anychart.chartEditorModule.settings.Axis();
        child.setName(this.name_);
        child.showName(this.showName_);
        this.addChildAt(child, i, true);
      }
      child.setKey(this.key_);
      child.setIndex(i);
      child.update(model);
      goog.style.setElementShown(child.getElement(), true);
    } else {
      if (child) goog.style.setElementShown(child.getElement(), false);
    }
  }
};
