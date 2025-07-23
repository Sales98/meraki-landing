const toggle = document.querySelector('.btn--toggle');
const navList = document.querySelector('.nav__list');

toggle.addEventListener('click', () => {
  navList.classList.toggle('nav--open');
});