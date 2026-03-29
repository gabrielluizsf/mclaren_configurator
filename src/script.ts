import { ThreeJSAdapter, THREE } from './three.js';

type MaterialFilePaths = {
    texture: string;
    car: string;
}

type BaseColor = {
    name: string;
    hex: string;
}

export const filePaths: MaterialFilePaths = {
    texture: './assets/docklands_01_4k.exr',
    car: './assets/mp4-12c_vehicle.glb'
};

export const clothingBaseColors: BaseColor[] = [
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

let preferredColors: BaseColor[] = [];
let selectedClothing: string[] = [];

const adapter = new ThreeJSAdapter(THREE as any);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: any;

export function initQuiz(): void {
    const grid = document.getElementById('quiz-options') as HTMLElement;
    const startBtn = document.getElementById('start-configurator') as HTMLButtonElement;
    const quizOverlay = document.getElementById('quiz-overlay') as HTMLElement;

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
        quizOverlay.classList.add('hidden');
        processStyleToPalette();
        initEngine();
    };
}

export function processStyleToPalette(): void {
    selectedClothing.forEach((hex, i) => {
        const color = adapter.color(hex);
        preferredColors.push({ name: `Your Style ${i + 1}`, hex: hex });
        
        const sportHex = "#" + color.clone().offsetHSL(0, 0, 0.2).getHexString();
        preferredColors.push({ name: `Sport Mix ${i + 1}`, hex: sportHex });
    });
}

export function initEngine(): void {
    const viewport = document.getElementById('car-viewport') as HTMLElement;
    scene = adapter.scene();
    
    const aspect = viewport.clientWidth / viewport.clientHeight;
    camera = adapter.camera(45, aspect, 0.1, 100);
    camera.position.set(6, 3, -6);

    renderer = adapter.renderer({ antialias: true, alpha: true });
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = adapter.acesFilmicToneMapping();
    renderer.toneMappingExposure = 1.2;
    viewport.appendChild(renderer.domElement);

    controls = adapter.controls(camera, renderer);
    controls.enableDamping = true;

    const loadingManager = adapter.loadingManager();
    const renderingOverlay = document.getElementById('rendering-overlay') as HTMLElement;

    loadingManager.onLoad = () => {
        renderingOverlay.classList.add('hidden');
        initUI();
        animate();
    };

    scene.add(adapter.ambientLight(0xffffff, 0.6));
    const mainSpot = adapter.spotLight(0xffffff, 5);
    mainSpot.position.set(-5, 10, 5);
    scene.add(mainSpot);

    const exrLoader = adapter.exrLoader(loadingManager);
    exrLoader.load(filePaths.texture, (texture: any) => {
        texture.mapping = adapter.equirectangularReflectionMapping();
        scene.environment = texture;
    });

    const gltfLoader = adapter.gltfLoader(loadingManager);
    gltfLoader.load(filePaths.car, (gltf: any) => {
        const carModel = gltf.scene;
        carModel.position.set(0, -0.5, 0);
        
        carModel.traverse((child: any) => {
            if (adapter.isMesh(child)) {
                const processMaterial = (mat: any) => {
                    if (!adapter.isMeshStandardMaterial(mat)) return;
                    
                    const matName = mat.name ? mat.name.toLowerCase() : '';
                    const childName = child.name.toLowerCase();

                    if (matName.includes('body')) {
                        mat.roughness = 0.2; 
                        mat.metalness = 0.8;
                        adapter.addMaterial('bodyMaterials', mat);
                    } else if (matName.includes('glass') || matName.includes('light')) {
                        mat.transparent = true; 
                        mat.opacity = 0.45;
                        mat.metalness = 0.9; 
                        mat.roughness = 0.1;
                        adapter.addMaterial('glassMaterials', mat);
                    } else if (childName.includes('tyre') && matName.includes('003')) {
                        mat.roughness = 0.3; 
                        mat.metalness = 0.8;
                        adapter.addMaterial('rimMaterials', mat);
                    }
                };
                
                if (Array.isArray(child.material)) {
                    child.material.forEach(processMaterial);
                } else {
                    processMaterial(child.material);
                }
            }
        });

        if (preferredColors.length > 0) applyColors(preferredColors[0].hex);
        scene.add(carModel);
    });
}

export function initUI(): void {
    const paletteContainer = document.getElementById('color-palette') as HTMLElement;
    const activeColorText = document.getElementById('active-color-text') as HTMLElement;
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

export function applyColors(primaryHex: string): void {
    const color = adapter.color(primaryHex);
    const mats = adapter.materials();

    mats.bodyMaterials.forEach(m => m.color.set(primaryHex));
    
    const glassColor = color.clone().lerp(adapter.color(0xffffff), 0.6);
    mats.glassMaterials.forEach(m => m.color.copy(glassColor));
}

export function animate(): void {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    const viewport = document.getElementById('car-viewport') as HTMLElement;
    
    if (!camera || !renderer || !viewport) return;
    camera.aspect = viewport.clientWidth / viewport.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
});

initQuiz();