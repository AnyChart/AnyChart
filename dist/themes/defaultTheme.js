window.anychart = window.anychart || {};
window.anychart.themes = window.anychart.themes || {};
window.anychart.themes.defaultTheme = {
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
  palette: {type: "distinct", items: "#64b5f6 #1976d2 #ef6c00 #ffd54f #455a64 #96a6a6 #dd2c00 #00838f #00bfa5 #ffa000".split(" ")},
  hatchFillPalette: {items: "backwardDiagonal forwardDiagonal horizontal vertical dashedBackwardDiagonal grid dashedForwardDiagonal dashedHorizontal dashedVertical diagonalCross diagonalBrick divot horizontalBrick verticalBrick checkerBoard confetti plaid solidDiamond zigZag weave percent05 percent10 percent20 percent25 percent30 percent40 percent50 percent60 percent70 percent75 percent80 percent90".split(" ")},
  markerPalette: {items: "circle diamond square triangleDown triangleUp diagonalCross pentagon cross line star5 star4 trapezium star7 star6 star10".split(" ")},
  defaultBackground: {enabled: !0, fill: "#fff", stroke: "none", cornerType: "round", corners: 0},
  defaultLabelFactory: {
    minFontSize: 8,
    maxFontSize: 72,
    enabled: !0,
    offsetX: 0,
    offsetY: 0,
    anchor: "center",
    padding: {top: 2, right: 4, bottom: 2, left: 4},
    rotation: 0,
    background: {enabled: !1, stroke: {keys: ["0 #DDDDDD 1", "1 #D0D0D0 1"], angle: "90"}, fill: {keys: ["0 #FFFFFF 1", "0.5 #F3F3F3 1", "1 #FFFFFF 1"], angle: "90"}},
    textFormatter: function() {
      return this.value
    },
    positionFormatter: function() {
      return this.value
    }
  },
  defaultMarkerFactory: {
    size: 10,
    anchor: "center", offsetX: 0, offsetY: 0, rotation: 0, positionFormatter: function() {
      return this.value
    }
  },
  defaultTitle: {enabled: !0, fontSize: 16, fontColor: "#7c868e", text: "Title text", background: {enabled: !1}, width: null, height: null, margin: {top: 0, right: 0, bottom: 0, left: 0}, padding: {top: 0, right: 0, bottom: 0, left: 0}, align: "center", hAlign: "center"},
  defaultTooltip: {
    enabled: !0,
    title: {
      enabled: !1, fontColor: "#ffffff", fontSize: "15px", fontWeight: "bold", vAlign: "top", hAlign: "left", text: "", background: {enabled: !1}, rotation: 0, width: "100%",
      height: null, margin: 0, padding: {top: 5, right: 10, bottom: 5, left: 10}, align: "left", orientation: "top", zIndex: 1
    },
    separator: {enabled: !1, fill: "#cecece 0.3", width: "100%", height: 1, margin: {top: 0, right: 5, bottom: 0, left: 5}, orientation: "top", stroke: "none", zIndex: 1},
    content: {
      enabled: !0, fontSize: 12, fontColor: "#fff", vAlign: "top", hAlign: "left", textWrap: "byLetter", text: "Tooltip Text", background: {enabled: !1}, padding: {top: 5, right: 10, bottom: 5, left: 10}, width: "100%", height: null, anchor: "leftTop", offsetX: 0, offsetY: 0, position: "leftTop",
      minFontSize: 8, maxFontSize: 72, adjustFontSize: {width: !1, height: !1}, rotation: 0, zIndex: 1
    },
    background: {enabled: !0, fill: "#212121 0.7", stroke: null, cornerType: "round", corners: 3, zIndex: 0},
    padding: {top: 0, right: 0, bottom: 0, left: 0},
    offsetX: 10,
    offsetY: 10,
    valuePrefix: "",
    valuePostfix: "",
    position: "leftTop",
    anchor: "leftTop",
    hideDelay: 0,
    selectable: !1,
    titleFormatter: function() {
      return this.value
    },
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
    stroke: "#cecece",
    title: {enabled: !1, fontSize: 13, text: "Axis title", margin: {top: 0, right: 0, bottom: 10, left: 0}, background: {enabled: !1, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"}, fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}}, fontColor: "#545f69"},
    labels: {
      enabled: !0, offsetX: 0, offsetY: 0, minFontSize: 8, maxFontSize: 72, rotation: 0, anchor: "center", padding: {top: 0, right: 0, bottom: 0, left: 0}, fontWeight: "normal",
      fontSize: 12, fontColor: "#7c868e", textWrap: "noWrap", background: {enabled: !1, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"}, fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}}, textFormatter: function() {
        return this.value
      }, positionFormatter: function() {
        return this.value
      }, zIndex: 35
    },
    minorLabels: {
      enabled: !1, offsetX: 0, offsetY: 0, minFontSize: 8, maxFontSize: 72, rotation: 0, anchor: "center", padding: {top: 1, right: 1, bottom: 0, left: 1}, fontSize: 9, textWrap: "noWrap", background: {
        enabled: !1, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"},
        fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}
      }, textFormatter: function() {
        return this.value
      }, positionFormatter: function() {
        return this.value
      }, zIndex: 35
    },
    ticks: {enabled: !1, length: 6, position: "outside", stroke: "#cecece", zIndex: 35},
    minorTicks: {enabled: !1, length: 4, position: "outside", stroke: "#eaeaea", zIndex: 35},
    zIndex: 35
  },
  chart: {
    defaultSeriesSettings: {
      base: {
        tooltip: {
          enabled: !0, title: {enabled: !0, fontSize: 13, fontWeight: "normal"}, content: {fontSize: 11}, separator: {enabled: !0}, titleFormatter: function() {
            return this.x
          },
          textFormatter: function() {
            return this.seriesName + ": " + this.valuePrefix + this.value + this.valuePostfix
          }
        }
      }, marker: {
        fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .85, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = .85;
          return a
        }, hoverStroke: function() {
          return window.anychart.color.setOpacity(this.sourceColor, 1)
        }, hatchFill: !1, size: 6, hoverSize: 8, selectSize: 8
      }
    },
    title: {enabled: !1, text: "Chart Title", margin: {top: 0, right: 0, bottom: 0, left: 0}, padding: {top: 0, right: 0, bottom: 10, left: 0}, align: "center", zIndex: 80},
    background: {enabled: !0, fill: "#fff", stroke: "none", zIndex: 1},
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    padding: {top: 30, right: 20, bottom: 20, left: 20},
    legend: {
      enabled: !0,
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
      margin: {top: 0, right: 0, bottom: 0, left: 0},
      padding: {top: 10, right: 10, bottom: 10, left: 10},
      background: {enabled: !1, fill: "#fff", stroke: "none", corners: 5},
      title: {
        enabled: !1,
        fontSize: 15,
        text: "Legend title",
        background: {enabled: !1, fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"}},
        margin: {top: 0, right: 0, bottom: 3, left: 0},
        padding: {top: 0, right: 0, bottom: 0, left: 0},
        orientation: "top"
      },
      titleSeparator: {
        enabled: !1, width: "100%",
        height: 1, margin: {top: 3, right: 0, bottom: 3, left: 0}, orientation: "top", fill: ["#000 0", "#000", "#000 0"], stroke: "none"
      },
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
      tooltip: {
        enabled: !1, title: {
          enabled: !1, margin: {top: 3, right: 3, bottom: 0, left: 3}, padding: {
            top: 0,
            right: 0, bottom: 0, left: 0
          }
        }
      },
      zIndex: 20
    },
    credits: {enabled: !0, text: "AnyChart", url: "http://anychart.com", alt: "AnyChart.com", inChart: !1},
    defaultLabelSettings: {
      enabled: !0,
      text: "Chart label",
      background: {enabled: !1},
      padding: {top: 0, right: 0, bottom: 0, left: 0},
      width: null,
      height: null,
      anchor: "leftTop",
      position: "leftTop",
      offsetX: 0,
      offsetY: 0,
      minFontSize: 8,
      maxFontSize: 72,
      adjustFontSize: {width: !1, height: !1},
      rotation: 0,
      zIndex: 50
    },
    chartLabels: [],
    animation: {enabled: !1, duration: 1E3},
    bounds: {
      top: null, right: null, bottom: null,
      left: null, width: null, height: null, minWidth: null, minHeight: null, maxWidth: null, maxHeight: null
    },
    interactivity: {hoverMode: "single", selectionMode: "multiSelect", spotRadius: 2, allowMultiSeriesSelection: !0},
    tooltip: {
      allowLeaveScreen: !1, allowLeaveChart: !0, displayMode: "single", positionMode: "float", title: {enabled: !0, fontSize: 13}, separator: {enabled: !0}, titleFormatter: function() {
        return this.points[0].x
      }, textFormatter: function() {
        return this.formattedValues.join("\n")
      }
    }
  },
  cartesian: {
    defaultSeriesSettings: {
      base: {
        fill: function() {
          return this.sourceColor
        },
        hoverFill: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, selectFill: "#333333", stroke: function() {
          return window.anychart.color.darken(this.sourceColor)
        }, hoverStroke: function() {
          return "1.5 #c2185b"
        }, selectStroke: function() {
          return window.anychart.color.darken(this.sourceColor)
        }, hatchFill: !1, labels: {
          enabled: !1, fontSize: 11, background: {enabled: !1}, padding: {top: 2, right: 4, bottom: 2, left: 4}, position: "center", anchor: "center", offsetX: 0, offsetY: 0, rotation: 0, width: null, height: null, textFormatter: function() {
            return this.value
          },
          positionFormatter: function() {
            return this.value
          }
        }, hoverLabels: {enabled: null}, markers: {
          enabled: !1, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, size: 4, positionFormatter: function() {
            return this.value
          }
        }, hoverMarkers: {enabled: null, size: 6}, clip: !0, color: null, tooltip: {}, xScale: null, yScale: null, error: {
          mode: "both", xError: null, xUpperError: null, xLowerError: null, valueError: null, valueUpperError: null, valueLowerError: null, xErrorWidth: 10, valueErrorWidth: 10, xErrorStroke: function() {
            return window.anychart.color.setThickness(window.anychart.color.darken(this.sourceColor))
          },
          valueErrorStroke: function() {
            return window.anychart.color.setThickness(window.anychart.color.darken(this.sourceColor))
          }
        }, connectMissingPoints: !1
      }, area: {
        labels: {anchor: "bottomleft", padding: {top: 5, right: 5, bottom: 5, left: 5}}, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor,
              1.5)
        }, legendItem: {iconStroke: null}, hoverMarkers: {enabled: !0}, selectMarkers: {enabled: !0, fill: "#FFD700", size: 6}
      }, bar: {
        fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .85, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = .85;
          return a
        }, hoverStroke: function() {
          return window.anychart.color.setOpacity(this.sourceColor, 1)
        }, legendItem: {iconStroke: null},
        markers: {position: "rightCenter"}, labels: {position: "rightCenter"}
      }, box: {
        markers: {position: "centerTop"}, labels: {
          position: "centerTop", textFormatter: function() {
            return this.x
          }
        }, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .85, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = .85;
          return a
        }, hoverStroke: function() {
          return window.anychart.color.setOpacity(this.sourceColor,
              1)
        }, legendItem: {iconStroke: null}, medianStroke: function() {
          return window.anychart.color.darken(this.sourceColor)
        }, hoverMedianStroke: function() {
          return this.sourceColor
        }, selectMedianStroke: function() {
          return window.anychart.color.darken("red")
        }, stemStroke: function() {
          return window.anychart.color.darken(this.sourceColor)
        }, hoverStemStroke: function() {
          return this.sourceColor
        }, selectStemStroke: function() {
          return window.anychart.color.darken("blue")
        }, whiskerStroke: function() {
          return window.anychart.color.darken(this.sourceColor)
        },
        hoverWhiskerStroke: function() {
          return this.sourceColor
        }, selectWiskerStroke: function() {
          return window.anychart.color.darken("yellow")
        }, whiskerWidth: 0, outlierMarkers: {
          enabled: !0, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, type: "circle", size: 3, positionFormatter: function() {
            return this.value
          }
        }, hoverOutlierMarkers: {enabled: null, size: 4}, selectOutlierMarkers: {enabled: null, size: 20, type: "star10"}, tooltip: {
          content: {hAlign: "left"}, titleFormatter: function() {
            return this.name ||
                this.x
          }, textFormatter: function() {
            return "Lowest: " + this.valuePrefix + parseFloat(this.lowest).toFixed(2) + this.valuePostfix + "\nQ1: " + this.valuePrefix + parseFloat(this.q1).toFixed(2) + this.valuePostfix + "\nMedian: " + this.valuePrefix + parseFloat(this.median).toFixed(2) + this.valuePostfix + "\nQ3: " + this.valuePrefix + parseFloat(this.q3).toFixed(2) + this.valuePostfix + "\nHighest: " + this.valuePrefix + parseFloat(this.highest).toFixed(2) + this.valuePostfix
          }
        }
      }, bubble: {
        displayNegative: !1, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor,
              .7, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .7, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, legendItem: {iconStroke: null}, negativeFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))
        }, hoverNegativeFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))))
        },
        negativeStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))))
        }, hoverNegativeStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))))
        }, negativeHatchFill: null, hoverNegativeHatchFill: null, tooltip: {
          textFormatter: function() {
            return this.valuePrefix + parseFloat(this.value).toFixed(2) +
                this.valuePostfix
          }
        }
      }, candlestick: {
        markers: {position: "centerTop"}, risingFill: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, hoverRisingFill: function() {
          return window.anychart.color.lighten(window.anychart.color.lighten(this.sourceColor))
        }, selectRisingFill: function() {
          return window.anychart.color.lighten(window.anychart.color.lighten("red"))
        }, fallingFill: function() {
          return window.anychart.color.darken(this.sourceColor)
        }, hoverFallingFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))
        },
        selectFallingFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken("blue"))
        }, risingHatchFill: null, hoverRisingHatchFill: null, fallingHatchFill: null, hoverFallingHatchFill: null, risingStroke: function() {
          return this.sourceColor
        }, hoverRisingStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, selectRisingStroke: function() {
          return window.anychart.color.lighten("red")
        }, fallingStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))
        },
        hoverFallingStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))
        }, selectFallingStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken("blue")))
        }, tooltip: {
          content: {hAlign: "left"}, textFormatter: function() {
            return "O: " + this.valuePrefix + parseFloat(this.open).toFixed(4) + this.valuePostfix + "\nH: " + this.valuePrefix + parseFloat(this.high).toFixed(4) + this.valuePostfix + "\nL: " +
                this.valuePrefix + parseFloat(this.low).toFixed(4) + this.valuePostfix + "\nC: " + this.valuePrefix + parseFloat(this.close).toFixed(4) + this.valuePostfix
          }
        }, labels: {
          position: "centerTop", textFormatter: function() {
            return this.x
          }, offsetY: -10
        }
      }, column: {
        fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .85, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = .85;
          return a
        },
        hoverStroke: function() {
          return window.anychart.color.setOpacity(this.sourceColor, 1)
        }, legendItem: {iconStroke: null}, markers: {position: "centerTop"}, labels: {position: "centerTop"}
      }, line: {
        labels: {anchor: "bottomleft", padding: {top: 5, right: 5, bottom: 5, left: 5}}, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 2);
          a.opacity = 1;
          return a
        }, legendItem: {iconType: "line"}, hoverStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, hoverMarkers: {enabled: !0}, selectMarkers: {
          enabled: !0,
          fill: "#FFD700", size: 6
        }
      }, marker: {}, ohlc: {
        risingStroke: function() {
          return this.sourceColor
        }, hoverRisingStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, selectRisingStroke: function() {
          return window.anychart.color.darken("red")
        }, fallingStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))
        }, hoverFallingStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))
        },
        selectFallingStroke: function() {
          return window.anychart.color.darken("blue")
        }, tooltip: {
          content: {hAlign: "left"}, textFormatter: function() {
            return "O: " + this.valuePrefix + parseFloat(this.open).toFixed(4) + this.valuePostfix + "\nH: " + this.valuePrefix + parseFloat(this.high).toFixed(4) + this.valuePostfix + "\nL: " + this.valuePrefix + parseFloat(this.low).toFixed(4) + this.valuePostfix + "\nC: " + this.valuePrefix + parseFloat(this.close).toFixed(4) + this.valuePostfix
          }
        }, labels: {
          textFormatter: function() {
            return this.x
          }, offsetY: -10
        }
      },
      rangeArea: {
        labels: {anchor: "bottom"}, legendItem: {iconStroke: null}, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, lowStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, hoverLowStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, highStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor,
              1.5);
          a.opacity = 1;
          return a
        }, hoverHighStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, tooltip: {
          content: {hAlign: "left"}, textFormatter: function() {
            return "High: " + this.valuePrefix + parseFloat(this.high).toFixed(2) + this.valuePostfix + "\nLow: " + this.valuePrefix + parseFloat(this.low).toFixed(2) + this.valuePostfix
          }
        }
      }, rangeBar: {
        tooltip: {
          content: {hAlign: "left"}, textFormatter: function() {
            return "High: " + this.valuePrefix + parseFloat(this.high).toFixed(2) + this.valuePostfix +
                "\nLow: " + this.valuePrefix + parseFloat(this.low).toFixed(2) + this.valuePostfix
          }
        }
      }, rangeColumn: {
        tooltip: {
          content: {hAlign: "left"}, textFormatter: function() {
            return "High: " + this.valuePrefix + parseFloat(this.high).toFixed(2) + this.valuePostfix + "\nLow: " + this.valuePrefix + parseFloat(this.low).toFixed(2) + this.valuePostfix
          }
        }
      }, rangeSplineArea: {
        labels: {anchor: "bottom"}, legendItem: {iconStroke: null}, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor,
              .6, !0)
        }, lowStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, hoverLowStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, highStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, hoverHighStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, tooltip: {
          content: {hAlign: "left"}, textFormatter: function() {
            return "High: " +
                this.valuePrefix + parseFloat(this.high).toFixed(2) + this.valuePostfix + "\nLow: " + this.valuePrefix + parseFloat(this.low).toFixed(2) + this.valuePostfix
          }
        }
      }, rangeStepArea: {
        labels: {anchor: "bottom"}, legendItem: {iconStroke: null}, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, lowStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, hoverLowStroke: function() {
          var a =
              window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, highStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, hoverHighStroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 1.5);
          a.opacity = 1;
          return a
        }, tooltip: {
          content: {hAlign: "left"}, textFormatter: function() {
            return "High: " + this.valuePrefix + parseFloat(this.high).toFixed(2) + this.valuePostfix + "\nLow: " + this.valuePrefix + parseFloat(this.low).toFixed(2) + this.valuePostfix
          }
        }
      },
      spline: {
        labels: {anchor: "bottomleft", padding: {top: 5, right: 5, bottom: 5, left: 5}}, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 2);
          a.opacity = 1;
          return a
        }, legendItem: {iconType: "line"}, hoverStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, hoverMarkers: {enabled: !0}, selectMarkers: {enabled: !0, fill: "#FFD700", size: 6}
      }, splineArea: {
        labels: {anchor: "bottomleft", padding: {top: 5, right: 5, bottom: 5, left: 5}}, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor,
              .6, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, legendItem: {iconStroke: null}, hoverMarkers: {enabled: !0}, selectMarkers: {enabled: !0, fill: "#FFD700", size: 6}
      }, stepLine: {
        labels: {anchor: "bottom", padding: {top: 5, right: 5, bottom: 5, left: 5}}, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor,
              2);
          a.opacity = 1;
          return a
        }, legendItem: {iconType: "line"}, hoverStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, hoverMarkers: {enabled: !0}, selectMarkers: {enabled: !0, fill: "#FFD700", size: 6}
      }, stepArea: {
        labels: {anchor: "bottom", padding: {top: 5, right: 5, bottom: 5, left: 5}}, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor,
              1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, legendItem: {iconStroke: null}, hoverMarkers: {enabled: !0}, selectMarkers: {enabled: !0, fill: "#FFD700", size: 6}
      }
    },
    defaultGridSettings: {enabled: !0, isMinor: !1, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: null, evenFill: null, stroke: "#cecece", scale: 1, zIndex: 11},
    defaultMinorGridSettings: {
      enabled: !0, isMinor: !0, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: null, evenFill: null, stroke: "#eaeaea",
      scale: 1, zIndex: 10
    },
    defaultXAxisSettings: {enabled: !0, orientation: "bottom", title: {enabled: !1, text: "X-Axis", padding: {top: 5, right: 5, bottom: 5, left: 5}}, width: null, scale: 0, labels: {padding: {top: 5, right: 0, bottom: 5, left: 0}}, minorLabels: {padding: {top: 5, right: 0, bottom: 5, left: 0}}},
    defaultYAxisSettings: {
      enabled: !0, orientation: "left", title: {enabled: !1, text: "Y-Axis"}, staggerMode: !1, staggerLines: null, ticks: {enabled: !0}, width: null, labels: {padding: {top: 0, right: 5, bottom: 0, left: 5}}, minorLabels: {
        padding: {
          top: 0, right: 5,
          bottom: 0, left: 5
        }
      }, scale: 1
    },
    defaultLineMarkerSettings: {enabled: !0, value: 0, layout: "horizontal", stroke: {color: "#DC0A0A", thickness: 1, opacity: 1, dash: "", lineJoin: "miter", lineCap: "square"}, zIndex: 25.2, scale: 1},
    defaultTextMarkerSettings: {enabled: !0, fontSize: 12, value: 0, anchor: "center", align: "center", layout: "horizontal", offsetX: 0, offsetY: 0, text: "Text marker", width: null, height: null, zIndex: 25.3, scale: 1},
    defaultRangeMarkerSettings: {enabled: !0, from: 0, to: 0, layout: "horizontal", fill: "#000 0.3", zIndex: 25.1, scale: 1},
    background: {enabled: !1},
    legend: {enabled: !1},
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    padding: {top: 0, right: 0, bottom: 0, left: 0},
    series: [],
    grids: [],
    minorGrids: [],
    xAxes: [],
    yAxes: [],
    lineAxesMarkers: [],
    rangeAxesMarkers: [],
    textAxesMarkers: [],
    scales: [{type: "ordinal", inverted: !1, names: [], ticks: {interval: 1}}, {
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5},
      stackMode: "none", stickToZero: !0
    }],
    xScale: 0,
    yScale: 1,
    barsPadding: .4,
    barGroupsPadding: .8,
    maxBubbleSize: "20%",
    minBubbleSize: "5%",
    barChartMode: !1,
    crosshair: {
      enabled: !1, displayMode: "float", xStroke: "#cecece", yStroke: "#cecece", xLabel: {
        x: 0, y: 0, axisIndex: 0, textFormatter: function() {
          return this.value
        }, enabled: !0, fontSize: 12, fontColor: "#fff", fontWeight: 400, textWrap: "byLetter", disablePointerEvents: !0, text: "Label text", background: {enabled: !0, fill: "#212121 0.7", corners: 3}, padding: {top: 5, right: 10, bottom: 5, left: 10},
        width: null, height: null, anchor: null, offsetX: 0, offsetY: 0, minFontSize: 8, maxFontSize: 72, adjustFontSize: {width: !1, height: !1}, rotation: 0
      }, yLabel: {
        x: 0,
        y: 0,
        axisIndex: 0,
        textFormatter: function() {
          return this.value
        },
        enabled: !0,
        fontSize: 12,
        fontColor: "#fff",
        fontWeight: 400,
        textWrap: "byLetter",
        disablePointerEvents: !0,
        text: "Label text",
        background: {enabled: !0, fill: "#212121 0.7", corners: 3},
        padding: {top: 5, right: 10, bottom: 5, left: 10},
        width: null,
        height: null,
        anchor: null,
        offsetX: 0,
        offsetY: 0,
        minFontSize: 8,
        maxFontSize: 72,
        adjustFontSize: {
          width: !1,
          height: !1
        },
        rotation: 0
      }, zIndex: 41
    }
  },
  area: {background: {enabled: !0}, xAxes: [{}], yAxes: [{}], grids: [], minorGrids: [], padding: {top: 30, right: 20, bottom: 20, left: 20}, tooltip: {displayMode: "union"}, interactivity: {hoverMode: "byX"}},
  bar: {
    background: {enabled: !0},
    barChartMode: !0,
    defaultGridSettings: {layout: "vertical"},
    defaultMinorGridSettings: {layout: "vertical"},
    defaultLineMarkerSettings: {layout: "vertical"},
    defaultTextMarkerSettings: {layout: "vertical"},
    defaultRangeMarkerSettings: {layout: "vertical"},
    defaultXAxisSettings: {
      orientation: "left",
      labels: {padding: {top: 0, right: 5, bottom: 0, left: 5}}, minorLabels: {padding: {top: 0, right: 5, bottom: 0, left: 5}}
    },
    defaultYAxisSettings: {orientation: "bottom", labels: {padding: {top: 5, right: 0, bottom: 5, left: 0}}, minorLabels: {padding: {top: 5, right: 0, bottom: 5, left: 0}}},
    xAxes: [{}],
    yAxes: [{}],
    grids: [],
    minorGrids: [],
    scales: [{type: "ordinal", inverted: !0, names: [], ticks: {interval: 1}}, {
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {
        mode: "linear", base: 0,
        minCount: 4, maxCount: 6
      }, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0
    }],
    padding: {top: 30, right: 20, bottom: 20, left: 20},
    tooltip: {displayMode: "single", position: "right", anchor: "left", offsetX: 10, offsetY: 0}
  },
  box: {background: {enabled: !0}, xAxes: [{}], yAxes: [{}], grids: [], minorGrids: [], padding: {top: 30, right: 20, bottom: 20, left: 20}},
  column: {
    background: {enabled: !0}, xAxes: [{}], yAxes: [{}], grids: [], minorGrids: [], padding: {top: 30, right: 20, bottom: 20, left: 20}, tooltip: {
      displayMode: "single", position: "top",
      anchor: "bottom", offsetX: 0, offsetY: 10
    }
  },
  financial: {
    background: {enabled: !0},
    xAxes: [{
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
              return "May" + b;
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
    }],
    yAxes: [{}],
    grids: [],
    minorGrids: [],
    scales: [{type: "dateTime", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {count: 4}, minorTicks: {count: 4}}, {
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
    padding: {top: 30, right: 20, bottom: 20, left: 20}
  },
  line: {
    background: {enabled: !0},
    xAxes: [{}], yAxes: [{}], grids: [], minorGrids: [], padding: {top: 30, right: 20, bottom: 20, left: 20}, tooltip: {displayMode: "union"}, interactivity: {hoverMode: "byX"}
  },
  scatter: {
    legend: {enabled: !1},
    defaultSeriesSettings: {
      base: {
        fill: function() {
          return this.sourceColor
        }, hoverFill: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, selectFill: function() {
          return window.anychart.color.darken(this.sourceColor)
        }, stroke: function() {
          return window.anychart.color.darken(this.sourceColor)
        }, hoverStroke: null, selectStroke: null,
        hatchFill: !1, labels: {
          enabled: !1, background: {enabled: !1}, padding: {top: 2, right: 4, bottom: 2, left: 4}, position: "center", anchor: "center", offsetX: 0, offsetY: 0, rotation: 0, width: null, height: null, textFormatter: function() {
            return this.value
          }, positionFormatter: function() {
            return this.value
          }
        }, hoverLabels: {enabled: null}, markers: {
          enabled: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, size: 4, positionFormatter: function() {
            return this.value
          }
        }, hoverMarkers: {enabled: null, size: 6}, clip: !0, color: null, tooltip: {
          textFormatter: function() {
            return "x: " +
                this.x + "\ny: " + this.valuePrefix + this.value + this.valuePostfix
          }
        }, xScale: null, yScale: null, error: {
          mode: "both", xError: null, valueError: null, xErrorWidth: 10, valueErrorWidth: 10, xErrorStroke: function() {
            return window.anychart.color.setThickness(window.anychart.color.darken(this.sourceColor))
          }, valueErrorStroke: function() {
            return window.anychart.color.setThickness(window.anychart.color.darken(this.sourceColor))
          }
        }
      }, bubble: {
        displayNegative: !1, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor,
              .7, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .7, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, legendItem: {iconStroke: null}, negativeFill: function() {
          var a = window.anychart.color.darken;
          return a(a(a(this.sourceColor)))
        }, hoverNegativeFill: function() {
          var a = window.anychart.color.darken;
          return a(a(a(a(this.sourceColor))))
        }, negativeStroke: function() {
          var a =
              window.anychart.color.darken;
          return a(a(a(a(this.sourceColor))))
        }, hoverNegativeStroke: function() {
          var a = window.anychart.color.darken;
          return a(a(a(a(a(this.sourceColor)))))
        }, negativeHatchFill: null, hoverNegativeHatchFill: void 0, hatchFill: !1, markers: {position: "center"}, tooltip: {
          textFormatter: function() {
            return "X: " + this.x + "\nY: " + this.valuePrefix + this.value + this.valuePostfix + "\nSize: " + this.size
          }
        }
      }, line: {
        connectMissingPoints: !1, stroke: function() {
          return this.sourceColor
        }, hoverStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        },
        labels: {anchor: "bottom"}
      }, marker: {}
    },
    defaultGridSettings: {enabled: !0, isMinor: !1, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: null, evenFill: null, stroke: "#cecece", scale: 1, zIndex: 11},
    defaultMinorGridSettings: {enabled: !0, isMinor: !0, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: null, evenFill: null, stroke: "#eaeaea", scale: 1, zIndex: 10},
    defaultXAxisSettings: {
      enabled: !0, orientation: "bottom", title: {text: "X-Axis", padding: {top: 5, right: 5, bottom: 5, left: 5}}, width: null, scale: 0, labels: {
        padding: {
          top: 5,
          right: 0, bottom: 5, left: 0
        }
      }, minorLabels: {padding: {top: 5, right: 0, bottom: 5, left: 0}}
    },
    defaultYAxisSettings: {enabled: !0, orientation: "left", title: {text: "Y-Axis"}, width: null, labels: {padding: {top: 0, right: 5, bottom: 0, left: 5}}, minorLabels: {padding: {top: 0, right: 5, bottom: 0, left: 5}}, scale: 1},
    defaultLineMarkerSettings: {enabled: !0, value: 0, layout: "horizontal", stroke: {color: "#DC0A0A", thickness: 1, opacity: 1, dash: "", lineJoin: "miter", lineCap: "square"}, zIndex: 25.2, scale: 1},
    defaultTextMarkerSettings: {
      enabled: !0, fontSize: 12,
      value: 0, anchor: "center", align: "center", layout: "horizontal", offsetX: 0, offsetY: 0, text: "Text marker", width: null, height: null, zIndex: 25.3, scale: 1
    },
    defaultRangeMarkerSettings: {enabled: !0, from: 0, to: 0, layout: "horizontal", fill: "#000 0.3", zIndex: 25.1, scale: 1},
    series: [],
    grids: [],
    minorGrids: [],
    xAxes: [{}],
    yAxes: [{}],
    lineAxesMarkers: [],
    rangeAxesMarkers: [],
    textAxesMarkers: [],
    scales: [{
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {
        mode: "linear",
        base: 0, minCount: 4, maxCount: 6
      }, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0
    }, {type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0}],
    xScale: 0,
    yScale: 1,
    maxBubbleSize: "20%",
    minBubbleSize: "5%",
    crosshair: {
      enabled: !1, displayMode: "float", xStroke: "#cecece", yStroke: "#cecece", xLabel: {
        x: 0,
        y: 0,
        axisIndex: 0,
        textFormatter: function() {
          return this.value
        },
        enabled: !0,
        fontSize: 12,
        fontColor: "#fff",
        fontWeight: 400,
        textWrap: "byLetter",
        disablePointerEvents: !0,
        text: "Label text",
        background: {enabled: !0, fill: "#212121 0.7", corners: 3},
        padding: {top: 5, right: 10, bottom: 5, left: 10},
        width: null,
        height: null,
        anchor: null,
        offsetX: 0,
        offsetY: 0,
        minFontSize: 8,
        maxFontSize: 72,
        adjustFontSize: {width: !1, height: !1},
        rotation: 0
      }, yLabel: {
        x: 0,
        y: 0,
        axisIndex: 0,
        textFormatter: function() {
          return this.value
        },
        enabled: !0,
        fontSize: 12,
        fontColor: "#fff",
        fontWeight: 400,
        textWrap: "byLetter",
        disablePointerEvents: !0,
        text: "Label text",
        background: {enabled: !0, fill: "#212121 0.7", corners: 3},
        padding: {top: 5, right: 10, bottom: 5, left: 10},
        width: null,
        height: null,
        anchor: null,
        offsetX: 0,
        offsetY: 0,
        minFontSize: 8,
        maxFontSize: 72,
        adjustFontSize: {width: !1, height: !1},
        rotation: 0
      }, zIndex: 41
    }
  },
  marker: {},
  bubble: {},
  bullet: {
    background: {enabled: !1},
    defaultRangeMarkerSettings: {enabled: !0, from: 0, to: 0, zIndex: 2},
    defaultMarkerSettings: {fill: "#000", stroke: "none", zIndex: 2},
    layout: "horizontal",
    rangePalette: {
      type: "distinct",
      items: ["#828282", "#a8a8a8", "#c2c2c2", "#d4d4d4", "#e1e1e1"]
    },
    markerPalette: {items: ["bar", "line", "x", "ellipse"]},
    scale: {
      type: "linear",
      ticks: {mode: "linear", base: 0, explicit: null, minCount: 3, maxCount: 5, interval: NaN},
      minorTicks: {mode: "linear", base: 0, explicit: null, count: 5, interval: NaN},
      stackMode: "none",
      stickToZero: !0,
      minimumGap: 0,
      maximumGap: 0,
      softMinimum: null,
      softMaximum: null,
      minimum: null,
      maximum: null,
      inverted: !1
    },
    axis: {
      title: {enabled: !1}, labels: {fontSize: 9, zIndex: 3}, minorLabels: {
        padding: {
          top: 1, right: 1, bottom: 0,
          left: 1
        }, zIndex: 3
      }, ticks: {stroke: "#ccc", zIndex: 3}, minorTicks: {stroke: "#ccc", zIndex: 3}, stroke: "#ccc", orientation: null, zIndex: 3
    },
    ranges: [],
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    title: {rotation: 0}
  },
  pie: {
    title: {text: "Pie Chart", margin: {bottom: 0}, padding: {top: 0, right: 0, bottom: 20, left: 0}},
    group: !1,
    sort: "none",
    radius: "45%",
    innerRadius: 0,
    startAngle: 0,
    explode: 15,
    outsideLabelsSpace: 30,
    insideLabelsOffset: "50%",
    overlapMode: "noOverlap",
    connectorLength: 20,
    outsideLabelsCriticalAngle: 60,
    connectorStroke: "#000 0.3",
    fill: function() {
      return this.sourceColor
    },
    hoverFill: function() {
      return window.anychart.color.lighten(this.sourceColor)
    },
    stroke: "none",
    hoverStroke: "none",
    hatchFill: null,
    forceHoverLabels: !1,
    labels: {
      enabled: !0, fontSize: 13, fontFamily: "Arial", fontColor: null, background: {enabled: !1}, padding: {top: 1, right: 1, bottom: 1, left: 1}, anchor: "center", rotation: 0, width: null, height: null, autoRotate: !1, textFormatter: function() {
        return (100 * this.value / this.getStat("sum")).toFixed(1) + "%"
      }, positionFormatter: function() {
        return this.value
      },
      zIndex: 32
    },
    outsideLabels: {autoColor: "#545f69"},
    insideLabels: {autoColor: "#fff"},
    hoverLabels: {enabled: null},
    tooltip: {
      enabled: !0, title: {enabled: !0, fontSize: 13, fontWeight: "normal"}, content: {fontSize: 11}, separator: {enabled: !0}, titleFormatter: function() {
        return this.name || this.x
      }, textFormatter: function() {
        return "Value: " + this.valuePrefix + this.value + this.valuePostfix + "\nPercent Value: " + (100 * this.value / this.getStat("sum")).toFixed(1) + "%"
      }
    },
    legend: {
      enabled: !0, position: "bottom", align: "center", itemsLayout: "horizontal",
      title: {enabled: !1}, titleSeparator: {enabled: !1, margin: {top: 3, right: 0, bottom: 3, left: 0}}
    },
    interactivity: {hoverMode: "single"}
  },
  pie3d: {explode: "5%", connectorLength: "15%"},
  pieFunnelPyramidBase: {
    baseWidth: "90%",
    connectorLength: 20,
    connectorStroke: "#7c868e",
    overlapMode: "noOverlap",
    pointsPadding: 5,
    fill: function() {
      return this.sourceColor
    },
    hoverFill: function() {
      return window.anychart.color.lighten(this.sourceColor)
    },
    stroke: function() {
      return window.anychart.color.setThickness(this.sourceColor, 1.5)
    },
    hoverStroke: function() {
      return window.anychart.color.setThickness(this.sourceColor,
          1.5)
    },
    hatchFill: null,
    labels: {
      enabled: !0, fontSize: 13, fontFamily: "Arial", fontColor: null, disablePointerEvents: !1, background: {enabled: !1}, padding: {top: 1, right: 1, bottom: 1, left: 1}, position: "outsideLeftInColumn", anchor: "center", rotation: 0, width: null, height: null, textFormatter: function() {
        return this.name ? this.name : this.x
      }, positionFormatter: function() {
        return this.value
      }, zIndex: 34
    },
    outsideLabels: {autoColor: "#545f69"},
    insideLabels: {autoColor: "#fff"},
    hoverLabels: {enabled: null, padding: {top: 1, right: 1, bottom: 1, left: 1}},
    markers: {
      enabled: !1, rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, size: 8, positionFormatter: function() {
        return this.value
      }, zIndex: 33
    },
    hoverMarkers: {enabled: null, size: 12},
    tooltip: {
      enabled: !0, title: {enabled: !0, fontSize: 13, fontWeight: "normal"}, content: {fontSize: 11}, separator: {enabled: !0}, titleFormatter: function() {
        return this.name || this.x
      }, textFormatter: function() {
        return "Value: " + this.valuePrefix + this.value + this.valuePostfix + "\nPercent Value: " + (100 * this.value / this.getStat("sum")).toFixed(1) + "%"
      }
    },
    legend: {
      margin: {
        top: 0,
        right: 0, bottom: 0, left: 0
      }, tooltip: {
        textFormatter: function() {
          return this.value + "\n" + this.valuePrefix + this.meta.pointValue + this.valuePostfix
        }
      }, zIndex: 35, position: "right", hAlign: "left", vAlign: "middle", itemsLayout: "vertical", enabled: !1
    },
    interactivity: {hoverMode: "single"}
  },
  funnel: {title: {text: "Funnel Chart"}, neckWidth: "30%", neckHeight: "25%"},
  pyramid: {title: {text: "Pyramid Chart"}, reversed: !1, legend: {inverted: !0}},
  radar: {
    title: {padding: {top: 0, right: 0, bottom: 20, left: 0}},
    defaultSeriesSettings: {
      base: {
        enabled: !0,
        hatchFill: null, labels: {enabled: !1, position: "center"}, hoverLabels: {enabled: null, position: "center"}, markers: {
          enabled: !1, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, size: 4, positionFormatter: function() {
            return this.value
          }
        }, hoverMarkers: {enabled: null, size: 6}
      }, area: {
        fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor,
              1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, legendItem: {iconStroke: null}, markers: {enabled: !1, position: "center"}
      }, line: {
        markers: {enabled: !1, position: "center"}, stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 2);
          a.opacity = 1;
          return a
        }, legendItem: {iconType: "line"}, hoverStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }
      }, marker: {}
    },
    defaultGridSettings: {
      enabled: !0, isMinor: !1, layout: "radial", drawLastLine: !0,
      oddFill: "none", evenFill: "none", stroke: "#DDDDDD", zIndex: 10, xScale: 0, yScale: 1
    },
    defaultMinorGridSettings: {enabled: !0, isMinor: !0, layout: "circuit", drawLastLine: !0, oddFill: "none", evenFill: "none", stroke: "#333333", zIndex: 10, xScale: 0, yScale: 1},
    xAxis: {stroke: "#eaeaea", ticks: {enabled: !1, stroke: "#cecece", length: 6}, labels: {hAlign: "center", padding: {top: 2, right: 5, bottom: 2, left: 5}, fontSize: 12}, scale: 0, zIndex: 25},
    yAxis: {
      stroke: "#b9b9b9", drawLastLabel: !1, labels: {
        hAlign: "center", padding: {top: 0, right: 2, bottom: 0, left: 0},
        fontSize: 11
      }, minorLabels: {padding: {top: 1, right: 1, bottom: 0, left: 1}}, ticks: {enabled: !0, stroke: "#b9b9b9", length: 6}, minorTicks: {stroke: "#eaeaea", length: 4}, zIndex: 25, scale: 1
    },
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
    title: {padding: {top: 0, right: 0, bottom: 20, left: 0}},
    defaultSeriesSettings: {
      base: {
        enabled: !0, hatchFill: null, labels: {enabled: !1, position: "center"}, hoverLabels: {enabled: null, position: "center"}, markers: {
          enabled: !1, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, size: 4, positionFormatter: function() {
            return this.value
          }
        }, hoverMarkers: {enabled: null, size: 6}
      }, area: {
        fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        },
        hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .6, !0)
        }, selectFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .9, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, selectStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, legendItem: {iconStroke: null}
      }, line: {
        markers: {enabled: !1}, legendItem: {iconType: "line"},
        stroke: function() {
          var a = window.anychart.color.setThickness(this.sourceColor, 2);
          a.opacity = 1;
          return a
        }, hoverStroke: function() {
          return window.anychart.color.lighten(this.sourceColor)
        }, selectStroke: function() {
          return window.anychart.color.darken(this.sourceColor)
        }
      }, marker: {}
    },
    defaultGridSettings: {enabled: !0, isMinor: !1, layout: "radial", drawLastLine: !0, oddFill: "none", evenFill: "none", stroke: "#DDDDDD", zIndex: 10, xScale: 0, yScale: 1},
    defaultMinorGridSettings: {
      enabled: !0, isMinor: !0, layout: "circuit", drawLastLine: !0,
      oddFill: "none", evenFill: "none", stroke: "#333333", zIndex: 10, xScale: 0, yScale: 1
    },
    xAxis: {stroke: "#eaeaea", ticks: {enabled: !1, stroke: "#cecece", length: 6}, labels: {hAlign: "center", padding: {top: 2, right: 5, bottom: 2, left: 5}, fontSize: 12}, scale: 0, zIndex: 25},
    yAxis: {
      stroke: "#b9b9b9",
      drawLastLabel: !1,
      labels: {hAlign: "center", padding: {top: 0, right: 2, bottom: 0, left: 0}, fontSize: 11},
      minorLabels: {padding: {top: 1, right: 1, bottom: 0, left: 1}},
      ticks: {enabled: !0, stroke: "#b9b9b9", length: 6},
      minorTicks: {stroke: "#eaeaea", length: 4},
      zIndex: 25,
      scale: 1
    },
    startAngle: 0,
    grids: [{}],
    minorGrids: [],
    scales: [{type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0}, {
      type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5},
      stackMode: "none", stickToZero: !0
    }],
    xScale: 0,
    yScale: 1
  },
  sparkline: {
    title: {enabled: !1, padding: {top: 0, right: 0, bottom: 0, left: 0}, margin: {top: 0, right: 0, bottom: 0, left: 0}, orientation: "right", rotation: 0},
    background: {enabled: !1},
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    padding: {top: 0, right: 0, bottom: 0, left: 0},
    defaultSeriesSettings: {
      base: {
        markers: {enabled: !1, position: "center", anchor: "center", type: "circle", size: 1.8, stroke: "none"}, labels: {enabled: !1, fontSize: 8, background: {enabled: !1}, position: "center", anchor: "centerBottom"},
        minLabels: {position: "bottom", anchor: "bottomCenter"}, maxLabels: {position: "top", anchor: "topCenter"}, color: "#64b5f6"
      },
      area: {stroke: "#64b5f6", fill: "#64b5f6 0.5"},
      column: {markers: {position: "centerTop"}, labels: {position: "centerTop", anchor: "centerBottom"}, negativeMarkers: {position: "centerBottom"}, negativeLabels: {position: "centerBottom", anchor: "centerTop"}, fill: "#64b5f6", negativeFill: "#ef6c00"},
      line: {stroke: "#64b5f6"},
      winLoss: {
        markers: {position: "centerTop", anchor: "centerTop"}, labels: {
          position: "centerTop",
          anchor: "centerTop"
        }, negativeMarkers: {position: "centerBottom", anchor: "centerBottom"}, negativeLabels: {position: "centerBottom", anchor: "centerBottom"}, fill: "#64b5f6", negativeFill: "#ef6c00"
      }
    },
    defaultLineMarkerSettings: {enabled: !0, value: 0, layout: "horizontal", stroke: {color: "#DC0A0A", thickness: 1, opacity: 1, dash: "", lineJoin: "miter", lineCap: "square"}, zIndex: 25.2, scale: 1},
    defaultTextMarkerSettings: {
      enabled: !0, value: 0, anchor: "center", align: "center", layout: "horizontal", offsetX: 0, offsetY: 0, text: "Text marker", width: null,
      height: null, zIndex: 25.3, scale: 1
    },
    defaultRangeMarkerSettings: {enabled: !0, from: 0, to: 0, layout: "horizontal", fill: "#000 0.3", zIndex: 25.1, scale: 1},
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
    maxLabels: {
      fontSize: 9, padding: {
        top: 3, right: 0, bottom: 3,
        left: 0
      }, fontColor: "#9b1f00"
    },
    lineAxesMarkers: [],
    rangeAxesMarkers: [],
    textAxesMarkers: [],
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
    yScale: 1,
    clip: !0,
    seriesType: "line",
    connectMissingPoints: !1,
    pointWidth: "95%",
    tooltip: {
      displayMode: "single",
      title: {enabled: !1}, titleFormatter: function() {
        return "Tooltip title"
      }, textFormatter: function() {
        if (this.chart.type && "winLoss" == this.chart.type()) {
          var a = this.value;
          return "x: " + this.x + "\n" + (0 < a ? "Win" : 0 > a ? "Loss" : "Draw")
        }
        return "x: " + this.x + "\ny: " + this.valuePrefix + this.value + this.valuePostfix
      }
    }
  },
  circularGauge: {
    title: {enabled: !1},
    defaultAxisSettings: {
      startAngle: null, labels: {position: "inside", adjustFontSize: !0}, minorLabels: {position: "inside", adjustFontSize: !0}, fill: "black .3", ticks: {
        hatchFill: !1, type: "line",
        position: "center", length: null, fill: "red", stroke: "none"
      }, minorTicks: {hatchFill: !1, type: "line", position: "center", length: null, fill: "red", stroke: "none"}, zIndex: 10
    },
    defaultPointerSettings: {
      base: {enabled: !0, fill: "#f22922", stroke: "#f22922", hatchFill: !1, axisIndex: 0},
      bar: {position: "center"},
      marker: {size: 4, hoverSize: 6, position: "inside", type: "triangleUp"},
      needle: {},
      knob: {fill: {keys: ["rgb(255, 255, 255)", "rgb(220, 220, 220)"], angle: 135}, stroke: "2 #ccc", verticesCount: 6, verticesCurvature: .5, topRatio: .5, bottomRatio: .5}
    },
    defaultRangeSettings: {enabled: !0, axisIndex: 0, fill: "#008000 .5", position: "center", startSize: 0, endSize: "10%"},
    fill: {keys: ["#fff", "#dcdcdc"], angle: 315},
    startAngle: 0,
    sweepAngle: 360,
    cap: {enabled: !1, fill: {keys: ["#D3D3D3", "#6F6F6F"], angle: -45}, stroke: "none", hatchFill: !1, radius: "15%", zIndex: 50},
    circularPadding: "10%",
    encloseWithStraightLine: !1,
    axes: [],
    bars: [],
    markers: [],
    needles: [],
    knobs: [],
    ranges: [],
    interactivity: {hoverMode: "single"},
    tooltip: {
      enabled: !1, title: {enabled: !1}, titleFormatter: function() {
        return this.value
      },
      textFormatter: function() {
        return this.valuePrefix + this.value + this.valuePostfix
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
        },
        hoverFill: function() {
          return window.anychart.color.lighten(this.sourceColor)
        },
        selectFill: {color: "#333333"},
        stroke: {thickness: .5, color: "#545f69"},
        hoverStroke: {thickness: .5, color: "#545f69"},
        selectStroke: {thickness: .5, color: "#333333"},
        hatchFill: !1,
        labels: {
          enabled: !0, fontSize: 12, adjustFontSize: {width: !0, height: !0}, position: "center", anchor: "center", textFormatter: function() {
            return this.name || this.size
          }
        },
        hoverLabels: {enabled: null},
        selectLabels: {enabled: null},
        markers: {enabled: !1, disablePointerEvents: !1, size: 4, position: "center", rotation: 0, anchor: "center"},
        hoverMarkers: {enabled: null, size: 6},
        selectMarkers: {enabled: null, size: 6},
        color: null,
        allowPointsSelect: null,
        tooltip: {
          titleFormatter: function() {
            return this.name
          }, textFormatter: function() {
            return "Id: " +
                this.id + "\nValue: " + this.valuePrefix + this.value + this.valuePostfix
          }
        },
        xScale: null,
        yScale: null,
        geoIdField: null
      }, choropleth: {}, bubble: {
        displayNegative: !1, fill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .7, !0)
        }, hoverFill: function() {
          return window.anychart.color.setOpacity(this.sourceColor, .7, !0)
        }, stroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, hoverStroke: function() {
          return window.anychart.color.setThickness(this.sourceColor, 1.5)
        }, legendItem: {iconStroke: null},
        negativeFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))
        }, hoverNegativeFill: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))))
        }, negativeStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor))))
        }, hoverNegativeStroke: function() {
          return window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(window.anychart.color.darken(this.sourceColor)))))
        },
        negativeHatchFill: null, hoverNegativeHatchFill: null, tooltip: {
          titleFormatter: function() {
            return this.name || this.getDataValue("name")
          }, textFormatter: function() {
            return "Value: " + this.valuePrefix + this.size + this.valuePostfix
          }
        }
      }
    }, colorRange: {
      enabled: !1, stroke: null, orientation: "bottom", title: {enabled: !1}, colorLineSize: 20, padding: {top: 10, right: 0, bottom: 20, left: 0}, align: "center", length: "70%", marker: {
        padding: {top: 3, right: 3, bottom: 3, left: 3}, fill: "#545f69", hoverFill: "#545f69", stroke: "#545f69", hoverStroke: "#545f69",
        positionFormatter: function() {
          return this.value
        }, legendItem: {iconStroke: null}, enabled: !0, disablePointerEvents: !1, position: "center", rotation: 0, anchor: "center", offsetX: 0, offsetY: 0, type: "triangleDown", size: 15
      }, labels: {offsetX: 0}, ticks: {stroke: {thickness: 3, color: "#fff", position: "center", length: 20}}
    }, unboundRegions: {enabled: !0, fill: "#F7F7F7", stroke: "#B9B9B9"}, linearColor: {colors: ["#fff", "#ffd54f", "#ef6c00"]}, ordinalColor: {
      autoColors: function(a) {
        return window.anychart.color.blendedHueProgression("#ffd54f",
            "#ef6c00", a)
      }
    }, legend: {enabled: !1}, maxBubbleSize: "10%", minBubbleSize: "3%", geoIdField: "id"
  },
  choropleth: {},
  bubbleMap: {},
  defaultDataGrid: {
    isStandalone: !0,
    titleHeight: 25,
    backgroundFill: "#fff",
    columnStroke: "#ccd7e1",
    rowStroke: "#ccd7e1",
    rowOddFill: "#fff",
    rowEvenFill: "#fafafa",
    rowFill: "#fff",
    hoverFill: "#edf8ff",
    rowSelectedFill: "#d2eafa",
    zIndex: 5,
    titleFill: {keys: ["#f8f8f8", "#fff"], angle: 90},
    tooltip: {
      anchor: "leftTop", content: {hAlign: "left"}, textFormatter: function(a) {
        a = a.get("name");
        return void 0 !== a ? a + "" :
            ""
      }
    },
    defaultColumnSettings: {
      width: 90,
      cellTextSettings: {anchor: "leftTop", vAlign: "middle", padding: {top: 0, right: 5, bottom: 0, left: 5}, textWrap: "noWrap", background: null, rotation: 0, width: null, height: null, fontSize: 11, minFontSize: 8, maxFontSize: 72},
      depthPaddingMultiplier: 0,
      collapseExpandButtons: !1,
      title: {margin: {top: 0, right: 0, bottom: 0, left: 0}, textWrap: "noWrap", hAlign: "center", vAlign: "middle", background: {enabled: !1}},
      textFormatter: function() {
        return ""
      }
    },
    columns: [{
      width: 50, textFormatter: function(a) {
        a = a.meta("index");
        return null != a ? a + 1 + "" : ""
      }, title: {text: "#"}
    }, {
      width: 170, collapseExpandButtons: !0, depthPaddingMultiplier: 15, textFormatter: function(a) {
        a = a.get("name");
        return null != a ? a + "" : ""
      }, title: {text: "Name"}
    }]
  },
  gantt: {
    base: {
      splitterPosition: "30%",
      headerHeight: 70,
      hoverFill: "#edf8ff",
      rowSelectedFill: "#d2eafa",
      columnStroke: "#ccd7e1",
      rowStroke: "#ccd7e1",
      title: {enabled: !1},
      credits: {inChart: !0},
      background: {fill: "#fff"},
      margin: {top: 0, right: 0, bottom: 0, left: 0},
      padding: {top: 0, right: 0, bottom: 0, left: 0},
      dataGrid: {
        isStandalone: !1,
        backgroundFill: "none"
      },
      timeline: {
        columnStroke: "#ccd7e1",
        rowStroke: "#ccd7e1",
        backgroundFill: "none",
        rowOddFill: "#fff",
        rowEvenFill: "#fafafa",
        rowFill: "#fff",
        hoverFill: "#edf8ff",
        rowSelectedFill: "#d2eafa",
        zIndex: 5,
        baseFill: {keys: ["#3CA0DE", "#3085BC"], angle: -90},
        baseStroke: "#0C3F5F",
        baselineFill: {keys: ["#E1E1E1", "#A1A1A1"], angle: -90},
        baselineStroke: "#0C3F5F",
        progressFill: {keys: ["#63FF78", "#3DC351", "#188E2D"], angle: -90},
        progressStroke: "#006616",
        milestoneFill: {keys: ["#FAE096", "#EB8344"], angle: -90},
        milestoneStroke: "#000",
        parentFill: {keys: ["#646464", "#282828"], angle: -90},
        parentStroke: "#000",
        selectedElementFill: {keys: ["#f1b8b9", "#f07578"], angle: -90},
        connectorFill: "#000090",
        connectorStroke: "#000090",
        minimumGap: .1,
        maximumGap: .1,
        baselineAbove: !1,
        tooltip: {anchor: "leftTop", content: {hAlign: "left"}},
        labelsFactory: {anchor: "leftCenter", position: "rightCenter", padding: {top: 3, right: 5, bottom: 3, left: 5}, vAlign: "middle", textWrap: "noWrap", background: null, rotation: 0, width: null, height: null, fontSize: 11, minFontSize: 8, maxFontSize: 72, zIndex: 40},
        markersFactory: {anchor: "centerTop", zIndex: 50, enabled: !0, type: "star4"},
        header: {labelsFactory: {anchor: "leftTop", padding: {top: 0, right: 2, bottom: 0, left: 2}, vAlign: "middle", textWrap: "noWrap", textOverflow: "..."}}
      }
    }, ganttResource: {
      dataGrid: {
        tooltip: {
          textFormatter: function(a) {
            var b = a.item;
            if (!b)return "";
            a = b.get("name");
            var c = b.meta("minPeriodDate"), b = b.meta("maxPeriodDate");
            return (a ? a : "") + (c ? "\nStart Date: " + window.anychart.utils.defaultDateFormatter(c) : "") + (b ? "\nEnd Date: " + window.anychart.utils.defaultDateFormatter(b) :
                    "")
          }
        }
      }, timeline: {
        selectedElementStroke: "none", tooltip: {
          textFormatter: function(a) {
            var b = a.item, c = a.period;
            a = b.get("name");
            var e = c ? c.start : b.get("actualStart") || b.meta("autoStart"), b = c ? c.end : b.get("actualEnd") || b.meta("autoEnd");
            return (a ? a : "") + (e ? "\nStart Date: " + window.anychart.utils.defaultDateFormatter(e) : "") + (b ? "\nEnd Date: " + window.anychart.utils.defaultDateFormatter(b) : "")
          }
        }
      }
    }, ganttProject: {
      dataGrid: {
        tooltip: {
          textFormatter: function(a) {
            var b = a.item;
            if (!b)return "";
            a = b.get("name");
            var c = b.get("actualStart") ||
                b.meta("autoStart"), e = b.get("actualEnd") || b.meta("autoEnd"), d = b.get("progressValue");
            void 0 === d && (b = 100 * b.meta("autoProgress"), d = (Math.round(100 * b) / 100 || 0) + "%");
            return (a ? a : "") + (c ? "\nStart Date: " + window.anychart.utils.defaultDateFormatter(c) : "") + (e ? "\nEnd Date: " + window.anychart.utils.defaultDateFormatter(e) : "") + (d ? "\nComplete: " + d : "")
          }
        }
      }, timeline: {
        selectedElementStroke: "#000", tooltip: {
          textFormatter: function(a) {
            var b = a.item;
            a = b.get("name");
            var c = b.get("actualStart") || b.meta("autoStart"), e = b.get("actualEnd") ||
                b.meta("autoEnd"), d = b.get("progressValue");
            void 0 === d && (b = 100 * b.meta("autoProgress"), d = (Math.round(100 * b) / 100 || 0) + "%");
            return (a ? a : "") + (c ? "\nStart Date: " + window.anychart.utils.defaultDateFormatter(c) : "") + (e ? "\nEnd Date: " + window.anychart.utils.defaultDateFormatter(e) : "") + (d ? "\nComplete: " + d : "")
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
              return this.seriesName +
                  ": " + this.valuePrefix + a + this.valuePostfix
            }
          }, legendItem: {iconStroke: "none"}
        }, line: {stroke: "1.5 #64b5f6"}, column: {fill: "#64b5f6", stroke: "none"}, ohlc: {risingStroke: "#1976d2", fallingStroke: "#ef6c00"}
      },
      defaultGridSettings: {enabled: !0, isMinor: !1, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: null, evenFill: null, stroke: "#cecece", scale: 0, zIndex: 11},
      defaultMinorGridSettings: {
        enabled: !0, isMinor: !0, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: null, evenFill: null, stroke: "#eaeaea",
        scale: 0, zIndex: 10
      },
      defaultYAxisSettings: {
        enabled: !0,
        orientation: "left",
        title: {enabled: !1, text: "Y-Axis"},
        staggerMode: !1,
        staggerLines: null,
        ticks: {enabled: !0},
        width: 50,
        labels: {fontSize: "11px", padding: {top: 0, right: 5, bottom: 0, left: 5}},
        minorLabels: {fontSize: "11px", padding: {top: 0, right: 5, bottom: 0, left: 5}},
        scale: 0
      },
      xAxis: {
        enabled: !0, orientation: "bottom", background: {}, height: 25, scale: 0, labels: {
          enabled: !0, fontSize: "11px", padding: {top: 5, right: 5, bottom: 5, left: 5}, anchor: "centerTop", textFormatter: function() {
            var a =
                this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.utils.formatDateTime(a, "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.utils.formatDateTime(a, "yyyy MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.utils.formatDateTime(a, "MMM dd");
              case "hour":
                return window.anychart.utils.formatDateTime(a, "MMM-dd HH");
              case "minute":
                return window.anychart.utils.formatDateTime(a, "dd HH:mm");
              case "second":
                return window.anychart.utils.formatDateTime(a,
                    "HH:mm:ss");
              case "millisecond":
                return window.anychart.utils.formatDateTime(a, "HH:mm:ss.SSS")
            }
            return window.anychart.utils.formatDateTime(a, "yyyy MMM dd")
          }
        }, minorLabels: {
          enabled: !0, anchor: "centerTop", fontSize: "11px", padding: {top: 5, right: 0, bottom: 5, left: 0}, textFormatter: function() {
            var a = this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.utils.formatDateTime(a, "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.utils.formatDateTime(a, "MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.utils.formatDateTime(a,
                    "dd");
              case "hour":
                return window.anychart.utils.formatDateTime(a, "HH");
              case "minute":
                return window.anychart.utils.formatDateTime(a, "HH:mm");
              case "second":
                return window.anychart.utils.formatDateTime(a, "HH:mm:ss");
              case "millisecond":
                return window.anychart.utils.formatDateTime(a, "SSS")
            }
            return window.anychart.utils.formatDateTime(a, "HH:mm:ss.SSS")
          }
        }
      },
      dateTimeHighlighter: "#B9B9B9",
      legend: {
        enabled: !0, vAlign: "bottom", fontSize: 12, itemsLayout: "horizontal", itemsSpacing: 15, items: null, iconSize: 13, itemsFormatter: null,
        itemsTextFormatter: null, itemsSourceMode: "default", inverted: !1, hoverCursor: "pointer", iconTextSpacing: 5, width: null, height: null, position: "top", titleFormatter: function() {
          var a = this.value;
          switch (this.groupingIntervalUnit) {
            case "year":
              return window.anychart.utils.formatDateTime(a, "yyyy");
            case "semester":
            case "quarter":
            case "month":
              return window.anychart.utils.formatDateTime(a, "MMM yyyy");
            case "hour":
            case "minute":
              return window.anychart.utils.formatDateTime(a, "HH:mm, dd MMM");
            case "second":
              return window.anychart.utils.formatDateTime(a,
                  "HH:mm:ss");
            case "millisecond":
              return window.anychart.utils.formatDateTime(a, "HH:mm:ss.SSS")
          }
          return window.anychart.utils.formatDateTime(a, "dd MMM yyyy")
        }, align: "center", margin: {top: 0, right: 0, bottom: 0, left: 0}, padding: {top: 10, right: 10, bottom: 10, left: 10}, background: {enabled: !1, fill: "#fff", stroke: "none", corners: 5}, title: {
          enabled: !0, fontSize: 12, text: "", background: {enabled: !1, fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"}}, margin: {top: 0, right: 15, bottom: 0, left: 0},
          padding: {top: 0, right: 0, bottom: 0, left: 0}, orientation: "left", align: "left", hAlign: "left", rotation: 0
        }, titleSeparator: {enabled: !1, width: "100%", height: 1, margin: {top: 3, right: 0, bottom: 3, left: 0}, orientation: "top", fill: ["#000 0", "#000", "#000 0"], stroke: "none"}, paginator: {
          enabled: !0, fontSize: 12, fontColor: "#545f69", background: {enabled: !1, fill: {keys: ["#fff", "#f3f3f3", "#fff"], angle: "90"}, stroke: {keys: ["#ddd", "#d0d0d0"], angle: "90"}}, padding: {top: 0, right: 0, bottom: 0, left: 0}, margin: {top: 0, right: 0, bottom: 0, left: 0},
          orientation: "right", layout: "horizontal", zIndex: 30
        }, tooltip: {enabled: !1, title: {enabled: !1, margin: {top: 3, right: 3, bottom: 0, left: 3}, padding: {top: 0, right: 0, bottom: 0, left: 0}}}, zIndex: 20
      },
      scales: [{type: "linear", inverted: !1, maximum: null, minimum: null, minimumGap: .1, maximumGap: .1, softMinimum: null, softMaximum: null, ticks: {mode: "linear", base: 0, minCount: 4, maxCount: 6}, minorTicks: {mode: "linear", base: 0, count: 5}, stackMode: "none", stickToZero: !0}],
      yScale: 0,
      zIndex: 10,
      xAxes: [{}],
      yAxes: [{}]
    }, padding: [20, 30, 20, 60], plots: [{}],
    scroller: {
      defaultSeriesSettings: {
        base: {pointWidth: "75%"},
        line: {stroke: "#999 0.9", selectedStroke: "1.5 #64b5f6"},
        column: {fill: "#64b5f6 0.6", stroke: "none", selectedFill: "#64b5f6 0.9", selectedStroke: "none"},
        ohlc: {risingStroke: "#1976d2 0.6", fallingStroke: "#ef6c00 0.6", selectedRisingStroke: "#1976d2 0.9", selectedFallingStroke: "#ef6c00 0.9"}
      }, enabled: !0, fill: "#fff", selectedFill: "#1976d2 0.2", outlineStroke: "#cecece", height: 40, minHeight: null, maxHeight: null, thumbs: {
        enabled: !0, autoHide: !1, fill: "#f7f7f7", stroke: "#7c868e",
        hoverFill: "#ffffff", hoverStroke: "#545f69"
      }, zIndex: 40, xAxis: {
        background: {enabled: !1}, minorTicks: {enabled: !0, stroke: "#cecece"}, labels: {
          enabled: !0, fontSize: "11px", padding: {top: 5, right: 5, bottom: 5, left: 5}, anchor: "leftTop", textFormatter: function() {
            var a = this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.utils.formatDateTime(a, "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.utils.formatDateTime(a, "yyyy MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.utils.formatDateTime(a,
                    "MMM dd");
              case "hour":
                return window.anychart.utils.formatDateTime(a, "MMM-dd HH");
              case "minute":
                return window.anychart.utils.formatDateTime(a, "dd HH:mm");
              case "second":
                return window.anychart.utils.formatDateTime(a, "HH:mm:ss");
              case "millisecond":
                return window.anychart.utils.formatDateTime(a, "HH:mm:ss.SSS")
            }
            return window.anychart.utils.formatDateTime(a, "yyyy MMM dd")
          }
        }, minorLabels: {
          enabled: !0, anchor: "leftTop", fontSize: "11px", padding: {top: 5, right: 5, bottom: 5, left: 5}, textFormatter: function() {
            var a = this.tickValue;
            switch (this.majorIntervalUnit) {
              case "year":
                return window.anychart.utils.formatDateTime(a, "yyyy");
              case "semester":
              case "quarter":
              case "month":
                return window.anychart.utils.formatDateTime(a, "MMM");
              case "thirdOfMonth":
              case "week":
              case "day":
                return window.anychart.utils.formatDateTime(a, "dd");
              case "hour":
                return window.anychart.utils.formatDateTime(a, "HH");
              case "minute":
                return window.anychart.utils.formatDateTime(a, "HH:mm");
              case "second":
                return window.anychart.utils.formatDateTime(a, "HH:mm:ss");
              case "millisecond":
                return window.anychart.utils.formatDateTime(a,
                    "SSS")
            }
            return window.anychart.utils.formatDateTime(a, "HH:mm:ss.SSS")
          }
        }, zIndex: 75
      }
    }, tooltip: {
      allowLeaveScreen: !1, allowLeaveChart: !0, displayMode: "union", positionMode: "float", title: {enabled: !0, fontSize: 13}, separator: {enabled: !0}, titleFormatter: function() {
        var a = this.hoveredDate;
        switch (this.groupingIntervalUnit) {
          case "year":
            return window.anychart.utils.formatDateTime(a, "yyyy");
          case "semester":
          case "quarter":
          case "month":
            return window.anychart.utils.formatDateTime(a, "MMM yyyy");
          case "hour":
          case "minute":
            return window.anychart.utils.formatDateTime(a,
                "HH:mm, dd MMM");
          case "second":
            return window.anychart.utils.formatDateTime(a, "HH:mm:ss");
          case "millisecond":
            return window.anychart.utils.formatDateTime(a, "HH:mm:ss.SSS")
        }
        return window.anychart.utils.formatDateTime(a, "dd MMM yyyy")
      }, textFormatter: function() {
        return this.formattedValues.join("\n")
      }
    }
  },
  standalones: {
    background: {zIndex: 0},
    label: {
      enabled: !0, fontSize: 11, fontFamily: "Tahoma", fontWeight: "bold", textWrap: "byLetter", text: "Label text", background: {enabled: !1}, padding: {top: 0, right: 0, bottom: 0, left: 0},
      width: null, height: null, anchor: "leftTop", position: "leftTop", offsetX: 0, offsetY: 0, minFontSize: 8, maxFontSize: 72, adjustFontSize: {width: !1, height: !1}, rotation: 0, zIndex: 0
    },
    labelsFactory: {zIndex: 0},
    legend: {
      position: "bottom",
      align: "center",
      itemsSpacing: 15,
      iconTextSpacing: 5,
      iconSize: 15,
      width: null,
      height: null,
      itemsLayout: "horizontal",
      inverted: !1,
      items: null,
      itemsSourceMode: "default",
      itemsFormatter: function(a) {
        return a
      },
      fontColor: "#232323",
      fontSize: 12,
      background: {
        enabled: !0, fill: {
          keys: ["0 #fff 1", "0.5 #f3f3f3 1",
            "1 #fff 1"], angle: "90"
        }, stroke: {keys: ["0 #ddd 1", "1 #d0d0d0 1"], angle: "90"}, cornerType: "round", corners: 5
      },
      title: {
        enabled: !0,
        fontFamily: "Verdana",
        fontSize: 10,
        fontColor: "#232323",
        text: "Legend Title",
        background: {enabled: !1, stroke: {keys: ["0 #DDDDDD 1", "1 #D0D0D0 1"], angle: "90"}, fill: {keys: ["0 #FFFFFF 1", "0.5 #F3F3F3 1", "1 #FFFFFF 1"], angle: "90"}},
        padding: {top: 0, right: 0, bottom: 0, left: 0},
        margin: {top: 0, right: 0, bottom: 3, left: 0}
      },
      paginator: {
        enabled: !0, fontColor: "#232323", orientation: "right", margin: {
          top: 0,
          right: 0, bottom: 0, left: 0
        }, padding: {top: 0, right: 0, bottom: 0, left: 0}, background: {enabled: !1, stroke: {keys: ["0 #DDDDDD 1", "1 #D0D0D0 1"], angle: "90"}, fill: {keys: ["0 #FFFFFF 1", "0.5 #F3F3F3 1", "1 #FFFFFF 1"], angle: "90"}}, zIndex: 30
      },
      titleSeparator: {enabled: !0, width: "100%", height: 1, margin: {top: 3, right: 0, bottom: 3, left: 0}, orientation: "top", fill: {keys: ["0 #333333 0", "0.5 #333333 1", "1 #333333 0"]}, stroke: "none"},
      padding: {top: 7, right: 7, bottom: 7, left: 7},
      margin: {top: 4, right: 4, bottom: 4, left: 4},
      zIndex: 0
    },
    markersFactory: {zIndex: 0},
    title: {zIndex: 0},
    linearAxis: {zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}},
    polarAxis: {startAngle: 0, zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}},
    radarAxis: {startAngle: 0, zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}},
    radialAxis: {startAngle: 0, zIndex: 0, ticks: {enabled: !0}, minorTicks: {enabled: !0}, minorLabels: {padding: {top: 1, right: 1, bottom: 0, left: 1}}},
    linearGrid: {
      enabled: !0, isMinor: !1, layout: "horizontal", drawFirstLine: !0, drawLastLine: !0, oddFill: "#fff", evenFill: "#f5f5f5", stroke: "#c1c1c1",
      scale: null, zIndex: 0
    },
    polarGrid: {enabled: !0, isMinor: !1, layout: "circuit", drawLastLine: !0, oddFill: "#fff 0.3", evenFill: "#f5f5f5 0.3", stroke: "#c1c1c1", zIndex: 0},
    radarGrid: {enabled: !0, isMinor: !1, layout: "circuit", drawLastLine: !0, oddFill: "#fff 0.3", evenFill: "#f5f5f5 0.3", stroke: "#c1c1c1", zIndex: 0},
    lineAxisMarker: {enabled: !0, value: 0, layout: "horizontal", stroke: {color: "#DC0A0A", thickness: 1, opacity: 1, dash: "", lineJoin: "miter", lineCap: "square"}, zIndex: 0},
    textAxisMarker: {
      enabled: !0, fontSize: 11, fontFamily: "Tahoma",
      fontWeight: "bold", value: 0, anchor: "center", align: "center", layout: "horizontal", offsetX: 0, offsetY: 0, text: "Text marker", width: null, height: null, zIndex: 0
    },
    rangeAxisMarker: {enabled: !0, from: 0, to: 0, layout: "horizontal", fill: "#000 0.3", zIndex: 0},
    dataGrid: {zIndex: 0},
    scroller: {enabled: !0, fill: "#fff", selectedFill: "#e2e2e2", outlineStroke: "#fff", height: 40, minHeight: null, maxHeight: null, thumbs: {enabled: !0, autoHide: !1, fill: "#f7f7f7", stroke: "#545f69", hoverFill: "#ccc", hoverStroke: "#000"}}
  }
};