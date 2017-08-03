goog.provide('anychart.chartEditorModule.Component');

goog.require('anychart');
goog.require('goog.ui.Component');



/**
 *
 * @constructor
 * @name anychart.chartEditorModule.Component
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @extends {goog.ui.Component}
 */
anychart.chartEditorModule.Component = function(opt_domHelper) {
  anychart.chartEditorModule.Component.base(this, 'constructor', opt_domHelper);
};
goog.inherits(anychart.chartEditorModule.Component, goog.ui.Component);


/** @inheritDoc */
anychart.chartEditorModule.Component.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.chartEditorModule.Component.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.chartEditorModule.Component.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.chartEditorModule.Component.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.chartEditorModule.Component.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.chartEditorModule.Component.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.chartEditorModule.Component.prototype.unlistenByKey = function(key) {
  return anychart.chartEditorModule.Component.base(this, 'unlistenByKey', key);
};


/** @inheritDoc */
anychart.chartEditorModule.Component.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) opt_type = String(opt_type).toLowerCase();
  return anychart.chartEditorModule.Component.base(this, 'removeAllListeners', opt_type);
};


//exports
// (function() {
//   var proto = anychart.chartEditorModule.Component.prototype;
//   proto['listen'] = proto.listen;
//   proto['listenOnce'] = proto.listenOnce;
//   proto['unlisten'] = proto.unlisten;
//   proto['unlistenByKey'] = proto.unlistenByKey;
//   proto['removeAllListeners'] = proto.removeAllListeners;
// })();
