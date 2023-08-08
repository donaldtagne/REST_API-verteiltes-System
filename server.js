
const express = require('express');
const {db, db_1} = require('./datenbank.js');
const app = express();
const HTTP_PORT = 8000;

app.use(express.json()); /* Für das Parsen von JSON im Body der Anfragen*/

/*GET-Endpunkt für alle Customers*/
app.get("/api/customers", async (req, res) => {
  let sql = `
    SELECT customer.*, customer_1.*
    FROM customer
    JOIN customer_1 ON customer.C_id = customer_1.C_id
    
  `;
  console.time("Get Customers Query Time");
  try {
    const [rows] = await db.query(sql);
    console.timeEnd("Get Customers Query Time");
    res.json({ message: "Success", data: rows });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

  async function generateCustomers(numCustomers) {
    const [rows] = await db.query('SELECT * FROM customer');
  
    const customers = [];
    for (let i = 1; i <= numCustomers; i++) {
      const id = i;
      const user = `user${id}`;
      const password = `password${id}`;
      const firstName = `First${id}`;
      const lastName = `Last${id}`;
      const address = `address${id}`;
      const email = `${user}@example.com`;
      const c_since = 1 + (i * 0.1);
      customers.push([id, user, password, firstName, lastName, address, email, c_since]);
    }
    return customers;
  }
  
  async function generateCustomers1(numCustomers) {
    const [rows] = await db.query('SELECT * FROM customer_1');
    const customers1 = [];
    for (let i = 1; i <= numCustomers; i++) {
      const id =  i;
      const last_login = `2022-06-${String((i % 30) + 1).padStart(2, '0')}`;
      const login = `user${id}`;
      const expiration = `2023-06-${String((i % 30) + 1).padStart(2, '0')}`;
      const discount = (i * 0.1).toFixed(1);
      const balance = String(i * 100);
      const ytd_pmt = String(i * 1000);
      const birthdate = `1990-${String((i % 12) + 1).padStart(2, '0')}-10`;
      customers1.push([id, last_login, login, expiration, discount, balance, ytd_pmt, birthdate]);
    }
    return customers1;
  }
  
  app.post("/api/customer", async (req, res) => {
    const numCustomers = req.body.numCustomers;  /*Anzahl der zu generierenden Kunden*/
    if (typeof numCustomers !== 'number' || numCustomers <= 0) {
      res.status(400).json({ error: "Invalid number of customers." });
      return;
    }
    
    try {
      /*Löschen aller Einträge aus den Tabellen 'customer' und 'customer_1'*/
      await db.query('DELETE FROM customer');
      await db_1.query('DELETE FROM customer_1');
      
      const customers = await generateCustomers(numCustomers);  /*Generieren der Kunden*/
      const customers1 = await generateCustomers1(numCustomers); /*Generieren der Kunden1*/
      console.time("Insert Customers Query Time");
      
      /*Einfügen der Kunden in die Datenbank*/

      for (let i = 0; i < numCustomers; i++) {
        let sql = `
          INSERT INTO customer (C_id, C_UNAME, C_PASSWD, C_FNAME, C_LNAME, C_ADDR_ID, C_EMAIL, C_SINCE) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, customers[i]);
  
        sql = `
          INSERT INTO customer_1 (C_id, C_LAST_LOGIN, C_LOGIN, C_EXPIRATION, C_DISCOUNT, C_BALANCE, C_YTD_PMT, C_BIRTHDATE) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db_1.query(sql, customers1[i]);
      }
      console.timeEnd("Insert Customers Query Time"); 
  
      res.status(201).json({ message: `Success, ${numCustomers} new customers created` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});
app.listen(HTTP_PORT, () => {
  console.log(`Server started on port ${HTTP_PORT}`);
});
app.use((req, res) => {
  res.status(404).json({
    message: "Status not found: invalid request!!!",
  });
});
