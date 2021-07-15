import "@src/index.css";
import arrow from "@assets/arrow.png";
import bullet from "@assets/bullet.png";
import role from "@assets/role.png";
import circle01 from "@assets/circle01.png";
import emitter01 from "@assets/emitter01.json";

import { Vector, VectorE } from "@/js/vector";
import { keyboard, addControl } from "@js/supplement";
import Player from "@js/Player";
import Bullet from "@js/Bullet";
import io from "socket.io-client";
//import P2P from "socket.io-p2p";

import * as PIXI from "pixi.js";
import * as PIXI_Particles from "pixi-particles";

const app = new PIXI.Application({ backgroundAlpha: 1 });
document.body.appendChild(app.view);

//場景
const game_stage = new PIXI.Container();
app.stage.addChild(game_stage);

//分層
const game_stage_bgView = new PIXI.Container();
game_stage.addChild(game_stage_bgView);
const game_stage_view = new PIXI.Container();
game_stage.addChild(game_stage_view);
const game_stage_ui = new PIXI.Container();
game_stage.addChild(game_stage_ui);

//檢視分層
const game_stage_view_charaters = new PIXI.Container();
game_stage_view.addChild(game_stage_view_charaters);
const game_stage_view_bullets = new PIXI.Container();
game_stage_view.addChild(game_stage_view_bullets);
const game_stage_view_particles = new PIXI.Container();
game_stage_view.addChild(game_stage_view_particles);

//const opts = { numClients: 10 };
/*const p2p = new P2P(socket, opts);

p2p.on("ready", () => {
  //p2p.usePeerConnection = true;
  //p2p.emit('peer-obj', { peerId: peerId });
  console.log("aaaa");
});*/

app.loader.add("role", role);
app.loader.add("arrow", arrow);
app.loader.add("bullet", bullet);
app.loader.add("circle01", circle01);

app.loader.onProgress.add((loader) => {
  console.log(loader.progress, "loading");
});
app.loader.load((loader, resources) => {
  resources.emitter01 = { data: emitter01 };
  init(resources);
});

const init = (resources) => {
  initStage(resources);
  //app.start();
};

const initStage = (resources) => {
  const players = {};
  const bullets = [];
  const addPlayer = (data) => {
    if (!data) return;
    const key = data.id;
    const player = new Player(key);
    player.createGraph(resources);
    player.setPos(...data.pos);
    player.setTargetPos(...data.targetPos);
    player.updateGraph();
    game_stage_view_charaters.addChild(player.graph.root);
    players[key] = player;
  };
  const removePlayer = (key) => {
    const player = players[key];
    if (!player) return;
    game_stage_view_charaters.removeChild(player.graph.root);
    delete players[key];
  };
  const addBullet = (data) => {
    if (!data) return;
    const key = data.id;
    const bullet = new Bullet(key, data.playerID);
    bullet.createGraph(resources);
    bullet.setPos(...data.pos);
    bullet.setAngle(data.angle);
    bullet.updateGraph();
    game_stage_view_bullets.addChild(bullet.graph.root);
    bullets[key] = bullet;
  };
  const removeBullet = (key) => {
    const bullet = bullets[key];
    if (!bullet) return;
    game_stage_view_bullets.removeChild(bullet.graph.root);
    delete bullets[key];
  };
  const isProduction = process.env.NODE_ENV === "production";
  const socket = io(isProduction ? undefined : "ws://localhost:4300");
  socket.on("init", (data) => {
    //資料
    const serverData = {
      players: {},
      bullets: {},
    };
    const keysDown = {};
    const controlMove = [0, 0];

    //控制
    let moveTriggerID = null;
    const moveTrigger = () => {
      const run = () => {
        const left = 65 in keysDown;
        const right = 68 in keysDown;
        if (left ^ right) {
          if (left) controlMove[0] = -1;
          else if (right) controlMove[0] = 1;
        } else {
          controlMove[0] = 0;
        }
        const top = 87 in keysDown;
        const down = 83 in keysDown;
        if (top ^ down) {
          if (top) controlMove[1] = -1;
          else if (down) controlMove[1] = 1;
        } else {
          controlMove[1] = 0;
        }
        socket.emit("input", "move", { x: controlMove[0], y: controlMove[1] });
        if (!controlMove[0] && !controlMove[1]) {
          clearInterval(moveTriggerID);
          moveTriggerID = null;
        }
      };
      moveTriggerID = setInterval(run, 1000 / 60);
      run();
    };

    let fireTriggerID = null;
    const fireTrigger = () => {
      const run = () => {
        socket.emit("input", "fire");
      };
      fireTriggerID = setInterval(run, 100);
      run();
    };

    addEventListener(
      "keydown",
      (ev) => {
        keysDown[ev.keyCode] = true;
        if (!moveTriggerID) moveTrigger();
      },
      false
    );
    addEventListener(
      "keyup",
      (ev) => {
        delete keysDown[ev.keyCode];
        if (!moveTriggerID) moveTrigger();
      },
      false
    );

    app.view.addEventListener("mousedown", (ev) => {
      if (!fireTriggerID) fireTrigger();
    });
    app.view.addEventListener("mouseup", (ev) => {
      clearInterval(fireTriggerID);
      fireTriggerID = null;
    });
    app.view.addEventListener("mousemove", (ev) => {
      socket.emit("input", "mousePos", { x: ev.clientX, y: ev.clientY });
    });

    //socket
    for (let key in data.players) {
      addPlayer(data.players[key]);
    }
    for (let key in data.bullets) {
      addBullet(data.bullets[key]);
    }
    socket.on("addPlayer", (data) => {
      addPlayer(data);
    });
    socket.on("leave", (id) => {
      removePlayer(id);
    });
    socket.on("update", (data) => {
      serverData.players = data.players;
      serverData.bullets = data.bullets;
    });
    socket.on("addBullet", (data) => {
      addBullet(data);
    });
    socket.on("removeBullet", (key) => {
      removeBullet(key);
    });
    socket.on("hit", (data) => {
      emitter01.ownerPos.set(...data.pos);
      emitter01.emit = true;
    });

    //update
    const emitter01 = new PIXI_Particles.Emitter(
      game_stage_view_charaters,
      [resources.circle01.texture],
      resources.emitter01.data
    );
    emitter01.emit = false;

    app.ticker.add((delta) => {
      emitter01.update(app.ticker.deltaMS * 0.001);
      for (let key in serverData.players) {
        const serverPlayer = serverData.players[key];
        const player = players[key];
        if (player) {
          player.setPos(...serverPlayer.pos);
          player.setTargetPos(...serverPlayer.targetPos);
          player.updateGraph(0.5);
        }
      }
      for (let key in serverData.bullets) {
        const serverBullet = serverData.bullets[key];
        const bullet = bullets[key];
        if (bullet) {
          bullet.setPos(...serverBullet.pos);
          bullet.setAngle(serverBullet.angle);
          bullet.updateGraph(0.5);
        }
      }
    });
  });
};
