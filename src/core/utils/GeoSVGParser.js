goog.provide('anychart.core.utils.GeoSVGParser');
goog.require('anychart.core.utils.SVGPathDataParser');
goog.require('goog.math.AffineTransform');



/**
 * Geo SVG parser class.
 * @constructor
 */
anychart.core.utils.GeoSVGParser = function() {
  this.supportedElements = [
    'rect',
    'circle',
    'ellipse',
    'polygon',
    'polyline',
    'path',
    'line',
    'text',
    'image',
    'use',
    'clippath',
    'lineargradient',
    'radialgradient',
    'pattern',
    'g',
    'svg'
  ];
};
goog.addSingletonGetter(anychart.core.utils.GeoSVGParser);


/**
 * Returns parser type.
 * @return {anychart.enums.MapGeoDataTypes}
 */
anychart.core.utils.GeoSVGParser.prototype.getType = function() {
  return anychart.enums.MapGeoDataTypes.SVG;
};


/**
 * Parse geo JSON data.
 * @param {string|Document|Node|Element} data GeoJSON data to parse.
 * @return {!Array} .
 */
anychart.core.utils.GeoSVGParser.prototype.parse = function(data) {
  this.svg = goog.isString(data) ? new DOMParser().parseFromString(data, 'text/xml') : data;
  this.namedElements = {};
  this.parseDefs_();

  return this.parseGeoSVGFeatures_(/** @type {Element} */(this.svg), null, null);
};


/**
 * Parsing svg to internal format.
 * @param {Element} node .
 * @param {(Object|boolean)=} opt_parent .
 * @param {goog.math.AffineTransform=} opt_tx .
 * @return {!Array}
 * @private
 */
anychart.core.utils.GeoSVGParser.prototype.parseGeoSVGFeatures_ = function(node, opt_parent, opt_tx) {
  var svgDomElement, element, i, len, id, tagName, newFeature;
  var elements = goog.dom.getChildren(node);
  var result = [];
  for (i = 0, len = elements.length; i < len; i++) {
    svgDomElement = elements[i];
    if (goog.dom.isElement(svgDomElement)) {
      tagName = svgDomElement.tagName.toLowerCase();
      newFeature = !opt_parent || (tagName == 'g' || tagName == 'svg' && opt_parent) ? {} : null;
      element = this.parseSvgElement_(svgDomElement, newFeature, opt_tx);
      if (newFeature) {
        if (tagName == 'g' || tagName == 'svg') {
          var tx = this.getTransformation(svgDomElement, opt_tx);
          var attrs = this.getAttributes(svgDomElement, 'group');
          var properties = this.getProperties(svgDomElement);

          if (tagName == 'g') {
            id = attrs['id'];
            if (goog.isDef(id)) {
              properties['id'] = id;
            } else if (goog.isDef(properties['id'])) {
              id = properties['id'];
            }

            newFeature['tx'] = tx;
            newFeature['properties'] = properties;
            newFeature['attrs'] = attrs;
            newFeature['id'] = id;
          } else {
            newFeature['properties'] = {};
            newFeature['attrs'] = {};
          }

          newFeature['type'] = 'group';
          newFeature['features'] = element;

        } else {
          newFeature = element;
        }
        if (newFeature) {
          result.push(newFeature);
        }
        newFeature = null;
      } else if (opt_parent) {
        if (element) goog.isArray(element) ? result.push.apply(result, element) : result.push(element);
      } else if (tagName == 'g' || tagName == 'svg') {
        if (element) result.push.apply(result, element);
      }
    }
  }
  return result;
};


/**
 * Parse svg element.
 * @param {Element} svgDomElement .
 * @param {Object=} opt_parent .
 * @param {goog.math.AffineTransform=} opt_tx .
 * @return {Object}
 * @private
 */
anychart.core.utils.GeoSVGParser.prototype.parseSvgElement_ = function(svgDomElement, opt_parent, opt_tx) {
  var tx, element;
  var id = svgDomElement.getAttribute('id');
  if (id && this.namedElements[id]) {
    element = anychart.utils.recursiveClone(this.namedElements[id]);
  } else {
    var hrefElement = this.getRefElement(svgDomElement);
    var tagName = svgDomElement.tagName.toLowerCase();

    switch (tagName) {
      case 'rect':
        element = this.convertRect(svgDomElement, opt_tx);
        break;
      case 'circle':
        element = this.convertCircle(svgDomElement, opt_tx);
        break;
      case 'ellipse':
        element = this.convertEllipse(svgDomElement, opt_tx);
        break;
      case 'polygon':
        element = this.convertPolygon(svgDomElement, opt_tx);
        break;
      case 'polyline':
        element = this.convertPolyline(svgDomElement, opt_tx);
        break;
      case 'path':
        element = this.convertPath(svgDomElement, opt_tx);
        break;
      case 'line':
        element = this.convertLine(svgDomElement, opt_tx);
        break;
      case 'text':
        element = this.convertText(svgDomElement, opt_tx);
        break;
      case 'image':
        element = this.convertImage(svgDomElement, opt_tx);
        break;
      case 'use':
        element = this.getRefElement(svgDomElement);
        break;
      case 'clippath':
        element = this.convertClipPath(svgDomElement, opt_tx);
        break;
      case 'lineargradient':
        element = this.convertLinearGradient(svgDomElement, hrefElement);
        break;
      case 'radialgradient':
        element = this.convertRadialGradient(svgDomElement, hrefElement);
        break;
      case 'pattern':
        element = this.convertPattern(svgDomElement);
        break;
      case 'defs':
      case 'desc':
        break;
      case 'g':
      case 'svg':
      default:
        tx = this.getTransformation(svgDomElement, opt_tx);
        element = this.parseGeoSVGFeatures_(svgDomElement, opt_parent, tx.full);
    }

    if (element && id)
      this.namedElements[id] = element;
  }
  return /** @type {Object} */(element);
};


