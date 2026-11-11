import Foundation
import Security
import GoodPlansCore

// Session cookies and private invitation capabilities stay in this device's Keychain,
// separate from the user's exportable local planning data.
final class SessionVault: @unchecked Sendable {
    static let shared = SessionVault()
    private let lock = NSRecursiveLock()
    private let service = "systems.luana.goodplans.prototype.sessions"
    private struct SavedCookie: Codable {
        let name: String; let value: String; let domain: String; let path: String; let expires: Date?; let secure: Bool
    }
    private struct Access: Codable {
        var cookies: [SavedCookie] = []
        var contexts: [String: String] = [:]
        var joinTokens: [String: String] = [:]
        var invites: [String: [InviteLink]] = [:]
    }
    private func read() -> Access {
        var result: CFTypeRef?
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                    kSecAttrAccount as String: "access", kSecReturnData as String: true]
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data, let value = try? JSONDecoder().decode(Access.self, from: data) else { return Access() }
        return value
    }
    private func write(_ access: Access) throws {
        let data = try JSONEncoder().encode(access)
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: "access"]
        var status = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        if status == errSecItemNotFound {
            var insertion = query; insertion[kSecValueData as String] = data
            insertion[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            status = SecItemAdd(insertion as CFDictionary, nil)
        }
        guard status == errSecSuccess else { throw CoreError.service("Your session could not be saved securely. Your local plans are safe; reopen your invitation or sign in again if needed.") }
    }
    func restoreCookies() {
        lock.lock(); defer { lock.unlock() }
        for saved in read().cookies where (saved.expires ?? .distantFuture) > Date() {
            var properties: [HTTPCookiePropertyKey: Any] = [.name: saved.name, .value: saved.value, .domain: saved.domain, .path: saved.path, .secure: saved.secure ? "TRUE" : "FALSE"]
            if let expiry = saved.expires { properties[.expires] = expiry }
            if let cookie = HTTPCookie(properties: properties) { HTTPCookieStorage.shared.setCookie(cookie) }
        }
    }
    func captureCookies() throws {
        lock.lock(); defer { lock.unlock() }
        var access = read()
        access.cookies = (HTTPCookieStorage.shared.cookies ?? []).filter {
            $0.domain.trimmingCharacters(in: CharacterSet(charactersIn: ".")) == "goodplans.luana.systems" && $0.name.hasPrefix("good_plans_")
        }.map { SavedCookie(name: $0.name, value: $0.value, domain: $0.domain, path: $0.path, expires: $0.expiresDate, secure: $0.isSecure) }
        try write(access)
    }
    func context(_ slug: String) -> String? { lock.lock(); defer { lock.unlock() }; return read().contexts[slug] }
    func setContext(_ invitationID: String, slug: String) throws {
        lock.lock(); defer { lock.unlock() }; var access = read(); access.contexts[slug] = invitationID; try write(access)
    }
    func joinToken(_ eventID: String) throws -> String {
        lock.lock(); defer { lock.unlock() }; var access = read()
        if let saved = access.joinTokens[eventID] { return saved }
        var bytes = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else { throw CoreError.service("Could not prepare a secure response. Try again.") }
        let token = bytes.map { String(format: "%02x", $0) }.joined()
        access.joinTokens[eventID] = token; try write(access); return token
    }
    func saveInvites(_ invites: [InviteLink], draftID: UUID) throws {
        lock.lock(); defer { lock.unlock() }; var access = read(); access.invites[draftID.uuidString] = invites; try write(access)
    }
    func invites(_ draftID: UUID) -> [InviteLink] { lock.lock(); defer { lock.unlock() }; return read().invites[draftID.uuidString] ?? [] }
}
