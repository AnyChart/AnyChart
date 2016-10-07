goog.provide('anychart.core.descriptors');

goog.require('anychart.opt');


//anychart.core.settings.PropertyDescriptor
/**
 * Creates descriptor.
 * @param {anychart.enums.PropertyHandlerType} handler - Handler type.
 * @param {string} propName - Property name.
 * @param {Function} normalizer - Normalizer function.
 * @param {number} consistency - Consistency to set.
 * @param {number} signal - Signal.
 * @param {number=} opt_check - Check function.
 * @return {anychart.core.settings.PropertyDescriptor} - Descriptor.
 */
anychart.core.descriptors.make = function(handler, propName, normalizer, consistency, signal, opt_check) {
  /**
   * @type {anychart.core.settings.PropertyDescriptor}
   */
  var descriptor = {
    handler: handler,
    propName: propName,
    normalizer: normalizer,
    consistency: consistency,
    signal: signal
  };
  if (goog.isDef(opt_check))
    descriptor.capabilityCheck = opt_check;
  return descriptor;
};


/**
 * Creates text properties descriptors.
 * @param {number} invalidateBoundsState - State to invalidate bounds.
 * @param {number} nonBoundsState - State to invalidate without bounds.
 * @param {number} boundsChangedSignal - Signal for changed bounds.
 * @param {number} nonBoundsSignal - Signal for non-bounds changes.
 * @return {!Object.<string, anychart.core.settings.PropertyDescriptor>} - Descriptors map.
 */
anychart.core.descriptors.createTextPropertiesDescriptors = function(invalidateBoundsState, nonBoundsState, boundsChangedSignal, nonBoundsSignal) {

  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map[anychart.opt.MIN_FONT_SIZE] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.MIN_FONT_SIZE,
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.MAX_FONT_SIZE] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.MAX_FONT_SIZE,
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.ADJUST_FONT_SIZE] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.ADJUST_FONT_SIZE,
      anychart.core.settings.booleanNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.FONT_SIZE] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_SIZE,
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.FONT_FAMILY] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_FAMILY,
      anychart.core.settings.stringNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.FONT_COLOR] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_COLOR,
      anychart.core.settings.stringNormalizer,
      nonBoundsSignal,
      nonBoundsSignal);

  map[anychart.opt.FONT_OPACITY] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_OPACITY,
      anychart.core.settings.numberNormalizer,
      nonBoundsSignal,
      nonBoundsSignal);

  map[anychart.opt.FONT_DECORATION] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_DECORATION,
      anychart.enums.normalizeFontDecoration,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.FONT_STYLE] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_STYLE,
      anychart.enums.normalizeFontStyle,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.FONT_VARIANT] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_VARIANT,
      anychart.enums.normalizeFontVariant,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.FONT_WEIGHT] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.FONT_WEIGHT,
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.LETTER_SPACING] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.LETTER_SPACING,
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.TEXT_DIRECTION] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_DIRECTION,
      anychart.enums.normalizeTextDirection,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.LINE_HEIGHT] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.LINE_HEIGHT,
      anychart.core.settings.asIsNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.TEXT_INDENT] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_INDENT,
      anychart.core.settings.numberNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.V_ALIGN] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.V_ALIGN,
      anychart.enums.normalizeVAlign,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.H_ALIGN] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.H_ALIGN,
      anychart.enums.normalizeHAlign,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.TEXT_WRAP] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_WRAP,
      anychart.enums.normalizeTextWrap,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.TEXT_OVERFLOW] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.TEXT_OVERFLOW,
      anychart.core.settings.stringNormalizer,
      invalidateBoundsState,
      boundsChangedSignal);

  map[anychart.opt.SELECTABLE] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.SELECTABLE,
      anychart.core.settings.booleanNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  map[anychart.opt.DISABLE_POINTER_EVENTS] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.DISABLE_POINTER_EVENTS,
      anychart.core.settings.booleanNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  map[anychart.opt.USE_HTML] = anychart.core.descriptors.make(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      anychart.opt.USE_HTML,
      anychart.core.settings.booleanNormalizer,
      nonBoundsState,
      nonBoundsSignal);

  return map;
};
