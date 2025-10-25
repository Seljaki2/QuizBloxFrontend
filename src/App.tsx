import '@ant-design/v5-patch-for-react-19';
import Routing from './Routing';
import { ConfigProvider } from 'antd';
import theme from './theme';
import { UserContext } from './context/UserContext';

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <Routing />
    </ConfigProvider>
  )
}