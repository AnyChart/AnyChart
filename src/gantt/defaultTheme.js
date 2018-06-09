goog.provide('anychart.ganttModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {

  'defaultDataGrid': {
    'isStandalone': true,
    'headerHeight': 25,

    'backgroundFill': 'none',
    'columnStroke': anychart.core.defaultTheme.ganttDefaultStroke,

    'rowHoverFill': anychart.core.defaultTheme.returnSourceColor,
    'rowSelectedFill': anychart.core.defaultTheme.returnSourceColor,

    'rowStroke': anychart.core.defaultTheme.ganttDefaultStroke,
    'rowOddFill': '#fff',
    'rowEvenFill': '#fff',
    'rowFill': '#fff',

    /**
     * @this {*}
     * @return {*}
     */
    'onEditStart': function() {
      return this['columnIndex'] < 1 ? {'cancelEdit': true} : {'value': this['value']};
    },

    /**
     * @this {*}
     * @return {*}
     */
    'onEditEnd': function() {
      return this['columnIndex'] == 1 ? {'itemMap': {'name': this['value']}} : {'cancelEdit': true};
    },

    'buttons': {
      'size': 15,
      'padding': [0, 0, 0, 0],
      'cursor': 'pointer',
      'normal': {
        'hAlign': 'center',
        'vAlign': 'middle',
        'fontColor': '#7c868e',
        'fontSize': '10px'
      },
      'collapsed': {
        'hAlign': 'center',
        'vAlign': 'middle',
        'text': '+'
      },
      'expanded': {
        'hAlign': 'center',
        'vAlign': 'middle',
        'text': '-'
      }
    },

    'zIndex': 5,
    // 'editing': false,
    // 'editStructurePreviewFill': {
    //   'color': '#4285F4',
    //   'opacity': 0.2
    // },
    // 'editStructurePreviewStroke': {
    //   'color': '#4285F4',
    //   'thickness': 2
    // },
    // 'editStructurePreviewDashStroke': {
    //   'color': '#4285F4',
    //   'dash': '4 4'
    // },
    'headerFill': '#f7f7f7',
    'tooltip': {
      'padding': 5,
      'title': {
        'enabled': true,
        'fontSize': '14px',
        'fontWeight': 'normal',
        'fontColor': '#e5e5e5'
      },
      'separator': {
        'enabled': true
      },
      'format': '{%name}'
    },
    'defaultColumnSettings': {
      'width': 90,
      'buttonCursor': 'pointer',
      'labels': {
        'enabled': true,
        'wordBreak': 'break-all',
        'anchor': 'left-top',
        'vAlign': 'middle',
        'padding': {
          'top': 0,
          'right': 5,
          'bottom': 0,
          'left': 5
        },
        'background': null,
        'fontSize': 11,
        'disablePointerEvents': true
      },
      'depthPaddingMultiplier': 0,
      'collapseExpandButtons': false,
      'title': {
        'enabled': true,
        'margin': 0,
        'vAlign': 'middle',
        'hAlign': 'center',
        'background': {
          'enabled': false
        },
        'wordWrap': 'normal',
        'wordBreak': 'normal'
      }
    },
    'columns': [
      {
        'width': 50,
        'labels': {
          'format': '{%linearIndex}'
        },
        'title': {
          'text': '#'
        }
      },
      {
        'width': 170,
        'collapseExpandButtons': true,
        'depthPaddingMultiplier': 15,
        'labels': {
          'format': '{%name}'
        },
        'title': {
          'text': 'Name'
        }
      }
    ]
  },

  'defaultTimeline': {
    'isStandalone': true,

    'columnStroke': anychart.core.defaultTheme.ganttDefaultStroke,
    'backgroundFill': 'none',

    'rowHoverFill': anychart.core.defaultTheme.returnSourceColor,
    'rowSelectedFill': anychart.core.defaultTheme.returnSourceColor,

    'rowStroke': anychart.core.defaultTheme.ganttDefaultStroke,
    'rowOddFill': '#fff',
    'rowEvenFill': '#fff',
    'rowFill': '#fff',

    'zIndex': 5,
    'headerHeight': 70,
    // 'editing': false,

    // 'connectorPreviewStroke': {
    //   'color': '#545f69',
    //   'dash': '3 3'
    // },

    // 'editPreviewFill': {
    //   'color': '#fff',
    //   'opacity': 0.00001
    // },

    // 'editPreviewStroke': {
    //   'color': '#aaa',
    //   'dash': '3 3'
    // },

    // 'editProgressFill': '#EAEAEA',
    // 'editProgressStroke': '#545f69',
    // 'editIntervalThumbFill': '#EAEAEA',
    // 'editIntervalThumbStroke': '#545f69',
    // 'editConnectorThumbFill': '#EAEAEA',
    // 'editConnectorThumbStroke': '#545f69',

    // 'editStructurePreviewFill': {
    //   'color': '#4285F4',
    //   'opacity': 0.2
    // },
    //
    // 'editStructurePreviewStroke': {
    //   'color': '#4285F4',
    //   'thickness': 2
    // },
    //
    // 'editStructurePreviewDashStroke': {
    //   'color': '#4285F4',
    //   'dash': '4 4'
    // },

    // 'editStartConnectorMarkerType': 'circle',
    // 'editStartConnectorMarkerSize': 10,
    // 'editStartConnectorMarkerHorizontalOffset': 0,
    // 'editStartConnectorMarkerVerticalOffset': 0,
    // 'editFinishConnectorMarkerType': 'circle',
    // 'editFinishConnectorMarkerSize': 10,
    // 'editFinishConnectorMarkerHorizontalOffset': 0,
    // 'editFinishConnectorMarkerVerticalOffset': 0,
    // 'editIntervalWidth': 3,

    //all another settings should be set to 'null' for serialization demerging purposes

    'elements': {
      'anchor': 'auto',
      'position': 'left-center',
      'offset': 0,
      'height': '70%',
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': anychart.core.defaultTheme.returnSourceColor
      },
      'selected': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': anychart.core.defaultTheme.returnSourceColor
      },
      'labels': {
        'enabled': null
      },
      'rendering': {
        /**
         * @this {*}
         * @return {*}
         */
        'drawer': function() {
          var shapes = this['shapes'];
          var path = shapes['path'];
          var bounds = this['predictedBounds'];
          anychart.graphics['vector']['primitives']['roundedRect'](path, bounds, 0);
        },
        'shapes': [
          {
            'name': 'path',
            'shapeType': 'path',
            'zIndex': 10,
            'disablePointerEvents': false
          }
        ]
      },
      'edit': {
        'thumbs': {
          'fill': '#eaeaea',
          'stroke': '#545f69',
          'size': 3,
          'enabled': true
        },
        'connectorThumbs': {
          'fill': '#eaeaea',
          'stroke': '#545f69',
          'size': 10,
          'type': 'circle',
          'verticalOffset': 0,
          'horizontalOffset': 0,
          'enabled': true
        },
        'fill': {
          'color': '#fff',
          'opacity': 0.00001
        },
        'stroke': {
          'color': '#aaa',
          'dash': '3 3'
        },
        'enabled': null
      }
    },

    'tasks': {
      'progress': {
        'height': '100%',
        'anchor': 'left-center',
        'rendering': {
          'shapes': [
            {
              'name': 'path',
              'shapeType': 'path',
              'zIndex': 11,
              'disablePointerEvents': true
            }
          ]
        },
        'edit': {
          'fill': '#eaeaea',
          'stroke': '#545f69',
          'enabled': null
        }
      }
    },

    'groupingTasks': {
      'rendering': {
        /**
         * @this {*}
         * @return {*}
         */
        'drawer': function() {
          var shapes = this['shapes'];
          var path = shapes['path'];
          var bounds = this['predictedBounds'];

          var right = bounds.left + bounds.width;
          var top = bounds.top + bounds.height;
          var top2 = bounds.top + bounds.height * 1.4;
          path
              .moveTo(bounds.left, bounds.top)
              .lineTo(right, bounds.top)
              .lineTo(right, top2)
              .lineTo(right - 1, top2)
              .lineTo(right - 1, top)
              .lineTo(bounds.left + 1, top)
              .lineTo(bounds.left + 1, top2)
              .lineTo(bounds.left, top2)
              .close();
        }
      }
    },

    'milestones': {
      'rendering': {
        /**
         * @this {*}
         * @return {*}
         */
        'drawer': function() {
          var shapes = this['shapes'];
          var path = shapes['path'];
          var bounds = this['predictedBounds'];
          var radius = bounds.width / 2;
          anychart.graphics['vector']['primitives']['diamond'](path, bounds.left + radius, bounds.top + radius, radius);
        }
      }
    },

    'baselines': {
      'above': false
    },

    'connectors': {
      'previewStroke': {
        'color': '#545f69',
        'dash': '3 3'
      },
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': anychart.core.defaultTheme.returnSourceColor
      },
      'selected': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': anychart.core.defaultTheme.returnSourceColor
      }
    },

    // 'connectorFill': '#545f69',
    // 'connectorStroke': '#545f69',
    'tooltip': {
      'padding': 5,
      'title': {
        'enabled': true,
        'fontSize': '14px',
        'fontWeight': 'normal',
        'fontColor': '#e5e5e5'
      },
      'separator': {
        'enabled': true
      },
      'zIndex': 100
    },
    'labels': {
      'enabled': true,
      'anchor': 'left-center',
      'position': 'right-center',
      'padding': {
        'top': 3,
        'right': 5,
        'bottom': 3,
        'left': 5
      },
      'vAlign': 'middle',
      'background': null,
      'fontSize': 11,
      'zIndex': 40,
      'disablePointerEvents': true
    },
    'markers': {
      'anchor': 'center-top',
      'zIndex': 50,
      'type': 'star5',
      'fill': '#ff0',
      'stroke': '2 red'
    },
    'defaultLineMarkerSettings': {
      'layout': 'vertical',
      'zIndex': 1.5
    },
    'defaultRangeMarkerSettings': {
      'layout': 'vertical',
      'zIndex': 1
    },
    'defaultTextMarkerSettings': {
      'layout': 'vertical',
      'zIndex': 2
    },
    'header': {
      'background': {
        'enabled': false,
        'fill': '#f7f7f7'
      },
      'fill': '#f7f7f7',
      'stroke': anychart.core.defaultTheme.ganttDefaultStroke,
      'anchor': 'left-top',
      'fontSize': 10,
      'vAlign': 'middle',
      'holidays': {
        'padding': {}
      },
      //'format': anychart.core.defaultTheme.returnValueAsIs,
      'padding': {
        'top': 0,
        'right': 5,
        'bottom': 0,
        'left': 5
      },
      'disablePointerEvents': true
    }
  },

  // merge with chart
  'ganttBase': {
    'defaultRowHoverFill': '#f8fafb',
    'defaultRowSelectedFill': '#ebf1f4',
    'splitterPosition': '30%',
    'headerHeight': 70,
    'rowStroke': '#cecece',
    'rowHoverFill': anychart.core.defaultTheme.returnSourceColor,
    'rowSelectedFill': anychart.core.defaultTheme.returnSourceColor,
    // 'editing': false,
    'edit': {
      'fill': {
        'color': '#4285F4',
        'opacity': 0.2
      },
      'stroke': {
        'color': '#4285F4',
        'thickness': 2
      },
      'placementStroke': {
        'color': '#4285F4',
        'dash': '4 4'
      },
      'enabled': false
    },
    'title': {
      'enabled': false
    },
    'legend': {
      'enabled': false
    },
    'background': {
      'fill': '#fff'
    },
    'margin': 0,
    'padding': 0,
    'dataGrid': {
      'isStandalone': false,
      'backgroundFill': 'none',
      'tooltip': {
        'zIndex': 100
      }
    },
    'timeline': {
      'isStandalone': false,
      'labels': {
        'padding': [0, 4, 0, 4]
      },
      'header': {
        'enabled': true,
        'overlay': {
          'enabled': false
        },
        'textOverflow': '',
        'stroke': '#ccc',
        'padding': [0, 5, 0, 5],
        'fontSize': 10,
        'vAlign': 'middle',
        'hAlign': 'center',
        'drawTopLine': false,
        'drawRightLine': false,
        'drawBottomLine': false,
        'drawLeftLine': false
      }
    }
  },

  'ganttResource': {
    'dataGrid': {
      'tooltip': {
        'titleFormat': '{%Name}',
        'format': 'Start Date: {%start}\nEnd Date: {%end}'
      }
    },
    'timeline': {
      'tooltip': {
        'titleFormat': '{%Name}',
        'format': 'Start Date: {%start}\nEnd Date: {%end}'
      },
      'labels': {
        'format': 'Progress Label',
        'position': 'center',
        'anchor': 'center',
        'enabled': false
      }
    }
  },
  'ganttProject': {
    'dataGrid': {
      'tooltip': {
        'titleFormat': '{%Name}',
        'format': 'Start Date: {%actualStart}\nEnd Date: {%actualEnd}\nComplete: {%progress}'
      }
    },
    'timeline': {
      'tooltip': {
        'titleFormat': '{%Name}',
        'format': 'Start Date: {%actualStart}\nEnd Date: {%actualEnd}\nComplete: {%progress}'
      },
      'elements': {
        'labels': {
          'format': '{%Progress}',
          'position': 'right-center',
          'anchor': 'left-center',
          'enabled': null
        }
      },
      'tasks': {
        'progress': {
          'labels': {
            'format': '{%Progress}',
            'enabled': false
          }
        }
      },
      'groupingTasks': {
        'progress': {
          'labels': {
            'format': '{%Progress}',
            'enabled': false
          }
        }
      },
      'baselines': {
        'labels': {
          'position': 'right-center',
          'anchor': 'left-center',
          'format': 'Baseline Label',
          'enabled': false
        }
      },
      'milestones': {
        'labels': {
          'format': '{%Name}',
          'anchor': 'left-center',
          'position': 'right-center',
          'enabled': null
        }
      }
    }
  }
});

goog.mixin(goog.global['anychart']['themes']['defaultTheme']['standalones'], {
  'projectTimeline': {
    'tooltip': {
      'titleFormat': '{%Name}',
      'format': 'Start Date: {%actualStart}\nEnd Date: {%actualEnd}\nComplete: {%progress}'
    }
  },
  'resourceTimeline': {
    'tooltip': {
      'titleFormat': '{%Name}',
      'format': 'Start Date: {%start}\nEnd Date: {%end}'
    }
  },
  'dataGrid': {
    'enabled': true,
    'zIndex': 0
  }
});
