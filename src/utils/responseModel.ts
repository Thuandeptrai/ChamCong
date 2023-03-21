export function responseModel<T>(status: number, message: string, data: T, count?: number, HourWork?: T) {
    return {
        status,
        message,
        data,
        count,
        HourWork
    }
}
