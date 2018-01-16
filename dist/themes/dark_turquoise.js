(function() {
    function c() {
        return b.anychart.color.lighten(this.sourceColor)
    }

    function d() {
        return b.anychart.color.darken(this.sourceColor)
    }

    function a() {
        return b.anychart.color.setOpacity(this.sourceColor, .6, !0)
    }
    var b = this;
    b.anychart = b.anychart || {};
    b.anychart.themes = b.anychart.themes || {};
    b.anychart.themes.darkTurquoise = {
        palette: {
            type: "distinct",
            items: "#80deea #00acc1 #00838f #29b6f6 #0277bd #0277bd #8c9eff #9575cd #ce93d8 #8e24aa".split(" ")
        },
        defaultOrdinalColorScale: {
            autoColors: function(a) {
                return b.anychart.color.blendedHueProgression("#b2dfdb",
                    "#00838f", a)
            }
        },
        defaultLinearColorScale: {
            colors: ["#b2dfdb", "#00838f"]
        },
        defaultFontSettings: {
            fontFamily: '"Lucida Console", Monaco, monospace',
            fontColor: "#e0e0e0",
            fontSize: 12
        },
        defaultBackground: {
            fill: "#424242",
            stroke: "#909090",
            cornerType: "round",
            corners: 0
        },
        defaultAxis: {
            stroke: "#929292 0.8",
            labels: {
                enabled: !0
            },
            ticks: {
                stroke: "#929292"
            },
            minorTicks: {
                stroke: "#757575"
            }
        },
        defaultGridSettings: {
            stroke: "#929292 0.8"
        },
        defaultMinorGridSettings: {
            stroke: "#757575 0.6"
        },
        defaultSeparator: {
            fill: "#757575"
        },
        defaultTooltip: {
            background: {
                fill: "#424242 0.9",
                stroke: "#909090 0.9",
                corners: 3
            },
            fontColor: "#e0e0e0",
            fontSize: 12,
            title: {
                fontColor: "#bdbdbd",
                align: "center",
                fontSize: 14
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
            stroke: "#757575",
            ticks: {
                stroke: "#757575",
                position: "outside",
                length: 7,
                enabled: !0
            },
            minorTicks: {
                stroke: "#757575",
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
                fill: "#616161"
            }
        },
        defaultScroller: {
            fill: "#616161",
            selectedFill: "#757575",
            thumbs: {
                fill: "#bdbdbd",
                stroke: "#616161",
                hovered: {
                    fill: "#e0e0e0",
                    stroke: "#757575"
                }
            }
        },
        chart: {
            defaultSeriesSettings: {
                base: {
                    selected: {
                        stroke: "1.5 #fafafa",
                        markers: {
                            stroke: "1.5 #fafafa"
                        }
                    }
                },
                lineLike: {
                    selected: {
                        stroke: "3 #fafafa"
                    }
                },
                areaLike: {
                    selected: {
                        stroke: "3 #fafafa"
                    }
                },
                marker: {
                    selected: {
                        stroke: "1.5 #fafafa"
                    }
                },
                candlestick: {
                    normal: {
                        risingFill: "#80deea",
                        risingStroke: "#80deea",
                        fallingFill: "#00838f",
                        fallingStroke: "#00838f"
                    },
                    hovered: {
                        risingFill: c,
                        risingStroke: d,
                        fallingFill: c,
                        fallingStroke: d
                    },
                    selected: {
                        risingStroke: "3 #80deea",
                        fallingStroke: "3 #00838f",
                        risingFill: "#333333 0.85",
                        fallingFill: "#333333 0.85"
                    }
                },
                ohlc: {
                    normal: {
                        risingStroke: "#80deea",
                        fallingStroke: "#00838f"
                    },
                    hovered: {
                        risingStroke: d,
                        fallingStroke: d
                    },
                    selected: {
                        risingStroke: "3 #80deea",
                        fallingStroke: "3 #00838f"
                    }
                }
            },
            title: {
                fontSize: 14
            },
            padding: {
                top: 20,
                right: 25,
                bottom: 15,
                left: 15
            }
        },
        pieFunnelPyramidBase: {
            normal: {
                labels: {
                    fontColor: null
                }
            },
            selected: {
                stroke: "1.5 #fafafa"
            },
            connectorStroke: "#757575",
            outsideLabels: {
                autoColor: "#e0e0e0"
            },
            insideLabels: {
                autoColor: "#424242"
            }
        },
        cartesianBase: {
            defaultSeriesSettings: {
                box: {
                    selected: {
                        medianStroke: "#fafafa",
                        stemStroke: "#fafafa",
                        whiskerStroke: "#fafafa",
                        outlierMarkers: {
                            enabled: null,
                            size: 4,
                            fill: "#fafafa",
                            stroke: "#fafafa"
                        }
                    }
                }
            },
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
                fill: "#616161",
                stroke: "#757575"
            },
            defaultSeriesSettings: {
                base: {
                    normal: {
                        stroke: c,
                        labels: {
                            fontColor: "#424242"
                        }
                    },
                    selected: {
                        stroke: "1.5 #fafafa"
                    }
                },
                connector: {
                    normal: {
                        markers: {
                            stroke: "1.5 #616161"
                        }
                    },
                    hovered: {
                        markers: {
                            stroke: "1.5 #616161"
                        }
                    },
                    selected: {
                        stroke: "1.5 #000",
                        markers: {
                            fill: "#000",
                            stroke: "1.5 #616161"
                        }
                    }
                },
                bubble: {
                    normal: {
                        stroke: c
                    },
                    hovered: {
                        stroke: "1.5 #909090"
                    }
                },
                marker: {
                    normal: {
                        labels: {
                            fontColor: "#e0e0e0"
                        },
                        stroke: "1.5 #424242"
                    },
                    hovered: {
                        stroke: "1.5 #909090"
                    }
                }
            }
        },
        sparkline: {
            padding: 0,
            background: {
                stroke: "#424242"
            },
            defaultSeriesSettings: {
                area: {
                    stroke: "1.5 #80deea",
                    fill: "#80deea 0.5"
                },
                column: {
                    fill: "#80deea",
                    negativeFill: "#00838f"
                },
                line: {
                    stroke: "1.5 #80deea"
                },
                winLoss: {
                    fill: "#80deea",
                    negativeFill: "#00838f"
                }
            }
        },
        bullet: {
            background: {
                stroke: "#424242"
            },
            defaultMarkerSettings: {
                fill: "#80deea",
                stroke: "2 #80deea"
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
                items: ["#A4A4A4", "#8C8C8C", "#797979", "#616161", "#4E4E4E"]
            }
        },
        heatMap: {
            normal: {
                stroke: "1 #424242",
                labels: {
                    fontColor: "#212121"
                }
            },
            hovered: {
                stroke: "1.5 #424242"
            },
            selected: {
                stroke: "2 #fafafa"
            }
        },
        treeMap: {
            normal: {
                headers: {
                    background: {
                        enabled: !0,
                        fill: "#616161",
                        stroke: "#757575"
                    }
                },
                labels: {
                    fontColor: "#212121"
                },
                stroke: "#757575"
            },
            hovered: {
                hoverHeaders: {
                    fontColor: "#e0e0e0",
                    background: {
                        fill: "#757575",
                        stroke: "#757575"
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
                        fill: "#616161 0.3",
                        stroke: "#616161"
                    }
                }
            },
            scroller: {
                fill: "none",
                selectedFill: "#616161 0.3",
                outlineStroke: "#616161",
                defaultSeriesSettings: {
                    base: {
                        selected: {
                            stroke: a,
                            fill: a
                        }
                    },
                    lineLike: {
                        selected: {
                            stroke: a
                        }
                    },
                    areaLike: {
                        selected: {
                            stroke: a,
                            fill: a
                        }
                    },
                    marker: {
                        selected: {
                            stroke: a
                        }
                    },
                    candlestick: {
                        normal: {
                            risingFill: "#999 0.6",
                            risingStroke: "#999 0.6",
                            fallingFill: "#999 0.6",
                            fallingStroke: "#999 0.6"
                        },
                        selected: {
                            risingStroke: a,
                            fallingStroke: a,
                            risingFill: a,
                            fallingFill: a
                        }
                    },
                    ohlc: {
                        normal: {
                            risingStroke: "#999 0.6",
                            fallingStroke: "#999 0.6"
                        },
                        selected: {
                            risingStroke: a,
                            fallingStroke: a
                        }
                    }
                }
            }
        }
    }
}).call(this);