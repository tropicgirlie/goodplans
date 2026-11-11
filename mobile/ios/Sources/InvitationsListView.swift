import SwiftUI
import GoodPlansCore

struct InvitationsView: View {
    @Environment(AppStore.self) private var store
    @State private var opening = false
    @State private var removing: SavedInvitation?
    private var invitations: [SavedInvitation] {
        store.workspace.invitations.sorted { $0.checkedAt > $1.checkedAt }
    }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("You’re on\nthe guest list.").font(.system(.largeTitle, design: .serif, weight: .bold))
                Text("Keep your invitations together. Open one to check the latest details or change your response.").foregroundStyle(Brand.muted)
                if invitations.isEmpty {
                    PaperCard {
                        EmptyPaper(title: "Something to look forward to.", detail: "Paste an invitation from your friends. It will stay here after you open it.", symbol: "envelope.open")
                        Button("Open an invitation", systemImage: "link") { opening = true }.buttonStyle(PrimaryButton())
                    }
                }
                ForEach(invitations) { invitation in
                    PaperCard {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 10) {
                                if let name = invitation.hostName, !name.isEmpty { Text("From \(name)").font(.subheadline).foregroundStyle(Brand.muted) }
                                Text(invitation.title).font(.system(.title2, design: .serif, weight: .semibold))
                                Label(dateLabel(PlanDate.parse(invitation.startsAt)), systemImage: "calendar").font(.subheadline)
                                Label(invitation.eventStatus == "cancelled" ? "Cancelled" : responseLabel(invitation.response ?? ""), systemImage: invitation.response == "accepted" ? "checkmark.circle.fill" : "envelope").font(.subheadline.weight(.semibold)).foregroundStyle(Brand.forest)
                                if let name = invitation.guestName { Text("Invitation for \(name)").font(.footnote).foregroundStyle(Brand.muted) }
                            }
                            Spacer(minLength: 0)
                            Menu("Invitation options", systemImage: "ellipsis") { Button("Remove from Invites", role: .destructive) { removing = invitation } }.frame(minWidth: 44, minHeight: 44)
                        }
                        Button("Open invitation", systemImage: "arrow.up.right") { store.openInvitation(invitation.url) }.frame(minHeight: 44)
                        Text("Last checked \(invitation.checkedAt.formatted(date: .abbreviated, time: .shortened)). Open to refresh.").font(.caption).foregroundStyle(Brand.muted)
                    }
                }
                if !invitations.isEmpty { Text("Saved on this device. If your private access expires, reopen the personal link from your email or ask your host.").font(.footnote).foregroundStyle(Brand.muted) }
            }.padding(20).frame(maxWidth: 720).frame(maxWidth: .infinity)
        }.paperScreen().navigationTitle("Invites").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .primaryAction) { Button("Open invitation", systemImage: "link") { opening = true } } }
            .sheet(isPresented: $opening) { OpenInvitationSheet().environment(store) }
            .confirmationDialog("Remove this invitation from this device?", isPresented: Binding(get: { removing != nil }, set: { if !$0 { removing = nil } }), titleVisibility: .visible) {
                Button("Remove from Invites", role: .destructive) { if let removing { store.forget(removing) }; removing = nil }
                Button("Keep invitation", role: .cancel) { removing = nil }
            } message: { Text("Your RSVP stays as it is. This does not cancel your place or delete anything from the host’s event.") }
    }
}

struct RSVPReceiptView: View {
    let status: String
    let confirmation: Confirmation?
    var body: some View {
        PaperCard {
            HStack(alignment: .center, spacing: 16) {
                Image("BrandMark").resizable().scaledToFit().frame(width: 62, height: 62).accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 6) {
                    Label(responseLabel(status), systemImage: status == "accepted" ? "checkmark.circle.fill" : "envelope.badge").font(.system(.title2, design: .serif, weight: .semibold)).foregroundStyle(Brand.forest)
                    Text(status == "waitlisted" ? "You don’t have a confirmed place yet." : status == "declined" ? "Your host has your updated response." : "Your response is saved with the host.").font(.subheadline)
                }
            }
            if let confirmation, !receiptMessage(confirmation.status).isEmpty { Text(receiptMessage(confirmation.status)).font(.footnote).foregroundStyle(Brand.muted) }
        }.accessibilityElement(children: .combine)
    }
}
