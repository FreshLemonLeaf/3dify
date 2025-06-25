let scene, camera, renderer, controls, mesh, imageTexture;
let extrusion = 0.2, sideColor = "#2196f3", backMode = "image";
let imageUrl = null;

function init() {
  const viewer = document.getElementById('viewer');
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  camera = new THREE.PerspectiveCamera(45, viewer.clientWidth / viewer.clientHeight, 0.1, 100);
  camera.position.set(1.5, 1.5, 2);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(2,2,2);
  scene.add(dir);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (mesh) mesh.rotation.y += 0.003;
  renderer.render(scene, camera);
}

function createExtrudeBox() {
  if (mesh) scene.remove(mesh);
  if (!imageTexture) return;

  // Six materials: right, left, top, bottom, front, back
  const colorMat = new THREE.MeshStandardMaterial({ color: sideColor });
  const frontMat = new THREE.MeshStandardMaterial({ map: imageTexture, color: 0xffffff });
  let backMat;
  if (backMode === 'image') {
    backMat = new THREE.MeshStandardMaterial({ map: imageTexture, color: 0xffffff });
  } else {
    backMat = new THREE.MeshStandardMaterial({ color: sideColor });
  }
  const materials = [colorMat, colorMat, colorMat, colorMat, frontMat, backMat];

  mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, extrusion),
    materials
  );
  mesh.position.set(0, 0, 0);
  scene.add(mesh);
}

document.getElementById('imageInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  imageUrl = URL.createObjectURL(file);
  const loader = new THREE.TextureLoader();
  loader.load(imageUrl, (tex) => {
    imageTexture = tex;
    createExtrudeBox();
    document.getElementById('downloadBtn').disabled = false;
  });
});

document.getElementById('extrudeRange').addEventListener('input', function(e) {
  extrusion = Number(e.target.value);
  document.getElementById('extrudeValue').textContent = extrusion.toFixed(2);
  createExtrudeBox();
});

document.getElementById('sideColor').addEventListener('input', function(e) {
  sideColor = e.target.value;
  createExtrudeBox();
});

document.getElementById('backMode').addEventListener('change', function(e) {
  backMode = e.target.value;
  createExtrudeBox();
});

document.getElementById('downloadBtn').addEventListener('click', function() {
  if (!mesh) return;
  const exporter = new THREE.GLTFExporter();
  exporter.parse(
    mesh,
    function(result) {
      const blob = new Blob(
        [result instanceof ArrayBuffer ? result : JSON.stringify(result)],
        { type: 'application/octet-stream' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extruded-image.glb';
      a.click();
    },
    { binary: true }
  );
});

window.addEventListener('resize', () => {
  const viewer = document.getElementById('viewer');
  camera.aspect = viewer.clientWidth / viewer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});

init();
