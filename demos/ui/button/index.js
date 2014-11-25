var button;

function dis() {
//  console.log(this.style);
  button.disabled(!button.disabled());
}

function disa() {
  var btn = document.getElementById('btn');
  btn['disabled'] = !btn['disabled'];
}

function load() {
  button = new anychart.core.ui.Button();
  button.container('container');
  button.parentBounds(button.container().getStage().getBounds());
  button.text('+');
  button.width(15).height(15).hAlign('center').vAlign('middle');
  button.position({x: '25%', y: '40%'});
  button.draw();

  var redrawer = function() {
    button.draw();
  };
  button.listen('signal', redrawer, false, button);
}
