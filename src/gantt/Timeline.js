goog.provide('anychart.ganttModule.TimeLine');
goog.provide('anychart.standalones.ProjectTimeline');
goog.provide('anychart.standalones.ResourceTimeline');

goog.require('acgraph.vector.Path');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.ganttModule.BaseGrid');
goog.require('anychart.ganttModule.Scale');
goog.require('anychart.ganttModule.ScrollBar');
goog.require('anychart.ganttModule.TimelineHeader');
goog.require('anychart.ganttModule.axisMarkers.Line');
goog.require('anychart.ganttModule.axisMarkers.Range');
goog.require('anychart.ganttModule.axisMarkers.Text');
goog.require('anychart.math.Rect');
goog.require('goog.array');
goog.require('goog.fx.Dragger');



/**
 * Gantt timeline implementation.
 * @param {anychart.ganttModule.Controller=} opt_controller - Controller to be set. See full description in parent class.
 * @param {boolean=} opt_isResources - Flag if TL must have a controller that works in 'Resources' mode.
 * @constructor
 * @extends {anychart.ganttModule.BaseGrid}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.ganttModule.TimeLine = function(opt_controller, opt_isResources) {
  anychart.ganttModule.TimeLine.base(this, 'constructor', opt_controller, opt_isResources);

  /**
   * Cell border settings.
   * NOTE: This field differs from DG's columnStroke_ and its setter has another functionality
   * and invalidates another states.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.columnStroke_;

  /**
   * Labels factory.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labelsFactory_ = null;

  /**
   * Labels factory.
   * @type {anychart.core.ui.MarkersFactory}
   * @private
   */
  this.markersFactory_ = null;

  /**
   * Separation path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.separationPath_ = null;

  /**
   * Edit preview path.
   * @type {anychart.ganttModule.TimeLine.LiveEditControl}
   * @private
   */
  this.editPreviewPath_ = null;

  /**
   * Edit progress path.
   * @type {anychart.ganttModule.TimeLine.LiveEditControl}
   * @private
   */
  this.editProgressPath_ = null;

  /**
   * Edit left thumb path.
   * @type {anychart.ganttModule.TimeLine.LiveEditControl}
   * @private
   */
  this.editLeftThumbPath_ = null;

  /**
   * Edit right thumb path.
   * @type {anychart.ganttModule.TimeLine.LiveEditControl}
   * @private
   */
  this.editRightThumbPath_ = null;

  /**
   * Edit start connector path.
   * @type {anychart.ganttModule.TimeLine.LiveEditControl}
   * @private
   */
  this.editStartConnectorPath_ = null;

  /**
   * Edit finish connector path.
   * @type {anychart.ganttModule.TimeLine.LiveEditControl}
   * @private
   */
  this.editFinishConnectorPath_ = null;


  /**
   * Edit connector preview path.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.editConnectorPreviewPath_ = null;

  /**
   * Tooltip enabled state storage.
   * @type {boolean|undefined}
   * @private
   */
  this.tooltipEnabledBackup_;


  /**
   * Edit connector preview stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.connectorPreviewStroke_;

  /**
   * Edit preview fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editPreviewFill_;

  /**
   * Edit preview stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editPreviewStroke_;

  /**
   * Edit progress fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editProgressFill_;

  /**
   * Edit progress stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editProgressStroke_;

  /**
   * Edit interval thumb fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editIntervalThumbFill_;

  /**
   * Edit interval thumb stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editIntervalThumbStroke_;

  /**
   * Edit connector thumb fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.editConnectorThumbFill_;

  /**
   * Edit connector thumb stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.editConnectorThumbStroke_;

  /**
   * Base fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.baseFill_;

  /**
   * Base stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.baseStroke_;

  /**
   * Baseline fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.baselineFill_;

  /**
   * Base stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.baselineStroke_;

  /**
   * Progress fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.progressFill_;

  /**
   * Progress stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.progressStroke_;


  /**
   * Milestone fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.milestoneFill_;

  /**
   * milestone stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.milestoneStroke_;


  /**
   * Parent fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.parentFill_;


  /**
   * Parent stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.parentStroke_;


  /**
   * Selected element fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.selectedElementFill_;


  /**
   * Selected element stroke.
   * @type {!acgraph.vector.Stroke}
   * @private
   */
  this.selectedElementStroke_;


  /**
   * Selected element stroke.
   * @type {!acgraph.vector.Stroke}
   * @private
   */
  this.selectedConnectorStroke_;


  /**
   * Connector arrow fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.connectorFill_;


  /**
   * Connector line stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.connectorStroke_;

  /**
   * Selected period.
   * @type {(string|number|undefined)}
   * @private
   */
  this.selectedPeriodId_ = void 0;

  /**
   * Information about currently selected connector.
   * Connector can't be characterized by it's path, but can be defined by elements that it connects.
   * @type {Object}
   * @private
   */
  this.selectedConnectorData_ = null;

  /**
   * This value sets to ID of hovered item when mouse moves over the bar of item on timeline
   * in live edit mode.
   * It is used to correctly remove live edit controls on hovered row change.
   * @type {number|string|undefined}
   * @private
   */
  this.lastHoveredBarItemId_ = void 0;

  /**
   * This value sets to index of hovered period when mouse moves over the bar of item on timeline
   * in live edit mode.
   * It is used to correctly remove live edit controls on hovered row change.
   * @type {number}
   * @private
   */
  this.lastHoveredPeriodIndex_ = NaN;

  /**
   * Whether baseline bar must be placed above the actual interval bar.
   * @type {boolean}
   * @private
   */
  this.baselineAbove_ = false;

  /**
   *
   * @type {boolean}
   */
  this.redrawHeader = false;

  /**
   * Edit preview dragger.
   * @type {anychart.ganttModule.TimeLine.BarDragger}
   * @private
   */
  this.editPreviewDragger_ = null;

  /**
   * Edit progress dragger.
   * @type {anychart.ganttModule.TimeLine.ProgressDragger}
   * @private
   */
  this.editProgressDragger_ = null;

  /**
   * Edit left thumb dragger.
   * @type {anychart.ganttModule.TimeLine.ThumbDragger}
   * @private
   */
  this.editLeftThumbDragger_ = null;

  /**
   * Edit right thumb dragger.
   * @type {anychart.ganttModule.TimeLine.ThumbDragger}
   * @private
   */
  this.editRightThumbDragger_ = null;

  /**
   * Edit start connector dragger.
   * @type {anychart.ganttModule.TimeLine.ConnectorDragger}
   * @private
   */
  this.editStartConnectorDragger_ = null;

  /**
   * Edit finish connector dragger.
   * @type {anychart.ganttModule.TimeLine.ConnectorDragger}
   * @private
   */
  this.editFinishConnectorDragger_ = null;

  /**
   * Whether we are dragging the connector.
   * @type {boolean}
   */
  this.draggingConnector = false;

  /**
   * Whether we are dragging the progress.
   * @type {boolean}
   */
  this.draggingProgress = false;

  /**
   * Whether we are dragging the preview.
   * @type {boolean}
   */
  this.draggingPreview = false;

  /**
   * Whether we are dragging the thumb.
   * @type {anychart.ganttModule.TimeLine.ThumbDragger}
   * @private
   */
  this.currentThumbDragger_ = null;

  /**
   * Whether we are dragging the connector circle.
   * @type {anychart.ganttModule.TimeLine.ConnectorDragger}
   * @private
   */
  this.currentConnectorDragger_ = null;

  /**
   * Timeline visual elements.
   * @type {Array.<anychart.ganttModule.BaseGrid.Element>}
   * @private
   */
  this.visElements_ = [];

  /**
   * Number of used visual elements.
   * @type {number}
   * @private
   */
  this.visElementsInUse_ = 0;

  /**
   * @type {Array.<anychart.ganttModule.axisMarkers.Line>}
   * @private
   */
  this.lineMarkers_ = [];

  /**
   * @type {Array.<anychart.ganttModule.axisMarkers.Range>}
   * @private
   */
  this.rangeMarkers_ = [];

  /**
   * @type {Array.<anychart.ganttModule.axisMarkers.Text>}
   * @private
   */
  this.textMarkers_ = [];

  /**
   * Hovered connector data.
   * We use it to correctly dispatch connector mouse out event.
   * @type {?Object}
   * @private
   */
  this.hoveredConnector_ = null;

  /**
   *
   * @type {anychart.enums.MarkerType}
   * @private
   */
  this.editStartConnectorMarkerType_;

  /**
   *
   * @type {number}
   * @private
   */
  this.editStartConnectorMarkerSize_;

  /**
   *
   * @type {number}
   * @private
   */
  this.editStartConnectorMarkerHorizontalOffset_;

  /**
   *
   * @type {number}
   * @private
   */
  this.editStartConnectorMarkerVerticalOffset_;

  /**
   *
   * @type {anychart.enums.MarkerType}
   * @private
   */
  this.editFinishConnectorMarkerType_;

  /**
   *
   * @type {number}
   * @private
   */
  this.editFinishConnectorMarkerSize_;

  /**
   *
   * @type {number}
   * @private
   */
  this.editFinishConnectorMarkerHorizontalOffset_;

  /**
   *
   * @type {number}
   * @private
   */
  this.editFinishConnectorMarkerVerticalOffset_;

  /**
   *
   * @type {number}
   * @private
   */
  this.editIntervalWidth_;

  /**
   * Date time scale.
   * @type {anychart.ganttModule.Scale}
   * @private
   */
  this.scale_ = new anychart.ganttModule.Scale();
  this.scale_.listenSignals(this.scaleInvalidated_, this);
  this.registerDisposable(this.scale_);

  /**
   * Base bar labels settings.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.baseLabels_ = null;

  /**
   * Baseline bar labels settings.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.baselineLabels_ = null;

  /**
   * Grouping task bar labels settings.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.parentLabels_ = null;

  /**
   * Milestone labels settings.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.milestoneLabels_ = null;

  /**
   * Progress labels settings.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.progressLabels_ = null;


  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    //Base bar
    ['baseBarHeight',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['baseBarAnchor',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['baseBarPosition',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['baseBarOffset',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],

    //Parent bar
    ['parentBarHeight',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['parentBarAnchor',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['parentBarPosition',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['parentBarOffset',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],

    //Baseine bar
    ['baselineBarHeight',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['baselineBarAnchor',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['baselineBarPosition',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['baselineBarOffset',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],

    //Progress bar
    ['progressBarHeight',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['progressBarAnchor',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['progressBarPosition',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['progressBarOffset',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],

    //Milestones
    ['milestoneHeight',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['milestoneAnchor',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['milestonePosition',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW],
    ['milestoneOffset',
      anychart.ConsistencyState.GRIDS_POSITION,
      anychart.Signal.NEEDS_REDRAW]
  ]);

  this.controller.timeline(this);
};
goog.inherits(anychart.ganttModule.TimeLine, anychart.ganttModule.BaseGrid);


/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.TimeLine.SUPPORTED_SIGNALS = anychart.ganttModule.BaseGrid.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistence states.
 * @type {number}
 */
anychart.ganttModule.TimeLine.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ganttModule.BaseGrid.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TIMELINE_SCALES;


//region -- Normalisers adaptation
/**
 * Timeline specific anchor normalizer.
 * @param {*} value - Value to normalize.
 * @return {?anychart.enums.Anchor}
 */
anychart.ganttModule.TimeLine.normalizeAnchor = function(value) {
  if (goog.isNull(value))
    return null;

  value = anychart.enums.normalizeAnchor(value, anychart.enums.Anchor.LEFT_CENTER);
  if (value == anychart.enums.Anchor.AUTO)
    return anychart.enums.Anchor.AUTO;
  if (anychart.utils.isTopAnchor(value))
    return anychart.enums.Anchor.LEFT_TOP;
  if (anychart.utils.isBottomAnchor(value))
    return anychart.enums.Anchor.LEFT_BOTTOM;
  return anychart.enums.Anchor.LEFT_CENTER;
};


/**
 * Timeline specific position normalizer.
 * @param {*} value - Value to normalize.
 * @return {?anychart.enums.Position}
 */
anychart.ganttModule.TimeLine.normalizePosition = function(value) {
  if (goog.isNull(value))
    return null;

  value = /** @type {anychart.enums.Anchor} */ (anychart.enums.normalizePosition(value, anychart.enums.Position.LEFT_CENTER));
  if (anychart.utils.isTopAnchor(value))
    return anychart.enums.Position.LEFT_TOP;
  if (anychart.utils.isBottomAnchor(value))
    return anychart.enums.Position.LEFT_BOTTOM;
  return anychart.enums.Position.LEFT_CENTER;
};


/**
 * Implements option inheritance from base bar settings.
 * @param {string} name - .
 * @param {string} defaultName - .
 * @return {*}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getInheritedOption_ = function(name, defaultName) {
  var val = this.getOption(name);
  return /** @type {anychart.enums.Anchor} */ (goog.isDefAndNotNull(val) ? val : this.getOption(defaultName));
};


/**
 *
 * @param {number} anchoredTop
 * @param {number} barHeight
 * @param {anychart.enums.Anchor} anchor
 * @private
 * @return {number}
 */
anychart.ganttModule.TimeLine.prototype.fixBarTop_ = function(anchoredTop, barHeight, anchor) {
  var verticalOffset;
  if (anychart.utils.isTopAnchor(anchor))
    verticalOffset = 0;
  else if (anychart.utils.isBottomAnchor(anchor))
    verticalOffset = -barHeight;
  else
    verticalOffset = -barHeight / 2;

  return anchoredTop + verticalOffset;
};


/**
 * Resolves anchor by position and bar type.
 * NOTE: anychart.enums.TLElementTypes.BASE here is the same as anychart.enums.TLElementTypes.BASE.
 * @param {anychart.enums.Position} position - Position.
 * @param {anychart.enums.TLElementTypes} type - Timeline element type.
 * @param {boolean=} opt_considerBaseline - Whether to consider baseline.
 * @return {anychart.enums.Anchor}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.resolveAutoAnchorByType_ = function(position, type, opt_considerBaseline) {
  var anchor = /** @type {anychart.enums.Anchor} */ (position);
  switch (type) {
    case anychart.enums.TLElementTypes.BASE:
      if (opt_considerBaseline && position == anychart.enums.Position.LEFT_CENTER) {
        anchor = this.baselineAbove() ? anychart.enums.Anchor.LEFT_TOP : anychart.enums.Anchor.LEFT_BOTTOM;
      }
      break;
    case anychart.enums.TLElementTypes.PARENT:
      anchor = anychart.utils.isTopAnchor(/** @type {anychart.enums.Anchor} */ (position)) ?
          anychart.enums.Anchor.LEFT_TOP :
          anychart.enums.Anchor.LEFT_BOTTOM;
      if (opt_considerBaseline && position == anychart.enums.Position.LEFT_CENTER) {
        anchor = this.baselineAbove() ? anychart.enums.Anchor.LEFT_TOP : anychart.enums.Anchor.LEFT_BOTTOM;
      }
      break;
    case anychart.enums.TLElementTypes.BASELINE:
      if (position == anychart.enums.Position.LEFT_CENTER)
        anchor = this.baselineAbove() ? anychart.enums.Anchor.LEFT_BOTTOM : anychart.enums.Anchor.LEFT_TOP;
  }

  return /** @type {anychart.enums.Anchor} */ (anchor);
};


//endregion
//region -- Descriptors.
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.TimeLine.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  //Base bar
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baseBarHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baseBarAnchor',
      anychart.ganttModule.TimeLine.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baseBarPosition',
      anychart.ganttModule.TimeLine.normalizePosition);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baseBarOffset',
      anychart.core.settings.numberOrPercentNormalizer);

  //Parent bar
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'parentBarHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'parentBarAnchor',
      anychart.ganttModule.TimeLine.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'parentBarPosition',
      anychart.ganttModule.TimeLine.normalizePosition);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'parentBarOffset',
      anychart.core.settings.numberOrPercentNormalizer);

  //Baseline bar
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baselineBarHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baselineBarAnchor',
      anychart.ganttModule.TimeLine.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baselineBarPosition',
      anychart.ganttModule.TimeLine.normalizePosition);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'baselineBarOffset',
      anychart.core.settings.numberOrPercentNormalizer);

  //Progress bar
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'progressBarHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'progressBarAnchor',
      anychart.ganttModule.TimeLine.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'progressBarPosition',
      anychart.ganttModule.TimeLine.normalizePosition);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'progressBarOffset',
      anychart.core.settings.numberOrPercentNormalizer);

  //Milestones
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'milestoneHeight',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'milestoneAnchor',
      anychart.ganttModule.TimeLine.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'milestonePosition',
      anychart.ganttModule.TimeLine.normalizePosition);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'milestoneOffset',
      anychart.core.settings.numberOrPercentNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.TimeLine, anychart.ganttModule.TimeLine.DESCRIPTORS);


//endregion
/**
 * Default timeline header height.
 * @type {number}
 */
anychart.ganttModule.TimeLine.DEFAULT_HEADER_HEIGHT = 70;


/**
 * Baseline path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.BASELINE_Z_INDEX = 10;


/**
 * Base path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.BASE_Z_INDEX = 20;


/**
 * Progress path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.PROGRESS_Z_INDEX = 30;


/**
 * labels factory z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.LABEL_Z_INDEX = 40;


/**
 * Marker factory z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.MARKER_Z_INDEX = 50;


/**
 * Connector z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.CONNECTOR_Z_INDEX = 60;


/**
 * Connector arrow z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.ARROW_Z_INDEX = 70;


/**
 * Timeline header z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.HEADER_Z_INDEX = 80;


/**
 * Arrow margin.
 * @type {number}
 */
anychart.ganttModule.TimeLine.ARROW_MARGIN = 5;


/**
 * Arrow size.
 * @type {number}
 */
anychart.ganttModule.TimeLine.ARROW_SIZE = 4;


/**
 * This constant means that bar will have height = DEFAULT_HEIGHT_REDUCTION * this.height;
 * @type {number}
 */
anychart.ganttModule.TimeLine.DEFAULT_HEIGHT_REDUCTION = 0.7;


/**
 * Edit preview path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_PREVIEW_Z_INDEX = 0;


/**
 * Edit progress path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_PROGRESS_Z_INDEX = 10;


/**
 * Edit left thumb path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_LEFT_THUMB_Z_INDEX = 20;


/**
 * Edit right thumb path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_RIGHT_THUMB_Z_INDEX = 30;


/**
 * Edit start connector path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_START_CONNECTOR_Z_INDEX = 40;


/**
 * Edit finish connector path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_FINISH_CONNECTOR_Z_INDEX = 50;


/**
 * Edit connector preview path z-index.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_CONNECTOR_PREVIEW_Z_INDEX = 60;


/**
 * Pixel height of edit corner.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT = 5;


/**
 * Pixel width of edit-interval-thumb.
 * @type {number}
 */
