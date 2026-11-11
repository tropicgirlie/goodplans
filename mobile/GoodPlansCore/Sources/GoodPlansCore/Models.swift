import Foundation

public enum PlanDate {
    public static func parse(_ text: String?) -> Date? {
        guard let text else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: text) { return date }
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: text)
    }
    public static func string(_ date: Date) -> String { ISO8601DateFormatter().string(from: date) }
}

public struct Person: Codable, Identifiable, Equatable, Sendable {
    public var id: UUID
    public var name: String
    public var interests: String
    public var notes: String
    public init(id: UUID = UUID(), name: String = "", interests: String = "", notes: String = "") {
        self.id = id; self.name = name; self.interests = interests; self.notes = notes
    }
}

public struct LocalPlan: Codable, Identifiable, Equatable, Sendable {
    public var id: UUID
    public var title: String
    public var hostName: String
    public var startsAt: Date?
    public var endsAt: Date?
    public var venue: String
    public var notes: String
    public var personIDs: [UUID]
    public var bookingURL: String
    public var openInvitation: Bool
    public var capacity: Int
    public var plusOne: Bool
    public var sourceID: String?
    public var remoteID: String?
    public var hostAccountID: String?
    public var slug: String?
    public var sourceEndUnknown: Bool
    public init(id: UUID = UUID(), title: String = "", hostName: String = "", startsAt: Date? = nil, endsAt: Date? = nil,
                venue: String = "", notes: String = "", personIDs: [UUID] = [], bookingURL: String = "",
                openInvitation: Bool = false, capacity: Int = 12, plusOne: Bool = false, sourceID: String? = nil,
                remoteID: String? = nil, hostAccountID: String? = nil, slug: String? = nil, sourceEndUnknown: Bool = false) {
        self.id = id; self.title = title; self.hostName = hostName; self.startsAt = startsAt; self.endsAt = endsAt
        self.venue = venue; self.notes = notes; self.personIDs = personIDs; self.bookingURL = bookingURL
        self.openInvitation = openInvitation; self.capacity = capacity; self.plusOne = plusOne; self.sourceID = sourceID
        self.remoteID = remoteID; self.hostAccountID = hostAccountID; self.slug = slug; self.sourceEndUnknown = sourceEndUnknown
    }
    public func validation() -> String? {
        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return "Give your plan a name." }
        if let start = startsAt, let end = endsAt, end <= start { return "Choose an end after the start." }
        if !bookingURL.isEmpty && !SafeLinks.isPublicHTTPS(bookingURL) { return "Use a complete HTTPS booking link." }
        return nil
    }
    public func invitationText(people: [Person]) -> String {
        let names = people.filter { personIDs.contains($0.id) }.map(\.name).joined(separator: ", ")
        let host = hostName.trimmingCharacters(in: .whitespacesAndNewlines)
        let formatter = DateFormatter(); formatter.locale = Locale(identifier: "en_IE")
        formatter.timeZone = TimeZone(identifier: "Europe/Dublin"); formatter.dateStyle = .full; formatter.timeStyle = .short
        return [host.isEmpty ? "You’re invited" : "\(host) is inviting you", title,
                startsAt.map { formatter.string(from: $0) + " · Dublin time" } ?? "Date to decide together",
                venue, names.isEmpty ? "" : "With \(names)", notes,
                bookingURL.isEmpty ? "" : "Tickets / booking: \(bookingURL)",
                bookingURL.isEmpty ? "" : "This invitation does not buy or reserve a ticket.",
                "This is a planning message. It does not collect RSVPs."].filter { !$0.isEmpty }.joined(separator: "\n\n")
    }
}

public struct Workspace: Codable, Equatable, Sendable {
    public var version: Int = 1
    public var plans: [LocalPlan] = []
    public var people: [Person] = []
    public var invitations: [SavedInvitation] = []
    public init(plans: [LocalPlan] = [], people: [Person] = [], invitations: [SavedInvitation] = []) {
        self.plans = plans; self.people = people; self.invitations = invitations
    }
    private enum CodingKeys: CodingKey { case version, plans, people, invitations }
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        version = try container.decode(Int.self, forKey: .version)
        plans = try container.decode([LocalPlan].self, forKey: .plans)
        people = try container.decode([Person].self, forKey: .people)
        invitations = try container.decodeIfPresent([SavedInvitation].self, forKey: .invitations) ?? []
    }
    // A quick-add reuses the existing identity instead of silently creating duplicates.
    public mutating func addPersonIfNeeded(named name: String) throws -> Person {
        let name = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { throw CoreError.service("Add a first name or nickname.") }
        if let existing = people.first(where: { $0.name.caseInsensitiveCompare(name) == .orderedSame }) { return existing }
        let person = Person(name: String(name.prefix(80)))
        people.append(person); return person
    }
    public mutating func remember(_ envelope: InvitationEnvelope) {
        let saved = SavedInvitation(envelope: envelope)
        invitations.removeAll { $0.id == saved.id || ($0.slug == saved.slug && $0.invitationID == nil) }
        invitations.insert(saved, at: 0)
    }
}

// No private token, cookie or email is persisted in this local invitation index.
public struct SavedInvitation: Codable, Equatable, Identifiable, Sendable {
    public var id: String { invitationID ?? "public-\(slug)" }
    public let slug: String
    public let invitationID: String?
    public let title: String
    public let hostName: String?
    public let guestName: String?
    public let startsAt: String
    public let endsAt: String
    public let venue: String?
    public let eventStatus: String
    public let response: String?
    public let checkedAt: Date
    public init(envelope: InvitationEnvelope, checkedAt: Date = Date()) {
        slug = envelope.event.slug; invitationID = envelope.guest?.invitationId
        title = envelope.event.title; hostName = envelope.event.hostName; guestName = envelope.guest?.name
        startsAt = envelope.event.startsAt; endsAt = envelope.event.endsAt; venue = envelope.event.venueName
        eventStatus = envelope.event.status; response = envelope.rsvp?.status; self.checkedAt = checkedAt
    }
    public var url: URL {
        SafeLinks.origin.appendingPathComponent("events/\(slug)").appending(queryItems: invitationID.map { [.init(name: "invitation", value: $0)] } ?? [])
    }
}

