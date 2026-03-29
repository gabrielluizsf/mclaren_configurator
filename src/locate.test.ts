import { translateToPortuguese } from "./locale"; 

describe("Suíte de Testes: Tradução para Português", () => {
  
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it("deve traduzir elementos simples usando textContent", () => {
    document.body.innerHTML = `
      <div id="quiz-overlay">
        <h2>Original Title</h2>
        <p>Original Paragraph</p>
      </div>
      <button id="start-configurator">Original Button</button>
    `;

    translateToPortuguese();

    expect(document.querySelector('#quiz-overlay h2')?.textContent).toBe('ANALISADOR DE ESTILO');
    expect(document.querySelector('#start-configurator')?.textContent).toBe('GERAR CONFIGURAÇÃO PERSONALIZADA');
  });

  it("deve usar innerHTML especificamente para .mat-item e .hud-desc", () => {
    document.body.innerHTML = `
      <div class="mat-item">Original</div>
      <div class="hud-desc">Original</div>
    `;

    translateToPortuguese();

    const matItem = document.querySelector('.mat-item');
    expect(matItem?.querySelector('span')).toBeTruthy();
    expect(matItem?.innerHTML).toBe('<span class="material-symbols-outlined">palette</span> Sólido');

    const hudDesc = document.querySelector('.hud-desc');
    expect(hudDesc?.innerHTML.includes('<br>')).toBeTruthy();
  });

  it("deve traduzir atributos de dados (data-i18n)", () => {
    document.body.innerHTML = `
      <div data-i18n="perf_title">Performance</div>
      <div data-i18n="power">Power</div>
    `;

    translateToPortuguese();

    expect(document.querySelector('[data-i18n="perf_title"]')?.textContent).toBe('PERFORMANCE M838T (v2013)');
    expect(document.querySelector('[data-i18n="power"]')?.textContent).toBe('POTÊNCIA');
  });

  it("não deve quebrar se um seletor não existir na página", () => {
    document.body.innerHTML = '';
    
    expect(() => {
      translateToPortuguese();
    }).not.toThrow();
  });

  it("deve traduzir seletores complexos como nth-child", () => {
    document.body.innerHTML = `
      <div class="bottom-bar">
        <span>Mode</span>
        <span>Status</span>
      </div>
    `;

    translateToPortuguese();

    const spans = document.querySelectorAll('.bottom-bar span');
    expect(spans[0].textContent).toBe('MODO: CONFIGURAÇÃO EXTERIOR');
    expect(spans[1].textContent).toBe('STATUS: SELECIONE O ACABAMENTO');
  });
});