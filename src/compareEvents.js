export function checkWhichEventIsLeft (e1, e2) {
    if (e1.x > e2.x) return 1;
    if (e1.x < e2.x) return -1;

    if (e1.y !== e2.y) return e1.y > e2.y ? 1 : -1;
    return 1
}
