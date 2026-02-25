const express = require("express");
const router = express.Router();
const placeSearchService = require("../services/placeSearchService");

router.get("/api/places/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ items: [] });

    const items = await placeSearchService.searchKakao(q);
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: e.message || "place search error" });
  }
});

module.exports = router;