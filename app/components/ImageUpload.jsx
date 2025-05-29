export default function ImageUpload({ onUpload }) {
    const handleChange = (e) => {
        const file = e.target.files?.[0]
        if (file) onUpload(file)
    }

    return (
        <div className="bg-white shadow-lg rounded-lg">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg">
                <h2 className="text-xl font-semibold">Upload Image</h2>
            </div>
            <div className="p-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
            </div>
        </div>
    )
}