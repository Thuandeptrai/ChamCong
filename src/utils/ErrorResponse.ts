export const ErrorResponse = (status: number, message: string) => {
    return {
        status,
        message
    }
}