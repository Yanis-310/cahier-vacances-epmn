import type { TexteCahier } from "@/content/cahier-textes";

// Rendu commun du préambule et du mot de la fin : titre, sections à intertitres, phrase de clôture.
export default function TexteCahierView({ texte }: { texte: TexteCahier }) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-6" style={{ color: "#F2C073" }}>
        {texte.title}
      </h1>
      <div className="space-y-8">
        {texte.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="text-lg font-semibold text-foreground mb-2">{section.heading}</h2>
            )}
            <div className="space-y-3 text-foreground/75 leading-relaxed">
              {section.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      {texte.closing && (
        <p className="mt-8 text-xl font-semibold text-center" style={{ color: "#F2C073" }}>
          {texte.closing}
        </p>
      )}
    </>
  );
}
