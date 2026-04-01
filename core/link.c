extern "C" {
    void heavy_task();
}

int main() {
    heavy_task();
    return 0;
}