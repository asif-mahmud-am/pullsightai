export interface ResponseType<T> {
    success: boolean,
    statusCode: number,
    message: string,
    data?: T;
}