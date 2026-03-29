import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export { THREE };

export interface ThreeJS {
    Scene: new () => THREE.Scene;
    PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => THREE.PerspectiveCamera;
    WebGLRenderer: new (options?: THREE.WebGLRendererParameters) => THREE.WebGLRenderer;
    Color: new (color?: string | number) => THREE.Color;
    LoadingManager: new () => THREE.LoadingManager;
    AmbientLight: new (color?: number | string, intensity?: number) => THREE.AmbientLight;
    SpotLight: new (color?: number | string, intensity?: number) => THREE.SpotLight;
    ACESFilmicToneMapping: THREE.ToneMapping;
    EquirectangularReflectionMapping: THREE.Mapping;
    Mesh: typeof THREE.Mesh;
    MeshStandardMaterial: typeof THREE.MeshStandardMaterial;
}

export type MeshStandardMaterials = {
    bodyMaterials: THREE.MeshStandardMaterial[];
    glassMaterials: THREE.MeshStandardMaterial[];
    rimMaterials: THREE.MeshStandardMaterial[];
}

export interface Renderer {
    domElement: HTMLCanvasElement;
}

export class ThreeJSAdapter {
    private bodyMaterials: THREE.MeshStandardMaterial[] = [];
    private glassMaterials: THREE.MeshStandardMaterial[] = [];
    private rimMaterials: THREE.MeshStandardMaterial[] = [];
    private sceneInstance: THREE.Scene;

    constructor(private three: ThreeJS) { 
        this.sceneInstance = new this.three.Scene();
    }

    materials(): MeshStandardMaterials {
        return {
            bodyMaterials: this.bodyMaterials,
            glassMaterials: this.glassMaterials,
            rimMaterials: this.rimMaterials
        }
    }

    addMaterial(type: keyof MeshStandardMaterials, material: THREE.MeshStandardMaterial) {
        this.materials()[type].push(material);
    }

    scene(): THREE.Scene {
        return this.sceneInstance;
    }

    renderer(options?: THREE.WebGLRendererParameters): THREE.WebGLRenderer {
        return new this.three.WebGLRenderer(options);
    }

    camera(fov: number, aspect: number, near: number, far: number): THREE.PerspectiveCamera {
        return new this.three.PerspectiveCamera(fov, aspect, near, far);
    }

    controls(camera: THREE.Camera, renderer: Renderer): OrbitControls {
        return new OrbitControls(camera, renderer.domElement);
    }

    color(value?: string | number): THREE.Color {
        return new this.three.Color(value);
    }

    loadingManager(): THREE.LoadingManager {
        return new this.three.LoadingManager();
    }

    ambientLight(color?: number | string, intensity?: number): THREE.AmbientLight {
        return new this.three.AmbientLight(color, intensity);
    }

    spotLight(color?: number | string, intensity?: number): THREE.SpotLight {
        return new this.three.SpotLight(color, intensity);
    }

    acesFilmicToneMapping(): THREE.ToneMapping {
        return this.three.ACESFilmicToneMapping;
    }

    equirectangularReflectionMapping(): THREE.Mapping {
        return this.three.EquirectangularReflectionMapping;
    }

    isMesh(obj: any): obj is THREE.Mesh {
        return obj instanceof this.three.Mesh;
    }

    isMeshStandardMaterial(mat: any): mat is THREE.MeshStandardMaterial {
        return mat instanceof this.three.MeshStandardMaterial;
    }

    gltfLoader(manager?: THREE.LoadingManager): GLTFLoader {
        return new GLTFLoader(manager);
    }

    exrLoader(manager?: THREE.LoadingManager): EXRLoader {
        return new EXRLoader(manager);
    }
}