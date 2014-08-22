goog.provide('anychart.utils');
goog.require('acgraph');
goog.require('anychart.enums');
goog.require('anychart.math');
goog.require('goog.array');
goog.require('goog.color');
goog.require('goog.dom.xml');
goog.require('goog.json.hybrid');


/**
 @namespace
 @name anychart.utils
 */


//----------------------------------------------------------------------------------------------------------------------
//
//  Utils functions.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets obj property, takes in account fields addresses.
 * Fields are first looked using mapping order, then -   field order (e.g. mapping is empty).
 * If field can not be found - field is written.
 * If used as setter - previous value (or undefined) is returned.
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * @param {!Object} obj Object.
 * @param {string} field Field name.
 * @param {?Array.<string>} mapping Mapping.
 * @param {*=} opt_setValue Value to set.
 * @return {*} Current or previous value.
 */
anychart.utils.mapObject = function(obj, field, mapping, opt_setValue) {
  if (mapping) {
    for (var i = 0; i < mapping.length; i++) {
      var propName = mapping[i];
      if (propName in obj) {
        field = propName;
        break;
      }
    }
  }
  if (arguments.length > 3) {
    var result = obj[field];
    obj[mapping ? mapping[0] : field] = opt_setValue;
    return result;
  }
  return obj[field];
};


/**
 * Default comparator. Can compare any two values including objects and values of
 * different type, setting a stable ordering in ascending order. NaNs are placed to the END of numbers list.
 * @param {*} a First value.
 * @param {*} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareAsc = function(a, b) {
  var aType = typeof a;
  var bType = typeof b;
  if (aType == 'number' && bType == 'number')
    return anychart.utils.compareNumericAsc(/** @type {number} */(a), /** @type {number} */(b));
  a = anychart.utils.hash(a);
  b = anychart.utils.hash(b);
  if (a > b)
    return 1;
  else if (a == b)
    return 0;
  else
    return -1;
};


/**
 * Can compare any two values including objects and values of
 * different type, setting a stable ordering in descending order. NaNs are placed to the START of numbers list.
 * @param {*} a First value.
 * @param {*} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareDesc = function(a, b) {
  return -anychart.utils.compareAsc(a, b);
};


/**
 * Comparator for numbers, that resolves the case of NaNs. Maintains stable ASC ordering,
 * placing NaNs to the END of list.
 * @param {number} a First value.
 * @param {number} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareNumericAsc = function(a, b) {
  if (isNaN(a))
    return isNaN(b) ? 0 : 1;
  else
    return isNaN(b) ? -1 : (a - b);
};


/**
 * Comparator for numbers, that resolves the case of NaNs. Maintains stable DESC ordering,
 * placing NaNs to the END of list (not the same as -compareNumericAsc).
 * @param {number} a First value.
 * @param {number} b Second value.
 * @return {number} Comparison result.
 */
anychart.utils.compareNumericDesc = function(a, b) {
  if (isNaN(a))
    return isNaN(b) ? 0 : 1;
  else
    return isNaN(b) ? -1 : (b - a);
};


/**
 * Default hashing function for all objects. Can distinguish any two objects.
 * @param {*} value Value to get hash of.
 * @return {string} Hash value.
 */
anychart.utils.hash = function(value) {
  // Prefix each type with a single character representing the type to
  // prevent conflicting keys (e.g. true and 'true').
  return goog.isObject(value) ?
      'o' + goog.getUid(value) :
      (typeof value).charAt(0) + value;
};


/**
 * Normalizes number or string value and converts it to number.
 * Supports percent strings if opt_containerSize is defined and not NaN - calculates percentage in that case.
 * @param {string|number} value Value to normalize.
 * @param {number=} opt_containerSize Optional container dimension to support percent option.
 * @param {boolean=} opt_invert Counts the result from the right/bottom side of the container (supported if
 *    opt_containerSize is passed).
 * @return {number} Calculated percent value.
 */
anychart.utils.normalizeSize = function(value, opt_containerSize, opt_invert) {
  var result = goog.isNumber(value) ?
      value :
      (!isNaN(opt_containerSize) && anychart.utils.isPercent(value) ?
          opt_containerSize * parseFloat(value) / 100 :
          parseFloat(value));
  return (opt_invert && !isNaN(opt_containerSize)) ? opt_containerSize - result : result;
};


