var stage, chart;

var dataSet = [
  ['Nail polish', 6814, 3054, 4376, 4229],
  ['Eyebrow pencil', 7012, 5067, 8987, 3932],
  ['Pomade', 8814, 9054, 4376, 9256]
];

var d = {
  'f': {state: 'Florida', number: 1},
  't': {state: 'Texas', number: 2},
  'a': {state: 'Arizona', number: 3},
  'n': {state: 'Nevada', number: 4}
};

var generateData = function(id) {
  var auChoroplethData = [];

  for (var i = 1, len = 4; i < len; i++) {
    var row = dataSet[i - 1];
    var category = row[0];
    var info = d[id];
    var value = row[info.number];
    var state = info.state;
    auChoroplethData.push({'id': id + i, 'value': value, 'category': category, 'state': state});
  }
  return auChoroplethData;
};

$(document).ready(function() {
  var tooltipTextFormatter = function() {
    return this.getDataValue('state') + ': $' + this.value;
  };

  var tooltipTitleFormatter = function() {
    return this.getDataValue('category');
  };

  var theme = anychart.getFullTheme();
  theme['map']['defaultSeriesSettings']['base']['fill'] = theme['chart']['defaultSeriesSettings']['barLike']['fill'];
  theme['map']['defaultSeriesSettings']['base']['hoverFill'] = theme['chart']['defaultSeriesSettings']['barLike']['hoverFill'];
  theme['map']['defaultSeriesSettings']['base']['selectFill'] = theme['chart']['defaultSeriesSettings']['base']['selectFill'];
  theme['map']['defaultSeriesSettings']['base']['stroke'] = theme['chart']['defaultSeriesSettings']['base']['stroke'];
  theme['map']['defaultSeriesSettings']['base']['hoverStroke'] = theme['chart']['defaultSeriesSettings']['base']['hoverStroke'];
  theme['map']['defaultSeriesSettings']['base']['selectStroke'] = theme['chart']['defaultSeriesSettings']['base']['selectStroke'];
  theme['map']['defaultSeriesSettings']['base']['tooltip']['textFormatter'] = tooltipTextFormatter;
  theme['map']['defaultSeriesSettings']['base']['tooltip']['titleFormatter'] = tooltipTitleFormatter;
  anychart.theme(theme);

  stage = anychart.graphics.create('container');

  $.ajax({
    type: 'GET',
    url: 'column.svg',
    success: function(data) {
      chart = anychart.map();
      chart.geoData(data);
      chart.interactivity().zoomOnMouseWheel(true);
      chart.unboundRegions('asis');

      chart.choropleth(generateData('f'));
      chart.choropleth(generateData('t'));
      chart.choropleth(generateData('a'));
      chart.choropleth(generateData('n'));

      chart.container(stage).draw();
    }
  });
});
