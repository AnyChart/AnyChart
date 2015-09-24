var chart;
anychart.onDocumentReady(function() {
  chart = anychart.column();
  chart.line(data());
  //chart.xScale().minimum(-0.1).maximum(1.1).ticks([0, 0.25, 0.5, 0.75, 1]);
  chart.grid().layout('v');
  chart.container('container').draw();
});

function data2() {
  var res = [];
  var curr = new Date();
  curr.setTime(curr.getTime() + 0 * 60 * 60 * 1000)
  for (var i = 0; i < 40; i++) {
    curr.setTime(curr.getTime() + 600 * 1000);
    var x = curr.getTime();
    res.push([x, genNumber(x, 2000, 50)]);
  }
  console.log(res);
  return res;
}


function genNumber(x, max, min) {
  var range = max - min;
  var millsInDay = 8 * 60 * 60 * 1000;
  x = x % (millsInDay) - 6 * 60 * 60 * 1000;
  x = x / millsInDay * 2 * Math.PI;
  var signalNormalized = (Math.cos(x) + 1) / 2;
  var noiseRange = range * 0.5 * (1 - Math.sin(x / 2) + 1) / 2;
  signalNormalized += Math.random() * 0.1 - 0.05;
  var signal = signalNormalized * range + min;
  var noise = Math.random() * noiseRange - noiseRange / 2;
  if (signal + noise <= 0) {
    noise += noiseRange / 2;
  }
  return signal + noise;
}


function data() {
  var data = {};
  var n = 1e7;
  var disc = 1000;
  for (var i = 0; i < n; i++) {
    var value = Math.round(random() * disc);
    data[value] = (data[value] || 0) + 1;
  }
  var res = [];
  for (i in data) {
    res.push([i / disc, (data[i] || 0) / n]);
  }
  res.sort(function(a, b) { return a[0] - b[0]; });
  return res;
}

function random() {
  return g.next();
}

var g = new Gauss();
function Gauss() {
  var ready = false;
  var second = 0.0;

  this.next = function(mean, dev) {
    mean = mean == undefined ? 0.0 : mean;
    dev = dev == undefined ? 1.0 : dev;

    if (this.ready) {
      this.ready = false;
      return this.second * dev + mean;
    }
    else {
      var u, v, s;
      do {
        u = 2.0 * Math.random() - 1.0;
        v = 2.0 * Math.random() - 1.0;
        s = u * u + v * v;
      } while (s > 1.0 || s == 0.0);

      var r = Math.sqrt(-2.0 * Math.log(s) / s);
      this.second = r * u;
      this.ready = true;
      return r * v * dev + mean;
    }
  };
}
