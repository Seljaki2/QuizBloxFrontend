import '@ant-design/v5-patch-for-react-19';
import Routing from './Routing';
import { ConfigProvider } from 'antd';
import theme from './theme';
import { socket } from './fetch/socketio';

export default function App() {
  socket?.emit('message', "{ msg: 'Hello from client!' }");
  return (
    <ConfigProvider theme={theme}>
      <Routing />
    </ConfigProvider>
  )
}