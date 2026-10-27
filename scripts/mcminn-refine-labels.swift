// Optional second OCR pass on overlapping tiles. Output is private, never an answer key.
import Foundation
import AppKit
import PDFKit
import Vision
import CryptoKit
struct Item:Codable {let text:String;let x,y,width,height:Double}
struct Page:Codable {let page:Int;let width,height:Double;var text_items:[Item]}
struct Document:Codable {let sourceSha256:String;var pages:[Page]}
let args=CommandLine.arguments
guard args.count==5 else {fatalError("Usage: swift scripts/mcminn-refine-labels.swift source.pdf vision.json .research/refined.json pages-comma-separated-or-all")}
let out=URL(fileURLWithPath:args[3]).standardizedFileURL.resolvingSymlinksInPath()
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent(".research").standardizedFileURL.resolvingSymlinksInPath()
guard out.path.hasPrefix(root.path+"/"), !FileManager.default.fileExists(atPath:out.path) else {fatalError("Choose a new output inside .research/")}
let source=try Data(contentsOf:URL(fileURLWithPath:args[1]))
let hash=SHA256.hash(data:source).map{String(format:"%02x",$0)}.joined()
guard hash=="a4beadc1c89ab52c07aa29e877c3352e2dee8519bc419779e3d732eb67fa4451",let pdf=PDFDocument(data:source),pdf.pageCount==362 else {fatalError("Wrong source scan")}
var doc=try JSONDecoder().decode(Document.self,from:Data(contentsOf:URL(fileURLWithPath:args[2])))
guard doc.sourceSha256==hash,doc.pages.count==362,Set(doc.pages.map(\.page))==Set(1...362) else {fatalError("OCR identity mismatch")}
let requested=args[4]=="all" ? Set(1...362):Set(args[4].split(separator:",").compactMap{Int($0)})
guard !requested.isEmpty,requested.allSatisfy({1...362 ~= $0}),args[4]=="all" || requested.count==args[4].split(separator:",").count else {fatalError("Invalid page selection")}
let regex=try NSRegularExpression(pattern:"(?<![0-9])[1-9][0-9]?(?![0-9])")
var added=0
let started=Date()
func refine(_ page:Page) throws -> [Item] {
 var items=page.text_items
  guard let p=pdf.page(at:page.page-1) else {fatalError("Missing page")}
  let size=p.bounds(for:.mediaBox).size
  guard abs(Double(size.width)-page.width)<1,abs(Double(size.height)-page.height)<1 else {fatalError("OCR coordinate units differ")}
  let image=p.thumbnail(of:NSSize(width:1800*size.width/size.height,height:1800),for:.mediaBox)
  var r=CGRect(origin:.zero,size:image.size)
  guard let cg=image.cgImage(forProposedRect:&r,context:nil,hints:nil) else {fatalError("Could not render")}
  for yy in [0.0,0.3,0.6] {for xx in [0.0,0.4] {
    let whole=CGRect(x:0,y:0,width:Double(cg.width),height:Double(cg.height))
    let area=CGRect(x:xx*Double(cg.width),y:yy*Double(cg.height),width:0.6*Double(cg.width),height:0.4*Double(cg.height))
    let tileRect=area.integral.intersection(whole)
    guard let tile=cg.cropping(to:tileRect) else {fatalError("Could not crop")}
    let request=VNRecognizeTextRequest();request.recognitionLevel = .accurate;request.recognitionLanguages=["en-US"];request.usesLanguageCorrection=false;request.minimumTextHeight=0.005
    try VNImageRequestHandler(cgImage:tile).perform([request])
    for observation in request.results ?? [] {
      guard let candidate=observation.topCandidates(1).first else {continue}
      let s=candidate.string
      for match in regex.matches(in:s,range:NSRange(s.startIndex...,in:s)) {
        guard let range=Range(match.range,in:s),let box=try candidate.boundingBox(for:range)?.boundingBox else {continue}
        let x:Double=(Double(tileRect.minX)+Double(box.minX)*Double(tileRect.width))/Double(cg.width)*page.width
        let y:Double=(Double(tileRect.minY)+(1-Double(box.maxY))*Double(tileRect.height))/Double(cg.height)*page.height
        let width:Double=Double(box.width)*Double(tileRect.width)/Double(cg.width)*page.width
        let height:Double=Double(box.height)*Double(tileRect.height)/Double(cg.height)*page.height
        guard width>0,height>0,x>=0,y>=0,x+width<=page.width,y+height<=page.height else {continue}
        let text=String(s[range])
        let duplicate=items.contains{i in i.text.trimmingCharacters(in:.whitespacesAndNewlines)==text && abs((i.x+i.width/2)-(x+width/2))<4 && abs((i.y+i.height/2)-(y+height/2))<4}
        if !duplicate {items.append(Item(text:text,x:x,y:y,width:width,height:height))}
      }
    }
  }}
 return items
}
for ix in doc.pages.indices where requested.contains(doc.pages[ix].page) {
 let count=doc.pages[ix].text_items.count
 doc.pages[ix].text_items=try autoreleasepool {try refine(doc.pages[ix])}
 added+=doc.pages[ix].text_items.count-count
 print("Refined page \(doc.pages[ix].page)");fflush(stdout)
}
try FileManager.default.createDirectory(at:out.deletingLastPathComponent(),withIntermediateDirectories:true)
try JSONEncoder().encode(doc).write(to:out,options:.atomic)
print("Added \(added) numeric observations on \(requested.count) pages in \(Int(Date().timeIntervalSince(started)))s")