/**
 * Parse svg defs.
 * @private
 */
anychart.core.utils.GeoSVGParser.prototype.parseDefs_ = function() {
  var svg_defs = this.svg.getElementsByTagName('defs');
  var elem, i, j, len, len_, id, def;
  for (i = 0, len = svg_defs.length; i < len; i++) {
    elem = svg_defs[i];
    var children = goog.dom.getChildren(elem);
    for (j = 0, len_ = children.length; j < len_; j++) {
      var child = children[j];
      if (goog.dom.isElement(child)) {
        id = child.getAttribute('id');
        if (this.namedElements[id])
          continue;

        def = this.parseSvgElement_(child);
      }
    }
  }
};


/**
 * Returns referenced by xlink element.
 * @param {Element} domElement Svg dom element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.getRefElement = function(domElement) {
  var href = domElement.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
  var hrefElement = null;
  if (href) {
    var hrefId = href.substring(1, href.length);
    hrefElement = /** @type {Object} */(anychart.utils.recursiveClone(this.namedElements[hrefId]));
    if (!hrefElement) {
      var hrefElementDomEl = this.svg.getElementById(hrefId);
      if (hrefElementDomEl)
        hrefElement = this.parseSvgElement_(hrefElementDomEl);
    }
  }
  return hrefElement;
};


/**
 * Parse linear gradient.
 * @param {Element} node Linear gradient dom element.
 * @param {Object=} opt_ref Referenced element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertLinearGradient = function(node, opt_ref) {
  var res = {};

  var units_, x1_, y1_, x2_, y2_, opacity_, transform_;
  if (opt_ref) {
    units_ = opt_ref['gradientUnits'];
    transform_ = opt_ref['transform'];
    x1_ = +opt_ref['x1'];
    y1_ = +opt_ref['y1'];
    x2_ = +opt_ref['x2'];
    y2_ = +opt_ref['y2'];
    opacity_ = opt_ref['opacity'];
  }

  var units = node.getAttribute('gradientUnits') || units_;
  var transform = this.getTransformation(node).self || transform_;
  var x1_self = +node.getAttribute('x1');
  var y1_self = +node.getAttribute('y1');
  var x2_self = +node.getAttribute('x2');
  var y2_self = +node.getAttribute('y2');
  var opacity_self = +node.getAttribute('opacity');

  var x1 = goog.isDef(x1_self) ? x1_self : goog.isDef(x1_) ? x1_ : 0;
  var y1 = goog.isDef(y1_self) ? y1_self : goog.isDef(y1_) ? y1_ : 0;
  var x2 = goog.isDef(x2_self) ? x2_self : goog.isDef(x2_) ? x2_ : 0;
  var y2 = goog.isDef(y2_self) ? y2_self : goog.isDef(y2_) ? y2_ : 0;
  var opacity = goog.isDef(opacity_self) ? opacity_self : goog.isDef(opacity_) ? opacity_ : 0;

  x1 = anychart.math.round(x1, 7);
  y1 = anychart.math.round(y1, 7);
  x2 = anychart.math.round(x2, 7);
  y2 = anychart.math.round(y2, 7);

  var s1 = x2 - x1;
  var s2 = y2 - y1;

  if (units && units.toLowerCase() == 'userspaceonuse') {
    res['mode'] = anychart.math.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(s1), Math.abs(s2));
  } else {
    res['mode'] = false;
  }

  var angle = Math.round(goog.math.toDegrees(Math.atan(s2 / s1)));

  if (s1 > 0 && s2 < 0) {
    angle = Math.abs(angle);
  } else if (s1 <= 0 && s2 <= 0) {
    angle = 180 - Math.abs(angle);
  } else if (s1 <= 0 && s2 > 0) {
    angle = 180 + Math.abs(angle);
  } else if (s1 > 0 && s2 > 0) {
    angle = 360 - Math.abs(angle);
  }

  res['opacity'] = opacity;
  var children = goog.dom.getChildren(node);
  res['keys'] = children.length ? this.getGradientStops(node) : opt_ref ? opt_ref['keys'] : [];
  res['angle'] = angle;
  res['transform'] = transform;

  return res;
};


/**
 * Parse radial gradient.
 * @param {Element} node Radial gradient dom element.
 * @param {Object=} opt_ref Referenced element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertRadialGradient = function(node, opt_ref) {
  var res = {};

  var units_, r_, cx_, cy_, fx_, fy_, opacity_, transform_;
  if (opt_ref) {
    units_ = opt_ref['gradientUnits'];
    transform_ = opt_ref['gradientTransform'];
    r_ = +opt_ref['r'];
    cx_ = +opt_ref['cx'];
    cy_ = +opt_ref['cy'];
    fx_ = +opt_ref['fx'];
    fy_ = +opt_ref['fy'];
    opacity_ = +opt_ref['opacity'];
  }

  var units = node.getAttribute('gradientUnits') || units_;
  var transform = this.getTransformation(node).self || transform_;

  var r_self = +node.getAttribute('r');
  var cx_self = +node.getAttribute('cx');
  var cy_self = +node.getAttribute('cy');
  var fx_self = +node.getAttribute('fx');
  var fy_self = +node.getAttribute('fy');
  var opacity_self = node.getAttribute('opacity') || opacity_;

  var r = goog.isDef(r_self) ? r_self : goog.isDef(r_) ? r_ : 0;
  var cx = goog.isDef(cx_self) ? cx_self : goog.isDef(cx_) ? cx_ : 0;
  var cy = goog.isDef(cy_self) ? cy_self : goog.isDef(cy_) ? cy_ : 0;
  var fx = goog.isDef(fx_self) ? fx_self : goog.isDef(fx_) ? fx_ : 0;
  var fy = goog.isDef(fy_self) ? fy_self : goog.isDef(fy_) ? fy_ : 0;
  var opacity = goog.isDef(opacity_self) ? opacity_self : goog.isDef(opacity_) ? opacity_ : 0;

  if (units && units.toLowerCase() == 'userspaceonuse') {
    var d = r * 2;
    var bounds = anychart.math.rect(cx - r, cy - r, d, d);
    res['cx'] = .5;
    res['cy'] = .5;
    res['fx'] = (fx - bounds.left) / d;
    res['fy'] = (fy - bounds.top) / d;
    res['mode'] = bounds;
  } else {
    res['cx'] = cx;
    res['cy'] = cy;
    res['fx'] = fx;
    res['fy'] = fy;
  }
  res['opacity'] = opacity;
  res['transform'] = transform;

  var children = goog.dom.getChildren(node);
  res['keys'] = children.length ? this.getGradientStops(node) : opt_ref ? opt_ref['keys'] : [];

  return res;
};


/**
 * Parse radial gradient.
 * @param {Element} node Pattern dom element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertPattern = function(node) {
  var res = {};

  var x = +node.getAttribute('x');
  var y = +node.getAttribute('y');
  var w = +node.getAttribute('width');
  var h = +node.getAttribute('height');

  res['type'] = 'pattern';
  res['bounds'] = anychart.math.rect(x, y, w, h);
  res['properties'] = this.getProperties(node);
  res['attrs'] = this.getAttributes(node, 'group');
  res['features'] = this.parseGeoSVGFeatures_(node, res);
  res['properties']['id'] = res['id'] = res['attrs']['id'];

  return res;
};


/**
 * Returns gradient keys of passed gradient dom element.
 * @param {Element} node Gradient dom element.
 * @return {Array.<acgraph.vector.GradientKey>}
 */
