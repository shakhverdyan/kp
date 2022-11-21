const swiper = new Swiper('.swiper', {
  // Optional parameters


  slidesPerView: 1.5,


  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    type: 'progressbar',
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },


});





const mobBurger = document.querySelector('.mob_burger');
const navList = document.querySelector('.nav_list')
mobBurger.addEventListener('click', () => {
  mobBurger.classList.toggle('mob_burger-active');
  navList.classList.toggle('nav_list_active');
})