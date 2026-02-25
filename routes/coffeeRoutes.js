// routes/coffeeRoutes.js
const express = require("express");
const router = express.Router();

const coffeeRepository = require("../repositories/coffeeRepository");

router.get("/", (req, res) => {
  const cafes = coffeeRepository.findMany(); // 전체
  res.render("index", {
    title: "커피맵",
    active: "home",
    headerTitle: "커피맵",
    headerSub: "동네별 카페를 지도에서 찾고 나만의 리스트를 추가하세요.",
    cafes,
  });
});

router.get("/api/cafes", (req, res) => {
  const keyword = (req.query.keyword || "").trim();
  const district = (req.query.district || "").trim();

  const items = coffeeRepository.findMany({ keyword, district });
  res.json({ items });
});

router.post("/api/cafes", (req, res) => {
  try {
    const item = coffeeRepository.create(req.body);
    return res.status(201).json({ item });
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ message: e.message || "서버 오류" });
  }
});

module.exports = router;