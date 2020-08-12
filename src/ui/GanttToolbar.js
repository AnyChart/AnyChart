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
   * Contains info about selected layout and selected print range.
   *
   * @type {Object}
   *
   * @private
   */
  this.printState_ = {
    range: anychart.ui.GanttToolbar.PRINT_RANGE_OPTIONS.VISIBLE,
    layout: anychart.ui.GanttToolbar.LAYOUT_OPTIONS.LANDSCAPE
  };

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
 * Id strings for buttons with captions that can be localized.
 * @enum {string}
 */
anychart.ui.GanttToolbar.ButtonIds = {
  PRINT: 'print',
  SWITCH_PAGE_ORIENTATION: 'switchPageOrientation',
  CHANGE_RANGE: 'changeRange',
  CHANGE_LAYOUT: 'changeLayout',
  ALL_DATES: 'allDates',
  VISIBLE_DATES: 'visibleDates',
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
  SAVE_AS: 'saveAs',
  ZOOM_IN: 'zoomIn',
  ZOOM_OUT: 'zoomOut',
  FIT_ALL: 'fitAll',
  EXPAND_ALL: 'expandAll',
  COLLAPSE_ALL: 'collapseAll'
};

/**
 * @enum {string}
 */
anychart.ui.GanttToolbar.ButtonCaptions = {};
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.PRINT] = 'Print';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.CHANGE_LAYOUT] = 'Layout';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.CHANGE_RANGE] = 'Range';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.ALL_DATES] = 'All dates';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.VISIBLE_DATES] = 'Visible dates';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.PORTRAIT] = 'Portrait';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.LANDSCAPE] = 'Landscape';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.SAVE_AS] = 'Save As';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.ZOOM_IN] = 'Zoom In';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.ZOOM_OUT] = 'Zoom Out';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.FIT_ALL] = 'Fit All';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.EXPAND_ALL] = 'Expand All';
anychart.ui.GanttToolbar.ButtonCaptions[anychart.ui.GanttToolbar.ButtonIds.COLLAPSE_ALL] = 'Collapse All';


/**
 * Create and returns menu with selectable items.
 *
 * @param {string} optionName - Label of menu.
 * @param {Array.<{caption: string, value: string}>} options - Array with items that will be treated as value and caption.
 * @param {Function} handler - Function that calls after menu change.
 * @param {string=} opt_selected - Selected item by default.
 *
 * @return {anychart.ui.menu.SubMenu} - Menu.
 *
 * @private
 */
anychart.ui.GanttToolbar.prototype.createMenuWithSelectableItems_ = function (optionName, options, handler, opt_selected) {
  var menu = new anychart.ui.menu.SubMenu(optionName, void 0, true);

  var items = goog.array.map(options, function (data) {
    var caption = data.caption;
    var value = data.value;

    var item = new anychart.ui.menu.Item(caption);
    item.setValue(value);
    item.setSelectable(true);
    // Select default value.
    item.setSelected(value == opt_selected);

    return item;
  });

  // Append items into menu.
  goog.array.forEach(items, menu.addItem, menu);

  // Handle menu select.
  menu.listen(goog.ui.Component.EventType.ACTION, function (e) {
    var target = e.target;
    var value = target.getValue();

    // Deselect others.
    goog.array.forEach(items, function (item) {
      item.setSelected(item == target);
    });

    handler.call(this, value);

    // Don't propagate event to toolbar.
    e.stopPropagation();
  }, void 0, this);

  return menu;
};


/**
 * Available layout options.
 *
 * @enum {string}
 */
anychart.ui.GanttToolbar.LAYOUT_OPTIONS = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait'
};

/**
 * Available range options.
 *
 * @enum {string}
 */
anychart.ui.GanttToolbar.PRINT_RANGE_OPTIONS = {
  FULL: 'full',
  VISIBLE: 'visible'
};

/**
 * Creates menu that contains printing options.
 *
 * @private
 */
