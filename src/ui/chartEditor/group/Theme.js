goog.provide('anychart.ui.chartEditor.group.Theme');

goog.require('anychart.ui.chartEditor.events');
goog.require('anychart.ui.chartEditor.group.Base');
goog.require('anychart.ui.chartEditor.select.Base');

goog.require('goog.array');
goog.require('goog.ui.Component');



/**
 * @param {anychart.ui.chartEditor.steps.Base.Model} model
 * @constructor
 * @extends {anychart.ui.chartEditor.group.Base}
 */
anychart.ui.chartEditor.group.Theme = function(model) {
  anychart.ui.chartEditor.group.Theme.base(this, 'constructor', model);

  this.setHeader('General Theming');
};
goog.inherits(anychart.ui.chartEditor.group.Theme, anychart.ui.chartEditor.group.Base);


/**
 * @typedef {{
 *   name: string,
 *   value: Object
 * }}
 */
anychart.ui.chartEditor.group.Theme.Theme;


/**
 * @typedef {{
 *   name: string,
 *   value: Array.<string>
 * }}
 */
anychart.ui.chartEditor.group.Theme.Palette;


/** @type {Array.<anychart.ui.chartEditor.group.Theme.Theme>} */
anychart.ui.chartEditor.group.Theme.themes = null;


/** @type {Array.<anychart.ui.chartEditor.group.Theme.Palette>} */
anychart.ui.chartEditor.group.Theme.palettes = null;


/**
 * @type {anychart.ui.chartEditor.select.Base}
 * @private
 */
anychart.ui.chartEditor.group.Theme.prototype.themeSelect_ = null;


/**
 * @type {anychart.ui.chartEditor.select.Base}
 * @private
 */
anychart.ui.chartEditor.group.Theme.prototype.paletteSelect_ = null;


/** @inheritDoc */
anychart.ui.chartEditor.group.Theme.prototype.disposeInternal = function() {
  this.themeSelect_ = null;
  this.paletteSelect_ = null;
  anychart.ui.chartEditor.group.Theme.base(this, 'disposeInternal');
};


/** @private */
anychart.ui.chartEditor.group.Theme.parseThemes_ = function() {
  if (!anychart.ui.chartEditor.group.Theme.themes) {
    anychart.ui.chartEditor.group.Theme.themes = [];
    var name, theme;
    var ns = window['anychart']['themes'];
    for (var i in ns) {
      if (i == 'merging') continue;
      name = goog.string.toTitleCase(i.replace(/([A-Z])/g, ' $1').toLowerCase());
      theme = ns[i];
      anychart.ui.chartEditor.group.Theme.themes.push({name: name, value: theme});
    }
  }
};


/** @private */
anychart.ui.chartEditor.group.Theme.parsePalettes_ = function() {
  if (!anychart.ui.chartEditor.group.Theme.palettes) {
    anychart.ui.chartEditor.group.Theme.palettes = [];
    var ns = window['anychart']['palettes'];
    var name, palette;
    for (var i in ns) {
      palette = ns[i];
      if (goog.isArray(palette)) {
        name = goog.string.toTitleCase(i.replace(/([A-Z])/g, ' $1').toLowerCase());
        anychart.ui.chartEditor.group.Theme.palettes.push({name: name, value: palette});
      }
    }
  }
};


