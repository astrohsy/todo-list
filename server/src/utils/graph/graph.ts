export class Graph {
    private nodes: Array<Array<number>>;
    private vertexSize: number;
    private maxVertex: number;

    constructor() {
        this.nodes = [ [] ];
        this.vertexSize = 1;
        this.maxVertex = 0;
    }

    addEdge(from: number, to: number) {
        while (from >= this.vertexSize || to >= this.vertexSize) {
            this.nodes = this.nodes.concat(Array.from({length:this.vertexSize}, u => []));
            this.vertexSize = 2 * this.vertexSize;
        }

        if (from > this.maxVertex || to > this.maxVertex) {
            this.maxVertex = Math.max(from, to);
        }

        if (this.nodes[from] === undefined) {
            this.nodes[from] = [to];
        } else {
            this.nodes[from].push(to);
        }
    }

    printGraph() {
        for (let i = 1; i <= this.maxVertex; i++) {
            console.log(`\nNode ${i} => ${this.nodes[i].join(' ')}\n`);
        }
    }

    isCycle(): boolean {
        let isVisited = Array(this.maxVertex+1).fill(false);
        let isInStack = Array(this.maxVertex+1).fill(false);

        for (let i = 1; i <= this.maxVertex; i++) {
            if (this.isCycleUtil(i, isVisited, isInStack)) {
                return true;
            }
        }

        return false;
    }

    private isCycleUtil(v: number, isVisited: Array<boolean>, isInStack: Array<boolean>): boolean {
        if (isVisited[v] === false) {
            isVisited[v] = true;
            isInStack[v] = true;

            for (let i = 0; i < this.nodes[v].length; i++) {
                let node = this.nodes[v][i];
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