anychart.ui.GanttToolbar.prototype.createPrintMenu_ = function() {
  this.printMenu_ = new anychart.ui.menu.Menu(void 0, anychart.ui.menu.ToolbarMenuRenderer.getInstance());

  var layoutOptions = [
    {
      caption: this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.LANDSCAPE),
      value: anychart.ui.GanttToolbar.LAYOUT_OPTIONS.LANDSCAPE
    },
    {
      caption: this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.PORTRAIT),
      value: anychart.ui.GanttToolbar.LAYOUT_OPTIONS.PORTRAIT
    }
  ];

  var layoutMenu = this.createMenuWithSelectableItems_(
      this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.CHANGE_LAYOUT),
      layoutOptions,
      function (layout) {
        this.printState_.layout = layout;
        // Prevent menu close.
        this.printMenu_.setVisible(true, true);
      },
      anychart.ui.GanttToolbar.LAYOUT_OPTIONS.LANDSCAPE
  );

  var rangeOptions = [
    {
      caption: this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.ALL_DATES),
      value: anychart.ui.GanttToolbar.PRINT_RANGE_OPTIONS.FULL
    },
    {
      caption: this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.VISIBLE_DATES),
      value: anychart.ui.GanttToolbar.PRINT_RANGE_OPTIONS.VISIBLE
    }
  ];

  var rangeMenu = this.createMenuWithSelectableItems_(
      this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.CHANGE_RANGE),
      rangeOptions,
      function (range) {
        this.printState_.range = range;
        // Prevent menu close.
        this.printMenu_.setVisible(true, true);
      },
      anychart.ui.GanttToolbar.PRINT_RANGE_OPTIONS.VISIBLE
  );

  this.printMenu_.addChild(layoutMenu, true);
  this.printMenu_.addChild(rangeMenu, true);
  this.printMenu_.addChild(new goog.ui.MenuSeparator(), true);

  var printMessage = this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.PRINT);
  this.printButton_ = new anychart.ui.toolbar.MenuButton(printMessage, this.printMenu_);
  this.printButton_.addClassName(anychart.ui.GanttToolbar.CssClass.PRINT);
  this.printButton_.setModel({
    id: anychart.ui.GanttToolbar.ButtonIds.PRINT,
    text: printMessage,
    icon: 'ac-print'
  });
  this.addChild(this.printButton_, true);
  this.buttonsWithIcons_.push(this.printButton_);
};


/**
 * All the buttons and menus are created here.
 * Also this.buttonsWithIcons_ is populated. It is later used to reapply icons/texts.
 */
