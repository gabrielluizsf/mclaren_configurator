document.addEventListener('DOMContentLoaded', () => {
  const userLang = navigator.language || navigator.userLanguage;

  if (userLang.startsWith('pt')) {
    translateToPortuguese();
  }
});

function translateToPortuguese() {
  const translations = {
    '#quiz-overlay h2': 'ANALISADOR DE ESTILO',
    '#quiz-overlay p': 'Selecione as 3 cores de roupas que você usa com mais frequência:',
    '#start-configurator': 'GERAR CONFIGURAÇÃO PERSONALIZADA',

    'nav a.active': 'Aerodinâmica',

    '#paint-lab h2': 'LABORATÓRIO DE PINTURA',
    '#paint-lab p': 'Acabamento Exterior',
    '.mat-item': '<span class="material-symbols-outlined">palette</span> Sólido',
    '.component-selection label': 'Seleção de Componentes',
    '.comp-item p': 'Ativo: Painéis da Carroceria (Primário)',
    '#active-color-text': 'Aguardando Estilo...',
    '.palette-section label': 'Sua Paleta Personalizada',

    '.top-left h3': 'PERFORMANCE M838T (v2013)',
    '.data-disclaimer': '* Os dados podem estar desatualizados.',
    '.top-left .stat-row:nth-child(2) .stat-label': 'POTÊNCIA',
    '.top-left .stat-row:nth-child(3) .stat-label': '0-100 KM/H',
    '.top-left .stat-row:nth-child(4) .stat-label': '0-300 KM/H',
    '.top-left .stat-row:nth-child(5) .stat-label': 'VELOCIDADE MÁXIMA',

    '.top-right h3': 'MOTOR DE RENDERIZAÇÃO',
    '.hud-desc': 'Visualização do Componente:<br>Montagem Completa MP4-12C',

    '#loading-text': 'Construindo Geometria...',

    '.bottom-bar span:nth-child(1)': 'MODO: CONFIGURAÇÃO EXTERIOR',
    '.bottom-bar span:nth-child(2)': 'STATUS: SELECIONE O ACABAMENTO',
  };

  Object.keys(translations).forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      
      if (selector.includes('.mat-item') || selector.includes('.hud-desc')) {
        element.innerHTML = translations[selector];
      } else {
        element.textContent = translations[selector];
      }
    }
  });
}