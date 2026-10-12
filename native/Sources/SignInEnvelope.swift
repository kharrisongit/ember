import CryptoKit
import Foundation

/// The browser callback contains encrypted data, never a readable Google credential.
struct SignInEnvelope {
    static let scheme = "com.kharrison.lastdragonrider"
    static let context = Data("ldr-native-sign-in-v1".utf8)
    let key: P256.KeyAgreement.PrivateKey
    let state: String

    init(key: P256.KeyAgreement.PrivateKey = P256.KeyAgreement.PrivateKey(),
         state: String = UUID().uuidString + UUID().uuidString) {
        self.key = key
        self.state = state
    }

    var startURL: URL {
        var url = URLComponents(string: "https://kharrisongit.github.io/ember/native-sign-in.html")!
        var fragment = URLComponents()
        fragment.queryItems = [URLQueryItem(name: "state", value: state),
                               URLQueryItem(name: "key", value: Self.encode(key.publicKey.x963Representation))]
        url.fragment = fragment.percentEncodedQuery
        return url.url!
    }

    func open(_ callback: URL) throws -> String {
        guard callback.scheme == Self.scheme, callback.host == "signin",
              callback.path.isEmpty, callback.query == nil,
              let fragment = URLComponents(url: callback, resolvingAgainstBaseURL: false)?.fragment,
              fragment.count < 20_000,
              let items = URLComponents(string: "https://callback/?" + fragment)?.queryItems,
              items.count == 3, Set(items.map(\.name)) == Set(["state", "key", "box"]),
              items.first(where: { $0.name == "state" })?.value == state,
              let publicData = Self.decode(items.first(where: { $0.name == "key" })?.value),
              let boxData = Self.decode(items.first(where: { $0.name == "box" })?.value) else {
            throw SignInError.invalidCallback
        }
        let browserKey = try P256.KeyAgreement.PublicKey(x963Representation: publicData)
        let shared = try key.sharedSecretFromKeyAgreement(with: browserKey)
        let symmetric = shared.hkdfDerivedSymmetricKey(using: SHA256.self, salt: Data(state.utf8),
                                                       sharedInfo: Self.context, outputByteCount: 32)
        let bytes = try AES.GCM.open(AES.GCM.SealedBox(combined: boxData), using: symmetric)
        guard let token = String(data: bytes, encoding: .utf8), token.split(separator: ".").count == 3 else {
            throw SignInError.invalidCallback
        }
        return token
    }

    static func encode(_ data: Data) -> String {
        data.base64EncodedString().replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: "=", with: "")
    }

    static func decode(_ text: String?) -> Data? {
        guard let text, text.allSatisfy({ $0.isASCII && ($0.isLetter || $0.isNumber || $0 == "-" || $0 == "_") }) else {
            return nil
        }
        let padded = text.replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
            + String(repeating: "=", count: (4 - text.count % 4) % 4)
        return Data(base64Encoded: padded)
    }
}

enum SignInError: LocalizedError {
    case invalidCallback, cancelled
    var errorDescription: String? {
        switch self {
        case .invalidCallback: return "Sign-in could not be verified. Please try again."
        case .cancelled: return "Sign-in was cancelled. Your saves are unchanged."
        }
    }
}