anychart.ganttModule.TimeLine.EDIT_CONNECTOR_RADIUS = 5;


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.scaleInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION)) {
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets timeline's gantt date time scale.
 * @return {anychart.ganttModule.Scale} - Scale.
 */
anychart.ganttModule.TimeLine.prototype.getScale = function() {
  return this.scale_;
};


/**
 * Gets/configures timeline header.
 * @param {Object=} opt_value - Config.
 * @return {anychart.ganttModule.TimelineHeader|anychart.ganttModule.TimeLine} - Header or itself for chaining..
 */
anychart.ganttModule.TimeLine.prototype.header = function(opt_value) {
  if (!this.header_) {
    this.header_ = new anychart.ganttModule.TimelineHeader();
    this.header_.scale(this.scale_);
    this.header_.zIndex(anychart.ganttModule.TimeLine.HEADER_Z_INDEX);
    this.registerDisposable(this.header_);
    this.header_.listenSignals(this.headerInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.header_.setup(opt_value);
    return this;
  } else {
    return this.header_;
  }
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Signal event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.headerInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Gets/sets a connector preview stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.connectorPreviewStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.connectorPreviewStroke_, val)) {
      this.connectorPreviewStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorPreviewStroke_ || 'none';
};


/**
 * Gets/sets edit preview fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editPreviewFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editPreviewFill_), val)) {
      this.editPreviewFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editPreviewFill_ || 'none';
};


/**
 * Gets/sets a edit preview stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.editPreviewStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editPreviewStroke_, val)) {
      this.editPreviewStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editPreviewStroke_ || 'none';
};


/**
 * Gets/sets edit progress fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editProgressFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editProgressFill_), val)) {
      this.editProgressFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editProgressFill_ || 'none';
};


/**
 * Gets/sets a edit progress stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.editProgressStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editProgressStroke_, val)) {
      this.editProgressStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editProgressStroke_ || 'none';
};


/**
 * Gets/sets edit interval thumb fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editIntervalThumbFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editIntervalThumbFill_), val)) {
      this.editIntervalThumbFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editIntervalThumbFill_ || 'none';
};


/**
 * Gets/sets a edit interval thumb stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.editIntervalThumbStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editIntervalThumbStroke_, val)) {
      this.editIntervalThumbStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editIntervalThumbStroke_ || 'none';
};


/**
 * Gets/sets edit connector thumb fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editConnectorThumbFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.editConnectorThumbFill_), val)) {
      this.editConnectorThumbFill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editConnectorThumbFill_ || 'none';
};


/**
 * Gets/sets a edit connector thumb stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.editConnectorThumbStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.editConnectorThumbStroke_, val)) {
      this.editConnectorThumbStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.editConnectorThumbStroke_ || 'none';
};


/**
 * Gets/sets base fill.
 * Base fill is a fill of simple time bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baseFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.baseFill_), val)) {
      this.baseFill_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baseFill_ || 'none';
};


/**
 * Gets/sets a base stroke.
 * Base stroke is a stroke of simple time bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.baseStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.baseStroke_, val)) {
      this.baseStroke_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baseStroke_ || 'none';
};


/**
 * Gets/sets baseline fill.
 * Baseline fill is a fill of baseline bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.baselineFill_), val)) {
      this.baselineFill_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baselineFill_ || 'none';
};


/**
 * Gets/sets a baseline stroke.
 * Baseline stroke is a stroke of baseline bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.baselineStroke_, val)) {
      this.baselineStroke_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.baselineStroke_ || 'none';
};


/**
 * Gets/sets progress bar fill.
 * Progress fill is a fill of progress bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.progressFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.progressFill_), val)) {
      this.progressFill_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.progressFill_ || 'none';
};


/**
 * Gets/sets a progress bar stroke.
 * Progress stroke is a stroke of progress bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.progressStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.progressStroke_, val)) {
      this.progressStroke_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.progressStroke_ || 'none';
};


/**
 * Gets/sets a milestone fill.
 * Milestone fill is a fill of milestone on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.milestoneFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.milestoneFill_), val)) {
      this.milestoneFill_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.milestoneFill_ || 'none';
};


/**
 * Gets/sets a milestone stroke.
 * Milestone stroke is a stroke of milestone on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.milestoneStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.milestoneStroke_, val)) {
      this.milestoneStroke_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.milestoneStroke_ || 'none';
};


/**
 * Gets/sets a parent fill.
 * Parent fill is a fill of summary (parent) task bar on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.parentFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.parentFill_), val)) {
      this.parentFill_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.parentFill_ || 'none';
};


/**
 * Gets/sets a parent stroke.
 * Parent stroke is a stroke of summary (parent) task bar on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.parentStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.parentStroke_, val)) {
      this.parentStroke_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.parentStroke_ || 'none';
};


/**
 * Gets/sets a connector arrow fill.
 * Connector fill is a fill of arrow of connector on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.connectorFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.connectorFill_), val)) {
      this.connectorFill_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorFill_ || 'none';
};


/**
 * Gets/sets a connector stroke.
 * Connector stroke is a stroke of connector's line on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.connectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.connectorStroke_, val)) {
      this.connectorStroke_ = val;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.connectorStroke_ || 'none';
};


/**
 * Gets/sets selected element fill.
 * Selected element fill is fill of selected element (whole data item or period) on timeline.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.ganttModule.TimeLine|string} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.selectedElementFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(/** @type {acgraph.vector.Fill} */ (this.selectedElementFill_), val)) {
      this.selectedElementFill_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedElementFill_ || 'none';
};


/**
 * Gets/sets selected element stroke.
 * Selected element stroke is stroke of selected element (whole data item or period) on timeline.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.selectedElementStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.selectedElementStroke_, val)) {
      this.selectedElementStroke_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedElementStroke_ || 'none';
};


/**
 * Gets/sets selected connector stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {acgraph.vector.Stroke|anychart.ganttModule.TimeLine|string} - Current value or itself for chaining.
 */
anychart.ganttModule.TimeLine.prototype.selectedConnectorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(this.selectedConnectorStroke_, val)) {
      this.selectedConnectorStroke_ = val;
      this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.selectedConnectorStroke_ || 'none';
};


/**
 * Gets/sets column stroke.
 * @param {(acgraph.vector.Stroke|string)=} opt_value - Value to be set.
 * @return {(string|acgraph.vector.Stroke|anychart.ganttModule.TimeLine)} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.columnStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);

    //TODO (A.Kudryavtsev): In current moment (15 June 2015) method anychart.color.equals works pretty bad.
    //TODO (A.Kudryavtsev): That's why here I check thickness as well.
    var oldThickness = anychart.utils.extractThickness(this.columnStroke_);
    var newThickness = anychart.utils.extractThickness(val);

    if (!anychart.color.equals(this.columnStroke_, val) || newThickness != oldThickness) {
      this.columnStroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.columnStroke_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Axes markers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for line marker default settings.
 * @param {Object=} opt_value - Object with line marker settings.
 * @return {Object}
 */
anychart.ganttModule.TimeLine.prototype.defaultLineMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultLineMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultLineMarkerSettings_ || {};
};


/**
 * Getter/setter for range marker default settings.
 * @param {Object=} opt_value - Object with range marker settings.
 * @return {Object}
 */
anychart.ganttModule.TimeLine.prototype.defaultRangeMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultRangeMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultRangeMarkerSettings_ || {};
};


/**
 * Getter/setter for text marker default settings.
 * @param {Object=} opt_value - Object with text marker settings.
 * @return {Object}
 */
anychart.ganttModule.TimeLine.prototype.defaultTextMarkerSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.defaultTextMarkerSettings_ = opt_value;
    return this;
  }
  return this.defaultTextMarkerSettings_ || {};
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue - Line marker settings to set.
 * @param {(Object|boolean|null|anychart.enums.GanttDateTimeMarkers)=} opt_value - Line marker settings to set.
 * @return {!(anychart.ganttModule.axisMarkers.Line|anychart.ganttModule.TimeLine)} - Line marker instance by index or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var lineMarker = this.lineMarkers_[index];
  if (!lineMarker) {
    lineMarker = new anychart.ganttModule.axisMarkers.Line(this.scale_);
    lineMarker.setup(this.defaultLineMarkerSettings());
    this.lineMarkers_[index] = lineMarker;
    this.registerDisposable(lineMarker);
    lineMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue - Range marker settings to set.
 * @param {(Object|boolean|null|anychart.enums.GanttDateTimeMarkers)=} opt_value - Range marker settings to set.
 * @return {!(anychart.ganttModule.axisMarkers.Range|anychart.ganttModule.TimeLine)} - Range marker instance by index or
 *  itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var rangeMarker = this.rangeMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = new anychart.ganttModule.axisMarkers.Range(this.scale_);
    rangeMarker.setup(this.defaultRangeMarkerSettings());
    this.rangeMarkers_[index] = rangeMarker;
    this.registerDisposable(rangeMarker);
    rangeMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue - Text marker settings to set.
 * @param {(Object|boolean|null|anychart.enums.GanttDateTimeMarkers)=} opt_value - Text marker settings to set.
 * @return {!(anychart.ganttModule.axisMarkers.Text|anychart.ganttModule.TimeLine)} - Text marker instance by index or itself for chaining call.
 */
anychart.ganttModule.TimeLine.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var textMarker = this.textMarkers_[index];
  if (!textMarker) {
    textMarker = new anychart.ganttModule.axisMarkers.Text(this.scale_);
    textMarker.setup(this.defaultTextMarkerSettings());
    this.textMarkers_[index] = textMarker;
    this.registerDisposable(textMarker);
    textMarker.listenSignals(this.onMarkersSignal_, this);
    this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    textMarker.setup(value);
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Listener for markers invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.onMarkersSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.TIMELINE_SCALES, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Labels factory getter/setter.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.LabelsFactory} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.labels = function(opt_value) {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_.setParentEventTarget(this);
    this.labelsFactory_.listenSignals(this.drawLabels_, this);
  }

  if (goog.isDef(opt_value)) {
    var redraw = true;
    if (anychart.utils.instanceOf(opt_value, anychart.core.ui.LabelsFactory)) {
      this.labelsFactory_.setup(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.labelsFactory_.setup(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.labelsFactory_.enabled(false);
    } else {
      redraw = false;
    }
    if (redraw) {
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return this.labelsFactory_;
};


/**
 * Getter/setter for base labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.ganttModule.TimeLine)} - Labels instance or itself for chaining call.
 */
anychart.ganttModule.TimeLine.prototype.baseLabels = function(opt_value) {
  if (!this.baseLabels_) {
    this.baseLabels_ = new anychart.core.ui.LabelsFactory();
    this.baseLabels_.listenSignals(this.drawLabels_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.baseLabels_.setup(opt_value);
    return this;
  }
  return this.baseLabels_;
};


/**
 * Getter/setter for baseline labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.ganttModule.TimeLine)} - Labels instance or itself for chaining call.
 */
anychart.ganttModule.TimeLine.prototype.baselineLabels = function(opt_value) {
  if (!this.baselineLabels_) {
    this.baselineLabels_ = new anychart.core.ui.LabelsFactory();
    this.baselineLabels_.listenSignals(this.drawLabels_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.baselineLabels_.setup(opt_value);
    return this;
  }
  return this.baselineLabels_;
};


/**
 * Getter/setter for parent (grouping tasks) labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.ganttModule.TimeLine)} - Labels instance or itself for chaining call.
 */
anychart.ganttModule.TimeLine.prototype.parentLabels = function(opt_value) {
  if (!this.parentLabels_) {
    this.parentLabels_ = new anychart.core.ui.LabelsFactory();
    this.parentLabels_.listenSignals(this.drawLabels_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.parentLabels_.setup(opt_value);
    return this;
  }
  return this.parentLabels_;
};


/**
 * Getter/setter for milestone labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.ganttModule.TimeLine)} - Labels instance or itself for chaining call.
 */
anychart.ganttModule.TimeLine.prototype.milestoneLabels = function(opt_value) {
  if (!this.milestoneLabels_) {
    this.milestoneLabels_ = new anychart.core.ui.LabelsFactory();
    this.milestoneLabels_.listenSignals(this.drawLabels_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.milestoneLabels_.setup(opt_value);
    return this;
  }
  return this.milestoneLabels_;
};


/**
 * Getter/setter for progress labels.
 * @param {(Object|boolean|null)=} opt_value - Settings.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.ganttModule.TimeLine)} - Labels instance or itself for chaining call.
 */
anychart.ganttModule.TimeLine.prototype.progressLabels = function(opt_value) {
  if (!this.progressLabels_) {
    this.progressLabels_ = new anychart.core.ui.LabelsFactory();
    this.progressLabels_.listenSignals(this.drawLabels_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.progressLabels_.setup(opt_value);
    return this;
  }
  return this.progressLabels_;
};


/**
 * Markers factory getter/setter.
 * @param {Object=} opt_value - Value to be set.
 * @return {anychart.ganttModule.TimeLine|anychart.core.ui.MarkersFactory} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.markers = function(opt_value) {
  if (!this.markersFactory_) {
    this.markersFactory_ = new anychart.core.ui.MarkersFactory();
    this.markersFactory_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    var redraw = true;
    if (anychart.utils.instanceOf(opt_value, anychart.core.ui.MarkersFactory)) {
      this.markersFactory_.setup(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.markersFactory_.setup(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.markersFactory_.enabled(false);
    } else {
      redraw = false;
    }
    if (redraw) {
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }

  return this.markersFactory_;
};


/**
 * Gets/sets 'baseline above' flag.
 * If the flag is set to 'true', baseline bar will be displayed abode an actual time bar.
 * @param {boolean=} opt_value - Value to be set.
 * @return {boolean|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.baselineAbove = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.baselineAbove_ != opt_value) {
      this.baselineAbove_ = opt_value;
      this.invalidate(anychart.ConsistencyState.GRIDS_POSITION, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }
  return this.baselineAbove_;
};


/**
 * Getter for this.separationPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getSeparationPath_ = function() {
  if (!this.separationPath_) {
    this.separationPath_ = /** @type {acgraph.vector.Path} */ (this.getClipLayer().path());
    this.separationPath_.zIndex(6);
    this.separationPath_.stroke(this.columnStroke_);
    this.registerDisposable(this.separationPath_);
  }
  return this.separationPath_;
};


/**
 * Getter for this.editPreviewPath_.
 * @return {anychart.ganttModule.TimeLine.LiveEditControl}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditPreviewPath_ = function() {
  if (!this.editPreviewPath_) {
    this.editPreviewPath_ = new anychart.ganttModule.TimeLine.LiveEditControl(this.getEditLayer());
    this.editPreviewPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_PREVIEW_Z_INDEX)
        .cursor(acgraph.vector.Cursor.EW_RESIZE);

    this.eventsHandler.listen(this.editPreviewPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editPreviewPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editPreviewDragMouseDown_, false, this);

    this.registerDisposable(this.editPreviewPath_);
  }
  return this.editPreviewPath_;
};


/**
 * Getter for this.editProgressPath_.
 * @return {anychart.ganttModule.TimeLine.LiveEditControl}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditProgressPath_ = function() {
  if (!this.editProgressPath_) {
    this.editProgressPath_ = new anychart.ganttModule.TimeLine.LiveEditControl(this.getEditLayer());
    this.editProgressPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_PROGRESS_Z_INDEX);

    this.eventsHandler.listen(this.editProgressPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editProgressPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editProgressDragMouseDown_, false, this);

    this.registerDisposable(this.editProgressPath_);
  }
  return this.editProgressPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {anychart.ganttModule.TimeLine.LiveEditControl}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditLeftThumbPath_ = function() {
  if (!this.editLeftThumbPath_) {
    this.editLeftThumbPath_ = new anychart.ganttModule.TimeLine.LiveEditControl(this.getEditLayer());
    this.editLeftThumbPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_LEFT_THUMB_Z_INDEX)
        .cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize')); //TODO (A.Kudryavtsev): Kind of crossbrowser issue?

    this.editLeftThumbPath_.preview = this.getEditPreviewPath_();

    this.eventsHandler.listen(this.editLeftThumbPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editLeftThumbPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editLeftThumbDragMouseDown_, false, this);

    this.registerDisposable(this.editLeftThumbPath_);
  }
  return this.editLeftThumbPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {anychart.ganttModule.TimeLine.LiveEditControl}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditRightThumbPath_ = function() {
  if (!this.editRightThumbPath_) {
    this.editRightThumbPath_ = new anychart.ganttModule.TimeLine.LiveEditControl(this.getEditLayer());
    this.editRightThumbPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_RIGHT_THUMB_Z_INDEX)
        .cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize')); //TODO (A.Kudryavtsev): Kind of crossbrowser issue?

    this.editRightThumbPath_.preview = this.getEditPreviewPath_();

    this.eventsHandler.listen(this.editRightThumbPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editRightThumbPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editRightThumbDragMouseDown_, false, this);

    this.registerDisposable(this.editRightThumbPath_);
  }
  return this.editRightThumbPath_;
};


/**
 * Getter for this.editStartConnectorPath_.
 * @return {anychart.ganttModule.TimeLine.LiveEditControl}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditStartConnectorPath_ = function() {
  if (!this.editStartConnectorPath_) {
    this.editStartConnectorPath_ = new anychart.ganttModule.TimeLine.LiveEditControl(this.getEditLayer());
    this.editStartConnectorPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_START_CONNECTOR_Z_INDEX)
        .cursor(acgraph.vector.Cursor.MOVE);

    this.eventsHandler.listen(this.editStartConnectorPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editStartConnectorPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editStartConnectorMouseDown_, false, this);

    this.registerDisposable(this.editStartConnectorPath_);
  }
  return this.editStartConnectorPath_;
};


/**
 * Getter for this.editLeftThumbPath_.
 * @return {anychart.ganttModule.TimeLine.LiveEditControl}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditFinishConnectorPath_ = function() {
  if (!this.editFinishConnectorPath_) {
    this.editFinishConnectorPath_ = new anychart.ganttModule.TimeLine.LiveEditControl(this.getEditLayer());
    this.editFinishConnectorPath_
        .zIndex(anychart.ganttModule.TimeLine.EDIT_FINISH_CONNECTOR_Z_INDEX)
        .cursor(acgraph.vector.Cursor.MOVE);

    this.eventsHandler.listen(this.editFinishConnectorPath_, acgraph.events.EventType.MOUSEDOWN, function(e) {
      e.stopPropagation();
    });

    this.editFinishConnectorPath_.listenOnce(acgraph.events.EventType.MOUSEDOWN, this.editFinishConnectorMouseDown_, false, this);

    this.registerDisposable(this.editFinishConnectorPath_);
  }
  return this.editFinishConnectorPath_;
};


/**
 * Gets/sets start edit connector control type.
 * @param {anychart.enums.MarkerType=} opt_value - Value to set.
 * @return {anychart.enums.MarkerType|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editStartConnectorMarkerType_ = opt_value;
    return this;
  }
  return this.editStartConnectorMarkerType_;
};


/**
 * Gets/sets start edit connector control size.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editStartConnectorMarkerSize_ = opt_value;
    return this;
  }
  return this.editStartConnectorMarkerSize_;
};


/**
 * Gets/sets start edit connector control horizontal offset.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerHorizontalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editStartConnectorMarkerHorizontalOffset_ = opt_value;
    return this;
  }
  return this.editStartConnectorMarkerHorizontalOffset_;
};


/**
 * Gets/sets start edit connector control vertical offset.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMarkerVerticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editStartConnectorMarkerVerticalOffset_ = opt_value;
    return this;
  }
  return this.editStartConnectorMarkerVerticalOffset_;
};


/**
 * Gets/sets finish edit connector control type.
 * @param {anychart.enums.MarkerType=} opt_value - Value to set.
 * @return {anychart.enums.MarkerType|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editFinishConnectorMarkerType_ = opt_value;
    return this;
  }
  return this.editFinishConnectorMarkerType_;
};


/**
 * Gets/sets finish edit connector control size.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editFinishConnectorMarkerSize_ = opt_value;
    return this;
  }
  return this.editFinishConnectorMarkerSize_;
};


/**
 * Gets/sets finish edit connector control horizontal offset.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerHorizontalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editFinishConnectorMarkerHorizontalOffset_ = opt_value;
    return this;
  }
  return this.editFinishConnectorMarkerHorizontalOffset_;
};


/**
 * Gets/sets finish edit connector control vertical offset.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMarkerVerticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editFinishConnectorMarkerVerticalOffset_ = opt_value;
    return this;
  }
  return this.editFinishConnectorMarkerVerticalOffset_;
};


/**
 * Gets/sets interval edit control width.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.ganttModule.TimeLine} - Current value or itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.editIntervalWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.editIntervalWidth_ = opt_value;
    return this;
  }
  return this.editIntervalWidth_;
};


/**
 * Getter for this.editConnectorPreviewPath_.
 * @return {acgraph.vector.Path}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getEditConnectorPreviewPath_ = function() {
  if (!this.editConnectorPreviewPath_) {
    this.editConnectorPreviewPath_ = /** @type {acgraph.vector.Path} */ (this.getEditLayer().path());
    this.editConnectorPreviewPath_
        .stroke(this.connectorPreviewStroke_)
        .zIndex(anychart.ganttModule.TimeLine.EDIT_CONNECTOR_PREVIEW_Z_INDEX);

    this.registerDisposable(this.editConnectorPreviewPath_);
  }
  return this.editConnectorPreviewPath_;
};


/**
 * Clears edit controls.
 * @param {boolean=} opt_ignoreTooltip - Whether to try to restore tooltip visibility.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.clearEdit_ = function(opt_ignoreTooltip) {
  //This conditions allow to avoid multiple path operations.
  if (!this.getEditPreviewPath_().isEmpty())
    this.getEditPreviewPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  if (!this.getEditProgressPath_().isEmpty())
    this.getEditProgressPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  if (!this.getEditRightThumbPath_().isEmpty())
    this.getEditRightThumbPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  if (!this.getEditLeftThumbPath_().isEmpty())
    this.getEditLeftThumbPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  if (!this.getEditFinishConnectorPath_().isEmpty())
    this.getEditFinishConnectorPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  if (!this.getEditStartConnectorPath_().isEmpty())
    this.getEditStartConnectorPath_().clear().setTransformationMatrix(1, 0, 0, 1, 0, 0);
  if (!this.getEditConnectorPreviewPath_().isEmpty())
    this.getEditConnectorPreviewPath_().clear();

  if (!opt_ignoreTooltip) {
    this.tooltip().enabled(this.tooltipEnabledBackup_);
    this.tooltipEnabledBackup_ = void 0;
  }
};


/**
 * Drag preview mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewDragMouseDown_ = function(e) {
  this.editPreviewDragger_ = new anychart.ganttModule.TimeLine.BarDragger(this.getEditPreviewPath_());
  this.registerDisposable(this.editPreviewDragger_);

  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.START, this.editPreviewDragStart_, false, this);
  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editPreviewDrag_, false, this);
  this.editPreviewDragger_.listen(goog.fx.Dragger.EventType.END, this.editPreviewEnd_, false, this);
  this.editPreviewDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag progress mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDragMouseDown_ = function(e) {
  this.editProgressDragger_ = new anychart.ganttModule.TimeLine.ProgressDragger(this.getEditProgressPath_());
  this.registerDisposable(this.editProgressDragger_);

  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.START, this.editProgressDragStart_, false, this);
  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editProgressDrag_, false, this);
  this.editProgressDragger_.listen(goog.fx.Dragger.EventType.END, this.editProgressDragEnd_, false, this);
  this.editProgressDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag left thumb mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editLeftThumbDragMouseDown_ = function(e) {
  this.editLeftThumbDragger_ = new anychart.ganttModule.TimeLine.ThumbDragger(this.getEditLeftThumbPath_(), true);
  this.registerDisposable(this.editLeftThumbDragger_);

  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.START, this.editLeftThumbDragStart_, false, this);
  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
  this.editLeftThumbDragger_.listen(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  this.editLeftThumbDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag right thumb mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editRightThumbDragMouseDown_ = function(e) {
  this.editRightThumbDragger_ = new anychart.ganttModule.TimeLine.ThumbDragger(this.getEditRightThumbPath_(), false);
  this.registerDisposable(this.editRightThumbDragger_);

  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.START, this.editRightThumbDragStart_, false, this);
  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editThumbDrag_, false, this);
  this.editRightThumbDragger_.listen(goog.fx.Dragger.EventType.END, this.editThumbDragEnd_, false, this);
  this.editRightThumbDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag start connector mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editStartConnectorMouseDown_ = function(e) {
  this.editStartConnectorDragger_ = new anychart.ganttModule.TimeLine.ConnectorDragger(this, this.getEditStartConnectorPath_(), true);
  this.registerDisposable(this.editStartConnectorDragger_);

  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
  this.editStartConnectorDragger_.listen(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  this.editStartConnectorDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Drag finish connector mouse down handler.
 * Initializes drag events.
 * @param {acgraph.events.BrowserEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editFinishConnectorMouseDown_ = function(e) {
  this.editFinishConnectorDragger_ = new anychart.ganttModule.TimeLine.ConnectorDragger(this, this.getEditFinishConnectorPath_(), false);
  this.registerDisposable(this.editFinishConnectorDragger_);

  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.START, this.editConnectorDragStart_, false, this);
  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.DRAG, this.editConnectorDrag_, false, this);
  this.editFinishConnectorDragger_.listen(goog.fx.Dragger.EventType.END, this.editConnectorDragEnd_, false, this);
  this.editFinishConnectorDragger_.startDrag(e.getOriginalEvent());
};


/**
 * Edit preview drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.interactivityHandler.highlight();
  this.getEditProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(anychart.document['body'], 'cursor', acgraph.vector.Cursor.EW_RESIZE);
};


/**
 * Edit preview drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
  this.draggingPreview = true;
};


/**
 * Edit preview drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editPreviewEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    var draggedBounds = this.getEditPreviewPath_().getBounds();

    this.clearEdit_();

    var dragger = e.target;
    var el = /** @type {anychart.ganttModule.TimeLine.LiveEditControl} */ (dragger.element);
    var dataItem = el.item;
    var tree = this.controller.data();//this.controller.data() can be Tree or TreeView.

    tree.suspendSignalsDispatching();

    var newActualStartRatio = (el.type == anychart.enums.TLElementTypes.MILESTONE) ?
        ((draggedBounds.left + draggedBounds.width / 2 - this.pixelBoundsCache.left) / (this.pixelBoundsCache.width)) :
        ((draggedBounds.left - this.pixelBoundsCache.left) / (this.pixelBoundsCache.width));
    var newActualStart = this.scale_.ratioToTimestamp(newActualStartRatio);

    /*
      This check is for rare case:
      Sometimes we can get NaN values by some unknown factors that I can't catch and reproduce (drag issues?).
      This condition prevents setting NaN values.
     */
    if (!isNaN(newActualStart)) {
      var delta = 0;

      switch (el.type) {
        case anychart.enums.TLElementTypes.MILESTONE:
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
          dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
          if (goog.isDef(dataItem.get(anychart.enums.GanttDataFields.ACTUAL_END))) {
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newActualStart);
            dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END, newActualStart);
          }
          break;
        case anychart.enums.TLElementTypes.PERIOD:
          var periodIndex = el.periodIndex;
          var periodStart = /** @type {number} */ (dataItem.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START));
          var periodEnd = dataItem.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END);
          delta = newActualStart - periodStart;
          var newPeriodEnd = periodEnd + delta;
          if (!isNaN(newPeriodEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newActualStart);
            dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newActualStart);
            dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newPeriodEnd);
            dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newPeriodEnd);
          }
          break;
        case anychart.enums.TLElementTypes.BASELINE:
          var baselineStart = /** @type {number} */ (dataItem.meta(anychart.enums.GanttDataFields.BASELINE_START));
          var baselineEnd = dataItem.meta(anychart.enums.GanttDataFields.BASELINE_END);
          delta = newActualStart - baselineStart;
          var newBaselineEnd = baselineEnd + delta;
          if (!isNaN(newBaselineEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.BASELINE_START, newActualStart);
            dataItem.meta(anychart.enums.GanttDataFields.BASELINE_START, newActualStart);
          }
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_END, baselineEnd + delta);
          dataItem.meta(anychart.enums.GanttDataFields.BASELINE_END, baselineEnd + delta);
          break;
        default:
          var actualStart = /** @type {number} */ ((goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START)) ?
              dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START) :
              dataItem.meta('autoStart')));

          var actualEnd = goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END)) ?
              dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END) :
              dataItem.meta('autoEnd');
          delta = newActualStart - actualStart;
          var newActualEnd = actualEnd + delta;
          if (!isNaN(newActualEnd)) {
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
            dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START, newActualStart);
            dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newActualEnd);
            dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END, newActualEnd);
          }
      }
    }


    tree.resumeSignalsDispatching(true);

    this.initScale();

    this.dragging = false;
    this.draggingPreview = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }
  goog.style.setStyle(anychart.document['body'], 'cursor', ''); //TODO (A.Kudryavtsev): Do we reset old CSS cursor here?
};


