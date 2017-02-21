/**
 * @fileoverview anychart.core.Chart file.
 * @suppress {extraRequire}
 * todo: anychart.core.utils.InteractivityState should be excluded from requires
 */
goog.provide('anychart.core.Chart');

goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.reporting');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.ui.ChartCredits');
goog.require('anychart.core.ui.Label');
goog.require('anychart.core.ui.Legend');
goog.require('anychart.core.ui.Title');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.core.utils.Animation');
goog.require('anychart.core.utils.ChartA11y');
goog.require('anychart.core.utils.ChartContextProvider');
goog.require('anychart.core.utils.Interactivity');
goog.require('anychart.core.utils.InteractivityState');
goog.require('anychart.core.utils.Margin');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.exports');
goog.require('anychart.performance');
goog.require('anychart.themes.merging');
goog.require('anychart.utils');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.json.hybrid');

goog.forwardDeclare('anychart.ui.ContextMenu');
goog.forwardDeclare('anychart.ui.ContextMenu.PrepareItemsContext');
goog.forwardDeclare('anychart.ui.ContextMenu.Item');



/**
 * Base class for all charts, contains the margins, the background and the title.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 */
anychart.core.Chart = function() {
  //todo: this suspend can be replaced with a flag for the chart if it will not be needed anywhere else.
  this.suspendSignalsDispatching();
  anychart.core.Chart.base(this, 'constructor');

  /**
   * @type {acgraph.vector.Layer}
   * @protected
   */
  this.rootElement = null;

  /**
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * @type {acgraph.vector.Rect}
   * @protected
   */
  this.shadowRect = null;

  /**
   * @type {anychart.core.utils.Margin}
   * @private
   */
  this.margin_ = null;

  /**
   * @type {anychart.core.ui.Title}
   * @private
   */
  this.title_ = null;

  /**
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * @type {Array.<anychart.core.ui.Label>}
   * @private
   */
  this.chartLabels_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.autoRedraw_ = true;

  /**
   * Public property for the Table to allow restoring the autoRedraw state.
   * @type {boolean}
   */
  this.originalAutoRedraw;

  /**
   * @type {anychart.core.utils.Animation}
   * @private
   */
  this.animation_ = null;

  /**
   * Chart context provider.
   * @type {anychart.core.utils.ChartContextProvider}
   * @private
   */
  this.chartContextProvider_ = null;

  /**
   * @type {anychart.core.utils.ChartA11y}
   * @private
   */
  this.a11y_ = null;

  /**
   * Dirty state for autoRedraw_ field. Used to avoid similar checking through multiple this.listenSignal calls.
   * @type {boolean}
   * @private
   */
  this.autoRedrawIsSet_ = false;


  /**
   * X shift (in pixels) for 3D mode. Calculated in anychart.charts.Cartesian3d.
   * @type {number}
   */
  this.x3dShift = 0;


  /**
   * Y shift (in pixels) for 3D mode. Calculated in anychart.charts.Cartesian3d.
   * @type {number}
   */
  this.y3dShift = 0;


  /**
   * Statistics object.
   * @type {Object}
   */
  this.statistics = {};

  /**
   * @type {anychart.core.ui.ChartCredits}
   * @private
   */
  this.credits_ = null;

  /**
   * @type {boolean}
   * @protected
   */
  this.allowCreditsDisabling = false;

  /**
   * Rect that serves as an overlay for ignore mouse events mode.
   * @type {acgraph.vector.Rect}
   * @private
   */
  this.lockOverlayRect_ = null;

  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.Chart, anychart.core.VisualBaseWithBounds);


/**
 * Supported consistency states. Adds APPEARANCE to BaseWithBounds states.
 * @type {number}
 */
anychart.core.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states. Adds BACKGROUND and TITLE to BaseWithBounds states.
 * @type {number}
 */
anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.CHART_LABELS |
    anychart.ConsistencyState.CHART_BACKGROUND |
    anychart.ConsistencyState.CHART_TITLE |
    anychart.ConsistencyState.A11Y |
    anychart.ConsistencyState.CHART_ANIMATION |
    anychart.ConsistencyState.CHART_CREDITS;


/**
 * A temporary crutch to suppress base interactivity support in Stock.
 * @protected
 * @type {boolean}
 */
anychart.core.Chart.prototype.supportsBaseHighlight = true;


/**
 * 3D mode flag.
 * @type {boolean}
 */
anychart.core.Chart.prototype.isMode3d = false;


/**
 * Chart content bounds.
 * @type {anychart.math.Rect}
 * @protected
 */
anychart.core.Chart.prototype.contentBounds;


/**
 * Whether chart uses anychart.data.Tree as data source.
 * @return {boolean}
 */
anychart.core.Chart.prototype.usesTreeData = function() {
  return false;
};


/**
 * Whether chart supports tooltip.
 * @return {boolean}
 */
anychart.core.Chart.prototype.supportsTooltip = function() {
  return true;
};


/**
 * Gets root layer.
 * @return {acgraph.vector.Layer}
 */
anychart.core.Chart.prototype.getRootElement = function() {
  return this.rootElement;
};


/**
 * Creates Stage and set up stage's credits with chart's credits values.
 * @return {!acgraph.vector.Stage}
 * @protected
 */
anychart.core.Chart.prototype.createStage = function() {
  var stage = acgraph.create();
  stage.allowCreditsDisabling = this.allowCreditsDisabling;

  stage.credits(this.credits().serializeDiff());
  return stage;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Methods to set defaults for multiple entities.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for axis default settings.
 * @param {Object=} opt_value Object with x-axis settings.
 * @return {Object}
 */
anychart.core.Chart.prototype.defaultLabelSettings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!this.defaultLabelSettings_)
      this.defaultLabelSettings_ = goog.object.clone(opt_value);
    else
      goog.object.extend(this.defaultLabelSettings_, opt_value);
    return this;
  }
  return this.defaultLabelSettings_ || {};
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Margin.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for margin.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.Chart|anychart.core.utils.Margin)} .
 */
anychart.core.Chart.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
                                                opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.margin_.listenSignals(this.marginInvalidated_, this);
    this.registerDisposable(this.margin_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  } else {
    return this.margin_;
  }
};


/**
 * Internal margin invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.marginInvalidated_ = function(event) {
  // whatever has changed in margins affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.Chart|anychart.core.utils.Padding)} .
 */
anychart.core.Chart.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom,
                                                 opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.paddingInvalidated_, this);
    this.registerDisposable(this.padding_);
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    return this;
  } else {
    return this.padding_;
  }
};


/**
 * Internal padding invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.paddingInvalidated_ = function(event) {
  // whatever has changed in paddings affects chart size, so we need to redraw everything
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    this.invalidate(anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for background.
 * @param {(string|Object|null|boolean)=} opt_value .
 * @return {anychart.core.Chart|anychart.core.ui.Background} .
 */
