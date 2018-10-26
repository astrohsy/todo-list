"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Graph {
    constructor() {
        this.nodes = [null];
        this.vertexSize = 1;
    }
    addVertex(from, to) {
        while (from >= this.vertexSize || to >= this.vertexSize) {
            this.nodes.concat([...Array(this.vertexSize)]);
            this.vertexSize = 2 * this.vertexSize;
            if (from > this.maxVertex || to > this.maxVertex) {
                this.maxVertex = Math.max(from, to);
            }
        }
        if (this.nodes[from] === undefined) {
            this.nodes[from] = [to];
        }
        else {
            this.nodes[from].push(to);
        }
    }
    printGraph() {
        for (let i = 1; i <= this.maxVertex; i++) {
            console.log(`Node ${i} => ${this.nodes[i].join(' ')}`);
        }
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map