(function() {
    function c() {
        return window.anychart.color.lighten(this.sourceColor)
    }

    function b() {
        return window.anychart.color.darken(this.sourceColor)
    }

    function a() {
        return this.sourceColor
    }
    window.anychart = window.anychart || {};
    window.anychart.themes = window.anychart.themes || {};
    window.anychart.themes.lightGlamour = {
        palette: {
            type: "distinct",
            items: "#f8bbd0 #ce93d8 #ab47bc #d81b60 #880e4f #ffd600 #ff6e40 #03a9f4 #5e35b1 #1976d2".split(" ")
        },
        defaultOrdinalColorScale: {
            autoColors: function(a) {
                return window.anychart.color.blendedHueProgression("#f8bbd0",
                    "#d81b60", a)
            }
        },
        defaultLinearColorScale: {
            colors: ["#f8bbd0", "#d81b60"]
        },
        defaultFontSettings: {
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: 13,
            fontColor: "#5d1b3e"
        },
        defaultBackground: {
            fill: "#fff",
            stroke: "#ffffff",
            cornerType: "round",
            corners: 0
        },
        defaultAxis: {
            stroke: "#d7cacc",
            title: {
                fontSize: 15
            },
            ticks: {
                stroke: "#d7cacc"
            },
            minorTicks: {
                stroke: "#f1eaeb"
            }
        },
        defaultGridSettings: {
            stroke: "#d7cacc"
        },
        defaultMinorGridSettings: {
            stroke: "#f1eaeb"
        },
        defaultSeparator: {
            fill: "#fce4ec"
        },
        defaultTooltip: {
            background: {
                fill: "#fef7f9 0.9",
                stroke: "2 #fce4ec",
                corners: 3
            },
            fontSize: 13,
            title: {
                align: "center",
                fontSize: 15
            },
            padding: {
                top: 10,
                right: 15,
                bottom: 10,
                left: 15
            },
            separator: {
                margin: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            }
        },
        defaultColorRange: {
            stroke: "#d7cacc",
            ticks: {
                stroke: "#d7cacc",
                position: "outside",
                length: 7,
                enabled: !0
            },
            minorTicks: {
                stroke: "#d7cacc",
                position: "outside",
                length: 5,
                enabled: !0
            },
            marker: {
                padding: {
                    top: 3,
                    right: 3,
                    bottom: 3,
                    left: 3
                },
                fill: "#d7cacc",
                hoverFill: "#d7cacc"
            }
        },
        defaultScroller: {
            fill: "#f4efef",
            selectedFill: "#ece1e3",
            thumbs: {
                fill: "#f4efef",
                stroke: "#d7cacc",
                hoverFill: "#d7cacc",
                hoverStroke: "#beafb1"
            }
        },
        defaultLegend: {
            fontSize: 13
        },
        chart: {
            defaultSeriesSettings: {
                candlestick: {
                    risingFill: "#f8bbd0",
                    risingStroke: "#f8bbd0",
                    hoverRisingFill: c,
                    hoverRisingStroke: b,
                    fallingFill: "#880e4f",
                    fallingStroke: "#880e4f",
                    hoverFallingFill: c,
                    hoverFallingStroke: b,
                    selectRisingStroke: "3 #f8bbd0",
                    selectFallingStroke: "3 #880e4f",
                    selectRisingFill: "#333333 0.85",
                    selectFallingFill: "#333333 0.85"
                },
                ohlc: {
                    risingStroke: "#f8bbd0",
                    hoverRisingStroke: b,
                    fallingStroke: "#880e4f",
                    hoverFallingStroke: b,
                    selectRisingStroke: "3 #f8bbd0",
                    selectFallingStroke: "3 #880e4f"
                }
            },
            title: {
                fontSize: 17
            },
            padding: {
                top: 20,
                right: 25,
                bottom: 15,
                left: 15
            }
        },
        pieFunnelPyramidBase: {
            labels: {
                fontColor: null
            },
            connectorStroke: "#ffcdd2",
            outsideLabels: {
                autoColor: "#5d1b3e"
            },
            insideLabels: {
                autoColor: "#37474f"
            }
        },
        map: {
            unboundRegions: {
                enabled: !0,
                fill: "#f4efef",
                stroke: "#ece1e3"
            },
            defaultSeriesSettings: {
                base: {
                    stroke: b,
                    labels: {
                        fontColor: "#212121"
                    }
                },
                connector: {
                    markers: {
                        stroke: "1.5 #ece1e3"
                    },
                    hoverMarkers: {
                        stroke: "1.5 #ece1e3"
                    },
                    selectMarkers: {
                        stroke: "1.5 #ece1e3"
                    }
                }
            }
        },
        sparkline: {
            padding: 0,
            background: {
                stroke: "#ffffff"
            },
            defaultSeriesSettings: {
                area: {
                    stroke: "1.5 #f8bbd0",
                    fill: "#f8bbd0 0.5"
                },
                column: {
                    fill: "#f8bbd0",
                    negativeFill: "#d81b60"
                },
                line: {
                    stroke: "1.5 #f8bbd0"
                },
                winLoss: {
                    fill: "#f8bbd0",
                    negativeFill: "#d81b60"
                }
            }
        },
        bullet: {
            background: {
                stroke: "#ffffff"
            },
            defaultMarkerSettings: {
                fill: "#f8bbd0",
                stroke: "2 #f8bbd0"
            },
            padding: {
                top: 5,
                right: 10,
                bottom: 5,
                left: 10
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            rangePalette: {
                items: ["#848D90", "#98A0A3",
                    "#B4B9BB", "#CFD3D4", "#EAECED"
                ]
            }
        },
        heatMap: {
            stroke: "1 #ffffff",
            hoverStroke: "1.5 #ffffff",
            selectStroke: "2 #ffffff",
            labels: {
                fontColor: "#212121"
            }
        },
        treeMap: {
            headers: {
                background: {
                    enabled: !0,
                    fill: "#f4efef",
                    stroke: "#ece1e3"
                }
            },
            hoverHeaders: {
                fontColor: "#5d1b3e",
                background: {
                    fill: "#ece1e3",
                    stroke: "#ece1e3"
                }
            },
            labels: {
                fontColor: "#212121"
            },
            selectLabels: {
                fontColor: "#fafafa"
            },
            stroke: "#ece1e3",
            selectStroke: "2 #eceff1"
        },
        stock: {
            padding: [20, 30, 20, 60],
            defaultPlotSettings: {
                xAxis: {
                    background: {
                        fill: "#d7cacc 0.3",
                        stroke: "#d7cacc"
                    }
                }
            },
            scroller: {
                fill: "none",
                selectedFill: "#d7cacc 0.3",
                outlineStroke: "#d7cacc",
                defaultSeriesSettings: {
                    base: {
                        color: "#f8bbd0 0.6",
                        selectFill: a,
                        selectStroke: a
                    },
                    candlestick: {
                        risingFill: "#999 0.6",
                        risingStroke: "#999 0.6",
                        fallingFill: "#999 0.6",
                        fallingStroke: "#999 0.6",
                        selectRisingStroke: a,
                        selectFallingStroke: a,
                        selectRisingFill: a,
                        selectFallingFill: a
                    },
                    ohlc: {
                        risingStroke: "#999 0.6",
                        fallingStroke: "#999 0.6",
                        selectRisingStroke: a,
                        selectFallingStroke: a
                    }
                }
            }
        }
    }
})();