import React, { useState } from "react";
import '../styles/ApiDocs.css';


// ===== Sub Components =====

const CodeBlock = ({ code, language = "bash" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{language}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? "Copied!" : <span className="copy-icon">⧉</span>}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Table = ({ headers, rows }) => (
  <div className="table-wrapper">
    <table className="doc-table">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const InlineCode = ({ children }) => (
  <code className="inline-code">{children}</code>
);

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-title">Documentation</div>
    <ul className="sidebar-menu">
      <li><a href="#authentication" className="sidebar-link">Authentication</a></li>
      <li><a href="#endpoint"       className="sidebar-link">Endpoint</a></li>
      <li><a href="#code-examples"  className="sidebar-link">Code Examples</a></li>
      <li><a href="#rate-limiting"  className="sidebar-link">Rate Limiting &amp; Error Codes</a></li>
    </ul>
  </aside>
);

// ===== Code Strings =====

const CODE = {
  curlAuth: [
    "curl -X GET https://api.scope.dev/api/movies \\",
    '  -H "x-api-key: mxv_xxxxxxxxxx" \\',
    '  -H "Accept: application/json"',
  ].join("\n"),

  fetchAuth: [
    'fetch("https://api.scope.dev/api/movies", {',
    '  method: "GET",',
    "  headers: {",
    '    "x-api-key": "mxv_TuRnxMvpXgk1",',
    '    "Content-Type": "application/json"',
    "  }",
    "})",
    "  .then(response => response.json())",
    "  .then(data => console.log(data))",
    "  .catch(err => console.error(err));",
  ].join("\n"),

  responseMovies: [
    "[",
    "  {",
    '    "id": 1,',
    '    "title": "Inception",',
    '    "year": 2008,',
    '    "genre": "Sci-Fi",',
    '    "rating": 8.8',
    "  },",
    "  {",
    '    "id": 2,',
    '    "title": "The Dark Night",',
    '    "year": 2006,',
    '    "genre": "Action",',
    '    "rating": 9.8',
    "  }",
    "]",
  ].join("\n"),

  responseMovieById: [
    "{",
    '  "id": 1,',
    '  "title": "Inception",',
    '  "year": 2010,',
    '  "synopsis": "A thief who steals corporate secrets through the use of dream-sharing technology.",',
    '  "director": "Christopher Nolan",',
    '  "rating": 8.8',
    "}",
  ].join("\n"),

  responseGenre: [
    "[",
    "  {",
    '    "id": 3,',
    '    "title": "The Conjuring",',
    '    "year": 2013,',
    '    "genre": "Horror",',
    '    "rating": 7.5',
    "  }",
    "]",
  ].join("\n"),

  errorResponse: [
    "{",
    '  "error": true,',
    '  "code": 429,',
    '  "message": "Rate limit exceeded. Your plan (Cinephile) allows 50 requests per minute."',
    "}",
  ].join("\n"),

  curlExamples: [
    "# Get all movies",
    "curl -X GET https://api.scope.dev/api/movies \\",
    '  -H "x-api-key: mxv_YuRnxMvpXgk1"',
    "",
    "# Get movies by genre (Horror)",
    "curl -X GET https://api.scope.dev/api/movies/genre/Horror \\",
    '  -H "x-api-key: mxv_YuRnxMvpXgk1"',
  ].join("\n"),

  fetchExample: [
    "const API_KEY = 'mxv_YuRnxMvpXgk1';",
    "const BASE_URL = 'https://api.scope.dev/api';",
    "",
    "async function fetchMovies() {",
    "  const response = await fetch(`${BASE_URL}/movies`, {",
    "    method: 'GET',",
    "    headers: {",
    "      'x-api-key': API_KEY,",
    "      'Content-Type': 'application/json'",
    "    }",
    "  });",
    "",
    "  if (!response.ok) {",
    "    const errData = await response.json();",
    "    alert(`Error ${errData.code}: ${errData.message}`);",
    "    return;",
    "  }",
    "",
    "  const data = await response.json();",
    "  console.log('Movies List:', data);",
    "}",
    "",
    "fetchMovies();",
  ].join("\n"),

  axiosExample: [
    "const axios = require('axios');",
    "",
    "const config = {",
    "  method: 'get',",
    "  url: 'https://api.scope.dev/api/movies',",
    "  headers: {",
    "    'x-api-key': 'mxv_YuRnxMvpXgk1'",
    "  }",
    "};",
    "",
    "axios(config)",
    "  .then(response => {",
    "    console.log(JSON.stringify(response.data, null, 2));",
    "  })",
    "  .catch(error => {",
    "    if (error.response) {",
    "      if (error.response.status === 429) {",
    "        console.error('Rate limit exceeded:', error.response.data.message);",
    "      } else {",
    "        console.error('Error:', error.message);",
    "      }",
    "    }",
    "  });",
  ].join("\n"),

  rateLimitError: [
    "{",
    '  "status": 429,',
    '  "error": "Too Many Requests",',
    '  "message": "Rate limit has been reached.",',
    '  "retry_after": 45,',
    '  "limit_resets_at": "2024-06-01T12:01:00Z"',
    "}",
  ].join("\n"),

  backoffExample: [
    "async function fetchWithRetry(url, options, retries = 3) {",
    "  for (let i = 0; i < retries; i++) {",
    "    const response = await fetch(url, options);",
    "",
    "    if (response.status === 429) {",
    "      const retryAfter = response.headers.get('Retry-After') || 60;",
    "      console.warn(`Rate limited. Retrying after ${retryAfter}s...`);",
    "      await new Promise(res => setTimeout(res, retryAfter * 1000));",
    "      continue;",
    "    }",
    "",
    "    return response.json();",
    "  }",
    "  throw new Error('Max retries reached.');",
    "}",
  ].join("\n"),
};

// ===== Main Component =====

export default function ApiDocs() {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">

        {/* ───── Authentication ───── */}
        <section id="authentication" className="doc-section">
          <h1 className="section-h1">Authentication</h1>
          <p className="text">
            Accessing the Scope Movie Data API requires an API Key for every
            request to identify the user and enforce usage quotas (rate limits)
            based on the selected plan.
          </p>

          <ol className="numbered-list">
            <li>
              <strong>How to get an API Key</strong>
              <p className="text">
                You can generate an API Key from your dashboard after signing up
                and selecting a plan. The key will be in the format:{" "}
                <InlineCode>mxv_xxxxxxxxxx</InlineCode>
              </p>
            </li>
            <li>
              <strong>Using the Header</strong>
              <p className="text">
                When sending requests to the API, you must include the API Key
                in the HTTP header using the field name:{" "}
                <InlineCode>x-api-key</InlineCode>
              </p>
            </li>
          </ol>

          <div className="warning-box">
            <span className="warning-icon">⚠</span>
            <span>
              <strong>Security Warning:</strong> Do not expose your API key in
              public. If your key is compromised, please regenerate it
              immediately from the Dashboard.
            </span>
          </div>

          <h3 className="example-title">Example Request</h3>
          <p className="label-tag">Bash</p>
          <CodeBlock language="bash" code={CODE.curlAuth} />

          <p className="label-tag">JavaScript (Fetch)</p>
          <CodeBlock language="JavaScript" code={CODE.fetchAuth} />

          <h3 className="subsection-h3">Auth Errors</h3>
          <p className="text">
            If authentication fails, the system will return the following HTTP
            status codes:
          </p>
          <Table
            headers={["Status Code", "Message", "Cause", "Solution"]}
            rows={[
              ["401", "Unauthorized",      "Missing API Key in header",  "Check if the x-api-key field is included"],
              ["403", "Forbidden",         "Invalid or revoked API Key", "Verify the key in the Dashboard"],
              ["429", "Too Many Requests", "Rate limit exceeded",        "Wait 1 minute or upgrade to the Director plan"],
            ]}
          />
        </section>

        {/* ───── Endpoint ───── */}
        <section id="endpoint" className="doc-section">
          <h1 className="section-h1">Endpoint</h1>

          {/* 1. Get All Movies */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">1. Get All Movies</h3>
            <p className="text">
              Used to retrieve a list of all movies in the system. Suitable for
              list pages or the app's homepage.
            </p>
            <ul className="bullet-list">
              <li>Endpoint: <InlineCode>/movies</InlineCode></li>
              <li>Method: <InlineCode>GET</InlineCode></li>
              <li>
                Query Parameters:
                <ul className="sub-bullet-list">
                  <li><InlineCode>limit</InlineCode> (optional): number of items to return (default: 10)</li>
                  <li><InlineCode>page</InlineCode> (optional): page number (default: 1)</li>
                </ul>
              </li>
            </ul>
            <p className="example-response-title">Example Response (200 OK):</p>
            <p className="label-tag">JSON</p>
            <CodeBlock language="JSON" code={CODE.responseMovies} />
          </div>

          {/* 2. Get Movie by ID */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">2. Get Movie by ID</h3>
            <p className="text">
              Used to retrieve detailed information for a specific movie, such
              as synopsis and related movies.
            </p>
            <ul className="bullet-list">
              <li>Endpoint: <InlineCode>/movies/:id</InlineCode></li>
              <li>Method: <InlineCode>GET</InlineCode></li>
              <li>
                Path Parameters:
                <ul className="sub-bullet-list">
                  <li><InlineCode>id</InlineCode> (required): movie ID (e.g., 1)</li>
                </ul>
              </li>
            </ul>
            <p className="example-response-title">Example Response (200 OK):</p>
            <p className="label-tag">JSON</p>
            <CodeBlock language="JSON" code={CODE.responseMovieById} />
          </div>

          {/* 3. Search Movies by Genre */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">3. Search Movies by Genre</h3>
            <p className="text">
              Used to filter movies by a specific genre, such as Action, Horror,
              or Comedy.
            </p>
            <ul className="bullet-list">
              <li>Endpoint: <InlineCode>/movies/genre/:genre</InlineCode></li>
              <li>Method: <InlineCode>GET</InlineCode></li>
              <li>
                Path Parameters:
                <ul className="sub-bullet-list">
                  <li>
                    <InlineCode>genre</InlineCode> (required): genre name
                    (e.g., Action, Horror, Drama)
                  </li>
                </ul>
              </li>
            </ul>
            <p className="example-response-title">Example Response (200 OK):</p>
            <p className="label-tag">JSON</p>
            <CodeBlock language="JSON" code={CODE.responseGenre} />
          </div>

          {/* Common Errors */}
          <div className="endpoint-item">
            <h3 className="subsection-h3">Common Errors (Error Response)</h3>
            <p className="text">
              When an endpoint request fails, the system will always return a
              response in the following format:
            </p>
            <p className="label-tag">JSON</p>
            <CodeBlock language="JSON" code={CODE.errorResponse} />
            <Table
              headers={["Error Code", "Message", "Description"]}
              rows={[
                ["404", "Movie not found",       "The specified ID or genre was not found"],
                ["429", "Rate limit exceeded",   "You have exceeded your plan's usage limit"],
                ["500", "Internal server error", "An error occurred on the server side"],
              ]}
            />
          </div>
        </section>

        {/* ───── Code Examples ───── */}
        <section id="code-examples" className="doc-section">
          <h1 className="section-h1">Code Examples</h1>
          <p className="text">
            You can use the sample code below directly in your project. Don't
            forget to replace <InlineCode>YOUR_API_KEY</InlineCode> with your
            actual key from the Dashboard.
          </p>

          {/* 1. cURL */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">1. cURL</h3>
            <p className="text">
              Suitable for quick testing via Terminal or Command Prompt.
            </p>
            <p className="label-tag">Bash</p>
            <CodeBlock language="bash" code={CODE.curlExamples} />
          </div>

          {/* 2. JavaScript Fetch */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">2. JavaScript (Fetch API)</h3>
            <p className="text">
              For frontend developers who want to fetch and display data on web
              pages.
            </p>
            <p className="label-tag">JavaScript</p>
            <CodeBlock language="JavaScript" code={CODE.fetchExample} />
          </div>

          {/* 3. Node.js Axios */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">3. Node.js (Axios)</h3>
            <p className="text">
              For backend developers who want to connect to the API via
              server-side.
            </p>
            <p className="label-tag">JavaScript</p>
            <CodeBlock language="JavaScript" code={CODE.axiosExample} />
          </div>
        </section>

        {/* ───── Rate Limiting & Error Codes ───── */}
        <section id="rate-limiting" className="doc-section">
          <h1 className="section-h1">Rate Limiting &amp; Error Codes</h1>
          <p className="text">
            To ensure efficient and fair usage for all users, API requests are
            rate-limited based on your selected plan.
          </p>

          {/* 1. Usage Quotas */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">1. Usage Quotas</h3>
            <p className="text">
              Requests are tracked on a per-minute basis. Your limit depends
              on your current plan:
            </p>
            <Table
              headers={["Feature", "Free", "Medium", "Premium"]}
              rows={[
                ["Price",         "0 THB / Month",    "299 THB / Month",    "990 THB / Month"],
                ["Monthly Quota", "1,000 requests",   "50,000 requests",    "Unlimited"],
                ["Rate Limit",    "5 req / min",      "60 req / min",       "300 req / min"],
                ["Data Access",   "Basic Info Only",  "Full Data (Synopsis + URL)", "Full Data + Bulk Export"],
                ["Search Engine", "Basic (Title Only)","Advanced (Genre, Year)", "Full-Text (Content Search)"],
                ["Support",       "Community Forum",  "Email (24h response)","24/7 Priority"],
              ]}
            />
          </div>

          {/* 2. Rate Limit Exceeded */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">2. Rate Limit Exceeded (Error 429)</h3>
            <p className="text">
              If you exceed your assigned quota, the server will temporarily
              stop processing your requests and return an HTTP 429 Too Many
              Requests status.
            </p>
            <p className="example-response-title">Example Error Response:</p>
            <p className="label-tag">JSON</p>
            <CodeBlock language="JSON" code={CODE.rateLimitError} />
          </div>

          {/* 3. HTTP Status Codes */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">3. HTTP Status Codes Reference</h3>
            <p className="text">
              We use standard HTTP response codes to indicate the success or
              failure of an API request.
            </p>
            <Table
              headers={["Code", "Status", "Meaning", "Action Required"]}
              rows={[
                ["200", "OK",                    "Request was successful.",              "Continue processing your data."],
                ["400", <span className="badge badge-orange">Bad Request</span>,    "Invalid request format or parameters.", "Check your syntax and parameters."],
                ["401", <span className="badge badge-red">Unauthorized</span>,   "Missing or invalid API Key.",          "Verify the x-api-key in your header."],
                ["403", <span className="badge badge-red">Forbidden</span>,      "Key is valid but lacks permissions.",  "Check your account plan or permissions."],
                ["404", <span className="badge badge-gray">Not Found</span>,      "Movie ID or Genre does not exist.",    "Verify the title ID or category name."],
                ["429", <span className="badge badge-orange">Too Many Requests</span>, "Rate limit has been reached.",    "Pause requests for 1 minute or upgrade."],
                ["500", <span className="badge badge-red">Server Error</span>,   "Something went wrong on our end.",     "Try again later or contact support."],
              ]}
            />
          </div>

          {/* 4. Handling Error 429 */}
          <div className="endpoint-item">
            <h3 className="endpoint-num">4. Handling Error 429 (Best Practices)</h3>
            <p className="text">
              To provide a smooth user experience, we recommend implementing
              the following logic in your application:
            </p>
            <ul className="bullet-list">
              <li>
                <strong>Implement Backoff:</strong> When receiving a 429 error,
                pause your requests. Use an exponential backoff strategy before
                retrying.
              </li>
              <li>
                <strong>Monitor Headers:</strong> Our API includes a{" "}
                <InlineCode>x-ratelimit-remaining</InlineCode> in the response
                headers. Use this to slow down requests before hitting the
                limit.
              </li>
              <li>
                <strong>Upgrade Early:</strong> If your application frequently
                triggers 429 errors, consider upgrading to the Director Plan
                via your Dashboard.
              </li>
            </ul>

            <p className="label-tag">JavaScript</p>
            <CodeBlock language="JavaScript" code={CODE.backoffExample} />
          </div>

          {/* Warning */}
          <div className="warning-box">
            <span className="warning-icon">⚠</span>
            <span>
              <strong>Tip:</strong> If you frequently hit the rate limit,
              consider upgrading to the <strong>Director</strong> plan for
              unlimited daily access.
            </span>
          </div>
        </section>

      </main>
    </div>
  );
}