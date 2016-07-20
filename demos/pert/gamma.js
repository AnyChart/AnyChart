var stage;

var data;

//var vertices = ['S', 'A', 'B', 'C', 'D', 'E', 'G', 'F', 'Q'];
//var edges = [
//  ['S', 'D'],
//  ['S', 'A'],
//  // ['A', 'B'],
//  ['A', 'C'],
//  ['A', 'G'],
//  ['B', 'D'],
//  ['C', 'F'],
//  ['G', 'F'],
//  ['E', 'F'],
//  ['D', 'E'],
//  ['D', 'F'],
//  ['S', 'Q'],
//  ['Q', 'B'],
//  ['Q', 'D']
//];

// var vertices = ['Start', 'FA', 'FB', 'FC', 'FD', 'FE', 'SF', 'SG', 'FF', 'SI', 'Finish'];
// var edges = [
//     ['Start', 'FA'],
//     ['Start', 'FB'],
//     ['Start', 'FC'],
//     ['Start', 'FD'],
//     ['Start', 'FE'],
//
//     ['FA', 'SF'],
//     ['FB', 'SF'],
//     ['FC', 'SF'],
//     ['FD', 'SG'],
//     ['FE', 'SG'],
//
//     ['SF', 'FF'],
//     ['SG', 'SI'],
//     ['FE', 'SI'],
//     ['FF', 'SI'],
//
//     ['SI', 'Finish'],
//     ['FF', 'Finish'] //16
// ];

var vertices = ['Start', 'abcde', 'pqz', 'p', 'Finish', 'qz', 'mpz', 'z'];
var edges = [
    ['Start', 'abcde'],
    ['abcde', 'p'],
    ['abcde', 'pqz'],
    ['abcde', 'z'],
    ['abcde', 'mpz'],

    ['pqz', 'p'],
    ['pqz', 'qz'],

    ['p', 'Finish'],

    ['qz', 'Finish'],
    // ['qz', 'z'],

    ['mpz', 'z'],
    ['mpz', 'Finish'],
    ['mpz', 'p'],

    ['z', 'Finish']

];


anychart.onDocumentReady(function() {
  data = prep(vertices, edges);
  buildPaths(data);
  var faces = gamma(data);

  console.log('FACES:');
  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    var res = '';
    for (var j = 0; j < face.length; j++) {
      var milestone = face[j];
      var add = (j == face.length - 1 ? '' : ' -> ');
      res += milestone + add;
    }
    console.log(res);
  }


  // console.log(gamma(data));
  // console.log(data);

   var i;
   var v = [];
   for (i in data.vertices)
     v.push(data.vertices[i]);
   var e = [];
   for (i in data.edges)
     e.push(data.edges[i]);
   console.log('Vertices\n' + v.map(function(item) { return item.name + ' ' + (2 + Math.max(item.succ.length - 1, 0) + Math.max(item.pred.length - 1, 0)); }).join('\n'));
    console.log('Edges\n' + e.join('\n'));
    console.log('Paths\n' + data.paths.map(function(item) { return item.join('->'); }).join('\n'));


   //console.log('Levels\n' + data.levels.map(function(item) { return item.join(','); }).join('\n'));
   //console.log('Faces\n' + data.faces.map(function(item) { return item.join('->'); }).join('\n'));
  // stage = acgraph.create('container');
  // stage.rect(0, 0, 100, 100).fill('red');
});


function prep(v, e) {
  var vmap = {};
  var vs = [];
  var i;
  for (i = 0; i < v.length; i++) {
    vs.push(vmap[v[i]] = {
      name: v[i],
      succ: [],
      pred: [],
      edges: [],
      flag: false,
      flagPlotted: false,
      toString: function() {
        return this.name;
      }
    });
  }
  var emap = {};
  var es = [];
  for (i = 0; i < e.length; i++) {
    var edge = {
      from: vmap[e[i][0]],
      to: vmap[e[i][1]],
      flag: false,
      flagPlotted: false,
      toString: function() {
        return this.from.name + '->' + this.to.name;
      }
    };
    edge.from.succ.push(edge.to);
    edge.to.pred.push(edge.from);
    edge.from.edges.push(edge);
    edge.to.edges.push(edge);
    emap[edge.toString()] = edge;
    es.push(edge);
  }
  return {
    vertices: vs,
    vmap: vmap,
    edges: es,
    emap: emap,
    start: vmap['Start'],
    finish: vmap['Finish']
  };
}

