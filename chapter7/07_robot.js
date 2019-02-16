/*jshint esversion: 6 */
var roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

var roadGraph = buildGraph(roads);

var VillageState = class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    //console.log(`Moved to ${action.direction}`);
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
};

var mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

function compareRobots(robot1, memory1, robot2, memory2) {
    function generateTasks(numberOfTasks, numberOfParcles){
        let tasks = [];
        for (let i=0; i < numberOfTasks -1; i++) {
            tasks.push(VillageState.random(numberOfParcles));
        }
        return tasks;
    }
    function addCounter(robot) {
        let counter = {value: 0};
        let robotWithCounter = (state, memory) => {
            counter.value++;
            return robot(state, memory);
        };
        return {robot: robotWithCounter, counter};
    }
    let tasks = generateTasks(100, 5);
    let total1 = 0, total2 = 0;
    for (let task  of tasks) {
        let robotWithCounter1 = addCounter(robot1);
        let robotWithCounter2 = addCounter(robot2);
        runRobot(task, robotWithCounter1.robot, memory1);
        total1 += robotWithCounter1.counter.value;
        runRobot(task, robotWithCounter2.robot, memory2);
        total2 += robotWithCounter2.counter.value;
    }
    let averageSteps = [total1, total2].map( t => t/ tasks.length);
    console.log(`Robot_1 had an average of ${averageSteps[0]}`  );
    console.log(`Robot_2 had an average of ${averageSteps[1]}`  );
}

function findShortestRoute(start, possibleDestinations) {
    let work = [{at: start, route: []}];
    for (let i=0; i < work.length; i++) {
        let {at, route} = work[i];
        for ( let neighbor of roadGraph[at] ){
            if (possibleDestinations.some(p => p === neighbor)) return route.concat(neighbor);
            if (!work.some(w => w.at == neighbor)){
                work.push({at: neighbor, route: route.concat(neighbor)});
            }
        }
    }
}

function greedyRobot(state, route=[]) {
    if (route.length === 0) {
        let myParcelDestinations = state.parcels.filter(p => p.place == state.place && p.address != state.place).map(p => p.address);
        let remoteParcelPlaces = state.parcels.filter(p=> p.place != state.place).map(p => p.place);
        //route = findShortestRoute(state.place, remoteParcelPlaces.concat(myParcelDestinations));
        route = findShortestRoute(state.place, remoteParcelPlaces.concat(myParcelDestinations));
    }
    return {direction: route[0], memory: route.slice(1)};
}

function lazyRobot({place, parcels}, route) {
  if (route.length == 0) {
    // Describe a route for every parcel
    let routes = parcels.map(parcel => {
      if (parcel.place != place) {
        return {route: findRoute(roadGraph, place, parcel.place),
                pickUp: true};
      } else {
        return {route: findRoute(roadGraph, place, parcel.address),
                pickUp: false};
      }
    });

    // This determines the precedence a route gets when choosing.
    // Route length counts negatively, routes that pick up a package
    // get a small bonus.
    function score({route, pickUp}) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    route = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
  }

  return {direction: route[0], memory: route.slice(1)};
}
compareRobots(greedyRobot, [], lazyRobot, []);
