(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const css = `
    html { scroll-behavior: smooth; }
    @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

    .js-progress {
      position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 200;
      background: linear-gradient(90deg, var(--color_secundario), var(--color_primario));
      transform-origin: 0 50%; transform: scaleX(0);
      pointer-events: none;
    }

    .header {
      position: sticky; top: 0; z-index: 100;
      transition: padding .35s ease, background-color .35s ease,
                  box-shadow .35s ease, transform .45s cubic-bezier(.2,.7,.2,1);
    }
    .header::before {
      content: ""; position: absolute; inset: 0; z-index: -1; opacity: 0;
      background-color: rgba(248, 246, 242, .82);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      backdrop-filter: blur(14px) saturate(140%);
      box-shadow: 0 1px 0 rgba(63, 76, 39, .08), 0 10px 30px -18px rgba(63, 76, 39, .35);
      transition: opacity .35s ease;
    }
    .header.is-scrolled { padding: 12px 0; }
    .header.is-scrolled::before { opacity: 1; }
    .header.is-hidden { transform: translateY(-110%); }
    .header__logo, .header__photo { transition: transform .35s ease; }
    .header.is-scrolled .header__logo,
    .header.is-scrolled .header__photo { transform: scale(.86); }

    .header__nav-link { position: relative; padding: 6px 0; }
    .header__nav-link::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
      background: currentColor; transform: scaleX(0); transform-origin: right;
      transition: transform .4s cubic-bezier(.2,.7,.2,1);
    }
    .header__nav-link:hover::after,
    .header__nav-link.is-active::after { transform: scaleX(1); transform-origin: left; }
    .header__nav-link.is-active { color: var(--color_primario); font-weight: 500; }

    .js-menu-btn { display: none; }
    @media (max-width: 900px) {
      .header__container { grid-template-columns: 1fr auto auto; gap: 16px; }
      .js-menu-btn {
        display: grid; place-items: center; width: 46px; height: 46px;
        border: 1px solid rgba(63, 76, 39, .25); border-radius: 50%;
        background: transparent; color: var(--color_primario); cursor: pointer;
        position: relative; z-index: 120;
      }
      .js-menu-btn span, .js-menu-btn span::before, .js-menu-btn span::after {
        display: block; width: 18px; height: 1.5px; background: currentColor;
        border-radius: 2px; transition: transform .35s ease, background-color .2s;
      }
      .js-menu-btn span { position: relative; }
      .js-menu-btn span::before, .js-menu-btn span::after {
        content: ""; position: absolute; left: 0;
      }
      .js-menu-btn span::before { transform: translateY(-6px); }
      .js-menu-btn span::after  { transform: translateY(6px); }
      .js-menu-open .js-menu-btn span { background: transparent; }
      .js-menu-open .js-menu-btn span::before { transform: rotate(45deg); }
      .js-menu-open .js-menu-btn span::after  { transform: rotate(-45deg); }

      .header__nav {
        display: grid !important; place-items: center;
        position: fixed; inset: 0; z-index: 110;
        justify-self: stretch; width: 100vw; height: 100vh; height: 100dvh;
        background: var(--color_crema);
        clip-path: circle(0% at calc(100% - 48px) 48px);
        visibility: hidden;
        transition: clip-path .6s cubic-bezier(.7,0,.2,1), visibility 0s linear .6s;
      }
      .js-menu-open .header__nav {
        clip-path: circle(150% at calc(100% - 48px) 48px);
        visibility: visible;
        transition: clip-path .6s cubic-bezier(.7,0,.2,1), visibility 0s;
      }
      .header__nav-list { flex-direction: column; align-items: center; gap: 28px; }
      .header__nav-link {
        font-family: "Droid Serif", serif; font-size: 2rem; color: var(--color_primario);
      }
      .header__nav-list li {
        opacity: 0; translate: 0 20px;
        transition: opacity .4s ease, translate .5s cubic-bezier(.2,.7,.2,1);
      }
      .js-menu-open .header__nav-list li { opacity: 1; translate: 0 0; }
      .js-menu-open .header__nav-list li:nth-child(1) { transition-delay: .25s; }
      .js-menu-open .header__nav-list li:nth-child(2) { transition-delay: .32s; }
      .js-menu-open .header__nav-list li:nth-child(3) { transition-delay: .39s; }
      .js-menu-open .header__nav-list li:nth-child(4) { transition-delay: .46s; }
      body.js-menu-open { overflow: hidden; }
    }

    .js-reveal {
      opacity: 0; translate: 0 36px;
      transition: opacity .9s ease, translate 1s cubic-bezier(.2,.7,.2,1);
      transition-delay: var(--delay, 0s);
    }
    .js-reveal.is-visible { opacity: 1; translate: 0 0; }

    .js-reveal-img {
      clip-path: inset(18% 8% 18% 8% round 28px);
      transition: clip-path 1.3s cubic-bezier(.7,0,.2,1);
      transition-delay: var(--delay, 0s);
    }
    .js-reveal-img.is-visible { clip-path: inset(0 0 0 0 round 28px); }

    .js-word {
      display: inline-block; overflow: hidden; vertical-align: top;
      padding-bottom: .08em; margin-bottom: -.08em;
    }
    .js-word > span {
      display: inline-block; translate: 0 105%;
      transition: translate 1.1s cubic-bezier(.2,.7,.2,1);
      transition-delay: var(--delay, 0s);
    }
    .is-loaded .js-word > span { translate: 0 0; }

    .hero__image img, .visual__image img, .page-hero__image img, [data-parallax] img {
      scale: 1.14; will-change: transform;
    }

    .benefits__card {
      position: relative; overflow: hidden; isolation: isolate;
      transform-style: preserve-3d;
      transition: transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .5s ease;
      border: 1px solid rgba(63, 76, 39, .06);
    }
    .benefits__card::before {
      content: ""; position: absolute; inset: 0; z-index: -1; opacity: 0;
      background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%),
                  rgba(221, 226, 197, .9), transparent 60%);
      transition: opacity .4s ease;
    }
    .benefits__card:hover { box-shadow: 0 30px 60px -30px rgba(63, 76, 39, .35); }
    .benefits__card:hover::before { opacity: 1; }
    .benefits__card-index {
      display: block; margin-bottom: 26px;
      font-family: "Droid Serif", serif; font-size: .9rem; letter-spacing: .12em;
      color: var(--color_texto_suave, #666a42);
    }

    .button { position: relative; overflow: hidden; isolation: isolate; will-change: transform; }
    .button::after {
      content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
      background: radial-gradient(circle at var(--bx, 50%) var(--by, 50%),
                  rgba(255, 255, 255, .28), transparent 55%);
      opacity: 0; transition: opacity .3s ease;
    }
    .button:hover::after { opacity: 1; }
    .hero__secondary-button:hover { color: white; border-color: var(--color_marron); }

    .visual__quote .js-qword {
      display: inline-block; opacity: .12; filter: blur(4px);
      transition: opacity .6s ease, filter .6s ease;
      transition-delay: var(--delay, 0s);
    }
    .visual__quote.is-visible .js-qword { opacity: 1; filter: blur(0); }

    .js-top {
      position: fixed; right: 22px; bottom: 22px; z-index: 90;
      width: 50px; height: 50px; border-radius: 50%; border: 0; cursor: pointer;
      display: grid; place-items: center;
      background: var(--color_primario); color: white;
      box-shadow: 0 12px 30px -10px rgba(63, 76, 39, .6);
      opacity: 0; translate: 0 20px; pointer-events: none;
      transition: opacity .35s ease, translate .35s ease, background-color .3s;
    }
    .js-top.is-visible { opacity: 1; translate: 0 0; pointer-events: auto; }
    .js-top:hover { background: var(--color_marron); }
    .js-top.on-dark { background: var(--color_crema); color: var(--color_primario); }
    .js-top.on-dark:hover { background: var(--color_verde); }

    .footer .button { background-color: var(--color_crema); color: var(--color_primario); }
    .footer .button:hover { background-color: var(--color_verde); }
    .js-top svg { width: 18px; height: 18px; }

    :focus-visible { outline: 2px solid var(--color_secundario); outline-offset: 4px; }

    @media (prefers-reduced-motion: reduce) {
      .js-reveal, .js-reveal-img, .js-word > span, .visual__quote .js-qword {
        opacity: 1 !important; translate: none !important;
        clip-path: none !important; filter: none !important; transition: none !important;
      }
      .hero__image img, .visual__image img, .page-hero__image img, [data-parallax] img { scale: 1; }
    }
  `;
  const style = document.createElement("style");
  style.id = "landing-enhancements";
  style.textContent = css;
  document.head.appendChild(style);

  const header = $(".header");
  const nav = $(".header__nav");
  const navLinks = $$(".header__nav-link");
  const footer = $(".footer");

  const currentFile =
    decodeURIComponent(location.pathname.split("/").pop()) || "index.html";
  navLinks.forEach((link) => {
    const isCurrent =
      link.getAttribute("aria-current") === "page" ||
      link.getAttribute("href") === currentFile;
    link.classList.toggle("is-active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
  });

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  const headerOffset = () => (header ? header.offsetHeight : 0);
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (id === "#") return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset() + 1;
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  });

  navLinks.forEach((l) => l.addEventListener("click", () => closeMenu()));

  let menuBtn = null;

  const behindMenu = () =>
    $$("main, footer, .header__brand, .header__photo, .js-top");

  function closeMenu({ returnFocus = false } = {}) {
    if (!document.body.classList.contains("js-menu-open")) return;
    document.body.classList.remove("js-menu-open");
    behindMenu().forEach((el) => (el.inert = false));
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Abrir menú");
      if (returnFocus) menuBtn.focus();
    }
  }

  function openMenu() {
    document.body.classList.add("js-menu-open");
    behindMenu().forEach((el) => (el.inert = true));
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Cerrar menú");
    header.classList.remove("is-hidden");

    const first = $(".header__nav-link", nav);
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 250);
  }

  if (header && nav) {
    nav.id = nav.id || "menu-principal";
    menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "js-menu-btn";
    menuBtn.setAttribute("aria-controls", nav.id);
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menú");
    menuBtn.innerHTML = "<span></span>";
    $(".header__container").appendChild(menuBtn);

    menuBtn.addEventListener("click", () => {
      if (document.body.classList.contains("js-menu-open")) {
        closeMenu({ returnFocus: true });
      } else {
        openMenu();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu({ returnFocus: true });
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const progress = document.createElement("div");
  progress.className = "js-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);

  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "js-top";
  topBtn.setAttribute("aria-label", "Volver arriba");
  topBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  topBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  );
  document.body.appendChild(topBtn);

  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (header) {
      header.classList.toggle("is-scrolled", y > 20);
      const goingDown = y > lastY;
      const menuOpen = document.body.classList.contains("js-menu-open");
      header.classList.toggle(
        "is-hidden",
        goingDown && y > 320 && !menuOpen && Math.abs(y - lastY) > 2
      );
      if (!goingDown) header.classList.remove("is-hidden");
    }

    topBtn.classList.toggle("is-visible", y > window.innerHeight * 0.9);
    if (footer) {
      const b = topBtn.getBoundingClientRect();
      topBtn.classList.toggle(
        "on-dark",
        footer.getBoundingClientRect().top < b.top + b.height / 2
      );
    }

    if (!reduceMotion) parallax();

    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  const parallaxItems = $$(
    ".hero__image img, .visual__image img, .page-hero__image img, [data-parallax] img"
  ).map(
    (img) => ({ img, box: img.parentElement, strength: 0.08 })
  );

  function parallax() {
    const vh = window.innerHeight;
    parallaxItems.forEach(({ img, box, strength }) => {
      const r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;

      const progress = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      img.style.transform = `translate3d(0, ${(progress * r.height * strength).toFixed(1)}px, 0)`;
    });
  }

  const heroTitle = $(".hero__title, .page-hero__title");
  if (heroTitle && !reduceMotion) {
    const words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.setAttribute("aria-label", heroTitle.textContent.trim());
    heroTitle.innerHTML = words
      .map(
        (w, i) =>
          `<span class="js-word" aria-hidden="true"><span style="--delay:${(
            0.25 +
            i * 0.12
          ).toFixed(2)}s">${w}</span></span>`
      )
      .join(" ");
  }

  const heroSeq = [
    [".hero__tag", 0.1],
    [".hero__description, .page-hero__text", 0.65],
    [".hero__buttons", 0.8],
  ];
  heroSeq.forEach(([sel, d]) => {
    const el = $(sel);
    if (!el) return;
    el.classList.add("js-reveal");
    el.style.setProperty("--delay", d + "s");
  });
  const heroImg = $(".hero__image, .page-hero__image");
  if (heroImg) {
    heroImg.classList.add("js-reveal-img");
    heroImg.style.setProperty("--delay", ".2s");
  }

  const startHero = () => {
    document.documentElement.classList.add("is-loaded");
    heroSeq.forEach(([sel]) => {
      const el = $(sel);
      if (el) el.classList.add("is-visible");
    });
    if (heroImg) heroImg.classList.add("is-visible");
  };
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(() =>
    requestAnimationFrame(startHero)
  );

  $$(".benefits__card").forEach((card, i) => {
    if (!$(".benefits__card-index", card)) {
      const n = document.createElement("span");
      n.className = "benefits__card-index";
      n.setAttribute("aria-hidden", "true");
      n.textContent = String(i + 1).padStart(2, "0");
      card.prepend(n);
    }
    card.classList.add("js-reveal");
    card.style.setProperty("--delay", (i * 0.12).toFixed(2) + "s");
  });

  const visualImg = $(".visual__image");
  if (visualImg) visualImg.classList.add("js-reveal-img");

  $$(".visual__content > :not(.visual__quote)").forEach((el, i) => {
    el.classList.add("js-reveal");
    el.style.setProperty("--delay", (0.15 + i * 0.12).toFixed(2) + "s");
  });

  $$("[data-reveal]").forEach((el) => el.classList.add("js-reveal"));
  $$("[data-reveal-stagger]").forEach((group) => {
    [...group.children].forEach((el, i) => {
      el.classList.add("js-reveal");
      el.style.setProperty("--delay", (i * 0.1).toFixed(2) + "s");
    });
  });

  $$(".footer__container > *").forEach((el, i) => {
    el.classList.add("js-reveal");
    el.style.setProperty("--delay", (i * 0.12).toFixed(2) + "s");
  });

  const quote = $(".visual__quote, [data-quote]");
  if (quote && !reduceMotion) {
    const text = quote.textContent.trim();
    quote.setAttribute("aria-label", text);
    quote.innerHTML = text
      .split(/\s+/)
      .map(
        (w, i) =>
          `<span class="js-qword" aria-hidden="true" style="--delay:${(
            0.3 +
            i * 0.08
          ).toFixed(2)}s">${w}</span>`
      )
      .join(" ");
  }

  const toReveal = [
    ...$$(".js-reveal, .js-reveal-img").filter(
      (el) => !el.closest(".hero, .page-hero")
    ),
    quote,
  ].filter(Boolean);

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    toReveal.forEach((el) => revealObs.observe(el));
  } else {
    toReveal.forEach((el) => el.classList.add("is-visible"));
  }

  if (finePointer && !reduceMotion) {
    $$(".benefits__card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform =
          `perspective(900px) rotateX(${((0.5 - y) * 6).toFixed(2)}deg) ` +
          `rotateY(${((x - 0.5) * 8).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    $$(".button").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
        btn.style.setProperty("--bx", `${e.clientX - r.left}px`);
        btn.style.setProperty("--by", `${e.clientY - r.top}px`);
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  const form = $(".js-booking");
  if (form) {
    const success = $(".form-success");
    const status = $(".form__status", form);
    const submit = $('[type="submit"]', form);
    const submitText = submit.textContent;

    const pre = new URLSearchParams(location.search).get("servicio");
    const select = form.elements.servicio;
    if (pre && select && [...select.options].some((o) => o.value === pre)) {
      select.value = pre;
    }

    form.setAttribute("novalidate", "");
    const fields = [...form.elements].filter(
      (el) => el.willValidate && el.type !== "submit"
    );

    const validate = (field) => {
      const wrap = field.closest(".form__field");
      const v = field.validity;
      let msg = "";
      if (!v.valid) {
        if (v.valueMissing) {
          msg =
            field.type === "checkbox"
              ? "Necesitamos tu confirmación para poder responderte."
              : field.tagName === "SELECT"
              ? "Elegí una opción."
              : "Este campo es obligatorio.";
        } else if (v.typeMismatch) {
          msg = "Revisá el formato del email (por ejemplo nombre@mail.com).";
        } else if (v.tooShort) {
          msg = `Contame un poco más (mínimo ${field.minLength} caracteres).`;
        } else {
          msg = "Revisá este campo.";
        }
      }
      if (wrap) {
        wrap.classList.toggle("is-invalid", Boolean(msg));
        const err = $(".form__error", wrap);
        if (err) err.textContent = msg;
      }
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    };

    fields.forEach((field) => {
      field.addEventListener("blur", () => validate(field));
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
      field.addEventListener("change", () => {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const allValid = fields.map(validate).every(Boolean);
      if (!allValid) {
        const first = $('[aria-invalid="true"]', form);
        if (first) first.focus();
        return;
      }

      status.hidden = true;
      submit.disabled = true;
      submit.textContent = "Enviando…";

      const demo = form.action.includes("TU_ID");

      try {
        if (demo) {
          await new Promise((r) => setTimeout(r, 700));
          console.warn(
            "Formulario en modo demo: reemplazá TU_ID_DE_FORMSPREE en form.html para recibir los mensajes."
          );
        } else {
          const res = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
        }

        form.hidden = true;
        if (success) {
          const demoNote = $(".form-success__demo", success);
          if (demoNote) demoNote.hidden = !demo;
          success.hidden = false;
          success.focus();
          success.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "center",
          });
        }
      } catch (err) {
        status.textContent =
          "No se pudo enviar el mensaje. Probá de nuevo en un rato o escribime desde la página de contacto.";
        status.hidden = false;
        submit.disabled = false;
        submit.textContent = submitText;
      }
    });
  }

  onScroll();
})();
