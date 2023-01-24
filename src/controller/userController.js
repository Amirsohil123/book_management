const userModel = require("../model/UserModel.js");
const validation = require("../validator/validation");
const jwt = require("jsonwebtoken");
let { isValidName, isValidPhone, isValidEmail, isValidPassword} = validation;

exports.createUser = async function (req, res) {
  try {
    let data = req.body;
    let { title, name, phone, email, password } = data;
    if (Object.keys(data).length == 0) {
        return res
        .status(400)
        .send({ status: false, msg: "Please provide key in request body" });
    }
    Object.keys(data).forEach(x=>data[x]=data[x].toString().trim());

    if (!title) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide title" });
    }

    if (!name) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide name" });
    }
    if (!phone) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide phone no." });
    }
    if (!email) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide email" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide password" });
    }
    if (!isValidName(title)) {
      return res
        .status(400)
        .send({ status: false, msg: "title should be alphabets only" });
    }

    if (!isValidName(name)) {
      return res
        .status(400)
        .send({ status: false, msg: "name should be alphabets only" });
    }

    if (!isValidPhone(phone))
      return res
        .status(400)
        .send({ status: false, message: "please provide a valid phone no." });

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "Provide a valid email" });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .send({ status: false, msg: "please provide valid password" });
    }

    let check = await userModel.findOne({$or: [{email}, {phone}]});
    if(check){
        if (check.email==email) {
            return res.status(400).send({ status: false, message: "This email is already exist." });
        }
        if (check.phone==phone) {
            return res.status(400).send({ status: false, message: "This phone is already exist." });
        }
    }

    let create = await userModel.create(data);

    res.status(201).send({ status: true, data: create });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

exports.loginUser = async function (req, res) {
  let body = req.body;
  let email = body.email;
  let password = body.password;
  if (Object.keys(body).length === 0)
    return res.status(400).send("please provide email and password");
  if (!email) return res.status(400).send("plz provide email");
  if (!password) return res.status(400).send("plz provide password");

  if (!isValidEmail(email))
    return res.status(400).send("Invalid email, please provide valid email");

  if (!isValidPassword(password))
    return res
      .status(400)
      .send("Invalid password, please enter valid password");

  let user = await userModel.findOne({ email: email, password: password });
  if (!user)
    return res.status(404).send({ status: false, message: "login failed" });

  let token = jwt.sign(
    {
      id: user._id.toString(),
    },
    "Book-management-secure-key",
    { expiresIn: "10m" }
  );

  res.setHeader("jwt-key", token);
  res
    .status(200)
    .send({
      status: true,
      message: "Success",
      data: { token: token, exp: "10m", userId: user._id, iat: Date.now() },
    });
};