anychart.core.utils.GeoSVGParser.prototype.getGradientStops = function(node) {
  if (!node)
    return null;

  var stops;
  var children = goog.dom.getChildren(node);
  if (children && children.length) {
    stops = [];
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i];
      var styleColor = goog.style.getStyle(child, 'stop-color');
      var styleOpacity = parseFloat(goog.style.getStyle(child, 'stop-opacity'));

      var stopColor = styleColor ? styleColor : child.getAttribute('stop-color');
      var stopOpacity = isNaN(styleOpacity) ? parseFloat(child.getAttribute('stop-opacity')) : styleOpacity;
      var offset = parseFloat(child.getAttribute('offset'));

      stops.push(/** @type {acgraph.vector.GradientKey} */({
        'offset': offset,
        'color': stopColor,
        'opacity': isNaN(stopOpacity) ? 1 : stopOpacity
      }));
    }
  }
  return /** @type {Array.<acgraph.vector.GradientKey>} */(stops);
};


/**
 * Converts clip path dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertClipPath = function(node, opt_tx) {
  var tx = this.getTransformation(node, opt_tx);
  var elements = this.parseGeoSVGFeatures_(node, true, tx.full);

  var commands = [];
  for (var i = 0, len = elements.length; i < len; i++) {
    commands.push.apply(commands, elements[i]['commands']);
  }

  return {'clippath': this.createResult(node, commands, opt_tx)};
};


/**
 * Converts text dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertImage = function(node, opt_tx) {
  var tx = this.getTransformation(node, opt_tx);

  var properties = this.getProperties(node);
  var attrs = this.getAttributes(node, 'element');

  var x = +node.getAttribute('x');
  var y = +node.getAttribute('y');
  var w = +node.getAttribute('width');
  var h = +node.getAttribute('height');

  properties['id'] = attrs['id'];

  var cloneNode = node.cloneNode(true);
  if (tx.full)
    cloneNode.setAttribute('transform', tx.full.toString());
  cloneNode.removeAttribute('data-ac-wrapper-id');

  var id = attrs['id'];
  if (goog.isDef(id)) {
    properties['id'] = id;
  } else if (goog.isDef(properties['id'])) {
    id = properties['id'];
  }

  var element = {
    'type': 'image',
    'sourceNode': node,
    'cloneNode': cloneNode,
    'bounds': anychart.math.rect(x, y, w, h),
    'tx': tx,
    'id': id,
    'properties': properties,
    'attrs': attrs
  };

  return element;
};


/**
 * Converts text dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertText = function(node, opt_tx) {
  var tx = this.getTransformation(node, opt_tx);

  var properties = this.getProperties(node);
  var attrs = this.getAttributes(node, 'element');

  properties['id'] = attrs['id'];

  var cloneNode = node.cloneNode(true);
  if (tx.full)
    cloneNode.setAttribute('transform', tx.full.toString());
  cloneNode.removeAttribute('data-ac-wrapper-id');

  var id = attrs['id'];
  if (goog.isDef(id)) {
    properties['id'] = id;
  } else if (goog.isDef(properties['id'])) {
    id = properties['id'];
  }

  var element = {
    'type': 'text',
    'text': node,
    'cloneNode': cloneNode,
    'tx': tx,
    'id': id,
    'properties': properties,
    'attrs': attrs
  };

  return element;
};


/**
 * Converts rect dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertRect = function(node, opt_tx) {
  var x, y, w, h;

  x = +node.getAttribute('x');
  y = +node.getAttribute('y');
  w = +node.getAttribute('width');
  h = +node.getAttribute('height');

  var commands = [
    {type: 'M', values: [x, y]},
    {type: 'L', values: [x + w, y]},
    {type: 'L', values: [x + w, y + h]},
    {type: 'L', values: [x, y + h]},
    {type: 'Z'}
  ];

  return this.createResult(node, commands, opt_tx);
};


/**
 * Converts circle dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertCircle = function(node, opt_tx) {
  var cx, cy, r;

  cx = +node.getAttribute('cx');
  cy = +node.getAttribute('cy');
  r = +node.getAttribute('r');

  var p1x = cx - r;
  var p1y = cy;
  var p2x = p1x + 2 * r;
  var p2y = p1y;

  var commands = this.reducePathData([
    {type: 'M', values: [p1x, p1y]},
    {type: 'A', values: [r, r, 0, 1, 0, p2x, p2y]},
    {type: 'A', values: [r, r, 0, 1, 0, p1x, p1y]},
    {type: 'Z'}
  ]);

  return this.createResult(node, commands, opt_tx);
};


/**
 * Converts ellipse dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertEllipse = function(node, opt_tx) {
  var cx, cy, rx, ry, deg = 0;

  cx = +node.getAttribute('cx');
  cy = +node.getAttribute('cy');
  rx = +node.getAttribute('rx');
  ry = +node.getAttribute('ry');

  var p1x = cx - rx;
  var p1y = cy;
  var p2x = p1x + 2 * rx;
  var p2y = p1y;

  var commands = this.reducePathData([
    {type: 'M', values: [p1x, p1y]},
    {type: 'A', values: [rx, ry, 0, 1, 0, p2x, p2y]},
    {type: 'A', values: [rx, ry, 0, 1, 0, p1x, p1y]},
    {type: 'Z'}
  ]);

  return this.createResult(node, commands, opt_tx);
};


/**
 * Converts polygon dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertPolygon = function(node, opt_tx) {
  var points = node.getAttribute('points').trim().split(/\s+|,/);

  var commands = [];
  for (var i = 0, size = points.length - 1; i < size; i += 2) {
    if (!i)
      commands.push({type: 'M', values: [+points[i], +points[i + 1]]});
    else
      commands.push({type: 'L', values: [+points[i], +points[i + 1]]});
  }
  commands.push({type: 'Z'});

  return this.createResult(node, commands, opt_tx);
};


/**
 * Converts polyline dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertPolyline = function(node, opt_tx) {
  var points = node.getAttribute('points').trim().split(/\s+|,/);

  var commands = [];
  for (var i = 0, len = points.length - 1; i < len; i += 2) {
    if (!i)
      commands.push({type: 'M', values: [+points[i], +points[i + 1]]});
    else
      commands.push({type: 'L', values: [+points[i], +points[i + 1]]});
  }

  return this.createResult(node, commands, opt_tx);
};


/**
 * Converts line dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertLine = function(node, opt_tx) {
  var x1 = +node.getAttribute('x1');
  var x2 = +node.getAttribute('x2');
  var y1 = +node.getAttribute('y1');
  var y2 = +node.getAttribute('y2');

  var commands = [
    {type: 'M', values: [x1, y1]},
    {type: 'L', values: [x2, y2]}
  ];

  return this.createResult(node, commands, opt_tx);
};


/**
 * Converts path dom element to internal represent.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.convertPath = function(node, opt_tx) {
  //todo (balckart) don't remove!
  // var svgPathElement = /** @type {Node} */(SVGPathElement);
  // var commands = svgPathElement && svgPathElement.prototype['getPathData'] ? node['getPathData']() : this.getPathData(node);

  var commands = this.getPathData(node);

  return this.createResult(node, commands, opt_tx);
};


