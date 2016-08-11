/**
 * @fileoverview AnyChart Data Provider module.
 * @suppress {extraRequire}
 */


goog.provide('anychart.modules.data_adapter');
goog.require('anychart.base');
goog.require('goog.dom');
goog.require('goog.net.XhrIo');


// region ---- loading config via XhrIo
/**
 * @param {string} url
 * @param {string|Function=} opt_onSuccessOrContainer
 * @param {Function=} opt_onError
 * @param {string=} opt_method
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=} opt_content
 * @param {Object=} opt_headers
 * @param {number=} opt_timeoutInterval
 * @param {boolean=} opt_withCredentials
 * @param {*=} opt_context
 */
anychart.fromXmlFile = function(url, opt_onSuccessOrContainer, opt_onError, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials, opt_context) {
  var method = anychart.getChartCreationMethod_('fromXml', opt_onError, opt_context);
  if (!method) return;


  var callback = goog.bind(
      anychart.fromXmlFile.onConfigFileLoadingComplete_,
      undefined,
      opt_onSuccessOrContainer,
      opt_onError,
      opt_context,
      method
      );
  goog.net.XhrIo.send(
      url,
      callback,
      opt_method,
      opt_content,
      opt_headers,
      opt_timeoutInterval,
      opt_withCredentials
  );
};


/**
 * @param {string} url
 * @param {string|Function=} opt_onSuccessOrContainer
 * @param {Function=} opt_onError
 * @param {string=} opt_method
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=} opt_content
 * @param {Object=} opt_headers
 * @param {number=} opt_timeoutInterval
 * @param {boolean=} opt_withCredentials
 * @param {*=} opt_context
 */
anychart.fromJsonFile = function(url, opt_onSuccessOrContainer, opt_onError, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials, opt_context) {
  var method = anychart.getChartCreationMethod_('fromJson', opt_onError, opt_context);
  if (!method) return;

  var callback = goog.bind(
      anychart.fromXmlFile.onConfigFileLoadingComplete_,
      undefined,
      opt_onSuccessOrContainer,
      opt_onError,
      opt_context,
      method
      );
  goog.net.XhrIo.send(
      url,
      callback,
      opt_method,
      opt_content,
      opt_headers,
      opt_timeoutInterval,
      opt_withCredentials
  );
};


/**
 * @param {string} name
 * @param {Function=} opt_onError
 * @param {*=} opt_context
 * @return {Function}
 * @private
 */
anychart.getChartCreationMethod_ = function(name, opt_onError, opt_context) {
  var win = goog.dom.getWindow();
  var anychart = win['anychart'];
  if (!anychart) {
    if (opt_onError) opt_onError.call(opt_context, 500, 'AnyChart in not present on the page.');
    return null;
  }
  var fn = anychart[name];
  if (!fn) {
    if (opt_onError) opt_onError.call(opt_context, 500, goog.string.subs('anychart.%s is not available.', name));
    return null;
  }

  return fn;
};


/**
 * @param {string|Function|undefined} onSuccessOrContainer
 * @param {Function|undefined} onError
 * @param {*} context
 * @param {Function} createFunc
 * @param {goog.events.Event} evt
 * @private
 */
anychart.fromXmlFile.onConfigFileLoadingComplete_ = function(onSuccessOrContainer, onError, context, createFunc, evt) {
  var xhrIo = /** @type {goog.net.XhrIo} */(evt.target);

  if (xhrIo.isSuccess()) {
    try {
      var text = xhrIo.getResponseText();
      var chart = createFunc(text);
    } catch (error) {
      if (onError) onError.call(context, 500, error);
    }

    if (onSuccessOrContainer) {
      if (goog.isString(onSuccessOrContainer)) {
        chart['container'](onSuccessOrContainer);
        chart['draw']();
      } else if (goog.isFunction(onSuccessOrContainer)) onSuccessOrContainer.call(context, chart);
    } else if (chart['container']()) {
      chart['draw']();
    }
  } else if (onError) {
    onError.call(context, xhrIo.getLastErrorCode(), xhrIo.getLastError());
  }
};
// endregion


