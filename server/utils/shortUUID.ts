export class ShortUUID {
    private counter: number = 0;

    public generateID(): string {
        const timestamp = Date.now() & 0xffffffff;
        const currentCounter = this.counter++ & 0xffff;
        const random = Math.floor(Math.random() * 0xffff);

        const mixed = (timestamp ^ (currentCounter << 16) ^ random) >>> 0;

        const cryptoPart = crypto.getRandomValues(new Uint32Array(1))[0];

        let id = ((BigInt(mixed) << BigInt(32)) | BigInt(cryptoPart)).toString(16);

        if (id.length > 12) {
            id = id.slice(-12);
        } else {
            id = id.padStart(12, "0");
        }

        return `${id.slice(0, 4)}-${id.slice(4, 8)}-${id.slice(8, 12)}`;
    }
}
