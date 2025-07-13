const sheetDBUrl = 'https://sheetdb.io/api/v1/6nrlyxofsg4sa'; // Your SheetDB endpoint
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

// Text strings for English and Hebrew
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
    welcome: 'Welcome!',
    welcomeMsg: 'You have successfully logged in. Welcome to the SchoolCraft Server.',
    toggleDark: 'Toggle Dark Mode',
    langEn: 'English',
    langHe: 'עברית'
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
    welcome: 'ברוך הבא!',
    welcomeMsg: 'התחברת בהצלחה. ברוך הבא לשרת סקולקראפט.',
    toggleDark: 'החלף מצב כהה',
    langEn: 'English',
    langHe: 'עברית'
  }
};

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
});

function updateFormMode() {
  const t = texts[currentLang];
  if (isLoginMode) {
    formTitle.textContent = t.login;
    usernameGroup.classList.add('hidden');
    gradeGroup.classList.add('hidden');
    submitBtn.textContent = t.login;
    toggleModeBtn.textContent = t.noAccount;
  } else {
    formTitle.textContent = t.register;
    usernameGroup.classList.remove('hidden');
    gradeGroup.classList.remove('hidden');
    submitBtn.textContent = t.register;
    toggleModeBtn.textContent = t.alreadyAccount;
  }
  clearForm();
  welcomeSection.classList.add('hidden');
  authForm.style.display = 'flex';
  toggleModeBtn.style.display = 'inline-block';
  formTitle.style.display = 'block';
}

function updateLanguage() {
  const t = texts[currentLang];

  // Update all static text elements
  updateFormMode();

  // Update placeholders
  document.getElementById('minecraftUsername').placeholder = currentLang === 'en' ? 'Your Minecraft username' : 'שם משתמש במיינקראפט';
  document.getElementById('email').placeholder = currentLang === 'en' ? 'you@school.edu' : 'you@school.edu (דואר אלקטרוני)';
  document.getElementById('password').placeholder = currentLang === 'en' ? (isLoginMode ? 'Enter your password' : 'Create a password') : (isLoginMode ? 'הכנס סיסמה' : 'צור סיסמה');

  // Update grade label
  const gradeLabel = document.querySelector('label[for="grade"]');
  gradeLabel.textContent = currentLang === 'en' ? 'Grade/Class (Optional):' : 'כיתה (אופציונלי):';

  // Update grade select options
  const gradeSelect = document.getElementById('grade');
  gradeSelect.innerHTML = currentLang === 'en' ? `
    <option value="">Select your grade</option>
    <option value="6">6th Grade</option>
    <option value="7">7th Grade</option>
    <option value="8">8th Grade</option>
    <option value="9">9th Grade</option>
    <option value="10">10th Grade</option>
    <option value="11">11th Grade</option>
    <option value="12">12th Grade</option>
  ` : `
    <option value="">בחר כיתה</option>
    <option value="6">כיתה ו'</option>
    <option value="7">כיתה ז'</option>
    <option value="8">כיתה ח'</option>
    <option value="9">כיתה ט'</option>
    <option value="10">כיתה י'</option>
    <option value="11">כיתה י"א</option>
    <option value="12">כיתה י"ב</option>
  `;

  // Update welcome section
  document.querySelector('#welcomeSection h2').textContent = t.welcome;
  document.querySelector('#welcomeSection p').textContent = t.welcomeMsg;

  // Update buttons
  darkModeBtn.textContent = t.toggleDark;
  langBtn.textContent = currentLang === 'en' ? t.langHe : t.langEn;
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

// Initialize on page load
updateFormMode();
updateLanguage();
