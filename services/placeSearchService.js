const fetch = global.fetch; // Node 18+ 가정

async function searchKakao(query) {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) throw new Error("KAKAO_REST_API_KEY not set");

  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", query);
  url.searchParams.set("size", "10");

  const r = await fetch(url, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });
  if (!r.ok) throw new Error(`Kakao API error: ${r.status}`);

  const data = await r.json();

  // 프론트에서 쓰기 쉬운 형태로 normalize
  const items = (data.documents || []).map((d) => ({
    name: d.place_name,
    address: d.road_address_name || d.address_name,
    lat: Number(d.y),
    lng: Number(d.x),
    phone: d.phone || "",
    placeUrl: d.place_url || "",
  }));

  return items;
}

module.exports = { searchKakao };