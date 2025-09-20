const GroupData = require('../models/groupData');
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError, ConflictError, DatabaseError } = require('../utils/errors');
const logger = require('../utils/logger');

class GroupController {
  // ========================================
  // 设备分组相关操作
  // ========================================
  // 1. 获取分组名称列表
  // 2. 获取所有分组详细信息
  // 3. 获取默认分组
  // 4. 检查分组名是否存在
  // 5. 创建新分组
  // 6. 更新分组
  // 7. 删除分组

  // 1. 获取分组名称列表
  static async getGroupNames(req, res) {
    try {
      const groups = await GroupData.getGroupNames();
      res.json({ success: true, data: groups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. 获取所有分组详细信息
  static getGroups = asyncHandler(async (req, res) => {
    const groups = await GroupData.getGroups();
    res.json({ success: true, data: groups });
  });

  // 3. 获取默认分组
  static getDefaultGroup = asyncHandler(async (req, res) => {
    const defaultGroup = await GroupData.getDefaultGroup();
    if (!defaultGroup) {
      return res.status(404).json({ 
        success: false, 
        message: '默认分组不存在' 
      });
    }
    res.json({ success: true, data: defaultGroup });
  });

  // 4. 检查分组名是否存在
  static async checkGroupNameExists(req, res) {
    try {
      const { group_name } = req.query;
      if (!group_name) {
        return res.status(400).json({ success: false, message: '分组名不能为空' });
      }
      
      const exists = await GroupData.checkGroupNameExists(group_name);
      res.json({ success: true, data: { exists } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 5. 创建新分组
  static createGroup = asyncHandler(async (req, res) => {
    const { group_name, description } = req.body;
    
    // 检查分组名是否已存在
    const exists = await GroupData.checkGroupNameExists(group_name.trim());
    if (exists) {
      throw new ConflictError('分组名已存在');
    }
    
    const result = await GroupData.createGroup({
      group_name: group_name.trim(),
      description: description || ''
    });
    
    res.json({ 
      success: true, 
      message: '分组创建成功',
      data: { id: result.insertId, group_name: group_name.trim() }
    });
  });

  // 6. 更新分组
  static updateGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { group_name, description } = req.body;
    
    // 检查新名称是否与其他分组重复
    const exists = await GroupData.checkGroupNameExists(group_name.trim());
    if (exists) {
      // 检查是否是当前分组自己的名称
      const currentGroup = await GroupData.getGroupById(id);
      if (!currentGroup || currentGroup.group_name !== group_name.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: '分组名已存在' 
        });
      }
    }
    
    const result = await GroupData.updateGroup(id, {
      group_name: group_name.trim(),
      description: description || ''
    });
    
    res.json({ 
      success: true, 
      message: '分组更新成功',
      data: { id: parseInt(id), group_name: group_name.trim() }
    });
  });

  // 7. 删除分组
  static deleteGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await GroupData.deleteGroup(id);
    
    res.json({ 
      success: true, 
      message: `分组"${result.deletedGroupName}"删除成功，${result.movedDevicesCount}个设备已移至"${result.defaultGroupName}"分组`,
      data: result
    });
  });

}

module.exports = GroupController;
