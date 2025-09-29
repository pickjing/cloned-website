const GroupData = require('../models/groupData');
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError, ConflictError } = require('../utils/errors');

class GroupController {
  // ========================================
  // 设备分组相关操作
  // ========================================
  // 1. 查询所有分组的名称
  // 2. 查询所有分组
  // 3. 查询默认分组
  // 4. 检查分组名是否存在
  // 5. 创建分组
  // 6. 更新分组
  // 7. 删除分组

  // 1. 查询所有分组的名称
  static getNames = asyncHandler(async (req, res) => {
    const groups = await GroupData.getNames();
    res.json({ success: true, data: groups });
  });

  // 2. 查询所有分组
  static getAll = asyncHandler(async (req, res) => {
    const groups = await GroupData.getAll();
    res.json({ success: true, data: groups });
  });

  // 3. 查询默认分组
  static getDefault = asyncHandler(async (req, res) => {
    const defaultGroup = await GroupData.getDefault();
    if (!defaultGroup) {
      throw new NotFoundError('默认分组不存在');
    }
    res.json({ success: true, data: defaultGroup });
  });

  // 4. 检查分组名是否存在
  static checkGroupNameExists = asyncHandler(async (req, res) => {
    const { group_name } = req.query;
    if (!group_name) {
      throw new Error('分组名不能为空');
    }
    
    // 解码URL编码的分组名，如果解码失败则使用原始值
    let decodedGroupName;
    try {
      decodedGroupName = decodeURIComponent(group_name);
    } catch (decodeError) {
      decodedGroupName = group_name;
    }
    
    const exists = await GroupData.checkGroupNameExists(decodedGroupName);
    res.json({ success: true, data: { exists } });
  });

  // 5. 创建新分组
  static create = asyncHandler(async (req, res) => {
    const { group_name, description } = req.body;
    
    // 检查分组名是否已存在
    const exists = await GroupData.checkGroupNameExists(group_name.trim());
    if (exists) {
      throw new ConflictError('分组名已存在');
    }
    
    const result = await GroupData.create({
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
  static update = asyncHandler(async (req, res) => {
    const { id, group_name, description } = req.body;
    
    // 检查新名称是否与其他分组重复
    const exists = await GroupData.checkGroupNameExists(group_name.trim());
    if (exists) {
      // 检查是否是当前分组自己的名称
      const currentGroup = await GroupData.getById(id);
      if (!currentGroup || currentGroup.group_name !== group_name.trim()) {
        throw new ConflictError('分组名已存在');
      }
    }
    
    const result = await GroupData.update(id, {
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
  static delete = asyncHandler(async (req, res) => {
    const { id } = req.body;
    const result = await GroupData.delete(id);
    
    res.json({ 
      success: true, 
      message: `分组"${result.deletedGroupName}"删除成功，${result.movedDevicesCount}个设备已移至"${result.defaultGroupName}"分组`,
      data: result
    });
  });

}

module.exports = GroupController;
