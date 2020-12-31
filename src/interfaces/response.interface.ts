
export type ResponseHeader = { [header: string]: string | number | boolean; }
export interface IResponseBody {
    data: any;
    message: string;
    status?: string;
}
export interface IResponse {
    statusCode: number;
    headers: ResponseHeader;
    body: string;
}
