goog.provide('anychart.bindingModule.entry');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events');


/**
 @namespace
 @name anychart.bindingModule
 */


/**
 *
 * @param {(Object|string)} targetOrPath
 * @param {(string|number|boolean)} pathOrValue
 * @param {(string|number|boolean)=} opt_valueOrPathArgs
 * @param {...(string|number)} var_args
 * @return {*}
 */
anychart.bindingModule.exec = function(targetOrPath, pathOrValue, opt_valueOrPathArgs, var_args) {
  if (goog.isString(targetOrPath)) {
    var args = [anychart.window];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    return anychart.bindingModule.exec.apply(null, args);
  }

  var target = /** @type {Object} */(targetOrPath);
  var path = /** @type {string} */(pathOrValue);
  var value = opt_valueOrPathArgs;
  var pathArgsIndex = 3;

  var pathParsed = anychart.bindingModule.parsePath_(path);
  if (pathParsed) {
    var pathArgs = [];
    for (var j = pathArgsIndex; j < arguments.length; j++) {
      pathArgs.push(arguments[j]);
    }
    return anychart.bindingModule.applyPath_(target, /** @type {Array} */(pathParsed), pathArgs, value);
  }

  return void 0;
};


/**
 * Parses settings path for exec() methods.
 * @param {string} path
 * @return {(Array|boolean)} Array of settings with it's arguments or false in case of wrong path format.
 * @private
 */
