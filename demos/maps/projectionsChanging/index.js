var parser, map, proj_index = 0, proj;
var projections = [
  {name: 'Aitoff', projection: d3.geo.aitoff.raw},
  {name: 'Albers', projection: d3.geo.albers.raw},
  {name: 'August', projection: d3.geo.august.raw},
  {name: 'Baker', projection: d3.geo.baker.raw},
  {name: 'Boggs', projection: d3.geo.boggs.raw},
  {name: 'Bonne', projection: d3.geo.bonne.raw},
  {name: 'Bromley', projection: d3.geo.bromley.raw},
  {name: 'Collignon', projection: d3.geo.collignon.raw},
  {name: 'Craster Parabolic', projection: d3.geo.craster.raw},
  {name: 'Eckert I', projection: d3.geo.eckert1.raw},
  {name: 'Eckert II', projection: d3.geo.eckert2.raw},
  {name: 'Eckert III', projection: d3.geo.eckert3.raw},
  {name: 'Eckert IV', projection: d3.geo.eckert4.raw},
  {name: 'Eckert V', projection: d3.geo.eckert5.raw},
  {name: 'Eckert VI', projection: d3.geo.eckert6.raw},
  {name: 'Eisenlohr', projection: d3.geo.eisenlohr},
  {name: 'Equirectangular (Plate Carrée)', projection: d3.geo.equirectangular.raw},
  {name: 'Hammer', projection: d3.geo.hammer.raw},
  {name: 'Hill', projection: d3.geo.hill.raw},
  {name: 'Goode Homolosine', projection: d3.geo.homolosine.raw},
  {name: 'Kavrayskiy VII', projection: d3.geo.kavrayskiy7.raw},
  {name: 'Lambert cylindrical equal-area', projection: d3.geo.cylindricalEqualArea.raw},
  {name: 'Lagrange', projection: d3.geo.lagrange.raw},
  {name: 'Larrivée', projection: d3.geo.larrivee.raw},
  {name: 'Laskowski', projection: d3.geo.laskowski.raw},
  {name: 'Loximuthal', projection: d3.geo.loximuthal.raw},
  {name: 'Orthographic', projection: d3.geo.orthographic.raw},
  {name: 'Miller', projection: d3.geo.miller.raw},
  {name: 'McBryde–Thomas Flat-Polar Parabolic', projection: d3.geo.mtFlatPolarParabolic.raw},
  {name: 'McBryde–Thomas Flat-Polar Quartic', projection: d3.geo.mtFlatPolarQuartic.raw},
  {name: 'McBryde–Thomas Flat-Polar Sinusoidal', projection: d3.geo.mtFlatPolarSinusoidal.raw},
  {name: 'Mollweide', projection: d3.geo.mollweide.raw},
  {name: 'Natural Earth', projection: d3.geo.naturalEarth.raw},
  {name: 'Nell–Hammer', projection: d3.geo.nellHammer.raw},
  {name: 'Polyconic', projection: d3.geo.polyconic.raw},
  {name: 'Robinson', projection: d3.geo.robinson.raw},
  {name: 'Sinusoidal', projection: d3.geo.sinusoidal.raw},
  {name: 'Sinu-Mollweide', projection: d3.geo.sinuMollweide.raw},
  {name: 'van der Grinten', projection: d3.geo.vanDerGrinten.raw},
  {name: 'van der Grinten IV', projection: d3.geo.vanDerGrinten4.raw},
  {name: 'Wagner IV', projection: d3.geo.wagner4.raw},
  {name: 'Wagner VI', projection: d3.geo.wagner6.raw},
  {name: 'Wagner VII', projection: d3.geo.wagner7.raw},
  {name: 'Winkel Tripel', projection: d3.geo.winkel3.raw}
];


var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

function changeProjection() {
  proj_index = proj_index > projections.length - 1 ? 0 : proj_index;
  var proj = projections[proj_index];
  map.crs(typeof proj == 'string' ? proj : proj.projection);
  proj_index++;
}

var palette = anychart.palettes.distinctColors().colors([
  '#fff59d', '#fbc02d', '#ff8f00', '#ef6c00', '#bbdefb', '#90caf9', '#64b5f6',
  '#42a5f5', '#1e88e5', '#1976d2', '#1565c0', '#01579b', '#0097a7', '#00838f'
]);

