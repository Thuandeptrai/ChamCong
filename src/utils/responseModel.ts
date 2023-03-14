export function responseModel<T>(status: number, message: string ,data: T, count?: number) {
    return {
        status, 
        message,
        data,
        count
    }
}
