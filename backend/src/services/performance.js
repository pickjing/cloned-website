const logger = require('../utils/logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      queries: new Map(),
      slowQueries: [],
      totalQueries: 0,
      totalDuration: 0,
      averageDuration: 0,
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.thresholds = {
      slowQuery: 1000, // 1秒
      verySlowQuery: 5000, // 5秒
      criticalQuery: 10000 // 10秒
    };
  }

  /**
   * 记录查询性能
   */
  recordQuery(query, duration, params = [], fromCache = false) {
    this.metrics.totalQueries++;
    this.metrics.totalDuration += duration;
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.totalQueries;

    if (fromCache) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    // 记录慢查询
    if (duration >= this.thresholds.slowQuery) {
      const slowQuery = {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        duration,
        params: params.length > 0 ? params : undefined,
        timestamp: new Date().toISOString(),
        level: this.getSlowQueryLevel(duration)
      };

      this.metrics.slowQueries.push(slowQuery);
      
      // 只保留最近100个慢查询
      if (this.metrics.slowQueries.length > 100) {
        this.metrics.slowQueries.shift();
      }

      // 记录慢查询日志
      logger.performance('slow_query', duration, {
        query: slowQuery.query,
        params: slowQuery.params,
        level: slowQuery.level
      });
    }

    // 记录查询统计
    const queryKey = this.normalizeQuery(query);
    if (!this.metrics.queries.has(queryKey)) {
      this.metrics.queries.set(queryKey, {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        lastExecuted: null
      });
    }

    const queryStats = this.metrics.queries.get(queryKey);
    queryStats.count++;
    queryStats.totalDuration += duration;
    queryStats.averageDuration = queryStats.totalDuration / queryStats.count;
    queryStats.minDuration = Math.min(queryStats.minDuration, duration);
    queryStats.maxDuration = Math.max(queryStats.maxDuration, duration);
    queryStats.lastExecuted = new Date().toISOString();
  }

  /**
   * 记录错误
   */
  recordError(error, query = null) {
    this.metrics.errorCount++;
    
    logger.error('Query error recorded', {
      error: error.message,
      code: error.code,
      query: query ? query.substring(0, 200) : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 获取慢查询级别
   */
  getSlowQueryLevel(duration) {
    if (duration >= this.thresholds.criticalQuery) {
      return 'critical';
    } else if (duration >= this.thresholds.verySlowQuery) {
      return 'very_slow';
    } else {
      return 'slow';
    }
  }

  /**
   * 标准化查询语句（用于统计）
   */
  normalizeQuery(query) {
    return query
      .replace(/\s+/g, ' ')
      .replace(/\?/g, '?')
      .replace(/\d+/g, 'N')
      .replace(/'[^']*'/g, "'?'")
      .replace(/"[^"]*"/g, '"?"')
      .trim();
  }

  /**
   * 获取性能统计
   */
  getStats() {
    const cacheHitRate = this.metrics.totalQueries > 0 
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2)
      : 0;

    return {
      summary: {
        totalQueries: this.metrics.totalQueries,
        averageDuration: Math.round(this.metrics.averageDuration),
        errorCount: this.metrics.errorCount,
        cacheHitRate: `${cacheHitRate}%`,
        slowQueries: this.metrics.slowQueries.length
      },
      slowQueries: this.metrics.slowQueries.slice(-10), // 最近10个慢查询
      topQueries: this.getTopQueries(10),
      thresholds: this.thresholds
    };
  }

  /**
   * 获取最频繁的查询
   */
  getTopQueries(limit = 10) {
    return Array.from(this.metrics.queries.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        averageDuration: Math.round(stats.averageDuration),
        minDuration: stats.minDuration === Infinity ? 0 : stats.minDuration,
        maxDuration: stats.maxDuration,
        lastExecuted: stats.lastExecuted
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 重置统计
   */
  reset() {
    this.metrics = {
      queries: new Map(),
      slowQueries: [],
      totalQueries: 0,
      totalDuration: 0,
      averageDuration: 0,
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    logger.info('Performance metrics reset');
  }

  /**
   * 获取健康状态
   */
  getHealthStatus() {
    const errorRate = this.metrics.totalQueries > 0 
      ? (this.metrics.errorCount / this.metrics.totalQueries * 100)
      : 0;

    const criticalSlowQueries = this.metrics.slowQueries.filter(
      q => q.level === 'critical'
    ).length;

    let status = 'healthy';
    let issues = [];

    if (errorRate > 10) {
      status = 'unhealthy';
      issues.push(`High error rate: ${errorRate.toFixed(2)}%`);
    }

    if (criticalSlowQueries > 5) {
      status = 'unhealthy';
      issues.push(`${criticalSlowQueries} critical slow queries`);
    }

    if (this.metrics.averageDuration > 2000) {
      status = 'warning';
      issues.push(`High average query duration: ${Math.round(this.metrics.averageDuration)}ms`);
    }

    return {
      status,
      issues,
      metrics: this.getStats().summary
    };
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    const stats = this.getStats();
    const health = this.getHealthStatus();

    return {
      timestamp: new Date().toISOString(),
      health,
      performance: stats,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 生成优化建议
   */
  generateRecommendations() {
    const recommendations = [];
    const stats = this.getStats();

    // 慢查询建议
    if (stats.slowQueries.length > 0) {
      recommendations.push({
        type: 'slow_queries',
        priority: 'high',
        message: `Found ${stats.slowQueries.length} slow queries. Consider adding indexes or optimizing queries.`
      });
    }

    // 缓存建议
    if (parseFloat(stats.summary.cacheHitRate) < 50) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        message: `Low cache hit rate (${stats.summary.cacheHitRate}). Consider increasing cache TTL or adding more cache layers.`
      });
    }

    // 错误率建议
    if (stats.summary.errorCount > 0) {
      recommendations.push({
        type: 'error_handling',
        priority: 'high',
        message: `High error count (${stats.summary.errorCount}). Review error logs and improve error handling.`
      });
    }

    // 平均查询时间建议
    if (stats.summary.averageDuration > 500) {
      recommendations.push({
        type: 'query_optimization',
        priority: 'medium',
        message: `High average query duration (${stats.summary.averageDuration}ms). Consider query optimization.`
      });
    }

    return recommendations;
  }
}

// 创建单例实例
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
