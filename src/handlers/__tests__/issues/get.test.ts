import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { RedmineClient } from "../../../lib/client/index.js";
import { mockResponse, mockErrorResponse } from "../../../lib/__tests__/helpers/mocks.js";
import * as fixtures from "../../../lib/__tests__/helpers/fixtures.js";
import config from "../../../lib/config.js";
import { parseUrl } from "../../../lib/__tests__/helpers/url.js";
import { createIssuesHandlers } from "../../issues.js";
import { IssueListParams } from "../../../lib/types/index.js";
import type { ToolResponse, TextContent, ImageContent } from "../../../handlers/types.js";

/**
 * Type guard to check if content is TextContent
 */
function isTextContent(content: TextContent | ImageContent): content is TextContent {
  return content.type === "text";
}

const assertMcpResponse = (response: ToolResponse) => {
  // Validate structure
  expect(response).toEqual({
    content: expect.any(Array),
    isError: expect.any(Boolean)
  });

  // Content array must not be empty
  expect(response.content.length).toBeGreaterThan(0);

  // Each content item must comply with MCP protocol
  response.content.forEach((item) => {
    if (isTextContent(item)) {
      expect(item).toEqual({
        type: "text",
        text: expect.any(String)
      });
      // Text must not be empty
      expect(item.text.length).toBeGreaterThan(0);
    } else {
      expect(item).toEqual({
        type: "image",
        data: expect.any(String),
        mimeType: expect.any(String)
      });
    }
  });
};

const DEFAULT_PAGINATION = {
  offset: "0",
  limit: "25"
};

describe("Issues Handler (GET) - MCP Response", () => {
  let client: RedmineClient;
  let mockFetch: Mock;
  let handlers: ReturnType<typeof createIssuesHandlers>;

  beforeEach(() => {
    client = new RedmineClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
    handlers = createIssuesHandlers({ 
      client, 
      config,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    });
  });

  describe("GET /issues.json (list_issues)", () => {
    beforeEach(() => {
      mockFetch.mockImplementationOnce(async () =>
        mockResponse(fixtures.issueListResponse)
      );
    });

    it("returns valid MCP response for successful fetch", async () => {
      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpResponse(response);
      expect(response.isError).toBe(false);
      const firstContent = response.content[0];
      expect(firstContent.type).toBe("text");
      if (isTextContent(firstContent)) {
        expect(firstContent.text).toContain(fixtures.issueListResponse.issues[0].subject);
      }
    });

    describe("filtering", () => {
      it("returns valid MCP response with filter parameters", async () => {
        // Arrange
        const params: IssueListParams = {
          project_id: 1,
          status_id: "open",
          sort: "updated_on:desc"
        };

        // Act
        const response = await handlers.list_issues(params);

        // Assert
        assertMcpResponse(response);
        expect(response.isError).toBe(false);

        const [url] = mockFetch.mock.calls[0] as [string];
        const { params: actualParams } = parseUrl(url);
        expect(actualParams).toEqual({
          ...DEFAULT_PAGINATION,
          project_id: "1",
          status_id: "open",
          sort: "updated_on:desc"
        });
      });
    });

    it("returns valid MCP error response for API error", async () => {
      // Arrange
      mockFetch.mockReset();
      mockFetch.mockImplementationOnce(async () =>
        mockErrorResponse(400, ["Invalid query parameters"])
      );

      // Act
      const response = await handlers.list_issues({});

      // Assert
      assertMcpResponse(response);
      expect(response.isError).toBe(true);
      const firstContent = response.content[0];
      expect(firstContent.type).toBe("text");
      if (isTextContent(firstContent)) {
        expect(firstContent.text).toContain("Invalid query parameters");
      }
    });

    it("returns valid MCP error response for invalid parameters", async () => {
      // Arrange
      const params: IssueListParams = {
        limit: -1 // Invalid value
      };

      // Act
      const response = await handlers.list_issues(params);

      // Assert
      assertMcpResponse(response);
      expect(response.isError).toBe(true);
      const firstContent = response.content[0];
      expect(firstContent.type).toBe("text");
      if (isTextContent(firstContent)) {
        expect(firstContent.text).toMatch(/limit|invalid/i);
      }
    });
  });
});