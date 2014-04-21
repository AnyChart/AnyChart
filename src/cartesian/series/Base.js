goog.provide('anychart.cartesian.series.Base');
goog.require('anychart.VisualBaseWithBounds');
goog.require('anychart.color');
goog.require('anychart.elements.Multilabel');
goog.require('anychart.elements.Tooltip');
goog.require('anychart.events.EventType');



/**
 * Base class for all cartesian series.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.VisualBaseWithBounds}
 */
anychart.cartesian.series.Base = function(data, opt_csvSettings) {
  this.suspendSignalsDispatching();
  goog.base(this);
  this.data(data, opt_csvSettings);

  this.zIndex(30);

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.titleFormatter(function() {
    return this['name'];
  });
  tooltip.textFormatter(function() {
    return this['x'] + ': ' + this['value'];
  });
  tooltip.resumeSignalsDispatching(false);

  this.realLabels_ = new anychart.elements.Multilabel();
  this.realLabels_.listen(acgraph.events.EventType.MOUSEOVER, this.handleLabelMouseOver, false, this);
  this.realLabels_.listen(acgraph.events.EventType.MOUSEOUT, this.handleLabelMouseOut, false, this);
  this.labels().textFormatter(function(provider) { return provider['value']; }).enabled(false);
  this.hoverLabels().textFormatter(function(provider) { return provider['value']; }).enabled(false);
  this.labels().position(anychart.utils.NinePositions.CENTER);
  this.hoverLabels().position(anychart.utils.NinePositions.CENTER);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.cartesian.series.Base, anychart.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.cartesian.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.DATA_CHANGED |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.cartesian.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS |
    anychart.ConsistencyState.DATA;


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.cartesian.series.Base.prototype.name_;


/**
 * @type {!anychart.data.View}
 * @private
 */
anychart.cartesian.series.Base.prototype.data_;


/**
 * @type {anychart.data.View}
 * @private
 */
anychart.cartesian.series.Base.prototype.parentView_;


/**
 * @type {goog.Disposable}
 * @private
 */
anychart.cartesian.series.Base.prototype.parentViewToDispose_;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.cartesian.series.Base.prototype.iterator_;


/**
 * @type {boolean}
 * @protected
 */
anychart.cartesian.series.Base.prototype.firstPointDrawn = false;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.cartesian.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.cartesian.series.Base.prototype.xScale_ = null;


/**
* @type {anychart.elements.Multilabel}
* @private
*/
anychart.cartesian.series.Base.prototype.labels_ = null;


/**
 * @type {anychart.elements.Multilabel}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverLabels_ = null;


/**
 * @type {anychart.elements.Multilabel}
 * @private
 */
anychart.cartesian.series.Base.prototype.realLabels_ = null;


/**
 * @type {anychart.elements.Tooltip}
 * @private
 */
anychart.cartesian.series.Base.prototype.tooltip_ = null;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.pointPosition_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.autoPointPosition_ = 0.5;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.cartesian.series.Base.prototype.zeroY = 0;


/**
 * Список имен полей, которые требуются серии из данных.
 * Например ['x', 'value']. Должен создаваться в конструкторе. Без этого списка не работает метод getReferenceCoords().
 * @type {!Array.<string>}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValueNames;


/**
 * Список атрибутов имен полей из referenceValueNames. Должен быть той же длины, что и referenceValueNames.
 * Например ['x', 'y']. Должен создаваться в конструкторе. Без этого списка не работает метод getReferenceCoords().
 * Возможные значения элементов:
 *    'x' - трансформируется через xScale,
 *    'y' - трансформируется через yScale,
 *    'z' - получается как zero Y.
 * NOTE: если нужно значение zeroY, то его нужно спрашивать ДО всех 'y' значений.
 * @type {!Array.<string>}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValueMeanings;


/**
 * Определяет, должен ли метод getReferenceCoords() поддерживать стэкирование.
 * @type {boolean}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValuesSupportStack = true;


/**
 * Поддерживает ли серия стэкирование.
 * @return {boolean} .
 */
anychart.cartesian.series.Base.prototype.supportsStack = function() {
  return this.referenceValuesSupportStack;
};


/**
 * Цвет серии. См. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.cartesian.series.Base.prototype.color_ = null;


/**
 * Цвет серии, распределенный чартом. См. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.cartesian.series.Base.prototype.autoColor_ = null;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.fill_ = (function() {
  return this['sourceColor'];
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverFill_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @protected
 */
anychart.cartesian.series.Base.prototype.strokeInternal = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverStroke_ = null;


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleLabelMouseOver = function(event) {
  if (event && goog.isDef(event['labelIndex'])) {
    this.hoverPoint(event['labelIndex'], event);
  } else
    this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleLabelMouseOut = function(event) {
  this.unhover();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets series name.
 * @param {string=} opt_value Series name value.
 * @return {!(string|anychart.cartesian.series.Base|undefined)} Series name value or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      //todo: send signal to redraw name depend components, series, legend etc
    }
    return this;
  } else {
    return this.name_;
  }
};