/**
 * Define whether value is set in percent.
 * @param {*} value Value to define.
 * @return {boolean} Is value set in percent.
 */
anychart.utils.isPercent = function(value) {
  return goog.isString(value) && goog.string.endsWith(value, '%');
};


/**
 * Normalizes passed value to a natural value (strictly-positive integer).
 * If a number-like value passed and if it is greater than 0.5, it is rounded.
 * If it is not a number or it is less than 1 it defaults to opt_default || 1.
 * @param {*} value Value to normalize.
 * @param {number=} opt_default Default value to return.
 * @param {boolean=} opt_allowZero
 * @return {number} Naturalized value.
 */
anychart.utils.normalizeToNaturalNumber = function(value, opt_default, opt_allowZero) {
  if (!goog.isNumber(value))
    value = parseFloat(value);
  value = Math.round(value);
  // value > 0 also checks for NaN, because NaN > 0 == false.
  opt_default = goog.isDef(opt_default) ? opt_default : opt_allowZero ? 0 : 1;
  if (opt_allowZero)
    return /** @type {number} */(value >= 0 ? value : opt_default);
  else
    return /** @type {number} */(value > 0 ? value : opt_default);
};


/**
 * Gets anchor coordinates by bounds.
 * @param {acgraph.math.Rect} bounds Bounds rectangle.
 * @param {anychart.enums.Anchor|string} anchor Anchor.
 * @return {{x: number, y: number}} Anchor coordinates as {x:number, y:number}.
 */
anychart.utils.getCoordinateByAnchor = function(bounds, anchor) {
  var x = bounds.left;
  var y = bounds.top;
  switch (anchor) {
    case anychart.enums.Anchor.LEFT_TOP:
      break;
    case anychart.enums.Anchor.LEFT_CENTER:
      y += bounds.height / 2;
      break;
    case anychart.enums.Anchor.LEFT_BOTTOM:
      y += bounds.height;
      break;
    case anychart.enums.Anchor.CENTER_TOP:
      x += bounds.width / 2;
      break;
    case anychart.enums.Anchor.CENTER:
      x += bounds.width / 2;
      y += bounds.height / 2;
      break;
    case anychart.enums.Anchor.CENTER_BOTTOM:
      x += bounds.width / 2;
      y += bounds.height;
      break;
    case anychart.enums.Anchor.RIGHT_TOP:
      x += bounds.width;
      break;
    case anychart.enums.Anchor.RIGHT_CENTER:
      x += bounds.width;
      y += bounds.height / 2;
      break;
    case anychart.enums.Anchor.RIGHT_BOTTOM:
      x += bounds.width;
      y += bounds.height;
      break;
  }
  return {'x': x, 'y': y};
};


/**
 * Returns the nearest number to the left from value that meets equation ((value - opt_base) mod interval === 0).
 * @param {number} value Value to align.
 * @param {number} interval Value to align by.
 * @param {number=} opt_base Optional base value to calculate from. Defaults to 0.
 * @return {number} Aligned value.
 */
anychart.utils.alignLeft = function(value, interval, opt_base) {
  opt_base = opt_base || 0;
  var mod = anychart.math.round((value - opt_base) % interval, 7);
  if (mod < 0)
    mod += interval;
  if (mod >= interval) // ECMAScript float representation... try (0.5 % 0.1).
    mod -= interval;
  return anychart.math.round(value - mod, 7);
};


/**
 * Returns the nearest number to the right from value that meets equation ((value - opt_base) mod interval === 0).
 * @param {number} value Value to align.
 * @param {number} interval Value to align by.
 * @param {number=} opt_base Optional base value to calculate from. Defaults to 0.
 * @return {number} Aligned value.
 */
anychart.utils.alignRight = function(value, interval, opt_base) {
  opt_base = opt_base || 0;
  var mod = anychart.math.round((value - opt_base) % interval, 7);
  if (mod >= interval) // ECMAScript float representation... try (0.5 % 0.1).
    mod -= interval;
  if (mod == 0)
    return anychart.math.round(value, 7);
  else if (mod < 0)
    mod += interval;
  return anychart.math.round(value + interval - mod, 7);
};


/**
 * Apply offset to the position depending on an anchor.
 * @param {acgraph.math.Coordinate} position Position to be modified.
 * @param {anychart.enums.Anchor} anchor Anchor.
 * @param {number} offsetX X offset.
 * @param {number} offsetY Y offset.
 * @return {acgraph.math.Coordinate} Modified position.
 */
