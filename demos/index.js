anychart.onDocumentReady(function() {
  document.getElementById('container').style.display = 'none';
  chart = genChart();
  chart1 = genChart();
  chart.container('container').draw();
  debugger;
  chart.fitToTask('1');
  document.getElementById('container').style.display = '';
});

function genChart() {
  var chart;
  // ------- CODE HERE START

  raw = [
    {
      "id": "1",
      "name": "1",
      "progressValue": "14%",
      'actualStart': Date.UTC(1999, 1, 24),
      "actualEnd": Date.UTC(2000, 2, 28)
    },
    {
      "id": "2",
      "name": "2",
      parent: "1",
      "progressValue": "25%",
      'actualStart': Date.UTC(2000, 1, 24),
      "actualEnd": Date.UTC(2000, 2, 2)
    },
    {
      "id": "3",
      "name": "3",
      parent: "2",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 1, 24),
      "actualEnd": Date.UTC(2000, 1, 25),
      "connectTo": "4",
      "connectorType": "FinishStart"
    },
    {
      "id": "4",
      "name": "4",
      parent: "2",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 1, 25),
      "actualEnd": Date.UTC(2000, 1, 26),
      "connectTo": "5",
      "connectorType": "FinishStart"
    },
    {
      "id": "5",
      "name": "5",
      parent: "2",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 1, 28),
      "actualEnd": Date.UTC(2000, 1, 29),
      "connectTo": "7",
      "connectorType": "FinishStart"
    },
    {
      "id": "6",
      "name": "6",
      parent: "1",
      "progressValue": "27%",
      'actualStart': Date.UTC(2000, 1, 29),
      "actualEnd": Date.UTC(2000, 2, 14)
    },
    {
      "id": "7",
      "name": "7",
      parent: "6",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 1, 29),
      "actualEnd": Date.UTC(2000, 2, 1),
      "connectTo": "8",
      "connectorType": "FinishStart"
    },
    {
      "id": "8",
      "name": "8",
      parent: "6",
      "progressValue": "60%",
      'actualStart': Date.UTC(2000, 2, 1),
      "actualEnd": Date.UTC(2000, 2, 8),
      "connectTo": "9",
      "connectorType": "FinishStart"
    },
    {
      "id": "9",
      "name": "9",
      parent: "6",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 2, 8),
      "actualEnd": Date.UTC(2000, 2, 8),
      "connectTo": "10",
      "connectorType": "FinishStart"
    },
    {
      "id": "10",
      "name": "10",
      parent: "6",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 2, 10),
      "actualEnd": Date.UTC(2000, 2, 14),
      "connectTo": "12",
      "connectorType": "FinishStart"
    },
    {
      "id": "11",
      "name": "11",
      parent: "1",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 2, 14),
      "actualEnd": Date.UTC(2000, 2, 18)
    },
    {
      "id": "12",
      "name": "12",
      parent: "11",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 2, 14),
      "actualEnd": Date.UTC(2000, 2, 15),
      "connectTo": "17",
      "connectorType": "FinishStart"
    },
    {
      "id": "13",
      "name": "13",
      parent: "11",
      "progressValue": "0%",
      'actualStart': Date.UTC(2000, 2, 15),
      "actualEnd": Date.UTC(2000, 2, 16),
      "connectTo": "14",
      "connectorType": "FinishStart"
    }
  ];
  tree = anychart.data.tree(raw, 'asTable');
  chart = anychart.ganttProject();
  chart.data(tree);
  chart.xScale().softMinimum(Date.UTC(1998, 0, 1));
  chart.xScale().softMaximum(Date.UTC(2001, 4, 1));

  // ------- CODE HERE END
  return chart;
}