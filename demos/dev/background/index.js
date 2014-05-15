var background, fill;
function load() {
  var stage = acgraph.create().container('container');
  background = new anychart.elements.Background();
  background.bounds('50%', 0, '50%', 100);
  background.container(stage);
  background.fill({src: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRwV0atv9yOnD4Y8xZRdY85TO6LuFxMU2Bi01yBIRH_BbEZPjBa', mode: 'tile'});
  background.draw();

  background = new anychart.elements.Background();
  background.bounds(0, 0, '50%', 100);
  background.container(stage);
  background.fill({src: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRwV0atv9yOnD4Y8xZRdY85TO6LuFxMU2Bi01yBIRH_BbEZPjBa', mode: 'tile'});
  background.draw();

  stage.rect(0, 100, 100, 100).fill({src: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRwV0atv9yOnD4Y8xZRdY85TO6LuFxMU2Bi01yBIRH_BbEZPjBa', mode: 'tile'});
  stage.rect(100, 100, 100, 100).fill({src: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRwV0atv9yOnD4Y8xZRdY85TO6LuFxMU2Bi01yBIRH_BbEZPjBa', mode: 'tile'});

  background.listenSignals(function() {
    background.draw();
  });
}
