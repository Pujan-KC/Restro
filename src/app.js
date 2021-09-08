require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./routes/router");
const PORT = process.env.PORT || 5000;
const path = require("path");
const view_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");
const static_path = path.join(__dirname, "../public");
const session = require("express-session");
const flash = require("connect-flash");
const hbs = require("hbs");
//defining routers
const admin_home = require("./routes/admin");
const admin_menu = require("./routes/admin_menu");
const fileUpload = require("express-fileupload");

require("./db/conn");
app.set("view engine", "hbs");
app.set("views", view_path);
hbs.registerPartials(partial_path);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.use(express.json());

app.use(
  session({
    name: "restro",
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000, sameSite: true },
  })
);
app.use(fileUpload());
app.use(flash());

app.use("/admin/menu", admin_menu);
app.use("/admin", admin_home);
app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
