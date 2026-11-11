import XCTest
@testable import GoodPlansCore

final class CoreTests: XCTestCase {
    func testDatesPreserveInstantsIncludingDublinClockChange() {
        XCTAssertEqual(PlanDate.parse("2026-10-25T01:30:00+01:00"), PlanDate.parse("2026-10-25T00:30:00.000Z"))
        XCTAssertEqual(PlanDate.string(PlanDate.parse("2026-10-17T09:30:00.000Z")!), "2026-10-17T09:30:00Z")
        XCTAssertNil(PlanDate.parse("Date to decide"))
    }
    func testLocalBackupRoundTripAndCorruptionDoesNotOverwriteExistingData() throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: directory) }
        let file = WorkspaceFile(url: directory.appendingPathComponent("workspace.json"))
        let person = Person(name: "Example friend", interests: "Dance", notes: "Local-only note")
        let plan = LocalPlan(title: "Coffee", startsAt: PlanDate.parse("2026-11-14T10:30:00Z"), personIDs: [person.id])
        let expected = Workspace(plans: [plan], people: [person])
        try file.save(expected)
        XCTAssertEqual(try file.load(), expected)
        let bytes = try Data(contentsOf: file.url)
        XCTAssertThrowsError(try WorkspaceFile.decode(Data("{\"version\":999,\"plans\":[],\"people\":[]}".utf8)))
        XCTAssertEqual(try Data(contentsOf: file.url), bytes)
        XCTAssertThrowsError(try WorkspaceFile.decode(Data("invalid".utf8)))
    }
    func testDuplicateIdentitiesAreRejectedInImportedBackup() throws {
        let person = Person(name: "Test")
        let data = try JSONEncoder().encode(Workspace(people: [person, person]))
        XCTAssertThrowsError(try WorkspaceFile.decode(data))
    }
    func testInvitationLinksRequireKnownHTTPSOriginAndPrivateTokenShape() throws {
        let valid = URL(string: "https://goodplans.luana.systems/events/dance#invite=" + String(repeating: "a", count: 64))!
        XCTAssertEqual(try InvitationRoute(url: valid).slug, "dance")
        XCTAssertEqual(try InvitationRoute(url: valid).token?.count, 64)
        for link in ["http://goodplans.luana.systems/events/dance", "https://goodplans.luana.systems.evil.example/events/dance", "https://goodplans.luana.systems/events/dance#invite=short", "https://goodplans.luana.systems/events/a%2Fb", "https://person:secret@goodplans.luana.systems/events/dance"] {
            XCTAssertThrowsError(try InvitationRoute(url: URL(string: link)!))
        }
    }
    func testDiscoveryDraftRetainsSourceAndDoesNotInventEndTime() throws {
        let data = Data(#"{"id":"fixture","title":"A class","starts_at":"2026-11-14T10:30:00.000Z","ends_at":null,"venue":"Test venue, Dublin","category":"Dance & movement","price":"Check booking page","url":"https://example.com/class"}"#.utf8)
        let decoder = JSONDecoder(); decoder.keyDecodingStrategy = .convertFromSnakeCase
        let event = try decoder.decode(DiscoveryEvent.self, from: data)
        let draft = event.draft()
        XCTAssertEqual(draft.startsAt, PlanDate.parse(event.startsAt)); XCTAssertNil(draft.endsAt)
        XCTAssertTrue(draft.sourceEndUnknown); XCTAssertEqual(draft.bookingURL, event.url)
        XCTAssertTrue(draft.notes.contains("does not reserve tickets"))
    }
    func testSharingLocalPlanMakesNoRSVPPromiseAndUsesInviterName() {
        let text = LocalPlan(title: "Test coffee", hostName: "Luana").invitationText(people: [])
        XCTAssertTrue(text.contains("Luana is inviting you")); XCTAssertTrue(text.contains("does not collect RSVPs"))
        XCTAssertTrue(text.contains("Date to decide")); XCTAssertFalse(text.contains("2026"))
    }
}

