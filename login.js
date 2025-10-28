const form = document.getElementById('login-form');
const error = document.getElementById('error-message');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'teste' && password === '1925Test.1') {
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'index.html';
    } else {
        error.textContent = 'Usuário ou senha incorretos.';
    }
});