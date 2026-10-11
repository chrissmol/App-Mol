import { watchProtectedPage } from '../modules/auth.js';
import { setupAppShell } from '../utils/app-shell.js';
import { mountAssistantChat } from '../utils/assistant-chat.js';

setupAppShell();

let mounted = false;
watchProtectedPage(user => {
  if (!user || mounted) return;
  mounted = true;
  mountAssistantChat(document.getElementById('assistant-chat'), {
    intro: 'Oi! Eu respondo sobre treino, exercícios, alimentos e dieta, e posso **ajustar seus dados por você**: trocar alimentos, montar rotinas, registrar o peso ou importar uma dieta de foto, PDF ou planilha. Nada muda sem você confirmar.',
    suggestions: [
      'Quanto de proteína tem no peito de frango?',
      'Qual a diferença entre supino reto e inclinado?',
      'Como está a minha dieta hoje?',
      'Registra meu peso de hoje'
    ]
  });
});
