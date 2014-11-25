goog.provide('anychart.core.utils.PrintHelper');
goog.require('acgraph');
goog.require('goog.Disposable');
goog.require('goog.Uri.QueryData');
goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.structs.Map');
goog.require('goog.userAgent');



/**
 * Printing singleton.
 *
 * How it works:
 * 1) Generate random UID (Is used to name a div).
 * 2) Create a style for a normal div and for the printing process (media="print" is in use).
 * 3) Create a div placed into an absolute position out of the screen.
 * 4) Create an iframe inside the previous div.
 * 5) Add iframe.onload event. Triggers after new 'src' is set to iframe.
 * 6) iframe.onload calls 'window.print()'. Special style with media="print" allows to print only our div.
 * 7) Check base64 support.
 * 8) Get a string value of stage's SVG.
 * 9) Send a server request with SVG string data attached.
 * 10) Get a response with base64 encoded result to be applied as iframe's src.
 * 11) After src is set, iframe.onload is triggers. TODO Check for all browsers.
 * 12) If someone kills a body content with body.innerHtml='', all printing structures will be re-created on print() call.
 *
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.utils.PrintHelper = function() {
  goog.base(this);

  this.uid_ = 'print_' + ((Math.random() * 1e9) >>> 0);
  this.serializer_ = new XMLSerializer();

  this.init_();
};
goog.inherits(anychart.core.utils.PrintHelper, goog.Disposable);
goog.addSingletonGetter(anychart.core.utils.PrintHelper);


/**
 * Dom element UID.
 *
 * @type {string}
 * @private
 */
anychart.core.utils.PrintHelper.prototype.uid_ = '';


/**
 * DOM default style element.
 *
 * @type {Element}
 * @private
 */
anychart.core.utils.PrintHelper.prototype.defaultStyleNode_ = null;


/**
 * DOM print style element.
 *
 * @type {Element}
 * @private
 */
anychart.core.utils.PrintHelper.prototype.printStyleNode_ = null;


/**
 * Contains a data for printing.
 *
 * @type {Element}
 * @private
 */
anychart.core.utils.PrintHelper.prototype.printDiv_ = null;


/**
 * Serializer. Used to take a string value of stage SVG.
 *
 * @type {XMLSerializer}
 * @private
 */
anychart.core.utils.PrintHelper.prototype.serializer_ = null;


/**
 * Iframe for print content.
 *
 * @type {Element}
 * @private
 */
anychart.core.utils.PrintHelper.prototype.iframe_ = null;


/**
 * Initializes DOM structure.
 * @private
 */
anychart.core.utils.PrintHelper.prototype.init_ = function() {
  this.addDefaultStyle_();
  this.addPrintStyle_();

  this.printDiv_ = goog.dom.createElement('div');
  this.printDiv_.setAttribute('id', this.uid_);

  this.iframe_ = goog.dom.createElement('iframe');
  this.iframe_.setAttribute('id', 'iframe_' + this.uid_);
  this.iframe_.setAttribute('frameborder', '0');

  this.printDiv_.appendChild(this.iframe_);
  goog.dom.getDocument().getElementsByTagName('body')[0].appendChild(this.printDiv_);

  goog.events.listen(this.iframe_, goog.events.EventType.LOAD, function() {
    window.print();
  });
};


/**
 * Adds a default style.
 * @private
 */
anychart.core.utils.PrintHelper.prototype.addDefaultStyle_ = function() {
  this.defaultStyleNode_ = goog.dom.createElement('style');
  this.defaultStyleNode_['type'] = 'text/css';

  var styles = '#' + this.uid_ + ' { ' +
      'position: absolute; ' +
      'z-index: 10000000; ' +
      'left: -10000000px; ' +
      'top: -1000000px; ' +
      'visibility: hidden; }';

  this.defaultStyleNode_.appendChild(goog.dom.getDocument().createTextNode(styles));

  //We don't need DOM helper here. It does the same.
  goog.dom.getDocument().getElementsByTagName('head')[0].appendChild(this.defaultStyleNode_);
};


/**
 * Adds a printing style.
 * @private
 */
anychart.core.utils.PrintHelper.prototype.addPrintStyle_ = function() {
  this.printStyleNode_ = goog.dom.createElement('style');
  this.printStyleNode_['type'] = 'text/css';
  this.printStyleNode_['media'] = 'print';

  var styles = 'body * { visibility: hidden; } ';
  styles += '#' + this.uid_ + ', #' + this.uid_ + ' * { visibility: visible; }';
  styles += '#' + this.uid_ + ' { position: absolute; left: 0px; top: 0px; }';

  this.printStyleNode_.appendChild(goog.dom.getDocument().createTextNode(styles));

  //We don't need DOM helper here. It does the same.
  goog.dom.getDocument().getElementsByTagName('head')[0].appendChild(this.printStyleNode_);

};