/**
 * Creates path by passed path data commands.
 * @param {Array.<Object>} commands
 * @param {acgraph.vector.Path=} opt_path .
 * @param {Function=} opt_txFunc Transformation function.
 * @return {!acgraph.vector.Path}
 */
anychart.core.utils.GeoSVGParser.prototype.createPathByCommands = function(commands, opt_path, opt_txFunc) {
  var path = opt_path ? opt_path.clear() : acgraph.path();

  for (var i = 0, len = commands.length; i < len; i++) {
    var command = commands[i];
    var params = opt_txFunc ? opt_txFunc.apply(opt_txFunc, command.values) : command.values;

    switch (command.type) {
      case 'M':
        path.moveTo(+params[0], +params[1]);
        break;
      case 'L':
        path.lineTo(+params[0], +params[1]);
        break;
      case 'C':
        path.curveTo(+params[0], +params[1], +params[2], +params[3], +params[4], +params[5]);
        break;
      case 'Z':
        path.close();
        break;
    }
  }
  return path;
};


/**
 * Returns full transformation for passed element. Self element tx is concatenated with passed opt_tx.
 * @param {Element} node Source svg dom element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {!Object.<string, goog.math.AffineTransform>}
 */
anychart.core.utils.GeoSVGParser.prototype.getTransformation = function(node, opt_tx) {
  var tagName = node.tagName.toLowerCase();
  var transformAttr;
  if (tagName == 'lineargradient' || tagName == 'radialgradient') {
    transformAttr = node.getAttribute('gradientTransform');
  } else {
    transformAttr = node.getAttribute('transform');
  }

  if (!transformAttr)
    return {self: null, full: goog.isDef(opt_tx) ? opt_tx : null};

  var tx = acgraph.vector.parseTransformationString(transformAttr);

  var fullTx = tx.clone();
  if (opt_tx) {
    fullTx.preConcatenate(opt_tx);
  }

  return {self: tx, full: fullTx};
};


