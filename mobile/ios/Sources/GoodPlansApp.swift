import SwiftUI
import GoodPlansCore

@main struct GoodPlansApp: App {
    @State private var store = AppStore()
    var body: some Scene {
        WindowGroup {
            RootView().environment(store).tint(Brand.ink).preferredColorScheme(.light)
                .onOpenURL { url in
                    if url.scheme == "goodplans-preview", let embedded = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?.first(where: { $0.name == "url" })?.value, let target = URL(string: embedded) { store.openInvitation(target) }
                    else { store.openInvitation(url) }
                }
        }
    }
}

enum Brand {
    static let paper = Color(red: 1, green: 0.972, blue: 0.907)
    static let cream = Color(red: 1, green: 0.94, blue: 0.79)
    static let ink = Color(red: 0.16, green: 0.14, blue: 0.12)
    static let coral = Color(red: 0.65, green: 0.24, blue: 0.17)
    static let pink = Color(red: 0.97, green: 0.61, blue: 0.77)
    static let muted = Color(red: 0.36, green: 0.32, blue: 0.28)
    static let forest = Color(red: 0.13, green: 0.32, blue: 0.25)
}
struct RootView: View {
    @Environment(AppStore.self) private var store
    var body: some View {
        @Bindable var store = store
        TabView(selection: $store.selectedTab) {
            NavigationStack(path: $store.planPath) { PlansView().navigationDestination(for: UUID.self) { PlanDetailView(planID: $0) } }.tabItem { Label("My plans", systemImage: "calendar") }.tag(AppStore.Tab.plans)
            NavigationStack { PeopleView() }.tabItem { Label("People", systemImage: "person.2") }.tag(AppStore.Tab.people)
            NavigationStack { InvitationsView() }.tabItem { Label("Invites", systemImage: "envelope") }.tag(AppStore.Tab.invitations)
            NavigationStack { DiscoverView() }.tabItem { Label("Dublin", systemImage: "sparkles") }.tag(AppStore.Tab.dublin)
            NavigationStack { AccountView() }.tabItem { Label("You", systemImage: "person.crop.circle") }.tag(AppStore.Tab.account)
        }
        .sheet(item: $store.invitation) { route in NavigationStack { InvitationView(route: route) }.environment(store) }
        .alert("A little help", isPresented: Binding(get: { store.error != nil }, set: { if !$0 { store.error = nil } })) {
            Button("OK") { store.error = nil }
        } message: { Text(store.error ?? "") }
        .task { await store.restoreAccount() }
    }
}
struct PaperCard<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: 16) { content }.frame(maxWidth: .infinity, alignment: .leading).padding(20)
            .background(Brand.paper, in: RoundedRectangle(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Brand.ink.opacity(0.8), lineWidth: 1.5))
    }
}
struct EmptyPaper: View {
    let title: String; let detail: String; let symbol: String
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: symbol).font(.system(size: 32, weight: .light)).foregroundStyle(Brand.coral)
            Text(title).font(.system(.title2, design: .serif, weight: .semibold)).multilineTextAlignment(.center)
            Text(detail).font(.body).foregroundStyle(Brand.muted).multilineTextAlignment(.center)
        }.frame(maxWidth: .infinity).padding(.vertical, 28).padding(.horizontal, 16)
    }
}
struct PrimaryButton: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).foregroundStyle(.white).frame(maxWidth: .infinity, minHeight: 48)
            .background(Brand.coral.opacity(configuration.isPressed ? 0.75 : 1), in: Capsule())
    }
}
extension View {
    func paperScreen() -> some View { self.background(Brand.cream.ignoresSafeArea()).foregroundStyle(Brand.ink) }
}
func dateLabel(_ date: Date?) -> String {
    guard let date else { return "Date to decide together" }
    let formatter = DateFormatter(); formatter.locale = Locale(identifier: "en_IE"); formatter.timeZone = TimeZone(identifier: "Europe/Dublin")
    formatter.dateFormat = "EEE d MMM · HH:mm"
    return formatter.string(from: date) + " · Dublin time"
}
