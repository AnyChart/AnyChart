goog.provide('anychart.core.utils.LinearGaugePointerContextProvider');
goog.require('anychart.core.utils.BaseContextProvider');
goog.require('anychart.core.utils.IContextProvider');



/**
 * TreeMap point context provider.
 * @param {anychart.core.linearGauge.pointers.Base} pointer pointer instance.
 * @param {Array.<string>} referenceValueNames Reference value names to be applied.
 * @implements {anychart.core.utils.IContextProvider}
 * @extends {anychart.core.utils.BaseContextProvider}
 * @constructor
 */
anychart.core.utils.LinearGaugePointerContextProvider = function(pointer, referenceValueNames) {
  anychart.core.utils.LinearGaugePointerContextProvider.base(this, 'constructor');

  this.pointer = pointer;

  /**
   * @type {anychart.core.linearGauge.pointers.Base}
   */
  this['pointer'] = pointer;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.referenceValueNames = referenceValueNames;
};
goog.inherits(anychart.core.utils.LinearGaugePointerContextProvider, anychart.core.utils.BaseContextProvider);


/** @inheritDoc */
anychart.core.utils.LinearGaugePointerContextProvider.prototype.applyReferenceValues = function() {
  var iterator = this.pointer.getIterator();
  var value;
  this['index'] = iterator.getIndex();
  this['name'] = this.pointer.name() || 'Pointer ' + this.pointer.autoIndex();

  for (var i = 0; i < this.referenceValueNames.length; i++) {
    value = this.referenceValueNames[i];
    this[value] = iterator.get(value);
  }
};


/** @inheritDoc */
anychart.core.utils.LinearGaugePointerContextProvider.prototype.getStat = function(key) {
  return void 0;
};


/** @inheritDoc */
anychart.core.utils.LinearGaugePointerContextProvider.prototype.getDataValue = function(key) {
  return this.pointer.getIterator().get(key);
};


/** @inheritDoc */
anychart.core.utils.LinearGaugePointerContextProvider.prototype.getTokenValue = function(name) {
  switch (name) {
    case anychart.enums.StringToken.HIGH:
      return this['high'];
    case anychart.enums.StringToken.LOW:
      return this['low'];
    case anychart.enums.StringToken.NAME:
      return this['name'];
  }
  return anychart.core.utils.LinearGaugePointerContextProvider.base(this, 'getTokenValue', name);
};


//exports
(function() {
  var proto = anychart.core.utils.LinearGaugePointerContextProvider.prototype;
  proto['getStat'] = proto.getStat;
  proto['getDataValue'] = proto.getDataValue;
  proto['getTokenValue'] = proto.getTokenValue;
})();
