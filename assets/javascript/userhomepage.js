
document.addEventListener("DOMContentLoaded", function () {
    let carouselIds = ['carouselExampleControls', 'bottomCarousel', 'bottom2Carousel'];

    carouselIds.forEach(carouselId => {
        let myCarousel = document.getElementById(carouselId);

        myCarousel.addEventListener('slide.bs.carousel', function (event) {
            let textColors = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#e91e63", "#ecf0f1"];
            let randomIndex = Math.floor(Math.random() * textColors.length);
            let taglineElement = myCarousel.querySelector('.carousel-caption');
            taglineElement.style.color = textColors[randomIndex];
        });
    });
});


//image selector for imageviewer................

function changeImage(largeimg, smallimg) {

    let x = document.getElementById(largeimg)    //[object HTMLImageElement] is the output
    let y = document.getElementById(smallimg)
    x.src = y.src;

}

document.addEventListener("DOMContentLoaded", function () {
    // Initialize medium-zoom on your image
    const zoom = mediumZoom('#mainImage img', {
        background: '#000',
        margin: 20,
        scrollOffset: 20,

    });

    // Add other images to the same zoom group
    zoom.add('#smallImage img');

});