function buildPaths(data) {
  data.paths = [];
  var stack = [];
  data.start.level = 0;
  stack.push({
    vertex: data.start,
    level: 0
  });
  var path = [];
  var maxLevel = 0;
  while (stack.length) {
    var o = stack.pop();
    var v = o.vertex;
    var level = o.level;
    if (path.length > level)
      path.length = level;
    path.push(v.name);
    if (v == data.finish)
      data.paths.push(path.slice(0));
    for (var i = v.succ.length; i--;) {
      var s = v.succ[i];
      o = {
        vertex: s,
        level: level + 1
      };
      s.level = Math.max(o.level, s.level || 0);
      maxLevel = Math.max(s.level, maxLevel);
      stack.push(o);
    }
  }
  data.maxLevel = maxLevel;
}

function gamma(data) {
  data.start.flagPlotted = data.finish.flagPlotted = true;
  var currFlag = false;
  var segments = createSegments(data.emap, data.vmap, currFlag);

  // at this point all vertices except start and finish are flagged true
  var faces = [[data.start.name, data.finish.name]];
  var next;

  while (next = getNextSegmentAndFace(segments, faces)) {
    plotSegment(segments, faces, next[0], next[1]);
    segments = createSegments(data.emap, data.vmap, currFlag = !currFlag);
  }
  return faces;
}


function createSegments(emap, vmap, currentFalseFlag) {
  var i, j, v, vv, e;
  var segments = [];

  for (i in emap) {
    e = emap[i];
    if (!e.flagPlotted && e.flag == currentFalseFlag) {
      e.flag = !currentFalseFlag;
      var s = {
        vertices: {},
        edges: {}
      };
      s.vertices[e.from.toString()] = e.from;
      s.vertices[e.to.toString()] = e.to;
      s.edges[e.toString()] = e;
      var stack = [];
      if (!e.from.flagPlotted && e.from.flag == currentFalseFlag) {
        e.from.flag = !currentFalseFlag;
        stack.push(e.from);
      }

      if (!e.to.flagPlotted && e.to.flag == currentFalseFlag) {
        e.to.flag = !currentFalseFlag;
        stack.push(e.to);
      }

      while (stack.length) {
        v = stack.pop();
        for (j = 0; j < v.edges.length; j++) {
          e = v.edges[j];
          if (!e.flagPlotted && e.flag == currentFalseFlag) {
            e.flag = !currentFalseFlag;
            s.edges[e.toString()] = e;
            vv = e.from == v ? e.to : e.from;
            if (!vv.flagPlotted && vv.flag == currentFalseFlag) {
              vv.flag = !currentFalseFlag;
              stack.push(vv);
            }
            s.vertices[vv.toString()] = vv;
          }
        }
      }
      segments.push(s);
    }
    e.flag = !currentFalseFlag;
  }
  for (i in vmap) {
    vmap[i].flag = !currentFalseFlag;
  }
  return segments;
}

function getNextSegmentAndFace(segments, faces) {
  var i, j, k, s, v, f;
  var result = null;
  var minFacesCount = Infinity;
  for (i = 0; i < segments.length; i++) {
    s = segments[i];
    var facesCount = 0;
    var firstFace = -1;
    for (j = 0; j < faces.length; j++) {
      f = faces[j];
      var containedInFace = true;
      for (k in s.vertices) {
        v = s.vertices[k];
        if (v.flagPlotted) { // contact vertex
          if (f.indexOf(v.name) < 0) { // if we have found a contact vertex that is not in the face - exit the cycle
            containedInFace = false;
            break;
          }
        }
      }
      if (containedInFace) { // if the face contain all contact vertices, increasing the counter
        facesCount++;
        if (firstFace < 0) // if it was the first acceptable face - memorize it
          firstFace = j;
        if (facesCount >= minFacesCount) // if there is a segment with less faces count - exit the cycle
          break;
      }
    }
    if (!facesCount)
      throw 'non planar!';
    if (facesCount < minFacesCount) {
      result = [i, firstFace];
      minFacesCount = facesCount;
    }
  }
  // we return an index of the segment, that should be plotted next and an index of the face to plot to
  return result;
}

