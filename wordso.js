import { WORDS } from "./wordlist.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
console.log(rightGuessString)

function initBoard() {
    let board = document.getElementById("gameBoard");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

function restartBoard() {
    /*reload the page*/
    location.reload()
}

toastr.options = {
    "closeButton": false,
    "debug": true,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

initBoard()

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
    console.log('currentGuess:', currentGuess)
    console.log('nextLetter:', nextLetter)
    console.log('key pressed:', pressedKey)
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}


function checkGuess (ignoreList = false) {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }
    if (ignoreList === false) {
        if (guessString.length != 5) {
            toastr.error(`${guessString} doesn't have enough letters!`)
            return
        }

        if (!WORDS.includes(guessString)) {
            toastr.error(`"${guessString.toUpperCase()}" is not a valid word!`)
            return
        }
    }
    
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green'
            } else {
                // shade box yellow
                letterColor = 'yellow'
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("Congratulations! You guessed right!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr["error"](`You've ran out of guesses,\nthe right word was: "${rightGuessString}"`)
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColors
            if (oldColor === 'lime') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'lime') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

document.getElementById("hint").addEventListener("click", (e) => {
    hint()
})

document.getElementById("restart").addEventListener("click", (e) => {
    restartBoard()
})

const animateCSS = (element, animation, prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
      const animationName = `${prefix}${animation}`;
      // const node = document.querySelector(element);
      const node = element
      node.style.setProperty('--animate-duration', '0.3s');
      
      node.classList.add(`${prefix}animated`, animationName);
  
      // When the animation ends, we clean the classes and resolve the Promise
      function handleAnimationEnd(event) {
        event.stopPropagation();
        node.classList.remove(`${prefix}animated`, animationName);
        resolve('Animation ended');
      }
  
      node.addEventListener('animationend', handleAnimationEnd, {once: true});
  });

function hint() {
    /*dont allow hint to be called if enter is pressed*/
    if (nextLetter !== 0) {
        toastr.error("You can't use a hint after you've started typing!")
        return
    }
    /*dont allow hint to be called if there are no guesses remaining*/
    if (guessesRemaining === 0) {
        toastr.error("You can't use a hint after you've run out of guesses!")
        return
    }
    /*dont allow hint to be called if the word is already guessed*/
    if (currentGuess.length === 5) {
        toastr.error("You can't use a hint after you've guessed the word!")
        return
    }
    /*dont allow hint to be called if the player is on their last guess*/
    if (guessesRemaining === 1) {
        toastr.error("You can't use a hint on your last guess!")
        return
    }
    let numRan = Math.floor(Math.random() * 5)
    for (let j = 0; j < 5; j++){
        if (j !== numRan) {
            insertLetter('?')
        }
        else {
        insertLetter(rightGuessString[numRan])
        }
    }
    checkGuess(true)
}