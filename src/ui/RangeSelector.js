goog.provide('anychart.ui.RangeSelector');
goog.provide('anychart.ui.RangeSelector.Range');

goog.require('anychart.enums');
goog.require('anychart.ui.button.Toggle');

goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.SelectionModel');

goog.forwardDeclare('anychart.charts.Stock');



/**
 * Range Selector (for stock chart).
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.RangeSelector = function() {
  anychart.ui.RangeSelector.base(this, 'constructor');

  /**
   * Stock chart.
   * @type {?anychart.charts.Stock}
   * @private
   */
  this.target_ = null;

  /**
   * If this control rendered inside the stock chart.
   * @type {boolean}
   * @private
   */
  this.insideChart_ = false;

  /**
   * @type {Element}
   * @private
   */
  this.zoomLabel_ = null;

  this.zoomLabelText_ = 'Zoom:';

  /**
   *
   * @type {Array<anychart.ui.RangeSelector.Range>}
   * @private
   */
  this.ranges_ = [];

  this.ranges([{
    'type': 'Unit',
    'unit': 'Day',
    'count': 10,
    'text': '10D'
  },{
    'type': 'Unit',
    'unit': 'Month',
    'count': 1,
    'text': '1M'
  },{
    'type': 'Unit',
    'unit': 'Month',
    'count': 3,
    'text': '3M'
  },{
    'type': 'YTD',
    'text': 'YTD'
  },{
    'type': 'Unit',
    'unit': 'Year',
    'count': 1,
    'text': '1Y'
  },{
    'type': 'Unit',
    'unit': 'Year',
    'count': 2,
    'text': '2Y'
  },{
    'type': 'Unit',
    'unit': 'Year',
    'count': 5,
    'text': '5Y'
  },{
    'type': 'Max',
    'text': 'MAX'
  }]);

  // Have the alignment buttons be controlled by a selection model.
  this.selectionModel_ = new goog.ui.SelectionModel();
  this.selectionModel_.setSelectionHandler(this.selectionHandler_);

};
goog.inherits(anychart.ui.RangeSelector, goog.ui.Component);


/** @type {string} */
anychart.ui.RangeSelector.CSS_CLASS = goog.getCssName('anychart-range-selector');


/**
 * Padding in pixels.
 * @type {number}
 */
anychart.ui.RangeSelector.COMPONENT_PADDING = 15;


/**
 * There is no good way to detect UI element height in case of hidden container.
 * Parent element can be hidden, even if we render UI in different visible container,
 * there can be css styles with size related settings that affects UI only in parent container, etc.
 * So we just set fallback height.
 * @type {number}
 */
anychart.ui.RangeSelector.DEFAULT_HEIGHT = 21;


/**
 * Default unit count.
 * @type {number}
 */
anychart.ui.RangeSelector.DEFAULT_UNIT_COUNT = 1;


/**
 * @typedef {{
 *  type: anychart.enums.StockRangeType,
 *  text: string,
 *  unit: anychart.enums.Interval,
 *  count: number,
 *  startDate: string,
 *  endDate: string,
 *  anchor: anychart.enums.StockRangeAnchor
 * }}
 */
anychart.ui.RangeSelector.Range;


/**
 * Set stock chart for Range Selector.
 * @param {anychart.charts.Stock} chart
 */
anychart.ui.RangeSelector.prototype.target = function(chart) {
  this.target_ = chart;
};


/**
 * Handler for stock SELECTED_RANGE_CHANGE event.
 * @param {Object} range
 * @private
 */
anychart.ui.RangeSelector.prototype.changeSelectedRange_ = function(range) {
  // Check MAX
  if (range['firstSelected'] == range['firstKey'] &&
      range['lastSelected'] == range['lastKey']) {
    var maxButton = this.getChild(anychart.enums.StockRangeType.MAX);
    if (maxButton) {
      this.selectionModel_.setSelectedItem(maxButton);
      return;
    }
  }

  this.selectionModel_.setSelectedItem(null);
};


/**
 * Selection handler for SelectionModel.
 * @param {anychart.ui.button.Toggle} button
 * @param {boolean} select
 * @private
 */
anychart.ui.RangeSelector.prototype.selectionHandler_ = function(button, select) {
  if (button) {
    button.setChecked(select);
  }
};


/**
 * Get/set buttons.
 * @param {Array<anychart.ui.RangeSelector.Range>=} opt_ranges
 * @return {Array<anychart.ui.RangeSelector.Range>}
 */
