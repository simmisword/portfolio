import "./style.css";

import { WaterScene } from "./three-service/scene.js";

let waterScene = new WaterScene();

waterScene.animate();

window.addEventListener("resize", waterScene.onWindowResize);

window.addEventListener("keydown", function (event) {
  if (event.key == "u") {
    waterScene.boat.speed.vel = 1;
  }
  if (event.key == "j") {
    waterScene.boat.speed.vel = -1;
  }
  if (event.key == "h") {
    waterScene.boat.speed.rot = 0.05;
  }
  if (event.key == "k") {
    waterScene.boat.speed.rot = -0.05;
  }
});

window.addEventListener("keyup", function (event) {
  if (waterScene.boat) {
    waterScene.boat.stop();
  }
});
