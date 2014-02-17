goog.provide('anychart.data');

goog.require('anychart.data.ConcatView');
goog.require('anychart.data.FilterView');
goog.require('anychart.data.OrdinalView');
goog.require('anychart.data.PieView');
goog.require('anychart.data.ScatterView');
goog.require('anychart.data.Set');
goog.require('anychart.data.SortView');

/**
 Набор классов для работы с данными.<br/>
 Данные могут быть:
 <ul>
  <li>Линейными ({@link anychart.data.Set})</li>
  <li>Древовидными ({@link anychart.data.Tree})</li>
  <li>Табличными ({@link anychart.data.Table})</li>
 </ul>
 С помощью маппинга из этих данных формируется представление ({@link anychart.data.View}), работать с которыми
 можно через итератор ({@link anychart.data.Iterator}).
 @namespace
 @name anychart.data
 */
