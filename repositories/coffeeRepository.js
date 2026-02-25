// repositories/coffeeRepository.js
const db = require("../db");

function safeJsonParse(str, fallback) {
  try {
    const v = JSON.parse(str);
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function mapRow(row) {
  return {
    ...row,
    lat: Number(row.lat),
    lng: Number(row.lng),
    rating: Number(row.rating),
    tags: safeJsonParse(row.tags, []),
  };
}

/**
 * 목록/검색
 * - district: exact match
 * - keyword: name/address/signature/tags 에 LIKE
 */
function findMany({ district = "", keyword = "" } = {}) {
  const where = [];
  const params = {};

  const d = String(district).trim();
  const k = String(keyword).trim().toLowerCase();

  if (d) {
    where.push(`district = @district`);
    params.district = d;
  }
  if (k) {
    where.push(`
      (
        lower(name) LIKE @kw OR
        lower(address) LIKE @kw OR
        lower(signature) LIKE @kw OR
        lower(tags) LIKE @kw
      )
    `);
    params.kw = `%${k}%`;
  }

  const sql = `
    SELECT * FROM cafes
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY id DESC
  `;

  return db.prepare(sql).all(params).map(mapRow);
}

function create({ name, district, address, lat, lng, signature, tags, rating } = {}) {
  if (!name || !district || !address || lat === undefined || lng === undefined) {
    const err = new Error("필수 입력값 누락");
    err.status = 400;
    throw err;
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    const err = new Error("lat/lng 값이 올바르지 않음");
    err.status = 400;
    throw err;
  }

  // tags: 배열 또는 콤마 문자열 허용
  let tagArr = ["신규"];
  if (Array.isArray(tags)) {
    tagArr = tags.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof tags === "string" && tags.trim()) {
    tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (!tagArr.length) tagArr = ["신규"];

  const ratingNum =
    rating === undefined || rating === null || rating === ""
      ? 4.0
      : Number(rating);

  const insert = db.prepare(`
    INSERT INTO cafes (name, district, address, lat, lng, tags, signature, rating)
    VALUES (@name, @district, @address, @lat, @lng, @tags, @signature, @rating)
  `);

  const info = insert.run({
    name: String(name).trim(),
    district: String(district).trim(),
    address: String(address).trim(),
    lat: latNum,
    lng: lngNum,
    tags: JSON.stringify(tagArr),
    signature: signature ? String(signature).trim() : "추천 메뉴 미등록",
    rating: Number.isFinite(ratingNum) ? ratingNum : 4.0,
  });

  const row = db.prepare(`SELECT * FROM cafes WHERE id = ?`).get(info.lastInsertRowid);
  return mapRow(row);
}

module.exports = {
  findMany,
  create,
};