anychart.ui.RangeSelector.prototype.ranges = function(opt_ranges) {
  if (goog.isDef(opt_ranges) && goog.isArray(opt_ranges)) {
    this.ranges_ = goog.array.map(opt_ranges, function(range) {
      // Set default values
      if (range['type'] == anychart.enums.StockRangeType.UNIT) {
        range['count'] = range['count'] || anychart.ui.RangeSelector.DEFAULT_UNIT_COUNT;
        range['anchor'] = anychart.enums.normalizeStockRangeAnchor(range['anchor']);
      }
      return range;
    });
    this.update();
  }
  return this.ranges_;
};


/**
 * @private
 */
anychart.ui.RangeSelector.prototype.createDomInternal_ = function() {
  var element = this.getElement();
  var cssName = anychart.ui.RangeSelector.CSS_CLASS;
  goog.dom.classlist.add(element, cssName);
  // Set absolute position when render inside chart.
  if (this.insideChart_) {
    goog.dom.classlist.add(element, goog.getCssName(cssName, 'inside'));
  }

  // Zoom Label
  this.zoomLabel_ = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-input-label')
      ],
      window['anychart']['format']['getMessage'](this.zoomLabelText_));
  goog.dom.appendChild(element, this.zoomLabel_);
};


/** @override */
anychart.ui.RangeSelector.prototype.createDom = function() {
  anychart.ui.RangeSelector.base(this, 'createDom');
  this.createDomInternal_();
};


/** @override */
anychart.ui.RangeSelector.prototype.decorateInternal = function(element) {
  if (this.isStockChart_(element)) {
    this.render(element);
    return;
  }
  anychart.ui.RangeSelector.base(this, 'decorateInternal', element);
  this.createDomInternal_();
};


/**
 * Update buttons.
 */
anychart.ui.RangeSelector.prototype.update = function() {
  if (!this.isInDocument()) return;
  this.removeChildren(true);
  this.selectionModel_.clear();

  goog.array.forEach(this.ranges_, function(range, index) {
    var button = new anychart.ui.button.Toggle(range['text']);
    button.setModel(range);

    // Set type as id for easy search for SELECTED_RANGE_CHANGE handler.
    if (range['type'] == anychart.enums.StockRangeType.MAX) {
      button.setId(anychart.enums.StockRangeType.MAX);
    }

    // Let the selection model control the button's checked state.
    button.setAutoStates(goog.ui.Component.State.CHECKED, false);
    this.selectionModel_.addItem(button);

    if (!index) {
      button.setCollapsed(goog.ui.ButtonSide.END);
    } else if (index == this.ranges_.length - 1) {
      button.setCollapsed(goog.ui.ButtonSide.START);
    } else {
      button.setCollapsed(goog.ui.ButtonSide.BOTH);
    }

    this.addChild(button, true);
  }, this);
};


/**
 * Gets/sets text for 'zoom'-label.
 * @param {string=} opt_value - Value to set.
 * @return {string|anychart.ui.RangeSelector} - Current value or itself for chaining.
 */
anychart.ui.RangeSelector.prototype.zoomLabelText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.zoomLabelText_ != opt_value) {
      this.zoomLabelText_ = opt_value;
      if (this.zoomLabel_)
        goog.dom.setTextContent(this.zoomLabel_, window['anychart']['format']['getMessage'](this.zoomLabelText_));
    }
    return this;
  }
  return this.zoomLabelText_;
};


/**
 * @param {*} chart
 * @return {boolean}
 * @private
 */
anychart.ui.RangeSelector.prototype.isStockChart_ = function(chart) {
  return /** @type {boolean} */(chart && goog.isFunction(chart['getType']) && chart['getType']() == anychart.enums.ChartTypes.STOCK);
};


/**
 * @param {(anychart.charts.Stock|Element)=} opt_parentElement Optional parent element or stock chart to render the
 *    range picker into.
 * @return {Element|undefined}
 * @private
 */
anychart.ui.RangeSelector.prototype.extractChartContainer_ = function(opt_parentElement) {
  if (this.isStockChart_(opt_parentElement)) {
    this.target(/** @type {anychart.charts.Stock} */(opt_parentElement));
    this.insideChart_ = true;
    var stage = this.target_['container']() ? this.target_['container']()['getStage']() : null;
    if (stage && stage['container']()) {
      opt_parentElement = stage['container']();
    } else {
      opt_parentElement = null;
    }
  }
  return opt_parentElement;
};


