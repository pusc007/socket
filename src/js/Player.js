import { Float } from "@/js/float";
import { Vector } from "@/js/vector";
import * as PIXI from "pixi.js";
export default class Player {
  constructor(id) {
    this.id = id;
    this.pos = [0, 0];
    this.targetPos = [0, 0];
    this.control = { move: [0, 0] };
  }
  createGraph(resources) {
    const root = new PIXI.Container();
    const role = new PIXI.Sprite(resources.role.texture);
    role.name = "role";
    role.anchor.set(0.5);
    root.addChild(role);
    const arrow = new PIXI.Sprite(resources.arrow.texture);
    arrow.name = "arrow";
    arrow.anchor.set(0, 0.5);
    root.addChild(arrow);
    this.graph = { root, role, arrow };
    return root;
  }
  setPos(x, y) {
    this.pos[0] = x;
    this.pos[1] = y;
  }
  setTargetPos(x, y) {
    this.targetPos[0] = x;
    this.targetPos[1] = y;
  }
  move(x, y) {
    this.pos[0] += x;
    this.pos[1] += y;
  }
  updateGraph(rate = 1) {
    this.graph.root.x = Float.mix(this.graph.root.x, this.pos[0], rate);
    this.graph.root.y = Float.mix(this.graph.root.y, this.pos[1], rate);
    const angle = Vector.getAngle(Vector.normalize(Vector.sub(this.targetPos, this.pos)));
    this.graph.arrow.rotation = Float.angleMix(this.graph.arrow.rotation, angle, rate);
  }
}
