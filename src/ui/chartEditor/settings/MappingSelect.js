goog.provide('anychart.ui.chartEditor.settings.MappingSelect');

goog.require('anychart.ui.chartEditor.select.Base');



/**
 * @constructor
 * @extends {anychart.ui.chartEditor.select.Base}
 */
anychart.ui.chartEditor.settings.MappingSelect = function() {
  anychart.ui.chartEditor.settings.MappingSelect.base(this, 'constructor');
};
goog.inherits(anychart.ui.chartEditor.settings.MappingSelect, anychart.ui.chartEditor.select.Base);


/**
 * @type {string}
 * @private
 */
anychart.ui.chartEditor.settings.MappingSelect.prototype.mappingId_ = '0';


/** @param {string} value */
anychart.ui.chartEditor.settings.MappingSelect.prototype.setMappingId = function(value) {
  this.mappingId_ = value;
};


/** @inheritDoc */
anychart.ui.chartEditor.settings.MappingSelect.prototype.update = function(model) {
  //todo: rework, need silently update selects
  goog.events.unlisten(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);

  var seriesData = model.seriesMappings[this.mappingId_];
  var mapping = seriesData.mapping;
  this.setSelectedIndex(mapping);

  goog.events.listen(this, goog.ui.Component.EventType.CHANGE, this.onChange, false, this);
};


/** @inheritDoc */
anychart.ui.chartEditor.settings.MappingSelect.prototype.onChange = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this.dispatchEvent({
    type: anychart.ui.chartEditor.events.EventType.SET_SERIES_MAPPING,
    id: this.mappingId_,
    value: this.getSelectedItem().getModel(),
    rebuild: true
  });
};
