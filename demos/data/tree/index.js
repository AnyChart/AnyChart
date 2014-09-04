var data1, data2;

var rawData1 = [
  {
    id: '1',
    value: 15,
    foo: 'bar',
    children: [
      {value: 10},
      {
        id: '4',
        value: 20,
        children: [
          {
            id: '3',
            value: 5
          },
          {
            id: '2',
            value: '100'
          }
        ]
      }
    ]
  },
  {value: 1}
];



var rawData2 = [
  {id: '22', parent: '21', value: 101, name: 'Cycle23'}, //Cycle 1. Child of 21, parent of 23.
  {value: 'Test index merge', name: 'IndexName'}, //!!! Root, used to test index by similar name.
  {value: 10, foo: 'bar1', name: 'IndexName'}, //!!! Just a root, has no ID.
  {id: '10', parent: '15', value: 12}, //Has parent '15'
  {parent: '13', qwer: 3}, //Has no id, but has parent 13
  {id: '15', name: 'S1'}, //!!! Root, parent of '10' and item n:'One more child' without id.
  {id: '21', parent: '23', name: 'Cycle3'}, //Cycle 2. Child of 23, parent of 22.
  {id: '23', parent: '22', name: 'Cycle22'}, //Cycle 3. Child of 22, parent of 21.
  {id: '13', value: 10}, //!!! Root. Has child without id.
  {parent: '15', n: 'One more child'}, //2nd child of 15.
  {parent: '100500', noParent: 'My parent does not exist.'} //This item points to parent that doesn't exist.
];

anychart.onDocumentReady(function() {
  
  data1 = new anychart.data.Tree(rawData1);
  console.log(data1.getChildren());
  data1.listen('treeDataChange', function(evt) {
    console.log(evt);
  });

  data1.getChildAt(0).set('hello', 'hell');



});