// region ---- HTML Table
/**
 * @param {string=} opt_tableSelector
 * @param {string=} opt_rowsSelector
 * @param {string=} opt_cellsSelector
 * @param {string=} opt_headersSelector
 * @param {string=} opt_captionSelector
 * @param {Function=} opt_valueProcessor
 * @return {?{
 *  caption: (string|undefined),
 *  header: (Array.<string>|undefined),
 *  rows: (Array|undefined)
 * }}
 */
anychart.modules.data_adapter.parseHtmlTable = function(opt_tableSelector, opt_rowsSelector, opt_cellsSelector, opt_headersSelector, opt_captionSelector, opt_valueProcessor) {
  // find table
  var table = goog.dom.getDocument()['querySelector'](opt_tableSelector || 'table');
  var result = null, i, count;

  if (table) {
    // apply defaults
    opt_captionSelector = opt_captionSelector || 'caption';
    opt_headersSelector = opt_headersSelector || 'tr:first-child th';
    opt_cellsSelector = opt_cellsSelector || 'td, th';
    opt_rowsSelector = opt_rowsSelector || 'tr';

    result = {};

    // parse table caption
    var caption;
    var captionElement = table['querySelector'](opt_captionSelector);
    if (captionElement) caption = opt_valueProcessor ?
          opt_valueProcessor.call(undefined, captionElement) :
          captionElement.innerText;
    if (caption) result['caption'] = caption;

    // parse table header
    var headersElements = table['querySelectorAll'](opt_headersSelector);
    var headers = [];
    var headersRowElement = null;
    for (i = 0, count = headersElements.length; i < count; i++) {
      var headerElement = headersElements[i];
      if (headerElement && !headersRowElement)
        headersRowElement = goog.dom.getParentElement(headerElement);
      headers.push(opt_valueProcessor ?
          opt_valueProcessor.call(undefined, headerElement) :
          headerElement.innerText);
    }
    if (headers.length) result['header'] = headers;

    // parse rows
    var rowsElements = table['querySelectorAll'](opt_rowsSelector);
    if (rowsElements && rowsElements.length) {
      var data = [];
      for (i = 0, count = rowsElements.length; i < count; i++) {
        var rowElement = rowsElements[i];
        if (rowElement == headersRowElement) continue;

        var rows = [];
        var cellsElements = rowElement['querySelectorAll'](opt_cellsSelector);
        if (cellsElements && cellsElements.length) {
          for (var j = 0, cellsCount = cellsElements.length; j < cellsCount; j++) {
            var cellElement = cellsElements[j];
            if (opt_valueProcessor) rows.push(opt_valueProcessor.call(undefined, cellElement));
            else rows.push(cellElement.innerText);
          }
        }
        if (rows.length) data.push(rows);
      }
      result['rows'] = data;
    }
  }

  return result;
};



// endregion


// region ---- loading data via XhrIo
/**
 * @param {string} url
 * @param {Function} onSuccess
 * @param {Function=} opt_onError
 * @param {string=} opt_method
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=} opt_content
 * @param {Object=} opt_headers
 * @param {number=} opt_timeoutInterval
 * @param {boolean=} opt_withCredentials
 * @param {*=} opt_context
 */
anychart.modules.data_adapter.loadJsonFile = function(url, onSuccess, opt_onError, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials, opt_context) {
  var callback = goog.bind(
      anychart.modules.data_adapter.onDataFileLoaded_,
      undefined,
      anychart.modules.data_adapter.processAsJson_,
      onSuccess,
      opt_onError,
      opt_context
      );

  goog.net.XhrIo.send(
      url,
      callback,
      opt_method,
      opt_content,
      opt_headers,
      opt_timeoutInterval,
      opt_withCredentials
  );
};