anychart.core.Chart.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.listenSignals(this.backgroundInvalidated_, this);
    this.registerDisposable(this.background_);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.backgroundInvalidated_ = function(event) {
  // whatever has changed in background we redraw only background
  // because it doesn't affect other elements
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.CHART_BACKGROUND, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Title.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for title.
 * @param {(null|boolean|Object|string)=} opt_value .
 * @return {!(anychart.core.ui.Title|anychart.core.Chart)} .
 */
anychart.core.Chart.prototype.title = function(opt_value) {
  if (!this.title_) {
    this.title_ = new anychart.core.ui.Title();
    this.title_.setParentEventTarget(this);
    this.title_.listenSignals(this.onTitleSignal_, this);
    this.registerDisposable(this.title_);
  }

  if (goog.isDef(opt_value)) {
    this.title_.setup(opt_value);
    return this;
  } else {
    return this.title_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onTitleSignal_ = function(event) {
  var state = 0;
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.CHART_TITLE | anychart.ConsistencyState.A11Y;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }
  // If there are no signals - !state and nothing will happen.
  this.invalidate(state, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for label.
 * @param {(null|boolean|Object|string|number)=} opt_indexOrValue Chart label instance to add.
 * @param {(null|boolean|Object|string)=} opt_value Chart label instance.
 * @return {!(anychart.core.ui.Label|anychart.core.Chart)} Chart label instance or itself for chaining call.
 */
anychart.core.Chart.prototype.label = function(opt_indexOrValue, opt_value) {
  var index, value;
  if (goog.isNumber(opt_indexOrValue) || (goog.isString(opt_indexOrValue) && !isNaN(+opt_indexOrValue))) {
    index = +opt_indexOrValue;
    value = opt_value;
  } else {
    index = 0;
    value = opt_indexOrValue;
  }
  var label = this.chartLabels_[index];
  if (!label) {
    label = this.createChartLabel();
    label.setParentEventTarget(this);
    label.setup(this.defaultLabelSettings());
    this.chartLabels_[index] = label;
    this.registerDisposable(label);
    label.listenSignals(this.onLabelSignal_, this);
    this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    label.setup(value);
    return this;
  } else {
    return label;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onLabelSignal_ = function(event) {
  this.invalidate(anychart.ConsistencyState.CHART_LABELS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Creates chart label.
 * @return {anychart.core.ui.Label} Label instance.
 * @protected
 */
anychart.core.Chart.prototype.createChartLabel = function() {
  return new anychart.core.ui.Label();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Statistics.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Developers note:
 * This method:
 * - Calculates all required drawing data.
 * - Considering all calculated data, fills the statistics object with calculated values.
 * - Can be called before this.draw() method is called.
 * - Can be called any amount of times. Must do the calculations only if something important had been changed.
 * - This method is called EVERY TIME getStat() is called.
 */
anychart.core.Chart.prototype.calculate = goog.nullFunction;


/**
 * Ensures that statistics is ready.
 */
anychart.core.Chart.prototype.ensureStatisticsReady = function() {
  this.calculate();
};


/**
 * Gets statistics value by key.
 * @param {string} key - Key.
 * @return {*} - Statistics value.
 */
anychart.core.Chart.prototype.getStat = function(key) {
  this.ensureStatisticsReady();
  return this.statistics[key];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates chart tooltip.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.ui.Tooltip|anychart.core.Chart)}
 */
anychart.core.Chart.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = this.createTooltip();
  }

  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Creates tooltip.
 * @protected
 * @return {!anychart.core.ui.Tooltip}
 */
anychart.core.Chart.prototype.createTooltip = function() {
  var tooltip = new anychart.core.ui.Tooltip(anychart.core.ui.Tooltip.Capabilities.ANY);
  this.registerDisposable(tooltip);
  tooltip.chart(this);

  this.listen(anychart.enums.EventType.POINTS_HOVER, this.showTooltip_, true);
  return tooltip;
};


/**
 * @param {anychart.core.MouseEvent} event
 * @private
 */
anychart.core.Chart.prototype.showTooltip_ = function(event) {
  if (event.forbidTooltip) return;

  // summary
  // Tooltip Mode   | Interactivity mode
  // Single + Single - draw one tooltip.
  // Union + Single - draw one tooltip at the hovered point, content from all points by index of hovered point.
  // Separated + Single  - draw all tooltips for hovered points.

  // Single + byX - draw one tooltip at nearest point to cursor.
  // Union + byX - draw one tooltip at nearest point to cursor (in point position), content from all hovered points.
  // Separated + byX - draw all tooltips for hovered points.

  // For bySpot as for byX

  var toShowSeriesStatus = [];
  goog.array.forEach(event['seriesStatus'], function(status) {
    if (goog.array.isEmpty(status['points'])) {
      if (this.tooltip_.getOption('positionMode') == anychart.enums.TooltipPositionMode.FLOAT) {
        this.unlisten(goog.events.EventType.MOUSEMOVE, this.updateTooltip);
      }
      this.tooltip_.hide(false, event);

    } else if (status['series'].enabled()) {
      toShowSeriesStatus.push(status);
    }
  }, this);

  if (!goog.array.isEmpty(toShowSeriesStatus)) {
    if (this.tooltip_.getOption('positionMode') == anychart.enums.TooltipPositionMode.FLOAT) {
      this.listen(goog.events.EventType.MOUSEMOVE, this.updateTooltip);
    }

    var interactivity = this.interactivity();
    if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
      var points = [];
      if (this.tooltip_.getOption('displayMode') == anychart.enums.TooltipDisplayMode.SINGLE) {
        points = event['seriesStatus'];
      } else {
        var pointIndex = event['seriesStatus'][0]['points'][0];
        // improve maps support (separated & point modes)
        if (goog.isDef(pointIndex['index'])) pointIndex = pointIndex['index'];

        // check isDef series for compile_each (for gantt, etc.)
        if (goog.isDef(this.getAllSeries())) {
          // get points from all series by point index
          points = goog.array.map(this.getAllSeries(), function(series) {
            series.getIterator().select(pointIndex);
            return {
              'series': series,
              'points': [pointIndex]
            };
          });
        }

        // filter missing
        points = goog.array.filter(points, function(point) {
          var series = point['series'];
          var iterator = series.getIterator();
          if (goog.isDef(iterator.meta('missing'))) {
            return !iterator.meta('missing');
          }
          return !anychart.utils.isNaN(iterator.get('value'));
        });
      }

      this.tooltip_.showForSeriesPoints(points,
          event['originalEvent']['clientX'],
          event['originalEvent']['clientY'],
          event['seriesStatus'][0]['series'],
          this.useUnionTooltipAsSingle());

      // byX, bySpot
    } else {
      var nearestSeriesStatus = toShowSeriesStatus[0];
      toShowSeriesStatus[0]['series'].getIterator().select(toShowSeriesStatus[0]['nearestPointToCursor']['index']);

      goog.array.forEach(toShowSeriesStatus, function(status) {
        if (nearestSeriesStatus['nearestPointToCursor']['distance'] > status['nearestPointToCursor']['distance']) {
          status['series'].getIterator().select(status['nearestPointToCursor']['index']);
          nearestSeriesStatus = status;
        }
      });

      if (this.tooltip_.getOption('displayMode') == anychart.enums.TooltipDisplayMode.SINGLE) {
        // show nearest hovered point to cursor
        this.tooltip_.showForSeriesPoints([nearestSeriesStatus],
            event['originalEvent']['clientX'],
            event['originalEvent']['clientY'],
            nearestSeriesStatus['series'],
            this.useUnionTooltipAsSingle());
      } else {
        // show all hovered points, in union mode position will be to nearest hovered point to cursor
        this.tooltip_.showForSeriesPoints(toShowSeriesStatus,
            event['originalEvent']['clientX'],
            event['originalEvent']['clientY'],
            nearestSeriesStatus['series'],
            this.useUnionTooltipAsSingle());
      }
    }
  }
};


/**
 * Used in sparklines.
 * @return {boolean}
 */
anychart.core.Chart.prototype.useUnionTooltipAsSingle = function() {
  return false;
};


/**
 * Update tooltip position. (for float)
 * @param {anychart.core.MouseEvent} event
 * @protected
 */
anychart.core.Chart.prototype.updateTooltip = function(event) {
  this.tooltip_.updatePosition(event['clientX'], event['clientY']);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  ContextMenu.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates context menu for chart.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.ui.ContextMenu|!anychart.core.Chart}
 */
anychart.core.Chart.prototype.contextMenu = function(opt_value) {
  if (!this.contextMenu_) {
    // suppress NO_FEATURE_IN_MODULE warning
    this.contextMenu_ = goog.global['anychart']['ui']['contextMenu'](!!goog.isObject(opt_value) && opt_value['fromTheme']);
    if (this.contextMenu_) {
      this.registerDisposable(this.contextMenu_);
      this.contextMenu_['itemsProvider'](this.contextMenuItemsProvider);
    }
  }

  if (goog.isDef(opt_value)) {
    if (this.contextMenu_) {
      this.contextMenu_['setup'](opt_value);
    }
    return this;
  } else {
    return this.contextMenu_;
  }
};


/**
 * Returns link to version history.
 * Used by context menu version item.
 * @return {string}
 * @protected
 */
anychart.core.Chart.prototype.getVersionHistoryLink = function() {
  return 'http://anychart.com/products/anychart/history';
};


/**
 * Default context menu items provider.
 * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
 * @this {anychart.ui.ContextMenu.PrepareItemsContext}
 * @return {Array.<anychart.ui.ContextMenu.Item>}
 * @protected
 */
anychart.core.Chart.prototype.contextMenuItemsProvider = function(context) {
  // For fired on MarkersFactory or LabelsFactory
  var parentEventTarget = context['event']['target'].getParentEventTarget();
  // For fired on series point (context['event']['target'] == chart)
  var meta = anychart.utils.extractTag(context['event']['domTarget']);
  var isSeries = goog.isObject(meta) && goog.isDef(meta.series) &&
      meta.series['seriesType'] && goog.isDef(meta.index);
  var isPointContext = isSeries || (parentEventTarget && parentEventTarget['seriesType']);

  var items = /** @type {Array.<anychart.ui.ContextMenu.Item>} */ (anychart.utils.recursiveClone(anychart.core.Chart.contextMenuMap.main));

  if (anychart.DEVELOP) {
    // prepare version link (specific to each product)
    var versionHistoryItem = /** @type {anychart.ui.ContextMenu.Item} */(anychart.utils.recursiveClone(anychart.core.Chart.contextMenuItems.versionHistory));
    versionHistoryItem['href'] = context['chart'].getVersionHistoryLink() + '?version=' + anychart.VERSION;

    items.push(
        null,
        anychart.core.Chart.contextMenuItems.saveConfigAs,
        anychart.core.Chart.contextMenuItems.linkToHelp,
        versionHistoryItem
    );
  }

  return context['chart'].specificContextMenuItems(anychart.utils.recursiveClone(items), context, isPointContext);
};


/**
 * Specific set context menu items to chart.
 * @param {Array.<anychart.ui.ContextMenu.Item>} items Default items provided from chart.
 * @param {anychart.ui.ContextMenu.PrepareItemsContext} context Context object.
 * @param {boolean} isPointContext
 * @return {Array.<anychart.ui.ContextMenu.Item>}
 * @protected
 */
anychart.core.Chart.prototype.specificContextMenuItems = function(items, context, isPointContext) {
  return items;
};


/**
 * Get selected points.
 * @return {Array.<anychart.core.Point>}
 */
anychart.core.Chart.prototype.getSelectedPoints = function() {
  var selectedPoints = [];
  var selectedPointsIndexes, series, i, j;
  var allSeries = this.getAllSeries();
  for (i = 0; i < allSeries.length; i++) {
    series = allSeries[i];
    if (!series || !series.state || !series.getPoint || !series.enabled()) continue;
    selectedPointsIndexes = series.state.getIndexByPointState(anychart.PointState.SELECT);
    for (j = 0; j < selectedPointsIndexes.length; j++) {
      selectedPoints.push(series.getPoint(selectedPointsIndexes[j]));
    }
  }

  return selectedPoints;
};


/**
 * Items map.
 * @type {Object.<string, anychart.ui.ContextMenu.Item>}
 */
anychart.core.Chart.contextMenuItems = {
  // Item 'Export as ...'.
  exportAs: {
    'text': 'Save chart as...',
    'iconClass': 'ac ac-file-image-o',
    'subMenu': [{
      'text': '.png',
      'iconClass': 'ac ac-file-image-o',
      'eventType': 'anychart.saveAsPng',
      'action': function(context) {
        context['chart'].saveAsPng();
      }
    }, {
      'text': '.jpg',
      'iconClass': 'ac ac-file-image-o',
      'eventType': 'anychart.saveAsJpg',
      'action': function(context) {
        context['chart'].saveAsJpg();
      }
    }, {
      'text': '.pdf',
      'iconClass': 'ac ac-file-pdf-o',
      'eventType': 'anychart.saveAsPdf',
      'action': function(context) {
        context['chart'].saveAsPdf();
      }
    }, {
      'text': '.svg',
      'iconClass': 'ac ac-file-code-o',
      'eventType': 'anychart.saveAsSvg',
      'action': function(context) {
        context['chart'].saveAsSvg();
      }
    }]
  },

  // Item 'Save data as...'.
  saveDataAs: {
    'text': 'Save data as...',
    'iconClass': 'ac ac-save',
    'subMenu': [{
      'text': '.csv',
      'iconClass': 'ac ac-file-excel-o',
      'eventType': 'anychart.saveAsCsv',
      'action': function(context) {
        context['chart'].saveAsCsv();
      }
    }, {
      'text': '.xslx',
      'iconClass': 'ac ac-file-excel-o',
      'eventType': 'anychart.saveAsXlsx',
      'action': function(context) {
        context['chart'].saveAsXlsx();
      }
    }]
  },

  // Item 'Share with...'.
  shareWith: {
    'text': 'Share with...',
    'iconClass': 'ac ac-net',
    'subMenu': [{
      'text': 'Facebook',
      'iconClass': 'ac ac-facebook',
      'eventType': 'anychart.shareWithFacebook',
      'action': function(context) {
        context['chart'].shareWithFacebook();
      }
    }, {
      'text': 'Twitter',
      'iconClass': 'ac ac-twitter',
      'eventType': 'anychart.shareWithTwitter',
      'action': function(context) {
        context['chart'].shareWithTwitter();
      }
    }, {
      'text': 'LinkedIn',
      'iconClass': 'ac ac-linkedin',
      'eventType': 'anychart.shareWithLinkedIn',
      'action': function(context) {
        context['chart'].shareWithLinkedIn();
      }
    }, {
      'text': 'Pinterest',
      'iconClass': 'ac ac-pinterest',
      'eventType': 'anychart.shareWithPinterest',
      'action': function(context) {
        context['chart'].shareWithPinterest();
      }
    }]
  },

  // Item 'Save config as..'.
  saveConfigAs: {
    'text': 'Save config as...',
    'iconClass': 'ac ac-save',
    'subMenu': [{
      'text': '.json',
      'iconClass': 'ac ac-file-code-o',
      'eventType': 'anychart.saveAsJson',
      'action': function(context) {
        context['chart'].saveAsJson();
      }
    }, {
      'text': '.xml',
      'iconClass': 'ac ac-file-code-o',
      'eventType': 'anychart.saveAsXml',
      'action': function(context) {
        context['chart'].saveAsXml();
      }
    }]
  },

  // Item 'Print Chart'.
  printChart: {
    'text': 'Print',
    'iconClass': 'ac ac-print',
    'eventType': 'anychart.print',
    'action': function(context) {
      context['chart'].print();
    }
  },

  // Item-link to version history.
  versionHistory: {
    'text': 'Version History',
    'href': ''
  },

  // Item-link to our site.
  about: {
    'iconClass': 'ac ac-cog',
    'text': 'AnyChart ' + (anychart.VERSION ?
        goog.string.subs.apply(null, ['v%s.%s.%s'].concat(anychart.VERSION.split('.'))) :
        ' develop version'),
    'href': 'http://anychart.com'
  },

  // Item 'Link to help'.
  linkToHelp: {
    'iconClass': 'ac ac-question',
    'text': 'Need help? Go to support center!',
    'href': 'http://anychart.com/support'
  }
};


/**
 * Menu map.
 * @type {Object.<string, Array.<anychart.ui.ContextMenu.Item>>}
 */
anychart.core.Chart.contextMenuMap = {
  // Menu 'Default menu'.
  main: [
    anychart.core.Chart.contextMenuItems.exportAs,
    anychart.core.Chart.contextMenuItems.saveDataAs,
    anychart.core.Chart.contextMenuItems.shareWith,
    anychart.core.Chart.contextMenuItems.printChart,
    null,
    anychart.core.Chart.contextMenuItems.about
  ]
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculate chart content bounds.
 * @param {!anychart.math.Rect} totalBounds Total chart area bounds, do not override, it can be useful later.
 * @return {!anychart.math.Rect} Chart content bounds, allocated space for all chart appearance items.
 */
anychart.core.Chart.prototype.calculateContentAreaSpace = function(totalBounds) {
  //chart area bounds with applied margin and copped by credits
  var boundsWithoutCredits;
  //chart area with applied margin
  var boundsWithoutMargin;
  //chart area with applied margin and padding
  var boundsWithoutPadding;
  // chart area with applied margin, padding and title
  var boundsWithoutTitle;
  //
  var boundsWithoutBackgroundThickness;

  boundsWithoutMargin = this.margin().tightenBounds(totalBounds);

  var background = this.background();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_BACKGROUND | anychart.ConsistencyState.BOUNDS)) {
    background.suspendSignalsDispatching();
    if (!background.container()) background.container(this.rootElement);
    background.parentBounds(boundsWithoutMargin);
    background.resumeSignalsDispatching(false);
    background.draw();
    this.markConsistent(anychart.ConsistencyState.CHART_BACKGROUND);
  }

  boundsWithoutBackgroundThickness = background.enabled() ? background.getRemainingBounds() : boundsWithoutMargin;
  boundsWithoutCredits = this.drawCredits(boundsWithoutBackgroundThickness);
  boundsWithoutPadding = this.padding().tightenBounds(boundsWithoutCredits);

  var title = this.title();
  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_TITLE | anychart.ConsistencyState.BOUNDS)) {
    title.suspendSignalsDispatching();
    if (!title.container()) title.container(this.rootElement);
    title.parentBounds(boundsWithoutPadding);
    title.resumeSignalsDispatching(false);
    title.draw();
    this.markConsistent(anychart.ConsistencyState.CHART_TITLE);
  }

  boundsWithoutTitle = title.enabled() ? title.getRemainingBounds() : boundsWithoutPadding;

  return boundsWithoutTitle.clone();
};


/**
 * Sets chart label settings.
 * @param {anychart.core.ui.Label} label Label for tuning.
 * @param {anychart.math.Rect} bounds Label parent bounds.
 * @protected
 */
anychart.core.Chart.prototype.setLabelSettings = function(label, bounds) {
  label.parentBounds(bounds);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Credits.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for credits.
 * @param {(Object|boolean|null)=} opt_value
 * @return {!(anychart.core.Chart|anychart.core.ui.ChartCredits)} Chart credits or itself for chaining call.
 */
anychart.core.Chart.prototype.credits = function(opt_value) {
  if (!this.credits_) {
    this.credits_ = new anychart.core.ui.ChartCredits(this);
    this.registerDisposable(this.credits_);
    this.credits_.listenSignals(this.onCreditsSignal_, this);
  }

  if (goog.isDef(opt_value)) {
    this.credits_.setup(opt_value);
    return this;
  } else {
    return this.credits_;
  }
};


/**
 * Internal title invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.onCreditsSignal_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    state |= anychart.ConsistencyState.CHART_CREDITS;
  }
  // If there are no signals - !state and nothing will happen.
  this.invalidate(state, signal);
};


/**
 * Draw credits.
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 * @return {!anychart.math.Rect} Bounds without credits bounds.
 */
anychart.core.Chart.prototype.drawCredits = function(parentBounds) {
  var stage = this.container().getStage();
  if (!stage)
    return /** @type {!anychart.math.Rect} */(parentBounds);

  var stageCredits = stage.credits();
  var chartCredits = this.credits();

  stageCredits.setup(chartCredits.serializeDiff());
  chartCredits.dropSettings();

  this.markConsistent(anychart.ConsistencyState.CHART_CREDITS);
  return /** @type {!anychart.math.Rect} */(parentBounds);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Animations.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Setter/getter for animation setting.
 * @param {(boolean|Object)=} opt_enabledOrJson Whether to enable animation.
 * @param {number=} opt_duration A Duration in milliseconds.
 * @return {anychart.core.utils.Animation|anychart.core.Chart} Animations settings object or self for chaining.
 */
anychart.core.Chart.prototype.animation = function(opt_enabledOrJson, opt_duration) {
  if (!this.animation_) {
    this.animation_ = new anychart.core.utils.Animation();
    this.animation_.listenSignals(this.onAnimationSignal_, this);
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.animation_.setup.apply(this.animation_, arguments);
    return this;
  } else {
    return this.animation_;
  }
};


/**
 * Animation enabled change handler.
 * @private
 */
anychart.core.Chart.prototype.onAnimationSignal_ = function() {
  this.invalidate(anychart.ConsistencyState.CHART_ANIMATION, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Animate chart.
 */
anychart.core.Chart.prototype.doAnimation = goog.nullFunction;


//----------------------------------------------------------------------------------------------------------------------
//
//  Accessibility.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates tooltip context provider.
 * @return {!anychart.core.utils.ChartContextProvider}
 */
anychart.core.Chart.prototype.createChartContextProvider = function() {
  if (!this.chartContextProvider_) {
    this.chartContextProvider_ = new anychart.core.utils.ChartContextProvider(this);
  }
  return this.chartContextProvider_;
};


/**
 * Setter/getter for accessibility setting.
 * @param {(boolean|Object)=} opt_enabledOrJson - Whether to enable accessibility.
 * @return {anychart.core.utils.ChartA11y|anychart.core.Chart} - Accessibility settings object or self for chaining.
 */
anychart.core.Chart.prototype.a11y = function(opt_enabledOrJson) {
  if (!this.a11y_) {
    this.a11y_ = new anychart.core.utils.ChartA11y(this);
    this.registerDisposable(this.a11y_);
    this.a11y_.listenSignals(this.onA11ySignal_, this);
  }
  if (goog.isDef(opt_enabledOrJson)) {
    this.a11y_.setup.apply(this.a11y_, arguments);
    return this;
  } else {
    return this.a11y_;
  }
};


/**
 * A11y change handler.
 * @private
 */
anychart.core.Chart.prototype.onA11ySignal_ = function() {
  this.invalidate(anychart.ConsistencyState.A11Y, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Renders chart.
 */
anychart.core.Chart.prototype.drawInternal = function() {
  if (!this.autoRedrawIsSet_) {
    if (this.autoRedraw_)
      this.listenSignals(this.invalidateHandler_, this);
    else
      this.unlistenSignals(this.invalidateHandler_, this);
    this.autoRedrawIsSet_ = true;
  }

  if (!this.checkDrawingNeeded())
    return;

  anychart.performance.start('Chart.draw()');
  var startTime;
  if (anychart.DEVELOP) {
    startTime = anychart.performance.relativeNow();
  }

  this.suspendSignalsDispatching();

  //create root element only if draw is called
  if (!this.rootElement) {
    this.rootElement = acgraph.layer();
    this.bindHandlersToGraphics(this.rootElement);
    this.registerDisposable(this.rootElement);
  }

  //suspend stage
  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.contextMenu_) {
    this.contextMenu_['attach'](this);
  }

  //start clear container consistency states
  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.enabled()) {
      this.rootElement.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    }

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    //can be null if you add chart to tooltip container on hover (Vitalya :) )
    if (stage) {
      //listen resize event
      // stage.resize(stage.originalWidth, stage.originalHeight);
      stage.listen(
          acgraph.vector.Stage.EventType.STAGE_RESIZE,
          this.resizeHandler,
          false,
          this
      );
    }
  }
  //end clear container consistency states

  // DVF-1648
  anychart.performance.start('Chart.beforeDraw()');
  this.beforeDraw();
  anychart.performance.end('Chart.beforeDraw()');

  //total chart area bounds, do not override, it can be useful later
  anychart.performance.start('Chart.calculateBounds()');
  var totalBounds = /** @type {!anychart.math.Rect} */(this.getPixelBounds());
  this.contentBounds = this.calculateContentAreaSpace(totalBounds);
  anychart.performance.end('Chart.calculateBounds()');
  anychart.performance.start('Chart.drawContent()');
  this.drawContent(this.contentBounds);
  this.specialDraw(this.getPlotBounds());

  anychart.performance.end('Chart.drawContent()');

  // used for crosshair
  var background = this.background();
  var fill = background.getOption('fill');
  if ((!background.enabled() || !fill || fill == 'none')) {
    if (!this.shadowRect) {
      this.shadowRect = this.rootElement.rect();
      this.shadowRect.fill(anychart.color.TRANSPARENT_HANDLER).stroke(null);
    }
    this.shadowRect.setBounds(this.contentBounds);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CHART_LABELS | anychart.ConsistencyState.BOUNDS)) {
    for (var i = 0, count = this.chartLabels_.length; i < count; i++) {
      var label = this.chartLabels_[i];
      if (label) {
        label.suspendSignalsDispatching();
        if (!label.container() && label.enabled()) label.container(this.rootElement);
        this.setLabelSettings(label, totalBounds);
        label.resumeSignalsDispatching(false);
        label.draw();
      }
    }
    this.markConsistent(anychart.ConsistencyState.CHART_LABELS);
  }

  //after all chart items drawn, we can clear other states
  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  this.doAnimation();
  this.markConsistent(anychart.ConsistencyState.CHART_ANIMATION);

  if (this.hasInvalidationState(anychart.ConsistencyState.A11Y)) {
    this.a11y().applyA11y(this.createChartContextProvider());
    this.markConsistent(anychart.ConsistencyState.A11Y);
  }

  this.resumeSignalsDispatching(false);

  if (manualSuspend) {
    anychart.performance.start('Stage resume');
    stage.resume();
    anychart.performance.end('Stage resume');
  }

  this.dispatchDetachedEvent({
    'type': anychart.enums.EventType.CHART_DRAW,
    'chart': this
  });

  if (anychart.DEVELOP) {
    var msg = 'Chart rendering time: ' + anychart.math.round((anychart.performance.relativeNow() - startTime), 4);
    anychart.core.reporting.info(msg);
  }

  if (this.supportsBaseHighlight)
    this.onInteractivitySignal();

  anychart.performance.end('Chart.draw()');
};


/**
 * Starts the rendering of the chart into the container.
 * @param {boolean=} opt_async Whether do draw asynchronously.
 * @return {anychart.core.Chart} An instance of {@link anychart.core.Chart} class for method chaining.
 */
anychart.core.Chart.prototype.draw = function(opt_async) {
  if (opt_async) {
    if (!this.bindedDraw_)
      this.bindedDraw_ = goog.bind(this.draw, this);
    setTimeout(this.bindedDraw_, 0);
  } else
    this.drawInternal();

  return this;
};


/**
 * Extension point do before draw chart content.
 */
anychart.core.Chart.prototype.beforeDraw = function() {};


/**
 * Extension point do draw chart content.
 * @param {anychart.math.Rect} bounds Chart content area bounds.
 */
anychart.core.Chart.prototype.drawContent = function(bounds) {};


/**
 * Extension point do draw special chart content.
 * @param {anychart.math.Rect} bounds Chart plot bounds.
 */
anychart.core.Chart.prototype.specialDraw = function(bounds) {};


//----------------------------------------------------------------------------------------------------------------------
//
//  Resize.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Define auto resize settings.
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.core.Chart)} Auto resize settings or itself for chaining call.
 */
anychart.core.Chart.prototype.autoRedraw = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoRedraw_ != opt_value) {
      this.autoRedraw_ = opt_value;
      this.autoRedrawIsSet_ = false;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoRedraw_;
  }
};


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.core.Chart.prototype.resizeHandler = function(evt) {
  if (this.bounds().dependsOnContainerSize()) {
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.CHART_LEGEND,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds/coordinates.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for plot bounds of the chart.
 * @return {anychart.math.Rect}
 */
anychart.core.Chart.prototype.getPlotBounds = function() {
  return this.contentBounds;
};


/**
 * Convert coordinates relative local container (plot or data) to global coordinates relative global document.
 * @param {number} xCoord .
 * @param {number} yCoord .
 * @return {Object.<string, number>} .
 */
anychart.core.Chart.prototype.localToGlobal = function(xCoord, yCoord) {
  var result = {'x': xCoord, 'y': yCoord};
  if (this.container() && this.container().getStage()) {
    var containerPosition = this.container().getStage().getClientPosition();
    result['x'] += containerPosition.x;
    result['y'] += containerPosition.y;
  }
  return result;
};


/**
 * Convert global coordinates relative global document to coordinates relative local container (plot or data).
 * @param {number} xCoord .
 * @param {number} yCoord .
 * @return {Object.<string, number>} .
 */
anychart.core.Chart.prototype.globalToLocal = function(xCoord, yCoord) {
  var result = {'x': xCoord, 'y': yCoord};
  if (this.container() && this.container().getStage()) {
    var containerPosition = this.container().getStage().getClientPosition();
    result['x'] -= containerPosition.x;
    result['y'] -= containerPosition.y;
  }
  return result;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Remove/Restore.
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.Chart.prototype.remove = function() {
  if (this.rootElement) this.rootElement.parent(null);
};


//todo(Anton Saukh): refactor this mess!
/**
 * Internal invalidation event handler, redraw chart on all invalidate events.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Chart.prototype.invalidateHandler_ = function(event) {
  anychart.globalLock.onUnlock(this.draw, this);
};
//end mess


//----------------------------------------------------------------------------------------------------------------------
//  JSON/XML.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Return chart configuration as JSON object or string.
 * Note for documentation writers!: Google compiler thinks that "Object" has "toJSON" method that must accept string and return *.
 * To avoid this we have to put in the "wrong" params.
 * In external documentation parameter must be boolean, and method must return Object|string.
 * For the moment we have no way around this "nice feature" of the compiler.
 * @param {boolean=} opt_stringify Return as JSON as string.
 *  Note: stringifying ignores this flag.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @return {*} Chart JSON.
 */
anychart.core.Chart.prototype.toJson = function(opt_stringify, opt_includeTheme) {
  var data = this.isDisposed() ? {} : this.serialize();
  if (!opt_includeTheme) {
    data = /** @type {!Object} */(anychart.themes.merging.demerge(data, this.getDefaultThemeObj())) || {};
  }
  return opt_stringify ?
      goog.json.hybrid.stringify(data) :
      data;
};


/**
 * Return chart configuration as XML string or XMLNode.
 * @param {boolean=} opt_asXmlNode Return XML as XMLNode.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @return {string|Node} Chart configuration.
 */
anychart.core.Chart.prototype.toXml = function(opt_asXmlNode, opt_includeTheme) {
  var data = this.isDisposed() ? {} : this.serialize();
  if (!opt_includeTheme) {
    data = /** @type {!Object} */(anychart.themes.merging.demerge(data, this.getDefaultThemeObj())) || {};
  }
  return anychart.utils.json2xml(data, '', opt_asXmlNode);
};


/**
 * Returns chart type for JSON.
 * @return {string}
 * @private
 */
anychart.core.Chart.prototype.getNormalizedType_ = function() {
  var type = this.getType();
  switch (type.toLowerCase()) {
    case 'map':
      return 'map';
    case 'ganttresource':
    case 'ganttproject':
      return 'gantt';
    case 'circular':
    case 'lineargauge':
    case 'thermometergauge':
    case 'tankgauge':
    case 'ledgauge':
      return 'gauge';
    default:
      return 'chart';
  }
};


/**
 * Returns default theme object.
 * @return {Object}
 */
anychart.core.Chart.prototype.getDefaultThemeObj = function() {
  var result = {};
  result[this.getNormalizedType_()] = anychart.getFullTheme(this.getType());
  return result;
};


/** @inheritDoc */
anychart.core.Chart.prototype.serialize = function() {
  var json = anychart.core.Chart.base(this, 'serialize');
  json['title'] = this.title().serialize();
  json['background'] = this.background().serialize();
  json['margin'] = this.margin().serialize();
  json['padding'] = this.padding().serialize();
  json['a11y'] = this.a11y().serialize();
  var labels = [];
  for (var i = 0; i < this.chartLabels_.length; i++) {
    if (this.chartLabels_[i])
      labels.push(this.chartLabels_[i].serialize());
  }
  if (labels.length > 0)
    json['chartLabels'] = labels;
  // from VisualBaseWithBounds
  json['bounds'] = this.bounds().serialize();
  json['animation'] = this.animation().serialize();
  json['tooltip'] = this.tooltip().serialize();
  if (this.contextMenu_) {
    json['contextMenu'] = this.contextMenu()['serialize']();
  }

  json['credits'] = this.credits().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.Chart.base(this, 'setupByJSON', config, opt_default);

  if ('defaultLabelSettings' in config)
    this.defaultLabelSettings(config['defaultLabelSettings']);

  if ('title' in config)
    this.title(config['title']);

  if ('background' in config)
    this.background(config['background']);

  if ('padding' in config)
    this.padding(config['padding']);

  if ('margin' in config)
    this.margin(config['margin']);


  var labels = config['chartLabels'];
  if (goog.isArray(labels)) {
    for (var i = 0; i < labels.length; i++)
      this.label(i, labels[i]);
  }

  // from VisualBase
  if (goog.isString(config['container']))
    this.container(config['container']);

  // from VisualBaseWithBounds
  this.bounds(config['bounds']);
  this.left(config['left']);
  this.top(config['top']);
  this.width(config['width']);
  this.height(config['height']);
  this.right(config['right']);
  this.bottom(config['bottom']);
  this.animation(config['animation']);

  if ('tooltip' in config)
    this.tooltip().setupByVal(config['tooltip'], opt_default);

  this.a11y(config['a11y']);

  if (goog.isDef(config['contextMenu']))
    this.contextMenu(config['contextMenu']);

  this.credits(config['credits']);
};


/** @inheritDoc */
anychart.core.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(this.animation_, this.a11y_);
  anychart.core.Chart.base(this, 'disposeInternal');

  goog.disposeAll(this.animation_, this.a11y_, this.tooltip_);
  this.animation_ = null;
  this.a11y_ = null;
  this.tooltip_ = null;
};


/**
 * @ignoreDoc
 * @param {(Object|boolean|null)=} opt_value Legend settings.
 * @return {anychart.core.Chart|anychart.core.ui.Legend} Chart legend instance of itself for chaining call.
 */
anychart.core.Chart.prototype.legend = function(opt_value) {
  anychart.core.reporting.error(anychart.enums.ErrorCode.NO_LEGEND_IN_CHART);
  return goog.isDef(opt_value) ? this : null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Internal public method. Returns all chart series.
 * @return {!Array.<anychart.core.series.Base|anychart.core.SeriesBase|anychart.core.linearGauge.pointers.Base>}
 */
anychart.core.Chart.prototype.getAllSeries = goog.abstractMethod;


/**
 * Getter series by index.
 * @param {number} index .
 * @return {anychart.core.series.Base|anychart.core.SeriesBase}
 */
anychart.core.Chart.prototype.getSeries = function(index) {
  return null;
};


/**
 * Tester if it is series.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isSeries = function() {
  return false;
};


/**
 * Tester if it is chart.
 * @return {boolean}
 */
anychart.core.Chart.prototype.isChart = function() {
  return true;
};


/** @inheritDoc */
anychart.core.Chart.prototype.handleMouseEvent = function(event) {
  var series;

  var tag = anychart.utils.extractTag(event['domTarget']);
  var index;

  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (event['target'] instanceof anychart.core.ui.Legend) {
    if (tag) {
      series = tag.series;
      index = tag.index;
    }
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    if (!goog.isDef(event['pointIndex']))
      event['pointIndex'] = goog.isArray(index) ? index[index.length - 1] : index;

    var evt = series.makePointEvent(event);
    if (evt)
      series.dispatchEvent(evt);
  }
};


/** @inheritDoc */
anychart.core.Chart.prototype.makeBrowserEvent = function(e) {
  //this method is invoked only for events from data layer
  var res = anychart.core.Chart.base(this, 'makeBrowserEvent', e);
  var tag = anychart.utils.extractTag(res['relatedDomTarget']);

  var series = tag && tag.series;
  if (series && !series.isDisposed() && series.enabled()) {
    return series.makeBrowserEvent(e);
  }
  return res;
};


/**
 * Creates series status objects for event.
 * @param {Array.<Object>} seriesStatus .
 * @param {boolean=} opt_empty .
 * @return {Array.<Object>}
 * @protected
 */
anychart.core.Chart.prototype.createEventSeriesStatus = function(seriesStatus, opt_empty) {
  var eventSeriesStatus = [];
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    var nearestPointToCursor = status.nearestPointToCursor;
    var nearestPointToCursor_;
    if (nearestPointToCursor) {
      nearestPointToCursor_ = {
        'index': status.nearestPointToCursor.index,
        'distance': status.nearestPointToCursor.distance
      };
    } else {
      nearestPointToCursor_ = {
        'index': NaN,
        'distance': NaN
      };
    }
    eventSeriesStatus.push({
      'series': status.series,
      'points': opt_empty ? [] : status.points ? goog.array.clone(status.points) : [],
      'nearestPointToCursor': nearestPointToCursor_
    });
  }
  return eventSeriesStatus;
};


/**
 * Makes current point for events.
 * @param {Object} seriesStatus .
 * @param {string} event .
 * @param {boolean=} opt_empty .
 * @return {Object}
 * @protected
 */
anychart.core.Chart.prototype.makeCurrentPoint = function(seriesStatus, event, opt_empty) {
  var series, pointIndex, pointStatus, minDistance = Infinity;
  for (var i = 0, len = seriesStatus.length; i < len; i++) {
    var status = seriesStatus[i];
    if (status.nearestPointToCursor) {
      var nearestPoint = status.nearestPointToCursor;
      if (minDistance > nearestPoint.distance || !series) {
        series = status.series;
        pointIndex = nearestPoint.index;
        pointStatus = goog.array.contains(status.points, nearestPoint.index);
        minDistance = nearestPoint.distance;
      }
    }
  }
  var currentPoint = {
    'index': pointIndex,
    'series': series
  };

  currentPoint[event] = opt_empty ? !pointStatus : pointStatus;

  return currentPoint;
};


/**
 * This method also has a side effect - it patches the original source event to maintain seriesStatus support for
 * browser events.
 * @param {string} type Type of the interactivity point event.
 * @param {Object} event Event object.
 * @param {Array.<Object>} seriesStatus Array of series statuses.
 * @param {boolean=} opt_empty .
 * @param {boolean=} opt_forbidTooltip
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.core.Chart.prototype.makeInteractivityPointEvent = function(type, event, seriesStatus, opt_empty, opt_forbidTooltip) {
  var currentPoint = this.makeCurrentPoint(seriesStatus, type, opt_empty);
  var wrappedPoints = [];
  /** @type {anychart.core.series.Base|anychart.core.SeriesBase} */
  var series;
  if (!opt_empty) {
    for (var i = 0; i < seriesStatus.length; i++) {
      var status = seriesStatus[i];
      series = status.series;
      for (var j = 0; j < status.points.length; j++)
        wrappedPoints.push(series.getPoint(status.points[j]));
    }
  }
  series = currentPoint['series'];
  var res = {
    'type': (type == 'hovered') ? anychart.enums.EventType.POINTS_HOVER : anychart.enums.EventType.POINTS_SELECT,
    'seriesStatus': this.createEventSeriesStatus(seriesStatus, opt_empty),
    'currentPoint': currentPoint,
    'actualTarget': event['target'],
    'target': this,
    'originalEvent': event,
    'point': series.getPoint(currentPoint['index']),
    'points': wrappedPoints
  };
  if (opt_forbidTooltip)
    res.forbidTooltip = true;
  return res;
};


/**
 * Gets chart point by index.
 * @param {number} index Point index.
 * @return {anychart.core.Point} Chart point.
 */
anychart.core.Chart.prototype.getPoint = goog.abstractMethod;


/**
 * Returns points by event.
 * @param {anychart.core.MouseEvent} event
 * @return {?Array.<{
 *    series: (anychart.core.series.Base|anychart.core.SeriesBase|anychart.core.linearGauge.pointers.Base),
 *    points: Array.<number>,
 *    lastPoint: (number|undefined),
 *    nearestPointToCursor: (Object.<number>|undefined)
 * }>}
 */
anychart.core.Chart.prototype.getSeriesStatus = goog.abstractMethod;


/**
 * Some action on mouse over and move.
 * @param {Array.<number>|number} index Point index or indexes.
 * @param {anychart.core.series.Base|anychart.core.SeriesBase} series Series.
 */
anychart.core.Chart.prototype.doAdditionActionsOnMouseOverAndMove = goog.nullFunction;


/**
 * Some action on mouse out.
 */
anychart.core.Chart.prototype.doAdditionActionsOnMouseOut = goog.nullFunction;


/**
 * Handler for mouseMove and mouseOver events.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseOverAndMove = function(event) {
  var series, i, j, len;
  var interactivity = this.interactivity();

  var tag = anychart.utils.extractTag(event['domTarget']);
  var index;
  var forbidTooltip = false;
  var isTargetLegendOrColorRange = event['target'] instanceof anychart.core.ui.Legend || this.checkIfColorRange(event['target']);

  if (isTargetLegendOrColorRange) {
    if (tag) {
      if (tag.points_) {
        series = tag.points_.series;
        index = tag.points_.points;
        if (goog.isArray(index) && !index.length) index = NaN;
      } else {
        // I don't understand, why it is like this here.
        //series = tag.series_;
        //index = tag.index_;
        series = tag.series;
        index = tag.index;
      }
      forbidTooltip = true;
    }
  } else if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag && tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);

    if (series.supportsOutliers && series.supportsOutliers() && goog.isNumber(evt['pointIndex']))
      index = evt['pointIndex'];
    if (evt && ((anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget'])) || series.dispatchEvent(evt))) {
      if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {

        var whetherNeedHoverIndex = goog.isArray(index) && !goog.array.every(index, function(el) {
          return series.state.hasPointStateByPointIndex(anychart.PointState.HOVER, el);
        }, this);

        if (whetherNeedHoverIndex || (!series.state.hasPointStateByPointIndex(anychart.PointState.HOVER, index) && !isNaN(index))) {
          if (goog.isFunction(series.hoverPoint))
            series.hoverPoint(/** @type {number} */ (index), event);

          this.doAdditionActionsOnMouseOverAndMove(/** @type {number|Array.<number>} */(index), /** @type {!anychart.core.series.Base|anychart.core.SeriesBase} */(series));

          var alreadyHoveredPoints = series.state.getIndexByPointState(anychart.PointState.HOVER);
          var eventSeriesStatus = [];
          if (alreadyHoveredPoints.length)
            eventSeriesStatus.push({
              series: series,
              points: alreadyHoveredPoints,
              nearestPointToCursor: {index: (goog.isArray(index) ? index[0] : index), distance: 0}
            });

          if (eventSeriesStatus.length) {
            this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, eventSeriesStatus, false, forbidTooltip));
            this.prevHoverSeriesStatus = eventSeriesStatus.length ? eventSeriesStatus : null;
          }
        }
      }
    }
  } else {
    if (this.prevHoverSeriesStatus) {
      this.unhover();
      this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true));
      this.prevHoverSeriesStatus = null;
    }
  }

  if (interactivity.hoverMode() != anychart.enums.HoverMode.SINGLE) {
    var seriesStatus = this.getSeriesStatus(event);
    var dispatchEvent = false;

    if (seriesStatus && seriesStatus.length) {
      series = this.getAllSeries();
      for (i = 0; i < series.length; i++) {
        var contains = false;
        for (j = 0; j < seriesStatus.length; j++) {
          contains = contains || series[i] == seriesStatus[j].series;
        }
        if (!contains && series[i].state.getIndexByPointState(anychart.PointState.HOVER).length) {
          seriesStatus.push({
            series: series[i],
            points: []
          });
          series[i].unhover();
          dispatchEvent = true;
        }
      }

      for (i = 0, len = seriesStatus.length; i < len; i++) {
        var seriesStatus_ = seriesStatus[i];
        series = seriesStatus_.series;
        var points = seriesStatus_.points;

        var hoveredPoints = series.state.getIndexByPointState(anychart.PointState.HOVER);
        dispatchEvent = dispatchEvent || !goog.array.equals(points, hoveredPoints);
        if (!series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.HOVER)) {
          series.hoverPoint(seriesStatus_.points);
        }
      }
      if (dispatchEvent) {
        this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, seriesStatus, false, forbidTooltip));
        this.prevHoverSeriesStatus = seriesStatus.length ? seriesStatus : null;
      }
    } else {
      if (!(event['target'] instanceof anychart.core.ui.Legend)) {
        this.unhover();
        if (this.prevHoverSeriesStatus)
          this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true));
        this.prevHoverSeriesStatus = null;
      }
    }
  }
};


