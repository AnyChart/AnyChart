var chart, series;
anychart.onDocumentReady(function() {
  var stage = anychart.graphics.create('container', 700, 500);
  chart = anychart.column();
  series = chart.column([2, -4, -3, 6]).labels(true);
  series
    .labels()
    .textFormatter('{%Value}');
  chart
    .legend(false)
    .tooltip(false)
    .container(stage)
    .draw();

  /*var format = '{%Value}{scale:(1000)(1000)(1000)(1000)(1000)|(k)(m)(b)}';
  var provider = {
    getTokenValue: function(name) {
      return -123;
    },
    getTokenType: function(name) {
      return 'number';
    }
  };
  var terms = anychart.core.utils.TokenParser.parse(format);
  var results = terms.map(function(term) {
    return term(provider);
  });
  console.log(results.join(''));*/
});
function apply() {
  var format = document.querySelector('#format').value;
  series
    .labels()
    .textFormatter(format);
}