goog.provide('anychart.reflow.Measuriator');


//region -- Requirements.
goog.require('acgraph');
goog.require('anychart.core.reporting');



//endregion
//region -- Constructor.
/**
 * Special performance-oriented class to avoid forced reflow while simple text bounds measurement.
 * Also Measuriator is the name of legendary magic sword of super-oldfag bearded developer.
 *
 *              />
 * /vvvvvvvvvvvv \--^--^--^----------------------------------------^,
 * \/^^^^^^^^^^^ /=./=./=./========================================"
 *             \>
 *
 * Must consider following cases:
 *  - Collects the labels to measure before labels drawing and labels placement.
 *  - It means that sometimes labels to measure must be collected before chart.draw().
 *  - Only labels-settings change must initialize labels measurement.
 *  - Only after-draw entities creation must initialize labels collecting process.
 *
 * TODO (A.Kudryavtsev): In current implementation Measuriator requires probably
 * todo                  unnecessary passages:
 * todo [first] source iterates data to create list of labels to measure.
 * todo [second] on measure Measuriator performs one passage to apply style and set container.
 * todo [third] on measure Measuriator performs second passage to get bounds (required behaviour).
 *
 * TODO (A.Kudryavtsev): For big labels count we should probably add functionality
 * todo                  to combine [first] and [second] passages.
 * @constructor
 */
anychart.reflow.Measuriator = function() {
  /**
   * Registry of measurements providers.
   * @type {Object.<string, anychart.reflow.Measuriator.Source>}
   * @private
   */
  this.registry_ = {};

  /**
   * Current renderer.
   * TBA: we probably should check whether this is the VML-renderer and do something.
   * But this legendary sword is for performance boost, not for necromancy activities.
   * @type {acgraph.vector.Renderer}
   * @private
   */
  this.renderer_ = acgraph.getRenderer();

  /**
   * @type {Element}
   * @private
   */
  this.measurementLayer_ = null;
};


//endregion
//region -- Type definitions.
/**
 * @typedef {{
 *   provider: anychart.reflow.IMeasurementsTargetProvider,
 *   collection: Array.<anychart.core.ui.OptimizedText>,
 *   isMeasured: boolean
 * }}
 */
anychart.reflow.Measuriator.Source;


//endregion
//region -- Internal API.
/**
 * Registers IMeasurementsTargetProvider in Measuriator.
 * @param {anychart.reflow.IMeasurementsTargetProvider} provider - Providr to collect texts to be measured.
 */
anychart.reflow.Measuriator.prototype.register = function(provider) {
  var uid = 'm' + goog.getUid(provider);
  if (!(uid in this.registry_)) {
    provider.listenSignals(this.listenProvider_, this);
    if (anychart.DEBUG_MEASUREMENTS)
      anychart.core.reporting.callLog('info', '[MEASURIATOR_DEBUG]: Registering measurements provider ' + uid);

    /*
      !!!!!  NOTE  !!!!!

      New registry record on creation is marked as isMeasured = true.
      Source labels WILL NOT be measured until anychart.Signal.MEASURE_BOUNDS comes from provider.
     */
    this.registry_[uid] = {
      provider: provider,
      collection: [],
      isMeasured: true
    };
  }
};


/**
 * Initializes and return measurements layer.
 * @return {Element}
 */
anychart.reflow.Measuriator.prototype.getMeasurementsLayer = function() {
  if (!this.measurementLayer_) {
    this.measurementLayer_ = this.renderer_.createLayerElement();
    goog.dom.appendChild(this.renderer_.createMeasurement(), this.measurementLayer_);
  }
  return this.measurementLayer_;
};


/**
 * Runs measuring process with two passages and single forced reflow calling.
 * The general feature of this legendary sword. Class, I mean.
 * NOTE: on chart first draw this method must be called only once and measure all labels.
 *
 * DEV NOTES:
 *  120 labels measurement:
 *   ~210 ms with one passage (styling and immediate measurement)
 *   ~18ms with two passages (styling first, measuring second)
 */