/**
 * Getter and setter for series mapping.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)=} opt_value New data
 *    if used as a setter.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {(!anychart.cartesian.series.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping
 *    if used as a getter.
 */
anychart.cartesian.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
    if (opt_value instanceof anychart.data.View)
      this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
    else if (opt_value instanceof anychart.data.Set)
      this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
    else
      this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
          (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
    this.registerDisposable(this.parentViewToDispose_);
    this.data_ = this.parentView_;
    this.data_.listenSignals(this.dataInvalidated_, this);
    // DATA поддерживается только в Bubble, для него и инвалидируется.
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.DATA,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.cartesian.series.Base.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * DO NOT PUBLISH.
 * @param {?Array.<*>} categories .
 */
anychart.cartesian.series.Base.prototype.categoriseData = function(categories) {
  this.data_ = this.parentView_.prepare('x', categories || undefined);
};


/**
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.cartesian.series.Base.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.cartesian.series.Base.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/**
 * Извлекает из ряда, на который указывает итератор данных, массив значений опорных полей типа 'y'.
 * Опорные поля серии определяются массивами referenceValueNames и referenceValueMeanings.
 * Если такое поле одно - вернется его значение.
 * Если их несколько - массив значений.
 * Если хоть одно из этих значений не определено - возвращает null.
 *
 * @return {Array.<*>|null} Fetches significant scale values from current data row.
 */
anychart.cartesian.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'y') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (isNaN(val)) return null;
    res.push(val);
  }
  return res;
};


/**
 * Извлекает из ряда, на который указывает итератор данных, массив значений опорных полей и получает их пиксельные
 * значения. Опорные поля серии определяются массивами referenceValueNames и referenceValueMeanings.
 * Если хоть одно из этих значений не определено - возвращает null.
 *
 * @return {Array.<number>|null} Массив со значениями колонок или null, если хоть одно значение не определено.
 *    (так сделано, чтобы не нужно было еще раз перебирать этот массив для определения того, missing ли это).
 * @protected
 */
anychart.cartesian.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;
  var stacked = yScale.stackMode() != anychart.scales.StackMode.NONE;
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    var val = iterator.get(this.referenceValueNames[i]);

    if (!goog.isDef(val)) {
      if (stacked && this.referenceValuesSupportStack)
        fail = true;
      else
        return null;
    }

    var pix;
    switch (this.referenceValueMeanings[i]) {
      case 'x':
        pix = this.applyRatioToBounds(
            xScale.transform(val, /** @type {number} */(this.xPointPosition())),
            true);
        break;
      case 'y':
        if (this.referenceValuesSupportStack)
          val = yScale.applyStacking(val);
        pix = this.applyRatioToBounds(yScale.transform(val, 0.5), false);
        break;
      case 'z':
        if (stacked) {
          if (this.referenceValuesSupportStack)
            val = yScale.getPrevVal(val);
          pix = this.applyRatioToBounds(goog.math.clamp(yScale.transform(val, 0.5), 0, 1), false);
        } else {
          pix = this.zeroY;
        }
        break;
      case 'n':
        pix = /** @type {number} */(+val);
        break;
    }

    if (isNaN(pix)) fail = true;

    res.push(pix);
  }
  return fail ? null : res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {number=} opt_position .
 * @return {number|anychart.cartesian.series.Base} .
 */
