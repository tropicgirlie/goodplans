import Foundation

public struct WorkspaceFile {
    public let url: URL
    public init(url: URL) { self.url = url }
    public func load() throws -> Workspace {
        guard FileManager.default.fileExists(atPath: url.path) else { return Workspace() }
        return try Self.decode(Data(contentsOf: url))
    }
    public static func decode(_ data: Data) throws -> Workspace {
        guard data.count <= 5_000_000 else { throw CoreError.invalidWorkspace }
        let decoder = JSONDecoder(); decoder.dateDecodingStrategy = .iso8601
        let workspace = try decoder.decode(Workspace.self, from: data)
        guard workspace.version == 1 else { throw CoreError.invalidWorkspace }
        guard Set(workspace.plans.map(\.id)).count == workspace.plans.count,
              Set(workspace.people.map(\.id)).count == workspace.people.count,
              Set(workspace.invitations.map(\.id)).count == workspace.invitations.count else { throw CoreError.invalidWorkspace }
        for invite in workspace.invitations { _ = try InvitationRoute(url: invite.url) }
        return workspace
    }
    public func save(_ workspace: Workspace) throws {
        let folder = url.deletingLastPathComponent()
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
        let data = try encoder.encode(workspace)
        #if os(iOS)
        try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        #else
        try data.write(to: url, options: .atomic)
        #endif
    }
}
