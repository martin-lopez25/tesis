# NuclearLab · Laboratorio de Física Nuclear Interactiva

Laboratorio académico de física nuclear construido con React, TypeScript, Vite y Capacitor. Incluye simuladores interactivos para reactor PWR, física nuclear y medicina nuclear.

## ⚛️ Módulos Principales

### 1. Reactor Nuclear (MOD-01)
- **Monte Carlo de Fisión (SUB-01):** Simulación estocástica de poblaciones neutrónicas multigeneración, cálculo de $k_{eff}$ medio, regímenes subcrítico, crítico y supercrítico, y muestreo de espectro de fisión de Watt.
- **Dispersión Elástica Cinemática (SUB-02):** Choques neutrón-núcleo en sistemas LAB y Centro de Masas (CM), cálculo de parámetro $\alpha = ((A-1)/(A+1))^2$, distribución angular y sección eficaz resonante.
- **Simulador de Reactor PWR (SUB-03):** Controles operativos de barras de control, enriquecimiento, caudal de refrigerante y eficiencia de turbina. La card reproduce un video y luego muestra la imagen 01. En web permite abrir el modelo 3D de Energy Encyclopedia; en el APK se recorren 11 imágenes numeradas.
- **Decaimiento Radiactivo & Cadenas de Bateman (SUB-04):** Base de datos nuclear con más de 25 radioisótopos (Mo-99, Tc-99m, Xe-135, I-131, Cs-137, U-235, Pu-239, etc.), filiaciones sucesivas y curvas de actividad.
- **Simulación Fisión 3D WebGL (SUB-05):** Visualizador 3D inmersivo (Three.js) con 150 átomos de Uranio, capas orbitales, colisiones neutrónicas y reacción en cadena animada.

### 2. Medicina Nuclear & Radiofarmacia (MOD-02)
- Calculadora dosimétrica de Vida Media Efectiva ($1/T_{eff} = 1/T_{física} + 1/T_{biológica}$).
- Curvas de actividad remanente en MBq y mCi.
- Catálogo clínico de radiofármacos diagnósticos (SPECT/PET) y terapéuticos (I-131, Lu-177, Sm-153).

### 3. Curso Académico & Tesis (MOD-03)
- **4 Unidades temáticas:** Interacción radiación-materia, transporte y moderación, cinética de reactores y leyes de desintegración.
- **Test interactivo de autoevaluación:** Preguntas con retroalimentación inmediata y cálculo de puntaje.
- **Web y Android:** La web ofrece el modelo PWR 3D; la aplicación Android usa la galería de imágenes local.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** React 19 + TypeScript + Vite
- **Aplicación Android:** Capacitor 8
- **Estilos:** Tailwind CSS + M3 Dark Neon Nuclear Theme (Orbitron, Rajdhani, JetBrains Mono)
- **Gráficos 3D:** Three.js + WebGL
- **Visualización de Datos:** Recharts + Canvas Charts
- **Iconografía:** Lucide React
- **Motor de Física:** Módulo TypeScript local (`src/lib/physics.ts`); Python Studio usa Pyodide y un fallback local.
- **Modelo PWR 3D web:** EnergyEncyclopedia.com, con atribución y uso educativo no comercial.

---

## Ejecución Local

Requiere Node.js 20 o superior y npm. Desde la raíz del repositorio:

```powershell
npm ci
npm run dev
```

La app queda disponible en `http://localhost:3000`. Para generar el build web:

```powershell
npm run build
```

## GitHub Pages

La publicación está configurada con GitHub Actions al actualizar `main`:

https://martin-lopez25.github.io/tesis/

Si Pages aún no está habilitado en el repositorio, configura `Settings > Pages > Build and deployment > Source` como `GitHub Actions`.

## APK Android

La portada ofrece la descarga del APK debug publicado en Git LFS. La tarjeta usa la descarga directa de GitHub, no el almacenamiento de Pages.

Para generar un APK localmente se requiere Android Studio, Android SDK y su JDK:

```powershell
npm run build
npx cap sync android
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location
```

El artefacto se genera en `android/app/build/outputs/apk/debug/app-debug.apk`. El APK incluido es de depuración, no una publicación firmada para Google Play.

## Atribución del Modelo 3D

El modelo PWR externo pertenece a Energy Encyclopedia. Su uso es educativo no comercial y requiere el crédito enlazado `EnergyEncyclopedia.com`.