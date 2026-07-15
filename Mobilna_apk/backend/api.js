const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const cors = require('cors');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection({
  host: "ucka.veleri.hr",
  user: "mlakovic",
  password: "11", 
  database: "mlakovic", 
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL.");
});


app.get("/sport", (req, res) => {
  db.query("SELECT * FROM Sport", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/sport", (req, res) => {
  const { naziv_sporta, pripadajuci_tereni } = req.body;
  db.query(
    "INSERT INTO Sport (naziv_sporta, pripadajuci_tereni) VALUES (?, ?)",
    [naziv_sporta, pripadajuci_tereni],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, naziv_sporta, pripadajuci_tereni });
    }
  );
});

app.put("/sport/:id", (req, res) => {
  const { id } = req.params;
  const { naziv_sporta, pripadajuci_tereni } = req.body;
  db.query(
    "UPDATE Sport SET naziv_sporta = ?, pripadajuci_tereni = ? WHERE id = ?",
    [naziv_sporta, pripadajuci_tereni, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Sport updated successfully.");
    }
  );
});

app.delete("/sports/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Sport WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Sport deleted successfully.");
  });
});


app.get('/sportski_tereni', (req, res) => {
    db.query('SELECT * FROM Sportski_tereni', (err, results) => {
      if (err) {
        console.error('Greška pri dohvaćanju:', err);
        res.status(500).send('Greška na serveru');
      } else {
        console.log('Rezultati iz baze:', results); // Dodan log za provjeru
        res.json(results);
      }
    });
  });  

app.post("/sportski_tereni", (req, res) => {
  const {
    sifra_terena,
    lokacija,
    ocjena,
    adresa,
    naziv_sporta,
    sifra_rezervacije,
  } = req.body;
  db.query(
    "INSERT INTO Sportski_tereni (sifra_terena, lokacija, ocjena, adresa, naziv_sporta, sifra_rezervacije) VALUES (?, ?, ?, ?, ?, ?)",
    [sifra_terena, lokacija, ocjena, adresa, naziv_sporta, sifra_rezervacije],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({
        id: result.insertId,
        sifra_terena,
        lokacija,
        ocjena,
        adresa,
        naziv_sporta,
        sifra_rezervacije,
      });
    }
  );
});

app.put("/sportski_tereni/:id", (req, res) => {
  const { id } = req.params;
  const {
    sifra_terena,
    lokacija,
    ocjena,
    adresa,
    naziv_sporta,
    sifra_rezervacije,
  } = req.body;
  db.query(
    "UPDATE Sportski_tereni SET sifra_terena = ?, lokacija = ?, ocjena = ?, adresa = ?, naziv_sporta = ?, sifra_rezervacije = ? WHERE id = ?",
    [
      sifra_terena,
      lokacija,
      ocjena,
      adresa,
      naziv_sporta,
      sifra_rezervacije,
      id,
    ],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Sportski teren updated successfully.");
    }
  );
});

app.delete("/sportski_tereni/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Sportski_tereni WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Sportski teren deleted successfully.");
  });
});

app.get("/rezervacije", (req, res) => {
    db.query("SELECT * FROM Rezervacije_terena", (err, results) => {
      if (err) {
        console.error("Greška pri dohvaćanju rezervacija:", err);
        return res.status(500).send(err);
      }
      res.json(results);
    });
  });
  
app.put("/rezervacije/:sifra_rezervacije", (req, res) => {
    const { sifra_rezervacije } = req.params;
    const {
      datum_i_vrijeme_rezervacije,
      ime_korisnika_koji_rezervira,
      sifra_korisnika,
    } = req.body;
  
    db.query(
      "UPDATE Rezervacije_terena SET datum_i_vrijeme_rezervacije = ?, ime_korisnika_koji_rezervira = ?, sifra_korisnika = ? WHERE sifra_rezervacije = ?",
      [
        datum_i_vrijeme_rezervacije,
        ime_korisnika_koji_rezervira,
        sifra_korisnika,
        sifra_rezervacije,
      ],
      (err) => {
        if (err) {
          console.error("Greška pri ažuriranju rezervacije:", err);
          return res.status(500).send(err);
        }
        res.send("Rezervacija uspješno ažurirana.");
      }
    );
  });
  

app.post("/rezervacije", (req, res) => {
  const {
    datum_i_vrijeme_rezervacije,
    ime_korisnika_koji_rezervira
  } = req.body;

  // 1. PRONAĐI ID KORISNIKA
  db.query(
    "SELECT sifra_korisnika FROM Korisnik WHERE korisnicko_ime = ?",
    [ime_korisnika_koji_rezervira],
    (err, results) => {
      if (err) {
        console.error("Greška pri dohvaćanju korisnika:", err);
        return res.status(500).send(err);
      }

      if (results.length === 0) {
        return res.status(400).send("Korisnik ne postoji");
      }

      const sifra_korisnika = results[0].sifra_korisnika;

      // 2. INSERT REZERVACIJE
      db.query(
        "INSERT INTO Rezervacije_terena (datum_i_vrijeme_rezervacije, ime_korisnika_koji_rezervira, sifra_korisnika) VALUES (?, ?, ?)",
        [datum_i_vrijeme_rezervacije, ime_korisnika_koji_rezervira, sifra_korisnika],
        (err, result) => {
          if (err) {
            console.error("Greška pri dodavanju rezervacije:", err);
            return res.status(500).send(err);
          }

          res.json({
            sifra_rezervacije: result.insertId,
            datum_i_vrijeme_rezervacije,
            ime_korisnika_koji_rezervira,
            sifra_korisnika,
          });
        }
      );
    }
  );
});
  
