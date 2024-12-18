export function toInt (bytes: Uint8Array): number {
    return bytes.reduce((acc, curr) => acc * 256 + curr)
}

export function toString (bytes: Uint8Array): string {
    return String.fromCharCode(...bytes)
}
