anychart.onDocumentReady(function () {
  var data = [
    {id: "1", duration: 1, name: "Task A"},
    {id: "2", duration: 3, name: "Task B"},
    {id: "3", duration: 3, name: "Task C"},
    {id: "4", duration: 1, name: "Task D"},
    {id: "5", duration: 2, name: "Task AD", dependsOn: ["1", "4"]},
    {id: "6", duration: 2, name: "Task BC", dependsOn: ["2", "3"]}
  ];

  chart = anychart.pert();
  chart.data(data, "asTable");

  var currentMilestones = chart.milestones();

  // Disable selectLabels.
  currentMilestones.selectLabels(false);


  chart.title("Disable milestones selectLabels.");
  chart.container("container");
  chart.draw();
});