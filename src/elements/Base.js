goog.provide('anychart.elements.Base');

goog.require('acgraphexport');
goog.require('anychart.utils.Bounds');
goog.require('anychart.utils.Invalidatable');
goog.require('goog.dom');



/**
 * Base class for all elements.
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.elements.Base = function() {
  goog.base(this);

  this.silentlyInvalidate(anychart.utils.ConsistencyState.CONTAINER | anychart.utils.ConsistencyState.Z_INDEX);
};
goog.inherits(anychart.elements.Base, anychart.utils.Invalidatable);


/**
 * Container which the root element should be added to.
 * @type {acgraph.vector.ILayer}
 * @private
 */
anychart.elements.Base.prototype.container_;


/**
 * Z index of the element.
 * @type {number}
 * @private
 */
anychart.elements.Base.prototype.zIndex_ = 0;


/**
 * Is element enabled.
 * @type {boolean}
 * @private
 */
anychart.elements.Base.prototype.enabled_ = true;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Base.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.ENABLED |
    anychart.utils.ConsistencyState.CONTAINER |
    anychart.utils.ConsistencyState.Z_INDEX;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.ENABLED |
        anychart.utils.ConsistencyState.CONTAINER |
        anychart.utils.ConsistencyState.Z_INDEX;


/**
 * Getter for element's current container.
 * @return {acgraph.vector.ILayer} Current container.
 *//**
 * Setter for element container.<br/>
 * Each element append all it's content to this container.<br/>
 * The order of adding is not defined, but usually it will be the order in which elements are drawn for the first time.
 * So if you need to specify the order use {@link anychart.elements.Base#zIndex}.
 * @example <t>listingOnly</t>
 * // string
 *  element.container('containerIdentifier');
 * // DOM-element
 *  var domElement = document.getElementById('containerIdentifier');
 *  element.container(domElement);
 * // Framework-element
 *  var fwElement = new anychart.elements.Title();
 *  element.container( fwElement.container() );
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value Value to set.
 * @return {anychart.elements.Base} Экземпляр класса {@link anychart.elements.Base} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value .
 * @return {(acgraph.vector.ILayer|anychart.elements.Base)} .
 */
anychart.elements.Base.prototype.container = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.container_ != opt_value) {
      if (goog.isString(opt_value) || goog.dom.isElement(opt_value)) {
        // Should we use registerDisposable in this case?
        // TODO(Anton Saukh): fix type cast to {Element|string} when this will be fixed in graphics.
        this.container_ = acgraph.create();
        this.container_.container(/** @type {Element} */(opt_value));
      } else {
        this.container_ = /** @type {acgraph.vector.ILayer} */(opt_value);
      }
      this.invalidate(anychart.utils.ConsistencyState.CONTAINER);
    }
    return this;
  }
  return this.container_;
};


/**
 * Getter for current Z-index of the element.
 * @return {number} Current zIndex.
 *//**
 * Setter for Z-index of the element.<br/>
 * @illustration <t>stageOnly</t>
 *  var stroke = '1 black 1';
 *  layer.ellipse(75, 105, 55, 35).fill('#cc6622', 1).stroke(stroke)
 *  layer.ellipse(95, 75, 55, 35).fill('#ccaa22', 1).stroke(stroke)
 *  layer.ellipse(115, 45, 55, 35).fill('#ccee22', 1).stroke(stroke);
 *  layer.text(195, 100, 'index = 0');
 *  layer.text(195, 70, 'index = 1');
 *  layer.text(195, 40, 'index = 2');
 * @illustrationDesc
 *  Чем больше значение индекса - тем выше положение элемента.
 * @param {number=} opt_value Value to set.
 * @return {!anychart.elements.Base} Экземпляр класса {@link anychart.elements.Base} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {(number|!anychart.elements.Base)} .
 */
anychart.elements.Base.prototype.zIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.zIndex_ = +opt_value || 0;
    this.invalidate(anychart.utils.ConsistencyState.Z_INDEX);
    return this;
  }
  return this.zIndex_;
};


/**
 * Getter for current element state (enabled or disabled).
 * @return {boolean} Current element state.
 *//**
 * Setter for element enabled state.
 * @example <t>listingOnly</t>
 * if (!element.enabled())
 *    element.enabled(true);
 * @param {boolean=} opt_value Value to set.
 * @return {anychart.elements.Base} Экземпляр класса {@link anychart.elements.Base} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value Value to set.
 * @return {anychart.elements.Base|boolean} .
 */
anychart.elements.Base.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.invalidate(anychart.utils.ConsistencyState.ENABLED);
    }
    return this;
  } else {
    return this.enabled_;
  }
};


/**
 * @inheritDoc
 */
anychart.elements.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['enabled'] = this.enabled();
  json['zIndex'] = this.zIndex();
  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.Base.prototype.deserialize = function(config) {
  goog.base(this, 'deserialize', config);
  this.enabled(config['enabled']);
  this.zIndex(config['zIndex']);
};
