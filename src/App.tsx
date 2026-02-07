import '@ant-design/v5-patch-for-react-19';
import Routing from './Routing';
import { ConfigProvider, App as AntApp } from 'antd';
import theme from './theme';
import { socket } from './fetch/socketio';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

export default function App() {
  socket?.emit('message', "{ msg: 'Hello from client!' }");
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <AntApp>
          <Routing />
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  )
}