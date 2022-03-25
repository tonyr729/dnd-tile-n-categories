const path = require('path');
const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');
const { stablishedConnection, closeDbConnection } = require('./db/dbConnection');

const PORT = process.env.PORT || 8080;

console.log('DB_HOST: ', process.env.DB_HOST);

const app = express();

app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve the files for our built React app
app.use(express.static(path.resolve(__dirname, 'build')));

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////
// GET /v1/user
////////////////////////////////////////////////////////////////////////////////
router.get('/user', (req, res) => {
  stablishedConnection()
    .then((db) => {
      const user = JSON.parse(req.query.user);

      const employeeIdQuery = `
      SELECT employee_id, role_id, initial_login
      FROM dev_web_eis.emp_id_to_email_xref AS idxe
      JOIN dev_web_eis.eis_employee AS employee
      ON idxe.emp_id = employee.employee_id
      WHERE idxe.email_addr = "${user.userName}";
    `;

      db.query(employeeIdQuery, function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send({ message: err.message });
        } else {
          const dbUser = result[0];
          res.send({
            ...dbUser,
            email: user.userName,
            name: user.profile.given_name,
            jobTitle: user.profile.jobTitle,
          });
          closeDbConnection(db);
          console.log('Db Connection close Successfully');
        }
      });
    })
    .catch((error) => {
      console.log('Db not connected successfully', error);
      return res.status(502).send({ error });
    });
});

////////////////////////////////////////////////////////////////////////////////
// GET /v1/user
////////////////////////////////////////////////////////////////////////////////
router.get('/user', (req, res) => {
  stablishedConnection()
    .then((db) => {
      const employeeIdQuery = `
        SELECT employee_id, role_id, initial_login
        FROM dev_web_eis.emp_id_to_email_xref AS idxe
        JOIN dev_web_eis.eis_employee AS employee
        ON idxe.emp_id = employee.employee_id
        WHERE idxe.email_addr = "${req.query.employeeEmail}";
      `;

      // Cross reference employee email to receive their ID
      db.query(employeeIdQuery, function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send({ message: err.message });
        } else {
          const user = result[0];
          user.email = req.query.employeeEmail;
          user.initial_login = Boolean(user.initial_login);
          res.send(result[0]);
          closeDbConnection(db);
          console.log('Db Connection close Successfully');
        }
      });
    })
    .catch((error) => {
      console.log('Db not connected successfully', error);
      return res.status(502).send({ error });
    });
});

////////////////////////////////////////////////////////////////////////////////
// GET /v1/role
////////////////////////////////////////////////////////////////////////////////
router.get('/role', async (req, res) => {
  stablishedConnection()
    .then((db) => {
      console.log('Db connection stablished');
      const query = `
      SELECT id, name, description 
      FROM dev_web_eis.eis_role 
      LEFT OUTER JOIN dev_web_eis.eis_job_title_to_role 
      ON dev_web_eis.eis_role.id = dev_web_eis.eis_job_title_to_role.role_id 
      WHERE dev_web_eis.eis_job_title_to_role.job_title="${req.query.jobTitle}";
    `;

      db.query(query, function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send({ message: err.message });
        } else {
          res.send(result[0]);
          closeDbConnection(db);
          console.log('Db Connection close Successfully');
        }
      });
    })
    .catch((error) => {
      console.log('Db not connected successfully', error);
      return res.status(502).send({ error });
    });
});

////////////////////////////////////////////////////////////////////////////////
// GET /v1/inventory
////////////////////////////////////////////////////////////////////////////////
router.get('/inventory', (req, res) => {
  //TODO: v2 will use role id to permission tiles to return.
  stablishedConnection()
    .then((db) => {
      const query = `
      SELECT *
      FROM dev_web_eis.eis_tile_inventory AS inv
      JOIN dev_web_eis.eis_tile_metrics AS met ON inv.metric_id = met.id;
    `;

      db.query(query, function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send({ message: err.message });
        } else {
          const mappedResults = result.map(
            ({ id, category, name, owner, description, dashboard_url, ...rest }) => {
              return {
                id: id.toString(),
                category,
                name,
                owner,
                description,
                dashboard_url,
                metrics: { ...rest },
              };
            },
          );
          res.send(mappedResults);
          closeDbConnection(db);
          console.log('Db Connection close Successfully');
        }
      });
    })
    .catch((error) => {
      console.log('Db not connected successfully', error);
      return res.status(502).send({ error });
    });
});

