var verticalScroll, horizontalScroll, prettyScroll;
var rect1, rect2, rect3, rect4;

anychart.onDocumentReady(function() {
  var stage = acgraph.create('container', '100%', '100%');


  //Setting a bounds.
  var rect1Bounds = new acgraph.math.Rect(30, 10, 200, 200);
  var rect2Bounds = new acgraph.math.Rect(50, 50, 30, 20);

  rect1 = stage.rect().fill('#faa').stroke('#f44').setBounds(rect1Bounds);
  rect2 = stage.rect().fill('#5555ff').stroke('#0000ff').setBounds(rect2Bounds);


  //Initializing a scrolls.
  verticalScroll = new anychart.core.ui.ScrollBar();
  verticalScroll
      .container(stage)
      .bounds(10, 20, 15, 180)
      .buttonsVisible(true)
      .contentBounds(rect1Bounds)
      .visibleBounds(rect2Bounds);

  verticalScroll.draw();

  verticalScroll.listen('signal', verticalScroll.draw, false, verticalScroll);


  horizontalScroll = new anychart.core.ui.ScrollBar();
  horizontalScroll
      .container(stage)
      .bounds(40, 215, 180, 15)
      .layout('horizontal')
      .buttonsVisible(true)
      .contentBounds(rect1Bounds)
      .visibleBounds(rect2Bounds);

  horizontalScroll.draw();

  horizontalScroll.listen('signal', horizontalScroll.draw, false, horizontalScroll);


  prettyScroll = new anychart.core.ui.ScrollBar();
  prettyScroll
      .container(stage)
      .parentBounds(40, 250, 180, 5)
      .layout('horizontal')
      .contentBounds(rect1Bounds)
      .visibleBounds(rect2Bounds)
      .mouseOutOpacity(.05)
      .mouseOverOpacity(.3);

  prettyScroll.draw();
  prettyScroll.listen('signal', prettyScroll.draw, false, prettyScroll);


  //Setting a second demo block (ratio controlled).
  var vStartRatio = verticalScroll.startRatio();
  var vEndRatio = verticalScroll.endRatio();

  var hStartRatio = horizontalScroll.startRatio();
  var hEndRatio = horizontalScroll.endRatio();

  var rect3Bounds = new acgraph.math.Rect(280, 10, 450, 300);
  var rect4Bounds = new acgraph.math.Rect(
      (rect3Bounds.left + hStartRatio * rect3Bounds.width),
      (rect3Bounds.top + vStartRatio * rect3Bounds.height),
      ((hEndRatio - hStartRatio) * rect3Bounds.width),
      ((vEndRatio - vStartRatio) * rect3Bounds.height));

  rect3 = stage.rect().fill('#ffc').stroke('#ff0').setBounds(rect3Bounds);
  rect4 = stage.rect().fill('#55ff55').stroke('#0f0').setBounds(rect4Bounds);


  //Adding a scroll change events.
  verticalScroll.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
    rect2.setBounds(e.visibleBounds);

    //Notifying the horizontal scroll bar about changed visual bounds for sync purposes.
    horizontalScroll.visibleBounds(e.visibleBounds);

    var startRatio = e.startRatio;
    var endRatio = e.endRatio;

    var newBounds = new acgraph.math.Rect(
        rect4Bounds.left,
        (rect3Bounds.top + startRatio * rect3Bounds.height),
        rect4Bounds.width,
        ((endRatio - startRatio) * rect3Bounds.height));

    rect4Bounds = newBounds; //For sync purposes.
    rect4.setBounds(newBounds);

  });


  horizontalScroll.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
    rect2.setBounds(e.visibleBounds);

    //Notifying the vertical scroll bar about changed visual bounds for sync purposes.
    verticalScroll.visibleBounds(e.visibleBounds);
    prettyScroll.visibleBounds(e.visibleBounds);

    var startRatio = e.startRatio;
    var endRatio = e.endRatio;

    var newBounds = new acgraph.math.Rect(
        (rect3Bounds.left + startRatio * rect3Bounds.width),
        rect4Bounds.top,
        ((endRatio - startRatio) * rect3Bounds.width),
        rect4Bounds.height);

    rect4Bounds = newBounds; //For sync purposes.
    rect4.setBounds(newBounds);
  });


  prettyScroll.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
    rect2.setBounds(e.visibleBounds);

    //Notifying the vertical scroll bar about changed visual bounds for sync purposes.
    verticalScroll.visibleBounds(e.visibleBounds);

    var startRatio = e.startRatio;
    var endRatio = e.endRatio;

    var newBounds = new acgraph.math.Rect(
        (rect3Bounds.left + startRatio * rect3Bounds.width),
        rect4Bounds.top,
        ((endRatio - startRatio) * rect3Bounds.width),
        rect4Bounds.height);

    rect4Bounds = newBounds; //For sync purposes.
    rect4.setBounds(newBounds);
  });

});

function hideScrollButtons() {
  verticalScroll.buttonsVisible(false);
  horizontalScroll.buttonsVisible(false);
}

function enlargeHorizontalScroll() {
  horizontalScroll.bounds(40, 215, 180, 150);
}
