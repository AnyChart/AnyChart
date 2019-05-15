goog.provide('anychart.format.FormatSelector');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.format');
goog.require('anychart.reflow.IMeasurementsTargetProvider');



//endregion
//region -- Constructor.
/**
 * Class to simplify format auto-selection for gantt timeline header levels.
 * @param {(string|Array.<string>)=} opt_formats - User-defined formats for level.
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 */
anychart.format.FormatSelector = function(opt_formats) {
  anychart.format.FormatSelector.base(this, 'constructor');

  /**
   * User defined formats.
   * @type {?(string|Array.<string>)}
   * @private
   */
  this.formats_ = opt_formats || null;

  /**
   * Labels settings.
   * @type {anychart.core.ui.LabelsSettings}
   * @private
   */
  this.labels_ = null;

  /**
   * Map of formats that contains data for format by related labels settings.
   * @type {Object.<string, anychart.format.FormatSelector.FormatMetrics>}
   */
  this.formatsMap = {};

  /**
   * Array that is in sync with this.texts_ to correctly
   * put measured text bounds to this.formatsMap by using the same objects in
   * this.formatsMap and in this.textsFormatReference_.
   * @type {Array.<anychart.format.FormatSelector.FormatMetrics>}
   * @private
   */
  this.textsFormatReference_ = [];

  /**
   * Texts to measure.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.texts_ = [];

  /**
   * Flag whether bounds measured for this.texts_ are spread into
   * this.textsFormatReference_.
   * @type {boolean}
   * @private
   */
  this.isInSync_ = false;

};
goog.inherits(anychart.format.FormatSelector, anychart.core.Base);


//endregion
//region -- Signals and Consistency.
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.format.FormatSelector.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


/**
 * Supported signals.
 * @type {number}
 */
anychart.format.FormatSelector.prototype.SUPPORTED_SIGNALS =
    anychart.core.Base.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.MEASURE_COLLECT | //Signal for Measuriator to collect labels to measure.
    anychart.Signal.MEASURE_BOUNDS; //Signal for Measuriator to measure the bounds of collected labels.


//endregion
//region -- Constants and typedefs.
/**
 * Default format.
 * @type {string}
 * @const
 */
anychart.format.FormatSelector.DEFAULT_FORMAT = 'yyyy/MM/dd\'T\'HH:mm:ss.SSS';


/**
 * This format is not chosen randomly:
 * We use it to maximize the date label width as better as it possible
 * to decide which date is widest in selected format for most of cases.
 * 10th month is pretty long text (November or something like סעפּטעמבער ).
 * 2000-11-29 is Wednesday (pretty long as well).
 * This allows to maximize bounds during the measurements in different formats.
 *
 * @type {number}
 */
anychart.format.FormatSelector.DEFAULT_TIME = Date.UTC(2000, 10, 29, 23, 59, 59, 999);


/**
 * @typedef {{
 *  index: number,
 *  width: number,
 *  height: number
 * }}
 */
anychart.format.FormatSelector.FormatMetrics;


/**
 * @typedef {{
 *  format: string,
 *  width: number,
 *  sourceIndex: number
 * }}
 */
anychart.format.FormatSelector.SortedMetrics;


//endregion
//region -- anychart.reflow.IMeasurementsTargetProvider implementation.
/**
 * @inheritDoc
 */
anychart.format.FormatSelector.prototype.provideMeasurements = function() {
  return this.texts_;
};


//endregion
//region -- Formats selection and measurement.
/**
 * Selects default locale timeline formats.
 */
anychart.format.FormatSelector.prototype.selectFormats = function() {
  var formats, userDefinedFormats;
  this.isInSync_ = false;

  if (this.formats_) {
    userDefinedFormats = goog.isArray(this.formats_) ? this.formats_ : [this.formats_];
  } else {
    var outputLoc = anychart.format.getDateTimeLocale(anychart.format.outputLocale());
    var defaultLoc = anychart.format.getDateTimeLocale('default');
    var locale = outputLoc || defaultLoc;
    formats = (locale && locale['formats']) || (defaultLoc['formats']);
  }

  var i, f;
  if (userDefinedFormats) {
    for (i = 0; i < userDefinedFormats.length; i++) {
      f = userDefinedFormats[i];
      if (!(f in this.formatsMap)) {
        this.prepareTextData_(f);
      }
    }
  } else if (formats) {
    for (var key in formats) {
      var format = formats[key];
      if (goog.string.startsWith(key, 'timeline_')) {
        for (i = 0; i < format.length; i++) {
          /*
            NOTE: timeline format in locales looks like an array of strings:
            'timeline_third_of_month_day': ['EEEE, dd', 'EE, dd', 'dd']
           */
          f = format[i];
          if (!(f in this.formatsMap)) {
            this.prepareTextData_(f);
          }
        }
      }
    }
  } else {
    if (!(anychart.format.FormatSelector.DEFAULT_FORMAT in this.formatsMap)) {
      this.prepareTextData_(anychart.format.FormatSelector.DEFAULT_FORMAT);
    }
  }

};


