import SwiftUI
import GoodPlansCore

struct DiscoverView: View {
    @Environment(AppStore.self) private var store
    @State private var query = ""
    @State private var category = "All"
    @State private var editing: LocalPlan?
    private var categories: [String] { ["All"] + Array(Set(store.events.map(\.category))).sorted() }
    private var filtered: [DiscoveryEvent] {
        store.events.filter { event in
            (category == "All" || event.category == category) && (query.isEmpty || "\(event.title) \(event.venue)".localizedCaseInsensitiveContains(query))
        }
    }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Let the city\njoin the plan.").font(.system(.largeTitle, design: .serif, weight: .bold))
                Text("Reviewed ideas for the next two weeks in Dublin. Bring a friend, your partner, or whoever makes it a good day.").foregroundStyle(Brand.muted)
                Picker("Event category", selection: $category) { ForEach(categories, id: \.self) { Text($0).tag($0) } }.pickerStyle(.menu)
                if store.discoveryLoading && store.events.isEmpty { ProgressView("Finding the latest picks…").frame(maxWidth: .infinity).padding(32) }
                if let error = store.discoveryError {
                    PaperCard {
                        Text("Couldn’t refresh Dublin picks.").font(.headline)
                        Text(error).foregroundStyle(Brand.muted).padding(.vertical, 8)
                        Button("Try again") { Task { await store.refreshDiscovery() } }.frame(minHeight: 44)
                    }
                } else if !store.discoveryLoading && filtered.isEmpty {
                    PaperCard {
                        EmptyPaper(title: store.events.isEmpty ? "A little space for a new plan." : "No picks match just yet.",
                                   detail: store.events.isEmpty ? "No reviewed events are listed for the next two weeks right now. You can still make your own plan or check the city’s programme." : "Try another search or category.", symbol: "map")
                        Link("Explore Dublin.ie ↗", destination: URL(string: "https://dublin.ie/whats-on/")!).frame(minHeight: 44)
                    }
                }
                ForEach(filtered) { event in
                    PaperCard {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(event.category.uppercased()).font(.caption.weight(.semibold)).tracking(1).foregroundStyle(Brand.coral)
                            Text(event.title).font(.system(.title2, design: .serif, weight: .semibold))
                            Label(dateLabel(PlanDate.parse(event.startsAt)), systemImage: "calendar").font(.subheadline)
                            Label(event.venue, systemImage: "mappin.and.ellipse").font(.subheadline)
                            Text(event.price).font(.subheadline.weight(.semibold))
                            if event.childcare == "provided", let link = event.careUrl, SafeLinks.isPublicHTTPS(link), let url = URL(string: link) {
                                Link("Childcare listed by organiser — check details ↗", destination: url)
                                Text("Confirm ages, costs and availability before booking.").font(.footnote).foregroundStyle(Brand.muted)
                            } else if event.childrenWelcome == "yes" {
                                Text("Children welcome. This does not mean childcare is provided.").font(.footnote).foregroundStyle(Brand.muted)
                            }
                            Button("Make it a plan", systemImage: "plus") {
                                editing = store.workspace.plans.first(where: { $0.sourceID == event.id }) ?? event.draft()
                            }.buttonStyle(PrimaryButton())
                            if SafeLinks.isPublicHTTPS(event.url), let url = URL(string: event.url) { Link("Original details & tickets ↗", destination: url).frame(minHeight: 44) }
                        }
                    }
                }
                Text("Adding a plan does not book a place or reserve tickets. Check the original organiser for changes.").font(.footnote).foregroundStyle(Brand.muted)
            }.padding(20)
        }.paperScreen().navigationTitle("Dublin ideas").navigationBarTitleDisplayMode(.inline)
            .searchable(text: $query, prompt: "An activity, a venue, a little inspiration")
            .refreshable { await store.refreshDiscovery() }
            .task { await store.refreshDiscovery() }
            .sheet(item: $editing) { PlanEditor(initial: $0, onSave: { store.showPlan($0) }).environment(store) }
    }
}
