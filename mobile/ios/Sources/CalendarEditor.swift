import SwiftUI
import EventKit
import EventKitUI
import GoodPlansCore

struct CalendarDraft: Identifiable {
    let id = UUID()
    let title: String
    let start: Date
    let end: Date?
    let notes: String
    let venue: String
    let bookingURL: String?
    init(plan: LocalPlan) {
        title = plan.title; start = plan.startsAt ?? Date(); end = plan.endsAt; venue = plan.venue
        notes = plan.notes + "\n\nThis is a saved calendar copy. Check your invitation for changes."
        bookingURL = plan.bookingURL
    }
    init(title: String, start: Date, end: Date?, notes: String, bookingURL: String?, venue: String = "") {
        self.title = title; self.start = start; self.end = end; self.notes = notes; self.bookingURL = bookingURL; self.venue = venue
    }
}
struct CalendarEditor: UIViewControllerRepresentable {
    @Environment(\.dismiss) private var dismiss
    let draft: CalendarDraft
    func makeCoordinator() -> Coordinator { Coordinator { dismiss() } }
    func makeUIViewController(context: Context) -> EKEventEditViewController {
        // iOS 17+ EventKitUI lets the person review/save an event without giving
        // this application read access to the rest of their calendar.
        let controller = EKEventEditViewController(), store = EKEventStore()
        controller.eventStore = store; controller.editViewDelegate = context.coordinator
        let event = EKEvent(eventStore: store)
        event.title = draft.title; event.startDate = draft.start; event.endDate = draft.end ?? draft.start.addingTimeInterval(3600)
        event.notes = draft.notes
        event.location = draft.venue
        if let text = draft.bookingURL, SafeLinks.isPublicHTTPS(text) { event.url = URL(string: text) }
        controller.event = event
        return controller
    }
    func updateUIViewController(_ uiViewController: EKEventEditViewController, context: Context) {}
    final class Coordinator: NSObject, EKEventEditViewDelegate {
        let close: () -> Void
        init(close: @escaping () -> Void) { self.close = close }
        func eventEditViewController(_ controller: EKEventEditViewController, didCompleteWith action: EKEventEditViewAction) { close() }
    }
}
