#include <QApplication>
#include <QPushButton>

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    QPushButton button("تشغيل المعالجة");
    button.resize(200, 60);

    button.show();

    return app.exec();
}
