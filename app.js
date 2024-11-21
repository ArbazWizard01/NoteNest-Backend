const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const e = require("express");

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

const uri =
  "mongodb+srv://arbaz957:arbaz4dev@cluster0.shesi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri); // Corrected to MongoClient

const dbName = "NoteNest";
const collectionName = "notes";

const main = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName); // Get the database
    const notesCollection = db.collection(collectionName); // Get the collection

    app.post("/", async (req, res) => {
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "Title and Content Required" });
      }
      const newNote = { title, content, createdAt: new Date() };
      await notesCollection.insertOne(newNote);
      res
        .status(200)
        .json({ message: "Note Added Successfully", note: newNote });
    });

    app.get("/", async (req, res) => {
      try {
        const notes = await notesCollection.find({}).toArray();
        if (notes.length === 0) {
          res.status(404).json({ message: "No notes found" });
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
        const result = await notesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        console.log("Delete Result:", result); // Log this to check the deletion result
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

    app.listen(port, () => {
      console.log(`Server is running on localhost:${port}`);
    });
  } catch (err) {
    console.error("Error Connecting to MongoDB", err);
    process.exit(1);
  }
};

main();
