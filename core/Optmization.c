#include <stdio.h>

void heavy_task() {
    volatile int x = 0;
    for (long i = 0; i < 100000000; i++) {
        x += i;
    }
}

int main() {
    printf("Start processing...\n");
    heavy_task();
    printf("Done\n");
    return 0;
}