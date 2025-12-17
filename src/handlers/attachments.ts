import {
  HandlerContext,
  ToolResponse,
  asNumber,
  ValidationError,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import { readFile, unlink } from "fs/promises";
import { basename, join } from "path";
import { tmpdir } from "os";
import { exec } from "child_process";
import {
  parseExcelToJson,
  isExcelContentType,
  isExcelFilename,
  formatParsedExcel,
} from "../lib/parsers/index.js";

/**
 * Creates handlers for attachment-related operations
 * @param context Handler context containing the Redmine client and config
 * @returns Object containing all attachment-related handlers
 */
export function createAttachmentsHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Upload a file to Redmine
     * Returns a token that can be used to attach the file to an issue
     */
    upload_file: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("filename" in argsObj)) {
          throw new ValidationError("filename is required");
        }
        if (!("content_base64" in argsObj)) {
          throw new ValidationError("content_base64 is required");
        }

        const filename = String(argsObj.filename);
        const contentBase64 = String(argsObj.content_base64);

        const response = await client.attachments.uploadFile(
          filename,
          contentBase64
        );

        return {
          content: [
            {
              type: "text",
              text: formatters.formatUploadResponse(response, filename),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Get attachment details by ID
     */
    get_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const response = await client.attachments.getAttachment(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatAttachment(response.attachment),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Update an attachment (filename and/or description)
     */
    update_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const updateData: { filename?: string; description?: string } = {};

        if ("filename" in argsObj) {
          updateData.filename = String(argsObj.filename);
        }
        if ("description" in argsObj) {
          updateData.description = String(argsObj.description);
        }

        if (Object.keys(updateData).length === 0) {
          throw new ValidationError(
            "At least one of filename or description must be provided"
          );
        }

        await client.attachments.updateAttachment(id, updateData);

        return {
          content: [
            {
              type: "text",
              text: `Attachment #${id} updated successfully`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Delete an attachment
     */
    delete_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        await client.attachments.deleteAttachment(id);

        return {
          content: [
            {
              type: "text",
              text: `Attachment #${id} deleted successfully`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Download an attachment file content
     * For images, returns viewable image and metadata
     * For Excel files, parses and returns JSON data
     */
    download_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);

        // First get attachment details
        const attachmentResponse = await client.attachments.getAttachment(id);
        const attachment = attachmentResponse.attachment;

        // Download the file content
        const fileContent = await client.attachments.downloadAttachment(
          attachment
        );

        const contentType = attachment.content_type.toLowerCase();

        // Check if the attachment is an Excel file
        const isExcel =
          isExcelContentType(contentType) ||
          isExcelFilename(attachment.filename);

        if (isExcel) {
          // Parse Excel file to JSON
          try {
            const parsedExcel = parseExcelToJson(fileContent);
            const formattedExcel = formatParsedExcel(parsedExcel);

            return {
              content: [
                {
                  type: "text",
                  text: `Attachment #${id}: ${attachment.filename}\n` +
                    `File size: ${attachment.filesize} bytes\n` +
                    `Content type: ${attachment.content_type}\n\n` +
                    `--- Parsed Excel Content ---\n${formattedExcel}`,
                },
              ],
              isError: false,
            };
          } catch (parseError) {
            // If Excel parsing fails, fall back to base64
            const base64Content = fileContent.toString("base64");
            return {
              content: [
                {
                  type: "text",
                  text: formatters.formatDownloadResponse(attachment, base64Content) +
                    `\n\nNote: Excel parsing failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
                },
              ],
              isError: false,
            };
          }
        }

        // Convert to base64
        const base64Content = fileContent.toString("base64");

        // Check if the attachment is an image type that can be displayed
        const imageTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/webp",
          "image/bmp",
        ];
        const isImage = imageTypes.includes(contentType);

        if (isImage) {
          // For images, return both the image content (for viewing) and metadata
          return {
            content: [
              {
                type: "image",
                data: base64Content,
                mimeType: attachment.content_type,
              },
              {
                type: "text",
                text: formatters.formatDownloadResponse(attachment, "[Image data included above]"),
              },
            ],
            isError: false,
          };
        }

        // For non-image files, return only text with base64 data
        return {
          content: [
            {
              type: "text",
              text: formatters.formatDownloadResponse(attachment, base64Content),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Upload a file from local filesystem path
     * Reads the file, converts to base64, and uploads to Redmine
     */
    upload_file_from_path: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("file_path" in argsObj)) {
          throw new ValidationError("file_path is required");
        }

        const filePath = String(argsObj.file_path);

        // Use provided filename or extract from path
        const filename = "filename" in argsObj
          ? String(argsObj.filename)
          : basename(filePath);

        // Read file from filesystem
        const fileBuffer = await readFile(filePath);

        // Upload to Redmine
        const response = await client.attachments.uploadFile(
          filename,
          fileBuffer
        );

        return {
          content: [
            {
              type: "text",
              text: formatters.formatUploadResponse(response, filename),
            },
          ],
          isError: false,
        };
      } catch (error) {
        // Handle file not found error specifically
        if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
          return {
            content: [
              {
                type: "text",
                text: `File not found: ${(error as NodeJS.ErrnoException).path || 'unknown path'}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Upload an image from system clipboard (Windows only)
     * Uses PowerShell to read clipboard, save to temp file, then upload to Redmine
     */
    upload_file_from_clipboard: async (args: unknown): Promise<ToolResponse> => {
      // Check if running on Windows
      if (process.platform !== "win32") {
        return {
          content: [
            {
              type: "text",
              text: "upload_file_from_clipboard is currently only supported on Windows",
            },
          ],
          isError: true,
        };
      }

      const timestamp = Date.now();
      const tempFilePath = join(tmpdir(), `clipboard-image-${timestamp}.png`);

      try {
        const argsObj = (typeof args === "object" && args !== null)
          ? args as Record<string, unknown>
          : {};

        // Use provided filename or generate default
        const filename = "filename" in argsObj
          ? String(argsObj.filename)
          : `clipboard-image-${timestamp}.png`;

        // PowerShell script to save clipboard image to file
        const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img -ne $null) {
    $img.Save('${tempFilePath.replace(/\\/g, "\\\\")}', [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Write-Output "SUCCESS"
} else {
    Write-Output "NO_IMAGE"
}
`;

        // Execute PowerShell script
        const psResult = await new Promise<string>((resolve, reject) => {
          exec(
            `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
            { encoding: "utf8" },
            (error, stdout, stderr) => {
              if (error) {
                reject(new Error(`PowerShell error: ${stderr || error.message}`));
              } else {
                resolve(stdout.trim());
              }
            }
          );
        });

        if (psResult === "NO_IMAGE") {
          return {
            content: [
              {
                type: "text",
                text: "No image found in clipboard. Please copy an image to clipboard first.",
              },
            ],
            isError: true,
          };
        }

        if (psResult !== "SUCCESS") {
          return {
            content: [
              {
                type: "text",
                text: `Unexpected clipboard result: ${psResult}`,
              },
            ],
            isError: true,
          };
        }

        // Read the saved temp file
        const fileBuffer = await readFile(tempFilePath);

        // Upload to Redmine
        const response = await client.attachments.uploadFile(
          filename,
          fileBuffer
        );

        // Clean up temp file
        try {
          await unlink(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }

        return {
          content: [
            {
              type: "text",
              text: formatters.formatUploadResponse(response, filename),
            },
          ],
          isError: false,
        };
      } catch (error) {
        // Clean up temp file on error
        try {
          await unlink(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }

        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },
  };
}
