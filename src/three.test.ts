import { ThreeJSAdapter, ThreeJS, Renderer, THREE } from './three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    OrbitControls: jest.fn()
}));

jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
    GLTFLoader: jest.fn()
}));

jest.mock('three/examples/jsm/loaders/EXRLoader.js', () => ({
    EXRLoader: jest.fn()
}));

describe('ThreeJSAdapter', () => {
    let mockThree: ThreeJS;
    let adapter: ThreeJSAdapter;

    const MockScene = jest.fn();
    const MockPerspectiveCamera = jest.fn();
    const MockWebGLRenderer = jest.fn();
    const MockColor = jest.fn();
    const MockLoadingManager = jest.fn();
    const MockAmbientLight = jest.fn();
    const MockSpotLight = jest.fn();

    class MockMesh {}
    class MockMeshStandardMaterial {}

    beforeEach(() => {
        jest.clearAllMocks();

        mockThree = {
            Scene: MockScene as unknown as new () => THREE.Scene,
            PerspectiveCamera: MockPerspectiveCamera as unknown as new (fov: number, aspect: number, near: number, far: number) => THREE.PerspectiveCamera,
            WebGLRenderer: MockWebGLRenderer as unknown as new (options?: THREE.WebGLRendererParameters) => THREE.WebGLRenderer,
            Color: MockColor as unknown as new (color?: string | number) => THREE.Color,
            LoadingManager: MockLoadingManager as unknown as new () => THREE.LoadingManager,
            AmbientLight: MockAmbientLight as unknown as new (color?: number | string, intensity?: number) => THREE.AmbientLight,
            SpotLight: MockSpotLight as unknown as new (color?: number | string, intensity?: number) => THREE.SpotLight,
            ACESFilmicToneMapping: 4 as THREE.ToneMapping,
            EquirectangularReflectionMapping: 303 as THREE.Mapping,
            Mesh: MockMesh as unknown as typeof THREE.Mesh,
            MeshStandardMaterial: MockMeshStandardMaterial as unknown as typeof THREE.MeshStandardMaterial
        };

        adapter = new ThreeJSAdapter(mockThree);
    });

    it('deve instanciar a Scene corretamente no construtor', () => {
        expect(MockScene).toHaveBeenCalledTimes(1);
    });

    it('deve retornar a instância da Scene criada', () => {
        const scene = adapter.scene();
        expect(scene).toBeInstanceOf(MockScene);
    });

    it('deve retornar a estrutura inicial de materials vazia', () => {
        const mats = adapter.materials();
        expect(mats).toEqual({
            bodyMaterials: [],
            glassMaterials: [],
            rimMaterials: []
        });
    });

    it('deve adicionar materiais corretamente nas respectivas listas usando addMaterial', () => {
        const fakeMaterial = { name: 'metal_paint' } as THREE.MeshStandardMaterial;

        adapter.addMaterial('bodyMaterials', fakeMaterial);
        adapter.addMaterial('glassMaterials', fakeMaterial);
        adapter.addMaterial('rimMaterials', fakeMaterial);

        const mats = adapter.materials();
        
        expect(mats.bodyMaterials).toContain(fakeMaterial);
        expect(mats.glassMaterials).toContain(fakeMaterial);
        expect(mats.rimMaterials).toContain(fakeMaterial);
        expect(mats.bodyMaterials.length).toBe(1);
    });

    it('deve instanciar o WebGLRenderer repassando as opções corretamente', () => {
        const options = { antialias: true, alpha: true };
        adapter.renderer(options);

        expect(MockWebGLRenderer).toHaveBeenCalledTimes(1);
        expect(MockWebGLRenderer).toHaveBeenCalledWith(options);
    });

    it('deve instanciar a PerspectiveCamera repassando os parâmetros corretamente', () => {
        const fov = 45;
        const aspect = 1.5;
        const near = 0.1;
        const far = 100;

        adapter.camera(fov, aspect, near, far);

        expect(MockPerspectiveCamera).toHaveBeenCalledTimes(1);
        expect(MockPerspectiveCamera).toHaveBeenCalledWith(fov, aspect, near, far);
    });

    it('deve instanciar o OrbitControls com a câmera e o DOM element corretos', () => {
        const mockCamera = {} as THREE.Camera;
        const mockRenderer: Renderer = {
            domElement: document.createElement('canvas')
        };

        adapter.controls(mockCamera, mockRenderer);

        expect(OrbitControls).toHaveBeenCalledTimes(1);
        expect(OrbitControls).toHaveBeenCalledWith(mockCamera, mockRenderer.domElement);
    });

    it('deve instanciar Color corretamente', () => {
        adapter.color('#ffffff');
        expect(MockColor).toHaveBeenCalledWith('#ffffff');
    });

    it('deve instanciar LoadingManager corretamente', () => {
        adapter.loadingManager();
        expect(MockLoadingManager).toHaveBeenCalled();
    });

    it('deve instanciar AmbientLight corretamente', () => {
        adapter.ambientLight(0xffffff, 0.5);
        expect(MockAmbientLight).toHaveBeenCalledWith(0xffffff, 0.5);
    });

    it('deve instanciar SpotLight corretamente', () => {
        adapter.spotLight(0xff0000, 2);
        expect(MockSpotLight).toHaveBeenCalledWith(0xff0000, 2);
    });

    it('deve retornar ACESFilmicToneMapping corretamente', () => {
        expect(adapter.acesFilmicToneMapping()).toBe(4);
    });

    it('deve retornar EquirectangularReflectionMapping corretamente', () => {
        expect(adapter.equirectangularReflectionMapping()).toBe(303);
    });

    it('deve verificar isMesh corretamente', () => {
        const meshInstance = new MockMesh();
        const plainObject = {};
        
        expect(adapter.isMesh(meshInstance)).toBe(true);
        expect(adapter.isMesh(plainObject)).toBe(false);
    });

    it('deve verificar isMeshStandardMaterial corretamente', () => {
        const matInstance = new MockMeshStandardMaterial();
        const plainObject = {};
        
        expect(adapter.isMeshStandardMaterial(matInstance)).toBe(true);
        expect(adapter.isMeshStandardMaterial(plainObject)).toBe(false);
    });

    it('deve instanciar GLTFLoader corretamente', () => {
        const manager = {} as THREE.LoadingManager;
        adapter.gltfLoader(manager);
        expect(GLTFLoader).toHaveBeenCalledWith(manager);
    });

    it('deve instanciar EXRLoader corretamente', () => {
        const manager = {} as THREE.LoadingManager;
        adapter.exrLoader(manager);
        expect(EXRLoader).toHaveBeenCalledWith(manager);
    });
});