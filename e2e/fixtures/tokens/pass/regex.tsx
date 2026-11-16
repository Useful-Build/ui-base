export const quote = /["]/
export const tick = /`/
// #111111 after a stray backtick in a regex
export const slash = /a\/*b/g // #222222
export const cls = /[/*]/.test("x") // #333333
export const half = (a: number, b: number) => a / b / 2 // #444444
