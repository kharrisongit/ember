import Foundation
import Network

/// A read-only loopback server gives WebKit a stable origin for saves, fetch and streamed audio.
final class LocalGameServer {
    static let port: UInt16 = 49_731
    static let origin = "http://127.0.0.1:\(port)"
    private let queue = DispatchQueue(label: "com.kharrison.dragonrider.assets")
    private var listener: NWListener?
    private var clients: [ObjectIdentifier: NWConnection] = [:]
    private let root: URL

    init(root: URL) { self.root = root }
    deinit { listener?.cancel(); clients.values.forEach { $0.cancel() } }

    func start(completion: @escaping (Error?) -> Void) {
        do {
            let parameters = NWParameters.tcp
            parameters.requiredLocalEndpoint = .hostPort(host: "127.0.0.1", port: NWEndpoint.Port(rawValue: Self.port)!)
            parameters.allowLocalEndpointReuse = true
            let listener = try NWListener(using: parameters)
            var reported = false
            listener.stateUpdateHandler = { state in
                let result: Error?
                switch state {
                case .ready: result = nil
                case .failed(let error): result = error
                default: return
                }
                guard !reported else { return }
                reported = true
                DispatchQueue.main.async { completion(result) }
            }
            listener.newConnectionHandler = { [weak self] client in self?.accept(client) }
            self.listener = listener
            listener.start(queue: queue)
        } catch { completion(error) }
    }

    private func accept(_ client: NWConnection) {
        let key = ObjectIdentifier(client)
        clients[key] = client
        client.stateUpdateHandler = { [weak self] state in
            switch state {
            case .cancelled, .failed: self?.clients.removeValue(forKey: key)
            default: break
            }
        }
        client.start(queue: queue)
        receive(client, accumulated: Data())
        queue.asyncAfter(deadline: .now() + 30) { [weak client] in client?.cancel() }
    }

    private func receive(_ client: NWConnection, accumulated: Data) {
        client.receive(minimumIncompleteLength: 1, maximumLength: 16_384) { [weak self] data, _, complete, error in
            guard let self, error == nil, let data, accumulated.count + data.count <= 65_536 else {
                client.cancel(); return
            }
            let request = accumulated + data
            if request.range(of: Data("\r\n\r\n".utf8)) != nil,
               let text = String(data: request, encoding: .utf8) {
                let response = LocalResponse.make(request: text, root: self.root)
                client.send(content: response.wire, completion: .contentProcessed { _ in client.cancel() })
            } else if !complete {
                self.receive(client, accumulated: request)
            } else { client.cancel() }
        }
    }
}
