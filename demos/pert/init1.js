/// data
var data = [
  {id: 'A', duration: 3, name: 'Aasdfasdf'},
  {id: 'B', duration: 2, name: 'Basdf'},
  {id: 'C', duration: 10, name: 'Cdfdfdfd'},
  {id: 'D', duration: 2, name: 'Dvfvfvfvfvfv'},
  {id: 'E', duration: 4, name: 'Easdvsdva'},
  {id: 'F', duration: 5, name: 'Faaa', dependsOn: ['A', 'B', 'C']},
  {id: 'G', duration: 2, name: 'Gasdf', dependsOn: ['D', 'E']},
  {id: 'H', duration: 1, name: 'Hw33434343', dependsOn: ['F']},
  {id: 'I', duration: 7, name: 'Ivvv', dependsOn: ['F', 'G', 'E']}
];

//var deps = [
//  {from: 'A', to: 'F'},
//  {from: 'B', to: 'F'},
//  {from: 'C', to: 'F'},
//  {from: 'D', to: 'G'},
//  {from: 'E', to: 'G'},
//  {from: 'F', to: 'H'},
//  {from: 'F', to: 'I'},
//  {from: 'G', to: 'I'}
//];


///////// 6 parallel works data
//var data = [
//  {id: 'A', name: 'A', duration: 3},
//  {id: 'B', name: 'B', duration: 4},
//  {id: 'C', name: 'C', duration: 3},
//  {id: 'D', name: 'D', duration: 1},
//  {id: 'E', name: 'E', duration: 3},
//  {id: 'F', name: 'F', duration: 3}
//];


/////// data wikipedia data
// var data = [
//  {id: 'A', name: 'A', duration: 3},
//  {id: 'B', name: 'B', duration: 4},
//  {id: 'C', name: 'C', duration: 3, dependsOn: ['B']},
//  {id: 'D', name: 'D', duration: 1, dependsOn: ['A']},
//  {id: 'E', name: 'E', duration: 3, dependsOn: ['A']},
//  {id: 'F', name: 'F', duration: 5, dependsOn: ['D']}
// ];


///////// data one more
//var data = [
//  {id: 'A', name: 'A', duration: 3},
//  {id: 'B', name: 'B', duration: 4},
//  {id: 'C', name: 'C', duration: 3, dependsOn: ['A', 'B']},
//  {id: 'D', name: 'D', duration: 1, dependsOn: ['C']},
//  {id: 'E', name: 'E', duration: 3, dependsOn: ['C']}
//];


// //// Saukh data
// var data = [
//  {id: 'SQ', name: 'SQ'},
//  {id: 'SA', name: 'SA'},
//  {id: 'SD', name: 'SD'},
//  {id: 'SF', name: 'SF'},
//  {id: 'QB', name: 'QB', dependsOn: ['SQ']},
//  {id: 'QD', name: 'QD', dependsOn: ['SQ']},
//  {id: 'AC', name: 'AC', dependsOn: ['SA']},
//  {id: 'AG', name: 'AG', dependsOn: ['SA']},
//  {id: 'BD', name: 'BD', dependsOn: ['QB']},
//  {id: 'DE', name: 'DE', dependsOn: ['SD', 'QD', 'BD']},
//  {id: 'EF', name: 'EF', dependsOn: ['DE']},
//  {id: 'DF', name: 'DF', dependsOn: ['SD', 'QD', 'BD']},
//  {id: 'CF', name: 'CF', dependsOn: ['AC']},
//  {id: 'GF', name: 'GF', dependsOn: ['AG']}
// ];


// ///// cut edges test data
// var data = [
//   {id: 'SF', duration: 300, name: 'SF'},
//   {id: 'SA', duration: 2, name: 'SA'},
//   {id: 'AB', duration: 10, name: 'AB', dependsOn: ['SA']},
//   {id: 'BC', duration: 10, name: 'BC', dependsOn: ['AB']},
//   {id: 'CF', duration: 10, name: 'CF', dependsOn: ['BC']}
// ];


// two faces case.
// var data = [
//   {id: 'SA', duration: 300, name: 'SA'},
//   {id: 'AB', duration: 300, name: 'AB', dependsOn: ['SA']},
//   {id: 'BF', duration: 300, name: 'BF', dependsOn: ['AB']}
// ];


// //// Planar crash data
// var data = [
//   {id: 'A', name: 'A'},
//   {id: 'B', name: 'B'},
//   {id: 'C', name: 'C', dependsOn: ['A', 'B']},
//   {id: 'D', name: 'D', dependsOn: ['A', 'B']}
// ];


// //// Planar crash data
// var data = [
//   {id: 'A', name: 'A'},
//   {id: 'B', name: 'B'},
//   {id: 'C', name: 'C', dependsOn: ['A', 'B']},
//   {id: 'D', name: 'D', dependsOn: ['A', 'B']}
// ];

