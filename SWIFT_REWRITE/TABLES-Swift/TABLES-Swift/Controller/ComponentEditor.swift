import Cocoa

protocol ComponentEditorDelegate: AnyObject {
    func componentEditorDidSave<T: ComponentContent>(content: T)
}

protocol ComponentEditor: NSViewController {
    var delegate: ComponentEditorDelegate? { get set }
    func setContent<T: ComponentContent>(_ content: T)
}
