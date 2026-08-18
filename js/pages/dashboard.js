// js/pages/dashboard.js

// 1. Importações necessárias
import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Elementos do DOM
const appBody = document.getElementById('app-body');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const defaultAvatarIcon = document.getElementById('default-avatar-icon');
const btnProfile = document.getElementById('btn-profile');
const calMetaEl = document.getElementById('cal-meta');
const calorieRing = document.getElementById('calorieRing');

// 3. Verificação de Autenticação (Proteção de Rota)
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Se NÃO estiver logado, chuta para a tela de login imediatamente
    window.location.href = './pages/login.html';
    return;
  }

  // Se estiver logado, revela a tela suavemente
  appBody.classList.remove('opacity-0');

  // 4. Personalização da UI (Nome e Foto do Google)
  // Pega só o primeiro nome
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Atleta';
  userNameEl.textContent = firstName;

  // Injeta a foto real do Google, se houver
  if (user.photoURL) {
    userAvatarEl.src = user.photoURL;
    userAvatarEl.classList.remove('hidden'); // Mostra a imagem
    defaultAvatarIcon.classList.add('hidden'); // Esconde o ícone Lucide padrão
  }

  // 5. Opcional: Buscar dados iniciais no Firestore
  try {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Exemplo: Se tivermos salvo uma meta de calorias no banco
      const metaCalorias = data.metaCalorias || 2400; 
      calMetaEl.textContent = `Meta diária: ${metaCalorias} kcal`;
      
      // Anima o anel de calorias para mostrar que carregou (Ex: 30% preenchido)
      setTimeout(() => {
        const percent = 0.30; 
        const circumference = 251.2; // 2 * pi * 40
        calorieRing.style.strokeDashoffset = circumference * (1 - percent);
        calorieRing.nextElementSibling.querySelector('span').textContent = '30%';
      }, 500);
    } else {
      calMetaEl.textContent = "Meta diária: 2400 kcal (Padrão)";
    }
  } catch (error) {
    console.error("Erro ao buscar dados do Firestore:", error);
  }
});

// 6. Função de Logout
btnProfile.addEventListener('click', async () => {
  // Uma confirmação nativa rápida para evitar clique acidental
  const confirmarSair = confirm("Deseja realmente sair da sua conta?");
  
  if (confirmarSair) {
    try {
      await signOut(auth);
      // O onAuthStateChanged lá em cima vai detectar a saída e redirecionar sozinho!
    } catch (error) {
      console.error("Erro ao tentar deslogar:", error);
      alert("Não foi possível sair no momento.");
    }
  }
});