anychart.utils.applyOffsetByAnchor = function(position, anchor, offsetX, offsetY) {
  switch (anchor) {
    case anychart.enums.Anchor.LEFT_TOP:
    case anychart.enums.Anchor.LEFT_CENTER:
    case anychart.enums.Anchor.CENTER_TOP:
    case anychart.enums.Anchor.CENTER:
      position.x += offsetX;
      position.y += offsetY;
      break;

    case anychart.enums.Anchor.LEFT_BOTTOM:
    case anychart.enums.Anchor.CENTER_BOTTOM:
      position.x += offsetX;
      position.y -= offsetY;
      break;

    case anychart.enums.Anchor.RIGHT_CENTER:
    case anychart.enums.Anchor.RIGHT_TOP:
      position.x -= offsetX;
      position.y += offsetY;
      break;

    case anychart.enums.Anchor.RIGHT_BOTTOM:
      position.x -= offsetX;
      position.y -= offsetY;
      break;
  }
  return position;
};


/**
 * Does a recursive clone of an object.
 *
 * @param {*} obj Object to clone.
 * @return {*} Clone of the input object.
 */
anychart.utils.recursiveClone = function(obj) {
  var res;

  if (goog.isFunction(obj)) {
    return obj;
  } else if (goog.isArray(obj)) {
    res = new Array(obj.length);
  } else if (goog.isObject(obj)) {
    res = {};
  } else return obj;

  for (var key in obj) {
    res[key] = anychart.utils.recursiveClone(obj[key]);
  }

  return res;
};


/**
 * Define if passed value fit to the none definition.
 * @param {*} value Value to define.
 * @return {boolean} Is passed value fit to the none definition.
 */
anychart.utils.isNone = function(value) {
  return value === null || (goog.isString(value) && value.toLowerCase() == 'none');
};


/**
 * Anychart default formatter.
 * @this {{value: * }}
 * @return {*}
 */
anychart.utils.DEFAULT_FORMATTER = function() {
  return this['value'];
};


/**
 * Trims all whitespace from the left of the string.
 * @param {string} str source string.
 * @return {string} left trimmed string.
 */
anychart.utils.ltrim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims all whitespace from the right of the string.
 * @param {string} str source string.
 * @return {string} right trimmed string.
 */
anychart.utils.rtrim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * Trims all whitespace from the both sides of the string.
 * @param {string} str source string.
 * @return {string} trimmed string.
 */
anychart.utils.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  XML <-> JSON
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Built-in XML node types enumeration.
 * @enum {number}
 * @private
 */
anychart.utils.XmlNodeType_ = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};


/**
 * Public function that parses XML and returns JSON. It hides all errors in
 * Document structure, so the result may be not as strict as expected.
 * The function converts XML string or node to an object with attributes
 * introduced as same named string properties. All subnodes are also converted to
 * correspondingly named properties by the next rules:
 * - if there is only one child with this name, it is converted into an object
 *   an added just as an object property to the parent object.
 * - if there are multiple children with the same name, they are also converted
 *   to a separate objects and then added to the parent object as an array.
 * - if there is an attribute named just like the node(s), the node(s) will
 *   completely replace the attribute.
 * - if there is any text value or a CDATA node or any their combination in the
 *   node, that value is stored as a string in a property named "value" even in
 *   cases when there is a subnode named "value" (but the node with this name
 *   still can be found in "#children#" array mentioned below).
 * Also some service properties are added to an object representing a node:
 * - "#name#" property - the node name
 * - "#children#" array property - all node children listed in order they appear
 *   in the node
 * - mentioned above "value" string property - contains textual value of the
 *   node
 * Usage sample:
 * <code>
 *   var a = new XMLHttpRequest();
 *   a.open('GET', 'http://sample.com', false, "", "");
 *   a.send(null);
 *   // for example there was the next XML:
 *   // <root a="123">
 *   //   <child />
 *   //   <child>some text value<![CDATA[   and a CDATA   ]]></child>
 *   //   <child_other/>
 *   // </root>
 *   var json = anychart.utils.XML2JSON(a.responseXML);
 * </code>
 * json variable will have the following structure:
 * {
 *   #name#: "root",
 *   #children#: [
 *      {#name#: "child", #children#: []},
 *      {#name#: "child", #children#: [], value: "some text value   and a CDATA   "}
 *      {#name#: "child_other", #children#: []}
 *   ],
 *   a: "123",
 *   child: [
 *      {#name#: "child", #children#: []},
 *      {#name#: "child", #children#: [], value: "some text value   and a CDATA   "}
 *   ],
 *   child_other: {#name#: "child_other", #children#: []}
 * }
 * @param {string|Node} xml XML source string.
 * @return {Object|string} Transformation result JSON (may by null).
 */