/**
 * Handler for mouseOut event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseOut = function(event) {
  var hoverMode = this.interactivity().hoverMode();

  var tag = anychart.utils.extractTag(event['domTarget']);
  var forbidTooltip = false;

  var series, index;
  if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else if (event['target'] instanceof anychart.core.ui.Legend || this.checkIfColorRange(event['target'])) {
    if (tag) {
      if (tag.points_) {
        series = tag.points_.series;
        index = tag.points_.points;
        if (goog.isArray(index) && !index.length) index = NaN;
      } else {
        // I don't understand, why it is like this here.
        //series = tag.series_;
        //index = tag.index_;
        series = tag.series;
        index = tag.index;
      }
    }
    forbidTooltip = true;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() &&
      goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    if (evt) {
      var prevTag = anychart.utils.extractTag(event['relatedDomTarget']);
      var prevIndex = anychart.utils.toNumber(goog.isObject(prevTag) ? prevTag.index : prevTag);

      var ifParent = anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget']);

      if ((!ifParent || (prevIndex != index)) && series.dispatchEvent(evt)) {
        if (hoverMode == anychart.enums.HoverMode.SINGLE && (!isNaN(index) || goog.isArray(index))) {
          series.unhover();
          this.doAdditionActionsOnMouseOut();
          this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, [{
            series: series,
            points: [],
            nearestPointToCursor: {index: (goog.isArray(index) ? index[0] : index), distance: 0}
          }], false, forbidTooltip));
        }
      }
    }
  }

  if (hoverMode != anychart.enums.HoverMode.SINGLE) {
    if (!anychart.utils.checkIfParent(this, event['relatedTarget'])) {
      this.unhover();
      this.doAdditionActionsOnMouseOut();
      if (this.prevHoverSeriesStatus)
        this.dispatchEvent(this.makeInteractivityPointEvent('hovered', event, this.prevHoverSeriesStatus, true, forbidTooltip));
      this.prevHoverSeriesStatus = null;
    }
  }

};


/**
 * Checks if the target is a color range.
 * @param {*} target
 * @return {boolean}
 */
