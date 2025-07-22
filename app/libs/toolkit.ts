export function getCurrentDate(date: string = ""): string {
    /**
     * Return current data. if an input is provided, it convert the given date to a human readable format.
     * */
    let time = new Date();
    if (date) {
        time = new Date(date);
    }
    const day = String(time.getDate()).padStart(2, "0");
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const year = time.getFullYear();
    const now = `${year}-${month}-${day}`;
    return now;
}

export function generateRandomNumber(asString: boolean = false): string | number {
    const randomNumber = Math.floor(Math.random() * 1000000);
    if (asString) {
        return randomNumber.toString();
    }
    return randomNumber;
}


export function generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, length + 2);
}


