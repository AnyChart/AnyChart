goog.provide('anychart.ui.GanttToolbar');
goog.provide('anychart.ui.Toolbar');

goog.require('anychart.core.ui.toolbar.MenuItemRenderer');
goog.require('anychart.core.ui.toolbar.SubMenu');
goog.require('anychart.core.ui.toolbar.Toolbar');
goog.require('anychart.core.ui.toolbar.ToolbarButtonRenderer');
goog.require('anychart.core.ui.toolbar.ToolbarMenuButtonRenderer');
goog.require('anychart.core.ui.toolbar.ToolbarSeparatorRenderer');

goog.require('goog.debug.Console');
goog.require('goog.events');
goog.require('goog.log');
goog.require('goog.positioning.Corner');
goog.require('goog.string');

goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuRenderer');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.Separator');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarMenuButton');



//----------------------------------------------------------------------------------------------------------------------
//
// Common Toolbar
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.core.ui.toolbar.Toolbar}
 */
anychart.ui.Toolbar = function() {
  goog.base(this);

  /**
   * Related logger.
   * @type {goog.log.Logger}
   * @protected
   */
  this.logger = goog.log.getLogger('toolbar');

  var debugConsole = new goog.debug.Console();
  debugConsole.setCapturing(true);

  // --------- PRINTING ----------

  var printMenu = new goog.ui.PopupMenu(void 0,
      /** @type {goog.ui.MenuRenderer} */ (goog.ui.ContainerRenderer.getCustomRenderer(goog.ui.MenuRenderer, 'anychart-menu')));

  var printA4 = new goog.ui.MenuItem('A4', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  printA4.setId('anychart_print_a4');
  printMenu.addChild(printA4, true);

  //TODO (A.Kudryavtsev): Uncomment on future implementation.
  //var printA3 = new goog.ui.MenuItem('A3', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //printA3.setId('anychart_print_a3');
  //printMenu.addChild(printA3, true);
  //
  //var printA2 = new goog.ui.MenuItem('A2', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //printA2.setId('anychart_print_a2');
  //printMenu.addChild(printA2, true);
  //
  //var printA1 = new goog.ui.MenuItem('A1', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //printA1.setId('anychart_print_a1');
  //printMenu.addChild(printA1, true);
  //
  //var printA0 = new goog.ui.MenuItem('A0', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //printA0.setId('anychart_print_a0');
  //printMenu.addChild(printA0, true);

  printMenu.render(); //Create a DOM-structure to attach 'action'-event.

  //TODO (A.Kudryavtsev): In current implementation (20 Feb 2015) we can't print A4-A0 formats. That's why we just call print().
  goog.events.listen(
      printMenu,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );

  var printButton = new goog.ui.ToolbarMenuButton('Print', void 0, anychart.core.ui.toolbar.ToolbarMenuButtonRenderer.getInstance());
  this.addChild(printButton, true);
  printMenu.attach(printButton.getElement(), goog.positioning.Corner.BOTTOM_START);

  this.addChild(new goog.ui.Separator(anychart.core.ui.toolbar.ToolbarSeparatorRenderer.getInstance()), true);


  // --------- SAVE AS ----------

  var saveAsMenu = new goog.ui.PopupMenu(void 0,
      /** @type {goog.ui.MenuRenderer} */ (goog.ui.ContainerRenderer.getCustomRenderer(goog.ui.MenuRenderer, 'anychart-menu')));

  var saveAsSVG = new goog.ui.MenuItem('SVG', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsSVG.setId('anychart_saveAsSVG');
  saveAsMenu.addChild(saveAsSVG, true);

  var saveAsPNG = new goog.ui.MenuItem('PNG', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPNG.setId('anychart_saveAsPNG');
  saveAsMenu.addChild(saveAsPNG, true);

  var saveAsJPG = new goog.ui.MenuItem('JPG', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsJPG.setId('anychart_saveAsJPG');
  saveAsMenu.addChild(saveAsJPG, true);

  var pdfSubMenu = new anychart.core.ui.toolbar.SubMenu('PDF');
  var saveAsPDFA4 = new goog.ui.MenuItem('A4', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPDFA4.setId('anychart_saveAsPDF_a4');
  pdfSubMenu.addItem(saveAsPDFA4);

  var saveAsPDFA3 = new goog.ui.MenuItem('A3', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPDFA3.setId('anychart_saveAsPDF_a3');
  pdfSubMenu.addItem(saveAsPDFA3);

  var saveAsPDFA2 = new goog.ui.MenuItem('A2', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPDFA2.setId('anychart_saveAsPDF_a2');
  pdfSubMenu.addItem(saveAsPDFA2);

  var saveAsPDFA1 = new goog.ui.MenuItem('A1', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPDFA1.setId('anychart_saveAsPDF_a1');
  pdfSubMenu.addItem(saveAsPDFA1);

  var saveAsPDFA0 = new goog.ui.MenuItem('A0', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPDFA0.setId('anychart_saveAsPDF_a0');
  pdfSubMenu.addItem(saveAsPDFA0);

  saveAsMenu.addChild(pdfSubMenu, true);

  saveAsMenu.render(); //Create a DOM-structure to attach 'action'-event.

  //TODO (A.Kudryavtsev): In current implementation (20 Feb 2015) we can't save A4-A0 formats. That's why we just call saveAs<FORMAT>().
  goog.events.listen(
      saveAsMenu,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );

  var saveAsButton = new goog.ui.ToolbarMenuButton('Save As', saveAsMenu, anychart.core.ui.toolbar.ToolbarMenuButtonRenderer.getInstance());
  this.addChild(saveAsButton, true);
  saveAsMenu.attach(saveAsButton.getElement(), goog.positioning.Corner.BOTTOM_START);

  this.addChild(new goog.ui.Separator(anychart.core.ui.toolbar.ToolbarSeparatorRenderer.getInstance()), true);


  // --------- ZOOM IN, ZOOM OUT, FIT ALL ----------

  var zoomInButton = new goog.ui.ToolbarButton('Zoom In', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  zoomInButton.setId('anychart_zoomIn');
  goog.events.listen(
      zoomInButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(zoomInButton, true);

  var zoomOutButton = new goog.ui.ToolbarButton('Zoom Out', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  zoomOutButton.setId('anychart_zoomOut');
  goog.events.listen(
      zoomOutButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(zoomOutButton, true);

  var fitAllButton = new goog.ui.ToolbarButton('Fit All', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  fitAllButton.setId('anychart_fitAll');
  goog.events.listen(
      fitAllButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(fitAllButton, true);

};
goog.inherits(anychart.ui.Toolbar, anychart.core.ui.toolbar.Toolbar);


/**
 * Chart is not set message.
 * @type {string}
 */
anychart.ui.Toolbar.CHART_IS_NOT_SET = 'No chart is assigned for toolbar. Please set a target chart using toolbar.target() method.';


/**
 * Message is not defined message template.
 * @type {string}
 */
anychart.ui.Toolbar.METHOD_IS_NOT_DEFINED = 'Target chart has not method %s(). PLease make sure that you use correct instance of chart.';


/**
 * Creates toolbar action handler.
 * @return {Function} - Toolbar action handler.
 * @protected
 */
anychart.ui.Toolbar.prototype.createToolbarActionHandler = function() {
  var ths = this;
  return function(e) {
    var id = e.target.getId(); //Got string like 'anychart_saveAsPDF_a3'
    var args = id.split('_');
    var func = args[1];

    var chart = ths.target();
    if (chart) {
      var fn = chart[func];
      if (goog.isFunction(fn)) {
        fn.call(chart); //TODO (A.Kudryavtsev): No arguments can be passed for a while.
      } else {
        if (anychart.DEVELOP) goog.log.warning(ths.logger, goog.string.subs(anychart.ui.Toolbar.METHOD_IS_NOT_DEFINED, func));
      }
    } else {
      if (anychart.DEVELOP) goog.log.warning(ths.logger, anychart.ui.Toolbar.CHART_IS_NOT_SET);
    }
  }
};



//----------------------------------------------------------------------------------------------------------------------
//
// Gantt Toolbar
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.ui.Toolbar}
 */
anychart.ui.GanttToolbar = function() {
  goog.base(this);

  this.addChild(new goog.ui.Separator(anychart.core.ui.toolbar.ToolbarSeparatorRenderer.getInstance()), true);


  // --------- EXPAND/COLLAPSE ----------

  var expandAllButton = new goog.ui.ToolbarButton('Expand All', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  expandAllButton.setId('anychart_expandAll');
  goog.events.listen(
      expandAllButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(expandAllButton, true);

  var collapseAllButton = new goog.ui.ToolbarButton('Collapse All', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  collapseAllButton.setId('anychart_collapseAll');
  goog.events.listen(
      collapseAllButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(collapseAllButton, true);
};
goog.inherits(anychart.ui.GanttToolbar, anychart.ui.Toolbar);


/**
 * Constructor function for default toolbar.
 * @return {!anychart.ui.Toolbar}
 */
anychart.toolbar = function() {
  return new anychart.ui.Toolbar();
};


/**
 * Constructor function for gantt toolbar.
 * @return {!anychart.ui.GanttToolbar}
 */
anychart.ganttToolbar = function() {
  return new anychart.ui.GanttToolbar();
};


//exports
goog.exportSymbol('anychart.toolbar', anychart.toolbar);
goog.exportSymbol('anychart.ganttToolbar', anychart.ganttToolbar);
anychart.ui.Toolbar.prototype['container'] = anychart.ui.Toolbar.prototype.container;
anychart.ui.Toolbar.prototype['target'] = anychart.ui.Toolbar.prototype.target;
anychart.ui.Toolbar.prototype['draw'] = anychart.ui.Toolbar.prototype.draw;

