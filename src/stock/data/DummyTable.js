goog.provide('anychart.stockModule.data.DummyTable');

goog.require('anychart.stockModule.IntervalGenerator');
goog.require('anychart.stockModule.data.Table');



/**
 * DummyTable implementation.
 * Used to add fake data (DVF-3076).
 * @constructor
 * @extends {anychart.stockModule.data.Table}
 */
anychart.stockModule.data.DummyTable = function() {
  anychart.stockModule.data.DummyTable.base(this, 'constructor');
};
goog.inherits(anychart.stockModule.data.DummyTable, anychart.stockModule.data.Table);


/**
 *
 * @param {anychart.stockModule.scales.Scatter} scale - .
 */
anychart.stockModule.data.DummyTable.prototype.applyGapSettings = function(scale) {
  var fullMaximum = /** @type {number} */ (scale.getFullMaximum());
  var fullMinimum = /** @type {number} */ (scale.getFullMinimum());
  var minGapConfig = /** @type {anychart.stockModule.scales.Scatter.GapConfig} */ (scale.minimumGap());
  var maxGapConfig = /** @type {anychart.stockModule.scales.Scatter.GapConfig} */ (scale.maximumGap());

  this.suspendSignalsDispatching();

  var data;

  //DEV NOTE: add minimum first!
  if (minGapConfig['intervalsCount']) {
    data = this.addDummyData_(fullMinimum, minGapConfig);
    scale.setMinGapRange(data[0][0], fullMinimum);
  } else {
    scale.setMinGapRange(null);
  }

  if (maxGapConfig['intervalsCount']) {
    data = this.addDummyData_(fullMaximum, maxGapConfig, true);
    scale.setMaxGapRange(fullMaximum, data[data.length - 1][0]);
  } else {
    scale.setMaxGapRange(null);
  }

  this.resumeSignalsDispatching(true);
};


/**
 * Adds dummy data to beginning or to end of current min/max scale data values
 * depending on opt_addToEnd flag.
 * NOTE: For correct data sorting purposes add min data first.
 *
 * @param {number} from - Anchor timestamp.
 * @param {anychart.stockModule.scales.Scatter.GapConfig} gapConfig - Gap config.
 * @param {boolean=} opt_addToEnd - Add to end of data range or to beginning.
 * @private
 * @return {Array.<number>}
 */
anychart.stockModule.data.DummyTable.prototype.addDummyData_ = function(from, gapConfig, opt_addToEnd) {
  var generator = new anychart.stockModule.IntervalGenerator(gapConfig['unitType'], gapConfig['unitCount']);
  var range = generator.getRange();
  var data = [];
  var mult = opt_addToEnd ? 1 : -1;
  for (var i = 1; i <= gapConfig['intervalsCount']; i++) {
    var val = [from + i * mult * range];
    if (opt_addToEnd) {
      data.push(val);
    } else {
      goog.array.insertAt(data, val, 0); //Inserts in zero position.
    }
  }
  this.addData(data);
  return data;
};


