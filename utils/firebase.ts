import i18next from 'i18next';

export function getErrorMessage(code: string): string {
  const t = i18next.t;
  switch (code) {
    case 'auth/invalid-email':
      return t('FIREBASE.INVALID_EMAIL');

    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return t('FIREBASE.WRONG_EMAIL_OR_PASSWORD');

    case 'auth/user-disabled':
      return t('FIREBASE.EMAIL_DISABLED');

    case 'auth/email-already-in-use':
      return t('FIREBASE.EMAIL_IN_USE');

    case 'auth/operation-not-allowed':
      return t('FIREBASE.AUTHENTICATION_DISABLED');

    case 'auth/weak-password':
      return t('FIREBASE.PASSWORD_TOO_WEAK');

    case 'auth/internal-error':
      return t('FIREBASE.UNKNOWN_ERROR');

    default:
      return '';
  }
}

export interface Error {
  code: string;
  error: string;
}
