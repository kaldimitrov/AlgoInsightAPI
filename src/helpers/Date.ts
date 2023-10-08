export default class DateTime {
  static convertToDbString(d: string): string {
    const date = new Date(d);
    const month = date.getMonth() + 1;
    const mm = month < 10 ? '0' + month : month;

    const day = date.getDate();
    const dd = day < 10 ? '0' + day : day;

    const year = date.getFullYear();

    return `${year}-${mm}-${dd} 00:00:00`;
  }
}
