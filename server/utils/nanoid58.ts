const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export class NanoID58 {
    private counter: number = 0;

    public generateID(): string {
        const timestamp = BigInt(Date.now() & 0xFFFFFFFF);
        const currentCounter = this.counter++ % 65536;
        const random = BigInt(Math.floor(Math.random() * 65536));
        const combined = (timestamp << BigInt(32)) | (BigInt(currentCounter) << BigInt(16)) | random;

        let id = this.toBase58(combined);

        while (id.length < 12) {
            id = BASE58_ALPHABET[0] + id;
        }

        return id;
    }

    private toBase58(value: bigint): string {
        let result = "";
        let num = value;

        while (num > 0) {
            const remainder = Number(num % BigInt(58));
            result = BASE58_ALPHABET[remainder] + result;
            num = num / BigInt(58);
        }

        return result || "1";
    }
}
