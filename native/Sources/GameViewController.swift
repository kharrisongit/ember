import AuthenticationServices
import UIKit
import WebKit

final class GameViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler,
                                ASWebAuthenticationPresentationContextProviding {
    private var web: WKWebView!
    private var server: LocalGameServer?
    private var authSession: ASWebAuthenticationSession?
    private let message = UILabel()
    private let retry = UIButton(type: .system)
    private let overlay = UIStackView()
    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { .all }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.078, green: 0.063, blue: 0.051, alpha: 1)
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.applicationNameForUserAgent = "LastDragonrider/1.0"
        config.userContentController.add(self, name: "ldrSignIn")
        if let url = Bundle.main.url(forResource: "native-bridge", withExtension: "js"),
           let script = try? String(contentsOf: url, encoding: .utf8) {
            config.userContentController.addUserScript(WKUserScript(source: script,
                                                        injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.isOpaque = false
        web.backgroundColor = view.backgroundColor
        web.scrollView.backgroundColor = view.backgroundColor
        web.scrollView.bounces = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(web)
        NSLayoutConstraint.activate([web.topAnchor.constraint(equalTo: view.topAnchor),
            web.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            web.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: view.trailingAnchor)])
        setupOverlay()
        startGame()
    }

    private func setupOverlay() {
        message.textColor = .white
        message.font = .systemFont(ofSize: 18, weight: .medium)
        message.numberOfLines = 0
        message.textAlignment = .center
        retry.setTitle("Try again", for: .normal)
        retry.addTarget(self, action: #selector(startGame), for: .touchUpInside)
        overlay.axis = .vertical; overlay.spacing = 20
        overlay.addArrangedSubview(message); overlay.addArrangedSubview(retry)
        overlay.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(overlay)
        NSLayoutConstraint.activate([overlay.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            overlay.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 30),
            overlay.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -30)])
    }

    @objc private func startGame() {
        overlay.isHidden = false; retry.isHidden = true; message.text = "Opening The Last Dragonrider…"
        if server != nil { loadGame(); return }
        guard let root = Bundle.main.resourceURL?.appendingPathComponent("Game") else { return }
        let server = LocalGameServer(root: root)
        self.server = server
        server.start { [weak self] error in
            if error != nil {
                self?.server = nil
                self?.showError("The game could not start. Close and reopen the app, or try again.")
            } else { self?.loadGame() }
        }
    }

    private func loadGame() {
        guard let url = URL(string: LocalGameServer.origin + "/index.html") else { return }
        web.load(URLRequest(url: url))
    }

    private func showError(_ text: String) {
        message.text = text; retry.isHidden = false; overlay.isHidden = false
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        overlay.isHidden = true
        #if DEBUG
        NativeSmoke.run(webView)
        #endif
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showError("The game could not load. Your saved progress is still on this device.")
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        showError("The game was stopped by iOS. Reopen it to continue from your latest save.")
    }
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { decisionHandler(.cancel); return }
        if url.scheme == "http", url.host == "127.0.0.1", url.port == Int(LocalGameServer.port) {
            decisionHandler(.allow)
        } else {
            decisionHandler(.cancel)
            if action.navigationType == .linkActivated, ["https", "http"].contains(url.scheme ?? "") {
                UIApplication.shared.open(url)
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "ldrSignIn", message.frameInfo.isMainFrame,
              message.frameInfo.securityOrigin.protocol == "http",
              message.frameInfo.securityOrigin.host == "127.0.0.1",
              message.frameInfo.securityOrigin.port == Int(LocalGameServer.port), authSession == nil else { return }
        let envelope = SignInEnvelope()
        let session = ASWebAuthenticationSession(url: envelope.startURL, callbackURLScheme: SignInEnvelope.scheme) {
            [weak self] url, _ in
            DispatchQueue.main.async {
                self?.authSession = nil
                let result = Result { () throws -> String in
                    guard let url else { throw SignInError.cancelled }
                    return try envelope.open(url)
                }
                self?.finishSignIn(result)
            }
        }
        session.presentationContextProvider = self
        authSession = session
        if !session.start() { authSession = nil; finishSignIn(.failure(SignInError.cancelled)) }
    }

    private func finishSignIn(_ result: Result<String, Error>) {
        let payload: [String: String]
        switch result {
        case .success(let token): payload = ["token": token]
        case .failure(let error): payload = ["error": error.localizedDescription]
        }
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        web.evaluateJavaScript("window.LDRNativeFinishSignIn(\(json))", completionHandler: nil)
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        view.window ?? ASPresentationAnchor()
    }
}
