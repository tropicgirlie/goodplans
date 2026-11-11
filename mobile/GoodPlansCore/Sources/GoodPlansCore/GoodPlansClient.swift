import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public actor GoodPlansClient {
    private let origin: URL
    private let session: URLSession
    private let didRespond: @Sendable () -> Void
    public init(origin: URL = SafeLinks.origin, session: URLSession = .shared, didRespond: @escaping @Sendable () -> Void = {}) {
        self.origin = origin; self.session = session; self.didRespond = didRespond
    }
    private func request<T: Decodable>(_ path: String, method: String = "GET", body: [String: Any]? = nil) async throws -> T {
        var request = URLRequest(url: origin.appendingPathComponent(path))
        request.httpMethod = method; request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let body { request.httpBody = try JSONSerialization.data(withJSONObject: body); request.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        let (data, response) = try await session.data(for: request)
        didRespond()
        guard let response = response as? HTTPURLResponse else { throw CoreError.service("The service is unavailable. Your local plans are safe.") }
        guard (200..<300).contains(response.statusCode) else {
            let message = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
            throw CoreError.service(message ?? "The service could not complete that request (\(response.statusCode)).")
        }
        guard response.value(forHTTPHeaderField: "Content-Type")?.contains("application/json") == true else { throw CoreError.service("The invitation service is unavailable. Your local plans are safe.") }
        let decoder = JSONDecoder(); decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(T.self, from: data)
    }
    private struct OK: Decodable { let ok: Bool? }
    private struct Discovery: Decodable { let events: [DiscoveryEvent] }
    private struct Auth: Decodable { let user: HostUser? }
    private struct Events: Decodable { let events: [HostedEvent] }
    private struct Exchange: Decodable { let invitationId: String; let eventSlug: String }
    public func discovery() async throws -> [DiscoveryEvent] { let result: Discovery = try await request("api/discovery"); return result.events }
    public func user() async throws -> HostUser? { let result: Auth = try await request("api/auth/status"); return result.user }
    public func requestCode(email: String) async throws { let _: OK = try await request("api/auth/otp/request", method: "POST", body: ["email": email]) }
    public func verify(email: String, code: String) async throws -> HostUser? { let result: Auth = try await request("api/auth/otp/verify", method: "POST", body: ["email": email, "code": code]); return result.user }
    public func logout() async throws { let _: OK = try await request("api/auth/logout", method: "POST", body: [:]) }
    public func hostedEvents() async throws -> [HostedEvent] { let result: Events = try await request("api/host/events"); return result.events }
    public func exchange(_ route: InvitationRoute) async throws -> String? {
        guard let token = route.token else { return nil }
        let result: Exchange = try await request("api/invites/exchange", method: "POST", body: ["token": token])
        guard result.eventSlug == route.slug else { throw CoreError.invalidInvitation }
        return result.invitationId
    }
    public func invitation(slug: String, invitationID: String?) async throws -> InvitationEnvelope {
        // The context is explicit and must match the per-invitation HttpOnly cookie.
        var url = origin.appendingPathComponent("api/events/\(slug)")
        if let invitationID {
            var components = URLComponents(url: url, resolvingAgainstBaseURL: false)!
            components.queryItems = [.init(name: "invitation", value: invitationID)]; url = components.url!
        }
        var request = URLRequest(url: url); request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, response) = try await session.data(for: request); didRespond()
        guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
            let message = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
            throw CoreError.service(message ?? "This invitation could not be opened. Check the link or ask your host.")
        }
        guard response.value(forHTTPHeaderField: "Content-Type")?.contains("application/json") == true else { throw CoreError.service("The invitation service is unavailable. Try again later.") }
        let decoder = JSONDecoder(); decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(InvitationEnvelope.self, from: data)
    }
    @discardableResult public func respond(eventID: String, invitationID: String, status: String, partySize: Int) async throws -> RSVPResult {
        try await request("api/events/\(eventID)/rsvps", method: "POST", body: ["invitationId": invitationID, "status": status, "partySize": partySize])
    }
    public func join(eventID: String, name: String, email: String, token: String, status: String, partySize: Int) async throws -> RSVPResult {
        try await request("api/events/\(eventID)/join", method: "POST", body: ["name": name, "email": email, "joinToken": token, "status": status, "partySize": partySize])
    }
    private struct Receipt: Decodable { let confirmation: Confirmation }
    public func requestConfirmation(eventID: String, invitationID: String, email: String) async throws -> Confirmation {
        let result: Receipt = try await request("api/events/\(eventID)/confirmation", method: "POST", body: ["invitationId": invitationID, "email": email])
        return result.confirmation
    }
    public func publish(_ plan: LocalPlan, people: [Person]) async throws -> HostedEvent {
        guard let start = plan.startsAt, let end = plan.endsAt else { throw CoreError.service("Choose the date and your group’s end time before publishing.") }
        let guests = plan.openInvitation ? [] : people.filter { plan.personIDs.contains($0.id) }.map { ["name": $0.name] }
        let result: Events = try await request("api/host/events", method: "POST", body: [
            "clientId": "ios-\(plan.id.uuidString.lowercased())", "title": plan.title, "hostName": plan.hostName,
            "startsAt": PlanDate.string(start), "endsAt": PlanDate.string(end), "timezone": "Europe/Dublin",
            "venueName": plan.venue, "description": plan.notes, "capacity": plan.capacity, "guests": guests,
            "publish": true, "plusOne": plan.plusOne, "showGuests": false, "reminder": false,
            "visibility": plan.openInvitation ? "public" : "invite", "planType": plan.bookingURL.isEmpty ? "own" : "attend", "bookingUrl": plan.bookingURL
        ])
        guard let event = result.events.first else { throw CoreError.service("The event could not be confirmed. Retry the same draft to recover it.") }
        return event
    }
}
