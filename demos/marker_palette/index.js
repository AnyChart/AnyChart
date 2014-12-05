var palette;

function load() {
  palette = new anychart.palettes.Markers();

  palette.listenSignals(function(event) {
    if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
      console.log('\nMarkers changed! REAPPLICATION!');
    } else {
      console.log('OTHER SIGNAL!! YOU SHOULD NOT SEE THIS MESSAGE FROM CONSOLE!!');
    }
  });

  // marker list
  console.log(palette.markers());

  // set markers by array
  console.log(palette.markers(['cRoSs', 'DIagoNAlcross']).markers());

  // set markers by args
  console.log(palette.markers('diAMond', 'cirCLE', 'sqUAre').markers());

  // set marker by index
  console.log(palette.markerAt(3, 'myShinyMarker').markers());

  // deserialization of palette
  console.log(palette.setup({markers: ['maRkEr1', 'huAuahG']}).markers());
}
