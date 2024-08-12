declare const txms: txms.Transport;
export = txms;
declare namespace txms {
    interface Transport {
        encode(hex: string): string;
        decode(data: string): string;
        getEndpoint(network?: number | string, countriesList?: string | Array<string>): {
            [key: string]: Array<string>;
        };
        sms(number?: boolean | string | number | Array<string>, message?: string, network?: number | string, encodeMessage?: boolean): string;
    }
    interface Error extends globalThis.Error {
        code?: number;
    }
}
