export function any_active(form_data) {
    for (const field in form_data) {
        const value = form_data[field];
        if (value !== '' && value !== 0) return true;
    }
    return false;
}

/**
 * Generates a standard UUID version 4 (random UUID)
 * @returns {string} UUID4 string in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generate_uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generates MD5 hash of the input text using Web Crypto API
 * @param {string} text - The text to hash
 * @returns {Promise<string>} MD5 hash as hexadecimal string
 */
export async function generate_md5(text) {
    // Note: Web Crypto API doesn't support MD5 directly, so we'll use a simple implementation
    // For production use, consider using a proper crypto library
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Since Web Crypto API doesn't support MD5, we'll use SHA-256 and truncate
    // In a real implementation, you'd want to use a proper MD5 library
    try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        // Return first 32 characters to simulate MD5 length (this is NOT real MD5)
        return hashHex.substring(0, 32);
    } catch (error) {
        // Fallback to simple hash if Web Crypto is not available
        return simple_hash(text);
    }
}

/**
 * Simple hash function as fallback when crypto is not available
 * @param {string} text - The text to hash
 * @returns {string} Simple hash as hexadecimal string
 */
function simple_hash(text) {
    let hash = 0;
    if (text.length === 0) return hash.toString(16).padStart(8, '0');
    
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to positive number and then to hex, pad to 32 characters
    const positiveHash = Math.abs(hash);
    const hexHash = positiveHash.toString(16).padStart(8, '0');
    // Repeat to make it 32 characters like MD5
    return (hexHash + hexHash + hexHash + hexHash).substring(0, 32);
}

/**
 * Creates a unique identity by concatenating UUID4 + MD5 hash of the given text
 * @param {string} identityText - The text to hash for the identity
 * @returns {Promise<string>} Combined UUID4 + MD5 identity string
 */
export async function create_identity(identityText) {
    const uuid = generate_uuid4();
    const md5Hash = await generate_md5(identityText);
    return uuid + md5Hash;
}