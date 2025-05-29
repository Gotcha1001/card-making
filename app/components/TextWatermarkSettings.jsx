'use client'

export default function TextWatermarkSettings({
    watermarkText,
    setWatermarkText,
    textSize,
    setTextSize,
    textColor,
    setTextColor,
    textXRatio,
    setTextXRatio,
    textYRatio,
    setTextYRatio,
}) {
    return (
        <div className="bg-white shadow-lg rounded-lg">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg">
                <h2 className="text-xl font-semibold">Watermark Text Settings</h2>
            </div>
            <div className="p-4 space-y-4 sm:p-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Text Overlay</label>
                    <textarea
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="Enter text (press Enter to add line breaks)"
                        className="mt-1 block w-full rounded-lg min-h-[100px] border-2 border-gray-300 shadow-sm focus:shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600 resize-y-none sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Font Size: {textSize}px</label>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Text Color</label>
                    <div className="mt-2 w-full h-10 rounded-md overflow-hidden">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-full border-none p-0 cursor-pointer"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Horizontal Position: {(textXRatio * 100).toFixed(0)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={textXRatio}
                        onChange={(e) => setTextXRatio(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vertical Position: {(textYRatio * 100).toFixed(0)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={textYRatio}
                        onChange={(e) => setTextYRatio(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                </div>
            </div>
        </div>
    )
}