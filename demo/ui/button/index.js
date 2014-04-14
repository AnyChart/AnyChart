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
  button = new anychart.ui.Button();
  button.container('container');
  button.text('My shiny little button');
  button.position({x: '25%', y: '40%'});
  button.draw();

  var redrawer = function() {
    button.draw();
  };
  button.listen('signal', redrawer, false, button);
}
