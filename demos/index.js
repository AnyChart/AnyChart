

var darkAccentColor = '#545f69';
var compass_data = [0, 45, 90, 135, 180, 225, 270, 315];
function NeedleFill(needle) {
  var angle = compass_data[needle.dataIndex()];
  if (angle == 0) angle = angle - 180;
  if (angle == 45) angle = angle - 270;
  if (angle == 135) angle = angle - 90;
  if (angle == 180) angle = angle - 180;
  if (angle == 225) angle = angle - 270;
  if (angle == 315) angle = angle - 90;
  return {keys: ['0.49 ' + darkAccentColor ,'0.5 #4C565E', '0.51 white'], angle: angle}
}

var makeNeedle = function(needle, size){
  if (size == 'big') var endRadius = 87;
  else endRadius = 45;
  needle.fill(null)
      .stroke('1 ' + darkAccentColor)
      .fill(NeedleFill(needle))
      .startRadius(0)
      .middleRadius(25)
      .endRadius(endRadius)
      .startWidth(0)
      .middleWidth(10.32)
      .endWidth(0);
};

anychart.onDocumentReady(function() {
  gauge = anychart.circularGauge();
  gauge
      .fill('white')
      .padding(0)
      .margin(50)
      .stroke(null);
  gauge.data(compass_data);
  gauge.axis().scale()
      .minimum(0)
      .maximum(360)
      .ticks({interval: 90})
      .minorTicks({interval: 45});
  gauge.axis()
      .startAngle(0)
      .fill(null)
      .width(2)
      .radius(100)
      .sweepAngle(360);
  gauge.axis().ticks(null);
  gauge.axis().labels()
      .fontSize(20)
      .position('in')
      .textFormatter(function () {
        if (this.value == 0) return 'N';
        if (this.value == 90) return 'E';
        if (this.value == 180) return 'S';
        if (this.value == 270) return 'W';
        else return this.value;
      });

  gauge.axis(1)
      .startAngle(0)
      .fill(null)
      .width(1)
      .radius(50)
      .sweepAngle(360);
  gauge.axis(1).scale()
      .minimum(0)
      .maximum(360)
      .ticks({interval: 45})
      .minorTicks({interval: 15});
  gauge.axis(1).ticks(null);
  gauge.axis(1).minorTicks()
      .enabled(true)
      .length(20)
      .stroke('2 ' + darkAccentColor)
      .position('out')
      .type(function (path, x, y, radius) {
        path.moveTo(x, y - radius / 2).lineTo(x, y + radius / 2).close();
        return path;
      });
  gauge.axis(1).labels()
      .fontSize(20)
      .padding(2)
      .position('out')
      .textFormatter(function () {
        if (this.value == 0 || this.value == 90 || this.value == 180 || this.value == 270) return '';
        if (this.value == 45) return 'ne';
        if (this.value == 135) return 'se';
        if (this.value == 225) return 'sw';
        if (this.value == 315) return 'nw';
        else return this.value;
      });
  makeNeedle(gauge.needle(), 'big');
  makeNeedle(gauge.needle(1), 'small');
  makeNeedle(gauge.needle(2), 'big');
  makeNeedle(gauge.needle(3), 'small');
  makeNeedle(gauge.needle(4), 'big');
  makeNeedle(gauge.needle(5), 'small');
  makeNeedle(gauge.needle(6), 'big');
  makeNeedle(gauge.needle(7), 'small');
  gauge.cap()
      .radius('10%')
      .fill('white')
      .stroke('5 ' + darkAccentColor);

  gauge.container('container');
  gauge.draw();
});

