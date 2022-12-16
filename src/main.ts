import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import MidiPlayer from "midi-player-js";
import Soundfont from "soundfont-player";
const merry = document.querySelector("#merry");
const [lang] = Intl.DateTimeFormat().resolvedOptions().locale.split("-");
if (merry && lang == "ua") merry.textContent = "З Новим роком!";
if (merry && lang == "ru") merry.textContent = "С Новым Годом!";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// scene.add( cube );
camera.position.y = 1;
camera.position.z = 5;
// scene.add(new THREE.AmbientLight());
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(5, 5, 5);
scene.add(light);
const loader = new GLTFLoader();
const names = new Set();
console.log(names);
const vertex = new THREE.Vector3();

const geometry = new THREE.BufferGeometry();
const vertices = [];

for (let i = 0; i < 1000; i++) {
  vertices.push(
    Math.random() * 120 - 60,
    Math.random() * 180 - 80,
    Math.random() * 130 - 60
  );
}

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

const texture = new THREE.TextureLoader().load("./cat.png");

const material = new THREE.PointsMaterial({ map: texture });

const rain = new THREE.Points(geometry, material);
//https://stackoverflow.com/questions/60935920/converting-three-js-geometry-into-buffergeometry
scene.add(rain);

function rainVariation() {
  var positionAttribute = rain.geometry.getAttribute("position");

  for (var i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);

    vertex.y -= 0.1;
    vertex.x += Math.random() * 0.01 - 0.005;
    vertex.z += Math.random() * 0.01 - 0.005;

    if (vertex.y < -60) {
      vertex.y = 90;
    }

    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positionAttribute.needsUpdate = true;
}

const showCredits = document.querySelector("#showcredits");
showCredits?.addEventListener("click", (event) => {
  event.preventDefault();
  const credits = document.querySelector("#credits");
  credits?.classList.remove("hidden");
  showCredits.classList.add("hidden");
  console.log("HEY");
});
const button = document.querySelector("#start");

if (!button) throw new Error("No button found");
button.addEventListener("click", () => {
  const bp = button.parentNode;
  if (!bp) throw new Error("No parent node found");
  bp.removeChild(button);
  const ac = new AudioContext();

  loader.load(
    "sleigh_lowpoly/scene.gltf"
    /**
     *
     * This work is based on "Sleigh Lowpoly" (https://sketchfab.com/3d-models/sleigh-lowpoly-93c8c492c4a14c07aa6815cb018d3925) by darkfrei (https://sketchfab.com/darkfrei) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
     */,
    function (gltf) {
      console.log(gltf);
      scene.add(gltf.scene);
      renderer.render(scene, camera);
      (async () => {
        const tracks = await Promise.all([
          Soundfont.instrument(ac, "distortion_guitar", { gain: 0.3 }),
          Soundfont.instrument(ac, "synth_bass_1", { gain: 0.5 }),
          Soundfont.instrument(ac, "tubular_bells", { gain: 1 }),
          Soundfont.instrument(ac, "french_horn", { gain: 0.8 }),
        ]);

        const r = await fetch("./Jingle_Bells.mid");
        const Player = new MidiPlayer.Player(function (event: any) {
          names.add(event.name);
          if (event.name == "End of Track") gltf.scene.rotation.x = 0;
          if (event.name == "Note on") {
            tracks[event.track - 2].play(event.noteName, ac.currentTime, {
            });
            gltf.scene.rotation.y -= 0.01;
            if (event.track === 4) {
              gltf.scene.rotation.x += 0.4;
              console.warn("TUBULAR BELLS");
            }
          }
        });
        Player.loadArrayBuffer(await r.arrayBuffer());
        Player.play();
        function animate() {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
          // gltf.scene.rotation.x += 0.001;
          gltf.scene.rotation.y += 0.01;
          rainVariation();
          if (Player.getSongTimeRemaining() < 5) {
            gltf.scene.rotation.x = 0;
            document.querySelector("#xmas .hidden")?.classList.remove("hidden");
          }
        }

        animate();
      })();

      // Load a MIDI file
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
});
console.log("HEy");
