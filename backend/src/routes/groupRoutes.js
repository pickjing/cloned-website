const express = require('express');
const GroupController = require('../controllers/groupController');
const {
  validateData,
  validateId
} = require('../middleware/groupValidation');

const router = express.Router();

// ========================================
// 设备分组相关路由
// ========================================

// 查询所有分组的名称
router.get('/names', GroupController.getNames);

// 查询所有分组
router.get('/', GroupController.getAll);

// 查询默认分组
router.get('/default', GroupController.getDefault);

// 检查分组名是否存在
router.get('/check', GroupController.checkGroupNameExists);

// 创建分组
router.post('/', validateData, GroupController.create);

// 更新分组
router.put('/:id', validateId, validateData, GroupController.update);

// 删除分组
router.delete('/:id', validateId, GroupController.delete);


module.exports = router;
