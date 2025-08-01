const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const deviceRoutes = require('./routes/deviceRoutes');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'IoT Center Backend API' });
});

// 设备路由
app.use('/api', deviceRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