/**
 * Edit progress drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.draggingProgress = true;
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();
  this.getEditPreviewPath_().clear();
};


/**
 * Edit progress drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
};


/**
 * Edit progress drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editProgressDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);

    this.clearEdit_();

    var dragger = e.target;
    var el = dragger.element;
    if (!isNaN(dragger.progress)) {
      var prog = anychart.math.round(dragger.progress * 100) + '%';
      el.item.set(anychart.enums.GanttDataFields.PROGRESS_VALUE, prog);
    }
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
    this.draggingProgress = false;
  }
};


/**
 * Edit thumb drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editRightThumbDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.getEditProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(anychart.document['body'], 'cursor', 'col-resize');
  this.editPreviewPath_.cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize'));
};


/**
 * Edit thumb drag start handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editLeftThumbDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
  this.getEditProgressPath_().clear();
  this.getEditLeftThumbPath_().clear();
  this.getEditRightThumbPath_().clear();
  this.getEditStartConnectorPath_().clear();
  this.getEditFinishConnectorPath_().clear();

  goog.style.setStyle(anychart.document['body'], 'cursor', 'col-resize');
  this.editPreviewPath_.cursor(/** @type {acgraph.vector.Cursor} */ ('col-resize'));

};


/**
 * Draws thumb preview.
 * @param {goog.fx.DragEvent} event - Event.
 * @param {number=} opt_scrolling - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawThumbPreview_ = function(event, opt_scrolling) {
  if (this.currentThumbDragger_) {
    var path = this.currentThumbDragger_.isLeft ? this.editLeftThumbPath_ : this.editRightThumbPath_;

    var item = path.item;
    var type = path.type;
    var periodIndex = path.periodIndex;
    var bounds = path.bounds;

    var time;

    switch (type) {
      case anychart.enums.TLElementTypes.BASELINE:
        time = this.currentThumbDragger_.isLeft ?
            item.meta(anychart.enums.GanttDataFields.BASELINE_END) :
            item.meta(anychart.enums.GanttDataFields.BASELINE_START);
        break;
      case anychart.enums.TLElementTypes.PERIOD:
        time = this.currentThumbDragger_.isLeft ?
            item.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END) :
            item.getMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START);
        break;
      default:
        if (this.currentThumbDragger_.isLeft) {
          time = goog.isNumber(item.meta(anychart.enums.GanttDataFields.ACTUAL_END)) ?
              item.meta(anychart.enums.GanttDataFields.ACTUAL_END) :
              item.meta('autoEnd');
        } else {
          time = goog.isNumber(item.meta(anychart.enums.GanttDataFields.ACTUAL_START)) ?
              item.meta(anychart.enums.GanttDataFields.ACTUAL_START) :
              item.meta('autoStart');
        }
    }

    var left = this.container().getStage().getClientPosition().x;

    var mouseLeft;
    if (opt_scrolling) {
      mouseLeft = opt_scrolling < 0 ? this.pixelBoundsCache.left : this.pixelBoundsCache.left + this.pixelBoundsCache.width;
    } else {
      mouseLeft = event.clientX - left;
    }

    var ratio = this.scale_.timestampToRatio(time);
    var ratioLeft = this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio;

    this.editPreviewPath_
        .clear()
        .moveTo(ratioLeft, bounds.top)
        .lineTo(mouseLeft, bounds.top)
        .lineTo(mouseLeft, bounds.top + bounds.height)
        .lineTo(ratioLeft, bounds.top + bounds.height)
        .close();
  }
};


/**
 * Draws connector preview.
 * @param {goog.fx.DragEvent} event - Event.
 * @param {number=} opt_scrollOffsetX - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @param {number=} opt_scrollOffsetY - Negative value means scrolling left, otherwise is scrolling right. Zero is not a scrolling.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawConnectorPreview_ = function(event, opt_scrollOffsetX, opt_scrollOffsetY) {
  //TODO (A.Kudryavtsev): In DVF-1809 case this.currentConnectorDragger_ can remain not null. Check it carefully!
  if (this.currentConnectorDragger_ && this.dragging) {
    var circle = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

    var index = circle.index;
    var period = circle.period;
    var periodIndex = circle.periodIndex;

    var containerPosition = this.container().getStage().getClientPosition();
    var containerLeft = containerPosition.x;
    var containerTop = containerPosition.y;

    var mouseLeft, mouseTop;

    if (opt_scrollOffsetX || opt_scrollOffsetY) { //Whether we draw it all on scolling when mouse is actually not moving.
      mouseLeft = this.currentConnectorDragger_.lastTrackedMouseX - containerLeft;
      mouseTop = this.currentConnectorDragger_.lastTrackedMouseY - containerTop;
    } else {
      mouseLeft = event.clientX - containerLeft;
      mouseTop = event.clientY - containerTop;
    }

    var initItemsBounds = this.getItemBounds_(index, period, periodIndex);

    var previewThickness = anychart.utils.extractThickness(this.connectorPreviewStroke_);
    var pixelShift = (previewThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

    var startLeft = this.currentConnectorDragger_.isStart ? initItemsBounds.left : initItemsBounds.left + initItemsBounds.width;
    var startTop = initItemsBounds.top + initItemsBounds.height / 2 + pixelShift;

    this.getEditConnectorPreviewPath_()
        .clear()
        .moveTo(startLeft, startTop)
        .lineTo(mouseLeft, mouseTop);
  }
};


/**
 * Edit thumb drag handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editThumbDrag_ = function(e) {
  this.dragging = true;
  this.interactive = false;
  this.currentThumbDragger_ = /** @type {anychart.ganttModule.TimeLine.ThumbDragger} */ (e.target);
  this.drawThumbPreview_(e);
};


/**
 * Edit thumb drag end handler.
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editThumbDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    var dragPreviewBounds = this.editPreviewPath_.getBounds();

    this.clearEdit_();

    var dragger = e.target;
    var el = dragger.element;
    var dataItem = el.item;
    var periodIndex = el.periodIndex;
    var tree = this.controller.data();//this.controller.data() can be Tree or TreeView.

    tree.suspendSignalsDispatching();

    var left = dragPreviewBounds.left;
    var right = dragPreviewBounds.left + dragPreviewBounds.width;
    var leftRatio = (left - this.pixelBoundsCache.left) / this.pixelBoundsCache.width;
    var rightRatio = (right - this.pixelBoundsCache.left) / this.pixelBoundsCache.width;
    var newStart = this.scale_.ratioToTimestamp(leftRatio);
    var newEnd = this.scale_.ratioToTimestamp(rightRatio);

    if (!isNaN(newStart) && !isNaN(newEnd)) {
      switch (el.type) {
        case anychart.enums.TLElementTypes.PERIOD:
          dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newStart);
          dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newEnd);
          dataItem.setMeta(anychart.enums.GanttDataFields.PERIODS, periodIndex, anychart.enums.GanttDataFields.END, newEnd);
          break;
        case anychart.enums.TLElementTypes.BASELINE:
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_START, newStart);
          dataItem.meta(anychart.enums.GanttDataFields.BASELINE_START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.BASELINE_END, newEnd);
          dataItem.meta(anychart.enums.GanttDataFields.BASELINE_END, newEnd);
          break;
        default:
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_START, newStart);
          dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START, newStart);
          dataItem.set(anychart.enums.GanttDataFields.ACTUAL_END, newEnd);
          dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END, newEnd);
      }
    }

    tree.resumeSignalsDispatching(true);
    this.initScale();

    this.currentThumbDragger_ = null;
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }

  goog.style.setStyle(anychart.document['body'], 'cursor', '');
  this.editPreviewPath_.cursor(acgraph.vector.Cursor.EW_RESIZE);
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editConnectorDragStart_ = function(e) {
  if (this.scrollDragger) this.scrollDragger.setEnabled(false);
  this.interactivityHandler.highlight();
  this.currentConnectorDragger_ = /** @type {anychart.ganttModule.TimeLine.ConnectorDragger} */ (e.target);
  this.clearEdit_();
  this.tooltipEnabledBackup_ = /** @type {boolean} */ (this.tooltip().enabled());
  this.tooltip().hide();
  this.tooltip().enabled(false);
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editConnectorDrag_ = function(e) {
  this.dragging = true;
  this.draggingConnector = true;
  this.interactive = false;
  this.currentConnectorDragger_.lastTrackedMouseX = e.clientX;
  this.currentConnectorDragger_.lastTrackedMouseY = e.clientY;
};


/**
 * @param {goog.fx.DragEvent} e - Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.editConnectorDragEnd_ = function(e) {
  if (this.dragging) {
    if (this.scrollDragger) this.scrollDragger.setEnabled(true);
    this.tooltip().enabled(this.tooltipEnabledBackup_);
    this.tooltipEnabledBackup_ = void 0;
    this.getEditConnectorPreviewPath_().clear();
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
  }
  //Moved nulling of this.currentConnectorDragger_ to additional mouse up actions (see addMouseUp() method).
};


/**
 * Creates connector interactivity event.
 * @param {anychart.core.MouseEvent} event - Incoming original event. By idea, can't be null.
 * @private
 * @return {Object} - New event object to be dispatched.
 */
anychart.ganttModule.TimeLine.prototype.getConnectorInteractivityEvent_ = function(event) {
  var type = event.type;
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.CONNECTOR_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.CONNECTOR_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
    case acgraph.events.EventType.TOUCHMOVE:
      type = anychart.enums.EventType.CONNECTOR_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
    case acgraph.events.EventType.TOUCHSTART:
      type = anychart.enums.EventType.CONNECTOR_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
    case acgraph.events.EventType.TOUCHEND:
      type = anychart.enums.EventType.CONNECTOR_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.CONNECTOR_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.CONNECTOR_DBL_CLICK;
      break;
  }

  return {
    'type': type,
    'actualTarget': event.target,
    'target': this,
    'originalEvent': event
  };
};


/**
 * Patches connector interactivity events.
 * @param {Object} evt - Event object.
 * @private
 * @return {?Object} - Patched event or null.
 */
anychart.ganttModule.TimeLine.prototype.patchConnectorEvent_ = function(evt) {
  if (evt && evt['originalEvent']) {
    var orig = evt['originalEvent'];
    var domTarget = (anychart.utils.instanceOf(orig, acgraph.events.BrowserEvent)) ? orig['target'] : orig['domTarget'];
    if (domTarget && anychart.utils.instanceOf(domTarget, anychart.ganttModule.BaseGrid.Element) && domTarget.type == anychart.enums.TLElementTypes.CONNECTOR) {
      var connector = /** @type {anychart.ganttModule.BaseGrid.Element} */ (domTarget);
      var connEvent = this.getConnectorInteractivityEvent_(orig);
      for (var key in connector.meta)
        connEvent[key] = connector.meta[key];
      return connEvent;
    }
  }
  return null;
};


/**
 * Patches connector mouse out event.
 * @param {Object} evt - Event object.
 * @private
 * @return {?Object} - Patched event or null.
 */
