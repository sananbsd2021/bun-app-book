import { Database } from "bun:sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = "your_secret_key";

// สร้างฐานข้อมูล SQLite
const db = new Database("mydb.sqlite");

// ==============================
// Books CRUD Operations
// ==============================

// ดึงหนังสือทั้งหมด
const getBooks = () => {
  try {
    const query = db.query("SELECT * FROM books;");
    return query.all();
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

// ดึงหนังสือตาม ID
const getBook = (id: number) => {
  try {
    const query = db.query("SELECT * FROM books WHERE id = $id;");
    return query.get({ $id: id });
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    return null;
  }
};

// เพิ่มหนังสือใหม่
const createBook = (book: { name: string; author: string; price: number }) => {
  try {
    if (!book.name || !book.author || !book.price) {
      throw new Error("Validation Fail: All fields are required.");
    }

    const query = db.query(
      `INSERT INTO books (name, author, price) 
       VALUES ($name, $author, $price);`
    );

    query.run({
      $name: book.name,
      $author: book.author,
      $price: book.price,
    });

    return { success: true, message: "Book added successfully" };
  } catch (error) {
    console.error("Error creating book:", error);
    return { success: false, message: error.message };
  }
};

// อัปเดตหนังสือโดยใช้ ID
const updateBook = (
  id: number,
  book: { name: string; author: string; price: number }
) => {
  try {
    const query = db.query(
      `UPDATE books 
       SET name = $name, author = $author, price = $price 
       WHERE id = $id;`
    );

    query.run({
      $id: id,
      $name: book.name,
      $author: book.author,
      $price: book.price,
    });

    return { success: true, message: "Book updated successfully" };
  } catch (error) {
    console.error("Error updating book:", error);
    return { success: false, message: error.message };
  }
};

// ลบหนังสือโดยใช้ ID
const deleteBook = (id: number) => {
  try {
    const query = db.query("DELETE FROM books WHERE id = $id;");
    query.run({ $id: id });

    return {
      success: true,
      message: `Book with ID ${id} deleted successfully.`,
    };
  } catch (error) {
    console.error("Error deleting book:", error);
    return { success: false, message: error.message };
  }
};

// ==============================
// Users CRUD Operations
// ==============================

// เพิ่มผู้ใช้ใหม่

const createUser = async (user: { email: string; password: string }) => {
  try {
    if (!user.email || !user.password) {
      throw new Error("Validation Fail: All fields are required.");
    }

    // ตรวจสอบว่าอีเมลมีอยู่แล้วหรือไม่
    const checkQuery = db.query("SELECT * FROM users WHERE email = $email;");
    const existingUser = checkQuery.get({ $email: user.email });

    if (existingUser) {
      return { success: false, message: "Email is already registered." };
    }

    // แฮชรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // เพิ่มผู้ใช้ใหม่ในฐานข้อมูล
    const query = db.query(
      `INSERT INTO users (email, password) 
       VALUES ($email, $password);`
    );

    query.run({
      $email: user.email,
      $password: hashedPassword,
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: error.message };
  }
};

// ดึงผู้ใช้ตาม ID
const getUser = (id: number) => {
  try {
    const query = db.query("SELECT * FROM users WHERE id = $id;");
    return query.get({ $id: id });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

// ลบผู้ใช้โดยใช้ ID
const deleteUser = (id: number) => {
  try {
    const query = db.query("DELETE FROM users WHERE id = $id;");
    query.run({ $id: id });

    return {
      success: true,
      message: `User with ID ${id} deleted successfully.`,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: error.message };
  }
};

// ==============================
// ฟังก์ชันเพิ่มเติมสำหรับผู้ใช้
// ==============================

// loginUser

const loginUser = async (email: string, password: string) => {
  try {
    const query = db.query("SELECT * FROM users WHERE email = $email;");
    const user = query.get({ $email: email });

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" };
    }

    // สร้าง JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h", // Token หมดอายุใน 1 ชั่วโมง
    });

    return {
      success: true,
      message: "Login successful",
      token, // ส่ง Token กลับไป
    };
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, message: "An error occurred during login" };
  }
};

// ==============================
// Exports
// ==============================
export {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  createUser,
  getUser,
  deleteUser,
  loginUser,
};
