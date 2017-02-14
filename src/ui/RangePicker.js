goog.provide('anychart.ui.RangePicker');

goog.require('anychart.enums');

goog.require('goog.dom.selection');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.Component');
goog.require('goog.ui.LabelInput');

goog.forwardDeclare('anychart.charts.Stock');



/**
 * Range Picker (for stock chart).
 * @constructor
 * @extends {goog.ui.Component}
 */
anychart.ui.RangePicker = function() {
  anychart.ui.RangePicker.base(this, 'constructor');

  /**
   * Stock chart.
   * @type {?anychart.charts.Stock}
   * @private
   */
  this.target_ = null;

  /**
   * DateTime format.
   * @type {string}
   * @private
   */
  this.format_ = 'yyyy MMM dd';

  /**
   * @type {Element}
   * @private
   */
  this.fromLabel_ = null;

  /**
   * Label text for fromLabel.
   * @type {string}
   * @private
   */
  this.fromLabelText_ = 'From:';

  /**
   * Field "from".
   * @type {goog.ui.LabelInput}
   * @private
   */
  this.fromInput_;

  /**
   * @type {Element}
   * @private
   */
  this.toLabel_ = null;

  /**
   * Label text for toLabel.
   * @type {string}
   * @private
   */
  this.toLabelText_ = 'To:';

  /**
   * Field "to".
   * @type {goog.ui.LabelInput}
   * @private
   */
  this.toInput_;

  /**
   * If this control rendered inside the stock chart.
   * @type {boolean}
   * @private
   */
  this.insideChart_ = false;

  /**
   * @type {number} timestamp
   * @private
   */
  this.fromValue_ = NaN;

  /**
   * @type {number} timestamp
   * @private
   */
  this.toValue_ = NaN;
};
goog.inherits(anychart.ui.RangePicker, goog.ui.Component);


/** @type {string} */
anychart.ui.RangePicker.CSS_CLASS = goog.getCssName('anychart-range-picker');


/**
 * Padding in pixels.
 * @type {number}
 */
anychart.ui.RangePicker.COMPONENT_PADDING = 15;


/**
 * There is no good way to detect UI element height in case of hidden container.
 * Parent element can be hidden, even if we render UI in different visible container,
 * there can be css styles with size related settings that affects UI only in parent container, etc.
 * So we just set fallback height.
 * @type {number}
 */
anychart.ui.RangePicker.DEFAULT_HEIGHT = 21;


/**
 * Set stock chart for Range Picker.
 * @param {anychart.charts.Stock} chart
 */
anychart.ui.RangePicker.prototype.target = function(chart) {
  this.target_ = chart;
};


/**
 * Update values in input fields.
 * @param {Object} range
 * @private
 */
anychart.ui.RangePicker.prototype.changeSelectedRange_ = function(range) {
  this.fromValue_ = range['firstSelected'];
  this.toValue_ = range['lastSelected'];
  this.update_();
};


/** @private */
anychart.ui.RangePicker.prototype.update_ = function() {
  if (this.fromInput_) {
    this.fromInput_.setValue(window['anychart']['format']['dateTime'](this.fromValue_, this.format()));
  }

  if (this.toInput_) {
    this.toInput_.setValue(window['anychart']['format']['dateTime'](this.toValue_, this.format()));
  }
};


/**
 * Get/set input and output date time format.
 * @param {string=} opt_format
 * @return {string}
 */
anychart.ui.RangePicker.prototype.format = function(opt_format) {
  if (goog.isDef(opt_format)) {
    this.format_ = opt_format;
    this.update_();
  }
  return this.format_ || window['anychart']['format']['outputDateTimeFormat']();
};


/**
 * @private
 */
anychart.ui.RangePicker.prototype.createDomInternal_ = function() {
  var dom = this.getDomHelper();
  var element = this.getElement();
  var cssName = anychart.ui.RangePicker.CSS_CLASS;
  goog.dom.classlist.add(element, cssName);
  // Set absolute position when render inside chart.
  if (this.insideChart_) {
    goog.dom.classlist.add(element, goog.getCssName(cssName, 'inside'));
  }

  // From Label
  this.fromLabel_ = dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-input-label')
      ],
      window['anychart']['format']['getMessage'](this.fromLabelText_));
  goog.dom.appendChild(element, this.fromLabel_);

  this.fromInput_ = new goog.ui.LabelInput(/*'From date'*/);
  this.addChild(this.fromInput_, true);
  goog.dom.classlist.addAll(
      this.fromInput_.getElement(),
      [
        goog.getCssName('anychart-label-input')
      ]);

  // To Label
  this.toLabel_ = dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-input-label')
      ],
      window['anychart']['format']['getMessage'](this.toLabelText_));
  goog.dom.appendChild(element, this.toLabel_);

  this.toInput_ = new goog.ui.LabelInput(/*'To date'*/);
  this.addChild(this.toInput_, true);
  goog.dom.classlist.addAll(
      this.toInput_.getElement(), [
        goog.getCssName('anychart-label-input')
      ]);

  if (this.target_) {
    this.changeSelectedRange_(this.target_['getSelectedRange']());
  }
};