anychart.ganttModule.TimeLine.prototype.patchConnectorMouseOutEvent_ = function(evt) {
  if (evt && evt['originalEvent']) {
    var connEvent = {
      'type': anychart.enums.EventType.CONNECTOR_MOUSE_OUT,
      'actualTarget': evt['originalEvent'].target,
      'target': this,
      'originalEvent': evt['originalEvent']
    };

    //Make sure that this.hoveredConnector_ is not null!
    for (var key in this.hoveredConnector_)
      connEvent[key] = this.hoveredConnector_[key];
    return connEvent;
  }
  return null;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.addMouseMoveAndOver = function(evt) {
  if (evt && evt['originalEvent']) {
    var orig = evt['originalEvent'];
    var domTarget = orig['domTarget'];
    if (this.editable) {
      var el;
      if (domTarget && anychart.utils.instanceOf(domTarget, anychart.ganttModule.BaseGrid.Element)) {
        el = /** @type {anychart.ganttModule.BaseGrid.Element} */ (domTarget);
        var dataItem = evt['item'];
        var id = dataItem.get(anychart.enums.GanttDataFields.ID);
        if (!goog.isDef(this.lastHoveredBarItemId_))
          this.lastHoveredBarItemId_ = id;

        var period = evt['period'];
        var periodIndex = evt['periodIndex'];
        if (goog.isDef(periodIndex) && isNaN(this.lastHoveredPeriodIndex_))
          this.lastHoveredPeriodIndex_ = periodIndex;

        //this condition fixes multiple edit controls appearance on quick mouse move.
        if (this.lastHoveredBarItemId_ != id && this.lastHoveredPeriodIndex_ != periodIndex) {
          this.clearEdit_(true);
          this.lastHoveredBarItemId_ = id;
          if (goog.isDef(periodIndex))
            this.lastHoveredPeriodIndex_ = periodIndex;
        }

        if (el.currBounds && !this.dragging) {
          var b = el.currBounds;

          this.getEditPreviewPath_()
              .clear()
              .moveTo(b.left, b.top)
              .lineTo(b.left + b.width, b.top)
              .lineTo(b.left + b.width, b.top + b.height)
              .lineTo(b.left, b.top + b.height)
              .close();

          this.editPreviewPath_.item = dataItem;
          this.editPreviewPath_.type = el.type;

          if (period) this.editPreviewPath_.period = period;

          if (goog.isDef(periodIndex)) this.editPreviewPath_.periodIndex = periodIndex;

          // ------ Drawing progress ------
          if (dataItem && (el.type == anychart.enums.TLElementTypes.BASE || el.type == anychart.enums.TLElementTypes.PARENT ||
              el.type == anychart.enums.TLElementTypes.PROGRESS)) {
            var progressValue = goog.isDef(dataItem.meta('progressValue')) ?
                dataItem.meta('progressValue') :
                dataItem.meta('autoProgress');

            progressValue = progressValue || 0;
            var progressLeft = b.left + progressValue * b.width;
            var top = b.top + b.height;

            this.getEditProgressPath_()
                .clear()
                .moveTo(progressLeft, top - anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT)
                .lineTo(progressLeft + anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT, top)
                .lineTo(progressLeft + anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT, top + anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT)
                .lineTo(progressLeft - anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT, top + anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT)
                .lineTo(progressLeft - anychart.ganttModule.TimeLine.EDIT_CORNER_HEIGHT, top)
                .close();

            this.editProgressPath_.bounds = b;
            this.editProgressPath_.item = dataItem;

          } else {
            this.getEditProgressPath_().clear();
          }

          var right = b.left + b.width;

          // ------ Drawing any resizeable bar ------
          if (dataItem && el.type != anychart.enums.TLElementTypes.MILESTONE) {
            this.getEditRightThumbPath_()
                .clear()
                .moveTo(right + 1, b.top)
                .lineTo(right + 1 - this.editIntervalWidth_, b.top)
                .lineTo(right + 1 - this.editIntervalWidth_, b.top + b.height)
                .lineTo(right + 1, b.top + b.height)
                .close();

            this.getEditLeftThumbPath_()
                .clear()
                .moveTo(b.left - 1, b.top)
                .lineTo(b.left - 1 + this.editIntervalWidth_, b.top)
                .lineTo(b.left - 1 + this.editIntervalWidth_, b.top + b.height)
                .lineTo(b.left - 1, b.top + b.height)
                .close();

            this.editRightThumbPath_.bounds = b;
            this.editRightThumbPath_.item = dataItem;
            this.editRightThumbPath_.type = el.type;
            this.editLeftThumbPath_.bounds = b;
            this.editLeftThumbPath_.item = dataItem;
            this.editLeftThumbPath_.type = el.type;

            if (period) {
              this.editRightThumbPath_.period = period;
              this.editLeftThumbPath_.period = period;
            }

            if (goog.isDef(periodIndex)) {
              this.editRightThumbPath_.periodIndex = periodIndex;
              this.editLeftThumbPath_.periodIndex = periodIndex;
            }

          } else {
            this.getEditLeftThumbPath_().clear();
            this.getEditRightThumbPath_().clear();
          }

          if (dataItem && el.type != anychart.enums.TLElementTypes.BASELINE) {
            var rTop = b.top + b.height / 2;
            var finishDrawer = anychart.utils.getMarkerDrawer(this.editFinishConnectorMarkerType_);
            var finishSize = this.editFinishConnectorMarkerSize_ / 2;
            finishDrawer.call(null,
                /** @type {!acgraph.vector.Path} */ (this.getEditFinishConnectorPath_()),
                right + finishSize + this.editFinishConnectorMarkerHorizontalOffset_,
                rTop + this.editFinishConnectorMarkerVerticalOffset_,
                finishSize);

            var startDrawer = anychart.utils.getMarkerDrawer(this.editStartConnectorMarkerType_);
            var startSize = this.editStartConnectorMarkerSize_ / 2;
            startDrawer.call(null,
                /** @type {!acgraph.vector.Path} */ (this.getEditStartConnectorPath_()),
                b.left - startSize + this.editStartConnectorMarkerHorizontalOffset_,
                rTop + this.editStartConnectorMarkerVerticalOffset_,
                startSize);

            this.editFinishConnectorPath_.item = dataItem;
            this.editFinishConnectorPath_.type = el.type;
            this.editFinishConnectorPath_.index = evt['hoveredIndex'] + this.controller.startIndex();
            this.editStartConnectorPath_.item = dataItem;
            this.editStartConnectorPath_.type = el.type;
            this.editStartConnectorPath_.index = evt['hoveredIndex'] + this.controller.startIndex();

            if (period) {
              this.editStartConnectorPath_.period = period;
              this.editFinishConnectorPath_.period = period;
            }

            if (goog.isDef(periodIndex)) {
              this.editStartConnectorPath_.periodIndex = periodIndex;
              this.editFinishConnectorPath_.periodIndex = periodIndex;
            }
          } else {
            this.getEditFinishConnectorPath_().clear();
            this.getEditStartConnectorPath_().clear();
          }
        } else if (this.draggingConnector && dataItem) {//dataItem here is destination item.
          var path = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

          var startItem = path.item;
          var startIndex = path.index;

          if (el.type != anychart.enums.TLElementTypes.BASELINE &&
              el.type != anychart.enums.TLElementTypes.CONNECTOR) {

            var from, to;

            if (period) {
              var startPeriod = path.period;
              var startPeriodIndex = path.periodIndex;
              from = {'item': startItem, 'period': startPeriod, 'index': startIndex, 'periodIndex': startPeriodIndex};
              to = {
                'item': dataItem,
                'period': period,
                'index': evt['hoveredIndex'] + this.controller.startIndex(),
                'periodIndex': periodIndex
              };
            } else {
              from = {'item': startItem, 'index': startIndex};
              to = {'item': dataItem, 'index': evt['hoveredIndex'] + this.controller.startIndex()};
            }

            var originalEvent = evt['originalEvent'];
            var left = originalEvent.clientX - this.container().getStage().getClientPosition().x;
            var elBounds = el.currBounds;
            var dropRatio = (left - elBounds.left) / elBounds.width;
            var startStart = this.currentConnectorDragger_.isStart;
            var dropStart = dropRatio < .5;
            var connType;
            if (startStart) {
              connType = dropStart ? anychart.enums.ConnectorType.START_START : anychart.enums.ConnectorType.START_FINISH;
            } else {
              connType = dropStart ? anychart.enums.ConnectorType.FINISH_START : anychart.enums.ConnectorType.FINISH_FINISH;
            }


            this.getEditConnectorPreviewPath_().clear();
            this.connectItems_(from, to, connType, void 0, this.editConnectorPreviewPath_);
          } else {
            this.drawConnectorPreview_(orig);
          }
        }
      } else if (domTarget != this.getEditPreviewPath_() &&
          domTarget != this.getEditProgressPath_() &&
          domTarget != this.getEditRightThumbPath_() &&
          domTarget != this.getEditLeftThumbPath_() &&
          domTarget != this.getEditFinishConnectorPath_() &&
          domTarget != this.getEditStartConnectorPath_() && !this.dragging) {
        this.clearEdit_(true);
      } else if (this.draggingConnector) {
        this.drawConnectorPreview_(orig);
      }
    }


    var connEvent = this.patchConnectorEvent_(evt);
    if (connEvent) {
      this.interactivityHandler.dispatchEvent(connEvent);
      this.hoveredConnector_ = domTarget.meta;
    } else if (this.hoveredConnector_) {
      connEvent = this.patchConnectorMouseOutEvent_(evt);
      this.interactivityHandler.dispatchEvent(connEvent);
      this.hoveredConnector_ = null;
    }
  }
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.rowMouseDown = function(evt) {
  this.mouseDown(evt);
};


/**
 * Actually reacts on mouse down.
 * @param {Object} evt - Event object.
 */
anychart.ganttModule.TimeLine.prototype.mouseDown = function(evt) {
  if (this.editable) this.draggingItem = evt['item'];
};


/**
 * Creates connector.
 * If connector with same parameters already exists, nothing will happen.
 * If connector's data is incorrect, nothing will happen.
 * TODO (A.Kudryavtsev): Do we need to export this method?
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|number|string} startItem - Start data item or its ID.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem|number|string} targetItem - Destination data item or its ID.
 * @param {anychart.enums.ConnectorType=} opt_type - Connection type. anychart.enums.ConnectorType.FINISH_START is default.
 * @param {number=} opt_startPeriodIndex - Index of start period.
 * @param {number=} opt_targetPeriodIndex - Index of destination period.
 * TODO (A.Kudryavtsev): Add connector coloring settings?
 * @return {anychart.ganttModule.TimeLine} - Itself for method chaining.
 */
anychart.ganttModule.TimeLine.prototype.addConnector = function(startItem, targetItem, opt_type, opt_startPeriodIndex, opt_targetPeriodIndex) {
  opt_type = opt_type || anychart.enums.ConnectorType.FINISH_START;
  if (!((anychart.utils.instanceOf(startItem, anychart.treeDataModule.Tree.DataItem)) || (anychart.utils.instanceOf(startItem, anychart.treeDataModule.View.DataItem)))) {
    var soughtStart = this.controller.data().searchItems(anychart.enums.GanttDataFields.ID, /** @type {number|string} */ (startItem));
    startItem = soughtStart.length ? soughtStart[0] : null;
  }
  if (!startItem) return this; //TODO (A.Kudryavtsev): Add warning?

  if (!((anychart.utils.instanceOf(targetItem, anychart.treeDataModule.Tree.DataItem)) || (anychart.utils.instanceOf(targetItem, anychart.treeDataModule.View.DataItem)))) {
    var soughtTarget = this.controller.data().searchItems(anychart.enums.GanttDataFields.ID, /** @type {number|string} */ (targetItem));
    targetItem = soughtTarget.length ? soughtTarget[0] : null;
  }
  if (!targetItem) return this; //TODO (A.Kudryavtsev): Add warning?

  var to = anychart.enums.GanttDataFields.CONNECT_TO;
  var connType = anychart.enums.GanttDataFields.CONNECTOR_TYPE;

  //TODO (A.Kudryavtsev): Add checking of existing connector.
  this.controller.data().suspendSignalsDispatching();

  var conn, connectTo, connectorToBeAdded, connLength, oldConnector, oldConnectorVisualSettings, connEvent;
  var renewConnectorData = false;

  if (this.controller.isResources()) {
    var startPeriod = startItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_startPeriodIndex];
    var targetPeriod = targetItem.get(anychart.enums.GanttDataFields.PERIODS)[opt_targetPeriodIndex];

    if (goog.isDef(startPeriod) && goog.isDef(targetPeriod)) {
      conn = startPeriod[anychart.enums.GanttDataFields.CONNECTOR];
      connectorToBeAdded = {};
      connectorToBeAdded[to] = targetPeriod[anychart.enums.GanttDataFields.ID];
      connectorToBeAdded[connType] = opt_type;
      if (conn) {
        if (goog.isArray(conn)) { //New behaviour.
          connLength = conn.length;
        } else { //Deprecated behaviour.
          oldConnectorVisualSettings = goog.object.clone(conn);
          oldConnector = {};
          oldConnector[to] = startPeriod[anychart.enums.GanttDataFields.CONNECT_TO];
          oldConnector[connType] = startPeriod[anychart.enums.GanttDataFields.CONNECTOR_TYPE] || anychart.enums.ConnectorType.FINISH_START;
          goog.object.extend(oldConnector, oldConnectorVisualSettings);
          connLength = 1;
          renewConnectorData = true;
        }
      } else {
        connectTo = startPeriod[anychart.enums.GanttDataFields.CONNECT_TO];
        if (goog.isDef(connectTo)) { //Deprecated behaviour.
          oldConnector = {};
          oldConnector[to] = connectTo;
          oldConnector[connType] = startPeriod[anychart.enums.GanttDataFields.CONNECTOR_TYPE] || anychart.enums.ConnectorType.FINISH_START;
          connLength = 1;
          renewConnectorData = true;
        } else { //New behaviour.
          connLength = 0;
        }
      }

      connEvent = {
        'type': anychart.enums.EventType.BEFORE_CREATE_CONNECTOR,
        'target': targetItem,
        'source': startItem,
        'connectorType': opt_type,
        'targetPeriod': targetPeriod,
        'targetPeriodIndex': opt_targetPeriodIndex,
        'sourcePeriod': startPeriod,
        'sourcePeriodIndex': opt_startPeriodIndex
      };

      if (this.interactivityHandler.dispatchEvent(connEvent)) {
        if (renewConnectorData) {
          startItem.set(anychart.enums.GanttDataFields.PERIODS, opt_startPeriodIndex,
              anychart.enums.GanttDataFields.CONNECTOR, [oldConnector]);
        }
        startItem.set(anychart.enums.GanttDataFields.PERIODS, opt_startPeriodIndex,
            anychart.enums.GanttDataFields.CONNECTOR, connLength, connectorToBeAdded);
      }
    } //TODO (A.Kudryavtsev): Do we need to add some warning here?

  } else {
    conn = startItem.get(anychart.enums.GanttDataFields.CONNECTOR);
    connectorToBeAdded = {};
    connectorToBeAdded[to] = targetItem.get(anychart.enums.GanttDataFields.ID);
    connectorToBeAdded[connType] = opt_type;
    if (conn) {
      if (goog.isArray(conn)) { //New behaviour.
        connLength = conn.length;
      } else { //Deprecated behaviour.
        oldConnectorVisualSettings = goog.object.clone(/** @type {Object} */(conn));
        oldConnector = {};
        oldConnector[to] = startItem.get(anychart.enums.GanttDataFields.CONNECT_TO);
        oldConnector[connType] = startItem.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE) || anychart.enums.ConnectorType.FINISH_START;
        goog.object.extend(oldConnector, oldConnectorVisualSettings);
        connLength = 1;
        renewConnectorData = true;
      }
    } else {
      connectTo = startItem.get(anychart.enums.GanttDataFields.CONNECT_TO);
      if (goog.isDef(connectTo)) { //Deprecated behaviour.
        oldConnector = {};
        oldConnector[to] = connectTo;
        oldConnector[connType] = startItem.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE) || anychart.enums.ConnectorType.FINISH_START;
        connLength = 1;
        renewConnectorData = true;
      } else { //New behaviour.
        connLength = 0;
      }
    }

    connEvent = {
      'type': anychart.enums.EventType.BEFORE_CREATE_CONNECTOR,
      'target': targetItem,
      'source': startItem,
      'connectorType': opt_type
    };

    if (this.interactivityHandler.dispatchEvent(connEvent)) {
      if (renewConnectorData) {
        startItem.set(anychart.enums.GanttDataFields.CONNECTOR, [oldConnector]);
      }
      startItem.set(anychart.enums.GanttDataFields.CONNECTOR, connLength, connectorToBeAdded);
    }
  }

  this.controller.data().resumeSignalsDispatching(true);

  return this;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.addMouseDown = function(evt) {
  if (evt) {
    var connEvent = this.patchConnectorEvent_(evt);
    if (connEvent) {
      this.interactivityHandler.dispatchEvent(connEvent);
    }
  }
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.addMouseUp = function(evt) {
  if (this.editable && this.draggingConnector) {
    if (evt) {
      var destinationItem = evt['item'];
      var destinationPeriodIndex = evt['periodIndex'];
      var originalEvent = evt['originalEvent'];
      var domTarget = originalEvent['domTarget'];
      if (anychart.utils.instanceOf(domTarget, anychart.ganttModule.BaseGrid.Element) && domTarget.type != anychart.enums.TLElementTypes.BASELINE) {
        var left = originalEvent.clientX - this.container().getStage().getClientPosition().x;
        var elBounds = domTarget.currBounds;
        var dropRatio = (left - elBounds.left) / elBounds.width;

        var circle = this.currentConnectorDragger_.isStart ? this.editStartConnectorPath_ : this.editFinishConnectorPath_;

        var startItem = circle.item;
        var startPeriodIndex = circle.periodIndex;

        var startStart = this.currentConnectorDragger_.isStart;
        var dropStart = dropRatio < .5;
        var connType;
        if (startStart) {
          connType = dropStart ? anychart.enums.ConnectorType.START_START : anychart.enums.ConnectorType.START_FINISH;
        } else {
          connType = dropStart ? anychart.enums.ConnectorType.FINISH_START : anychart.enums.ConnectorType.FINISH_FINISH;
        }

        this.addConnector(startItem, destinationItem, connType, startPeriodIndex, destinationPeriodIndex);
      }
    }
    this.draggingConnector = false;
  }

  var connEvent = this.patchConnectorEvent_(evt);
  if (connEvent) {
    this.interactivityHandler.dispatchEvent(connEvent);
  }

  this.currentConnectorDragger_ = null;
  this.interactive = true;
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.mouseOutMove = function(e) {
  if (this.dragging && !this.draggingProgress && (this.scrollOffsetX || this.scrollOffsetY)) {
    var scrollX = 0;
    var scrollY = 0;
    if (this.scrollOffsetX)
      scrollX = this.scrollOffsetX > 0 ? anychart.ganttModule.BaseGrid.SCROLL_STEP : -anychart.ganttModule.BaseGrid.SCROLL_STEP;

    if ((this.draggingConnector || this.draggingItem) && this.scrollOffsetY) {
      scrollY = this.scrollOffsetY > 0 ? anychart.ganttModule.BaseGrid.SCROLL_STEP : -anychart.ganttModule.BaseGrid.SCROLL_STEP;
    }

    this.scroll(scrollX, scrollY, true);
    this.drawThumbPreview_(/** @type {goog.fx.DragEvent} */ (e), this.scrollOffsetX);
    this.drawConnectorPreview_(/** @type {goog.fx.DragEvent} */ (e), this.scrollOffsetX, this.scrollOffsetY);
  }
};


/**
 * Handles row collapse/expand.
 * @param {Object} event - Dispatched event object.
 * @override
 */
anychart.ganttModule.TimeLine.prototype.rowExpandCollapse = function(event) {
  if (!this.checkConnectorDblClick(event)) {
    var item = event['item'];
    if (item && item.numChildren()) {
      var value = !item.meta(anychart.enums.GanttDataFields.COLLAPSED);
      var evtObj = {
        'type': anychart.enums.EventType.ROW_COLLAPSE_EXPAND,
        'item': item,
        'collapsed': value
      };

      if (this.interactivityHandler.dispatchEvent(evtObj))
        item.meta(anychart.enums.GanttDataFields.COLLAPSED, value);
    }
  }
};


/**
 * Checks connector dbl click.
 * Used to double click the connector instead the row.
 * @param {Object} event - Dispatched event object.
 * @return {boolean} - Whether to dispatch event.
 */
anychart.ganttModule.TimeLine.prototype.checkConnectorDblClick = function(event) {
  var connEvent = this.patchConnectorEvent_(event);
  if (connEvent) {
    this.clearEdit_();
    this.interactivityHandler.dispatchEvent(connEvent);
    return true;
  }
  return false;
};


/**
 * Handles row selection.
 * @param {Object} event - Dispatched event object.
 * @override
 */
anychart.ganttModule.TimeLine.prototype.rowSelect = function(event) {
  if (!this.checkRowSelection(event)) {
    this.connectorUnselect(event);
    var item = event['item'];
    var period = event['period'];
    var periodId = period ? period[anychart.enums.GanttDataFields.ID] : void 0;
    if (this.selectTimelineRow(item, periodId)) {
      var eventObj = goog.object.clone(event);
      eventObj['type'] = anychart.enums.EventType.ROW_SELECT;
      (/** @type {anychart.ganttModule.IInteractiveGrid} */ (this.interactivityHandler)).dispatchEvent(eventObj);
    }
    this.selectedConnectorData_ = null;
  }
};


/**
 * Additional action on row selection.
 * Used to select the connector instead the row.
 * @param {Object} event - Dispatched event object.
 * @return {boolean} - Whether to dispatch event.
 */
anychart.ganttModule.TimeLine.prototype.checkRowSelection = function(event) {
  var domTarget = (event && event['originalEvent']) ? event['originalEvent']['domTarget'] : null;
  if (domTarget && domTarget.type == anychart.enums.TLElementTypes.CONNECTOR) {
    this.clearEdit_();
    var connClickEvent = this.patchConnectorEvent_(event);
    if (this.interactivityHandler.dispatchEvent(connClickEvent)) {
      var connSelectEvent = this.patchConnectorEvent_(event);
      connSelectEvent.type = anychart.enums.EventType.CONNECTOR_SELECT;

      if (this.selectedConnectorData_)
        this.connectorUnselect(event['originalEvent']);

      if (this.interactivityHandler.dispatchEvent(connSelectEvent)) {
        this.interactivityHandler.rowUnselect(event['originalEvent']);
        this.selectedConnectorData_ = domTarget.meta;
        this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
      }
    }
    return true;
  }
  return false;
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.rowUnselect = function(event) {
  if (this.selectedItem || goog.isDefAndNotNull(this.selectedPeriodId_)) {
    this.selectedPeriodId_ = void 0;
    anychart.ganttModule.TimeLine.base(this, 'rowUnselect', event);
  }
};


/**
 * Connector unselect handler.
 * @param {Object} event - Dispatched event object.
 */
anychart.ganttModule.TimeLine.prototype.connectorUnselect = function(event) {
  if (this.selectedConnectorData_) {
    var connEvent = this.getConnectorInteractivityEvent_(/** @type {anychart.core.MouseEvent} */ (event)); //empty event.
    connEvent.type = anychart.enums.EventType.CONNECTOR_SELECT;
    this.interactivityHandler.dispatchEvent(connEvent);
  }
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.getInteractivityEvent = function(event) {
  var evt = anychart.ganttModule.TimeLine.base(this, 'getInteractivityEvent', event);
  var target = (evt && evt['originalEvent']) ? evt['originalEvent']['domTarget'] : null;

  if (evt && target && this.controller.isResources()) {
    if (goog.isObject(target.period) && goog.isDef(target.periodIndex)) { //Usually this is Live Edit case.
      evt['period'] = target.period;
      evt['periodIndex'] = target.periodIndex;
    } else { //Otherwise.
      var id = target.tag;
      if (goog.isDefAndNotNull(target.tag)) {
        var periodData = this.controller.getPeriodsMap()[id];
        if (periodData) {
          evt['period'] = periodData['period'];
          evt['periodIndex'] = periodData['periodIndex'];
        }
      }
    }
  }
  return evt;
};


/**
 * Selects row and/or period.
 * @param {anychart.treeDataModule.Tree.DataItem} item - New selected data item.
 * @param {string=} opt_periodId - Id of period to be selected.
 * @return {boolean} - Whether has been selected.
 */
anychart.ganttModule.TimeLine.prototype.selectTimelineRow = function(item, opt_periodId) {
  var itemSelected = false;
  var periodSelected = false;

  if (item && item != this.selectedItem) {
    this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
    item.meta('selected', true);
    if (this.selectedItem) this.selectedItem.meta('selected', false); //selectedItem has the same tree as item.
    this.selectedItem = item;
    this.controller.data().resumeSignalsDispatching(false);
    itemSelected = true;
  }

  if (this.selectedPeriodId_ !== opt_periodId) {
    this.selectedPeriodId_ = opt_periodId;
    periodSelected = true;
  }

  if (itemSelected || periodSelected) {
    this.selectedConnectorData_ = null;
    this.invalidate(anychart.ConsistencyState.BASE_GRID_REDRAW, anychart.Signal.NEEDS_REDRAW);
    return true;
  }
  return false;
};


/**
 * Generates anychart.ganttModule.BaseGrid.Element.
 * @return {anychart.ganttModule.BaseGrid.Element}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.genElement_ = function() {
  var element;
  if (this.visElementsInUse_ < this.visElements_.length) {
    element = this.visElements_[this.visElementsInUse_++];
    element.reset();
  } else {
    element = new anychart.ganttModule.BaseGrid.Element();
    element.setParentEventTarget(this);
    this.visElements_.push(element);
    this.visElementsInUse_++;
  }
  element.parent(this.getDrawLayer());
  return element;
};


/**
 * Gets related labels factory.
 * @param {anychart.enums.TLElementTypes} type
 * @return {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getLabelsFactoryByType_ = function(type) {
  switch (type) {
    case anychart.enums.TLElementTypes.BASE:
    case anychart.enums.TLElementTypes.PERIOD:
      return /** @type {anychart.core.ui.LabelsFactory} */ (this.baseLabels());
    case anychart.enums.TLElementTypes.PARENT:
      return /** @type {anychart.core.ui.LabelsFactory} */ (this.parentLabels());
    case anychart.enums.TLElementTypes.MILESTONE:
      return /** @type {anychart.core.ui.LabelsFactory} */ (this.milestoneLabels());
    case anychart.enums.TLElementTypes.BASELINE:
      return /** @type {anychart.core.ui.LabelsFactory} */ (this.baselineLabels());
    case anychart.enums.TLElementTypes.PROGRESS:
      return /** @type {anychart.core.ui.LabelsFactory} */ (this.progressLabels());
    default:
      return null; //connector has no labels for a while.
  }
};


/**
 * Draws timeline bars.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawTimelineElements_ = function() {
  this.getDrawLayer().removeChildren();

  var markers = goog.array.concat(this.lineMarkers_, this.rangeMarkers_, this.textMarkers_);

  var dataBounds = new anychart.math.Rect(this.pixelBoundsCache.left,
      (this.pixelBoundsCache.top + /** @type {number} */ (this.headerHeight()) + 1),
      this.pixelBoundsCache.width,
      (this.pixelBoundsCache.height - /** @type {number} */ (this.headerHeight()) - 1));

  for (var m = 0, count = markers.length; m < count; m++) {
    var axesMarker = markers[m];
    if (axesMarker) {
      axesMarker.suspendSignalsDispatching();
      axesMarker.parentBounds(dataBounds);
      axesMarker.container(this.getDrawLayer());
      axesMarker.invalidate(anychart.ConsistencyState.CONTAINER); //Force set of parent.
      axesMarker.draw();
      axesMarker.resumeSignalsDispatching(false);
    }
  }

  this.visElementsInUse_ = 0;
  this.markers().clear();

  if (this.controller.isResources()) {
    this.drawResourceTimeline_();
  } else {
    this.drawProjectTimeline_();
  }

  this.markers().draw();

  this.drawConnectors_();

  //Clearing remaining elements.
  for (var i = this.visElementsInUse_, l = this.visElements_.length; i < l; i++) {
    var el = this.visElements_[i];
    el.reset();
  }
};