anychart.core.Chart.prototype.checkIfColorRange = function(target) {
  return false;
};


/**
 * Handler for mouseClick event.
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.handleMouseDown = function(event) {
  this.onMouseDown(event);
};


/**
 * Logic for mouse down. It needs for inherited classes.
 * @protected
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.core.Chart.prototype.onMouseDown = function(event) {
  var interactivity = this.interactivity();

  var seriesStatus, eventSeriesStatus, allSeries, alreadySelectedPoints, i;
  var controlKeyPressed = event.ctrlKey || event.metaKey;
  var clickWithControlOnSelectedSeries, equalsSelectedPoints;

  var tag = anychart.utils.extractTag(event['domTarget']);

  var isTargetLegendOrColorRange = event['target'] instanceof anychart.core.ui.Legend || this.checkIfColorRange(event['target']);

  var series, s, index;
  if (isTargetLegendOrColorRange) {
    if (tag) {
      if (tag.points_) {
        series = tag.points_.series;
        index = tag.points_.points;
      } else {
        // I don't understand, why it is like this here.
        //series = tag.series_;
        //index = tag.index_;
        series = tag.series;
        index = tag.index;
      }
    }
  } else if (event['target'] instanceof anychart.core.ui.LabelsFactory || event['target'] instanceof anychart.core.ui.MarkersFactory) {
    var parent = event['target'].getParentEventTarget();
    if (parent.isSeries && parent.isSeries())
      series = parent;
    index = tag;
  } else {
    series = tag && tag.series;
    index = goog.isNumber(tag.index) ? tag.index : event['pointIndex'];
  }

  if (series && !series.isDisposed() && series.enabled() && goog.isFunction(series.makePointEvent)) {
    var evt = series.makePointEvent(event);
    if (evt && ((anychart.utils.checkIfParent(/** @type {!goog.events.EventTarget} */(series), event['relatedTarget'])) || series.dispatchEvent(evt))) {
      index = evt['pointIndex'];
      if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
        if (interactivity.selectionMode() == anychart.enums.SelectionMode.NONE || series.selectionMode() == anychart.enums.SelectionMode.NONE)
          return;

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
        equalsSelectedPoints = alreadySelectedPoints.length == 1 && alreadySelectedPoints[0] == index;

        if (!(controlKeyPressed || event.shiftKey) && equalsSelectedPoints)
          return;

        clickWithControlOnSelectedSeries = (controlKeyPressed || event.shiftKey) && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
        var unselect = clickWithControlOnSelectedSeries || !(controlKeyPressed || event.shiftKey) ||
            ((controlKeyPressed || event.shiftKey) && interactivity.selectionMode() != anychart.enums.SelectionMode.MULTI_SELECT);

        if (unselect) {
          this.unselect();
          if (this.prevSelectSeriesStatus)
            this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
        } else if (series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
          if (this.prevSelectSeriesStatus)
            this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
          series.unselect();
          if (goog.isArray(index))
            index = index[index.length - 1];
        }

        if (goog.isFunction(series.selectPoint))
          series.selectPoint(/** @type {number} */ (index), event);

        allSeries = this.getAllSeries();
        eventSeriesStatus = [];
        for (i = 0; i < allSeries.length; i++) {
          s = allSeries[i];
          if (!s) continue;
          alreadySelectedPoints = s.state.getIndexByPointState(anychart.PointState.SELECT);
          if (alreadySelectedPoints.length) {
            eventSeriesStatus.push({
              series: s,
              points: alreadySelectedPoints,
              nearestPointToCursor: {index: index, distance: 0}
            });
          }
        }

        if (!eventSeriesStatus.length) {
          eventSeriesStatus.push({
            series: series,
            points: [],
            nearestPointToCursor: {index: index, distance: 0}
          });
        }

        this.dispatchEvent(this.makeInteractivityPointEvent('selected', evt, eventSeriesStatus));

        if (equalsSelectedPoints)
          this.prevSelectSeriesStatus = null;
        else
          this.prevSelectSeriesStatus = eventSeriesStatus;
      }
    }
  } else if (interactivity.hoverMode() == anychart.enums.HoverMode.SINGLE) {
    if (!isTargetLegendOrColorRange)
      this.unselect();

    if (this.prevSelectSeriesStatus)
      this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
    this.prevSelectSeriesStatus = null;
  }

  if (interactivity.hoverMode() != anychart.enums.HoverMode.SINGLE) {
    if (interactivity.selectionMode() == anychart.enums.SelectionMode.NONE)
      return;

    var j, len;
    seriesStatus = this.getSeriesStatus(event);

    if (seriesStatus && seriesStatus.length) {
      var dispatchEvent = false;
      eventSeriesStatus = [];
      var contains, seriesStatus_;

      if (interactivity.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
        var nearest;
        for (i = 0, len = seriesStatus.length; i < len; i++) {
          seriesStatus_ = seriesStatus[i];
          series = seriesStatus_.series;

          if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
            continue;

          if (!nearest) nearest = seriesStatus_;
          if (nearest.nearestPointToCursor.distance > seriesStatus_.nearestPointToCursor.distance) {
            nearest = seriesStatus_;
          }
        }

        series = nearest.series;

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
        equalsSelectedPoints = alreadySelectedPoints.length == 1 && alreadySelectedPoints[0] == nearest.nearestPointToCursor.index;

        dispatchEvent = !equalsSelectedPoints || (equalsSelectedPoints && (controlKeyPressed || event.shiftKey));

        clickWithControlOnSelectedSeries = (controlKeyPressed || event.shiftKey) && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
        if ((clickWithControlOnSelectedSeries || !(controlKeyPressed || event.shiftKey)) && !equalsSelectedPoints) {
          series.unselect();
        }
        series.selectPoint(/** @type {number} */ (nearest.nearestPointToCursor.index), event);

        alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);

        if (alreadySelectedPoints.length) {
          eventSeriesStatus.push({
            series: series,
            points: [nearest.nearestPointToCursor.index],
            nearestPointToCursor: nearest.nearestPointToCursor
          });


          allSeries = this.getAllSeries();
          for (i = 0; i < allSeries.length; i++) {
            series = allSeries[i];
            if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
              continue;

            contains = series == eventSeriesStatus[0].series;
            if (!contains) {
              series.unselect();
            }
          }
        } else {
          eventSeriesStatus.push({
            series: series,
            points: alreadySelectedPoints,
            nearestPointToCursor: seriesStatus_.nearestPointToCursor
          });
        }
      } else {
        var emptySeries = [];
        if (!(controlKeyPressed || event.shiftKey)) {
          allSeries = this.getAllSeries();

          for (i = 0; i < allSeries.length; i++) {
            s = allSeries[i];
            if (s.selectionMode() == anychart.enums.SelectionMode.NONE)
              continue;

            contains = false;
            for (j = 0; j < seriesStatus.length; j++) {
              contains = contains || s == seriesStatus[j].series;
            }
            if (!contains && s.state.getIndexByPointState(anychart.PointState.SELECT).length) {
              emptySeries.push({series: s, points: []});
              s.unselect();
              dispatchEvent = true;
            }
          }
        }

        for (i = 0, len = seriesStatus.length; i < len; i++) {
          seriesStatus_ = seriesStatus[i];
          series = seriesStatus_.series;

          if (series.selectionMode() == anychart.enums.SelectionMode.NONE)
            continue;

          var points;
          if (series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
            points = [seriesStatus_.nearestPointToCursor.index];
          } else {
            points = seriesStatus_.points;
          }

          alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
          if (event.shiftKey) {
            contains = true;
            for (j = 0; j < points.length; j++) {
              contains = contains && goog.array.contains(alreadySelectedPoints, points[j]);
            }
            equalsSelectedPoints = contains;
          } else if (!controlKeyPressed) {
            equalsSelectedPoints = goog.array.equals(points, alreadySelectedPoints);
          }
          dispatchEvent = dispatchEvent || !equalsSelectedPoints;

          if (!equalsSelectedPoints) {
            clickWithControlOnSelectedSeries = (controlKeyPressed || event.shiftKey) && series.state.isStateContains(series.state.getSeriesState(), anychart.PointState.SELECT);
            if (clickWithControlOnSelectedSeries || !(controlKeyPressed || event.shiftKey) || series.selectionMode() == anychart.enums.SelectionMode.SINGLE_SELECT) {
              series.unselect();
            }
            series.selectPoint(points, event);
          }
          alreadySelectedPoints = series.state.getIndexByPointState(anychart.PointState.SELECT);
          if (alreadySelectedPoints.length) {
            eventSeriesStatus.push({
              series: series,
              points: alreadySelectedPoints,
              nearestPointToCursor: seriesStatus_.nearestPointToCursor
            });
          } else {
            emptySeries.push({
              series: series,
              points: alreadySelectedPoints,
              nearestPointToCursor: seriesStatus_.nearestPointToCursor
            });
          }
        }

        for (i = 0; i < emptySeries.length; i++) {
          eventSeriesStatus.push(emptySeries[i]);
        }
      }

      if (dispatchEvent) {
        this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, eventSeriesStatus));
        this.prevSelectSeriesStatus = eventSeriesStatus.length ? eventSeriesStatus : null;
      }
    } else {
      if (!isTargetLegendOrColorRange)
        this.unselect();

      if (this.prevSelectSeriesStatus)
        this.dispatchEvent(this.makeInteractivityPointEvent('selected', event, this.prevSelectSeriesStatus, true));
      this.prevSelectSeriesStatus = null;
    }
  }
};


