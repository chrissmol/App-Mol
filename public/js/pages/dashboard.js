// js/pages/dashboard.js
import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const appBody = document.getElementById('app-body');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const defaultAvatarIcon = document.getElementById('default-avatar-icon');
const btnProfile = document.getElementById('btn-profile');
const calMetaEl = document.getElementById('cal-meta');
const calorieRing = document.getElementById('calorieRing');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = './pages/login.html';
    return;
  }

  // Revela a tela
  appBody.classList.remove('opacity-0');

  // 1. Nome do Usuário
  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Atleta';
  if (userNameEl) userNameEl.textContent = firstName;

  // 2. Foto do Perfil do Google (Tratamento seguro)
  if (user.photoURL && userAvatarEl) {
    userAvatarEl.src = user.photoURL;
    // Força a exibição da imagem e esconde o ícone padrão
    userAvatarEl.classList.remove('hidden');
    if (defaultAvatarIcon) {
      defaultAvatarIcon.classList.add('hidden');
    }
  }

  // 3. Buscar dados no Firestore com tratamento de erro seguro
  try {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const metaCalorias = data.metaCalorias || 2400; 
      if (calMetaEl) calMetaEl.textContent = `Meta diária: ${metaCalorias} kcal`;
      
      setTimeout(() => {
        const percent = 0.30; 
        const circumference = 251.2; 
        if (calorieRing) {
          calorieRing.style.strokeDashoffset = circumference * (1 - percent);
          const percentSpan = calorieRing.nextElementSibling?.querySelector('span');
          if (percentSpan) percentSpan.textContent = '30%';
        }
      }, 500);
    } else {
      if (calMetaEl) calMetaEl.textContent = "Meta diária: 2400 kcal";
    }
  } catch (error) {
    // Caso a coleção users não exista ou falhe permissão, exibe um valor padrão sem quebrar o app
    console.warn("Aviso do Firestore (ignorado):", error.message);
    if (calMetaEl) calMetaEl.textContent = "Meta diária: 2400 kcal";
  }
});

// Logout
if (btnProfile) {
  btnProfile.addEventListener('click', async () => {
    const confirmarSair = confirm("Deseja realmente sair da sua conta?");
    if (confirmarSair) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Erro ao tentar deslogar:", error);
      }
    }
  });
}