import SwiftUI
import GoodPlansCore

struct PlansView: View {
    @Environment(AppStore.self) private var store
    @State private var editing: LocalPlan?
    @State private var openingLink = false
    @State private var filter = "All"
    private var plans: [LocalPlan] {
        store.workspace.plans.filter { plan in
            filter == "All" || (filter == "Still planning" ? plan.startsAt == nil : (plan.endsAt ?? plan.startsAt ?? .distantPast) >= Date())
        }.sorted { ($0.startsAt ?? .distantFuture) < ($1.startsAt ?? .distantFuture) }
    }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("TIME WELL SPENT").font(.caption.weight(.semibold)).tracking(2)
                        Text("A little time\ntogether.").font(.system(.largeTitle, design: .serif, weight: .bold))
                    }
                    Spacer()
                    Image("BrandMark").resizable().scaledToFit().frame(width: 100, height: 100).accessibilityHidden(true)
                }
                Picker("Show plans", selection: $filter) {
                    Text("All").tag("All"); Text("Upcoming").tag("Upcoming"); Text("Still planning").tag("Still planning")
                }.pickerStyle(.segmented)
                if plans.isEmpty {
                    PaperCard {
                        EmptyPaper(title: store.workspace.plans.isEmpty ? "Make room for your people." : "Nothing here just yet.",
                                   detail: "A coffee, a class, a dinner with someone you miss. Start with one small plan.", symbol: "calendar.badge.plus")
                        Button("Make a plan", systemImage: "plus") { editing = LocalPlan() }.buttonStyle(PrimaryButton())
                    }
                }
                ForEach(plans) { plan in
                    NavigationLink(value: plan.id) {
                        PaperCard {
                            VStack(alignment: .leading, spacing: 12) {
                                Text(plan.remoteID == nil ? "YOUR PRIVATE DRAFT" : "YOUR SAVED PLAN").font(.caption.weight(.semibold)).tracking(1).foregroundStyle(Brand.coral)
                                Text(plan.title).font(.system(.title2, design: .serif, weight: .semibold))
                                Label(dateLabel(plan.startsAt), systemImage: "calendar").font(.subheadline)
                                if !plan.venue.isEmpty { Label(plan.venue, systemImage: "mappin.and.ellipse").font(.subheadline) }
                                let names = store.workspace.people.filter { plan.personIDs.contains($0.id) }.map(\.name)
                                if !names.isEmpty { Label(names.joined(separator: ", "), systemImage: "person.2").font(.subheadline).foregroundStyle(Brand.muted) }
                            }
                        }
                    }.buttonStyle(.plain)
                }
                Button("Have an invitation link?", systemImage: "link") { openingLink = true }.frame(minHeight: 44)
                Text("Your drafts stay on this device. Sharing and publishing are separate choices.").font(.footnote).foregroundStyle(Brand.muted)
            }.padding(20)
        }.paperScreen().navigationTitle("My plans").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .primaryAction) { Button("New plan", systemImage: "plus") { editing = LocalPlan() } } }
            .sheet(item: $editing) { PlanEditor(initial: $0, onSave: { store.showPlan($0) }).environment(store) }
            .sheet(isPresented: $openingLink) { OpenInvitationSheet().environment(store) }
    }
}