anychart.onDocumentReady(function() {
  anychart.theme(anychart.themes.defaultTheme);

  //var treeData = anychart.data.tree(data, anychart.enums.TreeFillingMethod.AS_TABLE, deps);
  var treeData = anychart.data.tree(data, anychart.enums.TreeFillingMethod.AS_TABLE);
  chart = anychart.pert();
  chart.container('container');
  chart.title('Pert 1');
  chart.data(treeData);

  // chart.criticalPath().milestones().fill(function() {
  //   // debugger;
  //   if (this['creator']) {
  //     var name = this['creator'].get('name');
  //     return 'red';
  //   } else {
  //     return this['isStart'] ? 'blue' : 'green';
  //   }
  // });



  // chart.milestones().shape('rhomb');
  // chart.criticalPath().milestones().shape('rect');

  // chart.milestones().size(30);
  // chart.criticalPath().milestones().size(50);
  // chart.milestones().shape(anychart.enums.MilestoneShape.RHOMBUS);
  // chart.milestones().shape(anychart.enums.MilestoneShape.RHOMBUS);

  // chart.criticalPath().milestones().stroke('black');
  // chart.milestones().stroke('2 black');
  // chart.milestones().selectStroke('5 green');

  // chart.tasks().selectStroke('2 green');
  // chart.tasks().hoverStroke('yellow');
  // chart.criticalPath().tasks().selectStroke('3 purple');
  // chart.criticalPath().tasks().hoverStroke('5 blue');

  chart.draw();


  // chart.milestones().labels().fontSize(14);
  // chart.milestones().hoverLabels().fontColor('green');
  // chart.milestones().selectLabels().fontColor('red');
  // chart.criticalPath().milestones().labels().fontWeight('bold');
  // chart.criticalPath().milestones().hoverLabels().fontDecoration('underline');
  // chart.criticalPath().milestones().selectLabels().fontStyle('italic');
  //
  //
  // chart.tasks().upperLabels().fontSize(14);
  // chart.tasks().lowerLabels().fontSize(14);
  // chart.tasks().hoverUpperLabels().fontColor('green');
  // chart.tasks().hoverLowerLabels().fontColor('green');
  // chart.tasks().selectUpperLabels().fontColor('red');
  // chart.tasks().selectLowerLabels().fontColor('red');
  // chart.criticalPath().tasks().upperLabels().fontWeight('bold');
  // chart.criticalPath().tasks().lowerLabels().fontWeight('bold');
  // chart.criticalPath().tasks().hoverUpperLabels().fontDecoration('underline');
  // chart.criticalPath().tasks().hoverLowerLabels().fontDecoration('underline');
  // chart.criticalPath().tasks().selectUpperLabels().fontStyle('italic');
  // chart.criticalPath().tasks().selectLowerLabels().fontStyle('italic');


  // chart.tasks().color('red');
  //
  //
  // chart.criticalPath().tasks().color('blue');

  // chart.milestones().tooltip().background().fill('green');
  // chart.milestones().tooltip().background().fill('green');
  // chart.milestones().tooltip().textFormatter(function() {return 'Mil'});
  // chart.criticalPath().milestones().tooltip().textFormatter(function() {return 'Crit Mil'});
  // chart.tasks().tooltip().textFormatter(function() {return 'Task'});
  // chart.criticalPath().tasks().tooltip().textFormatter(function() {return 'Crit task'});
});


function debugInfo() {
  var milestonesMap = chart.milestonesMap_;
  for (var i in milestonesMap) {
    var j;
    var field;
    var mil = milestonesMap[i];
    var res = i + ', ' + mil.label + '\nmSuccessors: ';

    for (j = 0; j < mil.mSuccessors.length; j++) {
      field = mil.mSuccessors[j];
      res += field.label + '; ';
    }

    res += '\nmPredecessors: ';
    for (j = 0; j < mil.mPredecessors.length; j++) {
      field = mil.mPredecessors[j];
      res += field.label + '; ';
    }

    res += '\nsuccessors: ';
    for (j = 0; j < mil.successors.length; j++) {
      field = mil.successors[j];
      res += field.get('name') + '; ';
    }

    res += '\npredecessors: ';
    for (j = 0; j < mil.predecessors.length; j++) {
      field = mil.predecessors[j];
      res += field.get('name') + '; ';
    }

    console.log(res);
  }
  console.log('\n\n');
}



//var data = [
//  {id: 2, name: 'Item 2', dependsOn: [0, 1]},
//  {id: 0, name: 'Item 0'},
//  {id: 1, name: 'Item 1'},
//  {id: 3, name: 'Item 3', dependsOn: [2]},
//  {id: 4, name: 'Item 4', dependsOn: [2]}
//];


//var data = [
//  {id: 2, duration: 1, name: 'Item 2', dependsOn: [0, 1]},
//  {id: 0, duration: 1, name: 'Item 0'},
//  {id: 1, duration: 1, name: 'Item 1'},
//  {id: 3, duration: 1, name: 'Item 3', dependsOn: [2]},
//  {id: 4, duration: 1, name: 'Item 4', dependsOn: [2]}
//];
//
//var deps = [
//  {from: 0, to: 2},
//  {from: 1, to: 2},
//  {from: 2, to: 3},
//  {from: 2, to: 4}
//];
//




