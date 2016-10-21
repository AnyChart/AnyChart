var chart;

anychart.onDocumentReady(function() {
  var treeData = anychart.data.tree(data, anychart.enums.TreeFillingMethod.AS_TABLE);
  chart = anychart.ganttProject();
  chart.container('container');
  chart.bounds(0, 0, '100%', '100%');
  chart.data(treeData);

  var dataGrid = chart.dataGrid();
  dataGrid.column(1).width(400);

  chart.splitterPosition(300);

  chart.draw();

  chart.zoomTo(951350400000, 954201600000);

  chart.fitAll();
  chart.collapseAll();

});

var data = [
  {"id": "1", "name": "Phase 1 - Strategic Plan", "progressValue": "14%", "actualStart": 951350400000, "actualEnd": 954201600000},
  {"id": "2", "name": "Self-Assessment", parent: "1", "progressValue": "25%", "actualStart": 951350400000, "actualEnd": 951955200000},
  {"id": "3", "name": "Define business vision", parent: "2", "progressValue": "0%", "actualStart": 951408000000, "actualEnd": 951440400000, "connectTo": "4", "connectorType": "FinishStart"},
  {"id": "4", "name": "Identify available skills, information and support", parent: "2", "progressValue": "0%", "actualStart": 951494400000, "actualEnd": 951526800000, "connectTo": "5", "connectorType": "FinishStart"},
  {"id": "5", "name": "Decide whether to proceed", parent: "2", "progressValue": "0%", "actualStart": 951753600000, "actualEnd": 951786000000, "connectTo": "7", "connectorType": "FinishStart"},
  {"id": "6", "name": "Define the Opportunity", parent: "1", "progressValue": "27%", "actualStart": 951782400000, "actualEnd": 952992000000},
  {"id": "7", "name": "Research the market and competition", parent: "6", "progressValue": "0%", "actualStart": 951840000000, "actualEnd": 951872400000, "connectTo": "8", "connectorType": "FinishStart"},
  {"id": "8", "name": "Interview owners of similar businesses", parent: "6", "progressValue": "60%", "actualStart": 951868800000, "actualEnd": 952473600000, "connectTo": "9", "connectorType": "FinishStart"},
  {"id": "9", "name": "Identify needed resources", parent: "6", "progressValue": "0%", "actualStart": 952531200000, "actualEnd": 952650000000, "connectTo": "10", "connectorType": "FinishStart"},
  {"id": "10", "name": "Identify operating cost elements", parent: "6", "progressValue": "0%", "actualStart": 952704000000, "actualEnd": 952995600000, "connectTo": "12", "connectorType": "FinishStart"},
  {"id": "11", "name": "Evaluate Business Approach", parent: "1", "progressValue": "0%", "actualStart": 953049600000, "actualEnd": 953341200000},
  {"id": "12", "name": "Define new entity requirements", parent: "11", "progressValue": "0%", "actualStart": 953049600000, "actualEnd": 953082000000, "connectTo": "17", "connectorType": "FinishStart"},
  {"id": "13", "name": "Identify on-going business purchase opportunities", parent: "11", "progressValue": "0%", "actualStart": 953136000000, "actualEnd": 953168400000, "connectTo": "14", "connectorType": "FinishStart"},
  {"id": "14", "name": "Research franchise possibilities", parent: "11", "progressValue": "0%", "actualStart": 953222400000, "actualEnd": 953254800000, "connectTo": "15", "connectorType": "FinishStart"},
  {"id": "15", "name": "Summarize business approach", parent: "11", "progressValue": "0%", "actualStart": 953308800000, "actualEnd": 953341200000, "connectTo": "21", "connectorType": "FinishStart"},
  {"id": "16", "name": "Evaluate Potential Risks and Rewards", parent: "1", "progressValue": "0%", "actualStart": 953136000000, "actualEnd": 953946000000},
  {"id": "17", "name": "Assess market size and stability", parent: "16", "progressValue": "0%", "actualStart": 953136000000, "actualEnd": 953254800000, "connectTo": "18", "connectorType": "FinishStart"},
  {"id": "18", "name": "Estimate the competition", parent: "16", "progressValue": "0%", "actualStart": 953308800000, "actualEnd": 953341200000, "connectTo": "19", "connectorType": "FinishStart"},
  {"id": "19", "name": "Assess needed resource availability", parent: "16", "progressValue": "0%", "actualStart": 953740800000, "actualEnd": 953859600000, "connectTo": "20", "connectorType": "FinishStart"},
  {"id": "20", "name": "Evaluate realistic initial market share", parent: "16", "progressValue": "0%", "actualStart": 953913600000, "actualEnd": 953946000000},
  {"id": "21", "name": "Determine financial requirements", parent: "16", "progressValue": "0%", "actualStart": 953568000000, "actualEnd": 953686800000, "connectTo": "22", "connectorType": "FinishStart"},
  {"id": "22", "name": "Review personal suitability", parent: "16", "progressValue": "0%", "actualStart": 953740800000, "actualEnd": 953773200000, "connectTo": "23", "connectorType": "FinishStart"},
  {"id": "23", "name": "Evaluate initial profitability", parent: "16", "progressValue": "0%", "actualStart": 953827200000, "actualEnd": 953859600000, "connectTo": "24", "connectorType": "FinishStart"},
  {"id": "24", "name": "Review and modify the strategic plan", parent: "1", "progressValue": "0%", "actualStart": 953913600000, "actualEnd": 954208800000, "connectTo": "25", "connectorType": "FinishStart"},
  {"id": "25", "name": "Confirm decision to proceed", parent: "1", "progressValue": "0%", "actualStart": 954208800000, "actualEnd": 954208800000, "connectTo": "28", "connectorType": "FinishStart"},
  {"id": "26", "name": "Phase 2 - Define the Business Opportunity", "progressValue": "19%", "actualStart": 954201600000, "actualEnd": 957312000000},
  {"id": "27", "name": "Define the Market", parent: "26", "progressValue": "28%", "actualStart": 954201600000, "actualEnd": 955670400000},
  {"id": "28", "name": "Access available information", parent: "27", "progressValue": "0%", "actualStart": 954262800000, "actualEnd": 954295200000, "connectTo": "35", "connectorType": "StartStart"},
  {"id": "29", "name": "Create market analysis plan", parent: "27", "progressValue": "0%", "actualStart": 954349200000, "actualEnd": 954468000000},
  {"id": "30", "name": "Implement market analysis plan", parent: "27", "progressValue": "40%", "actualStart": 954460800000, "actualEnd": 955065600000, "connectTo": "31", "connectorType": "FinishStart"},
  {"id": "31", "name": "Identify competition", parent: "27", "progressValue": "60%", "actualStart": 955065600000, "actualEnd": 955411200000, "connectTo": "32", "connectorType": "FinishStart"},
  {"id": "32", "name": "Summarize the market", parent: "27", "progressValue": "0%", "actualStart": 955472400000, "actualEnd": 955591200000, "connectTo": "33", "connectorType": "FinishStart"},
  {"id": "33", "name": "Identify target market niche", parent: "27", "progressValue": "0%", "actualStart": 955645200000, "actualEnd": 955677600000, "connectTo": "35", "connectorType": "StartStart"},
  {"id": "34", "name": "Identify Needed Materials and Supplies", parent: "26", "progressValue": "0%", "actualStart": 955645200000, "actualEnd": 956368800000},
  {"id": "35", "name": "Select a business approach (from 'Evaluate Business Approach' above)", parent: "34", "progressValue": "0%", "actualStart": 955645200000, "actualEnd": 955764000000, "connectTo": "36", "connectorType": "FinishStart"},
  {"id": "36", "name": "Identify management staff resources", parent: "34", "progressValue": "0%", "actualStart": 955990800000, "actualEnd": 956023200000, "connectTo": "37", "connectorType": "FinishStart"},
  {"id": "37", "name": "Identify staffing requirements", parent: "34", "progressValue": "0%", "actualStart": 956077200000, "actualEnd": 956109600000, "connectTo": "38", "connectorType": "FinishStart"},
  {"id": "38", "name": "Identify needed raw materials", parent: "34", "progressValue": "0%", "actualStart": 956163600000, "actualEnd": 956196000000, "connectTo": "39", "connectorType": "FinishStart"},
  {"id": "39", "name": "Identify needed utilities", parent: "34", "progressValue": "0%", "actualStart": 956250000000, "actualEnd": 956282400000, "connectTo": "40", "connectorType": "FinishStart"},
  {"id": "40", "name": "Summarize operating expenses and financial projections", parent: "34", "progressValue": "0%", "actualStart": 956336400000, "actualEnd": 956368800000, "connectTo": "42", "connectorType": "FinishStart"},
  {"id": "41", "name": "Evaluate Potential Risks and Rewards", parent: "26", "progressValue": "17%", "actualStart": 956534400000, "actualEnd": 957225600000},
  {"id": "42", "name": "Assess market size and stability", parent: "41", "progressValue": "50%", "actualStart": 956534400000, "actualEnd": 956707200000, "connectTo": "43", "connectorType": "FinishStart"},
  {"id": "43", "name": "Assess needed resources availability", parent: "41", "progressValue": "0%", "actualStart": 956768400000, "actualEnd": 956887200000, "connectTo": "44", "connectorType": "FinishStart"},
  {"id": "44", "name": "Forecast financial returns", parent: "41", "progressValue": "0%", "actualStart": 956941200000, "actualEnd": 957232800000, "connectTo": "45", "connectorType": "FinishStart"},
  {"id": "45", "name": "Review and modify the business opportunity", parent: "26", "progressValue": "0%", "actualStart": 957286800000, "actualEnd": 957319200000, "connectTo": "46", "connectorType": "FinishStart"},
  {"id": "46", "name": "Confirm decision to proceed", parent: "26", "progressValue": "0%", "actualStart": 957319200000, "actualEnd": 957319200000, "connectTo": "49", "connectorType": "FinishStart"},
  {"id": "47", "name": "Phase 3 - Plan for Action", "progressValue": "17%", "actualStart": 957312000000, "actualEnd": 959817600000},
  {"id": "48", "name": "Develop Detailed 5-Year Business Plan", parent: "47", "progressValue": "17%", "actualStart": 957312000000, "actualEnd": 959817600000},
  {"id": "49", "name": "Describe the vision and opportunity", parent: "48", "progressValue": "0%", "actualStart": 957373200000, "actualEnd": 957405600000, "connectTo": "50", "connectorType": "FinishStart"},
  {"id": "50", "name": "List assumptions", parent: "48", "progressValue": "0%", "actualStart": 957459600000, "actualEnd": 957492000000, "connectTo": "51", "connectorType": "FinishStart"},
  {"id": "51", "name": "Describe the market", parent: "48", "progressValue": "0%", "actualStart": 957546000000, "actualEnd": 957578400000, "connectTo": "52", "connectorType": "FinishStart"},
  {"id": "52", "name": "Describe the new business", parent: "48", "progressValue": "0%", "actualStart": 957805200000, "actualEnd": 957837600000, "connectTo": "53", "connectorType": "FinishStart"},
  {"id": "53", "name": "Describe strengths, weaknesses, assets and threats", parent: "48", "progressValue": "0%", "actualStart": 957891600000, "actualEnd": 957924000000, "connectTo": "54", "connectorType": "FinishStart"},
  {"id": "54", "name": "Estimate sales volume during startup period", parent: "48", "progressValue": "0%", "actualStart": 957978000000, "actualEnd": 958010400000, "connectTo": "55", "connectorType": "FinishStart"},
  {"id": "55", "name": "Forecast operating costs", parent: "48", "progressValue": "0%", "actualStart": 958064400000, "actualEnd": 958096800000, "connectTo": "56", "connectorType": "FinishStart"},
  {"id": "56", "name": "Establish pricing strategy", parent: "48", "progressValue": "0%", "actualStart": 958150800000, "actualEnd": 958183200000, "connectTo": "57", "connectorType": "FinishStart"},
  {"id": "57", "name": "Forecast revenue", parent: "48", "progressValue": "0%", "actualStart": 958410000000, "actualEnd": 958442400000, "connectTo": "58", "connectorType": "FinishStart"},
  {"id": "58", "name": "X", parent: "48", "progressValue": "0%", "actualStart": 958496400000, "actualEnd": 958615200000, "connectTo": "59", "connectorType": "FinishStart"},
  {"id": "59", "name": "Develop break-even analysis", parent: "48", "progressValue": "0%", "actualStart": 958669200000, "actualEnd": 958701600000, "connectTo": "60", "connectorType": "FinishStart"},
  {"id": "60", "name": "Develop cash-flow projection", parent: "48", "progressValue": "0%", "actualStart": 958755600000, "actualEnd": 958788000000, "connectTo": "61", "connectorType": "FinishStart"},
  {"id": "61", "name": "Identify licensing and permitting requirements", parent: "48", "progressValue": "0%", "actualStart": 959014800000, "actualEnd": 959047200000, "connectTo": "62", "connectorType": "FinishStart"},
  {"id": "62", "name": "Develop startup plan", parent: "48", "progressValue": "100%", "actualStart": 959101200000, "actualEnd": 959220000000, "connectTo": "63", "connectorType": "FinishStart"},
  {"id": "63", "name": "Develop sales and marketing strategy", parent: "48", "progressValue": "0%", "actualStart": 959274000000, "actualEnd": 959306400000, "connectTo": "64", "connectorType": "FinishStart"},
  {"id": "64", "name": "Develop distribution structure", parent: "48", "progressValue": "0%", "actualStart": 959360400000, "actualEnd": 959392800000, "connectTo": "65", "connectorType": "FinishStart"},
  {"id": "65", "name": "Describe risks and opportunities", parent: "48", "progressValue": "20%", "actualStart": 959558400000, "actualEnd": 959731200000, "connectTo": "66", "connectorType": "FinishStart"},
  {"id": "66", "name": "Publish the business plan", parent: "48", "progressValue": "0%", "actualStart": 959792400000, "actualEnd": 959824800000, "connectTo": "67", "connectorType": "FinishStart"},
  {"id": "67", "name": "Confirm decision to proceed", parent: "48", "progressValue": "0%", "actualStart": 959824800000, "actualEnd": 959824800000, "connectTo": "69", "connectorType": "FinishStart"}
];