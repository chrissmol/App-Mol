import { EXTRA_PATTERNS, EXTRA_STRINGS } from './language-extra.js';
const STORAGE_KEY = 'mol-accessibility';
const LEGACY_LANGUAGE_KEY = 'mol-language';

export const supportedLanguages = [
  { code: 'pt-BR', label: 'Português', shortLabel: 'PT' },
  { code: 'en-US', label: 'English', shortLabel: 'EN' },
  { code: 'es-ES', label: 'Español', shortLabel: 'ES' }
];

const languageSet = new Set(supportedLanguages.map(language => language.code));

const dictionary = {
  'pt-BR': {},
  'en-US': {
    home: 'Home',
    workout: 'Training',
    diet: 'Diet',
    mealPrep: 'Meal prep',
    assistant: 'Assistant',
    profile: 'Profile',
    'Mol': 'Mol',
    'Sistema': 'System',
    'Português': 'Portuguese',
    'Español': 'Spanish',
    'Carregando': 'Loading',
    'Olá,': 'Hello,',
    'Atleta': 'Athlete',
    'Editar painel': 'Edit dashboard',
    'Treino de hoje': "Today's workout",
    'Organize seu treino': 'Organize your training',
    'Crie sua primeira rotina para começar.': 'Create your first routine to get started.',
    'Ver treinos': 'View workouts',
    'Esta semana': 'This week',
    'Carregando histórico…': 'Loading history…',
    'Histórico': 'History',
    'sessões': 'sessions',
    'kg volume': 'kg volume',
    'semanas': 'weeks',
    'Progresso': 'Progress',
    'Seu desempenho aparecerá aqui.': 'Your performance will appear here.',
    'Início': 'Home',
    'Treino': 'Training',
    'Dieta': 'Diet',
    'Perfil': 'Profile',
    'Área privada': 'Private area',
    'Monitoramento': 'Monitoring',
    'Usuários ativos e erros reportados pelo navegador.': 'Active users and browser-reported errors.',
    'Verificando acesso…': 'Checking access…',
    'Ativos agora': 'Active now',
    'Erros registrados': 'Logged errors',
    'Usuários ao vivo': 'Live users',
    'Erros recentes': 'Recent errors',
    'Limpar lista': 'Clear list',
    'Preferências': 'Preferences',
    'Configurações': 'Settings',
    'Personalize a experiência e gerencie sua conta.': 'Customize the experience and manage your account.',
    'Acessibilidade': 'Accessibility',
    'Aparência': 'Appearance',
    'Tema': 'Theme',
    'Contraste elevado': 'High contrast',
    'Reforça a separação entre elementos.': 'Strengthens separation between elements.',
    'Texto ampliado': 'Larger text',
    'Aumenta os textos em todo o app.': 'Increases text size across the app.',
    'Reduzir movimento': 'Reduce motion',
    'Diminui animações e transições para mais conforto.': 'Reduces animations and transitions for more comfort.',
    'Idioma': 'Language',
    'Neste aparelho': 'On this device',
    'Offline e lembretes': 'Offline and reminders',
    'Disponível sem internet': 'Available offline',
    'Guarda treinos e dados acessados neste aparelho. Ative somente em um dispositivo pessoal.': 'Stores workouts and accessed data on this device. Enable only on a personal device.',
    'Lembretes no aparelho': 'Device reminders',
    'Avisa enquanto o Mol estiver aberto. No iPhone, instale na Tela de Início para permitir notificações.': 'Notifies while Mol is open. On iPhone, add it to the Home Screen to allow notifications.',
    'Refeição': 'Meal',
    'Enviar lembrete de teste': 'Send test reminder',
    'As preferências valem somente para este aparelho.': 'These preferences apply only to this device.',
    'Aplicativo': 'App',
    'Atualização e armazenamento': 'Update and storage',
    'Resolva telas desatualizadas ou limpe dados temporários deste aparelho sem apagar sua conta.': 'Fix outdated screens or clear temporary data from this device without deleting your account.',
    'Atualizar aplicativo': 'Update app',
    'Limpar dados temporários': 'Clear temporary data',
    'Conta': 'Account',
    'Sessão e segurança': 'Session and security',
    'Conta conectada': 'Connected account',
    'Carregando…': 'Loading…',
    'Sair desta conta': 'Sign out of this account',
    'Zona de risco': 'Danger zone',
    'Exclui permanentemente perfil, treinos, sessões, pesos e dieta.': 'Permanently deletes profile, workouts, sessions, weights and diet.',
    'Excluir conta e dados': 'Delete account and data',
    'Seu perfil': 'Your profile',
    'Dados e metas': 'Data and goals',
    'Mantenha suas referências pessoais e objetivos atualizados.': 'Keep your personal references and goals up to date.',
    'Carregando seus dados…': 'Loading your data…',
    'Referências': 'References',
    'Corpo e objetivos': 'Body and goals',
    'Altura (cm)': 'Height (cm)',
    'Meta de peso (kg)': 'Weight goal (kg)',
    'Objetivo': 'Goal',
    'Selecione': 'Select',
    'Hipertrofia': 'Hypertrophy',
    'Força': 'Strength',
    'Emagrecimento': 'Weight loss',
    'Saúde': 'Health',
    'Meta semanal de treinos': 'Weekly workout goal',
    'Salvar dados': 'Save data',
    'Unidades': 'Units',
    'Sistema métrico': 'Metric system',
    'Quilogramas e centímetros': 'Kilograms and centimeters',
    'Padrão atual do Mol': 'Current Mol standard',
    'O Mol usa o sistema métrico em treinos, gráficos e históricos para manter todos os registros consistentes.': 'Mol uses the metric system in workouts, charts and history to keep all records consistent.',
    'Privacidade': 'Privacy',
    'Dados privados': 'Private data',
    'O Mol não possui perfil público nem compartilhamento de estatísticas. Seus registros são acessíveis somente pela sua conta autenticada.': 'Mol does not have public profiles or statistics sharing. Your records are only accessible by your authenticated account.',
    'Seus dados': 'Your data',
    'Backup pessoal': 'Personal backup',
    'Exporte perfil, treinos, sessões, pesos e dieta. A restauração preserva IDs, evita duplicações e não apaga dados existentes.': 'Export profile, workouts, sessions, weights and diet. Restore keeps IDs, avoids duplicates and does not delete existing data.',
    'Exportar backup': 'Export backup',
    'Arquivo de backup': 'Backup file',
    'Selecione um arquivo JSON gerado pelo Mol.': 'Select a JSON file generated by Mol.',
    'Restaurar backup': 'Restore backup',
    'Nutrição diária': 'Daily nutrition',
    'Planeje refeições e acompanhe seus nutrientes.': 'Plan meals and track your nutrients.',
    'Carregando sua dieta…': 'Loading your diet…',
    'Visualização': 'View',
    'Edição': 'Edit',
    'Resumo do dia': 'Daily summary',
    'Como está sua rotina': 'How your routine is going',
    'Metas nutricionais': 'Nutrition goals',
    'Planejado hoje': 'Planned today',
    'Meta: 2.400 kcal': 'Goal: 2,400 kcal',
    'Buscar alimento': 'Search food',
    'Plano alimentar': 'Meal plan',
    'Suas refeições': 'Your meals',
    'Valores são estimativas. Confira rótulos e siga a orientação do seu nutricionista.': 'Values are estimates. Check labels and follow your nutritionist’s guidance.',
    'Organização': 'Organization',
    'Editar sua dieta': 'Edit your diet',
    'Ajuste horários, nomes e alimentos sem perder o que já foi salvo.': 'Adjust times, names and foods without losing what is already saved.',
    'Nova refeição': 'New meal',
    'Consistência': 'Consistency',
    'Evolução': 'Evolution',
    'Acompanhe treinos, medidas e mudanças corporais.': 'Track workouts, measurements and body changes.',
    'Carregando sua evolução…': 'Loading your evolution…',
    'Meta da semana': 'Weekly goal',
    'concluído': 'completed',
    'Treinos por semana': 'Workouts per week',
    'Sequência atual': 'Current streak',
    'semanas completas': 'complete weeks',
    'Treinos concluídos': 'Completed workouts',
    'séries concluídas': 'completed sets',
    'Comparativo corporal': 'Body comparison',
    'Peso e meta': 'Weight and goal',
    'Sem meta': 'No goal',
    'Atual': 'Current',
    'Meta': 'Goal',
    'Medidas': 'Measurements',
    'Comparativo em centímetros': 'Comparison in centimeters',
    'Cintura': 'Waist',
    'Peito': 'Chest',
    'Braço': 'Arm',
    'Quadril': 'Hip',
    'Registrar medidas': 'Log measurements',
    'Progresso privado': 'Private progress',
    'Fotos de evolução': 'Progress photos',
    'As fotos são comprimidas e salvas no seu perfil. Máximo de 5 fotos.': 'Photos are compressed and saved to your profile. Maximum of 5 photos.',
    'Adicionar foto': 'Add photo',
    'Calendário': 'Calendar',
    'Toque em um dia verde para ver o resumo do treino.': 'Tap a green day to view the workout summary.',
    'Selecione um dia com treino.': 'Select a workout day.',
    'Conquistas': 'Achievements',
    'Badges': 'Badges',
    'desbloqueadas': 'unlocked',
    'Marcos conquistados no seu histórico de treino.': 'Milestones earned from your workout history.',
    'Peso mais recente': 'Latest weight',
    'Registrar peso': 'Log weight',
    'Salvar': 'Save',
    'Histórico de peso': 'Weight history',
    'Edite ou remova registros incorretos.': 'Edit or remove incorrect records.',
    'Relembre sua frequência e os resultados de cada treino.': 'Review your frequency and workout results.',
    'carregando histórico': 'loading history',
    'Volume acumulado': 'Total volume',
    'quilogramas movimentados': 'kilograms moved',
    'Carregando treinos…': 'Loading workouts…',
    'Mostrar todo o histórico': 'Show full history',
    'Atividade': 'Activity',
    'Sessões concluídas': 'Completed sessions',
    'Buscar no histórico': 'Search history',
    'Carregando sessões…': 'Loading sessions…',
    'Mostrar mais sessões': 'Show more sessions',
    'Treinos, dieta e evolução — tudo em um só lugar.': 'Training, diet and progress — all in one place.',
    'Continuar com Google': 'Continue with Google',
    'SEGURO E GRATUITO': 'SECURE AND FREE',
    'Ao continuar, você concorda com os': 'By continuing, you agree to Mol’s',
    'Termos de Uso': 'Terms of Use',
    'e a': 'and',
    'Política de Privacidade': 'Privacy Policy',
    'do Mol.': '.',
    'Meu Perfil': 'My Profile',
    'Carregando sua jornada…': 'Loading your journey…',
    'Sua jornada': 'Your journey',
    'Resumo da sua jornada': 'Journey summary',
    'treinos': 'workouts',
    'séries': 'sets',
    'treinando': 'training',
    'Seus marcos': 'Your milestones',
    'Ver todas as conquistas': 'View all achievements',
    'Atalhos': 'Shortcuts',
    'Usuários ativos e erros do app': 'Active users and app errors',
    'Dados pessoais e metas': 'Personal data and goals',
    'Objetivos, preferências, medidas e backup': 'Goals, preferences, measurements and backup',
    'Evolução corporal': 'Body progress',
    'Peso, medidas e progresso ao longo do tempo': 'Weight, measurements and progress over time',
    'Acessibilidade, notificações e conta': 'Accessibility, notifications and account',
    'Sair da conta': 'Sign out',
    'Desempenho': 'Performance',
    'Entenda a distribuição dos treinos e acompanhe suas melhores marcas.': 'Understand workout distribution and track your best marks.',
    'séries em 7 dias': 'sets in 7 days',
    'grupos treinados': 'trained groups',
    'exercícios monitorados': 'tracked exercises',
    '7 dias': '7 days',
    '30 dias': '30 days',
    '90 dias': '90 days',
    'Leitura do período': 'Period reading',
    'Equilíbrio do treino': 'Workout balance',
    'Analisando distribuição…': 'Analyzing distribution…',
    'Últimos 7 dias': 'Last 7 days',
    'Séries por grupo muscular': 'Sets by muscle group',
    'Séries concluídas, sem contar aquecimentos.': 'Completed sets, excluding warm-ups.',
    'Carregando distribuição…': 'Loading distribution…',
    'Tendência': 'Trend',
    'Evolução por exercício': 'Exercise progress',
    'Compara a primeira e a sessão mais recente no período pela estimativa de força. Use como referência, não como diagnóstico.': 'Compares the first and latest session in the period by estimated strength. Use as reference, not diagnosis.',
    'Calculando tendências…': 'Calculating trends…',
    'Melhores marcas': 'Best marks',
    'Recordes pessoais': 'Personal records',
    'Melhor estimativa de cada exercício, com até 15 repetições. Exercícios diferentes não são comparados entre si.': 'Best estimate for each exercise, up to 15 reps. Different exercises are not compared against each other.',
    'Carregando recordes…': 'Loading records…',
    'Ver histórico': 'View history',
    'Revise cada sessão.': 'Review each session.',
    'Biblioteca pessoal': 'Personal library',
    'Organize suas rotinas e registre cada sessão.': 'Organize your routines and log each session.',
    'Nova Rotina': 'New Routine',
    'Usar um modelo': 'Use a template',
    'Buscar rotinas': 'Search routines',
    'Minhas Rotinas': 'My Routines',
    'Carregando seus treinos…': 'Loading your workouts…',
    'Nome do Treino': 'Workout name',
    'Concluir': 'Finish',
    'Adicionar Exercício': 'Add Exercise',
    'Criar Rotina': 'Create Routine',
    'Nome da rotina': 'Routine name',
    'Dias da semana': 'Weekdays',
    '(opcional)': '(optional)',
    'Use apenas se quiser que esta rotina apareça como treino sugerido do dia.': 'Use only if you want this routine to appear as the suggested workout of the day.',
    'Segunda': 'Monday',
    'Terça': 'Tuesday',
    'Quarta': 'Wednesday',
    'Quinta': 'Thursday',
    'Sexta': 'Friday',
    'Sábado': 'Saturday',
    'Domingo': 'Sunday',
    'Modelos de treino': 'Workout templates',
    'Preparando modelos…': 'Preparing templates…',
    'Exercícios': 'Exercises',
    'Buscar exercício': 'Search exercise',
    'Todos': 'All',
    'Costas': 'Back',
    'Quadríceps': 'Quadriceps',
    'Posterior': 'Hamstrings',
    'Glúteos': 'Glutes',
    'Ombros': 'Shoulders',
    'Braços': 'Arms',
    'Abdômen': 'Abs',
    'Descanso': 'Rest',
    'Pular': 'Skip',
    '+30 s': '+30 s',
    'Selecionar tipo de série': 'Select set type',
    'Série de Aquecimento': 'Warm-up Set',
    'Série Normal': 'Normal Set',
    'Série Falhada': 'Failure Set',
    'Série Drop': 'Drop Set',
    'Remover Série': 'Remove Set',
    offline: 'Offline',
    onlineAgain: 'Back online',
    offlineTrusted: 'Changes waiting to sync',
    offlineTemporary: 'Data available until you close the app',
    syncing: 'Syncing changes'
  },
  'es-ES': {
    home: 'Inicio',
    workout: 'Entreno',
    diet: 'Dieta',
    mealPrep: 'Preparación de comidas',
    assistant: 'Asistente',
    profile: 'Perfil',
    'Sistema': 'Sistema',
    'Português': 'Portugués',
    'Español': 'Español',
    'Carregando': 'Cargando',
    'Olá,': 'Hola,',
    'Atleta': 'Atleta',
    'Editar painel': 'Editar panel',
    'Treino de hoje': 'Entreno de hoy',
    'Organize seu treino': 'Organiza tu entrenamiento',
    'Crie sua primeira rotina para começar.': 'Crea tu primera rutina para empezar.',
    'Ver treinos': 'Ver entrenos',
    'Esta semana': 'Esta semana',
    'Carregando histórico…': 'Cargando historial…',
    'Histórico': 'Historial',
    'sessões': 'sesiones',
    'kg volume': 'kg volumen',
    'semanas': 'semanas',
    'Progresso': 'Progreso',
    'Seu desempenho aparecerá aqui.': 'Tu rendimiento aparecerá aquí.',
    'Início': 'Inicio',
    'Treino': 'Entreno',
    'Dieta': 'Dieta',
    'Perfil': 'Perfil',
    'Área privada': 'Área privada',
    'Monitoramento': 'Monitoreo',
    'Usuários ativos e erros reportados pelo navegador.': 'Usuarios activos y errores reportados por el navegador.',
    'Verificando acesso…': 'Verificando acceso…',
    'Ativos agora': 'Activos ahora',
    'Erros registrados': 'Errores registrados',
    'Usuários ao vivo': 'Usuarios en vivo',
    'Erros recentes': 'Errores recientes',
    'Limpar lista': 'Limpiar lista',
    'Preferências': 'Preferencias',
    'Configurações': 'Configuración',
    'Personalize a experiência e gerencie sua conta.': 'Personaliza la experiencia y gestiona tu cuenta.',
    'Acessibilidade': 'Accesibilidad',
    'Aparência': 'Apariencia',
    'Tema': 'Tema',
    'Contraste elevado': 'Alto contraste',
    'Reforça a separação entre elementos.': 'Refuerza la separación entre elementos.',
    'Texto ampliado': 'Texto ampliado',
    'Aumenta os textos em todo o app.': 'Aumenta los textos en toda la app.',
    'Reduzir movimento': 'Reducir movimiento',
    'Diminui animações e transições para mais conforto.': 'Reduce animaciones y transiciones para mayor comodidad.',
    'Idioma': 'Idioma',
    'Neste aparelho': 'En este dispositivo',
    'Offline e lembretes': 'Sin conexión y recordatorios',
    'Disponível sem internet': 'Disponible sin internet',
    'Guarda treinos e dados acessados neste aparelho. Ative somente em um dispositivo pessoal.': 'Guarda entrenos y datos accedidos en este dispositivo. Actívalo solo en un dispositivo personal.',
    'Lembretes no aparelho': 'Recordatorios del dispositivo',
    'Refeição': 'Comida',
    'Enviar lembrete de teste': 'Enviar recordatorio de prueba',
    'As preferências valem somente para este aparelho.': 'Las preferencias valen solo para este dispositivo.',
    'Aplicativo': 'Aplicación',
    'Atualização e armazenamento': 'Actualización y almacenamiento',
    'Atualizar aplicativo': 'Actualizar aplicación',
    'Limpar dados temporários': 'Limpiar datos temporales',
    'Conta': 'Cuenta',
    'Sessão e segurança': 'Sesión y seguridad',
    'Conta conectada': 'Cuenta conectada',
    'Carregando…': 'Cargando…',
    'Sair desta conta': 'Salir de esta cuenta',
    'Zona de risco': 'Zona de riesgo',
    'Excluir conta e dados': 'Eliminar cuenta y datos',
    'Seu perfil': 'Tu perfil',
    'Dados e metas': 'Datos y metas',
    'Referências': 'Referencias',
    'Corpo e objetivos': 'Cuerpo y objetivos',
    'Altura (cm)': 'Altura (cm)',
    'Meta de peso (kg)': 'Meta de peso (kg)',
    'Objetivo': 'Objetivo',
    'Selecione': 'Selecciona',
    'Hipertrofia': 'Hipertrofia',
    'Força': 'Fuerza',
    'Emagrecimento': 'Pérdida de peso',
    'Saúde': 'Salud',
    'Meta semanal de treinos': 'Meta semanal de entrenos',
    'Salvar dados': 'Guardar datos',
    'Unidades': 'Unidades',
    'Sistema métrico': 'Sistema métrico',
    'Privacidade': 'Privacidad',
    'Dados privados': 'Datos privados',
    'Seus dados': 'Tus datos',
    'Backup pessoal': 'Backup personal',
    'Exportar backup': 'Exportar backup',
    'Arquivo de backup': 'Archivo de backup',
    'Restaurar backup': 'Restaurar backup',
    'Nutrição diária': 'Nutrición diaria',
    'Planeje refeições e acompanhe seus nutrientes.': 'Planifica comidas y acompaña tus nutrientes.',
    'Carregando sua dieta…': 'Cargando tu dieta…',
    'Visualização': 'Vista',
    'Edição': 'Edición',
    'Resumo do dia': 'Resumen del día',
    'Metas nutricionais': 'Metas nutricionales',
    'Planejado hoje': 'Planificado hoy',
    'Buscar alimento': 'Buscar alimento',
    'Plano alimentar': 'Plan alimentario',
    'Suas refeições': 'Tus comidas',
    'Organização': 'Organización',
    'Editar sua dieta': 'Editar tu dieta',
    'Nova refeição': 'Nueva comida',
    'Consistência': 'Consistencia',
    'Evolução': 'Evolución',
    'Meta da semana': 'Meta semanal',
    'concluído': 'completado',
    'Treinos por semana': 'Entrenos por semana',
    'Sequência atual': 'Racha actual',
    'Treinos concluídos': 'Entrenos completados',
    'Comparativo corporal': 'Comparación corporal',
    'Peso e meta': 'Peso y meta',
    'Sem meta': 'Sin meta',
    'Atual': 'Actual',
    'Meta': 'Meta',
    'Medidas': 'Medidas',
    'Cintura': 'Cintura',
    'Peito': 'Pecho',
    'Braço': 'Brazo',
    'Quadril': 'Cadera',
    'Registrar medidas': 'Registrar medidas',
    'Fotos de evolução': 'Fotos de evolución',
    'Adicionar foto': 'Agregar foto',
    'Calendário': 'Calendario',
    'Conquistas': 'Logros',
    'Badges': 'Insignias',
    'Peso mais recente': 'Peso más reciente',
    'Registrar peso': 'Registrar peso',
    'Salvar': 'Guardar',
    'Histórico de peso': 'Historial de peso',
    'Mostrar todo o histórico': 'Mostrar todo el historial',
    'Atividade': 'Actividad',
    'Sessões concluídas': 'Sesiones completadas',
    'Buscar no histórico': 'Buscar en el historial',
    'Mostrar mais sessões': 'Mostrar más sesiones',
    'Continuar com Google': 'Continuar con Google',
    'Termos de Uso': 'Términos de Uso',
    'Política de Privacidade': 'Política de Privacidad',
    'Meu Perfil': 'Mi Perfil',
    'Sua jornada': 'Tu trayectoria',
    'treinos': 'entrenos',
    'séries': 'series',
    'treinando': 'entrenando',
    'Atalhos': 'Atajos',
    'Dados pessoais e metas': 'Datos personales y metas',
    'Evolução corporal': 'Evolución corporal',
    'Sair da conta': 'Salir de la cuenta',
    'Desempenho': 'Rendimiento',
    'séries em 7 dias': 'series en 7 días',
    'grupos treinados': 'grupos entrenados',
    'exercícios monitorados': 'ejercicios monitoreados',
    '7 dias': '7 días',
    '30 dias': '30 días',
    '90 dias': '90 días',
    'Equilíbrio do treino': 'Equilibrio del entreno',
    'Últimos 7 dias': 'Últimos 7 días',
    'Séries por grupo muscular': 'Series por grupo muscular',
    'Tendência': 'Tendencia',
    'Evolução por exercício': 'Evolución por ejercicio',
    'Melhores marcas': 'Mejores marcas',
    'Recordes pessoais': 'Récords personales',
    'Ver histórico': 'Ver historial',
    'Biblioteca pessoal': 'Biblioteca personal',
    'Nova Rotina': 'Nueva Rutina',
    'Usar um modelo': 'Usar una plantilla',
    'Buscar rotinas': 'Buscar rutinas',
    'Minhas Rotinas': 'Mis Rutinas',
    'Nome do Treino': 'Nombre del Entreno',
    'Concluir': 'Finalizar',
    'Adicionar Exercício': 'Agregar Ejercicio',
    'Criar Rotina': 'Crear Rutina',
    'Nome da rotina': 'Nombre de la rutina',
    'Dias da semana': 'Días de la semana',
    '(opcional)': '(opcional)',
    'Segunda': 'Lunes',
    'Terça': 'Martes',
    'Quarta': 'Miércoles',
    'Quinta': 'Jueves',
    'Sexta': 'Viernes',
    'Sábado': 'Sábado',
    'Domingo': 'Domingo',
    'Modelos de treino': 'Plantillas de entreno',
    'Exercícios': 'Ejercicios',
    'Buscar exercício': 'Buscar ejercicio',
    'Todos': 'Todos',
    'Costas': 'Espalda',
    'Quadríceps': 'Cuádriceps',
    'Posterior': 'Isquiotibiales',
    'Glúteos': 'Glúteos',
    'Ombros': 'Hombros',
    'Braços': 'Brazos',
    'Abdômen': 'Abdomen',
    'Descanso': 'Descanso',
    'Pular': 'Saltar',
    'Selecionar tipo de série': 'Seleccionar tipo de serie',
    'Série de Aquecimento': 'Serie de calentamiento',
    'Série Normal': 'Serie normal',
    'Série Falhada': 'Serie al fallo',
    'Série Drop': 'Serie drop',
    'Remover Série': 'Eliminar serie',
    offline: 'Sin conexión',
    onlineAgain: 'En línea otra vez',
    offlineTrusted: 'Cambios esperando sincronización',
    offlineTemporary: 'Datos disponibles hasta cerrar la app',
    syncing: 'Sincronizando cambios'
  }
};

