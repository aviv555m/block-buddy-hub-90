const sheetDBUrl = 'https://sheetdb.io/api/v1/6nrlyxofsg4sa';
let isLoginMode = false;

const formTitle = document.getElementById('formTitle');
const authForm = document.getElementById('authForm');
const usernameGroup = document.getElementById('usernameGroup');
const gradeGroup = document.getElementById('gradeGroup');
const submitBtn = document.getElementById('submitBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const welcomeSection = document.getElementById('welcomeSection');
const toast = document.getElementById('toast');

toggleModeBtn.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  updateFormMode();
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoginMode) await loginUser();
  else await registerUser();
});

function updateFormMode() {
  if (isLoginMode) {
    formTitle.textContent = 'Login';
    usernameGroup.classList.add('hidden');
    gradeGroup.classList.add('hidden');
    submitBtn.textContent = 'Login';
    toggleModeBtn.textContent = "Don't have an account? Register";
  } else {
    formTitle.textContent = 'Register';
    usernameGroup.classList.remove('hidden');
    gradeGroup.classList.remove('hidden');
    submitBtn.textContent = 'Register';
    toggleModeBtn.textContent = 'Already have an account? Login';
  }
  clearForm();
  welcomeSection.classList.add('hidden');
  authForm.style.display = 'flex';
  toggleModeBtn.style.display = 'inline-block';
  formTitle.style.display = 'block';
}

function clearForm() {
  authForm.reset();
}

function showToast(message, duration = 3000) {
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', duration);
}

async function registerUser() {
  const u = document.getElementById('minecraftUsername').value.trim();
  const e = document.getElementById('email').value.trim().toLowerCase();
  const p = document.getElementById('password').value.trim();
  const g = document.getElementById('grade').value;

  if (!u || !e || !p) {
    showToast('Fill in all required fields.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';

  try {
    const resp = await fetch(sheetDBUrl);
    if (!resp.ok) throw new Error('Fetch users failed');
    const rows = await resp.json();

    const dup = rows.find(r => (
      r.data.Email?.trim().toLowerCase() === e ||
      r.data.MinecraftUsername?.trim().toLowerCase() === u.toLowerCase()
    ));

    if (dup) {
      showToast('Email or Minecraft username already exists.');
    } else {
      const addResp = await fetch(sheetDBUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { MinecraftUsername: u, Email: e, Password: p, Grade: g } })
      });
      if (!addResp.ok) throw new Error('Save failed');
      showToast('Registered! Now please login.', 4000);

      isLoginMode = true;
      updateFormMode();
    }
  } catch (err) {
    console.error(err);
    showToast('Registration failed – try again later.');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = isLoginMode ? 'Login' : 'Register';
}

async function loginUser() {
  const e = document.getElementById('email').value.trim().toLowerCase();
  const p = document.getElementById('password').value.trim();

  if (!e || !p) {
    showToast('Fill in email and password.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const resp = await fetch(sheetDBUrl);
    if (!resp.ok) throw new Error('Fetch users failed');
    const rows = await resp.json();

    const user = rows.find(r =>
      r.data.Email?.trim().toLowerCase() === e &&
      r.data.Password?.trim() === p
    );

    if (!user) {
      showToast('Invalid email or password.');
    } else {
      showToast(`Welcome back, ${user.data.MinecraftUsername}!`, 4000);
      authForm.style.display = 'none';
      toggleModeBtn.style.display = 'none';
      formTitle.style.display = 'none';
      welcomeSection.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    showToast('Login failed – try again later.');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = isLoginMode ? 'Login' : 'Register';
}

// Initialize
updateFormMode();
