var parser, map, proj_index = 0;
var proj;
var projections = [
  'None',
  'Bonne',
  'Eckert1',
  'Eckert3',
  'Fahey',
  'Hammer',
  'Aitoff',
  'Mercator',
  'Orthographic',
  'Robinson',
  'Wagner6',
  'Equirectangular',
  'August',
  {name: "Aitoff", projection: d3.geo.aitoff()},
  {name: "Albers", projection: d3.geo.albers().scale(145).parallels([20, 50])},
  {name: "August", projection: d3.geo.august().scale(60)},
  {name: "Baker", projection: d3.geo.baker().scale(100)},
  {name: "Boggs", projection: d3.geo.boggs()},
  {name: "Bonne", projection: d3.geo.bonne().scale(120)},
  {name: "Bromley", projection: d3.geo.bromley()},
  {name: "Collignon", projection: d3.geo.collignon().scale(93)},
  {name: "Craster Parabolic", projection: d3.geo.craster()},
  {name: "Eckert I", projection: d3.geo.eckert1().scale(165)},
  {name: "Eckert II", projection: d3.geo.eckert2().scale(165)},
  {name: "Eckert III", projection: d3.geo.eckert3().scale(180)},
  {name: "Eckert IV", projection: d3.geo.eckert4().scale(180)},
  {name: "Eckert V", projection: d3.geo.eckert5().scale(170)},
  {name: "Eckert VI", projection: d3.geo.eckert6().scale(170)},
  {name: "Eisenlohr", projection: d3.geo.eisenlohr().scale(60)},
  {name: "Equirectangular (Plate Carrée)", projection: d3.geo.equirectangular()},
  {name: "Hammer", projection: d3.geo.hammer().scale(165)},
  {name: "Hill", projection: d3.geo.hill()},
  {name: "Goode Homolosine", projection: d3.geo.homolosine()},
  {name: "Kavrayskiy VII", projection: d3.geo.kavrayskiy7()},
  {name: "Lambert cylindrical equal-area", projection: d3.geo.cylindricalEqualArea()},
  {name: "Lagrange", projection: d3.geo.lagrange().scale(120)},
  {name: "Larrivée", projection: d3.geo.larrivee().scale(95)},
  {name: "Laskowski", projection: d3.geo.laskowski().scale(120)},
  {name: "Loximuthal", projection: d3.geo.loximuthal()},
  {name: "Orthographic", projection: d3.geo.orthographic().scale(200)},
  {name: "Miller", projection: d3.geo.miller().scale(100)},
  {name: "McBryde–Thomas Flat-Polar Parabolic", projection: d3.geo.mtFlatPolarParabolic()},
  {name: "McBryde–Thomas Flat-Polar Quartic", projection: d3.geo.mtFlatPolarQuartic()},
  {name: "McBryde–Thomas Flat-Polar Sinusoidal", projection: d3.geo.mtFlatPolarSinusoidal()},
  {name: "Mollweide", projection: d3.geo.mollweide().scale(165)},
  {name: "Natural Earth", projection: d3.geo.naturalEarth()},
  {name: "Nell–Hammer", projection: d3.geo.nellHammer()},
  {name: "Polyconic", projection: d3.geo.polyconic().scale(100)},
  {name: "Robinson", projection: d3.geo.robinson()},
  {name: "Sinusoidal", projection: d3.geo.sinusoidal()},
  {name: "Sinu-Mollweide", projection: d3.geo.sinuMollweide()},
  {name: "van der Grinten", projection: d3.geo.vanDerGrinten().scale(75)},
  {name: "van der Grinten IV", projection: d3.geo.vanDerGrinten4().scale(120)},
  {name: "Wagner IV", projection: d3.geo.wagner4()},
  {name: "Wagner VI", projection: d3.geo.wagner6()},
  {name: "Wagner VII", projection: d3.geo.wagner7()},
  {name: "Winkel Tripel", projection: d3.geo.winkel3()}
];


var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var generateData = function(map, opt_min, opt_max) {
  var auChoroplethData = [];
  features = map.geoData()['features'];
  var min = opt_min !== void 0 ? opt_min : 1900;
  var max = opt_max !== void 0 ? opt_max : 2000;
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      id = feature['properties'][map.geoIdField()];
      auChoroplethData.push({'id': id, 'value': randomExt(min, max), 'size': randomExt(0, 10)});
    }
  }
  return auChoroplethData;
};

function changeProjection() {
  proj_index = proj_index > projections.length - 1 ? 0 : proj_index;
  var proj = projections[proj_index];
  map.crs(typeof proj == 'string' ? proj : proj.projection);
  // $(proj).val(proj_index);
  proj_index++;
}


