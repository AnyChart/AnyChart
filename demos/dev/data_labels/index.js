var chart1, chart2, chart3;

function load() {
  var stage = acgraph.create('100%', '100%', 'container');

  chart1 = new anychart.cartesian.Chart();
  chart1.container(stage);
  chart1.bounds().width(500).height(300);
  chart1.title().text('Labels set on series level');
  chart1.bar()
      .data([1, 2, 3, 15, 6])
      .labels();
  chart1.draw();

  chart2 = new anychart.cartesian.Chart();
  chart2.container(stage);
  chart2.bounds().width(500).height(300).left(600);
  chart2.title().text('Labels set on points level');
  chart2.bar().data([1, 2, 3, 15, 6]);
  chart2.draw();

  chart3 = new anychart.cartesian.Chart();
  chart3.container(stage);
  chart3.bounds().width(500).height(300).left(300).top(330);
  chart3.title().text('Labels set on series level and override on points level');
  chart3.bar().data([1, 2, 3, 15, 6]);
  chart3.draw();

}
