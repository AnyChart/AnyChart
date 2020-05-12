goog.provide('anychart.core.StatefulColoring');

//region -- Requirements.
goog.require('goog.events.EventTarget');



//endregion
//region -- Constructor.
/**
 * Coloring Qlik-specific simplification.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
anychart.core.StatefulColoring = function() {
  anychart.core.StatefulColoring.base(this, 'constructor');

  /**
   *
   * @type {?anychart.core.StatefulColoring.Colors}
   */
  this.colors = null;

  /**
   *
   * @type {?anychart.core.StatefulColoring.Checkers}
   */
  this.checkers = null;

  /**
   * State.
   * @type {*}
   */
  this.state = null;


  /*
    How I see it:

    var chart = new ChartWithStatefulColoringSupport();
    var coloring = chart.statefulColoring();

    var colors = {
      selected: 'blue',
      inactive: 'grey',
      another: 'pink'
    };

    var checkers = [
      (item, state) => {
        return item.meta('selected') ? 'selected' : null;
      },
      (item, state) => {
        return item.meta('dimension') == state.dimension ? null : 'inactive';
      },
      (item, state) => {
        return 'another';
      }
    ];

    var state = {
      dimension: 'MyDimension'
    };

    coloring.setRules(colors, checkers);
    coloring.setState(state);
    chart.container('container').draw();

    state = {
      dimension: 'MyAnotherDimension'
    };
    coloring.setState(state);

   */
};
goog.inherits(anychart.core.StatefulColoring, goog.events.EventTarget);


//endregion
//region -- Type definitions.
/**
 * @typedef {Object.<acgraph.vector.Fill>}
 */
anychart.core.StatefulColoring.Colors;


/**
 * @typedef {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
 */
anychart.core.StatefulColoring.DataItemDef;


/**
 * @typedef {Array.<function(anychart.core.StatefulColoring.DataItemDef, *): ?string>}
 */
anychart.core.StatefulColoring.Checkers;


//endregion
//region -- API.
/**
 *
 * @param {anychart.core.StatefulColoring.Colors} colors - .
 * @param {anychart.core.StatefulColoring.Checkers} checkers - .
 */
anychart.core.StatefulColoring.prototype.setRules = function(colors, checkers) {
  this.colors = colors;
  this.checkers = checkers;
};


/**
 *
 * @param {*} state - .
 */
anychart.core.StatefulColoring.prototype.setState = function(state) {
  this.state = state;
  anychart.utils.dispatchDetachedEvent(this, anychart.enums.EventType.STATE_CHANGE);
};


//endregion
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.core.StatefulColoring.prototype;

  proto['setRules'] = proto.setRules;
  proto['setState'] = proto.setState;
})();
