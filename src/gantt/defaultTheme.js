goog.provide('anychart.ganttModule.defaultTheme');
goog.require('anychart.utils');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'ganttDefaultSimpleLabelsSettings': {
    'fontSize': 11,
    'vAlign': 'middle',
    'height': '100%',
    // 'textOverflow': true,
    'padding': {
      'left': 4,
      'top': 0,
      'right': 4,
      'bottom': 0
    }
  },

  'defaultLevelsLabelsSettings': {
    'fontSize': 10,
    'format': anychart.core.defaultTheme.returnValueAsIs,
    'textOverflow': true
  },

  'defaultGanttHeader': {
    'stroke': anychart.core.defaultTheme.ganttDefaultStroke,
    'background': {
      'fill': '#f7f7f7',
      'enabled': true
    }
  },

  'defaultLevelSettings': {
    'height': null
  },

  'defaultDataGrid': {
    'isStandalone': true,
    'headerHeight': 25,
    'fixedColumns': false,

    'backgroundFill': 'none',
    'columnStroke': anychart.core.defaultTheme.ganttDefaultStroke,

    'rowHoverFill': anychart.core.defaultTheme.returnSourceColor,
    'rowSelectedFill': anychart.core.defaultTheme.returnSourceColor,

    'rowStroke': anychart.core.defaultTheme.ganttDefaultStroke,
    'rowOddFill': 'none',
    'rowEvenFill': 'none',
    'rowFill': 'none',

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
      'padding': [0, 0, 0, 0],
      'width': 15,
      'height': 15,
      'cursor': 'pointer',
      'normal': {
        'hAlign': 'center',
        'vAlign': 'middle',
        'fontColor': '#7c868e',
        'fontSize': 12,
        // 'content': '+',
        'content': '▸',
        'background': {
          'fill': '#fff 0.00001',
          'stroke': 'none'
        }
      },
      'hovered': {},
      'selected': {
        'content': '▾'
        // 'content': '-'
      }
    },

    'zIndex': 5,
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
      'depthPaddingMultiplier': 0,
      'collapseExpandButtons': false,
      'title': {
        'text': 'Column',
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
        'title': {
          'text': '#'
        }
      },
      {
        'width': 170,
        'collapseExpandButtons': true,
        'depthPaddingMultiplier': 15,
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
    'rowOddFill': 'none',
    'rowEvenFill': 'none',
    'rowFill': 'none',

    'workingFill': 'none',
    'notWorkingFill': 'lightblue 0.5',
    'holidaysFill': '#cecece 0.5',
    'weekendsFill': '#cecece 0.5',

    'zIndex': 5,
    'headerHeight': 70,

    'elements': {
      'enabled': true,
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
        }
      },
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
        }
      },
      'startMarker': {
        'enabled': false,
        'anchor': 'center',
        'size': 6,
        'offsetX': 0,
        'offsetY': 0,
        'rotation': 0,
        'position': 'left-center',
        'type': 'triangle-right'
      },
      'endMarker': {
        'enabled': false,
        'anchor': 'center',
        'size': 6,
        'offsetX': 0,
        'offsetY': 0,
        'rotation': 0,
        'position': 'right-center',
        'type': 'triangle-left'
      }
    },

    'tasks': {
      'progress': {
        'height': '100%',
        'anchor': 'left-center',
        'drawOverEnd': true,
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
          'stroke': '#545f69'
        }
      }
    },

    'groupingTasks': {
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
          'stroke': '#545f69'
        }
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
          var markerType = this['markerType'];
          var radius = bounds.width / 2;
          anychart.utils.getMarkerDrawer(markerType)(path, bounds.left + radius, bounds.top + radius, radius);
        }
      },
      'preview': {
        'enabled': false,
        'rendering': {
          /**
           * @this {*}
           * @return {*}
           */
          'drawer': function() {
            var shapes = this['shapes'];
            var path = shapes['path'];
            var bounds = this['predictedBounds'];
            var markerType = this['markerType'];
            var radius = bounds.width / 2;
            anychart.utils.getMarkerDrawer(markerType)(path, bounds.left + radius, bounds.top + radius, radius);
          },
          'shapes': [
            {
              'name': 'path',
              'shapeType': 'path',
              'zIndex': 12,
              'disablePointerEvents': false
            }
          ]
        },
        'labels': {
          'enabled': false,
          'format': '{%Name}',
          'background': {
            'enabled': true,
            'fill': 'white 0.7'
          }
        },
        'depth': null,
        'position': 'left-top',
        'markerType': 'diamond'
      },
      'markerType': 'diamond'
    },

    'baselines': {
      'above': false,
      'disableWithRelatedTask': false,
      'progress': {
        'height': '50%',
        'anchor': 'left-bottom',
        'position': 'left-bottom',
        'drawOverEnd': true,
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
        'labels': {
          'format': '{%baselineProgress}'
        },
        'edit': {
          'fill': '#eaeaea',
          'stroke': '#545f69'
        }
      }
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
      'anchor': 'center',
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
    'zoomOnMouseWheel': false
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
        'format': '{%Name}',
        'position': 'center',
        'anchor': 'center',
        'enabled': false
      },
      'milestones': {
        'labels': {
          'anchor': 'left-center',
          'position': 'right-center',
          'enabled': null
        },
        'tooltip': {
          'format': '{%start}'
        }
      }
    }
  },
  'ganttProject': {
    'dataGrid': {
      'tooltip': {
        'titleFormat': '{%Name}',
        'format': 'Start Date: {%start}\nEnd Date: {%end}\nComplete: {%progress}'
      }
    },
    'timeline': {
      'elements': {
        'labels': {
          'format': '{%Progress}',
          'position': 'right-center',
          'anchor': 'left-center',
          'enabled': null
        },
        'tooltip': {
          'titleFormat': '{%Name}',
          'format': 'Start Date: {%start}\nEnd Date: {%end}\nComplete: {%progress}'
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
        },
        'tooltip': {
          'format': 'Start Date: {%start}\nEnd Date: {%end}\nBaseline Start: {%baselineStart}\nBaseline End: {%baselineEnd}\nComplete: {%progress}\nBaseline Progress: {%baselineProgress}'
        }
      },
      'milestones': {
        'labels': {
          'format': '{%Name}',
          'anchor': 'left-center',
          'position': 'right-center',
          'enabled': null
        },
        'tooltip': {
          'format': '{%start}'
        }
      }
    }
  }
});

goog.mixin(goog.global['anychart']['themes']['defaultTheme']['standalones'], {
  'projectTimeline': {
    'tooltip': {
      'titleFormat': '{%Name}',
      'format': 'Start Date: {%start}\nEnd Date: {%start}\nComplete: {%progress}'
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
