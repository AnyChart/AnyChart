goog.provide('anychart.ui.GanttToolbar');

goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.ui.menu.Item');
goog.require('anychart.ui.menu.Menu');
goog.require('anychart.ui.menu.SubMenu');
goog.require('anychart.ui.toolbar.MenuButton');
goog.require('anychart.ui.toolbar.Separator');
goog.require('anychart.ui.toolbar.Toolbar');

goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.ToolbarButton');



/**
 * @constructor
 * @extends {anychart.ui.toolbar.Toolbar}
 */
anychart.ui.GanttToolbar = function() {
  anychart.ui.GanttToolbar.base(this, 'constructor');

  // --------- PRINTING ----------
  /**
   * Supported print paper sizes.
   * @type {Array.<anychart.enums.PaperSize>}
   * @private
   */
  this.printPaperSizes_ = [
    anychart.enums.PaperSize.US_LETTER,
    anychart.enums.PaperSize.A0,
    anychart.enums.PaperSize.A1,
    anychart.enums.PaperSize.A2,
    anychart.enums.PaperSize.A3,
    anychart.enums.PaperSize.A4,
    anychart.enums.PaperSize.A5,
    anychart.enums.PaperSize.A6
  ];

  /**
   * Print menu.
   * @type {anychart.ui.menu.Menu}
   * @private
   */
  this.printMenu_ = new anychart.ui.menu.Menu();

  this.switchPageOrientation_ = new anychart.ui.menu.Item('Switch page orientation');
  this.switchPageOrientation_.setModel({
    func: 'switchPageOrientation',
    isLandscape: true
  });

  this.printMenu_.addChild(this.switchPageOrientation_, true);
  this.printMenu_.addChild(new goog.ui.MenuSeparator(), true);

  this.printButton_ = new anychart.ui.toolbar.MenuButton('Print', this.printMenu_);
  this.printButton_.addClassName(anychart.ui.GanttToolbar.CssClass.PRINT);
  this.addChild(this.printButton_, true);

  // --------- SAVE AS ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  /**
   * Save as menu.
   * @type {anychart.ui.menu.Menu}
   * @private
   */
  this.saveAsMenu_ = new anychart.ui.menu.Menu();

  var saveAsSvg = new anychart.ui.menu.Item('SVG');
  saveAsSvg.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_SVG);
  saveAsSvg.setModel({func: 'saveAsSvg'});
  this.saveAsMenu_.addChild(saveAsSvg, true);

  var saveAsPng = new anychart.ui.menu.Item('PNG');
  saveAsPng.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_PNG);
  saveAsPng.setModel({func: 'saveAsPng'});
  this.saveAsMenu_.addChild(saveAsPng, true);

  var saveAsJpg = new anychart.ui.menu.Item('JPG');
  saveAsJpg.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_JPG);
  saveAsJpg.setModel({func: 'saveAsJpg'});
  this.saveAsMenu_.addChild(saveAsJpg, true);

  var pdfSubMenu = new anychart.ui.menu.SubMenu('PDF');
  pdfSubMenu.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_PDF);
  var saveAsPdf = new anychart.ui.menu.Item('A4');
  saveAsPdf.setModel({func: 'saveAsPdf'});
  saveAsPdf.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_PDF);
  pdfSubMenu.addItem(saveAsPdf);
  this.saveAsMenu_.addChild(pdfSubMenu, true);

  var saveAsButton = new anychart.ui.toolbar.MenuButton('Save As', this.saveAsMenu_);
  saveAsButton.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS);
  this.addChild(saveAsButton, true);

  // --------- ZOOM IN, ZOOM OUT, FIT ALL ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  var zoomInButton = new goog.ui.ToolbarButton('Zoom In');
  zoomInButton.addClassName(anychart.ui.GanttToolbar.CssClass.ZOOM_IN);
  zoomInButton.setModel({func: 'zoomIn'});
  this.addChild(zoomInButton, true);

  var zoomOutButton = new goog.ui.ToolbarButton('Zoom Out');
  zoomOutButton.addClassName(anychart.ui.GanttToolbar.CssClass.ZOOM_OUT);
  zoomOutButton.setModel({func: 'zoomOut'});
  this.addChild(zoomOutButton, true);

  var fitAllButton = new goog.ui.ToolbarButton('Fit All');
  fitAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.FIT_ALL);
  fitAllButton.setModel({func: 'fitAll'});
  this.addChild(fitAllButton, true);

  // --------- EXPAND/COLLAPSE ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  var expandAllButton = new goog.ui.ToolbarButton('Expand All');
  expandAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.EXPAND_ALL);
  expandAllButton.setModel({func: 'expandAll'});
  this.addChild(expandAllButton, true);

  var collapseAllButton = new goog.ui.ToolbarButton('Collapse All');
  collapseAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.COLLAPSE_ALL);
  collapseAllButton.setModel({func: 'collapseAll'});
  this.addChild(collapseAllButton, true);


  this.listen(goog.ui.Component.EventType.ACTION, this.handleAction_);
};
goog.inherits(anychart.ui.GanttToolbar, anychart.ui.toolbar.Toolbar);


