const wrapper = document.querySelector('.wrapper');
const registerlink = document.querySelector('.register-link');
const loginlink = document.querySelector('.login-link');

registerlink.onclick = () => {
    wrapper.classList.add('active');
}

loginlink.onclick = () => {
    wrapper.classList.remove('active');
}

function goToSignup() {
    window.location.href = "signup.html";
}

// Toggle Password Visibility
const passwordToggles = document.querySelectorAll('.password-toggle');

passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
        const parent = this.parentElement;
        const passwordInput = parent.querySelector('input');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.remove('bx-hide');
            this.classList.add('bx-show');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('bx-show');
            this.classList.add('bx-hide');
        }
    });
});