// Textos novos (diário, pets, boas-vindas, marmitas, treino…) ficam em language-extra.js.
Object.assign(dictionary['en-US'], EXTRA_STRINGS['en-US']);
Object.assign(dictionary['es-ES'], EXTRA_STRINGS['es-ES']);

function closestSupported(language) {
  const normalized = String(language || '').trim();
  if (languageSet.has(normalized)) return normalized;
  const base = normalized.toLocaleLowerCase('en-US').split('-')[0];
  if (base === 'en') return 'en-US';
  if (base === 'es') return 'es-ES';
  return 'pt-BR';
}

function readAccessibilityLanguage() {
  try {
    const preferences = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const language = preferences?.language || {};
    return {
      mode: ['system', ...languageSet].includes(language.mode) ? language.mode : 'system',
      value: languageSet.has(language.value) ? language.value : 'pt-BR'
    };
  } catch {
    return { mode: 'system', value: 'pt-BR' };
  }
}

export function resolveLanguagePreference(preference = readAccessibilityLanguage()) {
  if (preference.mode && preference.mode !== 'system') return closestSupported(preference.mode);
  return closestSupported(navigator.languages?.[0] || navigator.language || preference.value);
}

export function currentLanguage() {
  return document.documentElement.lang || resolveLanguagePreference();
}