function plotSegment(segments, faces, segmentIndex, faceIndex) {
  var v;
  var segment = segments[segmentIndex];
  var leftMost = null;
  for (var i in segment.edges) {
    v = segment.edges[i].from;
    if (v.flagPlotted) { // contact
      if (!leftMost || leftMost.level > v.level) {
        leftMost = v;
      }
    }
  }
  if (leftMost == null) debugger;
  var path = [leftMost.name];
  v = leftMost;
  while (v) {
    var edges = v.edges;
    var next = null;
    for (i = 0; i < edges.length; i++) {
      var e = edges[i];
      if (e.from == v && !e.flagPlotted) { // looking for outgoing edges only, that are not plotted yet
        e.flagPlotted = true;
        var vv = e.to;
        path.push(vv.name);
        if (!vv.flagPlotted) {
          vv.flagPlotted = true;
          next = vv;
        }
        break;
      }
    }
    v = next;
  }
  //var args = [segmentIndex, 1];
  //args.push.apply(args, createSegments(segment.vertices, true));
  //segments.splice.apply(segments, args);
  var face = faces[faceIndex];
  var cutResult = cutFace(face, path);
  faces.splice(faceIndex, 1, cutResult[0], cutResult[1]);
}

function cutFace(face, path) {
  var v1 = path[0];
  var v2 = path[path.length - 1];
  var index1 = face.indexOf(v1);
  var index2 = face.indexOf(v2);
  var min, max, inverted;
  if (index1 < index2) {
    min = index1;
    max = index2;
    inverted = false;
  } else {
    min = index2;
    max = index1;
    inverted = true;
  }
  var i;

  var face1 = face.slice(0, min);
  if (inverted) {
    for (i = path.length; i--;) {
      face1.push(path[i]);
    }
  } else {
    face1.push.apply(face1, path);
  }
  face1.push.apply(face1, face.slice(max + 1));

  var face2 = face.slice(min + 1, max);
  if (inverted) {
    face2.push.apply(face2, path);
  } else {
    for (i = path.length; i--;) {
      face2.push(path[i]);
    }
  }
  return [face1, face2];
}

function buildSegments(data, pathsMap) {
  var segmentsMap = {};
  var i;
  for (i in pathsMap) {
    var path = pathsMap[i];
    extractSegmentsFromPath(data, path, segmentsMap);
  }
  var segmentFaces = {};
  var minFaces = [];
  var minFacesCount = Infinity;
  var count = 0;
  for (i in segmentsMap) {
    var segment = segmentsMap[i];
    var goodFaces = [];
    for (var j = 0; j < data.faces.length; j++) {
      var face = data.faces[j];
      if (face.indexOf(segment[0]) >= 0 &&
          face.indexOf(segment[segment.length - 1]) >= 0) {
        goodFaces.push(j);
      }
    }
    segmentFaces[i] = goodFaces;
    if (minFacesCount >= goodFaces.length) {
      if (minFacesCount > goodFaces.length) {
        minFaces.length = 0;
        minFacesCount = goodFaces.length;
      }
      minFaces.push(i);
    }
    count++;
  }
  data.segmentsRemaining = count;
  data.segments = segmentsMap;
  data.segmentFaces = segmentFaces;
  data.minFaces = minFaces;
}

function buildLevels(data) {
  var levels = [];
  var i;
  for (i = 0; i <= data.maxLevel; i++)
    levels.push([]);
  for (i in data.vertices) {
    var v = data.vertices[i];
    levels[v.level].push(v);
  }
  data.levels = levels;
}