anychart.ui.GanttToolbar.prototype.createButtonsAndMenus = function() {
  this.createPrintMenu_();
  // --------- SAVE AS ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  /**
   * Save as menu.
   * @type {anychart.ui.menu.Menu}
   * @private
   */
  this.saveAsMenu_ = new anychart.ui.menu.Menu(void 0, anychart.ui.menu.ToolbarMenuRenderer.getInstance());

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

  var saveAsMessage = this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.SAVE_AS);
  var saveAsButton = new anychart.ui.toolbar.MenuButton(saveAsMessage, this.saveAsMenu_);
  saveAsButton.addClassName(anychart.ui.GanttToolbar.CssClass.SAVE_AS);
  saveAsButton.setModel({
    id: anychart.ui.GanttToolbar.ButtonIds.SAVE_AS,
    text: saveAsMessage,
    icon: 'ac-save'
  });
  this.addChild(saveAsButton, true);
  this.buttonsWithIcons_.push(saveAsButton);

  // --------- ZOOM IN, ZOOM OUT, FIT ALL ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  var zoomInMessage = this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.ZOOM_IN);
  var zoomInButton = new goog.ui.ToolbarButton(zoomInMessage);
  zoomInButton.addClassName(anychart.ui.GanttToolbar.CssClass.ZOOM_IN);
  zoomInButton.setModel({
    id: anychart.ui.GanttToolbar.ButtonIds.ZOOM_IN,
    func: anychart.ui.GanttToolbar.ButtonIds.ZOOM_IN,
    text: zoomInMessage,
    icon: 'ac-zoom-in'
  });
  this.addChild(zoomInButton, true);
  // this.setIconTo_(zoomInButton, 'ac-zoom-in');
  this.buttonsWithIcons_.push(zoomInButton);

  var zoomOutMessage = this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.ZOOM_OUT);
  var zoomOutButton = new goog.ui.ToolbarButton(zoomOutMessage);
  zoomOutButton.addClassName(anychart.ui.GanttToolbar.CssClass.ZOOM_OUT);
  zoomOutButton.setModel({
    id: anychart.ui.GanttToolbar.ButtonIds.ZOOM_OUT,
    func: anychart.ui.GanttToolbar.ButtonIds.ZOOM_OUT,
    text: zoomOutMessage,
    icon: 'ac-zoom-out'
  });
  this.addChild(zoomOutButton, true);
  this.buttonsWithIcons_.push(zoomOutButton);

  var fitAllMessage = this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.FIT_ALL);
  var fitAllButton = new goog.ui.ToolbarButton(fitAllMessage);
  fitAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.FIT_ALL);
  fitAllButton.setModel({
    id: anychart.ui.GanttToolbar.ButtonIds.FIT_ALL,
    func: anychart.ui.GanttToolbar.ButtonIds.FIT_ALL,
    text: fitAllMessage,
    icon: 'ac-dot-square-o'
  });
  this.addChild(fitAllButton, true);
  this.buttonsWithIcons_.push(fitAllButton);

  // --------- EXPAND/COLLAPSE ----------
  this.addChild(new anychart.ui.toolbar.Separator(), true);

  var expandMessage = this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.EXPAND_ALL);
  var expandAllButton = new goog.ui.ToolbarButton(expandMessage);
  expandAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.EXPAND_ALL);
  expandAllButton.setModel({
    id: anychart.ui.GanttToolbar.ButtonIds.EXPAND_ALL,
    func: anychart.ui.GanttToolbar.ButtonIds.EXPAND_ALL,
    text: expandMessage,
    icon: 'ac-expand'
  });
  this.addChild(expandAllButton, true);
  this.buttonsWithIcons_.push(expandAllButton);

  var collapseMessage = this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.COLLAPSE_ALL);
  var collapseAllButton = new goog.ui.ToolbarButton(collapseMessage);
  collapseAllButton.addClassName(anychart.ui.GanttToolbar.CssClass.COLLAPSE_ALL);
  collapseAllButton.setModel({
    id: anychart.ui.GanttToolbar.ButtonIds.COLLAPSE_ALL,
    func: anychart.ui.GanttToolbar.ButtonIds.COLLAPSE_ALL,
    text: collapseMessage,
    icon: 'ac-collapse'
  });
  this.addChild(collapseAllButton, true);
  this.buttonsWithIcons_.push(collapseAllButton);
};


/**
 * Applies icons and texts based on ButtonsMode setting to toolbar buttons.
 * Affects only top level buttons, not the menus.
 */
