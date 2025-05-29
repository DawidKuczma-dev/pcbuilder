const images = document.querySelectorAll('.main__img');
const sections = document.querySelectorAll('.target-section');

images.forEach((image) => {
   image.addEventListener('click', () => {
      const targetId = image.dataset.target;

      sections.forEach((section) => section.classList.remove('active'));

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
         targetElement.classList.add('active');
         targetElement.scrollIntoView({ behavior: 'smooth' });
      }
   });
});

const btn = document.querySelector('.games__submit');
const result = document.getElementById('result');

btn.addEventListener('click', () => {
   result.classList.add('active');
   result.scrollIntoView({ behavior: 'smooth' });
});
