document.addEventListener("DOMContentLoaded", () => {
  const keywordEl = document.getElementById("cafeSearchKeyword");
  const districtEl = document.getElementById("cafeSearchDistrict");
  const btnEl = document.getElementById("cafeSearchBtn");
  const resultsEl = document.getElementById("cafeSearchResults");

  if (!keywordEl || !districtEl || !btnEl || !resultsEl) {
    console.warn("카페 검색 DOM 요소 못찾음");
    return;
  }

  btnEl.addEventListener("click", async (e) => {
    e.preventDefault();

    const keyword = keywordEl.value.trim();
    const district = districtEl.value.trim(); // '전체 지역'이면 빈값으로 처리 추천

    const qs = new URLSearchParams();
    if (keyword) qs.set("keyword", keyword);
    if (district && district !== "전체 지역") qs.set("district", district);

    resultsEl.innerHTML = "검색 중...";

    try {
      const r = await fetch(`/api/cafes?${qs.toString()}`);
      const data = await r.json();

      if (!r.ok) {
        resultsEl.innerHTML = `오류: ${data.message || r.status}`;
        return;
      }

      const items = data.items || [];
      if (!items.length) {
        resultsEl.innerHTML = "검색 결과가 없습니다.";
        // TODO: 지도 마커도 비우고 싶으면 여기서 clear
        return;
      }

      // 1) 결과 리스트 렌더
      resultsEl.innerHTML = items
        .map(
          (c) => `
            <button type="button" class="cafe-result"
              data-lat="${c.lat}" data-lng="${c.lng}">
              <div style="font-weight:600;">${c.name}</div>
              <div style="font-size:12px;opacity:.8;">${c.district} · ${c.address}</div>
            </button>
          `
        )
        .join("");

      // 2) 클릭하면 지도 이동(너 Leaflet map 변수/함수명에 맞춰 연결)
      resultsEl.querySelectorAll(".cafe-result").forEach((el) => {
        el.addEventListener("click", () => {
          const lat = Number(el.dataset.lat);
          const lng = Number(el.dataset.lng);

          // ✅ 너가 쓰는 지도 변수명이 map 이라면:
          if (window.map && Number.isFinite(lat) && Number.isFinite(lng)) {
            window.map.setView([lat, lng], 16);
          }

          // ✅ 마커 찍는 함수가 있다면 여기서 호출
          // window.showCafeMarker(lat, lng);
        });
      });

      // 3) 검색 결과로 지도 마커/리스트 갱신도 하고 싶으면
      // window.renderCafesOnMap(items); 같은 함수를 만들어 호출
      if (typeof window.renderCafesOnMap === "function") {
        window.renderCafesOnMap(items);
      }
    } catch (err) {
      resultsEl.innerHTML = `요청 실패: ${err.message}`;
    }
  });
});