anychart.cartesian.series.Base.prototype.xPointPosition = function(opt_position) {
  if (goog.isDef(opt_position)) {
    if (this.pointPosition_ != +opt_position) {
      this.pointPosition_ = +opt_position;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return isNaN(this.pointPosition_) ? this.autoPointPosition_ : this.pointPosition_;
};


/**
 * Служит для автоназначения позиции плотом - если установлено внешнее значение, то не забивает его.
 * @param {number} position .
 * @return {anychart.cartesian.series.Base} .
 */
anychart.cartesian.series.Base.prototype.setAutoXPointPosition = function(position) {
  this.autoPointPosition_ = +position;
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Рисует серию в текущий контейнер. Если у серии не заданы шкалы - создает их автоматически.
 * (Внутри компонента не используется - чистый сахар).
 * @param {number=} opt_parentWidth Optional width of the parent container for series bounds calculation.
 * @param {number=} opt_parentHeight Optional height of the parent container for series bounds calculation.
 */
anychart.cartesian.series.Base.prototype.draw = function(opt_parentWidth, opt_parentHeight) {
  this.suspendSignalsDispatching();
  var iterator;
  var value;
  var scale;
  if (!this.xScale()) {
    scale = new anychart.scales.Ordinal();
    this.xScale(scale);
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = iterator.get('x');
      if (goog.isDef(value))
        scale.extendDataRange(value);
    }
    scale.finishAutoCalc();
  }
  if (!this.yScale()) {
    scale = new anychart.scales.Linear();
    this.yScale(scale);
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = this.getReferenceScaleValues();
      if (value)
        scale.extendDataRange.apply(scale, value);
    }
    scale.finishAutoCalc();
  }

  var hasParentBounds = goog.isDef(opt_parentWidth) && goog.isDef(opt_parentHeight);
  if (hasParentBounds)
    this.pixelBounds(/** @type {anychart.math.Rect} */(this.pixelBounds(opt_parentWidth, opt_parentHeight)));

  iterator = this.getResetIterator();
  this.startDrawing();
  while (iterator.advance())
    this.drawPoint();
  this.finalizeDrawing();

  if (hasParentBounds) this.pixelBounds(null);
  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Draws all series points.
 */
anychart.cartesian.series.Base.prototype.drawPoint = function() {
  if (this.enabled()) {
    if (this.firstPointDrawn)
      this.firstPointDrawn = this.drawSubsequentPoint();
    else
      this.firstPointDrawn = this.drawFirstPoint();
    if (this.firstPointDrawn) {
      this.drawLabel(false);
    }
  }
};


/**
 * Draws series point explicitly marked as missing.
 * Этот метод используется параллельным итератором в случае, если серии необходимо явно сказать, что нужно
 * нарисовать отсутствующую точку (для случая, когда в данных этой серии такой Х отстутсвует, а в других
 * сериях он есть).
 */
anychart.cartesian.series.Base.prototype.drawMissing = function() {
  this.firstPointDrawn = false;
  if (this.yScale().stackMode() != anychart.scales.StackMode.NONE && this.referenceValuesSupportStack) {
    for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
      if (this.referenceValueMeanings[i] == 'y')
        this.yScale().applyStacking(NaN);
    }
  }
};


/**
 * Starts series drawing.
 */
anychart.cartesian.series.Base.prototype.startDrawing = function() {
  this.firstPointDrawn = false;

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;
  this.zeroY = this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false);

  this.checkDrawingNeeded();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.realLabels_.suspendSignalsDispatching();
  this.realLabels_.deserialize(this.labels_.serialize(true));
  this.realLabels_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.realLabels_.parentBounds(/** @type {anychart.math.Rect} */(this.pixelBounds()));
};


/**
 * Finalizes drawing.
 */
anychart.cartesian.series.Base.prototype.finalizeDrawing = function() {
  this.realLabels_.end();
  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);
  this.realLabels_.resumeSignalsDispatching(false);

  this.realLabels_.markConsistent(anychart.ConsistencyState.ALL);
  if (this.labels_)
    this.labels_.markConsistent(anychart.ConsistencyState.ALL);
  if (this.hoverLabels_)
    this.hoverLabels_.markConsistent(anychart.ConsistencyState.ALL);
  this.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Draws marker for the point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @protected
 */
