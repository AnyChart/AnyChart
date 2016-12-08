function d() {
  return this.value
}
function e() {
  return this.x
}
function f() {
  return (new Date(this.x)).toLocaleDateString("en-US", {year: "numeric", month: "numeric", day: "numeric"})
}
function g() {
  return this.sourceColor
}
function h() {
  return window.anychart.color.setOpacity(this.sourceColor, .7, !0)
}
function k() {
  return window.anychart.color.setOpacity(this.sourceColor, .65, !0)
}
function l() {
  return window.anychart.color.setOpacity(this.sourceColor, .85, !0)
}
function m() {
  return window.anychart.color.darken(this.sourceColor)
}
function n() {
  return window.anychart.color.lighten(this.sourceColor)
}
function p() {
  return window.anychart.color.setThickness(this.sourceColor, 1.5)
}
function q() {
  return window.anychart.color.setThickness(window.anychart.color.lighten(this.sourceColor), 1.5)
}
function u() {
  return window.anychart.color.setThickness(window.anychart.color.darken(this.sourceColor), 1.5)
}
function v() {
  return "High: " + parseFloat(this.high).toFixed(2) + "\nLow: " + parseFloat(this.low).toFixed(2)
}
function w() {
  return parseFloat(this.high).toFixed(2)
}
window.anychart = window.anychart || {};
window.anychart.themes = window.anychart.themes || {};
window.anychart.themes.defaultTheme = {
  palette: {type: "distinct", items: "#64b5f6 #1976d2 #ef6c00 #ffd54f #455a64 #96a6a6 #dd2c00 #00838f #00bfa5 #ffa000".split(" ")},
  hatchFillPalette: {items: "backwardDiagonal forwardDiagonal horizontal vertical dashedBackwardDiagonal grid dashedForwardDiagonal dashedHorizontal dashedVertical diagonalCross diagonalBrick divot horizontalBrick verticalBrick checkerBoard confetti plaid solidDiamond zigZag weave percent05 percent10 percent20 percent25 percent30 percent40 percent50 percent60 percent70 percent75 percent80 percent90".split(" ")},
  markerPalette: {items: "circle diamond square triangleDown triangleUp diagonalCross pentagon cross line star5 star4 trapezium star7 star6 star10".split(" ")},
  ordinalColor: {
    autoColors: function(a) {
      return window.anychart.color.blendedHueProgression("#ffd54f", "#ef6c00", a)
    }
  },
  defaultFontSettings: {
    fontSize: 13,
    fontFamily: "Verdana, Helvetica, Arial, sans-serif",
    fontColor: "#7c868e",
    textDirection: "ltr",
    fontOpacity: 1,
    fontDecoration: "none",
    fontStyle: "normal",
    fontVariant: "normal",
    fontWeight: "normal",
    letterSpacing: "normal",
    lineHeight: "normal",
    textIndent: 0,
    vAlign: "top",
    hAlign: "start",
    textWrap: "byLetter",
    textOverflow: "",
    selectable: !1,
    disablePointerEvents: !1,
    useHtml: !1
  },
  defaultBackground: {enabled: !1, fill: "#ffffff", stroke: "none", cornerType: "round", corners: 0},
  defaultSeparator: {enabled: !1, fill: "#CECECE 0.3", width: "100%", height: 1, margin: {top: 5, right: 0, bottom: 5, left: 0}, orientation: "top", stroke: "none", zIndex: 1},
  defaultLabelFactory: {enabled: !1, offsetX: 0, offsetY: 0, fontSize: 12, minFontSize: 8, maxFontSize: 72, adjustFontSize: {width: !1, height: !1}, anchor: "center", padding: {top: 4, right: 4, bottom: 4, left: 4}, rotation: 0, textFormatter: d, positionFormatter: d},
  defaultMarkerFactory: {
    size: 10,
    anchor: "center", offsetX: 0, offsetY: 0, rotation: 0, positionFormatter: d
  },
  defaultTitle: {enabled: !1, fontSize: 16, text: "Title text", width: null, height: null, align: "center", hAlign: "center", padding: {top: 0, right: 0, bottom: 0, left: 0}, margin: {top: 0, right: 0, bottom: 0, left: 0}},
  defaultTooltip: {
    enabled: !0,
    title: {enabled: !1, fontColor: "#ffffff", fontSize: 13, text: "", rotation: 0, width: null, height: null, align: "left", hAlign: "left", orientation: "top", zIndex: 1},
    content: {
      enabled: !0, fontSize: 11, minFontSize: 7, maxFontSize: 15, fontColor: "#ffffff",
      hAlign: "left", text: "Tooltip Text", width: null, height: null, anchor: "leftTop", offsetX: 0, offsetY: 0, position: "leftTop", adjustFontSize: {width: !1, height: !1}, padding: {top: 0, right: 0, bottom: 0, left: 0}, rotation: 0, zIndex: 1
    },
    fontSize: 13,
    minFontSize: 9,
    maxFontSize: 17,
    fontColor: "#ffffff",
    hAlign: "left",
    text: "Tooltip Text",
    width: null,
    height: null,
    adjustFontSize: {width: !1, height: !1},
    background: {enabled: !0, fill: "#212121 0.7", corners: 3, zIndex: 0},
    offsetX: 10,
    offsetY: 10,
    padding: {top: 5, right: 10, bottom: 5, left: 10},
    valuePrefix: "",
    valuePostfix: "",
    position: "leftTop",
    anchor: "leftTop",
    hideDelay: 0,
    titleFormatter: d,
    textFormatter: function() {
      return this.valuePrefix + this.value + this.valuePostfix
    }
  },
  defaultAxis: {
    enabled: !0,
    startAngle: 0,
    drawLastLabel: !0,
    drawFirstLabel: !0,
    staggerMaxLines: 2,
    staggerMode: !1,
    staggerLines: null,
    width: null,
    overlapMode: "noOverlap",
    stroke: "#CECECE",
    title: {padding: {top: 5, right: 5, bottom: 5, left: 5}, enabled: !1, fontSize: 13, text: "Axis title", fontColor: "#545f69", zIndex: 35},
    labels: {
      enabled: !0, textFormatter: d, positionFormatter: d,
      zIndex: 35
    },
    minorLabels: {enabled: !1, fontSize: 9, textFormatter: d, positionFormatter: d, zIndex: 35},
    ticks: {enabled: !0, length: 6, position: "outside", stroke: "#CECECE", zIndex: 35},
    minorTicks: {enabled: !1, length: 4, position: "outside", stroke: "#EAEAEA", zIndex: 35},
    zIndex: 35
  },
  defaultGridSettings: {enabled: !0, isMinor: !1, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: "none", evenFill: "none", stroke: "#CECECE", scale: 1, zIndex: 11},
  defaultMinorGridSettings: {isMinor: !0, stroke: "#EAEAEA", zIndex: 10},
  defaultLineMarkerSettings: {
    enabled: !0,
    value: 0, layout: "horizontal", stroke: {color: "#7c868e", thickness: 2, opacity: 1, dash: "", lineJoin: "miter", lineCap: "square"}, zIndex: 25.2, scale: 1
  },
  defaultTextMarkerSettings: {enabled: !0, fontSize: 12, value: 0, anchor: "center", align: "center", layout: "horizontal", offsetX: 0, offsetY: 0, text: "Text marker", width: null, height: null, zIndex: 25.3, scale: 1},
  defaultRangeMarkerSettings: {enabled: !0, from: 0, to: 0, layout: "horizontal", fill: "#c1c1c1 0.4", zIndex: 25.1, scale: 1},
  defaultLegend: {
    enabled: !1,
    vAlign: "bottom",
    fontSize: 12,
    itemsLayout: "horizontal",
    itemsSpacing: 15,
    items: null,
    itemsFormatter: null,
    itemsTextFormatter: null,
    itemsSourceMode: "default",
    inverted: !1,
    hoverCursor: "pointer",
    iconTextSpacing: 5,
    iconSize: 15,
    width: null,
    height: null,
    position: "top",
    align: "center",
    padding: {top: 5, right: 10, bottom: 15, left: 10},
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    title: {fontSize: 15},
    paginator: {enabled: !0, fontSize: 12, fontColor: "#545f69", orientation: "right", layout: "horizontal", padding: {top: 2, right: 2, bottom: 2, left: 2}, margin: {top: 0, right: 0, bottom: 0, left: 0}, zIndex: 30},
    titleFormatter: null,
    tooltip: {enabled: !1, allowLeaveScreen: !1, title: {enabled: !1}},
    zIndex: 20
  },
  defaultCrosshairLabel: {
    x: 0,
    y: 0,
    axisIndex: 0,
    anchor: null,
    textFormatter: d,
    enabled: !0,
    fontSize: 12,
    minFontSize: 8,
    maxFontSize: 16,
    fontColor: "#ffffff",
    fontWeight: 400,
    disablePointerEvents: !0,
    text: "Label text",
    background: {enabled: !0, fill: "#212121 0.7", corners: 3, zIndex: 0},
    padding: {top: 5, right: 10, bottom: 5, left: 10},
    width: null,
    height: null,
    offsetX: 0,
    offsetY: 0,
    adjustFontSize: {width: !1, height: !1},
    rotation: 0
  },
  chart: {
    enabled: !0,
    padding: {
      top: 30, right: 20,
      bottom: 20, left: 20
    },
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    background: {enabled: !0, zIndex: 1},
    title: {text: "Chart Title", padding: {top: 0, right: 0, bottom: 5, left: 0}, zIndex: 80},
    animation: {enabled: !1, duration: 1E3},
    interactivity: {hoverMode: "single", selectionMode: "multiSelect", spotRadius: 2, allowMultiSeriesSelection: !0},
    tooltip: {
      allowLeaveScreen: !1, allowLeaveChart: !0, displayMode: "single", positionMode: "float", title: {enabled: !0, fontSize: 13}, separator: {enabled: !0}, titleFormatter: function() {
        return this.points[0].x
      },
      textFormatter: function() {
        return this.formattedValues.join("\n")
      }
    },
    bounds: {top: null, right: null, bottom: null, left: null, width: null, height: null, minWidth: null, minHeight: null, maxWidth: null, maxHeight: null},
    credits: {enabled: !0, text: "AnyChart", url: "http://anychart.com", alt: "AnyChart.com", inChart: !1, logoSrc: "https://static.anychart.com/logo.png"},
    defaultSeriesSettings: {
      base: {
        enabled: !0,
        background: {enabled: !0},
        tooltip: {
          enabled: !0, title: {enabled: !0}, separator: {enabled: !0}, titleFormatter: function() {
            return this.x
          },
          textFormatter: function() {
            return this.seriesName + ": " + this.valuePrefix + this.value + this.valuePostfix
          }
        },
        hatchFill: !1,
        hoverLabels: {enabled: null},
        selectLabels: {enabled: null},
        markers: {enabled: !1, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, size: 4, positionFormatter: d},
        legendItem: {enabled: !0, iconType: "square"},
        fill: k,
        hoverFill: k,
        selectFill: k,
        stroke: p,
        hoverStroke: q,
        selectStroke: p,
        lowStroke: p,
        hoverLowStroke: q,
        highStroke: p,
        hoverHighStroke: q,
        hoverMarkers: {
          enabled: null,
          size: 6
        },
        selectMarkers: {enabled: null, size: 6},
        clip: !0,
        color: null,
        xScale: null,
        yScale: null,
        error: {mode: "both", xError: null, xUpperError: null, xLowerError: null, valueError: null, valueUpperError: null, valueLowerError: null, xErrorWidth: 10, valueErrorWidth: 10, xErrorStroke: m, valueErrorStroke: m},
        pointWidth: null,
        connectMissingPoints: !1
      },
      marker: {fill: l, hoverFill: n, selectFill: l, legendItem: {iconStroke: "none"}, labels: {anchor: "bottom", offsetY: 3}, size: 6, hoverSize: 8, selectSize: 8},
      bubble: {
        fill: h, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor,
              .5, !0)
        }, selectFill: h, hoverMarkers: {position: "center"}, displayNegative: !1, negativeFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))
        }, hoverNegativeFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))))
        }, selectNegativeFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))
        },
        negativeStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))))
        }, hoverNegativeStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))))
        }, selectNegativeStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))))
        },
        negativeHatchFill: null, hoverNegativeHatchFill: null, legendItem: {iconStroke: "none"}, labels: {position: "center", anchor: "center"}
      },
      areaLike: {fill: k, hoverFill: k, selectFill: k, markers: {position: "centerTop"}, hoverMarkers: {enabled: !0}, selectMarkers: {enabled: !0}, legendItem: {iconStroke: "none"}, labels: {anchor: "leftBottom"}},
      barLike: {fill: l, hoverFill: k, selectFill: l, legendItem: {iconStroke: "none"}, labels: {anchor: "centerBottom", position: "centerTop"}},
      lineLike: {
        labels: {anchor: "leftBottom"}, legendItem: {iconType: "line"},
        hoverMarkers: {enabled: !0}, selectMarkers: {enabled: !0}
      }
    },
    defaultLabelSettings: {enabled: !0, text: "Chart label", width: null, height: null, anchor: "leftTop", position: "leftTop", offsetX: 0, offsetY: 0, minFontSize: 8, maxFontSize: 72, adjustFontSize: {width: !1, height: !1}, rotation: 0, zIndex: 50},
    chartLabels: [],
    maxBubbleSize: "20%",
    minBubbleSize: "5%"
  },
  cartesianBase: {
    defaultSeriesSettings: {
      rangeArea: {labels: {textFormatter: w}, tooltip: {titleFormatter: e, textFormatter: v}},
      rangeSplineArea: {
        labels: {textFormatter: w}, tooltip: {
          titleFormatter: e,
          textFormatter: v
        }
      },
      rangeStepArea: {labels: {textFormatter: w}, tooltip: {titleFormatter: e, textFormatter: v}},
      bar: {markers: {position: "right"}, hoverMarkers: {position: "right"}, labels: {offsetX: 3, anchor: "leftCenter", position: "right"}},
      rangeBar: {markers: {position: "right"}, hoverMarkers: {position: "right"}, labels: {anchor: "leftCenter", offsetX: 3, textFormatter: w, position: "right"}, tooltip: {textFormatter: v}},
      column: {markers: {position: "centerTop"}, hoverMarkers: {position: "centerTop"}, labels: {offsetY: 3, anchor: "centerBottom"}},
      rangeColumn: {markers: {position: "centerTop"}, hoverMarkers: {position: "centerTop"}, labels: {position: "centerTop", anchor: "bottom", textFormatter: w}, tooltip: {textFormatter: v}},
      box: {
        medianStroke: m, hoverMedianStroke: g, selectMedianStroke: g, stemStroke: m, hoverStemStroke: g, selectStemStroke: g, whiskerStroke: m, hoverWhiskerStroke: m, selectWhiskerStroke: m, whiskerWidth: 0, hoverWhiskerWidth: null, selectWhiskerWidth: null, outlierMarkers: {
          enabled: !0, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0,
          offsetY: 0, type: "circle", size: 3, positionFormatter: d
        }, hoverOutlierMarkers: {enabled: null, size: 4}, selectOutlierMarkers: {enabled: null, size: 4}, tooltip: {
          titleFormatter: function() {
            return this.name || this.x
          }, textFormatter: function() {
            return "Lowest: " + this.valuePrefix + parseFloat(this.lowest).toFixed(2) + this.valuePostfix + "\nQ1: " + this.valuePrefix + parseFloat(this.q1).toFixed(2) + this.valuePostfix + "\nMedian: " + this.valuePrefix + parseFloat(this.median).toFixed(2) + this.valuePostfix + "\nQ3: " + this.valuePrefix + parseFloat(this.q3).toFixed(2) +
                this.valuePostfix + "\nHighest: " + this.valuePrefix + parseFloat(this.highest).toFixed(2) + this.valuePostfix
          }
        }
      },
      candlestick: {
        risingFill: g, risingStroke: p, hoverRisingFill: n, hoverRisingStroke: p, fallingFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))
        }, fallingStroke: u, hoverFallingFill: m, hoverFallingStroke: u, risingHatchFill: null, hoverRisingHatchFill: null, fallingHatchFill: null, hoverFallingHatchFill: null, selectRisingFill: "#333", selectFallingFill: "#333", selectRisingStroke: "#333",
        selectFallingStroke: "#333", tooltip: {
          textFormatter: function() {
            return "O: " + parseFloat(this.open).toFixed(4) + "\nH: " + parseFloat(this.high).toFixed(4) + "\nL: " + parseFloat(this.low).toFixed(4) + "\nC: " + parseFloat(this.close).toFixed(4)
          }
        }, markers: {position: "centerTop"}, labels: {position: "centerTop", anchor: "bottom", textFormatter: e}
      },
      ohlc: {
        fill: l, hoverFill: k, risingStroke: p, hoverRisingStroke: p, fallingStroke: u, hoverFallingStroke: u, selectRisingStroke: "#333", selectFallingStroke: "#333", tooltip: {
          textFormatter: function() {
            return "O: " +
                parseFloat(this.open).toFixed(4) + "\nH: " + parseFloat(this.high).toFixed(4) + "\nL: " + parseFloat(this.low).toFixed(4) + "\nC: " + parseFloat(this.close).toFixed(4)
          }
        }, markers: {position: "centerTop"}, hoverMarkers: {enabled: null, position: "centerTop"}, labels: {
          position: "centerTop", anchor: "bottom", textFormatter: function() {
            return this.x
          }
        }
      }
    },
    defaultXAxisSettings: {orientation: "bottom", title: {text: "X-Axis"}, scale: 0},
    defaultYAxisSettings: {orientation: "left", title: {text: "Y-Axis"}, scale: 1},
    xAxes: [{}],
    yAxes: [{}],
    grids: [],
    minorGrids: [],
    series: [],
    lineAxesMarkers: [],
    rangeAxesMarkers: [],
    textAxesMarkers: [],
    xScale: 0,
    yScale: 1,
    barsPadding: .4,
    barGroupsPadding: .8,
    maxBubbleSize: "20%",
    minBubbleSize: "5%",
    barChartMode: !1,
    scales: [{type: "ordinal", inverted: !1, names: [], ticks: {interval: 1}}, {
      type: "linear",
      inverted: !1,
      maximum: null,
      minimum: null,
      minimumGap: .1,
      maximumGap: .1,
      softMinimum: null,
      softMaximum: null,
      ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6},
      minorTicks: {mode: "linear", base: 0, count: 5},
      stackMode: "none",
      stickToZero: !0
    }],
    crosshair: {
      enabled: !1,
      displayMode: "float", xStroke: "#969EA5", yStroke: "#969EA5", zIndex: 41
    },
    xZoom: {continuous: !0, startRatio: 0, endRatio: 1},
    xScroller: {
      enabled: !1,
      fill: "#f7f7f7",
      selectedFill: "#ddd",
      outlineStroke: "none",
      height: 16,
      minHeight: null,
      maxHeight: null,
      autoHide: !1,
      orientation: "bottom",
      position: "afterAxes",
      allowRangeChange: !0,
      thumbs: {enabled: !0, autoHide: !1, fill: "#E9E9E9", stroke: "#7c868e", hoverFill: "#ffffff", hoverStroke: "#545f69"},
      zIndex: 35
    }
  },
  cartesian: {defaultSeriesType: "line", xAxes: [], yAxes: []},
  area: {
    defaultSeriesType: "area",
    tooltip: {displayMode: "union"}, interactivity: {hoverMode: "byX"}
  },
  bar: {
    barChartMode: !0,
    defaultSeriesType: "bar",
    defaultGridSettings: {layout: "vertical"},
    defaultMinorGridSettings: {layout: "vertical"},
    defaultLineMarkerSettings: {layout: "vertical"},
    defaultTextMarkerSettings: {layout: "vertical"},
    defaultRangeMarkerSettings: {layout: "vertical"},
    defaultXAxisSettings: {orientation: "left"},
    defaultYAxisSettings: {orientation: "bottom"},
    scales: [{type: "ordinal", inverted: !0, names: [], ticks: {interval: 1}}, {
      type: "linear", inverted: !1,
      maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0
    }],
    tooltip: {displayMode: "single", position: "right", anchor: "left", offsetX: 10, offsetY: 0},
    xScroller: {orientation: "left"}
  },
  column: {defaultSeriesType: "column", tooltip: {displayMode: "single", position: "centerTop", anchor: "bottom", offsetX: 0, offsetY: 10}},
  line: {
    defaultSeriesType: "line", tooltip: {displayMode: "union"},
    interactivity: {hoverMode: "byX"}
  },
  box: {defaultSeriesType: "box"},
  financial: {
    defaultSeriesType: "candlestick", defaultSeriesSettings: {candlestick: {tooltip: {titleFormatter: f}, labels: {textFormatter: f}}, ohlc: {tooltip: {titleFormatter: f}, labels: {textFormatter: f}}}, xAxes: [{
      labels: {
        textFormatter: function() {
          var a = new Date(this.tickValue), b = [" ", a.getUTCDate(), ", ", a.getUTCFullYear()].join("");
          switch (a.getUTCMonth()) {
            case 0:
              return "Jan" + b;
            case 1:
              return "Feb" + b;
            case 2:
              return "Mar" + b;
            case 3:
              return "Apr" + b;
            case 4:
              return "May" +
                  b;
            case 5:
              return "Jun" + b;
            case 6:
              return "Jul" + b;
            case 7:
              return "Aug" + b;
            case 8:
              return "Sep" + b;
            case 9:
              return "Oct" + b;
            case 10:
              return "Nov" + b;
            case 11:
              return "Dec" + b
          }
          return "Invalid date"
        }
      }
    }], scales: [{type: "dateTime", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {count: 4}, minorTicks: {count: 4}}, {
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6},
      minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0
    }]
  },
  cartesian3d: {
    zDepth: 10, zAngle: 45, defaultSeriesType: "column", zPadding: !1, defaultSeriesSettings: {
      base: {
        stroke: "none", hoverStroke: g, selectStroke: g, fill: g, hoverFill: function() {
          return window.anychart.color.lighten(this.sourceColor, .2)
        }, selectFill: function() {
          return window.anychart.color.lighten(this.sourceColor, .3)
        }
      }
    }, xAxes: [{}], yAxes: [{}]
  },
  bar3d: {zDepth: 10, zAngle: 45, zPadding: !1},
  column3d: {zDepth: 20, zAngle: 45, zPadding: !1},
  area3d: {
    zDepth: 10,
    zAngle: 45, zPadding: !1
  },
  heatMap: {
    scales: [{type: "ordinal", inverted: !1, names: [], ticks: {interval: 1}}, {type: "ordinal", inverted: !0, names: [], ticks: {interval: 1}}, {type: "ordinalColor"}],
    xScale: 0,
    yScale: 1,
    colorScale: 2,
    background: {enabled: !0},
    xAxes: [{}],
    yAxes: [{}],
    grids: [],
    padding: {top: 30, right: 20, bottom: 20, left: 20},
    tooltip: {
      enabled: !0, title: {enabled: !0, fontSize: 13, fontWeight: "normal"}, content: {fontSize: 11}, separator: {enabled: !0}, titleFormatter: function() {
        return this.name || this.x
      }, textFormatter: function() {
        if (void 0 !==
            this.heat) {
          var a = "Value: " + this.valuePrefix + this.heat + this.valuePostfix;
          isNaN(+this.heat) || (a += "\nPercent Value: " + (100 * this.heat / this.getStat("sum")).toFixed(1) + "%");
          return a
        }
        return "x: " + this.x + " y: " + this.y
      }
    },
    legendItem: {iconStroke: null},
    legend: {itemsSourceMode: "categories"},
    defaultXAxisSettings: {enabled: !0, orientation: "bottom", title: {text: "X-Axis"}},
    defaultYAxisSettings: {enabled: !0, orientation: "left", title: {text: "Y-Axis"}},
    fill: function() {
      var a;
      this.colorScale ? (a = this.iterator.get("heat"), a = this.colorScale.valueToColor(a)) :
          a = window.anychart.color.setOpacity(this.sourceColor, .85, !0);
      return a
    },
    hoverFill: "#545f69",
    selectFill: "#333",
    stroke: function() {
      var a;
      this.colorScale ? (a = this.iterator.get("heat"), a = this.colorScale.valueToColor(a)) : a = this.sourceColor;
      return window.anychart.color.setThickness(a, 1, .85)
    },
    hoverStroke: function() {
      return window.anychart.color.setThickness(this.sourceColor, 1, .85)
    },
    selectStroke: "none",
    labels: {
      enabled: !1,
      fontSize: 11,
      adjustFontSize: {width: !0, height: !0},
      minFontSize: 7,
      maxFontSize: 15,
      hAlign: "center",
      vAlign: "center",
      textWrap: "noWrap",
      fontWeight: "normal",
      fontColor: "#333",
      selectable: !1,
      background: {enabled: !1},
      padding: {top: 2, right: 4, bottom: 2, left: 4},
      position: "center",
      anchor: "center",
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      width: null,
      height: null,
      textFormatter: function() {
        return this.heat
      },
      positionFormatter: function() {
        return this.value
      }
    },
    hoverLabels: {fontColor: "#CECECE", enabled: null},
    selectLabels: {fontColor: "#fff", enabled: null},
    markers: {
      enabled: !1, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center",
      offsetX: 0, offsetY: 0, size: 4, positionFormatter: function() {
        return this.value
      }
    },
    hoverMarkers: {enabled: null, size: 6},
    selectMarkers: {enabled: null, fill: "#f5f500"},
    labelsDisplayMode: "drop",
    hatchFill: !1,
    clip: !0,
    xZoom: {continuous: !0, startRatio: 0, endRatio: 1},
    xScroller: {
      enabled: !1, fill: "#f7f7f7", selectedFill: "#ddd", outlineStroke: "none", height: 16, minHeight: null, maxHeight: null, autoHide: !1, orientation: "bottom", position: "afterAxes", allowRangeChange: !0, thumbs: {
        enabled: !0, autoHide: !1, fill: "#E9E9E9", stroke: "#7c868e",
        hoverFill: "#ffffff", hoverStroke: "#545f69"
      }, zIndex: 35
    },
    yZoom: {continuous: !0, startRatio: 0, endRatio: 1},
    yScroller: {
      enabled: !1,
      fill: "#f7f7f7",
      selectedFill: "#ddd",
      outlineStroke: "none",
      height: 16,
      minHeight: null,
      maxHeight: null,
      autoHide: !1,
      orientation: "right",
      inverted: !0,
      position: "afterAxes",
      allowRangeChange: !0,
      thumbs: {enabled: !0, autoHide: !1, fill: "#E9E9E9", stroke: "#7c868e", hoverFill: "#ffffff", hoverStroke: "#545f69"},
      zIndex: 35
    }
  },
  pieFunnelPyramidBase: {
    fill: g,
    hoverFill: n,
    selectFill: "#333",
    stroke: "none",
    hoverStroke: g,
    selectStroke: g,
    title: {padding: {top: 0, right: 0, bottom: 20, left: 0}},
    connectorStroke: "#CECECE",
    overlapMode: "noOverlap",
    connectorLength: 20,
    hatchFill: null,
    forceHoverLabels: !1,
    labels: {
      enabled: !0, fontColor: null, position: "inside", disablePointerEvents: !1, anchor: "center", rotation: 0, autoRotate: !1, width: null, height: null, zIndex: 34, positionFormatter: d, textFormatter: function() {
        return this.name ? this.name : this.x
      }
    },
    outsideLabels: {autoColor: "#545f69"},
    insideLabels: {autoColor: "#ffffff"},
    hoverLabels: {enabled: null},
    selectLabels: {enabled: null},
    legend: {enabled: !1, position: "right", vAlign: "middle", itemsLayout: "vertical", align: "center", paginator: {orientation: "bottom"}},
    markers: {enabled: !1, rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, size: 4, positionFormatter: d, zIndex: 33},
    hoverMarkers: {enabled: null, size: 6},
    tooltip: {
      enabled: !0, title: {enabled: !0}, separator: {enabled: !0}, titleFormatter: function() {
        return this.name || this.x
      }, textFormatter: function() {
        return "Value: " + this.value + "\nPercent Value: " + (100 * this.value / this.getStat("sum")).toFixed(1) + "%"
      }
    },
    interactivity: {hoverMode: "single"}
  },
  pie: {
    title: {text: "Pie Chart"},
    group: !1,
    sort: "none",
    radius: "45%",
    innerRadius: 0,
    startAngle: 0,
    explode: 15,
    legend: {enabled: !0, position: "bottom", align: "center", itemsLayout: "horizontal", paginator: {orientation: "right"}},
    outsideLabelsCriticalAngle: 60,
    outsideLabelsSpace: 30,
    insideLabelsOffset: "50%",
    labels: {
      textFormatter: function() {
        return (100 * this.value / this.getStat("sum")).toFixed(1) + "%"
      }
    }
  },
  funnel: {
    title: {text: "Funnel Chart"}, baseWidth: "70%", neckWidth: "30%", neckHeight: "25%",
    pointsPadding: 5, labels: {position: "outsideLeftInColumn"}
  },
  pyramid: {title: {text: "Pyramid Chart"}, baseWidth: "70%", pointsPadding: 5, legend: {inverted: !0}, labels: {position: "outsideLeftInColumn"}, reversed: !1},
  pie3d: {explode: "5%", connectorLength: "15%"},
  scatter: {
    defaultSeriesType: "marker",
    legend: {enabled: !1},
    defaultSeriesSettings: {
      base: {
        clip: !0, color: null, tooltip: {
          titleFormatter: function() {
            return this.seriesName
          }, textFormatter: function() {
            return "x: " + this.x + "\ny: " + this.valuePrefix + this.value + this.valuePostfix
          }
        },
        xScale: null, yScale: null
      }, bubble: {
        displayNegative: !1, negativeFill: m, hoverNegativeFill: m, negativeStroke: m, hoverNegativeStroke: m, negativeHatchFill: null, hoverNegativeHatchFill: void 0, hatchFill: !1, tooltip: {
          textFormatter: function() {
            return "X: " + this.x + "\nY: " + this.valuePrefix + this.value + this.valuePostfix + "\nSize: " + this.size
          }
        }
      }, line: {connectMissingPoints: !1}
    },
    defaultXAxisSettings: {orientation: "bottom", scale: 0, title: {text: "X-Axis"}},
    defaultYAxisSettings: {orientation: "left", scale: 1, title: {text: "Y-Axis"}},
    series: [],
    grids: [],
    minorGrids: [],
    xAxes: [{}],
    yAxes: [{}],
    lineAxesMarkers: [],
    rangeAxesMarkers: [],
    textAxesMarkers: [],
    scales: [{type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0}, {
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {
        mode: "linear", base: 0,
        minCount: 4, maxCount: 6
      }, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0
    }],
    xScale: 0,
    yScale: 1,
    maxBubbleSize: "20%",
    minBubbleSize: "5%",
    crosshair: {enabled: !1, displayMode: "float", xStroke: "#969EA5", yStroke: "#969EA5", zIndex: 41}
  },
  marker: {},
  bubble: {},
  radar: {
    defaultSeriesType: "line",
    defaultSeriesSettings: {base: {enabled: !0, hatchFill: null}, area: {}, line: {}, marker: {}},
    defaultGridSettings: {layout: "radial"},
    defaultMinorGridSettings: {layout: "circuit"},
    xAxis: {scale: 0, zIndex: 25},
    startAngle: 0,
    grids: [{}],
    minorGrids: [],
    scales: [{type: "ordinal", inverted: !1, names: [], ticks: {interval: 1}}, {
      type: "linear",
      inverted: !1,
      maximum: null,
      minimum: null,
      minimumGap: .1,
      maximumGap: .1,
      softMinimum: null,
      softMaximum: null,
      ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6},
      minorTicks: {mode: "linear", base: 0, count: 5},
      stackMode: "none",
      stickToZero: !0
    }],
    xScale: 0,
    yScale: 1
  },
  polar: {
    defaultSeriesType: "marker",
    defaultSeriesSettings: {base: {enabled: !0, hatchFill: null, closed: !0}, area: {hoverMarkers: {enabled: null}}, line: {}, marker: {}},
    defaultGridSettings: {layout: "radial"},
    defaultMinorGridSettings: {layout: "circuit"},
    xAxis: {scale: 0, zIndex: 25},
    startAngle: 0,
    grids: [{}],
    minorGrids: [],
    scales: [{type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0}, {
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null,
      ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0
    }],
    xScale: 0,
    yScale: 1
  },
  bullet: {
    background: {enabled: !1},
    layout: "horizontal",
    defaultRangeMarkerSettings: {enabled: !0, from: 0, to: 0, zIndex: 2},
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    defaultMarkerSettings: {fill: "#000", stroke: "none", zIndex: 2},
    rangePalette: {type: "distinct", items: ["#828282", "#a8a8a8", "#c2c2c2", "#d4d4d4", "#e1e1e1"]},
    markerPalette: {items: ["bar", "line", "x", "ellipse"]},
    axis: {
      title: {padding: {top: 0, right: 0, bottom: 0, left: 0}, margin: {top: 0, right: 0, bottom: 10, left: 0}},
      labels: {fontSize: 9, padding: {top: 0, right: 0, bottom: 0, left: 0}},
      minorLabels: {padding: {top: 0, right: 0, bottom: 0, left: 0}},
      ticks: {enabled: !1},
      orientation: null,
      zIndex: 3
    },
    title: {rotation: 0},
    scale: {
      type: "linear", ticks: {mode: "linear", base: 0, explicit: null, minCount: 2, maxCount: 5, interval: NaN}, minorTicks: {mode: "linear", base: 0, explicit: null, count: 5, interval: NaN}, stackMode: "none", stickToZero: !0, minimumGap: 0, maximumGap: 0, softMinimum: null,
      softMaximum: null, minimum: null, maximum: null, inverted: !1
    },
    ranges: []
  },
  sparkline: {
    background: {enabled: !0},
    title: {enabled: !1, padding: {top: 0, right: 0, bottom: 0, left: 0}, margin: {top: 0, right: 0, bottom: 0, left: 0}, orientation: "right", rotation: 0},
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    padding: {top: 0, right: 0, bottom: 0, left: 0},
    hatchFill: null,
    markers: {},
    firstMarkers: {fill: "#64b5f6"},
    lastMarkers: {fill: "#64b5f6"},
    negativeMarkers: {fill: "#ef6c00"},
    minMarkers: {fill: "#455a64"},
    maxMarkers: {fill: "#dd2c00"},
    labels: {},
    firstLabels: {},
    lastLabels: {},
    negativeLabels: {},
    minLabels: {fontSize: 9, padding: {top: 3, right: 0, bottom: 3, left: 0}, fontColor: "#303f46"},
    maxLabels: {fontSize: 9, padding: {top: 3, right: 0, bottom: 3, left: 0}, fontColor: "#9b1f00"},
    lineAxesMarkers: [],
    rangeAxesMarkers: [],
    textAxesMarkers: [],
    scales: [{type: "ordinal", inverted: !1, names: [], ticks: {interval: 1}}, {
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {
        mode: "linear",
        base: 0, count: 5
      }, stackMode: "none", stickToZero: !0
    }],
    xScale: 0,
    yScale: 1,
    clip: !0,
    seriesType: "line",
    connectMissingPoints: !1,
    pointWidth: "95%",
    tooltip: {
      title: !1, separator: !1, titleFormatter: function() {
        return this.x
      }, textFormatter: function() {
        return "x: " + this.x + "\ny: " + this.value
      }
    },
    defaultSeriesSettings: {
      base: {
        markers: {enabled: !1, position: "center", anchor: "center", type: "circle", size: 1.8, stroke: "none"}, labels: {enabled: !1, fontSize: 8, background: {enabled: !1}, position: "center", anchor: "centerBottom"}, minLabels: {
          position: "bottom",
          anchor: "centerBottom"
        }, maxLabels: {position: "centerTop", anchor: "topCenter"}, color: "#64b5f6"
      },
      area: {stroke: "#64b5f6", fill: "#64b5f6 0.5"},
      column: {markers: {position: "centerTop"}, labels: {position: "centerTop", anchor: "centerBottom"}, negativeMarkers: {position: "centerBottom"}, negativeLabels: {position: "centerBottom", anchor: "centerTop"}, fill: "#64b5f6", negativeFill: "#ef6c00"},
      line: {stroke: "#64b5f6"},
      winLoss: {
        markers: {position: "centerTop", anchor: "centerTop"}, labels: {position: "centerTop", anchor: "centerTop"}, negativeMarkers: {
          position: "centerBottom",
          anchor: "centerBottom"
        }, negativeLabels: {position: "centerBottom", anchor: "centerBottom"}, fill: "#64b5f6", negativeFill: "#ef6c00"
      }
    }
  },
  circularGauge: {
    title: {enabled: !1},
    defaultAxisSettings: {
      startAngle: null,
      labels: {position: "inside", adjustFontSize: !0},
      minorLabels: {position: "inside", adjustFontSize: !0},
      fill: "#CECECE",
      ticks: {hatchFill: !1, type: "line", position: "center", length: null, fill: "#545f69", stroke: "none"},
      minorTicks: {hatchFill: !1, type: "line", position: "center", length: null, fill: "#545f69", stroke: "none"},
      zIndex: 10
    },
    defaultPointerSettings: {
      base: {enabled: !0, fill: "#545f69", stroke: "#545f69", hatchFill: !1, axisIndex: 0},
      bar: {position: "center"},
      marker: {size: 4, hoverSize: 6, position: "inside", type: "triangleUp"},
      knob: {fill: "#CECECE", stroke: "#c1c1c1", verticesCount: 6, verticesCurvature: .5, topRatio: .5, bottomRatio: .5}
    },
    defaultRangeSettings: {enabled: !0, axisIndex: 0, fill: "#7c868e 0.7", position: "center", startSize: 0, endSize: "10%"},
    fill: "#f5f5f5",
    stroke: "#EAEAEA",
    startAngle: 0,
    sweepAngle: 360,
    cap: {
      enabled: !1, fill: "#EAEAEA", stroke: "#CECECE",
      hatchFill: !1, radius: "15%", zIndex: 50
    },
    circularPadding: "10%",
    encloseWithStraightLine: !1,
    axes: [],
    bars: [],
    markers: [],
    needles: [],
    knobs: [],
    ranges: [],
    tooltip: {
      title: {enabled: !1}, separator: {enabled: !1}, titleFormatter: function() {
        return this.index
      }, textFormatter: function() {
        return "Value: " + this.value
      }
    }
  },
  map: {
    defaultSeriesSettings: {
      base: {
        fill: function() {
          var a;
          this.colorScale ? (a = this.iterator.get(this.referenceValueNames[1]), a = this.colorScale.valueToColor(a)) : a = this.sourceColor;
          return a
        }, hoverFill: "#545f69", selectFill: "#333",
        stroke: {thickness: .5, color: "#545f69"}, hoverStroke: {thickness: .5, color: "#545f69"}, selectStroke: {thickness: .5, color: "#545f69"}, hatchFill: !1, labels: {
          enabled: !0, fontSize: 12, adjustFontSize: {width: !0, height: !0}, textFormatter: function() {
            return this.name
          }
        }, hoverLabels: {enabled: null}, selectLabels: {enabled: null}, markers: {enabled: !1, disablePointerEvents: !1, size: 4}, hoverMarkers: {enabled: null, size: 6}, selectMarkers: {enabled: null, size: 6}, color: null, allowPointsSelect: null, tooltip: {
          titleFormatter: function() {
            return this.name
          },
          textFormatter: function() {
            return "Id: " + this.id + "\nValue: " + this.valuePrefix + this.value + this.valuePostfix
          }
        }, xScale: null, yScale: null
      }, choropleth: {}, bubble: {
        hoverFill: "#545f69", selectFill: "#333", tooltip: {
          textFormatter: function() {
            return "Id: " + this.id + "\nValue: " + this.valuePrefix + this.size + this.valuePostfix
          }
        }
      }
    }, colorRange: {
      enabled: !1, stroke: null, orientation: "bottom", title: {enabled: !1}, colorLineSize: 20, padding: {top: 10, right: 0, bottom: 20, left: 0}, align: "center", length: "70%", marker: {
        padding: {
          top: 3, right: 3, bottom: 3,
          left: 3
        }, fill: "#545f69", hoverFill: "#545f69", stroke: "#545f69", hoverStroke: "#545f69", positionFormatter: function() {
          return this.value
        }, legendItem: {iconStroke: null}, enabled: !0, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, type: "triangleDown", size: 15
      }, labels: {offsetX: 0}, ticks: {stroke: {thickness: 3, color: "#fff", position: "center", length: 20}}
    }, unboundRegions: {enabled: !0, fill: "#F7F7F7", stroke: "#B9B9B9"}, linearColor: {colors: ["#fff", "#ffd54f", "#ef6c00"]}, legend: {enabled: !1},
    maxBubbleSize: "20%", minBubbleSize: "5%", geoIdField: "id", interactivity: {
      copyFormatter: function(a) {
        a = a.seriesStatus;
        for (var b = "", c = 0, x = a.length; c < x; c++) {
          var r = a[c];
          if (0 != r.points.length) {
            for (var b = b + ("Series " + r.series.index() + ":\n"), t = 0, y = r.points.length; t < y; t++) {
              var z = r.points[t], b = b + ("id: " + z.id + " index: " + z.index);
              t != y - 1 && (b += "\n")
            }
            c != x - 1 && (b += "\n")
          }
        }
        return b || "no selected points"
      }, drag: !0, mouseWheel: !0
    }
  },
  choropleth: {},
  bubbleMap: {},
  defaultDataGrid: {
    isStandalone: !0,
    headerHeight: 25,
    backgroundFill: "#fff",
    columnStroke: "#cecece",
    rowStroke: "#cecece",
    rowOddFill: "#fff",
    rowEvenFill: "#fff",
    rowFill: "#fff",
    hoverFill: "#F8FAFB",
    rowSelectedFill: "#ebf1f4",
    zIndex: 5,
    editing: !1,
    editStructurePreviewFill: {color: "#4285F4", opacity: .2},
    editStructurePreviewStroke: {color: "#4285F4", thickness: 2},
    editStructurePreviewDashStroke: {color: "#4285F4", dash: "4 4"},
    headerFill: "#f7f7f7",
    tooltip: {
      padding: {top: 5, right: 5, bottom: 5, left: 5}, title: {enabled: !0, fontSize: "14px", fontWeight: "normal", fontColor: "#e5e5e5"}, separator: {enabled: !0}, anchor: "leftTop",
      content: {hAlign: "left"}, textFormatter: function() {
        var a = this.name;
        return void 0 !== a ? a + "" : ""
      }
    },
    defaultColumnSettings: {
      width: 90,
      cellTextSettings: {enabled: !0, anchor: "leftTop", vAlign: "middle", padding: {top: 0, right: 5, bottom: 0, left: 5}, textWrap: "noWrap", background: null, rotation: 0, width: null, height: null, fontSize: 11, minFontSize: 8, maxFontSize: 72, disablePointerEvents: !0},
      depthPaddingMultiplier: 0,
      collapseExpandButtons: !1,
      title: {
        enabled: !0, margin: {top: 0, right: 0, bottom: 0, left: 0}, textWrap: "noWrap", hAlign: "center",
        vAlign: "middle", background: {enabled: !1}
      },
      textFormatter: function() {
        return ""
      }
    },
    columns: [{
      width: 50, textFormatter: function() {
        var a = this.item.meta("index");
        return null != a ? a + 1 + "" : ""
      }, title: {text: "#"}
    }, {
      width: 170, collapseExpandButtons: !0, depthPaddingMultiplier: 15, textFormatter: function() {
        var a = this.name;
        return null != a ? a + "" : ""
      }, title: {text: "Name"}
    }]
  },
  gantt: {
    base: {
      splitterPosition: "30%", headerHeight: 70, hoverFill: "#F8FAFB", rowSelectedFill: "#ebf1f4", rowStroke: "#cecece", editing: !1, title: {enabled: !1}, legend: {enabled: !1},
      credits: {inChart: !0}, background: {fill: "#fff"}, margin: {top: 0, right: 0, bottom: 0, left: 0}, padding: {top: 0, right: 0, bottom: 0, left: 0}, dataGrid: {isStandalone: !1, backgroundFill: "none"}, timeline: {
        columnStroke: "#cecece",
        rowStroke: "#cecece",
        backgroundFill: "none",
        rowOddFill: "#fff",
        rowEvenFill: "#fff",
        rowFill: "#fff",
        hoverFill: "#F8FAFB",
        rowSelectedFill: "#ebf1f4",
        zIndex: 5,
        headerHeight: 70,
        editing: !1,
        connectorPreviewStroke: {color: "#545f69", dash: "3 3"},
        editPreviewFill: {color: "#fff", opacity: 1E-5},
        editPreviewStroke: {
          color: "#aaa",
          dash: "3 3"
        },
        editProgressFill: "#EAEAEA",
        editProgressStroke: "#545f69",
        editIntervalThumbFill: "#EAEAEA",
        editIntervalThumbStroke: "#545f69",
        editConnectorThumbFill: "#EAEAEA",
        editConnectorThumbStroke: "#545f69",
        editStructurePreviewFill: {color: "#4285F4", opacity: .2},
        editStructurePreviewStroke: {color: "#4285F4", thickness: 2},
        editStructurePreviewDashStroke: {color: "#4285F4", dash: "4 4"},
        baseFill: "#7ec1f5",
        baseStroke: "#74b2e2",
        progressFill: "#1976d2",
        progressStroke: {color: "#fff", opacity: 1E-5},
        baselineFill: "#d5ebfc",
        baselineStroke: "#bfd1e0",
        parentFill: "#455a64",
        parentStroke: "#2f3f46",
        milestoneFill: "#ffa000",
        milestoneStroke: "#d26104",
        connectorFill: "#545f69",
        connectorStroke: "#545f69",
        selectedElementFill: "#ef6c00",
        selectedElementStroke: "#bc5704",
        selectedConnectorStroke: "2 #bc5704",
        minimumGap: .1,
        maximumGap: .1,
        baselineAbove: !1,
        tooltip: {padding: {top: 5, right: 5, bottom: 5, left: 5}, title: {enabled: !0, fontSize: "14px", fontWeight: "normal", fontColor: "#e5e5e5"}, separator: {enabled: !0}, anchor: "leftTop", content: {hAlign: "left"}},
        labels: {
          enabled: !0,
          anchor: "leftCenter",
          position: "rightCenter",
          padding: {top: 3, right: 5, bottom: 3, left: 5},
          vAlign: "middle",
          textWrap: "noWrap",
          background: null,
          rotation: 0,
          width: null,
          height: null,
          fontSize: 11,
          minFontSize: 8,
          maxFontSize: 72,
          zIndex: 40,
          disablePointerEvents: !0
        },
        markers: {anchor: "centerTop", zIndex: 50, type: "star5", fill: "#ff0", stroke: "2 red"},
        defaultLineMarkerSettings: {layout: "vertical", zIndex: 1.5},
        defaultRangeMarkerSettings: {layout: "vertical", zIndex: 1},
        defaultTextMarkerSettings: {layout: "vertical", zIndex: 2},
        header: {labelsFactory: {enabled: !0, anchor: "leftTop", vAlign: "middle", padding: {top: 0, right: 5, bottom: 0, left: 5}, textWrap: "noWrap", background: null, rotation: 0, width: null, height: null, fontSize: 11, minFontSize: 8, maxFontSize: 72, disablePointerEvents: !0}}
      }
    }, ganttResource: {
      dataGrid: {
        tooltip: {
          titleFormatter: function() {
            return this.name || ""
          }, textFormatter: function() {
            var a = this.minPeriodDate, b = this.maxPeriodDate;
            return (a ? "Start Date: " + window.anychart.format.dateTime(a) : "") + (b ? "\nEnd Date: " + window.anychart.format.dateTime(b) :
                    "")
          }
        }
      }, timeline: {
        tooltip: {
          titleFormatter: function() {
            return this.name || ""
          }, textFormatter: function() {
            var a = this.periodStart || this.minPeriodDate, b = this.periodEnd || this.maxPeriodDate;
            return (a ? "Start Date: " + window.anychart.format.dateTime(a) : "") + (b ? "\nEnd Date: " + window.anychart.format.dateTime(b) : "")
          }
        }
      }
    }, ganttProject: {
      dataGrid: {
        tooltip: {
          titleFormatter: function() {
            return this.name || ""
          }, textFormatter: function() {
            var a = this.actualStart || this.autoStart, b = this.actualEnd || this.autoEnd, c = this.progressValue;
            void 0 ===
            c && (c = (Math.round(1E4 * this.autoProgress) / 100 || 0) + "%");
            return (a ? "Start Date: " + window.anychart.format.dateTime(a) : "") + (b ? "\nEnd Date: " + window.anychart.format.dateTime(b) : "") + (c ? "\nComplete: " + c : "")
          }
        }
      }, timeline: {
        tooltip: {
          titleFormatter: function() {
            return this.name || ""
          }, textFormatter: function() {
            var a = this.actualStart || this.autoStart, b = this.actualEnd || this.autoEnd, c = this.progressValue;
            void 0 === c && (c = (Math.round(1E4 * this.autoProgress) / 100 || 0) + "%");
            return (a ? "Start Date: " + window.anychart.format.dateTime(a) :
                    "") + (b ? "\nEnd Date: " + window.anychart.format.dateTime(b) : "") + (c ? "\nComplete: " + c : "")
          }
        }
      }
    }
  },
  stock: {
    defaultPlotSettings: {
      defaultSeriesSettings: {
        base: {
          pointWidth: "75%", tooltip: {
            textFormatter: function() {
              var a = this.value;
              void 0 === a && (a = this.close);
              a = parseFloat(a).toFixed(4);
              return this.seriesName + (isNaN(a) ? "" : ": " + this.valuePrefix + a + this.valuePostfix)
            }
          }, legendItem: {iconStroke: "none"}
        }, line: {stroke: "1.5 #64b5f6"}, column: {fill: "#64b5f6", stroke: "none"}, ohlc: {risingStroke: "#1976d2", fallingStroke: "#ef6c00"}
      },
      defaultGridSettings: {enabled: !0, isMinor: !1, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: "none", evenFill: "none", stroke: "#cecece", scale: 0, zIndex: 11},
      defaultMinorGridSettings: {enabled: !0, isMinor: !0, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: "none", evenFill: "none", stroke: "#eaeaea", scale: 0, zIndex: 10},
      defaultYAxisSettings: {
        enabled: !0, orientation: "left", title: {enabled: !1, text: "Y-Axis"}, staggerMode: !1, staggerLines: null, ticks: {enabled: !0}, width: 50, labels: {
          fontSize: "11px",
          padding: {top: 0, right: 5, bottom: 0, left: 5}
        }, minorLabels: {fontSize: "11px", padding: {top: 0, right: 5, bottom: 0, left: 5}}, scale: 0
      },
      xAxis: {
        enabled: !0, orientation: "bottom", background: {}, height: 25, scale: 0, ticks: {enabled: !1}, labels: {
          enabled: !0, fontSize: "11px", padding: {top: 5, right: 5, bottom: 5, left: 5}, anchor: "centerTop", textFormatter: function() {
            var a = this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.format.dateTime(a, "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.format.dateTime(a,
                    "yyyy MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.format.dateTime(a, "MMM dd");
              case "hour":
                return window.anychart.format.dateTime(a, "MMM-dd HH");
              case "minute":
                return window.anychart.format.dateTime(a, "dd HH:mm");
              case "second":
                return window.anychart.format.dateTime(a, "HH:mm:ss");
              case "millisecond":
                return window.anychart.format.dateTime(a, "HH:mm:ss.SSS")
            }
            return window.anychart.format.dateTime(a, "yyyy MMM dd")
          }
        }, minorLabels: {
          enabled: !0, anchor: "centerTop", fontSize: "11px", padding: {
            top: 5,
            right: 0, bottom: 5, left: 0
          }, textFormatter: function() {
            var a = this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.format.dateTime(a, "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.format.dateTime(a, "MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.format.dateTime(a, "dd");
              case "hour":
                return window.anychart.format.dateTime(a, "HH");
              case "minute":
                return window.anychart.format.dateTime(a, "HH:mm");
              case "second":
                return window.anychart.format.dateTime(a,
                    "HH:mm:ss");
              case "millisecond":
                return window.anychart.format.dateTime(a, "SSS")
            }
            return window.anychart.format.dateTime(a, "HH:mm:ss.SSS")
          }
        }
      },
      dateTimeHighlighter: "#B9B9B9",
      legend: {
        enabled: !0,
        vAlign: "bottom",
        fontSize: 12,
        itemsLayout: "horizontal",
        itemsSpacing: 15,
        items: null,
        iconSize: 13,
        itemsFormatter: null,
        itemsTextFormatter: null,
        itemsSourceMode: "default",
        inverted: !1,
        hoverCursor: "pointer",
        iconTextSpacing: 5,
        width: null,
        height: null,
        position: "top",
        titleFormatter: function() {
          var a = this.value;
          switch (this.groupingIntervalUnit) {
            case "year":
              return window.anychart.format.dateTime(a,
                  "yyyy");
            case "semester":
            case "quarter":
            case "month":
              return window.anychart.format.dateTime(a, "MMM yyyy");
            case "hour":
            case "minute":
              return window.anychart.format.dateTime(a, "HH:mm, dd MMM");
            case "second":
              return window.anychart.format.dateTime(a, "HH:mm:ss");
            case "millisecond":
              return window.anychart.format.dateTime(a, "HH:mm:ss.SSS")
          }
          return window.anychart.format.dateTime(a, "dd MMM yyyy")
        },
        align: "center",
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        padding: {top: 10, right: 10, bottom: 10, left: 10},
        background: {
          enabled: !1,
          fill: "#fff", stroke: "none", corners: 5
        },
        title: {
          enabled: !0,
          fontSize: 12,
          text: "",
          background: {enabled: !1, fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"}},
          margin: {top: 0, right: 15, bottom: 0, left: 0},
          padding: {top: 0, right: 0, bottom: 0, left: 0},
          orientation: "left",
          align: "left",
          hAlign: "left",
          rotation: 0
        },
        titleSeparator: {enabled: !1, width: "100%", height: 1, margin: {top: 3, right: 0, bottom: 3, left: 0}, orientation: "top", fill: ["#000 0", "#000", "#000 0"], stroke: "none"},
        paginator: {
          enabled: !0,
          fontSize: 12,
          fontColor: "#545f69",
          background: {enabled: !1, fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"}},
          padding: {top: 0, right: 0, bottom: 0, left: 0},
          margin: {top: 0, right: 0, bottom: 0, left: 0},
          orientation: "right",
          layout: "horizontal",
          zIndex: 30
        },
        tooltip: {enabled: !1, title: {enabled: !1, margin: {top: 3, right: 3, bottom: 0, left: 3}, padding: {top: 0, right: 0, bottom: 0, left: 0}}},
        zIndex: 20
      },
      scales: [{
        type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null,
        softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0
      }],
      yScale: 0,
      zIndex: 10,
      yAxes: [{}]
    }, padding: [20, 30, 20, 60], plots: [{}], scroller: {
      defaultSeriesSettings: {
        base: {pointWidth: "75%"}, line: {stroke: "#999 0.9", selectedStroke: "1.5 #64b5f6"}, column: {fill: "#64b5f6 0.6", stroke: "none", selectedFill: "#64b5f6 0.9", selectedStroke: "none"}, ohlc: {
          risingStroke: "#1976d2 0.6", fallingStroke: "#ef6c00 0.6", selectedRisingStroke: "#1976d2 0.9",
          selectedFallingStroke: "#ef6c00 0.9"
        }
      }, enabled: !0, fill: "#fff", selectedFill: "#1976d2 0.2", outlineStroke: "#cecece", height: 40, minHeight: null, maxHeight: null, thumbs: {enabled: !0, autoHide: !1, fill: "#f7f7f7", stroke: "#7c868e", hoverFill: "#ffffff", hoverStroke: "#545f69"}, zIndex: 40, xAxis: {
        background: {enabled: !1}, minorTicks: {enabled: !0, stroke: "#cecece"}, labels: {
          enabled: !0, fontSize: "11px", padding: {top: 5, right: 5, bottom: 5, left: 5}, anchor: "leftTop", textFormatter: function() {
            var a = this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.format.dateTime(a,
                    "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.format.dateTime(a, "yyyy MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.format.dateTime(a, "MMM dd");
              case "hour":
                return window.anychart.format.dateTime(a, "MMM-dd HH");
              case "minute":
                return window.anychart.format.dateTime(a, "dd HH:mm");
              case "second":
                return window.anychart.format.dateTime(a, "HH:mm:ss");
              case "millisecond":
                return window.anychart.format.dateTime(a, "HH:mm:ss.SSS")
            }
            return window.anychart.format.dateTime(a,
                "yyyy MMM dd")
          }
        }, minorLabels: {
          enabled: !0, anchor: "leftTop", fontSize: "11px", padding: {top: 5, right: 5, bottom: 5, left: 5}, textFormatter: function() {
            var a = this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.format.dateTime(a, "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.format.dateTime(a, "MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.format.dateTime(a, "dd");
              case "hour":
                return window.anychart.format.dateTime(a, "HH");
              case "minute":
                return window.anychart.format.dateTime(a,
                    "HH:mm");
              case "second":
                return window.anychart.format.dateTime(a, "HH:mm:ss");
              case "millisecond":
                return window.anychart.format.dateTime(a, "SSS")
            }
            return window.anychart.format.dateTime(a, "HH:mm:ss.SSS")
          }
        }, zIndex: 75
      }
    }, tooltip: {
      allowLeaveScreen: !1, allowLeaveChart: !0, displayMode: "union", positionMode: "float", title: {enabled: !0, fontSize: 13}, separator: {enabled: !0}, titleFormatter: function() {
        var a = this.hoveredDate;
        switch (this.groupingIntervalUnit) {
          case "year":
            return window.anychart.format.dateTime(a, "yyyy");
          case "semester":
          case "quarter":
          case "month":
            return window.anychart.format.dateTime(a, "MMM yyyy");
          case "hour":
          case "minute":
            return window.anychart.format.dateTime(a, "HH:mm, dd MMM");
          case "second":
            return window.anychart.format.dateTime(a, "HH:mm:ss");
          case "millisecond":
            return window.anychart.format.dateTime(a, "HH:mm:ss.SSS")
        }
        return window.anychart.format.dateTime(a, "dd MMM yyyy")
      }, textFormatter: function() {
        return this.formattedValues.join("\n")
      }
    }
  },
  standalones: {
    background: {enabled: !0, zIndex: 0},
    label: {
      enabled: !0,
      text: "Label text", padding: {top: 0, right: 0, bottom: 0, left: 0}, width: null, height: null, anchor: "leftTop", position: "leftTop", offsetX: 0, offsetY: 0, minFontSize: 8, maxFontSize: 72, adjustFontSize: {width: !1, height: !1}, rotation: 0, zIndex: 0
    },
    labelsFactory: {enabled: !0, zIndex: 0},
    legend: {enabled: !0, zIndex: 0},
    markersFactory: {enabled: !0, zIndex: 0},
    title: {enabled: !0, zIndex: 0},
    linearAxis: {enabled: !0, zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}},
    polarAxis: {enabled: !0, startAngle: 0, zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}},
    radarAxis: {enabled: !0, startAngle: 0, zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}},
    radialAxis: {enabled: !0, startAngle: 0, zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}, minorLabels: {padding: {top: 1, right: 1, bottom: 0, left: 1}}},
    linearGrid: {enabled: !0, scale: null, zIndex: 0},
    polarGrid: {enabled: !0, layout: "circuit", zIndex: 0},
    radarGrid: {enabled: !0, layout: "circuit", zIndex: 0},
    lineAxisMarker: {enabled: !0, zIndex: 0},
    textAxisMarker: {enabled: !0, zIndex: 0},
    rangeAxisMarker: {enabled: !0, zIndex: 0},
    dataGrid: {
      enabled: !0,
      zIndex: 0
    },
    scroller: {enabled: !0, fill: "#fff", selectedFill: "#e2e2e2", outlineStroke: "#fff", height: 40, minHeight: null, maxHeight: null, thumbs: {enabled: !0, autoHide: !1, fill: "#f7f7f7", stroke: "#545f69", hoverFill: "#ccc", hoverStroke: "#000"}}
  }
};
