goog.provide('anychart.chartEditorModule.group.Legend');

goog.require('anychart.chartEditorModule.group.Base');
goog.require('anychart.chartEditorModule.select.Base');
goog.require('anychart.chartEditorModule.settings.Title');



/**
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @constructor
 * @extends {anychart.chartEditorModule.group.Base}
 */
anychart.chartEditorModule.group.Legend = function(model) {
  anychart.chartEditorModule.group.Legend.base(this, 'constructor', model);

  this.setHeader('Legend');
  this.useEnabledButton(true);
  this.setKey('chart.legend()');
};
goog.inherits(anychart.chartEditorModule.group.Legend, anychart.chartEditorModule.group.Base);


/** @enum {string} */
anychart.chartEditorModule.group.Legend.CssClass = {};


/** @override */
anychart.chartEditorModule.group.Legend.prototype.setContentEnabled = function(enabled) {
  anychart.chartEditorModule.group.Legend.base(this, 'setContentEnabled', enabled);

  if (this.itemsHeader_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.itemsHeader_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.layoutLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.layoutLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.orientationLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.orientationLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.alignLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.alignLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }
};


/** @override */
anychart.chartEditorModule.group.Legend.prototype.disposeInternal = function() {
  this.itemsLayout_ = null;
  this.itemsOrientation_ = null;
  this.itemsAlign_ = null;
  this.title_ = null;
  this.items_ = null;
  anychart.chartEditorModule.group.Legend.base(this, 'disposeInternal');
};


/** @override */
anychart.chartEditorModule.group.Legend.prototype.createDom = function() {
  anychart.chartEditorModule.group.Legend.base(this, 'createDom');
  var content = this.getContentElement();

  var itemsHeader = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-header'),
      'Appearance');
  goog.dom.appendChild(content, itemsHeader);

  //region Layout
  var layoutLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Layout');
  goog.dom.appendChild(content, layoutLabel);

  var layoutSelect = new anychart.chartEditorModule.select.Base();
  layoutSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  layoutSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  layoutSelect.setOptions(['horizontal', 'vertical']);
  layoutSelect.setCaptions(['Horizontal', 'Vertical']);
  layoutSelect.setKey('chart.legend().itemsLayout()');
  this.addChild(layoutSelect, true);
  //endregion

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  //region Orientation
  var orientationLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Orientation');
  goog.dom.appendChild(content, orientationLabel);

  var orientationSelect = new anychart.chartEditorModule.select.Base();
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  orientationSelect.setOptions(['left', 'right', 'top', 'bottom']);
  orientationSelect.setCaptions(['Left', 'Right', 'Top', 'Bottom']);
  orientationSelect.setKey('chart.legend().position()');
  this.addChild(orientationSelect, true);
  //endregion

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  //region Align
  var alignLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Align');
  goog.dom.appendChild(content, alignLabel);

  var alignSelect = new anychart.chartEditorModule.select.Base();
  alignSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  alignSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  alignSelect.setOptions(['left', 'center', 'right']);
  alignSelect.setCaptions(['Left', 'Center', 'Right']);
  alignSelect.setKey('chart.legend().align()');
  this.addChild(alignSelect, true);
  //endregion

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var items = new anychart.chartEditorModule.settings.Title();
  items.allowEnabled(false);
  items.allowEditTitle(false);
  items.allowEditPosition(false);
  items.allowEditAlign(false);
  items.allowEditColor(false);
  items.setKey(this.getKey());
  this.addChild(items, true);

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var title = new anychart.chartEditorModule.settings.Title();
  title.setKey('chart.legend().title()');
  title.setPositionKey('orientation()');
  this.addChild(title, true);

  this.itemsLayout_ = layoutSelect;
  this.itemsOrientation_ = orientationSelect;
  this.itemsAlign_ = alignSelect;
  this.title_ = title;
  this.items_ = items;

  this.itemsHeader_ = itemsHeader;
  this.layoutLabel_ = layoutLabel;
  this.orientationLabel_ = orientationLabel;
  this.alignLabel_ = alignLabel;
};


/** @override */
anychart.chartEditorModule.group.Legend.prototype.update = function(model) {
  anychart.chartEditorModule.group.Legend.base(this, 'update', model);

  this.itemsLayout_.update(model);
  this.itemsOrientation_.update(model);
  this.itemsAlign_.update(model);
  this.title_.update(model);
  this.items_.update(model);
};

