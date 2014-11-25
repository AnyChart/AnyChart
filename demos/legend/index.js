var legend, listener, stage, rb, rect, items;

function load() {
  /*
   var stage = acgraph.create('container', 400, 300);
   var rects = [
   stage.rect(10, 10, 200, 140),
   //    stage.rect(210, 10, 175, 140),
   //    stage.rect(10, 150, 200, 140),
   //    stage.rect(210, 150, 175, 140)
   ];
   var title = new anychart.core.ui.Title();
   title.text('My title for legend')
   .fontSize(10)
   .margin(10)
   .height(40)
   .width(95)
   .background().enabled(true).fill('red .1');
   console.log(title.getContentBounds());

   var orientations = ['top', 'top', 'right', 'bottom'];
   for (rect in rects) {
   var legend = new anychart.core.ui.Legend();
   legend.itemsProvider([
   {'text': 'Item 1', iconFill: 'red .3'},
   {'text': 'Item 2', iconFill: 'red .3'},
   {'text': 'Item 3', iconFill: 'red .3'}
   //      {'text': 'Item 4', iconFill: 'red .3'}
   ]);
   legend.title(title);
   legend.title().text(legend.title().text() + orientations[rect]);
   //console.log(legend.title().getContentBounds());
   legend.title().orientation(orientations[rect]);
   if (rect % 2 == 0) {
   legend.itemsLayout('vertical');
   }
   legend.parentBounds(rects[rect].getBounds());
   legend.container(stage).draw();
   }
   */
  items = [
    'Series 1', 'Series 2', 'Series 3', 'Series 4', 'Series 5',
    'Series 6', 'Series 7', 'Series 8', 'Series 9', 'Series 10',
    'Series 11', 'Series 12', 'Series 13', 'Series 14', 'Series 15',
    'Series 16', 'Series 17', 'Series 18', 'Series 19', 'Series 20',
    'Series 21', 'Series 22', 'Series 23', 'Series 24', 'Series 25'
  ];

  legend = new anychart.core.ui.Legend();
  legend.container('container');
  //legend.width(500);
  legend.itemsProvider([
    {text: 'line', iconType: 'column', iconStroke: 'pink', iconFill: 'red'},
    {text: 'spline', iconType: 'spline', iconStroke: 'black', iconFill: 'none', iconMarker: 'circle'},
    {text: 'ohlc', iconType: 'ohlc', iconStroke: 'black'},
    {text: 'candlestick', iconType: 'candlestick', iconStroke: 'pink', iconFill: 'pink'},
    {text: 'chidori', iconFill: 'black', meta: {
      'name': 'Anton Kagakin',
      'profession': 'developer',
      'employer': 'anychart.com'
    }}
  ]);
  legend.tooltip().contentFormatter(function() {
    var meta = this['meta'];
    if (this['text'] == 'chidori') {
      return this['text'] + ' a.k.a ' + meta['name'] + '<br>' + meta['profession'] + ' @ ' + meta['employer'];
    } else {
      return this['text'];
    }
  });
  legend.parentBounds(stage.getBounds());
  legend.draw();

  stage = legend.container().getStage();
  rect = stage.rect().fill('red .5').stroke('none');

  listener = function(event) {
    legend.draw();
    rb = legend.getRemainingBounds();
    rb = new acgraph.math.Rect(rb.left, rb.top, rb.width, rb.height);
    rect.setBounds(rb);
  };
  legend.listen('signal', listener, false);
  legend.listen('legendItemClick', function(event) {
    alert('the world is mine!');
  }, false);


  rb = legend.getRemainingBounds();
  rb = new acgraph.math.Rect(rb.left, rb.top, rb.width, rb.height);
  rect.setBounds(rb);
}

function pos(value) {
  legend.position(value);
}

function ali(value) {
  legend.align(value);
}

function lay(value) {
  legend.itemsLayout(value);
}
