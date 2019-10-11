goog.provide('anychart.ui.GanttToolbar');

goog.require('anychart.core.reporting');
goog.require('anychart.enums');
goog.require('anychart.ui.menu.Item');
goog.require('anychart.ui.menu.Menu');
goog.require('anychart.ui.menu.SubMenu');
goog.require('anychart.ui.menu.ToolbarMenuRenderer');
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

  this.buttonsMode_ = anychart.enums.GanttToolbarButtonsMode.ALL;
  this.buttonsWithIcons_ = [];

  this.subButtonsWithIcons_ = [];

  this.createButtonsAndMenus();

  /**
   * External print function for internal purposes.
   * Used in Qlik.
   * @type {?Function}
   */
  this.externalPrintFunction = null;

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
 * All the buttons and menus are created here.
 * Also this.buttonsWithIcons_ is populated. It is later used to reapply icons/texts.
 */
anychart.ui.GanttToolbar.prototype.createButtonsAndMenus = function() {
  // --------- PRINTING ----------
  /**
   * Print menu.
   * @type {anychart.ui.menu.Menu}
   * @private
   */
  this.printMenu_ = new anychart.ui.menu.Menu(undefined, anychart.ui.menu.ToolbarMenuRenderer.getInstance());

  var switchMessage = anychart.format.getMessage('Switch page orientation');
  this.switchPageOrientation_ = new anychart.ui.menu.Item(switchMessage);
  this.switchPageOrientation_.setModel({
    func: 'switchPageOrientation',
    isLandscape: true
  });

  this.printMenu_.addChild(this.switchPageOrientation_, true);
  this.printMenu_.addChild(new goog.ui.MenuSeparator(), true);

  var printMessage = anychart.format.getMessage('Print');
  this.printButton_ = new anychart.ui.toolbar.MenuButton(printMessage, this.printMenu_);
  this.printButton_.addClassName(anychart.ui.GanttToolbar.CssClass.PRINT);
  this.printButton_.setModel({text: printMessage, icon: 'ac-print'});
  this.addChild(this.printButton_, true);
  this.buttonsWithIcons_.push(this.printButton_);

  // --------- SAVE AS ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  /**
   * Save as menu.
   * @type {anychart.ui.menu.Menu}
   * @private
   */
  this.saveAsMenu_ = new anychart.ui.menu.Menu(undefined, anychart.ui.menu.ToolbarMenuRenderer.getInstance());

  var saveAsSvg = new anychart.ui.menu.Item('SVG');
  saveAsSvg.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_SVG);
  saveAsSvg.setModel({func: 'saveAsSvg', icon: 'ac-file-code-o', text: 'SVG'});
  this.saveAsMenu_.addChild(saveAsSvg, true);
  this.setIconTo_(saveAsSvg, true, true);
  this.subButtonsWithIcons_.push(saveAsSvg);

  var saveAsPng = new anychart.ui.menu.Item('PNG');
  saveAsPng.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_PNG);
  saveAsPng.setModel({func: 'saveAsPng', icon: 'ac-file-image-o', text: 'PNG'});
  this.saveAsMenu_.addChild(saveAsPng, true);
  this.setIconTo_(saveAsPng, true, true);
  this.subButtonsWithIcons_.push(saveAsPng);

  var saveAsJpg = new anychart.ui.menu.Item('JPG');
  saveAsJpg.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_JPG);
  saveAsJpg.setModel({func: 'saveAsJpg', icon: 'ac-file-image-o', text: 'JPG'});
  this.saveAsMenu_.addChild(saveAsJpg, true);
  this.setIconTo_(saveAsJpg, true, true);
  this.subButtonsWithIcons_.push(saveAsJpg);

  var pdfSubMenu = new anychart.ui.menu.SubMenu('PDF', undefined, true);
  pdfSubMenu.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_PDF);
  //start from i == 1, because saveAsPdf doesn't take us-letter size
  for (var i = 1; i < this.printPaperSizes_.length; i++) {
    var size = this.printPaperSizes_[i];
    var menuItem = new anychart.ui.menu.Item(size.toUpperCase());
    menuItem.setModel({func: 'saveAsPdf', args: [size]});
    menuItem.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS_PDF);
    pdfSubMenu.addItem(menuItem);
  }
  this.saveAsMenu_.addChild(pdfSubMenu, true);
  pdfSubMenu.setModel({icon: 'ac-file-pdf-o', text: 'PDF'});
  this.setIconTo_(pdfSubMenu, true, true);
  this.subButtonsWithIcons_.push(pdfSubMenu);

  var saveAsMessage = anychart.format.getMessage('Save As');
  var saveAsButton = new anychart.ui.toolbar.MenuButton(saveAsMessage, this.saveAsMenu_);
  saveAsButton.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS);
  saveAsButton.setModel({text: saveAsMessage, icon: 'ac-save'});
  this.addChild(saveAsButton, true);
  this.buttonsWithIcons_.push(saveAsButton);

  // --------- ZOOM IN, ZOOM OUT, FIT ALL ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  var zoomInMessage = anychart.format.getMessage('Zoom In');
  var zoomInButton = new goog.ui.ToolbarButton(zoomInMessage);
  zoomInButton.addClassName(anychart.ui.GanttToolbar.CssClass.ZOOM_IN);
  zoomInButton.setModel({func: 'zoomIn', text: zoomInMessage, icon: 'ac-zoom-in'});
  this.addChild(zoomInButton, true);
  // this.setIconTo_(zoomInButton, 'ac-zoom-in');
  this.buttonsWithIcons_.push(zoomInButton);

  var zoomOutMessage = anychart.format.getMessage('Zoom Out');
  var zoomOutButton = new goog.ui.ToolbarButton(zoomOutMessage);
  zoomOutButton.addClassName(anychart.ui.GanttToolbar.CssClass.ZOOM_OUT);
  zoomOutButton.setModel({func: 'zoomOut', text: zoomOutMessage, icon: 'ac-zoom-out'});
  this.addChild(zoomOutButton, true);
  this.buttonsWithIcons_.push(zoomOutButton);

  var fitAllMessage = anychart.format.getMessage('Fit All');
  var fitAllButton = new goog.ui.ToolbarButton(fitAllMessage);
  fitAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.FIT_ALL);
  fitAllButton.setModel({func: 'fitAll', text: fitAllMessage, icon: 'ac-dot-square-o'});
  this.addChild(fitAllButton, true);
  this.buttonsWithIcons_.push(fitAllButton);

  // --------- EXPAND/COLLAPSE ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  var expandMessage = anychart.format.getMessage('Expand All');
  var expandAllButton = new goog.ui.ToolbarButton(expandMessage);
  expandAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.EXPAND_ALL);
  expandAllButton.setModel({func: 'expandAll', text: expandMessage, icon: 'ac-expand'});
  this.addChild(expandAllButton, true);
  this.buttonsWithIcons_.push(expandAllButton);

  var collapseMessage = anychart.format.getMessage('Collapse All');
  var collapseAllButton = new goog.ui.ToolbarButton(collapseMessage);
  collapseAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.COLLAPSE_ALL);
  collapseAllButton.setModel({func: 'collapseAll', text: collapseMessage, icon: 'ac-collapse'});
  this.addChild(collapseAllButton, true);
  this.buttonsWithIcons_.push(collapseAllButton);
};