/** @override */
anychart.ui.RangePicker.prototype.createDom = function() {
  anychart.ui.RangePicker.base(this, 'createDom');
  this.createDomInternal_();
};


/**
 * @param {*} chart
 * @return {boolean}
 * @private
 */
anychart.ui.RangePicker.prototype.isStockChart_ = function(chart) {
  return /** @type {boolean} */(chart && goog.isFunction(chart['getType']) && chart['getType']() == anychart.enums.ChartTypes.STOCK);
};


/**
 * @param {(anychart.charts.Stock|Element)=} opt_parentElement Optional parent element or stock chart to render the
 *    range picker into.
 * @return {Element|undefined}
 * @private
 */
anychart.ui.RangePicker.prototype.extractChartContainer_ = function(opt_parentElement) {
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
anychart.ui.RangePicker.prototype.delayedRenderOnChartDraw_ = function(opt_parentElement) {
  this.render(opt_parentElement);
};


/** @override */
anychart.ui.RangePicker.prototype.decorateInternal = function(element) {
  if (this.isStockChart_(element)) {
    this.render(element);
    return;
  }
  anychart.ui.RangePicker.base(this, 'decorateInternal', element);
  this.createDomInternal_();
};


/**
 * Gets/sets text for 'from'-label.
 * @param {string=} opt_value - Value to set.
 * @return {string|anychart.ui.RangePicker} - Current value or itself for chaining.
 */
anychart.ui.RangePicker.prototype.fromLabelText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.fromLabelText_ != opt_value) {
      this.fromLabelText_ = opt_value;
      if (this.fromLabel_)
        goog.dom.setTextContent(this.fromLabel_, window['anychart']['format']['getMessage'](this.fromLabelText_));
    }
    return this;
  }
  return this.fromLabelText_;
};


/**
 * Gets/sets text for 'to'-label.
 * @param {string=} opt_value - Value to set.
 * @return {string|anychart.ui.RangePicker} - Current value or itself for chaining.
 */
anychart.ui.RangePicker.prototype.toLabelText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.toLabelText_ != opt_value) {
      this.toLabelText_ = opt_value;
      if (this.toLabel_)
        goog.dom.setTextContent(this.toLabel_, window['anychart']['format']['getMessage'](this.toLabelText_));
    }
    return this;
  }
  return this.toLabelText_;
};


/**
 * @param {(anychart.charts.Stock|Element)=} opt_parentElement Optional parent element or stock chart to render the
 *    range picker into.
 * @override
 */
anychart.ui.RangePicker.prototype.render = function(opt_parentElement) {
  var container = this.extractChartContainer_(opt_parentElement || this.target_);
  var rangeSelected = this.target_ ? !isNaN(this.target_['getSelectedRange']()['firstSelected']) : false;

  if (container && rangeSelected) {
    anychart.ui.RangePicker.base(this, 'render', container);
  } else {
    var bind = goog.bind(this.delayedRenderOnChartDraw_, this, container || this.target_);
    this.target_.listenOnce(anychart.enums.EventType.CHART_DRAW, bind, false, this);
  }
};


