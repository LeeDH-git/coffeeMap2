const express = require("express");

const router = express.Router();

const cafes = [
  {
    id: 1,
    name: "프릳츠 원서점",
    district: "종로구",
    address: "서울 종로구 율곡로 83 아라리오뮤지엄 1층",
    lat: 37.5777,
    lng: 126.9881,
    tags: ["로스터리", "디저트"],
    signature: "필터커피",
    rating: 4.7,
  },
  {
    id: 2,
    name: "센터커피 서울숲점",
    district: "성동구",
    address: "서울 성동구 서울숲2길 28-11",
    lat: 37.5464,
    lng: 127.0438,
    tags: ["브런치", "라떼"],
    signature: "플랫화이트",
    rating: 4.6,
  },
  {
    id: 3,
    name: "테일러커피 연남",
    district: "마포구",
    address: "서울 마포구 성미산로 189",
    lat: 37.5626,
    lng: 126.9242,
    tags: ["핸드드립", "감성"],
    signature: "테일러 라떼",
    rating: 4.5,
  },
  {
    id: 4,
    name: "커피한약방",
    district: "중구",
    address: "서울 중구 삼일대로12길 16-6",
    lat: 37.5679,
    lng: 126.9922,
    tags: ["한옥", "디저트"],
    signature: "아인슈페너",
    rating: 4.4,
  },
];

router.get("/", (req, res) => {
  res.render("index", {
    title: "커피맵",
    active: "home",
    headerTitle: "서울 커피맵",
    headerSub: "동네별 카페를 지도에서 찾고 나만의 리스트를 추가하세요.",
    cafes,
  });
});

router.get("/api/cafes", (req, res) => {
  const keyword = (req.query.keyword || "").trim().toLowerCase();
  const district = (req.query.district || "").trim();

  const filtered = cafes.filter((cafe) => {
    const matchKeyword =
      !keyword ||
      [cafe.name, cafe.address, cafe.signature, ...cafe.tags]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    const matchDistrict = !district || cafe.district === district;
    return matchKeyword && matchDistrict;
  });

  res.json({ items: filtered });
});

router.post("/api/cafes", (req, res) => {
  const { name, district, address, lat, lng, signature } = req.body;

  if (!name || !district || !address || !lat || !lng) {
    return res.status(400).json({ message: "필수 입력값을 확인해주세요." });
  }

  const newCafe = {
    id: cafes.length + 1,
    name,
    district,
    address,
    lat: Number(lat),
    lng: Number(lng),
    signature: signature || "추천 메뉴 미등록",
    tags: ["신규"],
    rating: 4.0,
  };

  cafes.unshift(newCafe);
  return res.status(201).json({ item: newCafe });
});

module.exports = router;