anychart.utils.xml2json = function(xml) {
  var node;
  if (goog.isString(xml)) {
    node = goog.dom.xml.loadXml(xml);
  } else
    node = xml;

  if (!node) {
    return null;
  }

  // parsing node type
  switch (node.nodeType) {
    case anychart.utils.XmlNodeType_.ELEMENT_NODE:
      var result = {};
      var i;

      var len = (node.attributes == null) ? 0 : node.attributes.length;
      var onlyText = !len;

      // collecting attributes
      for (i = 0; i < len; i++) {
        /** @type {Attr} */
        var attr = node.attributes[i];
        if (!(attr.nodeName in result)) {
          var val = attr.nodeValue;
          if (!isNaN(+val))
            result[attr.nodeName] = +val;
          else if (val == 'true')
            result[attr.nodeName] = true;
          else if (val == 'false')
            result[attr.nodeName] = false;
          else if (val == 'null')
            result[attr.nodeName] = null;
          else
            result[attr.nodeName] = val;
        }
      }

      len = node.childNodes.length;
      var textValue = '';
      // collecting subnodes
      for (i = 0; i < len; i++) {
        var childNode = node.childNodes[i];
        var subnode = anychart.utils.xml2json(childNode);
        var subNodeName = childNode.nodeName;
        if (subNodeName.charAt(0) == '#') {
          textValue += subnode;
        } else if (!goog.isNull(subnode)) {
          onlyText = false;
          var names;
          if (names = anychart.utils.getArrayPropName_(subNodeName)) {
            result[names[0]] = subnode[names[1]];
          } else if (subNodeName in result) {
            if (goog.isArray(result[subNodeName])) {
              result[subNodeName].push(subnode);
            } else {
              result[subNodeName] = [result[subNodeName], subnode];
            }
          } else {
            result[subNodeName] = subnode;
          }
        }
      }

      return onlyText ? textValue : result;
    case anychart.utils.XmlNodeType_.TEXT_NODE:
      var value = anychart.utils.trim(node.nodeValue);
      return (value == '') ? null : value;
    case anychart.utils.XmlNodeType_.CDATA_SECTION_NODE:
      return node.nodeValue;
    case anychart.utils.XmlNodeType_.DOCUMENT_NODE:
      return anychart.utils.xml2json(node.documentElement);
    default:
      return null;
  }
};


/**
 * Converts JSON object to an XML Node tree or String (string by default).
 * @param {Object|string} json
 * @param {string=} opt_rootNodeName
 * @param {boolean=} opt_returnAsXmlNode
 * @return {string|Node}
 */
anychart.utils.json2xml = function(json, opt_rootNodeName, opt_returnAsXmlNode) {
  if (goog.isString(json)) {
    json = goog.json.hybrid.parse(json);
  }
  /** @type {Document} */
  var result = goog.dom.xml.createDocument();
  var root = anychart.utils.json2xml_(json, opt_rootNodeName || 'xml', result);
  if (root)
    result.appendChild(root);
  return opt_returnAsXmlNode ? result : goog.dom.xml.serialize(result);
};


/**
 * Wrapper for safe console usage on develop version of anychart component.
 * @param {*} msg - Warning message.
 */
anychart.utils.consoleWarn = function(msg) {
  //TODO (A.Kudryavtsev): Add another console notifications if needed (log(), error(), info() ... ).
  if (anychart.DEVELOP && goog.global['console']) goog.global['console']['warn'](msg);
};


/**
 * RegExp of what we allow to be serialized as an xml attribute.
 * @type {RegExp}
 * @private
 */
