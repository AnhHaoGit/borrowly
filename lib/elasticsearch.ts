import { Client } from "@elastic/elasticsearch";

const node = process.env.ELASTICSEARCH_URL;
const apiKey = process.env.ELASTICSEARCH_API_KEY;

if (!node || !apiKey) {
  throw new Error("Missing ELASTICSEARCH_URL or ELASTICSEARCH_API_KEY");
}

export const elasticsearch = new Client({
  node,
  auth: {
    apiKey,
  },
  maxRetries: 2,
  requestTimeout: 5000,
});

export const BOOKS_INDEX = process.env.ELASTICSEARCH_INDEX || "books";