/**
 * Returns attributes of the passed element.
 * @param {Element} node Source svg dom element.
 * @param {string} type Element type.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.getAttributes = function(node, type) {
  var res = {};

  var attrs = node.attributes;

  res['fill'] = {};
  res['stroke'] = {};

  for (var i = 0, len = attrs.length; i < len; i++) {
    var attr = attrs[i];
    attr.name = attr.name.toLowerCase();
    switch (attr.name) {
      case 'clip-path':
        var clipPathId = attr.value.replace(/^url\s*\("*#(.+)"*\)/g, '$1');
        var clipPath = this.namedElements[clipPathId];
        if (clipPath) {
          res[attr.name] = clipPath['clippath'];
        }
        break;
      case 'opacity':
        if (!goog.isDef(res['fill']['opacity']))
          res['fill']['opacity'] = attr.value;
        if (!goog.isDef(res['stroke']['opacity']))
          res['stroke']['opacity'] = attr.value;
        break;
      case 'fill':
        res['fill']['color'] = attr.value;
        break;
      case 'fill-opacity':
        res['fill']['opacity'] = attr.value;
        break;
      case 'stroke':
        res['stroke']['color'] = attr.value;
        break;
      case 'stroke-opacity':
        res['stroke']['opacity'] = attr.value;
        break;
      case 'stroke-linejoin':
        res['stroke']['lineJoin'] = attr.value;
        break;
      case 'stroke-linecap':
        res['stroke']['lineCap'] = attr.value;
        break;
      case 'stroke-width':
        res['stroke']['thickness'] = attr.value;
        break;
      case 'stroke-dasharray':
        res['stroke']['dash'] = attr.value;
        break;
      default:
        if (attr.name != 'style' && attr.name != 'd' && attr.name != 'transform' && attr.name != 'data-ac-wrapper-id')
          res[attr.name] = attr.value;
    }
  }

  if (type == 'element') {
    if (!goog.isDef(res['fill']['color'])) {
      if (node.style) {
        res['fill']['color'] = goog.style.getStyle(node, 'fill');
        goog.style.setStyle(node, 'fill', '');
      } else {
        res['fill']['color'] = 'black';
      }
    }

    var fillColor = res['fill']['color'].trim();
    if (goog.string.startsWith(fillColor, 'url')) {
      var fillId = fillColor.replace(/"/g, '').replace(/^url\s*\(#(.+)\)/g, '$1');
      res['fill'] = this.namedElements[fillId];
    }

    if (!res['stroke']['color']) {
      if (node.style) {
        res['stroke']['color'] = goog.style.getStyle(node, 'stroke');
        goog.style.setStyle(node, 'stroke', '');
      } else {
        res['stroke']['color'] = 'none';
      }
    }

    var strokeColor = res['stroke']['color'].trim();
    if (goog.string.startsWith(strokeColor, 'url')) {
      var strokeId = fillColor.replace(/"/g, '').replace(/^url\s*\(#(.+)\)/g, '$1');
      res['stroke'] = this.namedElements[strokeId];
    }
  }

  var style = node.getAttribute('style');
  if (style) {
    res['style'] = style;
  }

  return res;
};


/**
 * Returns properties of the passed element. Properties are acquired from desc node that is child of the passed element.
 * @param {Element} node Source svg dom element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.getProperties = function(node) {
  var res = {};
  var children = goog.dom.getChildren(node);

  for (var i = 0, len = children.length; i < len; i++) {
    var child = children[i];
    if (child.tagName == 'desc') {
      var properties = goog.dom.getChildren(child);
      for (var j = 0, len_ = properties.length; j < len_; j++) {
        var prop = properties[j];
        res[prop.tagName] = prop.textContent;
      }
      break;
    }
  }

  return res;
};


/**
 * Returns final internal represent of svg element.
 * @param {Element} node Source svg dom element.
 * @param {Array} commands Array of svg path commands for creating path element.
 * @param {goog.math.AffineTransform=} opt_tx Transformation that was accumulated in one object for passed svg Element.
 * @return {Object}
 */
