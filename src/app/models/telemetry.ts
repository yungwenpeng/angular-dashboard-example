interface Data {
    temperature?: (string | number)[][] | undefined;
    humidity?: (string | number)[][] | undefined;
}

export interface Message {
    subscriptionId: number;
    errorCode: number;
    errorMsg: string | null;
    data: Data;
}