anychart.cartesian.series.Base.prototype.drawLabel = function(hovered) {
  var pointLabel = this.getIterator().get(hovered ? 'hoverLabel' : 'label');
  var index = this.getIterator().getIndex();
  var labels = /** @type {anychart.elements.Multilabel} */(hovered ? this.hoverLabels() : this.labels());
  if (goog.isDef(pointLabel))
    labels.deserializeAt(index, /** @type {Object} */(pointLabel));
  this.realLabels_.dropCustomSettingsAt(index);
  this.realLabels_.deserializeAt(index, labels.serializeAt(index, !hovered));
  this.realLabels_.textFormatter(/** @type {Function} */(labels.textFormatter()));
  this.realLabels_.positionFormatter(/** @type {Function} */(labels.positionFormatter()));
  this.realLabels_.draw(this.createFormatProvider(),
      this.createPositionProvider(/** @type {anychart.utils.NinePositions|string} */(this.realLabels_.positionAt(index))),
      index);
};


/**
 * Show data point tooltip.
 * @protected
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate tooltip to show.
 */
anychart.cartesian.series.Base.prototype.showTooltip = function(opt_event) {
  this.moveTooltip(opt_event);
  acgraph.events.listen(
      goog.dom.getDocument(),
      acgraph.events.EventType.MOUSEMOVE,
      this.moveTooltip,
      false,
      this);
};


/**
 * Show data point tooltip.
 * @protected
 */
anychart.cartesian.series.Base.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  acgraph.events.unlisten(
      goog.dom.getDocument(),
      acgraph.events.EventType.MOUSEMOVE,
      this.moveTooltip,
      false,
      this);
  tooltip.hide();
};


/**
 * @protected
 * @param {goog.events.BrowserEvent=} opt_event that initiate tooltip to show.
 */
anychart.cartesian.series.Base.prototype.moveTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());

  if (tooltip.isFloating() && opt_event) {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(opt_event.clientX, opt_event.clientY));
  } else {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(0, 0));
  }
};


