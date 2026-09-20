'use client';

import { useId, useState } from 'react';

/**
 * A password field with a show/hide toggle.
 *
 * ONE COMPONENT, NOT A TOGGLE PASTED INTO EACH FORM. Login and signup had
 * byte-identical input markup, and reset-password, profile and CheckoutModal
 * carry the same field again. Duplicating the toggle five times would mean five
 * places to get the accessibility details wrong, and they are easy to get
 * wrong — see below.
 *
 * ── WHY `type="button"` MATTERS ───────────────────────────────────────────
 * A <button> inside a <form> submits it by default. Without this the toggle
 * would submit the login form every time somebody clicked the eye, so the
 * password field would clear and the user would see a failed login instead of
 * their own password. This is the single most common bug in this pattern.
 *
 * ── WHY IT IS NOT A DIV WITH AN onClick ───────────────────────────────────
 * A real <button> is reachable by Tab, fires on Enter and Space for free, and
 * is announced as a control. `aria-pressed` tells a screen-reader user which
 * state it is in, and `aria-label` says what it does — the icon alone conveys
 * nothing to anyone who cannot see it.
 *
 * ── AUTOCOMPLETE IS A REQUIRED PROP ───────────────────────────────────────
 * Not optional and not defaulted. Browsers and password managers behave very
 * differently for `current-password` (offer the saved one) and `new-password`
 * (offer to generate and save one), and guessing wrong on a signup form means
 * the manager never stores the credential. The caller knows which it is; this
 * component does not.
 *
 * `tabIndex={-1}` keeps the toggle out of the tab order: someone filling the
 * form should go password → submit, not password → eye → submit. It stays
 * fully operable by pointer, and by keyboard via Shift-Tab, which is the
 * conventional treatment for an affordance attached to a field.
 */
interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** `current-password` for sign-in, `new-password` for signup and reset. */
  autoComplete: 'current-password' | 'new-password';
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  /** Extra classes for the wrapper, for form-specific spacing. */
  className?: string;
}

export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  minLength,
  className = '',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  // The hint is referenced by the input, so its id has to be unique even when
  // two PasswordInputs sit in one form (signup: password + confirm password).
  const hintId = useId();

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hintId}
        // `pr-11` reserves the toggle's column. Everything else is the class
        // string these inputs already had, so the fields look unchanged.
        className="mt-1 block w-full px-3 py-2 pr-11 border border-gray-300 dark:border-ink-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:focus:ring-mint-500 focus:border-blue-500 dark:focus:border-mint-400 text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400 transition-colors"
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        aria-controls={id}
        tabIndex={-1}
        // `top-1` offsets the input's own `mt-1` so the icon centres on the
        // field rather than on the wrapper.
        className="absolute right-0 top-1 bottom-0 flex w-11 items-center justify-center rounded-r-md text-gray-400 hover:text-gray-600 dark:text-ink-400 dark:hover:text-ink-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500 transition-colors"
      >
        {visible ? (
          // Eye with a slash — "hide". The slash is drawn as its own path so it
          // reads clearly at 20px in both themes.
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <path d="M1 1l22 22" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>

      {/* Announced when the state flips, so a screen-reader user is told the
          password is now on screen — which is exactly the moment shoulder
          surfing becomes a risk and they cannot see that it happened. */}
      <span id={hintId} className="sr-only" role="status">
        {visible ? 'Password is visible' : 'Password is hidden'}
      </span>
    </div>
  );
}