private final class StubProtocol: URLProtocol {
    static var handler: ((URLRequest) throws -> (Int, String, Data))?
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        do {
            let (status, contentType, body) = try Self.handler!(request)
            let response = HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: nil, headerFields: ["Content-Type": contentType])!
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: body); client?.urlProtocolDidFinishLoading(self)
        } catch { client?.urlProtocol(self, didFailWithError: error) }
    }
    override func stopLoading() {}
}
final class ClientTests: XCTestCase {
    private func client() -> GoodPlansClient {
        let config = URLSessionConfiguration.ephemeral; config.protocolClasses = [StubProtocol.self]
        return GoodPlansClient(origin: URL(string: "https://goodplans.example")!, session: URLSession(configuration: config))
    }
    override func tearDown() { StubProtocol.handler = nil }
    func testPrivateInvitationReadCarriesExplicitContextAndDecodesStatus() async throws {
        StubProtocol.handler = { request in
            XCTAssertEqual(URLComponents(url: request.url!, resolvingAgainstBaseURL: false)?.queryItems?.first?.value, "invite-test")
            return (200, "application/json", Data(#"{"event":{"id":"event-test","slug":"test","title":"A private plan","starts_at":"2026-11-14T10:30:00Z","ends_at":"2026-11-14T11:30:00Z","timezone":"Europe/Dublin","status":"published","visibility":"invite","plus_one":1},"guest":{"invitationId":"invite-test","name":"Test guest"},"rsvp":{"status":"waitlisted","party_size":2}}"#.utf8))
        }
        let result = try await client().invitation(slug: "test", invitationID: "invite-test")
        XCTAssertEqual(result.guest?.invitationId, "invite-test"); XCTAssertEqual(result.rsvp?.status, "waitlisted"); XCTAssertEqual(result.rsvp?.partySize, 2)
    }
    func testPrivateExchangeCannotOpenAnotherEventUnderSameIdentity() async throws {
        StubProtocol.handler = { _ in (200, "application/json", Data(#"{"invitationId":"wrong-guest","eventSlug":"different-event"}"#.utf8)) }
        let route = try InvitationRoute(url: URL(string: "https://goodplans.luana.systems/events/intended#invite=" + String(repeating: "a", count: 64))!)
        do { _ = try await client().exchange(route); XCTFail("Mismatched invitation was accepted") } catch { XCTAssertTrue(error is CoreError) }
    }
    func testServiceFailureAndHTMLFallbackNeverBecomeAnEmptySuccessfulFeed() async throws {
        for (status, type, data) in [(503, "application/json", Data(#"{"error":"Please retry later"}"#.utf8)), (200, "text/html", Data("<html>Website fallback</html>".utf8))] {
            StubProtocol.handler = { _ in (status, type, data) }
            do { _ = try await client().discovery(); XCTFail("Failure was shown as a successful empty list") } catch { XCTAssertTrue(error is CoreError) }
        }
    }
    func testPublishingNeverUploadsPrivateFriendPreferences() async throws {
        let friend = Person(name: "Example friend", interests: "PRIVATE INTEREST", notes: "PRIVATE NOTE")
        var plan = LocalPlan(title: "Test plan", hostName: "Luana", startsAt: Date(), endsAt: Date().addingTimeInterval(3600), personIDs: [friend.id])
        let firstID = plan.id
        StubProtocol.handler = { request in
            let bodyData = request.httpBody ?? Data(reading: request.httpBodyStream)
            let body = try JSONSerialization.jsonObject(with: bodyData) as! [String: Any]
            XCTAssertEqual(body["clientId"] as? String, "ios-" + firstID.uuidString.lowercased())
            XCTAssertEqual(body["showGuests"] as? Bool, false)
            XCTAssertEqual(body["guests"] as? [[String: String]], [["name": "Example friend"]])
            XCTAssertFalse(String(data: bodyData, encoding: .utf8)!.contains("PRIVATE"))
            return (200, "application/json", Data(#"{"events":[{"id":"event-test","slug":"test-plan","title":"Test plan","starts_at":"2026-11-14T10:30:00Z","ends_at":"2026-11-14T11:30:00Z","timezone":"Europe/Dublin","status":"published","visibility":"invite","inviteLinks":[]}]}"#.utf8))
        }
        _ = try await client().publish(plan, people: [friend])
        plan.startsAt = nil
        do { _ = try await client().publish(plan, people: [friend]); XCTFail("Undated plan published") } catch { XCTAssertTrue(error is CoreError) }
    }
}
private extension Data {
    init(reading stream: InputStream?) {
        self.init(); guard let stream else { return }; stream.open(); defer { stream.close() }
        let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: 4096); defer { buffer.deallocate() }
        while stream.hasBytesAvailable { let count = stream.read(buffer, maxLength: 4096); guard count > 0 else { break }; append(buffer, count: count) }
    }
}
