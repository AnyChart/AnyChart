goog.provide('anychart.core.ui.Label');
goog.provide('anychart.standalones.Label');
goog.require('anychart.core.ui.LabelBase');



/**
 * Label element class.<br/>
 * Label can be a part of another element (such as chart, legend, axis, etc) or it can
 * be used independently.<br/>
 * Label has a background and a large number of positioning options:
 * <ul>
 *   <li>{@link anychart.core.ui.Label#anchor}</li>
 *   <li>{@link anychart.core.ui.Label#position}</li>
 *   <li>{@link anychart.core.ui.Label#offsetX} and {@link anychart.core.ui.Label#offsetY}</li>
 *   <li>{@link anychart.core.ui.Label#parentBounds}</li>
 * </ul>
 * @example <c>Creating an autonomous label.</c><t>simple-h100</t>
 * anychart.standalones.label()
 *     .text('My custom Label')
 *     .fontSize(27)
 *     .background(null)
 *     .container(stage)
 *     .draw();
 * @constructor
 * @extends {anychart.core.ui.LabelBase}
 */
anychart.core.ui.Label = function() {
  anychart.core.ui.Label.base(this, 'constructor');
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['visible', anychart.ConsistencyState.LABEL_VISIBILITY, anychart.Signal.NEEDS_REDRAW]
  ]);
  // should always be true for labels that are not "no data" label.
  this.themeSettings['visible'] = true;
};
goog.inherits(anychart.core.ui.Label, anychart.core.ui.LabelBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ui.LabelBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.LABEL_VISIBILITY;


/**
 * Descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Label.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'visible',
      anychart.core.settings.booleanNormalizer);
  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Label, anychart.core.ui.Label.DESCRIPTORS);


/** @inheritDoc */
anychart.core.ui.Label.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Label.base(this, 'setupByJSON', config, opt_default);
  if (!!opt_default)
    anychart.core.settings.deserialize(this, anychart.core.ui.Label.DESCRIPTORS, config);
};


/** @inheritDoc */
anychart.core.ui.Label.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;
  anychart.core.ui.Label.base(this, 'draw');
  if (this.hasInvalidationState(anychart.ConsistencyState.LABEL_VISIBILITY)) {
    this.getRootLayer().visible(/** @type {boolean} */(this.getOption('visible')));
    this.markConsistent(anychart.ConsistencyState.LABEL_VISIBILITY);
  }
  return this;
};



/**
 * @constructor
 * @extends {anychart.core.ui.Label}
 */
anychart.standalones.Label = function() {
  anychart.standalones.Label.base(this, 'constructor');
};
goog.inherits(anychart.standalones.Label, anychart.core.ui.Label);
anychart.core.makeStandalone(anychart.standalones.Label, anychart.core.ui.Label);


/**
 * Constructor function.
 * @return {!anychart.standalones.Label}
 */
anychart.standalones.label = function() {
  var label = new anychart.standalones.Label();
  label.setup(anychart.getFullTheme('standalones.label'));
  return label;
};


//exports
(function() {
  var proto = anychart.core.ui.Label.prototype;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
  proto['draw'] = proto.draw;

  proto = anychart.standalones.Label.prototype;
  goog.exportSymbol('anychart.standalones.label', anychart.standalones.label);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
})();