/**
 * Applies icons and texts based on ButtonsMode setting to toolbar buttons.
 * Affects only top level buttons, not the menus.
 */
anychart.ui.GanttToolbar.prototype.applyIconsAndTexts = function() {
  for (var i = 0; i < this.buttonsWithIcons_.length; i++) {
    var button = this.buttonsWithIcons_[i];
    switch (this.buttonsMode_) {
      case anychart.enums.GanttToolbarButtonsMode.ALL:
        this.setIconTo_(button, true, true);
        break;
      case anychart.enums.GanttToolbarButtonsMode.ICON:
        this.setIconTo_(button, true, false);
        break;
      case anychart.enums.GanttToolbarButtonsMode.TEXT:
        this.setIconTo_(button, false, true);
        break;
    }
  }

  for (i = 0; i < this.subButtonsWithIcons_.length; i++) {
    var button = this.subButtonsWithIcons_[i];
    switch (this.buttonsMode_) {
      case anychart.enums.GanttToolbarButtonsMode.TEXT:
        this.setIconTo_(button, false, true);
        break;
      case anychart.enums.GanttToolbarButtonsMode.ALL:
      case anychart.enums.GanttToolbarButtonsMode.ICON:
        this.setIconTo_(button, true, true);
        break;
    }
  }
};


/**
 * Getter/setter of gantt buttons mode. Configures how they are displayed: icon/text only, or both.
 * @param {anychart.enums.GanttToolbarButtonsMode=} opt_mode
 * @return {anychart.ui.GanttToolbar|anychart.enums.GanttToolbarButtonsMode}
 */