/**
 * Performs an async data load and printing.
 * @param {string} svgText - SVG string value.
 * @private
 */
anychart.core.utils.PrintHelper.prototype.load_ = function(svgText) {
  var ths = this;

  var url = acgraph.exportServer + '/pdf';
  var data = goog.Uri.QueryData.createFromMap(new goog.structs.Map({
    'data': svgText,
    'productName': 'acdvf',
    'dataType': 'svg',
    'responseType': 'base64'
  }));


  goog.net.XhrIo.send(
      url,
      function(e) { //Callback
        var xhr = e.target;
        var response = xhr.getResponseJson();

        var result = response['result'];
        var error = response['error'];
        if (error) {

        } else if (result) {

          //          ths.iframe_.setAttribute('width', response['width']);
          //          ths.iframe_.setAttribute('height', response['height']);

          ths.iframe_.setAttribute('width', '800px');
          ths.iframe_.setAttribute('height', '1110px');
          ths.iframe_.setAttribute('src', 'data:application/pdf;base64,' + response['result']);
        }

      },

      'POST',

      String(data)
  );

  //  $.ajax({
  //    type: 'POST',
  //    url: 'http://176.9.224.4/pdf',
  //    data: {
  //      'data': svgText,
  //      'productName': 'acdvf',
  //      'dataType': 'svg',
  //      'responseType': 'base64'
  //    },
  //    success: function(response) {
  //      var result = response['result'];
  //      var error = response['error'];
  //      if (error) {
  //        console.log(error);
  //      } else if (result) {
  //        console.log(result);
  //        ths.iframe_.setAttribute('width', response['width']);
  //        ths.iframe_.setAttribute('height', response['height']);
  //        ths.iframe_.setAttribute('src', 'data:application/pdf;base64,' + response['result']);
  //      }
  //    },
  //    dataType: 'json'
  //  });

  //  var dataUrl = 'http://176.9.224.4/pdf';

  //  var ths = this;
  //  console.log(JSON.stringify());

  //  goog.net.XhrIo.send(dataUrl, function(e) { //Callback
  //    var xhr = e.target;
  //    var obj = xhr.getResponseJson();

  //  }, 'POST', JSON.stringify({
  //    'data': svgText,
  //    'productName': 'acdvf',
  //    'dataType': 'svg',
  //    'responseType': 'base64'
  //  }));
};


/**
 * Checks if browser supports base64.
 * NOTE: IE7 and versions below doesn't support base64.
 * @return {boolean} - 'True' if browser supports base64.
 * @private
 */
anychart.core.utils.PrintHelper.prototype.base64Support_ = function() {
  return !(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8'));
};


/**
 * Checks if browser has no limit for base64-encoded string length.
 * NOTE: IE8 works with resources up to 32k size (no longer than 32768 characters).
 *
 * @param {string} svgString - SVG string value.
 * @return {boolean} - 'False' if browser can't process long base64-encoded string.
 * @private
 */
anychart.core.utils.PrintHelper.prototype.longBase64Support_ = function(svgString) {
  return !(goog.userAgent.IE && !goog.string.compareVersions(goog.userAgent.VERSION, '8') &&
      svgString.length > 32768);
};


/**
 * Prints.
 * @param {acgraph.vector.Stage} stage - Stage to be printed. TODO param can be changed when refactoring API.
 * TODO add export server URL when refactoring API.
 */
anychart.core.utils.PrintHelper.prototype.print = function(stage) {
  if (!this.base64Support_()) {
    goog.global['console']['error']('IE7 or below is detected. Your browser does not support base64 encoding required to print data. ' +
        'Printing process can\'t be completed.');
    return;
  }

  var svgNode = stage.domElement();
  var svgString = this.serializer_.serializeToString(svgNode);

  if (!this.longBase64Support_(svgString)) {
    goog.global['console']['error']('IE8 is detected. Your browser does not support base64-encoded strings longer than 32768 characters. ' +
        'Printing process can\'t be completed.');
    //TODO Should we add some recommendations? Kind of 'Make a chart smaller' or 'http://www.google.com/chrome'.
    //Idea: make chart smaller automatically :)
    return;
  }

  if (!goog.dom.getDocument().getElementById(this.uid_)) {
    this.init_();
  }

  this.load_(svgString);
};


/** @inheritDoc */
anychart.core.utils.PrintHelper.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.defaultStyleNode_);
  goog.dom.removeNode(this.printStyleNode_);
  goog.dom.removeNode(this.iframe_);
  goog.dom.removeNode(this.printDiv_);

  this.defaultStyleNode_ = null;
  this.printStyleNode_ = null;
  this.iframe_ = null;
  this.printDiv_ = null;

  this.serializer_ = null;
};