/** @override */
anychart.ui.RangePicker.prototype.enterDocument = function() {
  anychart.ui.RangePicker.base(this, 'enterDocument');

  if (!this.target_) return;

  if (this.insideChart_) {
    var boxSize = goog.style.getContentBoxSize(this.getElement());
    var totalComponentHeight = (boxSize.height || anychart.ui.RangePicker.DEFAULT_HEIGHT) + anychart.ui.RangePicker.COMPONENT_PADDING;
    var targetPadding = this.target_['padding']()['bottom']();

    if (totalComponentHeight > targetPadding) {
      this.target_['padding']()['bottom'](targetPadding + totalComponentHeight);
    }
  }

  this.target_['listen'](
      anychart.enums.EventType.SELECTED_RANGE_CHANGE,
      this.changeSelectedRange_, false, this);

  var handler = this.getHandler();
  handler.listen(this.fromInput_.getElement(),
      goog.events.EventType.BLUR, this.onInputBlur_);
  handler.listen(this.toInput_.getElement(),
      goog.events.EventType.BLUR, this.onInputBlur_);
  if (!this.fromInputKeyHandler_) {
    this.fromInputKeyHandler_ = new goog.events.KeyHandler(this.fromInput_.getElement());
    handler.listen(this.fromInputKeyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
  }
  if (!this.toInputKeyHandler_) {
    this.toInputKeyHandler_ = new goog.events.KeyHandler(this.toInput_.getElement());
    handler.listen(this.toInputKeyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
  }
};


/**
 * Handle blur event on from/to inputs.
 * @private
 */
anychart.ui.RangePicker.prototype.onInputBlur_ = function() {
  var from = this.fromInput_.getValue();
  var to = this.toInput_.getValue();
  var dateFormat = this.format();
  var fromParsed = window['anychart']['format']['parseDateTime'](from, dateFormat);
  var toParsed = window['anychart']['format']['parseDateTime'](to, dateFormat);

  if (fromParsed && toParsed) {
    var fromTimeStamp = fromParsed.getTime();
    var toTimeStamp = toParsed.getTime();

    // Flip
    if (fromTimeStamp > toTimeStamp) {
      // Destructuring assignment.
      fromParsed = [toParsed, toParsed = fromParsed][0];
      fromTimeStamp = [toTimeStamp, toTimeStamp = fromTimeStamp][0];
    }

    if (fromTimeStamp != this.fromValue_ || toTimeStamp != this.toValue_) {
      this.fromValue_ = fromTimeStamp;
      this.toValue_ = toTimeStamp;
      this.target_['selectRange'](fromParsed, toParsed, true);
      return;
    }
  }

  // Reset values when time is wrong or time was flipped.
  this.fromInput_.setValue(window['anychart']['format']['dateTime'](this.fromValue_, this.format()));
  this.toInput_.setValue(window['anychart']['format']['dateTime'](this.toValue_, this.format()));
};


/**
 * Handles keyboard events from the input box.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @private
 */
anychart.ui.RangePicker.prototype.onKeyPress_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER) {
    var element = e.target.labelInput_.getElement();
    var caretPosition = goog.dom.selection.getStart(element);
    this.onInputBlur_();
    goog.dom.selection.setCursorPosition(element, caretPosition);
  }
};


/** @override */
anychart.ui.RangePicker.prototype.exitDocument = function() {
  anychart.ui.RangePicker.base(this, 'exitDocument');
};


/** @override */
anychart.ui.RangePicker.prototype.disposeInternal = function() {
  this.target_['unlisten'](
      anychart.enums.EventType.SELECTED_RANGE_CHANGE,
      this.changeSelectedRange_, false, this);
  this.target_ = null;

  if (this.toLabel_) {
    goog.dom.removeNode(this.fromLabel_);
    this.fromLabel_ = null;
  }

  if (this.toLabel_) {
    goog.dom.removeNode(this.toLabel_);
    this.toLabel_ = null;
  }

  if (this.fromInputKeyHandler_) {
    this.getHandler().unlisten(this.fromInputKeyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
    this.fromInputKeyHandler_.dispose();
    this.fromInputKeyHandler_ = null;
  }

  if (this.toInputKeyHandler_) {
    this.getHandler().unlisten(this.toInputKeyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKeyPress_);
    this.toInputKeyHandler_.dispose();
    this.toInputKeyHandler_ = null;
  }

  anychart.ui.RangePicker.base(this, 'disposeInternal');
};


/**
 * Constructor function for range picker.
 * @return {anychart.ui.RangePicker}
 */
anychart.ui.rangePicker = function() {
  return new anychart.ui.RangePicker();
};


//exports
(function() {
  var proto = anychart.ui.RangePicker.prototype;
  goog.exportSymbol('anychart.ui.rangePicker', anychart.ui.rangePicker);
  proto['render'] = proto.render;
  proto['decorate'] = proto.decorate;
  proto['target'] = proto.target;
  proto['format'] = proto.format;
  proto['dispose'] = proto.dispose;
  proto['getElement'] = proto.getElement;
  proto['toLabelText'] = proto.toLabelText;
  proto['fromLabelText'] = proto.fromLabelText;
})();