var bigTooltipSettings = {
  background: {fill: 'white', stroke: '#c1c1c1', corners: 3, cornerType: 'ROUND'},
  padding: [8, 13, 10, 13]
};


anychart.onDocumentReady(function() {
  var map_data = dataSet.mapAs(null, {'description': ['description']});

  var stage = acgraph.create('container');
  map = anychart.map();

  var title = map.title();
  title.enabled(true).text('Women First Granted Suffrage at National Level (by Year)');
  map.title().fontSize(16).padding(0, 0, 30, 0);
  map.allowPointsSelect(false);

  map.credits(true);
  map.credits().url('//en.wikipedia.org/wiki/Women_suffrage');
  map.credits().text('Data source: http://en.wikipedia.org/wiki/Women_suffrage/');
  map.credits().logoSrc('//en.wikipedia.org/static/favicon/wikipedia.ico');

  var series = map.choropleth(map_data);
  series.geoIdField('iso_a2');
  series.labels(true);
  series.hoverFill('#455a64');
  series.tooltip(bigTooltipSettings);
  series.tooltip().textWrap('byLetter').useHtml(true);
  series.tooltip().title().fontColor('#7c868e');
  series.tooltip().titleFormatter(function() {
    return this.name;
  });
  series.tooltip().textFormatter(function() {
    var span_for_value = '<span style="color: #545f69; font-size: 12px; font-weight: bold">';
    var span_for_description = '<br/><span style="color: #545f69; font-size: 10px">';
    if (this.value == '20000')
      var result = span_for_value + 'Never</span></strong>';
    else
      result = span_for_value + this.value + '</span></strong>';

    if (getDescription(this.id) != undefined && getDescription(this.id) != '')
      result = result + span_for_description + getDescription(this.id) + '</span></strong>';
    return result;
  });

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

  var colorRange = map.colorRange();
  colorRange.enabled(true).padding([20, 0, 0, 0]);
  colorRange.colorLineSize(5);
  colorRange.ticks().stroke('3 #ffffff').position('center').length(20).enabled(true);
  colorRange.marker().size(7);
  colorRange.labels().fontSize(10).padding(0, 0, 0, 5).textFormatter(function() {
    var range = this.colorRange;
    var name;
    if (isFinite(range.start + range.end)) {
      name = range.start + ' - ' + range.end;
    } else if (isFinite(range.start)) {
      name = 'After ' + range.start;
    } else {
      name = 'Before ' + range.end;
    }
    return name;
  });

  map.geoData(anychart.maps.world_source);
  map.legend(false);
  map.crsAnimation().duration(500);
  map.container(stage);
  map.draw();

  setInterval(changeProjection, 1000);
});


