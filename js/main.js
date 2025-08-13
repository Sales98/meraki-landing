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

const submitBtn = document.getElementById('submitBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

form.addEventListener("submit", async (e) => {
  e.preventDefault();


  formMessage.textContent = "";
  formMessage.classList.remove("error", "success");


  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const mensagem = form.mensagem.value.trim();

  if (!nome) {
    formMessage.textContent = "Por favor, insira o seu nome.";
    formMessage.classList.add("error");
    form.nome.focus();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    formMessage.textContent = "Por favor, insira um email válido.";
    formMessage.classList.add("error");
    form.email.focus();
    return;
  }

  if (!mensagem) {
    formMessage.textContent = "Por favor, escreva a sua mensagem.";
    formMessage.classList.add("error");
    form.mensagem.focus();
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


  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> A enviar...';

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
      grecaptcha.reset();
    } else {
      formMessage.textContent = "Houve um erro ao enviar. Por favor, tente novamente mais tarde.";
      formMessage.classList.add("error");
    }
  } catch (error) {
    formMessage.textContent = "Ocorreu um erro inesperado. Tente novamente.";
    formMessage.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar";
  }
});
