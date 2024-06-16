const express = require("express");
const helmet = require("helmet");
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

const keyPath = "./ssl/wallmakerserver.p-e.kr-key.pem";
const certPath = "./ssl/wallmakerserver.p-e.kr-crt.pem";
const caPath = "./ssl/wallmakerserver.p-e.kr-chain.pem";

const corsOptions = {
  origin: [process.env.CLIENT_DOMAIN, "http://localhost:3001"],
  methods: "GET,POST,DELETE,PUT",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((req, res, next) => {
  console.log(`네트워크요청확인: ${req.method} ${req.url}`);
  next();
});
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/img", express.static(path.join(__dirname, "sampleimg")));
app.use(helmet());
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
    if (
      fs.existsSync(keyPath) &&
      fs.existsSync(certPath) &&
      fs.existsSync(caPath)
    ) {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
        ca: fs.readFileSync(caPath),
      };
      const server = https.createServer(httpsOptions, app);
      server.listen(port, () => {
        console.log(`https app listening on port ${port}`);
      });
    } else {
      app.listen(port, () => {
        console.log(`http app listening on port ${port}`);
      });
    }
  })
  .catch((err) => {
    console.log(err);
  });
