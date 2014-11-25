var ticks;
function load() {
  ticks = new anychart.core.axes.Ticks();


  ticks.listen(anychart.utils.Invalidatable.INVALIDATED, function(e) {

    var el = goog.object.findKey(anychart.utils.ConsistencyState, function(value) {
      return value == this.invalidatedStates;
    }, e);
    console.log(el);
  }, false, this);


  ticks
      .length(16)
      .stroke('blue')
      .position('OutSide')
}
