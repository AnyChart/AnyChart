goog.provide('anychart.chartEditorModule.settings.MappingSelect');

goog.require('anychart.chartEditorModule.select.Base');



/**
 * @constructor
 * @extends {anychart.chartEditorModule.select.Base}
 */
anychart.chartEditorModule.settings.MappingSelect = function() {
  anychart.chartEditorModule.settings.MappingSelect.base(this, 'constructor');
};
goog.inherits(anychart.chartEditorModule.settings.MappingSelect, anychart.chartEditorModule.select.Base);


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.MappingSelect.prototype.mappingId_ = '0';


/** @param {string} value */
anychart.chartEditorModule.settings.MappingSelect.prototype.setMappingId = function(value) {
  this.mappingId_ = value;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.MappingSelect.prototype.update = function(model) {
  //todo: rework, need silently update selects
  goog.events.unlisten(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);

  var seriesData = model.seriesMappings[this.mappingId_];
  var mapping = seriesData.mapping;
  this.setSelectedIndex(mapping);

  goog.events.listen(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.MappingSelect.prototype.onChange = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this.dispatchEvent({
    type: anychart.chartEditorModule.events.EventType.SET_SERIES_MAPPING,
    id: this.mappingId_,
    value: this.getSelectedItem().getModel(),
    rebuild: true
  });
};
