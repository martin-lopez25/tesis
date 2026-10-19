import { useState, useEffect } from 'react';
import { Play, RotateCcw, BookOpen, Copy, Check, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import Panel from '../components/Panel';
import { runPythonCode, NOTEBOOK_PYTHON_PRESETS, type PythonExecutionResult } from '../lib/pythonRunner';

export default function PythonStudioSection() {
  const [selectedPresetId, setSelectedPresetId] = useState(NOTEBOOK_PYTHON_PRESETS[0].id);
  const [code, setCode] = useState(NOTEBOOK_PYTHON_PRESETS[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<PythonExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [oneLiner, setOneLiner] = useState('print("Reactividad =", 150, "pcm | k =", 1 + 150/1e5)');

  // Auto-run preset on initial mount
  useEffect(() => {
    handleRunCode(NOTEBOOK_PYTHON_PRESETS[0].code);
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = NOTEBOOK_PYTHON_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCode(found.code);
    }
  };

  const handleRunCode = async (codeToRun = code) => {
    setIsRunning(true);
    try {
      const result = await runPythonCode(codeToRun);
      setLastResult(result);
    } catch (err: any) {
      setLastResult({
        stdout: '',
        stderr: String(err.message || err),
        status: 'error',
        error: String(err.message || err),
        executionTimeMs: 0,
        engine: 'local_js',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunOneLiner = () => {
    if (!oneLiner.trim()) return;
    handleRunCode(oneLiner);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetPreset = () => {
    const found = NOTEBOOK_PYTHON_PRESETS.find((p) => p.id === selectedPresetId);
    if (found) {
      setCode(found.code);
    }
  };

  return (
    <div className="animate-fade-up space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="hud-label">MOD-06 · ENTORNO PYTHON NATIVO</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono-tech text-emerald-400">
              OFFLINE / WASM CPYTHON 3.12
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
            Laboratorio y Consola de Código Python
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleRunCode()}
            disabled={isRunning}
            className="btn-primary flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-navy-deep font-bold"
          >
            <Play size={16} /> {isRunning ? 'Ejecutando Python...' : '▶ Ejecutar Python'}
          </button>
          <button onClick={handleResetPreset} className="btn-ghost flex items-center gap-1.5">
            <RotateCcw size={14} /> Restaurar Script
          </button>
        </div>
      </div>

      {/* Preset Selector Banner */}
      <div className="rounded-xl border border-navy-border bg-navy-card/80 p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-emerald-400" />
            <span className="text-xs font-mono-tech text-gray-300">Scripts del Notebook de Tesis:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {NOTEBOOK_PYTHON_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono-tech transition-all border ${
                  selectedPresetId === p.id
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 font-bold'
                    : 'border-navy-border text-gray-400 hover:text-white'
                }`}
              >
                {p.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Code Editor & Console Terminal */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Python Code Editor */}
        <Panel
          title="Editor de Código Python"
          badge="PYTHON 3.12"
          accent="reactor"
          className="flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-navy-border/60 pb-2 mb-2">
            <span className="text-[11px] font-mono-tech text-[#7a9ab0]">
              Puedes editar, modificar variables o escribir tus propias funciones:
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] font-mono-tech text-gray-400 hover:text-white"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="relative flex-1">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={22}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-navy-border bg-[#050b14] p-3 font-mono-tech text-xs leading-relaxed text-emerald-300 focus:border-emerald-400 focus:outline-none"
              placeholder="# Escribe tu código Python aquí..."
            />
          </div>

          {/* Quick One-Liner Execution */}
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-navy-border/60">
            <span className="font-mono-tech text-xs font-bold text-emerald-400">&gt;&gt;&gt;</span>
            <input
              type="text"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunOneLiner()}
              placeholder="Expresión rápida: print(2 + 2) o math.cos(math.pi)"
              className="flex-1 rounded bg-[#050b14] px-2.5 py-1 text-xs font-mono-tech text-cyan-300 border border-navy-border focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={handleRunOneLiner}
              className="rounded bg-navy-card px-2.5 py-1 text-xs font-mono-tech text-gray-300 hover:text-white border border-navy-border"
            >
              Evaluar
            </button>
          </div>
        </Panel>

        {/* Live Output Terminal */}
        <div className="space-y-4">
          <Panel
            title="Terminal de Salida (stdout / stderr)"
            badge={lastResult ? `${lastResult.engine.toUpperCase()} · ${lastResult.executionTimeMs}ms` : 'TERMINAL'}
            accent={lastResult?.status === 'error' ? 'critical' : 'cyan'}
          >
            {/* Terminal Window */}
            <div className="rounded-lg border border-navy-border bg-[#03070d] p-3">
              <div className="flex items-center justify-between border-b border-navy-border/50 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[10px] font-mono-tech text-gray-400">python-stdout</span>
                </div>
                {lastResult && (
                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono-tech ${
                      lastResult.status === 'ok' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {lastResult.status === 'ok' ? (
                      <>
                        <CheckCircle2 size={12} /> Éxito ({lastResult.executionTimeMs} ms)
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={12} /> Error en ejecución
                      </>
                    )}
                  </span>
                )}
              </div>

              <pre className="min-h-[260px] max-h-[380px] overflow-auto whitespace-pre-wrap font-mono-tech text-xs leading-relaxed text-[#c8e8f0]">
                {isRunning ? (
                  <span className="text-amber-300 animate-pulse">
                    [Python Runtime] Ejecutando código en procesador local...
                  </span>
                ) : lastResult ? (
                  <>
                    {lastResult.stdout}
                    {lastResult.stderr && (
                      <span className="mt-2 block text-rose-400 font-bold">
                        {lastResult.stderr}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">
                    Haz clic en "▶ Ejecutar Python" para correr el script.
                  </span>
                )}
              </pre>
            </div>

            {/* Engine Info Footnote */}
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono-tech text-[#7a9ab0]">
              <div className="flex items-center gap-1">
                <Cpu size={13} className="text-cyan-400" />
                <span>
                  Motor activo:{' '}
                  <strong className="text-white">
                    {lastResult?.engine === 'pyodide'
                      ? 'Pyodide Wasm (CPython 3.12)'
                      : lastResult?.engine === 'django_backend'
                      ? 'Django Backend (Python Local)'
                      : 'Motor Python Autónomo Offline'}
                  </strong>
                </span>
              </div>
              <span className="text-emerald-400">100% Funcional sin Wi-Fi</span>
            </div>
          </Panel>

          {/* Quick Guide Card */}
          <Panel title="Capacidades de Python en la App" badge="INFO" accent="amber">
            <ul className="space-y-1.5 text-xs text-[#7a9ab0] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Librerías estándar:</strong> <code className="text-cyan-300">math</code>, <code className="text-cyan-300">random</code>, <code className="text-cyan-300">json</code>, estructuras de datos y funciones completas.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Ejecución directa en Android:</strong> Corre en el celular dentro del APK sin necesidad de servidor ni conexión a internet.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Interoperabilidad:</strong> Puedes probar algoritmos en Python y luego compararlos con los gráficos y simulaciones 3D.
                </span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
