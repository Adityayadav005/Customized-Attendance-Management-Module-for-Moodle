const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "guru.gndec.ac.in",
  user: "aditya",
  password: "Retry@321",
  database: "guru_2324",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});


// Dummy user data
const users = [
  { username: "admin", password: "admin123" },
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
];


// Root endpoint
app.get('/', (req, res) => {
  return res.json("from backend side");
});


// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists and the password matches
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    res.status(200).json({ success: true, message: "Login successful!" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials." });
  }
});

// API endpoint to fetch guru_attendance
app.get("/guru_attendance", (req, res) => {
  db.query("SELECT id,course FROM guru_attendance", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API endpoint to fetch guru_attendance_sessions
app.get("/guru_attendance_sessions", (req, res) => {
  db.query("SELECT id,attendanceid,sessdate,duration,lasttakenby,lasttaken,timemodified FROM guru_attendance_sessions", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API endpoint to fetch guru_course
app.get("/guru_course", (req, res) => {
  db.query("SELECT id,fullname,category FROM guru_course", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API endpoint to fetch guru_user
app.get("/guru_user", (req, res) => {
  const query = ("select id,firstname,lastname from guru_user");
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// API endpoint to fetch guru_user
app.get("/guru_course_categories", (req, res) => {
    const query = ("select id,name,parent from guru_course_categories");
    db.query(query, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(result);
      }
    });
  });

const PORT = 5001;
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" << PORT);
});





// const express = require("express");
// const mysql = require("mysql2");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MySQL connection
// const db = mysql.createConnection({
//   host: "guru.gndec.ac.in",
//   user: "aditya",
//   password: "Retry@321",
//   database: "guru_2324",
// });

// db.connect((err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//   } else {
//     console.log("Connected to MySQL database");
//   }
// });


// // Dummy user data
// const users = [
//   { username: "hod_cse", password: "cse123", role: "HOD", department: "Computer Science and Engineering" },
//   { username: "hod_ece", password: "ece123", role: "HOD", department: "ECE" },
//   { username: "admin", password: "admin123", role: "Admin", department: null },
// ];



// // Root endpoint
// app.get('/', (req, res) => {
//   return res.json("from backend side");
// });


// // Login endpoint
// app.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   // Check if the user exists and the password matches
//   const user = users.find(
//     (user) => user.username === username && user.password === password
//   );

//   if (user) {
//     res.status(200).json({ success: true, message: "Login successful!",role: user.role,
//       department: user.department, });
//   } else {
//     res.status(401).json({ success: false, message: "Invalid credentials." });
//   }
// });

// // API endpoint to fetch guru_attendance
// app.get("/guru_attendance", (req, res) => {
//   const { department } = req.query; // Receive department as a query parameter

//   let query = "SELECT id, course FROM guru_attendance";
//   const params = [];

//   if (department) {
//     query += " JOIN guru_course ON guru_attendance.course = guru_course.id";
//     query += " JOIN guru_course_categories AS cat ON guru_course.category = cat.id";
//     query += " WHERE cat.name = ?";
//     params.push(department);
//   }

//   db.query(query, params, (err, result) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.json(result);
//     }
//   });
// });


// // API endpoint to fetch guru_attendance_sessions
// app.get("/guru_attendance_sessions", (req, res) => {
//   db.query("SELECT id,attendanceid,sessdate,duration,lasttakenby,lasttaken,timemodified FROM guru_attendance_sessions", (err, result) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.json(result);
//     }
//   });
// });

// // API endpoint to fetch guru_course filtered by department
// app.get("/guru_course", (req, res) => {
//   const { department } = req.query; // Pass department in query params

//   const query =
//     department && department !== "all"
//       ? `SELECT id, fullname, category FROM guru_course WHERE category IN (SELECT id FROM guru_course_categories WHERE name='${{ComputerScienceandEngineering}}')`
//       : "SELECT id, fullname, category FROM guru_course";

//   db.query(query, (err, result) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.json(result);
//     }
//   });
// });

// // API endpoint to fetch guru_user
// app.get("/guru_user", (req, res) => {
//   const query = ("select id,firstname,lastname from guru_user");
//   db.query(query, (err, result) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.json(result);
//     }
//   });
// });

// // API endpoint to fetch guru_user
// app.get("/guru_course_categories", (req, res) => {
//     const query = ("select id,name,parent from guru_course_categories");
//     db.query(query, (err, result) => {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         res.json(result);
//       }
//     });
//   });

// const PORT = 5001;
// app.listen(PORT, () => {
//   console.log("Server is running on http://localhost:" << PORT);
// });