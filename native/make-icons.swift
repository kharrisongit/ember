import AppKit
import Foundation

// Render the game's existing vector flame favicon at the required iOS icon sizes.
let destination = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
func render(_ pixels: Int) throws {
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let context = CGContext(data: nil, width: pixels, height: pixels, bitsPerComponent: 8,
                            bytesPerRow: pixels * 4, space: colorSpace,
                            bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    context.setFillColor(CGColor(red: 23/255, green: 19/255, blue: 16/255, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: pixels, height: pixels))
    context.translateBy(x: 0, y: CGFloat(pixels)); context.scaleBy(x: CGFloat(pixels)/32, y: -CGFloat(pixels)/32)
    let outer = CGMutablePath()
    outer.move(to: CGPoint(x: 16, y: 3))
    outer.addCurve(to: CGPoint(x: 24, y: 19), control1: CGPoint(x: 18, y: 9), control2: CGPoint(x: 24, y: 11))
    outer.addCurve(to: CGPoint(x: 8, y: 19), control1: CGPoint(x: 24, y: 30), control2: CGPoint(x: 8, y: 30))
    outer.addCurve(to: CGPoint(x: 13, y: 9), control1: CGPoint(x: 8, y: 15), control2: CGPoint(x: 10, y: 12))
    outer.addCurve(to: CGPoint(x: 16, y: 16), control1: CGPoint(x: 13, y: 13), control2: CGPoint(x: 14, y: 15))
    outer.addCurve(to: CGPoint(x: 16, y: 3), control1: CGPoint(x: 15, y: 11), control2: CGPoint(x: 16, y: 7))
    context.setFillColor(CGColor(red: 224/255, green: 145/255, blue: 63/255, alpha: 1))
    context.addPath(outer); context.fillPath()
    let inner = CGMutablePath()
    inner.move(to: CGPoint(x: 16, y: 15))
    inner.addCurve(to: CGPoint(x: 20, y: 23), control1: CGPoint(x: 19, y: 18), control2: CGPoint(x: 20, y: 20))
    inner.addCurve(to: CGPoint(x: 12, y: 23), control1: CGPoint(x: 20, y: 28.5), control2: CGPoint(x: 12, y: 28.5))
    inner.addCurve(to: CGPoint(x: 16, y: 15), control1: CGPoint(x: 12, y: 21), control2: CGPoint(x: 13, y: 19))
    context.setFillColor(CGColor(red: 240/255, green: 230/255, blue: 210/255, alpha: 1))
    context.addPath(inner); context.fillPath()
    let bitmap = NSBitmapImageRep(cgImage: context.makeImage()!)
    try bitmap.representation(using: .png, properties: [:])!.write(to: destination.appendingPathComponent("icon-\(pixels).png"))
}
let sizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024]
for size in sizes { try render(size) }