/**
 * @param {string} url
 * @param {Function} onSuccess
 * @param {Function=} opt_onError
 * @param {string=} opt_method
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=} opt_content
 * @param {Object=} opt_headers
 * @param {number=} opt_timeoutInterval
 * @param {boolean=} opt_withCredentials
 * @param {*=} opt_context
 */
anychart.modules.data_adapter.loadXmlFile = function(url, onSuccess, opt_onError, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials, opt_context) {
  var callback = goog.bind(
      anychart.modules.data_adapter.onDataFileLoaded_,
      undefined,
      anychart.modules.data_adapter.processAsXml_,
      onSuccess,
      opt_onError,
      opt_context
      );

  goog.net.XhrIo.send(
      url,
      callback,
      opt_method,
      opt_content,
      opt_headers,
      opt_timeoutInterval,
      opt_withCredentials
  );
};


/**
 * @param {string} url
 * @param {Function} onSuccess
 * @param {Function=} opt_onError
 * @param {string=} opt_method
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=} opt_content
 * @param {Object=} opt_headers
 * @param {number=} opt_timeoutInterval
 * @param {boolean=} opt_withCredentials
 * @param {*=} opt_context
 */
anychart.modules.data_adapter.loadCsvFile = function(url, onSuccess, opt_onError, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials, opt_context) {
  var callback = goog.bind(
      anychart.modules.data_adapter.onDataFileLoaded_,
      undefined,
      anychart.modules.data_adapter.processAsCsv_,
      onSuccess,
      opt_onError,
      opt_context
      );

  goog.net.XhrIo.send(
      url,
      callback,
      opt_method,
      opt_content,
      opt_headers,
      opt_timeoutInterval,
      opt_withCredentials
  );
};


/**
 * @param {goog.net.XhrIo} xhr
 * @return {Object}
 * @private
 */
anychart.modules.data_adapter.processAsJson_ = function(xhr) {
  return xhr.getResponseJson() || null;
};


/**
 * @param {goog.net.XhrIo} xhr
 * @return {Object}
 * @private
 */
anychart.modules.data_adapter.processAsXml_ = function(xhr) {
  var xml = xhr.getResponseXml();
  var json = window['anychart']['utils']['xml2json'](xml);
  return json['data'];
};


/**
 * @param {goog.net.XhrIo} xhr
 * @return {string}
 * @private
 */
anychart.modules.data_adapter.processAsCsv_ = function(xhr) {
  return xhr.getResponseText();
};


/**
 * @param {Function} processFunc
 * @param {Function} onSuccess
 * @param {Function|undefined} onError
 * @param {*} context
 * @param {goog.events.Event} evt
 * @private
 */
anychart.modules.data_adapter.onDataFileLoaded_ = function(processFunc, onSuccess, onError, context, evt) {
  var xhrIo = /** @type {goog.net.XhrIo} */(evt.target);

  if (xhrIo.isSuccess()) {
    try {
      var result = processFunc(xhrIo);
      onSuccess.call(context, result);
    } catch (error) {
      if (onError) onError.call(context, 500, error);
    }
  } else if (onError) {
    onError.call(context, xhrIo.getLastErrorCode(), xhrIo.getLastError());
  }
};
// endregion


goog.exportSymbol('anychart.fromXmlFile', anychart.fromXmlFile);
goog.exportSymbol('anychart.fromJsonFile', anychart.fromJsonFile);
goog.exportSymbol('anychart.data.parseHtmlTable', anychart.modules.data_adapter.parseHtmlTable);
goog.exportSymbol('anychart.data.loadJsonFile', anychart.modules.data_adapter.loadJsonFile);
goog.exportSymbol('anychart.data.loadXmlFile', anychart.modules.data_adapter.loadXmlFile);
goog.exportSymbol('anychart.data.loadCsvFile', anychart.modules.data_adapter.loadCsvFile);