anychart.ui.GanttToolbar.prototype.buttonsMode = function(opt_mode) {
  if (goog.isDef(opt_mode)) {
    if (opt_mode != this.buttonsMode_) {
      this.buttonsMode_ = opt_mode;
      this.applyIconsAndTexts();
    }
    return this;
  }
  return this.buttonsMode_;
};


/**
 *
 * @param {anychart.ui.toolbar.MenuButton|goog.ui.ToolbarButton|anychart.ui.menu.Item|anychart.ui.menu.SubMenu} item
 * @param {boolean|string=} opt_icon
 * @param {boolean|string=} opt_text
 * @private
 */
anychart.ui.GanttToolbar.prototype.setIconTo_ = function(item, opt_icon, opt_text) {
  var element = item.getElement();
  var model = item.getModel();
  var icon = model.icon;
  var text = model.text;
  var topLevelItem = anychart.utils.instanceOf(item, anychart.ui.toolbar.MenuButton) || anychart.utils.instanceOf(item, goog.ui.ToolbarButton);

  if (element) {
    var iconElement = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.I, 'anychart-toolbar-item-icon', element)[0];
    var textElement = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.SPAN, 'anychart-toolbar-item-text', element)[0];

    if (!iconElement || !textElement) {//there is no icon or text element
      if (!iconElement) {
        iconElement = goog.dom.createDom(goog.dom.TagName.I, ['anychart-toolbar-item-icon', icon]);
        goog.a11y.aria.setState(iconElement, goog.a11y.aria.State.HIDDEN, true);
      }

      if (!textElement) {
        textElement = goog.dom.createDom(goog.dom.TagName.SPAN, 'anychart-toolbar-item-text');
        goog.dom.setTextContent(textElement, text || '');
      }

      if (topLevelItem) {
        var container = goog.dom.createDom(goog.dom.TagName.DIV);
        goog.dom.insertChildAt(container, iconElement, 0);
        goog.dom.insertChildAt(container, textElement, 1);
        item.setContent(container);
      } else {
        item.setContent(textElement);
        goog.dom.insertChildAt(element, iconElement, 0);
      }
    }

    if (goog.isBoolean(opt_text)) {
      goog.style.setElementShown(textElement, opt_text);
    }

    if (goog.isBoolean(opt_icon)) {
      goog.style.setElementShown(iconElement, opt_icon);
    }
  }
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

    if (funcName == 'print') args[1] = switchPageOrientationModel.isLandscape;

    var chart = this.target();
    /*
    External print function is used in qlik to call custom gantt printing function.
    On DVF-4248 refactor this case should be considered. And Qlik code altered according to new api.
     */
    if (funcName == 'print' && goog.isFunction(this.externalPrintFunction)) {
      this.externalPrintFunction.apply(null, goog.array.concat([chart], args));
      return;
    }

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

    while (this.printMenu_.getChildCount() > 2) {
      this.printMenu_.removeChildAt(2, true);
    }

    this.exitDocument();
    this.draw();
    return this;
  }
  return this.printPaperSizes_;
};


/**
 * @inheritDoc
 */
anychart.ui.GanttToolbar.prototype.draw = function() {
  this.applyIconsAndTexts();

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
 * External print function is used in qlik to call custom gantt printing function.
 * On DVF-4248 refactor this case should be considered. And Qlik code altered according to new api.
 * @param {?Function=} opt_function
 * @return {null|Function|anychart.ui.GanttToolbar}
 */
anychart.ui.GanttToolbar.prototype.printFunction = function(opt_function) {
  if (goog.isDef(opt_function)) {
    this.externalPrintFunction = opt_function;
    return this;
  }
  return this.externalPrintFunction;
};


/**
 * Constructor function for gantt toolbar.
 * @return {anychart.ui.GanttToolbar}
 */
anychart.ui.ganttToolbar = function() {
  return new anychart.ui.GanttToolbar();
};


//exports
(function() {
  goog.exportSymbol('anychart.ui.ganttToolbar', anychart.ui.ganttToolbar);
  var proto = anychart.ui.GanttToolbar.prototype;
  proto['draw'] = proto.draw;
  proto['printPaperSizes'] = proto.printPaperSizes;
  proto['container'] = proto.container;
  proto['target'] = proto.target;
  proto['buttonsMode'] = proto.buttonsMode;
  proto['printFunction'] = proto.printFunction;
})();
