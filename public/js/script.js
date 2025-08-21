const socket = io()

let selectedColor = {}
let buttonLocked = false
const colors = [
    {name: 'red', value: '#ae0e0e'}, 
    {name: 'blue', value: '#0707db'}, 
    {name: 'green', value: '#008000'}, 
    {name: 'yellow', value: '#ffd900'}
]
const teams = []

const button = document.querySelector('.buzzer-btn')
const message = document.querySelector('#message')
const panel = document.querySelector('#panel')
const colorSelect = document.querySelector('#color-select')


const buzzSound = new Audio('/audio/buzzer.mp3')


socket.on('buzz', (color) => {
    message.innerText = `Team ${color} buzzed in!`
    buzzSound.volume = .05
    buzzSound.play()
    toggleBuzzLock()
})

socket.on('colorTaken', (colorName) => {
    const colorOption = document.getElementById(colorName)
    if (colorOption) {
        colorOption.classList.add('disabled')
    }
})

socket.on('initialState', (takenColors) => {
    takenColors.forEach(colorName => {
        const colorOption = document.getElementById(colorName)
        if (colorOption) {
            colorOption.classList.add('disabled')
        }
    })
    if (selectedColor.value) {
        document.querySelectorAll('.color-option').forEach(div => div.classList.add('disabled'))
    }
})

socket.on('colorAvailable', (colorName) => {
    console.log('Color available event received:', colorName)
    if (!selectedColor.value) {
        const colorOption = document.getElementById(colorName)
        if (colorOption) {
            colorOption.classList.remove('disabled')
            console.log(`Enabled color ${colorName} for new player`)
        }
    } else {
        console.log(`Player already has color ${selectedColor.name}, not enabling ${colorName}`)
    }
})

button.addEventListener('click', (e) => {
    buzzIn()
})

const init = () => {
    colors.forEach(color => {
        const colorOption = document.createElement('div')
        colorOption.classList.add('color-option')
        colorOption.id = color.name
        colorOption.style.backgroundColor = color.value
        colorSelect.appendChild(colorOption)
        colorOption.addEventListener('click', (e) => {
            selectTeamColor(color)
            color
        })
    })
}

const selectTeamColor = (color) => {
    if (selectedColor.value) return
    selectedColor = {...color}
    button.style.display = 'block'
    button.style.backgroundColor = selectedColor.value
    socket.emit('register', selectedColor.name)
    message.innerText = 'Click the button to buzz in!'
    document.querySelectorAll('.color-option').forEach(div => div.classList.add('disabled'))
}

const buzzIn = () => {
    socket.emit('buzz', selectedColor.name)
}

const toggleBuzzLock = () => {
    if (!buttonLocked) {
        buttonLocked = true
        button.disabled = true
        button.style.opacity = '0.5'
        setTimeout(() => {
            buttonLocked = false
            button.disabled = false
            button.style.opacity = '1'
            message.innerText = 'Click the button to buzz in!'
        }, 3000)
    }
}

init()