var chart;
var data, data2;

function load() {
  data = [
    ['Product A', 70],
    ['Product B', 40],
    ['Product C', 120],
    ['Product D', 40],
    ['Product E', 50],
    ['Product F', 70]
  ];

  data2 = [
    {
      //name: 'Product A',
      name: 'Product A Product A',
      value: 70,
      //stroke: '10px #FFB2B2',
      marker: {
        //size: 10,
        //fill: '#66CCFF',
        //stroke: '1px red',
        position: 'lc'
      },
      hoverMarker: {
        stroke: '5px #99FF33'
      },
      label: {
        //anchor: 'leftTop',
        background: '#66CCFF'
      },
      hoverLabel: {
        fontColor: '#000099',
        fontSize: '20'
      },
      hatchFill: 'diagonalcross'
    },
    {
      //name: 'Product B',
      name: 'Product B Product B Product B Product B',
      value: 40,
      marker: {
        type: 'circle',
        size: 10,
        anchor: 'c',
        fill: '#FF3300',
        stroke: '1px #801A00',
        position: 'c'
      },
      hatchFill: 'none',
      hoverHatchFill: 'none',
      hoverLabel: {
        offsetY: 10
      }
    },
    {
      name: 'Product C',
      //name: 'Product C Product C Product C Product C Product C Product CProduct C',
      value: 120,
      marker: {
        size: 10,
        fill: '#66FF66',
        stroke: '1px #338033',
        position: 'rc'
      },
      hatchFill: 'horizontal',
      hoverHatchFill: 'none',
      label: {
        enabled: false
      }
    },
    {
      //name: 'Product D',
      name: 'Product D Product D Product D Product D Product D Product D Product D Product D',
      value: 40,
      marker: {
        size: 10,
        fill: '#FFCC00',
        stroke: '1px #997A00',
        position: 'bc'
      },
      hatchFill: 'none'
    },
    {
      //name: 'Product E',
      name: 'Product E Product E Product E Product E',
      value: 50,
      marker: {
        size: 10,
        fill: '#009933',
        stroke: '1px #005C1F',
        position: 'bc'
      },
      hoverLabel: {
        rotation: 45
      }
    },
    {
      //name: 'Product F',
      name: 'Product F Product F Product F Product F Product F Product F Product F Product F Product F Product F Product F',
      value: 70,
      marker: {
        size: 10,
        fill: '#E7901C',
        stroke: '1px #A36718'
      }
    }
  ];

  chart = anychart.funnel(data2);
  chart.legend()
      .enabled(true)
      .position('bottom')
      .itemsLayout('h');

  chart.hatchFill(true); // hatchFill('diagonalbrick');
  chart.baseWidth('80%');
  chart.neckHeight(90);
  //chart.pointsPadding(10);

  //chart.markers().position('tr');
  chart.markers()
       .enabled(true);

  chart.markers().size(20);

  //chart.markers().anchor('top');
  //chart.markers().anchor('righttop');

  // outside left labels
  //chart.labels().position('l');

  //chart.labels().position('r');

  //chart.labels().position('inside');
  //chart.overlapMode('allowOverlap');

  //chart.labels().offsetX(-10);

  //chart.palette(
  //  anychart.palettes.rangeColors()
  //          .colors(['red', 'yellow'])
  //          .count(data.length)
  //);

  chart.container('container').draw();
  console.log('consistency_', chart.consistency_);

  data2.push(['Product G', 50]);
  chart.data(data2);
  chart.draw();
  console.log('consistency_', chart.consistency_);

  //chart = anychart.fromJson(json);
  //chart = anychart.fromXml(xml);

  //chart.container('container').draw();
}