goog.provide('anychart.ganttModule.rendering.RowsColoring');

//region -- Requirements.
goog.require('goog.events.EventTarget');



//endregion
//region -- Constructor.
/**
 * Coloring Qlik-specific simplification.
 * @param {anychart.ganttModule.Chart} chart
 * @constructor
 * @extends {goog.events.EventTarget}
 */
anychart.ganttModule.rendering.RowsColoring = function(chart) {
  anychart.ganttModule.rendering.RowsColoring.base(this, 'constructor');

  /**
   * @type {anychart.ganttModule.Chart}
   */
  this.chart = chart;


  /**
   *
   * @type {?anychart.ganttModule.rendering.RowsColoring.Colors}
   */
  this.colors = null;

  /**
   *
   * @type {?anychart.ganttModule.rendering.RowsColoring.Checkers}
   */
  this.checkers = null;

  /**
   * State.
   * @type {*}
   */
  this.state = null;


  /*
    How I see it:

    var chart = new Gantt();
    var coloring = chart.rowsColoring();

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
goog.inherits(anychart.ganttModule.rendering.RowsColoring, goog.events.EventTarget);


//endregion
//region -- Type definitions.
/**
 * @typedef {Object.<acgraph.vector.Fill>}
 */
anychart.ganttModule.rendering.RowsColoring.ColorDef;


/**
 * @typedef {Array.<anychart.ganttModule.rendering.RowsColoring.ColorDef>}
 */
anychart.ganttModule.rendering.RowsColoring.Colors;


/**
 * @typedef {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
 */
anychart.ganttModule.rendering.RowsColoring.DataItemDef;


/**
 * @typedef {Array.<function(anychart.ganttModule.rendering.RowsColoring.DataItemDef, *): ?string>}
 */
anychart.ganttModule.rendering.RowsColoring.Checkers;


//endregion
//region -- API.
/**
 *
 * @param {anychart.ganttModule.rendering.RowsColoring.Colors} colors - .
 * @param {anychart.ganttModule.rendering.RowsColoring.Checkers} checkers - .
 */
anychart.ganttModule.rendering.RowsColoring.prototype.setRules = function(colors, checkers) {
  this.colors = colors;
  this.checkers = checkers;
};


/**
 *
 * @param {*} state - .
 */
anychart.ganttModule.rendering.RowsColoring.prototype.setState = function(state) {
  this.state = state;

  //TODO Check whether we need it here.
  // this.dispatchEvent('statechange');
  var self = this;
  var timeout = setTimeout(function() {
    if (!self.isDisposed())
      self.dispatchEvent('statechange');
    clearTimeout(timeout);
  }, 0);
};


//endregion
//exports
/**
 * @suppress {deprecated}
 */
(function() {
  var proto = anychart.ganttModule.rendering.RowsColoring.prototype;

  proto['setRules'] = proto.setRules;
  proto['setState'] = proto.setState;
})();
