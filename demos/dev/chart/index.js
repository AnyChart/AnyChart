var chart;
function load() {
  chart = new anychart.Chart();
  chart.container('container');
  chart.title().background().fill('red .5');
  chart.background().fill('red .5');
  chart.legend().enabled(true);
  chart.draw();

  var title = new anychart.elements.Title();
  title.text('New Chart title');
  title.background().fill('blue .5');

  var background = new anychart.elements.Background();
  background.fill('green .5');

  chart.title(title);
  chart.background(background);
}
