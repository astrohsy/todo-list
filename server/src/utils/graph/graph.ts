import * as Collections from 'typescript-collections';

type AdjList = {
  [key:string]: Collections.Set<number>;
}

export class Graph {
  private nodes: AdjList;
  private vertexSize: number;

  constructor() {
    this.nodes = {};
    this.vertexSize = 0;
  }

  addEdge(from: number, to: number) {
    if (this.nodes[from] == null) {
      const newSet = new Collections.Set<number>();
      this.nodes[from] = newSet;
    }

    if (!this.nodes[from].contains(to)) {
      this.nodes[from].add(to);
      this.vertexSize += 1;
    }
  }

  removeEdge(from: number, to: number) {
    if (this.nodes[from].contains(to)) {
      this.nodes[from].remove(to);
      this.vertexSize -= 1;
    }
  }

  printGraph() {
    Object.keys(this.nodes).forEach(([key, value]) => {
      console.log(`\nNode ${key} => ${this.nodes[key].toArray().join(' ')}\n`);
    });
  }

  isCycle(): boolean {
    const defaultGetter = {
      get: function(target, name) {
        return target.hasOwnProperty(name) ? target[name] : false;
      },
    };

    let isVisited = new Proxy({}, defaultGetter);
    let isInStack = new Proxy({}, defaultGetter);

    const nodes = Object.keys(this.nodes).map(value => Number(value));
    for (let i = 0; i < nodes.length; i++) {
      if (this.isCycleUtil(nodes[i], isVisited, isInStack)) {
        return true;
      }
    }

    return false;
  }

  private isCycleUtil(
    v: number,
    isVisited: object,
    isInStack: object,
  ): boolean {
    if (isVisited[v] === false && this.nodes[v]) {
      isVisited[v] = true;
      isInStack[v] = true;

      const nodes = this.nodes[v].toArray();
      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (!isVisited[node] && this.isCycleUtil(node, isVisited, isInStack)) {
          return true;
        } else if (isInStack[node]) {
          return true;
        }
      }
    }

    isInStack[v] = false;
    return false;
  }
}
