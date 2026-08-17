import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 LocalConnect Backend running on port ${env.PORT}`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`==================================================`);
});

const gracefulShutdown = async () => {
  console.log(' Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log(' Database connection closed. Process exited.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
