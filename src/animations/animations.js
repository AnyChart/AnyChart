/**
 * @fileoverview anychart.animations namespace file.
 * @suppress {extraRequire}
 */
goog.provide('anychart.animations');
goog.require('anychart.animations.AnimationParallelQueue');
goog.require('anychart.animations.BarAnimation');
goog.require('anychart.animations.BubbleAnimation');
goog.require('anychart.animations.ClipAnimation');
goog.require('anychart.animations.ColumnAnimation');


/**
 * Animation type by series type dict.
 * @type {Object.<string, Function>}
 */
anychart.animations.AnimationBySeriesType = {};

anychart.animations.AnimationBySeriesType['bar'] = anychart.animations.BarAnimation;
anychart.animations.AnimationBySeriesType['bubble'] = anychart.animations.BubbleAnimation;
anychart.animations.AnimationBySeriesType['area'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['line'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['rangearea'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['rangesplinearea'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['rangesteparea'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['spline'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['splinearea'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['steparea'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['stepline'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['column'] = anychart.animations.ColumnAnimation;
//anychart.animations.AnimationBySeriesType['box'] =
//anychart.animations.AnimationBySeriesType['candlestick'] =
//anychart.animations.AnimationBySeriesType['marker'] =
//anychart.animations.AnimationBySeriesType['ohlc'] =
//anychart.animations.AnimationBySeriesType['rangeBar'] =
//anychart.animations.AnimationBySeriesType['rangeColumn'] =
