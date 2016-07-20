/**
 * @fileoverview base props for anychart namespace.
 */

goog.provide('anychart.base');


/**
 * Current version of the framework.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.3, 1.6]);
 * chart.title().text('Current version:' + anychart.VERSION);
 * @define {string} Replaced on compile time.
 */
anychart.VERSION = '';


/**
 * Defines if it is developer edition.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.3, 1.6]);
 * if (!anychart.DEVELOP){
 *   chart.title().text('It is production edition');
 * }else{
 *   chart.title().text('It is developer edition');
 * }
 * @define {boolean} Replaced on compile time.
 */
anychart.DEVELOP = true;


/**
 * Defines the default theme.
 * @define {string} Replaced on compile time.
 */
anychart.DEFAULT_THEME = 'defaultTheme';


/**
 *
 * @define {boolean} Replaced on compile time.
 */
anychart.PERFORMANCE_MONITORING = true;


/**
 * Set default css name mapping for anychart ui.
 */
goog.setCssNameMapping({
  'goog': 'anychart'
});


goog.exportSymbol('anychart.VERSION', anychart.VERSION);
goog.exportSymbol('anychart.DEVELOP', anychart.DEVELOP);
goog.exportSymbol('anychart.DEFAULT_THEME', anychart.DEFAULT_THEME);
goog.exportSymbol('anychart.PERFORMANCE_MONITORING', anychart.PERFORMANCE_MONITORING);
