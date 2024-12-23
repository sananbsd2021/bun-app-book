import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
  createUser,
} from "./models";

const app = new Elysia();

// เพิ่ม Swagger สำหรับเอกสาร API
app.use(
  swagger({
    path: "/v1/swagger",
  })
)


app.get("/", () => "Welcome to Elysia! Go to /search to start searching")
// ==============================
// Books API
// ==============================

// Get All Books
app.get("/books", () => getBooks());

// Get Book by ID
app.get("/books/:id", ({ params }) => {
  const bookId: number = parseInt(params.id);
  return getBook(bookId);
});

// Add a New Book
app.post(
  "/books",
  ({ body, set }) => {
    const bookBody: any = body;
    const response = createBook({
      name: bookBody.name,
      author: bookBody.author,
      price: bookBody.price,
    });

    if (response.status === "error") {
      set.status = 400; // Bad Request
      return { message: "Insert incomplete" };
    }

    return { message: "Book added successfully" };
  },
  {
    body: t.Object({
      name: t.String(),
      author: t.String(),
      price: t.Number(),
    }),
  }
);

// Update Book by ID
app.put(
  "/books/:id",
  ({ params, body, set }) => {
    try {
      const bookId: number = parseInt(params.id);
      const bookBody: any = body;

      const response = updateBook(bookId, {
        name: bookBody.name,
        author: bookBody.author,
        price: bookBody.price,
      });

      if (response.status === "error") {
        set.status = 400; // Bad Request
        return { message: "Update incomplete" };
      }

      return { message: "Book updated successfully" };
    } catch (error) {
      set.status = 500; // Internal Server Error
      return { message: "Error: Something went wrong" };
    }
  },
  {
    body: t.Object({
      name: t.String(),
      author: t.String(),
      price: t.Number(),
    }),
  }
);

// Delete Book by ID
app.delete("/books/:id", ({ params, set }) => {
  try {
    const bookId: number = parseInt(params.id);
    deleteBook(bookId);
    return { message: `Book with ID ${bookId} deleted successfully` };
  } catch (error) {
    set.status = 500; // Internal Server Error
    return { message: "Error: Unable to delete book" };
  }
});

// ==============================
// User API
// ==============================

// Register a New User
app.post(
  "/register",
  async ({ body, set }) => {
    try {
      // รับค่าที่จำเป็นจาก body
      const { email, password } = body;

      // แฮชพาสเวิร์ดด้วย bcrypt
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10, // ความซับซ้อน
      });

      // สร้างข้อมูล user ใหม่
      const userData = { email, password: hashedPassword };
      await createUser(userData);

      return { message: "User created successfully" };
    } catch (error) {
      console.error("Error during user registration:", error);
      set.status = 500; // Internal Server Error
      return {
        message: "An error occurred during registration",
        error: error.message || error,
      };
    }
  },
  {
    body: t.Object({
      email: t.String({
        format: "email", // ตรวจสอบว่าเป็นอีเมล
        minLength: 5,
        maxLength: 50,
      }),
      password: t.String({
        minLength: 6, // รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร
      }),
    }),
  }
);

// ==============================
// เริ่มต้นเซิร์ฟเวอร์
// ==============================
app.listen(8000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