/**
 * Create column series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.cartesian.series.Base.prototype.createFormatProvider = function() {
  var iterator = this.getIterator();
  var index = iterator.getIndex();
  return {
    'value': iterator.get('value'),
    'x': iterator.get('x'),
    'index': index,
    'name': this.name_ ? this.name_ : 'Series'
  };
};


/**
 * Create column series format provider.
 * @param {anychart.utils.NinePositions|string} position
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.cartesian.series.Base.prototype.createPositionProvider = goog.abstractMethod;


/**
 * Draws first point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.cartesian.series.Base.prototype.drawFirstPoint = function() {
  return this.drawSubsequentPoint();
};


/**
 * Draws subsequent point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.cartesian.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


/**
 * Применяет переданное ратио (обычно значение, трансформированное шкалой) к баундам, в которые должна нарисоваться
 * серия.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.cartesian.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  /** @type {acgraph.math.Rect} */
  var bounds = /** @type {acgraph.math.Rect} */(this.pixelBounds());
  var min, range;
  if (horizontal) {
    min = bounds.left;
    range = bounds.width;
  } else {
    min = bounds.getBottom();
    range = -bounds.height;
  }
  return min + ratio * range;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleMouseOver = function(event) {
  var res = this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
  if (res) {
    if (event && event.target) {
      if (goog.isDef(event.target['__tagIndex']))
        this.hoverPoint(event.target['__tagIndex'], event);
      else if (event.target['__tagSeriesGlobal'])
        this.hoverSeries();
      else
        this.unhover();
    } else
      this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleMouseOut = function(event) {
  var res = this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
  if (res) {
    this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleBrowserEvents = function(event) {
  this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
};


/**
 * Series hover status. NaN - not hovered, -1 - series hovered, non-negative number - point with this index hovered.
 * @type {number}
 * @protected
 */
anychart.cartesian.series.Base.prototype.hoverStatus = NaN;


/**
 * Hovers all points of the series.
 * @return {!anychart.cartesian.series.Base} Chaining.
 */
anychart.cartesian.series.Base.prototype.hoverSeries = goog.abstractMethod;


/**
 * Hovers a point of the series by its index.
 * @param {number} index Index of the point to hover.
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate point hovering.
 * @return {!anychart.cartesian.series.Base} Chaining.
 */
anychart.cartesian.series.Base.prototype.hoverPoint = goog.abstractMethod;


/**
 * Removes hover from the series.
 * @return {!anychart.cartesian.series.Base} Chaining.
 */
anychart.cartesian.series.Base.prototype.unhover = goog.abstractMethod;


/**
 * Временно работает только на acgraph.vector.Element.
 * @param {acgraph.vector.IElement} element .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.cartesian.series.Base.prototype.makeHoverable = function(element, opt_seriesGlobal) {
  if (!element) return;
  if (opt_seriesGlobal)
    element['__tagSeriesGlobal'] = true;
  else
    element['__tagIndex'] = this.getIterator().getIndex();
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.MOUSEOVER, this.handleMouseOver, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.CLICK, this.handleBrowserEvents, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.DBLCLICK, this.handleBrowserEvents, false, this);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets series X scale.
 * @param {anychart.scales.Base=} opt_value Series X Scale to set.
 * @return {(anychart.scales.Base|anychart.cartesian.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlisten(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.xScale_ = opt_value;
      this.xScale_.listen(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.xScale_;
  }
};


/**
 * Gets or sets series Y scale.
 * @param {anychart.scales.Base=} opt_value Series Y Scale to set.
 * @return {(anychart.scales.Base|anychart.cartesian.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlisten(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.yScale_ = opt_value;
      this.yScale_.listen(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.series.Base.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series data tooltip.
 * @param {(null|string|Object|anychart.elements.Tooltip)=} opt_value Tooltip settings.
 * @return {!(anychart.cartesian.series.Base|anychart.elements.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.elements.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Tooltip) {
      this.tooltip_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.tooltip_.deserialize(opt_value);
    } else if (anychart.isNone(opt_value)) {
      this.tooltip_.enabled(false);
    }
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.series.Base.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
* Gets or sets series data labels.
* @param {(anychart.elements.Multilabel|Object|string|null)=} opt_value Series data labels settings.
* @return {!(anychart.elements.Multilabel|anychart.cartesian.series.Base)} Labels instance or itself for chaining call.
*/
anychart.cartesian.series.Base.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.elements.Multilabel();
    this.registerDisposable(this.labels_);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Multilabel) {
      var data = opt_value.serialize();
      this.labels_.deserialize(data);
    } else if (goog.isObject(opt_value)) {
      this.labels_.deserialize(opt_value);
    } else if (anychart.isNone(opt_value)) {
      this.labels_.enabled(false);
    }
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets series hover data labels.
 * @param {(anychart.elements.Multilabel|Object|string|null)=} opt_value Series data labels settings.
 * @return {!(anychart.elements.Multilabel|anychart.cartesian.series.Base)} Labels instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.elements.Multilabel();
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Multilabel) {
      var data = opt_value.serialize();
      this.hoverLabels_.deserialize(data);
    } else if (goog.isObject(opt_value)) {
      this.hoverLabels_.deserialize(opt_value);
    } else if (anychart.isNone(opt_value)) {
      this.hoverLabels_.enabled(false);
    }
    return this;
  }
  return this.hoverLabels_;
};


/**
* Listener for labels invalidation.
* @param {anychart.SignalEvent} event Invalidation event.
* @private
*/
anychart.cartesian.series.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
// Здесь будут лежать настройки фила и строука, но экспортироваться они должны ТОЛЬКО в конечных сериях.
/**
 * Цвет серии. Используется как базовый цвет серии в филах и строуках, а так же в легенде.
 * Если используется как геттер:
 *    1) Если цвет был явно задан ранее - возвращается заданный цвет.
 *    2) Если цвет не был задан, но серия была добавлена на график - возвращается цвет, распределенный серии чартом.
 *    3) Если пункты 1 и 2 не сработали - возращается дефолтный цвет.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.cartesian.series.Base)} .
 */
anychart.cartesian.series.Base.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = goog.isNull(opt_fillOrColorOrKeys) ? null : anychart.color.normalizeFill.apply(null, arguments);
    if (this.color_ != color) {
      this.color_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.color_ || this.autoColor_ || 'blue';
};