anychart.core.utils.GeoSVGParser.prototype.createResult = function(node, commands, opt_tx) {
  var tx = this.getTransformation(node, opt_tx);

  var commands_tx;
  if (tx.full) {
    commands_tx = acgraph.utils.recursiveClone(commands);
    for (var i = 0, len = commands_tx.length; i < len; i++) {
      var params = commands_tx[i].values;
      if (params) {
        tx.full.transform(params, 0, params, 0, params.length / 2);
      }
    }
  }

  var properties = this.getProperties(node);
  var attrs = this.getAttributes(node, 'element');

  var id = attrs['id'];
  if (goog.isDef(id)) {
    properties['id'] = id;
  } else if (goog.isDef(properties['id'])) {
    id = properties['id'];
  }
  return {
    'type': 'path',
    'properties': properties,
    'id': id,
    'commands': commands,
    'commands_tx': commands_tx,
    'attrs': attrs,
    'tx': tx
  };
};


/**
 * Returns an array of corresponding cubic bezier curve parameters for given arc curve parameters.
 * @param {number} x1 .
 * @param {number} y1 .
 * @param {number} x2 .
 * @param {number} y2 .
 * @param {number} r1 .
 * @param {number} r2 .
 * @param {number} angle .
 * @param {number} largeArcFlag .
 * @param {number} sweepFlag .
 * @param {Array.<number>=} opt_recursive .
 * @return {Array.<number>}
 */
anychart.core.utils.GeoSVGParser.prototype.arcToCubicCurves = function(x1, y1, x2, y2, r1, r2, angle, largeArcFlag, sweepFlag, opt_recursive) {
  var degToRad = function(degrees) {
    return (Math.PI * degrees) / 180;
  };

  var rotate = function(x, y, angleRad) {
    var X = x * Math.cos(angleRad) - y * Math.sin(angleRad);
    var Y = x * Math.sin(angleRad) + y * Math.cos(angleRad);
    return {x: X, y: Y};
  };

  var angleRad = degToRad(angle);
  var params = [];
  var f1, f2, cx, cy;

  if (opt_recursive) {
    f1 = opt_recursive[0];
    f2 = opt_recursive[1];
    cx = opt_recursive[2];
    cy = opt_recursive[3];
  }
  else {
    var p1 = rotate(x1, y1, -angleRad);
    x1 = p1.x;
    y1 = p1.y;

    var p2 = rotate(x2, y2, -angleRad);
    x2 = p2.x;
    y2 = p2.y;

    var x = (x1 - x2) / 2;
    var y = (y1 - y2) / 2;
    var h = (x * x) / (r1 * r1) + (y * y) / (r2 * r2);

    if (h > 1) {
      h = Math.sqrt(h);
      r1 = h * r1;
      r2 = h * r2;
    }

    var sign;

    if (largeArcFlag === sweepFlag) {
      sign = -1;
    }
    else {
      sign = 1;
    }

    var r1Pow = r1 * r1;
    var r2Pow = r2 * r2;

    var left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
    var right = r1Pow * y * y + r2Pow * x * x;

    var k = sign * Math.sqrt(Math.abs(left / right));

    cx = k * r1 * y / r2 + (x1 + x2) / 2;
    cy = k * -r2 * x / r1 + (y1 + y2) / 2;

    f1 = Math.asin(((y1 - cy) / r2).toFixed(9));
    f2 = Math.asin(((y2 - cy) / r2).toFixed(9));

    if (x1 < cx) {
      f1 = Math.PI - f1;
    }
    if (x2 < cx) {
      f2 = Math.PI - f2;
    }

    if (f1 < 0) {
      f1 = Math.PI * 2 + f1;
    }
    if (f2 < 0) {
      f2 = Math.PI * 2 + f2;
    }

    if (sweepFlag && f1 > f2) {
      f1 = f1 - Math.PI * 2;
    }
    if (!sweepFlag && f2 > f1) {
      f2 = f2 - Math.PI * 2;
    }
  }

  var df = f2 - f1;

  if (Math.abs(df) > (Math.PI * 120 / 180)) {
    var f2old = f2;
    var x2old = x2;
    var y2old = y2;

    if (sweepFlag && f2 > f1) {
      f2 = f1 + (Math.PI * 120 / 180) * (1);
    }
    else {
      f2 = f1 + (Math.PI * 120 / 180) * (-1);
    }

    x2 = cx + r1 * Math.cos(f2);
    y2 = cy + r2 * Math.sin(f2);
    params = this.arcToCubicCurves(x2, y2, x2old, y2old, r1, r2, angle, 0, sweepFlag, [f2, f2old, cx, cy]);
  }

  df = f2 - f1;

  var c1 = Math.cos(f1);
  var s1 = Math.sin(f1);
  var c2 = Math.cos(f2);
  var s2 = Math.sin(f2);
  var t = Math.tan(df / 4);
  var hx = 4 / 3 * r1 * t;
  var hy = 4 / 3 * r2 * t;

  var m1 = [x1, y1];
  var m2 = [x1 + hx * s1, y1 - hy * c1];
  var m3 = [x2 + hx * s2, y2 - hy * c2];
  var m4 = [x2, y2];

  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];

  if (opt_recursive) {
    return [m2, m3, m4].concat(params);
  }
  else {
    params = [m2, m3, m4].concat(params).join().split(',');

    var curves = [];
    var curveParams = [];

    params.forEach(function(param, i) {
      if (i % 2) {
        curveParams.push(rotate(params[i - 1], params[i], angleRad).y);
      }
      else {
        curveParams.push(rotate(params[i], params[i + 1], angleRad).x);
      }

      if (curveParams.length === 6) {
        curves.push(curveParams);
        curveParams = [];
      }
    });

    return curves;
  }
};


