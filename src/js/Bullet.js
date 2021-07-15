import { Float } from "@/js/float";
import * as PIXI from "pixi.js";
export default class Bullet {
  constructor(id, playerID) {
    this.id = id;
    this.playerID = playerID;
    this.pos = [0, 0];
    this.angle = 0;
    this.life = 0;
    this.lifeMax = 2;
  }
  createGraph(resources) {
    const root = new PIXI.Container();
    const bullet = new PIXI.Sprite(resources.bullet.texture);
    bullet.name = "bullet";
    bullet.anchor.set(0.5);
    root.addChild(bullet);
    this.graph = { root, bullet };
    return root;
  }
  setPos(x, y) {
    this.pos[0] = x;
    this.pos[1] = y;
  }
  setAngle(a) {
    this.angle = a;
  }
  move(x, y) {
    this.pos[0] += x;
    this.pos[1] += y;
  }
  updateLife(deltaMS) {
    this.life += deltaMS;
    return this.life > this.lifeMax;
  }
  updateGraph(rate = 1) {
    this.graph.root.x = Float.mix(this.graph.root.x, this.pos[0], rate);
    this.graph.root.y = Float.mix(this.graph.root.y, this.pos[1], rate);
    this.graph.bullet.rotation = Float.angleMix(this.graph.bullet.rotation, this.angle, rate);
  }
}
