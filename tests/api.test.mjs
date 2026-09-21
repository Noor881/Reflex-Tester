import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import articles from "../api/articles.js";
import build from "../api/build.js";
import events from "../api/events.js";

const response = () => {
  const result = { status: 200, headers: {}, body: "" };
  const mock = {
    result,
    setHeader(name, value) {
      result.headers[name] = value;
    },
    end(body = "") {
      result.body = body;
    },
  };
  Object.defineProperty(mock, "statusCode", {
    get: () => result.status,
    set: (value) => {
      result.status = value;
    },
  });
  return mock;
};

const request = (method, body) => {
  const stream = Readable.from(
    body === undefined ? [] : [Buffer.from(JSON.stringify(body))],
  );
  stream.method = method;
  stream.headers = {};
  return stream;
};

test("production article API refuses to run without server secrets", async () => {
  const res = response();
  await articles(request("GET"), res);
  assert.equal(res.result.status, 503);
  assert.match(res.result.body, /CMS_ADMIN_TOKEN/);
});

test("production build API refuses to run without server secrets", async () => {
  const res = response();
  await build(request("POST"), res);
  assert.equal(res.result.status, 503);
  assert.match(res.result.body, /CMS_ADMIN_TOKEN/);
});

test("events API rejects unknown event names", async () => {
  const res = response();
  await events(request("POST", { name: "unknown_event" }), res);
  assert.equal(res.result.status, 400);
  assert.match(res.result.body, /Unsupported event/);
});