/**
 * @param {(anychart.charts.Stock|Element)=} opt_parentElement Optional parent element or stock chart to render the range picker into.
 * @private
 */
anychart.ui.RangeSelector.prototype.delayedRenderOnChartDraw_ = function(opt_parentElement) {
  this.render(opt_parentElement);
};


/**
 * @param {(anychart.charts.Stock|Element)=} opt_parentElement Optional parent element or stock chart to render the
 *    range selector into.
 * @override
 */
anychart.ui.RangeSelector.prototype.render = function(opt_parentElement) {
  var container = this.extractChartContainer_(opt_parentElement || this.target_);
  var rangeSelected = this.target_ ? !isNaN(this.target_['getSelectedRange']()['firstSelected']) : false;

  if (container && rangeSelected) {
    anychart.ui.RangeSelector.base(this, 'render', container);
  } else {
    var bind = goog.bind(this.delayedRenderOnChartDraw_, this, container || this.target_);
    this.target_.listenOnce(anychart.enums.EventType.CHART_DRAW, bind, false, this);
  }
};


/** @override */
anychart.ui.RangeSelector.prototype.enterDocument = function() {
  anychart.ui.RangeSelector.base(this, 'enterDocument');
  if (!this.target_) return;

  this.update();

  if (this.insideChart_) {
    var boxSize = goog.style.getContentBoxSize(this.getElement());
    var totalComponentHeight = (boxSize.height || anychart.ui.RangeSelector.DEFAULT_HEIGHT) + anychart.ui.RangeSelector.COMPONENT_PADDING;
    var targetPadding = this.target_['padding']()['bottom']();

    if (totalComponentHeight > targetPadding) {
      this.target_['padding']()['bottom'](targetPadding + totalComponentHeight);
    }
  }

  this.target_['listen'](
      anychart.enums.EventType.SELECTED_RANGE_CHANGE,
      this.changeSelectedRange_, false, this);

  var handler = this.getHandler();
  handler.listen(this, goog.ui.Component.EventType.ACTION, this.handleButtonAction_);
};


/**
 * Handler for button action.
 * @param {Object} e
 * @private
 */
anychart.ui.RangeSelector.prototype.handleButtonAction_ = function(e) {
  var descriptor = e.target.getModel();
  var type = anychart.enums.normalizeStockRangeType(descriptor['type'], null);

  if (type == anychart.enums.StockRangeType.UNIT) {
    this.target_['selectRange'](descriptor['unit'], descriptor['count'], descriptor['anchor'], true);

  } else if (type == anychart.enums.StockRangeType.YTD ||
      type == anychart.enums.StockRangeType.QTD ||
      type == anychart.enums.StockRangeType.MTD ||
      type == anychart.enums.StockRangeType.MAX) {
    this.target_['selectRange'](type, true);

  } else {
    var fromParsed = window['anychart']['format']['parseDateTime'](descriptor['startDate']);
    var toParsed = window['anychart']['format']['parseDateTime'](descriptor['endDate']);

    if (fromParsed && toParsed) {
      this.target_['selectRange'](fromParsed, toParsed, true);
    }
  }

  this.selectionModel_.setSelectedItem(e.target);
};


/** @override */
anychart.ui.RangeSelector.prototype.exitDocument = function() {
  anychart.ui.RangeSelector.base(this, 'exitDocument');
};


/** @override */
anychart.ui.RangeSelector.prototype.disposeInternal = function() {
  this.target_['unlisten'](
      anychart.enums.EventType.SELECTED_RANGE_CHANGE,
      this.changeSelectedRange_, false, this);
  this.target_ = null;
  this.selectionModel_.clear();

  if (this.zoomLabel_) {
    goog.dom.removeNode(this.zoomLabel_);
    this.zoomLabel_ = null;
  }

  anychart.ui.RangeSelector.base(this, 'disposeInternal');
};


/**
 * Constructor function for range selector.
 * @return {anychart.ui.RangeSelector}
 */
anychart.ui.rangeSelector = function() {
  return new anychart.ui.RangeSelector();
};


//exports
(function() {
  var proto = anychart.ui.RangeSelector.prototype;
  goog.exportSymbol('anychart.ui.rangeSelector', anychart.ui.rangeSelector);
  proto['render'] = proto.render;
  proto['decorate'] = proto.decorate;
  proto['target'] = proto.target;
  proto['ranges'] = proto.ranges;
  proto['dispose'] = proto.dispose;
  proto['getElement'] = proto.getElement;
  proto['zoomLabelText'] = proto.zoomLabelText;
})();
