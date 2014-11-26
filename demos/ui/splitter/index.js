var split;

anychart.onDocumentReady(function() {
  var stage = acgraph.create('container', '100%', '100%');

  var r1 = stage.rect().fill({
    'keys': ['0 #FCC2D1', '0.5 #FAD7E0', '1 #FAF0F8'],
    'angle': -90,
    'opacity': 1
  }).stroke('3px red');

  var r2 = stage.rect().fill({
    'keys': ['0 #AFFABD', '0.5 #CDFAD5', '1 #E1FCE6'],
    'angle': -90,
    'opacity': 1
  }).stroke('3px red');

  split = new anychart.core.ui.Splitter();
  split.container(stage)
      .bounds(20, 20, 400, 300)
      .layout('vertical')
      .position('30%')
      .dragAreaLength(5)
      .dragPreviewFill('black 0.6')
      .stroke('1px #000000 1')
      .fill({
        'keys': ['0 #9ccae3', '0.5 #a9dbf6', '1 #e3f4fc'],
        'angle': -90,
        'opacity': .5
      })
      .splitterWidth(15)
      .leftLimitSize(10)
      .rightLimitSize(10)
      .considerSplitterWidth(true);
  split.draw();

  r1.setBounds(split.getLeftBounds());
  r2.setBounds(split.getRightBounds());


  //split.listenSignals(drawer, split); //TODO Not exported
//  split.listen('signal', split.draw, false, split);


  split.listen(anychart.enums.EventType.SPLITTER_CHANGE, function() {
    var b1 = split.getLeftBounds();
    var b2 = split.getRightBounds();
    r1.setBounds(b1);
    r2.setBounds(b2);

    console.log(b1);
    console.log(b2);

    console.log('Position = ' + split.position());
    console.log('');
  });

});

