var legend, listener, stage, rb, rect;

function load() {
  var items = [
    'Series 1', 'Series 2', 'Series 3', 'Series 4', 'Series 5',
    'Series 6', 'Series 7', 'Series 8', 'Series 9', 'Series 10',
    'Series 11', 'Series 12', 'Series 13', 'Series 14', 'Series 15',
    'Series 16', 'Series 17', 'Series 18', 'Series 19', 'Series 20',
    'Series 21', 'Series 22', 'Series 23', 'Series 24', 'Series 25'
  ];

  legend = new anychart.elements.Legend();
  legend.container('container');
  legend.parentBounds(new anychart.math.Rect(50, 50, 900, 500));
  legend.width(300);
  legend.itemsProvider([
    1,
    {index: 1, iconColor: 'red', text: 'Series 2'},
    {index: 2, iconColor: 'red', text: 'Series 3'},
    {index: 3, text: 'Series 4'},
    {index: 4, text: 'Series 5'},
    {name: 'chidori', iconColor: 'black'},
    {index: 7},
    {index: 8}
  ]);
  // another example of itemsProvider
  //legend.itemsProvider(items);
  //legend.itemsProvider('legend items');
  //legend.itemsProvider([undefined, {}, null, 'qwer']);
  //legend.itemsProvider([1, 2, 3, 4, 5]);
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
