export class Graph {
  private nodes: object;
  private vertexSize: number;
  private maxVertex: number;

  constructor() {
    const defaultGetter = {
      get: function(target, name) {
        return target.hasOwnProperty(name) ? target[name] : [];
      },
    };

    this.nodes = new Proxy({}, defaultGetter);
    this.vertexSize = 1;
  }

  addEdge(from: number, to: number) {
    if (this.nodes[from].length === 0) {
      this.nodes[from] = [to];
    } else {
      this.nodes[from].push(to);
    }

    this.vertexSize += 1;
  }

  removeEdge(from: number, to: number) {
    if (this.nodes[from].length === 1) {
      delete this.nodes[from];
    } else {
      this.nodes[from] = this.nodes[from].filter(value => {
        return value === to;
      });
    }
    this.vertexSize -= 1;
  }

  printGraph() {
    Object.keys(this.nodes).forEach(([key, value]) => {
      console.log(`\nNode ${key} => ${this.nodes[key].join(' ')}\n`);
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
    if (isVisited[v] === false) {
      isVisited[v] = true;
      isInStack[v] = true;

      const nodes = this.nodes[v];
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
