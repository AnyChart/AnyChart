var tooltip, stage;

function load() {
  stage = acgraph.create('100%', '100%', 'container');

  tooltip = new anychart.elements.Tooltip();
  tooltip.hideDelay(0);
  tooltip.isFloating(true);
  tooltip.allowLeaveScreen(false);
  tooltip.listen('signal', function(event) {
    if (event.hasSignal(anychart.utils.Signal.NEEDS_REDRAW)) {
      tooltip.redraw();
    } else if (event.hasSignal(anychart.utils.Signal.BOUNDS_CHANGED)) {
      //need reposition, there is only one way to to this - call show
      //so u need store position passed to tooltip depend on isFloating
    }
  });

  //points what have tooltip
  var point1 = stage.rect(10, 100, 100, 100).fill('blue .5');
  var point2 = stage.rect(450, 80, 100, 120).fill('blue .5');
  var point3 = stage.rect(890, 30, 100, 170).fill('blue .5');

  addListener(point1);
  addListener(point2);
  addListener(point3);

  function addListener(element) {
    acgraph.events.listen(element, acgraph.events.EventType.MOUSEOVER, function(evt) {
      moveTooltip(evt);
      acgraph.events.listen(element, acgraph.events.EventType.MOUSEOUT, onMouseOut, false, this);
      acgraph.events.listen(element, acgraph.events.EventType.MOUSEMOVE, onMouseMove, false, this);
    }, false, this);
  }

  function onMouseOut(evt) {
    acgraph.events.unlisten(evt.target, acgraph.events.EventType.MOUSEOUT, onMouseOut, false, this);
    acgraph.events.unlisten(evt.target, acgraph.events.EventType.MOUSEMOVE, onMouseMove, false, this);
    tooltip.hide();
  }

  function onMouseMove(evt) {
    moveTooltip(evt);
  }

  function moveTooltip(evt) {
    var point = /** @type {acgraph.vector.Element} */ (evt.target);
    var bounds = point.getBounds();
    var infoObject = {
      titleText: 'Rect id: ' + point.id(),
      contentText: 'x: ' + bounds.left + '\n' +
          'y: ' + bounds.left + '\n' +
          'width: ' + bounds.width + '\n' +
          'height: ' + bounds.height + '\n'
    };

    if (tooltip.isFloating()) {
      tooltip.show(infoObject, {x: evt.clientX, y: evt.clientY});
    } else {
      //calculate your custom position depend on your entry
      var position = point.getAbsoluteCoordinate();
      //do not forget to translate in global coordinate system
      var containerPosition = goog.style.getPosition(stage.container());
      position.x += containerPosition.x;
      position.y += containerPosition.y;

      tooltip.show(infoObject, {x: position.x, y: position.y});
    }

  }
}


