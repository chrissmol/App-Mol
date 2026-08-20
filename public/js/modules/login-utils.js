export function authErrorMessage(error) {
  const messages = {
    'auth/popup-closed-by-user': 'Login cancelado. Tente novamente quando quiser.',
    'auth/cancelled-popup-request': 'A tentativa anterior foi cancelada. Tente novamente.',
    'auth/network-request-failed': 'Sem conexão com a internet. Verifique sua rede.',
    'auth/popup-blocked': 'Seu navegador bloqueou a janela de login.',
    'auth/unauthorized-domain': 'Este endereço ainda não está autorizado para login.',
    'auth/too-many-requests': 'Muitas tentativas foram feitas. Aguarde alguns minutos e tente novamente.',
    'auth/account-exists-with-different-credential': 'Já existe uma conta com este e-mail usando outra forma de acesso.',
    'auth/operation-not-allowed': 'O login com Google não está disponível no momento.'
  };
  return messages[error?.code] || 'Não foi possível entrar agora. Tente novamente.';
}

export function withTimeout(promise, milliseconds = 60000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('Tempo de autenticação esgotado.'), { code: 'auth/timeout' })), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}

export const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Termos de Uso',
    updated: 'Atualizado em 19 de agosto de 2026',
    sections: [
      ['1. Aceitação', 'Ao entrar ou usar o Mol, você aceita estes termos. Se não concordar, não utilize o aplicativo.'],
      ['2. Finalidade do serviço', 'O Mol permite organizar treinos, alimentação, medidas e evolução pessoal. Os recursos são informativos e de organização.'],
      ['3. Saúde e segurança', 'O Mol não substitui diagnóstico, prescrição ou acompanhamento médico, nutricional ou de educação física. Interrompa atividades que causem dor, tontura ou mal-estar e procure um profissional qualificado.'],
      ['4. Sua conta', 'Você é responsável pela conta Google utilizada, pela exatidão dos dados registrados e por impedir acesso não autorizado ao seu dispositivo.'],
      ['5. Uso permitido', 'Não use o serviço para violar leis, prejudicar terceiros, tentar acessar contas alheias ou interferir na segurança e disponibilidade do aplicativo.'],
      ['6. Seus dados e conteúdo', 'Os registros inseridos continuam associados à sua conta. Você pode exportá-los ou solicitar a exclusão da conta em Configurações.'],
      ['7. Disponibilidade', 'O serviço pode sofrer manutenção, indisponibilidade de rede ou alterações. Recursos podem evoluir sem garantia de funcionamento ininterrupto.'],
      ['8. Responsabilidade', 'Você decide como aplicar as informações do aplicativo e deve respeitar seus limites e orientações profissionais. Nada nestes termos exclui direitos garantidos pela legislação brasileira.'],
      ['9. Alterações e contato', 'Mudanças relevantes serão apresentadas com nova data de atualização. Dúvidas podem ser encaminhadas pelo canal de suporte informado no aplicativo.']
    ]
  },
  privacy: {
    title: 'Política de Privacidade',
    updated: 'Atualizada em 19 de agosto de 2026',
    sections: [
      ['1. Dados tratados', 'Tratamos identificação da conta Google, e-mail, foto, preferências, treinos, alimentação, medidas, fotos corporais e demais informações que você decide registrar.'],
      ['2. Finalidades', 'Usamos os dados para autenticar sua conta, salvar e sincronizar registros, personalizar metas, produzir resumos de evolução, manter segurança e atender solicitações do usuário.'],
      ['3. Dados de saúde', 'Medidas, alimentação, fotos e atividade física podem revelar informações sensíveis. O tratamento ocorre para fornecer as funcionalidades solicitadas por você e deve ser interrompido pela exclusão desses registros ou da conta quando você não desejar mantê-los.'],
      ['4. Serviços utilizados', 'Autenticação e armazenamento utilizam serviços Google Firebase. Esses fornecedores podem processar dados técnicos de conexão conforme seus próprios termos e medidas de segurança.'],
      ['5. Compartilhamento', 'Não vendemos seus dados. Eles podem ser compartilhados com prestadores necessários à operação, por obrigação legal ou para proteger direitos e segurança.'],
      ['6. Armazenamento e retenção', 'Os dados permanecem vinculados à conta enquanto ela estiver ativa ou pelo período necessário ao serviço e às obrigações legais. Registros excluídos podem permanecer temporariamente em cópias de segurança.'],
      ['7. Segurança', 'Aplicamos autenticação e regras de acesso por usuário, mas nenhum sistema conectado à internet elimina todos os riscos. Proteja sua conta Google e seu dispositivo.'],
      ['8. Seus direitos', 'Você pode acessar, corrigir, exportar e excluir dados pelas telas do aplicativo. Também pode solicitar informações sobre tratamento, revogar consentimentos aplicáveis e exercer direitos previstos na LGPD.'],
      ['9. Crianças e adolescentes', 'O Mol não é direcionado a crianças. Menores de idade devem utilizar o serviço somente com participação e autorização do responsável legal.'],
      ['10. Contato e alterações', 'Solicitações de privacidade devem usar o canal de suporte informado no aplicativo. Alterações relevantes terão nova data e serão comunicadas de forma adequada.']
    ]
  }
};
