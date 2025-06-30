import app from './app';

import { createServer } from 'http';
import SocketServer from './socket';

const PORT = process.env.PORT || 4000;

const server = createServer(app);

// 소켓 서버 설정
SocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});