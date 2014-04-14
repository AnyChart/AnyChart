function load() {
  //console.log(new goog.format.JsonPrettyPrinter().format(data()));
  console.log(anychart.utils.json2xml(data(), 'chart'));
//  console.log(new goog.format.HtmlPrettyPrinter().format(anychart.utils.json2xml(data(), 'chart')));
  console.log(new goog.format.JsonPrettyPrinter().format(anychart.utils.xml2json(anychart.utils.json2xml(data(), 'chart'))));
}

function data() {
  return {
    'enabled': true,
        'zIndex': 0,
        'margin': {
      'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
    },
    'padding': {
      'top': 10,
          'right': 20,
          'bottom': 10,
          'left': 20
    },
    'background': {
      'enabled': true,
          'zIndex': 0,
          'fill': {
        'keys': [
          {
            'color': 'rgb(255,255,255)',
            'offset': 0
          },
          {
            'color': 'rgb(243,243,243)',
            'offset': 0.5
          },
          {
            'color': 'rgb(255,255,255)',
            'offset': 1
          }
        ],
            'angle': 0,
            'mode': false,
            'opacity': 1,
            'type': 'LinearGradientFill'
      },
      'stroke': {
        'color': 'rgb(36,',
            'opacity': 1
      },
      'corners': [],
          'cornerType': 'round'
    },
    'title': {
      'enabled': true,
          'zIndex': 0,
          'fontSize': '16px',
          'fontFamily': 'Arial',
          'fontColor': '#000',
          'fontOpacity': 1,
          'fontDecoration': 'none',
          'fontStyle': 'normal',
          'fontVariant': 'normal',
          'fontWeight': 'normal',
          'letterSpacing': 'normal',
          'direction': 'ltr',
          'lineHeight': 'normal',
          'textIndent': 0,
          'vAlign': 'top',
          'hAlign': 'start',
          'textWrap': 'byLetter',
          'textOverflow': '',
          'selectable': false,
          'useHtml': false,
          'text': 'Title text',
          'align': 'center',
          'orientation': 'top',
          'width': null,
          'height': null,
          'background': {
        'enabled': false,
            'zIndex': 0,
            'fill': '#000 0.5',
            'stroke': '#000',
            'corners': [],
            'cornerType': 'round'
      },
      'margin': {
        'top': 0,
            'right': 0,
            'bottom': 10,
            'left': 0
      },
      'padding': {
        'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0
      }
    }
  };
}
