class Vec{
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    let newX = this.x + vector.x;
    let newY = this.y + vector.y;
    return new Vec(newX, newY);
  }

  minus(vector) {
    let newX = this.x - vector.x;
    let newY = this.y - vector.y;
    return new Vec(newX, newY);
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

var GraphNode = class GraphNode {
  constructor() {
    this.pos = new Vec(Math.random() * 1000,
                       Math.random() * 1000);
    this.edges = [];
  }
  connect(other) {
    this.edges.push(other);
    other.edges.push(this);
  }
  hasEdge(other) {
    return this.edges.includes(other);
  }
}

function treeGraph(depth, branches) {
  let graph = [new GraphNode()];
  if (depth > 1) {
    for (let i = 0; i < branches; i++) {
      let subGraph = treeGraph(depth - 1, branches);
      graph[0].connect(subGraph[0]);
      graph = graph.concat(subGraph);
    }
  }
  return graph;
}

var springLength = 40;
var springStrength = 0.1;

var repulsionStrength = 1500;

function forceDirected_simple(graph) {
  for (let node of graph) {
    for (let other of graph) {
      if (other == node) continue;
      let apart = other.pos.minus(node.pos);
      let distance = Math.max(1, apart.length);
      let forceSize = -repulsionStrength / (distance * distance);
      if (node.hasEdge(other)) {
        forceSize += (distance - springLength) * springStrength;
      }
      let normalized = apart.times(1 / distance);
      node.pos = node.pos.plus(normalized.times(forceSize));
    }
  }
}

function runLayout(implementation, graph) {
  function run(steps, time) {
    let startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      implementation(graph);
    }
    time += Date.now() - startTime;
    drawGraph(graph);

    if (steps == 0) console.log(time);
    else requestAnimationFrame(() => run(steps - 100, time));
  }
  run(4000, 0);
}

function forceDirected_noRepeat(graph) {
  for (let i = 0; i < graph.length; i++) {
    let node = graph[i];
    for (let j = i + 1; j < graph.length; j++) {
      let other = graph[j];
      let apart = other.pos.minus(node.pos);
      let distance = Math.max(1, apart.length);
      let forceSize = -repulsionStrength / (distance * distance);
      if (node.hasEdge(other)) {
        forceSize += (distance - springLength) * springStrength;
      }
      let applied = apart.times(forceSize / distance);
      node.pos = node.pos.plus(applied);
      other.pos = other.pos.minus(applied);
    }
  }
}

var skipDistance = 175;

function forceDirected_skip(graph) {
  for (let i = 0; i < graph.length; i++) {
    let node = graph[i];
    for (let j = i + 1; j < graph.length; j++) {
      let other = graph[j];
      let apart = other.pos.minus(node.pos);
      let distance = Math.max(1, apart.length);
      let hasEdge = node.hasEdge(other);
      if (!hasEdge && distance > skipDistance) continue;
      let forceSize = -repulsionStrength / (distance * distance);
      if (hasEdge) {
        forceSize += (distance - springLength) * springStrength;
      }
      let applied = apart.times(forceSize / distance);
      node.pos = node.pos.plus(applied);
      other.pos = other.pos.minus(applied);
    }
  }
}

GraphNode.prototype.hasEdgeFast = function(other) {
  for (let i = 0; i < this.edges.length; i++) {
    if (this.edges[i] === other) return true;
  }
  return false;
};

function forceDirected_hasEdgeFast(graph) {
  for (let i = 0; i < graph.length; i++) {
    let node = graph[i];
    for (let j = i + 1; j < graph.length; j++) {
      let other = graph[j];
      let apart = other.pos.minus(node.pos);
      let distance = Math.max(1, apart.length);
      let hasEdge = node.hasEdgeFast(other);
      if (!hasEdge && distance > skipDistance) continue;
      let forceSize = -repulsionStrength / (distance * distance);
      if (hasEdge) {
        forceSize += (distance - springLength) * springStrength;
      }
      let applied = apart.times(forceSize / distance);
      node.pos = node.pos.plus(applied);
      other.pos = other.pos.minus(applied);
    }
  }
}

