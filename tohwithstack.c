#include <stdio.h>
#include <math.h>
void moveDisk(char from, char to, int disk){
    printf("Move disk %d from %c to %c.\n", disk, from, to);
}
int main() {
    int n, i;
    char src = 'A', aux = 'B', dest = 'C';
    printf("Enter the number of disks: ");
    scanf("%d", &n);
    int totalMoves = pow(2, n) - 1;
// Swap destination and auxiliary for even number of disks
    if (n % 2 == 0) {
        char temp = dest;
        dest = aux;
        aux = temp;
    }
// Arrays to simulate poles (top of stack is at index 0)
    int A[n], B[n], C[n];
    int topA = n - 1, topB = -1, topC = -1;

// Initialize source pole A with disks
    for (i = 0; i < n; i++) {
        A[i] = n - i;
    }
    for (i = 1; i <= totalMoves; i++) {
        int fromDisk = 0;
        if (i % 3 == 1) {
            // Move between src and dest
            if (topA >= 0 && (topC < 0 || A[topA] < C[topC])) {
                fromDisk = A[topA--];
                C[++topC] = fromDisk;
                moveDisk(src, dest, fromDisk);
            } else {
                fromDisk = C[topC--];
                A[++topA] = fromDisk;
                moveDisk(dest, src, fromDisk);
            }
        } else if (i % 3 == 2) {
            // Move between src and aux
            if (topA >= 0 && (topB < 0 || A[topA] < B[topB])) {
                fromDisk = A[topA--];
                B[++topB] = fromDisk;
                moveDisk(src, aux, fromDisk);
            } else {
                fromDisk = B[topB--];
                A[++topA] = fromDisk;
                moveDisk(aux, src, fromDisk);
            }
        } else if (i % 3 == 0) {
            // Move between aux and dest
            if (topB >= 0 && (topC < 0 || B[topB] < C[topC])) {
                fromDisk = B[topB--];
                C[++topC] = fromDisk;
                moveDisk(aux, dest, fromDisk);
            } else {
                fromDisk = C[topC--];
                B[++topB] = fromDisk;
                moveDisk(dest, aux, fromDisk);
            }
        }
    }
    printf("Total steps taken: %d\n", totalMoves);
    return 0;
}
