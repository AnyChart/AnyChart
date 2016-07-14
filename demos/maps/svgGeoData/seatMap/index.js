var stage, chart;

$(document).ready(function() {
  stage = anychart.graphics.create('container');

  $.ajax({
    type: 'GET',
    url: 'pin.svg',
    success: function(data) {
      chart = anychart.seatMap();
      chart.geoData(data);
      // chart.interactivity().zoomOnMouseWheel(true);
      chart.interactivity().zoomOnMouseWheel(true);
      chart.interactivity().keyboardZoomAndMove(true);
      chart.unboundRegions(true);

      var legend = chart.legend();
      legend.enabled(true);
      legend.itemsSourceMode(anychart.enums.LegendItemsSourceMode.CATEGORIES);
      legend.position('right');
      legend.itemsLayout(anychart.enums.Layout.VERTICAL);

      var series = chart.choropleth([
        {id: '1', value: 'type1'},
        {id: '2', value: 'type1'},
        {id: '3', value: 'type2'},
        {id: '4', value: 'type2'},
        {id: '5', value: 'type3'},
        {id: '7', value: 'type3'},
        {id: '6', value: 'type3'},
        {id: '8', value: 'type3'}
      ]);

      series.colorScale(anychart.scales.ordinalColor([
        {'equal': 'type1', 'color': 'red'},
        {'equal': 'type2', 'color': 'yellow'},
        {'equal': 'type3', 'color': 'blue'}
      ]));

      series.fill(function() {
        var attrs = this.attributes;
        if (attrs) {
          var class_ = attrs.class;
          switch (class_) {
            case 'main':
              return anychart.color.lighten(this.scaledColor, .8);
            case 'innerFrame':
              return anychart.color.lighten(this.scaledColor, .5);
            case 'pin1':
              return anychart.color.lighten(this.scaledColor, .6);
            case 'pin2':
              return anychart.color.lighten(this.scaledColor, .1);
            case 'pin3':
              return anychart.color.lighten(this.scaledColor, .1);
          }
        }
      });

      series.hoverFill(function() {
        var attrs = this.attributes;
        if (attrs) {
          var class_ = attrs.class;
          switch (class_) {
            case 'main':
              return anychart.color.lighten('#757575', .8);
            case 'innerFrame':
              return anychart.color.lighten('#757575', .5);
            case 'pin1':
              return anychart.color.lighten('#757575', .6);
            case 'pin2':
              return anychart.color.lighten('#757575', .1);
            case 'pin3':
              return anychart.color.lighten('#757575', .1);
          }
        }
      });

      chart.container(stage).draw();
    }
  });
});
