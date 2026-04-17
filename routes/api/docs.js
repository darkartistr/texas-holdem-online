const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('../../docs/openapi');

const router = express.Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));

module.exports = router;