/**
 * Here we must already have this.texts_ measured.
 * This method passes width and height values to this.formatsMap
 * by this.textsFormatReference_.
 */
anychart.format.FormatSelector.prototype.syncBoundsAfterMeasurement = function() {
  if (!this.isInSync_) {
    for (var i = 0; i < this.texts_.length; i++) {
      var t = this.texts_[i];

      /*
        In this case refData is the same object in this.formatsMap.
        It means that setting refData.width and refData.height also
        updates this.formatsMap data.
       */
      var refData = this.textsFormatReference_[i];
      refData.width = t.bounds.width;
      refData.height = t.bounds.height;
    }
    this.isInSync_ = true;
  }
};


/**
 * Keeps this.text_, this.formatsMap and this.textsFormatReference_ in synchronized order.
 * @param {string} format - Date-Time format in use.
 * @private
 */
anychart.format.FormatSelector.prototype.prepareTextData_ = function(format) {
  /**
   * @type {anychart.format.FormatSelector.FormatMetrics}
   */
  var formatData = {
    index: this.textsFormatReference_.length,
    width: NaN,
    height: NaN,
    format: format
  };

  this.formatsMap[format] = formatData;
  this.textsFormatReference_.push(formatData);

  var text = new anychart.core.ui.OptimizedText();
  text.text(anychart.format.dateTime(anychart.format.FormatSelector.DEFAULT_TIME, format, 0));
  text.style(this.labels().flatten());
  text.applySettings();
  /*
    NOTE: Yes, seems like text doesn't need prepareComplexity() in this case
    because date-time formats are not complex.
   */
  this.texts_.push(text);
};


//endregion
//region -- Developer's xAPI.
/**
 * Formats getter/setter.
 * @param {(Array.<string>|string)=} opt_value - Value to set.
 * @return {Array.<string>|string|anychart.format.FormatSelector}
 */
anychart.format.FormatSelector.prototype.formats = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.formats_ != opt_value) {
      this.formats_ = opt_value;
      this.reset();
      this.selectFormats();
      this.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
    }
    return this;
  } else {
    return this.formats_;
  }
};


/**
 * Labels getter/setter.
 * @param {anychart.core.ui.LabelsSettings=} opt_value - Value to set.
 * @return {null|anychart.core.ui.LabelsSettings|anychart.format.FormatSelector}
 */
anychart.format.FormatSelector.prototype.labels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.labels_ != opt_value) {
      if (this.labels_)
        this.labels_.unlistenSignals(this.labelsInvalidated, this);
      this.labels_ = opt_value;
      this.labels_.listenSignals(this.labelsInvalidated, this);
      return this;
    }
  }
  return this.labels_;
};


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 */
anychart.format.FormatSelector.prototype.labelsInvalidated = function(e) {
  if (!this.texts_.length)
    this.selectFormats();

  var st = this.labels().flatten();
  for (var i = 0; i < this.texts_.length; i++) {
    var t = this.texts_[i];
    t.style(st);
    t.applySettings();
  }
  this.dispatchSignal(anychart.Signal.MEASURE_BOUNDS);
};


//endregion
//region -- Clearing.
/**
 * Reset.
 */
anychart.format.FormatSelector.prototype.reset = function() {
  for (var i = 0; i < this.texts_.length; i++) {
    var text = this.texts_[i];
    text.dispose();
  }
  this.texts_.length = 0;
  this.formatsMap = {};
  this.textsFormatReference_.length = 0;
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.format.FormatSelector.prototype.disposeInternal = function() {
  this.reset();
  this.texts_.length = 0;
  anychart.measuriator.unregister(this);
  if (this.labels_)
    this.labels_.unlistenSignals(this.labelsInvalidated, this);
  anychart.format.FormatSelector.base(this, 'disposeInternal');
};


//endregion