/**
 * Deselects all series. It doesn't matter what series it belongs to.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 */
anychart.core.Chart.prototype.unselect = function(opt_indexOrIndexes) {
  var i, len;
  var series = this.getAllSeries();
  for (i = 0, len = series.length; i < len; i++) {
    if (series[i]) series[i].unselect(opt_indexOrIndexes);
  }
};


/**
 * Make unhover to all series. It doesn't matter what series it belongs to.
 * @param {(number|Array<number>)=} opt_indexOrIndexes Point index or array of indexes.
 */
anychart.core.Chart.prototype.unhover = function(opt_indexOrIndexes) {
  var i, len;
  var series = this.getAllSeries();
  for (i = 0, len = series.length; i < len; i++) {
    if (series[i]) series[i].unhover(opt_indexOrIndexes);
  }
};


/**
 * Enables or disables mouse events processing by creating overlay rectangle.
 * @param {boolean} ignore Set 'true' to ignore
 */
anychart.core.Chart.prototype.ignoreMouseEvents = function(ignore) {
  if (!this.lockOverlayRect_) {
    this.lockOverlayRect_ = acgraph.rect(0, 0, 0, 0);
    this.lockOverlayRect_.cursor(acgraph.vector.Cursor.WAIT);
    this.lockOverlayRect_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.lockOverlayRect_.stroke(null);
  }

  if (ignore) {
    this.lockOverlayRect_.setBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));
    this.lockOverlayRect_.zIndex(10000);
    this.lockOverlayRect_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
  } else {
    this.lockOverlayRect_.remove();
  }
};