/** @inheritDoc */
anychart.ui.chartEditor.group.Theme.prototype.createDom = function() {
  anychart.ui.chartEditor.group.Theme.base(this, 'createDom');

  anychart.ui.chartEditor.group.Theme.parseThemes_();
  anychart.ui.chartEditor.group.Theme.parsePalettes_();

  var i, count, option, theme, palette;
  var themes = anychart.ui.chartEditor.group.Theme.themes;
  var palettes = anychart.ui.chartEditor.group.Theme.palettes;
  var contentElement = this.getContentElement();

  var themeLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Theme');
  goog.dom.appendChild(contentElement, themeLabel);

  var themeOptions = [];
  var themeCaptions = [];
  var themeSelect = new anychart.ui.chartEditor.select.Base('Select theme');
  themeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-big'));
  themeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  for (i = 0, count = themes.length; i < count; i++) {
    theme = /** @type {anychart.ui.chartEditor.group.Theme.Theme} */(themes[i]);
    themeOptions.push(theme.value);
    themeCaptions.push(theme.name);
  }
  themeSelect.setOptions(themeOptions);
  themeSelect.setCaptions(themeCaptions);
  themeSelect.render(contentElement);


  goog.dom.appendChild(contentElement, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var paletteLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Palette');
  goog.dom.appendChild(contentElement, paletteLabel);

  var paletteOptions = [];
  var paletteCaptions = [];
  var paletteSelect = new anychart.ui.chartEditor.select.Base('Select palette');
  paletteSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-big'));
  paletteSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  for (i = 0, count = palettes.length; i < count; i++) {
    palette = /** @type {anychart.ui.chartEditor.group.Theme.Theme} */(palettes[i]);
    paletteOptions.push(palette.value);
    paletteCaptions.push(palette.name);
  }
  paletteSelect.setOptions(paletteOptions);
  paletteSelect.setCaptions(paletteCaptions);
  paletteSelect.render(contentElement);


  this.themeSelect_ = themeSelect;
  this.paletteSelect_ = paletteSelect;
};


/** @inheritDoc */
anychart.ui.chartEditor.group.Theme.prototype.enterDocument = function() {
  anychart.ui.chartEditor.group.Theme.base(this, 'enterDocument');
  goog.events.listen(this.themeSelect_, goog.ui.Component.EventType.CHANGE, this.onThemeSelectChange_, false, this);
  goog.events.listen(this.paletteSelect_, goog.ui.Component.EventType.CHANGE, this.onPaletteSelectChange_, false, this);
};


/** @inheritDoc */
anychart.ui.chartEditor.group.Theme.prototype.exitDocument = function() {
  goog.events.unlisten(this.themeSelect_, goog.ui.Component.EventType.CHANGE, this.onThemeSelectChange_, false, this);
  goog.events.unlisten(this.paletteSelect_, goog.ui.Component.EventType.CHANGE, this.onPaletteSelectChange_, false, this);
  anychart.ui.chartEditor.group.Theme.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.ui.chartEditor.group.Theme.prototype.update = function() {
  var i, count;
  var themes = anychart.ui.chartEditor.group.Theme.themes;
  var palettes = anychart.ui.chartEditor.group.Theme.palettes;
  var chart = this.model.chart;

  // update theme
  var win = goog.dom.getWindow();
  var ac = win['anychart'];
  var appliedTheme = ac['theme']();
  var themeSelectedIndex = -1;

  for (i = 0, count = themes.length; i < count; i++) {
    var theme = /** @type {anychart.ui.chartEditor.group.Theme.Theme} */(themes[i]);
    if (theme.value == appliedTheme) {
      themeSelectedIndex = i;
      break;
    }
  }

  // update palette
  var isPaletteSupported = chart['palette'];
  var paletteSelectedIndex = -1;
  var paletteVisible = false;

  if (isPaletteSupported) {
    var appliedPalette = chart['palette']();
    if (appliedPalette) {
      for (i = 0, count = palettes.length; i < count; i++) {
        var palette = /** @type {anychart.ui.chartEditor.group.Theme.Palette} */(palettes[i]);
        if (goog.array.equals(palette.value, appliedPalette.items())) {
          paletteSelectedIndex = i;
          break;
        }
      }
    }
    paletteVisible = true;
  }

  //todo: rework, need silently update selects
  goog.events.unlisten(this.themeSelect_, goog.ui.Component.EventType.CHANGE, this.onThemeSelectChange_, false, this);
  goog.events.unlisten(this.paletteSelect_, goog.ui.Component.EventType.CHANGE, this.onPaletteSelectChange_, false, this);
  this.themeSelect_.setSelectedIndex(themeSelectedIndex);
  this.paletteSelect_.setSelectedIndex(paletteSelectedIndex);
  this.paletteSelect_.setVisible(paletteVisible);
  goog.events.listen(this.themeSelect_, goog.ui.Component.EventType.CHANGE, this.onThemeSelectChange_, false, this);
  goog.events.listen(this.paletteSelect_, goog.ui.Component.EventType.CHANGE, this.onPaletteSelectChange_, false, this);
};


/**
 * @param {goog.events.Event} evt
 * @private
 */
anychart.ui.chartEditor.group.Theme.prototype.onThemeSelectChange_ = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this.dispatchEvent({
    type: anychart.ui.chartEditor.events.EventType.CHANGE_MODEL,
    key: 'anychart.theme()',
    value: evt.target.getSelectedItem().getModel(),
    rebuild: true
  });
  this.dispatchEvent(anychart.ui.chartEditor.events.EventType.UPDATE_EDITOR);
};


/**
 * @param {goog.events.Event} evt
 * @private
 */
anychart.ui.chartEditor.group.Theme.prototype.onPaletteSelectChange_ = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this.dispatchEvent({
    type: anychart.ui.chartEditor.events.EventType.CHANGE_MODEL,
    key: 'chart.palette()',
    value: evt.target.getSelectedItem().getModel()
  });
  this.dispatchEvent(anychart.ui.chartEditor.events.EventType.UPDATE_EDITOR);
};
