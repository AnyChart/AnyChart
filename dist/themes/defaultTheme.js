(function() {
    function x(a) {
        switch (a.xScaleType) {
            case "dateTime":
                return window.anychart.format.date(a.x);
            default:
                return c(a.x)
        }
    }

    function y() {
        for (var a = this.chart, f = m.call(this), c = a.getSeriesCount(), e = {}, l = 0; l < c; l++) {
            var d = a.getSeriesAt(l).getType();
            e.hasOwnProperty(d) ? e[d] += 1 : e[d] = 1
        }
        var f = f + ", with ",
            g;
        for (g in e) f += e[g] + " " + g + " series, ";
        f += ". ";
        e = a.yScale();
        a = a.xScale();
        c = a.getType();
        l = e.getType();
        if ("ordinal" == l) {
            e = e.values();
            f += "Y-scale with " + e.length + " categories: ";
            for (l = 0; l < e.length; l++) f +=
                e[l] + ", ";
            f += ". "
        } else f = "dateTime" == l ? f + ("Y-scale minimum value is " + b.anychart.format.dateTime(e.minimum()) + " , maximum value is " + b.anychart.format.dateTime(e.maximum()) + ". ") : f + ("Y-scale minimum value is " + e.minimum() + " , maximum value is " + e.maximum() + ". ");
        if ("ordinal" == c) {
            a = a.values();
            f += "X-scale with " + a.length + " categories: ";
            for (c = 0; c < a.length; c++) f += a[c] + ", ";
            f += ". "
        } else f = "dateTime" == c ? f + ("X-scale minimum value is " + b.anychart.format.dateTime(a.minimum()) + " , maximum value is " + b.anychart.format.dateTime(a.maximum()) +
            ". ") : f + ("X-scale minimum value is " + a.minimum() + " , maximum value is " + a.maximum() + ". ");
        return f
    }

    function z() {
        for (var a = this.chart, f = m.call(this), c = a.getSeriesCount(), e = {}, d = 0; d < c; d++) {
            var g = a.getSeriesAt(d).seriesType();
            e.hasOwnProperty(g) ? e[g] += 1 : e[g] = 1
        }
        var f = f + ", with ",
            h;
        for (h in e) f += e[h] + " " + h + " series, ";
        f += ". ";
        e = a.yScale();
        a = a.xScale();
        c = a.getType();
        d = e.getType();
        if ("ordinal" == d) {
            e = e.values();
            f += "Y-scale with " + e.length + " categories: ";
            for (d = 0; d < e.length; d++) f += e[d] + ", ";
            f += ". "
        } else f =
            "dateTime" == d ? f + ("Y-scale minimum value is " + b.anychart.format.dateTime(e.minimum()) + " , maximum value is " + b.anychart.format.dateTime(e.maximum()) + ". ") : f + ("Y-scale minimum value is " + e.minimum() + " , maximum value is " + e.maximum() + ". ");
        if ("ordinal" == c) {
            a = a.values();
            f += "X-scale with " + a.length + " categories: ";
            for (c = 0; c < a.length; c++) f += a[c] + ", ";
            f += ". "
        } else f = "dateTime" == c ? f + ("X-scale minimum value is " + b.anychart.format.dateTime(a.minimum()) + " , maximum value is " + b.anychart.format.dateTime(a.maximum()) +
            ". ") : f + ("X-scale minimum value is " + a.minimum() + " , maximum value is " + a.maximum() + ". ");
        return f
    }

    function m() {
        var a = this.chart,
            b = a.title(),
            b = b && b.enabled() && b.text() ? b.text() : "";
        return (a.getType() || "Anychart ") + " chart " + (b ? " entitled " + b : "")
    }

    function A() {
        return b.anychart.color.setThickness(this.sourceColor, 1.5)
    }

    function B() {
        return this.seriesName + ":\n  Open: " + c(this.open) + "\n  High: " + c(this.high) + "\n  Low: " + c(this.low) + "\n  Close: " + c(this.close)
    }

    function C() {
        return "Open: " + c(this.open) + "\nHigh: " +
            c(this.high) + "\nLow: " + c(this.low) + "\nClose: " + c(this.close)
    }

    function D() {
        return "High: " + c(this.high) + "\nLow: " + c(this.low)
    }

    function E() {
        return b.anychart.color.setThickness(this.sourceColor, 1.5)
    }

    function p() {
        return b.anychart.color.setThickness(b.anychart.color.lighten(this.sourceColor), 1.5)
    }

    function r() {
        return b.anychart.color.setThickness(this.sourceColor, 1)
    }

    function t() {
        return b.anychart.color.setThickness(this.sourceColor, 1.5)
    }

    function k() {
        return b.anychart.color.lighten(this.sourceColor)
    }

    function g() {
        return b.anychart.color.darken(this.sourceColor)
    }

    function q() {
        return b.anychart.color.setOpacity(this.sourceColor, .85, !0)
    }

    function v() {
        return b.anychart.color.setOpacity(this.sourceColor, .5, !0)
    }

    function n() {
        return b.anychart.color.setOpacity(this.sourceColor, .65, !0)
    }

    function w() {
        return b.anychart.color.setOpacity(this.sourceColor, .7, !0)
    }

    function d() {
        return this.sourceColor
    }

    function F() {
        return b.anychart.format.date(this.tickValue)
    }

    function u() {
        return b.anychart.format.date(this.x)
    }

    function G() {
        return this.x
    }

    function H() {
        return this.name || this.getData("id")
    }

    function I() {
        return c(this.value, 10)
    }

    function h() {
        return c(this.value)
    }

    function c(a, f) {
        var c = null === a || "boolean" == typeof a || "" == a ? NaN : +a;
        return isNaN(c) ? a : b.anychart.format.number(c, f, void 0, void 0, void 0, void 0, void 0, void 0)
    }
    var b = this;
    b.anychart = b.anychart || {};
    b.anychart.themes = b.anychart.themes || {};
    b.anychart.themes.defaultTheme = {
        palette: {
            type: "distinct",
            items: "#64b5f6 #1976d2 #ef6c00 #ffd54f #455a64 #96a6a6 #dd2c00 #00838f #00bfa5 #ffa000".split(" ")
        },
        hatchFillPalette: {
            items: "backwardDiagonal forwardDiagonal horizontal vertical dashedBackwardDiagonal grid dashedForwardDiagonal dashedHorizontal dashedVertical diagonalCross diagonalBrick divot horizontalBrick verticalBrick checkerBoard confetti plaid solidDiamond zigZag weave percent05 percent10 percent20 percent25 percent30 percent40 percent50 percent60 percent70 percent75 percent80 percent90".split(" ")
        },
        hatchFillPaletteFor3D: {
            items: "backwardDiagonal forwardDiagonal dashedBackwardDiagonal grid dashedForwardDiagonal dashedHorizontal dashedVertical diagonalCross diagonalBrick divot horizontalBrick verticalBrick checkerBoard confetti plaid solidDiamond zigZag weave percent05 percent10 percent20 percent25 percent30 percent40 percent50 percent60 percent70 percent75 percent80 percent90 horizontal vertical".split(" ")
        },
        markerPalette: {
            items: "circle diamond square triangleDown triangleUp diagonalCross pentagon cross vline star5 star4 trapezium star7 star6 star10".split(" ")
        },
        defaultScaleSettings: {
            linear: {
                maxTicksCount: 1E3,
                inverted: !1,
                maximum: null,
                minimum: null,
                minimumGap: .1,
                maximumGap: .1,
                softMinimum: null,
                softMaximum: null,
                ticks: {
                    mode: "linear",
                    base: 0,
                    explicit: null,
                    minCount: 4,
                    maxCount: 6,
                    interval: NaN
                },
                minorTicks: {
                    mode: "linear",
                    base: 0,
                    explicit: null,
                    count: 5,
                    interval: NaN
                },
                stackMode: "none",
                stickToZero: !0
            },
            ordinal: {
                type: "ordinal",
                inverted: !1,
                names: [],
                ticks: {
                    maxCount: 100
                }
            },
            log: {
                type: "log",
                logBase: 10,
                ticks: {
                    mode: "log"
                },
                minorTicks: {
                    mode: "log"
                }
            },
            dateTime: {
                type: "dateTime",
                ticks: {
                    count: 4
                },
                minorTicks: {
                    count: 4
                }
            }
        },
        defaultOrdinalColorScale: {
            inverted: !1,
            ticks: {
                maxCount: 100
            },
            autoColors: function(a) {
                return b.anychart.color.blendedHueProgression("#90caf9", "#01579b", a)
            }
        },
        defaultLinearColorScale: {
            maxTicksCount: 1E3,
            colors: ["#90caf9", "#01579b"],
            minimumGap: 0,
            maximumGap: 0
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
        defaultBackground: {
            enabled: !1,
            fill: "#ffffff",
            stroke: "none",
            cornerType: "round",
            corners: 0
        },
        defaultSeparator: {
            enabled: !1,
            fill: "#CECECE 0.3",
            width: "100%",
            height: 1,
            margin: {
                top: 5,
                right: 0,
                bottom: 5,
                left: 0
            },
            orientation: "top",
            stroke: "none",
            zIndex: 1
        },
        defaultLabelFactory: {
            enabled: !1,
            offsetX: 0,
            offsetY: 0,
            width: null,
            height: null,
            clip: null,
            fontSize: 12,
            minFontSize: 8,
            maxFontSize: 72,
            adjustFontSize: {
                width: !1,
                height: !1
            },
            anchor: "center",
            padding: {
                top: 4,
                right: 4,
                bottom: 4,
                left: 4
            },
            rotation: 0,
            format: h,
            positionFormatter: h
        },
        defaultMarkerFactory: {
            anchor: "center",
            size: 6,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            positionFormatter: h
        },
        defaultTitle: {
            enabled: !1,
            fontSize: 16,
            text: "Title text",
            width: null,
            height: null,
            align: "center",
            hAlign: "center",
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        },
        defaultTooltip: {
            enabled: !0,
            title: {
                enabled: !1,
                fontColor: "#ffffff",
                text: "",
                fontSize: 14,
                rotation: 0,
                width: null,
                height: null,
                align: "left",
                hAlign: "left",
                orientation: "top",
                zIndex: 1,
                background: {
                    fill: "none",
                    stroke: "none"
                }
            },
            contentInternal: {
                enabled: !0,
                fontSize: 12,
                minFontSize: 9,
                maxFontSize: 13,
                fontColor: "#ffffff",
                hAlign: "left",
                text: "Tooltip Text",
                width: "100%",
                height: "100%",
                anchor: "leftTop",
                offsetX: 0,
                offsetY: 0,
                position: "leftTop",
                adjustFontSize: {
                    width: !1,
                    height: !1
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                rotation: 0,
                zIndex: 1,
                background: {
                    disablePointerEvents: !1,
                    fill: "none",
                    stroke: "none"
                }
            },
            fontSize: 12,
            minFontSize: 9,
            maxFontSize: 13,
            fontColor: "#ffffff",
            text: "Tooltip Text",
            width: null,
            height: null,
            adjustFontSize: {
                width: !1,
                height: !1
            },
            background: {
                enabled: !0,
                fill: "#212121 0.7",
                corners: 3,
                zIndex: 0,
                cornerType: "round"
            },
            offsetX: 10,
            offsetY: 10,
            padding: {
                top: 5,
                right: 10,
                bottom: 5,
                left: 10
            },
            valuePrefix: "",
            valuePostfix: "",
            position: "leftTop",
            anchor: "leftTop",
            hideDelay: 0,
            titleFormat: h,
            format: function() {
                return this.valuePrefix + c(this.value) + this.valuePostfix
            },
            unionFormat: function() {
                return this.formattedValues.join("\n")
            },
            zIndex: 0,
            allowLeaveChart: !0,
            allowLeaveScreen: !1,
            allowLeaveStage: !1
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
            title: {
                padding: {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                },
                enabled: !1,
                fontSize: 13,
                text: "Axis title",
                fontColor: "#545f69",
                zIndex: 35
            },
            labels: {
                enabled: !0,
                format: I,
                positionFormatter: h,
                zIndex: 35
            },
            minorLabels: {
                enabled: !1,
                fontSize: 9,
                format: I,
                positionFormatter: h,
                zIndex: 35
            },
            ticks: {
                enabled: !0,
                length: 6,
                position: "outside",
                stroke: "#CECECE",
                zIndex: 35
            },
            minorTicks: {
                enabled: !1,
                length: 4,
                position: "outside",
                stroke: "#EAEAEA",
                zIndex: 35
            },
            zIndex: 35
        },
        defaultGridSettings: {
            enabled: !0,
            isMinor: !1,
            drawFirstLine: !0,
            drawLastLine: !0,
            oddFill: "none",
            evenFill: "none",
            stroke: "#CECECE",
            scale: 1,
            zIndex: 11
        },
        defaultMinorGridSettings: {
            isMinor: !0,
            stroke: "#EAEAEA",
            zIndex: 10
        },
        defaultLineMarkerSettings: {
            enabled: !0,
            value: 0,
            layout: null,
            stroke: {
                color: "#7c868e",
                thickness: 2,
                opacity: 1,
                dash: "",
                lineJoin: "miter",
                lineCap: "square"
            },
            zIndex: 25.2,
            scale: 1
        },
        defaultTextMarkerSettings: {
            enabled: !0,
            fontSize: 12,
            value: 0,
            anchor: "center",
            align: "center",
            layout: null,
            offsetX: 0,
            offsetY: 0,
            text: "Text marker",
            width: null,
            height: null,
            zIndex: 25.3,
            scale: 1
        },
        defaultRangeMarkerSettings: {
            enabled: !0,
            from: 0,
            to: 0,
            layout: null,
            fill: "#c1c1c1 0.4",
            zIndex: 25.1,
            scale: 1
        },
        defaultLegend: {
            enabled: !1,
            vAlign: "bottom",
            fontSize: 12,
            textOverflow: "...",
            itemsLayout: "horizontal",
            positionMode: "outside",
            itemsSpacing: 15,
            items: null,
            itemsFormat: null,
            itemsSourceMode: "default",
            inverted: !1,
            hoverCursor: "pointer",
            iconTextSpacing: 5,
            iconSize: 15,
            width: null,
            height: null,
            position: "top",
            align: "center",
            padding: {
                top: 0,
                right: 10,
                bottom: 10,
                left: 10
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            title: {
                fontSize: 15
            },
            paginator: {
                enabled: !0,
                fontSize: 12,
                fontColor: "#545f69",
                orientation: "right",
                layout: "horizontal",
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 5
                },
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                zIndex: 30,
                buttonsSettings: {
                    normal: {
                        stroke: "#757575",
                        fill: "#9e9e9e"
                    },
                    hover: {
                        stroke: "#546e7a",
                        fill: "#7c868e"
                    },
                    pushed: {
                        stroke: "#7c868e",
                        fill: "#9e9e9e"
                    },
                    disabled: {
                        stroke: null,
                        fill: "#e0e0e0"
                    }
                }
            },
            titleFormat: null,
            tooltip: {
                enabled: !1,
                allowLeaveScreen: !0,
                allowLeaveChart: !0,
                title: {
                    enabled: !1
                }
            },
            drag: !1,
            maxWidth: null,
            maxHeight: null,
            zIndex: 200
        },
        defaultCrosshairLabel: {
            x: 0,
            y: 0,
            axisIndex: 0,
            anchor: null,
            format: h,
            enabled: !0,
            fontSize: 12,
            minFontSize: 8,
            maxFontSize: 16,
            fontColor: "#ffffff",
            fontWeight: 400,
            disablePointerEvents: !0,
            text: "Label text",
            background: {
                enabled: !0,
                disablePointerEvents: !0,
                fill: "#212121 0.7",
                corners: 3,
                zIndex: 0
            },
            padding: {
                top: 5,
                right: 10,
                bottom: 5,
                left: 10
            },
            width: null,
            height: null,
            offsetX: 0,
            offsetY: 0,
            adjustFontSize: {
                width: !1,
                height: !1
            },
            rotation: 0
        },
        defaultColorRange: {
            enabled: !1,
            stroke: "#B9B9B9",
            orientation: "bottom",
            title: {
                enabled: !1
            },
            colorLineSize: 10,
            padding: {
                top: 10,
                right: 0,
                bottom: 0,
                left: 0
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            align: "center",
            length: "50%",
            marker: {
                padding: {
                    top: 3,
                    right: 3,
                    bottom: 3,
                    left: 3
                },
                positionFormatter: h,
                enabled: !0,
                disablePointerEvents: !1,
                position: "center",
                rotation: 0,
                anchor: "center",
                offsetX: 0,
                offsetY: 0,
                type: "triangleDown",
                fill: "#333 0.85",
                stroke: "none",
                size: 7
            },
            labels: {
                offsetX: 0,
                offsetY: 0,
                fontSize: 11,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            },
            ticks: {
                stroke: "#B9B9B9",
                position: "outside",
                length: 5,
                enabled: !0
            },
            minorTicks: {
                stroke: "#B9B9B9",
                position: "outside",
                length: 3,
                enabled: !1
            }
        },
        defaultCallout: {
            enabled: !0,
            orientation: "left",
            title: {
                enabled: !1
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            align: "center",
            labels: {
                enabled: !0,
                vAlign: "center",
                hAlign: "center",
                positionFormatter: h,
                adjustFontSize: !1,
                connectorStroke: null
            }
        },
        defaultScroller: {
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
            thumbs: {
                enabled: !0,
                autoHide: !1,
                fill: "#E9E9E9",
                stroke: "#7c868e",
                hoverFill: "#ffffff",
                hoverStroke: "#757575"
            },
            inverted: !1,
            zIndex: 35
        },
        defaultGroupingSettings: {
            enabled: !0,
            forced: !1,
            levels: [{
                unit: "millisecond",
                count: 1
            }, {
                unit: "millisecond",
                count: 5
            }, {
                unit: "millisecond",
                count: 10
            }, {
                unit: "millisecond",
                count: 25
            }, {
                unit: "millisecond",
                count: 50
            }, {
                unit: "millisecond",
                count: 100
            }, {
                unit: "millisecond",
                count: 250
            }, {
                unit: "millisecond",
                count: 500
            }, {
                unit: "second",
                count: 1
            }, {
                unit: "second",
                count: 5
            }, {
                unit: "second",
                count: 10
            }, {
                unit: "second",
                count: 20
            }, {
                unit: "second",
                count: 30
            }, {
                unit: "minute",
                count: 1
            }, {
                unit: "minute",
                count: 5
            }, {
                unit: "minute",
                count: 15
            }, {
                unit: "minute",
                count: 30
            }, {
                unit: "hour",
                count: 1
            }, {
                unit: "hour",
                count: 2
            }, {
                unit: "hour",
                count: 6
            }, {
                unit: "hour",
                count: 12
            }, {
                unit: "day",
                count: 1
            }, {
                unit: "week",
                count: 1
            }, {
                unit: "month",
                count: 1
            }, {
                unit: "month",
                count: 3
            }, {
                unit: "month",
                count: 6
            }, {
                unit: "year",
                count: 1
            }],
            maxVisiblePoints: 500,
            minPixPerPoint: NaN
        },
        defaultLabelSettings: {
            enabled: !0,
            text: "Chart label",
            width: null,
            height: null,
            anchor: "leftTop",
            position: "leftTop",
            offsetX: 0,
            offsetY: 0,
            minFontSize: 8,
            maxFontSize: 72,
            adjustFontSize: {
                width: !1,
                height: !1
            },
            rotation: 0,
            zIndex: 50
        },
        stageCredits: {
            text: "AnyChart",
            url: "https://www.anychart.com/?utm_source=registered",
            alt: "AnyChart - JavaScript Charts designed to be embedded and integrated",
            imgAlt: "AnyChart - JavaScript Charts",
            logoSrc: "https://static.anychart.com/logo.png"
        },
        chart: {
            enabled: !0,
            padding: {
                top: 10,
                right: 20,
                bottom: 15,
                left: 10
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            background: {
                enabled: !0,
                zIndex: 1
            },
            contextMenu: {
                fromTheme: !0,
                enabled: !0
            },
            title: {
                text: "Chart Title",
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 10,
                    left: 0
                },
                zIndex: 80,
                background: {
                    zIndex: 0
                }
            },
            animation: {
                enabled: !1,
                duration: 1E3
            },
            interactivity: {
                hoverMode: "single",
                selectionMode: "multiSelect",
                spotRadius: 2,
                allowMultiSeriesSelection: !0
            },
            tooltip: {
                displayMode: "single",
                positionMode: "float",
                title: {
                    enabled: !0
                },
                separator: {
                    enabled: !0
                },
                titleFormat: function() {
                    return x(this.points[0])
                },
                format: function() {
                    return this.formattedValues.join("\n")
                }
            },
            bounds: {
                top: null,
                right: null,
                bottom: null,
                left: null,
                width: null,
                height: null,
                minWidth: null,
                minHeight: null,
                maxWidth: null,
                maxHeight: null
            },
            credits: {},
            defaultSeriesSettings: {
                base: {
                    enabled: !0,
                    isVertical: null,
                    background: {
                        enabled: !0
                    },
                    tooltip: {
                        titleFormat: function() {
                            return x(this)
                        },
                        format: function() {
                            return this.seriesName + ": " + this.valuePrefix + c(this.value) + this.valuePostfix
                        },
                        zIndex: 0
                    },
                    hatchFill: !1,
                    hoverHatchFill: null,
                    selectHatchFill: null,
                    labels: {
                        enabled: null,
                        anchor: "auto",
                        position: "value"
                    },
                    hoverLabels: {
                        enabled: null
                    },
                    selectLabels: {
                        enabled: null
                    },
                    markers: {
                        enabled: !1,
                        disablePointerEvents: !1,
                        position: "value",
                        positionFormatter: h,
                        size: 4
                    },
                    hoverMarkers: {
                        enabled: null,
                        size: 6
                    },
                    selectMarkers: {
                        enabled: null,
                        fill: "#333 0.85",
                        stroke: "1.5 #212121",
                        size: 6
                    },
                    legendItem: {
                        enabled: !0,
                        iconType: "square"
                    },
                    fill: n,
                    hoverFill: d,
                    selectFill: "#333 0.85",
                    stroke: t,
                    hoverStroke: p,
                    selectStroke: "#333 0.85",
                    lowStroke: t,
                    hoverLowStroke: p,
                    selectLowStroke: "#333 0.85",
                    highStroke: t,
                    hoverHighStroke: p,
                    selectHighStroke: "#333 0.85",
                    clip: !0,
                    color: null,
                    xScale: null,
                    yScale: null,
                    error: {
                        mode: "both",
                        xError: null,
                        xUpperError: null,
                        xLowerError: null,
                        valueError: null,
                        valueUpperError: null,
                        valueLowerError: null,
                        xErrorWidth: 10,
                        valueErrorWidth: 10,
                        xErrorStroke: g,
                        valueErrorStroke: g
                    },
                    pointWidth: null,
                    connectMissingPoints: !1,
                    a11y: {
                        enabled: !1,
                        titleFormat: "Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}"
                    }
                },
                marker: {
                    fill: d,
                    stroke: A,
                    hoverFill: k,
                    hoverStroke: A,
                    selectFill: "#333 0.85",
                    selectStroke: "1.5 #212121",
                    size: 4,
                    hoverSize: 6,
                    selectSize: 6,
                    legendItem: {
                        iconStroke: "none"
                    },
                    labels: {
                        offsetY: 3
                    }
                },
                bubble: {
                    fill: w,
                    hoverFill: v,
                    displayNegative: !1,
                    negativeFill: function() {
                        return b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(this.sourceColor)))
                    },
                    hoverNegativeFill: function() {
                        return b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(this.sourceColor))))
                    },
                    selectNegativeFill: function() {
                        return b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(this.sourceColor)))
                    },
                    negativeStroke: function() {
                        return b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(this.sourceColor))))
                    },
                    hoverNegativeStroke: function() {
                        return b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(this.sourceColor)))))
                    },
                    selectNegativeStroke: function() {
                        return b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(b.anychart.color.darken(this.sourceColor))))
                    },
                    negativeHatchFill: !1,
                    hoverNegativeHatchFill: null,
                    selectNegativeHatchFill: null,
                    legendItem: {
                        iconStroke: "none"
                    },
                    labels: {
                        anchor: "center"
                    }
                },
                areaLike: {
                    fill: n,
                    hoverFill: n,
                    hoverMarkers: {
                        enabled: !0
                    },
                    selectMarkers: {
                        enabled: !0
                    },
                    legendItem: {
                        iconStroke: "none"
                    },
                    stepDirection: "center"
                },
                barLike: {
                    fill: q,
                    hoverFill: n,
                    legendItem: {
                        iconStroke: "none"
                    }
                },
                lineLike: {
                    hoverMarkers: {
                        enabled: !0
                    },
                    selectMarkers: {
                        enabled: !0
                    },
                    stepDirection: "center"
                },
                rangeLike: {
                    labels: {
                        format: function() {
                            return c(this.high)
                        },
                        position: "high"
                    },
                    markers: {
                        position: "high"
                    },
                    tooltip: {
                        format: D
                    }
                },
                candlestick: {
                    risingFill: "#64b5f6",
                    risingStroke: "#64b5f6",
                    hoverRisingFill: k,
                    hoverRisingStroke: g,
                    fallingFill: "#ef6c00",
                    fallingStroke: "#ef6c00",
                    hoverFallingFill: k,
                    hoverFallingStroke: g,
                    risingHatchFill: !1,
                    hoverRisingHatchFill: null,
                    selectRisingHatchFill: null,
                    fallingHatchFill: !1,
                    hoverFallingHatchFill: null,
                    selectFallingHatchFill: null,
                    selectFallingFill: "#333 0.85",
                    selectRisingFill: "#333 0.85",
                    selectRisingStroke: "#333 0.85",
                    selectFallingStroke: "#333 0.85",
                    tooltip: {
                        format: C
                    },
                    markers: {
                        position: "high"
                    },
                    labels: {
                        position: "high",
                        format: G
                    }
                },
                column: {
                    isVertical: !1,
                    labels: {
                        offsetY: 3
                    }
                },
                ohlc: {
                    risingStroke: "#64b5f6",
                    hoverRisingStroke: g,
                    fallingStroke: "#ef6c00",
                    hoverFallingStroke: g,
                    selectRisingStroke: "3 #333 0.85",
                    selectFallingStroke: "3 #333 0.85",
                    tooltip: {
                        format: C
                    },
                    markers: {
                        position: "high"
                    },
                    labels: {
                        position: "high",
                        format: G
                    }
                },
                stick: {
                    stroke: r
                },
                jumpLine: {
                    pointWidth: "100%"
                },
                hilo: {
                    pointWidth: 1
                }
            },
            chartLabels: [],
            maxBubbleSize: "20%",
            minBubbleSize: "5%",
            a11y: {
                enabled: !0,
                titleFormat: m,
                mode: "chartElements"
            },
            defaultAnnotationSettings: {
                base: {
                    enabled: !0,
                    fill: v,
                    stroke: d,
                    hatchFill: null,
                    hoverFill: w,
                    hoverStroke: g,
                    selectFill: w,
                    selectStroke: g,
                    markers: {
                        enabled: !1,
                        size: 5,
                        type: "square",
                        fill: "#ffff66",
                        stroke: "#333333"
                    },
                    hoverMarkers: {
                        enabled: null
                    },
                    selectMarkers: {
                        enabled: !0
                    },
                    labels: {
                        enabled: !0,
                        position: "centerTop",
                        anchor: "centerTop",
                        format: function() {
                            return this.level
                        }
                    },
                    hoverLabels: {
                        enabled: null
                    },
                    selectLabels: {
                        enabled: null
                    },
                    color: "#e06666",
                    allowEdit: !0,
                    hoverGap: 5
                },
                ray: {},
                line: {},
                infiniteLine: {},
                verticalLine: {},
                horizontalLine: {},
                rectangle: {},
                ellipse: {},
                triangle: {},
                trendChannel: {},
                andrewsPitchfork: {},
                fibonacciFan: {
                    levels: [0, .382, .5, .618, 1],
                    timeLevels: [0, .382, .5, .618, 1]
                },
                fibonacciArc: {
                    levels: [.236, .382, .5, .618, .764, 1]
                },
                fibonacciRetracement: {
                    levels: [0, .236, .382, .5, .618, .764, 1, 1.236, 1.382, 1.5, 1.618, 1.764, 2.618, 4.236],
                    labels: {
                        position: "leftCenter",
                        anchor: "rightCenter"
                    }
                },
                fibonacciTimezones: {
                    levels: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040, 1346269, 2178309, 3524578, 5702887, 9227465,
                        14930352, 24157817, 39088169
                    ]
                },
                marker: {
                    markerType: "arrowUp",
                    size: 20,
                    anchor: "centerTop",
                    offsetX: 0,
                    offsetY: 0
                },
                label: {}
            },
            labels: {
                enabled: !1
            },
            hoverLabels: {
                enabled: null
            },
            selectLabels: {
                enabled: null
            },
            crossing: {
                stroke: "none"
            },
            defaultQuarterSettings: {
                enabled: !1,
                zIndex: 1,
                fill: "none",
                stroke: "none",
                title: {
                    enabled: !1,
                    padding: 5
                },
                defaultLabelSettings: {
                    text: "Quarter label",
                    anchor: "center",
                    position: "center"
                },
                margin: {},
                padding: {}
            },
            quarters: {
                rightTop: {
                    fill: "#e3f2fd",
                    title: {
                        orientation: "top"
                    }
                },
                leftTop: {
                    title: {
                        orientation: "top"
                    }
                },
                leftBottom: {
                    fill: "#e3f2fd",
                    title: {
                        orientation: "bottom"
                    }
                },
                rightBottom: {
                    title: {
                        orientation: "bottom"
                    }
                }
            },
            selectMarqueeFill: "#d3d3d3 0.4",
            selectMarqueeStroke: "#d3d3d3"
        },
        cartesianBase: {
            defaultSeriesSettings: {
                base: {
                    labels: {
                        format: "{%Value}{decimalsCount:2}"
                    }
                },
                bar: {
                    isVertical: !0,
                    labels: {
                        offsetY: 3
                    },
                    tooltip: {
                        anchor: "leftTop"
                    }
                },
                column: {
                    tooltip: {
                        anchor: "leftTop"
                    }
                },
                rangeColumn: {
                    isVertical: !1,
                    tooltip: {
                        anchor: "leftTop",
                        offsetX: 10
                    }
                },
                rangeBar: {
                    isVertical: !0,
                    labels: {
                        offsetY: 3
                    }
                },
                box: {
                    medianStroke: g,
                    hoverMedianStroke: d,
                    selectMedianStroke: "#333 0.85",
                    stemStroke: g,
                    hoverStemStroke: d,
                    selectStemStroke: "#333 0.85",
                    whiskerStroke: g,
                    hoverWhiskerStroke: g,
                    selectWhiskerStroke: "#333 0.85",
                    whiskerWidth: 0,
                    hoverWhiskerWidth: null,
                    selectWhiskerWidth: null,
                    outlierMarkers: {
                        enabled: !0,
                        disablePointerEvents: !1,
                        position: "center",
                        rotation: 0,
                        anchor: "center",
                        offsetX: 0,
                        offsetY: 0,
                        type: "circle",
                        size: 3,
                        positionFormatter: h
                    },
                    hoverOutlierMarkers: {
                        enabled: null,
                        size: 4
                    },
                    selectOutlierMarkers: {
                        enabled: null,
                        size: 4,
                        fill: "#333 0.85",
                        stroke: "1.5 #212121"
                    },
                    markers: {
                        position: "median"
                    },
                    labels: {
                        position: "highest",
                        format: function() {
                            return "Highest: " + c(this.highest) + "\nMedian: " + c(this.median) + "\nLowest: " + c(this.lowest)
                        }
                    },
                    tooltip: {
                        titleFormat: function() {
                            return this.name || this.x
                        },
                        format: function() {
                            return "Lowest: " + this.valuePrefix + c(this.lowest) + this.valuePostfix + "\nQ1: " + this.valuePrefix + c(this.q1) + this.valuePostfix + "\nMedian: " + this.valuePrefix + c(this.median) + this.valuePostfix + "\nQ3: " + this.valuePrefix + c(this.q3) + this.valuePostfix + "\nHighest: " + this.valuePrefix +
                                c(this.highest) + this.valuePostfix
                        }
                    }
                }
            },
            defaultXAxisSettings: {
                orientation: "bottom",
                title: {
                    text: "X-Axis",
                    padding: {
                        top: 5,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }
                },
                labels: {
                    format: "{%Value}{decimalsCount:10}"
                },
                scale: 0
            },
            defaultYAxisSettings: {
                orientation: "left",
                title: {
                    text: "Y-Axis",
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 5,
                        left: 0
                    }
                },
                labels: {
                    format: "{%Value}{decimalsCount:10}"
                },
                scale: 1
            },
            defaultAnnotationSettings: {},
            annotations: {
                annotationsList: [],
                zIndex: 2E3
            },
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
            isVertical: !1,
            scales: [{
                type: "ordinal"
            }, {
                type: "linear"
            }],
            crosshair: {
                enabled: !1,
                displayMode: "float",
                xStroke: "#969EA5",
                yStroke: "#969EA5",
                zIndex: 41
            },
            xZoom: {
                continuous: !0,
                startRatio: 0,
                endRatio: 1
            },
            a11y: {
                titleFormat: z
            }
        },
        cartesian: {
            defaultSeriesType: "line",
            isVertical: !1,
            xAxes: [],
            yAxes: []
        },
        area: {
            defaultSeriesType: "area",
            tooltip: {
                displayMode: "union"
            },
            interactivity: {
                hoverMode: "byX"
            }
        },
        bar: {
            isVertical: !0,
            defaultSeriesType: "bar",
            defaultXAxisSettings: {
                orientation: "left"
            },
            defaultYAxisSettings: {
                orientation: "bottom"
            },
            scales: [{
                type: "ordinal",
                inverted: !0
            }, {
                type: "linear"
            }],
            tooltip: {
                displayMode: "single",
                position: "rightCenter",
                anchor: "leftCenter"
            },
            xScroller: {
                orientation: "left"
            }
        },
        column: {
            defaultSeriesType: "column",
            tooltip: {
                displayMode: "single",
                position: "centerTop",
                anchor: "centerBottom",
                offsetX: 0,
                offsetY: 10
            }
        },
        line: {
            defaultSeriesType: "line",
            tooltip: {
                displayMode: "union"
            },
            interactivity: {
                hoverMode: "byX"
            }
        },
        box: {
            defaultSeriesType: "box"
        },
        financial: {
            defaultSeriesType: "candlestick",
            defaultSeriesSettings: {
                candlestick: {
                    tooltip: {
                        titleFormat: u
                    },
                    labels: {
                        format: u
                    }
                },
                ohlc: {
                    tooltip: {
                        titleFormat: u
                    },
                    labels: {
                        format: u
                    }
                }
            },
            xAxes: [{
                labels: {
                    format: F
                },
                minorLabels: {
                    format: F
                }
            }],
            scales: [{
                type: "dateTime"
            }, {
                type: "linear"
            }]
        },
        verticalLine: {
            isVertical: !0,
            defaultSeriesType: "line",
            defaultXAxisSettings: {
                orientation: "left"
            },
            defaultYAxisSettings: {
                orientation: "bottom"
            },
            scales: [{
                type: "ordinal",
                inverted: !0
            }, {
                type: "linear"
            }],
            tooltip: {
                displayMode: "union"
            },
            interactivity: {
                hoverMode: "byX"
            },
            xScroller: {
                orientation: "left"
            }
        },
        verticalArea: {
            isVertical: !0,
            defaultSeriesType: "area",
            defaultXAxisSettings: {
                orientation: "left"
            },
            defaultYAxisSettings: {
                orientation: "bottom"
            },
            scales: [{
                type: "ordinal",
                inverted: !0
            }, {
                type: "linear"
            }],
            tooltip: {
                displayMode: "union"
            },
            interactivity: {
                hoverMode: "byX"
            },
            xScroller: {
                orientation: "left"
            }
        },
        pareto: {
            defaultSeriesType: "column",
            tooltip: {
                displayMode: "union"
            },
            interactivity: {
                hoverMode: "byX"
            },
            yAxes: [{
                orientation: "left"
            }, {
                orientation: "right",
                labels: {
                    format: "{%Value}%"
                }
            }]
        },
        waterfall: {
            dataMode: "diff",
            connectorStroke: "#697474",
            defaultSeriesType: "waterfall",
            defaultSeriesSettings: {
                waterfall: {
                    fill: "#96a6a6",
                    stroke: "#697474",
                    risingFill: "#64b5f6",
                    fallingFill: "#ef6c00",
                    hoverRisingFill: n,
                    hoverFallingFill: n,
                    risingStroke: "#467fac",
                    fallingStroke: "#a74c00",
                    hoverRisingStroke: p,
                    hoverFallingStroke: p,
                    risingHatchFill: !1,
                    hoverRisingHatchFill: null,
                    selectRisingHatchFill: null,
                    fallingHatchFill: !1,
                    hoverFallingHatchFill: null,
                    selectFallingHatchFill: null,
                    selectFallingFill: "#333 0.85",
                    selectRisingFill: "#333 0.85",
                    selectRisingStroke: "#333 0.85",
                    selectFallingStroke: "#333 0.85",
                    labels: {
                        enabled: !0,
                        format: function() {
                            return c(this.isTotal ? this.absolute : this.diff)
                        }
                    },
                    tooltip: {
                        format: function() {
                            return this.isTotal ? "Absolute: " + c(this.absolute) : "Absolute: " + c(this.absolute) + "\nDifference: " + c(this.diff)
                        }
                    }
                }
            },
            legend: {
                enabled: !0,
                itemsSourceMode: "categories"
            }
        },
        cartesian3dBase: {
            defaultSeriesType: "column",
            zAngle: 45,
            zAspect: "50%",
            zDistribution: !1,
            zPadding: 10,
            defaultSeriesSettings: {
                base: {
                    stroke: "none",
                    fill: d,
                    hoverStroke: d,
                    hoverFill: k,
                    selectStroke: d,
                    selectFill: "#333",
                    tooltip: {
                        anchor: "leftTop",
                        position: "leftTop"
                    }
                }
            }
        },
        bar3d: {
            defaultSeriesType: "bar",
            grids: [{}, {
                enabled: !0,
                layout: "horizontal",
                scale: 0
            }]
        },
        column3d: {
            defaultSeriesType: "column",
            grids: [{}, {
                enabled: !0,
                layout: "vertical",
                scale: 0
            }]
        },
        area3d: {
            defaultSeriesType: "area",
            zDistribution: !0,
            zPadding: 5,
            grids: [{}, {
                enabled: !0,
                layout: "vertical",
                scale: 0
            }]
        },
        cartesian3d: {},
        pieFunnelPyramidBase: {
            animation: {
                duration: 500
            },
            fill: d,
            stroke: "none",
            hoverFill: k,
            hoverStroke: d,
            selectFill: "#333 0.85",
            selectStroke: "1.5 #212121",
            connectorStroke: "#CECECE",
            overlapMode: "noOverlap",
            connectorLength: 20,
            hatchFill: null,
            forceHoverLabels: !1,
            labels: {
                enabled: !0,
                fontColor: null,
                position: "inside",
                disablePointerEvents: !1,
                anchor: "center",
                rotation: 0,
                autoRotate: !1,
                width: null,
                height: null,
                zIndex: 34,
                positionFormatter: h,
                format: function() {
                    return this.name ? this.name : this.x
                }
            },
            outsideLabels: {
                disablePointerEvents: !1,
                autoColor: "#545f69"
            },
            insideLabels: {
                disablePointerEvents: !0,
                autoColor: "#ffffff"
            },
            hoverLabels: {
                enabled: null
            },
            selectLabels: {
                enabled: null
            },
            legend: {
                enabled: !0,
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 0,
                    left: 10
                },
                position: "bottom"
            },
            markers: {
                enabled: !1,
                position: "center",
                positionFormatter: h,
                zIndex: 33
            },
            hoverMarkers: {
                enabled: null
            },
            selectMarkers: {
                enabled: null
            },
            tooltip: {
                enabled: !0,
                title: {
                    enabled: !0
                },
                separator: {
                    enabled: !0
                },
                titleFormat: function() {
                    return this.name || this.x
                },
                format: function() {
                    return "Value: " + c(this.value) + "\nPercent Value: " + (100 * this.value / this.getStat("sum")).toFixed(1) + "%"
                }
            },
            interactivity: {
                hoverMode: "single"
            }
        },
        pie: {
            animation: {
                duration: 2E3
            },
            title: {
                text: "Pie Chart"
            },
            group: !1,
            sort: "none",
            radius: "45%",
            innerRadius: 0,
            startAngle: 0,
            explode: 15,
            outsideLabelsCriticalAngle: 60,
            outsideLabelsSpace: 30,
            insideLabelsOffset: "50%",
            labels: {
                format: "{%PercentValue}{decimalsCount:1,zeroFillDecimals:true}%"
            },
            a11y: {
                titleFormat: function() {
                    var a = this.chart,
                        b = m.apply(this),
                        b = b + (", with " + a.getStat("count") + " points. ");
                    return b += "Min value is " + a.getStat("min") + ", max value is " + a.getStat("max") + "."
                }
            }
        },
        funnel: {
            title: {
                text: "Funnel Chart"
            },
            baseWidth: "70%",
            neckWidth: "30%",
            neckHeight: "25%",
            pointsPadding: 0,
            labels: {
                position: "outsideLeftInColumn"
            }
        },
        pyramid: {
            title: {
                text: "Pyramid Chart"
            },
            baseWidth: "70%",
            pointsPadding: 0,
            legend: {
                inverted: !0
            },
            labels: {
                position: "outsideLeftInColumn"
            },
            reversed: !1
        },
        pie3d: {
            explode: "5%",
            connectorLength: "15%",
            legendItem: {
                iconStroke: null
            }
        },
        scatter: {
            defaultSeriesType: "marker",
            legend: {
                enabled: !1
            },
            defaultSeriesSettings: {
                base: {
                    clip: !0,
                    color: null,
                    tooltip: {
                        titleFormat: function() {
                            return this.seriesName
                        },
                        format: function() {
                            return "x: " +
                                this.x + "\ny: " + this.valuePrefix + c(this.value) + this.valuePostfix
                        }
                    },
                    xScale: null,
                    yScale: null,
                    a11y: {
                        enabled: !1,
                        titleFormat: "Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}"
                    }
                },
                bubble: {
                    labels: {
                        anchor: "center"
                    },
                    displayNegative: !1,
                    negativeFill: g,
                    hoverNegativeFill: g,
                    negativeStroke: g,
                    hoverNegativeStroke: g,
                    negativeHatchFill: null,
                    hoverNegativeHatchFill: void 0,
                    hatchFill: !1,
                    tooltip: {
                        format: function() {
                            return "X: " + this.x + "\nY: " + this.valuePrefix +
                                c(this.value) + this.valuePostfix + "\nSize: " + c(this.size)
                        }
                    }
                },
                line: {
                    connectMissingPoints: !1
                },
                marker: {
                    size: 5,
                    hoverSize: 7,
                    selectSize: 7
                }
            },
            defaultAnnotationSettings: {},
            defaultXAxisSettings: {
                orientation: "bottom",
                scale: 0,
                title: {
                    text: "X-Axis"
                }
            },
            defaultYAxisSettings: {
                orientation: "left",
                scale: 1,
                title: {
                    text: "Y-Axis"
                }
            },
            series: [],
            grids: [],
            minorGrids: [],
            xAxes: [{}],
            yAxes: [{}],
            lineAxesMarkers: [],
            rangeAxesMarkers: [],
            textAxesMarkers: [],
            scales: [{
                type: "linear"
            }, {
                type: "linear"
            }],
            xScale: 0,
            yScale: 1,
            maxBubbleSize: "20%",
            minBubbleSize: "5%",
            crosshair: {
                enabled: !1,
                displayMode: "float",
                xStroke: "#969EA5",
                yStroke: "#969EA5",
                zIndex: 41
            },
            a11y: {
                titleFormat: y
            },
            annotations: {
                annotationsList: [],
                zIndex: 2E3
            }
        },
        marker: {},
        bubble: {},
        quadrant: {
            scales: [{
                type: "linear",
                minimum: 0,
                maximum: 100
            }, {
                type: "linear",
                minimum: 0,
                maximum: 100
            }],
            xScale: 0,
            yScale: 1,
            defaultXAxisSettings: {
                ticks: !1,
                labels: !1,
                title: {
                    enabled: !1,
                    align: "left"
                },
                stroke: "3 #bbdefb"
            },
            defaultYAxisSettings: {
                ticks: !1,
                labels: !1,
                title: {
                    enabled: !1,
                    align: "left"
                },
                stroke: "3 #bbdefb"
            },
            xAxes: [{}, {
                orientation: "top"
            }],
            yAxes: [{}, {
                orientation: "right"
            }],
            crossing: {
                stroke: "#bbdefb"
            },
            quarters: {
                rightTop: {
                    enabled: !0
                },
                leftTop: {
                    enabled: !0
                },
                leftBottom: {
                    enabled: !0
                },
                rightBottom: {
                    enabled: !0
                }
            }
        },
        mekko: {
            defaultSeriesType: "mekko",
            isVertical: !1,
            labels: {
                enabled: !0
            },
            defaultSeriesSettings: {
                base: {
                    fill: q,
                    hoverFill: n,
                    legendItem: {
                        iconStroke: "none"
                    },
                    isVertical: !1,
                    labels: {
                        format: "{%Value}{decimalsCount:2}",
                        position: "center",
                        offsetY: 0,
                        fontColor: "#ffffff"
                    },
                    markers: {
                        position: "center",
                        anchor: "center"
                    },
                    tooltip: {
                        anchor: "leftTop"
                    },
                    stroke: r,
                    hoverStroke: function() {
                        return b.anychart.color.setThickness(b.anychart.color.lighten(this.sourceColor),
                            1)
                    }
                },
                mekko: {}
            },
            defaultXAxisSettings: {
                orientation: "bottom",
                title: {
                    text: "X-Axis",
                    padding: {
                        top: 5,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }
                },
                labels: {
                    format: "{%Value}{decimalsCount:10}"
                },
                scale: 0
            },
            defaultYAxisSettings: {
                orientation: "left",
                title: {
                    text: "Y-Axis",
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 5,
                        left: 0
                    }
                },
                labels: {
                    format: "{%Value}{decimalsCount:10}%"
                },
                scale: 1
            },
            xAxes: [{}],
            yAxes: [{}],
            scales: [{
                type: "ordinal"
            }, {
                type: "linear",
                stackMode: "percent",
                minimumGap: 0,
                maximumGap: 0
            }, {
                type: "ordinal"
            }, {
                type: "ordinal"
            }],
            crosshair: {
                enabled: !1,
                displayMode: "float",
                xStroke: "#969EA5",
                yStroke: "#969EA5",
                zIndex: 41
            },
            xScale: 0,
            yScale: 1,
            firstCategoriesScale: 2,
            lastCategoriesScale: 3,
            defaultAnnotationSettings: {},
            annotations: {
                annotationsList: [],
                zIndex: 2E3
            },
            pointsPadding: 0
        },
        mosaic: {
            pointsPadding: 5,
            defaultXAxisSettings: {
                stroke: 0,
                ticks: {
                    enabled: !1
                }
            },
            defaultYAxisSettings: {
                stroke: 0,
                ticks: {
                    enabled: !1
                },
                labels: {
                    format: "{%Value}"
                }
            }
        },
        barmekko: {
            scales: [{
                type: "ordinal"
            }, {
                type: "linear",
                stackMode: "value"
            }, {
                type: "ordinal"
            }, {
                type: "ordinal"
            }],
            defaultSeriesSettings: {
                mekko: {
                    fill: function() {
                        var a =
                            1 < this.chart.getSeriesCount() ? this.sourceColor : this.chart.palette().itemAt(this.iterator.currentIndex),
                            a = a ? a : this.sourceColor;
                        return b.anychart.color.setOpacity(a, .85, !0)
                    },
                    hoverFill: function() {
                        var a = 1 < this.chart.getSeriesCount() ? this.sourceColor : this.chart.palette().itemAt(this.iterator.currentIndex),
                            a = a ? a : this.sourceColor;
                        return b.anychart.color.setOpacity(a, .65, !0)
                    },
                    stroke: function() {
                        var a = 1 < this.chart.getSeriesCount() ? this.sourceColor : this.chart.palette().itemAt(this.iterator.currentIndex),
                            a = a ?
                            a : this.sourceColor;
                        return b.anychart.color.setThickness(a, 1)
                    },
                    labels: {
                        format: "{%Value}{decimalsCount:2}",
                        anchor: "auto",
                        position: "value",
                        fontColor: "#7c868e"
                    },
                    markers: {
                        position: "value",
                        positionFormatter: h
                    }
                }
            },
            defaultYAxisSettings: {
                labels: {
                    format: "{%Value}{decimalsCount:10}"
                }
            },
            labels: {
                enabled: !1
            }
        },
        radar: {
            defaultSeriesType: "line",
            defaultSeriesSettings: {
                base: {
                    clip: !1
                },
                area: {},
                line: {},
                marker: {}
            },
            xAxis: {
                scale: 0,
                zIndex: 25,
                labels: {
                    zIndex: 25
                },
                minorLabels: {
                    zIndex: 25
                },
                ticks: {
                    zIndex: 25
                },
                minorTicks: {
                    zIndex: 25
                }
            },
            yAxis: {
                scale: 1
            },
            startAngle: 0,
            innerRadius: 0,
            grids: [{}, {
                layout: "circuit"
            }],
            minorGrids: [],
            scales: [{
                type: "ordinal"
            }, {
                type: "linear"
            }],
            xScale: 0,
            yScale: 1,
            a11y: {
                titleFormat: z
            }
        },
        polar: {
            defaultSeriesType: "marker",
            defaultSeriesSettings: {
                base: {
                    closed: !0,
                    clip: !1
                },
                area: {},
                line: {},
                marker: {},
                column: {},
                rangeColumn: {}
            },
            xAxis: {
                scale: 0,
                zIndex: 25,
                fill: "none",
                labels: {
                    anchor: "auto",
                    zIndex: 25
                },
                minorLabels: {
                    anchor: "auto",
                    zIndex: 25
                },
                ticks: {
                    zIndex: 25
                },
                minorTicks: {
                    zIndex: 25
                }
            },
            yAxis: {
                scale: 1
            },
            startAngle: 0,
            innerRadius: 0,
            sortPointsByX: !1,
            grids: [{}, {
                layout: "circuit"
            }],
            minorGrids: [],
            scales: [{
                type: "linear"
            }, {
                type: "linear"
            }],
            xScale: 0,
            yScale: 1,
            barsPadding: 0,
            barGroupsPadding: 0,
            a11y: {
                titleFormat: y
            }
        },
        bullet: {
            background: {
                enabled: !0
            },
            layout: "horizontal",
            defaultRangeMarkerSettings: {
                enabled: !0,
                from: 0,
                to: 0,
                zIndex: 2
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
            defaultMarkerSettings: {
                fill: "#64b5f6",
                stroke: "2 #64b5f6",
                zIndex: 2
            },
            rangePalette: {
                type: "distinct",
                items: ["#828282", "#a8a8a8", "#c2c2c2", "#d4d4d4", "#e1e1e1"]
            },
            markerPalette: {
                items: ["bar", "line", "x", "ellipse"]
            },
            axis: {
                enabled: !1,
                title: {
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    },
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 10,
                        left: 0
                    }
                },
                labels: {
                    fontSize: 9,
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }
                },
                minorLabels: {
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }
                },
                ticks: {
                    enabled: !1
                },
                orientation: null,
                zIndex: 3
            },
            title: {
                rotation: 0
            },
            scale: {
                type: "linear",
                minimumGap: 0,
                maximumGap: 0,
                ticks: {
                    minCount: 2,
                    maxCount: 5,
                    interval: NaN
                }
            },
            ranges: [],
            a11y: {
                titleFormat: function() {
                    return m.apply(this) + ". "
                }
            }
        },
        sparkline: {
            background: {
                enabled: !0
            },
            title: {
                enabled: !1,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                orientation: "right",
                rotation: 0
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            hatchFill: null,
            markers: {},
            firstMarkers: {
                fill: "#64b5f6"
            },
            lastMarkers: {
                fill: "#64b5f6"
            },
            negativeMarkers: {
                fill: "#ef6c00"
            },
            minMarkers: {
                fill: "#455a64"
            },
            maxMarkers: {
                fill: "#dd2c00"
            },
            labels: {},
            firstLabels: {},
            lastLabels: {},
            negativeLabels: {},
            minLabels: {
                fontSize: 9,
                padding: {
                    top: 3,
                    right: 0,
                    bottom: 3,
                    left: 0
                },
                fontColor: "#303f46"
            },
            maxLabels: {
                fontSize: 9,
                padding: {
                    top: 3,
                    right: 0,
                    bottom: 3,
                    left: 0
                },
                fontColor: "#9b1f00"
            },
            lineAxesMarkers: [],
            rangeAxesMarkers: [],
            textAxesMarkers: [],
            scales: [{
                type: "ordinal"
            }, {
                type: "linear"
            }],
            xScale: 0,
            yScale: 1,
            clip: !0,
            seriesType: "line",
            connectMissingPoints: !1,
            pointWidth: "95%",
            tooltip: {
                title: !1,
                separator: !1,
                titleFormat: function() {
                    return this.x
                },
                format: function() {
                    return "x: " + this.x + "\ny: " + c(this.value)
                },
                allowLeaveChart: !0
            },
            defaultSeriesSettings: {
                base: {
                    markers: {
                        enabled: !1,
                        position: "center",
                        anchor: "center",
                        type: "circle",
                        size: 1.8,
                        stroke: "none"
                    },
                    hoverMarkers: {
                        enabled: !0
                    },
                    labels: {
                        enabled: !1,
                        fontSize: 8,
                        background: {
                            enabled: !1
                        },
                        position: "center",
                        anchor: "centerBottom"
                    },
                    minLabels: {
                        position: "centerBottom",
                        anchor: "centerBottom"
                    },
                    maxLabels: {
                        position: "centerTop",
                        anchor: "topCenter"
                    },
                    color: "#64b5f6"
                },
                area: {
                    stroke: "#64b5f6",
                    fill: "#64b5f6 0.5"
                },
                column: {
                    markers: {
                        position: "centerTop"
                    },
                    labels: {
                        position: "centerTop",
                        anchor: "centerBottom"
                    },
                    negativeMarkers: {
                        position: "centerBottom"
                    },
                    negativeLabels: {
                        position: "centerBottom",
                        anchor: "centerTop"
                    },
                    fill: "#64b5f6",
                    negativeFill: "#ef6c00"
                },
                line: {
                    stroke: "#64b5f6"
                },
                winLoss: {
                    markers: {
                        position: "centerTop",
                        anchor: "centerTop"
                    },
                    labels: {
                        position: "centerTop",
                        anchor: "centerTop"
                    },
                    negativeMarkers: {
                        position: "centerBottom",
                        anchor: "centerBottom"
                    },
                    negativeLabels: {
                        position: "centerBottom",
                        anchor: "centerBottom"
                    },
                    fill: "#64b5f6",
                    negativeFill: "#ef6c00"
                }
            }
        },
        map: {
            defaultCalloutSettings: {},
            defaultSeriesSettings: {
                base: {
                    fill: function() {
                        return this.scaledColor || this.sourceColor
                    },
                    hoverFill: "#757575",
                    selectFill: "#333 0.85",
                    stroke: g,
                    hoverStroke: {
                        thickness: .5,
                        color: "#545f69"
                    },
                    selectStroke: {
                        thickness: .5,
                        color: "#545f69"
                    },
                    hatchFill: !1,
                    labels: {
                        anchor: "centerBottom",
                        enabled: null,
                        adjustFontSize: {
                            width: !0,
                            height: !0
                        },
                        format: function() {
                            return this.getData("name") ? this.getData("name") : this.name ? this.name : this.getData("id") ? this.getData("id") : "lat: " + this.lat + "\nlong: " + this["long"]
                        }
                    },
                    hoverLabels: {
                        enabled: null
                    },
                    selectLabels: {
                        enabled: null
                    },
                    markers: {
                        enabled: !1,
                        disablePointerEvents: !1
                    },
                    hoverMarkers: {
                        enabled: null
                    },
                    selectMarkers: {
                        enabled: null
                    },
                    color: null,
                    tooltip: {
                        titleFormat: function() {
                            return this.name || this.getData("name") || "Tooltip title"
                        },
                        format: function() {
                            return "Id: " + this.id + "\nValue: " + this.valuePrefix + c(this.value) + this.valuePostfix
                        }
                    },
                    xScale: null,
                    yScale: null,
                    a11y: {
                        titleFormat: "Series named {%SeriesName}"
                    },
                    clip: !1
                },
                choropleth: {
                    labels: {
                        fontColor: "#212121",
                        anchor: "center"
                    },
                    markers: {
                        anchor: null
                    },
                    colorScale: {}
                },
                connector: {
                    startSize: 0,
                    endSize: 0,
                    curvature: .3,
                    stroke: function() {
                        return {
                            thickness: 2,
                            color: this.sourceColor,
                            lineJoin: "round"
                        }
                    },
                    hoverStroke: k,
                    selectStroke: "2 #333 0.85",
                    markers: {
                        position: "middle",
                        enabled: !0,
                        size: 15,
                        stroke: "1.5 #f7f7f7",
                        rotation: null,
                        anchor: null,
                        type: "arrowhead"
                    },
                    hoverMarkers: {
                        stroke: "1.5 #f7f7f7",
                        size: 15
                    },
                    selectMarkers: {
                        fill: "#333 0.85",
                        stroke: "1.5 #f7f7f7",
                        size: 15
                    },
                    labels: {
                        enabled: !1,
                        position: "middle",
                        anchor: null,
                        format: function() {
                            return "from: " + this.startPoint.lat + "," + this.startPoint["long"] + "\nto: " + this.endPoint.lat + "," + this.endPoint["long"]
                        }
                    },
                    tooltip: {
                        title: {
                            enabled: !1
                        },
                        separator: {
                            enabled: !1
                        },
                        format: function() {
                            return "from: " +
                                this.startPoint.lat + ", " + this.startPoint["long"] + "\nto: " + this.endPoint.lat + ", " + this.endPoint["long"]
                        }
                    }
                },
                bubble: {
                    stroke: function() {
                        return {
                            thickness: 2,
                            color: b.anychart.color.darken(this.sourceColor)
                        }
                    },
                    labels: {
                        anchor: "center"
                    },
                    hoverFill: "#757575",
                    selectFill: "#333 0.85",
                    tooltip: {
                        format: function() {
                            var a;
                            a = this.id ? "Id: " + this.id : "lat: " + this.lat + "\nlong: " + this["long"];
                            this.size && (a += "\nValue: " + this.valuePrefix + c(this.size) + this.valuePostfix);
                            return a
                        }
                    }
                },
                marker: {
                    labels: {
                        enabled: !0
                    },
                    hoverLabels: {
                        fontWeight: "bold"
                    },
                    selectLabels: {
                        fontWeight: "bold"
                    },
                    tooltip: {
                        format: function() {
                            var a;
                            a = this.id ? "Id: " + this.id : "lat: " + this.lat + "\nlong: " + this["long"];
                            this.value && (a += "\nValue: " + this.valuePrefix + c(this.value) + this.valuePostfix);
                            return a
                        }
                    }
                }
            },
            colorRange: {
                zIndex: 50
            },
            geoScale: {
                maxTicksCount: 1E3,
                precision: 2
            },
            callouts: [],
            axesSettings: {
                enabled: !1,
                title: {
                    enabled: !1,
                    padding: 5,
                    fontSize: 13,
                    text: "Axis title",
                    fontColor: "#545f69",
                    zIndex: 35
                },
                labels: {
                    enabled: !0,
                    padding: 2,
                    rotation: null,
                    fontSize: 10,
                    anchor: "auto"
                },
                minorLabels: {
                    enabled: !1,
                    padding: 2,
                    rotation: null,
                    fontSize: 9,
                    anchor: null
                },
                overlapMode: "noOverlap",
                ticks: {
                    enabled: !0,
                    length: 5,
                    position: "outside",
                    stroke: "#CECECE"
                },
                minorTicks: {
                    enabled: !1,
                    length: 2,
                    position: "outside",
                    stroke: "#CECECE"
                },
                drawFirstLabel: !0,
                drawLastLabel: !0,
                stroke: "#CECECE"
            },
            gridsSettings: {
                enabled: !1,
                drawFirstLine: !0,
                drawLastLine: !0,
                oddFill: "none",
                evenFill: "none",
                stroke: "#CECECE",
                minorStroke: "none",
                zIndex: 5
            },
            crosshair: {
                enabled: !1,
                xStroke: "#969EA5",
                yStroke: "#969EA5",
                zIndex: 110,
                xLabel: {
                    axisIndex: 2
                },
                yLabel: {
                    axisIndex: 3
                }
            },
            unboundRegions: {
                enabled: !0,
                fill: "#F7F7F7",
                stroke: "#e0e0e0"
            },
            maxBubbleSize: "20%",
            minBubbleSize: "5%",
            geoIdField: "id",
            interactivity: {
                copyFormat: function(a) {
                    a = a.seriesStatus;
                    for (var b = "", c = 0, e = a.length; c < e; c++) {
                        var d = a[c];
                        if (d.points.length) {
                            for (var b = b + ("Series " + d.series.getIndex() + ":\n"), g = 0, h = d.points.length; g < h; g++) {
                                var k = d.points[g],
                                    b = b + ("id: " + k.id + " index: " + k.index);
                                g != h - 1 && (b += "\n")
                            }
                            c != e - 1 && (b += "\n")
                        }
                    }
                    return b || "no selected points"
                },
                drag: !0,
                zoomOnMouseWheel: !1,
                keyboardZoomAndMove: !0,
                zoomOnDoubleClick: !1
            },
            minZoomLevel: 1,
            maxZoomLevel: 10,
            overlapMode: "noOverlap",
            crsAnimation: {
                enabled: !0,
                duration: 300
            },
            legend: {
                enabled: !1,
                tooltip: {
                    contentInternal: {
                        background: {
                            disablePointerEvents: !1
                        }
                    }
                }
            }
        },
        choropleth: {},
        bubbleMap: {},
        markerMap: {},
        connector: {},
        seatMap: {},
        circularGauge: {
            title: {
                enabled: !1
            },
            defaultAxisSettings: {
                startAngle: null,
                labels: {
                    position: "inside",
                    adjustFontSize: !0
                },
                minorLabels: {
                    position: "inside",
                    adjustFontSize: !0
                },
                fill: "#CECECE",
                ticks: {
                    hatchFill: !1,
                    type: "line",
                    position: "center",
                    length: null,
                    fill: "#545f69",
                    stroke: "none"
                },
                minorTicks: {
                    hatchFill: !1,
                    type: "line",
                    position: "center",
                    length: null,
                    fill: "#545f69",
                    stroke: "none"
                },
                zIndex: 10,
                cornersRounding: "0%"
            },
            defaultPointerSettings: {
                base: {
                    enabled: !0,
                    fill: "#545f69",
                    stroke: "#545f69",
                    hatchFill: !1,
                    axisIndex: 0
                },
                bar: {
                    position: "center"
                },
                marker: {
                    size: 4,
                    hoverSize: 6,
                    selectSize: 6,
                    position: "inside",
                    type: "triangleUp"
                },
                knob: {
                    fill: "#CECECE",
                    stroke: "#c1c1c1",
                    verticesCount: 6,
                    verticesCurvature: .5,
                    topRatio: .5,
                    bottomRatio: .5
                }
            },
            defaultRangeSettings: {
                enabled: !0,
                axisIndex: 0,
                fill: "#7c868e 0.7",
                position: "center",
                startSize: 0,
                endSize: "10%",
                cornersRounding: "0%"
            },
            fill: "#f5f5f5",
            stroke: "#EAEAEA",
            startAngle: 0,
            sweepAngle: 360,
            cap: {
                enabled: !1,
                fill: "#EAEAEA",
                stroke: "#CECECE",
                hatchFill: !1,
                radius: "15%",
                zIndex: 50
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
                title: {
                    enabled: !1
                },
                separator: {
                    enabled: !1
                },
                titleFormat: function() {
                    return this.index
                },
                format: function() {
                    return "Value: " + c(this.value)
                }
            }
        },
        linearGauge: {
            padding: 10,
            markerPalette: {
                items: "circle diamond square triangleDown triangleUp triangleLeft triangleRight diagonalCross pentagon cross vline star5 star4 trapezium star7 star6 star10".split(" ")
            },
            globalOffset: "0%",
            layout: "vertical",
            tooltip: {
                titleFormat: function() {
                    return this.name
                },
                format: function() {
                    return this.high ? D.call(this) : "Value: " + c(this.value)
                }
            },
            scales: [{
                type: "linear"
            }],
            defaultAxisSettings: {
                enabled: !0,
                width: "10%",
                offset: "0%"
            },
            defaultScaleBarSettings: {
                enabled: !0,
                width: "10%",
                offset: "0%",
                from: "min",
                to: "max",
                colorScale: {
                    type: "ordinalColor",
                    inverted: !1,
                    ticks: {
                        maxCount: 100
                    }
                },
                points: [{
                    height: 0,
                    left: 0,
                    right: 0
                }, {
                    height: 1,
                    left: 0,
                    right: 0
                }]
            },
            defaultPointerSettings: {
                base: {
                    enabled: !0,
                    selectionMode: "single",
                    width: "10%",
                    offset: "0%",
                    legendItem: {
                        enabled: !0
                    },
                    label: {
                        enabled: !1,
                        zIndex: 0,
                        position: "centerTop",
                        anchor: "center"
                    },
                    hoverLabel: {
                        enabled: null
                    },
                    selectLabel: {
                        enabled: null
                    },
                    stroke: t,
                    hoverStroke: p,
                    selectStroke: g,
                    fill: d,
                    hoverFill: k,
                    selectFill: g
                },
                bar: {},
                rangeBar: {
                    label: {
                        format: function() {
                            return c(this.high)
                        }
                    }
                },
                marker: {
                    width: "3%"
                },
                tank: {
                    emptyFill: "#fff 0.3",
                    hoverEmptyFill: d,
                    selectEmptyFill: d,
                    emptyHatchFill: null
                },
                thermometer: {
                    fill: function() {
                        var a = this.sourceColor,
                            c = b.anychart.color.darken(a);
                        return {
                            angle: this.isVertical ?
                                0 : 90,
                            keys: [{
                                color: c
                            }, {
                                color: a
                            }, {
                                color: c
                            }]
                        }
                    },
                    width: "3%",
                    bulbRadius: "120%",
                    bulbPadding: "3%"
                },
                led: {
                    dimmer: function(a) {
                        return b.anychart.color.darken(a)
                    },
                    gap: "1%",
                    size: "2%",
                    count: null,
                    colorScale: {
                        type: "ordinalColor",
                        inverted: !1,
                        ticks: {
                            maxCount: 100
                        }
                    }
                }
            }
        },
        thermometerGauge: {},
        tankGauge: {},
        ledGauge: {},
        bulletGauge: {},
        heatMap: {
            annotations: {
                annotationsList: [],
                zIndex: 2E3
            },
            isVertical: !1,
            scales: [{
                type: "ordinal"
            }, {
                type: "ordinal",
                inverted: !0
            }, {
                type: "ordinalColor"
            }],
            xScale: 0,
            yScale: 1,
            colorScale: 2,
            background: {
                enabled: !0
            },
            xAxes: [{
                orientation: "top"
            }],
            yAxes: [{}],
            grids: [],
            tooltip: {
                enabled: !0,
                title: {
                    enabled: !0,
                    fontSize: 13,
                    fontWeight: "normal"
                },
                contentInternal: {
                    fontSize: 11
                },
                separator: {
                    enabled: !0
                },
                titleFormat: function() {
                    return this.name || this.x
                },
                format: function() {
                    if (void 0 === this.heat) {
                        var a = "Value: " + this.valuePrefix + this.heat + this.valuePostfix;
                        isNaN(+this.heat) || (a += "\nPercent Value: " + (100 * this.heat / this.getStat("sum")).toFixed(1) + "%");
                        return a
                    }
                    return "x: " + this.x + "\ny: " + this.y
                }
            },
            legendItem: {
                iconStroke: null
            },
            legend: {
                itemsSourceMode: "categories"
            },
            defaultXAxisSettings: {
                enabled: !0,
                orientation: "bottom",
                ticks: {
                    enabled: !1
                },
                title: {
                    text: "X-Axis"
                },
                scale: 0
            },
            defaultYAxisSettings: {
                enabled: !0,
                orientation: "left",
                ticks: {
                    enabled: !1
                },
                title: {
                    text: "Y-Axis"
                },
                scale: 1
            },
            fill: function() {
                var a;
                this.colorScale ? (a = this.iterator.get("heat"), a = this.colorScale.valueToColor(a)) : a = b.anychart.color.setOpacity(this.sourceColor, .85, !0);
                return a
            },
            stroke: "1 #ffffff",
            hoverStroke: "2 #ffffff",
            hoverFill: "#757575",
            selectStroke: "2 #ffffff",
            selectFill: "#333 0.85",
            labels: {
                enabled: !0,
                fontSize: 11,
                adjustFontSize: {
                    width: !0,
                    height: !0
                },
                minFontSize: 7,
                maxFontSize: 13,
                hAlign: "center",
                vAlign: "center",
                textWrap: "noWrap",
                fontWeight: "normal",
                fontColor: "#212121",
                selectable: !1,
                background: {
                    enabled: !1
                },
                padding: {
                    top: 2,
                    right: 4,
                    bottom: 2,
                    left: 4
                },
                position: "center",
                anchor: "center",
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
                width: null,
                height: null,
                format: function() {
                    return c(this.heat)
                },
                positionFormatter: h
            },
            hoverLabels: {
                fontColor: "#f5f5f5",
                enabled: null
            },
            selectLabels: {
                fontColor: "#fff",
                enabled: null
            },
            markers: {
                enabled: !1,
                disablePointerEvents: !1,
                position: "center",
                rotation: 0,
                anchor: "center",
                offsetX: 0,
                offsetY: 0,
                size: 4,
                positionFormatter: h,
                fill: "#dd2c00",
                type: "circle",
                stroke: "none"
            },
            hoverMarkers: {
                enabled: null,
                size: 6
            },
            selectMarkers: {
                enabled: null,
                size: 6,
                fill: "#333 0.85",
                stroke: "1.5 #212121"
            },
            labelsDisplayMode: "drop",
            hatchFill: !1,
            hoverHatchFill: null,
            selectHatchFill: null,
            clip: !0,
            xZoom: {
                continuous: !0,
                startRatio: 0,
                endRatio: 1
            },
            yZoom: {
                continuous: !0,
                startRatio: 0,
                endRatio: 1
            },
            yScroller: {
                orientation: "right",
                inverted: !0
            },
            a11y: {
                titleFormat: m
            }
        },
        treeMap: {
            sort: "desc",
            labelsDisplayMode: "clip",
            headersDisplayMode: "alwaysShow",
            colorRange: {
                zIndex: 50
            },
            colorScale: {
                type: "ordinalColor"
            },
            tooltip: {
                enabled: !0,
                titleFormat: H,
                format: h
            },
            legend: {
                itemsSourceMode: "categories"
            },
            maxDepth: 1,
            hintDepth: 0,
            hintOpacity: .4,
            maxHeadersHeight: "25",
            headers: {
                enabled: !0,
                hAlign: "center",
                vAlign: "center",
                position: "leftTop",
                anchor: "leftTop",
                rotation: 0,
                background: {
                    enabled: !0,
                    fill: "#F7F7F7",
                    stroke: "#e0e0e0"
                },
                format: H
            },
            hoverHeaders: {
                enabled: !0,
                fontColor: "#333 0.85",
                background: {
                    fill: "#e0e0e0",
                    stroke: "#e0e0e0"
                }
            },
            labels: {
                enabled: !0,
                hAlign: "center",
                vAlign: "center",
                position: "leftTop",
                anchor: "leftTop",
                rotation: 0,
                fontColor: "#212121",
                format: function() {
                    return (this.name || this.getData("id")) + "\n" + c(this.value)
                }
            },
            hoverLabels: {
                enabled: null,
                fontWeight: "bold"
            },
            selectLabels: {
                enabled: null,
                fontColor: "#fafafa"
            },
            markers: {
                enabled: !1,
                position: "center",
                size: 6,
                fill: "#dd2c00",
                type: "circle"
            },
            hoverMarkers: {
                enabled: null,
                size: 8
            },
            selectMarkers: {
                enabled: null,
                size: 8,
                fill: "#333 0.85",
                stroke: "1.5 #212121"
            },
            fill: function() {
                return this.colorScale ?
                    this.colorScale.valueToColor(this.value) : b.anychart.color.setOpacity(this.sourceColor, .85, !0)
            },
            stroke: "#e0e0e0",
            hoverFill: k,
            hoverStroke: g,
            selectFill: "#333 0.85",
            selectStroke: "1.5 #212121",
            hatchFill: !1,
            hoverHatchFill: !1,
            selectHatchFill: !1
        },
        defaultScrollBar: {
            barSize: 10,
            backgroundFill: "#e0e0e0",
            backgroundStroke: "#d5d5d5",
            sliderFill: "#d5d5d5",
            sliderStroke: "#656565",
            mouseOverOpacity: .45,
            mouseOutOpacity: .25,
            handlePositionChange: !0,
            startRatio: "0",
            endRatio: "1",
            buttonsVisible: !1,
            cornersRadius: 5
        },
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
            editStructurePreviewFill: {
                color: "#4285F4",
                opacity: .2
            },
            editStructurePreviewStroke: {
                color: "#4285F4",
                thickness: 2
            },
            editStructurePreviewDashStroke: {
                color: "#4285F4",
                dash: "4 4"
            },
            headerFill: "#f7f7f7",
            tooltip: {
                padding: {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                },
                title: {
                    enabled: !0,
                    fontSize: "14px",
                    fontWeight: "normal",
                    fontColor: "#e5e5e5"
                },
                separator: {
                    enabled: !0
                },
                anchor: "leftTop",
                contentInternal: {
                    hAlign: "left"
                },
                format: function() {
                    var a = this.name;
                    return void 0 !== a ? a + "" : ""
                }
            },
            defaultColumnSettings: {
                width: 90,
                buttonCursor: "pointer",
                cellTextSettings: {
                    enabled: !0,
                    anchor: "leftTop",
                    vAlign: "middle",
                    padding: {
                        top: 0,
                        right: 5,
                        bottom: 0,
                        left: 5
                    },
                    textWrap: "noWrap",
                    background: null,
                    rotation: 0,
                    width: null,
                    height: null,
                    fontSize: 11,
                    minFontSize: 8,
                    maxFontSize: 72,
                    disablePointerEvents: !0
                },
                depthPaddingMultiplier: 0,
                collapseExpandButtons: !1,
                title: {
                    enabled: !0,
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    },
                    textWrap: "noWrap",
                    hAlign: "center",
                    vAlign: "middle",
                    background: {
                        enabled: !1
                    }
                },
                format: function() {
                    return ""
                }
            },
            columns: [{
                width: 50,
                format: function() {
                    var a = this.item.meta("index");
                    return null != a ? a + 1 + "" : ""
                },
                title: {
                    text: "#"
                }
            }, {
                width: 170,
                collapseExpandButtons: !0,
                depthPaddingMultiplier: 15,
                format: function() {
                    var a = this.name;
                    return null != a ? a + "" : ""
                },
                title: {
                    text: "Name"
                }
            }]
        },
        defaultTimeline: {
            isStandalone: !0,
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
            connectorPreviewStroke: {
                color: "#545f69",
                dash: "3 3"
            },
            editPreviewFill: {
                color: "#fff",
                opacity: 1E-5
            },
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
            editStructurePreviewFill: {
                color: "#4285F4",
                opacity: .2
            },
            editStructurePreviewStroke: {
                color: "#4285F4",
                thickness: 2
            },
            editStructurePreviewDashStroke: {
                color: "#4285F4",
                dash: "4 4"
            },
            baseFill: "#7ec1f5",
            baseStroke: "#74b2e2",
            progressFill: "#1976d2",
            progressStroke: {
                color: "#fff",
                opacity: 1E-5
            },
            editStartConnectorMarkerType: "circle",
            editStartConnectorMarkerSize: 10,
            editStartConnectorMarkerHorizontalOffset: 0,
            editStartConnectorMarkerVerticalOffset: 0,
            editFinishConnectorMarkerType: "circle",
            editFinishConnectorMarkerSize: 10,
            editFinishConnectorMarkerHorizontalOffset: 0,
            editFinishConnectorMarkerVerticalOffset: 0,
            editIntervalWidth: 3,
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
            baselineAbove: !1,
            tooltip: {
                padding: {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                },
                title: {
                    enabled: !0,
                    fontSize: "14px",
                    fontWeight: "normal",
                    fontColor: "#e5e5e5"
                },
                separator: {
                    enabled: !0
                },
                anchor: "leftTop",
                contentInternal: {
                    hAlign: "left"
                },
                zIndex: 100,
                allowLeaveChart: !1
            },
            labels: {
                enabled: !0,
                anchor: "leftCenter",
                position: "rightCenter",
                padding: {
                    top: 3,
                    right: 5,
                    bottom: 3,
                    left: 5
                },
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
            markers: {
                anchor: "centerTop",
                zIndex: 50,
                type: "star5",
                fill: "#ff0",
                stroke: "2 red"
            },
            defaultLineMarkerSettings: {
                layout: "vertical",
                zIndex: 1.5
            },
            defaultRangeMarkerSettings: {
                layout: "vertical",
                zIndex: 1
            },
            defaultTextMarkerSettings: {
                layout: "vertical",
                zIndex: 2,
                textWrap: "byLetter"
            },
            header: {
                backgroundFill: "#cecece",
                levelsSeparationStroke: "#cecece",
                topLevel: {
                    tileFill: "#f7f7f7",
                    tilesSeparationStroke: "#cecece",
                    labels: {
                        enabled: !0,
                        anchor: "leftTop",
                        fontSize: 10,
                        vAlign: "middle",
                        padding: {
                            top: 0,
                            right: 5,
                            bottom: 0,
                            left: 5
                        },
                        background: null,
                        disablePointerEvents: !0
                    }
                },
                midLevel: {
                    tileFill: "#f7f7f7",
                    tilesSeparationStroke: "#cecece",
                    labels: {
                        enabled: !0,
                        anchor: "leftTop",
                        fontSize: 10,
                        vAlign: "middle",
                        padding: {
                            top: 0,
                            right: 5,
                            bottom: 0,
                            left: 5
                        },
                        background: null,
                        disablePointerEvents: !0
                    }
                },
                lowLevel: {
                    tileFill: "#f7f7f7",
                    tilesSeparationStroke: "#cecece",
                    labels: {
                        enabled: !0,
                        anchor: "leftTop",
                        fontSize: 10,
                        vAlign: "middle",
                        padding: {
                            top: 0,
                            right: 5,
                            bottom: 0,
                            left: 5
                        },
                        background: null,
                        disablePointerEvents: !0
                    }
                }
            }
        },
        ganttBase: {
            splitterPosition: "30%",
            headerHeight: 70,
            rowHoverFill: "#F8FAFB",
            rowSelectedFill: "#ebf1f4",
            rowStroke: "#cecece",
            editing: !1,
            title: {
                enabled: !1
            },
            legend: {
                enabled: !1
            },
            background: {
                fill: "#fff"
            },
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            dataGrid: {
                isStandalone: !1,
                backgroundFill: "none",
                tooltip: {
                    zIndex: 100,
                    allowLeaveChart: !1
                }
            },
            timeline: {
                isStandalone: !1
            }
        },
        ganttResource: {
            dataGrid: {
                tooltip: {
                    titleFormat: function() {
                        return this.name || ""
                    },
                    format: function() {
                        var a = this.minPeriodDate,
                            c = this.maxPeriodDate;
                        return (a ? "Start Date: " + b.anychart.format.dateTime(a) : "") + (c ? "\nEnd Date: " + b.anychart.format.dateTime(c) : "")
                    }
                }
            },
            timeline: {
                tooltip: {
                    titleFormat: function() {
                        return this.name || ""
                    },
                    format: function() {
                        var a = this.periodStart || this.minPeriodDate,
                            c = this.periodEnd || this.maxPeriodDate;
                        return (a ? "Start Date: " + b.anychart.format.dateTime(a) : "") + (c ? "\nEnd Date: " + b.anychart.format.dateTime(c) : "")
                    }
                }
            }
        },
        ganttProject: {
            dataGrid: {
                tooltip: {
                    titleFormat: function() {
                        return this.name || ""
                    },
                    format: function() {
                        var a = this.actualStart || this.autoStart,
                            c = this.actualEnd || this.autoEnd,
                            d = this.progressValue;
                        void 0 === d && (d = (Math.round(1E4 * this.autoProgress) / 100 || 0) + "%");
                        return (a ? "Start Date: " + b.anychart.format.dateTime(a) : "") + (c ? "\nEnd Date: " + b.anychart.format.dateTime(c) : "") + (d ? "\nComplete: " + d : "")
                    }
                }
            },
            timeline: {
                tooltip: {
                    titleFormat: function() {
                        return this.name || ""
                    },
                    format: function() {
                        var a = this.actualStart || this.autoStart,
                            c = this.actualEnd || this.autoEnd,
                            d = this.progressValue;
                        void 0 === d && (d = (Math.round(1E4 * this.autoProgress) / 100 || 0) + "%");
                        return (a ? "Start Date: " + b.anychart.format.dateTime(a) : "") + (c ? "\nEnd Date: " + b.anychart.format.dateTime(c) : "") + (d ? "\nComplete: " + d : "")
                    }
                }
            }
        },
        stock: {
            grouping: {},
            scrollerGrouping: {
                levels: [{
                    unit: "millisecond",
                    count: 1
                }, {
                    unit: "millisecond",
                    count: 2
                }, {
                    unit: "millisecond",
                    count: 5
                }, {
                    unit: "millisecond",
                    count: 10
                }, {
                    unit: "millisecond",
                    count: 25
                }, {
                    unit: "millisecond",
                    count: 50
                }, {
                    unit: "millisecond",
                    count: 100
                }, {
                    unit: "millisecond",
                    count: 250
                }, {
                    unit: "millisecond",
                    count: 500
                }, {
                    unit: "second",
                    count: 1
                }, {
                    unit: "second",
                    count: 2
                }, {
                    unit: "second",
                    count: 5
                }, {
                    unit: "second",
                    count: 10
                }, {
                    unit: "second",
                    count: 20
                }, {
                    unit: "second",
                    count: 30
                }, {
                    unit: "minute",
                    count: 1
                }, {
                    unit: "minute",
                    count: 2
                }, {
                    unit: "minute",
                    count: 5
                }, {
                    unit: "minute",
                    count: 10
                }, {
                    unit: "minute",
                    count: 20
                }, {
                    unit: "minute",
                    count: 30
                }, {
                    unit: "hour",
                    count: 1
                }, {
                    unit: "hour",
                    count: 2
                }, {
                    unit: "hour",
                    count: 3
                }, {
                    unit: "hour",
                    count: 4
                }, {
                    unit: "hour",
                    count: 6
                }, {
                    unit: "hour",
                    count: 12
                }, {
                    unit: "day",
                    count: 1
                }, {
                    unit: "day",
                    count: 2
                }, {
                    unit: "day",
                    count: 4
                }, {
                    unit: "week",
                    count: 1
                }, {
                    unit: "week",
                    count: 2
                }, {
                    unit: "month",
                    count: 1
                }, {
                    unit: "month",
                    count: 2
                }, {
                    unit: "month",
                    count: 3
                }, {
                    unit: "month",
                    count: 6
                }, {
                    unit: "year",
                    count: 1
                }],
                maxVisiblePoints: NaN,
                minPixPerPoint: 1
            },
            defaultAnnotationSettings: {},
            defaultPlotSettings: {
                annotations: {
                    annotationsList: [],
                    zIndex: 2E3
                },
                background: {
                    enabled: !1
                },
                defaultSeriesSettings: {
                    base: {
                        pointWidth: "75%",
                        tooltip: {
                            format: function() {
                                var a = c(this.value);
                                return this.seriesName + ": " + this.valuePrefix + a + this.valuePostfix
                            }
                        },
                        legendItem: {
                            iconStroke: "none"
                        }
                    },
                    areaLike: {
                        hoverMarkers: {
                            enabled: null
                        },
                        selectMarkers: {
                            enabled: null
                        }
                    },
                    lineLike: {
                        hoverMarkers: {
                            enabled: null
                        },
                        selectMarkers: {
                            enabled: null
                        }
                    },
                    rangeLike: {
                        tooltip: {
                            format: function() {
                                return this.seriesName + ":\n  High: " + c(this.high) + "\n  Low: " + c(this.low)
                            }
                        }
                    },
                    candlestick: {
                        tooltip: {
                            format: B
                        }
                    },
                    column: {
                        stroke: "none"
                    },
                    rangeColumn: {
                        stroke: "none"
                    },
                    ohlc: {
                        tooltip: {
                            format: B
                        }
                    }
                },
                defaultGridSettings: {
                    scale: 0
                },
                defaultMinorGridSettings: {
                    scale: 0
                },
                defaultYAxisSettings: {
                    enabled: !0,
                    orientation: "left",
                    title: {
                        enabled: !1,
                        text: "Y-Axis"
                    },
                    staggerMode: !1,
                    staggerLines: null,
                    ticks: {
                        enabled: !0
                    },
                    width: 50,
                    labels: {
                        fontSize: "11px",
                        padding: {
                            top: 0,
                            right: 5,
                            bottom: 0,
                            left: 5
                        }
                    },
                    minorLabels: {
                        fontSize: "11px",
                        padding: {
                            top: 0,
                            right: 5,
                            bottom: 0,
                            left: 5
                        }
                    },
                    scale: 0
                },
                xAxis: {
                    enabled: !0,
                    orientation: "bottom",
                    background: {
                        stroke: "#cecece",
                        fill: "#F7F7F7"
                    },
                    height: 25,
                    scale: 0,
                    ticks: {
                        enabled: !1
                    },
                    labels: {
                        enabled: !0,
                        fontSize: "11px",
                        padding: {
                            top: 5,
                            right: 5,
                            bottom: 5,
                            left: 5
                        },
                        anchor: "centerTop",
                        format: function() {
                            return b.anychart.format.dateTime(this.tickValue, b.anychart.format.getDateTimeFormat(b.anychart.format.getIntervalIdentifier(this.majorIntervalUnit)))
                        }
                    },
                    minorLabels: {
                        enabled: !0,
                        anchor: "centerTop",
                        fontSize: "11px",
                        padding: {
                            top: 5,
                            right: 0,
                            bottom: 5,
                            left: 0
                        },
                        format: function() {
                            return b.anychart.format.dateTime(this.tickValue, b.anychart.format.getDateTimeFormat(b.anychart.format.getIntervalIdentifier(this.minorIntervalUnit, this.majorIntervalUnit)))
                        }
                    }
                },
                dateTimeHighlighter: "#B9B9B9",
                legend: {
                    enabled: !0,
                    vAlign: "bottom",
                    iconSize: 13,
                    position: "top",
                    titleFormat: function() {
                        return b.anychart.format.dateTime(this.value, b.anychart.format.getDateTimeFormat(b.anychart.format.getIntervalIdentifier(this.dataIntervalUnit, null, "full")))
                    },
                    align: "left",
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    },
                    title: {
                        enabled: !0,
                        fontSize: 12,
                        text: "",
                        background: {
                            enabled: !1,
                            fill: {
                                keys: ["#fff", "#f3f3f3", "#fff"],
                                angle: "90"
                            },
                            stroke: {
                                keys: ["#ddd", "#d0d0d0"],
                                angle: "90"
                            }
                        },
                        margin: {
                            top: 0,
                            right: 15,
                            bottom: 0,
                            left: 0
                        },
                        padding: {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0
                        },
                        orientation: "left",
                        align: "left",
                        hAlign: "left",
                        rotation: 0
                    },
                    titleSeparator: {
                        enabled: !1,
                        width: "100%",
                        height: 1,
                        margin: {
                            top: 3,
                            right: 0,
                            bottom: 3,
                            left: 0
                        },
                        orientation: "top",
                        fill: ["#000 0", "#000", "#000 0"],
                        stroke: "none"
                    }
                },
                scales: [{
                    type: "linear"
                }],
                yScale: 0,
                zIndex: 10,
                yAxes: [{}]
            },
            padding: [20, 30, 20, 60],
            plots: [{}],
            scroller: {
                defaultSeriesSettings: {
                    base: {
                        fill: "#999 0.6",
                        selectFill: d,
                        stroke: "#999 0.6",
                        selectStroke: d,
                        lowStroke: "#999 0.6",
                        selectLowStroke: d,
                        highStroke: "#999 0.6",
                        selectHighStroke: d,
                        pointWidth: "75%"
                    },
                    marker: {
                        fill: "#999 0.6",
                        stroke: "#999 0.6",
                        selectFill: d,
                        selectStroke: d
                    },
                    areaLike: {
                        fill: "#999 0.6"
                    },
                    barLike: {
                        fill: "#999 0.6"
                    },
                    candlestick: {
                        risingFill: "#999 0.6",
                        risingStroke: "#999 0.6",
                        fallingFill: "#999 0.6",
                        fallingStroke: "#999 0.6",
                        selectFallingFill: "#ef6c00",
                        selectRisingFill: "#64b5f6",
                        selectRisingStroke: "#64b5f6",
                        selectFallingStroke: "#ef6c00"
                    },
                    ohlc: {
                        risingStroke: "#999 0.6",
                        fallingStroke: "#999 0.6",
                        selectRisingStroke: "#64b5f6",
                        selectFallingStroke: "#ef6c00"
                    },
                    stick: {
                        stroke: "#999 0.6",
                        selectStroke: r
                    },
                    jumpLine: {
                        stroke: "#999 0.6",
                        selectStroke: r
                    }
                },
                enabled: !0,
                fill: "none",
                selectedFill: "#1976d2 0.2",
                outlineStroke: "#cecece",
                height: 40,
                minHeight: null,
                maxHeight: null,
                zIndex: 40,
                xAxis: {
                    background: {
                        enabled: !1
                    },
                    minorTicks: {
                        enabled: !0,
                        stroke: "#cecece"
                    },
                    labels: {
                        enabled: !0,
                        fontSize: "11px",
                        padding: {
                            top: 5,
                            right: 5,
                            bottom: 5,
                            left: 5
                        },
                        anchor: "leftTop",
                        format: function() {
                            return b.anychart.format.dateTime(this.tickValue, b.anychart.format.getDateTimeFormat(b.anychart.format.getIntervalIdentifier(this.majorIntervalUnit)))
                        }
                    },
                    minorLabels: {
                        enabled: !0,
                        anchor: "leftTop",
                        fontSize: "11px",
                        padding: {
                            top: 5,
                            right: 5,
                            bottom: 5,
                            left: 5
                        },
                        format: function() {
                            return b.anychart.format.dateTime(this.tickValue, b.anychart.format.getDateTimeFormat(b.anychart.format.getIntervalIdentifier(this.minorIntervalUnit, this.majorIntervalUnit)))
                        }
                    },
                    zIndex: 75
                }
            },
            tooltip: {
                allowLeaveScreen: !0,
                displayMode: "union",
                positionMode: "float",
                title: {
                    enabled: !0,
                    fontSize: 13
                },
                separator: {
                    enabled: !0
                },
                titleFormat: function() {
                    return b.anychart.format.dateTime(this.hoveredDate,
                        b.anychart.format.getDateTimeFormat(b.anychart.format.getIntervalIdentifier(this.dataIntervalUnit, null, "full")))
                }
            },
            a11y: {
                titleFormat: m
            },
            zoomMarqueeFill: "#d3d3d3 0.4",
            zoomMarqueeStroke: "#d3d3d3",
            interactivity: {
                zoomOnMouseWheel: !1,
                scrollOnMouseWheel: !1
            }
        },
        pert: {
            tooltip: {
                enabled: !1
            },
            horizontalSpacing: "15%",
            verticalSpacing: "25%",
            expectedTimeCalculator: function() {
                return void 0 === this.duration ? Math.round((this.optimistic + 4 * this.mostLikely + this.pessimistic) / 6 * 100) / 100 : Number(this.duration)
            },
            background: {
                zIndex: 0
            },
            milestones: {
                shape: "circle",
                size: "5%",
                labels: {
                    enabled: !0,
                    anchor: "leftTop",
                    vAlign: "middle",
                    hAlign: "center",
                    fontColor: "#fff",
                    disablePointerEvents: !0,
                    format: function() {
                        return this.creator ? this.index : this.isStart ? "S" : "F"
                    }
                },
                hoverLabels: {
                    enabled: null,
                    fontColor: "#fff",
                    fontOpacity: 1
                },
                selectLabels: {
                    enabled: null,
                    fontWeight: "bold"
                },
                color: "#64b5f6",
                fill: q,
                stroke: "none",
                hoverFill: k,
                hoverStroke: E,
                selectFill: "#333 0.85",
                selectStroke: "#333 0.85",
                tooltip: {
                    title: {
                        enabled: !0
                    },
                    separator: {
                        enabled: !0
                    },
                    titleFormat: function() {
                        return this.creator ?
                            "Milestone - " + this.index : "Milestone - " + (this.isStart ? "Start" : "Finish")
                    },
                    format: function() {
                        var a = "",
                            b;
                        if (this.successors && this.successors.length) {
                            a += "Successors:";
                            for (b = 0; b < this.successors.length; b++) a += "\n - " + this.successors[b].get("name");
                            this.predecessors && this.predecessors.length && (a += "\n\n")
                        }
                        if (this.predecessors && this.predecessors.length)
                            for (a += "Predecessors:", b = 0; b < this.predecessors.length; b++) a += "\n - " + this.predecessors[b].get("name");
                        return a
                    }
                }
            },
            tasks: {
                color: "#64b5f6",
                fill: q,
                stroke: q,
                hoverFill: k,
                hoverStroke: E,
                selectFill: "#333 0.85",
                selectStroke: "#333 0.85",
                dummyFill: q,
                dummyStroke: function() {
                    return {
                        color: this.sourceColor,
                        dash: "6 4"
                    }
                },
                upperLabels: {
                    enabled: !0,
                    anchor: "centerBottom",
                    vAlign: "bottom",
                    hAlign: "center",
                    fontSize: 10,
                    contColor: "#333",
                    padding: {
                        top: 1,
                        right: 10,
                        bottom: 1,
                        left: 10
                    },
                    textWrap: "noWrap",
                    format: function() {
                        return this.name
                    }
                },
                hoverUpperLabels: {
                    fontWeight: "bold"
                },
                selectUpperLabels: {
                    fontWeight: "bold"
                },
                lowerLabels: {
                    enabled: !0,
                    anchor: "centerTop",
                    vAlign: "top",
                    hAlign: "center",
                    fontSize: 9,
                    fontOpacity: .5,
                    contColor: "#333",
                    textWrap: "noWrap",
                    padding: {
                        top: 1,
                        right: 5,
                        bottom: 1,
                        left: 5
                    },
                    format: function() {
                        return "t: " + c(this.duration)
                    }
                },
                hoverLowerLabels: {
                    fontWeight: "bold"
                },
                selectLowerLabels: {
                    fontWeight: "bold"
                },
                tooltip: {
                    title: {
                        enabled: !0
                    },
                    separator: {
                        enabled: !0
                    },
                    titleFormat: function() {
                        return this.name
                    },
                    format: function() {
                        var a = "Earliest start: " + c(this.earliestStart) + "\nEarliest finish: " + c(this.earliestFinish) + "\nLatest start: " + c(this.latestStart) + "\nLatest finish: " + c(this.latestFinish) + "\nDuration: " +
                            c(this.duration) + "\nSlack: " + c(this.slack);
                        isNaN(this.variance) || (a += "\nStandard deviation: " + Math.round(100 * this.variance) / 100);
                        return a
                    }
                }
            },
            criticalPath: {
                tasks: {
                    color: "#e06666",
                    lowerLabels: {
                        textWrap: "noWrap"
                    },
                    upperLabels: {
                        textWrap: "noWrap"
                    }
                }
            }
        },
        resource: {
            calendar: {},
            conflicts: {
                labels: {
                    enabled: !0,
                    anchor: "leftTop",
                    hAlign: "center",
                    fontSize: "8pt",
                    padding: 0,
                    fontColor: "#F4F4F4",
                    format: "{%hours}h ({%percent}%)"
                },
                fill: "#dd2c00",
                stroke: "none",
                hatchFill: null,
                height: 15,
                zIndex: 100
            },
            overlay: {
                enabled: !1
            },
            activities: {
                labels: {
                    enabled: !0,
                    anchor: "leftTop",
                    fontColor: "#F4F4F4",
                    format: "{%name} ({%hoursPerDayRounded}h)",
                    position: "leftTop"
                },
                hoverLabels: {
                    enabled: null
                },
                selectLabels: {
                    enabled: null
                },
                fill: "#1976d2",
                hoverFill: k,
                selectFill: "#333",
                stroke: null,
                hoverStroke: d,
                selectStroke: d,
                hatchFill: !1,
                hoverHatchFill: null,
                selectHatchFill: null
            },
            resourceList: {
                oddFill: "none",
                evenFill: "none",
                enabled: !0,
                width: "100%",
                height: "100%",
                background: {
                    enabled: !0,
                    fill: "#F3F7FA",
                    stroke: "none",
                    cornerType: "none",
                    corners: 0
                },
                images: {
                    borderRadius: 10,
                    opacity: 1,
                    align: "none",
                    fittingMode: "meet",
                    size: "25%",
                    margin: {
                        top: 5,
                        right: 0,
                        bottom: 5,
                        left: 5
                    }
                },
                baseSettings: {
                    margin: {
                        top: 2,
                        right: 0,
                        bottom: 3,
                        left: 5
                    },
                    fontSize: 15,
                    textWrap: "noWrap",
                    textOverflow: "...",
                    fontFamily: '"Helvetica Neue","Helvetica",sans-serif'
                },
                names: {
                    margin: {
                        top: 5
                    },
                    fontSize: 17,
                    fontWeight: "bold",
                    fontColor: "#000"
                },
                types: {
                    fontSize: 10,
                    fontColor: "#212121"
                },
                descriptions: {
                    fontSize: 12,
                    fontColor: "#959CA0",
                    fontWeight: "bold"
                },
                tags: {
                    fontSize: 9,
                    fontColor: "#212121",
                    background: {
                        enabled: !0,
                        fill: "#eee",
                        stroke: "#ccc",
                        cornerType: "round",
                        corners: 4
                    },
                    padding: {
                        top: 5,
                        right: 5,
                        bottom: 5,
                        left: 5
                    },
                    margin: {
                        top: 2,
                        right: 0,
                        bottom: 3,
                        left: 5
                    }
                },
                drawTopLine: !1,
                drawRightLine: !1,
                drawBottomLine: !0,
                drawLeftLine: !1,
                stroke: "#ccc",
                zIndex: 2,
                overlay: !0
            },
            logo: {
                enabled: !0,
                fill: "#E7ECF0",
                stroke: "none",
                bottomStroke: "#ccc",
                zIndex: 2,
                overlay: !1
            },
            timeLine: {
                enabled: !0,
                background: {
                    enabled: !1
                },
                overlay: {
                    enabled: !1
                },
                zIndex: 2,
                vAlign: "center",
                hAlign: "center",
                textWrap: "noWrap",
                textOverflow: "",
                fill: "none",
                stroke: "#ccc",
                padding: [2, 10, 2, 10],
                fontSize: 11,
                fontWeight: "bold",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                drawTopLine: !1,
                drawRightLine: !1,
                drawBottomLine: !0,
                drawLeftLine: !1
            },
            grid: {
                overlay: {
                    enabled: !1
                },
                background: {
                    enabled: !1,
                    fill: "#F3F7FA"
                },
                oddFill: "#fff",
                evenFill: "#fff",
                oddHolidayFill: "#F4F4F4 .7",
                evenHolidayFill: "#F4F4F4 .7",
                oddHatchFill: null,
                evenHatchFill: null,
                oddHolidayHatchFill: null,
                evenHolidayHatchFill: null,
                horizontalStroke: "#ccc",
                verticalStroke: "#ccc",
                drawTopLine: !1,
                drawRightLine: !1,
                drawBottomLine: !0,
                drawLeftLine: !1,
                zIndex: 2
            },
            xScale: {
                minimumGap: .01,
                maximumGap: .01
            },
            horizontalScrollBar: {
                enabled: !0,
                allowRangeChange: !1,
                autoHide: !0,
                orientation: "bottom",
                thumbs: !1,
                fill: null,
                zIndex: 1010
            },
            verticalScrollBar: {
                enabled: !0,
                allowRangeChange: !1,
                autoHide: !0,
                orientation: "right",
                thumbs: !1,
                fill: null,
                zIndex: 1010
            },
            zoomLevels: [{
                id: "days",
                levels: [{
                    unit: "day",
                    count: 1,
                    formats: ["MMM\ndd  EEEE"],
                    format: function() {
                        return this.value.toUpperCase()
                    },
                    hAlign: "left",
                    textWrap: "allowWrap"
                }],
                unit: "day",
                count: 1,
                unitPixSize: 220
            }, {
                id: "weeks",
                levels: [{
                    unit: "day",
                    count: 1,
                    formats: ["dd EEE", "dd"],
                    hAlign: "left",
                    fill: "#fff",
                    fontColor: "#ABB6BC",
                    format: function() {
                        return this.value.toUpperCase()
                    },
                    height: 30
                }, {
                    unit: "week",
                    count: 1,
                    formats: ["w MMM"],
                    fill: "#F0F5F8",
                    format: function() {
                        return this.value.toUpperCase()
                    }
                }],
                unit: "day",
                count: 1,
                unitPixSize: 100
            }, {
                id: "months",
                levels: [{
                    unit: "day",
                    count: 1,
                    formats: ["d EEE", "d"],
                    hAlign: "center",
                    padding: [2, 5, 2, 5],
                    fill: "#fff",
                    format: function() {
                        return this.value.toUpperCase()
                    },
                    height: 30
                }, {
                    unit: "week",
                    count: 1,
                    formats: ["w MMM"],
                    fill: "#F0F5F8",
                    format: function() {
                        return this.value.toUpperCase()
                    }
                }],
                unit: "day",
                count: 1,
                unitPixSize: 25
            }],
            zoomLevel: 0,
            padding: [0, 0, 0, 0],
            margin: [20, 20, 20, 20],
            resourceListWidth: 260,
            timeLineHeight: 52,
            cellPadding: [2, 2, 2, 2],
            minRowHeight: 50,
            pixPerHour: 25,
            defaultMinutesPerDay: 60,
            splitterStroke: "#ccc",
            timeTrackingMode: "activityPerResource",
            background: {
                enabled: !0,
                stroke: "#ccc"
            },
            tooltip: {
                allowLeaveScreen: !1,
                allowLeaveChart: !0,
                displayMode: "single",
                positionMode: "float",
                title: {
                    enabled: !0,
                    fontSize: 13
                },
                separator: {
                    enabled: !0
                },
                titleFormat: "{%name}",
                format: function() {
                    var a = window.anychart.format.date;
                    return "Starts: " + a(this.start) + "\nEnds: " + a(this.end)
                }
            }
        },
        tagCloud: {
            anglesCount: 7,
            fromAngle: -90,
            toAngle: 90,
            mode: "spiral",
            textSpacing: 1,
            scale: {
                type: "linear"
            },
            colorRange: {},
            colorScale: null,
            normal: {
                fontFamily: "Verdana, Helvetica, Arial, sans-serif",
                fontOpacity: 1,
                fontDecoration: "none",
                fontStyle: "normal",
                fontVariant: "normal",
                fontWeight: "normal",
                fill: function() {
                    return b.anychart.color.setOpacity(this.scaledColor || this.sourceColor, .85, !0)
                }
            },
            hovered: {
                fill: n
            },
            selected: {
                fill: "#333 0.85"
            },
            tooltip: {
                enabled: !0,
                title: {
                    enabled: !0
                },
                separator: {
                    enabled: !0
                },
                titleFormat: function() {
                    return this.name || this.x
                },
                format: function() {
                    return "Frequency: " + c(this.value) + "\nPercent of total: " + (100 * this.value / this.getStat("sum")).toFixed(1) + "%"
                }
            },
            legend: {
                enabled: !1,
                itemsSourceMode: "categories",
                tooltip: {
                    contentInternal: {
                        background: {
                            disablePointerEvents: !1
                        }
                    }
                }
            }
        },
        venn: {
            dataSeparator: "&",
            background: {
                zIndex: 0
            },
            padding: {
                top: 15,
                right: 5,
                bottom: 15,
                left: 5
            },
            a11y: {
                enabled: !0,
                titleFormat: m,
                mode: "chartElements"
            },
            color: "#64b5f6",
            fill: v,
            hoverFill: function() {
                return b.anychart.color.setOpacity(b.anychart.color.lighten(this.sourceColor),
                    .5, !0)
            },
            selectFill: "#333 0.85",
            tooltip: {
                titleFormat: "{%Name}",
                format: "Value: {%Value}"
            },
            stroke: "none",
            hoverStroke: "none",
            hatchFill: !1,
            hoverHatchFill: !1,
            selectHatchFill: !1,
            selectStroke: "none",
            labels: {
                fontColor: "#f4f4f4",
                format: "{%Name}",
                anchor: "center",
                enabled: !0,
                disablePointerEvents: !0,
                zIndex: 100,
                fontWeight: "bold"
            },
            hoverLabels: {
                enabled: null
            },
            selectLabels: {
                enabled: null
            },
            markers: {
                enabled: !1,
                zIndex: 99,
                disablePointerEvents: !0,
                stroke: "none"
            },
            hoverMarkers: {
                enabled: null
            },
            selectMarkers: {
                enabled: null
            },
            intersections: {
                fill: "#fff 0.00001",
                hoverFill: "#fff 0.5",
                selectFill: "#333 0.85",
                stroke: "none",
                hoverStroke: "none",
                selectStroke: "none",
                labels: {
                    fontWeight: "normal",
                    format: "{%Value}",
                    enabled: null
                },
                hoverLabels: {
                    enabled: null
                },
                selectLabels: {
                    enabled: null
                },
                markers: {
                    enabled: null
                },
                hoverMarkers: {
                    enabled: null
                },
                selectMarkers: {
                    enabled: null
                },
                tooltip: {
                    titleFormat: "{%Name}"
                }
            },
            legend: {
                enabled: !0,
                zIndex: 0,
                tooltip: {
                    enabled: !1
                },
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 0,
                    left: 10
                },
                position: "bottom"
            }
        },
        standalones: {
            background: {
                enabled: !0,
                zIndex: 0
            },
            label: {
                enabled: !0,
                text: "Label text",
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                width: null,
                height: null,
                anchor: "leftTop",
                position: "leftTop",
                offsetX: 0,
                offsetY: 0,
                minFontSize: 8,
                maxFontSize: 72,
                adjustFontSize: {
                    width: !1,
                    height: !1
                },
                rotation: 0,
                zIndex: 0
            },
            labelsFactory: {
                enabled: !0,
                zIndex: 0
            },
            legend: {
                enabled: !0,
                zIndex: 0
            },
            markersFactory: {
                enabled: !0,
                zIndex: 0
            },
            title: {
                enabled: !0,
                zIndex: 0
            },
            linearAxis: {
                enabled: !0,
                zIndex: 0,
                ticks: {
                    enabled: !0
                },
                minorTicks: {
                    enabled: !0
                }
            },
            polarAxis: {
                enabled: !0,
                startAngle: 0,
                zIndex: 0,
                ticks: {
                    enabled: !0
                },
                minorTicks: {
                    enabled: !0
                }
            },
            radarAxis: {
                enabled: !0,
                startAngle: 0,
                zIndex: 0,
                ticks: {
                    enabled: !0
                },
                minorTicks: {
                    enabled: !0
                }
            },
            radialAxis: {
                enabled: !0,
                startAngle: 0,
                zIndex: 0,
                ticks: {
                    enabled: !0
                },
                minorTicks: {
                    enabled: !0
                },
                minorLabels: {
                    padding: {
                        top: 1,
                        right: 1,
                        bottom: 0,
                        left: 1
                    }
                }
            },
            linearGrid: {
                enabled: !0,
                scale: null,
                zIndex: 0
            },
            polarGrid: {
                enabled: !0,
                layout: "circuit",
                zIndex: 0
            },
            radarGrid: {
                enabled: !0,
                layout: "circuit",
                zIndex: 0
            },
            lineAxisMarker: {
                enabled: !0,
                zIndex: 0
            },
            textAxisMarker: {
                enabled: !0,
                zIndex: 0
            },
            rangeAxisMarker: {
                enabled: !0,
                zIndex: 0
            },
            dataGrid: {
                enabled: !0,
                zIndex: 0
            },
            scroller: {
                enabled: !0
            },
            resourceList: {
                width: "33%",
                height: "100%",
                background: {
                    enabled: !0,
                    fill: "#ccc",
                    stroke: "#ccc",
                    cornerType: "none",
                    corners: 0
                },
                rowHeight: null,
                minRowHeight: "20%",
                maxRowHeight: "50%",
                images: {
                    borderRadius: 10,
                    opacity: 1,
                    align: "none",
                    fittingMode: "meet",
                    size: "25%",
                    margin: {
                        top: 5,
                        right: 0,
                        bottom: 5,
                        left: 5
                    }
                },
                baseSettings: {
                    margin: {
                        top: 2,
                        right: 0,
                        bottom: 3,
                        left: 5
                    },
                    fontSize: 15,
                    textWrap: "noWrap",
                    textOverflow: "..."
                },
                names: {
                    margin: {
                        top: 5
                    }
                },
                types: {
                    fontSize: 10,
                    fontColor: "#212121"
                },
                descriptions: {
                    fontSize: 12,
                    fontColor: "#545f69",
                    fontStyle: "oblique"
                },
                tags: {
                    fontSize: 9,
                    fontColor: "#212121",
                    background: {
                        enabled: !0,
                        fill: "#eee",
                        stroke: "#ccc",
                        cornerType: "round",
                        corners: 4
                    },
                    padding: {
                        top: 5,
                        right: 5,
                        bottom: 5,
                        left: 5
                    },
                    margin: {
                        top: 2,
                        right: 0,
                        bottom: 3,
                        left: 5
                    }
                }
            },
            colorRange: {
                enabled: !0,
                zIndex: 50
            },
            projectTimeline: {
                tooltip: {
                    titleFormat: function() {
                        return this.name || ""
                    },
                    format: function() {
                        var a = this.actualStart || this.autoStart,
                            c = this.actualEnd || this.autoEnd,
                            d = this.progressValue;
                        void 0 === d && (d = (Math.round(1E4 * this.autoProgress) /
                            100 || 0) + "%");
                        return (a ? "Start Date: " + b.anychart.format.dateTime(a) : "") + (c ? "\nEnd Date: " + b.anychart.format.dateTime(c) : "") + (d ? "\nComplete: " + d : "")
                    }
                }
            },
            resourceTimeline: {
                tooltip: {
                    titleFormat: function() {
                        return this.name || ""
                    },
                    format: function() {
                        var a = this.periodStart || this.minPeriodDate,
                            c = this.periodEnd || this.maxPeriodDate;
                        return (a ? "Start Date: " + b.anychart.format.dateTime(a) : "") + (c ? "\nEnd Date: " + b.anychart.format.dateTime(c) : "")
                    }
                }
            }
        }
    }
}).call(this);