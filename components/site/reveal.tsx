import type { ReactNode } from "react";

// Antes esto ocultaba el contenido (opacity:0) hasta que un
// IntersectionObserver confirmara que entró en pantalla, animándolo con
// Framer Motion. En iOS Safari ese disparador fallaba de forma intermitente
// (contenido que nunca aparecía, o que aparecía y desaparecía con el
// scroll), reproducible en varios iPhones y en modo privado. Después de
// varios intentos de arreglar el disparador sin éxito, se quitó por
// completo: el contenido ahora se renderiza visible desde el inicio.
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