/**
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.cartesian.series.Base.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
};


/**
 * Общий филл, но! Может принять еще функцию первым параметром.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Общий филл, но! Может принять еще функцию первым параметром.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Base.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverFill_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Base.prototype.getFinalFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      (usePointSettings && iterator.get('fill')) ||
          this.fill());
  return /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
              (usePointSettings && iterator.get('hoverFill')) ||
                  this.hoverFill() ||
                  normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.cartesian.series.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    if (stroke != this.strokeInternal) {
      this.strokeInternal = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.strokeInternal;
};


/**
 * Общий строук, но! Может принять еще функцию первым параметром.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки границ примитива,
 *    если используется как сеттер.
 * @param {number=} opt_thickness Толщина линии. Если не передано, будет установлено в 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: '5 3 2' is equivalent to dashpattern: '5 3 2 5 3 2'.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function}
 *    Если используется как сеттер, то возвращает себя, для реализации цепного вызовы.
 *    Если используется как геттер, то возвращает текущую настройку линии.
 */
anychart.cartesian.series.Base.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Base.prototype.getFinalStroke = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      (usePointSettings && iterator.get('stroke')) ||
          this.stroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              (iterator.get('hoverStroke') && usePointSettings) ||
                  this.hoverStroke() ||
                  normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.cartesian.series.Base.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'iterator': this.getIterator()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * Return color for legend item.
 * @return {!acgraph.vector.Fill} Color for legend item.
 */
anychart.cartesian.series.Base.prototype.getLegendItemColor = function() {
  return this.getFinalFill(false, false);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Restore series default settings.
 * @return {anychart.cartesian.series.Base} Return itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.restoreDefaults = function() {

  return this;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['data'] = this.data().serialize();
  json['name'] = this.name();

  json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color()));

  if (goog.isFunction(this.fill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize fill function, you should reset it manually.');
    }
  } else {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  }

  if (goog.isFunction(this.hoverFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverFill function, you should reset it manually.');
    }
  } else {
    json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
  }

  if (goog.isFunction(this.stroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize stroke function, you should reset it manually.');
    }
  } else {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  }

  if (goog.isFunction(this.hoverStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverStroke function, you should reset it manually.');
    }
  } else {
    json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
  }

  json['tooltip'] = this.tooltip().serialize();
  json['labels'] = this.labels().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Base.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.data(config['data']);
  this.name(config['name']);
  this.color(config['color']);
  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.tooltip(config['tooltip']);
  this.labels(config['labels']);

  this.resumeSignalsDispatching(false);

  return this;
};



/**
 * Encapsulates browser event for acgraph.
 * @param {anychart.cartesian.series.Base} target EventTarget to be set as a target of the event.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.cartesian.series.Base.BrowserEvent = function(target, opt_e) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, target);

  /**
   * Point index.
   * @type {number}
   */
  this['pointIndex'] = opt_e && opt_e.target && opt_e.target['__tagIndex'];
  if (isNaN(this['pointIndex']))
    this['pointIndex'] = -1;

  /**
   * Series data iterator ready for the point capturing.
   * @type {!anychart.data.Iterator}
   */
  this['iterator'] = target.data().getIterator();
  this['iterator'].select(this['pointIndex']) || this['iterator'].reset();

  /**
   * Series.
   * @type {anychart.cartesian.series.Base}
   */
  this['series'] = target;
};
goog.inherits(anychart.cartesian.series.Base.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.cartesian.series.Base.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.cartesian.series.Base.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  var type = e.type;
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.events.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.events.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.events.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.events.EventType.POINT_DOUBLE_CLICK;
      break;
  }
  this.type = type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this.offsetX = e.offsetX;
  this.offsetY = e.offsetY;

  this.clientX = e.clientX;
  this.clientY = e.clientY;

  this.screenX = e.screenX;
  this.screenY = e.screenY;

  this.button = e.button;

  this.keyCode = e.keyCode;
  this.charCode = e.charCode;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = e.platformModifierKey;
  this.state = e.state;

  this.event_ = e;
  delete this.propagationStopped_;
};
