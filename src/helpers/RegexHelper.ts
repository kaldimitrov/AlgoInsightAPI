export function validatePassword(password: string) {
  const regex = /^(?=.*[A-Z])(?=.*[$#_!*-/+.]).{8,32}$/;

  return regex.test(password);
}