anychart.ui.GanttToolbar.prototype.applyIconsAndTexts = function() {
  var button;
  for (var i = 0; i < this.buttonsWithIcons_.length; i++) {
    button = this.buttonsWithIcons_[i];
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
    button = this.subButtonsWithIcons_[i];
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
 * Call 'print' method of chart.
 *
 * @param {anychart.core.Chart} chart - Chart instance.
 * @param {string} format - Paper format.
 *
 * @private
 */
anychart.ui.GanttToolbar.prototype.printChart_ = function (chart, format) {
  var printRange = this.printState_.range;
  var isLandscapeLayout = this.printState_.layout == 'landscape';
  var args = [format, isLandscapeLayout];
  /*
    External print function is used in qlik to call custom gantt printing function.
    On DVF-4248 refactor this case should be considered. And Qlik code altered according to new api.
   */
  if (goog.isFunction(this.externalPrintFunction)) {
    args.push(printRange);
    this.externalPrintFunction.apply(null, goog.array.concat([chart], args));
    return;
  }

  if (chart) {
    var fn = chart['print'];
    if (goog.isFunction(fn)) {
      var visibleRange = chart.getTimeline().scale().getRange();
      if (printRange == anychart.ui.GanttToolbar.PRINT_RANGE_OPTIONS.FULL) {
        chart.fitAll();
      }
      fn.apply(chart, args);
      chart.zoomTo(visibleRange['min'], visibleRange['max']);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.TOOLBAR_METHOD_IS_NOT_DEFINED, null, ['print']);
    }
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.TOOLBAR_CHART_IS_NOT_SET);
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

  var args = model && model.args || [];
  var chart = /**@type {anychart.core.Chart|null}*/(this.target());

  if (funcName == anychart.ui.GanttToolbar.ButtonIds.PRINT) {
    this.printChart_(chart, args[0]);
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
};

/**
 * Remove paper size items from menu.
 *
 * @private
 */
anychart.ui.GanttToolbar.prototype.removePaperSizeItems_ = function() {
  /*
    0 - Layout options.
    1 - Print range options.
    2 - Separator.
   */
  var index = 3;
  while (this.printMenu_.getChildCount() > index) {
    this.printMenu_.removeChildAt(index, true);
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

    this.removePaperSizeItems_();

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
      var printItem = new anychart.ui.menu.Item(anychart.enums.normalizePaperSizeCaption(size));
      printItem.setModel({func: anychart.ui.GanttToolbar.ButtonIds.PRINT, args: [size]});
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
 * Returns localized caption for a button by it's id.
 * @param {anychart.ui.GanttToolbar.ButtonIds} buttonId
 * @return {string} Localized caption.
 */
anychart.ui.GanttToolbar.prototype.getLocalizedCaption = function(buttonId) {
  return anychart.format.getMessage(anychart.ui.GanttToolbar.ButtonCaptions[buttonId]);
};

/**
 * Change captions of print menu and menu items.
 *
 * @private
 */
anychart.ui.GanttToolbar.prototype.updatePrintMenuCaptions_ = function(){
  var layoutMenu = this.printMenu_.getChildAt(0);
  var rangeMenu = this.printMenu_.getChildAt(1);

  layoutMenu.setCaption(this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.CHANGE_LAYOUT));
  rangeMenu.setCaption(this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.CHANGE_RANGE));

  var landscapeItem = layoutMenu.getItemAt(0);
  var portraitItem = layoutMenu.getItemAt(1);

  landscapeItem.setCaption(this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.LANDSCAPE));
  portraitItem.setCaption(this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.PORTRAIT));

  var allDates = rangeMenu.getItemAt(0);
  var visibleDates = rangeMenu.getItemAt(1);

  allDates.setCaption(this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.ALL_DATES));
  visibleDates.setCaption(this.getLocalizedCaption(anychart.ui.GanttToolbar.ButtonIds.VISIBLE_DATES));
};


/**
 * Updates localized captions for all menu items and buttons according to current locale settings.
 * @return {anychart.ui.GanttToolbar}
 */
anychart.ui.GanttToolbar.prototype.updateLocalizedCaptions = function() {
  var buttons = this.buttonsWithIcons_;
  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    var buttonModel = button.getModel();
    var newContent = this.getLocalizedCaption(buttonModel.id);
    if (newContent) {
      button.setCaption(newContent);
      buttonModel.text = newContent;
    }
  }

  this.updatePrintMenuCaptions_();
  // We should call this method to make icons visible again.
  this.applyIconsAndTexts();

  return this;
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
  proto['updateLocalizedCaptions'] = proto.updateLocalizedCaptions;
})();
