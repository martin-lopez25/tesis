export type MedicalCourseModuleId = 'module-1' | 'module-2' | 'module-3' | 'module-4' | 'module-5' | 'module-6';

export type MedicalCourseModule = {
  id: MedicalCourseModuleId;
  roman: string;
  shortTitle: string;
  title: string;
  summary: string;
  sources: string;
  content: string;
};

export const MEDICAL_PHYSICS_MODULES: MedicalCourseModule[] = [
  {
    id: 'module-1',
    roman: 'I',
    shortTitle: 'Fundamentos',
    title: 'Fundamentos de Física Moderna e Interacciones de Radiación',
    summary: 'Estructura atómica/nuclear, clasificación de radiaciones, procesos de atenuación (fotoeléctrico, Compton y pares), radiación de frenado y colisión.',
    sources: 'Podgorsak, cap. 1–2 · Dance, cap. 1–2 · Bailey, cap. 1–3',
    content: `## Podgorsak · Capítulo 1: Fundamentos de Física de Radiaciones

Este capítulo establece la base físico-matemática del curso, definiendo las constantes físicas fundamentales y la clasificación de las radiaciones ionizantes. La masa relativista de una partícula en función de su velocidad v y la relación energía-momento se expresan como:

= E = mc^2 = \\frac{m_0 c^2}{\\sqrt{1-\\beta^2}} = E_k + m_0 c^2

Aquí β = v/c y Eₖ es la energía cinética. La radiación ionizante se clasifica en directamente ionizante (partículas cargadas como electrones, protones y partículas alfa) e indirectamente ionizante (partículas no cargadas como fotones y neutrones).

La ley de decaimiento radiactivo para una muestra de N(t) núcleos con constante de desintegración λ y vida media t½ = ln(2)/λ es:

= A(t) = \\lambda N(t) = A_0 e^{-\\lambda t}

En el equilibrio transitorio, cuando la vida media del padre Tₚ es ligeramente mayor que la del hijo Tᴅ, la relación de actividades alcanza un valor constante. En el equilibrio secular, Tₚ ≫ Tᴅ y la actividad del hijo se iguala a la del padre.

## Dance · Capítulos 1 y 2: Física Atómica e Interacciones de Radiación con la Materia

Se revisan los modelos atómicos de Bohr y la estructura de capas electrónicas. Para fotones de diagnóstico (10–150 keV), se analizan los tres mecanismos principales de interacción:

- Efecto fotoeléctrico: dominante a bajas energías y en medios de alto número atómico Z. La sección eficaz por átomo se aproxima por τ ∝ Z⁴/E³. Produce una discontinuidad de atenuación cuando la energía incidente iguala la energía de enlace de la capa K (K-edge).
- Dispersión Compton (incoherente): dominante en tejidos blandos a energías intermedias (> 30 keV). El fotón dispersado tiene energía E′ y ángulo θ; la sección eficaz diferencial por electrón se describe mediante Klein–Nishina.
- Dispersión coherente (Thomson/Rayleigh): dispersión elástica sin transferencia neta de energía, relevante a muy bajas energías (< 20 keV).

= E' = \\frac{E}{1 + \\frac{E}{m_0 c^2}(1 - \\cos \\theta)}

## Bailey · Capítulos 1 a 3: Física Básica, Radiobiología y Protección Radiológica

Se definen las constantes de desintegración nuclear y los modos de decaimiento radiactivo:

- Decaimiento alfa (α), beta negativo (β−) y beta positivo (β+/aniquilación). Un positrón se aniquila con un electrón libre y emite dos fotones gamma de 511 keV en direcciones aproximadamente opuestas, con un ángulo de 180°.
- Captura electrónica (EC) y transición isomérica (IT): emisión de fotones gamma sin alteración del número de masa A. Ejemplo: ⁹⁹ᵐTc → ⁹⁹Tc + γ (140 keV).
- La física básica se complementa con radiobiología y protección radiológica aplicadas a medicina nuclear.`
  },
  {
    id: 'module-2',
    roman: 'II',
    shortTitle: 'Dosimetría',
    title: 'Metrología y Teoría Estándar de la Dosimetría · TRS-398',
    summary: 'Fluencia, kerma, dosis, teoría de cavidades (Bragg-Gray, Spencer-Attix), estándares ND,w, código TRS-398 y calibración absoluta.',
    sources: 'Podgorsak, cap. 2, 3, 4 y 9 · IAEA TRS-398, secciones 1–11 · Dance, cap. 3',
    content: `## Podgorsak · Capítulo 2: Principios Dosimétricos, Magnitudes y Unidades

La fluencia fotónica Φ y la fluencia energética Ψ en un punto P rodeado por un área diferencial da son:

= \\Phi = \\frac{dN}{da} \\qquad \\Psi = \\frac{dE}{da} = \\Phi h\\nu

El kerma K (Kinetic Energy Released per unit Mass) cuantifica la energía cinética inicial transferida por fotones no cargados a partículas cargadas por unidad de masa dm:

= K = \\frac{dE_{tr}}{dm} = \\Psi \\left(\\frac{\\mu_{tr}}{\\rho}\\right)

El kerma se divide en kerma de colisión y kerma radiativo. Kcol = K(1 − g), donde g es la fracción de energía de las partículas cargadas perdida por bremsstrahlung.

La dosis absorbida D es la energía media impartida dε̄ por cualquier radiación ionizante a una masa dm:

= D = \\frac{d\\bar{\\epsilon}}{dm}

Bajo equilibrio de partículas cargadas (CPE), D = Kcol. En un haz fotónico atenuado puede establecerse equilibrio transitorio de partículas cargadas (TCPE), con D = βKcol y β > 1.

### Teoría de cavidades dosimétricas

- Bragg–Gray: aplica cuando la cavidad es pequeña respecto al rango de los electrones secundarios y no perturba su fluencia. Dmed = Dgas · s̄med,gas = (Q/m · Wgas/e) · s̄med,gas. Wgas/e es 33.97 eV por par de iones en aire seco.
- Spencer–Attix: modifica Bragg–Gray con un corte energético Δ para considerar los electrones secundarios (rayos delta) que transportan energía fuera de la cavidad: Dmed = Dgas · sΔmed,gas.
- Burlin: generaliza a cavidades de tamaño intermedio ponderando la contribución del medio y de la pared/gas mediante el parámetro de atenuación electrónica d: Dcav = d · Dmed/smed,gas + (1 − d) · Dgas.

## Podgorsak · Capítulos 3 y 4: Detectores e Instrumentos de Monitoreo

Las propiedades metrológicas revisadas incluyen linealidad, dependencia energética, dependencia con tasa de dosis, resolución espacial y respuesta direccional.

- Cámaras de ionización: detectores de referencia; cilíndricas tipo Farmer para haces de fotones y de placas paralelas para electrones y rayos X de baja energía.
- TLD: cristales como LiF:Mg,Ti atrapan electrones en la red cristalina y emiten luz proporcional a la dosis al calentarse.
- Diodos de silicio: detectores semiconductores de alta sensibilidad (aproximadamente 18 000 veces la de una cámara de aire de igual volumen), útiles en gradientes altos como estereotaxia y penumbra.
- Películas radiocrómicas Gafchromic: polímeros que se oscurecen sin revelado químico y ofrecen resolución espacial submilimétrica en 2D.
- Detectores llenos de gas: contadores proporcionales para campos mixtos neutrón/gamma y Geiger–Müller para detección sensible de fugas y contaminación.
- Dosimetría personal: dosímetros de bolsillo, TLD, OSL con Al₂O₃:C y dosímetros electrónicos de lectura directa.

## TRS-398 · Secciones 1 a 3: Formalismo y Trazabilidad

El TRS-398 establece la determinación de dosis absorbida en agua mediante la calibración directa de la cámara del usuario para una calidad de referencia Q₀ (típicamente ⁶⁰Co), reemplazando formalismos antiguos basados en kerma en aire (NK).

= D_{w,Q} = M_Q \\cdot N_{D,w,Q_0} \\cdot k_{Q,Q_0}

MQ es la lectura corregida por temperatura y presión (kTP), recombinación iónica (ks), polaridad (kpol) y electrómetro (kelec):

= M_Q = M \\cdot k_{TP} \\cdot k_s \\cdot k_{pol} \\cdot k_{elec}

ND,w,Q₀ es el factor de calibración en dosis absorbida en agua obtenido en un PSDL o SSDL. kQ,Q₀ corrige la calidad de haz y puede expresarse como:

= k_{Q,Q_0} = \\frac{(s_{w,air})_Q \\cdot (W_{air}/e)_Q \\cdot p_Q}{(s_{w,air})_{Q_0} \\cdot (W_{air}/e)_{Q_0} \\cdot p_{Q_0}}

El factor de perturbación total es pQ = pdis · pwall · pcel · pcav.

## TRS-398 · Sección 4: Correcciones de Lectura

- Temperatura y presión: para una cámara ventilada y valores de referencia T₀ = 20 °C (293.15 K), P₀ = 101.325 kPa: kTP = [(273.15 + T)/ (273.15 + 20)] · [101.325/P].
- Recombinación iónica: evalúa pérdidas iniciales y generales en la cavidad aplicando el método de las dos tensiones V₁ y V₂.
- Polaridad: corrige la asimetría al invertir la tensión (+V y −V): kpol = (|M+| + |M−|)/(2M).

## TRS-398 · Secciones 5 a 11: Calidades de Haz y Hojas de Trabajo

- ⁶⁰Co: kQ,Q₀ = 1.000. Mediciones en phantom de agua de 30 × 30 × 30 cm, profundidad de referencia de 5 o 10 g/cm², distancia fuente-phantom de 80 o 100 cm y campo de 10 × 10 cm.
- Fotones de megavoltaje: calidad por TPR20,10 = D20/D10, a distancia fuente-detector constante de 100 cm y campo 10 × 10 cm. La profundidad de referencia absoluta es 10 g/cm².
- Electrones: R50 caracteriza la calidad. zref = 0.6 R50 − 0.1 g/cm² para R50 ≥ 4 g/cm². Para R50 < 4 g/cm² se requieren cámaras de placas paralelas.
- Protones e iones pesados: kQ considera la variación de Wair/e y el pico de Bragg.
- Rayos X de kilovoltaje: baja energía, 10–50 kV, referencia en superficie; media energía, 50–300 kV, referencia a 2 g/cm². La calidad se especifica mediante la capa hemirreductora (HVL).
- Hojas de trabajo (worksheets): formularios normalizados por el OIEA para registrar y calcular la dosis absorbida en agua.

## Dance · Capítulo 3: Dosimetría en Radiodiagnóstico

Las magnitudes operacionales incluyen kerma en aire en superficie de entrada Ki y kerma en aire incidente Ka,i. El producto kerma-área KAP/DAP integra el kerma sobre el área A del haz y, sin atenuantes, es invariante con la distancia a la fuente.

= KAP = \\int_A K_a(x,y) \\, dx \\, dy \\qquad [\\mathrm{Gy} \\cdot \\mathrm{cm}^2]`
  },
  {
    id: 'module-3',
    roman: 'III',
    shortTitle: 'Diagnóstico e imagen',
    title: 'Física del Radiodiagnóstico e Imagenología Avanzada',
    summary: 'Producción de rayos X, calidad de imagen (MTF, DQE, NPS), CR/DR, CT (CTDIvol, DLP), ultrasonido (Doppler) y resonancia magnética (Larmor, espacio k).',
    sources: 'Dance et al., Diagnostic Radiology Physics, cap. 4–15 y 20–24',
    content: `## Dance · Capítulo 4: Medidas de Calidad de Imagen

La teoría de sistemas lineales e invariantes espaciales describe la transferencia de contraste y ruido del sistema.

- MTF(f): respuesta en frecuencia espacial f; se obtiene de la función de extensión de línea LSF(x).
- NPS(f): varianza estocástica del ruido mottle cuántico en el dominio de frecuencia espacial.
- DQE(f): eficiencia global para preservar la relación señal-ruido. G es la ganancia y Φin la fluencia fotónica incidente.

= MTF(f) = \\frac{|\\mathcal{F}\\{LSF(x)\\}|}{|\\mathcal{F}\\{LSF(x)\\}|_{f=0}}
= DQE(f) = \\frac{SNR_{out}^2(f)}{SNR_{in}^2(f)} = \\frac{G^2 \\cdot MTF^2(f) \\cdot \\Phi_{in}}{NPS(f)}

## Dance · Capítulo 5: Producción de Rayos X

El tubo de rayos X consta de un cátodo con filamento térmico emisor de electrones y un ánodo blanco, generalmente de tungsteno o molibdeno, en una ampolla de vacío.

- Bremsstrahlung: espectro continuo producido al frenar electrones en el campo coulombiano nuclear. La energía máxima corresponde al kVp aplicado.
- Rayos X característicos: líneas discretas producidas por transiciones electrónicas después de la eyección de electrones de capas profundas (capa K).
- Efecto talón: atenuación preferencial en el lado anódico; la intensidad es mayor hacia el lado catódico.
- Filtración: Al o Cu eliminan fotones de baja energía y reducen la dosis en piel.

## Dance · Capítulos 6 a 9: Radiografía, Receptores, Fluoroscopia y Mamografía

- Receptores CR: placas de fósforo fotoestimulable BaFBr:Eu²⁺.
- Receptores DR indirectos: CsI:Tl y fotodiodos de silicio amorfo (a-Si); directos: selenio amorfo (a-Se).
- Fluoroscopia: intensificadores de imagen o paneles planos para adquisición dinámica en tiempo real; usa control automático de tasa de dosis (ADRC).
- Mamografía: optimizada para tejido glandular y graso, con blancos Mo/Rh, compresión mamaria y evaluación de dosis glandular media (AGD).

## Dance · Capítulo 11: Tomografía Computarizada

La TC estudia la geometría rotacional del tubo y los detectores multicorte (MDCT). La reconstrucción puede usar retroproyección filtrada (FBP), basada en la transformada de Radon, o métodos iterativos.

CTDI100 integra el perfil de dosis D(z) en una longitud de 100 mm, con n cortes de espesor T:

= CTDI_{100} = \\frac{1}{n \\cdot T} \\int_{-50\\,\\mathrm{mm}}^{+50\\,\\mathrm{mm}} D(z) \\, dz

CTDI ponderado y volumétrico:

= CTDI_w = \\frac{1}{3}CTDI_{100,\\mathrm{centro}} + \\frac{2}{3}CTDI_{100,\\mathrm{periferia}}
= CTDI_{vol} = \\frac{CTDI_w}{Pitch}

El pitch es el avance de la mesa por rotación dividido por n · T. El producto dosis-longitud es DLP = CTDIvol · L, donde L es la longitud explorada.

## Dance · Capítulos 12 y 13: Ultrasonido Diagnóstico

Las ondas mecánicas longitudinales diagnósticas suelen operar entre 1 y 20 MHz. En tejidos blandos, la velocidad del sonido es aproximadamente 1540 m/s.

- Impedancia acústica: Z = ρc.
- Coeficiente de reflexión de intensidad en la interfaz de dos medios: R = [(Z₂ − Z₁)/(Z₂ + Z₁)]².
- Doppler: el desplazamiento de frecuencia estima el movimiento de los glóbulos rojos: Δf = 2f₀v cosθ/c.

## Dance · Capítulos 14 y 15: Resonancia Magnética

La MRI se basa en el momento magnético de espín del hidrógeno ¹H. La ecuación de Larmor es ω₀ = γB₀; para protones γ/2π = 42.58 MHz/T.

- T1, relajación longitudinal o espín-red: Mz(t) = M₀(1 − e^(−t/T1)).
- T2, relajación transversal o espín-espín: Mxy(t) = M₀e^(−t/T2).
- Gradientes Gx, Gy y Gz codifican posición mediante fase y frecuencia. La imagen se obtiene con la transformada inversa de Fourier 2D/3D del espacio k.

## Dance · Capítulos 20 a 24: Radiobiología, Dosimetría y Protección

Se analizan efectos estocásticos, como carcinogénesis, y deterministas o reacciones tisulares con dosis umbral, como eritema cutáneo y cataratas. Los niveles de referencia diagnósticos (DRL) se aplican para optimizar protocolos clínicos.`
  },
  {
    id: 'module-4',
    roman: 'IV',
    shortTitle: 'Medicina nuclear',
    title: 'Física de la Medicina Nuclear e Imagen Molecular',
    summary: 'Producción en ciclotrón/generadores, detectores NaI(Tl)/CZT, gammacámara, SPECT, PET (TOF-PET), reconstrucción (FBP/OSEM) y MIRD.',
    sources: 'Bailey et al., Nuclear Medicine Physics, cap. 1–6, 9, 11–13 y 18–19',
    content: `## Bailey · Capítulo 4: Producción de Radionúclidos

Los radioisótopos no sellados se producen mediante tres vías principales:

- Reactores nucleares: captura neutrónica (n,γ), que produce isótopos ricos en neutrones y emisores β−, por ejemplo ¹³¹I, ¹⁷⁷Lu y ⁹⁰Y.
- Ciclotrones: aceleración circular de partículas cargadas (protones o deuterones) mediante campo magnético B y campo eléctrico de RF para bombardear blancos estables. Producen isótopos deficientes en neutrones y emisores β+/EC, por ejemplo ¹⁸F, ¹¹C, ¹³N y ¹⁵O.
- Generadores: separación química periódica donde un padre de vida larga decae en un hijo de vida corta. Ejemplo: generador ⁹⁹Mo/⁹⁹ᵐTc, T½(⁹⁹Mo) = 66 h, eluido con solución salina.

= E_k = \\frac{q^2 B^2 R^2}{2m}

## Bailey · Capítulo 5: Estadística en Medición de Radiación

La tasa de conteo sigue una distribución de Poisson. Para N conteos, la desviación estándar es √N y el error relativo porcentual es 100%/√N.

= \\sigma = \\sqrt{N} \\qquad \\sigma_{\\%} = \\frac{\\sqrt{N}}{N} \\times 100\\% = \\frac{100\\%}{\\sqrt{N}}

El tiempo muerto genera pérdidas de conteo a altas tasas de actividad:

- Modelo no paralizable: R = m/(1 − mτ).
- Modelo paralizable: m = R · e^(−Rτ), donde R es la tasa real, m la observada y τ el tiempo muerto.

## Bailey · Capítulo 6: Detectores Básicos de Radiación

- Centelleo: cristal NaI(Tl) acoplado ópticamente a un tubo fotomultiplicador (PMT); convierte interacciones fotónicas en destellos de luz y después en pulsos eléctricos amplificados, cuya amplitud es proporcional a la energía depositada.
- Semiconductores: detectores de CdZnTe (CZT), con resolución energética superior a los centelladores.

## Bailey · Capítulo 9: Radiofarmacia y Calibrador de Dosis

El activímetro es una cámara de ionización cilíndrica llena de argón a alta presión y operada en saturación. Mide actividad en becquerelios (1 Bq = 1 desintegración/s) o curies (1 Ci = 3.7 × 10¹⁰ Bq).

## Bailey · Capítulo 11: Gammacámara de Anger y SPECT

La gammacámara de Anger consta de:

- Colimador de plomo/tungsteno: filtra la dirección de entrada de los fotones; puede ser paralelo, convergente, divergente o pinhole y determina la resolución espacial.
- Cristal de NaI(Tl), típicamente de 3/8 de pulgada.
- Arreglo de PMTs y red de posicionamiento de lógica de suma (XY).
- Analizador de altura de pulsos (PHA): ventana energética, por ejemplo 20% centrada en 140 keV, para rechazar fotones dispersados por Compton.

SPECT adquiere proyecciones tomográficas mediante la rotación de uno, dos o tres cabezales de gammacámara alrededor del paciente.

## Bailey · Capítulo 12: Tomografía por Emisión de Positrones (PET)

PET detecta en coincidencia simultánea (ventana temporal aproximada de 3–6 ns) la pareja de fotones de aniquilación de 511 keV.

- No requiere colimación mecánica: utiliza colimación electrónica.
- Usa cristales de alta densidad y número atómico: LSO, BGO y BSO.
- TOF-PET mide la diferencia de tiempo Δt entre fotones detectados en lados opuestos y localiza el evento a lo largo de la línea de respuesta (LOR): Δx = c · Δt/2. Esto aumenta la relación señal-ruido (SNR).

## Bailey · Capítulo 13: Reconstrucción de Imagen

- Reconstrucción analítica: retroproyección filtrada (FBP) con filtros de rampa, Shepp–Logan o Butterworth.
- Reconstrucción iterativa: MLEM y OSEM. El modelo puede incorporar correcciones de atenuación, dispersión Compton y función de respuesta del colimador.

## Bailey · Capítulo 18: Dosimetría Interna · Formalismo MIRD

La dosis media en una región blanco rT debida a actividad acumulada en regiones fuente rS es:

= D(r_T) = \\sum_{r_S} \\tilde{A}(r_S) \\cdot S(r_T \\leftarrow r_S)

La actividad acumulada o integrada en el tiempo es Ã(rS) = ∫₀∞ A(rS,t)dt, expresada en Bq·s. El valor S es dosis media por unidad de actividad acumulada, en Gy/(Bq·s):

= S(r_T \\leftarrow r_S) = \\sum_i \\frac{\\Delta_i \\cdot \\phi_i(r_T \\leftarrow r_S)}{m(r_T)}

Δi = Yi · Ei es la energía media emitida por transición; φi es la fracción absorbida en el blanco a partir de la fuente y m(rT) es la masa blanco. Si rT = rS, es auto-dosis; si rT ≠ rS, dosis cruzada (cross-dose).

## Bailey · Capítulo 19: Terapia con Radionúclidos

Radiofármacos no sellados dirigen radiación a nivel celular:

- ¹³¹I: emisor β−, Emax = 0.61 MeV, T½ = 8.02 días; para cáncer diferenciado de tiroides e hipertiroidismo.
- ¹⁷⁷Lu: emisor β− y γ de 208 keV, T½ = 6.65 días; para tumores neuroendocrinos (¹⁷⁷Lu-DOTATATE) y cáncer de próstata (¹⁷⁷Lu-PSMA).
- ⁹⁰Y: emisor β− de alta energía, Emax = 2.28 MeV; para radioembolización hepática con microesferas.`
  },
  {
    id: 'module-5',
    roman: 'V',
    shortTitle: 'Radioterapia',
    title: 'Radioterapia Externa, Braquiterapia y Planificación Clínica',
    summary: 'LINACs, haces de fotones/electrones (PDD, TMR), planificación 3D/IMRT, algoritmos Monte Carlo/convolución y braquiterapia (TG-43).',
    sources: 'Podgorsak, cap. 5–13 y 15 · IAEA TRS-398',
    content: `## Podgorsak · Capítulo 5: Equipamiento de Megavoltaje

- Unidades de ⁶⁰Co: fuente encapsulada que emite líneas gamma de 1.17 y 1.33 MeV (energía media 1.25 MeV), T½ = 5.261 años. La fuente de 1.5–2.0 cm produce penumbra geométrica amplia.
- LINAC: acelera electrones mediante ondas de radiofrecuencia (banda S, 2856 MHz), suministradas por magnetrón o klistrón a una guía de onda resonante de onda estacionaria o progresiva. Electrones de 4–25 MeV impactan un blanco de tungsteno para producir bremsstrahlung o se desvían magnéticamente (270°) para tratamiento directo con electrones.

## Podgorsak · Capítulo 6: Haces Externos de Fotones

La dosimetría se estudia en phantom de agua con geometría SSD (distancia fuente-superficie) o SAD (distancia fuente-eje).

- PDD: razón porcentual entre la dosis a profundidad z y la dosis en zmax: PDD(z,A,f,hν) = 100 · DP(z,A,f,hν)/DP(zmax,A,f,hν). zmax aumenta con la energía: aproximadamente 0.5 cm para ⁶⁰Co, 1.5 cm para 6 MV y 3.0 cm para 18 MV, produciendo ahorro de piel (skin sparing).
- Factor de salida relativo RDF o Sc,p: Sc,p(A) = Sc(A) · Sp(A), combinación de dispersión del colimador y del phantom.
- TAR: TAR(z,Aq) = Dz/Daire.
- TMR: TMR(z,Aq) = D(z,Aq)/D(zmax,Aq).
- La relación PDD–TMR incluye la corrección por distancia inversa al cuadrado y los factores de dispersión del phantom.

= PDD(z,A,f) = 100 \\cdot TMR(z,A_q) \\cdot \\left(\\frac{f+z_{max}}{f+z}\\right)^2 \\cdot \\frac{S_p(A_q)}{S_p(A)}

## Podgorsak · Capítulo 7: Planificación Clínica con Fotones

Se conforma la distribución de dosis con múltiples campos convergentes, cuñas físicas o dinámicas y bloques conformados.

- Correcciones de heterogeneidad tejido-pulmón-hueso: método del coeficiente de atenuación efectivo y ley de potencias de Batho.
- DVH: representa el volumen de un órgano en función de la dosis; puede ser diferencial o acumulativo.

= CF = \\left[\\frac{TAR(z_2,A_q)}{TAR(z_1+z_2,A_q)}\\right]^{\\rho_e-1}

## Podgorsak · Capítulo 8: Haces de Electrones

Los haces clínicos (4–22 MeV) tienen un depósito superficial relativamente uniforme y una caída abrupta de dosis.

- R50: profundidad donde la dosis cae al 50% del valor máximo.
- Rp: alcance práctico, intersección de la pendiente de máxima caída con el fondo de fotones de bremsstrahlung Dx.
- Energía media en superficie: Ē₀ = C · R50, con C = 2.33 MeV/cm en agua.
- Alcances terapéuticos: R90 ≈ E/3.2 cm y R80 ≈ E/2.8 cm.

## Podgorsak · Capítulos 9 y 10: Calibración, Simulación y Adquisición

La calibración de haces de fotones y electrones se basa en patrones de dosis absorbida en agua (ND,w) y kerma en aire (NK), coeficientes de perturbación del detector (pdis, pwall, pcel, pcav) y razones de poder de frenado másico restringido.

La simulación convencional por rayos X y la simulación tomográfica (CT-Simulation) adquieren datos anatómicos. Los números CT en unidades Hounsfield (HU) se convierten a densidad electrónica relativa ρe para el cálculo heterogéneo de dosis.

## Podgorsak · Capítulo 11: Sistemas Computarizados de Planificación (TPS)

- Algoritmos basados en corrección/factorización (1D/2D).
- Convolución-superposición (3D): convoluciona la energía terma impartida con un kernel de dispersión de dosis Monte Carlo.
- Monte Carlo: resuelve directamente el transporte de Boltzmann simulando historias estocásticas de partículas primarias y secundarias.

## Podgorsak · Capítulo 13: Braquiterapia y Formalismo TG-43

La braquiterapia coloca fuentes encapsuladas en contacto directo o dentro del tumor: aplicaciones intracavitarias, intersticiales y superficiales.

= \\dot{D}(r,\\theta) = S_K \\cdot \\Lambda \\cdot \\left[\\frac{G_L(r,\\theta)}{G_L(r_0,\\theta_0)}\\right] \\cdot g_L(r) \\cdot F(r,\\theta)

- SK: fuerza de kerma en aire (μGy·m²·h⁻¹ o U).
- Λ: constante de tasa de dosis en agua (cGy·h⁻¹·U⁻¹).
- GL(r,θ): función geométrica de la distribución de masa de la fuente.
- gL(r): función radial de dosis (atenuación y dispersión en agua).
- F(r,θ): función bidimensional de anisotropía.

Fuentes comunes: ¹⁹²Ir (T½ = 73.8 días, Emedia ≈ 0.38 MeV), ¹²⁵I (T½ = 59.4 días) y ¹³⁷Cs.

## Podgorsak · Capítulo 15: Técnicas Especiales

- SRS/SBRT: dosis altas y conformadas en 1–5 fracciones, con gradientes externos pronunciados.
- IMRT: modulación de fluencia con MLC dinámico o step-and-shoot, guiada por optimización inversa.
- También se estudian irradiación corporal total (TBI) y terapia de electrones de piel total (TSEI).`
  },
  {
    id: 'module-6',
    roman: 'VI',
    shortTitle: 'Radiobiología y protección',
    title: 'Radiobiología, Protección Radiológica y Control de Calidad',
    summary: 'Modelo LQ (α/β, BED), MIRD en terapia (¹⁷⁷Lu), normativas ICRP, ALARA, blindajes y control de calidad transversal.',
    sources: 'Podgorsak, cap. 12, 14 y 16 · Dance, cap. 20–24 · Bailey, cap. 2, 3 y 19',
    content: `## Podgorsak · Capítulo 12: Garantía de Calidad en Radioterapia Externa

Los programas de QA abarcan aceleradores lineales, simuladores y sistemas de planificación. Se verifican tolerancias diarias, mensuales y anuales, incluyendo parámetros mecánicos (isocentro, láseres, escala de gantry/colimador ±1 mm), constancia de tasa de dosis (±2%) y perfil de haz (planitud ±3%, simetría ±2%).

## Podgorsak · Capítulo 14: Radiobiología Básica

El modelo lineal-cuadrático (LQ) describe la supervivencia celular S en función de la dosis D:

= S(D) = \\exp(-\\alpha D - \\beta D^2)

α representa lesiones letales por un solo evento; β representa la acumulación de lesiones subletales por dos impactos independientes. La razón α/β determina la sensibilidad a la fraccionación:

- Tejidos de respuesta temprana y tumores: α/β ≈ 10 Gy.
- Tejidos sanos de respuesta tardía: α/β ≈ 3 Gy.

Para n fracciones de dosis d, con D = n·d, la dosis biológicamente efectiva es:

= BED = D \\left[1 + \\frac{d}{\\alpha/\\beta}\\right]

## Podgorsak · Capítulo 16: Protección Radiológica y Seguridad

El sistema de protección de ICRP se basa en justificación, optimización (ALARA: As Low As Reasonably Achievable) y limitación de dosis. El material de referencia presenta límites ocupacionales de 20 mSv/año promediados en 5 años y 1 mSv/año para público. Se estudia el blindaje de salas de tratamiento: barreras primarias, secundarias y laberintos.

## Dance · Capítulos 20 a 24: Radiobiología, Dosimetría del Paciente y Protección

Se consideran efectos estocásticos (carcinogénesis) y deterministas o reacciones tisulares con umbral, como eritema cutáneo y cataratas. Los DRL se utilizan para optimizar protocolos diagnósticos.

## Bailey · Capítulos 2, 3 y 19: Protección y Terapia con Radionúclidos

La terapia con radiofármacos no sellados dirige la radiación al nivel celular. Entre los ejemplos del programa están ¹³¹I para tiroides, ¹⁷⁷Lu-DOTATATE/PSMA para tumores neuroendocrinos y cáncer de próstata, y ⁹⁰Y para radioembolización hepática. La dosimetría interna MIRD integra la actividad en el tiempo y considera la masa y fracción absorbida de cada órgano blanco.

## Síntesis curricular de los seis módulos

- Módulo I: estructura atómica/nuclear, clasificación de radiaciones, atenuación fotoeléctrica, Compton y producción de pares, bremsstrahlung y colisión. Fuentes: Podgorsak 1–2, Dance 1–2, Bailey 1.
- Módulo II: fluencia, kerma, dosis, cavidades Bragg–Gray y Spencer–Attix, estándares ND,w, TRS-398 y calibración absoluta. Fuentes: Podgorsak 2 y 9, TRS-398 1–11, Dance 3.
- Módulo III: producción de rayos X, MTF/DQE/NPS, CR/DR, CTDIvol/DLP, Doppler y MRI/espacio k. Fuente: Dance 4–15.
- Módulo IV: ciclotrones y generadores, NaI(Tl)/CZT, gammacámara, SPECT/PET/TOF-PET, FBP/OSEM y MIRD. Fuente: Bailey 4–18.
- Módulo V: LINAC, fotones/electrones (PDD/TMR), planificación 3D/IMRT, Monte Carlo/convolución y braquiterapia TG-43. Fuentes: Podgorsak 5–13 y 15, TRS-398.
- Módulo VI: LQ, α/β, BED, MIRD terapéutico, ICRP/ALARA, blindajes y QA transversal. Fuentes: Podgorsak 12, 14 y 16; Dance 20–24; Bailey 2, 3 y 19.

Este programa de seis módulos integra las cuatro fuentes para cubrir física teórica, formulaciones matemáticas y práctica metrológica estandarizada por el OIEA.`
  }
];
