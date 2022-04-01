import './style.css';

const slider = document.querySelector('.slider');
const slides = Array.from(document.querySelectorAll('.slide'));
const arrowNext = document.getElementById("arrow-next");
const arrowPrev = document.getElementById("arrow-prev");

let isDragging = false,
    startPos = 0,
    currentTranslate = 0,
    prevTranslate = 0,
    animationID = 0,
    currentIndex = 1;

setPositionByIndex();

slides.forEach((slide, index) => {
   //const slideImage = slide.querySelector('img');
   //slideImage.addEventListener('dragstart', (e) => e.preventDefault());

   //Touch events

   slide.addEventListener('touchstart', touchStart(index));
   slide.addEventListener('mousedown', touchStart(index));

   slide.addEventListener('touchmove', touchMove);
   slide.addEventListener('mousemove', touchMove);

   slide.addEventListener('touchend', touchEnd);
   slide.addEventListener('mouseup', touchEnd);
   slide.addEventListener('mouseleave', touchEnd);

});

window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
}


function touchStart(index){
    return function(event){
        currentIndex = index;
        startPos = getPositionX(event);
        isDragging = true;
        animationID = requestAnimationFrame(animation);
        slider.classList.add('grabbing');
    }
}

function touchEnd(){
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;

    if(movedBy < -50 && currentIndex < slides.length - 1) currentIndex += 1;  
    if(movedBy > 50 && currentIndex > 0) currentIndex -= 1; 

    setPositionByIndex();

    slider.classList.remove('grabbing');
}

arrowNext.addEventListener('click', () => {
    if(currentIndex < slides.length - 1) currentIndex += 1;
    setPositionByIndex();
});

arrowPrev.addEventListener('click', () => {
    if(currentIndex > 0) currentIndex -= 1;
    setPositionByIndex();
});

document.addEventListener('keydown', (e) => {
    if (e.code === "ArrowRight"){ 
        if(currentIndex < slides.length - 1) currentIndex += 1;
        setPositionByIndex();
    }
    else if (e.code === "ArrowLeft"){
        if(currentIndex > 0) currentIndex -= 1;
        setPositionByIndex();
    }
});

function touchMove(event){
    if(isDragging){
        const currentPos = getPositionX(event);
        currentTranslate = prevTranslate + currentPos - startPos;
    }
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].pageX;
}

function animation() {
    setSliderPosition();
    if(isDragging) requestAnimationFrame(animation);
}

function setSliderPosition() {
    slider.style.transform = `translateX(${currentTranslate}px)`;
}

function setPositionByIndex() {
    let width = slides[0].offsetWidth;
    currentTranslate =  currentIndex * - width;
    prevTranslate = currentTranslate;
    setSliderPosition();
}
