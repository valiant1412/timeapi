const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Define paths to JSON files
const employeeDataPath = path.join(__dirname, "employee.json");
const userDataPath = path.join(__dirname, "user.json");

// Middleware to validate the Authorization header
app.use("/timeapi/getemployee", (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const authHeaderParts = authHeader.split(" ");

  if (authHeaderParts.length < 2) {
    return res
      .status(401)
      .json({ error: "Invalid authorization header format" });
  }

  const tokenType = authHeaderParts[0];
  const tokenValue = authHeaderParts[1];

  // Check if the header starts with 'SpicaToken' and contains a GUID
  const tokenPattern =
    /^SpicaToken [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (tokenType !== "SpicaToken" || !tokenPattern.test(authHeader)) {
    return res.status(401).json({ error: "Invalid authorization token" });
  }

  next();
});

// Route to get employee data
app.get("/timeapi/getemployee", (req, res) => {
  fs.readFile(employeeDataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read employee data" });
    }
    try {
      const employeeData = JSON.parse(data);
      res.json(employeeData);
    } catch (parseError) {
      res.status(500).json({ error: "Failed to parse employee data" });
    }
  });
});

// Route to handle GetSession
app.post("/timeapi/Session/GetSession", (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const authHeaderParts = authHeader.split(" ");

  if (authHeaderParts.length < 2) {
    return res
      .status(401)
      .json({ error: "Invalid authorization header format" });
  }

  const tokenType = authHeaderParts[0];
  const tokenValue = authHeaderParts[1];

  // Check if the header starts with 'SpicaToken' and contains a GUID
  const tokenPattern =
    /^SpicaToken [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (tokenType !== "SpicaToken" || !tokenPattern.test(authHeader)) {
    return res.status(401).json({ error: "Invalid authorization token" });
  }

  fs.readFile(userDataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read user data" });
    }
    try {
      const userData = JSON.parse(data);
      const { Username, Password, Sid } = req.body;

      // Ensure at least one of Password or Sid is provided
      if (!Password && !Sid) {
        return res
          .status(400)
          .json({ error: "Password or Sid must be provided" });
      }

      // Find the user in the userData array
      const user = userData.find((user) => user.Username === Username);

      // Validate user existence
      if (!user) {
        return res.status(400).json({ error: "Invalid username" });
      }

      // Validate provided Password or Sid
      if (Password && user.Password !== Password) {
        return res.status(400).json({ error: "Invalid password" });
      }

      if (Sid && user.Sid !== Sid) {
        return res.status(400).json({ error: "Invalid Sid" });
      }

      // Respond with mock data
      res.json({
        Token: "70QNWKGJQ7ZHR4W3YDJO",
        TokenTimeStamp: new Date().toISOString(),
        UserId: user.UserId,
        Username: user.Username,
      });
    } catch (parseError) {
      res.status(500).json({ error: "Failed to parse user data" });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
