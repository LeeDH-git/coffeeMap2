const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: "change-this-to-a-long-random-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

const requireAuth = (req, res, next) => {
  if (req.session?.user) return next();
  return res.redirect("/login");
};

const authRouter = require("./routes/authRoutes");
const estimateRouter = require("./routes/estimateRoutes");
const contractRouter = require("./routes/contractRoutes");
const libraryRouter = require("./routes/libraryRoutes");
const clientRouter = require("./routes/clientRoutes");
const progressRouter = require("./routes/progressRoutes");
const staffRouter = require("./routes/staffRoutes");

app.use("/", authRouter);

const featuredCafes = [
  {
    name: "센터커피 서울숲",
    region: "서울 성동구",
    rating: 4.8,
    beans: "에티오피아 구지 · 내추럴",
    review: "향미가 선명하고 라이트 로스팅 필터 커피 완성도가 높아요.",
    coords: "37.5444, 127.0438",
  },
  {
    name: "프릳츠 도화점",
    region: "서울 마포구",
    rating: 4.7,
    beans: "콜롬비아 핑크버번",
    review: "디저트와 원두 밸런스가 좋아서 브런치 코스로 추천해요.",
    coords: "37.5417, 126.9512",
  },
  {
    name: "모모스커피 본점",
    region: "부산 금정구",
    rating: 4.9,
    beans: "케냐 키암부 AA",
    review: "컵노트가 깔끔하고 바리스타 설명이 친절해서 재방문 의사 100%.",
    coords: "35.2332, 129.0847",
  },
  {
    name: "테라로사 강릉",
    region: "강원 강릉시",
    rating: 4.6,
    beans: "과테말라 안티구아",
    review: "넓은 공간과 로스터리 뷰가 매력적이고 드립 메뉴가 다양해요.",
    coords: "37.7640, 128.9133",
  },
];

app.get("/", (req, res) => {
  res.render("index", {
    title: "CoffeeMap Korea",
    active: "home",
    headerTitle: "CoffeeMap Korea",
    headerSub: "전국 스페셜티 카페 탐색 · 리뷰 · 별점 · 글쓰기",
    featuredCafes,
  });
});

app.use("/estimate", requireAuth, estimateRouter);
app.use("/contract", requireAuth, contractRouter);
app.use("/library", requireAuth, libraryRouter);
app.use("/client", requireAuth, clientRouter);
app.use("/progress", requireAuth, progressRouter);
app.use("/staff", requireAuth, staffRouter);

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
