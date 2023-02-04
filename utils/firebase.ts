export function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';

    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Wrong email or password';

    case 'auth/user-disabled':
      return 'Email address is disabled';

    case 'auth/email-already-in-use':
      return 'Email address already in use';

    case 'auth/operation-not-allowed':
      return 'This authentication is disabled';

    case 'auth/weak-password':
      return 'Password is too weak';

    case 'auth/internal-error':
      return 'An error has occurred, please try again later';
    default:
      return '';
  }
}

export interface Error {
  code: string;
  error: string;
}