/**
 * Sets/gets settings for regions doesn't linked to anything regions.
 * @param {(Object|anychart.enums.HoverMode)=} opt_value Settings object or boolean value like enabled state.
 * @return {anychart.core.utils.Interactivity|anychart.core.Chart}
 */
anychart.core.Chart.prototype.interactivity = function(opt_value) {
  if (!this.interactivity_) {
    this.interactivity_ = new anychart.core.utils.Interactivity(this);
    this.interactivity_.listenSignals(this.onInteractivitySignal, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value))
      this.interactivity_.setup(opt_value);
    else
      this.interactivity_.hoverMode(opt_value);
    return this;
  }
  return this.interactivity_;
};


/**
 * Animation enabled change handler.
 * @protected
 */
anychart.core.Chart.prototype.onInteractivitySignal = function() {
  var series = this.getAllSeries();
  for (var i = series.length; i--;) {
    if (series[i])
      series[i].hoverMode(/** @type {string} */(this.interactivity().hoverMode()));
  }
};


/**
 * Returns chart or gauge type. Published in charts.
 * @return {anychart.enums.ChartTypes|anychart.enums.GaugeTypes|anychart.enums.MapTypes}
 */
anychart.core.Chart.prototype.getType = goog.abstractMethod;


/**
 * @typedef {{chart: anychart.core.Chart}}
 */
anychart.core.Chart.DrawEvent;


/**
 * Extract headers from chart data set or stock storage.
 * @param {anychart.data.Set|anychart.data.TableStorage} dataSet
 * @param {Object} headers Object with headers.
 * @param {number} headersLength Headers length.
 * @return {number} headers length.
 */
anychart.core.Chart.prototype.extractHeaders = function(dataSet, headers, headersLength) {
  var column;
  for (var i = 0, len = dataSet.getRowsCount(); i < len; i++) {
    var row = dataSet.row(i);

    if (goog.isArray(row)) {
      for (column = 0; column < row.length; column++)
        if (!(column in headers))
          headers[column] = headersLength++;
    } else if (goog.isObject(row)) {
      for (column in row)
        if (!(column in headers))
          headers[column] = headersLength++;
    } else {
      if (!('value' in headers))
        headers['value'] = headersLength++;
    }
  }
  return headersLength;
};


/**
 * Checks whether separator is valid.
 * Throws an error if invalid.
 * @param {string} separator
 */
anychart.core.Chart.prototype.checkSeparator = function(separator) {
  if (separator.indexOf('\"') != -1) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.CSV_DOUBLE_QUOTE_IN_SEPARATOR);
    throw new Error('Double quotes in separator are not allowed');
  }
};


/**
 * Escapes values.
 * @param {Array} row Array of values.
 * @param {string} colSep Columns separator.
 * @param {string} rowSep Rows separator.
 */
anychart.core.Chart.prototype.escapeValuesInRow = function(row, colSep, rowSep) {
  var i;
  var value;
  var len = row.length;
  for (i = 0; i < len; i++) {
    if (!goog.isDef(value = row[i]))
      continue;
    if (!goog.isString(value))
      value = String(value);
    if (value.indexOf(colSep) != -1) {
      value = value.split('"').join('""');
      value = '"' + value + '"';
    } else if (value.indexOf(rowSep) != -1) {
      value = value.split('"').join('""');
      value = '"' + value + '"';
    }
    row[i] = value;
  }
};


/**
 * Creates data suitable to create csv.
 * @param {Object} node Node.
 * @param {Array} rawData Raw data.
 * @param {Object} headers Hash map of seen columns.
 * @param {number} headersLength length of headers.
 * @param {?(string|number)} parentId Parent ID.
 * @param {?(string|number)} originalParent original parent id.
 * @private
 */
anychart.core.Chart.prototype.makeObject_ = function(node, rawData, headers, headersLength, parentId, originalParent) {
  var data = goog.object.clone(node['treeDataItemData']);
  if (!goog.isDef(data['id'])) {
    this.missedIds_++;
    this.idStatus_ = -1;
  }
  data['parent'] = [this.nodesCount_, parentId, originalParent];
  parentId = this.nodesCount_++;
  rawData.push(data);
  for (var key in data) {
    if (!(key in headers))
      headers[key] = headersLength++;
  }
  var children = node['children'];
  if (children && children.length) {
    for (var i = 0, len = children.length; i < len; i++)
      this.makeObject_(children[i], rawData, headers, headersLength, parentId, data['id']);
  }
};


