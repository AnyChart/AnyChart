goog.provide('anychart.ui.GanttToolbar');
goog.provide('anychart.ui.Toolbar');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.ui.toolbar.MenuItemRenderer');
goog.require('anychart.core.ui.toolbar.SubMenu');
goog.require('anychart.core.ui.toolbar.Toolbar');
goog.require('anychart.core.ui.toolbar.ToolbarButtonRenderer');
goog.require('anychart.core.ui.toolbar.ToolbarMenuButtonRenderer');
goog.require('anychart.core.ui.toolbar.ToolbarSeparatorRenderer');
goog.require('anychart.utils');

goog.require('goog.events');
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
  this.addChild(printButton, true);
  this.printMenu_.attach(printButton.getElement(), goog.positioning.Corner.BOTTOM_START);

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

  //var saveAsPDFA3 = new goog.ui.MenuItem('A3', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //saveAsPDFA3.setId('anychart_saveAsPDF_a3');
  //pdfSubMenu.addItem(saveAsPDFA3);
  //
  //var saveAsPDFA2 = new goog.ui.MenuItem('A2', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //saveAsPDFA2.setId('anychart_saveAsPDF_a2');
  //pdfSubMenu.addItem(saveAsPDFA2);
  //
  //var saveAsPDFA1 = new goog.ui.MenuItem('A1', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //saveAsPDFA1.setId('anychart_saveAsPDF_a1');
  //pdfSubMenu.addItem(saveAsPDFA1);
  //
  //var saveAsPDFA0 = new goog.ui.MenuItem('A0', void 0, void 0, anychart.core.ui.toolbar.MenuItemRenderer.getInstance());
  //saveAsPDFA0.setId('anychart_saveAsPDF_a0');
  //pdfSubMenu.addItem(saveAsPDFA0);

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
    var id = item.getId(); //Got string like 'anychart_saveAsPDF_a3' or 'anychart_switchLayout'
    var menu = e['currentTarget'];

    if (id == 'anychart_switchLayout') {
      var isLandscape = item.getValue();

      menu.forEachChild(function(child, index) {
        var childId = child.getId();
        if (!childId.indexOf('anychart') && (childId != id)) {
          var childValueSplit = child.getValue().split(',');
          childValueSplit[0] = isLandscape ? 'Portrait' : 'Landscape';
          child.setCaption(childValueSplit.join(','));
        }
      });

      item.setValue(!isLandscape);
    } else {
      var args = id.split('_');

      /*
        String 'anychart_saveAsPDF_a3' will be represented as args = ['anychart', 'saveAsPDF', 'a3'].
        goog.array.splice() will turn arr to ['a3'] and will return ['anychart', 'saveAsPDF'], where index '1' is function
        to be called.
      */
      var func = goog.array.splice(args, 0, 2)[1];

      if (func == 'print') args.push(!item.getCaption().indexOf('Landscape'));

      var chart = ths.target();
      if (chart) {
        var fn = chart[func];
        if (goog.isFunction(fn)) {
          fn.apply(chart, args);
        } else {
          anychart.utils.warning(anychart.enums.WarningCode.TOOLBAR_METHOD_IS_NOT_DEFINED, null, [func]);
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


//exports
anychart.ui.Toolbar.prototype['draw'] = anychart.ui.Toolbar.prototype.draw; //Overriden method - needs to be exported.
