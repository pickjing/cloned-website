const express = require('express');
const GroupController = require('../controllers/groupController');
const {
  validateGroup,
  validateGroupUpdate,
  validateGroupId
} = require('../middleware/groupValidation');

const router = express.Router();

// ========================================
// 设备分组相关路由
// ========================================

// 获取分组名称列表（前端下拉列表）
router.get('/names', GroupController.getGroupNames);

// 获取所有分组详细信息
router.get('/', GroupController.getGroups);

// 获取默认分组
router.get('/default', GroupController.getDefaultGroup);

// 检查分组名是否存在
router.get('/check', GroupController.checkGroupNameExists);

// 创建分组
router.post('/', validateGroup, GroupController.createGroup);

// 更新分组
router.put('/:id', validateGroupId, validateGroupUpdate, GroupController.updateGroup);

// 删除分组
router.delete('/:id', validateGroupId, GroupController.deleteGroup);


module.exports = router;