/**
 * Returns CSV string with tree data.
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @return {string} CSV string.
 * @private
 */
anychart.core.Chart.prototype.toTreeDataCsv_ = function(opt_csvSettings) {
  var settings = goog.isObject(opt_csvSettings) ? opt_csvSettings : {};
  var rowsSeparator = settings['rowsSeparator'] || '\n';
  this.checkSeparator(rowsSeparator);
  var columnsSeparator = settings['columnsSeparator'] || ',';
  this.checkSeparator(columnsSeparator);
  var ignoreFirstRow = settings['ignoreFirstRow'] || false;

  var data = (/** @type {{data:Function}} */(this)).data();

  var serialized = data.serialize();
  var roots = serialized['children'];

  var rawData = [];
  var headers = {};
  var i, j;
  /**
   * -1 means there is at least one missing id, so use auto generated id|parent and save original id|parent
   *  0 means there is no id at all use auto generated id|parent without original
   *  1 means there are all ids in tree, so do not use auto generated - use original id|parent
   * @type {number}
   * @private
   */
  this.idStatus_ = 1;
  this.missedIds_ = 0;
  this.nodesCount_ = 0;
  headers['id'] = 0;
  headers['parent'] = 1;
  for (i = 0; i < roots.length; i++) {
    this.makeObject_(roots[i], rawData, headers, 2, null, null);
  }
  if (this.missedIds_ === this.nodesCount_) {
    this.idStatus_ = 0;
  } else if (this.missedIds_ === 0) {
    this.idStatus_ = 1;
  }

  var key;
  var columns = [];

  for (key in headers)
    columns[headers[key]] = key;

  var rowArray;
  var rowStrings = [];
  var row;
  var column;
  var parent;
  var finalValue;
  var id, parentId;
  if (this.idStatus_ < 0) {
    headers['__original_id__'] = columns.length;
    headers['__original_parent__'] = columns.length + 1;
    columns.push('__original_id__', '__original_parent__');
  }

  if (!ignoreFirstRow)
    rowStrings.push(columns.join(columnsSeparator));
  for (i = 0; i < rawData.length; i++) {
    rowArray = new Array(columns.length);
    row = rawData[i];
    // parent - array with
    // 0 - auto generated id
    // 1 - auto generated parent id
    // 2 - original parent id
    parent = row['parent'];

    if (this.idStatus_ <= 0) {
      id = parent[0];
      parentId = parent[1];
    } else {
      id = row['id'];
      parentId = parent[2];
    }

    for (j = 0; j < columns.length; j++) {
      column = columns[j];
      finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];

      if (column === 'id')
        rowArray[j] = id;

      else if (column === 'parent')
        rowArray[j] = goog.isNull(parentId) ? undefined : parentId;

      else if (column === '__original_parent__')
        rowArray[j] = parent[2];

      else if (column === '__original_id__')
        rowArray[j] = row['id'];

      else
        rowArray[j] = finalValue;
    }
    this.escapeValuesInRow(rowArray, columnsSeparator, rowsSeparator);
    rowStrings.push(rowArray.join(columnsSeparator));
  }
  return rowStrings.join(rowsSeparator);
};


/**
 * Creates additional headers for specific csv.
 * @param {Object} headers Headers.
 * @param {number} headersLength Current length.
 * @param {boolean} scatterPolar Scatter or polar.
 * @return {number} Headers length.
 */
anychart.core.Chart.prototype.createSpecificCsvHeaders = function(headers, headersLength, scatterPolar) {
  return headersLength;
};


/**
 * Method called each iteration over each series data when generating specific csv.
 * @param {anychart.data.View} seriesData
 * @param {Object} csvRows
 * @param {Object} headers
 * @param {number} rowIndex
 * @param {string|number} groupingField
 */
anychart.core.Chart.prototype.onBeforeRowsValuesSpreading = function(seriesData, csvRows, headers, rowIndex, groupingField) {};


/**
 * Returns CSV string with series data.
 * @param {(string|anychart.enums.ChartDataExportMode)=} opt_chartDataExportMode CSV mode.
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @return {string} CSV string.
 */
anychart.core.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  if (this.usesTreeData())
    return this.toTreeDataCsv_(opt_csvSettings);

  opt_chartDataExportMode = anychart.enums.normalizeChartDataExportMode(opt_chartDataExportMode);
  var rawData = (opt_chartDataExportMode == anychart.enums.ChartDataExportMode.RAW);
  var type = this.getType();
  var scatterPolar = (type == anychart.enums.ChartTypes.SCATTER || type == anychart.enums.ChartTypes.POLAR);
  var settings = goog.isObject(opt_csvSettings) ? opt_csvSettings : {};
  var rowsSeparator = settings['rowsSeparator'] || '\n';
  this.checkSeparator(rowsSeparator);
  var columnsSeparator = settings['columnsSeparator'] || ',';
  this.checkSeparator(columnsSeparator);
  var ignoreFirstRow = settings['ignoreFirstRow'] || false;

  var isGauge =
      type == anychart.enums.GaugeTypes.CIRCULAR |
      type == anychart.enums.GaugeTypes.LINEAR |
      type == anychart.enums.GaugeTypes.BULLET |
      type == anychart.enums.GaugeTypes.THERMOMETER |
      type == anychart.enums.GaugeTypes.TANK |
      type == anychart.enums.GaugeTypes.LED;
  var seriesList = isGauge ? [this] : this.getAllSeries();
  var seriesListLength = seriesList.length;
  var series;
  var seriesData;
  var seriesDataSets;
  var i, j, len, uid;
  var dataSet = null;
  var dataSets = {};
  var csvHeaders = [];
  var dataSetsCount = 0;

  for (i = 0; i < seriesListLength; i++) {
    series = /** @type {anychart.core.SeriesBase} */ (seriesList[i]);
    seriesData = /** @type {anychart.data.View} */ (series.data());
    seriesDataSets = seriesData.getDataSets();
    for (j = 0, len = seriesDataSets.length; j < len; j++) {
      dataSet = seriesDataSets[j];
      uid = goog.getUid(dataSet);
      if (!(uid in dataSets)) {
        dataSets[uid] = dataSet;
        dataSetsCount++;
      }
    }
  }
  var needCountDataSets = dataSetsCount > 1;
  var csvStrings;
  var headers, header;
  var headersLength = 0;
  var finalValue;

  if (rawData) {
    headers = {};
    if (needCountDataSets) {
      headers['#'] = headersLength++;
    }
    for (uid in dataSets) {
      dataSet = dataSets[uid];
      headersLength = this.extractHeaders(dataSet, headers, headersLength);
    }

    var dataSetNumber = 0;
    csvStrings = [];
    if (!ignoreFirstRow) {
      csvHeaders = [];
      for (header in headers)
        csvHeaders[headers[header]] = header;
      csvStrings.push(csvHeaders.join(columnsSeparator));
    }
    for (uid in dataSets) {
      dataSet = dataSets[uid];
      var column;
      var columnIndex;

      for (i = 0, len = dataSet.getRowsCount(); i < len; i++) {
        var csvRow = new Array(headersLength);
        var row = dataSet.row(i);
        if (goog.isArray(row)) {
          for (column = 0; column < row.length; column++) {
            columnIndex = headers[column];
            finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];
            csvRow[columnIndex] = finalValue;
          }
        } else if (goog.isObject(row)) {
          for (column in row) {
            columnIndex = headers[column];
            finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];
            csvRow[columnIndex] = finalValue;
          }
        } else {
          columnIndex = headers['value'];
          csvRow[columnIndex] = row;
        }

        if (needCountDataSets)
          csvRow[0] = dataSetNumber;
        this.escapeValuesInRow(csvRow, columnsSeparator, rowsSeparator);
        csvStrings.push(csvRow.join(columnsSeparator));
      }
      dataSetNumber++;
    }
    return csvStrings.join(rowsSeparator);
  } else {
    //x, 0_0, 0_1, 0_2, 1_0, 1_1
    //p1, 1, p1, 10, p1, 20'
    headers = {};
    if (!scatterPolar) {
      headers['x'] = headersLength++;
    }
    headersLength = this.createSpecificCsvHeaders(headers, headersLength, scatterPolar);
    var seriesPrefix;
    var csvRows = {};
    var iterator;
    var x, k;
    var prefixed;
    var groupingField;
    for (i = 0; i < seriesListLength; i++) {
      series = seriesList[i];
      seriesPrefix = seriesListLength > 1 ? goog.isFunction(series.id) ? series.id() + '_' : ('series_' + i + '_') : '';
      seriesData = series.data();
      iterator = seriesData.getIterator();
      while (iterator.advance()) {
        k = iterator.getIndex();
        groupingField = /** @type {number|string} */ (scatterPolar ? k : iterator.get('x'));

        if (!csvRows[groupingField]) {
          csvRows[groupingField] = [];
          if (!scatterPolar)
            csvRows[groupingField][0] = groupingField;
        }

        this.onBeforeRowsValuesSpreading(seriesData, csvRows, headers, k, groupingField);

        row = seriesData.row(k);

        if (goog.isArray(row)) {
          for (column = 0; column < row.length; column++) {
            prefixed = seriesPrefix + column;
            if (!(prefixed in headers)) {
              headers[prefixed] = headersLength++;
            }
            columnIndex = headers[prefixed];
            finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];
            csvRows[groupingField][columnIndex] = finalValue;
          }
        } else if (goog.isObject(row)) {
          for (column in row) {
            prefixed = seriesPrefix + column;
            if (!(prefixed in headers)) {
              headers[prefixed] = headersLength++;
            }
            columnIndex = headers[prefixed];
            finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];
            csvRows[groupingField][columnIndex] = finalValue;
          }
        } else {
          prefixed = seriesPrefix + 'value';
          if (!(prefixed in headers)) {
            headers[prefixed] = headersLength++;
          }
          columnIndex = headers[prefixed];
          csvRows[groupingField][columnIndex] = row;
        }
      }
    }
    csvStrings = [];
    for (header in headers) {
      csvHeaders[headers[header]] = header;
    }
    if (!ignoreFirstRow)
      csvStrings.push(csvHeaders.join(columnsSeparator));
    for (row in csvRows) {
      this.escapeValuesInRow(csvRows[row], columnsSeparator, rowsSeparator);
      csvStrings.push(csvRows[row].join(columnsSeparator));
    }
    return csvStrings.join(rowsSeparator);
  }
};


/**
 * Gets chart represented as HTML table.
 * @param {string=} opt_title - Title to be set.
 * @param {boolean=} opt_asString - Whether to represent table as string.
 * @return {Element|string|null} - HTML table instance or null if got some parse errors.
 */
anychart.core.Chart.prototype.toHtmlTable = function(opt_title, opt_asString) {
  // This is how result CSV must look like.
  // var csv = 'x,Brandy,Whiskey,Tequila\n' +
  //     '2007,14.1,20.7,12.2\n' +
  //     '2008,15.7,21.6,10\n' +
  //     '2009,12,22.5,8.9';
  var csv = this.toCsv();
  var table = anychart.utils.htmlTableFromCsv(csv, opt_title, opt_asString);
  if (table) {
    return opt_asString ? goog.dom.getOuterHtml(table) : table;
  } else {
    return null;
  }
};


/**
 * Gets chart represented as invisible HTML table for accessibility purposes.
 * @param {string=} opt_title - Title to be set.
 * @param {boolean=} opt_asString - Whether to represent table as string.
 * @return {Element|string|null} - HTML table instance with a11y style (invisible) or null if got some parse errors.
 */
