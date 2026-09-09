/**
 * Reads a File as a Base64 Data URL string
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to read image as data URL"))
      }
    }
    reader.onerror = () =>
      reject(reader.error || new Error("Error reading file"))
    reader.readAsDataURL(file)
  })
}

/**
 * Formats a file name + source URL as an embedded markdown image block
 */
export function formatMarkdownImage(fileName: string, srcUrl: string): string {
  const cleanName =
    fileName.replace(/[\[\]\(\)]/g, "").trim() || "Embedded Image"
  return `\n\n![${cleanName}](${srcUrl})\n\n`
}
