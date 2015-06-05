Base = function(props) {
  if (!props) props = {};
  if (!this.props)
    this.props = {
      acdvf: '',
      description: '',
      variable: '',
      graphics: '',
      inherited: '',
      children: null
    };
  goog.object.extend(this.props, props);
  return this.props;
};
Text = function(props) {
  this.props = {
    acdvf: 'none',
    description: 'text',
    graphics: '<text>'
  };
  return goog.base(this, props);
};
goog.inherits(Text, Base);
Layer = function(props) {
  this.props = {
    acdvf: 'none',
    description: 'layer',
    graphics: '<g>'
  };
  return goog.base(this, props);
};
goog.inherits(Layer, Base);
Path = function(props) {
  this.props = {
    acdvf: 'none',
    description: 'path',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(Path, Base);
Rect = function(props) {
  this.props = {
    acdvf: 'none',
    description: 'rect',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(Rect, Base);

var ui = {};
ui.Background = function(props) {
  this.props = {
    acdvf: 'ui.Background',
    description: 'background',
    variable: 'rect_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(ui.Background, Base);
ui.Title = function(props) {
  this.props = {
    acdvf: 'ui.Title',
    description: 'title',
    variable: 'layer_',
    graphics: '<g>',
    inherited: '',
    children: [
      new ui.Background({description: 'title background'}),
      new Text({description: 'title text'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.Title, Base);

ui.Label = function(props) {
  this.props = {
    acdvf: 'ui.Label',
    description: 'label',
    variable: 'none',
    graphics: '',
    children: [
      ui.Background({description: 'label background'}),
      Text({description: 'label text'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.Label, Base);

ui.LegendItem = function(props) {
  this.props = {
    acdvf: 'ui.LegendItem',
    description: 'legend item',
    variable: 'layer_',
    graphics: '<g>',
    children: [
      new Text({description: 'item text'}),
      new Path({description: 'icon'}),
      new Path({description: 'icon marker'}),
      new Path({description: 'icon hatch'}),
      new Rect({description: 'events listener'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.LegendItem, Base);

ui.Separator = function(props) {
  this.props = {
    acdvf: 'ui.Separator',
    description: 'separator',
    variable: 'path_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(ui.Separator, Base);

ui.PaginatorButton = function(props) {
  this.props = {
    acdvf: 'ui.PaginatorButton',
    description: 'paginator button',
    children: [
      new Text({description: 'button text', inherited: 'ui.Button'}),
      new Path({description: 'background path'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.PaginatorButton, Base);

ui.Paginator = function(props) {
  this.props = {
    acdvf: 'ui.Paginator',
    description: 'paginator',
    variable: 'none',
    graphics: '',
    children: [
      new ui.Background({description: 'paginator background'}),
      new ui.PaginatorButton({description: 'paginator left button', variable: '(paginator rootElement)'}),
      new Text({description: 'paginator text'}),
      new ui.PaginatorButton({description: 'paginator right button', variable: '(paginator rootElement)'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.Paginator, Base);

ui.Legend = function(props) {
  this.props = {
    acdvf: 'ui.Legend',
    description: 'legend',
    variable: 'rootElement',
    graphics: '<g>',
    children: [
      new Layer({
        description: 'legend dataLayer',
        children: [new ui.LegendItem()]
      }),
      new ui.Background({description: 'legend background'}),
      new ui.Title({description: 'legend title'}),
      new ui.Separator({description: 'legend separator'}),
      new ui.Paginator({description: 'legend paginator', variable: '(legend rootElement)'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.Legend, Base);

ui.Labels = function(props) {
  this.props = {
    acdvf: 'ui.Labels',
    description: 'labels factory',
    variable: 'layer_',
    graphics: '<g>',
    children: [
      new ui.Labels.Label()
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.Labels, Base);

ui.Labels.Label = function(props) {
  this.props = {
    acdvf: 'ui.Labels.Label',
    description: 'labels factory label',
    variable: 'layer_',
    graphics: '<g>',
    children: [
      new ui.Background({description: 'label background'}),
      new Text({description: 'label text'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.Labels.Label, Base);

ui.Markers = function(props) {
  this.props = {
    acdvf: 'ui.Markers',
    description: 'markers factory',
    variable: 'layer_',
    graphics: '<g>',
    children: [
      new ui.Markers.Marker()
    ]
  };
  return goog.base(this, props);
};
goog.inherits(ui.Markers, Base);
ui.Markers.Marker = function(props) {
  this.props = {
    acdvf: 'ui.Markers.Marker',
    description: 'markers factory marker',
    variable: 'markerElement_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(ui.Markers.Marker, Base);


var charts = {};
charts.Pie = function(props) {
  this.props = {
    acdvf: 'charts.Pie',
    description: 'Pie chart',
    variable: 'rootElement',
    graphics: '<g>',
    inherited: 'core.Chart',
    children: [
      new ui.Background({description: 'chart background', inherited: 'core.Chart'}),
      new ui.Title({description: 'chart title', inherited: 'core.Chart'}),
      new ui.Legend({description: 'chart legend', inherited: 'core.SeparateChart'}),
      new Layer({
        description: 'pie data layer',
        children: [new Path({description: 'pie slice'})]
      }),
      new Layer({
        description: 'pie hatch layer',
        children: [new Path({description: 'pie hatch slice'})]
      }),
      new ui.Labels({description: 'pie labels factory'}),
      new Layer({
        description: 'label connectors layer',
        children: [new Path({description: 'connectors path'})]
      }),
      new Path({description: '-||- disabled by algorithm'}),
      new ui.Label({description: 'chart label', variable: '(chart rootElement)', inherited: 'core.Chart'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(charts.Pie, Base);

var axes = {};
axes.Ticks = function(props) {
  this.props = {
    acdvf: 'axes.Ticks',
    description: 'ticks',
    variable: 'path_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(axes.Ticks, Base);
axes.Linear = function(props) {
  this.props = {
    acdvf: 'axes.Linear',
    description: 'linear axis',
    variable: '(root)',
    children: [
      new ui.Title({description: 'axis title'}),
      new Path({description: 'axis line'}),
      new ui.Labels({description: 'axis labels factory'}),
      new ui.Labels({description: 'axis minor labels factory'}),
      new axes.Ticks({description: 'axis ticks'}),
      new axes.Ticks({description: 'axis minor ticks'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(axes.Linear, Base);

var axisMarkers = {};
axisMarkers.Line = function(props) {
  this.props = {
    acdvf: 'axisMarkers.Line',
    description: 'line axis marker',
    variable: 'markerElement_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(axisMarkers.Line, Base);
axisMarkers.Range = function(props) {
  this.props = {
    acdvf: 'axisMarkers.Range',
    description: 'range axis marker',
    variable: 'markerElement_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(axisMarkers.Range, Base);
axisMarkers.Text = function(props) {
  this.props = {
    acdvf: 'axisMarkers.Text',
    description: 'text axis marker',
    variable: 'markerElement_',
    graphics: '<text>'
  };
  return goog.base(this, props);
};
goog.inherits(axisMarkers.Text, Base);

var bullet = {};
bullet.Marker = function(props) {
  this.props = {
    acdvf: 'bullet.Marker',
    description: 'bullet marker',
    variable: 'path_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(bullet.Marker, Base);

charts.Bullet = function(props) {
  this.props = {
    acdvf: 'charts.Bullet',
    description: 'Bullet chart',
    variable: 'rootElement',
    graphics: '<g>',
    inherited: 'core.Chart',
    children: [
      new ui.Background({description: 'chart background', inherited: 'core.Chart'}),
      new ui.Title({description: 'chart title', inherited: 'core.Chart'}),
      new bullet.Marker(),
      new axes.Linear({description: 'bullet axis', variable: '(chart rootElement)'}),
      new axisMarkers.Range('bullet range axis marker')
    ]
  };
  return goog.base(this, props);
};
goog.inherits(charts.Bullet, Base);

var sparkline = {};
sparkline.series = {};
sparkline.series.Column = function(props) {
  this.props = {
    acdvf: 'sparkline.series.Column',
    description: 'sparkline column series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'sparkline.series.Base',
    children: [
      new Layer({
        description: 'point layer',
        children: [new Rect({descpription: 'point path'})]
      }),
      new Layer({
        description: 'point hatch layer',
        children: [new Rect({descpription: 'point hatch path'})]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(sparkline.series.Column, Base);
sparkline.series.WinLoss = function(props) {
  return goog.base(this, props);
};
goog.inherits(sparkline.series.WinLoss, sparkline.series.Column);
sparkline.series.Line = function(props) {
  this.props = {
    acdvf: 'sparkline.series.Line',
    description: 'sparkline line series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'sparkline.series.Base',
    children: [
      new Path({description: 'line path', inherited: 'sparkline.series.ContinuousBase'}),
      new Path({description: 'hatchFill path', inherited: 'sparkline.series.ContinuousBase'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(sparkline.series.Line, Base);
sparkline.series.Area = function(props) {
  this.props = {
    acdvf: 'sparkline.series.Area',
    description: 'sparkline area series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'sparkline.series.Base',
    children: [
      new Path({description: 'area path', inherited: 'sparkline.series.ContinuousBase'}),
      new Path({description: 'area hatchFill path', inherited: 'sparkline.series.ContinuousBase'}),
      new Path({description: 'area stroke path'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(sparkline.series.Area, Base);


charts.Sparkline = function(props) {
  this.props = {
    acdvf: 'charts.Sparkline',
    description: 'Sparkline chart',
    variable: 'rootElement',
    graphics: '<g>',
    inherited: 'core.Chart',
    children: [
      new ui.Background({description: 'chart background', inherited: 'core.Chart'}),
      new ui.Title({description: 'chart title', inherited: 'core.Chart'}),
      new axisMarkers.Line({description: 'sparkline line axis marker'}),
      new axisMarkers.Range({description: 'sparkline range axis marker'}),
      new axisMarkers.Text({description: 'sparkline text axis marker'}),
      new ui.Labels({description: 'series labels'}),
      new ui.Markers({description: 'series markers'}),
      {
        acdvf: 'SERIES', description: 'one of spark series',
        children: [
          new sparkline.series.Column(),
          new sparkline.series.WinLoss({acdvf: 'sparkline.series.WinLoss', description: 'sparkline winloss series'}),
          new sparkline.series.Line(),
          new sparkline.series.Area()
        ]
      }
    ]
  };
  return goog.base(this, props);
};
goog.inherits(charts.Sparkline, Base);
var radar = {};
radar.series = {};

radar.series.Marker = function(props) {
  this.props = {
    acdvf: 'radar.series.Marker',
    description: 'radar marker series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'radar.series.Base',
    children: [
      ui.Markers({description: 'points factory'}),
      ui.Markers({description: 'points hatch factory'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(radar.series.Marker, Base);

radar.series.Line = function(props) {
  this.props = {
    acdvf: 'radar.series.Line',
    description: 'radar line series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'radar.series.Base',
    children: [
      new Path({description: 'line path', inherited: 'radar.series.ContinuousBase'}),
      new Path({description: 'hatchFill path', inherited: 'radar.series.ContinuousBase'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(radar.series.Line, Base);
radar.series.Area = function(props) {
  this.props = {
    acdvf: 'radar.series.Area',
    description: 'radar area series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'radar.series.Base',
    children: [
      new Path({description: 'area path', inherited: 'radar.series.ContinuousBase'}),
      new Path({description: 'area hatchFill path', inherited: 'radar.series.ContinuousBase'}),
      new Path({description: 'area stroke path'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(radar.series.Area, Base);
axes.RadialTicks = function(props) {
  this.props = {
    acdvf: 'axes.RadialTicks',
    description: 'radial ticks',
    variable: 'line_',
    graphics: '<path>'
  };
  return goog.base(this, props);
};
goog.inherits(axes.RadialTicks, Base);
axes.Radar = function(props) {
  this.props = {
    acdvf: 'axes.Radar',
    description: 'radar axis',
    variable: '(root)',
    children: [
      new Path({description: 'axis line'}),
      new ui.Labels({description: 'axis labels factory'}),
      new axes.RadialTicks({description: 'radar axis ticks'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(axes.Radar, Base);
axes.Radial = function(props) {
  this.props = {
    acdvf: 'axes.Radial',
    description: 'radial axis',
    variable: '(root)',
    children: [
      new Path({description: 'axis line'}),
      new ui.Labels({description: 'axis labels factory'}),
      new ui.Labels({description: 'axis minor labels factory'}),
      new axes.RadialTicks({description: 'axis ticks'}),
      new axes.RadialTicks({description: 'axis minor ticks'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(axes.Radial, Base);
var grids = {};
grids.Radar = function(props) {
  this.props = {
    acdvf: 'grids.Radar',
    description: 'radar grids',
    variable: '(root)',
    children: [
      new Path({description: 'grid line'}),
      new Layer({
        description: 'odd paths',
        children: [new Path({description: 'grid odd path'})]
      }),
      new Layer({
        description: 'even paths',
        children: [new Path({description: 'grid even path'})]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(grids.Radar, Base);


charts.Radar = function(props) {
  this.props = {
    acdvf: 'charts.Radar',
    description: 'Radar chart',
    variable: 'rootElement',
    graphics: '<g>',
    inherited: 'core.Chart',
    children: [
      new ui.Background({description: 'chart background', inherited: 'core.Chart'}),
      new ui.Title({description: 'chart title', inherited: 'core.Chart'}),
      new ui.Legend({description: 'chart legend', inherited: 'core.SeparateChart'}),

      new ui.Labels({description: 'series labels'}),
      new ui.Markers({description: 'series markers'}),
      new axes.Radar({description: 'radar x axis'}),
      new axes.Radial({description: 'radar y axis'}),
      new grids.Radar({description: 'radar grid'}),
      new grids.Radar({description: 'radar minor grid'}),
      {
        acdvf: 'SERIES', description: 'radar series',
        children: [
          new radar.series.Marker(),
          new radar.series.Line(),
          new radar.series.Area()
        ]
      }
    ]
  };
  return goog.base(this, props);
};
goog.inherits(charts.Radar, Base);

grids.Polar = function(props) {
  this.props = {
    acdvf: 'grids.Polar',
    description: 'polar grids',
    variable: '(root)',
    children: [
      new Path({description: 'grid line'}),
      new Layer({
        description: 'odd paths',
        children: [new Path({description: 'grid odd path'})]
      }),
      new Layer({
        description: 'even paths',
        children: [new Path({description: 'grid even path'})]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(grids.Polar, Base);
axes.Polar = function(props) {
  this.props = {
    acdvf: 'axes.Polar',
    description: '',
    variable: '(root)',
    children: [
      {acdvf: 'none', description: 'axis line', graphics: '<circle>'},
      new ui.Labels({description: 'axis labels factory'}),
      new ui.Labels({description: 'axis minor labels factory'}),
      new axes.RadialTicks({description: 'polar axis ticks'}),
      new axes.RadialTicks({description: 'polar axis minor ticks'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(axes.Polar, Base);



var polar = {};
polar.series = {};

polar.series.Marker = function(props) {
  this.props = {
    acdvf: 'polar.series.Marker',
    description: 'polar marker series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'polar.series.Base',
    children: [
      ui.Markers({description: 'points factory'}),
      ui.Markers({description: 'points hatch factory'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(polar.series.Marker, Base);

polar.series.Line = function(props) {
  this.props = {
    acdvf: 'polar.series.Line',
    description: 'polar line series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'polar.series.Base',
    children: [
      new Path({description: 'line path', inherited: 'polar.series.ContinuousBase'}),
      new Path({description: 'hatchFill path', inherited: 'polar.series.ContinuousBase'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(polar.series.Line, Base);
polar.series.Area = function(props) {
  this.props = {
    acdvf: 'polar.series.Area',
    description: 'polar area series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'polar.series.Base',
    children: [
      new Path({description: 'area path', inherited: 'polar.series.ContinuousBase'}),
      new Path({description: 'area hatchFill path', inherited: 'polar.series.ContinuousBase'}),
      new Path({description: 'area stroke path'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(polar.series.Area, Base);

charts.Polar = function(props) {
  this.props = {
    acdvf: 'charts.Polar',
    description: 'Polar chart',
    variable: 'rootElement',
    graphics: '<g>',
    inherited: 'core.Chart',
    children: [
      new ui.Background({description: 'chart background', inherited: 'core.Chart'}),
      new ui.Title({description: 'chart title', inherited: 'core.Chart'}),
      new ui.Legend({description: 'chart legend', inherited: 'core.SeparateChart'}),

      new ui.Labels({description: 'series labels'}),
      new ui.Markers({description: 'series markers'}),
      new axes.Polar({description: 'polar x axis'}),
      new axes.Radial({description: 'polar y axis'}),
      new grids.Polar({description: 'polar grid'}),
      new grids.Polar({description: 'polar minor grid'}),
      {
        acdvf: 'SERIES', description: 'polar series',
        children: [
          new polar.series.Marker(),
          new polar.series.Line(),
          new polar.series.Area()
        ]
      }
    ]
  };
  return goog.base(this, props);
};
goog.inherits(charts.Polar, Base);

grids.Linear = function(props) {
  this.props = {
    acdvf: 'grids.Linear',
    description: 'linear grids',
    variable: '(root)',
    children: [
      new Path({description: 'grid line'}),
      new Layer({
        description: 'odd paths',
        children: [new Path({description: 'grid odd path'})]
      }),
      new Layer({
        description: 'even paths',
        children: [new Path({description: 'grid even path'})]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(grids.Linear, Base);
var scatter = {};
scatter.series = {};
scatter.series.Marker = function(props) {
  this.props = {
    acdvf: 'scatter.series.Marker',
    description: 'scatter marker series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'scatter.series.Base',
    children: [
      new Path({description: 'error path', inherited: 'scatter.series.Base'}),
      ui.Markers({description: 'points factory'}),
      ui.Markers({description: 'points hatch factory'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(scatter.series.Marker, Base);

scatter.series.Line = function(props) {
  this.props = {
    acdvf: 'scatter.series.Line',
    description: 'scatter line series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'scatter.series.Base',
    children: [
      new Path({description: 'error path', inherited: 'scatter.series.Base'}),
      new Path({description: 'line path'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(scatter.series.Line, Base);

scatter.series.Bubble = function(props) {
  this.props = {
    acdvf: 'scatter.series.Bubble',
    description: 'scatter bubble series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'scatter.series.Base',
    children: [
      new Layer({
        description: 'bubble points',
        children: [{acdvf: 'none', description: 'bubble point', graphics: '<circle>'}]
      }),
      new Layer({
        description: 'bubble points hatch',
        children: [{acdvf: 'none', description: 'bubble point hatch', graphics: '<circle>'}]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(scatter.series.Bubble, Base);


charts.Scatter = function(props) {
  this.props = {
    acdvf: 'charts.Scatter',
    description: 'Scatter chart',
    variable: 'rootElement',
    graphics: '<g>',
    inherited: 'core.Chart',
    children: [
      new ui.Background({description: 'chart background', inherited: 'core.Chart'}),
      new ui.Title({description: 'chart title', inherited: 'core.Chart'}),
      new ui.Legend({description: 'chart legend', inherited: 'core.SeparateChart'}),

      new grids.Linear({description: 'scatter grid'}),
      new grids.Linear({description: 'scatter minor grid'}),

      new axes.Linear({description: 'scatter x axis'}),
      new axes.Linear({description: 'scatter y axis'}),

      new axisMarkers.Line({description: 'scatter line axis marker'}),
      new axisMarkers.Range({description: 'scatter range axis marker'}),
      new axisMarkers.Text({description: 'scatter text axis marker'}),
      new ui.Labels({description: 'series labels'}),
      new ui.Markers({description: 'series markers'}),
      {
        acdvf: 'SERIES', description: 'scatter series',
        children: [
          new scatter.series.Marker(),
          new scatter.series.Bubble(),
          new scatter.series.Line()
        ]
      }
    ]
  };
  return goog.base(this, props);
};
goog.inherits(charts.Scatter, Base);
var cartesian = {};
cartesian.series = {};
cartesian.series.LineBased = function(props) {
  this.props = {
    acdvf: '',
    description: 'line based',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Path({description: 'error path', inherited: 'cartesian.series.Base'}),
      new Path({description: 'line path', inherited: 'cartesian.series.ContinuousBase'}),
      new Path({description: 'hatchFill path', inherited: 'cartesian.series.ContinuousBase'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.LineBased, Base);
cartesian.series.AreaBased = function(props) {
  this.props = {
    acdvf: '',
    description: 'area based',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Path({description: 'error path', inherited: 'cartesian.series.Base'}),
      new Path({description: 'line path', inherited: 'cartesian.series.ContinuousBase'}),
      new Path({description: 'hatchFill path', inherited: 'cartesian.series.ContinuousBase'}),
      new Path({description: 'stroke path', inherited: 'cartesian.series.AreaBase'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.AreaBased, Base);
cartesian.series.ContinuousRangeBased = function(props) {
  this.props = {
    acdvf: '',
    description: 'continuous range based',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Path({description: 'line path (fill)', inherited: 'cartesian.series.ContinuousBase'}),
      new Path({description: 'hatchFill path', inherited: 'cartesian.series.ContinuousBase'}),
      new Path({description: 'high path', inherited: 'cartesian.series.ContinuousRangeBase'}),
      new Path({description: 'low path', inherited: 'cartesian.series.ContinuousRangeBase'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.ContinuousRangeBased, Base);

cartesian.series.Marker = function(props) {
  this.props = {
    acdvf: 'cartesian.series.Marker',
    description: 'cartesian marker series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Path({description: 'error path', inherited: 'cartesian.series.Base'}),
      ui.Markers({description: 'points factory'}),
      ui.Markers({description: 'points hatch factory'})
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.Marker, Base);
cartesian.series.Bubble = function(props) {
  this.props = {
    acdvf: 'cartesian.series.Bubble',
    description: 'cartesian bubble series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Layer({
        description: 'bubble points',
        inherited: 'cartesian.series.DiscreteBase',
        children: [{acdvf: 'none', description: 'bubble point', graphics: '<circle>'}]
      }),
      new Layer({
        description: 'bubble points hatch',
        inherited: 'cartesian.series.DiscreteBase',
        children: [{acdvf: 'none', description: 'bubble point hatch', graphics: '<circle>'}]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.Bubble, Base);
cartesian.series.BarColumn = function(props) {
  this.props = {
    acdvf: '',
    description: 'cartesian bar/column series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Path({description: 'error path', inherited: 'cartesian.series.Base'}),
      new Layer({
        description: 'series points',
        inherited: 'cartesian.series.DiscreteBase',
        children: [{acdvf: 'none', description: 'series point', graphics: '<path>'}]
      }),
      new Layer({
        description: 'series points hatch',
        inherited: 'cartesian.series.DiscreteBase',
        children: [{acdvf: 'none', description: 'series point hatch', graphics: '<path>'}]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.BarColumn, Base);
cartesian.series.RangeBarColumnOHLC = function(props) {
  this.props = {
    acdvf: '',
    description: 'cartesian range bar/column/ohlc/candlestick series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Layer({
        description: 'series points',
        inherited: 'cartesian.series.DiscreteBase',
        children: [{acdvf: 'none', description: 'series point', graphics: '<path>'}]
      }),
      new Layer({
        description: 'series points hatch',
        inherited: 'cartesian.series.DiscreteBase',
        children: [{acdvf: 'none', description: 'series point hatch', graphics: '<path>'}]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.RangeBarColumnOHLC, Base);
cartesian.series.Box = function(props) {
  this.props = {
    acdvf: 'cartesian.series.Box',
    description: 'Box series',
    variable: 'rootLayer',
    graphics: '<g>',
    inherited: 'cartesian.series.Base',
    children: [
      new Layer({
        description: 'box points',
        inherited: 'cartesian.series.DiscreteBase',
        children: [
          {acdvf: 'none', description: 'box rect', graphics: '<path>'},
          {acdvf: 'none', description: 'box median', graphics: '<path>'},
          {acdvf: 'none', description: 'box stem', graphics: '<path>'},
          {acdvf: 'none', description: 'box whisker', graphics: '<path>'}
        ]
      }),
      new Layer({
        description: 'box points hatch',
        inherited: 'cartesian.series.DiscreteBase',
        children: [{acdvf: 'none', description: 'box point hatch', graphics: '<path>'}]
      })
    ]
  };
  return goog.base(this, props);
};
goog.inherits(cartesian.series.Box, Base);

charts.Cartesian = function(props) {
  this.props = {
    acdvf: 'chart.Cartesian',
    description: 'Cartesian chart',
    variable: 'rootElement',
    graphics: '<g>',
    inherited: 'core.Chart',
    children: [
      new ui.Background({description: 'chart background', inherited: 'core.Chart', collapsed: true}),
      new ui.Title({description: 'chart title', inherited: 'core.Chart', collapsed: true}),
      new ui.Legend({description: 'chart legend', inherited: 'core.SeparateChart', collapsed: true}),
      new grids.Linear({description: 'cartesian grid', collapsed: true}),
      new grids.Linear({description: 'cartesian minor grid', collapsed: true}),
      new axes.Linear({description: 'cartesian x axis', collapsed: true}),
      new axes.Linear({description: 'cartesian y axis', collapsed: true}),
      new axisMarkers.Line({description: 'cartesian line axis marker', collapsed: true}),
      new axisMarkers.Range({description: 'cartesian range axis marker', collapsed: true}),
      new axisMarkers.Text({description: 'cartesian text axis marker', collapsed: true}),
      new ui.Labels({description: 'series labels', collapsed: true}),
      new ui.Markers({description: 'series markers', collapsed: true}),
      new ui.Markers({description: 'box outlier markers', collapsed: true}),

      {
        acdvf: 'SERIES', description: 'cartesian series',
        children: [
          new cartesian.series.AreaBased({acdvf: 'cartesian.series.Area', description: 'area cartesian series', collapsed: true}),
          new cartesian.series.AreaBased({acdvf: 'cartesian.series.SplineArea', description: 'spline area cartesian series', collapsed: true}),
          new cartesian.series.AreaBased({acdvf: 'cartesian.series.StepArea', description: 'step area cartesian series', collapsed: true}),
          new cartesian.series.ContinuousRangeBased({acdvf: 'cartesian.series.RangeArea', description: 'range area cartesian series', collapsed: true}),
          new cartesian.series.ContinuousRangeBased({acdvf: 'cartesian.series.RangeSplineArea', description: 'range spline area cartesian series', collapsed: true}),
          new cartesian.series.ContinuousRangeBased({acdvf: 'cartesian.series.RangeStepArea', description: 'range step area cartesian series', collapsed: true}),
          new cartesian.series.LineBased({acdvf: 'cartesian.series.Line', description: 'line cartesian series', collapsed: true}),
          new cartesian.series.LineBased({acdvf: 'cartesian.series.Spline', description: 'spline cartesian series', collapsed: true}),
          new cartesian.series.LineBased({acdvf: 'cartesian.series.StepLine', description: 'stepline cartesian series', collapsed: true}),
          new cartesian.series.Marker({collapsed: true}),
          new cartesian.series.Bubble({collapsed: true}),
          new cartesian.series.BarColumn({acdvf: 'cartesian.series.Bar', description: 'bar cartesian series', collapsed: true}),
          new cartesian.series.BarColumn({acdvf: 'cartesian.series.Column', description: 'column cartesian series', collapsed: true}),
          new cartesian.series.RangeBarColumnOHLC({acdvf: 'cartesian.series.RangeBar', description: 'range bar cartesian series', collapsed: true}),
          new cartesian.series.RangeBarColumnOHLC({acdvf: 'cartesian.series.RangeColumn', description: 'range column cartesian series', collapsed: true}),
          new cartesian.series.RangeBarColumnOHLC({acdvf: 'cartesian.series.OHLC', description: 'ohlc cartesian series', collapsed: true}),
          new cartesian.series.RangeBarColumnOHLC({acdvf: 'cartesian.series.Candlestick', description: 'candlestick cartesian series', collapsed: true}),
          new cartesian.series.Box({collapsed: true})
        ]
      }
    ]
  };
  return goog.base(this, props);
};
goog.inherits(charts.Cartesian, Base);