var data = [
  {
    id: "SA",
    name: "Saudi Arabia",
    value: "20000",
    description: "Women were denied the right to vote or to stand for the local election in 2005, <br/>" +
    "although suffrage was slated to possibly be granted by 2009, <br/>then set for later in 2011, but suffrage was not granted either of those times.<br/>" +
    "In late September 2011, King Abdullah bin Abdulaziz al-Saud <br/>declared that women would be able to vote and run for office starting in 2015."
  },
  {
    id: "VA",
    name: "Vatican City",
    value: "20000",
    description: "The Pope is only elected by the College of Cardinals; <br/>" +
    "women not being appointed as cardinals, women cannot vote for the Pope."
  },
  {id: "PN", name: "Pitcairn", value: "1838", description: ""},
  {id: "IM", name: "Isle of Man", value: "1881", description: ""},
  {id: "CK", name: "Cook Islands", value: "1893", description: ""},
  {id: "NZ", name: "New Zealand", value: "1893", description: ""},
  {
    id: "AU",
    name: "Australia",
    value: "1902",
    description: "Indigenous Australian women (and men) not officially <br/>" +
    " given the right to vote until 1962."
  },
  {id: "FI", name: "Finland", value: "1906", description: ""},
  {id: "NO", name: "Norway", value: "1913", description: ""},
  {id: "DK", name: "Denmark", value: "1915", description: ""},
  {id: "GL", name: "Greenland", value: "1915", description: ""},
  {id: "IS", name: "Iceland", value: "1915", description: ""},
  {id: "FO", name: "Faroe Islands", value: "1915", description: ""},
  {id: "AM", name: "Armenia", value: "1919", description: ""},
  {
    id: "CA", name: "Canada", value: "1918", description: "1917–1919 for most of Canada; " +
  "<br/>Prince Edward Island in 1922; <br/>" +
  "Newfoundland in 1925; <br/>" +
  "Quebec in 1940. <br/><br/>To help win a mandate for conscription, <br/>" +
  "the federal Conservative government of Robert Borden <br/>" +
  "granted the vote in 1917 to female war widows, women serving overseas,<br/>" +
  "and the female relatives of men serving overseas. <br/>" +
  "However, the same legislation, the Wartime Elections Act, <br/>" +
  "disenfranchised those who became naturalized Canadian citizens after 1902. <br/>" +
  "Women over 21 who were \"not alien-born\"and who met certain property <br/>" +
  "qualifications were allowed to vote in federal elections in 1918. <br/>" +
  "Women first won the vote provincially in Manitoba, Saskatchewan and Alberta in 1916; <br/>" +
  "British Columbia and Ontario in 1917; Nova Scotia in 1918; New Brunswick in 1919 <br/>" +
  "(women could not run for New Brunswick provincial office until 1934); <br/>" +
  "Prince Edward Island in 1922; Newfoundland in 1925 (which did not join <br/>" +
  "Confederation until 1949); and Quebec in 1940. Aboriginal women were not<br/>" +
  "offered the right to vote until 1960. Previous to that they could only vote <br/>" +
  "if they gave up their treaty status. It wasn\'t until 1948 when <br/>" +
  "Canada signed the UN\'s Universal Declaration of Human Rights that Canada<br/>" +
  "was forced to examine the issue of their discrimination against Aboriginal people."
  },
  {id: "EE", name: "Estonia", value: "1917", description: ""},
  {id: "LV", name: "Latvia", value: "1917", description: ""},
  {id: "RU", name: "Russia", value: "1917", description: "On July 20, 1917, under the Provisional Government."},
  {
    id: "UY", name: "Uruguay", value: "1927", description: "Women's suffrage was broadcast for the first <br/>" +
  "time in 1927, in the plebiscite of Cerro Chato."
  },
  {id: "AZ", name: "Azerbaijan", value: "1918", description: ""},
  {id: "GE", name: "Georgia", value: "1918", description: ""},
  {id: "DE", name: "Germany", value: "1918", description: ""},
  {id: "HU", name: "Hungary", value: "1918", description: ""},
  {
    id: "IE", name: "Ireland", value: "1922", description: "From 1918, with the rest of the United Kingdom,<br/>" +
  "women could vote at 30 with property qualifications or in university <br/>" +
  "constituencies, while men could vote at 21 with no qualification. <br/>" +
  "From separation in 1922, the Irish Free State gave equal <br/>" +
  "voting rights to men and women."
  },
  {id: "KG", name: "Kyrgyzstan", value: "1918", description: ""},
  {id: "LT", name: "Lithuania", value: "1918", description: ""},
  {
    id: "PL", name: "Poland", value: "1918", description: "Previous to the Partition of Poland in 1795,<br/>" +
  "tax-paying females were allowed to take part in political life."
  },
  {
    id: "GB", name: "United Kingdom", value: "1928", description: "From 1918–1928, women could vote at 30 <br/>" +
  "with property qualifications or as graduates of UK universities,<br/>" +
  "while men could vote at 21 with no qualification."
  },
  {id: "AT", name: "Austria", value: "1919", description: ""},
  {id: "BY", name: "Belarus", value: "1919", description: ""},
  {
    id: "BE",
    name: "Belgium",
    value: "1948",
    description: "Was granted in the constitution in 1919, for communal voting.<br/>" +
    "Suffrage for the provincial councils and <br/>" +
    "the national parliament only came in 1948."
  },
  {
    id: "JE", name: "Jersey", value: "1919", description: "Restrictions on franchise applied to <br/>" +
  "men and women until after Liberation in 1945"
  },
  {id: "LU", name: "Luxembourg", value: "1919", description: ""},
  {id: "NL", name: "Netherlands", value: "1919", description: ""},
  {id: "UA", name: "Ukraine", value: "1919", description: ""},
  {id: "ZW", name: "Zimbabwe", value: "1919", description: ""},
  {id: "AL", name: "Albania", value: "1920", description: ""},
  {id: "CZ", name: "Czech Republic", value: "1920", description: ""},
  {id: "SK", name: "Slovakia", value: "1920", description: ""},
  {id: "US", name: "United States", value: "1920", description: ""},
  {id: "SE", name: "Sweden", value: "1921", description: ""},
  {id: "MM", name: "Myanmar", value: "1922", description: ""},
  {id: "KZ", name: "Kazakhstan", value: "1924", description: ""},
  {id: "MN", name: "Mongolia", value: "1924", description: ""},
  {id: "TJ", name: "Tajikistan", value: "1924", description: ""},
  {id: "TM", name: "Turkmenistan", value: "1924", description: ""},
  {
    id: "TT",
    name: "Trinidad and Tobago",
    value: "1925",
    description: "Suffrage was granted for the first time in 1925 to either sex,<br/>" +
    "to men over the age of 21 and women over the age of 30,<br/>" +
    "as in Great Britain (the \"Mother Country\", <br/>" +
    "as Trinidad and Tobago was still a colony at the time) <br/>" +
    "In 1945 full suffrage was granted to women."
  },
  {id: "EC", name: "Ecuador", value: "1929", description: ""},
  {
    id: "MD",
    name: "Moldova",
    value: "1940",
    description: "As part of the Kingdom of Romania, women who met certain qualifications <br/>" +
    "were allowed to vote in local elections, starting in 1929. <br/>After Constitution from 1938, the voting rights were extended to women <br/>" +
    "for general elections by the Electoral Law 1939. <br/>In 1940, after the formation of the Moldavian SSR, <br/>equal voting rights were granted to men and women."
  },
  {
    id: "PR", name: "Puerto Rico", value: "1935", description: "Limited suffrage was passed for women, <br/>" +
  "restricted to those who were literate. <br/>In 1935 the legislature approved suffrage for all women."
  },
  {
    id: "RO",
    name: "Romania",
    value: "1946",
    description: "Starting in 1929, women who met certain qualifications were allowed to vote in local elections.<br/>" +
    "After the Constitution from 1938, the voting rights were extended <br/>" +
    "to women for general elections by the Electoral Law 1939. <br/>" +
    "Women could vote on equal terms with men, but both men and women had restrictions,<br/>" +
    "and in practice the restrictions affected women more than men. <br/>" +
    "In 1946, full equal voting rights were granted to men and women."
  },
  {id: "GR", name: "Greece", value: "1952", description: "1930 (Local Elections, Literate Only), 1952 (Unconditional)"},
  {
    id: "ZA",
    name: "South Africa",
    value: "1994",
    description: "White women only 1930; <br/>women of other races were enfranchised in 1994, at the same time as men."
  },
  {id: "TR", name: "Turkey", value: "1934", description: "1930 (for local elections), 1934 (for national elections)"},
  {id: "PT", name: "Portugal", value: "1976", description: "With restrictions in 1931, restrictions lifted in 1976"},
  {id: "ES", name: "Spain", value: "1931", description: ""},
  {id: "LK", name: "Sri Lanka", value: "1931", description: ""},
  {id: "BR", name: "Brazil", value: "1932", description: ""},
  {id: "MV", name: "Maldives", value: "1932", description: ""},
  {id: "TH", name: "Thailand", value: "1932", description: ""},
  {id: "CU", name: "Cuba", value: "1934", description: ""},
  {id: "ID", name: "Indonesia", value: "1945", description: "1937 (for Europeans only)"},
  {id: "PH", name: "Philippines", value: "1937", description: ""},
  {id: "BO", name: "Bolivia", value: "1938", description: ""},
  {id: "BG", name: "Bulgaria", value: "1938", description: ""},
  {id: "UZ", name: "Uzbekistan", value: "1938", description: ""},
  {id: "SV", name: "El Salvador", value: "1939", description: ""},
  {id: "PA", name: "Panama", value: "1941", description: ""},
  {id: "DO", name: "Dominican Republic", value: "1942", description: ""},
  {id: "BM", name: "Bermuda", value: "1944", description: ""},
  {id: "FR", name: "France", value: "1944", description: ""},
  {id: "JM", name: "Jamaica", value: "1944", description: ""},
  {id: "IT", name: "Italy", value: "1945", description: ""},
  {id: "SN", name: "Senegal", value: "1945", description: ""},
  {id: "TG", name: "Togo", value: "1945", description: ""},
  {id: "RS", name: "Serbia", value: "1945", description: ""},
  {id: "ME", name: "Montenegro", value: "1945", description: ""},
  {id: "HR", name: "Croatia", value: "1945", description: ""},
  {id: "SI", name: "Slovenia", value: "1945", description: ""},
  {id: "BA", name: "Bosnia and Herzegovina", value: "1945", description: ""},
  {id: "MK", name: "Macedonia", value: "1945", description: ""},
  {id: "CM", name: "Cameroon", value: "1946", description: ""},
  {id: "DJ", name: "Djibouti", value: "1946", description: ""},
  {id: "GT", name: "Guatemala", value: "1946", description: ""},
  {id: "KR", name: "Korea, North", value: "1946", description: ""},
  {id: "LR", name: "Liberia", value: "1946", description: ""},
  {id: "VE", name: "Venezuela", value: "1946", description: ""},
  {id: "VN", name: "Vietnam", value: "1946", description: ""},
  {id: "AR", name: "Argentina", value: "1947", description: ""},
  {
    id: "CN",
    name: "China",
    value: "1947",
    description: "In 1947, women won suffrage through Constitution of the Republic of China. <br/>" +
    "in 1949, the People's Republic of China (PRC) replaced the Republic of China (ROC) <br/>" +
    "as government of the Chinese mainland. The ROC moved to the island of Taiwan. <br/>" +
    "The PRC constitution recognizes women's equal political rights with men."
  },
  {
    id: "IN", name: "India", value: "1947", description: "In 1947, on its independence from the United Kingdom, <br/>" +
  "India granted equal voting rights to all men and women."
  },
  {id: "JP", name: "Japan", value: "1947", description: ""},
  {id: "MT", name: "Malta", value: "1947", description: ""},
  {id: "MX", name: "Mexico", value: "1947", description: ""},
  {
    id: "PK",
    name: "Pakistan",
    value: "1947",
    description: "In 1947, on its independence from the United Kingdom and India, <br/>" +
    "Pakistan granted full voting rights for men and women"
  },
  {id: "SG", name: "Singapore", value: "1947", description: ""},
  {
    id: "TW", name: "Taiwan", value: "1947", description: "In 1945, Taiwan was return from Japan to China. <br/>" +
  "In 1947, women won the suffrage under the Constitution of the Republic of China. <br/>" +
  "In 1949, Republic of China(ROC) lost mainland China, moved to Taiwan."
  },
  {
    id: "IL",
    name: "Israel",
    value: "1948",
    description: "Women's suffrage was granted with the declaration of independence."
  },
  {id: "KP", name: "Korea, South", value: "1948", description: ""},
  {id: "NE", name: "Niger", value: "1948", description: ""},
  {id: "SC", name: "Seychelles", value: "1948", description: ""},
  {id: "SR", name: "Suriname", value: "1948", description: ""},
  {
    id: "CL",
    name: "Chile",
    value: "1949",
    description: "From 1934–1949, women could vote in local elections at 25, <br/>" +
    "while men could vote in all elections at 21. <br/>" +
    "In both cases, literacy was required."
  },
  {id: "CR", name: "Costa Rica", value: "1949", description: ""},
  {id: "HK", name: "Hong Kong", value: "1949", description: ""},
  {id: "NL", name: "Netherlands", value: "1949", description: ""},
  {id: "SY", name: "Syria", value: "1949", description: ""},
  {id: "BB", name: "Barbados", value: "1950", description: ""},
  {id: "HT", name: "Haiti", value: "1950", description: ""},
  {id: "AG", name: "Antigua and Barbuda", value: "1951", description: ""},
  {id: "VG", name: "British Virgin Islands", value: "1951", description: ""},
  {id: "MS", name: "Montserrat", value: "1951", description: ""},
  {id: "PM", name: "Saint Kitts and Nevis", value: "1951", description: ""},
  {id: "AI", name: "Anguilla", value: "1951", description: ""},
  {id: "GD", name: "Grenada", value: "1951", description: ""},
  {id: "LC", name: "St Lucia", value: "1951", description: ""},
  {id: "VC", name: "St Vincent and the Grenadines", value: "1951", description: ""},
  {id: "DM", name: "Dominica", value: "1951", description: ""},
  {id: "NP", name: "Nepal", value: "1951", description: ""},
  {id: "CI", name: "Côte d'Ivoire", value: "1952", description: ""},
  {
    id: "LB",
    name: "Lebanon",
    value: "1952",
    description: "In 1957 a requirement for women (but not men) to have elementary education<br/>" +
    "before voting was dropped, as was voting being compulsory <br/>for men (but not women)."
  },
  {id: "BT", name: "Bhutan", value: "1953", description: ""},
  {id: "GY", name: "Guyana", value: "1953", description: ""},
  {id: "BZ", name: "Belize", value: "1954", description: ""},
  {id: "CO", name: "Colombia", value: "1954", description: ""},
  {id: "GH", name: "Ghana", value: "1954", description: ""},
  {id: "KH", name: "Cambodia", value: "1955", description: ""},
  {id: "ET", name: "Ethiopia", value: "1955", description: ""},
  {id: "ER", name: "Eritrea", value: "1955", description: ""},
  {id: "HN", name: "Honduras", value: "1955", description: ""},
  {id: "NI", name: "Nicaragua", value: "1955", description: ""},
  {id: "PE", name: "Peru", value: "1955", description: ""},
  {id: "BJ", name: "Benin", value: "1956", description: ""},
  {id: "KM", name: "Comoros", value: "1956", description: ""},
  {id: "EG", name: "Egypt", value: "1956", description: ""},
  {id: "GA", name: "Gabon", value: "1956", description: ""},
  {id: "ML", name: "Mali", value: "1956", description: ""},
  {id: "MU", name: "Mauritius", value: "1956", description: ""},
  {id: "SO", name: "Somalia", value: "1956", description: ""},
  {id: "KY", name: "Cayman Islands", value: "1957", description: ""},
  {id: "MY", name: "Malaysia", value: "1957", description: ""},
  {id: "BF", name: "Burkina Faso", value: "1958", description: ""},
  {id: "TD", name: "Chad", value: "1958", description: ""},
  {id: "GN", name: "Guinea", value: "1958", description: ""},
  {id: "LA", name: "Laos", value: "1958", description: ""},
  {id: "NG", name: "Nigeria", value: "1958", description: ""},
  {
    id: "BN",
    name: "Brunei",
    value: "1959",
    description: "Elections currently suspended since 1962 and 1965.<br/>Only in local elections are they permitted."
  },
  {id: "MG", name: "Madagascar", value: "1959", description: ""},
  {id: "SM", name: "San Marino", value: "1959", description: ""},
  {id: "TZ", name: "Tanzania", value: "1959", description: ""},
  {id: "TN", name: "Tunisia", value: "1959", description: ""},
  {id: "BS", name: "Bahamas", value: "1960", description: ""},
  {id: "CY", name: "Cyprus", value: "1960", description: ""},
  {id: "GM", name: "Gambia", value: "1960", description: ""},
  {id: "TO", name: "Tonga", value: "1960", description: ""},
  {id: "BI", name: "Burundi", value: "1961", description: ""},
  {id: "MW", name: "Malawi", value: "1961", description: ""},
  {id: "MR", name: "Mauritania", value: "1961", description: ""},
  {id: "PY", name: "Paraguay", value: "1961", description: ""},
  {id: "RW", name: "Rwanda", value: "1961", description: ""},
  {
    id: "SL",
    name: "Sierra Leone",
    value: "1961",
    description: "In the 1790s, while Sierra Leone was still a colony,<br/>women voted in the elections."
  },
  {
    id: "DZ",
    name: "Algeria",
    value: "1962",
    description: "In 1962, on its independence from France, <br/>Algeria granted equal voting rights to all men and women."
  },
  {id: "MC", name: "Monaco", value: "1962", description: ""},
  {id: "UG", name: "Uganda", value: "1962", description: ""},
  {id: "ZM", name: "Zambia", value: "1962", description: ""},
  {id: "AF", name: "Afghanistan", value: "1963", description: ""},
  {id: "CD", name: "Congo, Republic of the", value: "1963", description: ""},
  {id: "GQ", name: "Equatorial Guinea", value: "1963", description: ""},
  {id: "FJ", name: "Fiji", value: "1963", description: ""},
  {id: "IR", name: "Iran", value: "1963", description: ""},
  {id: "KE", name: "Kenya", value: "1963", description: ""},
  {id: "MA", name: "Morocco", value: "1963", description: ""},
  {id: "LY", name: "Kingdom of Libya", value: "1964", description: ""},
  {id: "PG", name: "Papua New Guinea", value: "1964", description: ""},
  {id: "SD", name: "Sudan", value: "1964", description: ""},
  {id: "SS", name: "Sudan", value: "1964", description: ""},
  {id: "BW", name: "Botswana", value: "1965", description: ""},
  {id: "LS", name: "Lesotho", value: "1965", description: ""},
  {id: "CG", name: "Congo", value: "1967", description: ""},
  {id: "KI", name: "Kiribati", value: "1967", description: ""},
  {id: "TV", name: "Tuvalu", value: "1967", description: ""},
  {id: "NR", name: "Nauru", value: "1968", description: ""},
  {id: "SZ", name: "Swaziland", value: "1968", description: ""},
  {id: "AD", name: "Andorra", value: "1970", description: ""},
  {id: "YE", name: "Yemen", value: "1970", description: "1967 - South, 1970 - North Yemen"},
  {id: "BD", name: "Bangladesh", value: "1971", description: ""},
  {
    id: "CH",
    name: "Switzerland",
    value: "1971",
    description: "Women obtained the right to vote in national elections in 1971. <br/>" +
    "Women obtained the right to vote at local canton level<br/>" +
    "between 1959 (Vaud and Neuchâtel in that year)<br/>and 1990 (Appenzell Innerrhoden)."
  },
  {id: "JO", name: "Jordan", value: "1974", description: ""},
  {id: "SB", name: "Solomon Islands", value: "1974", description: ""},
  {id: "AO", name: "Angola", value: "1975", description: ""},
  {id: "CV", name: "Cape Verde", value: "1975", description: ""},
  {id: "MZ", name: "People's Republic of Mozambique", value: "1975", description: ""},
  {id: "ST", name: "São Tomé and Príncipe", value: "1975", description: ""},
  {id: "VU", name: "Vanuatu", value: "1975", description: ""},
  {id: "TL", name: "Timor-Leste", value: "1976", description: ""},
  {id: "GW", name: "Guinea-Bissau", value: "1977", description: ""},
  {id: "MH", name: "Marshall Islands", value: "1979", description: ""},
  {id: "FM", name: "Micronesia", value: "1979", description: ""},
  {id: "PW", name: "Palau", value: "1979", description: ""},
  {id: "IQ", name: "Iraq", value: "1980", description: ""},
  {id: "LI", name: "Liechtenstein", value: "1984", description: ""},
  {
    id: "KW",
    name: "Kuwait",
    value: "2005",
    description: "1985 – women's suffrage later removed in 1999,<br/>re-granted in 2005"
  },
  {id: "CF", name: "Central African Republic", value: "1986", description: ""},
  {
    id: "NA",
    name: "Namibia",
    value: "1989",
    description: "At independence from South Africa.<br/>1989 - upon its independence"
  },
  {id: "AS", name: "Samoa", value: "1990", description: ""},
  {id: "QA", name: "Qatar", value: "1997", description: ""},
  {id: "BH", name: "Bahrain", value: "2002", description: ""},
  {id: "OM", name: "Oman", value: "2003", description: ""},
  {id: "AE", name: "United Arab Emirates", value: "2006", description: "Limited suffrage for both men and women"}
];
var dataSet = anychart.data.set(data);
function getDescription(id) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == id) return data[i].description;
  }
}