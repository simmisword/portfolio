import "./style.css";

import { WaterScene } from "./src/scene.js";

let waterScene = new WaterScene();

waterScene.animate();

window.addEventListener("resize", () => {
  waterScene.sizes.width = window.innerWidth;
  waterScene.sizes.height = window.innerHeight;

  waterScene.camera.aspect = waterScene.sizes.width / waterScene.sizes.height;
  waterScene.camera.updateProjectionMatrix();

  waterScene.renderer.setSize(waterScene.sizes.width, waterScene.sizes.height);
});

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

  if (event.key == " ") {
    waterScene.controls.autoForward = !waterScene.controls.autoForward;
    waterScene.controls.dragToLook = !waterScene.controls.dragToLook;
  }
});

window.addEventListener("keyup", function (event) {
  if (waterScene.boat) {
    waterScene.boat.stop();
  }
});
