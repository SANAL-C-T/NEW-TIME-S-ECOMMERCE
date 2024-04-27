
document.addEventListener("DOMContentLoaded", function () {
    let carouselIds = ['carouselExampleControls0', 'bottomCarousel0', 'bottom2Carousel0', 'tx1'];

    carouselIds.forEach(carouselId => {
        let myCarousel0 = document.getElementById(carouselId);

        myCarousel0.addEventListener('slide.bs.carousel', function (event) {
            let textColors = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#e91e63", "#ecf0f1"];
            let randomIndex = Math.floor(Math.random() * textColors.length);
            let taglineElement = myCarousel0.querySelector('.carousel-caption');
            taglineElement.style.color = textColors[randomIndex];
        });
    });
});



function validateSignup() {
    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let phone = document.getElementById("phone");
    let password = document.getElementById("password");
    let usernameMessage = document.getElementById("usernameMessage");
    let passwordMessage = document.getElementById("passwordMessage");
    let phoneMessage = document.getElementById("phoneMessage");
    let emailMessage = document.getElementById("emailMessage");

    if (username.value.trim() === "") {
        setError(username, usernameMessage, 'Username cannot be empty');
        return false;
    }

    if (email.value.trim() === "") {
        setError(email, emailMessage, 'Email cannot be empty');
        return false;
    } else if (!email.value.includes('@')) {
        setError(email, emailMessage, 'Invalid email address');
        return false;
    }

    if (phone.value.trim() === "") {
        setError(phone, phoneMessage, 'Phone number cannot be empty');
        return false;
    } else if (phone.value.trim().length < 10) {
        setError(phone, phoneMessage, 'Phone number cannot be less than 10 numbers');
        return false;
    }

    if (password.value.trim() === "") {
        setError(password, passwordMessage, 'Password cannot be empty');
        return false;
    } else if (!/[a-z]/.test(password.value)) {
        setError(password, passwordMessage, 'Password must contain at least one alphabet');
        return false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password.value)) {
        setError(password, passwordMessage, 'Password must contain at least one special character');
        return false;
    } else if (password.value.trim().length < 9) {
        setError(password, passwordMessage, 'Password must be at least 9 characters');
        return false;
    }
    else if (!/\d/.test(password.value)) {
        setError(password, passwordMessage, 'Password must be at least 1 number');
        return false;
    }

    // If all checks pass
    return true;
}

function setError(inputField, messageElement, errorMessage) {
    inputField.style.border = 'solid 2px red';
    messageElement.innerHTML = errorMessage;
}



function validateLogin() {

    console.log("calling from login validation")
    let username = document.getElementById("username")
    let password = document.getElementById("password")
    let usernameMessage = document.getElementById("usernameMessage");
    let passwordMessage = document.getElementById("passwordMessage");
    if (username.value.trim() == "") {
        username.style.border = "solid 2px red"
        usernameMessage.innerHTML = 'Username cannot be empty';

        return false;
    }
    else if (password.value.trim() == "" || password.value.trim().length < 9) {
        password.style.border = "solid 2px red"
        passwordMessage.innerHTML = 'Password cannot be empty or must be at least 9 characters';
        return false;
    }
    else {
        return true;
    }

}




function checkStrong() {
    let password = document.getElementById('password').value;
   
    let passwordMessage = document.getElementById('passwordMessage');
    let s1Message = document.getElementById('S1Message');
    let s2Message = document.getElementById('S2Message');
    let s3Message = document.getElementById('S3Message');
    let s4Message = document.getElementById('S4Message');

    
    passwordMessage.innerHTML = '';

    // Reset check marks
    s1Message.innerHTML = 'Should contain atleast a uppercase alphabet.';
    s2Message.innerHTML = 'Should contain atleast a special character.';
    s3Message.innerHTML = 'Should contain atleast a number.';
    s4Message.innerHTML = 'Should contain atleast 9 characters.';

    // Check if password contains alphabet
    if (/[A-Z]/.test(password)) {
        s1Message.classList.remove('crossmark');
        s1Message.classList.add('checkmark');
    } else {
        s1Message.classList.remove('checkmark');
        s1Message.classList.add('crossmark');
    }

    // Check if password contains special character
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        s2Message.classList.remove('crossmark');
        s2Message.classList.add('checkmark');
    } else {
        s2Message.classList.remove('checkmark');
        s2Message.classList.add('crossmark');
    }

    // Check if password contains number
    if (/\d/.test(password)) {
        s3Message.classList.remove('crossmark');
        s3Message.classList.add('checkmark');
    } else {
        s3Message.classList.remove('checkmark');
        s3Message.classList.add('crossmark');
    }

    // Check if password length is more than 9 characters
    if (password.length >= 9) {
        s4Message.classList.remove('crossmark');
        s4Message.classList.add('checkmark');
    } else {
        s4Message.classList.remove('checkmark');
        s4Message.classList.add('crossmark');
    }
}
