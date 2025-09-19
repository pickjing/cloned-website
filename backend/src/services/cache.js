const NodeCache = require('node-cache');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    // 创建不同类型的缓存实例
    this.cache = new NodeCache({
      stdTTL: 300, // 默认5分钟过期
      checkperiod: 60, // 检查过期时间间隔
      useClones: false, // 不克隆对象，提高性能
      deleteOnExpire: true, // 过期时自动删除
      maxKeys: 1000 // 最大缓存键数量
    });

    // 短缓存 - 用于频繁查询的数据
    this.shortCache = new NodeCache({
      stdTTL: 60, // 1分钟过期
      checkperiod: 30,
      useClones: false,
      deleteOnExpire: true,
      maxKeys: 500
    });

    // 长缓存 - 用于不经常变化的数据
    this.longCache = new NodeCache({
      stdTTL: 1800, // 30分钟过期
      checkperiod: 300,
      useClones: false,
      deleteOnExpire: true,
      maxKeys: 200
    });

    // 监听缓存事件
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.cache.on('set', (key, value) => {
      logger.debug('Cache set', { key, ttl: this.cache.getTtl(key) });
    });

    this.cache.on('del', (key, value) => {
      logger.debug('Cache delete', { key });
    });

    this.cache.on('expired', (key, value) => {
      logger.debug('Cache expired', { key });
    });
  }

  /**
   * 获取缓存数据
   */
  get(key, cacheType = 'default') {
    const cache = this.getCacheInstance(cacheType);
    const value = cache.get(key);
    
    if (value !== undefined) {
      logger.debug('Cache hit', { key, cacheType });
      return value;
    }
    
    logger.debug('Cache miss', { key, cacheType });
    return null;
  }

  /**
   * 设置缓存数据
   */
  set(key, value, ttl = null, cacheType = 'default') {
    const cache = this.getCacheInstance(cacheType);
    
    if (ttl) {
      cache.set(key, value, ttl);
    } else {
      cache.set(key, value);
    }
    
    logger.debug('Cache set', { key, ttl, cacheType });
  }

  /**
   * 删除缓存数据
   */
  del(key, cacheType = 'default') {
    const cache = this.getCacheInstance(cacheType);
    const result = cache.del(key);
    logger.debug('Cache delete', { key, result, cacheType });
    return result;
  }

  /**
   * 清空所有缓存
   */
  flush(cacheType = 'all') {
    if (cacheType === 'all') {
      this.cache.flushAll();
      this.shortCache.flushAll();
      this.longCache.flushAll();
      logger.info('All caches flushed');
    } else {
      const cache = this.getCacheInstance(cacheType);
      cache.flushAll();
      logger.info('Cache flushed', { cacheType });
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      default: {
        keys: this.cache.keys().length,
        hits: this.cache.getStats().hits,
        misses: this.cache.getStats().misses,
        ksize: this.cache.getStats().ksize,
        vsize: this.cache.getStats().vsize
      },
      short: {
        keys: this.shortCache.keys().length,
        hits: this.shortCache.getStats().hits,
        misses: this.shortCache.getStats().misses,
        ksize: this.shortCache.getStats().ksize,
        vsize: this.shortCache.getStats().vsize
      },
      long: {
        keys: this.longCache.keys().length,
        hits: this.longCache.getStats().hits,
        misses: this.longCache.getStats().misses,
        ksize: this.longCache.getStats().ksize,
        vsize: this.longCache.getStats().vsize
      }
    };
  }

  /**
   * 获取缓存实例
   */
  getCacheInstance(cacheType) {
    switch (cacheType) {
      case 'short':
        return this.shortCache;
      case 'long':
        return this.longCache;
      default:
        return this.cache;
    }
  }

  /**
   * 生成缓存键
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }

  /**
   * 缓存查询结果
   */
  async cacheQuery(key, queryFn, ttl = null, cacheType = 'default') {
    // 先尝试从缓存获取
    const cached = this.get(key, cacheType);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，执行查询
    try {
      const result = await queryFn();
      this.set(key, result, ttl, cacheType);
      return result;
    } catch (error) {
      logger.error('Cache query failed', {
        key,
        error: error.message,
        cacheType
      });
      throw error;
    }
  }

  /**
   * 批量删除相关缓存
   */
  deletePattern(pattern, cacheType = 'default') {
    const cache = this.getCacheInstance(cacheType);
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    let deletedCount = 0;

    keys.forEach(key => {
      if (regex.test(key)) {
        cache.del(key);
        deletedCount++;
      }
    });

    logger.debug('Cache pattern delete', { pattern, deletedCount, cacheType });
    return deletedCount;
  }
}

// 创建单例实例
const cacheService = new CacheService();

module.exports = cacheService;