/**
 * Draws a single bar with its markers and labels.
 * @param {anychart.math.Rect} bounds - Bounds of bar.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Related tree data item.
 * @param {anychart.enums.TLElementTypes} type - Type of bar.
 * @param {anychart.enums.GanttDataFields=} opt_field - Field that contains a setting for fill, stroke, labels and markers.
 * @param {number=} opt_periodIndex - Period index for resources timeline.
 * @return {!acgraph.vector.Element} - Bar itself.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawBar_ = function(bounds, item, type, opt_field, opt_periodIndex) {
  var isTreeDataItem = !goog.isDef(opt_periodIndex);
  var period = {};
  if (!isTreeDataItem)
    period = item.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndex];

  var settings; //It is always a raw object.
  if (opt_field) {
    settings = isTreeDataItem ? item.get(opt_field) : period[opt_field];
  } else {
    /*
      Here field is not specified.
      It means that if it is an instance of tree data item, we color a bar with default color.
      If it is not tree data item (it is period - actually a raw object), it contains all visual settings in itself.
      TODO (A.Kudryavtsev): Bad english.
     */
    settings = isTreeDataItem ? null : period;
  }

  var isParent = false;
  var isProgress = false;
  var selectedBar = isTreeDataItem ?
      (this.selectedItem == item) :
      (this.selectedPeriodId_ == period[anychart.enums.GanttDataFields.ID]);

  var zIndex, defaultFill, defaultStroke;

  switch (opt_field) {
    case anychart.enums.GanttDataFields.BASELINE:
      zIndex = anychart.ganttModule.TimeLine.BASELINE_Z_INDEX;
      defaultFill = this.baselineFill_;
      defaultStroke = this.baselineStroke_;
      break;
    case anychart.enums.GanttDataFields.PROGRESS:
      zIndex = anychart.ganttModule.TimeLine.PROGRESS_Z_INDEX;
      defaultFill = this.progressFill_;
      defaultStroke = this.progressStroke_;
      isProgress = true;
      break;
    default:
      zIndex = anychart.ganttModule.TimeLine.BASE_Z_INDEX;
      isParent = (isTreeDataItem && item.numChildren());
      defaultFill = isParent ? this.parentFill_ : this.baseFill_;
      defaultStroke = isParent ? this.parentStroke_ : this.baseStroke_;
      if (isTreeDataItem) {
        this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
        item.meta('relBounds', bounds);
        this.controller.data().resumeSignalsDispatching(false);
      } else {
        if (!goog.isArray(item.meta('periodBounds'))) {
          this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
          item.setMeta('periodBounds', []);
          this.controller.data().resumeSignalsDispatching(false);
        }
        this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
        item.setMeta('periodBounds', opt_periodIndex, bounds);
        this.controller.data().resumeSignalsDispatching(false);
      }
  }

  var stroke = /** @type {acgraph.vector.Stroke} */ (settings && goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
      acgraph.vector.normalizeStroke(settings[anychart.enums.GanttDataFields.STROKE]) :
      defaultStroke);


  var bar = this.genElement_();
  bar.disablePointerEvents(isProgress);
  bar.item = item;
  bar.typeLabels = this.getLabelsFactoryByType_(type);
  bar.labelPointSettings = settings ? settings['label'] : null;

  bar.tag = isTreeDataItem ? item.get(anychart.enums.GanttDataFields.ID) : period[anychart.enums.GanttDataFields.ID];
  bar.type = type;

  if (!isTreeDataItem) {
    bar.period = period;
    bar.periodIndex = opt_periodIndex;
  }

  var lineThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */ (stroke));

  var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;

  var roundLeft = Math.round(bounds.left) + pixelShift;
  var roundTop = Math.round(bounds.top) + pixelShift;
  var roundRight = Math.round(bounds.left + bounds.width) + pixelShift;
  var roundHeight = Math.round(bounds.top + bounds.height) + pixelShift;
  bar.currBounds = new anychart.math.Rect(roundLeft, roundTop, roundRight - roundLeft, roundHeight - roundTop);

  bar
      .zIndex(zIndex)
      .moveTo(roundLeft, roundTop)
      .lineTo(roundRight, roundTop);

  if (isParent) {
    var roundHeight2 = (bounds.top + bounds.height * 1.4) + pixelShift;
    bar
        .lineTo(roundRight, roundHeight2)
        .lineTo(roundRight - 1, roundHeight2)
        .lineTo(roundRight - 1, roundHeight)
        .lineTo(roundLeft + 1, roundHeight)
        .lineTo(roundLeft + 1, roundHeight2)
        .lineTo(roundLeft, roundHeight2);
  } else {
    bar
        .lineTo(roundRight, roundHeight)
        .lineTo(roundLeft, roundHeight);
  }
  bar.close();

  if (settings) {
    var rawStartMarker = settings[anychart.enums.GanttDataFields.START_MARKER];
    if (rawStartMarker) {
      var startMarker = this.markers().add({value: {x: bounds.left, y: bounds.top}});
      startMarker
          .size(bounds.height / 2)
          .setup(rawStartMarker);
    }

    var rawEndMarker = settings[anychart.enums.GanttDataFields.END_MARKER];
    if (rawEndMarker) {
      var endMarker = this.markers().add({value: {x: bounds.left + bounds.width, y: bounds.top}});
      endMarker
          .size(bounds.height / 2)
          .setup(rawEndMarker);
    }

    var fill;
    if (selectedBar) {
      fill = this.selectedElementFill_;
      stroke = this.selectedElementStroke_;
    } else {
      fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
          acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
          defaultFill;
    }

    bar.fill(fill).stroke(stroke);
  } else { //Default coloring.
    bar
        .fill(selectedBar ? this.selectedElementFill_ : defaultFill)
        .stroke(selectedBar ? this.selectedElementStroke_ : defaultStroke);
  }

  return bar;
};


/**
 * Draws data item's time markers.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawMarkers_ = function(dataItem, totalTop, itemHeight) {
  var markers = dataItem.get(anychart.enums.GanttDataFields.MARKERS);
  if (markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      if (marker) {
        var val = dataItem.getMeta(anychart.enums.GanttDataFields.MARKERS, i, 'value');
        if (!goog.isNull(val)) {
          var ratio = this.scale_.timestampToRatio(val);
          if (ratio >= 0 && ratio <= 1) { //Marker is visible
            var height = itemHeight * anychart.ganttModule.TimeLine.DEFAULT_HEIGHT_REDUCTION;

            var left = Math.round(this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio);
            var top = Math.round(totalTop + (itemHeight - height) / 2);

            var markerEl = this.markers().add({value: {x: left, y: top}});
            markerEl
                .size(height / 2)
                .setup(marker);
          }
        }
      }
    }
  }
};


/**
 * Internal resource timeline drawer.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawResourceTimeline_ = function() {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1 - this.controller.verticalOffset());
  var visibleItems = this.controller.getVisibleItems();
  for (var i = /** @type {number} */(this.controller.startIndex()); i <= /** @type {number} */(this.controller.endIndex()); i++) {
    var item = visibleItems[i];
    if (!item) break;

    var itemHeight = this.controller.getItemHeight(item);
    var newTop = /** @type {number} */ (totalTop + itemHeight);

    this.drawAsPeriods_(item, totalTop, itemHeight);
    this.drawMarkers_(item, totalTop, itemHeight);

    totalTop = (newTop + this.rowStrokeThickness);
  }
};


/**
 * Internal project timeline drawer.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawProjectTimeline_ = function() {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1 - this.controller.verticalOffset());
  var visibleItems = this.controller.getVisibleItems();

  for (var i = /** @type {number} */(this.controller.startIndex()); i <= /** @type {number} */(this.controller.endIndex()); i++) {
    var item = visibleItems[i];
    if (!item) break;

    var itemHeight = this.controller.getItemHeight(item);
    var newTop = /** @type {number} */ (totalTop + itemHeight);

    var baselineStart = item.get(anychart.enums.GanttDataFields.BASELINE_START);
    var baselineEnd = item.get(anychart.enums.GanttDataFields.BASELINE_END);

    if (anychart.ganttModule.BaseGrid.isMilestone(item)) {
      this.drawAsMilestone_(item, totalTop, itemHeight);
    } else if (goog.isDef(baselineStart) && goog.isDef(baselineEnd)) {
      this.drawAsBaseline_(item, totalTop, itemHeight);
    } else if (item.numChildren()) {
      this.drawAsParent_(item, totalTop, itemHeight);
    } else {
      this.drawAsProgress_(item, totalTop, itemHeight);
    }

    this.drawMarkers_(item, totalTop, itemHeight);

    totalTop = (newTop + this.rowStrokeThickness);
  }
};


/**
 * Gets bar bounds.
 * @param {anychart.enums.TLElementTypes} type - Bar type.
 * @param {anychart.math.Rect} itemBounds - Full item bounds. Left and width must be taken
 *  from scale transformed values, top and height are values from item's position in grid.
 * @param {boolean=} opt_considerBaseline - Whether to consider baseline appearance in itemBounds.
 * @return {anychart.math.Rect} - Bar bounds considering anchor/position settings.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getBarBounds_ = function(type, itemBounds, opt_considerBaseline) {
  var optionHeight, barHeight, anchor, position, offset, offsetNorm;
  var heightOptionName, anchorOptionName, positionOptionName, offsetOptionName;
  var fixParentHeight = false;
  switch (type) {
    case anychart.enums.TLElementTypes.PERIOD:
    case anychart.enums.TLElementTypes.BASE:
      heightOptionName = 'baseBarHeight';
      anchorOptionName = 'baseBarAnchor';
      positionOptionName = 'baseBarPosition';
      offsetOptionName = 'baseBarOffset';
      break;
    case anychart.enums.TLElementTypes.PARENT:
      heightOptionName = 'parentBarHeight';
      anchorOptionName = 'parentBarAnchor';
      positionOptionName = 'parentBarPosition';
      offsetOptionName = 'parentBarOffset';
      fixParentHeight = true;
      break;
    case anychart.enums.TLElementTypes.BASELINE:
      heightOptionName = 'baselineBarHeight';
      anchorOptionName = 'baselineBarAnchor';
      positionOptionName = 'baselineBarPosition';
      offsetOptionName = 'baselineBarOffset';
      break;
    case anychart.enums.TLElementTypes.MILESTONE:
      heightOptionName = 'milestoneHeight';
      anchorOptionName = 'milestoneAnchor';
      positionOptionName = 'milestonePosition';
      offsetOptionName = 'milestoneOffset';
      break;
    case anychart.enums.TLElementTypes.PROGRESS:
      heightOptionName = 'progressBarHeight';
      anchorOptionName = 'progressBarAnchor';
      positionOptionName = 'progressBarPosition';
      offsetOptionName = 'progressBarOffset';
      break;
  }

  optionHeight = /** @type {string|number} */ (this.getInheritedOption_(/** @type {string} */ (heightOptionName), 'baseBarHeight'));
  var height = opt_considerBaseline || fixParentHeight ? itemBounds.height / 2 : itemBounds.height;
  barHeight = anychart.utils.normalizeSize(optionHeight, height);
  anchor = /** @type {anychart.enums.Anchor} */ (this.getInheritedOption_(/** @type {string} */ (anchorOptionName), 'baseBarAnchor'));
  position = /** @type {anychart.enums.Position} */ (this.getInheritedOption_(/** @type {string} */ (positionOptionName), 'baseBarPosition'));
  offset = /** @type {number|string} */ (this.getInheritedOption_(/** @type {string} */ (offsetOptionName), 'baseBarOffset'));
  offsetNorm = anychart.utils.normalizeSize(offset, itemBounds.height);

  if (anchor == anychart.enums.Anchor.AUTO) {
    anchor = this.resolveAutoAnchorByType_(position, type, opt_considerBaseline);
  }

  var coord = anychart.utils.getCoordinateByAnchor(itemBounds, position);
  var top = this.fixBarTop_(coord.y, barHeight, anchor) + offsetNorm;
  return new anychart.math.Rect(coord.x, top, itemBounds.width, barHeight);
};


/**
 * Draws data item as periods.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsPeriods_ = function(dataItem, totalTop, itemHeight) {
  var periods = /** @type {Array.<Object>} */(dataItem.get(anychart.enums.GanttDataFields.PERIODS));
  if (periods) {
    for (var j = 0; j < periods.length; j++) {
      var start = dataItem.getMeta(anychart.enums.GanttDataFields.PERIODS, j, anychart.enums.GanttDataFields.START);
      var end = dataItem.getMeta(anychart.enums.GanttDataFields.PERIODS, j, anychart.enums.GanttDataFields.END);

      if (goog.isNumber(start) && goog.isNumber(end)) {
        var startRatio = this.scale_.timestampToRatio(start);
        var endRatio = this.scale_.timestampToRatio(end);

        if (endRatio > 0 && startRatio < 1) { //Is visible
          var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * startRatio;
          var right = this.pixelBoundsCache.left + this.pixelBoundsCache.width * endRatio;
          var width = right - left;

          var optionHeight = /** @type {string|number} */ (this.getOption('baseBarHeight'));
          var height = anychart.utils.normalizeSize(optionHeight, itemHeight);

          var itemBounds = new anychart.math.Rect(left, totalTop, width, itemHeight);
          var anchor = /** @type {anychart.enums.Anchor} */ (this.getOption('baseBarAnchor'));
          var position = /** @type {anychart.enums.Position} */ (this.getOption('baseBarPosition'));
          if (anchor == anychart.enums.Anchor.AUTO) {
            anchor = this.resolveAutoAnchorByType_(position, anychart.enums.TLElementTypes.PERIOD);
          }

          var offset = /** @type {number|string} */ (this.getOption('baseBarOffset'));
          var offsetNorm = anychart.utils.normalizeSize(offset, itemHeight);

          var coord = anychart.utils.getCoordinateByAnchor(itemBounds, position);
          var top = this.fixBarTop_(coord.y, height, anchor) + offsetNorm;
          var bounds = new anychart.math.Rect(coord.x, top, width, height);

          this.drawBar_(bounds, dataItem, anychart.enums.TLElementTypes.PERIOD, void 0, j);
        }
      }
    }
  }
};


/**
 * Draws data item as baseline.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsBaseline_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START) :
      dataItem.meta('autoStart');
  var actualEnd = goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END) :
      dataItem.meta('autoEnd');
  var baselineStart = dataItem.meta(anychart.enums.GanttDataFields.BASELINE_START);
  var baselineEnd = dataItem.meta(anychart.enums.GanttDataFields.BASELINE_END);

  var actualStartRatio = this.scale_.timestampToRatio(actualStart);
  var actualEndRatio = this.scale_.timestampToRatio(actualEnd);
  var baselineStartRatio = this.scale_.timestampToRatio(baselineStart);
  var baselineEndRatio = this.scale_.timestampToRatio(baselineEnd);

  if ((actualEndRatio > 0 && actualStartRatio < 1) || (baselineEndRatio > 0 && baselineStartRatio < 1)) {
    var b = this.pixelBoundsCache;
    var actualLeft = b.left + b.width * actualStartRatio;
    var actualRight = b.left + b.width * actualEndRatio;
    var actualWidth = actualRight - actualLeft;

    var isParent = !!dataItem.numChildren();
    var actualItemBounds = new anychart.math.Rect(actualLeft, totalTop, actualWidth, itemHeight);
    var actualType = isParent ? anychart.enums.TLElementTypes.PARENT : anychart.enums.TLElementTypes.BASE;
    var actualBounds = this.getBarBounds_(actualType, actualItemBounds, true);

    var baselineLeft = b.left + b.width * baselineStartRatio;
    var baselineRight = b.left + b.width * baselineEndRatio;
    var baselineWidth = baselineRight - baselineLeft;
    var baselineItemBounds = new anychart.math.Rect(baselineLeft, totalTop, baselineWidth, itemHeight);
    var baselineBounds = this.getBarBounds_(anychart.enums.TLElementTypes.BASELINE, baselineItemBounds, true);

    this.fixBaselineBarsPositioning_(actualBounds, baselineBounds, isParent);
    this.drawBar_(actualBounds, dataItem, actualType, anychart.enums.GanttDataFields.ACTUAL);
    this.drawBar_(baselineBounds, dataItem, anychart.enums.TLElementTypes.BASELINE, anychart.enums.GanttDataFields.BASELINE);

    var progressValue = goog.isDef(dataItem.meta(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
        dataItem.meta(anychart.enums.GanttDataFields.PROGRESS_VALUE) :
        dataItem.meta('autoProgress');

    if (goog.isDefAndNotNull(progressValue)) { //Draw progress.
      var progressWidth = /** @type {number} */ (progressValue) * actualBounds.width;
      var progressItemBounds = new anychart.math.Rect(actualBounds.left, actualBounds.top, progressWidth, actualBounds.height);
      var progressBounds = this.getBarBounds_(anychart.enums.TLElementTypes.PROGRESS, progressItemBounds);
      var progressBar = this.drawBar_(progressBounds, dataItem, anychart.enums.TLElementTypes.PROGRESS, anychart.enums.GanttDataFields.PROGRESS);
      progressBar.currBounds = progressBounds;
    }
  }
};


/**
 * Fixes bars positioning considering baseline.
 * Allows to avoid bar and baseline intersection for auto anchor case.
 * @param {anychart.math.Rect} barBounds - .
 * @param {anychart.math.Rect} baselineBounds - .
 * @param {boolean=} opt_isParent - .
 * @private
 */
anychart.ganttModule.TimeLine.prototype.fixBaselineBarsPositioning_ = function(barBounds, baselineBounds, opt_isParent) {
  var barAnchorName = opt_isParent ? 'parentBarAnchor' : 'baseBarAnchor';
  var barPositionName = opt_isParent ? 'parentBarPosition' : 'baseBarPosition';
  var barAnchor = /** @type {anychart.enums.Anchor} */ (this.getInheritedOption_(barAnchorName, 'baseBarAnchor'));
  var barPosition = /** @type {anychart.enums.Position} */ (this.getInheritedOption_(barPositionName, 'baseBarPosition'));
  var baselineAnchor = /** @type {anychart.enums.Anchor} */ (this.getInheritedOption_('baselineBarAnchor', 'baseBarAnchor'));
  var baselinePosition = /** @type {anychart.enums.Position} */ (this.getInheritedOption_('baselineBarPosition', 'baseBarPosition'));

  if ((barAnchor == baselineAnchor) && (barPosition == baselinePosition)) {
    var barType = opt_isParent ? anychart.enums.TLElementTypes.PARENT : anychart.enums.TLElementTypes.BASE;
    if (barAnchor == anychart.enums.Anchor.AUTO)
      barAnchor = this.resolveAutoAnchorByType_(barPosition, barType, true);
    if (baselineAnchor == anychart.enums.Anchor.AUTO)
      baselineAnchor = this.resolveAutoAnchorByType_(baselinePosition, anychart.enums.TLElementTypes.BASELINE, true);

    var barStroke = opt_isParent ? this.parentStroke() : this.baseStroke();
    var barStrokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */ (barStroke)) / 2;
    var baselineStrokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke|string} */ (this.baselineStroke())) / 2;
    var strokes = barStrokeThickness + baselineStrokeThickness;

    if (barAnchor == baselineAnchor) {
      if (this.baselineAbove()) {
        if (anychart.utils.isTopAnchor(barAnchor)) {
          barBounds.top += (baselineBounds.height + strokes);
        } else {
          baselineBounds.top -= (barBounds.height + strokes);
        }
      } else {
        if (anychart.utils.isTopAnchor(barAnchor)) {
          baselineBounds.top += (barBounds.height + strokes);
        } else {
          barBounds.top -= (baselineBounds.height + strokes);
        }
      }
    }
  }
};


