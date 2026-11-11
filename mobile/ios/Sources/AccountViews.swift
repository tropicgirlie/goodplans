import SwiftUI
import UniformTypeIdentifiers
import GoodPlansCore

struct PlanningBackup: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data
    init(workspace: Workspace) throws {
        let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601; encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        data = try encoder.encode(workspace)
    }
    init(configuration: ReadConfiguration) throws { data = configuration.file.regularFileContents ?? Data() }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) }
}
struct AccountView: View {
    @Environment(AppStore.self) private var store
    @State private var signingIn = false
    @State private var signOut = false
    @State private var signingOut = false
    @State private var backup: PlanningBackup?
    @State private var exporting = false
    @State private var importing = false
    @State private var pendingImport: Workspace?
    @State private var confirmImport = false
    @State private var status: String?
    var body: some View {
        Form {
            Section {
                HStack(spacing: 16) {
                    Image("BrandMark").resizable().scaledToFit().frame(width: 72, height: 72).accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Us & About").font(.system(.title2, design: .serif, weight: .bold))
                        Text("Time well spent.").foregroundStyle(Brand.muted)
                        Text("iPhone preview · Dublin").font(.caption).foregroundStyle(Brand.muted)
                    }
                }
            }
            Section {
                if let user = store.user {
                    Label(user.email, systemImage: "person.crop.circle")
                    Button(signingOut ? "Signing out…" : "Sign out") { signOut = true }.disabled(signingOut)
                } else {
                    Button("Sign in as a host", systemImage: "envelope") { signingIn = true }
                    Text("Hosting is currently available to approved accounts. Planning and people work without an account.").font(.footnote).foregroundStyle(Brand.muted)
                }
                if let error = store.hostError { Text(error).foregroundStyle(Brand.coral) }
            } header: { Text("Your account") } footer: { Text("Signing in does not upload or sync your people, preferences or local drafts.") }
            if store.user != nil {
                Section("Your hosted events") {
                    if store.hostLoading { ProgressView("Refreshing your events…") }
                    else if store.hosted.isEmpty { Text("No hosted events yet. Publish an RSVP invitation from one of your saved plans.").foregroundStyle(Brand.muted) }
                    ForEach(store.hosted) { event in
                        if let route = try? InvitationRoute(url: SafeLinks.origin.appendingPathComponent("events/\(event.slug)")) {
                            NavigationLink { InvitationView(route: route) } label: {
                                VStack(alignment: .leading, spacing: 6) { Text(event.title); Text("\(dateLabel(PlanDate.parse(event.startsAt))) · \(event.status)").font(.footnote).foregroundStyle(Brand.muted) }
                            }
                        }
                    }
                    Button("Refresh hosted events") { Task { await store.refreshHosted() } }
                    Link("Organiser portal ↗", destination: SafeLinks.origin.appending(queryItems: [.init(name: "view", value: "host")]))
                    Text("The web portal manages series, guest emails and changes. It may ask you to sign in separately.").font(.footnote).foregroundStyle(Brand.muted)
                }
            }
            Section {
                Label("Saved on this device", systemImage: "iphone")
                Text("Plans and people are available offline. Website drafts remain in their browser; this preview does not transfer them automatically.").font(.footnote).foregroundStyle(Brand.muted)
                Button("Export app backup", systemImage: "square.and.arrow.up") {
                    do { backup = try PlanningBackup(workspace: store.workspace); exporting = true }
                    catch { store.error = error.localizedDescription }
                }
                Button("Restore app backup", systemImage: "square.and.arrow.down") { importing = true }
            } header: { Text("Your planning data") } footer: { Text("Backups contain your plans and private friend notes. Keep them private. Account sessions and personal invitation access links are excluded.") }
            Section("Help & privacy") {
                Link("Help & data requests ↗", destination: SafeLinks.origin.appending(queryItems: [.init(name: "page", value: "support")]))
                Link("How we use your data ↗", destination: SafeLinks.origin.appending(queryItems: [.init(name: "page", value: "privacy")]))
                Text("Hosted account deletion is handled through verified support requests in this preview. Removing the app removes its local planning file; it does not delete hosted events or an account.").font(.footnote).foregroundStyle(Brand.muted)
            }
            if let status { Section { Text(status).font(.footnote).foregroundStyle(Brand.muted) } }
        }.scrollContentBackground(.hidden).paperScreen().navigationTitle("A little about you")
            .sheet(isPresented: $signingIn) { SignInView().environment(store) }
            .confirmationDialog("Sign out of hosting?", isPresented: $signOut, titleVisibility: .visible) {
                Button("Sign out") { Task {
                    signingOut = true; defer { signingOut = false }
                    do { try await store.api.logout(); try SessionVault.shared.captureCookies(); store.user = nil; store.hosted = [] }
                    catch { store.error = error.localizedDescription }
                } }
            } message: { Text("Local plans and people stay on this device. They are not deleted or uploaded.") }
            .fileExporter(isPresented: $exporting, document: backup, contentType: .json, defaultFilename: "good-plans-app-backup") { result in
                if case .failure(let error) = result { store.error = error.localizedDescription }
            }
            .fileImporter(isPresented: $importing, allowedContentTypes: [.json]) { result in
                do {
                    let url = try result.get(); let scoped = url.startAccessingSecurityScopedResource(); defer { if scoped { url.stopAccessingSecurityScopedResource() } }
                    pendingImport = try WorkspaceFile.decode(Data(contentsOf: url)); confirmImport = true
                } catch { store.error = error.localizedDescription }
            }
            .confirmationDialog("Replace this device’s plans and people?", isPresented: $confirmImport, titleVisibility: .visible) {
                Button("Replace from backup", role: .destructive) { if let next = pendingImport, store.persist(next) { status = "Your app backup was restored." }; pendingImport = nil }
                Button("Cancel", role: .cancel) { pendingImport = nil }
            } message: { Text("This replaces local planning data. It does not change hosted events. Export a backup first if you want to keep the current version.") }
    }
}

