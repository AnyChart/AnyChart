var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

function setUnboundedRegions(value) {
  chart.unboundRegions().enabled(value);
}

function minimumX(value) {
  chart.scale().minimumX(value);
  minimumXInput.value = value;
}

function minimumXInp(value) {
  chart.scale().minimumX(value);
  minimumXRange.value = value;
}

function maximumX(value) {
  chart.scale().maximumX(value);
  maximumXInput.value = value;
}

function maximumXInp(value) {
  chart.scale().maximumX(value);
  maximumXRange.value = value;
}


function minimumY(value) {
  chart.scale().minimumY(value);
  minimumYInput.value = value;
}

function minimumYInp(value) {
  chart.scale().minimumY(value);
  minimumYRange.value = value;
}

function maximumY(value) {
  chart.scale().maximumY(value);
  maximumYInput.value = value;
}

function maximumYInp(value) {
  chart.scale().maximumY(value);
  maximumYRange.value = value;
}

anychart.onDocumentReady(function() {
  anychart.licenseKey('test-key-32db1f79-cc9312c4');

  chart = anychart.map();
  chart.crs(anychart.enums.MapProjections.FAHEY);
  // chart.crs('+proj=lcc +lat_1=43 +lat_2=62 +lat_0=30 +lon_0=10 +x_0=0 +y_0=0 +ellps=intl +units=m +no_defs');
  chart.geoData('anychart.maps.world_source');
  chart.unboundRegions().enabled(false);

  chart.scale()
      .minimumX(-30)
      .maximumX(45)
      .minimumY(33)
      .maximumY(85);

  var min = 1900, max = 2000;

  var data = [
    {'value': randomExt(min, max), name: 'Albania', id: 'AL'},
    {'value': randomExt(min, max), name: 'Andorra' , id: 'AD'},
    {'value': randomExt(min, max), name: 'Austria', id: 'AT'},
    {'value': randomExt(min, max), name: 'Belarus', id: 'BY'},
    {'value': randomExt(min, max), name: 'Belgium', id: 'BE'},
    {'value': randomExt(min, max), name: 'Bosnia and Herzegovina', id: 'BA'},
    {'value': randomExt(min, max), name: 'Bulgaria', id: 'BG'},
    {'value': randomExt(min, max), name: 'Croatia', id: 'HR'},
    {'value': randomExt(min, max), name: 'Cyprus', id: 'CY'},
    {'value': randomExt(min, max), name: 'Czech Republic', id: 'CZ'},
    {'value': randomExt(min, max), name: 'Denmark', id: 'DK'},
    {'value': randomExt(min, max), name: 'Estonia', id: 'EE'},
    {'value': randomExt(min, max), name: 'Faroe Islands', id: 'FO'},
    {'value': randomExt(min, max), name: 'Finland', id: 'FI'},
    {'value': randomExt(min, max), name: 'France', id: 'FR', labelrank: 6, 'middle-y': 46.619261, 'middle-x': 2.548828, positionMode: 'absolute'},
    {'value': randomExt(min, max), name: 'Germany', id: 'DE'},
    {'value': randomExt(min, max), name: 'Gibraltar', id: 'GI'},
    {'value': randomExt(min, max), name: 'Greece', id: 'GR'},
    {'value': randomExt(min, max), name: 'Hungary', id: 'HU'},
    {'value': randomExt(min, max), name: 'Iceland', id: 'IS'},
    {'value': randomExt(min, max), name: 'Ireland', id: 'IE'},
    {'value': randomExt(min, max), name: 'Italy', id: 'IT'},
    {'value': randomExt(min, max), name: 'Latvia', id: 'LV'},
    {'value': randomExt(min, max), name: 'Liechtenstein', id: 'LI'},
    {'value': randomExt(min, max), name: 'Lithuania', id: 'LT'},
    {'value': randomExt(min, max), name: 'Luxembourg', id: 'LU'},
    {'value': randomExt(min, max), name: 'Macedonia', id: 'MK'},
    {'value': randomExt(min, max), name: 'Malta', id: 'MT'},
    {'value': randomExt(min, max), name: 'Moldova', id: 'MD'},
    {'value': randomExt(min, max), name: 'Monaco', id: 'MC'},
    {'value': randomExt(min, max), name: 'Netherlands', id: 'NL'},
    {'value': randomExt(min, max), name: 'Norway', id: 'NO'},
    {'value': randomExt(min, max), name: 'Poland', id: 'PL'},
    {'value': randomExt(min, max), name: 'Portugal', id: 'PT'},
    {'value': randomExt(min, max), name: 'Romania', id: 'RO'},
    {'value': randomExt(min, max), name: 'Russia', id: 'RU', labelrank: 6, 'middle-y': 54.367759, 'middle-x': 33.925781, positionMode: 'absolute'},
    {'value': randomExt(min, max), name: 'San Marino', id: 'SM'},
    {'value': randomExt(min, max), name: 'Serbia', id: 'RS'},
    {'value': randomExt(min, max), name: 'Slovakia', id: 'SK'},
    {'value': randomExt(min, max), name: 'Slovenia', id: 'SI'},
    {'value': randomExt(min, max), name: 'Spain', id: 'ES'},
    {'value': randomExt(min, max), name: 'Sweden', id: 'SE'},
    {'value': randomExt(min, max), name: 'Switzerland', id: 'CH'},
    {'value': randomExt(min, max), name: 'Ukraine', id: 'UA'},
    {'value': randomExt(min, max), name: 'United Kingdom', id: 'GB'},
    {'value': randomExt(min, max), name: 'Vatican city', id: 'VA'},
    {'value': randomExt(min, max), name: 'Yugoslavia', id: 'RS'},
    {'value': randomExt(min, max), name: 'Isle of Man', id: 'IM'},
    {'value': randomExt(min, max), name: 'Kosovo', id: 'RS'},
    {'value': randomExt(min, max), name: 'Montenegro', id: 'ME'}
  ];

  var series = chart.choropleth(data);

  var scale = anychart.scales.ordinalColor([
    {less: 1907},
    {from: 1907, to: 1920},
    {from: 1920, to: 1940},
    {from: 1940, to: 1950},
    {from: 1950, to: 1960},
    {from: 1960, to: 1970},
    {from: 1970, to: 1980},
    {greater: 1980}
  ]);

  scale.colors(['#42a5f5', '#64b5f6', '#90caf9', '#ffa726', '#fb8c00', '#f57c00', '#ef6c00', '#e65100']);
  series.colorScale(scale);
  series.labels(true);

  chart.container('container').draw();

  var setUnboundedRegionsInput = document.getElementById('setUnboundedRegions');
  setUnboundedRegionsInput.checked = chart.unboundRegions().enabled();

  minimumXRange = document.getElementById('minimumX');
  minimumXInput = document.getElementById('minimumXInp');
  minimumXRange.value = chart.scale().minimumX();
  minimumXInput.value = chart.scale().minimumX();

  maximumXRange = document.getElementById('maximumX');
  maximumXInput = document.getElementById('maximumXInp');
  maximumXRange.value = chart.scale().maximumX();
  maximumXInput.value = chart.scale().maximumX();


  minimumYRange = document.getElementById('minimumY');
  minimumYInput = document.getElementById('minimumYInp');
  minimumYRange.value = chart.scale().minimumY();
  minimumYInput.value = chart.scale().minimumY();

  maximumYRange = document.getElementById('maximumY');
  maximumYInput = document.getElementById('maximumYInp');
  maximumYRange.value = chart.scale().maximumY();
  maximumYInput.value = chart.scale().maximumY();
});
