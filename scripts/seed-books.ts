/**
 * Seed ~200 sách từ Open Library vào database qua Drizzle.
 *
 * Chạy thử (KHÔNG ghi DB, chỉ xuất file xem trước):
 *   npm run seed:books -- --dry-run
 *
 * Chạy thật:
 *   npm run seed:books
 *
 * File này không được import ở đâu trong app, chỉ chạy tay bằng lệnh trên.
 */
import { writeFile } from "node:fs/promises";
import type { books as booksTable } from "../database/schema"; // ← chỉnh đường dẫn cho đúng dự án

type NewBook = typeof booksTable.$inferInsert;

// ===================== CẤU HÌNH =====================
// Open Library yêu cầu app tự giới thiệu bằng User-Agent kèm email liên hệ.
const CONTACT = "your-email@example.com"; // ← đổi thành email của bạn
const USER_AGENT = `BorrowlySeed/1.0 (${CONTACT})`;

const PER_GENRE = 20; // 15 thể loại × 20 = 300 sách
const MAX_PAGES = 4; // tối đa số trang search cho mỗi thể loại
const DELAY_MS = 400; // nghỉ giữa các request để không bị chặn
const BATCH_SIZE = 50; // số dòng mỗi lần insert

// Chỉ lấy sách có ấn bản bằng ngôn ngữ này (mã ISO 639-2 như "eng", "fre", "vie").
// Đặt null để lấy mọi ngôn ngữ; khi đó cột language lưu ngôn ngữ của ấn bản được chọn.
const ONLY_LANGUAGE: string | null = "eng";

// Open Library có sách gắn hàng trăm subject/nhà xuất bản → giới hạn số phần tử lưu vào mỗi mảng
const LIMITS = {
  subjects: 20,
  subjectPlaces: 10,
  subjectTimes: 10,
  publishers: 10,
} as const;

// label phải khớp với GENRES ở frontend
// ("Fiction" để cuối: sách đã lấy ở thể loại trên sẽ không bị lấy lại)
const GENRES = [
  { label: "Fantasy", subject: "fantasy" },
  { label: "Sci-Fi", subject: "science fiction" },
  { label: "Mystery", subject: "mystery" },
  { label: "Romance", subject: "romance" },
  { label: "History", subject: "history" },
  { label: "Poetry", subject: "poetry" },
  { label: "Biography", subject: "biography" },
  { label: "Self-Help", subject: "self-help" },
  { label: "Kids", subject: "juvenile fiction" },
  { label: "Horror", subject: "horror" },
  { label: "Philosophy", subject: "philosophy" },
  { label: "Science", subject: "science" },
  { label: "Adventure", subject: "adventure" },
  { label: "Humor", subject: "humor" },
  { label: "Fiction", subject: "fiction" },
] as const;

const BASE = "https://openlibrary.org";

// ===================== KIỂU DỮ LIỆU OPEN LIBRARY =====================
interface SearchDoc {
  key: string; // "/works/OL45883W"
  title?: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  publisher?: string[]; // gộp từ mọi ấn bản của tác phẩm
}
interface SearchResponse {
  docs?: SearchDoc[];
}
interface EditionEntry {
  languages?: { key: string }[]; // vd [{ key: "/languages/eng" }]
  covers?: number[]; // ảnh bìa của ấn bản (id âm = đã bị gỡ)
  isbn_10?: string[];
  isbn_13?: string[];
}
interface EditionsResponse {
  entries?: EditionEntry[];
}
interface WorkResponse {
  description?: string | { value?: string };
  subjects?: string[];
  subject_places?: string[];
  subject_times?: string[];
}
interface AuthorResponse {
  photos?: number[];
}

// ===================== HÀM TIỆN ÍCH =====================
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Open Library không có tồn kho: khoảng 15% sách hết hàng, còn lại 1–8 quyển
const randomQuantity = () => (Math.random() < 0.15 ? 0 : randomInt(1, 8));

/** GET JSON, tự thử lại khi bị 429 / 5xx / lỗi mạng. Trả null nếu không lấy được. */
async function getJson<T>(url: string): Promise<T | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await sleep(DELAY_MS);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) return (await res.json()) as T;
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        await sleep(2000 * attempt); // chờ lâu dần rồi thử lại
        continue;
      }
      return null;
    } catch {
      await sleep(2000 * attempt);
    }
  }
  console.warn(`  ! Bỏ qua (request lỗi): ${url}`);
  return null;
}

