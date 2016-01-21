goog.provide('anychart.performance');


/**
 * Returns the number of milliseconds passed since an event in past. Returns fractional milliseconds, if possible.
 * Consequent calls return non-decreasing numeric sequences.
 * @return {number}
 */
anychart.performance.relativeNow = (
    goog.global['performance'] && goog.isFunction(goog.global['performance']['now']) ?
        goog.bind(goog.global['performance']['now'], goog.global['performance']) :
        goog.now);


/**
 * Event types.
 * @enum {number}
 */
anychart.performance.EventType = {
  start: 1,
  end: 2
};


/**
 * @typedef {{
 *    label: string,
 *    type: anychart.performance.EventType,
 *    level: (number|undefined),
 *    timestamp: number
 * }}
 */
anychart.performance.Event;


/**
 * @typedef {{
 *    label: string,
 *    children: Array.<anychart.performance.Entry>,
 *    parent: anychart.performance.Entry,
 *    level: (number|undefined),
 *    start: number,
 *    duration: number
 * }}
 */
anychart.performance.Entry;


/**
 * Recorded events.
 * @type {Array.<anychart.performance.Event>}
 * @private
 */
anychart.performance.events_ = [];


/**
 * Clears performance tables.
 */
anychart.performance.clear = function() {
  if (anychart.PERFORMANCE_MONITORING) {
    anychart.performance.events_ = [];
  }
};


/**
 * Starts performance recording.
 * @param {string} label
 * @param {number=} opt_level
 */
anychart.performance.start = function(label, opt_level) {
  if (anychart.PERFORMANCE_MONITORING) {
    anychart.performance.events_.push({
      label: label,
      type: anychart.performance.EventType.start,
      level: opt_level || 0,
      timestamp: anychart.performance.relativeNow()
    });
  }
};


/**
 * Finishes performance recording for the label and adds passed to time to existed duration if any.
 * @param {string} label
 */
anychart.performance.end = function(label) {
  if (anychart.PERFORMANCE_MONITORING) {
    anychart.performance.events_.push({
      label: label,
      type: anychart.performance.EventType.end,
      timestamp: anychart.performance.relativeNow()
    });
  }
};


/**
 * Builds events tree.
 * @return {anychart.performance.Entry}
 * @private
 */
anychart.performance.buildTree_ = function() {
  var entries = {};
  var root;
  var current;
  root = current = {
    label: 'Performance report',
    children: [],
    parent: null,
    start: NaN,
    duration: NaN,
    level: 0
  };
  for (var i = 0; i < anychart.performance.events_.length; i++) {
    var event = anychart.performance.events_[i];
    if (event.type == anychart.performance.EventType.start) {
      current = {
        label: event.label,
        children: [],
        parent: current,
        start: event.timestamp,
        duration: NaN,
        level: event.level
      };
      current.parent.children.push(current);
      if (event.label in entries) {
        entries[event.label].push(current);
      } else {
        entries[event.label] = [current];
      }
    } else {
      var entriesList = entries[event.label];
      if (entriesList) {
        var entry = entriesList.pop();
        entry.duration = event.timestamp - entry.start;
        if (entry == current)
          current = current.parent;
        if (!entriesList.length)
          delete entries[event.label];
      }
    }
  }
  return root;
};


/**
 * Prints everything to console.
 * @param {number=} opt_level
 * @param {boolean=} opt_collapsed
 */
anychart.performance.printTree = function(opt_level, opt_collapsed) {
  opt_level = opt_level || 0;
  if (!anychart.PERFORMANCE_MONITORING) return;
  var console = goog.global['console'];
  var groupStart, groupEnd, log, level = 0;
  if (console) {
    log = console['log'];
    if (typeof log != 'object') {
      log = goog.bind(log, console);
    } else {
      return; // no fun without console
    }
    groupStart = opt_collapsed ? console['groupCollapsed'] : console['group'];
    if (typeof groupStart != 'object') {
      groupStart = goog.bind(groupStart, console);
      groupEnd = console['groupEnd'];
      if (typeof groupEnd != 'object') {
        groupEnd = goog.bind(groupEnd, console);
      } else {
        groupEnd = log;
      }
    } else {
      groupStart = function(msg) {
        log(msg);
        level++;
      };
      groupEnd = function(msg) {
        level--;
      };
      var normLog = log;
      log = function(msg) {
        for (var i = 0; i < level; i++)
          normLog('--');
        normLog(msg);
      };
    }
  }
  var stack = [];
  var groupsStack = [];
  var format = function(entry) {
    if (isNaN(entry.duration))
      return entry.label;
    return entry.label + ': ' + (+entry.duration).toFixed(5) + 'ms';
  };
  var enter = function(entry) {
    if (entry.level <= opt_level) {
      if (entry.children.length) {
        stack.push(null);
        groupsStack.push(entry);
        groupStart(format(entry));
      } else {
        log(format(data));
      }
    }
    for (var i = entry.children.length; i--;) {
      stack.push(entry.children[i]);
    }
  };
  var data = anychart.performance.buildTree_();
  enter(data);
  while (stack.length) {
    data = stack.pop();
    if (data)
      enter(data);
    else {
      data = groupsStack.pop();
      groupEnd(format(data));
    }
  }
};


if (anychart.PERFORMANCE_MONITORING) {
  goog.exportSymbol('anychart.performance.clear', anychart.performance.clear);
  goog.exportSymbol('anychart.performance.start', anychart.performance.start);
  goog.exportSymbol('anychart.performance.end', anychart.performance.end);
  goog.exportSymbol('anychart.performance.printTree', anychart.performance.printTree);
}
