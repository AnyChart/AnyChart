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
    window.anychart.themes.darkGlamour = {
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
            fontColor: "#d7cacc"
        },
        defaultBackground: {
            fill: "#263238",
            stroke: "#192125",
            cornerType: "round",
            corners: 0
        },
        defaultAxis: {
            stroke: "#655B66",
            title: {
                fontSize: 15
            },
            ticks: {
                stroke: "#655B66"
            },
            minorTicks: {
                stroke: "#46474F"
            }
        },
        defaultGridSettings: {
            stroke: "#655B66"
        },
        defaultMinorGridSettings: {
            stroke: "#46474F"
        },
        defaultSeparator: {
            fill: "#84707C"
        },
        defaultTooltip: {
            background: {
                fill: "#263238 0.9",
                stroke: "2 #192125",
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
            stroke: "#455a64",
            ticks: {
                stroke: "#455a64",
                position: "outside",
                length: 7,
                enabled: !0
            },
            minorTicks: {
                stroke: "#455a64",
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
            fill: "#37474f",
            selectedFill: "#455a64",
            thumbs: {
                fill: "#546e7a",
                stroke: "#37474f",
                hoverFill: "#78909c",
                hoverStroke: "#455a64"
            }
        },
        defaultLegend: {
            fontSize: 13
        },
        chart: {
            defaultSeriesSettings: {
                base: {
                    selectStroke: "1.5 #fafafa",
                    selectMarkers: {
                        stroke: "1.5 #fafafa"
                    }
                },
                lineLike: {
                    selectStroke: "3 #fafafa"
                },
                areaLike: {
                    selectStroke: "3 #fafafa"
                },
                marker: {
                    selectStroke: "1.5 #fafafa"
                },
                candlestick: {
                    risingFill: "#f8bbd0",
                    risingStroke: "#f8bbd0",
                    hoverRisingFill: c,
                    hoverRisingStroke: b,
                    fallingFill: "#d81b60",
                    fallingStroke: "#d81b60",
                    hoverFallingFill: c,
                    hoverFallingStroke: b,
                    selectRisingStroke: "3 #f8bbd0",
                    selectFallingStroke: "3 #d81b60",
                    selectRisingFill: "#333333 0.85",
                    selectFallingFill: "#333333 0.85"
                },
                ohlc: {
                    risingStroke: "#f8bbd0",
                    hoverRisingStroke: b,
                    fallingStroke: "#d81b60",
                    hoverFallingStroke: b,
                    selectRisingStroke: "3 #f8bbd0",
                    selectFallingStroke: "3 #d81b60"
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
        cartesianBase: {
            defaultSeriesSettings: {
                box: {
                    selectMedianStroke: "#fafafa",
                    selectStemStroke: "#fafafa",
                    selectWhiskerStroke: "#fafafa",
                    selectOutlierMarkers: {
                        enabled: null,
                        size: 4,
                        fill: "#fafafa",
                        stroke: "#fafafa"
                    }
                }
            }
        },
        pieFunnelPyramidBase: {
            labels: {
                fontColor: null
            },
            selectStroke: "1.5 #fafafa",
            connectorStroke: "#84707C",
            outsideLabels: {
                autoColor: "#d7cacc"
            },
            insideLabels: {
                autoColor: "#37474f"
            }
        },
        map: {
            unboundRegions: {
                enabled: !0,
                fill: "#37474f",
                stroke: "#455a64"
            },
            defaultSeriesSettings: {
                base: {
                    stroke: c,
                    hoverFill: "#bdbdbd",
                    selectFill: "3 #fafafa",
                    labels: {
                        fontColor: "#212121"
                    }
                },
                connector: {
                    selectStroke: "1.5 #fafafa",
                    markers: {
                        stroke: "1.5 #37474f"
                    },
                    hoverMarkers: {
                        stroke: "1.5 #37474f"
                    },
                    selectMarkers: {
                        fill: "#fafafa",
                        stroke: "1.5 #37474f"
                    }
                },
                marker: {
                    labels: {
                        fontColor: "#d7cacc"
                    }
                }
            }
        },
        sparkline: {
            padding: 0,
            background: {
                stroke: "#263238"
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
                stroke: "#263238"
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
                items: ["#4D6570",
                    "#445963", "#3B4D56", "#34444C", "#2D3B42"
                ]
            }
        },
        heatMap: {
            stroke: "1 #263238",
            hoverStroke: "1.5 #263238",
            selectStroke: "2 #fafafa",
            labels: {
                fontColor: "#212121"
            },
            selectLabels: {
                fontColor: "#fafafa"
            }
        },
        treeMap: {
            headers: {
                background: {
                    enabled: !0,
                    fill: "#37474f",
                    stroke: "#455a64"
                }
            },
            hoverHeaders: {
                fontColor: "#d7cacc",
                background: {
                    fill: "#455a64",
                    stroke: "#455a64"
                }
            },
            labels: {
                fontColor: "#212121"
            },
            selectLabels: {
                fontColor: "#fafafa"
            },
            stroke: "#455a64",
            selectStroke: "2 #eceff1"
        },
        stock: {
            padding: [20, 30, 20, 60],
            defaultPlotSettings: {
                xAxis: {
                    background: {
                        fill: "#655B66 0.3",
                        stroke: "#655B66"
                    }
                }
            },
            scroller: {
                fill: "none",
                selectedFill: "#655B66 0.3",
                outlineStroke: "#655B66",
                defaultSeriesSettings: {
                    base: {
                        color: "#f8bbd0 0.6",
                        selectStroke: a,
                        selectFill: a
                    },
                    lineLike: {
                        selectStroke: a
                    },
                    areaLike: {
                        selectStroke: a,
                        selectFill: a
                    },
                    marker: {
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