/**
 * Draws data item as parent.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsParent_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START) :
      dataItem.meta('autoStart');
  var actualEnd = goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END) :
      dataItem.meta('autoEnd');
  var startRatio = this.scale_.timestampToRatio(actualStart);
  var endRatio = this.scale_.timestampToRatio(actualEnd);

  if (endRatio > 0 && startRatio < 1) { //Is visible
    var b = this.pixelBoundsCache;
    var actualLeft = b.left + b.width * startRatio;
    var actualRight = b.left + b.width * endRatio;
    var actualWidth = actualRight - actualLeft;
    var actualItemBounds = new anychart.math.Rect(actualLeft, totalTop, actualWidth, itemHeight);
    var actualBounds = this.getBarBounds_(anychart.enums.TLElementTypes.PARENT, actualItemBounds);

    this.drawBar_(actualBounds, dataItem, anychart.enums.TLElementTypes.PARENT, anychart.enums.GanttDataFields.ACTUAL);

    var progressValue = goog.isDef(dataItem.meta(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
        dataItem.meta(anychart.enums.GanttDataFields.PROGRESS_VALUE) :
        dataItem.meta('autoProgress');

    if (goog.isDefAndNotNull(progressValue)) { //Draw progress.
      var progressWidth = /** @type {number} */ (progressValue) * actualWidth;
      var progressItemBounds = new anychart.math.Rect(actualBounds.left, actualBounds.top, progressWidth, actualBounds.height);
      var progressBounds = this.getBarBounds_(anychart.enums.TLElementTypes.PROGRESS, progressItemBounds);
      var progressBar = this.drawBar_(progressBounds, dataItem, anychart.enums.TLElementTypes.PROGRESS, anychart.enums.GanttDataFields.PROGRESS);
      progressBar.currBounds = progressBounds;
    }
  }
};


/**
 * Draws data item as progress.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsProgress_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_START) :
      dataItem.meta('autoStart');
  var actualEnd = goog.isNumber(dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      dataItem.meta(anychart.enums.GanttDataFields.ACTUAL_END) :
      dataItem.meta('autoEnd');

  var startRatio = this.scale_.timestampToRatio(actualStart);
  var endRatio = this.scale_.timestampToRatio(actualEnd);

  if (endRatio > 0 && startRatio < 1) { //Is visible
    var b = this.pixelBoundsCache;
    var actualLeft = b.left + b.width * startRatio;
    var actualRight = b.left + b.width * endRatio;
    var actualWidth = actualRight - actualLeft;
    var actualItemBounds = new anychart.math.Rect(actualLeft, totalTop, actualWidth, itemHeight);
    var actualBounds = this.getBarBounds_(anychart.enums.TLElementTypes.BASE, actualItemBounds);

    this.drawBar_(actualBounds, dataItem, anychart.enums.TLElementTypes.BASE, anychart.enums.GanttDataFields.ACTUAL);

    var progressValue = goog.isDef(dataItem.meta(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
        dataItem.meta(anychart.enums.GanttDataFields.PROGRESS_VALUE) :
        dataItem.meta('autoProgress');

    if (goog.isDefAndNotNull(progressValue)) { //Draw progress.
      var progressWidth = /** @type {number} */ (progressValue) * actualWidth;
      var progressItemBounds = new anychart.math.Rect(actualBounds.left, actualBounds.top, progressWidth, actualBounds.height);
      var progressBounds = this.getBarBounds_(anychart.enums.TLElementTypes.PROGRESS, progressItemBounds);
      var progressBar = this.drawBar_(progressBounds, dataItem, anychart.enums.TLElementTypes.PROGRESS, anychart.enums.GanttDataFields.PROGRESS);
      progressBar.currBounds = progressBounds;
    }

  }
};


/**
 * Draws data item as milestone.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} dataItem - Current tree data item.
 * @param {number} totalTop - Pixel value of total top. Is needed to place item correctly.
 * @param {number} itemHeight - Height of row.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawAsMilestone_ = function(dataItem, totalTop, itemHeight) {
  var actualStart = dataItem.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var ratio = this.scale_.timestampToRatio(actualStart);
  if (ratio >= 0 && ratio <= 1) { //Is visible
    var settings = dataItem.get(anychart.enums.GanttDataFields.MILESTONE);

    var stroke = /** @type {acgraph.vector.Stroke} */ (settings && goog.isDef(settings[anychart.enums.GanttDataFields.STROKE]) ?
        acgraph.vector.normalizeStroke(settings[anychart.enums.GanttDataFields.STROKE]) :
        this.milestoneStroke_);

    var lineThickness = anychart.utils.isNone(stroke) ? 0 :
        goog.isString(stroke) ? 1 :
            stroke['thickness'] ? stroke['thickness'] : 1;

    var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;
    var optionHeight = /** @type {string|number} */ (this.getInheritedOption_('milestoneHeight', 'baseBarHeight'));
    var height = anychart.utils.normalizeSize(optionHeight, itemHeight);

    var halfHeight = Math.round(height / 2);

    var centerLeft = Math.round(this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio) + pixelShift;
    var itemBounds = new anychart.math.Rect(centerLeft - halfHeight, totalTop, height, itemHeight);
    var bounds = this.getBarBounds_(anychart.enums.TLElementTypes.MILESTONE, itemBounds);
    var centerTop = Math.round(bounds.top + bounds.height / 2) + pixelShift;

    var milestone = this.genElement_();

    milestone.tag = dataItem.get(anychart.enums.GanttDataFields.ID);
    milestone.type = anychart.enums.TLElementTypes.MILESTONE;
    milestone.item = dataItem;
    milestone.typeLabels = /** @type {anychart.core.ui.LabelsFactory} */ (this.milestoneLabels());

    var left = centerLeft - halfHeight;
    var top = centerTop - halfHeight;
    var right = centerLeft + halfHeight;
    var bottom = centerTop + halfHeight;
    milestone
        .zIndex(anychart.ganttModule.TimeLine.BASE_Z_INDEX)
        .moveTo(left, centerTop) //left corner
        .lineTo(centerLeft, top) //top corner
        .lineTo(right, centerTop) //right corner
        .lineTo(centerLeft, bottom) //bottom corner
        .close();

    milestone.currBounds = bounds;

    this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
    dataItem.meta('relBounds', bounds);
    this.controller.data().resumeSignalsDispatching(false);

    var isSelected = dataItem == this.selectedItem;

    if (settings) {
      var fill;
      if (isSelected) {
        fill = this.selectedElementFill_;
        stroke = this.selectedElementStroke_;

      } else {
        fill = goog.isDef(settings[anychart.enums.GanttDataFields.FILL]) ?
            acgraph.vector.normalizeFill(settings[anychart.enums.GanttDataFields.FILL]) :
            this.milestoneFill_;
      }

      milestone.fill(fill).stroke(stroke);
    } else {
      milestone
          .fill(isSelected ? this.selectedElementFill_ : this.milestoneFill_)
          .stroke(isSelected ? this.selectedElementStroke_ : this.milestoneStroke_);
    }

  }
};


/**
 * Actual top here means top pixel dimension of row on screen (including the row hidden by scroll).
 * @param {number} index - Linear index of item in controller's visible items.
 * @return {number}
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getItemActualTop_ = function(index) {
  var totalTop = /** @type {number} */ (this.pixelBoundsCache.top + this.headerHeight() + 1);
  var heightCache = this.controller.getHeightCache();
  var startIndex = this.controller.startIndex();
  var verticalOffset = this.controller.verticalOffset();

  //relativeHeight in this case is height of rows hidden over the top line of visible area (this.pixelBoundsCache)
  var relativeHeight = startIndex ? heightCache[startIndex - 1] : 0;
  relativeHeight += verticalOffset;

  //Lines below turn heights got from controller to Y-coordinates on screen.
  var relativeTop = index ? heightCache[index - 1] : 0;

  return (relativeTop - relativeHeight) + totalTop;
};


/**
 * Calculates bounds of item in current scale and controller's state depending on item's type.
 *
 * @param {number} index - Linear index of item in controller's visible items. If is period, index
 *  is linear index of treeDataItem that period belongs to.
 * @param {Object=} opt_period - Period object. Required if chart is resources chart.
 * @param {number=} opt_periodIndex - Period index.
 * @return {?anychart.math.Rect} - Bounds in current scale's state or null if data object contains some wrong data.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.getItemBounds_ = function(index, opt_period, opt_periodIndex) {
  var actualTop = this.getItemActualTop_(index);
  var visibleItems = this.controller.getVisibleItems();
  var item = visibleItems[index];
  var rowHeight = this.controller.getItemHeight(item);

  var actStart = goog.isNumber(item.meta(anychart.enums.GanttDataFields.ACTUAL_START)) ?
      item.meta(anychart.enums.GanttDataFields.ACTUAL_START) :
      item.meta('autoStart');

  var actEnd = goog.isNumber(item.meta(anychart.enums.GanttDataFields.ACTUAL_END)) ?
      item.meta(anychart.enums.GanttDataFields.ACTUAL_END) :
      item.meta('autoEnd');

  var startTimestamp = this.controller.isResources() ?
      item.getMeta(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex, anychart.enums.GanttDataFields.START) :
      actStart;

  var endTimestamp = this.controller.isResources() ?
      item.getMeta(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex, anychart.enums.GanttDataFields.END) :
      actEnd;

  var milestoneHalfWidth = 0;
  var isMilestone = false;
  if (anychart.ganttModule.BaseGrid.isMilestone(item)) {
    isMilestone = true;
    endTimestamp = startTimestamp;
    var optionHeight = /** @type {string|number} */ (this.getInheritedOption_('milestoneHeight', 'baseBarHeight'));
    var mHeight = anychart.utils.normalizeSize(optionHeight, rowHeight);
    milestoneHalfWidth = Math.round(mHeight / 2);
  }

  if (isNaN(endTimestamp) || isNaN(startTimestamp)) {
    return null;
  } else {
    var left = this.scale_.timestampToRatio(startTimestamp) * this.pixelBoundsCache.width +
        this.pixelBoundsCache.left - milestoneHalfWidth;
    var right = this.scale_.timestampToRatio(endTimestamp) * this.pixelBoundsCache.width +
        this.pixelBoundsCache.left + milestoneHalfWidth;

    var itemBounds = new anychart.math.Rect(left, actualTop, (right - left), rowHeight);

    if (!this.controller.isResources()) {
      if (isMilestone) {
        return this.getBarBounds_(anychart.enums.TLElementTypes.MILESTONE, itemBounds);
      } else if (goog.isDef(item.get(anychart.enums.GanttDataFields.BASELINE_START)) &&
          goog.isDef(item.get(anychart.enums.GanttDataFields.BASELINE_END))) {
        var type = item.numChildren() ? anychart.enums.TLElementTypes.PARENT : anychart.enums.TLElementTypes.BASE;
        var barBounds = this.getBarBounds_(type, itemBounds, true);
        var baselineBounds = this.getBarBounds_(anychart.enums.TLElementTypes.BASELINE, itemBounds, true);
        this.fixBaselineBarsPositioning_(barBounds, baselineBounds, !!item.numChildren());
        return barBounds;
      } else if (item.numChildren()) {
        return this.getBarBounds_(anychart.enums.TLElementTypes.PARENT, itemBounds);
      } else {
        return this.getBarBounds_(anychart.enums.TLElementTypes.BASE, itemBounds);
      }
    }
    return this.getBarBounds_(anychart.enums.TLElementTypes.PERIOD, itemBounds);
  }
};


/**
 * Connects two bars.
 * @param {Object} from - Start map object. Contains item (or period) to be connected from and it's index.
 *    <code>
 *      {'item':item, 'index':index}
 *        or
 *      {'period':period, 'index':index}.
 *    </code>
 * @param {Object} to - Finish map object. Contains item (or period) to be connected from and it's index. Code is the same.
 * @param {anychart.enums.ConnectorType=} opt_connType - Connection type.
 * @param {Object=} opt_connSettings - Connector visual appearance settings.
 * @param {acgraph.vector.Path=} opt_path - Path to be used. If not set, it will be generated from typed layer.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.connectItems_ = function(from, to, opt_connType, opt_connSettings, opt_path) {
  opt_connType = opt_connType || anychart.enums.ConnectorType.FINISH_START;

  //Here 'to' is {'item':item, 'index':index} or {'period':period, 'index':index, 'periodIndex':index}. 'from' is as well.
  var fromIndex = from['index'];
  var toIndex = to['index'];
  var fromPeriodIndex = from['periodIndex'];
  var toPeriodIndex = to['periodIndex'];
  var visibleItems = this.controller.getVisibleItems();
  var fromItem = visibleItems[fromIndex];
  var toItem = visibleItems[toIndex];

  var fromBounds = this.getItemBounds_(fromIndex, from['period'], fromPeriodIndex);
  var toBounds = this.getItemBounds_(toIndex, to['period'], toPeriodIndex);
  var toRowHeight = this.controller.getItemHeight(toItem);

  if (fromBounds && toBounds) {
    var fill, stroke;

    fill = (opt_connSettings && opt_connSettings[anychart.enums.GanttDataFields.FILL]) ?
        acgraph.vector.normalizeFill(opt_connSettings[anychart.enums.GanttDataFields.FILL]) :
        this.connectorFill_;

    stroke = (opt_connSettings && opt_connSettings[anychart.enums.GanttDataFields.STROKE]) ?
        acgraph.vector.normalizeStroke(opt_connSettings[anychart.enums.GanttDataFields.STROKE]) :
        this.connectorStroke_;

    var drawPreview = goog.isDefAndNotNull(opt_path);

    var fromLeft, fromTop, toLeft, toTop, orientation;
    var am = anychart.ganttModule.TimeLine.ARROW_MARGIN;
    var size = anychart.ganttModule.TimeLine.ARROW_SIZE;
    var path = /** @type {?acgraph.vector.Path} */ (opt_path || null);
    var arrow = drawPreview ? path : null;

    var segmentLeft0, segmentLeft1; //Util variables, temporary segment X-coordinate storage.
    var segmentTop0; //Util variable, temporary segment Y-coordinate storage.
    var aboveSequence = true; //If 'from' bar is above the 'to' bar.

    var lineThickness = anychart.utils.extractThickness(stroke);
    var pixelShift = (lineThickness % 2 && acgraph.type() === acgraph.StageType.SVG) ? 0.5 : 0;
    var toActualTop;

    switch ((opt_connType + '').toLowerCase()) {
      case anychart.enums.ConnectorType.FINISH_FINISH:
        fromLeft = Math.round(fromBounds.left + fromBounds.width) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left + toBounds.width) + pixelShift;
        toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        orientation = anychart.enums.Orientation.LEFT;

        if (fromBounds.top == toBounds.top) { //Same line
          path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
          if (fromLeft > toLeft) orientation = anychart.enums.Orientation.RIGHT;
        } else {
          segmentLeft0 = Math.max(fromLeft + size + am, toLeft + size + am);
          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
          path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
        }
        arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);
        break;

      case anychart.enums.ConnectorType.START_FINISH:
        fromLeft = Math.round(fromBounds.left) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left + toBounds.width) + pixelShift;
        toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        orientation = anychart.enums.Orientation.LEFT;

        if (fromLeft - am - am - size > toLeft) {
          segmentLeft0 = toLeft + am + size;
          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
          path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
        } else {
          aboveSequence = toBounds.top >= fromBounds.top;

          segmentLeft0 = fromLeft - am;
          segmentLeft1 = toLeft + am + size;
          toActualTop = this.getItemActualTop_(toIndex);
          segmentTop0 = Math.round(aboveSequence ? toActualTop : toActualTop + toRowHeight) + pixelShift;

          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
          path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
          path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, toTop, path);
          path = this.drawSegment_(segmentLeft1, toTop, toLeft, toTop, path);
        }

        arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);

        break;

      case anychart.enums.ConnectorType.START_START:
        fromLeft = Math.round(fromBounds.left) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left) + pixelShift;
        toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
        orientation = anychart.enums.Orientation.RIGHT;

        if (fromBounds.top == toBounds.top) { //Same line
          path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
          if (fromLeft > toLeft) orientation = anychart.enums.Orientation.LEFT;
        } else {
          segmentLeft0 = Math.min(fromLeft - size - am, toLeft - size - am);
          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, toTop, path);
          path = this.drawSegment_(segmentLeft0, toTop, toLeft, toTop, path);
        }
        arrow = this.drawArrow_(toLeft, toTop, orientation, arrow);
        break;

      default: //anychart.enums.ConnectorType.FINISH_START:
        fromLeft = Math.round(fromBounds.left + fromBounds.width) + pixelShift;
        fromTop = Math.round(fromBounds.top + fromBounds.height / 2) + pixelShift;
        toLeft = Math.round(toBounds.left) + pixelShift;
        var extraEndY;

        if (toLeft >= fromLeft) {
          toLeft = Math.min(toLeft + am, Math.round(toBounds.left + toBounds.width / 2) + pixelShift);
          if (toBounds.top > fromBounds.top) {
            extraEndY = Math.round(toBounds.top) + pixelShift;
            path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
            path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
            arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.BOTTOM, arrow);
          } else if (toBounds.top < fromBounds.top) {
            extraEndY = Math.round(toBounds.top + toBounds.height) + pixelShift;
            path = this.drawSegment_(fromLeft, fromTop, toLeft, fromTop, path);
            path = this.drawSegment_(toLeft, fromTop, toLeft, extraEndY, path);
            arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.TOP, arrow);
          } else { //Same line
            toLeft = Math.round(toBounds.left) + pixelShift;
            toTop = Math.round(toBounds.top + toBounds.height / 2) + pixelShift;
            path = this.drawSegment_(fromLeft, fromTop, toLeft, toTop, path);
            arrow = this.drawArrow_(toLeft, toTop, anychart.enums.Orientation.RIGHT, arrow);
          }

        } else { //if toLeft < fromLeft
          extraEndY = Math.round(toBounds.top + toBounds.height / 2);
          toActualTop = this.getItemActualTop_(toIndex) + pixelShift;

          segmentTop0 = Math.round((toBounds.top > fromBounds.top) ? toActualTop : (toActualTop + toRowHeight)) + pixelShift;
          segmentLeft0 = fromLeft + am;
          segmentLeft1 = toLeft - am - size;

          path = this.drawSegment_(fromLeft, fromTop, segmentLeft0, fromTop, path);
          path = this.drawSegment_(segmentLeft0, fromTop, segmentLeft0, segmentTop0, path);
          path = this.drawSegment_(segmentLeft0, segmentTop0, segmentLeft1, segmentTop0, path);
          path = this.drawSegment_(segmentLeft1, segmentTop0, segmentLeft1, extraEndY, path);
          path = this.drawSegment_(segmentLeft1, extraEndY, toLeft, extraEndY, path);

          arrow = this.drawArrow_(toLeft, extraEndY, anychart.enums.Orientation.RIGHT, arrow);
        }
    }

    var meta = {
      'fromItemIndex': fromIndex,
      'toItemIndex': toIndex,
      'connType': opt_connType,
      'fromItem': fromItem,
      'toItem': toItem
    };

    var connectorHighlight = !goog.isNull(this.selectedConnectorData_) &&
        this.selectedConnectorData_['fromItemIndex'] == meta['fromItemIndex'] &&
        this.selectedConnectorData_['toItemIndex'] == meta['toItemIndex'] &&
        this.selectedConnectorData_['connType'] == meta['connType'];

    if (this.controller.isResources()) {
      meta['fromPeriodIndex'] = fromPeriodIndex;
      meta['toPeriodIndex'] = toPeriodIndex;
      if (this.selectedConnectorData_) {
        connectorHighlight &= (this.selectedConnectorData_['fromPeriodIndex'] == meta['fromPeriodIndex'] && this.selectedConnectorData_['toPeriodIndex'] == meta['toPeriodIndex']);
      }
    }

    if (path && !drawPreview) {
      path.stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
      path.tag = void 0; //Tooltip will not appear on connector mouse over.
      path.type = anychart.enums.TLElementTypes.CONNECTOR;
      path.currBounds = null;
      path.cursor(this.editable ? acgraph.vector.Cursor.POINTER : acgraph.vector.Cursor.DEFAULT);
      meta['path'] = path;
      path.meta = meta;
      path.stroke(connectorHighlight ? this.selectedConnectorStroke_ : /** @type {acgraph.vector.Stroke} */ (stroke));
    }
    if (arrow && !drawPreview) {
      arrow.fill(/** @type {acgraph.vector.Fill} */ (fill)).stroke(/** @type {acgraph.vector.Stroke} */ (stroke));
      arrow.tag = void 0; //Tooltip will not appear on connector arrow mouse over.
      arrow.type = anychart.enums.TLElementTypes.CONNECTOR;
      arrow.currBounds = null;
      arrow.cursor(this.editable ? acgraph.vector.Cursor.POINTER : acgraph.vector.Cursor.DEFAULT);
      meta['arrow'] = arrow;
      arrow.meta = meta;
      arrow.stroke(connectorHighlight ? this.selectedConnectorStroke_ : /** @type {acgraph.vector.Stroke} */ (stroke));
    }
  }
};


/**
 * Draws connectors.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawConnectors_ = function() {
  var connectorsData = this.controller.getConnectorsData();

  var l = connectorsData.length;
  var connData;

  var map = this.controller.isResources() ? this.controller.getPeriodsMap() : this.controller.getVisibleItemsMap();

  while (l--) {
    connData = connectorsData[l];
    var to = connData['to'];
    if (!goog.isObject(to)) to = map[to]; //destination becomes an object instead of string.

    if (goog.isDef(to)) {
      connData['to'] = to; //Replacing a string record with link to object for further connectors draw cycles.

      this.connectItems_(connData['from'], to, connData['type'], connData['connSettings']);
    } else {
      /*
        Destination is not found. We don't need this connector record anymore.
        Destination can be not found in two cases:
          1) Wrong incoming data.
          2) Destination is currently hidden by collapsed parent.
       In both cases we do not need this connectors record at all.
      */
      goog.array.splice(connectorsData, l, 1);
    }
  }
};


