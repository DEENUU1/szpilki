// macOS-only offline OCR. Output contains private textbook text: keep it in .research/.
import Foundation
import PDFKit
import Vision
import AppKit
import CryptoKit

struct OCRItem: Codable {
    let text: String
    let x, y, width, height: Double
}
struct OCRPage: Codable {
    let page: Int
    let width, height: Double
    let text_items: [OCRItem]
}
struct OCRDocument: Codable {
    let sourceSha256: String
    let pages: [OCRPage]
}
guard CommandLine.arguments.count == 3 else {
    fatalError("Usage: swift scripts/mcminn-ocr.swift source.pdf .research/mcminn/vision.json")
}
let sourceURL = URL(fileURLWithPath: CommandLine.arguments[1])
let destination = URL(fileURLWithPath: CommandLine.arguments[2])
let bytes = try Data(contentsOf: sourceURL)
let digest = SHA256.hash(data: bytes).map { String(format: "%02x", $0) }.joined()
guard digest == "a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451",
      let document = PDFDocument(data: bytes), document.pageCount == 362 else {
    fatalError("This index requires the exact 362-page source scan.")
}
var pages: [OCRPage] = []
for index in 0..<document.pageCount {
    try autoreleasepool {
        guard let page = document.page(at: index) else { fatalError("Missing PDF page") }
        let size = page.bounds(for: .mediaBox).size
        let image = page.thumbnail(of: NSSize(width: size.width * 3, height: size.height * 3), for: .mediaBox)
        var rectangle = CGRect(origin: .zero, size: image.size)
        guard let cgImage = image.cgImage(forProposedRect: &rectangle, context: nil, hints: nil) else {
            fatalError("Could not render page \(index + 1)")
        }
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["pl-PL", "en-US"]
        request.usesLanguageCorrection = false
        request.minimumTextHeight = 0.002
        try VNImageRequestHandler(cgImage: cgImage).perform([request])
        let items = (request.results ?? []).compactMap { observation -> OCRItem? in
            guard let candidate = observation.topCandidates(1).first else { return nil }
            let box = observation.boundingBox
            return OCRItem(text: candidate.string, x: box.minX * size.width, y: (1 - box.maxY) * size.height,
                           width: box.width * size.width, height: box.height * size.height)
        }
        pages.append(OCRPage(page: index + 1, width: size.width, height: size.height, text_items: items))
        if index % 20 == 0 { print("Page \(index + 1)/\(document.pageCount)"); fflush(stdout) }
    }
}
try FileManager.default.createDirectory(at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
try JSONEncoder().encode(OCRDocument(sourceSha256: digest, pages: pages)).write(to: destination, options: .atomic)
print("Saved \(pages.count) pages locally")
