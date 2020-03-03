const express = require('express');
const { LIMIT_PER_PAGE } = require('../configs/constants');
const { calcPageCount } = require('../utils');
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


      const skippedItems = (page - 1) * LIMIT_PER_PAGE;

      const selectQuery = `
        SELECT * FROM sensors
        ORDER BY ${connection.escapeId(`sensors.${sortColumn}`)} ${escapedSortDirection}
        LIMIT ${connection.escape(skippedItems)},${LIMIT_PER_PAGE}; 
      `;


      const result = connection.execute(selectQuery);
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

/**
 * @param {number | string} sensorId - id of sensor
 * @param {number | string} page - page
 * @param {string} sortDir - sort direction
 * @param {string} sortColumn - sorted column name
 */
router.get('/sensor/:sensorId', (req, res) => {
  dbPool.getConnection()
    .then(async connection => {
      const { sensorId } = req.params;
      const page = req.query.page || 1;
      
      const sortDirection = req.query.sortDir || 'DESC';
      const escapedSortDirection = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      const sortColumn = req.query.sortColumn || 'date';

      const skippedItems = (page - 1) * LIMIT_PER_PAGE;

      const selectQuery = `
        SELECT * FROM sensors WHERE sensor_id=${connection.escape(sensorId)}
        ORDER BY ${connection.escapeId(sortColumn)} ${escapedSortDirection}
        LIMIT ${connection.escape(skippedItems)},${LIMIT_PER_PAGE}; 
      `;

      const countQuery = `
        SELECT COUNT(*) AS count FROM sensors WHERE sensor_id=${connection.escape(sensorId)};
      `;


      const result = await connection.query(selectQuery);
      const countResult = await connection.query(countQuery);

      connection.release();
      return {
        data: result,
        count: countResult[0] && countResult[0].count
      };
    })
    .then(result => {
      const { data, count } = result;
      res.status(200).send({
        data,
        pageCount: calcPageCount(count, LIMIT_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ error: err.message });
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
        VALUES(${connection.escape(temp)}, ${connection.escape(humidity)},
        ${connection.escape(date)}, ${connection.escape(sensorId)});
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
