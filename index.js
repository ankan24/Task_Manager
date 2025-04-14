const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
   fs.readdir("./files", (err, files) => {
      res.render("index", { files: files });
   });
});

app.get("/file/:filename", (req, res) => {
   fs.readFile(
      `./files/${req.params.filename}`,
      "utf-8",
      function (err, filedata) {
         res.render("show", { filename: req.params.filename, filedata: filedata });
      }
   );
});

app.get('/edit/:filename', (req, res) => {
   const filepath = path.join(__dirname, 'files', req.params.filename);
   fs.readFile(filepath, 'utf-8', (err, data) => {
      if (err) return res.send('File not found');
      res.render('edit', { filename: req.params.filename, filedata: data });
   });
});

app.post('/edit', (req, res) => {
   const oldPath = path.join(__dirname, 'files', req.body.previous);
   const newFilename = req.body.new.split(' ').join('') + '.txt';
   const newPath = path.join(__dirname, 'files', newFilename);
   fs.writeFile(oldPath, req.body.details, (err) => {
      if (err) return res.send('Error writing file data');
      fs.rename(oldPath, newPath, (err) => {
         if (err) return res.send('Error renaming file');
         res.redirect('/');
      });
   });
});

app.post("/create", (req, res) => {
   fs.writeFile(
      `./files/${req.body.title.split(" ").join("")}.txt`,
      req.body.details,
      function (err) {
         res.redirect("/");
      }
   );
});

app.get('/delete/:filename', (req, res) => {
   const filepath = path.join(__dirname, 'files', req.params.filename);
   fs.unlink(filepath, (err) => {
      if (err) {
         console.error("Delete failed:", err);
      }
      res.redirect('/');
   });
});

app.get("/download/:filename", (req, res) => {
   const filepath = path.join(__dirname, "files", req.params.filename);
   res.download(filepath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

