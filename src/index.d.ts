declare const txms: txms.Transport;
export = txms;
declare namespace txms {
    interface Transport {
        encode(hex: string): string;
        decode(data: string): string;
        getEndpoint(network?: number | string, countriesList?: string | Array<string>): {
            [key: string]: Array<string>;
        };
    }
    interface Error {
        code?: number;
    }
}
