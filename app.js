const express = require("express");
const https = require("https");
const fs = require("fs");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const User = require("./models/user");
const Password = require("./models/password");
const Social_login = require("./models/soical_login");
const Ai_img = require("./models/ai_img");

const { verifyToken } = require("./util/fucntions");

const app = express();
const port = 3000;

const userRoutes = require("./routes/user");
const ai_imgRoutes = require("./routes/ai_img");

const httpsOptions = {
  key: fs.readFileSync("./ssl/wallmakerserver.p-e.kr-key.pem"),
  cert: fs.readFileSync("./ssl/wallmakerserver.p-e.kr-crt.pem"),
  ca: fs.readFileSync("./ssl/wallmakerserver.p-e.kr-chain.pem"),
};
const server = https.createServer(httpsOptions, app);

const corsOptions = {
  origin: [process.env.CLIENT_DOMAIN, "http://localhost:3001"],
  methods: "GET,POST,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((req, res, next) => {
  console.log(`네트워크요청확인: ${req.method} ${req.url}`);
  next();
});
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "3mb" }));
app.use(bodyParser.json());

app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/img", express.static(path.join(__dirname, "sampleimg")));
app.use(verifyToken);

app.use(userRoutes);
app.use(ai_imgRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

User.hasOne(Password, {
  foreignKey: {
    allowNull: false,
    onDelete: "CASCADE",
  },
});
User.hasOne(Social_login, {
  foreignKey: {
    allowNull: false,
    onDelete: "CASCADE",
  },
});
User.hasMany(Ai_img, {
  foreignKey: {
    allowNull: false,
    onDelete: "CASCADE",
  },
});

sequelize
  .sync()
  .then((result) => {
    server.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