struct PlanEditor: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let initial: LocalPlan
    let onSave: ((UUID) -> Void)?
    @State private var plan: LocalPlan
    @State private var hasDate: Bool
    @State private var start: Date
    @State private var end: Date
    @State private var newFriend = ""
    @State private var notesExpanded: Bool
    @State private var invitationExpanded: Bool
    @State private var discard = false
    @State private var error: String?
    init(initial: LocalPlan, onSave: ((UUID) -> Void)? = nil) {
        self.initial = initial; self.onSave = onSave
        _plan = State(initialValue: initial); _hasDate = State(initialValue: initial.startsAt != nil)
        let start = initial.startsAt ?? Date().addingTimeInterval(86400)
        _start = State(initialValue: start); _end = State(initialValue: initial.endsAt ?? start.addingTimeInterval(7200))
        _notesExpanded = State(initialValue: !initial.notes.isEmpty || !initial.bookingURL.isEmpty)
        _invitationExpanded = State(initialValue: !initial.hostName.isEmpty || initial.openInvitation)
    }
    private var changed: Bool {
        plan != initial || hasDate != (initial.startsAt != nil) ||
        (hasDate && (start != initial.startsAt || end != initial.endsAt)) || !newFriend.isEmpty
    }
    private var isNew: Bool { !store.workspace.plans.contains { $0.id == plan.id } }
    var body: some View {
        NavigationStack {
            Form {
                if let error { Section { Label(error, systemImage: "exclamationmark.circle").foregroundStyle(Brand.coral).accessibilityIdentifier("plan-error") } }
                Section("The plan") {
                    TextField("Give it a name", text: $plan.title).textInputAutocapitalization(.sentences).accessibilityIdentifier("plan-title")
                    TextField("Where are we meeting?", text: $plan.venue)
                    Toggle("Choose a date", isOn: $hasDate)
                    if hasDate {
                        DatePicker("Starts", selection: $start)
                            .onChange(of: start) { old, next in end = end.addingTimeInterval(next.timeIntervalSince(old)) }
                        DatePicker("Ends", selection: $end)
                        Text(plan.sourceEndUnknown ? "The organiser hasn’t supplied an end time. Choose a planning window for your group." : "Times in Dublin. You can decide the date later.").font(.footnote).foregroundStyle(Brand.muted)
                    }
                }
                Section {
                    ForEach(store.workspace.people) { person in
                        Toggle(person.name, isOn: Binding(get: { plan.personIDs.contains(person.id) }, set: { selected in
                            if selected && !plan.personIDs.contains(person.id) { plan.personIDs.append(person.id) }
                            else if !selected { plan.personIDs.removeAll { $0 == person.id } }
                        }))
                    }
                    HStack {
                        TextField("Add a friend’s first name", text: $newFriend).textContentType(.givenName).submitLabel(.done).onSubmit(addFriend)
                        Button("Add and select friend", systemImage: "plus.circle.fill", action: addFriend)
                            .labelStyle(.iconOnly).frame(minWidth: 44, minHeight: 44).disabled(newFriend.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                } header: { Text("Who’s coming?") } footer: { Text("New friends are saved in My people on this device. No contact-book access needed.") }
                Section {
                    DisclosureGroup("Notes & tickets", isExpanded: $notesExpanded) {
                        TextField("Notes, travel or what to bring", text: $plan.notes, axis: .vertical).lineLimit(3...8)
                        TextField("Ticket or booking link (optional)", text: $plan.bookingURL).keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                        if !plan.bookingURL.isEmpty { Text("Joining your group does not buy or reserve tickets.").font(.footnote).foregroundStyle(Brand.muted) }
                    }
                }
                Section {
                    DisclosureGroup("Invitation options", isExpanded: $invitationExpanded) {
                        TextField("Your name on the invitation", text: $plan.hostName).textContentType(.givenName)
                        Toggle("Open invitation", isOn: $plan.openInvitation)
                        Text(plan.openInvitation ? "Anyone with the shared link can join after you publish. Their names stay private." : "Each friend gets a personal invitation link after publishing. Keep those links private.").font(.footnote).foregroundStyle(Brand.muted)
                        Stepper("Group limit: \(plan.capacity)", value: $plan.capacity, in: 1...500)
                        Toggle("Allow a plus-one", isOn: $plan.plusOne)
                    }
                } footer: { Text("Save privately first. Publish an RSVP invitation when you’re ready; publishing needs an approved host account.") }
            }.scrollContentBackground(.hidden).paperScreen().scrollDismissesKeyboard(.interactively)
                .environment(\.timeZone, TimeZone(identifier: "Europe/Dublin")!)
                .navigationTitle(isNew ? "Make a plan" : "Edit your plan").navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { if changed { discard = true } else { dismiss() } } } }
                .safeAreaInset(edge: .bottom) {
                    Button(isNew ? "Save plan" : "Save changes", systemImage: "checkmark", action: save)
                        .buttonStyle(PrimaryButton()).padding(.horizontal, 20).padding(.vertical, 12).background(Brand.paper)
                }
                .interactiveDismissDisabled(changed)
                .confirmationDialog("Discard these changes?", isPresented: $discard, titleVisibility: .visible) {
                    Button("Discard changes", role: .destructive) { dismiss() }
                    Button("Keep editing", role: .cancel) { }
                } message: { Text("Your previous saved plan stays as it was. Friends you already added remain in My people.") }
        }
    }
    private func addFriend() {
        if let person = store.addPerson(named: newFriend) {
            if !plan.personIDs.contains(person.id) { plan.personIDs.append(person.id) }
            newFriend = ""; error = nil
        } else { error = store.error; store.error = nil }
    }
    private func save() {
        if !newFriend.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { addFriend(); if error != nil { return } }
        plan.title = String(plan.title.trimmingCharacters(in: .whitespacesAndNewlines).prefix(120))
        plan.bookingURL = plan.bookingURL.trimmingCharacters(in: .whitespacesAndNewlines)
        plan.startsAt = hasDate ? start : nil; plan.endsAt = hasDate ? end : nil
        if let message = plan.validation() { error = message; notesExpanded = !plan.bookingURL.isEmpty; return }
        if store.save(plan) { dismiss(); onSave?(plan.id) }
        else { error = store.error; store.error = nil }
    }
}

