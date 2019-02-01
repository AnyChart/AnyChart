goog.provide('anychart.core.SeriesSettings');

goog.require('anychart.core.Base');


/**
 * Series theme settings getter class.
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.SeriesSettings = function() {
  anychart.core.SeriesSettings.base(this, 'constructor');

  this.themeDependencies_ = [
    {
      seriesType: ['area', 'splineArea', 'stepArea', 'rangeArea', 'rangeSplineArea', 'rangeStepArea', 'polygon'],
      theme: 'areaLike'
    },
    {
      seriesType: ['bar', 'column', 'box', 'rangeBar', 'rangeColumn', 'candlestick', 'waterfall'],
      theme: 'barLike'
    },
    {
      seriesType: ['hilo', 'line', 'spline', 'stepLine', 'jumpLine', 'ohlc', 'stick', 'polyline'],
      theme: 'lineLike'
    },
    {
      seriesType: ['rangeBar', 'rangeColumn', 'rangeArea', 'rangeSplineArea', 'rangeStepArea', 'hilo'],
      theme: 'rangeLike'
    }
  ];

  this.themesCache_ = {};
};
goog.inherits(anychart.core.SeriesSettings, anychart.core.Base);


/**
 * Returns theme path for series type.
 *
 * @param {string} seriesType
 * @param {boolean} isMode3d
 * @return {Array.<string>}
 */
anychart.core.Base.prototype.getThemesForType = function(seriesType, isMode3d) {
  if (!goog.isDef(this.themesCache_[seriesType])) {
    seriesType = anychart.utils.toCamelCase(seriesType);

    var baseThemePaths = this.getThemes();
    this.themesCache_[seriesType] = this.createExtendedThemes(baseThemePaths, 'base');
    if (!isMode3d) {
      for (var i = 0; i < this.themeDependencies_.length; i++) {
        var types = this.themeDependencies_[i].seriesType;
        if (goog.array.indexOf(types, seriesType) != -1)
          this.themesCache_[seriesType] = goog.array.concat(this.themesCache_[seriesType], this.createExtendedThemes(baseThemePaths, this.themeDependencies_[i].theme));
      }
    }

    this.themesCache_[seriesType] = goog.array.concat(this.themesCache_[seriesType], this.createExtendedThemes(baseThemePaths, seriesType));
  }
  return this.themesCache_[seriesType];
};