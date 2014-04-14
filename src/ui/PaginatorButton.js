goog.provide('anychart.ui.PaginatorButton');
goog.require('anychart.ui.Button');



/**
 * Paginator button class.
 * @constructor
 * @extends {anychart.ui.Button}
 */
anychart.ui.PaginatorButton = function() {
  goog.base(this);

  /**
   * Drawer for te button background.
   * @type {function(acgraph.vector.Path, anychart.math.Rect)}
   * @private
   */
  this.buttonDrawer_ = goog.nullFunction;
};
goog.inherits(anychart.ui.PaginatorButton, anychart.ui.Button);


/**
 * Getter/Setter for button drawer.
 * @param {function(acgraph.vector.Path, anychart.math.Rect)=} opt_value Drawer function.
 * @return {(anychart.ui.PaginatorButton|function(acgraph.vector.Path, anychart.math.Rect))} Current drawer unction or elf for chaining.
 */
anychart.ui.PaginatorButton.prototype.buttonDrawer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.buttonDrawer_ != opt_value) {
      this.buttonDrawer_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BACKGROUND, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.buttonDrawer_;
};


/**
 * Перегружена, чтобы не рисовать текст.
 * @inheritDoc
 */
anychart.ui.PaginatorButton.prototype.drawText = goog.nullFunction;


/**
 * Перегружена, чтобы была возможность подменить стандартную рисовку кнопки.
 * @inheritDoc
 */
anychart.ui.PaginatorButton.prototype.drawBackground = function(fill, stroke) {
  if (!this.backgroundPath) {
    this.backgroundPath = acgraph.path();
    this.registerDisposable(this.backgroundPath);
  }

  this.backgroundPath.clear();
  this.buttonDrawer_(this.backgroundPath, this.buttonBounds);

  this.backgroundPath.fill(fill);
  this.backgroundPath.stroke(stroke);
};