struct PlanDetailView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let planID: UUID
    @State private var editing: LocalPlan?
    @State private var publishing = false
    @State private var showPublish = false
    @State private var showSignIn = false
    @State private var remove = false
    @State private var calendar: CalendarDraft?
    @State private var error: String?
    private var plan: LocalPlan? { store.workspace.plans.first { $0.id == planID } }
    var body: some View {
        ScrollView {
            if let plan {
                VStack(alignment: .leading, spacing: 22) {
                    Image("GatheringCollage").resizable().scaledToFit().frame(maxHeight: 170).frame(maxWidth: .infinity).background(Brand.paper, in: RoundedRectangle(cornerRadius: 18)).accessibilityHidden(true)
                    Text(plan.remoteID == nil ? "A PLAN TAKING SHAPE" : "TIME TOGETHER").font(.caption.weight(.semibold)).tracking(2).foregroundStyle(Brand.coral)
                    Text(plan.title).font(.system(.largeTitle, design: .serif, weight: .bold))
                    Text(plan.hostName.isEmpty ? "A little time with your people." : "\(plan.hostName) is inviting you.").font(.title3)
                    PaperCard {
                        VStack(alignment: .leading, spacing: 14) {
                            Label(dateLabel(plan.startsAt), systemImage: "calendar")
                            if !plan.venue.isEmpty { Label(plan.venue, systemImage: "mappin.and.ellipse") }
                            let names = store.workspace.people.filter { plan.personIDs.contains($0.id) }.map(\.name)
                            Label(names.isEmpty ? "Choose your people when you’re ready" : names.joined(separator: ", "), systemImage: "person.2")
                            if plan.sourceEndUnknown { Text("Your end time is a group planning window. Confirm the original event’s finishing time.").font(.footnote).foregroundStyle(Brand.muted) }
                        }
                    }
                    if !plan.notes.isEmpty { Text(plan.notes).textSelection(.enabled) }
                    if SafeLinks.isPublicHTTPS(plan.bookingURL), let url = URL(string: plan.bookingURL) {
                        Link("Tickets & original details ↗", destination: url).font(.headline).frame(minHeight: 44)
                        Text("Joining your group does not buy or reserve a ticket.").font(.footnote).foregroundStyle(Brand.muted)
                    }
                    if plan.startsAt != nil { Button("Add to Calendar", systemImage: "calendar.badge.plus") { calendar = CalendarDraft(plan: plan) }.frame(minHeight: 44) }
                    if plan.remoteID == nil {
                        ShareLink(item: plan.invitationText(people: store.workspace.people)) { Label("Share planning message", systemImage: "square.and.arrow.up") }.frame(minHeight: 44)
                        Text("A planning message does not collect RSVPs. Publish an invitation below for Going / Maybe replies.").font(.footnote).foregroundStyle(Brand.muted)
                        Button(publishing ? "Publishing…" : "Publish RSVP invitation", systemImage: "paperplane") {
                            if store.user == nil { showSignIn = true } else { showPublish = true }
                        }.buttonStyle(PrimaryButton()).disabled(publishing)
                    } else {
                        if plan.openInvitation, let slug = plan.slug {
                            ShareLink(item: SafeLinks.origin.appendingPathComponent("events/\(slug)")) { Label("Share open invitation", systemImage: "square.and.arrow.up") }.frame(minHeight: 44)
                        } else if plan.hostAccountID == store.user?.id, store.user != nil {
                            ForEach(SessionVault.shared.invites(plan.id)) { invite in
                                if let url = URL(string: invite.inviteUrl) { ShareLink(item: url) { Label("Invitation for \(invite.guestName)", systemImage: "envelope") }.frame(minHeight: 44) }
                            }
                        }
                        Link("Manage published event & guests ↗", destination: SafeLinks.origin.appending(queryItems: [.init(name: "view", value: "host")])).frame(minHeight: 44)
                        Text("Edits to this local copy do not update the published event. Manage that event in the organiser portal.").font(.footnote).foregroundStyle(Brand.muted)
                    }
                    if let error { Text(error).foregroundStyle(Brand.coral) }
                }.padding(20)
            }
        }.paperScreen().navigationTitle("Your plan").navigationBarTitleDisplayMode(.inline)
            .toolbar { if let plan { Menu("Plan options", systemImage: "ellipsis.circle") {
                Button(plan.remoteID == nil ? "Edit plan" : "Edit local copy") { editing = plan }
                Button("Remove local copy", role: .destructive) { remove = true }
            } } }
            .sheet(item: $editing) { PlanEditor(initial: $0).environment(store) }
            .sheet(isPresented: $showSignIn) { SignInView().environment(store) }
            .sheet(item: $calendar) { CalendarEditor(draft: $0) }
            .confirmationDialog("Remove this plan from this device?", isPresented: $remove, titleVisibility: .visible) {
                Button("Remove local copy", role: .destructive) { if let plan { store.remove(plan); dismiss() } }
            } message: { Text("Published events and their guests are not cancelled or removed.") }
            .confirmationDialog("Publish this invitation?", isPresented: $showPublish, titleVisibility: .visible) {
                Button("Publish invitation") { Task { await publish() } }
            } message: { Text("The title, date, venue and plan notes will be sent to Us & About. Selected friends’ names are included for private invitations. Their private preferences and notes stay on your device. No invitation emails are sent by this action.") }
    }
    private func publish() async {
        guard var plan, let user = store.user else { return }
        guard !plan.hostName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { error = "Edit your plan and add your name on the invitation."; return }
        guard plan.openInvitation || !plan.personIDs.isEmpty else { error = "Choose a friend for a private invitation, or choose an open invitation."; return }
        publishing = true; error = nil; defer { publishing = false }
        do {
            let event = try await store.api.publish(plan, people: store.workspace.people)
            try SessionVault.shared.captureCookies()
            try SessionVault.shared.saveInvites(event.inviteLinks ?? [], draftID: plan.id)
            plan.remoteID = event.id; plan.slug = event.slug; plan.hostAccountID = user.id
            guard store.save(plan) else { return }
            await store.refreshHosted()
        } catch { self.error = error.localizedDescription }
    }
}

