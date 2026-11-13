import { Client } from "@elastic/elasticsearch";

const node = process.env.ELASTICSEARCH_URL;
const apiKey = process.env.ELASTICSEARCH_API_KEY;

export const BOOKS_INDEX = process.env.ELASTICSEARCH_INDEX || "books";

// Thiếu cấu hình Elasticsearch không được làm sập app: khi đó search tự chuyển
// sang tìm bằng Postgres.
export const isElasticsearchConfigured = Boolean(node && apiKey);

let client: Client | null = null;

const getClient = (): Client | null => {
  if (!node || !apiKey) return null;

  client ??= new Client({
    node,
    auth: { apiKey },
    // Cụm ES không phản hồi thì bỏ cuộc sớm: trang sách còn phải kịp trả kết quả
    // bằng đường dự phòng, không thử lại để khỏi cộng thêm độ trễ.
    maxRetries: 0,
    requestTimeout: 2500,
  });

  return client;
};

const requireClient = (): Client => {
  const instance = getClient();

  if (!instance) {
    throw new Error(
      "Elasticsearch isn't configured (ELASTICSEARCH_URL / ELASTICSEARCH_API_KEY).",
    );
  }

  return instance;
};

/**
 * Client dùng cho các việc khác ngoài tìm kiếm (index một sách, đồng bộ, tạo
 * index). Khởi tạo muộn: app vẫn chạy bình thường khi chưa cấu hình
 * Elasticsearch, chỉ những tác vụ này báo lỗi.
 */
export const elasticsearch: Client = new Proxy({} as Client, {
  get(_target, property) {
    const instance = requireClient();
    const value: unknown = Reflect.get(instance, property);

    return typeof value === "function" ? value.bind(instance) : value;
  },
});


