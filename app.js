const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const port = 8000;

const allowedOrigins = [
  "https://arbazwizard01.github.io",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use("/ai", aiRoutes);

app.use((req, res, next) => {
  console.log(`Incoming request: [${req.method}] ${req.url}`);
  next();
});

const uri =
  "mongodb+srv://arbaz957:arbaz4dev@cluster0.shesi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);
const dbName = "NoteNest";
const collectionName = "notes";

const main = async () => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const notesCollection = db.collection(collectionName);

    
    app.post("/", async (req, res) => {
      const { title, content } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title and Content Required" });
      }
      const newNote = { title, content, createdAt: new Date() };
      await notesCollection.insertOne(newNote);
      res.status(200).json({ message: "Note Added Successfully", note: newNote });
    });

  
    app.get("/", async (req, res) => {
      try {
        const notes = await notesCollection.find({}).toArray();
        if (notes.length === 0) {
          return res.status(404).json({ message: "No notes found" });
        }
        res.status(200).json(notes);
      } catch (err) {
        console.error("Error getting notes", err);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await notesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Note deleted successfully" });
        } else {
          res.status(404).json({ message: "Note not found" });
        }
      } catch (err) {
        console.error("Error deleting note:", err);
        res.status(500).json({ message: "Failed to delete note" });
      }
    });

    
    app.put("/:id", async (req, res) => {
      const { id } = req.params;
      const { title, content } = req.body;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (!title || !content) {
        return res.status(400).json({ message: "Title and Content is required" });
      }

      try {
        const result = await notesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, content, updatedAt: new Date() } }
        );
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Note updated successfully" });
        } else {
          res.status(404).json({ message: "Note not found!" });
        }
      } catch (err) {
        console.error("Error updating note:", err);
        res.status(500).json({ message: "Failed to update note" });
      }
    });

    
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error Connecting to MongoDB", err);
    process.exit(1);
  }
};

main();
