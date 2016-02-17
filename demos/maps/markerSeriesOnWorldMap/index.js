var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var series1, map;
anychart.onDocumentReady(function () {
  $('body').append('<div id="tooltip"></div>');
  $('#tooltip')
      .css({
        'position': 'absolute',
        'z-index': 1000,
        'pointerEvents': 'none',
        'font-size': '14px'
      });

  var dataSet = anychart.data.set([
    {name: "Afghanistan", id: "AF", percent: "0.02", amount: "6250"},
    {name: "Albania", id: "AL", percent: "17.0", amount: "580000"},
    {name: "Algeria", id: "DZ", percent: "2", amount: "270000"},
    {name: "American Samoa", id: "AS", percent: "98.3", amount: "70000"},
    {name: "Andorra", id: "AD", percent: "94.0", amount: "78000"},
    {name: "Angola", id: "AO", percent: "75", amount: "17094000"},
    {name: "Anguilla", id: "AI", percent: "90.5", amount: "15000"},
    {name: "Antigua and Barbuda", id: "AG", percent: "74.0", amount: "66000"},
    {name: "Argentina", id: "AR", percent: "90", amount: "37561000"},
    {name: "Armenia", id: "AM", percent: "98.7", amount: "3250000"},
    {name: "Aruba", id: "AW", percent: "88", amount: "98000"},
    {name: "Australia", id: "AU", percent: "63", amount: "14000990"},
    {name: "Austria", id: "AT", percent: "71.4", amount: "6119000"},
    {name: "Azerbaijan", id: "AZ", percent: "4.8", amount: "450000"},
    {name: "Bahamas", id: "BS", percent: "81", amount: "350000"},
    {name: "Bahrain", id: "BH", percent: "9.0", amount: "77000"},
    {name: "Bangladesh", id: "BD", percent: "0.3", amount: "420000"},
    {name: "Barbados", id: "BB", percent: "74", amount: "244000"},
    {name: "Belarus", id: "BY", percent: "55.4", amount: "5265109"},
    {name: "Belgium", id: "BE", percent: "64.1", amount: "6860000"},
    {name: "Belize", id: "BZ", percent: "76.7", amount: "247000"},
    {name: "Benin", id: "BJ", percent: "42.8", amount: "3943000"},
    {name: "Bermuda", id: "BM", percent: "64.7", amount: "44004"},
    {name: "Bhutan", id: "BT", percent: "1.0", amount: "7000"},
    {name: "Bolivia", id: "BO", percent: "89.0", amount: "9730000"},
    {name: "Bosnia and Herzegovina", id: "BA", percent: "52.0", amount: "2120000"},
    {name: "Botswana", id: "BW", percent: "71.6", amount: "1416000"},
    {name: "Brazil", id: "BR", percent: "90.2", amount: "175770000"},
    {name: "British Virgin Islands", id: "VG", percent: "94.0", amount: "23000"},
    {name: "Brunei", id: "BN", percent: "11.0", amount: "45000"},
    {name: "Bulgaria", id: "BG", percent: "84.0", amount: "6364000"},
    {name: "Burkina Faso", id: "BF", percent: "22.0", amount: "3746000"},
    {name: "Burundi", id: "BI", percent: "75.0", amount: "7662000"},
    {name: "Cambodia", id: "KH", percent: "1.0", amount: "148000"},
    {name: "Cameroon", id: "CM", percent: "65.0", amount: "13390000"},
    {name: "Canada", id: "CA", percent: "67.3", amount: "22102700"},
    {name: "Cape Verde", id: "CV", percent: "97.0", amount: "487000"},
    {name: "Cayman Islands", id: "KY", percent: "73.8", amount: "42000"},
    {name: "Central African Republic", id: "CF", percent: "80", amount: "2302000"},
    {name: "Chad", id: "TD", percent: "35.0", amount: "3833000"},
    {name: "Chile", id: "CL", percent: "68", amount: "9900000"},
    {name: "Colombia", id: "CO", percent: "90", amount: "47000000"},
    {name: "Comoros", id: "KM", percent: "2.1", amount: "15000"},
    {name: "Congo, Democratic Republic of", id: "CD", percent: "92", amount: "63150000"},
    {name: "Congo, Republic of", id: "CG", percent: "90.7", amount: "3409000"},
    {name: "Cook Islands", id: "CK", percent: "86", amount: "19000"},
    {name: "Costa Rica", id: "CR", percent: "83", amount: "3912000"},
    {name: "Croatia", id: "HR", percent: "91.06", amount: "4107000"},
    {name: "Cuba", id: "CU", percent: "85.0", amount: "9523000"},
    {name: "Cyprus", id: "CY", percent: "79.3", amount: "863000"},
    {name: "Czech Republic", id: "CZ", percent: "11.2", amount: "1175091"},
    {name: "Cote d'Ivoire", id: "CI", percent: "32.8", amount: "7075000"},
    {name: "Denmark", id: "DK", percent: "81", amount: "4610000"},
    {name: "Djibouti", id: "DJ", percent: "6.0", amount: "53000"},
    {name: "Dominica", id: "DM", percent: "88.7", amount: "59000"},
    {name: "Dominican Republic", id: "DO", percent: "95.2", amount: "9734000"},
    {name: "East Timor", id: "TL", percent: "98.4", amount: "1152000"},
    {name: "Ecuador", id: "EC", percent: "94.0", amount: "14099000"},
    {name: "Egypt", id: "EG", percent: "18.0", amount: "13892000"},
    {name: "El Salvador", id: "SV", percent: "81.9", amount: "5073000"},
    {name: "Equatorial Guinea", id: "GQ", percent: "98.6", amount: "683000"},
    {name: "Eritrea", id: "ER", percent: "62.9", amount: "3310000"},
    {name: "Estonia", id: "EE", percent: "23.9", amount: "310481"},
    {name: "Ethiopia", id: "ET", percent: "64", amount: "52580000"},
    {name: "Falkland Islands", id: "FK", percent: "94.3", amount: "3000"},
    {name: "Faroe Islands", id: "FO", percent: "94.0", amount: "46000"},
    {name: "Fiji", id: "FJ", percent: "64.4", amount: "540000"},
    {name: "Finland", id: "FI", percent: "81.6", amount: "4380000"},
    {name: "France", id: "FR", percent: "59.5", amount: "34121960"},
    {name: "Gabon", id: "GA", percent: "72.0", amount: "1081000"},
    {name: "Gambia", id: "GM", percent: "9.0", amount: "158000"},
    {name: "Georgia", id: "GE", percent: "88.6", amount: "3930000"},
    {name: "Germany", id: "DE", percent: "61", amount: "50000000"},
    {name: "Ghana", id: "GH", percent: "68.8", amount: "16741000"},
    {name: "Greece", id: "GR", percent: "98.0", amount: "11000000"},
    {name: "Greenland", id: "GL", percent: "96.6", amount: "55000"},
    {name: "Grenada", id: "GD", percent: "97.3", amount: "101000"},
    {name: "Guatemala", id: "GT", percent: "87", amount: "14018000"},
    {name: "Guinea", id: "GN", percent: "10.0", amount: "1032000"},
    {name: "Guinea-Bissau", id: "GW", percent: "10.0", amount: "165000"},
    {name: "Guyana", id: "GY", percent: "57.0", amount: "434000"},
    {name: "Haiti", id: "HT", percent: "96.0", amount: "9597000"},
    {name: "Honduras", id: "HN", percent: "88", amount: "6660000"},
    {name: "Hong Kong", id: "HK", percent: "10.1", amount: "710000"},
    {name: "Hungary", id: "HU", percent: "62.5", amount: "5240000"},
    {name: "Iceland", id: "IS", percent: "95.0", amount: "300000"},
    {name: "India", id: "IN", percent: "2.6", amount: "31850000"},
    {name: "Indonesia", id: "ID", percent: "10", amount: "24000000"},
    {name: "Iran", id: "IR", percent: "0.4", amount: "300000"},
    {name: "Iraq", id: "IQ", percent: "3.0", amount: "944000"},
    {name: "Ireland", id: "IE", percent: "94.1", amount: "4220000"},
    {name: "Israel", id: "IL", percent: "3.5", amount: "266000"},
    {name: "Italy", id: "IT", percent: "83", amount: "53230000"},
    {name: "Jamaica", id: "JM", percent: "65.3", amount: "1784000"},
    {name: "Japan", id: "JP", percent: "2.0", amount: "3548000"},
    {name: "Jordan", id: "JO", percent: "6.0", amount: "388000"},
    {name: "Kazakhstan", id: "KZ", percent: "51.0", amount: "8152000"},
    {name: "Kenya", id: "KE", percent: "85.1", amount: "34774000"},
    {name: "Korea, North", id: "KP", percent: "4.0", amount: "480000"},
    {name: "Korea, South", id: "KR", percent: "29.2", amount: "14601297"},
    {name: "Kuwait", id: "KW", percent: "15.0", amount: "458000"},
    {name: "Kyrgyzstan", id: "KG", percent: "17.0", amount: "944000"},
    {name: "Laos", id: "LA", percent: "2.2", amount: "145000"},
    {name: "Latvia", id: "LV", percent: "57", amount: "1250000"},
    {name: "Lebanon", id: "LB", percent: "41.0", amount: "1647000"},
    {name: "Lesotho", id: "LS", percent: "90.0", amount: "1876000"},
    {name: "Liberia", id: "LR", percent: "85.5", amount: "1391000"},
    {name: "Libya", id: "LY", percent: "2.0", amount: "131000"},
    {name: "Liechtenstein", id: "LI", percent: "89", amount: "30000"},
    {name: "Lithuania", id: "LT", percent: "84.9", amount: "2827000"},
    {name: "Luxembourg", id: "LU", percent: "71", amount: "360000"},
    {name: "Macedonia, Republic of", id: "MK", percent: "65.1", amount: "1334000"},
    {name: "Madagascar", id: "MG", percent: "41.0", amount: "8260000"},
    {name: "Malawi", id: "MW", percent: "79.9", amount: "12538000"},
    {name: "Malaysia", id: "MY", percent: "9.2", amount: "2820000"},
    {name: "Maldives", id: "MV", percent: "0.08", amount: "300"},
    {name: "Mali", id: "ML", percent: "5.0", amount: "726000"},
    {name: "Malta", id: "MT", percent: "97.0", amount: "400000"},
    {name: "Mauritania", id: "MR", percent: "0.14", amount: "5000"},
    {name: "Mauritius", id: "MU", percent: "32.2", amount: "418000"},
    {name: "Mexico", id: "MX", percent: "92", amount: "107780000"},
    {name: "Micronesia, Federated States of", id: "FM", percent: "95.4", amount: "106000"},
    {name: "Moldova", id: "MD", percent: "97.53", amount: "3480000"},
    {name: "Monaco", id: "MC", percent: "86.0", amount: "30000"},
    {name: "Mongolia", id: "MN", percent: "2.1", amount: "58000"},
    {name: "Montenegro", id: "ME", percent: "78.8", amount: "500000"},
    {name: "Morocco", id: "MA", percent: "2.1", amount: "651000"},
    {name: "Mozambique", id: "MZ", percent: "56.1", amount: "13120717"},
    {name: "Myanmar", id: "MM", percent: "7.9", amount: "3790000"},
    {name: "Namibia", id: "NA", percent: "90.0", amount: "1991000"},
    {name: "Nepal", id: "NP", percent: "0.9", amount: "269000"},
    {name: "Netherlands", id: "NL", percent: "34", amount: "5750297"},
    {name: "New Zealand", id: "NZ", percent: "43", amount: "2000000"},
    {name: "Nicaragua", id: "NI", percent: "84.6", amount: "5217000"},
    {name: "Niger", id: "NE", percent: "5.0", amount: "795000"},
    {name: "Nigeria", id: "NG", percent: "50", amount: "80510000"},
    {name: "Norway", id: "NO", percent: "86.2", amount: "4210000"},
    {name: "Oman", id: "OM", percent: "2.5", amount: "73000"},
    {name: "Pakistan", id: "PK", percent: "1.6", amount: "2500000"},
    {name: "Palau", id: "PW", percent: "77.9", amount: "16000"},
    {name: "Panama", id: "PA", percent: "92.0", amount: "3057000"},
    {name: "Papua New Guinea", id: "PG", percent: "97", amount: "6800000"},
    {name: "Paraguay", id: "PY", percent: "96", amount: "6260000"},
    {name: "People's Republic of China", id: "CN", percent: "2.3", amount: "31219740"},
    {name: "Peru", id: "PE", percent: "96", amount: "27635000"},
    {name: "Philippines", id: "PH", percent: "85", amount: "86500000"},
    {name: "Pitcairn Islands", id: "PN", percent: "100.0", amount: "50"},
    {name: "Poland", id: "PL", percent: "94.3", amount: "36090000"},
    {name: "Portugal", id: "PT", percent: "84", amount: "10110000"},
    {name: "Puerto Rico", id: "PR", percent: "97.0", amount: "3878000"},
    {name: "Qatar", id: "QA", percent: "13.8", amount: "262675"},
    {name: "Romania", id: "RO", percent: "99.5", amount: "21380000"},
    {name: "Russia", id: "RU", percent: "61.8", amount: "82887500"},
    {name: "Rwanda", id: "RW", percent: "93.6", amount: "9619000"},
    {name: "San Marino", id: "SM", percent: "97.0", amount: "31000"},
    {name: "Saudi Arabia", id: "SA", percent: "5", amount: "1500000"},
    {name: "Senegal", id: "SN", percent: "7.0", amount: "900000"},
    {name: "Serbia", id: "RS", percent: "93.5", amount: "7260000"},
    {name: "Seychelles", id: "SC", percent: "94.7", amount: "80000"},
    {name: "Sierra Leone", id: "SL", percent: "30.0", amount: "1751000"},
    {name: "Singapore", id: "SG", percent: "18.0", amount: "900000"},
    {name: "Slovakia", id: "SK", percent: "76.0", amount: "4730000"},
    {name: "Slovenia", id: "SI", percent: "79.2", amount: "1610000"},
    {name: "Somalia", id: "SO", percent: "0.01", amount: "1000"},
    {name: "South Africa", id: "ZA", percent: "80", amount: "40243000"},
    {name: "South Sudan", id: "SS", percent: "60.5", amount: "6010000"},
    {name: "Spain", id: "ES", percent: "73", amount: "36240000"},
    {name: "Sri Lanka", id: "LK", percent: "7.5", amount: "1531000"},
    {name: "Sudan", id: "SD", percent: "2", amount: ""},
    {name: "Suriname", id: "SR", percent: "48.4", amount: "262000"},
    {name: "Swaziland", id: "SZ", percent: "82.7", amount: "994000"},
    {name: "Sweden", id: "SE", percent: "67.2", amount: "6320000"},
    {name: "Switzerland", id: "CH", percent: "71", amount: "5700000"},
    {name: "Syria", id: "SY", percent: "10.0", amount: "2251000"},
    {name: "Tajikistan", id: "TJ", percent: "1.4", amount: "99000"},
    {name: "Tanzania", id: "TZ", percent: "62.0", amount: "27118000"},
    {name: "Thailand", id: "TH", percent: "1.2", amount: "778000"},
    {name: "Togo", id: "TG", percent: "29.0", amount: "1966000"},
    {name: "Tonga", id: "TO", percent: "81.0", amount: "84000"},
    {name: "Trinidad and Tobago", id: "TT", percent: "57.6", amount: "774000"},
    {name: "Tunisia", id: "TN", percent: "0.2", amount: "24000"},
    {name: "Turkey", id: "TR", percent: "0.2", amount: "120000"},
    {name: "Turkmenistan", id: "TM", percent: "9.0", amount: "466000"},
    {name: "Uganda", id: "UG", percent: "88.6", amount: "29943000"},
    {name: "Ukraine", id: "UA", percent: "33.6", amount: "15070965"},
    {name: "United Arab Emirates", id: "AE", percent: "9.0", amount: "424000"},
    {name: "United Kingdom", id: "GB", percent: "59.3", amount: "33200417"},
    {name: "United States", id: "US", percent: "73", amount: "246780000"},
    {name: "Uruguay", id: "UY", percent: "58.4", amount: "2127000"},
    {name: "Uzbekistan", id: "UZ", percent: "2.6", amount: "710000"},
    {name: "Vatican City", id: "VA", percent: "100.0", amount: "836"},
    {name: "Venezuela", id: "VE", percent: "88.0", amount: "28340000"},
    {name: "Vietnam", id: "VN", percent: "8.0", amount: "703000"},
    {name: "Western Sahara", id: "EH", percent: "0.04", amount: "200"},
    {name: "Yemen", id: "YE", percent: "0.013", amount: "3000"},
    {name: "Zambia", id: "ZM", percent: "97.6", amount: "12939000"},
    {name: "Zimbabwe", id: "ZW", percent: "85.0", amount: "10747000"}
  ]);

  var data = [];
  //var features = map.geoData()['features'];
  for (var i = 0, len = 1; i < len; i++) {
    //var feature = features[i];
    //if (feature['properties']) {
    //  var id = feature['properties'][chart.geoIdField()];
    //  data.push({'lat': randomExt(-55, 80), 'lon': randomExt(-180, 180), 'size': randomExt(0, 100)});
      data.push({'lat': -41.65, 'lon': 146.3});
    //  data.push({'lat': -41.65, 'lon': 146.3, 'size': randomExt(0, 100)});
    //}
  }
  //data.push({'lat': -31.65, 'lon': 146.3});

  //var data = dataSet.mapAs(null, {name: 'name', id: 'id', size: 'percent'});


  map = anychart.map();
  map.geoData(anychart.maps.world);


  //map.title().text('Christianity in the World by Country').enabled(true).padding([0, 0, 10, 0]);

  map.minBubbleSize(1);
  map.maxBubbleSize(30);

  series1 = map.marker(data);

  series1.geoIdField("iso_a2");
  //series1.size(2);
  series1.labels()
      .enabled(true)
      .textFormatter(function() {return 'lat: ' + this.lat + ' long: ' + this.long;});
  //series1.hatchFill(true);
  series1.tooltip(false);

// Sets container id for the chart
  map.container('container');

// Initiates chart drawing
  map.draw();

  $('#container').bind('mousemove drag', function(e) {
    var container = $('#container');
    var containerOffset = container.offset();
    var scrollLeft = $(document).scrollLeft();
    var scrollTop = $(document).scrollTop();

    var x = e.clientX - (containerOffset.left - scrollLeft);
    var y = e.clientY - (containerOffset.top - scrollTop);

    var latLon = map.scale().inverseTransform(x, y);
    var pxpy = map.scale().transform(latLon[0], latLon[1]);

    $('#tooltip').css({'left': e.clientX + 15, 'top': e.clientY + 15})
        .show()
        .html(
            'Client coords: ' + e.clientX + ' , ' + e.clientY + '<br>' +
            'Client coords_: ' + pxpy[0] + ' , ' + pxpy[1] + '<br>' +
            'Relative cont coords: ' + x + ' , ' + y + '<br>' +
              //'Scaled: ' + scaled[0] + ' , ' + scaled[1] + '<br>' +
            'Lat: ' + latLon[1].toFixed(4) + ' , ' + 'Lon: ' + latLon[0].toFixed(4)
        );
  });

  $(document).bind('mouseout dragend', function(e) {
    $('#tooltip').html('').hide();
  });
});
    