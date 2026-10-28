import { useState } from 'react';
import { createPortal } from 'react-dom';
import pwrSimulationVideo from '../../Simulador de Reactor Nuclear PWR/gemini_generated_video_3ecf3229.mp4';
import {
  Volume2,
  VolumeX,
  Image as ImageIcon,
  ExternalLink,
  Box,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import Panel from '../components/Panel';

const pwrImageAssets = import.meta.glob<string>(
  '../../Simulador de Reactor Nuclear PWR/*.png',
  { eager: true, import: 'default', query: '?url' }
);

const pwrImageEntries = Object.entries(pwrImageAssets).map(([path, src]) => ({
  path: path.normalize('NFKC').toLowerCase(),
  src,
}));

const PWR_IMAGE_FILES = [
  { file: 'exterio-nuclear.png', title: 'Vista exterior de la central PWR' },
  { file: 'PWR nuclear power plant.png', title: 'Corte general de la planta PWR' },
  { file: 'Labelled cutaway diagram of a PWR nuclear power plant.png', title: 'Corte general de la planta PWR con etiquetas' },
  { file: 'PWR reactor building.png', title: 'Edificio del reactor' },
  { file: 'Labelled cutaway view of a PWR reactor building.png', title: 'Edificio del reactor con etiquetas' },
  { file: 'Turbine Hall of a PWR NPP.png', title: 'Sala de turbinas' },
  { file: 'Diagram of a PWR NPP turbine hall.png', title: 'Sala de turbinas con etiquetas' },
  { file: 'PWR pressurizer.png', title: 'Presurizador PWR' },
  { file: 'Labelled diagram of a PWR pressurizer.png', title: 'Presurizador PWR con etiquetas' },
  { file: 'PWR steam generator.png', title: 'Generador de vapor PWR' },
  { file: 'Labelled diagram of a PWR steam generator.png', title: 'Generador de vapor PWR con etiquetas' },
];

const PWR_IMAGES = PWR_IMAGE_FILES.map((image, index) => {
  const normalizedFile = image.file.normalize('NFKC').toLowerCase();
  const asset = pwrImageEntries.find(({ path }) => path.endsWith(`/${normalizedFile}`));

  return { ...image, number: index + 1, src: asset?.src ?? '' };
});

interface ReactorSectionProps {
  isNativeApk: boolean;
}

export default function ReactorSection({ isNativeApk }: ReactorSectionProps) {
  const [sequenceStage, setSequenceStage] = useState<'video' | 'image' | 'model'>('video');
  const [videoMuted, setVideoMuted] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [imageExpanded, setImageExpanded] = useState(false);
  const firstPwrImage = PWR_IMAGES[0];
  const selectedImage = PWR_IMAGES[selectedImageIndex];
  const displayedImage = isNativeApk ? selectedImage : firstPwrImage;

  const renderImageZoomControls = (expanded: boolean) => (
    <div role="group" aria-label="Controles de zoom de la imagen" className="flex items-center gap-1 rounded-lg border border-white/20 bg-slate-950/85 p-1 text-white shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={() => setImageScale((scale) => Math.max(1, Number((scale - 0.25).toFixed(2))))}
        disabled={imageScale <= 1}
        aria-label="Alejar imagen"
        title="Alejar imagen"
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/15 disabled:opacity-40"
      >
        <ZoomOut size={18} />
      </button>
      <span className="min-w-10 text-center font-mono-tech text-[11px]">{Math.round(imageScale * 100)}%</span>
      <button
        type="button"
        onClick={() => setImageScale((scale) => Math.min(3, Number((scale + 0.25).toFixed(2))))}
        disabled={imageScale >= 3}
        aria-label="Ampliar imagen"
        title="Ampliar imagen"
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/15 disabled:opacity-40"
      >
        <ZoomIn size={18} />
      </button>
      <button
        type="button"
        onClick={() => setImageExpanded(!expanded)}
        aria-label={expanded ? 'Salir de pantalla completa' : 'Ver imagen a pantalla completa'}
        title={expanded ? 'Salir de pantalla completa' : 'Ver imagen a pantalla completa'}
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/15"
      >
        {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </div>
  );

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-border pb-3">
        <div>
          <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-techno">
            SUB-03 · TERMOHIDRÁULICA Y CONTROL
          </span>
          <h2 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-nuclear-deep sm:text-3xl">
            Simulador de Reactor Nuclear PWR
          </h2>
          <p className="mt-1 font-body text-xs text-slate-secondary">
            Vista general de los sistemas principales de la central PWR, el circuito de vapor y la generación eléctrica.
          </p>
          <p className="mt-2 font-mono-tech text-[10px] text-slate-secondary sm:text-xs">
            Crédito:{' '}
            <a
              href="https://www.energyencyclopedia.com/en/free-downloads/online-3d/npp-pwr-1"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-techno underline decoration-techno/40 underline-offset-2 hover:decoration-techno"
            >
              EnergyEncyclopedia.com
            </a>
            {' '}· Uso educativo no comercial
          </p>
        </div>
      </div>

      <div className="w-full">
        <Panel
          title={
            sequenceStage === 'video'
              ? 'Video de simulación PWR'
              : sequenceStage === 'image'
                ? 'Vista general de la central PWR'
                : 'Modelo 3D interactivo PWR'
          }
          badge={sequenceStage === 'video' ? 'ANIMACIÓN' : sequenceStage === 'image' ? 'IMAGEN 01' : 'EXPLORACIÓN'}
          accent="nuclear"
          className="overflow-hidden"
        >
          <div className={`relative overflow-hidden rounded-lg border border-slate-border bg-[#0B253B] ${isNativeApk ? 'aspect-[3/4] sm:aspect-video' : 'aspect-[4/3] sm:aspect-video'}`}>
            {!isNativeApk && (
              <iframe
                aria-hidden={sequenceStage !== 'model'}
                title="Modelo 3D de una central nuclear PWR por Energy Encyclopedia"
                src="https://3d.energyencyclopedia.com/pwr_npp?mode=iframe"
                frameBorder={0}
                allowFullScreen
                tabIndex={sequenceStage === 'model' ? 0 : -1}
                className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${sequenceStage === 'model' ? 'z-20 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}
                style={{ width: '100%', aspectRatio: '1280 / 720' }}
              />
            )}

            {sequenceStage === 'video' && (
              <>
                <video
                  aria-hidden="true"
                  className="absolute inset-0 z-10 h-full w-full scale-110 object-cover opacity-40 blur-md"
                  src={pwrSimulationVideo}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  tabIndex={-1}
                />
                <video
                  aria-label="Video de simulación del reactor PWR"
                  className="absolute inset-0 z-10 h-full w-full object-contain"
                  src={pwrSimulationVideo}
                  autoPlay
                  muted={videoMuted}
                  playsInline
                  preload="metadata"
                  onEnded={() => setSequenceStage('image')}
                />
                <button
                  type="button"
                  onClick={() => setVideoMuted((muted) => !muted)}
                  className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition-colors hover:bg-black/80"
                  aria-label={videoMuted ? 'Activar sonido' : 'Silenciar video'}
                  title={videoMuted ? 'Activar sonido' : 'Silenciar video'}
                >
                  {videoMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </>
            )}

            {sequenceStage === 'image' && (
              <>
                <img
                  src={displayedImage.src}
                  alt={displayedImage.title}
                  className="absolute inset-0 z-10 h-full w-full object-contain"
                  style={{ transform: `scale(${imageScale})`, transition: 'transform 180ms ease-out' }}
                />
                {isNativeApk ? (
                  <>
                    <div className="absolute right-3 top-3 z-30">{renderImageZoomControls(false)}</div>
                    <div
                      role="group"
                      aria-label="Seleccionar imagen del reactor PWR"
                      className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-1 overflow-x-auto border-t border-white/10 bg-slate-950/80 p-2 backdrop-blur-md"
                    >
                      {PWR_IMAGES.map((image, index) => (
                        <button
                          key={image.file}
                          type="button"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageScale(1);
                          }}
                          aria-label={`Mostrar imagen ${image.number}: ${image.title}`}
                          aria-pressed={selectedImageIndex === index}
                          title={image.title}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono-tech text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-techno ${
                            selectedImageIndex === index
                              ? 'border-techno bg-techno text-white'
                              : 'border-white/20 bg-slate-900 text-slate-200 hover:border-techno hover:text-white'
                          }`}
                        >
                          {String(image.number).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSequenceStage('model')}
                    className="absolute bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-md border border-white/30 bg-slate-950/80 px-4 py-2.5 font-display text-xs font-bold uppercase text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900"
                  >
                    <Box size={16} />
                    Entrar al modelo 3D
                  </button>
                )}
              </>
            )}

            {sequenceStage === 'model' && !isNativeApk && (
              <button
                type="button"
                onClick={() => setSequenceStage('image')}
                className="absolute bottom-4 left-4 z-30 inline-flex items-center gap-2 rounded-md border border-white/30 bg-slate-950/80 px-3 py-2 font-display text-xs font-bold uppercase text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900"
              >
                <ImageIcon size={16} />
                Imagen 01
              </button>
            )}
          </div>

          {sequenceStage === 'model' && !isNativeApk && (
            <a
              href="https://3d.energyencyclopedia.com/pwr_npp?mode=iframe"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 font-mono-tech text-xs font-semibold text-techno hover:underline"
            >
              <ExternalLink size={14} />
              Abrir modelo 3D en otra ventana
            </a>
          )}
        </Panel>
      </div>

      {isNativeApk && imageExpanded && sequenceStage === 'image' && createPortal(
        <div className="fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col bg-slate-950 p-3 text-white">
          <div className="mb-2 flex min-h-12 items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="hud-label block text-amber-300">VISTA AMPLIADA PWR</span>
              <p className="truncate font-display text-sm font-semibold text-white">{displayedImage.title}</p>
            </div>
            {renderImageZoomControls(true)}
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black">
            <img
              src={displayedImage.src}
              alt={displayedImage.title}
              className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
              style={{ transform: `scale(${imageScale})`, transition: 'transform 180ms ease-out' }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
