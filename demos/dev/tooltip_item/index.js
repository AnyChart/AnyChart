var tooltipItem;

function load() {
  tooltipItem = new anychart.elements.TooltipItem();
  tooltipItem.container('container');
  tooltipItem.anchor('lefttop');
  tooltipItem.offsetX(20);
  tooltipItem.offsetY(20);
  tooltipItem.draw();
  tooltipItem.listen('signal', function(event) {
    tooltipItem.draw();
  });
}

function hide() {
  tooltipItem.visible(false);
}
function show() {
  tooltipItem.visible(true);
}

function enable() {
  tooltipItem.enabled(true);
}
function disable() {
  tooltipItem.enabled(false);
}

