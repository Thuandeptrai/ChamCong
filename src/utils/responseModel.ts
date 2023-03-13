export function responseModel<T>(status: number, message: string ,data: T) {
    return {
        status, 
        message,
        data
    }
}
