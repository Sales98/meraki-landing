const toggle = document.querySelector('.btn--toggle');
const navList = document.querySelector('.nav__list');
if (toggle && navList) {
  toggle.addEventListener('click', () => {
    navList.classList.toggle('nav--open');
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

const navLinks = document.querySelectorAll('.nav__list a');
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const link = document.querySelector(`.nav__list a[href="#${id}"]`);
    if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
      navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.parentElement) l.parentElement.classList.remove('active');
      });
      if (link) {
        link.classList.add('active');
        if (link.parentElement) link.parentElement.classList.add('active');
      }
    }
  });
}, { threshold: [0.6] });

sections.forEach(sec => observer.observe(sec));

/* -------------------------
   Helper: regista o evento
   ------------------------- */
function registerFormSubmission(data) {
  try {
    // 1) dataLayer (GTM)
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push(data);
    }

    // 2) gtag (GA / GA4)
    if (typeof gtag === 'function') {
      try {
        gtag('event', 'form_submission', {
          event_category: 'contact',
          event_label: data.formName || 'contact-form',
          value: 1
        });
      } catch (e) { /* ignora erros aqui */ }
    }

    // 3) optional: send to a custom analytics endpoint (non-blocking)
    if (window.FORM_ANALYTICS_ENDPOINT) {
      const payload = JSON.stringify(data);
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(window.FORM_ANALYTICS_ENDPOINT, blob);
      } else {
        // fallback fetch (não bloqueante)
        fetch(window.FORM_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => { /* swallow errors */ });
      }
    }
  } catch (err) {
    // garantir que esta função nunca quebra o envio do formulário
    // console.debug(err);
  }
}

/* -------------------------
   Form handling
   ------------------------- */
const submitBtn = document.getElementById('submitBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // safety guards
    if (!formMessage) return;

    formMessage.textContent = "";
    formMessage.classList.remove("error", "success");

    const nome = (form.nome && form.nome.value) ? form.nome.value.trim() : "";
    const email = (form.email && form.email.value) ? form.email.value.trim() : "";
    const mensagem = (form.mensagem && form.mensagem.value) ? form.mensagem.value.trim() : "";

    if (!nome) {
      formMessage.textContent = "Por favor, insira o seu nome.";
      formMessage.classList.add("error");
      if (form.nome) form.nome.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      formMessage.textContent = "Por favor, insira um email válido.";
      formMessage.classList.add("error");
      if (form.email) form.email.focus();
      return;
    }

    if (!mensagem) {
      formMessage.textContent = "Por favor, escreva a sua mensagem.";
      formMessage.classList.add("error");
      if (form.mensagem) form.mensagem.focus();
      return;
    }

    if (typeof grecaptcha !== "undefined") {
      const recaptchaResponse = grecaptcha.getResponse();
      if (!recaptchaResponse) {
        formMessage.textContent = "Por favor, complete o reCAPTCHA.";
        formMessage.classList.add("error");
        return;
      }
    } else {
      formMessage.textContent = "O reCAPTCHA não está disponível. Por favor, recarregue a página.";
      formMessage.classList.add("error");
      return;
    }

    // UI: spinner / disabled
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> A enviar...';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        formMessage.textContent = "Mensagem enviada com sucesso! Obrigado pelo contacto.";
        formMessage.classList.add("success");
        form.reset();
        if (typeof grecaptcha !== "undefined") {
          try { grecaptcha.reset(); } catch (e) {}
        }

        // ---------- AQUI: registar evento de envio bem-sucedido ----------
        const eventData = {
          event: 'form_submission',
          formId: form.id || 'contactForm',
          formName: 'Marcar Consulta',
          timestamp: Date.now(),
          page: window.location.pathname
        };
        registerFormSubmission(eventData);
        // -----------------------------------------------------------------

      } else {
        formMessage.textContent = "Houve um erro ao enviar. Por favor, tente novamente mais tarde.";
        formMessage.classList.add("error");
      }
    } catch (error) {
      formMessage.textContent = "Ocorreu um erro inesperado. Tente novamente.";
      formMessage.classList.add("error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar";
      }
    }
  });
}

/* fechar nav móvel ao clicar no link (UX) */
document.querySelectorAll('.nav__list a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 576px)').matches) {
      document.querySelector('.nav__list')?.classList.remove('nav--open');
    }
  });
});
