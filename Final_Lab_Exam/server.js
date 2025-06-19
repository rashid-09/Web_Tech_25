
let mongoose = require("mongoose");
let express = require("express");
let expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const User = require("./models/userModal");
const Product = require("./models/productModal");
const Vehicle = require("./models/vehicleModal");
const upload = require("./middlewares/upload");
session_secret_key="$%aqbscscubqscu@";
let server = express();

server.use(
  session({
    secret: session_secret_key,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

server.use(express.json());
server.use(express.static("public"));
server.use(expressLayouts);
server.use(express.urlencoded());
server.set("view engine", "ejs");

server.get("/", async (req, res) => {
  try {
    const products = await Product.find(); 
    res.render("homepage", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error on homepage");
  }
});


server.get("/login", (req, res) => {
  res.render("login");
});
server.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: req.session.errorMessage,
    successMessage: req.session.successMessage,
  });

  delete req.session.errorMessage;
  delete req.session.successMessage;
});

server.post("/register-submit", async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  // Check if password and confirmPassword match
  if (password !== confirmPassword) {
    req.session.errorMessage = "Passwords do not match"; // Store error in session
    return res.redirect("/register"); // Redirect back to the registration page
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.session.errorMessage = "User already exists"; // Store error in session
      return res.redirect("/register"); // Redirect back to the registration page
    }

    // Create and save the new user
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    req.session.successMessage = "User registered successfully"; // Store success message
    res.redirect("/"); // Redirect to a success page (e.g., dashboard, home, etc.)
  } catch (error) {
    console.error(error);
    req.session.errorMessage = "Server error"; // Store error in session
    res.redirect("/register"); // Redirect back to the registration page
  }
});

// Login Route
server.post("/login-submit", async (req, res) => {
  const { email, password } = req.body;

  console.log("Email" , email[0])
  console.log("Password" , email[1])


  try {
    const user = await User.findOne({ email: email[0] });
    if (!user) {
      req.session.errorMessage = "Invalid credentials"; // Store error in session
      return res.redirect("/login"); // Redirect back to the login page
    }

    const isMatch = await user.comparePassword(email[1]);
    if (!isMatch) {
      req.session.errorMessage = "Invalid credentials"; // Store error in session
      return res.redirect("/login"); // Redirect back to the login page
    }

    req.session.user = user;
    req.session.successMessage = "Login successful"; // Store success message
    res.redirect("/"); // Redirect to a success page (e.g., dashboard, home, etc.)
  } catch (error) {
    console.error(error);
    req.session.errorMessage = "Server error"; // Store error in session
    res.redirect("/login"); // Redirect back to the login page
  }
});






//Product Routes

// Fetch all products
server.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("products", { products }); // You need to create this EJS view
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while fetching products");
  }
});

// Fetch single product by ID
server.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.render("product-details", { product }); // You need to create this EJS view
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while fetching product");
  }
});





// Cart Routes

// Add to cart
server.post("/add-to-cart/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const existingProduct = req.session.cart.find(item => item.productId === product._id.toString());

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      // 🔧 UPDATE THIS PART
      req.session.cart.push({
        productId: product._id.toString(),
        name: product.name,
        price: Number(product.price), // ✅ Convert string to number here
        image: product.image,
        quantity: 1,
      });
    }

    res.redirect("/cart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while adding to cart");
  }
});


// View cart
server.get("/cart", (req, res) => {
  const cart = req.session.cart || [];

  // Total calculation
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  res.render("cart", { cart, total });
});

// Remove item from cart
server.post("/remove-from-cart/:id", (req, res) => {
  const productId = req.params.id;
  req.session.cart = req.session.cart?.filter(item => item.productId !== productId) || [];
  res.redirect("/cart");
});


// Vechicle Routes

// View all vehicles (read-only)
server.get("/vehicles", async (req, res) => {
  const vehicles = await Vehicle.find();
  res.render("vehicles/index", { vehicles });
});

// Show form to create vehicle
server.get("/vehicles/new", (req, res) => {
  res.render("vehicles/new");
});

// Handle create vehicle
server.post("/vehicles", upload.single("image"), async (req, res) => {
  const { name, brand, price, type } = req.body;
  const image = req.file?.filename;

  if (!name || !brand || !price || !type || !image) {
    return res.send("All fields are required.");
  }

  await Vehicle.create({ name, brand, price, type, image });
  res.redirect("/vehicles");
});

// Show edit form
server.get("/vehicles/:id/edit", async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  res.render("vehicles/edit", { vehicle });
});

// Handle update
server.post("/vehicles/:id", upload.single("image"), async (req, res) => {
  const { name, brand, price, type } = req.body;
  const image = req.file?.filename;

  const updateData = { name, brand, price, type };
  if (image) updateData.image = image;

  await Vehicle.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/vehicles");
});

// Delete vehicle
server.post("/vehicles/:id/delete", async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.redirect("/vehicles");
});





// server.use("/", require("./controllers/admin/admin.products.controller"));

// server.get("/categories", (req, res) => {
//   res.render("categories");
// });
// server.get("/", async (req, res) => {
//   //   res.send("Hello AI Classs");
//   let Product = require("./models/product.model");
//   let products = await Product.find();
//   // return res.send(products);
//   res.render("homepage", { products });
// });


async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/web_dev", {
    });
    console.log("Local MongoDB connected successfully!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

connectToDatabase();

server.listen(4000, () => {
  console.log("Server Started at localhost:4000");
});
