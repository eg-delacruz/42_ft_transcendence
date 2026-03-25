export function isStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    return (password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial);
}

/**
 * isStrongPassword - Validate password strong
 * 
 * Default requisites:
 *  - Minimun 8 characters
 *  - At least 1 uppercase
 *  - At least 1 lowercase
 *  - At least 1 number
 *  - At least 1 special caracter
 * 
 *  Example of use:
 *  boolean isPassStrong = isStrongPassword(xpassword)
 */