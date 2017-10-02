(function() {
    function d() {
        return a.anychart.color.lighten(this.sourceColor)
    }

    function c() {
        return a.anychart.color.darken(this.sourceColor)
    }

    function b() {
        return this.sourceColor
    }
    var a = this;
    a.anychart = a.anychart || {};
    a.anychart.themes = a.anychart.themes || {};
    a.anychart.themes.darkProvence = {
        palette: {
            type: "distinct",
            items: "#aa8ab3 #b7cbe2 #cdd18e #938d9c #6f5264 #96246a #519790 #6aabcc #61687d #7b8030".split(" ")
        },
        defaultOrdinalColorScale: {
            autoColors: function(b) {
                return a.anychart.color.blendedHueProgression("#b7cbe2",
                    "#574774", b)
            }
        },
        defaultLinearColorScale: {
            colors: ["#b7cbe2", "#574774"]
        },
        defaultFontSettings: {
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: 13,
            fontColor: "#b2aab5"
        },
        defaultBackground: {
            fill: "#464646",
            stroke: "#363636",
            cornerType: "round",
            corners: 0
        },
        defaultAxis: {
            stroke: "#5f5b61 0.8",
            title: {
                fontSize: 15
            },
            ticks: {
                stroke: "#5f5b61 0.8"
            },
            minorTicks: {
                stroke: "#534f54 0.8"
            }
        },
        defaultGridSettings: {
            stroke: "#5f5b61 0.8"
        },
        defaultMinorGridSettings: {
            stroke: "#534f54 0.8"
        },
        defaultSeparator: {
            fill: "#5f5b61"
        },
        defaultTooltip: {
            title: {
                fontColor: "#745c65",
                padding: {
                    bottom: 5
                },
                fontSize: 15
            },
            separator: {
                enabled: !1
            },
            fontColor: "#997f89",
            fontSize: 13,
            background: {
                fill: "#ffffff 0.9",
                stroke: "#b2aab5",
                corners: 0
            },
            offsetX: 15,
            offsetY: 0,
            padding: {
                top: 5,
                right: 15,
                bottom: 5,
                left: 15
            }
        },
        defaultColorRange: {
            stroke: "#8e8691",
            ticks: {
                stroke: "#8e8691",
                position: "outside",
                length: 7,
                enabled: !0
            },
            minorTicks: {
                stroke: "#8e8691",
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
                fill: "#b2aab5"
            }
        },
        defaultScroller: {
            fill: "#616161",
            selectedFill: "#757575",
            thumbs: {
                fill: "#b2aab5",
                stroke: "#616161",
                hovered: {
                    fill: "#cec6d1",
                    stroke: "#757575"
                }
            }
        },
        defaultLegend: {
            fontSize: 13
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
                        risingFill: "#aa8ab3",
                        risingStroke: "#aa8ab3",
                        fallingFill: "#b7cbe2",
                        fallingStroke: "#b7cbe2"
                    },
                    hovered: {
                        risingFill: d,
                        risingStroke: c,
                        fallingFill: d,
                        fallingStroke: c
                    },
                    selected: {
                        risingStroke: "3 #aa8ab3",
                        fallingStroke: "3 #b7cbe2",
                        risingFill: "#333333 0.85",
                        fallingFill: "#333333 0.85"
                    }
                },
                ohlc: {
                    normal: {
                        risingStroke: "#aa8ab3",
                        fallingStroke: "#b7cbe2"
                    },
                    hovered: {
                        risingStroke: c,
                        fallingStroke: c
                    },
                    selected: {
                        risingStroke: "3 #aa8ab3",
                        fallingStroke: "3 #b7cbe2"
                    }
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
                    selected: {
                        medianStroke: "#fafafa",
                        stemStroke: "#fafafa",
                        whiskerStroke: "#fafafa",
                        uutlierMarkers: {
                            enabled: null,
                            size: 4,
                            fill: "#fafafa",
                            stroke: "#fafafa"
                        }
                    }
                }
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
            connectorStroke: "#5f5b61",
            outsideLabels: {
                autoColor: "#b2aab5"
            },
            insideLabels: {
                autoColor: "#212121"
            }
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
                        stroke: "#b2aab5",
                        labels: {
                            fontColor: "#212121"
                        }
                    },
                    hovered: {
                        fill: "#b0bec5"
                    },
                    selected: {
                        stroke: "1.5 #fafafa"
                    }
                },
                connector: {
                    normal: {
                        stroke: b,
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
                        stroke: d
                    }
                },
                marker: {
                    normal: {
                        labels: {
                            fontColor: "#b2aab5"
                        }
                    }
                }
            }
        },
        sparkline: {
            padding: 0,
            background: {
                stroke: "#464646"
            },
            defaultSeriesSettings: {
                area: {
                    stroke: "1.5 #aa8ab3",
                    fill: "#aa8ab3 0.5"
                },
                column: {
                    fill: "#aa8ab3",
                    negativeFill: "#b7cbe2"
                },
                line: {
                    stroke: "1.5 #aa8ab3"
                },
                winLoss: {
                    fill: "#aa8ab3",
                    negativeFill: "#b7cbe2"
                }
            }
        },
        bullet: {
            background: {
                stroke: "#464646"
            },
            defaultMarkerSettings: {
                fill: "#aa8ab3",
                stroke: "2 #aa8ab3"
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
                items: ["#757575", "#696969", "#606060", "#545454", "#4B4B4B"]
            }
        },
        heatMap: {
            normal: {
                stroke: "1 #464646",
                labels: {
                    fontColor: "#212121"
                }
            },
            hovered: {
                stroke: "1.5 #464646"
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
                        stroke: "#414141"
                    }
                },
                labels: {
                    fontColor: "#212121"
                },
                stroke: "#414141"
            },
            hovered: {
                headers: {
                    fontColor: "#b2aab5",
                    background: {
                        fill: "#414141",
                        stroke: "#414141"
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
                        stroke: "#5f5b61 0.8"
                    }
                }
            },
            scroller: {
                fill: "none",
                selectedFill: "#616161 0.3",
                outlineStroke: "#5f5b61 0.8",
                defaultSeriesSettings: {
                    base: {
                        selected: {
                            stroke: b
                        }
                    },
                    lineLike: {
                        selected: {
                            stroke: b
                        }
                    },
                    areaLike: {
                        selected: {
                            stroke: b
                        }
                    },
                    marker: {
                        selected: {
                            stroke: b
                        }
                    },
                    candlestick: {
                        normal: {
                            risingStroke: "#999 0.6",
                            fallingFill: "#999 0.6",
                            risingFill: "#999 0.6",
                            fallingStroke: "#999 0.6"
                        }
                    },
                    ohlc: {
                        normal: {
                            risingStroke: "#999 0.6",
                            fallingStroke: "#999 0.6"
                        }
                    }
                }
            }
        }
    }
}).call(this);