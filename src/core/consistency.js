goog.provide('anychart.consistency');
goog.require('anychart.core.reporting');
goog.require('goog.object');


/**
 * Adds supported consistency states to constructor prototype.
 *
 * @example
 * A = function() {
 *   // your code here
 * }
 * anychart.consistency.supportStates(A, 'mystorename', 'mystatename'); // in case of single state support
 * anychart.consistency.supportStates(A, 'mystorename', ['statename1', 'statename2']); // in case of multi state support
 *
 * @param {!Function} ctor Constructor.
 * @param {string} storeName Store name.
 * @param {string|Array.<string>} statesName State or states to add.
 */
anychart.consistency.supportStates = function(ctor, storeName, statesName) {
  /** @type {anychart.ConsistencyStorageMeta} */
  var storageMeta;
  // if meta information already in prototype - clone it to extend in child.
  if (ctor.prototype.consistencyStorageMeta)
    storageMeta = goog.object.clone(ctor.prototype.consistencyStorageMeta);
  else
    storageMeta = {};
  if (goog.isArray(statesName)) {
    for (var i = 0; i < statesName.length; i++) {
      anychart.consistency.addSupportedCS(storageMeta, storeName, /** @type {string} */ (statesName[i]));
    }
  } else {
    anychart.consistency.addSupportedCS(storageMeta, storeName, /** @type {string} */ (statesName));
  }
  // put information to constructor's prototype
  ctor.prototype.consistencyStorageMeta = storageMeta;
};


/**
 * Adds an information about supported state of the store by their names.
 * @param {anychart.ConsistencyStorageMeta} storageMeta Storage meta information.
 * @param {string} storeName Store name.
 * @param {string} stateName State name.
 */
anychart.consistency.addSupportedCS = function(storageMeta, storeName, stateName) {
  // Adds information about store if it doesn't presented in storage meta.
  if (!storageMeta[storeName]) {
    storageMeta[storeName] = {
      supportedStates: 0, // Binary mask (number) of all states that are supported by this store.
      lastUsedBit: -1, // Last used bit for consistency state.
      states: {} // Maps state name to its number (representation of bit in binary mask of supported states).
    };
  }
  var store = storageMeta[storeName];
  var states = store.states;
  if (!states[stateName]) {
    // JavaScript able to do binary operations only with 32-bit numbers.
    // So if we have been used last bit for state - we can't add it so warn developer.
    if (store.lastUsedBit == 31) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.STATES_IN_STORE_EXCEEDED, void 0, [storeName]);
      return;
    }
    // increment last used bit.
    var lastUsedBit = ++store.lastUsedBit;

    // save information of number representation of state in states map.
    states[stateName] = 1 << lastUsedBit; // binary shift. Equals: Math.pow(2, lastUsedBit).

    // Bitwise OR. Adds state to supported.
    store.supportedStates |= states[stateName];

    // is last bit had used warn developer.
    if (lastUsedBit == 31) {
      anychart.core.reporting.warning(anychart.enums.WarningCode.STORE_LAST_STATE_USED, void 0, [storeName]);
    }
  } else {
    // warn developer about existence of store-state pair.
    anychart.core.reporting.warning(anychart.enums.WarningCode.STORE_STATE_PAIR_EXISTS, void 0, [storeName, stateName]);
  }
};