/**
 * Draws a segment of connector.
 * @param {number} fromLeft - Start left coordinate.
 * @param {number} fromTop - Start top coordinate.
 * @param {number} toLeft - End left coordinate.
 * @param {number} toTop - End top coordinate.
 * @param {acgraph.vector.Path} path - Path to be drawn.
 * @return {acgraph.vector.Path} - If the segment is drawn, return a path for connector.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawSegment_ = function(fromLeft, fromTop, toLeft, toTop, path) {
  /*
    Here we should know that connector basically can be drawn maximum in 5 segments:

                         +---------------+
                         |               | 1
                         |               +---+
                         |               |   |
                         +---------------+   | 2
                                             |
            +--------------- 3 --------------+
            |
          4 |     +-------------+
            |     |             |
            +---> +             |
              5   |             |
                  +-------------+


    Path will be drawn anyway in case:
    1) We draw a segment only if it is visible.
    2) If a segment becomes visible, it means that even if one of the next segments becomes invisible, we should not lose
    the sequence of segments to avoid appearance of diagonal connectors.
   */

  if (path) {
    try {
      path.lineTo(toLeft, toTop);
    } catch (e) {
      path
          .moveTo(fromLeft, fromTop)
          .lineTo(toLeft, toTop);
    }

  } else {
    var left = Math.min(fromLeft, toLeft);
    var right = Math.max(fromLeft, toLeft);
    var top = Math.min(fromTop, toTop);
    var bottom = Math.max(fromTop, toTop);

    if (left < (this.pixelBoundsCache.left + this.pixelBoundsCache.width) &&
        right > this.pixelBoundsCache.left &&
        top < (this.pixelBoundsCache.top + this.pixelBoundsCache.height) &&
        bottom > this.pixelBoundsCache.top) { //Segment or the part of it is visible.

      //path = /** @type {acgraph.vector.Path} */ (this.getDrawLayer().genNextChild());
      path = this.genElement_();
      path.type = anychart.enums.TLElementTypes.CONNECTOR;

      path
          .zIndex(anychart.ganttModule.TimeLine.CONNECTOR_Z_INDEX)
          .moveTo(fromLeft, fromTop)
          .lineTo(toLeft, toTop);
    }
  }

  return path;
};


/**
 * Draws an arrow.
 * @param {number} left - Left coordinate.
 * @param {number} top - Top coordinate.
 * @param {anychart.enums.Orientation} orientation - Arrow direction.
 * @param {acgraph.vector.Path=} opt_path - Path to be used.
 * @private
 * @return {acgraph.vector.Path} - Arrow path or null if path is not drawn.
 */
anychart.ganttModule.TimeLine.prototype.drawArrow_ = function(left, top, orientation, opt_path) {
  var drawPreview = goog.isDefAndNotNull(opt_path);

  var path = /** @type {?acgraph.vector.Path} */ (opt_path || null);

  if (left >= this.pixelBoundsCache.left &&
      left <= this.pixelBoundsCache.left + this.pixelBoundsCache.width &&
      top >= this.pixelBoundsCache.top &&
      top <= this.pixelBoundsCache.top + this.pixelBoundsCache.height) { //Is in visible area.

    var arrSize = anychart.ganttModule.TimeLine.ARROW_SIZE;
    var left1 = 0;
    var top1 = 0;
    var left2 = 0;
    var top2 = 0;

    switch (orientation) {
      case anychart.enums.Orientation.LEFT:
        left = left + 1;
        left1 = left + arrSize;
        top1 = top - arrSize;
        left2 = left1;
        top2 = top + arrSize;
        break;
      case anychart.enums.Orientation.TOP:
        top = top + 1;
        left1 = left - arrSize;
        top1 = top + arrSize;
        left2 = left + arrSize;
        top2 = top1;
        break;
      case anychart.enums.Orientation.RIGHT:
        left = left - 1;
        left1 = left - arrSize;
        top1 = top - arrSize;
        left2 = left1;
        top2 = top + arrSize;
        break;
      case anychart.enums.Orientation.BOTTOM:
        top = top - 1;
        left1 = left - arrSize;
        top1 = top - arrSize;
        left2 = left + arrSize;
        top2 = top1;
        break;
    }

    if (!drawPreview) {
      //path = /** @type {acgraph.vector.Path} */ (this.getDrawLayer().genNextChild());
      path = this.genElement_();
      path.type = anychart.enums.TLElementTypes.CONNECTOR;
    }
    path
        .zIndex(anychart.ganttModule.TimeLine.ARROW_Z_INDEX)
        .moveTo(left, top)
        .lineTo(left1, top1)
        .lineTo(left2, top2)
        .lineTo(left, top);

  }

  return path;
};


/**
 * Redraws vertical lines.
 * @param {Array.<number>} ticks - Ticks.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawLowTicks_ = function(ticks) {
  if (ticks.length) {
    var path = this.getSeparationPath_().clear();

    for (var i = 0, l = ticks.length - 1; i < l; i++) {
      var tick = ticks[i];
      var ratio = this.scale_.timestampToRatio(tick);
      var left = this.pixelBoundsCache.left + this.pixelBoundsCache.width * ratio;
      path
          .moveTo(left, this.pixelBoundsCache.top + /** @type {number} */ (this.headerHeight()) + 1)
          .lineTo(left, this.pixelBoundsCache.top + this.pixelBoundsCache.height);
    }
  }
};


/**
 * Recalculates scale depending on current controller's state.
 */
anychart.ganttModule.TimeLine.prototype.initScale = function() {
  var newScale = this.scale_.isEmpty();
  var range = this.scale_.getRange();

  var dataMin = this.controller.getMinDate();
  var dataMax = this.controller.getMaxDate();
  this.scale_.suspendSignalsDispatching();
  this.scale_.setDataRange(dataMin, dataMax);

  //Without these settings scale will not be able to calculate ratio by anychart.enums.GanttDateTimeMarkers.
  this.scale_.trackedDataMin = dataMin;
  this.scale_.trackedDataMax = dataMax;

  if (newScale && !isNaN(dataMin) && !isNaN(dataMax)) {
    var totalRange = this.scale_.getTotalRange();
    var newRange = Math.round((totalRange['max'] - totalRange['min']) / 10);
    this.scale_.zoomTo(totalRange['min'], totalRange['min'] + newRange); // Initial visible range: 10% of total range.
  }

  if (!newScale) {
    var max = range['max'];
    var min = range['min'];
    var delta = max - min;

    if (delta) { //this saves currently visible range after totalRange changes.
      range = this.scale_.getRange();
      min = range['min'];
      this.scale_.zoomTo(min, min + delta);
    }
  }

  this.scale_.resumeSignalsDispatching(true);
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.initDom = function() {
  this.getClipLayer().zIndex(anychart.ganttModule.BaseGrid.DRAW_Z_INDEX - 1); //Put it under draw layer.
  this.markers().container(this.getContentLayer());
  this.labels().container(this.getContentLayer());
  this.header().container(this.getBase());
  this.initScale();
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.boundsInvalidated = function() {
  this.header()
      .bounds()
      .set(this.pixelBoundsCache.left, this.pixelBoundsCache.top,
          this.pixelBoundsCache.width, /** @type {number} */ (this.headerHeight()));
  this.redrawHeader = true;
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.appearanceInvalidated = function() {
  this.getSeparationPath_().stroke(this.columnStroke_);

  this.getEditConnectorPreviewPath_()
      .stroke(this.connectorPreviewStroke_);

  this.getEditPreviewPath_()
      .fill(this.editPreviewFill_)
      .stroke(this.editPreviewStroke_);

  this.getEditProgressPath_()
      .fill(this.editProgressFill_)
      .stroke(this.editProgressStroke_);

  this.getEditLeftThumbPath_()
      .fill(this.editIntervalThumbFill_)
      .stroke(this.editIntervalThumbStroke_);

  this.getEditRightThumbPath_()
      .fill(this.editIntervalThumbFill_)
      .stroke(this.editIntervalThumbStroke_);

  this.getEditStartConnectorPath_()
      .fill(this.editConnectorThumbFill_)
      .stroke(this.editConnectorThumbStroke_);

  this.getEditFinishConnectorPath_()
      .fill(this.editConnectorThumbFill_)
      .stroke(this.editConnectorThumbStroke_);
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.specialInvalidated = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TIMELINE_SCALES)) {
    this.redrawPosition = true;
    this.redrawHeader = true;
    this.markConsistent(anychart.ConsistencyState.TIMELINE_SCALES);
  }

  if (this.redrawHeader) {
    this.header().invalidate(anychart.ConsistencyState.TIMELINE_HEADER_SCALES);
    this.header_.draw();
    var level, ticks = [];
    if (this.header_.lowLevel().enabled()) {
      level = this.header_.lowLevel();
    } else if (this.header_.midLevel().enabled()) {
      level = this.header_.midLevel();
    } else if (this.header_.topLevel().enabled()) {
      level = this.header_.topLevel();
    }

    if (level)
      ticks = level.getTicks();

    this.drawLowTicks_(ticks);

    var totalRange = this.scale_.getTotalRange();
    var visibleRange = this.scale_.getRange();

    var totMin = this.scale_.timestampToRatio(totalRange['min']) * this.pixelBoundsCache.width;
    var totMax = this.scale_.timestampToRatio(totalRange['max']) * this.pixelBoundsCache.width;
    var visibleMin = this.scale_.timestampToRatio(visibleRange['min']) * this.pixelBoundsCache.width;
    var visibleMax = this.scale_.timestampToRatio(visibleRange['max']) * this.pixelBoundsCache.width;

    if (this.horizontalScrollBar_) {
      var contentBoundsSimulation = new anychart.math.Rect(totMin, 0, totMax - totMin, 0);
      var visibleBoundsSimulation = new anychart.math.Rect(visibleMin, 0, visibleMax - visibleMin, 0);

      this.horizontalScrollBar_
          .suspendSignalsDispatching()
          .handlePositionChange(false)
          .contentBounds(contentBoundsSimulation)
          .visibleBounds(visibleBoundsSimulation)
          .draw()
          .handlePositionChange(true)
          .resumeSignalsDispatching(false);

      if (this.horizontalScrollBar_.container()) this.horizontalScrollBar_.draw();
    }
  }
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.prototype.positionFinal = function() {
  if (this.redrawPosition || this.redrawHeader) {
    this.drawTimelineElements_();
    this.drawLabels_(void 0, true);

    this.redrawHeader = false;

    var dataBounds = new anychart.math.Rect(this.pixelBoundsCache.left,
        (this.pixelBoundsCache.top + /** @type {number} */ (this.headerHeight()) + 1),
        this.pixelBoundsCache.width,
        this.totalGridsHeight);

    for (var i = 0; i < this.textMarkers_.length; i++) {
      var textMarker = this.textMarkers_[i];
      textMarker.suspendSignalsDispatching();
      textMarker.parentBounds(dataBounds);
      textMarker.resumeSignalsDispatching(false);
      textMarker.draw();
    }
  }
};


/**
 * Draws labels.
 * @param {anychart.SignalEvent=} opt_event - Event object.
 * @param {boolean=} opt_skipDrawing - Whether to skip labels suspension and this.labels().draw().
 * @private
 */
anychart.ganttModule.TimeLine.prototype.drawLabels_ = function(opt_event, opt_skipDrawing) {
  this.labels().suspendSignalsDispatching();
  this.labels().clear();
  for (var i = 0; i < this.visElements_.length; i++) {
    var el = this.visElements_[i];
    if (el.type == anychart.enums.TLElementTypes.CONNECTOR || !el.item)
      continue;

    var context = this.createFormatProvider(el.item, el.period, el.periodIndex);
    el.label = this.labels().add(context, {
      'value': {
        'x': 0,
        'y': 0
      }
    });

    var pointLabels = el.labelPointSettings;
    var typeLabels = el.typeLabels;
    var normalLabels = this.labels();

    var pointLabelsEnabled = pointLabels && goog.isDef(pointLabels['enabled']) ? pointLabels['enabled'] : null;
    var typeLabelsEnabled = typeLabels && goog.isDef(typeLabels.enabled()) ? typeLabels.enabled() : null;

    var draw = false;
    if (goog.isNull(pointLabelsEnabled)) {
      if (goog.isNull(typeLabelsEnabled)) {
        draw = normalLabels.enabled();
      } else {
        draw = typeLabelsEnabled;
      }
    } else {
      draw = pointLabelsEnabled;
    }

    if (draw) {
      // var rect = this.getContentLayer().rect(el.currBounds.left, el.currBounds.top, el.currBounds.width, el.currBounds.height);
      // rect.stroke('2px green');

      el.label.resetSettings();
      el.label.enabled(true);

      el.label.state('labelOwnSettings', el.label.ownSettings, 0);
      el.label.state('pointState', pointLabels, 1);
      el.label.state('typeLabels', typeLabels, 2);
      el.label.state('normalLabels', normalLabels, 3);
      el.label.state('typeThemeLabels', typeLabels.themeSettings, 4);
      el.label.state('normalThemeLabels', normalLabels.themeSettings, 5);

      var position = anychart.enums.normalizeAnchor(el.label.getFinalSettings('position'));
      var positionProvider = {'value': anychart.utils.getCoordinateByAnchor(el.currBounds, position)};
      el.label.positionProvider(positionProvider);

      var values = context.values();
      values['label'] = {value: el.label, type: anychart.enums.TokenType.UNKNOWN};
      context.propagate();

      el.label.formatProvider(context);

      this.controller.data().suspendSignalsDispatching();//this.controller.data() can be Tree or TreeView.
      el.item.meta('label', el.label);
      this.controller.data().resumeSignalsDispatching(false);
    } else {
      el.label.enabled(false);
    }
    el.label.draw();
  }

  this.labels().resumeSignalsDispatching(!opt_skipDrawing);
  this.labels().draw();
  this.baseLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.baselineLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.parentLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.milestoneLabels().markConsistent(anychart.ConsistencyState.ALL);
  this.progressLabels().markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.TimeLine.prototype.deleteKeyHandler = function(e) {
  if (this.selectedConnectorData_) {
    var fromItemIndex = this.selectedConnectorData_['fromItemIndex'];
    var toItemIndex = this.selectedConnectorData_['toItemIndex'];
    var connType = this.selectedConnectorData_['connType'];
    var visibleItems = this.controller.getVisibleItems();
    var fromItem = visibleItems[fromItemIndex];
    var toItem = visibleItems[toItemIndex];
    var i = 0;

    if (this.controller.isResources()) {
      var fromPeriodIndex = this.selectedConnectorData_['fromPeriodIndex'];
      var fromPeriods = fromItem.get(anychart.enums.GanttDataFields.PERIODS);
      var fromPeriod = fromPeriods[fromPeriodIndex];
      var fromPeriodConnectors = fromPeriod[anychart.enums.GanttDataFields.CONNECTOR];

      var toPeriods = toItem.get(anychart.enums.GanttDataFields.PERIODS);
      var toPeriod = toPeriods[this.selectedConnectorData_['toPeriodIndex']];
      var toPeriodId = toPeriod[anychart.enums.GanttDataFields.ID];

      if (goog.isArray(fromPeriodConnectors)) {
        for (i = 0; i < fromPeriodConnectors.length; i++) {//New behaviour.
          var perConn = fromPeriodConnectors[i];
          if (perConn) {
            var perId = perConn[anychart.enums.GanttDataFields.CONNECT_TO];
            var perConnType = perConn[anychart.enums.GanttDataFields.CONNECTOR_TYPE] ||
                anychart.enums.ConnectorType.FINISH_START;
            if (perId == toPeriodId && perConnType == connType) {
              fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECTOR, i);
            }
          }
        }
      } else { //Old behaviour.
        fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECTOR);
        fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECTOR_TYPE);
        fromItem.del(anychart.enums.GanttDataFields.PERIODS, fromPeriodIndex, anychart.enums.GanttDataFields.CONNECT_TO);
      }
    } else {
      var toItemId = toItem.get(anychart.enums.GanttDataFields.ID);
      var connectors = fromItem.get(anychart.enums.GanttDataFields.CONNECTOR);
      if (goog.isArray(connectors)) { //New behaviour.
        for (i = 0; i < connectors.length; i++) {
          var connector = connectors[i];
          if (connector) {
            var currentConnType = connector[anychart.enums.GanttDataFields.CONNECTOR_TYPE] ||
                anychart.enums.ConnectorType.FINISH_START;
            if (toItemId == connector[anychart.enums.GanttDataFields.CONNECT_TO] && currentConnType == connType) {
              fromItem.del(anychart.enums.GanttDataFields.CONNECTOR, i);
            }
          }
        }
      } else { //Old behaviour.
        fromItem.del(anychart.enums.GanttDataFields.CONNECTOR);
        fromItem.del(anychart.enums.GanttDataFields.CONNECTOR_TYPE);
        fromItem.del(anychart.enums.GanttDataFields.CONNECT_TO);
      }
    }

    this.selectedConnectorData_ = null;
  }
};


/**
 * Vertical scrollBar.
 * @param {Object=} opt_value Object with settings.
 * @return {anychart.ganttModule.TimeLine|anychart.ganttModule.ScrollBar} ScrollBar or self for chaining.
 */
anychart.ganttModule.TimeLine.prototype.verticalScrollBar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.controller.getScrollBar().setup(opt_value);
    return this;
  }
  return this.controller.getScrollBar();
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.horizontalScrollBar = function(opt_value) {
  if (!this.horizontalScrollBar_) {
    this.horizontalScrollBar_ = new anychart.ganttModule.ScrollBar();
    this.horizontalScrollBar_.layout(anychart.enums.Layout.HORIZONTAL);

    var scale = this.scale_;
    this.horizontalScrollBar_.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
      var startRatio = e['startRatio'];
      var endRatio = e['endRatio'];

      var range = scale.getTotalRange();
      var totalMin = range['min'];
      var totalMax = range['max'];
      var msRange = totalMax - totalMin;
      var start = Math.round(totalMin + startRatio * msRange);
      var end = Math.round(totalMin + endRatio * msRange);
      scale.setRange(start, end);
    });

    this.horizontalScrollBar_.listenSignals(this.scrollBarInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.horizontalScrollBar_.setup(opt_value);
    return this;
  }

  return this.horizontalScrollBar_;
};


/**
 * Scrollbar invalidation.
 * @param {anychart.SignalEvent} e Event.
 * @private
 */
anychart.ganttModule.TimeLine.prototype.scrollBarInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED))
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Performs scroll to pixel offsets.
 * @param {number} horizontalPixelOffset - Horizontal pixel offset.
 * @param {number} verticalPixelOffset - Vertical pixel offset.
 * @param {boolean=} opt_dragScrolling - Whether TL is in drag scrolling.
 */
anychart.ganttModule.TimeLine.prototype.scroll = function(horizontalPixelOffset, verticalPixelOffset, opt_dragScrolling) {
  anychart.core.Base.suspendSignalsDispatching(this, this.scale_, this.controller);

  if (!opt_dragScrolling) {
    this.dragging = false;
    clearInterval(this.scrollInterval);
    this.scrollInterval = null;
    this.clearEdit_();
  }

  var startIndex = this.controller.startIndex();
  var heightCache = this.controller.getHeightCache();
  var verticalOffset = this.controller.verticalOffset();

  var totalVerticalStartOffset = startIndex ? heightCache[startIndex - 1] : 0;
  totalVerticalStartOffset += (verticalOffset + verticalPixelOffset);
  this.controller.scrollTo(/** @type {number} */ (totalVerticalStartOffset));

  var ratio = horizontalPixelOffset / this.pixelBoundsCache.width;
  if (opt_dragScrolling && !this.draggingConnector && (this.currentThumbDragger_ || this.draggingPreview)) {
    this.scale_.ratioForceScroll(ratio);
  } else if (this.draggingConnector || (this.dragging && this.draggingItem) || (!this.dragging)) {
    this.scale_.ratioScroll(ratio);
  }

  anychart.core.Base.resumeSignalsDispatchingTrue(this, this.scale_, this.controller);
};


/**
 * Gets timeline scale.
 * @param {Object=} opt_value - Scale config.
 * @return {anychart.ganttModule.TimeLine|anychart.ganttModule.Scale}
 */