/** Làm sạch mô tả của Open Library (markdown, link tham chiếu, phần "----- Contains") */
function cleanDescription(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*-{3,}/)[0] // cắt phần phụ phía sau dòng "----------"
    .replace(/^\[\d+\]:.*$/gm, "") // dòng tham chiếu kiểu "[1]: http://..."
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [chữ](link) → chữ
    .replace(/\[([^\]]+)\]\[\d*\]/g, "$1") // [chữ][1] → chữ
    .replace(/(\*\*|__)/g, "") // bỏ in đậm markdown
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Tóm tắt ngắn (≤ 200 ký tự) lấy từ đầu phần mô tả */
function makeSummary(description: string): string {
  const flat = description.replace(/\s+/g, " ").trim();
  if (flat.length <= 200) return flat;

  const cut = flat.slice(0, 200);
  const lastStop = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("! "),
    cut.lastIndexOf("? "),
  );
  if (lastStop >= 80) return cut.slice(0, lastStop + 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// Các subject rác do hệ thống nội bộ của Open Library thêm vào, không có ý nghĩa với người đọc
const JUNK_ENTRY =
  /^(nyt:|accessible book|protected daisy|in library|overdrive|lending library|large type)/i;

/** Chuẩn hoá một mảng chuỗi: bỏ rỗng, bỏ trùng (không phân biệt hoa thường), bỏ rác, giới hạn số lượng */
function cleanList(values: unknown, max: number): string[] {
  if (!Array.isArray(values)) return [];
  const seenValues = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (!text || text.length > 100 || JUNK_ENTRY.test(text)) continue;

    const lower = text.toLowerCase();
    if (seenValues.has(lower)) continue;
    seenValues.add(lower);

    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

interface ChosenEdition {
  language: string;
  coverId: number;
}

/**
 * Chọn MỘT ấn bản cụ thể của tác phẩm, rồi lấy ngôn ngữ và ảnh bìa từ chính ấn bản đó
 * (thay vì dùng ảnh bìa đại diện của cả tác phẩm, vốn có thể là bất kỳ ảnh nào người dùng đã tải lên).
 */
async function fetchEdition(workKey: string): Promise<ChosenEdition | null> {
  const id = workKey.replace("/works/", "");
  const data = await getJson<EditionsResponse>(
    `${BASE}/works/${id}/editions.json?limit=50`,
  );

  const candidates = (data?.entries ?? []).flatMap((entry) => {
    const coverId = entry.covers?.find((c) => c > 0);
    const codes = (entry.languages ?? []).map((l) =>
      l.key.replace("/languages/", ""),
    );
    if (!coverId) return [];
    if (ONLY_LANGUAGE ? !codes.includes(ONLY_LANGUAGE) : codes.length === 0)
      return [];

    return [
      {
        language: ONLY_LANGUAGE ?? codes[0],
        coverId,
        hasIsbn: Boolean(entry.isbn_13?.length || entry.isbn_10?.length),
      },
    ];
  });

  // Ưu tiên ấn bản có ISBN: đó là sách xuất bản thương mại, ảnh bìa thường là mặt trước chuẩn
  candidates.sort((a, b) => Number(b.hasIsbn) - Number(a.hasIsbn));

  const best = candidates[0];
  return best ? { language: best.language, coverId: best.coverId } : null;
}

interface WorkDetails {
  description: string;
  subjects: string[];
  subjectPlaces: string[];
  subjectTimes: string[];
}

// Mô tả và các nhóm subject nằm ở endpoint /works/..., search không trả về đủ
async function fetchWorkDetails(workKey: string): Promise<WorkDetails> {
  const id = workKey.replace("/works/", "");
  const data = await getJson<WorkResponse>(`${BASE}/works/${id}.json`);

  const rawDescription =
    typeof data?.description === "string"
      ? data.description
      : (data?.description?.value ?? "");

  return {
    description: cleanDescription(rawDescription),
    subjects: cleanList(data?.subjects, LIMITS.subjects),
    subjectPlaces: cleanList(data?.subject_places, LIMITS.subjectPlaces),
    subjectTimes: cleanList(data?.subject_times, LIMITS.subjectTimes),
  };
}

// Nhiều sách chung tác giả → chỉ hỏi Open Library một lần cho mỗi tác giả
const authorImageCache = new Map<string, string | null>();

async function fetchAuthorImage(authorKey?: string): Promise<string | null> {
  if (!authorKey) return null;
  if (authorImageCache.has(authorKey))
    return authorImageCache.get(authorKey) ?? null;

  const data = await getJson<AuthorResponse>(
    `${BASE}/authors/${authorKey}.json`,
  );
  const photoId = data?.photos?.find((id) => id > 0); // id âm = ảnh đã bị gỡ
  const url = photoId
    ? `https://covers.openlibrary.org/a/id/${photoId}-M.jpg`
    : null;

  authorImageCache.set(authorKey, url);
  return url;
}

const dedupeKey = (title: string, author: string) =>
  `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;

// ===================== CHẠY CHÍNH =====================
async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(
    dryRun
      ? "Chế độ DRY-RUN: không ghi vào database.\n"
      : "Chế độ GHI DATABASE.\n",
  );

  // Chỉ nạp DB khi chạy thật, để --dry-run chạy được cả khi chưa có DATABASE_URL
  let db: (typeof import("../database/drizzle"))["db"] | null = null;
  let books: typeof booksTable | null = null;
  const seen = new Set<string>(); // chống trùng trong lần chạy và với sách đã có sẵn trong DB

  if (!dryRun) {
    ({ db } = await import("../database/drizzle")); // ← chỉnh đường dẫn cho đúng dự án
    ({ books } = await import("../database/schema")); // ← chỉnh đường dẫn cho đúng dự án
    const existing = await db
      .select({ title: books.title, authorName: books.authorName })
      .from(books);
    existing.forEach((b) => seen.add(dedupeKey(b.title, b.authorName)));
    console.log(
      `Trong DB đã có ${existing.length} sách (sẽ bỏ qua nếu trùng).\n`,
    );
  }

  // Tuỳ chọn: --genres=Horror,Humor chỉ chạy các thể loại được liệt kê
  const genresArg = process.argv.find((arg) => arg.startsWith("--genres="));
  const wanted = genresArg
    ? genresArg
        .slice("--genres=".length)
        .split(",")
        .map((name) => name.trim().toLowerCase())
    : null;
  const genresToRun = wanted
    ? GENRES.filter((g) => wanted.includes(g.label.toLowerCase()))
    : GENRES;
  console.log(
    `Thể loại sẽ chạy: ${genresToRun.map((g) => g.label).join(", ")}\n`,
  );

  const collected: NewBook[] = [];
  const seenWorkKeys = new Set<string>();

  for (const genre of genresToRun) {
    console.log(`▶ ${genre.label}`);
    let count = 0;

    for (let page = 1; page <= MAX_PAGES && count < PER_GENRE; page++) {
      const params = new URLSearchParams({
        q: ONLY_LANGUAGE
          ? `subject:"${genre.subject}" AND language:${ONLY_LANGUAGE}`
          : `subject:"${genre.subject}"`,
        fields: "key,title,author_name,author_key,first_publish_year,publisher",
        sort: "editions", // nhiều ấn bản nhất → sách nổi tiếng, thường có bìa và mô tả
        limit: "100",
        page: String(page),
      });

      const result = await getJson<SearchResponse>(
        `${BASE}/search.json?${params}`,
      );
      const docs = result?.docs ?? [];
      if (docs.length === 0) break;

      for (const doc of docs) {
        if (count >= PER_GENRE) break;

        const title = doc.title?.trim();
        const authorName = doc.author_name?.[0]?.trim();
        // Bắt buộc có đủ: tên, tác giả, năm (ảnh bìa và ngôn ngữ kiểm tra ở bước chọn ấn bản)
        if (!doc.key || !title || !authorName || !doc.first_publish_year)
          continue;
        if (title.length > 255 || authorName.length > 255) continue;
        if (seenWorkKeys.has(doc.key)) continue;

        const key = dedupeKey(title, authorName);
        if (seen.has(key)) continue;

        const work = await fetchWorkDetails(doc.key);
        const { description } = work;
        if (description.length < 80) continue; // mô tả quá ngắn/không có → bỏ sách này

        // Ngôn ngữ và ảnh bìa lấy từ cùng một ấn bản; không có ấn bản phù hợp → bỏ sách này
        const edition = await fetchEdition(doc.key);
        if (!edition) continue;

        const authorImageUrl = await fetchAuthorImage(doc.author_key?.[0]);

        seenWorkKeys.add(doc.key);
        seen.add(key);
        count++;

        collected.push({
          title,
          authorName,
          genre: genre.label,
          publishYear: doc.first_publish_year,
          coverUrl: `https://covers.openlibrary.org/b/id/${edition.coverId}-L.jpg`,
          language: edition.language,
          summary: makeSummary(description),
          description,
          availableQuantity: randomQuantity(),
          authorImageUrl,
          rating: null, // chưa có ai đánh giá
          borrowCount: 0,
          subjects: work.subjects,
          subjectPlaces: work.subjectPlaces,
          subjectTimes: work.subjectTimes,
          publishers: cleanList(doc.publisher, LIMITS.publishers),
        });

        console.log(
          `  ✓ ${String(count).padStart(2)}/${PER_GENRE}  ${title} — ${authorName}`,
        );
      }
    }

    if (count < PER_GENRE)
      console.warn(
        `  ! ${genre.label}: chỉ lấy được ${count}/${PER_GENRE} sách.`,
      );
    console.log("");
  }

  // ----- Tổng kết -----
  const withPhoto = collected.filter((b) => b.authorImageUrl).length;
  console.log(
    `Thu thập xong ${collected.length} sách (${withPhoto} sách có ảnh tác giả).`,
  );

  if (dryRun || !db || !books) {
    const file = "scripts/seed-books.preview.json";
    await writeFile(file, JSON.stringify(collected, null, 2), "utf8");
    console.log(
      `Đã ghi bản xem trước vào ${file}. Chưa có gì được thêm vào database.`,
    );
    return;
  }

  // ----- Ghi vào database theo từng lô -----
  for (let i = 0; i < collected.length; i += BATCH_SIZE) {
    const chunk = collected.slice(i, i + BATCH_SIZE);
    await db.insert(books).values(chunk);
    console.log(
      `Đã insert ${Math.min(i + BATCH_SIZE, collected.length)}/${collected.length}`,
    );
  }
  console.log("\nHoàn tất. Dữ liệu mẫu đã nằm trong bảng books.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nSeed thất bại:", error);
    process.exit(1);
  });
