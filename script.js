const sheetDBUrl = 'https://sheetdb.io/api/v1/6nrlyxofsg4sa'; // Your SheetDB endpoint
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
  if (isLoginMode) {
    await loginUser();
  } else {
    await registerUser();
  }
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
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

async function registerUser() {
  const minecraftUsername = document.getElementById('minecraftUsername').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();
  const grade = document.getElementById('grade').value;

  if (!minecraftUsername || !email || !password) {
    showToast('Please fill in all required fields.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';

  try {
    // Fetch existing users to check duplicates
    const response = await fetch(sheetDBUrl);
    if (!response.ok) throw new Error('Could not fetch users.');
    const users = await response.json();

    // SheetDB returns an array where each user object has a "data" property
    // Adjust the check accordingly:
    const duplicateUser = users.find(user =>
      (user.data.Email?.trim().toLowerCase() === email) ||
      (user.data.MinecraftUsername?.trim().toLowerCase() === minecraftUsername.toLowerCase())
    );

    if (duplicateUser) {
      showToast('User with this email or Minecraft username already exists.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
      return;
    }

    // No duplicates - add new user
    const addResponse = await fetch(sheetDBUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          MinecraftUsername: minecraftUsername,
          Email: email,
          Password: password,
          Grade: grade
        }
      }),
    });

    if (!addResponse.ok) throw new Error('Failed to register user.');

    showToast('Registration successful! You can now login.', 4000);

    // Switch to login mode automatically
    isLoginMode = true;
    updateFormMode();

  } catch (error) {
    console.error(error);
    showToast('Registration failed. Please try again.');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Register';
}

async function loginUser() {
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showToast('Please fill in email and password.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const response = await fetch(sheetDBUrl);
    if (!response.ok) throw new Error('Could not fetch users.');
    const users = await response.json();

    // Adjust for SheetDB data structure: user.data.Email etc.
    const user = users.find(u =>
      u.data.Email?.trim().toLowerCase() === email &&
      u.data.Password?.trim() === password
    );

    if (!user) {
      showToast('Invalid email or password.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
      return;
    }

    // Successful login
    showToast(`Welcome back, ${user.data.MinecraftUsername}!`, 4000);

    // Hide form and show welcome message
    authForm.style.display = 'none';
    toggleModeBtn.style.display = 'none';
    formTitle.style.display = 'none';
    welcomeSection.classList.remove('hidden');

  } catch (error) {
    console.error(error);
    showToast('Login failed. Please try again.');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Login';
}

// Initialize form mode on page load
updateFormMode();
