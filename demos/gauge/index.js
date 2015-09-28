

var dataSet = anychart.data.set([0,0,0]);
var labelDate;

var colorAxisLines = '#CECECE';
var colorLightMinorAxisLines = '#F7F7F7';
var colorAxisFont = '#7c868e';
var darkAccentColor = '#545f69';
var darkAxisColor = '#B9B9B9';
var fontColor = '#212121';

var gauge;

anychart.onDocumentReady(function() {
  gauge = anychart.circularGauge();
  gauge.title('Analog Watch\nwith Anychart');
  gauge.title().fontSize(20).hAlign('center').padding(0,0,20,0);
  gauge
      .fill('#ffffff')
      .stroke('2 #B9B9B9')
      .padding(0)
      .margin(30)
      .startAngle(0)
      .sweepAngle(360);

  labelDate = gauge.label();
  labelDate
      .text(2)
      .fontColor('#64B5F6')
      .anchor('center')
      .zIndex(10)
      .offsetY('64%')
      .offsetX(90)
      .padding(3, 5)
      .width('12%')
      .height('7%')
      .hAlign('right')
      .adjustFontSize(true)
      .zIndex(10)
      .background({fill: '#fff', stroke: {thickness: 1, color: '#E0F0FD'}});

  var nameLabel = gauge.label(1);
  nameLabel.text('<span style="color: #D0E9FC">AnyChart</span><br>' +
  '<span style="color: #E0F0FD">TIME</span>').useHtml(true)
      .width('40%')
      .height('12%')
      .hAlign('center')
      .anchor('centerBottom')
      .adjustFontSize(true)
      .zIndex(10)
      .offsetY('15%');

  function getTime(){
    var now = new Date();
    var seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    var minutes = now.getMinutes() + seconds / 60;
    var hours = (now.getHours() % 12) + minutes / 60;
    labelDate.text(now.getUTCDate() + '/' + (now.getUTCMonth() + 1));
    return [Math.floor(hours), Math.floor(minutes), Math.floor(seconds)];
  }

  gauge.data(getTime());
  setInterval(function () {
    gauge.data(getTime());
  }, 1000);

  var hoursAxis = gauge.axis().fill(null).radius(103).width(1);
  hoursAxis.labels()
      .fontSize(20)
      .padding(5)
      .position('in')
      .anchor('center')
      .textFormatter(function () {
        if (this.value == 0) return 'XII';
        if (this.value == 1) return 'I';
        if (this.value == 2) return 'II';
        if (this.value == 3) return 'III';
        if (this.value == 4) return 'IIV';
        if (this.value == 5) return 'V';
        if (this.value == 6) return 'VI';
        if (this.value == 7) return 'VII';
        if (this.value == 8) return 'VIII';
        if (this.value == 9) return 'IX';
        if (this.value == 10) return 'X';
        if (this.value == 11) return 'XI';
        else return this.value;
      });
  hoursAxis.scale()
      .minimum(0)
      .maximum(12)
      .ticks({interval: 1})
      .minorTicks({interval: 1});
  hoursAxis.ticks().enabled(false);
  hoursAxis.minorTicks().enabled(false);

  var minuteAxis = gauge.axis(1).radius(107).fill(null).width(3).fill('#F0F8FE');
  minuteAxis.labels().enabled(false);
  minuteAxis.scale()
      .minimum(0)
      .maximum(60)
      .ticks({interval: 5})
      .minorTicks({interval: 1});

  minuteAxis.ticks()
      .enabled(true)
      .length(10)
      .stroke('2 ' + darkAccentColor)
      .position('center')
      .type(function (path, x, y, radius) {
        path.moveTo(x, y - radius / 2).lineTo(x, y + radius / 2).close();
        return path;
      });

  minuteAxis.minorTicks()
      .enabled(true)
      .length(5)
      .stroke('1.4 ' + colorAxisFont)
      .position('center')
      .type(function (path, x, y, radius) {
        path.moveTo(x, y - radius / 2).lineTo(x, y + radius / 2).close();
        return path;
      });

  gauge.needle()
      .fill(darkAccentColor)
      .stroke(null)
      .startRadius('6%')
      .endRadius('55%')
      .startWidth('2%')
      .middleWidth('2%')
      .endWidth('2%');
  gauge.needle(1)
      .fill(darkAccentColor)
      .stroke(null)
      .axisIndex(1)
      .startRadius('6%')
      .endRadius('80%')
      .startWidth('1%')
      .middleWidth('1%')
      .endWidth('1%');
  gauge.needle(2)
      .fill(darkAxisColor)
      .stroke(null)
      .startRadius('6%')
      .endRadius('85%')
      .startWidth('0.5%')
      .middleWidth('0.5%')
      .axisIndex(1)
      .endWidth('0.5%');
  gauge.cap()
      .radius('5%')
      .enabled(true)
      .fill(darkAccentColor)
      .stroke(null);

  gauge.container('container');
  gauge.draw();
});