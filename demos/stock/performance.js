(function() {
  var PerfMeter = function () {
    this.started = {};
    this.finished = {};
  };
  PerfMeter.prototype.start = function(label) {
    this.started[label] = window.performance ? window.performance.now() : +new Date();
  };
  PerfMeter.prototype.end = function(label) {
    var now = window.performance ? window.performance.now() : +new Date();
    this.finished[label] = now - (this.started[label] || now);
    delete this.started[label];
  };
  PerfMeter.prototype.get = function(label) {
    return this.finished[label];
  };
  PerfMeter.prototype.print = function(groupName, var_args) {
    console.group(groupName || 'Performance log');
    for (var i = 1; i < arguments.length; i++) {
      var val = this.get(arguments[i]);
      if (typeof val == 'number') val = val.toFixed(3);
      else val = '' + val;
      console.log(arguments[i] + ': ' + val + 'ms');
    }
    console.groupEnd(groupName || 'Performance log');
  };
  window.perfMeter = new PerfMeter();
})();
