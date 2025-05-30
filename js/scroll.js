const images = document.querySelectorAll('.main__img');
const sections = document.querySelectorAll('.target-section');

images.forEach((image) => {
   image.addEventListener('click', () => {
      const targetId = image.dataset.target;
      if (targetId === 'components') {
         image.classList.add('in-progress');
         // setTimeout(() => {
         //    image.classList.remove('in-progress');
         // }, 3000);
         return;
      }
      sections.forEach((section) => section.classList.remove('active'));

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
         targetElement.classList.add('active');
         targetElement.scrollIntoView({ behavior: 'smooth' });
      }
   });
});
