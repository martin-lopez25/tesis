# NuclearLab · Laboratorio de Física Nuclear Interactiva

Aplicación interactiva de simulación y laboratorio de física nuclear, diseñada para el estudio académico de reactores, cinética neutrónica, medicina nuclear y dosimetría clínica.

## ⚛️ Módulos Principales

### 1. Reactor Nuclear (MOD-01)
- **Monte Carlo de Fisión (SUB-01):** Simulación estocástica de poblaciones neutrónicas multigeneración, cálculo de $k_{eff}$ medio, regímenes subcrítico, crítico y supercrítico, y muestreo de espectro de fisión de Watt.
- **Dispersión Elástica Cinemática (SUB-02):** Choques neutrón-núcleo en sistemas LAB y Centro de Masas (CM), cálculo de parámetro $\alpha = ((A-1)/(A+1))^2$, distribución angular y sección eficaz resonante.
- **Simulador Termohidráulico de Reactor (SUB-03):** Dinámica de barras de control, enriquecimiento de uranio, flujo de refrigerante, potencia térmica, generación de vapor, presión y potencia eléctrica en tiempo real.
- **Decaimiento Radiactivo & Cadenas de Bateman (SUB-04):** Base de datos nuclear con más de 25 radioisótopos (Mo-99, Tc-99m, Xe-135, I-131, Cs-137, U-235, Pu-239, etc.), filiaciones sucesivas y curvas de actividad.
- **Simulación Fisión 3D WebGL (SUB-05):** Visualizador 3D inmersivo (Three.js) con 150 átomos de Uranio, capas orbitales, colisiones neutrónicas y reacción en cadena animada.

### 2. Medicina Nuclear & Radiofarmacia (MOD-02)
- Calculadora dosimétrica de Vida Media Efectiva ($1/T_{eff} = 1/T_{física} + 1/T_{biológica}$).
- Curvas de actividad remanente en MBq y mCi.
- Catálogo clínico de radiofármacos diagnósticos (SPECT/PET) y terapéuticos (I-131, Lu-177, Sm-153).

### 3. Curso Académico & Tesis (MOD-03)
- **4 Unidades temáticas:** Interacción radiación-materia, transporte y moderación, cinética de reactores y leyes de desintegración.
- **Test interactivo de autoevaluación:** Preguntas con retroalimentación inmediata y cálculo de puntaje.
- **Modo Android / Escritorio:** Conmutador de interfaz con marco Android simulado para dispositivos móviles o estación de trabajo completa.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** React 19 + TypeScript + Vite
- **Estilos:** Tailwind CSS + M3 Dark Neon Nuclear Theme (Orbitron, Rajdhani, JetBrains Mono)
- **Gráficos 3D:** Three.js + WebGL
- **Visualización de Datos:** Recharts + Canvas Charts
- **Iconografía:** Lucide React
- **Motor de Física:** Módulo TypeScript 100% nativo offline (`src/lib/physics.ts`)

---

## Como Ejecutar

Desde la raiz del repositorio (`tesis/`):

```powershell
npm install
npm run dev
```

La interfaz queda disponible en `http://localhost:3000`. Para validar el build web:

```powershell
npm run build
```

### APK para Android

Requiere Android Studio, Android SDK y el JDK incluido con Android Studio.

```powershell
npx cap sync android
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location
```

El APK de depuracion se genera en `android/app/build/outputs/apk/debug/app-debug.apk`. La portada descarga la copia publicada en `public/NuclearLab.apk`.