export function t(key, fallback = key, language = currentLanguage()) {
  return dictionary[closestSupported(language)]?.[key] || dictionary['pt-BR'][key] || fallback;
}


/** Frases com números ou nomes ("Passo 2 de 5"): o primeiro padrão que casar traduz. */
function translatePattern(clean, language) {
  for (const [pattern, replace] of EXTRA_PATTERNS[language] || []) {
    const match = pattern.exec(clean);
    if (match) return replace(...match.slice(1));
  }
  return '';
}

function translateTextValue(value, language) {
  const original = String(value || '');
  const clean = original.replace(/\s+/g, ' ').trim();
  if (!clean || language === 'pt-BR') return value;
  const code = closestSupported(language);
  const translated = dictionary[code]?.[clean] || translatePattern(clean, code);
  if (!translated) return value;
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

function translateStaticDom(language, root = document.body) {
  if (!root) return;
  const base = root.nodeType === 1 ? root : root.parentElement;
  if (!base) return;
  const nodeFilter = window.NodeFilter || { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2 };
  const walker = document.createTreeWalker(base, nodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION'].includes(parent.tagName)) return nodeFilter.FILTER_REJECT;
      if (parent.closest('[data-no-i18n], input, textarea, select, [contenteditable="true"]')) return nodeFilter.FILTER_REJECT;
      return /[A-Za-zÀ-ÿ]/.test(node.nodeValue || '') ? nodeFilter.FILTER_ACCEPT : nodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (!node.__molSourceText) node.__molSourceText = node.nodeValue;
    node.nodeValue = translateTextValue(node.__molSourceText, language);
  });
  base.querySelectorAll?.('[placeholder], [aria-label], [title]').forEach(element => {
    ['placeholder', 'aria-label', 'title'].forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      const key = `molSource${attribute.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())}`;
      if (!element.dataset[key]) element.dataset[key] = element.getAttribute(attribute);
      element.setAttribute(attribute, translateTextValue(element.dataset[key], language));
    });
  });
}

let observer = null;
let scheduled = 0;

function scheduleTranslate() {
  window.clearTimeout(scheduled);
  scheduled = window.setTimeout(() => translateStaticDom(currentLanguage()), 30);
}

function observeDynamicText() {
  if (observer || !document.body || !('MutationObserver' in window)) return;
  observer = new window.MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.addedNodes.length || mutation.type === 'attributes')) scheduleTranslate();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
}

export function applyLanguage(preference = readAccessibilityLanguage()) {
  const language = resolveLanguagePreference(preference);
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
  try { localStorage.setItem(LEGACY_LANGUAGE_KEY, language); } catch { /* armazenamento pode estar indisponível */ }
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n, element.textContent, language);
  });
  if (document.body && 'createTreeWalker' in document) translateStaticDom(language);
  observeDynamicText();
  window.dispatchEvent(new CustomEvent('mol-languagechange', { detail: { language } }));
  return language;
}

export function initializeLanguage() {
  applyLanguage();
  if (window.__molLanguageListener) return;
  window.__molLanguageListener = true;
  window.addEventListener('pageshow', () => applyLanguage());
  window.addEventListener('mol-languagechange', scheduleTranslate);
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY || event.key === LEGACY_LANGUAGE_KEY) applyLanguage();
  });
}
