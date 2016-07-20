goog.provide('anychart.ui.chartEditor.events');
goog.require('goog.events');


/** @enum {string} */
anychart.ui.chartEditor.events.EventType = {
  CHANGE_STEP: goog.events.getUniqueId('change-step'),
  CLOSE: goog.events.getUniqueId('close'),
  ADD_SERIES: goog.events.getUniqueId('add-series'),
  REMOVE_SERIES: goog.events.getUniqueId('remove-series'),
  REMOVE_ALL_SERIES: goog.events.getUniqueId('remove-all-series'),
  SET_PRESET_TYPE: goog.events.getUniqueId('set-preset-type'),
  SET_SERIES_MAPPING: goog.events.getUniqueId('set-series-mapping'),
  SET_CHART_DATA: goog.events.getUniqueId('set-chart-data'),
  CHANGE_MODEL: goog.events.getUniqueId('change-model'),
  BUILD_CHART: goog.events.getUniqueId('build-chart'),
  UPDATE_EDITOR: goog.events.getUniqueId('update')
};