struct PeopleView: View {
    @Environment(AppStore.self) private var store
    @State private var editing: Person?
    @State private var planning: LocalPlan?
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Your people,\nin the picture.").font(.system(.largeTitle, design: .serif, weight: .bold))
                Text("Save a first name and the little things that make a plan feel right. These details stay on this device.").foregroundStyle(Brand.muted)
                if store.workspace.people.isEmpty {
                    PaperCard {
                        EmptyPaper(title: "Start with one friend.", detail: "No contact-book access needed. Add the people you want to make time for.", symbol: "person.crop.circle.badge.plus")
                        Button("Add your first person") { editing = Person() }.buttonStyle(PrimaryButton())
                    }
                }
                ForEach(store.workspace.people) { person in
                    PaperCard {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text(String(person.name.prefix(1))).font(.title2.weight(.semibold)).frame(width: 48, height: 48).background(Brand.pink, in: Circle()).accessibilityHidden(true)
                                Text(person.name).font(.system(.title2, design: .serif, weight: .semibold))
                                Spacer()
                                Button("Edit \(person.name)", systemImage: "pencil") { editing = person }.labelStyle(.iconOnly).frame(minWidth: 44, minHeight: 44)
                            }
                            if !person.interests.isEmpty { Text(person.interests).foregroundStyle(Brand.muted) }
                            Button("Make a plan with \(person.name)", systemImage: "plus") { planning = LocalPlan(personIDs: [person.id]) }.frame(minHeight: 44)
                        }
                    }
                }
            }.padding(20)
        }.paperScreen().navigationTitle("My people").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .primaryAction) { Button("Add person", systemImage: "plus") { editing = Person() } } }
            .sheet(item: $editing) { PersonEditor(initial: $0).environment(store) }
            .sheet(item: $planning) { PlanEditor(initial: $0, onSave: { store.showPlan($0) }).environment(store) }
    }
}
struct PersonEditor: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var person: Person
    @State private var deleting = false
    @State private var error: String?
    init(initial: Person) { _person = State(initialValue: initial) }
    var body: some View {
        NavigationStack {
            Form {
                if let error { Section { Label(error, systemImage: "exclamationmark.circle").foregroundStyle(Brand.coral) } }
                Section("Your person") { TextField("First name or nickname", text: $person.name).textContentType(.givenName) }
                Section("What makes a good plan?") {
                    TextField("Interests — coffee, dance, galleries…", text: $person.interests, axis: .vertical)
                    TextField("Anything useful to remember", text: $person.notes, axis: .vertical).lineLimit(3...6)
                }
                Section { Text("Private on this device. Avoid sensitive information about someone without their permission.").font(.footnote).foregroundStyle(Brand.muted) }
                if store.workspace.people.contains(where: { $0.id == person.id }) {
                    Section { Button("Remove person", role: .destructive) { deleting = true } }
                }
            }.scrollContentBackground(.hidden).paperScreen().navigationTitle("Your person").navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) { Button("Save") { if store.save(person) { dismiss() } else { error = store.error; store.error = nil } }.disabled(person.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) }
                }
                .confirmationDialog("Remove \(person.name) from this device?", isPresented: $deleting, titleVisibility: .visible) {
                    Button("Remove person", role: .destructive) { store.remove(person); dismiss() }
                } message: { Text("They will be removed from local draft selections. Published guest lists are not changed.") }
        }
    }
}
