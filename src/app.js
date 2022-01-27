//Recovering helloworld div
const helloworld = document.getElementById("helloworld");

//All for fade animation 

const stringHelloworld = helloworld.textContent;
const splitHelloworld = stringHelloworld.split("");

helloworld.textContent = ""

for (let i = 0; i < splitHelloworld.length; i++) {
    helloworld.innerHTML += "<span>" + splitHelloworld[i] + "</span>"
}


function fade(){
    let char = 0;
    let timer = setInterval(() => {
        const span = helloworld.querySelectorAll('span')[char];
        span.classList.add('fade');
        char ++;
        if (char === splitHelloworld.length) {
            clearInterval(timer);
            timer = null;
            return;
        }
    }, 50);
}

//All for typing animation 

const typeTexts = ['Maël Kehl', 'a computer science student', 'passionate by programming'];
const secondTextPart = document.querySelector(".typing");

let typeCount = 0;
let typeIndex = 0;
let typeCurrentText = '';
let typeLetter = '';

function type(){
    if (typeCount === typeTexts.length) {
        typeCount = 0;
    }

    typeCurrentText = typeTexts[typeCount];
    typeLetter = typeCurrentText.slice(0, ++typeIndex);
    console.log(typeCurrentText)
    console.log(typeLetter)

    secondTextPart.innerHTML = typeLetter;
    if(typeLetter.length === typeCurrentText.length){
        typeCount++;
        typeIndex = 0
    }

    setTimeout(type, 200);
};

