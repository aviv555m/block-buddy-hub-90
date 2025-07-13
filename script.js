const sheetDBUrl = 'https://sheetdb.io/api/v1/6nrlyxofsg4sa';
let isLoginMode = false;
let isDarkMode = false;
let currentLang = 'en';

const formTitle = document.getElementById('formTitle');
const authForm = document.getElementById('authForm');
const usernameGroup = document.getElementById('usernameGroup');
const gradeGroup = document.getElementById('gradeGroup');
const submitBtn = document.getElementById('submitBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const welcomeSection = document.getElementById('welcomeSection');
const toast = document.getElementById('toast');
const darkModeBtn = document.getElementById('darkModeBtn');
const langBtn = document.getElementById('langBtn');

const texts = {
  en: {
    register: 'Register',
    login: 'Login',
    alreadyAccount: 'Already have an account? Login',
    noAccount: "Don't have an account? Register",
    fillRequired: 'Please fill in all required fields.',
    userExists: 'User with this email or Minecraft username already exists.',
    regSuccess: 'Registration successful! You can now login.',
    regFail: 'Registration failed. Please try again.',
    fillEmailPass: 'Please fill in email and password.',
    invalidCreds: 'Invalid email or password.',
    loginFail: 'Login failed. Please try again.',
    welcomeBack: (name) => `Welcome back, ${name}!`,
    welcomeMsg: 'You have successfully logged in. Welcome to the SchoolCraft Server.',
    toggleDark: 'Toggle Dark Mode',
    langEn: 'English',
    langHe: 'עברית',
    usernamePlaceholder: 'Your Minecraft username',
    emailPlaceholder: 'you@school.edu',
    passwordPlaceholderRegister: 'Create a password',
    passwordPlaceholderLogin: 'Enter your password',
    gradeLabel: 'Grade / Class (Optional)',
  },
  he: {
    register: 'הרשמה',
    login: 'התחברות',
    alreadyAccount: 'כבר יש לך חשבון? התחבר',
    noAccount: "אין לך חשבון? הרשם",
    fillRequired: 'אנא מלא את כל השדות הנדרשים.',
    userExists: 'משתמש עם האימייל או שם המשתמש כבר קיים.',
    regSuccess: 'ההרשמה הצליחה! כעת תוכל להתחבר.',
    regFail: 'ההרשמה נכשלה. נסה שוב.',
    fillEmailPass: 'אנא מלא אימייל וסיסמה.',
    invalidCreds: 'אימייל או סיסמה שגויים.',
    loginFail: 'ההתחברות נכשלה. נסה שוב.',
    welcomeBack: (name) => `ברוך הבא, ${name}!`,
    welcomeMsg: 'התחברת בהצלחה. ברוך הבא לשרת סקולקראפט.',
    toggleDark: 'החלף מצב כהה',
    langEn: 'English',
    langHe: 'עברית',
    usernamePlaceholder: 'שם משתמש במיינקראפט',
    emailPlaceholder: 'you@school.edu',
    passwordPlaceholderRegister: 'צור סיסמה',
    passwordPlaceholderLogin: 'הכנס סיסמה',
    gradeLabel: 'כיתה (אופציונלי)',
  }
};

function updateFormMode() {
  const t = texts[currentLang];
  if (isLoginMode) {
    formTitle.textContent = t.login;
    usernameGroup.style.display = 'none';
    gradeGroup.style.display = 'none';
    submitBtn.textContent = t.login;
    toggleModeBtn.textContent = t.noAccount;
    document.getElementById('password').placeholder = t.passwordPlaceholderLogin;
  } else {
    formTitle.textContent = t.register;
    usernameGroup.style.display = 'block';
    gradeGroup.style.display = 'block';
    submitBtn.textContent = t.register;
    toggleModeBtn.textContent = t.alreadyAccount;
    document.getElementById('password').placeholder = t.passwordPlaceholderRegister;
  }
  clearForm();
  welcomeSection.classList.add('hidden');
  authForm.style.display = 'flex';
  toggleModeBtn.style.display = 'inline-block';
  formTitle.style.display = 'block';
}

function updateLanguage() {
  const t = texts[currentLang];
  document.getElementById('minecraftUsername').placeholder = t.usernamePlaceholder;
  document.getElementById('email').placeholder = t.emailPlaceholder;
  document.querySelector('label[for="minecraftUsername"]').textContent = currentLang === 'en' ? 'Minecraft Username' : 'שם משתמש במיינקראפט';
  document.querySelector('label[for="email"]').textContent = currentLang === 'en' ? 'Email Address' : 'אימייל';
  document.querySelector('label[for="password"]').textContent = currentLang === 'en' ? 'Password' : 'סיסמה';
  document.querySelector('label[for="grade"]').textContent = t.gradeLabel;
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
    showToast(texts[currentLang].fillRequired);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = texts[currentLang].register + '...';

  try {
    const response = await fetch(sheetDBUrl);
    if (!response.ok) throw new Error('Could not fetch users.');
    const users = await response.json();

    const duplicateUser = users.find(user =>
      (user.data.Email?.trim().toLowerCase() === email) ||
      (user.data.MinecraftUsername?.trim().toLowerCase() === minecraftUsername.toLowerCase())
    );

    if (duplicateUser) {
      showToast(texts[currentLang].userExists);
      submitBtn.disabled = false;
      submitBtn.textContent = texts[currentLang].register;
      return;
    }

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

    showToast(texts[currentLang].regSuccess, 4000);

    isLoginMode = true;
    updateFormMode();

  } catch (error) {
    console.error(error);
    showToast(texts[currentLang].regFail);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = texts[currentLang].register;
}

async function loginUser() {
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showToast(texts[currentLang].fillEmailPass);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = texts[currentLang].login + '...';

  try {
    const response = await fetch(sheetDBUrl);
    if (!response.ok) throw new Error('Could not fetch users.');
    const users = await response.json();

    const user = users.find(u =>
      u.data.Email?.trim().toLowerCase() === email &&
      u.data.Password?.trim() === password
    );

    if (!user) {
      showToast(texts[currentLang].invalidCreds);
      submitBtn.disabled = false;
      submitBtn.textContent = texts[currentLang].login;
      return;
    }

    showToast(texts[currentLang].welcomeBack(user.data.MinecraftUsername), 4000);

    authForm.style.display = 'none';
    toggleModeBtn.style.display = 'none';
    formTitle.style.display = 'none';
    welcomeSection.classList.remove('hidden');

  } catch (error) {
    console.error(error);
    showToast(texts[currentLang].loginFail);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = texts[currentLang].login;
}

// Event Listeners
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

darkModeBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});

langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'he' : 'en';
  updateLanguage();
  updateFormMode();
});

// Initialize
updateLanguage();
updateFormMode();

