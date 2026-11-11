import SwiftUI
import Observation
import GoodPlansCore

@MainActor @Observable final class AppStore {
    enum Tab: Hashable { case plans, people, invitations, dublin, account }
    var selectedTab: Tab = .plans
    var planPath: [UUID] = []
    var workspace = Workspace()
    var error: String?
    var user: HostUser?
    var hosted: [HostedEvent] = []
    var events: [DiscoveryEvent] = []
    var discoveryLoading = false
    var discoveryError: String?
    var hostError: String?
    var hostLoading = false
    var invitation: InvitationRoute?
    let api: GoodPlansClient
    private let file: WorkspaceFile
    private var readable = true
    init() {
        let folder = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("GoodPlans", isDirectory: true)
        file = WorkspaceFile(url: folder.appendingPathComponent("workspace-v1.json"))
        SessionVault.shared.restoreCookies()
        let configuration = URLSessionConfiguration.ephemeral
        configuration.httpCookieStorage = HTTPCookieStorage.shared
        configuration.httpShouldSetCookies = true
        api = GoodPlansClient(session: URLSession(configuration: configuration))
        do { workspace = try file.load() }
        catch { readable = false; self.error = "Your saved planning file could not be opened. It has not been overwritten. \(error.localizedDescription)" }
    }
    func persist(_ next: Workspace) -> Bool {
        guard readable else { error = "Your previous planning file needs recovery before changes can be saved."; return false }
        do { try file.save(next); workspace = next; return true }
        catch { self.error = "Could not save on this device. Your previous plans have not changed. \(error.localizedDescription)"; return false }
    }
    @discardableResult func save(_ plan: LocalPlan) -> Bool {
        var next = workspace
        if let index = next.plans.firstIndex(where: { $0.id == plan.id }) { next.plans[index] = plan } else { next.plans.append(plan) }
        return persist(next)
    }
    @discardableResult func save(_ person: Person) -> Bool {
        let name = person.name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { return false }
        guard !workspace.people.contains(where: { $0.id != person.id && $0.name.caseInsensitiveCompare(name) == .orderedSame }) else {
            error = "That person is already in your circle. Edit their existing entry."; return false
        }
        var next = workspace; var person = person; person.name = name
        if let index = next.people.firstIndex(where: { $0.id == person.id }) { next.people[index] = person } else { next.people.append(person) }
        return persist(next)
    }
    func remove(_ plan: LocalPlan) { var next = workspace; next.plans.removeAll { $0.id == plan.id }; _ = persist(next) }
    func remove(_ person: Person) {
        var next = workspace; next.people.removeAll { $0.id == person.id }
        for index in next.plans.indices { next.plans[index].personIDs.removeAll { $0 == person.id } }
        _ = persist(next)
    }
    func refreshDiscovery() async {
        guard !discoveryLoading else { return }; discoveryLoading = true; discoveryError = nil
        defer { discoveryLoading = false }
        do { events = try await api.discovery() }
        catch { discoveryError = error.localizedDescription }
    }
    func restoreAccount() async {
        do { user = try await api.user(); if user != nil { await refreshHosted() } }
        catch { hostError = error.localizedDescription }
    }
    func refreshHosted() async {
        guard user != nil, !hostLoading else { return }; hostLoading = true; hostError = nil
        defer { hostLoading = false }
        do { hosted = try await api.hostedEvents(); try SessionVault.shared.captureCookies() }
        catch { hostError = error.localizedDescription }
    }
    func openInvitation(_ url: URL) {
        do { invitation = try InvitationRoute(url: url) } catch { self.error = error.localizedDescription }
    }
    func showPlan(_ id: UUID) { selectedTab = .plans; planPath = [id] }
    func addPerson(named name: String) -> Person? {
        do {
            var next = workspace
            let person = try next.addPersonIfNeeded(named: name)
            return persist(next) ? person : nil
        } catch { self.error = error.localizedDescription; return nil }
    }
    @discardableResult func remember(_ envelope: InvitationEnvelope) -> Bool {
        var next = workspace; next.remember(envelope); return persist(next)
    }
    func forget(_ invitation: SavedInvitation) {
        var next = workspace; next.invitations.removeAll { $0.id == invitation.id }; _ = persist(next)
    }
}