////////////////////////////////////////////////////////////////////////////////
// GET /v1/layout
////////////////////////////////////////////////////////////////////////////////
router.get('/layout', (req, res) => {
  stablishedConnection()
    .then((db) => {
      const determineLayout = (employee) => {
        // Decide if we use role or employee record for layout information
        const employeeOrRole = employee.initial_login ? 'role_id' : 'employee_id';
        // Return the id of either the role or employee
        const matchId = employee[employeeOrRole];
        const tileQuery = `
        SELECT t.ID, t.tile_id, t.order, t.employee_id
        FROM eis_tile_order t
        WHERE t.${employeeOrRole}=${matchId};
      `;
        const categoryQuery = `
      SELECT c.ID, c.category_id, c.order, c.employee_id
      FROM eis_category_order c
      WHERE c.${employeeOrRole}=${matchId};
    `;

        // Query tile layout
        db.query(tileQuery, function (err, result) {
          if (err) {
            console.error(err);
            res.status(500).send({ message: err.message });
          } else {
            // Map DB layout schema to FE schema
            const tile_layout = result.map((dbTileLayout) => {
              return {
                tile_db_id: dbTileLayout.ID,
                tile_id: dbTileLayout.tile_id,
                tile_order: dbTileLayout.order,
              };
            });

            // Query category layout will mainting context of mapped layout
            db.query(categoryQuery, function (err, result) {
              if (err) {
                console.error(err);
                res.status(500).send({ message: err.message });
              } else {
                // Map DB layout schema to FE schema
                const category_layout = result.map((dbCategoryLayout) => {
                  return {
                    category_db_id: dbCategoryLayout.ID,
                    category_id: dbCategoryLayout.category_id,
                    category_order: dbCategoryLayout.order,
                  };
                });

                // Return both layouts
                res.send({ tile_layout, category_layout });
                closeDbConnection(db);
                console.log('Db Connection close Successfully');
              }
            });
          }
        });
      };
      determineLayout(JSON.parse(req.query.employee));
    })
    .catch((error) => {
      console.log('Db not connected successfully', error);
      return res.status(502).send({ error });
    });
});

////////////////////////////////////////////////////////////////////////////////
// POST /v1/layout
////////////////////////////////////////////////////////////////////////////////
router.post('/layout/', (req, res) => {
  stablishedConnection()
    .then((db) => {
      const layout = JSON.parse(req.query.layout);
      const generateSQL = (layout, topic) => {
        let sqlString = '';

        layout[`${topic}_layout`].forEach((topicInfo) => {
          sqlString =
            sqlString +
            `(${topicInfo[topic + '_db_id']}, ${topicInfo[topic + '_id']}, ${
              topicInfo[topic + '_order']
            }, ${req.query.employeeID}), `;
        });

        return sqlString.substring(0, sqlString.length - 2);
      };

      const tileValuesSQL = generateSQL(layout, 'tile');
      const tileQuery = `INSERT INTO eis_tile_order (id, tile_id, ${'`order`'}, employee_id) 
      VALUES ${tileValuesSQL} 
      ON DUPLICATE KEY UPDATE ${'`order`'} = VALUES(${'`order`'})`;

      const categoryValuesSQL = generateSQL(layout, 'category');
      const categoryQuery = `INSERT INTO eis_category_order (id, category_id, ${'`order`'}, employee_id) 
      VALUES ${categoryValuesSQL} 
      ON DUPLICATE KEY UPDATE ${'`order`'} = VALUES(${'`order`'})`;

      const multiQuery = tileQuery + '; ' + categoryQuery;

      db.query(multiQuery, function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send({ message: err.message });
        } else {
          res.send(result);
          closeDbConnection(db);
          console.log('Db Connection close Successfully');
        }
      });
    })
    .catch((error) => {
      console.log('Db not connected successfully', error);
      return res.status(502).send({ error });
    });
});

app.use('/api/v1', router);

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
