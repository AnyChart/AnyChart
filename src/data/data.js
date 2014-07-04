goog.provide('anychart.data');

goog.require('anychart.data.ConcatView');
goog.require('anychart.data.FilterView');
goog.require('anychart.data.OrdinalView');
goog.require('anychart.data.PieView');
goog.require('anychart.data.ScatterView');
goog.require('anychart.data.Set');
goog.require('anychart.data.SortView');
goog.require('anychart.data.csv.Parser');

/**
 Classes for handling data structures/sources<br/>
 The following data types/hierarchy is supported:
 <ul>
  <li>Linear ({@link anychart.data.Set})</li>
  <li>Tree ({@link anychart.data.Tree})</li>
  <li>Table ({@link anychart.data.Table})</li>
 </ul>
 You can map any of these data sets to ({@link anychart.data.View}), and then
 work with it using {@link anychart.data.Iterator} iterator.
 @namespace
 @name anychart.data
 */
