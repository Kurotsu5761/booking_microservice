export function _validateExist(info: any, key: string) {
  if (info[key] === undefined || info[key] === null)
    throw Error(`${key} doesn't exist.`);
}

export function _validateDate(date: string) {
  let now = Date.now();
  if (Date.parse(date) <= now)
    throw Error(`Date of booking should be later than now`);
}
