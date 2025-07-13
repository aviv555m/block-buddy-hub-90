const sheetDBUrl = 'https://sheetdb.io/api/v1/6nrlyxofsg4sa';
let isLoginMode = false;

const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const formTitle = document.getElementById('formTitle');
const authForm = document.getElementById('authForm');
const usernameGroup = document.getElementById('usernameGroup');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const gradeSelect = document.getElementById('grade');
const submitBtn = document.getElementById('submitBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const welcomeSection = document.getElementById('welcomeSection');
const toast = document.getElementById('toast');

themeBtn.onclick = () => {
  body.classList.toggle('dark');
  themeBtn.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
};

toggleModeBtn.onclick = () => {
  isLoginMode = !isLoginMode;
  updateFormMode();
};

authForm.onsubmit = async e => {
  e.preventDefault();
  isLoginMode ? await loginUser() : await registerUser();
};

function updateFormMode() {
  formTitle.textContent = isLoginMode ? 'Login' : 'Register';
  usernameGroup.classList.toggle('hidden', isLoginMode);
  gradeSelect.classList.toggle('hidden', isLoginMode);
  submitBtn.textContent = isLoginMode ? 'Login' : 'Register';
  toggleModeBtn.textContent = isLoginMode
    ? "Don't have an account? Register"
    : "Already have an account? Login";
  clearForm();
  authForm.style.display = 'flex';
  toggleModeBtn.style.display = 'block';
  formTitle.style.display = 'block';
  welcomeSection.classList.add('hidden');
}

function clearForm() {
  authForm.reset();
}

function showToast(msg, dur = 3000) {
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', dur);
}

async function registerUser() {
  const u = document.getElementById('minecraftUsername').value.trim();
  const e = emailInput.value.trim().toLowerCase();
  const p = passInput.value.trim();
  const g = gradeSelect.value;

  if (!u || !e || !p) {
    return showToast('Please fill in Username, Email, and Password');
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering…';

  try {
    const resp = await fetch(sheetDBUrl);
    const rows = await resp.json();

    if (!resp.ok) throw 'Fetch error';

    const dup = rows.find(r =>
      r.data.Email.trim().toLowerCase() === e ||
      r.data.MinecraftUsername.trim().toLowerCase() === u.toLowerCase()
    );

    if (dup) {
      showToast('Email or Username already exists');
    } else {
      const addResp = await fetch(sheetDBUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { MinecraftUsername: u, Email: e, Password: p, Grade: g } })
      });
      if (!addResp.ok) throw 'Save failed';
      showToast('Registered successfully! Please login.', 4000);
      isLoginMode = true;
      updateFormMode();
    }
  } catch (err) {
    console.error(err);
    showToast('Registration failed. Try again.');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Register';
}

async function loginUser() {
  const e = emailInput.value.trim().toLowerCase();
  const p = passInput.value.trim();

  if (!e || !p) {
    return showToast('Please fill in Email and Password');
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in…';

  try {
    const resp = await fetch(sheetDBUrl);
    const rows = await resp.json();
    if (!resp.ok) throw 'Fetch error';

    const user = rows.find(r =>
      r.data.Email.trim().toLowerCase() === e &&
      r.data.Password === p
    );

    if (!user) {
      return showToast('Invalid Email or Password');
    }

    showToast(`Welcome back, ${user.data.MinecraftUsername}`, 4000);
    authForm.style.display = 'none';
    toggleModeBtn.style.display = 'none';
    formTitle.style.display = 'none';
    welcomeSection.classList.remove('hidden');

  } catch (err) {
    console.error(err);
    showToast('Login failed. Try again.');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Login';
}

// Run on load
updateFormMode();
