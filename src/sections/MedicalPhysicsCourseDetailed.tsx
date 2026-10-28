import { MEDICAL_PHYSICS_MODULES, type MedicalCourseModuleId } from './medicalPhysicsCourseData';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export { MEDICAL_PHYSICS_MODULES } from './medicalPhysicsCourseData';
export type { MedicalCourseModuleId } from './medicalPhysicsCourseData';

type MedicalPhysicsCourseProps = {
  moduleId: MedicalCourseModuleId;
};

function renderInlineMath(text: string) {
  return text.split(/(\$[^$]+\$)/g).map((part, index) => {
    if (!part.startsWith('$') || !part.endsWith('$')) return part;

    return (
      <span
        key={index}
        className="mx-0.5 whitespace-nowrap"
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(part.slice(1, -1), { throwOnError: false }),
        }}
      />
    );
  });
}

function renderContentBlock(block: string, index: number) {
  const lines = block.split('\n');
  const firstLine = lines[0];

  if (firstLine.startsWith('## ')) {
    return (
      <h3 key={index} className="border-b border-slate-border pb-2 pt-5 font-display text-lg font-bold text-nuclear-deep first:pt-0">
        {firstLine.slice(3)}
      </h3>
    );
  }

  if (firstLine.startsWith('### ')) {
    return (
      <h4 key={index} className="pt-3 font-display text-base font-bold text-nuclear-deep">
        {firstLine.slice(4)}
      </h4>
    );
  }

  if (lines.every((line) => line.startsWith('- '))) {
    return (
      <ul key={index} className="space-y-2 pl-1">
        {lines.map((line) => (
          <li key={line} className="flex gap-2.5 font-body text-sm leading-relaxed text-graphite">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
            <span>{renderInlineMath(line.slice(2))}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (firstLine.startsWith('= ')) {
    return (
      <div key={index} className="overflow-x-auto border-l-2 border-amber-400 bg-slate-50 px-3 py-3 text-nuclear-deep">
        {lines.map((line, formulaIndex) => (
          <div
            key={formulaIndex}
            className="overflow-x-auto py-1 text-center text-base"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(line.replace(/^=\s?/, ''), {
                displayMode: true,
                throwOnError: false,
              }),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <p key={index} className="font-body text-sm leading-relaxed text-graphite">
      {renderInlineMath(block)}
    </p>
  );
}

export default function MedicalPhysicsCourseDetailed({ moduleId }: MedicalPhysicsCourseProps) {
  const module = MEDICAL_PHYSICS_MODULES.find((item) => item.id === moduleId) ?? MEDICAL_PHYSICS_MODULES[0];
  const contentBlocks = module.content.split('\n\n');

  return (
    <article className="space-y-5 animate-fade-up" aria-labelledby="medical-course-title">
      <header className="border-l-4 border-techno bg-white px-5 py-5 shadow-sm sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="hud-label block text-techno">MÓDULO {module.roman} · FÍSICA MÉDICA</span>
            <h2 id="medical-course-title" className="mt-1 font-display text-xl font-bold text-nuclear-deep sm:text-2xl">
              {module.title}
            </h2>
          </div>
        </div>
        <p className="mt-3 max-w-4xl font-body text-sm leading-relaxed text-slate-secondary">{module.summary}</p>
        <p className="mt-4 border-t border-slate-border pt-3 font-mono-tech text-[11px] leading-relaxed text-slate-secondary">
          REFERENCIAS: {module.sources}
        </p>
      </header>

      <div className="space-y-4 bg-white px-5 py-5 shadow-sm sm:px-7">
        {contentBlocks.map(renderContentBlock)}
      </div>
    </article>
  );
}