anychart.ganttModule.TimeLine.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.scale_.setup(opt_value);
    return this;
  }
  return this.scale_;
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.serialize = function() {
  var json = anychart.ganttModule.TimeLine.base(this, 'serialize');

  anychart.core.settings.serialize(this, anychart.ganttModule.TimeLine.DESCRIPTORS, json);

  json['scale'] = this.scale_.serialize();

  json['labels'] = this.labels().serialize();

  var baseLabelsConf = this.baseLabels().serialize();
  if (!goog.object.isEmpty(baseLabelsConf))
    json['baseLabels'] = baseLabelsConf;

  var parentLabelsConf = this.parentLabels().serialize();
  if (!goog.object.isEmpty(parentLabelsConf))
    json['parentLabels'] = parentLabelsConf;

  var baselineLabelsConf = this.baselineLabels().serialize();
  if (!goog.object.isEmpty(baselineLabelsConf))
    json['baselineLabels'] = baselineLabelsConf;

  var milestonesLabelsConf = this.milestoneLabels().serialize();
  if (!goog.object.isEmpty(milestonesLabelsConf))
    json['milestoneLabels'] = milestonesLabelsConf;


  var progressLabelsConf = this.progressLabels().serialize();
  if (!goog.object.isEmpty(progressLabelsConf))
    json['progressLabels'] = progressLabelsConf;

  json['markers'] = this.markers().serialize();

  json['header'] = this.header().serialize();

  json['columnStroke'] = anychart.color.serialize(this.columnStroke_);

  json['baselineAbove'] = this.baselineAbove_;

  json['baseFill'] = anychart.color.serialize(this.baseFill_);
  json['baseStroke'] = anychart.color.serialize(this.baseStroke_);
  json['baselineFill'] = anychart.color.serialize(this.baselineFill_);
  json['baselineStroke'] = anychart.color.serialize(this.baselineStroke_);
  json['milestoneFill'] = anychart.color.serialize(this.milestoneFill_);
  json['milestoneStroke'] = anychart.color.serialize(this.milestoneStroke_);
  json['parentFill'] = anychart.color.serialize(this.parentFill_);
  json['parentStroke'] = anychart.color.serialize(this.parentStroke_);
  json['progressFill'] = anychart.color.serialize(this.progressFill_);
  json['progressStroke'] = anychart.color.serialize(this.progressStroke_);
  json['connectorFill'] = anychart.color.serialize(this.connectorFill_);
  json['connectorStroke'] = anychart.color.serialize(this.connectorStroke_);
  json['selectedElementFill'] = anychart.color.serialize(this.selectedElementFill_);
  json['selectedElementStroke'] = anychart.color.serialize(this.selectedElementStroke_);
  json['selectedConnectorStroke'] = anychart.color.serialize(this.selectedConnectorStroke_);

  json['connectorPreviewStroke'] = anychart.color.serialize(this.connectorPreviewStroke_);
  json['editPreviewFill'] = anychart.color.serialize(this.editPreviewFill_);
  json['editPreviewStroke'] = anychart.color.serialize(this.editPreviewStroke_);
  json['editProgressFill'] = anychart.color.serialize(this.editProgressFill_);
  json['editProgressStroke'] = anychart.color.serialize(this.editProgressStroke_);
  json['editIntervalThumbFill'] = anychart.color.serialize(this.editIntervalThumbFill_);
  json['editIntervalThumbStroke'] = anychart.color.serialize(this.editIntervalThumbStroke_);
  json['editConnectorThumbFill'] = anychart.color.serialize(this.editConnectorThumbFill_);
  json['editConnectorThumbStroke'] = anychart.color.serialize(this.editConnectorThumbStroke_);

  json['editStartConnectorMarkerType'] = this.editStartConnectorMarkerType_;
  json['editStartConnectorMarkerSize'] = this.editStartConnectorMarkerSize_;
  json['editStartConnectorMarkerHorizontalOffset'] = this.editStartConnectorMarkerHorizontalOffset_;
  json['editStartConnectorMarkerVerticalOffset'] = this.editStartConnectorMarkerVerticalOffset_;
  json['editFinishConnectorMarkerType'] = this.editFinishConnectorMarkerType_;
  json['editFinishConnectorMarkerSize'] = this.editFinishConnectorMarkerSize_;
  json['editFinishConnectorMarkerHorizontalOffset'] = this.editFinishConnectorMarkerHorizontalOffset_;
  json['editFinishConnectorMarkerVerticalOffset'] = this.editFinishConnectorMarkerVerticalOffset_;
  json['editIntervalWidth'] = this.editIntervalWidth_;

  var i = 0;
  var lineMarkers = [];
  for (i = 0; i < this.lineMarkers_.length; i++) {
    var lineMarker = this.lineMarkers_[i];
    if (lineMarker) lineMarkers.push(lineMarker.serialize());
  }
  if (lineMarkers.length) json['lineAxesMarkers'] = lineMarkers;

  var rangeMarkers = [];
  for (i = 0; i < this.rangeMarkers_.length; i++) {
    var rangeMarker = this.rangeMarkers_[i];
    if (rangeMarker) rangeMarkers.push(rangeMarker.serialize());
  }
  if (rangeMarkers.length) json['rangeAxesMarkers'] = rangeMarkers;

  var textMarkers = [];
  for (i = 0; i < this.textMarkers_.length; i++) {
    var textMarker = this.textMarkers_[i];
    if (textMarker) textMarkers.push(textMarker.serialize());
  }
  if (textMarkers.length) json['textAxesMarkers'] = textMarkers;

  if (this.horizontalScrollBar_)
    json['horizontalScrollBar'] = this.horizontalScrollBar().serialize();

  json['verticalScrollBar'] = this.verticalScrollBar().serialize();

  return json;
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.TimeLine.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    anychart.core.settings.copy(this.themeSettings, anychart.ganttModule.TimeLine.DESCRIPTORS, config);
  } else {
    anychart.core.settings.deserialize(this, anychart.ganttModule.TimeLine.DESCRIPTORS, config);
  }

  if ('scale' in config) this.scale_.setup(config['scale']);

  this.labels().setupInternal(!!opt_default, config['labels']);
  this.baseLabels().setupInternal(!!opt_default, config['baseLabels']);
  this.baselineLabels().setupInternal(!!opt_default, config['baselineLabels']);
  this.parentLabels().setupInternal(!!opt_default, config['parentLabels']);
  this.milestoneLabels().setupInternal(!!opt_default, config['milestoneLabels']);
  this.progressLabels().setupInternal(!!opt_default, config['progressLabels']);

  if ('markers' in config) this.markers(config['markers']);
  if ('header' in config) this.header(config['header']);

  this.columnStroke(config['columnStroke']);
  this.baselineAbove(config['baselineAbove']);

  this.baseFill(config['baseFill']);
  this.baseStroke(config['baseStroke']);
  this.baselineFill(config['baselineFill']);
  this.baselineStroke(config['baselineStroke']);
  this.milestoneFill(config['milestoneFill']);
  this.milestoneStroke(config['milestoneStroke']);
  this.parentFill(config['parentFill']);
  this.parentStroke(config['parentStroke']);
  this.progressFill(config['progressFill']);
  this.progressStroke(config['progressStroke']);
  this.connectorFill(config['connectorFill']);
  this.connectorStroke(config['connectorStroke']);
  this.selectedElementFill(config['selectedElementFill']);
  this.selectedElementStroke(config['selectedElementStroke']);
  this.selectedConnectorStroke(config['selectedConnectorStroke']);

  this.connectorPreviewStroke(config['connectorPreviewStroke']);
  this.editPreviewFill(config['editPreviewFill']);
  this.editPreviewStroke(config['editPreviewStroke']);
  this.editProgressFill(config['editProgressFill']);
  this.editProgressStroke(config['editProgressStroke']);
  this.editIntervalThumbFill(config['editIntervalThumbFill']);
  this.editIntervalThumbStroke(config['editIntervalThumbStroke']);
  this.editConnectorThumbFill(config['editConnectorThumbFill']);
  this.editConnectorThumbStroke(config['editConnectorThumbStroke']);

  this.editStartConnectorMarkerType(config['editStartConnectorMarkerType']);
  this.editStartConnectorMarkerSize(config['editStartConnectorMarkerSize']);
  this.editStartConnectorMarkerHorizontalOffset(config['editStartConnectorMarkerHorizontalOffset']);
  this.editStartConnectorMarkerVerticalOffset(config['editStartConnectorMarkerVerticalOffset']);
  this.editFinishConnectorMarkerType(config['editFinishConnectorMarkerType']);
  this.editFinishConnectorMarkerSize(config['editFinishConnectorMarkerSize']);
  this.editFinishConnectorMarkerHorizontalOffset(config['editFinishConnectorMarkerHorizontalOffset']);
  this.editFinishConnectorMarkerVerticalOffset(config['editFinishConnectorMarkerVerticalOffset']);
  this.editIntervalWidth(config['editIntervalWidth']);

  if ('defaultLineMarkerSettings' in config)
    this.defaultLineMarkerSettings(config['defaultLineMarkerSettings']);

  if ('defaultRangeMarkerSettings' in config)
    this.defaultRangeMarkerSettings(config['defaultRangeMarkerSettings']);

  if ('defaultTextMarkerSettings' in config)
    this.defaultTextMarkerSettings(config['defaultTextMarkerSettings']);

  var lineAxesMarkers = config['lineAxesMarkers'];
  var rangeAxesMarkers = config['rangeAxesMarkers'];
  var textAxesMarkers = config['textAxesMarkers'];

  var i = 0;
  if (goog.isArray(lineAxesMarkers)) {
    for (i = 0; i < lineAxesMarkers.length; i++) {
      this.lineMarker(i, lineAxesMarkers[i]);
    }
  }

  if (goog.isArray(rangeAxesMarkers)) {
    for (i = 0; i < rangeAxesMarkers.length; i++) {
      this.rangeMarker(i, rangeAxesMarkers[i]);
    }
  }

  if (goog.isArray(textAxesMarkers)) {
    for (i = 0; i < textAxesMarkers.length; i++) {
      this.textMarker(i, textAxesMarkers[i]);
    }
  }

  if ('horizontalScrollBar' in config)
    this.horizontalScrollBar(config['horizontalScrollBar']);

  if ('verticalScrollBar' in config)
    this.verticalScrollBar(config['verticalScrollBar']);
};


/** @inheritDoc */
anychart.ganttModule.TimeLine.prototype.disposeInternal = function() {
  goog.dispose(this.horizontalScrollBar_);
  this.horizontalScrollBar_ = null;
  anychart.ganttModule.TimeLine.base(this, 'disposeInternal');
};



/**
 * Live edit control. Extends path to add some data to be stored in usage process.
 * @param {acgraph.vector.Layer} parent - Parent layer.
 * @constructor
 * @extends {acgraph.vector.Path}
 */
anychart.ganttModule.TimeLine.LiveEditControl = function(parent) {
  anychart.ganttModule.TimeLine.LiveEditControl.base(this, 'constructor');

  this.parent(parent);
};
goog.inherits(anychart.ganttModule.TimeLine.LiveEditControl, acgraph.vector.Path);


/**
 * @type {anychart.treeDataModule.Tree.DataItem}
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.item;


/**
 * @type {number}
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.index = -1;


/**
 * @type {anychart.enums.TLElementTypes|undefined}
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.type;


/**
 * @type {Object}
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.period;


/**
 * @type {number}
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.periodIndex = -1;


/**
 * @type {anychart.math.Rect}
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.bounds;


/**
 * @type {anychart.ganttModule.TimeLine.LiveEditControl}
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.preview;


/**
 * Draws path as circle.
 * @param {number} cx - Center X.
 * @param {number} cy - Center Y.
 * @param {number} radius - Radius.
 * @return {anychart.ganttModule.TimeLine.LiveEditControl} - Itself for method chaining.
 */
anychart.ganttModule.TimeLine.LiveEditControl.prototype.drawAsCircle = function(cx, cy, radius) {
  this
      .moveTo(cx + radius, cy)
      .arcTo(radius, radius, 0, 360);

  return this;
};



/**
 * Bar dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.TimeLine.BarDragger = function(target) {
  anychart.ganttModule.TimeLine.BarDragger.base(this, 'constructor', target.domElement());

  this.element = target;

  /**
   * X.
   * @type {number}
   */
  this.x = 0;

  /**
   * Y.
   * @type {number}
   */
  this.y = 0;
};
goog.inherits(anychart.ganttModule.TimeLine.BarDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.TimeLine.BarDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.BarDragger.prototype.defaultAction = function(x, y) {
  this.element.setTransformationMatrix(1, 0, 0, 1, x, 0);
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.BarDragger.prototype.limitY = function(y) {
  return 0;
};



/**
 * Progress dragger.
 * @param {anychart.ganttModule.TimeLine.LiveEditControl} target - Target element.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.TimeLine.ProgressDragger = function(target) {
  anychart.ganttModule.TimeLine.ProgressDragger.base(this, 'constructor', target.domElement());

  /**
   * Element.
   * @type {anychart.ganttModule.TimeLine.LiveEditControl}
   */
  this.element = target;

  /**
   * Progress value to be applied after edit.
   * @type {number}
   */
  this.progress = NaN;
};
goog.inherits(anychart.ganttModule.TimeLine.ProgressDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.TimeLine.ProgressDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.ProgressDragger.prototype.defaultAction = function(x, y) {
  this.element.setTransformationMatrix(1, 0, 0, 1, x, 0);
  var progressLeft = x - this.limits.left;
  this.progress = progressLeft / this.limits.width;
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.ProgressDragger.prototype.limitX = function(x) {
  var b = this.element.bounds;
  var dataItem = this.element.item;

  var progressValue = goog.isDef(dataItem.meta('progressValue')) ?
      dataItem.meta('progressValue') :
      dataItem.meta('autoProgress');

  progressValue = /** @type {number} */ (progressValue || 0);
  var progress = b.width * progressValue;
  this.limits.left = -progress;
  this.limits.width = b.width;

  return goog.math.clamp(x, -progress, b.width - progress);
};


/**
 * @override
 */
anychart.ganttModule.TimeLine.ProgressDragger.prototype.limitY = function(y) {
  return 0;
};



/**
 * Edit time interval dragger.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {boolean=} opt_isLeft - Whether it is a left-oriented thumb. Otherwise - is right.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.TimeLine.ThumbDragger = function(target, opt_isLeft) {
  anychart.ganttModule.TimeLine.ThumbDragger.base(this, 'constructor', target.domElement());

  /**
   * Element.
   * @type {acgraph.vector.Element}
   */
  this.element = target;

  /**
   * Orientation of thumb.
   * @type {boolean}
   */
  this.isLeft = !!opt_isLeft;

};
goog.inherits(anychart.ganttModule.TimeLine.ThumbDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.TimeLine.ThumbDragger.prototype.limitY = function(y) {
  return 0;
};



/**
 * Edit connector dragger.
 * @param {anychart.ganttModule.TimeLine} timeline - Related TL.
 * @param {acgraph.vector.Element} target - Target element.
 * @param {boolean=} opt_isStart - Whether it is a 'start'-connector. Otherwise - is 'finish'.
 * @constructor
 * @extends {goog.fx.Dragger}
 */
anychart.ganttModule.TimeLine.ConnectorDragger = function(timeline, target, opt_isStart) {
  anychart.ganttModule.TimeLine.ConnectorDragger.base(this, 'constructor', target.domElement());

  /**
   * Related TL.
   * @type {anychart.ganttModule.TimeLine}
   */
  this.timeline = timeline;

  /**
   * Element.
   * @type {acgraph.vector.Element}
   */
  this.element = target;

  /**
   * Orientation of thumb.
   * @type {boolean}
   */
  this.isStart = !!opt_isStart;


  /**
   * Last tracked X coordinate from mouseEvent.
   * @type {number}
   */
  this.lastTrackedMouseX = NaN;


  /**
   * Last tracked Y coordinate from mouseEvent.
   * @type {number}
   */
  this.lastTrackedMouseY = NaN;
};
goog.inherits(anychart.ganttModule.TimeLine.ConnectorDragger, goog.fx.Dragger);


/**
 * @override
 */
anychart.ganttModule.TimeLine.ConnectorDragger.prototype.computeInitialPosition = function() {
  this.deltaX = 0;
  this.deltaY = 0;
};



//region --- Standalone
//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @extends {anychart.ganttModule.TimeLine}
 */
anychart.standalones.ProjectTimeline = function() {
  anychart.standalones.ProjectTimeline.base(this, 'constructor');
};
goog.inherits(anychart.standalones.ProjectTimeline, anychart.ganttModule.TimeLine);
anychart.core.makeStandalone(anychart.standalones.ProjectTimeline, anychart.ganttModule.TimeLine);



/**
 * @constructor
 * @extends {anychart.ganttModule.TimeLine}
 */
anychart.standalones.ResourceTimeline = function() {
  anychart.standalones.ResourceTimeline.base(this, 'constructor', void 0, true);
};
goog.inherits(anychart.standalones.ResourceTimeline, anychart.ganttModule.TimeLine);
anychart.core.makeStandalone(anychart.standalones.ResourceTimeline, anychart.ganttModule.TimeLine);


/**
 * Constructor function.
 * @return {!anychart.standalones.ProjectTimeline}
 */
anychart.standalones.projectTimeline = function() {
  var timeline = new anychart.standalones.ProjectTimeline();
  timeline.setup(anychart.getFullTheme('standalones.projectTimeline'));
  return timeline;
};


/**
 * Constructor function.
 * @return {!anychart.standalones.ResourceTimeline}
 */
anychart.standalones.resourceTimeline = function() {
  var timeline = new anychart.standalones.ResourceTimeline();
  timeline.setup(anychart.getFullTheme('standalones.resourceTimeline'));
  return timeline;
};


//endregion
//exports
(function() {
  var proto = anychart.ganttModule.TimeLine.prototype;
  proto['backgroundFill'] = proto.backgroundFill;
  proto['columnStroke'] = proto.columnStroke;
  proto['rowFill'] = proto.rowFill;
  proto['rowEvenFill'] = proto.rowEvenFill;
  proto['rowOddFill'] = proto.rowOddFill;
  proto['rowHoverFill'] = proto.rowHoverFill;
  proto['rowSelectedFill'] = proto.rowSelectedFill;
  proto['editing'] = proto.editing;

  proto['baselineAbove'] = proto.baselineAbove;

  proto['horizontalScrollBar'] = proto.horizontalScrollBar;
  proto['verticalScrollBar'] = proto.verticalScrollBar;
  proto['baseFill'] = proto.baseFill;
  proto['baseStroke'] = proto.baseStroke;
  proto['baselineFill'] = proto.baselineFill;
  proto['baselineStroke'] = proto.baselineStroke;
  proto['milestoneFill'] = proto.milestoneFill;
  proto['milestoneStroke'] = proto.milestoneStroke;
  proto['parentFill'] = proto.parentFill;
  proto['parentStroke'] = proto.parentStroke;
  proto['progressFill'] = proto.progressFill;
  proto['progressStroke'] = proto.progressStroke;
  proto['connectorFill'] = proto.connectorFill;
  proto['connectorStroke'] = proto.connectorStroke;
  proto['selectedElementFill'] = proto.selectedElementFill;
  proto['selectedElementStroke'] = proto.selectedElementStroke;
  proto['tooltip'] = proto.tooltip;

  proto['labels'] = proto.labels;
  proto['baseLabels'] = proto.baseLabels;
  proto['baselineLabels'] = proto.baselineLabels;
  proto['parentLabels'] = proto.parentLabels;
  proto['milestoneLabels'] = proto.milestoneLabels;
  proto['progressLabels'] = proto.progressLabels;

  proto['markers'] = proto.markers;
  proto['scale'] = proto.scale;

  proto['connectorPreviewStroke'] = proto.connectorPreviewStroke;
  proto['editPreviewFill'] = proto.editPreviewFill;
  proto['editPreviewStroke'] = proto.editPreviewStroke;
  proto['editProgressFill'] = proto.editProgressFill;
  proto['editProgressStroke'] = proto.editProgressStroke;
  proto['editIntervalThumbFill'] = proto.editIntervalThumbFill;
  proto['editIntervalThumbStroke'] = proto.editIntervalThumbStroke;
  proto['editConnectorThumbFill'] = proto.editConnectorThumbFill;
  proto['editConnectorThumbStroke'] = proto.editConnectorThumbStroke;
  proto['editStructurePreviewFill'] = proto.editStructurePreviewFill;
  proto['editStructurePreviewStroke'] = proto.editStructurePreviewStroke;
  proto['editStructurePreviewDashStroke'] = proto.editStructurePreviewDashStroke;

  proto['editStartConnectorMarkerSize'] = proto.editStartConnectorMarkerSize;
  proto['editStartConnectorMarkerType'] = proto.editStartConnectorMarkerType;
  proto['editStartConnectorMarkerHorizontalOffset'] = proto.editStartConnectorMarkerHorizontalOffset;
  proto['editStartConnectorMarkerVerticalOffset'] = proto.editStartConnectorMarkerVerticalOffset;
  proto['editFinishConnectorMarkerSize'] = proto.editFinishConnectorMarkerSize;
  proto['editFinishConnectorMarkerType'] = proto.editFinishConnectorMarkerType;
  proto['editFinishConnectorMarkerHorizontalOffset'] = proto.editFinishConnectorMarkerHorizontalOffset;
  proto['editFinishConnectorMarkerVerticalOffset'] = proto.editFinishConnectorMarkerVerticalOffset;
  proto['editIntervalWidth'] = proto.editIntervalWidth;

  proto['textMarker'] = proto.textMarker;
  proto['lineMarker'] = proto.lineMarker;
  proto['rangeMarker'] = proto.rangeMarker;

  proto['header'] = proto.header;


  proto = anychart.standalones.ProjectTimeline.prototype;
  goog.exportSymbol('anychart.standalones.projectTimeline', anychart.standalones.projectTimeline);
  goog.exportSymbol('anychart.standalones.resourceTimeline', anychart.standalones.resourceTimeline);
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['rowStroke'] = proto.rowStroke;
  proto['backgroundFill'] = proto.backgroundFill;
  proto['headerHeight'] = proto.headerHeight;
  proto['defaultRowHeight'] = proto.defaultRowHeight;

  proto = anychart.standalones.ResourceTimeline.prototype;
  proto['draw'] = proto.draw;
  proto['data'] = proto.data;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['rowStroke'] = proto.rowStroke;
  proto['backgroundFill'] = proto.backgroundFill;
  proto['headerHeight'] = proto.headerHeight;
  proto['defaultRowHeight'] = proto.defaultRowHeight;
})();
