import { watchProtectedPage } from '../modules/auth.js';
import { setupAppShell } from '../utils/app-shell.js';
import { escapeHTML, showToast, enhanceSelects } from '../utils/ui.js';
import { renderIcons } from '../utils/icons.js';
import { getLocalItem, setLocalItem } from '../utils/storage.js';
import { FOOD_CATALOG, normalizeDietMeals } from '../modules/nutrition.js';
import { suggestedMealIds, weeklyMealSlots, calculatePreparation, divideActualYield } from '../modules/meal-prep.js';
import { loadPrepPeople, createPrepInvite, acceptPrepInvite, confirmPrepInvite, disconnectPrepPartner, loadPreparations, savePreparation } from '../modules/meal-prep-store.js';

setupAppShell();
const $ = id => /** @type {any} */ (document.getElementById(id));
const esc = escapeHTML;
const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ratingNames = { favorite: 'Adoramos', ok: 'Gostamos', avoid: 'Preferimos não repetir' };
const n = value => Math.round(Number(value) || 0);
let user;
let people = [];
let ingredients = [];
let preparation = null;
let history = [];
let saving = false;
const inviteKey = () => `mol-prep-invite-${user.uid}`;

function status(message) { $('prep-status').textContent = message; }
async function action(button, task) {
  button.disabled = true;
  try { await task(); }
  catch (error) { status(error.code === 'permission-denied' ? 'Não foi possível acessar as marmitas. Confira o vínculo e as regras do banco.' : error.message || 'Não foi possível concluir. Tente novamente.'); }
  finally { button.disabled = false; }
}
function invalidate() {
  preparation = null;
  $('prep-result').hidden = true;
}
function viewHistory(active) {
  $('planner').hidden = active;
  $('prep-history').hidden = !active;
  $('new-prep').setAttribute('aria-pressed', String(!active));
  $('show-history').setAttribute('aria-pressed', String(active));
  if (active) renderHistory();
}
function renderSlots(person, index, ids, count) {
  const slots = weeklyMealSlots(person.meals, ids, new Date().getDay());
  person.slots = slots;
  $(`slots-${index}`).innerHTML = slots.length ? slots.map((slot, position) => `<label><input type="checkbox" name="slot-${index}" value="${esc(slot.key)}" ${position < count ? 'checked' : ''}>${days[slot.day]} · ${esc(slot.name)}</label>`).join('') : '<p>Selecione as refeições de almoço e jantar acima.</p>';
  $(`count-${index}`).max = slots.length;
  $(`count-${index}`).value = Math.min(count, slots.length);
}
function renderTargets() {
  $('prep-targets').innerHTML = people.map((person, index) => {
    const selected = [...document.querySelectorAll(`input[name="slot-${index}"]:checked`)].map(input => /** @type {HTMLInputElement} */ (input).value);
    const slots = person.slots.filter(slot => selected.includes(slot.key));
    const totals = slots.reduce((sum, slot) => { ['protein', 'carbs', 'fat'].forEach(key => { sum[key] += slot.target[key]; }); return sum; }, { protein: 0, carbs: 0, fat: 0 });
    return `<p><strong>${esc(person.name)} · ${slots.length} potes</strong><br>Referência do preparo: P ${n(totals.protein)} g · C ${n(totals.carbs)} g · G ${n(totals.fat)} g.</p>`;
  }).join('');
}
function renderPeople() {
  $('prep-people').innerHTML = people.map((person, index) => {
    const selected = suggestedMealIds(person.meals);
    return `<fieldset class="prep-ingredient"><legend>${esc(person.name)}</legend><div class="prep-slots">${person.meals.map(meal => `<label><input type="checkbox" name="meal-${index}" value="${esc(meal.id)}" ${selected.includes(meal.id) ? 'checked' : ''}>${esc(meal.nome)}</label>`).join('')}</div><label for="count-${index}">Quantidade de potes</label><input class="mol-input" id="count-${index}" type="number" min="0" max="14" step="1" value="14"><details><summary>Escolher dias e refeições</summary><div id="slots-${index}" class="prep-slots"></div></details></fieldset>`;
  }).join('');
  people.forEach((person, index) => renderSlots(person, index, suggestedMealIds(person.meals), 14));
  renderTargets();
  $('partner-status').textContent = people.length > 1 ? `Conectado com ${people[1].name}.` : 'Nenhuma pessoa conectada. Você já pode preparar suas marmitas.';
}
function ingredientFromCatalog(name) {
  const food = FOOD_CATALOG.find(item => item.nome === name);
  const vegetable = /brócolis|tomate|alface|cenoura|abobrinha|beterraba|couve|espinafre|pepino/i.test(name);
  return { ...food, mode: vegetable ? 'fixed' : 'adjustable', grams: 100, yieldFactor: 1, yieldConfirmed: false };
}
function renderIngredients() {
  $('prep-ingredients').innerHTML = ingredients.map((item, index) => `<fieldset class="prep-ingredient"><legend>${esc(item.nome)}</legend><label for="mode-${index}">Quantidade</label><select class="mol-input" id="mode-${index}" data-index="${index}" data-field="mode"><option value="adjustable" ${item.mode === 'adjustable' ? 'selected' : ''}>Ajustar à dieta</option><option value="fixed" ${item.mode === 'fixed' ? 'selected' : ''}>Fixa por pote</option></select><div id="fixed-${index}" ${item.mode === 'fixed' ? '' : 'hidden'}><label for="grams-${index}">Gramas por pote (fixa)</label><input class="mol-input" id="grams-${index}" type="number" min="0" max="2000" step="1" value="${esc(String(item.grams))}" data-index="${index}" data-field="grams" ${item.mode === 'fixed' ? '' : 'disabled'}></div><details ${item.proteina100 + item.carbo100 + item.gordura100 === 0 ? 'open' : ''}><summary>Rendimento e nutrientes</summary><div><label for="yield-${index}">Rendimento pronto ÷ cru</label><input class="mol-input" id="yield-${index}" type="number" min="0.01" max="10" step="0.01" value="${esc(String(item.yieldFactor))}" data-index="${index}" data-field="yieldFactor"></div><p>Informe seu rendimento para calcular o peso cru. Rendimento 1 significa o mesmo peso antes e depois. Ajuste para estimar a compra; por exemplo, 3 significa 300 g prontos para cada 100 g crus.</p><div class="prep-fields">${[['kcal100', 'Calorias (kcal)'], ['proteina100', 'Proteína (g)'], ['carbo100', 'Carboidrato (g)'], ['gordura100', 'Gordura (g)']].map(([field, label]) => `<div><label for="${field}-${index}">${label}</label><input class="mol-input" id="${field}-${index}" type="number" min="0" max="${field === 'kcal100' ? 1000 : 100}" step="0.1" value="${esc(String(item[field]))}" data-index="${index}" data-field="${field}"></div>`).join('')}</div></details><button class="mol-btn mol-btn-secondary" type="button" data-remove="${index}" aria-label="Remover ${esc(item.nome)}">Remover</button></fieldset>`).join('');
  enhanceSelects();
}
function resultsMarkup(value) {
  return `<p><strong>${n(value.potCount)} marmitas</strong> neste preparo.</p>${!value.matched ? '<p>Esta combinação não atende todas as referências. Confira as diferenças por pote e ajuste os ingredientes antes de salvar.</p>' : ''}${value.shortfall ? '<p>O rendimento ficou abaixo do planejado. As porções serão menores; confira a divisão.</p>' : ''}<h3>Total para preparar</h3><ul class="prep-list">${value.batch.map((item, index) => `<li><strong>${esc(item.nome)}</strong><br>${n(item.cookedGrams)} g prontos · ${item.rawGrams === null ? 'Informe o rendimento para estimar o peso cru' : `${n(item.rawGrams)} g antes do preparo (estimativa)`}${value.actualGrams ? `<br>Rendimento pesado: ${n(value.actualGrams[index])} g` : ''}</li>`).join('')}</ul><h3>Em cada pote</h3>${value.pots.map((pot, index) => `<details><summary>Pote ${index + 1} · ${esc(pot.personName)} · ${days[pot.day]} · ${esc(pot.meal)}</summary><ul class="prep-list">${pot.portions.map(item => `<li>${esc(item.nome)}: <strong>${n(item.gramas)} g prontos</strong></li>`).join('')}</ul><p>Referência: P ${n(pot.target.protein)} g · C ${n(pot.target.carbs)} g · G ${n(pot.target.fat)} g.<br>Porção estimada: P ${n(pot.actual.protein)} g · C ${n(pot.actual.carbs)} g · G ${n(pot.actual.fat)} g · ${n(pot.actual.kcal)} kcal.</p></details>`).join('')}<p>Valores nutricionais e conversões são estimativas. Receitas misturadas podem precisar de lotes separados para cada pessoa.</p>`;
}
function renderResult() {
  $('result-content').innerHTML = resultsMarkup(preparation);
  $('prep-result').hidden = false;
}
function renderHistory() {
  $('history-list').innerHTML = history.length ? history.map((item, index) => `<article class="glass-card prep-card"><h3>${esc(item.title)}</h3><p>${esc(item.preparedOn.split('-').reverse().join('/'))}</p><details><summary>Ver detalhes</summary>${resultsMarkup(item.preparation)}${item.notes ? `<p>${esc(item.notes)}</p>` : ''}${item.rating ? `<p>${esc(ratingNames[item.rating] || '')}</p>` : ''}<button class="mol-btn mol-btn-secondary" type="button" data-repeat="${index}">Preparar novamente</button></details></article>`).join('') : '<p>Seus cardápios aparecem aqui quando você salvar um preparo.</p>';
}
async function load() {
  people = (await loadPrepPeople(user)).map(person => ({ ...person, meals: normalizeDietMeals(person.meals) }));
  history = await loadPreparations(user);
  renderPeople();
  $('planner').hidden = false;
  $('prep-history').hidden = true;
  document.body.setAttribute('aria-busy', 'false');
  status(people.some(person => person.meals.length) ? 'Dietas carregadas. Escolha os potes e os ingredientes.' : 'Cadastre sua dieta na aba Dieta para calcular as marmitas.');
}
$('retry-prep').onclick = () => action($('retry-prep'), async () => { await load(); invalidate(); });
$('catalog-food').innerHTML = FOOD_CATALOG.map(food => `<option value="${esc(food.nome)}">${esc(food.nome)}</option>`).join('');
$('add-ingredient').onclick = () => {
  if (ingredients.length >= 20) return status('Use no máximo 20 ingredientes.');
  if (ingredients.some(item => item.nome === $('catalog-food').value)) return status('Esse ingrediente já está no preparo.');
  ingredients.push(ingredientFromCatalog($('catalog-food').value));
  renderIngredients(); invalidate();
};
$('add-custom').onclick = () => {
  const name = $('custom-food').value.trim();
  if (!name) return status('Informe o nome do ingrediente personalizado.');
  if (ingredients.length >= 20) return status('Use no máximo 20 ingredientes.');
  ingredients.push({ nome: name, kcal100: 0, proteina100: 0, carbo100: 0, gordura100: 0, mode: 'fixed', grams: 30, yieldFactor: 1, yieldConfirmed: false });
  $('custom-food').value = '';
  renderIngredients(); invalidate();
  status('Ingrediente adicionado. Preencha os nutrientes por 100 g e a quantidade por pote.');
};
$('prep-ingredients').addEventListener('change', event => {
  const target = /** @type {HTMLInputElement} */ (event.target);
  if (!target.dataset.field) return;
  const item = ingredients[Number(target.dataset.index)];
  if (target.dataset.field === 'yieldFactor') item.yieldConfirmed = true;
  item[target.dataset.field] = target.dataset.field === 'mode' ? target.value : Number(target.value);
  if (target.dataset.field === 'mode') {
    $(`grams-${target.dataset.index}`).disabled = target.value !== 'fixed';
    $(`fixed-${target.dataset.index}`).hidden = target.value !== 'fixed';
  }
  invalidate();
});
$('prep-ingredients').addEventListener('click', event => {
  const button = /** @type {HTMLElement} */ (event.target).closest('[data-remove]');
  if (!button) return;
  ingredients.splice(Number(/** @type {HTMLElement} */ (button).dataset.remove), 1);
  renderIngredients(); invalidate();
});
$('prep-people').addEventListener('change', event => {
  const target = /** @type {HTMLInputElement} */ (event.target);
  people.forEach((person, index) => {
    if (target.name === `meal-${index}`) {
      const ids = [...document.querySelectorAll(`input[name="meal-${index}"]:checked`)].map(input => /** @type {HTMLInputElement} */ (input).value);
      renderSlots(person, index, ids, Number($(`count-${index}`).value));
    } else if (target.id === `count-${index}`) {
      const count = Number(target.value);
      document.querySelectorAll(`input[name="slot-${index}"]`).forEach((input, position) => { /** @type {HTMLInputElement} */ (input).checked = position < count; });
    } else if (target.name === `slot-${index}`) {
      $(`count-${index}`).value = document.querySelectorAll(`input[name="slot-${index}"]:checked`).length;
    }
  });
  renderTargets();
  invalidate();
});
$('prep-form').addEventListener('input', invalidate);
$('prep-form').onsubmit = event => {
  event.preventDefault();
  try {
    preparation = calculatePreparation(people.map((person, index) => {
      const selected = [...document.querySelectorAll(`input[name="slot-${index}"]:checked`)].map(input => /** @type {HTMLInputElement} */ (input).value);
      return { ...person, slots: person.slots.filter(slot => selected.includes(slot.key)) };
    }), ingredients);
    renderResult();
    $('yield-inputs').innerHTML = preparation.batch.map((item, index) => `<label for="actual-${index}">${esc(item.nome)} pronto (g)</label><input id="actual-${index}" class="mol-input" type="number" min="0" step="1" value="${item.cookedGrams}">`).join('');
    $('save-prep').disabled = false;
    $('prep-result').focus();
    enhanceSelects();
    status('Preparo calculado. Confira as quantidades.');
  } catch (error) { status(error.message); }
};
$('apply-yield').onclick = () => {
  try { preparation = divideActualYield(preparation, preparation.batch.map((_, index) => Number($(`actual-${index}`).value))); renderResult(); }
  catch (error) { status(error.message); }
};
$('save-prep').onclick = () => action($('save-prep'), async () => {
  if (!preparation || saving) return;
  saving = true;
  try {
    const saved = await savePreparation(user, { title: $('prep-title').value.trim() || ingredients.map(item => item.nome).join(' + ').slice(0, 100), preparation, ingredients, partnerId: people[1]?.id, notes: $('prep-notes').value, rating: $('prep-rating').value });
    history.unshift(saved);
    showToast('Cardápio salvo.', 'success');
    invalidate();
    viewHistory(true);
    status('Cardápio salvo no histórico.');
  } finally { saving = false; }
});
$('history-list').addEventListener('click', event => {
  const button = /** @type {HTMLElement} */ (event.target).closest('[data-repeat]');
  if (!button) return;
  const item = history[Number(/** @type {HTMLElement} */ (button).dataset.repeat)];
  ingredients = item.ingredients.map(ingredient => ({ ...ingredient }));
  $('prep-title').value = item.title;
  renderIngredients(); invalidate(); viewHistory(false);
  $('prep-title').focus();
  status('Ingredientes recuperados. Ajuste o número de potes e calcule com as dietas atuais.');
});
$('new-prep').onclick = () => viewHistory(false);
$('show-history').onclick = () => viewHistory(true);
$('invite-partner').onclick = () => action($('invite-partner'), async () => {
  const code = await createPrepInvite(user);
  setLocalItem(inviteKey(), code);
  $('invite-code').value = code;
  $('invite-status').textContent = 'Compartilhe este código com a pessoa que vai cozinhar com você. Depois que ela aceitar, confirme o vínculo aqui.';
});
$('join-partner').onclick = () => action($('join-partner'), async () => {
  await acceptPrepInvite(user, $('invite-code').value.trim());
  $('invite-status').textContent = 'Convite aceito. Agora o outro perfil precisa confirmar o vínculo.';
  await load(); invalidate();
});
$('confirm-partner').onclick = () => action($('confirm-partner'), async () => {
  await confirmPrepInvite(user, $('invite-code').value.trim());
  setLocalItem(inviteKey(), '');
  await load(); invalidate(); status('Perfis conectados para o preparo.');
});
$('disconnect-partner').onclick = () => action($('disconnect-partner'), async () => {
  await disconnectPrepPartner(user); await load(); invalidate(); status('Vínculo encerrado.');
});
$('refresh-partner').onclick = () => action($('refresh-partner'), async () => { await load(); invalidate(); });
renderIngredients(); renderIcons(); enhanceSelects();
watchProtectedPage(async authenticated => {
  user = authenticated;
  $('invite-code').value = getLocalItem(inviteKey()) || '';
  try { await load(); }
  catch (error) { document.body.setAttribute('aria-busy', 'false'); status('Não foi possível carregar. Tente atualizar o vínculo. ' + (error.code === 'permission-denied' ? 'As regras das marmitas precisam estar publicadas.' : error.message)); }
});