public struct DiscoveryEvent: Decodable, Identifiable, Sendable {
    public let id: String
    public let title: String
    public let startsAt: String
    public let endsAt: String?
    public let venue: String
    public let category: String
    public let price: String
    public let url: String
    public let childcare: String?
    public let childrenWelcome: String?
    public let careUrl: String?
    public func draft() -> LocalPlan {
        LocalPlan(title: title, startsAt: PlanDate.parse(startsAt), endsAt: PlanDate.parse(endsAt), venue: venue,
                  notes: "Details & tickets: \(url)\nAdding a plan does not reserve tickets. Check the source for availability and changes.",
                  bookingURL: url, sourceID: id, sourceEndUnknown: endsAt == nil)
    }
}

public struct HostUser: Decodable, Sendable { public let id: String; public let email: String; public let displayName: String? }
public struct InviteLink: Codable, Identifiable, Sendable {
    public var id: String { invitationId }
    public let invitationId: String
    public let guestName: String
    public let inviteUrl: String
}
public struct HostedEvent: Decodable, Identifiable, Sendable {
    public let id: String
    public let slug: String
    public let title: String
    public let description: String?
    public let hostName: String?
    public let startsAt: String
    public let endsAt: String
    public let timezone: String
    public let venueName: String?
    public let status: String
    public let visibility: String
    public let bookingUrl: String?
    public let plusOne: Int?
    public let showGuests: Int?
    public let inviteLinks: [InviteLink]?
}
public struct InvitationGuest: Decodable, Sendable {
    public let invitationId: String; public let name: String; public let email: String?
    public init(invitationId: String, name: String, email: String?) { self.invitationId = invitationId; self.name = name; self.email = email }
}
public struct RSVP: Decodable, Sendable { public let status: String; public let partySize: Int? }
public struct Confirmation: Decodable, Sendable { public let status: String }
public struct RSVPResult: Decodable, Sendable {
    public let rsvp: RSVP
    public let confirmation: Confirmation?
    public let invitationId: String?
}
public struct InvitationEnvelope: Decodable, Sendable {
    public let event: HostedEvent
    public let guest: InvitationGuest?
    public let rsvp: RSVP?
    public let confirmation: Confirmation?
    public let counts: [String: Int]?
    public func applying(_ result: RSVPResult, guest: InvitationGuest? = nil) -> InvitationEnvelope {
        InvitationEnvelope(event: event, guest: guest ?? self.guest, rsvp: result.rsvp, confirmation: result.confirmation, counts: counts)
    }
    public func withConfirmation(_ confirmation: Confirmation) -> InvitationEnvelope {
        InvitationEnvelope(event: event, guest: guest, rsvp: rsvp, confirmation: confirmation, counts: counts)
    }
}

public enum SafeLinks {
    public static let origin = URL(string: "https://goodplans.luana.systems")!
    public static func isPublicHTTPS(_ text: String) -> Bool {
        guard let url = URL(string: text), url.scheme == "https", let host = url.host,
              url.user == nil, url.password == nil, url.port == nil else { return false }
        return host.contains(".") && host != "localhost" && !host.hasSuffix(".local")
            && host != "127.0.0.1" && !host.hasPrefix("192.168.") && !host.hasPrefix("10.")
    }
}
public struct InvitationRoute: Identifiable, Hashable, Sendable {
    public let id: UUID = UUID()
    public let slug: String
    public let token: String?
    public let invitationID: String?
    public init(url: URL) throws {
        let allowed = ["goodplans.luana.systems", "goodplans.returnkit.life", "good-plans.luanagbc.workers.dev"]
        guard url.scheme == "https", allowed.contains(url.host ?? ""), url.user == nil, url.password == nil, url.port == nil else { throw CoreError.invalidInvitation }
        let parts = url.path.split(separator: "/")
        guard parts.count == 2, parts[0] == "events", parts[1].count <= 140,
              parts[1].allSatisfy({ $0.isASCII && ($0.isLetter || $0.isNumber || $0 == "-" || $0 == "_") }) else { throw CoreError.invalidInvitation }
        slug = String(parts[1])
        let token = URLComponents(string: "https://example.invalid/?" + (url.fragment ?? ""))?.queryItems?.first(where: { $0.name == "invite" })?.value
        if let token, token.count != 64 || !token.allSatisfy({ $0.isHexDigit }) { throw CoreError.invalidInvitation }
        self.token = token
        let context = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?.first(where: { $0.name == "invitation" })?.value
        if let context, context.isEmpty || context.count > 100 || !context.allSatisfy({ $0.isASCII && ($0.isLetter || $0.isNumber || $0 == "-" || $0 == "_") }) { throw CoreError.invalidInvitation }
        invitationID = context
    }
}
public enum CoreError: LocalizedError {
    case invalidInvitation, invalidWorkspace, service(String)
    public var errorDescription: String? {
        switch self {
        case .invalidInvitation: return "Use a complete Us & About invitation link. Keep personal invitation links private."
        case .invalidWorkspace: return "This file is not a supported Us & About app backup. Your current plans have not changed."
        case .service(let message): return message
        }
    }
}