function forceDirected_noVector(graph) {
  for (let i = 0; i < graph.length; i++) {
    let node = graph[i];
    for (let j = i + 1; j < graph.length; j++) {
      let other = graph[j];
      let apartX = other.pos.x - node.pos.x;
      let apartY = other.pos.y - node.pos.y;
      let distance = Math.max(1, Math.sqrt(apartX * apartX + apartY * apartY));
      let hasEdge = node.hasEdgeFast(other);
      if (!hasEdge && distance > skipDistance) continue;
      let forceSize = -repulsionStrength / (distance * distance);
      if (hasEdge) {
        forceSize += (distance - springLength) * springStrength;
      }
      let forceX = apartX * forceSize / distance;
      let forceY = apartY * forceSize / distance;
      node.pos.x += forceX; node.pos.y += forceY;
      other.pos.x -= forceX; other.pos.y -= forceY;
    }
  }
}

var mangledGraph = treeGraph(4, 4);
for (let node of mangledGraph) {
  node[`p${Math.floor(Math.random() * 999)}`] = true;
}


function findPath(source, destination) {
  function visited(workList, node) {
    for (let path of workList){
      if ( path[path.length -1] === node) return true;
    }
    return false;
  }
  let workList = [[source]];
  let path;
  while (path = workList.shift()) {
    let lastNode = path[path.length -1];
    if (lastNode === destination) return path;
    for (let neighbor of lastNode.edges) {
      if (visited(workList, neighbor)) continue;
      let newPath = path.slice();
      newPath.push(neighbor);
      workList.push(newPath);
    }
  }
  return null;
}

function exercise1() {
  let graph = treeGraph(4, 4);
  let root = graph[0], leaf = graph[graph.length - 1];
  console.log(findPath(root, leaf).length);
// → 4

  leaf.connect(root);
  console.log(findPath(root, leaf).length);
}

function exercise2() {
  let graph = treeGraph(6,6);
  let root = graph[0], leaf = graph[graph.length -1];
  timeFunction( () => findPath(root, leaf).length);
}

function timeFunction(fun) {
  let start = Date.now();
  let result = fun();
  let end = Date.now();
  console.log(`The function ran in ${end - start} ms and returned:\n${result}\n`)
}

function findPathOptimized(source, destination){
  let workList = [[source]];
  let visitedNodes = new Set();
  let path;
  while (path = workList.shift()) {
    let lastNode = path[path.length -1];
    visitedNodes.add(lastNode);
    if (lastNode === destination) return path;
    for (let neighbor of lastNode.edges) {
      if (visitedNodes.has(neighbor)) continue;
      let newPath = path.slice();
      newPath.push(neighbor);
      workList.push(newPath);
    }
  }
  return null;
}

// This version stores paths as linked lists in reversed order.
// So the first node in the linked list is the last node in the path and so forth
function findPathOptimized2(source, destination){
  let workList = [new ListNode(source, null)];
  let visitedNodes = new Set();
  for (let path of workList) {
    let lastNode = path.value;
    visitedNodes.add(lastNode);
    if (lastNode === destination) return path.toArray().reverse();
    for (let i=0; i< lastNode.edges.length; i++ ) {
      let neighbor = lastNode.edges[i];
      if (visitedNodes.has(neighbor)) continue;
      let newPath = path.prepend(neighbor);
      workList.push(newPath);
    }
  }
  return null;
}

class ListNode{
  constructor(value, nextNode) {
    this.value = value;
    this.next = nextNode;
  }

  toArray() {
    let currentNode = this;
    let result = [];
    while (currentNode){
     result.push(currentNode.value);
     currentNode = currentNode.next;
    }
    return result;
  }
  prepend(value){
    let preNode = new ListNode(value, this);
    return preNode;
  }
}

function exercise3() {
  let graph = treeGraph(5,11);
  let root = graph[0], leaf = graph[graph.length -1];
   timeFunction( () => findPath(root, leaf).length);
   timeFunction( () => findPathOptimized(root, leaf).length);
   timeFunction( () => findPathOptimized2(root, leaf).length);
}



exercise3();
