var title1, title2, title3;

anychart.onDocumentReady(function() {
  var defaultTheme = anychart.getFullTheme()['standalones']['title'];

  title1 = new anychart.core.ui.Title();
  title1.listenSignals(function(e) {
    this.draw();
  }, title1);

  title1.setThemeSettings(defaultTheme);

  title2 = new anychart.core.ui.Title();
  title2.listenSignals(function(e) {
    this.draw();
  }, title2);
  title2.parent(title1);

  title3 = new anychart.core.ui.Title();
  title3.listenSignals(function(e) {
    this.draw();
  }, title3);
  title3.parent(title2);

  stage = anychart.graphics.create('container');
  var stageBounds = stage.getBounds();
  var rootLayer = stage.layer();

  title1.container(rootLayer);
  title2.container(rootLayer);
  title3.container(rootLayer);

  title1.parentBounds(stageBounds);
  title2.parentBounds(stageBounds);
  title3.parentBounds(stageBounds);


  title1.draw();
  title2.draw();
  title3.draw();

  ////////////////////////////////////////////////////////////////////////////
  title1.text('The most long title ever seen. Title1.');
  title2.text('A bit shorter title. Title2.');
  title3.text('Short title.  Title3.');

  title2.align('left'); //title2 and title3 align to left

  title3.align('right'); //title3 aligns to right

  title1.background('yellow'); //All titles get yellow BG.

  debugger;

  title2.padding(10);//title2 and title3 get padding {10, 10, 10, 10}
  title2.margin(20);//title2 and title3 get padding {10, 10, 10, 10}

  title3.padding(5, 0);
  title3.background().stroke('red');
  ////////////////////////////////////////////////////////////////////////////
});

