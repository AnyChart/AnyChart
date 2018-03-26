goog.provide('anychart.ganttModule.DataGridButton');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.ui.NewButton');



/**
 * Collapse-expand button customization.
 * @param {anychart.ganttModule.DataGrid} dataGrid - Parent data grid.
 * @constructor
 * @extends {anychart.core.ui.NewButton}
 */
anychart.ganttModule.DataGridButton = function(dataGrid) {
  anychart.ganttModule.DataGridButton.base(this, 'constructor');

  /**
   * Own data grid.
   * @type {anychart.ganttModule.DataGrid}
   * @private
   */
  this.dataGrid_ = dataGrid;

  this.state = anychart.SettingsState.EXPANDED;
  this.internalState = anychart.SettingsState.EXPANDED;

  /**
   * Index of data item to be expanded/collapsed.
   * @type {number}
   * @private
   */
  this.dataItemIndex_ = -1;

  this.supportsEnabledSuspension = false;

  this.setParentEventTarget(this.dataGrid_);
};
goog.inherits(anychart.ganttModule.DataGridButton, anychart.core.ui.NewButton);


/**
 * Default button side.
 * @type {number}
 */
anychart.ganttModule.DataGridButton.DEFAULT_BUTTON_SIDE = 15;


/**
 * Gets/sets data item index.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.ganttModule.DataGridButton|number)} - Current value or itself for method chaining.
 */
anychart.ganttModule.DataGridButton.prototype.dataItemIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.dataItemIndex_ = opt_value;
    return this;
  }
  return this.dataItemIndex_;
};


//region --- Interactivity / Event handling
/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.handleMouseDown = goog.nullFunction;


/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.getMouseOutState = function() {
  return this.internalState;
};


/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.handleMouseClick = function(event) {
  if (this.isDisabled())
    return;

  if (this.handleBrowserEvent(event)) {
    var newState = (this.internalState == anychart.SettingsState.COLLAPSED ? anychart.SettingsState.EXPANDED : anychart.SettingsState.COLLAPSED);
    this.setState(newState);
    this.dataGrid_.collapseExpandItem(this.dataItemIndex_, this.isCollapsed());
    this.setState(anychart.SettingsState.HOVERED);
  }
};


/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.setState = function(state) {
  if (state != anychart.SettingsState.HOVERED)
    this.internalState = state;
  anychart.ganttModule.DataGridButton.base(this, 'setState', state);
};


//endregion
//region --- Infrastructure
/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.getStateSettingsResolveOrder = function() {
  return [this.state, this.internalState, anychart.SettingsState.NORMAL];
};


/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.createStateSettings = function() {
  anychart.ganttModule.DataGridButton.base(this, 'createStateSettings');

  this.expanded_ = new anychart.core.StateSettings(
      this,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_META_NORMAL,
      anychart.SettingsState.EXPANDED,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_OVERRIDE);

  this.collapsed_ = new anychart.core.StateSettings(
      this,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_META_NORMAL,
      anychart.SettingsState.COLLAPSED,
      anychart.core.ui.NewButton.STATE_DESCRIPTORS_OVERRIDE);

  this.stateToObjectMap[anychart.SettingsState.EXPANDED] = this.expanded_;
  this.stateToObjectMap[anychart.SettingsState.COLLAPSED] = this.collapsed_;
};


/**
 * Helper that checks collapsed state.
 * @return {boolean}
 */
anychart.ganttModule.DataGridButton.prototype.isCollapsed = function() {
  return this.internalState == anychart.SettingsState.COLLAPSED;
};


//endregion
//region --- Style states
/**
 * Expanded state settings.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.ganttModule.DataGridButton}
 */
anychart.ganttModule.DataGridButton.prototype.expanded = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.expanded_.setup(opt_value);
    return this;
  }
  return this.expanded_;
};


/**
 * Collapsed state settings.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.ganttModule.DataGridButton}
 */
anychart.ganttModule.DataGridButton.prototype.collapsed = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.collapsed_.setup(opt_value);
    return this;
  }
  return this.collapsed_;
};


//endregion
//region --- Serialization / Deserialization / Disposing
/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.serializeStates = function(json) {
  anychart.ganttModule.DataGridButton.base(this, 'serializeStates', json);
  delete json['pushed'];
  json['expanded'] = this.expanded_.serialize();
  json['collapsed'] = this.collapsed_.serialize();
};


/** @inheritDoc */
anychart.ganttModule.DataGridButton.prototype.setupStateSettings = function(config, isDefault) {
  anychart.ganttModule.DataGridButton.base(this, 'setupStateSettings', config, isDefault);
  var cfg = anychart.getFullTheme('defaultDataGrid.buttons');
  this.expanded_.setupInternal(isDefault, cfg['expanded']);
  this.collapsed_.setupInternal(isDefault, cfg['collapsed']);
};


//endregion
//region --- Exports
// exports
//(function() {
//  var proto = anychart.ganttModule.DataGridButton.prototype;
//  proto['expanded'] = proto.expanded;
//  proto['collapsed'] = proto.collapsed;
//})();
//endregion
