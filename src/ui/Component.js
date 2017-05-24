goog.provide('anychart.ui.Component');

goog.require('anychart');
goog.require('goog.ui.Component');



/**
 *
 * @constructor
 * @name anychart.ui.Component
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @extends {goog.ui.Component}
 */
anychart.ui.Component = function(opt_domHelper) {
  anychart.ui.Component.base(this, 'constructor', opt_domHelper);
};
goog.inherits(anychart.ui.Component, goog.ui.Component);


/** @inheritDoc */
anychart.ui.Component.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.ui.Component.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.ui.Component.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.ui.Component.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.ui.Component.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.ui.Component.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.ui.Component.prototype.unlistenByKey = function(key) {
  return anychart.ui.Component.base(this, 'unlistenByKey', key);
};


/** @inheritDoc */
anychart.ui.Component.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) opt_type = String(opt_type).toLowerCase();
  return anychart.ui.Component.base(this, 'removeAllListeners', opt_type);
};


//exports
(function() {
  var proto = anychart.ui.Component.prototype;
  proto['listen'] = proto.listen;
  proto['listenOnce'] = proto.listenOnce;
  proto['unlisten'] = proto.unlisten;
  proto['unlistenByKey'] = proto.unlistenByKey;
  proto['removeAllListeners'] = proto.removeAllListeners;
})();