struct SignInView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var code = ""
    @State private var sent = false
    @State private var busy = false
    @State private var error: String?
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("A good host\nstarts here.").font(.system(.largeTitle, design: .serif, weight: .bold)).padding(.vertical, 16)
                    Text("Your plans and people stay on this device. Sign in when you’re ready to publish an invitation.").foregroundStyle(Brand.muted)
                    if !sent {
                        TextField("Your approved host email", text: $email).keyboardType(.emailAddress).textContentType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled()
                    } else {
                        Text("If \(email) is an approved host, a six-digit code is on its way. It expires in five minutes.").font(.subheadline)
                        TextField("Verification code", text: $code).keyboardType(.numberPad).textContentType(.oneTimeCode)
                            .onChange(of: code) { _, value in code = String(value.filter(\.isNumber).prefix(6)) }
                    }
                    Button(busy ? "Please wait…" : sent ? "Verify and sign in" : "Send sign-in code") { Task { await submit() } }
                        .disabled(busy || (sent ? code.count != 6 : !email.contains("@")))
                    if sent { Button("Use another email or request a new code") { sent = false; code = ""; error = nil }.disabled(busy) }
                    if let error { Text(error).foregroundStyle(Brand.coral) }
                } footer: { Text("No password is needed. Sign-in does not subscribe you to a newsletter or enable account sync.") }
            }.scrollContentBackground(.hidden).paperScreen().navigationTitle("Host sign-in").navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Close") { dismiss() } } }
        }
    }
    private func submit() async {
        busy = true; error = nil; defer { busy = false }
        do {
            if !sent { email = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased(); try await store.api.requestCode(email: email); sent = true }
            else {
                store.user = try await store.api.verify(email: email, code: code)
                try SessionVault.shared.captureCookies(); code = ""
                await store.refreshHosted(); dismiss()
            }
        } catch { self.error = error.localizedDescription }
    }
}
