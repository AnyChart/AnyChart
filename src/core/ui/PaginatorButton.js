goog.provide('anychart.core.ui.PaginatorButton');
goog.require('acgraph');
goog.require('anychart.core.ui.Button');



/**
 * Paginator button class.
 * @constructor
 * @extends {anychart.core.ui.Button}
 */
anychart.core.ui.PaginatorButton = function() {
  anychart.core.ui.PaginatorButton.base(this, 'constructor');

  this.addThemes('defaultLegend.paginator.buttonsSettings');

  /**
   * Drawer for the button background.
   * @type {function(acgraph.vector.Path, anychart.math.Rect)}
   * @private
   */
  this.buttonDrawer_ = goog.nullFunction;

  this.supportedStates(anychart.core.ui.Button.State.CHECKED, false);

  this.initStateSettings();
};
goog.inherits(anychart.core.ui.PaginatorButton, anychart.core.ui.Button);


/**
 * Getter/setter for buttonDrawer.
 * @param {function(acgraph.vector.Path, anychart.math.Rect)=} opt_value Drawer function.
 * @return {(anychart.core.ui.PaginatorButton|function(acgraph.vector.Path, anychart.math.Rect))} Current drawer function or self for chaining.
 */
anychart.core.ui.PaginatorButton.prototype.buttonDrawer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.buttonDrawer_ != opt_value) {
      this.buttonDrawer_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BUTTON_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.buttonDrawer_;
};


/**
 * Overloaded to avoid drawing text.
 * @inheritDoc
 */
anychart.core.ui.PaginatorButton.prototype.drawText = goog.nullFunction;


/**
 * Overloaded to have an option of button display customization.
 * @inheritDoc
 */
anychart.core.ui.PaginatorButton.prototype.drawBackground = function(fill, stroke) {
  if (!this.backgroundPath) {
    this.backgroundPath = acgraph.path();
    this.backgroundPath.cursor(acgraph.vector.Cursor.POINTER); // DVF-4319
    this.bindHandlersToGraphics(this.backgroundPath, this.handleMouseOver, this.handleMouseOut, null, null,
        this.handleMouseDown, this.handleMouseUp);
  }

  this.backgroundPath.clear();
  this.buttonDrawer_(this.backgroundPath, this.buttonBounds);

  this.backgroundPath.fill(fill);
  this.backgroundPath.stroke(stroke);
};


/** @inheritDoc */
anychart.core.ui.PaginatorButton.prototype.initStateSettings = function() {
  this.stateSettings_ = this.themeSettings;
};


/** @inheritDoc */
anychart.core.ui.PaginatorButton.prototype.disposeInternal = function() {
  goog.dispose(this.backgroundPath);
  this.backgroundPath = null;
  anychart.core.ui.PaginatorButton.base(this, 'disposeInternal');
};
