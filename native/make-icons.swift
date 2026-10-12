import AppKit
import Foundation

// The master uses the exact Corin/Aurelius title-screen frame.
// Resize only: the installed app and AltStore listing share the same artwork.
let destination = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let source = URL(fileURLWithPath: "native/Resources/AppIcon.png")
let bitmap = NSBitmapImageRep(data: try Data(contentsOf: source))!
let master = bitmap.cgImage!
try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
for pixels in [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024] {
    let context = CGContext(data: nil, width: pixels, height: pixels, bitsPerComponent: 8,
                            bytesPerRow: pixels * 4, space: CGColorSpaceCreateDeviceRGB(),
                            bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    context.interpolationQuality = .high
    context.draw(master, in: CGRect(x: 0, y: 0, width: pixels, height: pixels))
    let image = NSBitmapImageRep(cgImage: context.makeImage()!)
    try image.representation(using: .png, properties: [:])!.write(to: destination.appendingPathComponent("icon-\(pixels).png"))
}
