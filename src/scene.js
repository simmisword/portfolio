import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Trash } from "./objects/trash.js";
import { Boat } from "./objects/boat.js";
import { PlasticParticles } from "./objects/plastic-particles";

import { random } from "./utils.js";
import { Terrain } from "./terrain/terrain.js";
import { Sea } from "./sea/sea.js";
import { SceneSky } from "./sky/sky.js";
import { SceneControls } from "./scene-controls.js";

export class WaterScene {
  constructor() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.loader = new GLTFLoader();

    this.sceneControls = new SceneControls(this.sizes.width, this.sizes.height);
    this.controls = this.sceneControls.controls;
    this.renderer = this.sceneControls.renderer;
    this.camera = this.sceneControls.camera;

    document.getElementById("app").appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x786563, 0.003);

    this.worldSize = 1000;

    this.sun = new THREE.Vector3();

    this.sky = new SceneSky();
    this.scene.add(this.sky.sky);

    this.sea = new Sea(this.worldSize, this.scene.fog);
    this.scene.add(this.sea.planctonPoints);
    this.scene.add(this.sea.waterUp);
    this.scene.add(this.sea.waterDown);

    this.terrain = new Terrain(this.worldSize);
    this.scene.add(this.terrain.mesh);

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.updateSun();

    this.boat;
    this.trashes = [];

    this.initObjects();

    this.plasticParticles = new PlasticParticles();
    this.scene.add(this.plasticParticles.particles);

    this.sceneControls.initGuiControls(this.plasticParticles);

    // const near = 80;
    // const far = 200;
    // const color = "transparent";
    // this.scene.fog = new THREE.Fog(color, near, far);
  }

  async initObjects() {
    const TRASH_COUNT = 10;

    async function loadModel(selfLoader, url) {
      return new Promise((resolve, reject) => {
        if (selfLoader) {
          selfLoader.load(url, (gltf) => {
            resolve(gltf.scene);
          });
        }
      });
    }

    let boatModel = await loadModel(this.loader, "assets/boat/scene.gltf");

    this.boat = new Boat(boatModel);
    this.scene.add(this.boat.boat);

    let trashModel = await loadModel(
      this.loader,
      "assets/garbage_bag/scene.gltf"
    );

    for (let i = 0; i < TRASH_COUNT; i++) {
      if (trashModel) {
        const trash = new Trash(trashModel.clone());
        this.scene.add(trash.trash);
        this.trashes.push(trash);
      }
    }
  }

  updateSun() {
    const parameters = {
      elevation: 2,
      azimuth: 180,
    };

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    this.sun.setFromSphericalCoords(1, phi, theta);

    this.sky.sky.material.uniforms["sunPosition"].value.copy(this.sun);
    this.sea.waterUp.material.uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();
    this.sea.waterDown.material.uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();

    this.scene.environment = this.pmremGenerator.fromScene(
      this.sky.sky
    ).texture;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();

    if (this.controls) {
      this.controls.update(0.01);
    }
    if (this.boat) {
      this.boat.update();
      this.checkCollisions();
    }
    if (this.trashes) {
      this.trashes.forEach((trash) => {
        if (trash.trash) {
          trash.update();
        }
      });
    }

    this.plasticParticles.render();
    // stats.update();
  }

  render() {
    const time = performance.now() * 0.001;

    // mesh.position.y = Math.sin( time ) * 20 + 5;
    // mesh.rotation.x = time * 0.5;
    // mesh.rotation.z = time * 0.51;

    this.sea.waterUp.material.uniforms["time"].value += 1.0 / 60.0;
    this.sea.waterDown.material.uniforms["time"].value += 1.0 / 60.0;
    let pointsVertices =
      this.sea.planctonPoints.geometry.attributes.position.array;
    for (let i = 0; i < pointsVertices.length; i += 3) {
      // console.log(this.planctonPoints.geometry.attributes.position.array[i]);
      this.sea.planctonPoints.geometry.attributes.position.array[i] += random(
        -1,
        1
      );
      this.sea.planctonPoints.geometry.attributes.position.array[i + 1] +=
        random(-1, 1);
      this.sea.planctonPoints.geometry.attributes.position.array[i + 2] +=
        random(-1, 1);
      // console.log(this.planctonPoints.geometry.attributes.position.array[i]);
    }

    this.renderer.render(this.scene, this.camera);
  }

  checkCollisions() {
    if (this.boat.boat) {
      this.trashes.forEach((trash) => {
        if (trash.trash) {
          if (this.isColliding(this.boat.boat, trash.trash)) {
            // console.log(
            //   "Distance X:",
            //   Math.abs(this.boat.boat.position.x - trash.trash.position.x)
            // );
            // console.log(
            //   "Distance Y:",
            //   Math.abs(this.boat.boat.position.y - trash.trash.position.y)
            // );
            this.scene.remove(trash.trash);
            this.trashes.filter((item) => {
              return item !== trash;
            });
          }
        }
      });
    }
  }

  isColliding(obj1, obj2) {
    return (
      Math.abs(obj1.position.x - obj2.position.x) < 15 &&
      Math.abs(obj1.position.y - obj2.position.y) < 15
    );
  }
}
