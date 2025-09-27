const express = require('express');
const MbRtuController = require('../controllers/mbRtuController');
const {
  validateData,
  validateQuery
} = require('../middleware/mbRtuValidation');

const router = express.Router();

// ========================================
// MB-RTU协议相关路由
// ========================================

// 查询MB-RTU协议
router.get('/', validateQuery, MbRtuController.get);

// 更新MB-RTU协议
router.put('/', validateData, MbRtuController.update);

module.exports = router;
