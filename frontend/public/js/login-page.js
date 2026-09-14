import { loginWithGoogle, loginWithEmail, signupWithEmail, resendVerificationEmail, friendlyAuthError } from './auth.js';

const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const submitBtn = document.getElementById('email-submit-btn');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');
const errorBox = document.getElementById('auth-error');
const form = document.getElementById('email-form');
const signupExtraFields = document.getElementById('signup-extra-fields');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');

let mode = 'login'; // or 'signup'

function setMode(newMode) {
  mode = newMode;
  const isLogin = mode === 'login';

  tabLogin.classList.toggle('border-navy', isLogin);
  tabLogin.classList.toggle('text-navy', isLogin);
  tabLogin.classList.toggle('border-transparent', !isLogin);
  tabLogin.classList.toggle('text-ink-soft', !isLogin);

  tabSignup.classList.toggle('border-navy', !isLogin);
  tabSignup.classList.toggle('text-navy', !isLogin);
  tabSignup.classList.toggle('border-transparent', isLogin);
  tabSignup.classList.toggle('text-ink-soft', isLogin);

  formTitle.textContent = isLogin ? 'Welcome back' : 'Create account';
  formSubtitle.textContent = isLogin
    ? 'Log in to pick up where you left off.'
    : 'Join Scora to access 10th SSC papers, tracker & AI doubt solver.';

  submitBtn.textContent = isLogin ? 'Log in' : 'Create account';

  if (isLogin) {
    signupExtraFields.classList.add('hidden');
    document.getElementById('full-name').removeAttribute('required');
  } else {
    signupExtraFields.classList.remove('hidden');
    document.getElementById('full-name').setAttribute('required', 'required');
  }

  toggleText.innerHTML = isLogin
    ? `New student? <button id="toggle-link" type="button" class="text-navy font-semibold underline underline-offset-2 hover:text-navy-light">Create an account</button>`
    : `Already have an account? <button id="toggle-link" type="button" class="text-navy font-semibold underline underline-offset-2 hover:text-navy-light">Log in</button>`;

  document.getElementById('toggle-link').addEventListener('click', () => {
    setMode(isLogin ? 'signup' : 'login');
  });

  errorBox.classList.add('hidden');
}

function showError(error) {
  errorBox.textContent = typeof error === 'string' ? error : friendlyAuthError(error);
  errorBox.classList.remove('hidden');
}

// Password show/hide toggle
togglePasswordBtn.addEventListener('click', () => {
  const isPass = passwordInput.type === 'password';
  passwordInput.type = isPass ? 'text' : 'password';
  togglePasswordBtn.textContent = isPass ? 'Hide' : 'Show';
});

tabLogin.addEventListener('click', () => setMode('login'));
tabSignup.addEventListener('click', () => setMode('signup'));
toggleLink.addEventListener('click', () => setMode(mode === 'login' ? 'signup' : 'login'));

// ─── Verification pending screen ─────────────────────────────────────────────

let _verifyEmail    = '';
let _verifyPassword = '';

function showVerificationScreen(email) {
  _verifyEmail = email;
  const authSection   = document.getElementById('auth-section');
  const verifySection = document.getElementById('verify-section');
  const verifyEmailEl = document.getElementById('verify-email-display');

  if (verifyEmailEl) verifyEmailEl.textContent = email;
  if (authSection)   authSection.classList.add('hidden');
  if (verifySection) verifySection.classList.remove('hidden');
}

function showAuthSection() {
  const authSection   = document.getElementById('auth-section');
  const verifySection = document.getElementById('verify-section');
  if (authSection)   authSection.classList.remove('hidden');
  if (verifySection) verifySection.classList.add('hidden');
}

// Resend button
document.getElementById('resend-verify-btn')?.addEventListener('click', async () => {
  const btn = document.getElementById('resend-verify-btn');
  btn.disabled    = true;
  btn.textContent = 'Sending…';

  try {
    await resendVerificationEmail(_verifyEmail, _verifyPassword);
    btn.textContent = '✓ Email sent! Check your inbox.';
    btn.classList.add('text-success');
    setTimeout(() => {
      btn.disabled    = false;
      btn.textContent = 'Resend verification email';
      btn.classList.remove('text-success');
    }, 5000);
  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Resend verification email';
    alert('Could not resend: ' + friendlyAuthError(err));
  }
});

// "Back to login" from verification screen
document.getElementById('back-to-login-btn')?.addEventListener('click', () => {
  showAuthSection();
  setMode('login');
});

// ─── Form submit ──────────────────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  submitBtn.disabled    = true;
  const originalText    = submitBtn.textContent;
  submitBtn.textContent = mode === 'login' ? 'Logging in…' : 'Creating account…';

  try {
    if (mode === 'login') {
      await loginWithEmail(email, password);
      // loginWithEmail redirects on success — nothing else needed here
    } else {
      const fullName   = document.getElementById('full-name').value.trim();
      const schoolName = document.getElementById('school-name').value.trim();
      const cityName   = document.getElementById('city-name').value.trim();
      const standard   = document.getElementById('standard-select').value;

      if (!fullName) {
        showError('Please enter your full name.');
        submitBtn.disabled    = false;
        submitBtn.textContent = originalText;
        return;
      }

      // Store password so resend can re-authenticate
      _verifyPassword = password;

      await signupWithEmail(email, password, {
        name: fullName, school: schoolName, city: cityName, standard,
      });
    }
  } catch (error) {
    submitBtn.disabled    = false;
    submitBtn.textContent = originalText;

    if (error.code === 'auth/verification-sent') {
      // Account created — show the "check your inbox" screen
      showVerificationScreen(error.email);
      return;
    }

    if (error.code === 'auth/email-not-verified') {
      // Tried to log in but email not verified yet
      _verifyPassword = password;
      showVerificationScreen(error.email);
      return;
    }

    showError(error);
  }
});

document.getElementById('google-login-btn').addEventListener('click', async () => {
  try {
    await loginWithGoogle();
  } catch (error) {
    showError(error);
  }
});