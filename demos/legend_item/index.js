/**
 * String is one of arguments.
 * @return {boolean} True if string one of arguments.
 */
String.prototype.oneOf = function() {
  var ret = false;
  var str = String(this);
  for (var i = 0, len = arguments.length; i < len; i++) {
    if (str === arguments[i]) return true;
  }
  return ret;
};
var legendItem;

function load() {
  var palette = new anychart.palettes.DistinctColors();
  var data = [
    'area',
    'bar',
    'bubble',
    'candlestick',
    'column',
    'line',
    'marker',
    'ohlc',
    'rangearea',
    'rangebar',
    'rangecolumn',
    'rangesplinearea',
    'rangesteparea',
    'spline',
    'splinearea',
    'stepline',
    'steparea'
  ];
  var li;
  var spacing = 10;
  var y = 50;
  var container;
  var stage;
  for (var i = 0, len = data.length; i < len; i++) {
    var color = palette.colorAt(i);
    var text = data[i];
    li = new anychart.core.ui.LegendItem();
    li.container(container ? container : 'container');

    if (!container) {
      container = li.container();
      stage = container.getStage();
      stage.rect().setBounds(stage.getBounds()).fill('#555').stroke('none');
    }

    li.text(text);
    li.iconType(text);
    li.iconFill(color);
    li.iconStroke('none');
    li.fontSize(15);
    li.fontFamily('Verdana');
    li.fontColor('#999');
    if (text.oneOf('line', 'spline', 'stepline', 'ohlc')) {
      li.iconFill('none');
      li.iconStroke(color);
    }
    if (text === 'candlestick') {
      li.iconFill(color);
      li.iconStroke(color);
    }
    li.x('50%');
    li.y(y);
    li.draw();
    y += li.getHeight() + spacing;
    li.listen('signal', function() {
      this.draw();
    }, false, li);
  }
  /*
  legendItem = new anychart.core.ui.LegendItem();
  legendItem.container('container');
  legendItem.fontSize(30);
  legendItem.x('50%');
  legendItem.y('50%');
  legendItem.draw();

  legendItem.listen(anychart.events.EventType.LEGEND_ITEM_CLICK, function(event) {
    console.log(event);
  });

  legendItem.listen(anychart.events.EventType.LEGEND_ITEM_DOUBLE_CLICK, function(event) {
    console.log(event);
  });

  legendItem.listen(anychart.events.EventType.LEGEND_ITEM_MOUSE_OVER, function(event) {
    console.log(event);
  });

  legendItem.listen(anychart.events.EventType.LEGEND_ITEM_MOUSE_OUT, function(event) {
    console.log(event);
  });

  legendItem.listen(anychart.events.EventType.LEGEND_ITEM_MOUSE_MOVE, function(event) {
    console.log(event);
  });

  legendItem.listenSignals(function() {
    this.draw();
  });
  */
}

/*
function retype(value, fill, stroke) {
  legendItem.iconType(value);
  legendItem.iconFill(fill);
  legendItem.iconStroke(stroke);
};
*/
