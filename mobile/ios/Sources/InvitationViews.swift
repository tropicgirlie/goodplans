import SwiftUI
import GoodPlansCore

struct OpenInvitationSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var link = ""
    @State private var route: InvitationRoute?
    @State private var error: String?
    var body: some View {
        NavigationStack {
            Form {
                Section("An invitation from your people") {
                    TextField("Paste your Us & About link", text: $link, axis: .vertical).keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                    Text("Personal links give access to your RSVP. Keep yours private.").font(.footnote).foregroundStyle(Brand.muted)
                    Button("Open invitation") {
                        do {
                            guard let url = URL(string: link.trimmingCharacters(in: .whitespacesAndNewlines)) else { throw CoreError.invalidInvitation }
                            route = try InvitationRoute(url: url)
                        } catch { self.error = error.localizedDescription }
                    }.disabled(link.isEmpty)
                }
                if let error { Section { Text(error).foregroundStyle(Brand.coral) } }
            }.scrollContentBackground(.hidden).paperScreen().navigationTitle("You’re invited")
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Close") { dismiss() } } }
                .navigationDestination(item: $route) { InvitationView(route: $0) }
        }
    }
}

struct InvitationView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @Environment(\.scenePhase) private var scenePhase
    let route: InvitationRoute
    @State private var envelope: InvitationEnvelope?
    @State private var invitationID: String?
    @State private var loading = false
    @State private var busy = false
    @State private var error: String?
    @State private var name = ""
    @State private var email = ""
    @State private var response = "accepted"
    @State private var plusOne = false
    @State private var calendar: CalendarDraft?
    @State private var changingResponse = false
    @State private var localNotice: String?
    @State private var accessExpired = false
    @State private var sendingReceipt = false
    private var status: String { envelope?.rsvp?.status ?? "" }
    private var host: String { envelope?.event.hostName.flatMap { $0.isEmpty ? nil : $0 } ?? "Your host" }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                if let envelope {
                    let event = envelope.event
                    let ended = (PlanDate.parse(event.endsAt) ?? .distantPast) <= Date()
                    let closed = event.status != "published" || ended
                    Image("GatheringCollage").resizable().scaledToFit().frame(maxHeight: 170).frame(maxWidth: .infinity).background(Brand.paper, in: RoundedRectangle(cornerRadius: 18)).accessibilityHidden(true)
                    Text(event.visibility == "public" ? "AN OPEN INVITATION" : "JUST FOR YOUR PEOPLE").font(.caption.weight(.semibold)).tracking(2).foregroundStyle(Brand.coral)
                    Text(event.title).font(.system(.largeTitle, design: .serif, weight: .bold))
                    Text(event.status == "cancelled" ? "A plan from \(host)." : "\(host) is inviting you.").font(.title3)
                    if let rsvp = envelope.rsvp { RSVPReceiptView(status: rsvp.status, confirmation: envelope.confirmation) }
                    PaperCard {
                        VStack(alignment: .leading, spacing: 14) {
                            Label(dateLabel(PlanDate.parse(event.startsAt)), systemImage: "calendar")
                            if let venue = event.venueName, !venue.isEmpty {
                                Label(venue, systemImage: "mappin.and.ellipse")
                                if let url = mapURL(venue) { Link("Directions in Maps ↗", destination: url).frame(minHeight: 44) }
                            }
                            if let guest = envelope.guest { Text("Your response, \(guest.name)").font(.subheadline).foregroundStyle(Brand.muted) }
                        }
                    }
                    if let notes = event.description, !notes.isEmpty { Text(notes).textSelection(.enabled) }
                    if let booking = event.bookingUrl, SafeLinks.isPublicHTTPS(booking), let url = URL(string: booking) {
                        Link("Tickets & booking ↗", destination: url).frame(minHeight: 44)
                        Text("A Us & About RSVP joins the group. It does not buy or reserve an event ticket.").font(.footnote).foregroundStyle(Brand.muted)
                    }
                    if closed {
                        Text(event.status == "cancelled" ? "This meet-up is cancelled. Check the original organiser about any tickets." : "This meet-up has ended. Responses are closed.").font(.headline)
                    } else if !accessExpired && (event.visibility == "public" || envelope.guest != nil) {
                        if envelope.rsvp == nil { responseForm(envelope) }
                        else {
                            DisclosureGroup("Change my response", isExpanded: $changingResponse) { responseForm(envelope).padding(.top, 12) }
                            if envelope.guest != nil {
                                DisclosureGroup("Email my invitation") {
                                    Text("Your email is used for this invitation and relevant updates. It does not subscribe you to a newsletter.").font(.footnote).foregroundStyle(Brand.muted).padding(.top, 8)
                                    TextField("Your email", text: $email).keyboardType(.emailAddress).textContentType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled().textFieldStyle(.roundedBorder)
                                    Button(sendingReceipt ? "Requesting email…" : "Send confirmation email") { Task { await sendReceipt() } }.frame(minHeight: 44).disabled(sendingReceipt || busy || !email.contains("@"))
                                }
                            }
                        }
                    } else { Text("Use your personal invitation link to respond. Hosting sign-in does not create a guest RSVP.").font(.subheadline).foregroundStyle(Brand.muted) }
                    if event.status == "published" {
                        Button("Add to Calendar", systemImage: "calendar.badge.plus") {
                            let prefix = status == "waitlisted" ? "Waitlist — " : status == "maybe" ? "Maybe — " : ""
                            calendar = CalendarDraft(title: prefix + event.title, start: PlanDate.parse(event.startsAt) ?? Date(), end: PlanDate.parse(event.endsAt), notes: "Your RSVP: \(responseLabel(status)).\n\n\(event.description ?? "")\n\nCalendar additions are saved copies. Reopen your invitation for changes.", bookingURL: event.bookingUrl, venue: event.venueName ?? "")
                        }.frame(minHeight: 44)
                    }
                    if event.visibility == "public" { ShareLink(item: SafeLinks.origin.appendingPathComponent("events/\(event.slug)")) { Label("Share open invitation", systemImage: "square.and.arrow.up") }.frame(minHeight: 44) }
                }
                if let localNotice { Text(localNotice).font(.footnote).foregroundStyle(Brand.muted) }
                if loading { ProgressView("Opening your invitation…").frame(maxWidth: .infinity).padding(24) }
                if let error {
                    Text(error).foregroundStyle(Brand.coral)
                    Button("Try again") { Task { await load(exchange: envelope == nil) } }.frame(minHeight: 44)
                }
            }.padding(20)
        }.paperScreen().navigationTitle("Your invitation").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Done") { dismiss() } } }
            .sheet(item: $calendar) { CalendarEditor(draft: $0) }
            .task(id: route.id) { await load(exchange: true) }
            .refreshable { await load(exchange: false) }
            .onChange(of: scenePhase) { _, phase in if phase == .active && envelope != nil && !busy { Task { await load(exchange: false) } } }
    }
    @ViewBuilder private func responseForm(_ envelope: InvitationEnvelope) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            if envelope.guest == nil {
                Text("Come along?").font(.system(.title2, design: .serif, weight: .semibold))
                Text("No account needed. Your email is for your RSVP and calendar invitation, not a newsletter.").font(.subheadline).foregroundStyle(Brand.muted)
                Text(envelope.event.showGuests == 1 ? "Your name may be visible to anyone with the link. Your email is only visible to the host and email provider." : "Your name and email are visible to the host. Other guests cannot see your email.").font(.footnote).foregroundStyle(Brand.muted)
                TextField("Your name or nickname", text: $name).textContentType(.givenName).textFieldStyle(.roundedBorder)
                TextField("Your email", text: $email).textContentType(.emailAddress).keyboardType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled().textFieldStyle(.roundedBorder)
            }
            Picker("Your response", selection: $response) {
                Text("I’m in").tag("accepted"); Text("Maybe").tag("maybe")
                if envelope.guest != nil { Text("Can’t go").tag("declined") }
            }.pickerStyle(.segmented)
            if envelope.event.plusOne == 1 && response != "declined" { Toggle("Bring a plus-one", isOn: $plusOne) }
            Button(busy ? "Saving…" : envelope.guest == nil ? "Send my RSVP" : "Save my response") { Task { await respond() } }
                .buttonStyle(PrimaryButton()).disabled(busy || loading || (envelope.guest == nil && (name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !email.contains("@"))))
        }
    }
    private func load(exchange: Bool) async {
        guard !loading else { return }; loading = true; error = nil; defer { loading = false }
        do {
            if exchange, let exchanged = try await store.api.exchange(route) { invitationID = exchanged }
            else if invitationID == nil { invitationID = route.invitationID ?? SessionVault.shared.context(route.slug) }
            let result = try await store.api.invitation(slug: route.slug, invitationID: invitationID)
            guard !Task.isCancelled else { return }
            if invitationID != nil && result.guest == nil {
                accessExpired = true
                throw CoreError.service("Your personal access has expired. Reopen the personal link from your email or ask your host for a new link.")
            }
            accessExpired = false; envelope = result
            response = ["accepted", "maybe", "declined"].contains(result.rsvp?.status ?? "") ? result.rsvp!.status : "accepted"
            plusOne = result.rsvp?.partySize == 2
            if email.isEmpty { email = result.guest?.email ?? "" }
            saveAccessAndIndex(result)
        } catch { if !Task.isCancelled { self.error = error.localizedDescription } }
    }
    private func saveAccessAndIndex(_ envelope: InvitationEnvelope) {
        do {
            if let guest = envelope.guest { invitationID = guest.invitationId; try SessionVault.shared.setContext(guest.invitationId, slug: route.slug) }
            try SessionVault.shared.captureCookies()
        } catch { localNotice = error.localizedDescription }
        if !store.remember(envelope) { localNotice = "The invitation is open, but this device could not save it to Invites. \(store.error ?? "")"; store.error = nil }
    }
    private func respond() async {
        guard let previous = envelope else { return }; busy = true; error = nil; defer { busy = false }
        do {
            let result: RSVPResult
            var guest = previous.guest
            if let guest {
                result = try await store.api.respond(eventID: previous.event.id, invitationID: guest.invitationId, status: response, partySize: response == "declined" ? 1 : plusOne ? 2 : 1)
            } else {
                let token = try SessionVault.shared.joinToken(previous.event.id)
                result = try await store.api.join(eventID: previous.event.id, name: String(name.trimmingCharacters(in: .whitespacesAndNewlines).prefix(80)), email: email.trimmingCharacters(in: .whitespacesAndNewlines), token: token, status: response, partySize: plusOne ? 2 : 1)
                guard let joined = result.invitationId else { throw CoreError.service("Reopen your invitation to check your saved response.") }
                guest = InvitationGuest(invitationId: joined, name: name.trimmingCharacters(in: .whitespacesAndNewlines), email: email.trimmingCharacters(in: .whitespacesAndNewlines))
            }
            // The returned RSVP is authoritative, including waitlist decisions. Display it
            // before refreshing details, so a failed refresh cannot erase a saved response.
            let saved = previous.applying(result, guest: guest)
            envelope = saved; changingResponse = false; saveAccessAndIndex(saved)
            await load(exchange: false)
        } catch {
            self.error = error is URLError || error is DecodingError ? "Your response may already be saved. Refresh to check before trying again. \(error.localizedDescription)" : error.localizedDescription
        }
    }
    private func sendReceipt() async {
        guard let current = envelope, let guest = current.guest else { return }
        sendingReceipt = true; error = nil; defer { sendingReceipt = false }
        do {
            let confirmation = try await store.api.requestConfirmation(eventID: current.event.id, invitationID: guest.invitationId, email: email.trimmingCharacters(in: .whitespacesAndNewlines))
            envelope = current.withConfirmation(confirmation)
        } catch { self.error = "Your RSVP is still saved. \(error.localizedDescription)" }
    }

}
func responseLabel(_ status: String) -> String {
    switch status { case "accepted": return "You’re in"; case "maybe": return "Maybe"; case "declined": return "Not going"; case "waitlisted": return "On the waitlist"; default: return "No response yet" }
}
func receiptMessage(_ status: String) -> String {
    switch status {
    case "sent": return "Your RSVP email is on its way. Check your inbox or spam folder."
    case "delivered": return "Your email service accepted your RSVP email. Check your inbox or spam folder."
    case "queued": return "Your RSVP is saved. The confirmation email is queued."
    case "development": return "This is a test invitation. No real email was sent."
    case "limited": return "Your RSVP is saved. The email limit has been reached; try again later."
    case "failed", "suppressed", "bounced", "complained": return "Your RSVP is saved, but the email could not be delivered. Ask your host for help."
    default: return ""
    }
}
private func mapURL(_ venue: String) -> URL? {
    var components = URLComponents(string: "https://maps.apple.com/")
    components?.queryItems = [.init(name: "q", value: venue)]
    return components?.url
}
