goog.provide('anychart.ui.chartEditor.group.Legend');

goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.select.Base');
goog.require('anychart.ui.chartEditor.settings.Title');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.Legend = function(model) {
  anychart.ui.chartEditor.group.Legend.base(this, 'constructor', model);

  this.setHeader('Legend');
  this.useEnabledButton(true);
  this.setKey('chart.legend()');
};
goog.inherits(anychart.ui.chartEditor.group.Legend, anychart.ui.chartEditor.group.Base);


/** @enum {string} */
anychart.ui.chartEditor.group.Legend.CssClass = {};


/** @override */
anychart.ui.chartEditor.group.Legend.prototype.setContentEnabled = function(enabled) {
  anychart.ui.chartEditor.group.Legend.base(this, 'setContentEnabled', enabled);

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
anychart.ui.chartEditor.group.Legend.prototype.disposeInternal = function() {
  this.itemsLayout_ = null;
  this.itemsOrientation_ = null;
  this.itemsAlign_ = null;
  this.title_ = null;
  this.items_ = null;
  anychart.ui.chartEditor.group.Legend.base(this, 'disposeInternal');
};


/** @override */
anychart.ui.chartEditor.group.Legend.prototype.createDom = function() {
  anychart.ui.chartEditor.group.Legend.base(this, 'createDom');
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

  var layoutSelect = new anychart.ui.chartEditor.select.Base();
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

  var orientationSelect = new anychart.ui.chartEditor.select.Base();
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

  var alignSelect = new anychart.ui.chartEditor.select.Base();
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

  var items = new anychart.ui.chartEditor.settings.Title();
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

  var title = new anychart.ui.chartEditor.settings.Title();
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
anychart.ui.chartEditor.group.Legend.prototype.update = function(model) {
  anychart.ui.chartEditor.group.Legend.base(this, 'update', model);

  this.itemsLayout_.update(model);
  this.itemsOrientation_.update(model);
  this.itemsAlign_.update(model);
  this.title_.update(model);
  this.items_.update(model);
};

