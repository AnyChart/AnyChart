goog.provide('anychart.ui.GanttToolbar');
goog.provide('anychart.ui.Toolbar');

goog.require('anychart.core.ui.toolbar.MenuItemRenderer');
goog.require('anychart.core.ui.toolbar.SubMenu');
goog.require('anychart.core.ui.toolbar.Toolbar');
goog.require('anychart.core.ui.toolbar.ToolbarButtonRenderer');
goog.require('anychart.core.ui.toolbar.ToolbarMenuButtonRenderer');
goog.require('anychart.core.ui.toolbar.ToolbarSeparatorRenderer');
goog.require('anychart.utils');

goog.require('goog.events');
goog.require('goog.positioning.Corner');

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

  if (!anychart.toolbarCssEmbedded) {
    anychart.embedCss(anychart.TOOLBAR_CSS);
    anychart.toolbarCssEmbedded = true;
  }

  // --------- PRINTING ----------

  /**
   * Print menu.
   * @type {goog.ui.PopupMenu}
   * @private
   */
  this.printMenu_ = new goog.ui.PopupMenu(void 0,
      /** @type {goog.ui.MenuRenderer} */ (goog.ui.ContainerRenderer.getCustomRenderer(goog.ui.MenuRenderer, 'anychart-menu')));

  var hideHandler = function(e) {
    e.preventDefault();
  };

  var ths = this;

  this.printMenu_.listen(goog.ui.Component.EventType.ENTER, function(e) {
    var menuItem = e['target'];
    if (menuItem.getId() == 'anychart_switchLayout') {
      ths.printMenu_.listen(goog.ui.Component.EventType.HIDE, hideHandler);
    }
  });

  this.printMenu_.listen(goog.ui.Component.EventType.LEAVE, function(e) {
    ths.printMenu_.unlisten(goog.ui.Component.EventType.HIDE, hideHandler);
  });


  var switchLayout = new goog.ui.MenuItem('Switch Layout', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  switchLayout.setId('anychart_switchLayout');
  switchLayout.setValue(true);

  this.printMenu_.addChild(switchLayout, true);

  var separator = new goog.ui.Separator(
      /** @type {goog.ui.MenuSeparatorRenderer} */ (goog.ui.ControlRenderer.getCustomRenderer(
          goog.ui.MenuSeparatorRenderer, 'anychart-menuseparator')));
  this.printMenu_.addChild(separator, true);

  this.printMenu_.render(); //Create a DOM-structure to attach 'action'-event.

  //TODO (A.Kudryavtsev): In current implementation (20 Feb 2015) we can't print A4-A0 formats. That's why we just call print().
  goog.events.listen(
      ths.printMenu_,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );

  this.printMenu_.setParent(this);


  var printButton = new goog.ui.ToolbarMenuButton('Print', void 0, anychart.core.ui.toolbar.ToolbarMenuButtonRenderer.getInstance());
  printButton.addClassName(anychart.ui.Toolbar.CssClass.PRINT);
  this.addChild(printButton, true);
  this.printMenu_.attach(printButton.getElement(), goog.positioning.Corner.BOTTOM_START);

  this.addChild(new goog.ui.Separator(anychart.core.ui.toolbar.ToolbarSeparatorRenderer.getInstance()), true);

  // --------- SAVE AS ----------

  var saveAsMenu = new goog.ui.PopupMenu(void 0,
      /** @type {goog.ui.MenuRenderer} */ (goog.ui.ContainerRenderer.getCustomRenderer(goog.ui.MenuRenderer, 'anychart-menu')));

  var saveAsSvg = new goog.ui.MenuItem('SVG', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsSvg.addClassName(anychart.ui.Toolbar.CssClass.SAVE_AS_SVG);
  saveAsSvg.setModel({name: 'saveAsSvg'});
  saveAsMenu.addChild(saveAsSvg, true);

  var saveAsPng = new goog.ui.MenuItem('PNG', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPng.addClassName(anychart.ui.Toolbar.CssClass.SAVE_AS_PNG);
  saveAsPng.setModel({name: 'saveAsPng'});
  saveAsMenu.addChild(saveAsPng, true);

  var saveAsJpg = new goog.ui.MenuItem('JPG', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsJpg.addClassName(anychart.ui.Toolbar.CssClass.SAVE_AS_JPG);
  saveAsJpg.setModel({name: 'saveAsJpg'});
  saveAsMenu.addChild(saveAsJpg, true);

  var pdfSubMenu = new anychart.core.ui.toolbar.SubMenu('PDF');
  pdfSubMenu.addClassName(anychart.ui.Toolbar.CssClass.SAVE_AS_PDF);
  var saveAsPdf = new goog.ui.MenuItem('A4', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  saveAsPdf.setModel({name: 'saveAsPdf'});
  saveAsPdf.addClassName(anychart.ui.Toolbar.CssClass.SAVE_AS_PDF);
  pdfSubMenu.addItem(saveAsPdf);

  saveAsMenu.addChild(pdfSubMenu, true);

  saveAsMenu.render(); //Create a DOM-structure to attach 'action'-event.

  //TODO (A.Kudryavtsev): In current implementation (20 Feb 2015) we can't save A4-A0 formats. That's why we just call saveAs<FORMAT>().
  goog.events.listen(
      saveAsMenu,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );

  var saveAsButton = new goog.ui.ToolbarMenuButton('Save As', saveAsMenu, anychart.core.ui.toolbar.ToolbarMenuButtonRenderer.getInstance());
  saveAsButton.addClassName(anychart.ui.Toolbar.CssClass.SAVE_AS);
  this.addChild(saveAsButton, true);
  saveAsMenu.attach(saveAsButton.getElement(), goog.positioning.Corner.BOTTOM_START);

  this.addChild(new goog.ui.Separator(anychart.core.ui.toolbar.ToolbarSeparatorRenderer.getInstance()), true);


  // --------- ZOOM IN, ZOOM OUT, FIT ALL ----------

  var zoomInButton = new goog.ui.ToolbarButton('Zoom In', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  zoomInButton.addClassName(anychart.ui.Toolbar.CssClass.ZOOM_IN);
  zoomInButton.setModel({name: 'zoomIn'});
  goog.events.listen(
      zoomInButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(zoomInButton, true);

  var zoomOutButton = new goog.ui.ToolbarButton('Zoom Out', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  zoomOutButton.addClassName(anychart.ui.Toolbar.CssClass.ZOOM_OUT);
  zoomOutButton.setModel({name: 'zoomOut'});
  goog.events.listen(
      zoomOutButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(zoomOutButton, true);

  var fitAllButton = new goog.ui.ToolbarButton('Fit All', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  fitAllButton.addClassName(anychart.ui.Toolbar.CssClass.FIT_ALL);
  fitAllButton.setModel({name: 'fitAll'});
  goog.events.listen(
      fitAllButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(fitAllButton, true);

};
goog.inherits(anychart.ui.Toolbar, anychart.core.ui.toolbar.Toolbar);


/**
 * @enum {string}
 */
anychart.ui.Toolbar.CssClass = {
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
 * @inheritDoc
 */
anychart.ui.Toolbar.prototype.draw = function() {
  var sizes = this.printPaperSizes();
  for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i];
    var id = 'anychart_print_' + size;
    if (!goog.array.contains(this.printMenu_.getChildIds(), id)) {
      var printItem = new goog.ui.MenuItem('Landscape, ' + anychart.utils.normalizePaperSizeCaption(size),
          void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
      printItem.setId(id);
      printItem.setModel({name: 'print', args: [size]});
      printItem.addClassName(anychart.ui.Toolbar.CssClass.PRINT + '-' + size);
      this.printMenu_.addChild(printItem, true);
    }
  }

  return goog.base(this, 'draw');
};


/**
 * Creates toolbar action handler.
 * @return {Function} - Toolbar action handler.
 * @protected
 */
anychart.ui.Toolbar.prototype.createToolbarActionHandler = function() {
  var ths = this;
  return function(e) {
    var item = e['target'];
    var id = item.getId(); //Got string like 'anychart_saveAsPdf_a3' or 'anychart_switchLayout'
    var menu = e.currentTarget;

    if (id == 'anychart_switchLayout') {
      var isLandscape = item.getValue();

      menu.forEachChild(function(child, index) {
        if (child.getId() != 'anychart_switchLayout' && child instanceof goog.ui.MenuItem) {
          var str = isLandscape ? 'Portrait' : 'Landscape';
          str += ', ';
          str += child.getCaption().split(',')[1];
          child.setCaption(str);
        }
      });

      item.setValue(!isLandscape);
    } else {
      var model = item.getModel();
      var funcName = model.name;
      var args = model.args || [];

      if (funcName == 'print') args.push(!item.getCaption().indexOf('Landscape'));

      var chart = ths.target();
      if (chart) {
        var fn = chart[funcName];
        if (goog.isFunction(fn)) {
          fn.apply(chart, args);
        } else {
          anychart.utils.warning(anychart.enums.WarningCode.TOOLBAR_METHOD_IS_NOT_DEFINED, null, [funcName]);
        }
      } else {
        anychart.utils.warning(anychart.enums.WarningCode.TOOLBAR_CHART_IS_NOT_SET);
      }
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
  expandAllButton.addClassName(anychart.ui.Toolbar.CssClass.EXPAND_ALL);
  expandAllButton.setModel({name: 'expandAll'});
  goog.events.listen(
      expandAllButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(expandAllButton, true);

  var collapseAllButton = new goog.ui.ToolbarButton('Collapse All', anychart.core.ui.toolbar.ToolbarButtonRenderer.getInstance());
  collapseAllButton.addClassName(anychart.ui.Toolbar.CssClass.COLLAPSE_ALL);
  collapseAllButton.setModel({name: 'collapseAll'});
  goog.events.listen(
      collapseAllButton,
      goog.ui.Component.EventType.ACTION,
      this.createToolbarActionHandler()
  );
  this.addChild(collapseAllButton, true);
};
goog.inherits(anychart.ui.GanttToolbar, anychart.ui.Toolbar);


//exports
anychart.ui.Toolbar.prototype['draw'] = anychart.ui.Toolbar.prototype.draw; //Overriden method - needs to be exported.
