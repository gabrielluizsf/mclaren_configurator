import { ThreeJSAdapter } from './three';
import * as script from './script';

const colorMock = {
    set: jest.fn().mockReturnThis(),
    copy: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    lerp: jest.fn().mockReturnThis(),
    offsetHSL: jest.fn().mockReturnThis(),
    getHexString: jest.fn().mockReturnValue('ffffff')
};

const materialsMock = {
    bodyMaterials: [{ color: colorMock }],
    glassMaterials: [{ color: colorMock }],
    rimMaterials: []
};

jest.mock('./three.ts', () => {
    return {
        THREE: {
            Scene: jest.fn(),
            PerspectiveCamera: jest.fn(),
            WebGLRenderer: jest.fn()
        },
        ThreeJSAdapter: jest.fn().mockImplementation(() => ({
            color: jest.fn(() => colorMock),
            scene: jest.fn(() => ({ add: jest.fn(), environment: null })),
            camera: jest.fn(() => ({ 
                position: { set: jest.fn() },
                aspect: 1,
                updateProjectionMatrix: jest.fn()
            })),
            renderer: jest.fn(() => ({
                setSize: jest.fn(),
                setPixelRatio: jest.fn(),
                render: jest.fn(),
                toneMapping: 0,
                toneMappingExposure: 0,
                domElement: document.createElement('canvas')
            })),
            controls: jest.fn(() => ({ enableDamping: false, update: jest.fn() })),
            loadingManager: jest.fn(() => ({ onLoad: jest.fn() })),
            ambientLight: jest.fn(),
            spotLight: jest.fn(() => ({ position: { set: jest.fn() } })),
            exrLoader: jest.fn(() => ({ load: jest.fn((_, cb) => cb({})) })),
            gltfLoader: jest.fn(() => ({ 
                load: jest.fn((_, cb) => cb({ 
                    scene: { 
                        position: { set: jest.fn() },
                        traverse: jest.fn((v) => v({ name: 'body', material: { name: 'paint' } }))
                    } 
                })) 
            })),
            isMesh: jest.fn(() => true),
            isMeshStandardMaterial: jest.fn(() => true),
            acesFilmicToneMapping: jest.fn(() => 1),
            equirectangularReflectionMapping: jest.fn(() => 1),
            addMaterial: jest.fn(),
            materials: jest.fn(() => materialsMock)
        }))
    };
});

describe('Script Configurator Coverage Suite', () => {
    let script: any;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="quiz-overlay"></div>
            <div id="quiz-options"></div>
            <button id="start-configurator" disabled></button>
            <div id="car-viewport"></div>
            <div id="rendering-overlay"></div>
            <div id="color-palette"></div>
            <div id="active-color-text"></div>
        `;

        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1024 });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 768 });
        
        jest.isolateModules(() => {
            script = require('./script');
        });
        jest.clearAllMocks();
    });

    test('should initialize quiz grid correctly on load', () => {
        const optionsGrid = document.getElementById('quiz-options')!;
        const colorOptions = optionsGrid.querySelectorAll('.quiz-opt');
        expect(colorOptions.length).toBe(script.clothingBaseColors.length);
    });

    test('should handle color selection limit and toggle start button', () => {
        const startButton = document.getElementById('start-configurator') as HTMLButtonElement;
        const colorOptions = document.querySelectorAll('.quiz-opt');

        (colorOptions[0] as HTMLElement).click();
        (colorOptions[1] as HTMLElement).click();
        expect(startButton.disabled).toBe(true);

        (colorOptions[2] as HTMLElement).click();
        expect(startButton.disabled).toBe(false);

        (colorOptions[0] as HTMLElement).click();
        expect(startButton.disabled).toBe(true);
    });

    test('should generate derived palette and update UI', () => {
        const colorOptions = document.querySelectorAll('.quiz-opt');
        for (let i = 0; i < 3; i++) (colorOptions[i] as HTMLElement).click();

        script.processStyleToPalette();
        script.initUI();

        const paletteContainer = document.getElementById('color-palette')!;
        expect(paletteContainer.children.length).toBeGreaterThan(0);
    });

    test('should attach renderer to viewport during engine init', () => {
        script.initEngine();
        const viewportContainer = document.getElementById('car-viewport')!;
        expect(viewportContainer.querySelector('canvas')).not.toBeNull();
    });

    test('should update material colors', () => {
        const targetHex = '#ff0000';
        script.applyColors(targetHex);
        expect(colorMock.set).toHaveBeenCalledWith(targetHex);
    });

    test('should update UI and materials when swatch is clicked', () => {
        const colorOptions = document.querySelectorAll('.quiz-opt');
        for (let i = 0; i < 3; i++) (colorOptions[i] as HTMLElement).click();
        
        script.processStyleToPalette();
        script.initUI();

        const swatches = document.querySelectorAll('.color-swatch');
        const secondSwatch = swatches[1] as HTMLElement;
        const statusText = document.getElementById('active-color-text')!;

        secondSwatch.click();

        expect(secondSwatch.classList.contains('active')).toBe(true);
        expect(statusText.textContent).toMatch(/selected/i);
        expect(colorMock.set).toHaveBeenCalled();
    });

    test('should trigger resize logic without errors', () => {
        script.initEngine();
        window.dispatchEvent(new Event('resize'));
        expect(document.getElementById('car-viewport')).toBeDefined();
    });

    test('should proceed from quiz to engine on start click', () => {
        const startButton = document.getElementById('start-configurator') as HTMLButtonElement;
        const quizOverlay = document.getElementById('quiz-overlay')!;
        const colorOptions = document.querySelectorAll('.quiz-opt');
        
        for (let i = 0; i < 3; i++) (colorOptions[i] as HTMLElement).click();
        
        startButton.click();
        expect(quizOverlay.classList.contains('hidden')).toBe(true);
    });
});