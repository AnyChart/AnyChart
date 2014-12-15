function getSchema() {
  return '<?xml version="1.0" encoding="utf-8"?>'+
        '<xsd:schema '+
                'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '+
                'targetNamespace="http://anychart.com/products/anychart7/schemas/7.3.0/schema.xsd" '+
                'xmlns="http://anychart.com/products/anychart7/schemas/7.3.0/schema.xsd" '+
                'elementFormDefault="qualified">'+
        ''+
            '<!-- Online validator http://www.utilities-online.info/xsdvalidation/#.VImqs6SsUn- -->'+
        ''+
            '<xsd:element name="anychart" type="Anychart"/>'+
        ''+
            '<xsd:complexType name="Anychart">'+
                '<xsd:all minOccurs="0" maxOccurs="1">'+
                    '<xsd:element name="chart" type="Chart"/>'+
                '</xsd:all>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="Chart">'+
                '<xsd:all>'+
                    '<!-- VisualBaseWithBounds elements -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="bounds" type="utils.Bounds"/>'+
                    '<!-- core.Chart elements -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="title" type="core.Title"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="background" type="core.Background"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="margin" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="padding" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="legend" type="core.Legend"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="credits" type="core.Credits"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="chart_labels" type="core.Label_list"/>'+
                    '<!-- Common elements -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="data" type="Data"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="palette" type="palettes.Colors"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hatch_fill_palette" type="palettes.HatchFills"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="marker_palette" type="palettes.Markers"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="grids" type="Grid_list"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_grids" type="Grid_list"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="scales" type="Scale_list"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="x_scale" type="Scale"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="y_scale" type="Scale"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="series_list" type="Series_list"/>'+
                    '<!-- charts.Bullet elements -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="range_palette" type="palettes.Colors"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="scale" type="Scale"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="axis" type="core.axes.Linear"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="ranges" type="core.axisMarkers.SimpleRange_list"/>'+
                    '<!-- charts.Cartesian and chart.Scatter elements -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="x_axes" type="core.axes.Linear_list"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="y_axes" type="core.axes.Linear_list"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="line_axes_markers" type="core.axisMarkers.Line_list"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="range_axes_markers" type="core.axisMarkers.Range_list"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="text_axes_markers" type="core.axisMarkers.Text_list"/>'+
                    '<!-- charts.Polar and charts.Radar elements -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="x_axis" type="core.axes.RadarPolar"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="y_axis" type="core.axes.Radial"/>'+
                    '<!-- charts.Pie elements -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="tooltip" type="core.Tooltip"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="connector_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hatch_fill" type="HatchFill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_hatch_fill" type="HatchFill"/>'+
                '</xsd:all>'+
                '<!-- core.Chart attrs -->'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
                '<xsd:attributeGroup ref="attrs.Bounds"/>'+
                '<xsd:attribute name="type" type="enums.ChartTypes" use="required"/>'+
                '<xsd:attribute name="container" type="xsd:string"/>'+
                '<xsd:attribute name="title" type="simple.StringOrBoolOrNull" default="true"/>'+
                '<xsd:attribute name="background" type="simple.StringOrBoolOrNull" default="false"/>'+
                '<!-- charts.Bullet attrs -->'+
                '<xsd:attribute name="layout" type="enums.Layout" default="horizontal"/>'+
                '<xsd:attribute name="scale" type="simple.ChartScaleRef" default="linear"/>'+
                '<xsd:attribute name="axis" type="simple.BoolOrNull" default="true"/>'+
                '<!-- charts.Cartesian attrs -->'+
                '<xsd:attribute name="bar_chart_mode" type="simple.Bool" default="false"/>'+
                '<xsd:attribute name="bar_groups_padding" type="xsd:double" default="0.5"/>'+
                '<xsd:attribute name="bars_padding" type="xsd:double" default="0.1"/>'+
                '<xsd:attribute name="x_scale" type="simple.ChartScaleRef"/>'+
                '<xsd:attribute name="y_scale" type="simple.ChartScaleRef"/>'+
                '<!-- chart.Polar and charts.Radar common attrs -->'+
                '<xsd:attribute name="start_angle" type="xsd:double" default="0"/>'+
                '<!-- also for pie -->'+
                '<xsd:attribute name="x_axis" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="y_axis" type="simple.BoolOrNull" default="true"/>'+
                '<!-- charts.Pie attrs -->'+
                '<!--<xsd:attribute name="group" type="xsd:boolean"/> NO SUPPORT IN XML YET-->'+
                '<xsd:attribute name="labels" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="hover_labels" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="tooltip" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="sort" type="enums.Sort" default="none"/>'+
                '<xsd:attribute name="radius" type="simple.NumberOrPercent" default="100%"/>'+
                '<xsd:attribute name="inner_radius" type="simple.NumberOrPercent" default="0"/>'+
                '<xsd:attribute name="explode" type="simple.NumberOrPercent" default="15"/>'+
                '<xsd:attribute name="outside_labels_space" type="simple.NumberOrPercent" default="30%"/>'+
                '<xsd:attribute name="connector_length" type="simple.NumberOrPercent" default="20%"/>'+
                '<xsd:attribute name="outside_labels_critical_angle" type="xsd:double" default="60"/>'+
                '<xsd:attribute name="connectorStroke" type="xsd:string" default="black 0.3"/>'+
                '<xsd:attribute name="fill" type="xsd:string"/>'+
                '<xsd:attribute name="hover_fill" type="xsd:string"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hover_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hatch_fill" type="simple.HatchFill" default="false"/>'+
                '<xsd:attribute name="hover_hatch_fill" type="simple.HatchFill" default="false"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="Series">'+
                '<xsd:all>'+
                    '<!-- Base series -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hatch_fill" type="HatchFill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_hatch_fill" type="HatchFill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="color" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="meta" type="Meta"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="data" type="Data"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="tooltip" type="core.Tooltip"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="clip" type="utils.Rect"/>'+
                    '<!-- BaseWithMarkers series -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="markers" type="core.MarkersFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_markers" type="core.MarkersFactory"/>'+
                    '<!-- Bubble series -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="negative_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_negative_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="negative_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_negative_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="negative_hatch_fill" type="HatchFill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_negative_hatch_fill" type="HatchFill"/>'+
                    '<!-- Candlestick series -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="rising_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_rising_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="rising_hatch_fill" type="HatchFill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_rising_hatch_fill" type="HatchFill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="falling_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_falling_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="falling_hatch_fill" type="HatchFill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_falling_hatch_fill" type="HatchFill"/>'+
                    '<!-- ContinuousRangeBase series -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="high_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_high_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="low_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_low_stroke" type="Stroke"/>'+
                    '<!-- OHLC series -->'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="rising_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_rising_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="falling_stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="hover_falling_stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<!-- Base series -->'+
                '<xsd:attribute name="series_type" type="enums.SeriesTypes"/>'+
                '<xsd:attribute name="fill" type="xsd:string"/>'+
                '<xsd:attribute name="hover_fill" type="xsd:string"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hover_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hatch_fill" type="simple.HatchFill"/>'+
                '<xsd:attribute name="hover_hatch_fill" type="simple.HatchFill"/>'+
                '<xsd:attribute name="color" type="xsd:string"/>'+
                '<xsd:attribute name="x_point_position" type="simple.Ratio"/>'+
                '<xsd:attribute name="name" type="xsd:string"/>'+
                '<xsd:attribute name="labels" type="simple.BoolOrNull" default="false"/>'+
                '<xsd:attribute name="hover_labels" type="simple.BoolOrNull" default="false"/>'+
                '<xsd:attribute name="tooltip" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="clip" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="x_scale" type="simple.ScaleRef"/>'+
                '<xsd:attribute name="y_scale" type="simple.ScaleRef"/>'+
                '<!-- BaseWithMarkers series -->'+
                '<xsd:attribute name="markers" type="simple.MarkerType"/>'+
                '<xsd:attribute name="hover_markers" type="simple.MarkerType"/>'+
                '<!-- Bubble series -->'+
                '<xsd:attribute name="minimum_size" type="simple.NumberOrPercent" default="10%"/>'+
                '<xsd:attribute name="maximum_size" type="simple.NumberOrPercent" default="95%"/>'+
                '<xsd:attribute name="display_negative" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="negative_fill" type="xsd:string"/>'+
                '<xsd:attribute name="hover_negative_fill" type="xsd:string"/>'+
                '<xsd:attribute name="negative_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hover_negative_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="negative_hatch_fill" type="simple.HatchFill"/>'+
                '<xsd:attribute name="hover_negative_hatch_fill" type="simple.HatchFill"/>'+
                '<!-- Candlestick series -->'+
                '<xsd:attribute name="rising_fill" type="xsd:string"/>'+
                '<xsd:attribute name="hover_rising_fill" type="xsd:string"/>'+
                '<xsd:attribute name="rising_hatch_fill" type="simple.HatchFill"/>'+
                '<xsd:attribute name="hover_rising_hatch_fill" type="simple.HatchFill"/>'+
                '<xsd:attribute name="falling_fill" type="xsd:string"/>'+
                '<xsd:attribute name="hover_falling_fill" type="xsd:string"/>'+
                '<xsd:attribute name="falling_hatch_fill" type="simple.HatchFill"/>'+
                '<xsd:attribute name="hover_falling_hatch_fill" type="simple.HatchFill"/>'+
                '<!-- ContinuousSeriesBase series -->'+
                '<xsd:attribute name="connect_missing_points" type="simple.Bool" default="false"/>'+
                '<!-- ContinuousRangeBase series -->'+
                '<xsd:attribute name="high_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hover_high_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="low_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hover_low_stroke" type="xsd:string"/>'+
                '<!-- Marker series -->'+
                '<xsd:attribute name="size" type="xsd:double"/>'+
                '<xsd:attribute name="hover_size" type="xsd:double"/>'+
                '<xsd:attribute name="type" type="enums.MarkerType"/>'+
                '<xsd:attribute name="hover_type" type="enums.MarkerType"/>'+
                '<!-- OHLC series -->'+
                '<xsd:attribute name="rising_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hover_rising_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="falling_stroke" type="xsd:string"/>'+
                '<xsd:attribute name="hover_falling_stroke" type="xsd:string"/>'+
                '<!-- WidthBased series -->'+
                '<xsd:attribute name="point_width" type="simple.NumberOrPercent"/>'+
                '<!-- Polar ContinuousBase series -->'+
                '<xsd:attribute name="closed" type="simple.Bool" default="true"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="Series_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="series" type="Series"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="Meta">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:any processContents="skip"/>'+
                '</xsd:sequence>'+
                '<xsd:anyAttribute processContents="skip"/>'+
            '</xsd:complexType>'+
        ''+
            '<!-- data complex types -->'+
        ''+
            '<xsd:complexType name="Data">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="point" type="DataPoint"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="DataPoint" mixed="true">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:any processContents="skip"/>'+
                '</xsd:sequence>'+
                '<xsd:anyAttribute processContents="skip"/>'+
            '</xsd:complexType>'+
        ''+
            '<!-- core.axes complex types -->'+
        ''+
            '<xsd:complexType name="core.axes.Linear">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="title" type="core.Title"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="ticks" type="core.axes.Ticks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_ticks" type="core.axes.Ticks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="title" type="simple.StringOrBoolOrNull" default="true"/>'+
                '<xsd:attribute name="labels" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="minor_labels" type="simple.BoolOrNull"/>'+
                '<xsd:attribute name="ticks" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="minor_ticks" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="stagger_mode" type="simple.Bool" default="false"/>'+
                '<xsd:attribute name="stagger_lines" type="simple.IntOrNull" default="null"/>'+
                '<xsd:attribute name="stagger_max_lines" type="xsd:unsignedInt" default="2"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="orientation" type="enums.Orientation"/>'+
                '<xsd:attribute name="draw_first_label" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="draw_last_label" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="overlap_mode" type="enums.LabelsOverlapMode" default="noOverlap"/>'+
                '<xsd:attribute name="scale" type="simple.ScaleRef"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axes.Linear_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="axis" type="core.axes.Linear"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axes.Ticks">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="length" type="xsd:double" default="5"/>'+
                '<xsd:attribute name="position" type="enums.SidePosition" default="outside"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axes.RadarPolar">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="ticks" type="core.axes.RadialTicks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_ticks" type="core.axes.RadialTicks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="labels" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="minor_labels" type="simple.BoolOrNull"/>'+
                '<xsd:attribute name="ticks" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="minor_ticks" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="overlap_mode" type="enums.LabelsOverlapMode" default="noOverlap"/>'+
                '<xsd:attribute name="scale" type="simple.ScaleRef"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axes.Radial">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_labels" type="core.LabelsFactory"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="ticks" type="core.axes.RadialTicks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_ticks" type="core.axes.RadialTicks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="labels" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="minor_labels" type="simple.BoolOrNull"/>'+
                '<xsd:attribute name="ticks" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="minor_ticks" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="draw_first_label" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="draw_last_label" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="overlap_mode" type="enums.LabelsOverlapMode" default="noOverlap"/>'+
                '<xsd:attribute name="scale" type="simple.ScaleRef"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axes.RadialTicks">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="length" type="xsd:double" default="5"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<!-- core.axisMarkers -->'+
        ''+
            '<xsd:complexType name="core.axisMarkers.Line">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="value" type="xsd:string"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="layout" type="enums.Layout"/>'+
                '<xsd:attribute name="scale" type="simple.ScaleRef"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axisMarkers.Line_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="line_axes_marker" type="core.axisMarkers.Line"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axisMarkers.Range">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="fill" type="Fill"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="from" type="xsd:string"/>'+
                '<xsd:attribute name="to" type="xsd:string"/>'+
                '<xsd:attribute name="fill" type="xsd:string"/>'+
                '<xsd:attribute name="layout" type="enums.Layout"/>'+
                '<xsd:attribute name="scale" type="simple.ScaleRef"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axisMarkers.Range_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="range_axes_marker" type="core.axisMarkers.Range"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axisMarkers.SimpleRange_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="range" type="core.axisMarkers.Range"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axisMarkers.Text">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="text" type="simple.Text"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="value" type="xsd:string"/>'+
                '<xsd:attribute name="anchor" type="enums.AnchorAndPosition" default="center"/>'+
                '<xsd:attribute name="align" type="enums.Align" default="center"/>'+
                '<xsd:attribute name="layout" type="enums.Layout"/>'+
                '<xsd:attribute name="rotation" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="offset_x" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="offset_y" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="text" type="xsd:string"/>'+
                '<xsd:attribute name="height" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="scale" type="simple.ScaleRef"/>'+
                '<xsd:attributeGroup ref="attrs.TextSettings"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.axisMarkers.Text_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="text_axes_marker" type="core.axisMarkers.Text"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<!-- core.grids complex types -->'+
        ''+
            '<xsd:complexType name="Grid">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="odd_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="even_fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="is_minor" type="simple.Bool"/>'+
                '<xsd:attribute name="layout" type="enums.Layout"/>'+
                '<xsd:attribute name="draw_first_line" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="draw_last_line" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="odd_fill" type="xsd:string"/>'+
                '<xsd:attribute name="even_fill" type="xsd:string"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="scale" type="simple.ScaleRef"/>'+
                '<xsd:attribute name="x_scale" type="simple.ScaleRef"/>'+
                '<xsd:attribute name="y_scale" type="simple.ScaleRef"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="Grid_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="grid" type="Grid"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<!-- core.ui complex types -->'+
        ''+
            '<xsd:complexType name="core.Background">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="corners" type="utils.Corners"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="fill" type="xsd:string"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attribute name="corner_type" type="enums.BackgroundCornerTypes" default="none"/>'+
                '<xsd:attribute name="corners" type="xsd:double" default="0"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Credits">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="text" type="simple.Text"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="url" type="simple.Text"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="alt" type="simple.Text"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="logo_src" type="simple.Text"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="text" type="xsd:string"/>'+
                '<xsd:attribute name="url" type="xsd:string"/>'+
                '<xsd:attribute name="alt" type="xsd:string"/>'+
                '<xsd:attribute name="logo_src" type="xsd:string"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Label">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="background" type="core.Background"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="padding" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="text" type="simple.Text"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="adjust_font_size" type="utils.AdjustFontSizeObj"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="background" type="simple.StringOrBoolOrNull" default="false"/>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="height" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="anchor" type="enums.AnchorAndPosition" default="center"/>'+
                '<xsd:attribute name="offset_x" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="offset_y" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="position" type="enums.AnchorAndPosition" default="center"/>'+
                '<xsd:attribute name="text" type="xsd:string"/>'+
                '<xsd:attribute name="min_font_size" type="xsd:string"/>'+
                '<xsd:attribute name="max_font_size" type="xsd:string"/>'+
                '<xsd:attribute name="adjust_font_size" type="simple.Bool" default="false"/>'+
                '<xsd:attribute name="rotation" type="xsd:double" default="0"/>'+
                '<xsd:attributeGroup ref="attrs.TextSettings"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Label_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="label" type="core.Label"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.LabelsFactory">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="background" type="core.Background"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="padding" type="utils.Space"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="background" type="simple.StringOrBoolOrNull" default="false"/>'+
                '<xsd:attribute name="position" type="xsd:string"/>'+
                '<xsd:attribute name="anchor" type="enums.AnchorAndPosition"/>'+
                '<xsd:attribute name="offset_x" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="offset_y" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="rotation" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="height" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attributeGroup ref="attrs.TextSettings"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Legend">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="margin" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="padding" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="background" type="core.Background"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="title" type="core.Title"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="title_separator" type="core.Separator"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="paginator" type="core.Paginator"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="tooltip" type="core.Tooltip"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="background" type="simple.StringOrBoolOrNull" default="true"/>'+
                '<xsd:attribute name="title" type="simple.StringOrBoolOrNull" default="true"/>'+
                '<xsd:attribute name="title_separator" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="paginator" type="simple.BoolOrNull" default="false"/>'+
                '<xsd:attribute name="tooltip" type="simple.BoolOrNull" default="true"/>'+
                '<xsd:attribute name="items_layout" type="enums.Layout" default="horizontal"/>'+
                '<xsd:attribute name="items_spacing" type="xsd:string" default="15"/>'+
                '<xsd:attribute name="icon_text_spacing" type="xsd:string" default="5"/>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="height" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="position" type="enums.Orientation" default="bottom"/>'+
                '<xsd:attribute name="align" type="enums.Align" default="center"/>'+
                '<xsd:attributeGroup ref="attrs.TextSettings"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.MarkersFactory">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="disable_pointer_events" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="position" type="xsd:string"/>'+
                '<xsd:attribute name="anchor" type="enums.AnchorAndPosition"/>'+
                '<xsd:attribute name="offset_x" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="offset_y" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="type" type="enums.MarkerType"/>'+
                '<xsd:attribute name="size" type="xsd:double"/>'+
                '<xsd:attribute name="fill" type="xsd:string"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Paginator">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="background" type="core.Background"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="padding" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="margin" type="utils.Space"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="background" type="simple.StringOrBoolOrNull" default="false"/>'+
                '<xsd:attribute name="orientation" type="enums.Orientation"/>'+
                '<xsd:attribute name="layout" type="enums.Layout"/>'+
                '<xsd:attributeGroup ref="attrs.TextSettings"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Separator">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="margin" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="fill" type="Fill"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="stroke" type="Stroke"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="height" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="orientation" type="enums.Orientation"/>'+
                '<xsd:attribute name="fill" type="xsd:string"/>'+
                '<xsd:attribute name="stroke" type="xsd:string"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Title">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="margin" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="padding" type="utils.Space"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="background" type="core.Background"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="text" type="simple.Text"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="background" type="simple.StringOrBoolOrNull" default="false"/>'+
                '<xsd:attribute name="text" type="xsd:string"/>'+
                '<xsd:attribute name="rotation" type="simple.DoubleOrNull" default="null"/>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="height" type="simple.NumberOrPercentOrNull" default="null"/>'+
                '<xsd:attribute name="align" type="enums.Align" default="center"/>'+
                '<xsd:attribute name="orientation" type="enums.Orientation" default="top"/>'+
                '<xsd:attributeGroup ref="attrs.TextSettings"/>'+
                '<xsd:attributeGroup ref="attrs.VisualBase"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="core.Tooltip">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="title" type="core.Title"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="separator" type="core.Separator"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="content" type="core.Label"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="background" type="core.Background"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="padding" type="utils.Space"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="allow_leave_screen" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="title" type="simple.StringOrBoolOrNull" default="false"/>'+
                '<xsd:attribute name="separator" type="simple.BoolOrNull" default="false"/>'+
                '<xsd:attribute name="content" type="simple.StringOrBoolOrNull"/>'+
                '<xsd:attribute name="background" type="simple.StringOrBoolOrNull" default="false"/>'+
                '<xsd:attribute name="offset_x" type="xsd:double" default="5"/>'+
                '<xsd:attribute name="offset_y" type="xsd:double" default="5"/>'+
                '<xsd:attribute name="anchor" type="enums.AnchorAndPosition" default="centerBottom"/>'+
                '<xsd:attribute name="hide_delay" type="xsd:unsignedInt" default="0"/>'+
                '<xsd:attribute name="enabled" type="simple.Bool" default="true"/>'+
            '</xsd:complexType>'+
        ''+
            '<!-- palettes complex types -->'+
        ''+
            '<xsd:complexType name="palettes.Colors">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="items" type="palettes.ColorsItems"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="type" type="enums.ColorPaletteType" default="distinct"/>'+
                '<xsd:attribute name="count" type="xsd:unsignedInt"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="palettes.HatchFills">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="items" type="palettes.HatchFillsItems"/>'+
                '</xsd:all>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="palettes.Markers">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="items" type="palettes.MarkersItems"/>'+
                '</xsd:all>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="palettes.ColorsItems">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="item" type="simple.Text"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="palettes.HatchFillsItems">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="item" type="HatchFill"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="palettes.MarkersItems">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="item" type="palettes.MarkersItem"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="palettes.MarkersItem">'+
                '<xsd:simpleContent>'+
                    '<xsd:extension base="enums.MarkerType"/>'+
                '</xsd:simpleContent>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:simpleType name="enums.ColorPaletteType">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="distinct"/>'+
                    '<xsd:enumeration value="range"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<!-- utils complex types -->'+
        ''+
            '<xsd:complexType name="utils.Bounds">'+
                '<xsd:attributeGroup ref="attrs.Bounds"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="utils.Space">'+
                '<xsd:attribute name="left" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="right" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="top" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="bottom" type="simple.NumberOrPercent"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="utils.Rect">'+
                '<xsd:attribute name="left" type="xsd:double"/>'+
                '<xsd:attribute name="top" type="xsd:double"/>'+
                '<xsd:attribute name="width" type="xsd:double"/>'+
                '<xsd:attribute name="height" type="xsd:double"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="utils.AdjustFontSizeObj">'+
                '<xsd:attribute name="width" type="simple.Bool" default="false"/>'+
                '<xsd:attribute name="height" type="simple.Bool" default="false"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="utils.Corners">'+
                '<xsd:attribute name="left_top" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="right_top" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="right_bottom" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="left_bottom" type="xsd:double" default="0"/>'+
            '</xsd:complexType>'+
        ''+
            '<!-- Colors -->'+
        ''+
            '<xsd:complexType name="Fill">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="mode" type="utils.Rect"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="keys" type="GradientKeys"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="src" type="simple.Text"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="color" type="xsd:string"/>'+
                '<xsd:attribute name="opacity" type="simple.Ratio"/>'+
                '<xsd:attribute name="mode" type="simple.FillMode"/>'+
                '<xsd:attribute name="angle" type="xsd:double"/>'+
                '<xsd:attribute name="cx" type="xsd:double"/>'+
                '<xsd:attribute name="cy" type="xsd:double"/>'+
                '<xsd:attribute name="fx" type="xsd:double"/>'+
                '<xsd:attribute name="fy" type="xsd:double"/>'+
                '<xsd:attribute name="src" type="xsd:string"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="Stroke">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="mode" type="utils.Rect"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="keys" type="GradientKeys"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="color" type="xsd:string"/>'+
                '<xsd:attribute name="thickness" type="xsd:double" default="1"/>'+
                '<xsd:attribute name="opacity" type="simple.Ratio" default="1"/>'+
                '<xsd:attribute name="dash" type="xsd:string" default="none"/>'+
                '<xsd:attribute name="line_join" type="enums.LineJoin"/>'+
                '<xsd:attribute name="line_cap" type="enums.LineCap"/>'+
                '<xsd:attribute name="angle" type="xsd:double"/>'+
                '<xsd:attribute name="mode" type="simple.Bool" default="false"/>'+
                '<xsd:attribute name="cx" type="xsd:double"/>'+
                '<xsd:attribute name="cy" type="xsd:double"/>'+
                '<xsd:attribute name="fx" type="xsd:double"/>'+
                '<xsd:attribute name="fy" type="xsd:double"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="GradientKey">'+
                '<xsd:complexContent>'+
                    '<xsd:extension base="simple.Text">'+
                        '<xsd:attribute name="offset" type="simple.Ratio"/>'+
                        '<xsd:attribute name="color" type="xsd:string"/>'+
                        '<xsd:attribute name="opacity" type="simple.Ratio"/>'+
                    '</xsd:extension>'+
                '</xsd:complexContent>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="GradientKeys">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="key" type="GradientKey"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="HatchFill">'+
                '<xsd:complexContent>'+
                    '<xsd:extension base="HatchFillString">'+
                        '<xsd:attribute name="type" type="enums.HatchFill"/>'+
                        '<xsd:attribute name="color" type="xsd:string"/>'+
                        '<xsd:attribute name="thickness" type="xsd:double" default="1"/>'+
                        '<xsd:attribute name="size" type="xsd:double"/>'+
                    '</xsd:extension>'+
                '</xsd:complexContent>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="HatchFillString">'+
                '<xsd:simpleContent>'+
                    '<xsd:restriction base="simple.Text">'+
                        '<xsd:enumeration value=""/>'+
                        '<xsd:enumeration value="true"/>'+
                        '<xsd:enumeration value="false"/>'+
                        '<xsd:enumeration value="null"/>'+
                        '<xsd:enumeration value="none"/>'+
                        '<xsd:enumeration value="backwardDiagonal"/>'+
                        '<xsd:enumeration value="forwardDiagonal"/>'+
                        '<xsd:enumeration value="horizontal"/>'+
                        '<xsd:enumeration value="vertical"/>'+
                        '<xsd:enumeration value="dashedBackwardDiagonal"/>'+
                        '<xsd:enumeration value="grid"/>'+
                        '<xsd:enumeration value="dashedForwardDiagonal"/>'+
                        '<xsd:enumeration value="dashedHorizontal"/>'+
                        '<xsd:enumeration value="dashedVertical"/>'+
                        '<xsd:enumeration value="diagonalCross"/>'+
                        '<xsd:enumeration value="diagonalBrick"/>'+
                        '<xsd:enumeration value="divot"/>'+
                        '<xsd:enumeration value="horizontalBrick"/>'+
                        '<xsd:enumeration value="verticalBrick"/>'+
                        '<xsd:enumeration value="checkerBoard"/>'+
                        '<xsd:enumeration value="confetti"/>'+
                        '<xsd:enumeration value="plaid"/>'+
                        '<xsd:enumeration value="solidDiamond"/>'+
                        '<xsd:enumeration value="zigZag"/>'+
                        '<xsd:enumeration value="weave"/>'+
                        '<xsd:enumeration value="percent05"/>'+
                        '<xsd:enumeration value="percent10"/>'+
                        '<xsd:enumeration value="percent20"/>'+
                        '<xsd:enumeration value="percent25"/>'+
                        '<xsd:enumeration value="percent30"/>'+
                        '<xsd:enumeration value="percent40"/>'+
                        '<xsd:enumeration value="percent50"/>'+
                        '<xsd:enumeration value="percent60"/>'+
                        '<xsd:enumeration value="percent70"/>'+
                        '<xsd:enumeration value="percent75"/>'+
                        '<xsd:enumeration value="percent80"/>'+
                        '<xsd:enumeration value="percent90"/>'+
                    '</xsd:restriction>'+
                '</xsd:simpleContent>'+
            '</xsd:complexType>'+
        ''+
            '<!-- Scales -->'+
        ''+
            '<xsd:complexType name="Scale">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="ticks" type="ScaleTicks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="minor_ticks" type="ScaleTicks"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="values" type="OrdinalScaleValues"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="names" type="OrdinalScaleNames"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="type" type="enums.ScaleTypes" default="linear"/>'+
                '<xsd:attribute name="inverted" type="simple.Bool" default="false"/>'+
                '<xsd:attribute name="stack_mode" type="enums.ScaleStackMode" default="none"/>'+
                '<xsd:attribute name="log_base" type="xsd:double" default="10"/>'+
                '<xsd:attribute name="names" type="xsd:string" default="name"/>'+
                '<xsd:attribute name="minimum" type="simple.DoubleOrNull" default="null"/>'+
                '<xsd:attribute name="maximum" type="simple.DoubleOrNull" default="null"/>'+
                '<xsd:attribute name="minimum_gap" type="xsd:double" default="0.1"/>'+
                '<xsd:attribute name="maximum_gap" type="xsd:double" default="0.1"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="Scale_list">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="scale" type="Scale"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="ScaleTicks">'+
                '<xsd:all>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="explicit" type="ScaleTicksValues"/>'+
                    '<xsd:element minOccurs="0" maxOccurs="1" name="names" type="OrdinalScaleNames"/>'+
                '</xsd:all>'+
                '<xsd:attribute name="mode" type="enums.ScatterTicksMode"/>'+
                '<xsd:attribute name="base" type="xsd:double" default="0"/>'+
                '<xsd:attribute name="count" type="xsd:unsignedInt"/>'+
                '<xsd:attribute name="min_count" type="xsd:unsignedInt" default="4"/>'+
                '<xsd:attribute name="max_count" type="xsd:unsignedInt" default="6"/>'+
                '<xsd:attribute name="interval" type="simple.ScaleInterval"/>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="OrdinalScaleValues">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="value" type="simple.Text"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="OrdinalScaleNames">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="name" type="simple.Text"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="ScaleTicksValues">'+
                '<xsd:sequence minOccurs="0" maxOccurs="unbounded">'+
                    '<xsd:element name="tick" type="simple.Text"/>'+
                '</xsd:sequence>'+
            '</xsd:complexType>'+
        ''+
            '<!-- Simple types -->'+
        ''+
            '<xsd:simpleType name="simple.ChartScaleRef">'+
                '<xsd:union>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="enums.ScaleTypes"/>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="simple.ScaleRef"/>'+
                    '</xsd:simpleType>'+
                '</xsd:union>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.ScaleInterval">'+
                '<xsd:union>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string">'+
                            '<xsd:pattern value="^-?P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?((\d+(\.\d+)?)S)?)?$"/>'+
                        '</xsd:restriction>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:double"/>'+
                    '</xsd:simpleType>'+
                '</xsd:union>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.Bool">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="true"/>'+
                    '<xsd:enumeration value="false"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.FillMode">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="true"/>'+
                    '<xsd:enumeration value="false"/>'+
                    '<xsd:enumeration value="stretch"/>'+
                    '<xsd:enumeration value="fitMax"/>'+
                    '<xsd:enumeration value="fit"/>'+
                    '<xsd:enumeration value="tile"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.BoolOrNull">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="true"/>'+
                    '<xsd:enumeration value="false"/>'+
                    '<xsd:enumeration value="null"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.StringOrBoolOrNull">'+
                '<xsd:union>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string">'+
                            '<xsd:enumeration value="true"/>'+
                            '<xsd:enumeration value="false"/>'+
                            '<xsd:enumeration value="null"/>'+
                        '</xsd:restriction>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string"/>'+
                    '</xsd:simpleType>'+
                '</xsd:union>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.Ratio">'+
                '<xsd:restriction base="xsd:double">'+
                    '<xsd:minInclusive value="0"/>'+
                    '<xsd:maxInclusive value="1"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.NumberOrPercent">'+
                '<xsd:union>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string">'+
                            '<xsd:pattern value="[0-9]*\.?[0-9]+%"/>'+
                        '</xsd:restriction>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:double"/>'+
                    '</xsd:simpleType>'+
                '</xsd:union>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.NumberOrPercentOrNull">'+
                '<xsd:union>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string">'+
                            '<xsd:pattern value="[0-9]*\.?[0-9]+%"/>'+
                        '</xsd:restriction>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string">'+
                            '<xsd:enumeration value="null"/>'+
                        '</xsd:restriction>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:double"/>'+
                    '</xsd:simpleType>'+
                '</xsd:union>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.MarkerType">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="circle"/>'+
                    '<xsd:enumeration value="square"/>'+
                    '<xsd:enumeration value="triangleUp"/>'+
                    '<xsd:enumeration value="diamond"/>'+
                    '<xsd:enumeration value="triangleDown"/>'+
                    '<xsd:enumeration value="cross"/>'+
                    '<xsd:enumeration value="diagonalCross"/>'+
                    '<xsd:enumeration value="star4"/>'+
                    '<xsd:enumeration value="star5"/>'+
                    '<xsd:enumeration value="star6"/>'+
                    '<xsd:enumeration value="star7"/>'+
                    '<xsd:enumeration value="star10"/>'+
                    '<xsd:enumeration value="true"/>'+
                    '<xsd:enumeration value="false"/>'+
                    '<xsd:enumeration value="null"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.HatchFill">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="true"/>'+
                    '<xsd:enumeration value="false"/>'+
                    '<xsd:enumeration value="null"/>'+
                    '<xsd:enumeration value="none"/>'+
                    '<xsd:enumeration value="backwardDiagonal"/>'+
                    '<xsd:enumeration value="forwardDiagonal"/>'+
                    '<xsd:enumeration value="horizontal"/>'+
                    '<xsd:enumeration value="vertical"/>'+
                    '<xsd:enumeration value="dashedBackwardDiagonal"/>'+
                    '<xsd:enumeration value="grid"/>'+
                    '<xsd:enumeration value="dashedForwardDiagonal"/>'+
                    '<xsd:enumeration value="dashedHorizontal"/>'+
                    '<xsd:enumeration value="dashedVertical"/>'+
                    '<xsd:enumeration value="diagonalCross"/>'+
                    '<xsd:enumeration value="diagonalBrick"/>'+
                    '<xsd:enumeration value="divot"/>'+
                    '<xsd:enumeration value="horizontalBrick"/>'+
                    '<xsd:enumeration value="verticalBrick"/>'+
                    '<xsd:enumeration value="checkerBoard"/>'+
                    '<xsd:enumeration value="confetti"/>'+
                    '<xsd:enumeration value="plaid"/>'+
                    '<xsd:enumeration value="solidDiamond"/>'+
                    '<xsd:enumeration value="zigZag"/>'+
                    '<xsd:enumeration value="weave"/>'+
                    '<xsd:enumeration value="percent05"/>'+
                    '<xsd:enumeration value="percent10"/>'+
                    '<xsd:enumeration value="percent20"/>'+
                    '<xsd:enumeration value="percent25"/>'+
                    '<xsd:enumeration value="percent30"/>'+
                    '<xsd:enumeration value="percent40"/>'+
                    '<xsd:enumeration value="percent50"/>'+
                    '<xsd:enumeration value="percent60"/>'+
                    '<xsd:enumeration value="percent70"/>'+
                    '<xsd:enumeration value="percent75"/>'+
                    '<xsd:enumeration value="percent80"/>'+
                    '<xsd:enumeration value="percent90"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.ScaleRef">'+
                '<xsd:restriction base="xsd:unsignedInt"/>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.DoubleOrNull">'+
                '<xsd:union>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:double"/>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string">'+
                            '<xsd:enumeration value="null"/>'+
                        '</xsd:restriction>'+
                    '</xsd:simpleType>'+
                '</xsd:union>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="simple.IntOrNull">'+
                '<xsd:union>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:unsignedInt"/>'+
                    '</xsd:simpleType>'+
                    '<xsd:simpleType>'+
                        '<xsd:restriction base="xsd:string">'+
                            '<xsd:enumeration value="null"/>'+
                        '</xsd:restriction>'+
                    '</xsd:simpleType>'+
                '</xsd:union>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:complexType name="simple.TextOrBullOrNull">'+
                '<xsd:simpleContent>'+
                    '<xsd:extension base="simple.StringOrBoolOrNull"/>'+
                '</xsd:simpleContent>'+
            '</xsd:complexType>'+
        ''+
            '<xsd:complexType name="simple.Text">'+
                '<xsd:simpleContent>'+
                    '<xsd:extension base="xsd:string"/>'+
                '</xsd:simpleContent>'+
            '</xsd:complexType>'+
        ''+
            '<!-- enums -->'+
        ''+
            '<xsd:simpleType name="enums.ChartTypes">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="area"/>'+
                    '<xsd:enumeration value="bar"/>'+
                    '<xsd:enumeration value="bubble"/>'+
                    '<xsd:enumeration value="bullet"/>'+
                    '<xsd:enumeration value="cartesian"/>'+
                    '<xsd:enumeration value="column"/>'+
                    '<xsd:enumeration value="finance"/>'+
                    '<xsd:enumeration value="line"/>'+
                    '<xsd:enumeration value="marker"/>'+
                    '<xsd:enumeration value="pie"/>'+
                    '<xsd:enumeration value="polar"/>'+
                    '<xsd:enumeration value="radar"/>'+
                    '<xsd:enumeration value="scatter"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.AnchorAndPosition">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="leftTop"/>'+
                    '<xsd:enumeration value="leftCenter"/>'+
                    '<xsd:enumeration value="leftBottom"/>'+
                    '<xsd:enumeration value="centerTop"/>'+
                    '<xsd:enumeration value="center"/>'+
                    '<xsd:enumeration value="centerBottom"/>'+
                    '<xsd:enumeration value="rightTop"/>'+
                    '<xsd:enumeration value="rightCenter"/>'+
                    '<xsd:enumeration value="rightBottom"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.Align">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="center"/>'+
                    '<xsd:enumeration value="left"/>'+
                    '<xsd:enumeration value="right"/>'+
                    '<xsd:enumeration value="top"/>'+
                    '<xsd:enumeration value="bottom"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.Layout">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="vertical"/>'+
                    '<xsd:enumeration value="horizontal"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.RadialGridLayout">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="radial"/>'+
                    '<xsd:enumeration value="circuit"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.Orientation">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="left"/>'+
                    '<xsd:enumeration value="right"/>'+
                    '<xsd:enumeration value="top"/>'+
                    '<xsd:enumeration value="bottom"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.Sort">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="asc"/>'+
                    '<xsd:enumeration value="desc"/>'+
                    '<xsd:enumeration value="none"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.MarkerType">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="circle"/>'+
                    '<xsd:enumeration value="square"/>'+
                    '<xsd:enumeration value="triangleUp"/>'+
                    '<xsd:enumeration value="diamond"/>'+
                    '<xsd:enumeration value="triangleDown"/>'+
                    '<xsd:enumeration value="cross"/>'+
                    '<xsd:enumeration value="diagonalCross"/>'+
                    '<xsd:enumeration value="star4"/>'+
                    '<xsd:enumeration value="star5"/>'+
                    '<xsd:enumeration value="star6"/>'+
                    '<xsd:enumeration value="star7"/>'+
                    '<xsd:enumeration value="star10"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.LabelsOverlapMode">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="noOverlap"/>'+
                    '<xsd:enumeration value="allowOverlap"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.BackgroundCornerTypes">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="none"/>'+
                    '<xsd:enumeration value="round"/>'+
                    '<xsd:enumeration value="cut"/>'+
                    '<xsd:enumeration value="roundInner"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.SidePosition">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="inside"/>'+
                    '<xsd:enumeration value="outside"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.ScaleStackMode">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="none"/>'+
                    '<xsd:enumeration value="value"/>'+
                    '<xsd:enumeration value="percent"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.ScatterTicksMode">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="linear"/>'+
                    '<xsd:enumeration value="log"/>'+
                    '<xsd:enumeration value="logarithmic"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.SeriesTypes">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="area"/>'+
                    '<xsd:enumeration value="bar"/>'+
                    '<xsd:enumeration value="bubble"/>'+
                    '<xsd:enumeration value="candlestick"/>'+
                    '<xsd:enumeration value="column"/>'+
                    '<xsd:enumeration value="line"/>'+
                    '<xsd:enumeration value="marker"/>'+
                    '<xsd:enumeration value="ohlc"/>'+
                    '<xsd:enumeration value="rangeArea"/>'+
                    '<xsd:enumeration value="rangeBar"/>'+
                    '<xsd:enumeration value="rangeColumn"/>'+
                    '<xsd:enumeration value="rangeSplineArea"/>'+
                    '<xsd:enumeration value="rangeStepArea"/>'+
                    '<xsd:enumeration value="spline"/>'+
                    '<xsd:enumeration value="splineArea"/>'+
                    '<xsd:enumeration value="stepArea"/>'+
                    '<xsd:enumeration value="stepLine"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.HatchFill">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="backwardDiagonal"/>'+
                    '<xsd:enumeration value="forwardDiagonal"/>'+
                    '<xsd:enumeration value="horizontal"/>'+
                    '<xsd:enumeration value="vertical"/>'+
                    '<xsd:enumeration value="dashedBackwardDiagonal"/>'+
                    '<xsd:enumeration value="grid"/>'+
                    '<xsd:enumeration value="dashedForwardDiagonal"/>'+
                    '<xsd:enumeration value="dashedHorizontal"/>'+
                    '<xsd:enumeration value="dashedVertical"/>'+
                    '<xsd:enumeration value="diagonalCross"/>'+
                    '<xsd:enumeration value="diagonalBrick"/>'+
                    '<xsd:enumeration value="divot"/>'+
                    '<xsd:enumeration value="horizontalBrick"/>'+
                    '<xsd:enumeration value="verticalBrick"/>'+
                    '<xsd:enumeration value="checkerBoard"/>'+
                    '<xsd:enumeration value="confetti"/>'+
                    '<xsd:enumeration value="plaid"/>'+
                    '<xsd:enumeration value="solidDiamond"/>'+
                    '<xsd:enumeration value="zigZag"/>'+
                    '<xsd:enumeration value="weave"/>'+
                    '<xsd:enumeration value="percent05"/>'+
                    '<xsd:enumeration value="percent10"/>'+
                    '<xsd:enumeration value="percent20"/>'+
                    '<xsd:enumeration value="percent25"/>'+
                    '<xsd:enumeration value="percent30"/>'+
                    '<xsd:enumeration value="percent40"/>'+
                    '<xsd:enumeration value="percent50"/>'+
                    '<xsd:enumeration value="percent60"/>'+
                    '<xsd:enumeration value="percent70"/>'+
                    '<xsd:enumeration value="percent75"/>'+
                    '<xsd:enumeration value="percent80"/>'+
                    '<xsd:enumeration value="percent90"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.ScaleTypes">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="linear"/>'+
                    '<xsd:enumeration value="log"/>'+
                    '<xsd:enumeration value="dateTime"/>'+
                    '<xsd:enumeration value="ordinal"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.ScatterScaleTypes">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="linear"/>'+
                    '<xsd:enumeration value="log"/>'+
                    '<xsd:enumeration value="dateTime"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.TextWrap">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="noWrap"/>'+
                    '<xsd:enumeration value="byLetter"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.HAlign">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="left"/>'+
                    '<xsd:enumeration value="start"/>'+
                    '<xsd:enumeration value="center"/>'+
                    '<xsd:enumeration value="end"/>'+
                    '<xsd:enumeration value="right"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.VAlign">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="top"/>'+
                    '<xsd:enumeration value="middle"/>'+
                    '<xsd:enumeration value="center"/>'+
                    '<xsd:enumeration value="bottom"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.FontDecoration">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="blink"/>'+
                    '<xsd:enumeration value="line-through"/>'+
                    '<xsd:enumeration value="overline"/>'+
                    '<xsd:enumeration value="underline"/>'+
                    '<xsd:enumeration value="none"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.FontVariant">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="normal"/>'+
                    '<xsd:enumeration value="small-caps"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.FontStyle">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="normal"/>'+
                    '<xsd:enumeration value="italic"/>'+
                    '<xsd:enumeration value="oblique"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.TextDirection">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="ltr"/>'+
                    '<xsd:enumeration value="rtl"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.LineJoin">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="miter"/>'+
                    '<xsd:enumeration value="round"/>'+
                    '<xsd:enumeration value="bevel"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<xsd:simpleType name="enums.LineCap">'+
                '<xsd:restriction base="xsd:string">'+
                    '<xsd:enumeration value="butt"/>'+
                    '<xsd:enumeration value="round"/>'+
                    '<xsd:enumeration value="square"/>'+
                '</xsd:restriction>'+
            '</xsd:simpleType>'+
        ''+
            '<!-- Common attribute groups -->'+
        ''+
            '<xsd:attributeGroup name="attrs.VisualBase">'+
                '<xsd:attribute name="enabled" type="simple.BoolOrNull"/>'+
                '<xsd:attribute name="z_index" type="xsd:int"/>'+
            '</xsd:attributeGroup>'+
        ''+
            '<xsd:attributeGroup name="attrs.Bounds">'+
                '<xsd:attribute name="left" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="right" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="top" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="bottom" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="width" type="simple.NumberOrPercent"/>'+
                '<xsd:attribute name="height" type="simple.NumberOrPercent"/>'+
            '</xsd:attributeGroup>'+
        ''+
            '<xsd:attributeGroup name="attrs.TextSettings">'+
                '<xsd:attribute name="font_size" type="xsd:string"/>'+
                '<xsd:attribute name="font_family" type="xsd:string"/>'+
                '<xsd:attribute name="font_color" type="xsd:string"/>'+
                '<xsd:attribute name="font_opacity" type="simple.Ratio"/>'+
                '<xsd:attribute name="font_decoration" type="enums.FontDecoration"/>'+
                '<xsd:attribute name="font_style" type="enums.FontStyle"/>'+
                '<xsd:attribute name="font_variant" type="enums.FontVariant"/>'+
                '<xsd:attribute name="font_weight" type="xsd:string"/>'+
                '<xsd:attribute name="letter_spacing" type="xsd:string"/>'+
                '<xsd:attribute name="text_direction" type="enums.TextDirection"/>'+
                '<xsd:attribute name="line_height" type="xsd:string"/>'+
                '<xsd:attribute name="text_indent" type="xsd:double"/>'+
                '<xsd:attribute name="v_align" type="enums.VAlign"/>'+
                '<xsd:attribute name="h_align" type="enums.HAlign"/>'+
                '<xsd:attribute name="text_wrap" type="enums.TextWrap"/>'+
                '<xsd:attribute name="text_overflow" type="xsd:string"/>'+
                '<xsd:attribute name="selectable" type="simple.Bool" default="false"/>'+
                '<xsd:attribute name="disable_pointer_events" type="simple.Bool" default="true"/>'+
                '<xsd:attribute name="use_html" type="simple.Bool" default="false"/>'+
            '</xsd:attributeGroup>'+
        ''+
        '</xsd:schema>';
}
