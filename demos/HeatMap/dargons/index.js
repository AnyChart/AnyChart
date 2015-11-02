var chart, dataSet, colorScale, chart1;

anychart.onDocumentReady(function () {
  chart = anychart.heatMap([
    {x: 0, y: 1, heat: 'Сказочный дракон'},
    {x: 1, y: 1, heat: 'Ржавый дракон'},
    {x: 2, y: 1, heat: 'Кристальный дракон'},
    {x: 3, y: 1, heat: 'Лазурный дракон'},
    {x: 4, y: 1, heat: 'Красный дракон'},
    {x: 5, y: 1, heat: 'Черный дракон'}
  ]);

  colorScale = anychart.scales.ordinalColor();
  colorScale.ranges([
    {equal: 'Сказочный дракон', color: {mode: acgraph.vector.ImageFillMode.FIT, src: "http://cdn.forum.worldofwarships.ru/wows/ru//profile/66/77/70/photo-12707766-54e82bc0.gif?_r=1424501700"}},
    {equal: 'Ржавый дракон', color: {mode: acgraph.vector.ImageFillMode.FIT, src: "http://dreamworlds.ru/uploads/posts/2010-09/1283314190_rust_dragon_by_bonefletcher.jpg"}},
    {equal: 'Кристальный дракон', color: {mode: acgraph.vector.ImageFillMode.FIT, src: "http://img2.wikia.nocookie.net/__cb20140818113918/allspecies/images/9/96/Crystal_Dragon_(Heroes_III).png"}},
    {equal: 'Лазурный дракон', color: {mode: acgraph.vector.ImageFillMode.FIT, src: "http://heroesland.ucoz.ru/_ph/12/2/785985116.gif"}},
    {equal: 'Красный дракон', color: {mode: acgraph.vector.ImageFillMode.FIT, src: "http://oi27.tinypic.com/20z20kz.jpg"}},
    {equal: 'Черный дракон', color: {mode: acgraph.vector.ImageFillMode.FIT, src: "http://www.might-and-magic.ru/uploads/monthly_01_2014/blogentry-72-0-09019100-1388944883.gif"}}
  ]);

  //colorScale.colors([
  //  {mode: acgraph.vector.ImageFillMode.FIT, src: "http://cdn.forum.worldofwarships.ru/wows/ru//profile/66/77/70/photo-12707766-54e82bc0.gif?_r=1424501700"},
  //  {mode: acgraph.vector.ImageFillMode.FIT, src: "http://dreamworlds.ru/uploads/posts/2010-09/1283314190_rust_dragon_by_bonefletcher.jpg"},
  //  {mode: acgraph.vector.ImageFillMode.FIT, src: "http://img2.wikia.nocookie.net/__cb20140818113918/allspecies/images/9/96/Crystal_Dragon_(Heroes_III).png"},
  //  {mode: acgraph.vector.ImageFillMode.FIT, src: "http://heroesland.ucoz.ru/_ph/12/2/785985116.gif"},
  //  {mode: acgraph.vector.ImageFillMode.FIT, src: "http://oi27.tinypic.com/20z20kz.jpg"},
  //  {mode: acgraph.vector.ImageFillMode.FIT, src: "http://www.might-and-magic.ru/uploads/monthly_01_2014/blogentry-72-0-09019100-1388944883.gif"}
  //]);


  chart.colorScale(colorScale);

  chart.interactivity().selectionMode(false);

  chart.title('Heroes III Dragons');

  chart.legend()
      .align('top')
      .position('right')
      .itemsLayout('v')
      .enabled(true);

  chart.yAxis(false);

  chart.xAxis()
      .title('Dragon class names');

  chart.xAxis().labels().textFormatter(function () {
    var iterator = chart.data().getIterator();
    iterator.select(this['tickValue']);
    return iterator.get('heat');
  });
  chart.container('container').draw();
});