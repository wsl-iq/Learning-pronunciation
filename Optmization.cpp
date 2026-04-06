#include <Ultralight/Ultralight.h>

class MyApp : public AppListener {
public:
    void OnCreate() override {
        view_->LoadURL("index.html");
        view_->EvaluateScript(R"(
            window.nativeFunction = function(data) {
                return NativeAPI.processData(data);
            };
        )");
    }
    
    std::string HeavyProcessing(const std::string& input) {
        return processed_result;
    }
};
