// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GoodPlansCore",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "GoodPlansCore", targets: ["GoodPlansCore"])],
    targets: [.target(name: "GoodPlansCore"), .testTarget(name: "GoodPlansCoreTests", dependencies: ["GoodPlansCore"])]
)
