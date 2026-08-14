"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Animación de entrada al hacer scroll.
//
// Historia: esto se quitó cuatro veces porque en iOS Safari el contenido se
// quedaba invisible o parpadeaba. La causa real no era WebKit: la página
// tardaba segundos en hidratarse (auth bloqueante en el middleware + lecturas
// de Supabase que fallaban en silencio), así que el observer tardaba una
// eternidad en armarse y el contenido se quedaba en opacity:0 a la vista del
// usuario. Arreglada esa raíz, la animación vuelve — pero con dos garantías
// que antes no existían:
//
//  1. El estado oculto lo aplica CSS solo si un script inline marcó
//     <html data-reveal="on"> ANTES del primer pintado. Si el JS no corre,
//     el HTML servido se ve tal cual, visible.
//  2. Ese mismo script inline tiene un failsafe por timeout que quita el
//     atributo pase lo que pase (ver app/layout.tsx). O sea: aunque React
//     nunca hidrate o el observer nunca dispare, el contenido aparece.
//
// El contenido nunca depende de React para ser visible. React solo lo anima.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Le avisa al script inline de app/layout.tsx que React sí hidrató, para
    // que su failsafe por timeout no revele todo de golpe. Si esta línea
    // nunca corre, el failsafe hace su trabajo.
    document.documentElement.setAttribute("data-reveal-ready", "");

    const show = () => el.setAttribute("data-shown", "true");

    // Si el navegador no soporta IntersectionObserver, o el usuario pidió
    // menos movimiento, se muestra de una vez sin animar.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      show();
      return;
    }

    // Si ya está en pantalla al montar (todo lo above-the-fold), se revela
    // sin esperar a que el observer dispare en el siguiente frame.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal-item=""
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