/**
 * @enum {string}
 */
anychart.ui.GanttToolbar.CssClass = {
  FIT_ALL: 'anychart-toolbar-fitAll',
  ZOOM_IN: 'anychart-toolbar-zoomIn',
  ZOOM_OUT: 'anychart-toolbar-zoomOut',
  PRINT: 'anychart-toolbar-print',
  SAVE_AS: 'anychart-toolbar-saveAs',
  SAVE_AS_PNG: 'anychart-toolbar-saveAsPng',
  SAVE_AS_PDF: 'anychart-toolbar-saveAsPdf',
  SAVE_AS_JPG: 'anychart-toolbar-saveAsJpg',
  SAVE_AS_SVG: 'anychart-toolbar-saveAsSvg',
  EXPAND_ALL: 'anychart-toolbar-expandAll',
  COLLAPSE_ALL: 'anychart-toolbar-collapseAll'
};


/**
 * Handler for ACTION event on toolbar.
 * @param {goog.events.Event} e
 * @private
 */
anychart.ui.GanttToolbar.prototype.handleAction_ = function(e) {
  var item = e['target'];
  var model = item.getModel();
  var funcName = model.func;

  if (funcName == 'switchPageOrientation') {
    this.printMenu_.forEachChild(function(printItem) {
      var printItemModel = printItem.getModel();
      if (printItemModel && printItemModel.func == 'print') {
        var caption = model.isLandscape ? 'Portrait' : 'Landscape';
        caption += ',';
        caption += printItem.getCaption().split(',')[1];
        printItem.setCaption(caption);
      }
    });

    item.setModel({
      func: 'switchPageOrientation',
      isLandscape: !model.isLandscape
    });

    // To save the menu is opened and first item highlighted.
    this.printButton_.setOpen(true);
    this.printMenu_.highlightFirst();

  } else {
    var args = model.args || [];
    var switchPageOrientationModel = this.switchPageOrientation_.getModel();

    if (funcName == 'print') args.push(switchPageOrientationModel.isLandscape);

    //TODO (A.Kudryavtsev): In current implementation (20 Feb 2015) we can't print A4-A0 formats. That's why we just call print().
    //TODO (A.Kudryavtsev): In current implementation (20 Feb 2015) we can't save A4-A0 formats. That's why we just call saveAs<FORMAT>().

    var chart = this.target();
    if (chart) {
      var fn = chart[funcName];
      if (goog.isFunction(fn)) {
        fn.apply(chart, args);
      } else {
        anychart.core.reporting.warning(anychart.enums.WarningCode.TOOLBAR_METHOD_IS_NOT_DEFINED, null, [funcName]);
      }
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.TOOLBAR_CHART_IS_NOT_SET);
    }
  }
};


/**
 * Sets print paper sizes.
 * NOTE: In current implementation (21 May 2015) sizes must be set before draw() is called.
 * @param {Array.<anychart.enums.PaperSize>=} opt_value - Array of supported print paper sizes.
 * @return {anychart.ui.GanttToolbar|Array.<anychart.enums.PaperSize>} - Current target or itself for method chaining.
 */
anychart.ui.GanttToolbar.prototype.printPaperSizes = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.printPaperSizes_ = opt_value;
    return this;
  }
  return this.printPaperSizes_;
};


/**
 * @inheritDoc
 */
anychart.ui.GanttToolbar.prototype.draw = function() {
  // is rendered
  if (!this.isInDocument()) {
    var sizes = this.printPaperSizes();
    for (var i = 0; i < sizes.length; i++) {
      var size = sizes[i];
      var printItem = new anychart.ui.menu.Item('Landscape, ' + anychart.enums.normalizePaperSizeCaption(size));
      printItem.setModel({func: 'print', args: [size]});
      printItem.addClassName(anychart.ui.GanttToolbar.CssClass.PRINT + '-' + size);
      this.printMenu_.addChild(printItem, true);
    }

    return anychart.ui.GanttToolbar.base(this, 'draw');
  }

  return this;
};


/**
 * Constructor function for gantt toolbar.
 * @return {anychart.ui.GanttToolbar}
 */
anychart.ui.ganttToolbar = function() {
  return new anychart.ui.GanttToolbar();
};


/**
 * Constructor function for gantt toolbar.
 * @return {anychart.ui.GanttToolbar}
 * @deprecated Since 7.10.0. Use anychart.ui.ganttToolbar() instead.
 */
anychart.ganttToolbar = function() {
  anychart.core.reporting.warning(anychart.enums.WarningCode.DEPRECATED, null, ['anychart.ganttToolbar()', 'anychart.ui.ganttToolbar()', null, 'Constructor'], true);
  return new anychart.ui.GanttToolbar();
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = anychart.ui.GanttToolbar.prototype;
  goog.exportSymbol('anychart.ui.ganttToolbar', anychart.ui.ganttToolbar);
  goog.exportSymbol('anychart.ganttToolbar', anychart.ganttToolbar);
  proto['draw'] = proto.draw;
  proto['printPaperSizes'] = proto.printPaperSizes;
})();
