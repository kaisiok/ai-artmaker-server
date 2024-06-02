const express = require("express");
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

const corsOptions = {
  origin: ["https://ai-artmaker-client.vercel.app", "http://localhost:3001"],
  credentials: true,
};

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
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
