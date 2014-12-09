$(function() {
  $(".column").sortable({
    connectWith: ".column",
    handle: ".portlet-header",
    cancel: ".portlet-toggle",
    placeholder: "portlet-placeholder ui-corner-all"
  });
  $(".portlet")
      .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
      .find(".portlet-header")
      .addClass("ui-widget-header ui-corner-all")
      .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");
  $(".portlet-toggle").click(function() {
    var icon = $(this);
    icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
    icon.closest(".portlet").find(".portlet-content").toggle();
  });
});

var chart;

anychart.onDocumentReady(function() {
  chart = anychart.pie([
    ['Product A', 1222],
    ['Product B', 2431],
    ['Product C', 3624],
    ['Product D', 5243],
    ['Product E', 8813],
    ['Product F', 450],
    ['Product G', 360],
    ['Product H', 240],
    ['Product I', 420]
  ]);

  chart.container('container');
  chart.legend().enabled(false);
  chart.background().fill('lime');
  chart.draw();
});

function TryToFix() {
  chart.container('container');
}