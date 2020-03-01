const express = require('express');
const { LIMIT_PER_PAGE } = require('../configs/constants');
const router = express.Router();


// ========== GET ============

router.get('/test', (req, res) => {
  res.status(200).send({
    message: 'api test sensor',
    status: 'ok',
  });
});

/**
 * @param {number | string} page - page
 * @param {string} sortDir - sort direction
 * @param {string} sortColumn - sorted column name
 */
router.get('/sensor', (req, res) => {
  dbPool.getConnection()
    .then(connection => {

      const page = req.query.page || 1;
      
      const sortDirection = req.query.sortDir || 'DESC';
      const escapedSortDirection = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      const sortColumn = req.query.sortColumn || 'date';

      const selectQuery = `
        SELECT * FROM sensors
        ORDER BY ${connection.escapeId(`sensors.${sortColumn}`)} ${escapedSortDirection}
        LIMIT ?,${LIMIT_PER_PAGE}; 
      `;

      const skippedItems = (page - 1) * LIMIT_PER_PAGE;

      const result = connection.execute(selectQuery, [skippedItems]);
      connection.release();
      return result;
      
    })
    .then(result => {
      const data = result[0];
      res.status(200).send({
        data
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ error: err });
    });
});

/**
 * @param {number | string} sensorId - id of sensor
 * @param {number | string} page - page
 * @param {string} sortDir - sort direction
 * @param {string} sortColumn - sorted column name
 */
router.get('/sensor/:sensorId', (req, res) => {
  dbPool.getConnection()
    .then(connection => {
      const { sensorId } = req.params;
      const page = req.query.page || 1;
      
      const sortDirection = req.query.sortDir || 'DESC';
      const escapedSortDirection = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      const sortColumn = req.query.sortColumn || 'date';

      const selectQuery = `
        SELECT * FROM sensors WHERE sensor_id=?
        ORDER BY ${connection.escapeId(`sensors.${sortColumn}`)} ${escapedSortDirection}
        LIMIT ?,${LIMIT_PER_PAGE}; 
      `;

      const skippedItems = (page - 1) * LIMIT_PER_PAGE;

      const result = connection.execute(selectQuery, [sensorId, skippedItems]);
      connection.release();
      return result;
    })
    .then(result => {
      const data = result[0];
      res.status(200).send({
        data
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ error: err });
    });
});

// =========== POST ===============

router.post('/sensor/:sensorId', (req, res) => {
  dbPool.getConnection()
    .then(connection => {
      const { sensorId } = req.params;
      const { temp, humidity } = req.body;

      const selectQuery = `
        INSERT INTO sensors (temp, humidity, date, sensor_id)
        VALUES(?, ?, ?, ?);
      `;

      const result = connection.execute(selectQuery, [temp, humidity, new Date(), sensorId]);
      connection.release();
      return result;
    })
    .then(result => {
      const data = result[0];
      res.status(200).send({
        data
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ error: err.message });
    });
});

module.exports = router;
