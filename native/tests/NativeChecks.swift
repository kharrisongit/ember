import CryptoKit
import Foundation

@main enum NativeChecks {
    static var checks = 0
    static func expect(_ condition: Bool, _ name: String) {
        guard condition else { fatalError("Failed: \(name)") }
        checks += 1
    }
    static func main() throws {
        let fixtureURL = URL(fileURLWithPath: CommandLine.arguments[1])
        if CommandLine.arguments.contains("--create") {
            let attempt = SignInEnvelope()
            let json = ["privateKey": SignInEnvelope.encode(attempt.key.rawRepresentation),
                        "publicKey": SignInEnvelope.encode(attempt.key.publicKey.x963Representation),
                        "state": attempt.state]
            try JSONSerialization.data(withJSONObject: json).write(to: fixtureURL)
            return
        }
        let fixture = try JSONSerialization.jsonObject(with: Data(contentsOf: fixtureURL)) as! [String: String]
        let key = try P256.KeyAgreement.PrivateKey(rawRepresentation: SignInEnvelope.decode(fixture["privateKey"])!)
        let attempt = SignInEnvelope(key: key, state: fixture["state"]!)
        let callback = URL(string: fixture["callback"]!)!
        expect(try attempt.open(callback) == "test.jwt.signature", "Browser/native crypto interoperation")
        let wrongState = SignInEnvelope(key: key, state: "wrong")
        expect((try? wrongState.open(callback)) == nil, "Wrong state rejected")
        expect((try? SignInEnvelope().open(callback)) == nil, "Different app attempt cannot decrypt")
        expect((try? attempt.open(URL(string: fixture["callback"]!.replacingOccurrences(of: "://signin", with: "://other"))!)) == nil,
               "Wrong destination rejected")
        expect((try? attempt.open(URL(string: fixture["callback"]! + "&state=duplicate")!)) == nil,
               "Duplicate callback parameters rejected")
        expect((try? attempt.open(URL(string: fixture["callback"]!.replacingOccurrences(of: "#", with: "?"))!)) == nil,
               "Credentials never accepted in query string")
        try localFiles()
        print("Passed \(checks) native sign-in, local-file, and audio-range checks")
    }
    static func localFiles() throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        try Data("0123456789".utf8).write(to: directory.appendingPathComponent("audio.m4a"))
        func request(_ text: String) -> LocalResponse { LocalResponse.make(request: text, root: directory) }
        expect(request("GET /audio.m4a?v=1 HTTP/1.1\r\n\r\n").body.count == 10, "Query cache suffix supported")
        expect(request("HEAD /audio.m4a HTTP/1.1\r\n\r\n").body.isEmpty, "HEAD body empty")
        expect(request("HEAD /audio.m4a HTTP/1.1\r\n\r\n").headers["Content-Length"] == "10", "HEAD length retained")
        let range = request("GET /audio.m4a HTTP/1.1\r\nRange: bytes=0-1\r\n\r\n")
        expect(range.status == "206 Partial Content" && String(data: range.body, encoding: .utf8) == "01", "Safari audio probe")
        expect(range.headers["Content-Range"] == "bytes 0-1/10", "Range header")
        expect(LocalResponse.byteRange("bytes=8-999", count: 10) == 8..<10, "Range clamped")
        expect(LocalResponse.byteRange("bytes=-3", count: 10) == 7..<10, "Suffix range")
        expect(LocalResponse.byteRange("bytes=4-", count: 10) == 4..<10, "Open range")
        expect(LocalResponse.byteRange("bytes=10-", count: 10) == nil, "Unsatisfiable range")
        expect(LocalResponse.byteRange("bytes=0-1,4-5", count: 10) == nil, "Multiple ranges rejected")
        expect(request("GET /../outside.js HTTP/1.1\r\n\r\n").status == "404 Not Found", "Traversal blocked")
        expect(request("GET /%2e%2e/outside.js HTTP/1.1\r\n\r\n").status == "404 Not Found", "Encoded traversal blocked")
        expect(request("POST /audio.m4a HTTP/1.1\r\n\r\n").status == "400 Bad Request", "Server is read-only")
        expect(request("GET https://example.com/audio.m4a HTTP/1.1\r\n\r\n").status == "400 Bad Request", "No proxy requests")
        expect(request("GET /.env HTTP/1.1\r\n\r\n").status == "404 Not Found", "Hidden files unavailable")
    }
}
