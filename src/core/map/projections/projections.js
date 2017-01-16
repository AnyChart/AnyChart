goog.provide('anychart.core.map.projections');

goog.require('anychart.core.map.projections.Aitoff');
goog.require('anychart.core.map.projections.August');
goog.require('anychart.core.map.projections.Base');
goog.require('anychart.core.map.projections.Bonne');
goog.require('anychart.core.map.projections.Eckert1');
goog.require('anychart.core.map.projections.Eckert3');
goog.require('anychart.core.map.projections.Equirectangular');
goog.require('anychart.core.map.projections.Fahey');
goog.require('anychart.core.map.projections.Hammer');
goog.require('anychart.core.map.projections.Mercator');
goog.require('anychart.core.map.projections.Orthographic');
goog.require('anychart.core.map.projections.Proj4Wrapper');
goog.require('anychart.core.map.projections.Robinson');
goog.require('anychart.core.map.projections.Wagner6');


/**
 @namespace
 @name anychart.core.map.projections
 */


/**
 * Test projection function.
 * @param {Function} value .
 * @return {boolean}
 */
anychart.core.map.projections.testProjection = function(value) {
  var execResult = value(0, 0);
  if (goog.isArray(execResult)) {
    var x = execResult[0];
    var y = execResult[1];

    if (!goog.isNumber(x) || isNaN(x) || !goog.isNumber(y) || isNaN(y)) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};


/**
 * @param {Object|Function|anychart.enums.MapProjections|string} projection Projection name or projection string representation or
 * projection function or object.
 * @return {anychart.core.map.projections.Base}
 */
anychart.core.map.projections.getProjection = function(projection) {
  var projection_;

  if (goog.isObject(projection)) {
    projection_ = new anychart.core.map.projections.Base();
    var forward = (goog.isFunction(projection['forward']) ? projection['forward'] : null) ||
        (goog.isFunction(projection) ? projection : null);
    var invert = goog.isFunction(projection['invert']) ? projection['invert'] : null;


    if (forward && anychart.core.map.projections.testProjection(forward)) {
      projection_.forward = function(x, y) {
        x = goog.math.toRadians(x);
        y = goog.math.toRadians(y);

        return forward(x, y);
      };

      if (invert && anychart.core.map.projections.testProjection(invert)) {
        projection_.invert = function(x, y) {
          var result = invert(x, -y);
          result[0] = goog.math.toDegrees(result[0]);
          result[1] = goog.math.toDegrees(result[1]);

          return result;
        };
      }
    }
    return projection_;
  }

  switch (projection) {
    case anychart.enums.MapProjections.BONNE:
      projection_ = new anychart.core.map.projections.Bonne();
      break;
    case anychart.enums.MapProjections.ECKERT1:
      projection_ = new anychart.core.map.projections.Eckert1();
      break;
    case anychart.enums.MapProjections.ECKERT3:
      projection_ = new anychart.core.map.projections.Eckert3();
      break;
    case anychart.enums.MapProjections.FAHEY:
      projection_ = new anychart.core.map.projections.Fahey();
      break;
    case anychart.enums.MapProjections.HAMMER:
      projection_ = new anychart.core.map.projections.Hammer();
      break;
    case anychart.enums.MapProjections.AITOFF:
      projection_ = new anychart.core.map.projections.Aitoff();
      break;
    case anychart.enums.MapProjections.MERCATOR:
      projection_ = new anychart.core.map.projections.Mercator();
      break;
    case anychart.enums.MapProjections.ORTHOGRAPHIC:
      projection_ = new anychart.core.map.projections.Orthographic();
      break;
    case anychart.enums.MapProjections.ROBINSON:
      projection_ = new anychart.core.map.projections.Robinson();
      break;
    case anychart.enums.MapProjections.WAGNER6:
      projection_ = new anychart.core.map.projections.Wagner6();
      break;
    case anychart.enums.MapProjections.WSG84:
      projection_ = new anychart.core.map.projections.Base();
      break;
    case anychart.enums.MapProjections.EQUIRECTANGULAR:
      projection_ = new anychart.core.map.projections.Equirectangular();
      break;
    case anychart.enums.MapProjections.AUGUST:
      projection_ = new anychart.core.map.projections.August();
      break;
    default:
      try {
        if (window['proj4']) {
          projection_ = new anychart.core.map.projections.Proj4Wrapper(/** @type {string} */(projection));
        } else {
          projection_ = new anychart.core.map.projections.Base();

          if (!anychart.compatibility.threwProj4Warn) {
            anychart.core.reporting.warning(anychart.enums.WarningCode.MISSING_PROJ4, null, null, true);
            anychart.compatibility.threwProj4Warn = true;
          }
        }
      } catch (e) {
        projection_ = new anychart.core.map.projections.Base();
      }
  }

  return /** @type {anychart.core.map.projections.Base} */(projection_);
};


/**
 * Check for base projection.
 * @param {string} projectionStr
 * @return {boolean}
 */
anychart.core.map.projections.isBaseProjection = function(projectionStr) {
  projectionStr = String(projectionStr).toLowerCase();
  switch (projectionStr) {
    case 'undefined':
    case 'null':
    case 'none':
    case anychart.enums.MapProjections.WSG84:
      return true;
    case anychart.enums.MapProjections.BONNE:
    case anychart.enums.MapProjections.ECKERT1:
    case anychart.enums.MapProjections.ECKERT3:
    case anychart.enums.MapProjections.FAHEY:
    case anychart.enums.MapProjections.HAMMER:
    case anychart.enums.MapProjections.AITOFF:
    case anychart.enums.MapProjections.MERCATOR:
    case anychart.enums.MapProjections.ORTHOGRAPHIC:
    case anychart.enums.MapProjections.ROBINSON:
    case anychart.enums.MapProjections.WAGNER6:
    case anychart.enums.MapProjections.EQUIRECTANGULAR:
    case anychart.enums.MapProjections.AUGUST:
      return false;
    default:
      return !window['proj4'];
  }
};
