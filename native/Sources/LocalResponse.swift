import Foundation

struct LocalResponse {
    let status: String
    let headers: [String: String]
    let body: Data

    static func make(request: String, root: URL) -> LocalResponse {
        let lines = request.components(separatedBy: "\r\n")
        let first = lines.first?.split(separator: " ") ?? []
        guard first.count == 3, ["GET", "HEAD"].contains(String(first[0])),
              let parts = URLComponents(string: String(first[1])), parts.scheme == nil,
              parts.host == nil else { return error("400 Bad Request") }
        let path = parts.path == "/" ? "/index.html" : parts.path
        let base = root.standardizedFileURL.resolvingSymlinksInPath()
        let file = base.appendingPathComponent(String(path.dropFirst()))
            .standardizedFileURL.resolvingSymlinksInPath()
        guard file.path.hasPrefix(base.path + "/"),
              !path.split(separator: "/").contains(where: { $0.hasPrefix(".") }),
              let type = mime[file.pathExtension.lowercased()],
              let data = try? Data(contentsOf: file, options: .mappedIfSafe) else {
            return error("404 Not Found")
        }
        var headers = ["Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache"]
        let ranges = lines.dropFirst().filter { $0.lowercased().hasPrefix("range:") }
        guard ranges.count <= 1 else { return error("400 Bad Request") }
        var body = data
        var status = "200 OK"
        if let range = ranges.first {
            guard let bounds = byteRange(String(range.dropFirst(6)).trimmingCharacters(in: .whitespaces),
                                         count: data.count) else {
                return LocalResponse(status: "416 Range Not Satisfiable",
                                     headers: ["Content-Range": "bytes */\(data.count)"], body: Data())
            }
            body = data.subdata(in: bounds)
            headers["Content-Range"] = "bytes \(bounds.lowerBound)-\(bounds.upperBound - 1)/\(data.count)"
            status = "206 Partial Content"
        }
        headers["Content-Length"] = String(body.count)
        return LocalResponse(status: status, headers: headers,
                             body: first[0] == "HEAD" ? Data() : body)
    }

    static func byteRange(_ value: String, count: Int) -> Range<Int>? {
        guard value.hasPrefix("bytes="), count > 0 else { return nil }
        let parts = value.dropFirst(6).split(separator: "-", omittingEmptySubsequences: false)
        guard parts.count == 2 else { return nil }
        if parts[0].isEmpty {
            guard let suffix = Int(parts[1]), suffix > 0 else { return nil }
            return max(0, count - suffix)..<count
        }
        guard let start = Int(parts[0]), start >= 0, start < count else { return nil }
        if parts[1].isEmpty { return start..<count }
        guard let end = Int(parts[1]), end >= start else { return nil }
        return start..<(min(end, count - 1) + 1)
    }

    var wire: Data {
        var fields = headers
        fields["Connection"] = "close"
        fields["X-Content-Type-Options"] = "nosniff"
        fields["Content-Length"] = fields["Content-Length"] ?? String(body.count)
        let text = "HTTP/1.1 \(status)\r\n" + fields.keys.sorted().map {
            "\($0): \(fields[$0] ?? "")\r\n"
        }.joined() + "\r\n"
        return Data(text.utf8) + body
    }

    private static func error(_ status: String) -> LocalResponse {
        LocalResponse(status: status, headers: ["Content-Type": "text/plain"], body: Data(status.utf8))
    }

    private static let mime = [
        "txt": "text/plain; charset=utf-8", "tsv": "text/tab-separated-values; charset=utf-8",
        "html": "text/html; charset=utf-8", "js": "text/javascript; charset=utf-8",
        "css": "text/css; charset=utf-8", "json": "application/json", "webmanifest": "application/manifest+json",
        "png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp",
        "svg": "image/svg+xml", "gif": "image/gif", "m4a": "audio/mp4", "mp3": "audio/mpeg",
        "wav": "audio/wav", "ogg": "audio/ogg", "woff": "font/woff", "woff2": "font/woff2",
        "ttf": "font/ttf", "otf": "font/otf", "bin": "application/octet-stream"
    ]
}
