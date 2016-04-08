var france = anychart.map();
var dataSet = anychart.data.set([
  {name: "Normandy", lat: 49.706571, long: -1.889096, 'size': 51, desc: "This region can reserve good suprises.<br/>West and NorthWest during the winter.<br/>Sometines North-NorthEast (Good for the North coast)"},
  {name: "Brittanny North", lat: 48.579248, long: -4.632797, 'size': 51, desc: "It's a beautiful region, full of secret spots!<br/>W/SW all the year... Sometimes North."},
  {name: "Brittany South", lat: 48.094592, long: -4.306641, 'size': 48, desc: "A unknown region with hidden treasures.<br/>\"Cold\" but nor far from heaven...<br/>Dominant Swell: West to Southwest"},
  {name: "Vendee", lat: 46.394542, long: -1.51165, 'size': 24, desc: "This region is underated even by most of the french surfers.<br/>It has everything you want: beach breaks, point breaks, reefs, outer reefs.<br/>The most famous wave is La Sauzaie but it's just overcrowded."},
  {name: "Charente Maritime", lat: 46.131999, long: -1.14879, 'size': 24, desc: "Underated region."},
  {name: "Gironde", lat: 44.495893, long: -1.249952, 'size': 34, desc: "It's a beautiful region for surfing.<br/>Spots are only Beach-Breaks. SW to W all the year.<br/>Sometimes NW but the surf isn't perfect in this case."},
  {name: "Landes", lat: 43.626275, long: -1.45689, 'size': 28, desc: "La gravière, la piste, la nord, les estagnots...<br/>All very and great waves of les landes !!!<br/>West, SW and NW..."},
  {name: "Basque Country", lat: 43.378166, long: -1.762962, 'size': 32, desc: "The most famous region of surf in France."},
  {name: "Mediterranean", lat: 43.132842, long: 5.747952, 'size': 65, desc: "We can even have VERY GOOD waves but the main<br/>problem is the very low frequency...<br/>You have to be at the right spot on the right moment...<br/>On-shore winds are a problem too..."},
  {name: "Corsica", lat: 42.641378, long: 9.015806, 'size': 22, desc: "Most spots located near Calvi.<br/>Because of the island's position in the Med<br/>it gets some great winds and provides ideal<br/>conditions for a wide variety of water sports."}
]);
var customTheme = {
  "map": {
    'unboundRegions': {'enabled': true, 'fill': '#E1E1E1', 'stroke': '#D2D2D2'}
  }
};
anychart.theme(customTheme);
france.geoData(anychart.maps.france);

france.title("France Surf Areas by Lat/Long <br/>" +
    "<span style='color: #545f69; font-size: 13px'>(All coordinates were taken from Google Maps)</span>");
france.title().useHtml(true).padding([0,0,20,0]);

france.maxBubbleSize(50);
france.minBubbleSize(15);

var series = france.bubble(dataSet);
series.labels()
    .enabled(true)
    .anchor('leftBottom')
    .position('right')
    .useHtml(true)
    .textFormatter(function() {
      return this.getDataValue('name') + " <b>" + this.getDataValue('size')+ "</b>";
    });
series.selectionMode("none");

series.tooltip({ background: {fill: 'white', stroke: '#c1c1c1', corners: 3, cornerType: 'ROUND'}, padding: [8, 13, 10, 13] });
series.tooltip().textWrap('byLetter').useHtml(true);
series.tooltip().title().fontColor('#7c868e').useHtml(true);
series.tooltip().titleFormatter(function() {
  var span_for_value = ' (<span style="color: #545f69; font-size: 12px; font-weight: bold">';
  return this.getDataValue('name') + span_for_value + this.getDataValue('size') + '</span> spots)</strong>';
});
series.tooltip().textFormatter(function() {
  return '<span style="color: #545f69; font-size: 12px">' + this.getDataValue('desc') + '</span></strong>';
});