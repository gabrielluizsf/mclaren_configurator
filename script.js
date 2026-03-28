import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

const filePaths = {
    texture: './assets/docklands_01_4k.exr',
    car: './assets/mp4-12c_vehicle.glb'
};

const clothingBaseColors = [
    { name: "Preto Carbono", hex: "#111111" },
    { name: "Branco Puro", hex: "#ffffff" },
    { name: "Off White", hex: "#f5f5f5" },
    { name: "Cinza Mescla", hex: "#808080" },
    { name: "Cinza Chumbo", hex: "#333333" },
    { name: "Azul Marinho", hex: "#001a4d" },
    { name: "Denim Classic", hex: "#1560bd" },
    { name: "Azul Bebê", hex: "#a2cffe" },
    { name: "Azul Royal", hex: "#002366" },
    { name: "Bege", hex: "#d2b48c" },
    { name: "Cáqui", hex: "#c3b091" },
    { name: "Marrom Chocolate", hex: "#3d1e1e" },
    { name: "Terracota", hex: "#e2725b" },
    { name: "Mostarda", hex: "#e1ad01" },
    { name: "Verde Militar", hex: "#4b5320" },
    { name: "Verde Esmeralda", hex: "#046307" },
    { name: "Verde Menta", hex: "#98ff98" },
    { name: "Oliva", hex: "#808000" },
    { name: "Vinho / Bordô", hex: "#4d0000" },
    { name: "Vermelho Vivo", hex: "#ff0000" },
    { name: "Rosa Pastel", hex: "#ffd1dc" },
    { name: "Pink / Fúcsia", hex: "#ff007f" },
    { name: "Roxo Profundo", hex: "#301934" },
    { name: "Lavanda", hex: "#e6e6fa" },
    { name: "Laranja Heritage", hex: "#ff8c00" }
];

let preferredColors = [];
let selectedClothing = [];
let scene, camera, renderer, controls;
const carParts = { bodyMaterials: [], glassMaterials: [], rimMaterials: [] };

const paletteContainer = document.getElementById('color-palette');
const viewport = document.getElementById('car-viewport');
const activeColorText = document.getElementById('active-color-text');

function initQuiz() {
    const grid = document.getElementById('quiz-options');
    const startBtn = document.getElementById('start-configurator');

    clothingBaseColors.forEach(color => {
        const opt = document.createElement('div');
        opt.className = 'quiz-opt';
        opt.style.backgroundColor = color.hex;
        opt.onclick = () => {
            if (selectedClothing.includes(color.hex)) {
                selectedClothing = selectedClothing.filter(c => c !== color.hex);
                opt.classList.remove('selected');
            } else if (selectedClothing.length < 3) {
                selectedClothing.push(color.hex);
                opt.classList.add('selected');
            }
            startBtn.disabled = selectedClothing.length !== 3;
        };
        grid.appendChild(opt);
    });

    startBtn.onclick = () => {
        document.getElementById('quiz-overlay').classList.add('hidden');
        processStyleToPalette();
        initEngine();
    };
}

function processStyleToPalette() {
    selectedClothing.forEach((hex, i) => {
        const color = new THREE.Color(hex);
        preferredColors.push({ name: `Your Style ${i+1}`, hex: hex });
        const sportHex = "#" + color.clone().offsetHSL(0, 0, 0.2).getHexString();
        preferredColors.push({ name: `Sport Mix ${i+1}`, hex: sportHex });
    });
}

function initEngine() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, viewport.clientWidth / viewport.clientHeight, 0.1, 100);
    camera.position.set(6, 3, -6);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    viewport.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loadingManager = new THREE.LoadingManager();

    loadingManager.onLoad = () => {
        console.log("Todos os recursos carregados. Renderizando...");
        document.getElementById('rendering-overlay').classList.add('hidden');
        initUI();
        animate();
    };

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainSpot = new THREE.SpotLight(0xffffff, 5);
    mainSpot.position.set(-5, 10, 5);
    scene.add(mainSpot);

    const exrLoader = new EXRLoader(loadingManager);
    exrLoader.load(filePaths.texture, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });

    const gltfLoader = new GLTFLoader(loadingManager);
    gltfLoader.load(filePaths.car, (gltf) => {
        const carModel = gltf.scene;
        carModel.position.set(0, -0.5, 0);
        applyColors(preferredColors[0].hex);
        
        carModel.traverse((child) => {
            if (child.isMesh) {
                const processMaterial = (mat) => {
                    if (!mat) return;
                    const matName = mat.name ? mat.name.toLowerCase() : '';

                    if (matName.includes('body')) {
                        mat.roughness = 0.2; 
                        mat.metalness = 0.8;
                        carParts.bodyMaterials.push(mat);
                    } else if (matName.includes('glass') || matName.includes('light')) {
                        mat.transparent = true; 
                        mat.opacity = 0.45;
                        mat.metalness = 0.9; 
                        mat.roughness = 0.1;
                        carParts.glassMaterials.push(mat);
                    } else if (child.name.toLowerCase().includes('tyre') && matName.includes('003')) {
                        mat.roughness = 0.3; 
                        mat.metalness = 0.8;
                        carParts.rimMaterials.push(mat);
                    }
                };
                
                if (Array.isArray(child.material)) {
                    child.material.forEach(processMaterial);
                } else {
                    processMaterial(child.material);
                }
            }
        });

        scene.add(carModel);
    });
}

function initUI() {
    paletteContainer.innerHTML = '';
    preferredColors.forEach((color, index) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color.hex;
        if (index === 0) swatch.classList.add('active');

        swatch.onclick = () => {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            activeColorText.textContent = `${color.name} selected`;
            applyColors(color.hex);
        };
        paletteContainer.appendChild(swatch);
    });
}

function applyColors(primaryHex) {
    const color = new THREE.Color(primaryHex);
    carParts.bodyMaterials.forEach(m => m.color.set(primaryHex));
    
    const glassColor = color.clone().lerp(new THREE.Color(0xffffff), 0.6);
    carParts.glassMaterials.forEach(m => m.color.copy(glassColor));
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = viewport.clientWidth / viewport.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
});

initQuiz();