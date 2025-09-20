import SwiftUI
import Combine
import RoomPlan
import UIKit

// MARK: - Deep link router
final class DeepLinkRouter: ObservableObject {
    @Published var callbackURL: URL?
    @Published var projectType: String = "wall"

    func handle(url: URL) {
        guard url.scheme == "roomscan", url.host == "scan" else { return }
        let comps = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let q = comps?.queryItems ?? []
        if let cb = q.first(where: { $0.name == "cb" })?.value,
           let decoded = cb.removingPercentEncoding,
           let cbURL = URL(string: decoded) {
            callbackURL = cbURL
        }
        if let pt = q.first(where: { $0.name == "projectType" })?.value, !pt.isEmpty {
            projectType = pt
        }
    }
}

// MARK: - Main UI
// MARK: - Main UI
struct ContentView: View {
    @EnvironmentObject var router: DeepLinkRouter
    @State private var startScan = false

    var body: some View {
        VStack(spacing: 16) {
            Text("RoomPlan Wall Scanner").font(.title2).bold()
            Text("Project Type: \(router.projectType.uppercased())")
                .foregroundStyle(.secondary)

            Button("Start Scan") {
                // DEV OVERRIDE: set your LAN URL if no deep-link callback was provided
                if router.callbackURL == nil {
                    router.callbackURL = URL(string: "http://10.20.31.101:5173/project") // <-- your Vite Network URL
                }
                startScan = true
            }
            .buttonStyle(.borderedProminent)
            // Remove the .disabled modifier completely for dev testing
            // .disabled(router.callbackURL == nil)

            if router.callbackURL == nil {
                Text("Open from your website via roomscan://scan?cb=<callback>&projectType=wall")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
        }
        .sheet(isPresented: $startScan) {
            ScanSheet(projectType: router.projectType, callbackURL: router.callbackURL)
        }
    }
}// MARK: - Scan Sheet
struct ScanSheet: View {
    let projectType: String
    let callbackURL: URL?

    @Environment(\.dismiss) private var dismiss
    @State private var capturedRoom: CapturedRoom?
    @State private var isSending = false  // Prevent double-sends

    var body: some View {
        ZStack(alignment: .bottom) {
            RoomCaptureContainer(capturedRoom: $capturedRoom)
                .ignoresSafeArea()

            HStack {
                Button("Cancel") { dismiss() }.buttonStyle(.bordered)
                Spacer()
                Button(isSending ? "Sending..." : "Finish & Send") {
                    finishAndSend()
                }
                .buttonStyle(.borderedProminent)
                .disabled(capturedRoom == nil || isSending)
            }
            .padding()
            .background(.ultraThinMaterial)
        }
    }

    private func finishAndSend() {
        guard let room = capturedRoom, let cb = callbackURL, !isSending else { return }
        
        isSending = true

        // Pick the longest wall by X extent.
        guard let wall = room.walls.max(by: { $0.dimensions.x < $1.dimensions.x }) else {
            isSending = false
            return
        }

        let length = wall.dimensions.x   // meters (run)
        let height = wall.dimensions.y   // meters (floor-to-ceiling)

        var comps = URLComponents(url: cb, resolvingAgainstBaseURL: false) ?? URLComponents()
        var items = comps.queryItems ?? []
        
        // Add timestamp to make URL unique
        items.append(URLQueryItem(name: "source", value: "roomplan"))
        items.append(URLQueryItem(name: "projectType", value: projectType))
        items.append(URLQueryItem(name: "length_m", value: String(format: "%.3f", length)))
        items.append(URLQueryItem(name: "height_m", value: String(format: "%.3f", height)))
        items.append(URLQueryItem(name: "timestamp", value: String(Int(Date().timeIntervalSince1970))))
        comps.queryItems = items

        if let final = comps.url {
            print("Opening URL: \(final)")  // Debug log
            
            // Add slight delay to ensure proper handling
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                UIApplication.shared.open(final) { success in
                    print("URL open success: \(success)")
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                        self.dismiss()
                    }
                }
            }
        } else {
            isSending = false
        }
    }
}


// MARK: - RoomPlan Bridge (with explicit NSCoding conformance)
@MainActor
final class SMTRoomPlanBridge: NSObject, NSCoding, RoomCaptureViewDelegate, RoomCaptureSessionDelegate {
    var parent: RoomCaptureContainer
    weak var captureView: RoomCaptureView?

    init(parent: RoomCaptureContainer) {
        self.parent = parent
        super.init()
    }
    
    // Required for NSCoding conformance
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // Required for NSCoding encode
    func encode(with coder: NSCoder) {
        // Not used, but required for protocol conformance
    }

    // ✅ Session updates during scan (provisional models)
    func captureSession(_ session: RoomCaptureSession, didUpdate room: CapturedRoom) {
        parent.capturedRoom = room
    }

    // ✅ Final model when the session is presented/ended
    func captureSession(_ session: RoomCaptureSession, didPresent room: CapturedRoom, error: Error?) {
        parent.capturedRoom = room
    }

    // View delegate method (optional)
    func captureView(_ view: RoomCaptureView, didPresent room: CapturedRoom, error: Error?) {}
}

// MARK: - UIKit bridge
struct RoomCaptureContainer: UIViewRepresentable {
    @Binding var capturedRoom: CapturedRoom?

    func makeCoordinator() -> SMTRoomPlanBridge {
        SMTRoomPlanBridge(parent: self)
    }

    func makeUIView(context: Context) -> RoomCaptureView {
        let view = RoomCaptureView(frame: .zero)
        view.delegate = context.coordinator
        view.captureSession.delegate = context.coordinator        // ✅ add this
        context.coordinator.captureView = view

        let config = RoomCaptureSession.Configuration()
        view.captureSession.run(configuration: config)
        return view
    }
    
    static func dismantleUIView(_ uiView: RoomCaptureView, coordinator: SMTRoomPlanBridge) {
        uiView.captureSession.stop()
        uiView.delegate = nil
        uiView.captureSession.delegate = nil
        coordinator.captureView = nil
      }

    func updateUIView(_ uiView: RoomCaptureView, context: Context) {}
}
