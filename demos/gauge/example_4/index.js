var gauge, dataSet;
anychart.onDocumentReady(function() {
  anychart.onDocumentReady(function() {
    //create data set on our data
    dataSet = anychart.data.set([0,0,0]);

    setInterval(function () {
      var now = new Date();
      var seconds = now.getSeconds() + now.getMilliseconds() / 1000;
      var minutes = now.getMinutes() + seconds / 60;
      var hours = (now.getHours() % 12) + minutes / 60;

      dataSet.data([hours, minutes, Math.floor(seconds)]);
      gauge.label(2).text(now.getDate())
    }, 1000);

    gauge = anychart.circularGauge();

    gauge.data(dataSet);
    gauge.padding('19%');
    gauge.circularPadding('8%');
    gauge.startAngle(270);
    gauge.sweepAngle(360);
    gauge.stroke('none');
    gauge.fill(['white', 'rgb(32,34,48)'], .5, .5, null, 1, 0.81, 0.23);

    var axisHours = gauge.axis()
        .fill('#aaa')
        .radius(99)
        .width(0);

    axisHours.scale()
        .minimum(0)
        .maximum(12)
        .ticks({interval: 6})
        .minorTicks({interval: 1});

    axisHours.ticks(null);

    axisHours.minorTicks()
        .enabled(true)
        .fill(tickFill)
        .type(function (path, x, y, radius) {
          path.moveTo(x, y + radius / 2 - radius / 4);
          path.lineTo(x - radius / 6, y - radius / 2 - radius / 4);
          path.lineTo(x + radius / 6, y - radius / 2 - radius / 4);
          path.close();
          return path;
        })
        .position('i')
        .length('32');

    axisHours.labels()
        .position('i')
        .anchor('center')
        .padding(0)
        .fontColor('rgb(228,228,228)')
        .vAlign('center')
        .hAlign('center')
        .textFormatter(function () {
          if (this.value == 0) return '12';
          else return this.value;
        })
        .adjustFontSize(true)
        .width('30%')
        .height('10%');


    var axisMinutes = gauge.axis(1)
        .width(0)
        .radius(96);

    axisMinutes.scale()
        .minimum(0)
        .maximum(60)
        .ticks({interval: 5})
        .minorTicks({interval: 1});

    axisMinutes.ticks()
        .position('o')
        .length(10)
        .stroke('4 #aeaeae')
        .type(function (path, x, y, radius) {
          path.moveTo(x, y - radius / 2).lineTo(x, y + radius / 2).close();
          return path;
        });

    axisMinutes.minorTicks()
        .enabled(true)
        .position('o')
        .length(10)
        .stroke('2 #aeaeae')
        .type(function (path, x, y, radius) {
          path.moveTo(x, y - radius / 2).lineTo(x, y + radius / 2).close();
          return path;
        });
    axisMinutes.labels(null);

    gauge.cap()
        .radius('5%')
        .fill(['white', 'rgb(132,132,132)'], .5, .5, null, 1, 0.81, 0.23);

    gauge.label()
        .text('QUARTZ')
        .fontColor('white')
        .anchor('center')
        .adjustFontSize(true)
        .width('25%')
        .height('7%')
        .hAlign('center')
        .zIndex(10)
        .offsetY('-40%');

    gauge.label(1)
        .text('AnyChart WATCH')
        .fontColor('white')
        .width('55%')
        .height('9%')
        .hAlign('center')
        .adjustFontSize(true)
        .anchor('centerBottom')
        .zIndex(10)
        .offsetY('15%');

    gauge.label(2)
        .text(2)
        .anchor('center')
        .zIndex(10)
        .offsetY('75%')
        .offsetX(90)
        .padding(3, 5)
        .width('12%')
        .height('9%')
        .hAlign('right')
        .adjustFontSize(true)
        .zIndex(10)
        .background({fill: 'white', stroke: {thickness: 2, color: '#000000', opacity: '0.4'}});

    gauge.needle(0)
        .fill(pointerFill)
        .stroke('1px rgba(2,2,2,.2)')
        .startRadius('-20%')
        .endRadius('60%')
        .middleRadius(0)
        .startWidth('0.1%')
        .endWidth('0.1%')
        .middleWidth('5%');

    gauge.needle(1)
        .fill(pointerFill)
        .stroke('1px rgba(2,2,2,.3)')
        .axisIndex(1)
        .startRadius('-20%')
        .endRadius('80%')
        .middleRadius(0)
        .startWidth('0.1%')
        .endWidth('0.1%')
        .middleWidth('5%');

    gauge.needle(2)
        .fill(pointerFill)
        .stroke('1 #FFFFFF')
        .axisIndex(1)
        .endRadius('93%')
        .middleRadius('-10%')
        .middleWidth(1)
        .startWidth(3)
        .startRadius('-20%');

    gauge.background()
        .enabled(true)
        .fill({src: 'http://static.anychart.com/images/clock.png', mode: 'fit'});

    gauge.container('container').draw();
  });

  function pointerFill(pointer) {
    var bounds = new acgraph.math.Rect(pointer.cx - pointer.endRadius, pointer.cy - pointer.endRadius, pointer.endRadius * 2, pointer.endRadius * 2);

    var keys = ['0.1 white', '0.499 silver', '0.5 black', '0.501 white', '1 white'];
    if (pointer.angle > 90 && pointer.angle <= 180) {
      keys = ['0.1 rgb(232,232,232)', '0.499 silver', '0.5 black', '0.501 rgb(232,232,232)', '1 white'];
    } else if (pointer.angle > 180 && pointer.angle <= 280) {
      keys = ['0.1 white', '0.499 white', '0.5 black', '0.501 silver', '1 white'];
    } else if (pointer.angle > 280 && pointer.angle <= 330) {
      keys = ['0.4 white', '0.498 rgb(232,232,232)', '0.5 black', '0.502 white', '1 white'];
    }

    return {keys: keys, angle: 90 - pointer.angle, mode: bounds}
  }

  function tickFill(tick) {
    var bounds = new acgraph.math.Rect(tick.x - tick.length, tick.y - tick.length, tick.length * 2, tick.length * 2);

    if (tick.angle == 0) return null;

    var keys = ['0.1 white', '0.499 silver', '0.5 black', '0.501 white', '1 white'];
    if (tick.angle > 90 && tick.angle <= 180) {
      keys = ['0.1 white', '0.499 white', '0.5 black', '0.501 silver', '1 white'];
    } else if (tick.angle > 180 && tick.angle <= 280) {
      keys = ['0.1 white', '0.499 white', '0.5 black', '0.501 silver', '1 white'];
    } else if (tick.angle > 280 && tick.angle <= 330) {
      keys = ['0.4 white', '0.498 rgb(232,232,232)', '0.5 black', '0.502 white', '1 white'];
    }

    return {keys: keys, angle: -180, mode: bounds}
  }
});