app.delete("/rezervacije/:sifra_rezervacije", (req, res) => {
    const { sifra_rezervacije } = req.params;
  
    db.query(
      "DELETE FROM Rezervacije_terena WHERE sifra_rezervacije = ?",
      [sifra_rezervacije],
      (err) => {
        if (err) {
          console.error("Greška pri brisanju rezervacije:", err);
          return res.status(500).send(err);
        }
        res.send("Rezervacija uspješno obrisana.");
      }
    );
  });

app.get("/korisnici", (req, res) => {
  db.query("SELECT * FROM Korisnik", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/korisnici", (req, res) => {
    const { korisnicko_ime, e_mail, lozinka } = req.body;
    const role = "user";
    
    if (!korisnicko_ime || !e_mail || !lozinka) {
      return res.status(400).json({ error: "Sva polja su obavezna" });
    }
  
    db.query(
      "INSERT INTO Korisnik (korisnicko_ime, e_mail, lozinka, role) VALUES (?, ?, ?, ?)",
      [korisnicko_ime, e_mail, lozinka, role],
      (err, result) => {
        if (err) {
          console.error("Greška pri dodavanju korisnika:", err);
          return res.status(500).send(err);
        }
        res.status(201).json({ message: "Korisnik uspješno registriran!" });
      }
    );
  }); 

app.put("/korisnici/:id", (req, res) => {
    const { id } = req.params; // Ovo je sifra_korisnika
    const { korisnicko_ime, e_mail, lozinka, role } = req.body; // Dodano role za promjenu uloge
    db.query(
      "UPDATE Korisnik SET korisnicko_ime = ?, e_mail = ?, lozinka = ?, role = ? WHERE sifra_korisnika = ?",
      [korisnicko_ime, e_mail, lozinka, role, id],
      (err) => {
        if (err) {
          console.error("Greška prilikom ažuriranja korisnika:", err);
          return res.status(500).send("Greška na serveru");
        }
        res.send({ message: "Korisnik uspješno ažuriran" });
      }
    );
  });
  
app.delete("/korisnici/:id", (req, res) => {
    const { id } = req.params; // Ovo je sifra_korisnika
    db.query("DELETE FROM Korisnik WHERE sifra_korisnika = ?", [id], (err) => {
      if (err) {
        console.error("Greška prilikom brisanja korisnika:", err);
        return res.status(500).send("Greška na serveru");
      }
      res.send({ message: "Korisnik uspješno obrisan" });
    });
  });
  
app.post('/login', (req, res) => {
    const { korisnicko_ime, lozinka } = req.body;
  
    if (!korisnicko_ime || !lozinka) {
      return res.status(400).json({ error: 'Korisničko ime i lozinka su obavezni' });
    }
  
    const query = `
      SELECT role FROM Korisnik
      WHERE korisnicko_ime = ? AND lozinka = ?
    `;
  
    db.query(query, [korisnicko_ime, lozinka], (err, results) => {
      if (err) {
        console.error('Greška pri provjeri korisnika:', err);
        return res.status(500).json({ error: 'Greška na serveru' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Neispravno korisničko ime ili lozinka' });
      }
  
      const user = results[0];
      res.json({ role: user.role });
    });
  });
  
app.get("/recenzije", (req, res) => {
    db.query("SELECT * FROM Ocjene_recenzije_terena", (err, results) => {
      if (err) {
        console.error("Greška pri dohvaćanju recenzija:", err);
        return res.status(500).send(err);
      }
      res.json(results);
    });
  });
  

app.post("/ocjene_recenzije", (req, res) => {
  const { ocjena, komentar, sifra_korisnika } = req.body;
  db.query(
    "INSERT INTO Ocjene_recenzije_terena (ocjena, komentar, sifra_korisnika) VALUES (?, ?, ?)",
    [ocjena, komentar, sifra_korisnika],
    (err, result) => {
      if (err) {
        console.error("Greška pri dodavanju recenzije:", err);
        return res.status(500).send(err);
      }
      res.json({
        sifra_recenzije: result.insertId,
        ocjena,
        komentar,
        sifra_korisnika,
      });
    }
  );
});


app.put("/ocjene_recenzije/:sifra_recenzije", (req, res) => {
    const { sifra_recenzije } = req.params;
    const { ocjena, komentar, sifra_korisnika } = req.body;
  
    db.query(
      "UPDATE Ocjene_recenzije_terena SET ocjena = ?, komentar = ?, sifra_korisnika = ? WHERE sifra_recenzije = ?",
      [ocjena, komentar, sifra_korisnika, sifra_recenzije],
      (err) => {
        if (err) {
          console.error("Greška pri ažuriranju recenzije:", err);
          return res.status(500).send(err);
        }
        res.send("Recenzija uspješno ažurirana.");
      }
    );
  });
  
app.delete("/ocjene_recenzije/:sifra_recenzije", (req, res) => {
    const { sifra_recenzije } = req.params;
    console.log("Šifra recenzije za brisanje:", sifra_recenzije); // Debugging
    db.query(
      "DELETE FROM Ocjene_recenzije_terena WHERE sifra_recenzije = ?",
      [sifra_recenzije],
      (err) => {
        if (err) {
          console.error("Greška pri brisanju recenzije:", err);
          return res.status(500).send(err);
        }
        res.send("Recenzija uspješno obrisana.");
      }
    );
});
    
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});