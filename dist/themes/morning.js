(function() {
    function d() {
        return a.anychart.color.lighten(this.sourceColor)
    }

    function c() {
        return a.anychart.color.darken(this.sourceColor)
    }

    function b() {
        return a.anychart.color.setOpacity(this.sourceColor, .5, !0)
    }
    var a = this;
    a.anychart = a.anychart || {};
    a.anychart.themes = a.anychart.themes || {};
    a.anychart.themes.morning = {
        palette: {
            type: "distinct",
            items: "#0288d1 #58abd7 #ffe082 #f8bbd0 #f48fb1 #bbdefb #d4e157 #ff6e40 #03a9f4 #e1bee7".split(" ")
        },
        defaultOrdinalColorScale: {
            autoColors: function(b) {
                return a.anychart.color.blendedHueProgression("#ffe082",
                    "#f06292", b)
            }
        },
        defaultLinearColorScale: {
            colors: ["#ffe082", "#f06292"]
        },
        defaultFontSettings: {
            fontFamily: '"Source Sans Pro", sans-serif',
            fontColor: "#37474f",
            fontSize: 14
        },
        defaultBackground: {
            fill: "#ffffff",
            stroke: "#ffffff",
            cornerType: "round",
            corners: 0
        },
        defaultAxis: {
            labels: {
                enabled: !0
            },
            ticks: {
                stroke: "#cfd8dc"
            },
            minorTicks: {
                stroke: "#eceff1"
            }
        },
        defaultGridSettings: {
            stroke: "#cfd8dc"
        },
        defaultMinorGridSettings: {
            stroke: "#eceff1"
        },
        defaultSeparator: {
            fill: "#eceff1"
        },
        defaultLegend: {
            position: "right",
            vAlign: "middle",
            align: "left",
            fontSize: 14,
            iconTextSpacing: 8,
            iconSize: 18,
            itemsLayout: "vertical",
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 15
            },
            background: {
                enabled: !0,
                fill: "#F9FAFB",
                stroke: "#eceff1",
                cornerType: "round",
                corners: 2
            },
            paginator: {
                orientation: "bottom",
                fontSize: 14
            },
            title: {
                padding: {
                    bottom: 10
                },
                hAlign: "left",
                fontSize: 16
            }
        },
        defaultTooltip: {
            title: {
                fontColor: "#263238",
                padding: {
                    bottom: 8
                },
                fontSize: 18
            },
            separator: {
                enabled: !1,
                padding: {
                    bottom: 8
                }
            },
            background: {
                fill: "#F9FAFB 0.95",
                stroke: "#eceff1",
                corners: 2
            },
            padding: {
                top: 10,
                right: 20,
                bottom: 15,
                left: 20
            },
            fontColor: "#78909c"
        },
        defaultColorRange: {
            stroke: "#bdc8ce",
            ticks: {
                stroke: "#bdc8ce",
                position: "outside",
                length: 7,
                enabled: !0
            },
            minorTicks: {
                stroke: "#bdc8ce",
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
                fill: "#37474f"
            }
        },
        defaultScroller: {
            fill: "#F9FAFB",
            selectedFill: "#eceff1",
            thumbs: {
                fill: "#F9FAFB",
                stroke: "#bdc8ce",
                hovered: {
                    fill: "#bdc8ce",
                    stroke: "#e9e4e4"
                }
            }
        },
        chart: {
            defaultSeriesSettings: {
                candlestick: {
                    normal: {
                        risingFill: "#0288d1",
                        risingStroke: "#0288d1",
                        fallingFill: "#f8bbd0",
                        fallingStroke: "#f8bbd0"
                    },
                    hovered: {
                        risingFill: d,
                        risingStroke: c,
                        fallingFill: d,
                        fallingStroke: c
                    },
                    selected: {
                        risingStroke: "3 #0288d1",
                        fallingStroke: "3 #f8bbd0",
                        risingFill: "#333333 0.85",
                        fallingFill: "#333333 0.85"
                    }
                },
                ohlc: {
                    normal: {
                        risingStroke: "#0288d1",
                        fallingStroke: "#f8bbd0"
                    },
                    hovered: {
                        risingStroke: c,
                        fallingStroke: c
                    },
                    selected: {
                        risingStroke: "3 #0288d1",
                        fallingStroke: "3 #f8bbd0"
                    }
                }
            },
            title: {
                fontSize: 20,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 10,
                    left: 10
                },
                align: "left"
            }
        },
        cartesianBase: {
            defaultXAxisSettings: {
                ticks: {
                    enabled: !1
                }
            },
            defaultYAxisSettings: {
                ticks: {
                    enabled: !1
                }
            },
            xAxes: [{}],
            xGrids: [],
            yGrids: [],
            yAxes: []
        },
        financial: {
            yAxes: [{}]
        },
        map: {
            unboundRegions: {
                enabled: !0,
                fill: "#e8ecf1",
                stroke: "#bdc8ce"
            },
            defaultSeriesSettings: {
                base: {
                    normal: {
                        stroke: "#eceff1",
                        labels: {
                            fontColor: "#212121"
                        }
                    }
                },
                bubble: {
                    normal: {
                        stroke: c
                    }
                },
                connector: {
                    normal: {
                        stroke: "#0288d1",
                        markers: {
                            fill: "#58abd7",
                            stroke: "1.5 #e8ecf1"
                        }
                    },
                    hovered: {
                        stroke: "#58abd7",
                        markers: {
                            stroke: "1.5 #e8ecf1"
                        }
                    },
                    selected: {
                        stroke: "1.5 #000",
                        markers: {
                            fill: "#000",
                            stroke: "1.5 #e8ecf1"
                        }
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
                    stroke: "1.5 #0288d1",
                    fill: "#0288d1 0.5"
                },
                column: {
                    fill: "#0288d1",
                    negativeFill: "#f8bbd0"
                },
                line: {
                    stroke: "1.5 #0288d1"
                },
                winLoss: {
                    fill: "#0288d1",
                    negativeFill: "#f8bbd0"
                }
            }
        },
        bullet: {
            background: {
                stroke: "#ffffff"
            },
            defaultMarkerSettings: {
                fill: "#0288d1",
                stroke: "2 #0288d1"
            }
        },
        treeMap: {
            normal: {
                headers: {
                    background: {
                        enabled: !0,
                        fill: "#eceff1",
                        stroke: "#bdc8ce"
                    }
                },
                labels: {
                    fontColor: "#212121"
                },
                stroke: "#bdc8ce"
            },
            hovered: {
                headers: {
                    fontColor: "#757575",
                    background: {
                        fill: "#bdc8ce",
                        stroke: "#bdc8ce"
                    }
                }
            },
            selected: {
                labels: {
                    fontColor: "#fafafa"
                },
                stroke: "2 #eceff1"
            }
        },
        stock: {
            padding: [20, 30, 20, 60],
            defaultPlotSettings: {
                xAxis: {
                    background: {
                        fill: "#e8ecf1 0.6",
                        stroke: "#e8ecf1"
                    }
                },
                legend: {
                    padding: {
                        top: 0,
                        right: 10,
                        bottom: 10,
                        left: 10
                    },
                    itemsLayout: "horizontal",
                    position: "top",
                    fontSize: 12,
                    vAlign: "bottom",
                    background: null,
                    title: {
                        padding: {
                            bottom: 0
                        },
                        hAlign: "left",
                        fontSize: 12
                    }
                }
            },
            scroller: {
                fill: "none",
                selectedFill: "#e8ecf1 0.6",
                outlineStroke: "#e8ecf1",
                defaultSeriesSettings: {
                    base: {
                        selected: {
                            stroke: b
                        }
                    },
                    candlestick: {
                        normal: {
                            risingFill: "#999",
                            risingStroke: "#999",
                            fallingFill: "#999",
                            fallingStroke: "#999"
                        },
                        selected: {
                            risingStroke: b,
                            fallingStroke: b,
                            risingFill: b,
                            fallingFill: b
                        }
                    },
                    ohlc: {
                        normal: {
                            risingStroke: "#999",
                            fallingStroke: "#999"
                        },
                        selected: {
                            risingStroke: b,
                            fallingStroke: b
                        }
                    }
                }
            }
        }
    }
}).call(this);