anychart.onDocumentReady(function() {
  proj = $('<select></select>');
  for (var i = 0; len = i < projections.length; i++) {
    proj.append('<option value=' + projections[i] + '>' + projections[i] + '</option>');
  }
  $('#projections').append(proj);

  map = anychart.map();

  map.geoData(anychart.maps.world_source);
  // // map.geoData(anychart.maps.australia);
  //
  // map.legend(true);
  //
  // // map.crs('+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +R_A +datum=WGS84 +units=m +no_defs');
  // // map.crs('Mercator');
  // //
  var choroplethData = [];
  var features = map.geoData()['features'];
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      var id = feature['properties'][map.geoIdField()];
      choroplethData.push({'id': id, 'value': randomExt(1900, 2000), 'size': randomExt(0, 1000)});
    }
  }

  var series = map.choropleth(choroplethData);
  series.labels().enabled(true);

  // var scale = anychart.scales.ordinalColor([
  //   {less: 1907},
  //   {from: 1907, to: 1920},
  //   {from: 1920, to: 1940},
  //   {from: 1940, to: 1950},
  //   {from: 1950, to: 1960},
  //   {from: 1960, to: 1970},
  //   {from: 1970, to: 1980},
  //   {greater: 1980}
  // ]);
  // //
  // scale.colors(['#42a5f5', '#64b5f6', '#90caf9', '#ffa726', '#fb8c00', '#f57c00', '#ef6c00', '#e65100']);
  // series.colorScale(scale);
  //
  //
  // map.marker([
  //   {lat: -42.220382, lon: 146.634521, value: randomExt(1, 100)},
  //   {lat: -37.822802, lon: 144.887695, value: randomExt(1, 100)},
  //   {lat: -29.802518, lon: 134.560547, value: randomExt(1, 100)},
  //   {lat: -31.914868, lon: 115.839844, value: randomExt(1, 100)},
  //   {lat: -22.431340, lon: 121.552734, value: randomExt(1, 100)},
  //   {lat: -16.509833, lon: 133.461914, value: randomExt(1, 100)},
  //   {lat: -15.665354, lon: 143.525391, value: randomExt(1, 100)},
  //   {lat: -24.686952, lon: 143.393555, value: randomExt(1, 100)},
  //   {lat: -27.449790, lon: 152.973633, value: randomExt(1, 100)},
  //   {lat: -33.833920, lon: 151.259766, value: randomExt(1, 100)}
  // ]);
  //
  //
  // var dataSet = anychart.data.set([
  //   {id: "AF", name: "Afghanistan", size: 7.5, date: '26 October 2015', description: 'Hindu Kush earthquake'},
  //   {id: "DZ", name: "Algeria", size: 7.7, date: '10 October 1980', description: 'El Asnam earthquake'},
  //   {id: "AR", name: "Argentina", size: 8.0, date: '27 October 1894', description: 'San Juan earthquake'},
  //   {id: "AU", name: "Australia", size: 7.2, date: '29 April 1941', description: ''},
  //   {id: "BD", name: "Bangladesh", size: 8.8, date: '2 April 1762', description: 'Arakan earthquake'},
  //   {id: "BE", name: "Belgium", size: 6.3, date: '18 September 1692', description: ''},
  //   {id: "BO", name: "Bolivia", size: 8.5, date: '9 May 1877', description: 'Iquique earthquake'},
  //   {id: "BR", name: "Brazil", size: 6.2, date: '31 January 1955', description: ''},
  //   {id: "BG", name: "Bulgaria", size: 7.8, date: '4 April 1904', description: ''},
  //   {id: "CA", name: "Canada", size: 8.9, date: '26 January 1700', description: 'Cascadia earthquake'},
  //   {id: "CN", name: "China", size: 8.6, date: '15 August 1950', description: 'Assam–Tibet earthquake'},
  //   {id: "CL", name: "Chile", size: 9.5, date: '22 May 1960', description: 'Valdivia earthquake'},
  //   {id: "CO", name: "Colombia", size: 8.8, date: '31 January 1906', description: 'Ecuador–Colombia earthquake'},
  //   {id: "CU", name: "Cuba", size: 6.8, date: '11 June 1766', description: ''},
  //   {id: "DK", name: "Denmark", size: 4.3, date: '16 December 2008', description: ''},
  //   {id: "DO", name: "Dominican Republic", size: 8.1, date: '4 August 1946', description: 'Dominican Republic earthquake'},
  //   {id: "EC", name: "Ecuador", size: 8.8, date: '31 January 1906', description: 'Ecuador–Colombia earthquake'},
  //   {id: "EG", name: "Egypt", size: 7.3, date: '22 November 1995', description: 'Gulf of Aqaba earthquake'},
  //   {id: "EE", name: "Estonia", size: 4.5, date: '25 October 1976', description: ''},
  //   {id: "FI", name: "Finland", size: 3.5, date: '21 February 1989', description: ''},
  //   {id: "FR", name: "France", size: 6.2, date: '11 June 1909', description: 'Provence earthquake'},
  //   {id: "DE", name: "Germany", size: 6.1, date: '18 February 1756', description: ''},
  //   {id: "GR", name: "Greece", size: 8.5, date: '21 July 365', description: 'Crete earthquake'},
  //   {id: "GT", name: "Guatemala", size: 7.7, date: '6 August 1942', description: 'Guatemala earthquake'},
  //   {id: "HT", name: "Haiti", size: 8.1, date: '7 May 1842', description: 'Cap-Haitien earthquake'},
  //   {id: "IS", name: "Iceland", size: 6.6, date: '17 June 2000', description: 'Iceland earthquakes'},
  //   {id: "IN", name: "India", size: 8.6, date: '15 August 1950', description: 'Assam–Tibet earthquake'},
  //   {id: "ID", name: "Indonesia", size: 9.2, date: '26 December 2004', description: 'Boxing Day earthquake'},
  //   {id: "IR", name: "Iran", size: 7.9, date: '22 December 856', description: 'Damghan earthquake'},
  //   {id: "IT", name: "Italy", size: 7.4, date: '11 January 1693', description: 'Sicily earthquake'},
  //   {id: "JP", name: "Japan", size: 9.0, date: '11 March 2011', description: 'Tōhoku earthquake'},
  //   {id: "LB", name: "Lebanon", size: 7.5, date: '9 July 551', description: 'Beirut earthquake'},
  //   {id: "MY", name: "Malaysia", size: 6.0, date: '5 June 2015', description: 'Sabah earthquake'},
  //   {id: "MX", name: "Mexico", size: 8.6, date: '28 March 1787', description: 'Mexico earthquake'},
  //   {id: "MN", name: "Mongolia", size: 8.4, date: '23 July 1905', description: 'Bolnai earthquake'},
  //   {id: "ME", name: "Montenegro", size: 7, date: '15 April 1979', description: 'Montenegro earthquake'},
  //   {id: "NP", name: "Nepal", size: 8, date: '15 January 1934	', description: 'Nepal–Bihar earthquake'},
  //   {id: "NL", name: "Netherlands", size: 5.3, date: '13 April 1992', description: 'Roermond earthquake'},
  //   {id: "NZ", name: "New Zealand", size: 8.3, date: '23 January 1855', description: 'Wairarapa earthquake'},
  //   {id: "NI", name: "Nicaragua", size: 7.7, date: '2 September 1992', description: 'Nicaragua earthquake'},
  //   {id: "KP", name: "North Korea", size: 6.5, date: '19 March 1952', description: ''},
  //   {id: "NO", name: "Norway", size: 6.2, date: '19 February 2004', description: 'Svalbard earthquake'},
  //   {id: "PK", name: "Pakistan", size: 8.1, date: '28 November 1945', description: 'Balochistan earthquake'},
  //   {id: "PE", name: "Peru", size: 8.6, date: '28 October 1746', description: 'Lima–Callao earthquake'},
  //   {id: "PH", name: "Philippines", size: 8.3, date: '15 August 1918', description: 'Celebes Sea earthquake'},
  //   {id: "PL", name: "Poland", size: 5.4, date: '31 December 1999', description: ''},
  //   {id: "PT", name: "Portugal", size: 8.7, date: '1 November 1755', description: '1755 Lisbon earthquake'},
  //   {id: "RO", name: "Romania", size: 7.9, date: '26 October 1802', description: 'Vrancea earthquake'},
  //   {id: "RU", name: "Russia", size: 9.0, date: '4 November 1952', description: 'Kamchatka earthquake'},
  //   {id: "WS", name: "Samoa", size: 8.5, date: '26 June 1917', description: 'Samoa earthquake'},
  //   {id: "ZA", name: "South Africa", size: 6.3, date: '29 September 1969', description: ''},
  //   {id: "ES", name: "Spain", size: 7.0, date: '21 March 1954', description: ''},
  //   {id: "SE", name: "Sweden", size: 4.7, date: '15 September 2014', description: ''},
  //   {id: "CH", name: "Switzerland", size: 6.5, date: '18 October 1356', description: 'Basel earthquake'},
  //   {id: "TW", name: "Taiwan", size: 7.6, date: '21 September 1999', description: '921 earthquake'},
  //   {id: "TH", name: "Thailand", size: 6.3, date: '5 May 2014', description: 'Mae Lao earthquake'},
  //   {id: "TR", name: "Turkey", size: 7.8, date: '27 December 1939', description: 'Erzincan earthquake'},
  //   {id: "GB", name: "United Kingdom", size: 6.1, date: '7 June 1931', description: 'Dogger Bank earthquake'},
  //   {id: "US", name: "United States", size: 9.2, date: '27 March 1964', description: 'Alaska earthquake'},
  //   {id: "VE", name: "Venezuela", size: 7.5, date: '26 March 1812', description: 'Caracas earthquake'},
  //   {id: "VN", name: "Vietnam", size: 6.8, date: '24 June 1983', description: 'Tuan Giao earthquake'}
  // ]);
  //
  //
  // // Sets bubble max size settings
  // map.minBubbleSize(3);
  // map.maxBubbleSize(15);
  //
  // // Creates bubble series
  // var series = map.bubble(dataSet);
  //
  // // series.labels().enabled(false);
  //
  // map.crsAnimation().duration(300);

  map.container('container').draw();


  setInterval(changeProjection, 500);

  proj.on('change', function() {
    map.crs(this.value);
  });

  // anychart.performance.printTree();
});
