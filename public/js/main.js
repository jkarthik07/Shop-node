const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
// const content = document.querySelector('.main-header__nav');

function backdropClickHandler() {
  backdrop.style.display = 'none';
  // content.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  // content.style.display = 'flex';
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);
