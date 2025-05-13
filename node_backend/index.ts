import * as Hapi from '@hapi/hapi';
import { userRoute } from './src/userModule/userController';  
import { LeaveRequestRoute } from './src/leaveRequestModule/leaveRequestController';
import { LeaveTypeRoute } from './src/leaveTypeModule/leaveTypeController';
import { LeaveBalanceRoute } from './src/leaveBalanceModule/leaveBalanceController';
import 'dotenv/config';

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
        cors: {
            origin: ['*'], // ✅ specific origin
            credentials: true                 // ✅ allow cookies
        }
    }
});

// Register routes
server.route(userRoute);
server.route(LeaveRequestRoute);
server.route(LeaveTypeRoute);
server.route(LeaveBalanceRoute);
  
// Start the server
const start = async () => {
    try {
        await server.start();
        console.log('✅ Server running on %s', server.info.uri);
    } catch (err) {
        console.error('❌ Error starting server:', err);
    }
};

start();
