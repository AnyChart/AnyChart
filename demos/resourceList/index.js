var stage, list, data, new_data;

anychart.onDocumentReady(function() {
  stage = anychart.graphics.create('stage');
  data = [
    {
      image: 'https://avatars1.githubusercontent.com/u/301098?v=3&s=466',
      name: 'Anton Kagakin',
      description: 'Description goes here',
      type: 'Dev Unit',
      tags: ['dev', 'js', 'chart', 'guitar']
    },
    {
      image: 'https://avatars3.githubusercontent.com/u/1116634?v=3&s=466',
      name: 'Alexander Qdryavtsev',
      type: 'Dev Unit',
      tags: ['dev', 'js', 'gantt', 'guitar']
    },
    {
      image: 'https://avatars0.githubusercontent.com/u/1162974?v=3&s=466',
      name: 'Sergey Medvedev',
      type: 'Dev Unit',
      tags: ['dev', 'js', 'map', 'noises']
    },
    {
      image: 'https://avatars1.githubusercontent.com/u/712098?v=3&s=466',
      name: 'Anton Saukh',
      type: 'Dev Unit',
      tags: ['dev', 'js', 'stock', 'accordion']
    }
  ];
  new_data = [
    {
      name: 'Anton Kagakin',
      description: 'Description goes here',
      type: 'Dev Unit',
      tags: ['dev', 'js']
    }
  ];

  // creating resourcelist
  list = anychart.standalones.resourceList(data);
  list
    .width(256)
    .container(stage)
    .draw();

  var div = document.getElementById('events-list');
  list.tags().listen('click', function(event) {
    var obj = {
      index: event['index'],
      text: event['text']
    };
    div.innerHTML += anychart.format.subs('<div class="col-md-8">You\'ve clicked <pre>%s</pre></div>', JSON.stringify(obj, null, 2));
    console.log(event);
  });

  $('input[type=text]').change(function(e) {
    var input = e.target;
    var path = input.id.split('.');
    var chain;
    chain = eval(path.shift());
    var method = path.pop();
    while (path.length) {
      chain = chain[path.shift()]();
    }
    var value = input.value;
    if (method == 'borderRadius' || method == 'padding' || method == 'margin') {
      value = input.value.split(' ');
    }

    chain[method](value);
  });
  $('input[type=range]').on('input', function(e) {
    var input = e.target;
    var path = input.id.split('.');
    var chain;
    chain = eval(path.shift());
    var method = path.pop();
    while (path.length) {
      chain = chain[path.shift()]();
    }
    var value = input.value;
    if (method == 'borderRadius' || method == 'padding' || method == 'margin') {
      value = input.value.split(' ');
    }

    chain[method](value);
  });
});
