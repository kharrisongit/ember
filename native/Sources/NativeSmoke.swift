#if DEBUG
import Foundation
import WebKit

/// CI-only integration check in the real iOS WebKit runtime; absent from the shipped binary.
enum NativeSmoke {
    static func run(_ web: WKWebView, attempt: Int = 0) {
        guard ProcessInfo.processInfo.arguments.contains("--native-smoke-write") ||
              ProcessInfo.processInfo.arguments.contains("--native-smoke-read") else { return }
        web.evaluateJavaScript("document.body.classList.contains('boot-ready')") { result, error in
            if (result as? Bool) == true {
                check(web)
            } else if attempt < 90, error == nil {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak web] in
                    if let web { run(web, attempt: attempt + 1) }
                }
            } else { report(["ok": false, "error": "Game did not reach its title screen"]) }
        }
    }

    private static func check(_ web: WKWebView) {
        let reading = ProcessInfo.processInfo.arguments.contains("--native-smoke-read")
        let script = """
        if (!reading) localStorage.setItem('__ldr_native_test', 'survives-relaunch');
        const audio = await fetch('assets/audio/title-ending-loop.m4a', {headers: {Range: 'bytes=0-1'}});
        const audioSize = (await audio.arrayBuffer()).byteLength;
        return {ok: document.title === 'The Last Dragonrider' && audio.status === 206 && audioSize === 2
                   && localStorage.getItem('__ldr_native_test') === 'survives-relaunch',
                title: document.title, audioStatus: audio.status, audioSize,
                persisted: localStorage.getItem('__ldr_native_test') === 'survives-relaunch',
                scripts: document.scripts.length, native: window.LDRNativeApp === true,
                viewport: innerWidth + 'x' + innerHeight};
        """
        web.callAsyncJavaScript(script, arguments: ["reading": reading], in: nil, in: .page) { result in
            switch result {
            case .success(let value):
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    report(value as? [String: Any] ?? ["ok": false])
                }
            case .failure: report(["ok": false, "error": "WebKit integration check failed"])
            }
        }
    }

    private static func report(_ result: [String: Any]) {
        guard let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first,
              let data = try? JSONSerialization.data(withJSONObject: result, options: .sortedKeys) else { return }
        try? data.write(to: directory.appendingPathComponent("NativeSmoke.json"), options: .atomic)
    }
}
#endif
