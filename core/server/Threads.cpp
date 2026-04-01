#include <thread>
#include <iostream>

void task() {
    std::cout << "Processing...\n";
}

int main() {
    std::thread t1(task);
    std::thread t2(task);

    t1.join();
    t2.join();

    return 0;
}