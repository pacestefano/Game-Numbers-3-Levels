/**
 * Calcola il numero minimo di mosse necessarie a risolvere il puzzle.
 * @param {Array} arr - L'array di numeri del puzzle.
 * @return {number} Il numero minimo di mosse.
 */
function calculateMinMoves(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    let moves = 0;
    const visited = new Array(arr.length).fill(false);

    for (let i = 0; i < arr.length; i++) {
        if (visited[i] || sorted[i] === arr[i]) continue;

        let cycleSize = 0;
        let x = i;
        while (!visited[x]) {
            visited[x] = true;
            x = arr.indexOf(sorted[x]);
            cycleSize++;
        }

        if (cycleSize > 0) {
            moves += (cycleSize - 1);
        }
    }

    return moves;
}

export { calculateMinMoves };
