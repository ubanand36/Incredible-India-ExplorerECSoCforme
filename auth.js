// auth.js
// Logic for login.html — tab switching, password visibility, email/password
// signup & login, Google sign-in, forgot password, and redirect after success.

import { auth, googleProvider } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const authCard = document.getElementById('authCard');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const welcomeText = document.getElementById('welcomeText');
const switchText = document.getElementById('switchText');
const switchModeBtn = document.getElementById('switchModeBtn');
const submitBtn = document.getElementById('submitBtn');
const authForm = document.getElementById('authForm');
const authMsg = document.getElementById('authMsg');
const btnGoogle = document.getElementById('btnGoogle');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Where to send the user after a successful login/signup.
const REDIRECT_URL = 'index.html';

/* ---------------- Tab / Mode Switching ---------------- */

function setMode(mode) {
  authCard.setAttribute('data-mode', mode);
  clearMessage();

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    welcomeText.textContent = 'Welcome back! Please login to your account.';
    submitBtn.textContent = 'Login';
    switchText.textContent = "Don't have an account?";
    switchModeBtn.textContent = 'Sign Up';
  } else {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    welcomeText.textContent = 'Create an account to get started.';
    submitBtn.textContent = 'Sign Up';
    switchText.textContent = 'Already have an account?';
    switchModeBtn.textContent = 'Login';
  }
}

tabLogin.addEventListener('click', () => setMode('login'));
tabSignup.addEventListener('click', () => setMode('signup'));
switchModeBtn.addEventListener('click', () => {
  const current = authCard.getAttribute('data-mode');
  setMode(current === 'login' ? 'signup' : 'login');
});

/* ---------------- Password Show/Hide ---------------- */

document.querySelectorAll('.toggle-eye').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

/* ---------------- Messages ---------------- */

function showMessage(text, type = 'error') {
  authMsg.textContent = text;
  authMsg.className = `auth-msg ${type}`;
}

function clearMessage() {
  authMsg.textContent = '';
  authMsg.className = 'auth-msg';
}

function friendlyError(error) {
  const code = error.code || '';
  const map = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnGoogle.disabled = isLoading;
}

/* ---------------- Email/Password Submit ---------------- */

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage();

  const mode = authCard.getAttribute('data-mode');
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (mode === 'signup') {
    const name = fullNameInput.value.trim();
    const confirmPassword = confirmPasswordInput.value;

    if (!name) {
      showMessage('Please enter your full name.');
      return;
    }
    if (password !== confirmPassword) {
      showMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      showMessage('Account created! Redirecting...', 'success');
      setTimeout(() => (window.location.href = REDIRECT_URL), 1000);
    } catch (error) {
      showMessage(friendlyError(error));
    } finally {
      setLoading(false);
    }
  } else {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => (window.location.href = REDIRECT_URL), 800);
    } catch (error) {
      showMessage(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }
});

/* ---------------- Google Sign-In ---------------- */

btnGoogle.addEventListener('click', async () => {
  clearMessage();
  try {
    setLoading(true);
    await signInWithPopup(auth, googleProvider);
    showMessage('Login successful! Redirecting...', 'success');
    setTimeout(() => (window.location.href = REDIRECT_URL), 800);
  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    setLoading(false);
  }
});

/* ---------------- Forgot Password ---------------- */

forgotPasswordBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  if (!email) {
    showMessage('Enter your email above first, then click "Forgot Password?".');
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showMessage('Password reset email sent! Check your inbox.', 'success');
  } catch (error) {
    showMessage(friendlyError(error));
  }
});

/* ---------------- Already logged in? Skip straight to home ---------------- */

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = REDIRECT_URL;
  }
});