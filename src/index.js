import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    Mesh,
    PlaneBufferGeometry,
    ShadowMaterial,
    DirectionalLight,
    PCFSoftShadowMap,
    sRGBEncoding,
    Color,
    AmbientLight,
    Box3,
    LoadingManager,
    MathUtils,
} from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from './URDFLoader.js';

let scene, camera, renderer, robot, controls;

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

init();
render();

function init() {

    scene = new Scene();
    scene.background = new Color(0x263238);

    renderer = new WebGLRenderer({ antialias: true });
    const canvasContainer = document.getElementById('renderCanvas');
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    camera = new PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    createAxes(scene)

    const directionalLight = new DirectionalLight(0xffffff, 1.0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.setScalar(1024);
    directionalLight.position.set(5, 30, 5);
    scene.add(directionalLight);

    const ambientLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const ground = new Mesh(new PlaneBufferGeometry(), new ShadowMaterial({ opacity: 0.25 }));
    ground.rotation.x = -Math.PI / 2;
    ground.scale.setScalar(30);
    ground.receiveShadow = true;
    scene.add(ground);

    // Load robot
    const manager = new LoadingManager();
    const loader = new URDFLoader(manager);
    const urdf_path = '../urdf/kuka_iiwa/model_for_sdf.urdf';
    // const urdf_path = '../urdf/T12/urdf/T12_flipped.URDF';
    loader.load(urdf_path, result => {
        robot = result;
    });

    // wait until all the geometry has loaded to add the model to the scene
    manager.onLoad = () => {
        robot.rotation.x = - Math.PI / 2;
        robot.traverse(c => {
            c.castShadow = true;
        });
        // for (let i = 1; i <= 6; i++) {
        //     robot.joints[`HP${ i }`].setJointValue(MathUtils.degToRad(30));
        //     robot.joints[`KP${ i }`].setJointValue(MathUtils.degToRad(120));
        //     robot.joints[`AP${ i }`].setJointValue(MathUtils.degToRad(-60));
        // }
        // robot.updateMatrixWorld(true);

        // const bb = new Box3();
        // bb.setFromObject(robot);
        // robot.position.y -= bb.min.y;
        scene.add(robot);
    };

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 开启阻尼效果，使动画更平滑
    controls.dampingFactor = 0.25; // 阻尼系数
    controls.screenSpacePanning = false; // 关闭屏幕空间平移
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };
    controls.enableRotate = true;
    controls.rotateSpeed = 1;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = false;
    controls.update();

    // onResize();
    // window.addEventListener('resize', onResize);

}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // Load robot
    console.log(file)
    const manager = new LoadingManager();
    const loader = new URDFLoader(manager);
    loader.load(file, result => {
      robot = result;
    });
  scene.add(robot);
  }
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function createAxes(scene, scale=1/2) {
  // Create arrowheads for the axes
  const arrowX = new THREE.ArrowHelper(new THREE.Vector3(scale, 0, 0), new THREE.Vector3(0, 0, 0), scale, 0xff0000, scale/5, 0.1); // Increase arrow length, width, and head length
  const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, scale, 0), new THREE.Vector3(0, 0, 0), scale, 0x00ff00, scale/5, 0.1);
  const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, scale), new THREE.Vector3(0, 0, 0), scale, 0x0000ff, scale/5, 0.1);

  // Create axes
  const axesHelper = new THREE.Group();
  axesHelper.add(arrowX);
  axesHelper.add(arrowY);
  axesHelper.add(arrowZ);

  // Create spherical marker
  const sphereGeometry = new THREE.SphereGeometry(scale/20, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  axesHelper.add(sphere);

  scene.add(axesHelper);
}
