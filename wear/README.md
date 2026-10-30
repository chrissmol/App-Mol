# Mol para Wear OS

App de relógio (Kotlin + Compose for Wear OS): treino ativo, registro de série (carga/reps, coroa ajusta a carga) e timer de descanso de 90 s com vibração. Layout derivado do menor lado da tela, serve para relógios redondos e quadrados, pequenos e grandes. Sem chaves nem Firebase: o celular continua sendo o único cliente (ver `/docs`, estudo "Mol no relógio").

Estado: o treino vem de `app/src/main/assets/treino-demo.json`. Falta o sync com o celular (Data Layer) e a frequência cardíaca.

## Comandos (JDK 17+, Android SDK em `local.properties`)
- Testes + capturas: `gradle :app:testDebugUnitTest` (regravar capturas: `:app:recordPaparazziDebug`, PNGs em `app/src/test/snapshots`).
- APK: `gradle :app:assembleDebug`, instalar: `adb connect <ip:porta>` e `adb install -r app/build/outputs/apk/debug/app-debug.apk`.
