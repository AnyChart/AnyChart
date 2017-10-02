/**
 * @fileoverview anychart.animations namespace file.
 * @suppress {extraRequire}
 */
goog.provide('anychart.animations');
goog.require('anychart.animations.AnimationParallelQueue');
goog.require('anychart.animations.BubbleAnimation');
goog.require('anychart.animations.ClipAnimation');
goog.require('anychart.animations.ColumnAnimation');


/**
 * Animation type by series type dict.
 * @type {Object.<string, Function>}
 */
anychart.animations.AnimationBySeriesType = {};

anychart.animations.AnimationBySeriesType['bar'] = anychart.animations.ColumnAnimation;
anychart.animations.AnimationBySeriesType['bubble'] = anychart.animations.BubbleAnimation;
anychart.animations.AnimationBySeriesType['area'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['line'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['range-area'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['range-spline-area'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['range-step-area'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['spline'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['spline-area'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['step-area'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['step-line'] = anychart.animations.ClipAnimation;
anychart.animations.AnimationBySeriesType['column'] = anychart.animations.ColumnAnimation;
anychart.animations.AnimationBySeriesType['jump-line'] = anychart.animations.ColumnAnimation;
anychart.animations.AnimationBySeriesType['stick'] = anychart.animations.ColumnAnimation;
anychart.animations.AnimationBySeriesType['mekko'] = anychart.animations.ColumnAnimation;
//anychart.animations.AnimationBySeriesType['box'] =
//anychart.animations.AnimationBySeriesType['candlestick'] =
//anychart.animations.AnimationBySeriesType['marker'] =
//anychart.animations.AnimationBySeriesType['ohlc'] =
//anychart.animations.AnimationBySeriesType['range-bar'] =
//anychart.animations.AnimationBySeriesType['range-column'] =