anychart.bindingModule.parsePath_ = function(path) {
  var elementExp = /\s*\.?\s*(([\w_]+)(\(\s*(,?\s*([\d\.]+|\".+\"|\'.+\'|\{\d+\}))*\s*\))?)/;
  var result = [];
  var error = false;
  var match;
  do {
    match = path.match(elementExp);
    if (!match) {
      error = true;
      break;
    }
    var call = match[3];
    var args = void 0;
    if (call) {
      var argsStr = /\(\s*(.*)\s*\)/.exec(call);
      if (argsStr[1]) {
        args = argsStr[1].split(/\s*,\s*/);
      }
      call = true;
    }
    result.push([match[2], call, args]);
    path = path.replace(match[0], '');
  } while (path.length);

  return error ? false : result;
};


/**
 * Tries to apply settings returned by this.parsePath_() method in chaining style starting from target object.
 * @param {Object} target
 * @param {Array.<Array>} path
 * @param {Array.<(string|number)>} pathArguments
 * @param {(string|number|boolean)=} opt_lastArgument
 * @return {*}
 * @private
 */
anychart.bindingModule.applyPath_ = function(target, path, pathArguments, opt_lastArgument) {
  var part;
  var name;
  var call;
  var args;

  try {
    for (var i = 0; i < path.length; i++) {
      part = path[i];

      name = part[0];
      call = part[1];
      args = part[2];

      if (args) {
        for (var j = 0; j < args.length; j++) {
          var tmp = args[j].replace(/^'(.*)'$/, '$1');
          tmp = tmp.replace(/^"(.*)"$/, '$1');
          if (tmp == args[j]) {
            var substMatch = args[j].match(/^\{(\d+)\}$/);
            if (substMatch) {
              var a = Number(substMatch[1]);
              args[j] = goog.isDef(pathArguments[a]) ? pathArguments[a] : void 0;
            }
          } else {
            args[j] = tmp;
          }
        }
      }

      if (opt_lastArgument != void 0 && i == path.length - 1) {
        args = args ? args : [];
        args.push(opt_lastArgument);
      }

      target = call ? target[name].apply(target, args) : target[name];
    }
  } catch (e) {
    var message = 'Could not apply key \'' + name;
    if (call) message += '()';
    message += '\'';
    if (args) message += ' with arguments [' + args + ']';

    var console = anychart.window['console'];
    if (console) {
      var log = console['warn'] || console['log'];
      if (typeof log != 'object') {
        log.call(console, message);
      }
    }
    return null;
  }

  return target;
};


/**
 * Initialize html input (or bunch of inputs) for charts tracking.
 * @param {(string|HTMLInputElement|Array.<HTMLInputElement|string>|*)=} opt_value
 * @return {*}
 */
anychart.bindingModule.init = function(opt_value) {
  if (!goog.isDef(opt_value)) opt_value = '.ac-control';

  if (goog.dom.isElement(opt_value)) {
    var element = /** @type {!HTMLInputElement} */(opt_value);

    var type = element.type;
    if (!goog.isDef(type)) return;
    type = type.toLowerCase();

    var event = goog.events.EventType.CHANGE;
    switch (type) {
      case goog.dom.InputType.BUTTON:
      case goog.dom.InputType.SUBMIT:
        event = goog.events.EventType.CLICK;
        break;
      case goog.dom.InputType.TEXT:
      case goog.dom.InputType.TEXTAREA:
      case goog.dom.InputType.RANGE:
        event = goog.events.EventType.INPUT;
        break;
    }

    anychart.bindingModule.setRealValue_(element);

    goog.events.listen(element, event, anychart.bindingModule.onElementChange_, false);

    var chartId = element.getAttribute('ac-chart-id');
    var chart = anychart.module['getChartById'](chartId);
    goog.events.listen(chart, 'chartdraw',
        function() {
          anychart.bindingModule.setRealValue_(element);
        },
        false, element);

  } else if (goog.isString(opt_value)) {
    var elements = goog.dom.getDocument().querySelectorAll(opt_value);
    anychart.bindingModule.init(elements);

  } else if (goog.isArray(opt_value) || goog.dom.isNodeList(/** @type {Object} */(opt_value))) {
    for (var i = 0; i < opt_value.length; i++) {
      anychart.bindingModule.init(opt_value[i]);
    }
  }
};


/**
 * Input's change event handler.
 * @param {!goog.events.Event} event
 * @private
 */
anychart.bindingModule.onElementChange_ = function(event) {
  goog.events.Event.preventDefault(event);

  var element = /** @type {!HTMLInputElement} */(event.target);
  var chartId = event.target.getAttribute('ac-chart-id');
  var chart = anychart.module['getChartById'](chartId);
  var key = event.target.getAttribute('ac-key');

  if (chartId && chart && key) {
    var type = element.type;
    if (!goog.isDef(type)) return;

    var value = goog.dom.forms.getValue(element);
    // if(type == 'date') debugger;
    switch (type.toLowerCase()) {
      case goog.dom.InputType.CHECKBOX:
        value = !!value;
        break;
      case goog.dom.InputType.DATE:
        value = anychart.module['format']['parseDateTime'](value, 'yyyy-MM-dd');
        break;
    }

    anychart.bindingModule.exec(chart, key, value);
  }
};


/**
 * Tries to sets charts value for input element.
 * @param {!HTMLInputElement} element
 * @private
 */
anychart.bindingModule.setRealValue_ = function(element) {
  var type = element.type;
  if (!goog.isDef(type)) return;
  type = type.toLowerCase();

  var chartId = element.getAttribute('ac-chart-id');
  var chart = anychart.module['getChartById'](chartId);
  var key = element.getAttribute('ac-key');

  if (chartId && chart && key) {
    var value = anychart.bindingModule.exec(chart, key);
    var inputValue = goog.dom.forms.getValue(element);
    var setValue = true;

    if (goog.isDefAndNotNull(value) && !goog.isFunction(value)) {
      switch (type) {
        case goog.dom.InputType.BUTTON:
        case goog.dom.InputType.SUBMIT:
        case goog.dom.InputType.RADIO:
          setValue = false;
          break;
        case goog.dom.InputType.CHECKBOX:
          value = !!value;
          inputValue = !!inputValue;
          break;
        case goog.dom.InputType.COLOR:
          if (goog.isObject(value) && goog.isFunction(value['fill'])) {
            // if anychart.utils.instanceOf(value, anychart.core.ui.Background)
            value = value['fill']();
          }
          break;
        case goog.dom.InputType.DATE:
          value = anychart.module['format']['dateTime'](value, 'yyyy-MM-dd');
          break;
        default:
          value = goog.isBoolean(value) ? value : String(value);
          inputValue = goog.isBoolean(inputValue) ? inputValue : String(inputValue);
          break;
      }

      if (setValue && value != inputValue) {
        goog.dom.forms.setValue(element, value);
      }

      if (type == goog.dom.InputType.BUTTON || type == goog.dom.InputType.SUBMIT) {
        if (value == inputValue) {
          goog.dom.classlist.add(element, 'btn-primary');
        } else {
          goog.dom.classlist.remove(element, 'btn-primary');
        }
      }
    }
  }
};


//exports
(function() {
  goog.exportSymbol('anychart.ui.binding.exec', anychart.bindingModule.exec);
  goog.exportSymbol('anychart.ui.binding.init', anychart.bindingModule.init);
})();


// Start tracking
//if (window['anychart']['onDocumentReady']) window['anychart']['onDocumentLoad'](window['anychart']['ui']['binding']['init']);