/**
 * Takes any path data, returns path data that consists only from absolute commands.
 * @param {Array.<*>} pathData .
 * @return {Array.<*>}
 */
anychart.core.utils.GeoSVGParser.prototype.absolutizePathData = function(pathData) {
  var absolutizedPathData = [];

  var currentX = null;
  var currentY = null;

  var subpathX = null;
  var subpathY = null;

  pathData.forEach(function(seg) {
    var type = seg.type;

    switch (type) {
      case 'M':
        var x = seg.values[0];
        var y = seg.values[1];

        absolutizedPathData.push({type: 'M', values: [x, y]});

        subpathX = x;
        subpathY = y;

        currentX = x;
        currentY = y;
        break;

      case 'm':
        var x = currentX + seg.values[0];
        var y = currentY + seg.values[1];

        absolutizedPathData.push({type: 'M', values: [x, y]});

        subpathX = x;
        subpathY = y;

        currentX = x;
        currentY = y;
        break;

      case 'L':
        var x = seg.values[0];
        var y = seg.values[1];

        absolutizedPathData.push({type: 'L', values: [x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'l':
        var x = currentX + seg.values[0];
        var y = currentY + seg.values[1];

        absolutizedPathData.push({type: 'L', values: [x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'C':
        var x1 = seg.values[0];
        var y1 = seg.values[1];
        var x2 = seg.values[2];
        var y2 = seg.values[3];
        var x = seg.values[4];
        var y = seg.values[5];

        absolutizedPathData.push({type: 'C', values: [x1, y1, x2, y2, x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'c':
        var x1 = currentX + seg.values[0];
        var y1 = currentY + seg.values[1];
        var x2 = currentX + seg.values[2];
        var y2 = currentY + seg.values[3];
        var x = currentX + seg.values[4];
        var y = currentY + seg.values[5];

        absolutizedPathData.push({type: 'C', values: [x1, y1, x2, y2, x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'Q':
        var x1 = seg.values[0];
        var y1 = seg.values[1];
        var x = seg.values[2];
        var y = seg.values[3];

        absolutizedPathData.push({type: 'Q', values: [x1, y1, x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'q':
        var x1 = currentX + seg.values[0];
        var y1 = currentY + seg.values[1];
        var x = currentX + seg.values[2];
        var y = currentY + seg.values[3];

        absolutizedPathData.push({type: 'Q', values: [x1, y1, x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'A':
        var x = seg.values[5];
        var y = seg.values[6];

        absolutizedPathData.push({
          type: 'A',
          values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
        });

        currentX = x;
        currentY = y;
        break;

      case 'a':
        var x = currentX + seg.values[5];
        var y = currentY + seg.values[6];

        absolutizedPathData.push({
          type: 'A',
          values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
        });

        currentX = x;
        currentY = y;
        break;

      case 'H':
        var x = seg.values[0];
        absolutizedPathData.push({type: 'H', values: [x]});
        currentX = x;
        break;

      case 'h':
        var x = currentX + seg.values[0];
        absolutizedPathData.push({type: 'H', values: [x]});
        currentX = x;
        break;

      case 'V':
        var y = seg.values[0];
        absolutizedPathData.push({type: 'V', values: [y]});
        currentY = y;
        break;

      case 'v':
        var y = currentY + seg.values[0];
        absolutizedPathData.push({type: 'V', values: [y]});
        currentY = y;
        break;

      case 'S':
        var x2 = seg.values[0];
        var y2 = seg.values[1];
        var x = seg.values[2];
        var y = seg.values[3];

        absolutizedPathData.push({type: 'S', values: [x2, y2, x, y]});

        currentX = x;
        currentY = y;
        break;

      case 's':
        var x2 = currentX + seg.values[0];
        var y2 = currentY + seg.values[1];
        var x = currentX + seg.values[2];
        var y = currentY + seg.values[3];

        absolutizedPathData.push({type: 'S', values: [x2, y2, x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'T':
        var x = seg.values[0];
        var y = seg.values[1];

        absolutizedPathData.push({type: 'T', values: [x, y]});

        currentX = x;
        currentY = y;
        break;

      case 't':
        var x = currentX + seg.values[0];
        var y = currentY + seg.values[1];

        absolutizedPathData.push({type: 'T', values: [x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'Z':
      case 'z':
        absolutizedPathData.push({type: 'Z', values: []});

        currentX = subpathX;
        currentY = subpathY;
        break;
    }
  });

  return absolutizedPathData;
};


/**
 * Takes path data that consists only from absolute commands, returns path data that consists only from 'M', 'L', 'C' and 'Z' commands.
 * @param {Array.<*>} pathData
 * @return {Array.<*>}
 */
anychart.core.utils.GeoSVGParser.prototype.reducePathData = function(pathData) {
  var reducedPathData = [];
  var lastType = null;

  var lastControlX = null;
  var lastControlY = null;

  var currentX = null;
  var currentY = null;

  var subpathX = null;
  var subpathY = null;

  goog.array.forEach(pathData, function(seg) {
    switch (seg.type) {
      case 'M':
        var x = seg.values[0];
        var y = seg.values[1];

        reducedPathData.push({type: 'M', values: [x, y]});

        subpathX = x;
        subpathY = y;

        currentX = x;
        currentY = y;
        break;

      case 'C':
        var x1 = seg.values[0];
        var y1 = seg.values[1];
        var x2 = seg.values[2];
        var y2 = seg.values[3];
        var x = seg.values[4];
        var y = seg.values[5];

        reducedPathData.push({type: 'C', values: [x1, y1, x2, y2, x, y]});

        lastControlX = x2;
        lastControlY = y2;

        currentX = x;
        currentY = y;
        break;

      case 'L':
        var x = seg.values[0];
        var y = seg.values[1];

        reducedPathData.push({type: 'L', values: [x, y]});

        currentX = x;
        currentY = y;
        break;

      case 'H':
        var x = seg.values[0];

        reducedPathData.push({type: 'L', values: [x, currentY]});

        currentX = x;
        break;

      case 'V':
        var y = seg.values[0];

        reducedPathData.push({type: 'L', values: [currentX, y]});

        currentY = y;
        break;

      case 'S':
        var x2 = seg.values[0];
        var y2 = seg.values[1];
        var x = seg.values[2];
        var y = seg.values[3];

        var cx1, cy1;

        if (lastType === 'C' || lastType === 'S') {
          cx1 = currentX + (currentX - lastControlX);
          cy1 = currentY + (currentY - lastControlY);
        }
        else {
          cx1 = currentX;
          cy1 = currentY;
        }

        reducedPathData.push({type: 'C', values: [cx1, cy1, x2, y2, x, y]});

        lastControlX = x2;
        lastControlY = y2;

        currentX = x;
        currentY = y;
        break;

      case 'T':
        var x = seg.values[0];
        var y = seg.values[1];

        var x1, y1;

        if (lastType === 'Q' || lastType === 'T') {
          x1 = currentX + (currentX - lastControlX);
          y1 = currentY + (currentY - lastControlY);
        } else {
          x1 = currentX;
          y1 = currentY;
        }

        var cx1 = currentX + 2 * (x1 - currentX) / 3;
        var cy1 = currentY + 2 * (y1 - currentY) / 3;
        var cx2 = x + 2 * (x1 - x) / 3;
        var cy2 = y + 2 * (y1 - y) / 3;

        reducedPathData.push({type: 'C', values: [cx1, cy1, cx2, cy2, x, y]});

        lastControlX = x1;
        lastControlY = y1;

        currentX = x;
        currentY = y;
        break;

      case'Q':
        var x1 = seg.values[0];
        var y1 = seg.values[1];
        var x = seg.values[2];
        var y = seg.values[3];

        var cx1 = currentX + 2 * (x1 - currentX) / 3;
        var cy1 = currentY + 2 * (y1 - currentY) / 3;
        var cx2 = x + 2 * (x1 - x) / 3;
        var cy2 = y + 2 * (y1 - y) / 3;

        reducedPathData.push({type: 'C', values: [cx1, cy1, cx2, cy2, x, y]});

        lastControlX = x1;
        lastControlY = y1;

        currentX = x;
        currentY = y;
        break;

      case 'A':
        var r1 = seg.values[0];
        var r2 = seg.values[1];
        var angle = seg.values[2];
        var largeArcFlag = seg.values[3];
        var sweepFlag = seg.values[4];
        var x = seg.values[5];
        var y = seg.values[6];

        if (r1 === 0 || r2 === 0) {
          reducedPathData.push({type: 'C', values: [currentX, currentY, x, y, x, y]});

          currentX = x;
          currentY = y;
        }
        else {
          if (currentX !== x || currentY !== y) {
            var curves = this.arcToCubicCurves(currentX, currentY, x, y, r1, r2, angle, largeArcFlag, sweepFlag);

            curves.forEach(function(curve) {
              reducedPathData.push({type: 'C', values: curve});

              currentX = x;
              currentY = y;
            });
          }
        }
        break;

      case 'Z':
        reducedPathData.push(seg);

        currentX = subpathX;
        currentY = subpathY;
        break;
    }
    lastType = seg.type;

  }, this);

  return reducedPathData;
};


/**
 * Parse path data string.
 * @param {string} string Path data string.
 * @return {Array}
 */
anychart.core.utils.GeoSVGParser.prototype.parsePathDataString = function(string) {
  if (!string || string.length === 0) return [];

  var source = new anychart.core.utils.SVGPathDataParser(string);
  var pathData = [];

  if (source.initialCommandIsMoveTo()) {
    while (source.hasMoreData()) {
      var pathSeg = source.parseSegment();

      if (pathSeg === null) {
        break;
      } else {
        pathData.push(pathSeg);
      }
    }
  }

  return pathData;
};


/**
 * Returns parsed path data.
 * @param {Element} node
 * @return {Array.<*>}
 */
anychart.core.utils.GeoSVGParser.prototype.getPathData = function(node) {
  var pathData = this.parsePathDataString(node.getAttribute('d') || '');

  return this.reducePathData(this.absolutizePathData(pathData));
};
