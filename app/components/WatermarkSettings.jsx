export default function WatermarkSettings({
    image,
    contrast,
    setContrast,
    grayscale,
    setGrayscale,
    borderWidth,
    setBorderWidth,
    borderColor,
    setBorderColor,
    borderType,
    setBorderType,
    poemFontSize,
    setPoemFontSize,
    poemColor,
    setPoemColor,
    overlayImage,
    setOverlayImage,
    overlayOpacity,
    setOverlayOpacity,
    overlayWidth,
    setOverlayWidth,
    overlayBorderRadius,
    setOverlayBorderRadius,
    onUploadOverlay,
    onRegenerate,
    useAIImage,
}) {
    return (
        <div className="bg-white shadow-lg rounded-lg">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg">
                <h2 className="text-xl font-semibold">Card Settings</h2>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contrast: {contrast}%</label>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Black & White: {grayscale}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={grayscale}
                        onChange={(e) => setGrayscale(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Border Width: {borderWidth}px</label>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        value={borderWidth}
                        onChange={(e) => setBorderWidth(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Border Color</label>
                    <div className="mt-1 w-full h-10 rounded-md overflow-hidden border border-gray-300">
                        <input
                            type="color"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="w-full h-full border-none p-0"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Border Type</label>
                    <select
                        value={borderType}
                        onChange={(e) => setBorderType(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Poem Font Size: {poemFontSize}px</label>
                    <input
                        type="range"
                        min="20"
                        max="60"
                        value={poemFontSize}
                        onChange={(e) => setPoemFontSize(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Poem Color</label>
                    <div className="mt-1 w-full h-10 rounded-md overflow-hidden border border-gray-300">
                        <input
                            type="color"
                            value={poemColor}
                            onChange={(e) => setPoemColor(e.target.value)}
                            className="w-full h-full border-none p-0"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Overlay Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onUploadOverlay(e.target.files?.[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {overlayImage && (
                        <div className="space-y-4 mt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Overlay Opacity: {overlayOpacity}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={overlayOpacity}
                                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Overlay Width: {overlayWidth}px</label>
                                <input
                                    type="range"
                                    min="50"
                                    max="300"
                                    value={overlayWidth}
                                    onChange={(e) => setOverlayWidth(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Overlay Border Radius: {overlayBorderRadius}px</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={overlayBorderRadius}
                                    onChange={(e) => setOverlayBorderRadius(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {useAIImage && (
                    <button
                        onClick={onRegenerate}
                        className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
                    >
                        Regenerate AI Image
                    </button>
                )}
            </div>
        </div>
    )
}