anychart.utils.ACCEPTED_BY_ATTRIBUTE_ = /^[A-Za-z0-9#_(),. -]*$/;


/**
 * Converts JSON object to an XML Node tree or String (string by default).
 * @param {Object|string} json
 * @param {string} rootNodeName
 * @param {Document} doc
 * @return {Node}
 * @private
 */
anychart.utils.json2xml_ = function(json, rootNodeName, doc) {
  if (goog.isNull(json)) return null;
  var root = doc.createElement(rootNodeName);
  if (goog.isString(json) || goog.isNumber(json)) {
    root.appendChild(doc.createCDATASection(String(json)));
  } else {
    var j;
    for (var i in json) {
      if (json.hasOwnProperty(i)) {
        var child = json[i];
        if (goog.isArray(child)) {
          var nodeNames = anychart.utils.getNodeNames_(i);
          var grouper, itemName;
          if (nodeNames) {
            grouper = doc.createElement(nodeNames[0]);
            root.appendChild(grouper);
            itemName = nodeNames[1];
          } else {
            grouper = root;
            itemName = i;
          }
          for (j = 0; j < child.length; j++) {
            grouper.appendChild(anychart.utils.json2xml_(child[j], itemName, doc));
          }
        } else if (goog.isDefAndNotNull(child)) {
          if (goog.isObject(child) || !anychart.utils.ACCEPTED_BY_ATTRIBUTE_.test(child)) {
            root.appendChild(anychart.utils.json2xml_(child, i, doc));
          } else {
            root.setAttribute(i, child);
          }
        }
      }
    }
  }
  return root;
};


/**
 * Gets grouper and item node names for passed array property name.
 * @param {string} arrayPropName
 * @return {?Array.<string>} Array of [grouperName, itemName] or null.
 * @private
 */
anychart.utils.getNodeNames_ = function(arrayPropName) {
  switch (arrayPropName) {
    case 'series':
      return ['seriesList', 'series'];
    case 'keys':
      return ['keys', 'key'];
    case 'data':
      return ['data', 'point'];
  }
  return null;
};


/**
 * Checks if passed name is a grouper and returns correct property name in case it is.
 * @param {string} nodeName
 * @return {?Array.<string>} Array of [propertyName, itemName] or null.
 * @private
 */
anychart.utils.getArrayPropName_ = function(nodeName) {
  switch (nodeName) {
    case 'seriesList':
      return ['series', 'series'];
    case 'keys':
      return ['keys', 'key'];
    case 'data':
      return ['data', 'point'];
  }
  return null;
};


/**
 * CRC table.
 * @type {Array}
 * @private
 */
anychart.utils.crcTable_ = null;


/**
 * Creates crc32 table.
 * @return {Array} crc table.
 * @private
 */
anychart.utils.createCRCTable_ = function() {
  var c;
  var crcTable = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
};


/**
 * Takes argument and returns it crc32 checksum.
 * @param {string} str Input string.
 * @return {string} crc32b.
 */
anychart.utils.crc32 = function(str) {
  if (!anychart.utils.crcTable_) anychart.utils.crcTable_ = anychart.utils.createCRCTable_();
  var crc = 0 ^ (-1), i = 0;
  while (i < str.length)
    crc = (crc >>> 8) ^ anychart.utils.crcTable_[(crc ^ str.charCodeAt(i++)) & 0xFF];
  return ((crc ^ (-1)) >>> 0).toString(16);
};


/**
 * Crypted salt
 * @type {Array.<number>}
 * @private
 */
anychart.utils.crc32Salt_ = [45, 113, 99, 117, 108, 106, 110, 124, 109, 118, 35, 120, 99, 111, 91, 123, 85];


/**
 * Decrypted salt.
 * @type {?string}
 * @private
 */
anychart.utils.decryptedSalt_ = null;


/**
 * Decrypt salt.
 * @return {string} Decrypted salt.
 */
anychart.utils.getSalt = function() {
  if (anychart.utils.decryptedSalt_) return anychart.utils.decryptedSalt_;
  var l = anychart.utils.crc32Salt_.length;
  var mod = l % 2 == 0 ? l / 2 : (l + 1 / 2);
  return anychart.utils.decryptedSalt_ = goog.array.map(goog.array.map(anychart.utils.crc32Salt_, function(v, i) {
    var sign = i % 2 ? -1 : 1;
    return v + sign * (i % mod);
  }), function(v) {
    return String.fromCharCode(v);
  }).join('');
};


//exports
goog.exportSymbol('anychart.utils.xml2json', anychart.utils.xml2json);
goog.exportSymbol('anychart.utils.json2xml', anychart.utils.json2xml);
