import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin Login Route
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "MiSuperPass123";
    
    if (password === adminPassword) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET || "supersecret", { expiresIn: "1d" });
      res.cookie("admin_token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie("admin_token", { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ success: true });
  });

  app.get("/api/admin/verify", (req, res) => {
    const token = req.cookies.admin_token;
    if (!token) {
      return res.status(401).json({ success: false });
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET || "supersecret");
      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ success: false });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