anychart.reflow.Measuriator.prototype.measure = function() {
  this.getMeasurementsLayer();

  /**
   * @type {Array.<anychart.core.ui.OptimizedText>}
   */
  var texts = [];

  anychart.performance.start('Measuriator: measuring');

  //First passage, styling and rendering.
  for (var key in this.registry_) {
    var source = this.registry_[key];
    if (!source.isMeasured) {
      if (anychart.DEBUG_MEASUREMENTS)
        anychart.core.reporting.callLog('info', '[MEASURIATOR_DEBUG]: Measuring from ' + key);
      for (var i = 0; i < source.collection.length; i++) {
        var text = /** @type {anychart.core.ui.OptimizedText} */ (source.collection[i]);
        if (text) {
          /*
            DEVELOPERS IMPORTANT NOTE:
            text must have style already applied!
           */

          if (!text.hasContainer())
            text.renderTo(this.measurementLayer_);
          texts.push(text);
        }
      }
      source.isMeasured = true; //No, actually is not measured yet. But let it be our secret.
    }
  }

  //Second passage, measuring.
  for (var j = 0; j < texts.length; j++) {
    texts[j].prepareBounds();
  }

  anychart.performance.end('Measuriator: measuring');
};


/**
 * TODO (A.Kudryavtsev): Planning to use it to provide direct access to registry.
 * @param {anychart.reflow.IMeasurementsTargetProvider} target - Labels provider.
 * @return {?anychart.reflow.Measuriator.Source} - Associated registry record.
 */
anychart.reflow.Measuriator.prototype.getRegistryData = function(target) {
  var uid = 'm' + goog.getUid(target);
  return this.registry_[uid] || null;
};


/**
 * Renews labels-to-measure collection or just marks source as ready to be remeasured.
 * @param {anychart.reflow.IMeasurementsTargetProvider} provider - Labels provider.
 * @param {boolean} needsCollectLabels - Whether to collect labels.
 * @param {boolean} needsMeasureBounds - Whether to measure bounds.
 * @private
 */
anychart.reflow.Measuriator.prototype.collectFromProvider_ = function(provider, needsCollectLabels, needsMeasureBounds) {
  var uid = 'm' + goog.getUid(provider);
  var data = this.registry_[uid];
  data.isMeasured = !needsMeasureBounds;
  if (anychart.DEBUG_MEASUREMENTS)
    anychart.core.reporting.callLog('info', '[MEASURIATOR_DEBUG]: Labels changes detected from ' + uid);
  if (needsCollectLabels) {
    if (anychart.DEBUG_MEASUREMENTS)
      anychart.core.reporting.callLog('info', '[MEASURIATOR_DEBUG]: Collecting labels from ' + uid);

    anychart.performance.start('Measuriator: collecting from ' + uid);
    data.collection = data.provider.provideMeasurements();
    anychart.performance.end('Measuriator: collecting from ' + uid);
  }
};


/**
 * Labels provider listener.
 * @param {anychart.SignalEvent} event - .
 * @private
 */
anychart.reflow.Measuriator.prototype.listenProvider_ = function(event) {
  var provider = /** @type {anychart.reflow.IMeasurementsTargetProvider} */ (event['target']);
  var needsCollectLabels = event.hasSignal(anychart.Signal.MEASURE_COLLECT);
  var needsMeasureBounds = event.hasSignal(anychart.Signal.MEASURE_BOUNDS);
  if (needsCollectLabels || needsMeasureBounds) {
    this.collectFromProvider_(provider, needsCollectLabels, needsMeasureBounds);
  }
};


/**
 * Removes measurements provider from Measuriator registry.
 * Stops listening signals and measuring texts on provider.
 * @param {anychart.reflow.IMeasurementsTargetProvider} provider - Provider to collect texts to be measured.
 */
anychart.reflow.Measuriator.prototype.unregister = function(provider) {
  var uid = 'm' + goog.getUid(provider);
  if (uid in this.registry_) {
    var data = this.registry_[uid];
    data.provider.unlistenSignals(this.listenProvider_, this);
    delete this.registry_[uid];
  }
};


//endregion
