anychart.onDocumentReady(function() {
  var data = [
    {id: 1, name: "Phase 1 - Strategic Plan", progressValue: "14%", actualStart: 951350400000, actualEnd: 951609600000},
    {id: 2, name: "Self-Assessment", parent: 1, progressValue: "25%", actualStart: 951350400000, actualEnd: 951782400000},
    {id: 3, name: "Define business vision", parent: 2, progressValue: "0%", actualStart: 951408000000, actualEnd: 951440400000, connectTo: 4, connectorType: "FinishStart"},
    {id: 4, name: "Identify available skills, information and support", parent: 2, progressValue: "0%", actualStart: 951494400000, actualEnd: 951526800000, connectTo: "5", connectorType: "FinishStart"},
    {id: 5, name: "Decide whether to proceed", parent: 2, progressValue: "0%", actualStart: 951609600000, actualEnd: 951696000000, connectTo: "6", connectorType: "FinishStart"},
    {id: 6, name: "Define the Opportunity", parent: 1, progressValue: "27%", actualStart: 951696000000, actualEnd: 951782400000},
    {id: 7, name: "Research the market and competition", parent: 6, progressValue: "0%", actualStart: 951523200000, actualEnd: 951609600000, connectTo: "8", connectorType: "FinishStart"}
  ];
  chart = anychart.ganttProject();
  chart.data(data, "asTable");
  chart.container('container').draw();
});