anychart.core.Chart.prototype.toA11yTable = function(opt_title, opt_asString) {
  var table = /** @type {Element} */ (this.toHtmlTable(opt_title));
  if (table) {
    //Style to hide the table: https://www.w3.org/WAI/tutorials/forms/labels/
    var settings = {
      'border': 0,
      'clip': 'rect(0 0 0 0)',
      'height': '1px',
      'margin': '-1px',
      'overflow': 'hidden',
      'padding': 0,
      'position': 'absolute',
      'width': '1px'
    };
    goog.style.setStyle(table, settings);
    return opt_asString ? goog.dom.getOuterHtml(table) : table;
  }
  return table;
};


/**
 * Saves chart config as XML document.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.Chart.prototype.saveAsXml = function(opt_includeTheme, opt_filename) {
  var xml = /** @type {string} */(this.toXml(false, opt_includeTheme));
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = xml;
  options['dataType'] = 'xml';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/xml', options);
};


/**
 * Saves chart config as XML document.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.Chart.prototype.saveAsJson = function(opt_includeTheme, opt_filename) {
  var json = /** @type {string} */(this.toJson(true, opt_includeTheme));
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = json;
  options['dataType'] = 'json';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/json', options);
};


/**
 * Saves chart data as csv.
 * @param {(string|anychart.enums.ChartDataExportMode)=} opt_chartDataExportMode CSV mode.
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.Chart.prototype.saveAsCsv = function(opt_chartDataExportMode, opt_csvSettings, opt_filename) {
  var csv = this.toCsv(opt_chartDataExportMode, opt_csvSettings);
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = csv;
  options['dataType'] = 'csv';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/csv', options);
};


/**
 * Saves chart data as excel document.
 * @param {(string|anychart.enums.ChartDataExportMode)=} opt_chartDataExportMode CSV mode.
 * @param {string=} opt_filename file name to save.
 */
anychart.core.Chart.prototype.saveAsXlsx = function(opt_chartDataExportMode, opt_filename) {
  var csv = this.toCsv(opt_chartDataExportMode, {
    'rowsSeparator': '\n',
    'columnsSeparator': ',',
    'ignoreFirstRow': false
  });
  var options = {};
  options['file-name'] = opt_filename || anychart.exports.filename();
  options['data'] = csv;
  options['dataType'] = 'xlsx';
  options['responseType'] = 'file';
  acgraph.sendRequestToExportServer(acgraph.exportServer + '/xlsx', options);
};


/**
 * Opens Facebook sharing dialog.
 * @param {(string|Object)=} opt_captionOrOptions Caption for main link. If not set hostname will be used. Or object with options.
 * @param {string=} opt_link Url of the link attached to publication.
 * @param {string=} opt_name Title for the attached link. If not set hostname or opt_link url will be used.
 * @param {string=} opt_description Description for the attached link.
 */
anychart.core.Chart.prototype.shareWithFacebook = function(opt_captionOrOptions, opt_link, opt_name, opt_description) {
  var exportOptions = anychart.exports.facebook();
  var args = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'link': opt_link,
    'name': opt_name,
    'description': opt_description
  }, opt_captionOrOptions, exportOptions);

  var w = 550;
  var h = 550;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var window = goog.dom.getWindow();
  var popup = window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  var onSuccess = function(imgUrl) {
    var urlBase = 'https://www.facebook.com/dialog/feed';

    // Dialog options described here https://developers.facebook.com/docs/sharing/reference/feed-dialog
    var urlOptions = {
      'app_id': exportOptions['appId'],
      'display': 'popup',
      'picture': imgUrl
    };

    urlOptions['caption'] = args['caption'];

    if (args['link']) {
      urlOptions['link'] = args['link'];

      if (args['name']) {
        urlOptions['name'] = args['name'];
      }
      if (args['description']) {
        urlOptions['description'] = args['description'];
      }
    }

    var options = '';
    for (var k in urlOptions) {
      options += options ? '&' : '';
      options += k + '=' + urlOptions[k];
    }
    popup.location.href = urlBase + '?' + options;
  };

  var imageWidth = exportOptions['width'];
  var imageHeight = exportOptions['height'];
  this.shareAsPng(onSuccess, undefined, false, imageWidth, imageHeight);
};


/**
 * Opens Twitter sharing dialog.
 */
anychart.core.Chart.prototype.shareWithTwitter = function() {
  var exportOptions = anychart.exports.twitter();
  var w = 600;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var formClass = 'ac-share-twitter-form';
  var dataInputClass = 'ac-share-twitter-data-input';

  var mapForm;
  var dataInput;
  var el = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.INPUT, dataInputClass);
  if (el.length > 0) {
    dataInput = el[0];
    mapForm = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.FORM, formClass)[0];
  } else {
    mapForm = goog.dom.createElement(goog.dom.TagName.FORM);
    goog.dom.classlist.add(mapForm, formClass);
    mapForm.target = 'Map';
    mapForm.method = 'POST';
    mapForm.action = exportOptions['url'];

    dataInput = goog.dom.createElement(goog.dom.TagName.INPUT);
    goog.dom.classlist.add(dataInput, dataInputClass);
    dataInput.type = 'hidden';
    dataInput.name = 'data';

    var dataTypeInput = goog.dom.createElement(goog.dom.TagName.INPUT);
    dataTypeInput.type = 'hidden';
    dataTypeInput.name = 'dataType';
    dataTypeInput.value = 'svg';

    goog.dom.appendChild(mapForm, dataInput);
    goog.dom.appendChild(mapForm, dataTypeInput);
    goog.dom.appendChild(goog.dom.getElementsByTagName(goog.dom.TagName.BODY)[0], mapForm);
  }

  if (goog.isDef(mapForm) && goog.isDef(dataInput)) {
    dataInput.value = this.toSvg(exportOptions['width'], exportOptions['height']);
    var window = goog.dom.getWindow();
    var mapWindow = window.open('', 'Map', 'status=0,title=0,height=520,width=600,scrollbars=1, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    if (mapWindow) mapForm.submit();
  }
};


/**
 * Opens LinkedIn sharing dialog.
 * @param {(string|Object)=} opt_captionOrOptions Caption for publication. If not set 'AnyChart' will be used. Or object with options.
 * @param {string=} opt_description Description. If not set opt_caption will be used.
 */
anychart.core.Chart.prototype.shareWithLinkedIn = function(opt_captionOrOptions, opt_description) {
  var exportOptions = anychart.exports.linkedin();
  var args = anychart.utils.decomposeArguments({
    'caption': opt_captionOrOptions,
    'description': opt_description
  }, opt_captionOrOptions, exportOptions);

  var w = 550;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var window = goog.dom.getWindow();
  var popup = window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  var onSuccess = function(imgUrl) {
    var urlBase = 'https://www.linkedin.com/shareArticle';

    // Dialog options described here https://developer.linkedin.com/docs/share-on-linkedin
    var urlOptions = {
      'mini': 'true',
      'url' : imgUrl
    };

    urlOptions['title'] = args['caption'];
    if (args['description']) {
      urlOptions['summary'] = args['description'];
    }

    var options = '';
    for (var k in urlOptions) {
      options += options ? '&' : '';
      options += k + '=' + urlOptions[k];
    }
    popup.location.href = urlBase + '?' + options;
  };

  this.shareAsPng(onSuccess, undefined, false, exportOptions['width'], exportOptions['height']);
};


/**
 * Opens Pinterest sharing dialog.
 * @param {(string|Object)=} opt_linkOrOptions Attached link. If not set, the image url will be used. Or object with options.
 * @param {string=} opt_description Description.
 */
anychart.core.Chart.prototype.shareWithPinterest = function(opt_linkOrOptions, opt_description) {
  var exportOptions = anychart.exports.pinterest();
  var args = anychart.utils.decomposeArguments({
    'link': opt_linkOrOptions,
    'description': opt_description
  }, opt_linkOrOptions, exportOptions);

  var w = 550;
  var h = 520;
  var left = Number((screen.width / 2) - (w / 2));
  var top = Number((screen.height / 2) - (h / 2));
  var window = goog.dom.getWindow();
  var popup = window.open('', '_blank', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  var onSuccess = function(imgUrl) {
    var urlBase = 'http://pinterest.com/pin/create/link';
    var urlOptions = {
      'media' : imgUrl
    };

    if (args['link']) {
      urlOptions['url'] = args['link'];
    }

    if (args['description']) {
      urlOptions['description'] = args['description'];
    }

    var options = '';
    for (var k in urlOptions) {
      options += options ? '&' : '';
      options += k + '=' + urlOptions[k];
    }

    popup.location.href = urlBase + '?' + options;
  };

  this.shareAsPng(onSuccess, undefined, false, exportOptions['width'], exportOptions['height']);
};

//exports
(function() {
  var proto = anychart.core.Chart.prototype;
  proto['a11y'] = proto.a11y;
  proto['animation'] = proto.animation;
  proto['title'] = proto.title;//doc|ex
  proto['background'] = proto.background;//doc|ex
  proto['margin'] = proto.margin;//doc|ex
  proto['padding'] = proto.padding;//doc|ex
  proto['label'] = proto.label;//doc|ex
  proto['container'] = proto.container;//doc
  proto['contextMenu'] = proto.contextMenu;
  proto['draw'] = proto.draw;//doc
  proto['toJson'] = proto.toJson;//|need-ex
  proto['toXml'] = proto.toXml;//|need-ex
  proto['legend'] = proto.legend;//dummy DO NOT USE
  proto['credits'] = proto.credits;//dummy DO NOT USE
  proto['tooltip'] = proto.tooltip;
  proto['saveAsPng'] = proto.saveAsPng;//inherited
  proto['saveAsJpg'] = proto.saveAsJpg;//inherited
  proto['saveAsPdf'] = proto.saveAsPdf;//inherited
  proto['saveAsSvg'] = proto.saveAsSvg;//inherited
  proto['shareAsPng'] = proto.shareAsPng;//inherited
  proto['shareAsJpg'] = proto.shareAsJpg;//inherited
  proto['shareAsPdf'] = proto.shareAsPdf;//inherited
  proto['shareAsSvg'] = proto.shareAsSvg;//inherited
  proto['getPngBase64String'] = proto.getPngBase64String;//inherited
  proto['getJpgBase64String'] = proto.getJpgBase64String;//inherited
  proto['getSvgBase64String'] = proto.getSvgBase64String;//inherited
  proto['getPdfBase64String'] = proto.getPdfBase64String;//inherited
  proto['toSvg'] = proto.toSvg;//inherited
  proto['saveAsCsv'] = proto.saveAsCsv;
  proto['saveAsXlsx'] = proto.saveAsXlsx;
  proto['saveAsXml'] = proto.saveAsXml;
  proto['saveAsJson'] = proto.saveAsJson;
  proto['toCsv'] = proto.toCsv;
  proto['toA11yTable'] = proto.toA11yTable;
  proto['toHtmlTable'] = proto.toHtmlTable;
  proto['localToGlobal'] = proto.localToGlobal;
  proto['globalToLocal'] = proto.globalToLocal;
  proto['getStat'] = proto.getStat;
  proto['getSelectedPoints'] = proto.getSelectedPoints;
  proto['credits'] = proto.credits;
  proto['shareWithFacebook'] = proto.shareWithFacebook;
  proto['shareWithTwitter'] = proto.shareWithTwitter;
  proto['shareWithLinkedIn'] = proto.shareWithLinkedIn;
  proto['shareWithPinterest'] = proto.shareWithPinterest;
})();

