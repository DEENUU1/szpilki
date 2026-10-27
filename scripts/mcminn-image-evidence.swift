// Offline image evidence; all outputs contain private atlas material and stay in .research/.
import Foundation
import PDFKit
import AppKit
import CryptoKit

struct OCRItem: Decodable { let text: String; let x, y, width, height: Double }
struct OCRPage: Decodable { let page: Int; let width, height: Double; let text_items: [OCRItem] }
struct OCRDocument: Decodable { let sourceSha256: String; let pages: [OCRPage] }
struct Patch: Codable { let white, warm, dark: Double }
struct AnchorEvidence: Codable { let item: Int; let patch: Patch }
struct PageEvidence: Codable {
    let page: Int; let image: String; let columns, rows: Int
    let tissue: [Bool]; let anchors: [AnchorEvidence]
}
struct Evidence: Codable { let atlasId: String; let pages: [PageEvidence] }
enum Failure: Error { case invalid(String) }
let args = CommandLine.arguments
let hash = "a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451"
guard args.count == 4 else { fatalError("Usage: swift scripts/mcminn-image-evidence.swift source.pdf vision.json .research/run") }
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent(".research").standardizedFileURL.resolvingSymlinksInPath()
let out = URL(fileURLWithPath: args[3]).standardizedFileURL.resolvingSymlinksInPath()
guard out.path.hasPrefix(root.path + "/") else { fatalError("Private outputs must be inside this repository's .research/ directory") }
let output = out.appendingPathComponent("evidence.json")
guard !FileManager.default.fileExists(atPath: output.path) else { fatalError("Choose a new output directory; evidence already exists") }
let source = try Data(contentsOf: URL(fileURLWithPath: args[1]))
guard SHA256.hash(data: source).map({ String(format:"%02x", $0) }).joined() == hash,
      let pdf = PDFDocument(data: source), pdf.pageCount == 362 else { fatalError("Requires the exact 362-page McMinn scan") }
let ocr = try JSONDecoder().decode(OCRDocument.self, from: Data(contentsOf: URL(fileURLWithPath: args[2])))
guard ocr.sourceSha256 == hash, ocr.pages.count == 362,
      Set(ocr.pages.map(\.page)) == Set(1...362) else { fatalError("OCR identity/pages do not match") }
let images = out.appendingPathComponent("pages")
try FileManager.default.createDirectory(at: images, withIntermediateDirectories: true)

func patch(_ bitmap: NSBitmapImageRep, _ x: Double, _ y: Double, _ rx: Double, _ ry: Double) throws -> Patch {
    var white = 0.0, warm = 0.0, dark = 0.0
    let side = 7
    for row in 0..<side { for col in 0..<side {
        let px = min(bitmap.pixelsWide - 1, max(0, Int((x + (Double(col)/6 - 0.5)*rx*2)*Double(bitmap.pixelsWide))))
        let py = min(bitmap.pixelsHigh - 1, max(0, Int((y + (Double(row)/6 - 0.5)*ry*2)*Double(bitmap.pixelsHigh))))
        guard let c = bitmap.colorAt(x: px, y: py)?.usingColorSpace(.deviceRGB) else { throw Failure.invalid("Cannot read image colour") }
        let r = Double(c.redComponent), g = Double(c.greenComponent), b = Double(c.blueComponent)
        if min(r,g,b) > 0.85 { white += 1 }
        if r > b + 0.035 && r > g * 0.95 && r > 0.12 { warm += 1 }
        if max(r,g,b) < 0.25 { dark += 1 }
    }}
    return Patch(white:white/49, warm:warm/49, dark:dark/49)
}
var evidence: [PageEvidence] = []
let started = Date()
for page in ocr.pages.sorted(by: {$0.page < $1.page}) {
    try autoreleasepool {
        guard let p = pdf.page(at: page.page - 1) else { throw Failure.invalid("Missing page") }
        let size = p.bounds(for: .mediaBox).size
        guard abs(Double(size.width) - page.width) < 1, abs(Double(size.height) - page.height) < 1 else { throw Failure.invalid("OCR coordinate units differ") }
        let thumbnail = p.thumbnail(of: NSSize(width: 900 * size.width / size.height, height: 900), for: .mediaBox)
        var rect = CGRect(origin: .zero, size:thumbnail.size)
        guard let image = thumbnail.cgImage(forProposedRect:&rect, context:nil, hints:nil) else { throw Failure.invalid("Could not render") }
        let bitmap = NSBitmapImageRep(cgImage:image)
        let name = "pages/\(page.page).jpg"
        guard let jpeg = bitmap.representation(using:.jpeg, properties:[.compressionFactor:0.86]) else { throw Failure.invalid("Cannot encode thumbnail") }
        try jpeg.write(to:out.appendingPathComponent(name), options:.atomic)
        var anchors:[AnchorEvidence] = []
        for (index,item) in page.text_items.enumerated() {
            guard item.text.trimmingCharacters(in:.whitespacesAndNewlines).range(of:"^[1-9][0-9]?$",options:.regularExpression) != nil else { continue }
            let cx = (item.x + item.width/2)/page.width, cy = (item.y + item.height/2)/page.height
            let rx = max(item.width*1.6,item.height*2)/page.width
            let ry = max(item.height*2,item.width)/page.height
            anchors.append(AnchorEvidence(item:index,patch:try patch(bitmap,cx,cy,rx,ry)))
        }
        // Coarse components propose crops, never certified anatomical boundaries.
        let columns = 32, rows = 46
        var tissue:[Bool] = []
        for row in 0..<rows { for col in 0..<columns {
            let p = try patch(bitmap,(Double(col)+0.5)/Double(columns),(Double(row)+0.5)/Double(rows),0.5/Double(columns),0.5/Double(rows))
            tissue.append(p.warm >= 0.35 && p.white <= 0.55)
        }}
        evidence.append(PageEvidence(page:page.page,image:name,columns:columns,rows:rows,tissue:tissue,anchors:anchors))
        if page.page % 20 == 0 { print("Image evidence \(page.page)/362"); fflush(stdout) }
    }
}
try JSONEncoder().encode(Evidence(atlasId:hash,pages:evidence)).write(to:output,options:.atomic)
print("Saved image evidence for \(evidence.count) pages in \(Int(Date().timeIntervalSince(started)))s")
